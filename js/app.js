/* لمّة shell: rooms of up to 8 players over a Supabase Realtime broadcast channel.

   The room creator (host) holds the truth: the room object (players, phase, game, the
   game's public state "pub") and per-seat secrets. Every change is broadcast as one
   "state" message, and each seat's secret goes out as a "priv" message addressed to it.
   Other players never change state themselves: they send numbered "act" messages that
   the host applies through the game's act() and acknowledges in room.acks; anything not
   yet acknowledged is resent, so dropped messages heal on their own.

   A game module (games/*.js) provides:
     id, name, blurb, icon, min, max
     init(n, prevPub)            -> pub          host, when a round starts
     secrets?(pub, n)            -> [seatData]   host, private data per seat
     act(S, seat, a)                             host, S = {pub, secret, n, hostSeat}
     render(root, ctx)                           everyone, ctx described in ctxFor()
     sync?(ctx)                                  everyone, after each state (auto-reports)
*/
(function(){
const K = Lamma, $ = K.$;
const SB_URL = 'https://swgfqxoopbxvnhwqrupd.supabase.co';
const SB_KEY = 'sb_publishable_mSn-Hmk-qO7zhb_3mL0BDw_ujem-8TD';
const WEB_HOME = 'https://karimmagdy.github.io/lamma';
const WEB_URL = (/^https:$/.test(location.protocol) && !window.Capacitor && !/localhost/.test(location.hostname))
  ? (location.origin + location.pathname).replace(/\/(index\.html)?$/, '') : WEB_HOME;
const MAX_ROOM = 8;

const params = new URLSearchParams(location.search);
const PID = params.get('as') || K.fetch('lamma-pid') || (() => { const p = Math.random().toString(36).slice(2, 10); K.store('lamma-pid', p); return p; })();
const SID = Math.random().toString(36).slice(2, 8);   // this page load; lets the host reset act numbering after a reload

let R = null, sb = null, beat = null;
let myName = K.fetch('lamma-name') || '';

/* ---------- small helpers ---------- */
function show(id){ for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id; window.scrollTo(0,0); }
function roomLink(code){ return `${WEB_URL}/?room=${code}`; }
function newCode(){ const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<5;i++) s+=A[Math.random()*A.length|0]; return s; }
function setUrl(code){ try { history.replaceState(null, '', code ? `?room=${code}${params.get('as')?`&as=${params.get('as')}`:''}` : location.pathname); } catch(e){} }
function send(m){ try { R && R.ch && R.ch.send({type:'broadcast', event:'m', payload:m}); } catch(e){} }
function online(pid){ return !!R && (pid === PID || R.peers.includes(pid)); }
function nameOf(pid){ const p = R.room.players.find(p => p.id === pid); return (p && p.name) || 'لاعب'; }
function seatsOf(room){ return room.seats || []; }
function wait(title, sub, opts = {}){
  $('wt-title').textContent = title; $('wt-sub').textContent = sub || '';
  $('wt-link').hidden = !opts.link; $('wt-link').textContent = WEB_URL;
  $('btn-wait-retry').hidden = !opts.retry;
  show('s-wait');
}

/* ---------- home ---------- */
function renderHome(){
  $('my-name').value = myName;
  $('game-list').innerHTML = K.games.map((g, i) => `
    <button class="gcard${g.soon ? ' soon' : ''}" data-g="${g.id}" style="--gc:${K.color(i)}" ${g.soon ? 'aria-disabled="true"' : ''}>
      <span class="gico">${g.icon}</span><b>${K.esc(g.name)}</b><small>${K.esc(g.blurb)}</small>
      <span class="tag">${g.soon ? 'قريباً' : `${g.min}–${g.max} لاعبين`}</span>
    </button>`).join('');
  show('s-home');
}
$('game-list').addEventListener('click', e => {
  const b = e.target.closest('.gcard'); if (!b) return;
  const g = K.game(b.dataset.g);
  if (g.soon) { K.buzz(30); return; }
  if (!saveName($('my-name'))) return;
  K.tick(); createRoom(g.id);
});
function saveName(input){
  const v = input.value.trim();
  if (!v) { input.focus(); input.placeholder = 'اكتب اسمك الأول'; K.buzz(40); return false; }
  myName = v; K.store('lamma-name', v); return true;
}
$('btn-join-code').onclick = () => {
  const code = $('join-code').value.trim().toUpperCase();
  if (!/^[A-Z0-9]{5}$/.test(code)) { $('home-err').textContent = 'الكود 5 حروف/أرقام، زي اللي في اللينك.'; $('home-err').hidden = false; return; }
  if (!saveName($('my-name'))) return;
  K.tick(); joinRoom(code);
};
$('btn-join').onclick = () => { if (!saveName($('name-join'))) return; K.tick(); joinRoom($('jn-code').textContent); };
$('btn-join-cancel').onclick = () => { setUrl(null); renderHome(); };

/* ---------- rooms ---------- */
function createRoom(gameId){
  const code = newCode();
  const room = { v:0, code, hostId:PID, phase:'lobby', game:gameId, players:[{id:PID, name:myName}], seats:[], pub:null, acks:{}, round:0 };
  R = { code, host:true, room, secret:[], priv:null, queue:[], nextId:1 };
  saveHost(); connect();
}
function joinRoom(code){
  const saved = K.fetch('lamma-room-' + code);
  if (saved && saved.room && saved.room.hostId === PID) { R = { code, host:true, room:saved.room, secret:saved.secret || [], priv:null, queue:[], nextId:1 }; connect(); return; }
  R = { code, host:false, room:null, priv:null, queue:[], nextId:1 };
  K.store('lamma-joined-' + code, 1);
  connect();
}
function saveHost(){ if (R && R.host) K.store('lamma-room-' + R.code, { room:R.room, secret:R.secret }); }

function connect(){
  setUrl(R.code);
  if (!window.supabase) { wait('الأونلاين مش شغال هنا', 'افتح لمّة من اللينك ده:', { link:true }); return; }
  wait('بيوصل…', 'ثانية واحدة');
  sb = sb || window.supabase.createClient(SB_URL, SB_KEY, { auth:{ persistSession:false } });
  if (R.ch) { try { sb.removeChannel(R.ch); } catch(e){} }
  const ch = sb.channel('lamma-' + R.code, { config:{ broadcast:{ self:false }, presence:{ key:PID } } });
  R.ch = ch; R.peers = []; R.connected = false;
  ch.on('broadcast', { event:'m' }, ({ payload }) => onMsg(payload || {}));
  ch.on('presence', { event:'sync' }, () => { R.peers = Object.keys(ch.presenceState()); if (R.host) pushState(); else render(); });
  ch.subscribe(async status => {
    if (!R || R.ch !== ch) return;
    if (status === 'SUBSCRIBED') {
      R.connected = true;
      try { await ch.track({ at:Date.now() }); } catch(e){}
      if (R.host) pushState(); else hello();
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      R.connected = false;
      if (!R.room) wait('مش قادر أوصل للأوضة', 'اتأكد إن النت شغال وجرّب تاني.', { retry:true });
    }
  });
  clearInterval(beat); beat = setInterval(heartbeat, 2500);
}
function hello(){ send({ t:'hello', pid:PID, name:myName }); }

function leave(){
  clearInterval(beat);
  if (R && !R.host && R.room && R.room.phase === 'lobby') send({ t:'leave', pid:PID });
  if (R && R.host && R.room && R.room.phase === 'lobby' && R.room.players.length <= 1) K.drop('lamma-room-' + R.code);
  try { R && R.ch && sb.removeChannel(R.ch); } catch(e){}
  R = null; setUrl(null); renderHome();
}

/* ---------- host ---------- */
function pushState(){
  if (!R || !R.host) return;
  R.room.v++;
  saveHost();
  send({ t:'state', room:R.room });
  sendPrivs();
  render();
}
function sendPrivs(){
  const seats = seatsOf(R.room);
  seats.forEach((pid, i) => {
    const data = R.secret[i];
    if (data === undefined) return;
    if (pid === PID) R.priv = data; else send({ t:'priv', to:pid, v:R.room.v, data });
  });
}
function hostSeat(){ return seatsOf(R.room).indexOf(R.room.hostId); }
function startGame(gameId){
  const room = R.room, g = K.game(gameId || room.game);
  const prevSame = room.game === g.id && room.pub && room.seats.length === Math.min(room.players.length, g.max) ? room.pub : null;
  room.game = g.id;
  room.seats = room.players.slice(0, g.max).map(p => p.id);
  room.round++;
  room.pub = g.init(room.seats.length, prevSame);
  R.secret = g.secrets ? g.secrets(room.pub, room.seats.length) : [];
  room.phase = 'game';
  pushState();
}
function hostApply(pid, a){
  const room = R.room;
  if (room.phase !== 'game') return;
  const seat = seatsOf(room).indexOf(pid);
  if (seat < 0) return;
  const g = K.game(room.game);
  const S = { pub:room.pub, secret:R.secret, n:room.seats.length, hostSeat:hostSeat() };
  try { g.act(S, seat, a); } catch(e){ console.error(e); }
  room.pub = S.pub; R.secret = S.secret;
}
function onHost(m){
  const room = R.room;
  if (m.t === 'hello') {
    const p = room.players.find(p => p.id === m.pid);
    if (p) { if (m.name) p.name = m.name; }
    else if (room.players.length >= MAX_ROOM) { send({ t:'full', pid:m.pid }); return; }
    else room.players.push({ id:m.pid, name:m.name || 'لاعب' });
    return pushState();
  }
  if (m.t === 'leave') {
    if (room.phase === 'lobby') room.players = room.players.filter(p => p.id !== m.pid);
    return pushState();
  }
  if (m.t === 'act') {
    const ack = room.acks[m.pid];
    const last = ack && ack.sid === m.sid ? ack.n : 0;
    if (m.id !== last + 1) { if (m.id <= last) pushState(); return; }   // duplicate: resend state; gap: wait for the missing one
    room.acks[m.pid] = { sid:m.sid, n:m.id };
    hostApply(m.pid, m.a);
    return pushState();
  }
}

/* ---------- guest ---------- */
function onGuest(m){
  if (m.t === 'full' && m.pid === PID) { clearInterval(beat); wait('الأوضة مليانة', 'فيها 8 لاعبين خلاص. اطلب من صاحبك يعمل أوضة جديدة.'); return; }
  if (m.t === 'priv' && m.to === PID) { R.priv = m.data; R.privV = m.v; render(); return; }
  if (m.t !== 'state' || !m.room) return;
  const room = m.room;
  if (R.room && room.v < R.room.v && room.round === R.room.round) return;   // stale
  R.room = room;
  if (!room.players.some(p => p.id === PID)) { hello(); }
  const ack = room.acks[PID];
  if (ack && ack.sid === SID) R.queue = R.queue.filter(q => q.id > ack.n);
  render();
}
function onMsg(m){ if (!R) return; R.host ? onHost(m) : onGuest(m); }

function heartbeat(){
  if (!R || !R.connected) return;
  if (R.host) { send({ t:'state', room:R.room }); sendPrivs(); return; }
  if (!R.room || !R.room.players.some(p => p.id === PID)) { hello(); return; }
  R.queue.forEach(q => send({ t:'act', pid:PID, sid:SID, id:q.id, a:q.a }));
}

/* an action from this phone */
function act(a){
  if (!R || !R.room) return;
  if (R.host) { hostApply(PID, a); pushState(); return; }
  const q = { id:R.nextId++, a };
  R.queue.push(q);
  send({ t:'act', pid:PID, sid:SID, id:q.id, a });
}

/* ---------- rendering ---------- */
function render(){
  if (!R || !R.room) return;
  const room = R.room;
  if (!room.players.some(p => p.id === PID) && !R.host) { wait('بيدخلك الأوضة…', ''); return; }
  if (room.phase === 'lobby') return renderLobby();
  if (!$('s-menu').hidden) return renderMenu();
  renderGame();
}

function playerRows(list, seats){
  return list.map((p, i) => {
    const seat = seats ? seats.indexOf(p.id) : i;
    return `<li style="--pc:${K.color(seat < 0 ? i : seat)}"><span class="seatdot${online(p.id) ? ' on' : ''}"></span><span class="nm">${K.esc(p.name)}</span>${p.id === R.room.hostId ? '<small>صاحب الأوضة</small>' : p.id === PID ? '<small>انت</small>' : ''}</li>`;
  }).join('');
}

function renderLobby(){
  const room = R.room, g = K.game(room.game);
  $('lb-game').textContent = g.name;
  $('lb-code').textContent = R.code;
  $('lb-link').textContent = roomLink(R.code);
  $('btn-share').hidden = !navigator.share;
  $('lb-count').textContent = `اللاعبين (${room.players.length} من ${MAX_ROOM})`;
  const empties = Math.max(0, Math.min(MAX_ROOM, Math.max(g.min, 2)) - room.players.length);
  $('lb-players').innerHTML = playerRows(room.players) + '<li class="empty">فاضي</li>'.repeat(empties);
  $('lb-host').hidden = !R.host; $('lb-guest').hidden = R.host;
  if (R.host) {
    const pick = $('lb-pick');
    pick.innerHTML = K.games.filter(x => !x.soon).map(x => `<option value="${x.id}"${x.id === room.game ? ' selected' : ''}>${K.esc(x.name)} (${x.min}–${x.max})</option>`).join('');
    const n = room.players.length;
    const ok = n >= g.min;
    $('btn-start').disabled = !ok;
    $('lb-need').textContent = !ok ? `محتاجين ${g.min - n} لاعب كمان على الأقل.` : n > g.max ? `${g.name} بتاخد ${g.max} بس، أول ${g.max} في الليستة هيلعبوا.` : 'ابعت اللينك لصحابك، وابدأ لما الكل يدخل.';
  }
  show('s-lobby');
}

function ctxFor(){
  const room = R.room, seats = seatsOf(room);
  const me = seats.indexOf(PID);
  const lkey = `lamma-local-${R.code}-${room.round}-${PID}`;
  if (!R.local || R.localKey !== lkey) { R.localKey = lkey; R.local = K.fetch(lkey) || {}; }
  return {
    pub: room.pub, priv: R.priv, me, n: seats.length, isHost: R.host, round: room.round,
    busy: !R.host && R.queue.length > 0,
    players: seats.map(id => ({ id, name: nameOf(id) })),
    online: seat => online(seats[seat]),
    act, local: R.local, saveLocal: () => K.store(lkey, R.local),
    again: R.host ? () => startGame() : null,
    toLobby: R.host ? () => { room.phase = 'lobby'; pushState(); } : null,
    rerender: () => renderGame(),
  };
}

let lastGameKey = '';
function renderGame(){
  const room = R.room, g = K.game(room.game);
  $('gm-name').textContent = g.name; $('gm-code').textContent = R.code;
  const ctx = ctxFor();
  if (ctx.me < 0) {
    $('game-root').innerHTML = `<div class="screen center"><h2>اللعبة شغالة</h2><p class="muted">هتدخل معاهم من الجولة الجاية. استنى صاحب الأوضة.</p></div>`;
  } else {
    const key = room.game + ':' + room.round;
    if (key !== lastGameKey) { lastGameKey = key; $('game-root').innerHTML = ''; }
    g.render($('game-root'), ctx);
    if (g.sync) g.sync(ctx);
  }
  if ($('s-game').hidden && $('s-menu').hidden) show('s-game');
}

function renderMenu(){
  $('mn-players').innerHTML = playerRows(R.room.players, seatsOf(R.room));
  $('btn-menu-lobby').hidden = !R.host;
  show('s-menu');
}

/* ---------- buttons ---------- */
$('btn-start').onclick = () => { K.tick(600); startGame($('lb-pick').value); };
$('lb-pick').onchange = () => { R.room.game = $('lb-pick').value; pushState(); };
$('btn-lobby-leave').onclick = () => leave();
$('btn-game-menu').onclick = () => renderMenu();
$('btn-menu-back').onclick = () => { $('s-menu').hidden = true; renderGame(); };
$('btn-menu-lobby').onclick = () => { R.room.phase = 'lobby'; $('s-menu').hidden = true; pushState(); };
$('btn-menu-leave').onclick = () => { $('s-menu').hidden = true; leave(); };
$('btn-wait-home').onclick = () => leave();
$('btn-wait-retry').onclick = () => { if (R) connect(); else renderHome(); };
$('btn-copy').onclick = () => {
  const done = () => { $('btn-copy').textContent = 'اتنسخ ✓'; setTimeout(() => $('btn-copy').textContent = 'انسخ اللينك', 1500); };
  const sel = () => { const r = document.createRange(); r.selectNodeContents($('lb-link')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
  try { navigator.clipboard.writeText(roomLink(R.code)).then(done, sel); } catch(e){ sel(); }
};
function openOut(url){ if (window.Capacitor) location.href = url; else { const w = window.open(url, '_blank'); if (!w) location.href = url; } }
$('btn-wa').onclick = () => openOut('https://wa.me/?text=' + encodeURIComponent(`تعالى نلعب ${K.game(R.room.game).name} على لمّة 🎲\n${roomLink(R.code)}`));
$('btn-share').onclick = () => navigator.share({ title:'لمّة', text:`تعالى نلعب ${K.game(R.room.game).name}`, url:roomLink(R.code) }).catch(() => {});

/* ---------- boot ---------- */
(function boot(){
  const code = (params.get('room') || '').toUpperCase();
  if (/^[A-Z0-9]{5}$/.test(code)) {
    const saved = K.fetch('lamma-room-' + code);
    if (saved && saved.room && saved.room.hostId === PID) { joinRoom(code); return; }
    if (myName && K.fetch('lamma-joined-' + code)) { joinRoom(code); return; }
    $('jn-code').textContent = code; $('name-join').value = myName; show('s-join');
    return;
  }
  renderHome();
})();
})();
