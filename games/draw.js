/* شخبطة — draw and guess, 2–8 players.

   Each turn the drawer picks one of 3 random words and draws it; everyone else types guesses.
   Every player draws once per round; the room creator picks 1–3 rounds, the drawing time and
   the word language in the lobby.

   Scoring for a correct guess (t = share of the drawing time still left, 0..1):
     guesser  = 50 + 100·t + order bonus (30 for the first to get it, 20 second, 10 third)
     drawer   = half of that guesser's points, for every player who gets it
   So fast guesses pay both players more, and a drawing everyone gets pays the drawer most.

   The drawing itself streams straight from the drawer's phone to the others as live
   messages (ctx.emit); the host only keeps score, the timer and the secret word. */
(function(){
const K = Lamma, esc = K.esc;

const WORDS = {
  ar: `بيت شجرة شمس قمر نجمة عربية طيارة مركب قطة كلب سمكة عصفورة وردة تفاحة موزة بطيخة فراولة عنب كرة نضارة ساعة شنطة كرسي ترابيزة سرير باب شباك مفتاح قلم كتاب موبايل تليفزيون لمبة شمسية جزمة قميص بنطلون طاقية خاتم تاج سيف كورة فانوس هرم جمل حصان فيل زرافة أسد قرد أرنب سلحفاة ثعبان فراشة نحلة عنكبوت بطة فرخة بقرة خروف ديناصور حوت أخطبوط قلب عين ودن بق إيد رجل سنان شعر بالونة كيكة بيتزا ساندويتش آيس_كريم فشار شاي قهوة كوباية معلقة شوكة سكينة طبق حلة تلاجة غسالة مروحة تكييف سلم شنطة_ضهر عجلة موتوسيكل قطر أتوبيس صاروخ قمر_صناعي بحر جبل نهر جزيرة صحرا مطر سحابة قوس_قزح برق تلج راجل_التلج شجرة_الكريسماس هدية شمعة جرس مسجد كنيسة كوبري برج فنار خيمة كاميرا جيتار طبلة مايك سماعة روبوت شبح ساحر قرصان ملك أميرة دكتور عسكري مهندس طباخ صياد مزارع`,
  en: `house tree sun moon star car airplane boat cat dog fish bird flower apple banana watermelon strawberry grapes ball glasses clock bag chair table bed door window key pencil book phone television lamp umbrella shoe shirt pants hat ring crown sword lantern pyramid camel horse elephant giraffe lion monkey rabbit turtle snake butterfly bee spider duck chicken cow sheep dinosaur whale octopus heart eye ear mouth hand foot teeth hair balloon cake pizza sandwich ice_cream popcorn tea coffee cup spoon fork knife plate pot fridge fan ladder backpack bicycle motorcycle train bus rocket satellite sea mountain river island desert rain cloud rainbow lightning snow snowman gift candle bell bridge tower lighthouse tent camera guitar drum microphone headphones robot ghost wizard pirate king princess doctor soldier chef fisherman farmer castle volcano anchor tornado mermaid dragon unicorn penguin kangaroo cactus mushroom pineapple carrot corn sandcastle skateboard parachute helicopter submarine treasure map compass toothbrush scissors hammer`,
};
const pickWords = (lang, used, k) => {
  const all = WORDS[lang].split(/\s+/).filter(Boolean).map(w => w.replace(/_/g, ' '));
  let pool = all.filter(w => !used.includes(w));
  if (pool.length < k) pool = all;
  return K.shuffle(pool).slice(0, k);
};
const norm = s => String(s || '').trim().toLowerCase()
  .replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
  .replace(/^ال/, '').replace(/[\s\-_.!?؟,،]+/g, '');
function lev(a, b){
  if (Math.abs(a.length - b.length) > 1) return 9;
  const d = [...Array(b.length + 1).keys()];
  for (let i = 1; i <= a.length; i++) { let prev = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j-1] + 1, prev + (a[i-1] === b[j-1] ? 0 : 1)); prev = t; } }
  return d[b.length];
}
const CHOOSE_MS = 15000, REVEAL_MS = 5000;

/* ---------- host: turns ---------- */
function startTurn(S){
  const p = S.pub, store = S.secret[S.n];
  p.drawer = p.order[p.turnIdx];
  p.phase = 'choose'; p.deadline = S.now + CHOOSE_MS;
  p.guessed = []; p.gained = {}; p.hint = null; p.word = null; p.key++;
  p.chat.push({ sys:`${'‏'}دور رسمة جديدة`, k:p.key });
  const choices = pickWords(p.lang, store.used, 3);
  S.secret = S.secret.map((x, i) => i < S.n ? null : x);
  S.secret[p.drawer] = { choices };
  store.choices = choices;
}
function beginDraw(S, word){
  const p = S.pub, store = S.secret[S.n];
  store.word = word; store.used.push(word);
  p.phase = 'draw'; p.deadline = S.now + p.time * 1000; p.drawStart = S.now;
  p.hint = [...word].map(ch => ch === ' ' ? ' ' : '_');
  p.revealed = 0;
  S.secret[p.drawer] = { word };
}
function endTurn(S){
  const p = S.pub;
  p.phase = 'reveal'; p.word = S.secret[S.n].word; p.deadline = S.now + REVEAL_MS;
  S.secret = S.secret.map((x, i) => i < S.n ? { word:p.word } : x);
}
function nextTurn(S){
  const p = S.pub;
  p.turnIdx++;
  if (p.turnIdx >= p.order.length) { p.turnIdx = 0; p.round++; }
  if (p.round > p.rounds) { p.phase = 'end'; p.deadline = 0; S.secret = S.secret.map((x, i) => i < S.n ? null : x); return; }
  startTurn(S);
}
function revealLetter(p, word){
  const hidden = [...word].map((ch, i) => ch !== ' ' && p.hint[i] === '_' ? i : -1).filter(i => i >= 0);
  if (hidden.length <= 2) return;
  const i = hidden[Math.floor(Math.random() * hidden.length)];
  p.hint[i] = [...word][i]; p.revealed++;
}

/* ---------- client: drawing ---------- */
const CW = 800, CH = 600;
const PALETTE = ['#1f2330','#ffffff','#d2412e','#d4600f','#e8b100','#167a55','#2448c9','#7c3aed','#be185d','#7a4a26','#9aa0a6'];
const SIZES = [4, 10, 24];
let strokes = [], strokeKey = null, pen = { c:PALETTE[0], w:SIZES[0] }, cur = null, buf = [], flushT = null, seq = 0;
let lastCtx = null, timerT = null, canvas = null, c2d = null, asked = '';

function paintAll(){
  if (!c2d) return;
  c2d.fillStyle = '#fff'; c2d.fillRect(0, 0, CW, CH);
  strokes.forEach(s => paint(s, 0));
}
function paint(s, from){
  if (!c2d || !s.p.length) return;
  c2d.strokeStyle = s.c; c2d.lineWidth = s.w; c2d.lineCap = 'round'; c2d.lineJoin = 'round';
  c2d.beginPath();
  const st = Math.max(0, from - 2);
  c2d.moveTo(s.p[st], s.p[st+1]);
  if (s.p.length === 2) c2d.lineTo(s.p[0] + .1, s.p[1]);
  for (let i = st + 2; i < s.p.length; i += 2) c2d.lineTo(s.p[i], s.p[i+1]);
  c2d.stroke();
}
function resetStrokes(key){ strokes = []; strokeKey = key; paintAll(); }
function applyEmit(d){
  if (d.key !== strokeKey) return;
  if (d.k === 'pts') {
    let s = strokes.find(x => x.i === d.i);
    if (!s) { s = { i:d.i, c:d.c, w:d.w, p:[] }; strokes.push(s); }
    const from = s.p.length; s.p.push(...d.p); paint(s, from);
  } else if (d.k === 'undo') { strokes = strokes.filter(s => s.i !== d.i); paintAll(); }
  else if (d.k === 'clear') { strokes = []; paintAll(); }
  else if (d.k === 'all') { strokes = d.strokes; paintAll(); }
}
function flush(){
  clearTimeout(flushT); flushT = null;
  if (!cur || !buf.length || !lastCtx) return;
  lastCtx.emit({ k:'pts', key:strokeKey, i:cur.i, c:cur.c, w:cur.w, p:buf });
  buf = [];
}
function bindCanvas(){
  const pos = e => { const r = canvas.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * CW), Math.round((e.clientY - r.top) / r.height * CH)]; };
  canvas.addEventListener('pointerdown', e => {
    const ctx = lastCtx; if (!ctx || ctx.pub.phase !== 'draw' || ctx.pub.drawer !== ctx.me) return;
    canvas.setPointerCapture(e.pointerId);
    cur = { i:`${ctx.me}-${Date.now().toString(36)}-${seq++}`, c:pen.c, w:pen.w, p:pos(e) };
    strokes.push(cur); buf = cur.p.slice(); paint(cur, 0);
    flushT = setTimeout(flush, 90);
  });
  canvas.addEventListener('pointermove', e => {
    if (!cur) return;
    const [x, y] = pos(e), n = cur.p.length;
    if (Math.abs(x - cur.p[n-2]) + Math.abs(y - cur.p[n-1]) < 3) return;
    cur.p.push(x, y); buf.push(x, y); paint(cur, n);
    if (!flushT) flushT = setTimeout(flush, 90);
  });
  const up = () => { if (cur) { flush(); cur = null; } };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
}

const css = `
.dr-head{display:flex;align-items:center;gap:10px}
.dr-time{font-family:var(--display);font-size:26px;min-width:52px;height:52px;border-radius:50%;border:3px solid var(--ink);display:grid;place-items:center;background:var(--card);font-variant-numeric:tabular-nums;flex:none}
.dr-time.low{border-color:var(--stamp);color:var(--stamp)}
.dr-word{flex:1;min-width:0;text-align:center}
.dr-word .w{font-family:var(--display);font-size:26px;letter-spacing:.08em}
.dr-word .hint{letter-spacing:.35em;font-size:24px;font-weight:800;direction:ltr;unicode-bidi:plaintext}
.dr-word small{display:block;color:var(--muted);font-size:13px}
.dr-stage{position:relative;width:100%}
.dr-stage canvas{width:100%;aspect-ratio:4/3;background:#fff;border:3px solid var(--ink);border-radius:14px;box-shadow:4px 5px 0 var(--ink);touch-action:none;display:block}
.dr-over{position:absolute;inset:0;border-radius:14px;background:rgba(243,239,228,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:12px;text-align:center}
.dr-over .ch{display:flex;flex-direction:column;gap:8px;width:min(260px,100%)}
.dr-tools{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center}
.dr-sw{width:30px;height:30px;border-radius:50%;border:2px solid var(--ink);padding:0;min-height:0;box-shadow:none;background:var(--sw)}
.dr-sw.on{outline:3px solid var(--stamp);outline-offset:2px}
.dr-sz{min-height:36px;width:40px;padding:0;background:var(--card);color:var(--ink);border:2px solid var(--ink);box-shadow:none;display:grid;place-items:center}
.dr-sz i{display:block;border-radius:50%;background:var(--ink)}
.dr-sz.on{background:var(--ink)} .dr-sz.on i{background:var(--paper)}
.dr-tools .tb{min-height:36px;padding:4px 10px;font-size:14px}
.dr-chat{list-style:none;margin:0;padding:8px 10px;display:flex;flex-direction:column;gap:3px;max-height:150px;overflow-y:auto;background:var(--card);border:1.5px solid var(--grid);border-radius:12px;font-size:15px}
.dr-chat li b{color:var(--pc)}
.dr-chat li.ok{color:var(--ok);font-weight:800}
.dr-chat li.close{color:var(--stamp);font-weight:700}
.dr-chat li.sys{color:var(--muted);font-size:13px;text-align:center}
.dr-form{display:flex;gap:8px}
.dr-form button{flex:none}
.dr-rank{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.dr-rank li{display:flex;justify-content:space-between;align-items:center;background:var(--card);border:1.5px solid var(--grid);border-radius:12px;padding:8px 12px;font-weight:800;color:var(--pc)}
.dr-rank li b{font-family:var(--display);font-weight:400;font-size:22px}
.dr-rank li:first-child{border:2.5px solid var(--stamp)}
`;
let styled = false;
function style(){ if (styled) return; styled = true; const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

function skeleton(root){
  root.innerHTML = `
    <div class="dr-head"><div class="dr-time" id="dr-time">–</div><div class="dr-word" id="dr-word"></div></div>
    <div id="dr-chips"></div>
    <div class="dr-stage"><canvas id="dr-cv" width="${CW}" height="${CH}" aria-label="لوحة الرسم"></canvas><div class="dr-over" id="dr-over" hidden></div></div>
    <div class="dr-tools" id="dr-tools" hidden>
      ${PALETTE.map(c => `<button class="dr-sw" data-c="${c}" style="--sw:${c}" aria-label="لون"></button>`).join('')}
      ${SIZES.map(w => `<button class="dr-sz" data-w="${w}" aria-label="سُمك ${w}"><i style="width:${Math.min(22, w)}px;height:${Math.min(22, w)}px"></i></button>`).join('')}
      <button class="ghost tb" data-undo>رجوع</button><button class="ghost tb" data-clear>امسح</button>
    </div>
    <ul class="dr-chat" id="dr-chat" aria-live="polite"></ul>
    <form class="dr-form" id="dr-form"><input id="dr-in" maxlength="40" autocomplete="off" enterkeyhint="send" placeholder="خمّن الكلمة…"><button class="stamp">خمّن</button></form>
    <div id="dr-end" hidden></div>`;
  canvas = root.querySelector('#dr-cv'); c2d = canvas.getContext('2d');
  bindCanvas(); paintAll();
  root.querySelector('#dr-tools').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !lastCtx) return;
    if (b.dataset.c) pen.c = b.dataset.c;
    if (b.dataset.w) pen.w = +b.dataset.w;
    if ('undo' in b.dataset) { const mine = strokes.filter(s => s.i.startsWith(lastCtx.me + '-')).pop(); if (mine) { strokes = strokes.filter(s => s !== mine); paintAll(); lastCtx.emit({ k:'undo', key:strokeKey, i:mine.i }); } }
    if ('clear' in b.dataset) { strokes = []; paintAll(); lastCtx.emit({ k:'clear', key:strokeKey }); }
    toolsState();
  });
  root.querySelector('#dr-form').addEventListener('submit', e => {
    e.preventDefault();
    const inp = root.querySelector('#dr-in'), v = inp.value.trim();
    if (!v || !lastCtx) return;
    lastCtx.act({ t:'guess', text:v }); inp.value = ''; K.tick(480, .04);
  });
  clearInterval(timerT); timerT = setInterval(clock, 250);
}
function toolsState(){
  document.querySelectorAll('.dr-sw').forEach(b => b.classList.toggle('on', b.dataset.c === pen.c));
  document.querySelectorAll('.dr-sz').forEach(b => b.classList.toggle('on', +b.dataset.w === pen.w));
}
function clock(){
  const el = document.getElementById('dr-time');
  if (!el) { clearInterval(timerT); return; }
  const ctx = lastCtx; if (!ctx) return;
  const p = ctx.pub;
  if (!p.deadline || p.phase === 'end') { el.textContent = '–'; el.classList.remove('low'); return; }
  const left = Math.max(0, Math.ceil((p.deadline - ctx.now()) / 1000));
  if (el.textContent !== String(left)) { el.textContent = left; if (p.phase === 'draw' && left <= 10 && left > 0) K.tick(900, .03); }
  el.classList.toggle('low', p.phase === 'draw' && left <= 10);
}

let lastChat = 0;
Lamma.register({
  id:'draw', icon:'✎', name:'شخبطة', blurb:'واحد يرسم وكله يخمّن. اللي يعرفها أسرع ياخد نقط أكتر، والرسام كمان.', min:2, max:8,
  settings:[
    { key:'rounds', label:'عدد الجولات', def:2, options:[{ v:1, label:'جولة' }, { v:2, label:'جولتين' }, { v:3, label:'3 جولات' }] },
    { key:'time',   label:'وقت الرسم',   def:80, options:[{ v:60, label:'60 ثانية' }, { v:80, label:'80 ثانية' }, { v:100, label:'100 ثانية' }, { v:120, label:'120 ثانية' }] },
    { key:'lang',   label:'لغة الكلمات', def:'ar', options:[{ v:'ar', label:'عربي' }, { v:'en', label:'English' }] },
  ],

  init(n, prev, set){
    return { phase:'choose', rounds:+set.rounds || 2, time:+set.time || 80, lang:set.lang || 'ar', round:1, turnIdx:0,
      order:[...Array(n).keys()], drawer:0, deadline:0, key:0, guessed:[], gained:{}, hint:null, word:null,
      points:Array(n).fill(0), chat:[] };
  },
  secrets(pub, n){
    const S = { pub, n, now:Date.now(), secret:[...Array(n).fill(null), { used:[], word:null, choices:[] }] };
    startTurn(S);
    return S.secret;
  },

  tick(S){
    const p = S.pub, store = S.secret[S.n];
    if (p.phase === 'end' || !p.deadline) return false;
    if (p.phase === 'draw') {
      const total = p.time * 1000, gone = S.now - p.drawStart;
      const want = gone > total * .75 ? 2 : gone > total * .5 ? 1 : 0;
      if (p.revealed < want) { revealLetter(p, store.word); if (S.now < p.deadline) return true; }
    }
    if (S.now < p.deadline) return false;
    if (p.phase === 'choose') beginDraw(S, store.choices[0]);
    else if (p.phase === 'draw') endTurn(S);
    else if (p.phase === 'reveal') nextTurn(S);
    return true;
  },

  act(S, seat, a){
    const p = S.pub, store = S.secret[S.n];
    const say = e => { p.chat.push(Object.assign({ k:p.key }, e)); if (p.chat.length > 40) p.chat.splice(0, p.chat.length - 40); };
    if (a.t === 'pick' && p.phase === 'choose' && seat === p.drawer && store.choices.includes(a.word)) { beginDraw(S, a.word); return; }
    if (a.t === 'guess' && typeof a.text === 'string') {
      const text = a.text.slice(0, 40);
      if (p.phase !== 'draw' || seat === p.drawer || p.guessed.includes(seat)) { if (p.phase !== 'draw') say({ s:seat, txt:text }); return; }
      const g = norm(text), w = norm(store.word);
      if (g && g === w) {
        const t = Math.max(0, (p.deadline - S.now) / (p.time * 1000));
        const pts = Math.round(50 + 100 * t + ([30, 20, 10][p.guessed.length] || 0));
        const dpts = Math.round(pts / 2);
        p.guessed.push(seat); p.points[seat] += pts; p.points[p.drawer] += dpts;
        p.gained[seat] = (p.gained[seat] || 0) + pts; p.gained[p.drawer] = (p.gained[p.drawer] || 0) + dpts;
        S.secret[seat] = { word:store.word };
        say({ s:seat, ok:true, pts });
        if (p.guessed.length >= S.n - 1) endTurn(S);
      } else if (w.length >= 4 && lev(g, w) === 1) {
        say({ s:seat, close:true, only:seat, txt:text });
      } else say({ s:seat, txt:text });
      return;
    }
    if (a.t === 'skip' && seat === S.hostSeat) {
      if (p.phase === 'choose') beginDraw(S, store.choices[0]);
      else if (p.phase === 'draw') endTurn(S);
      else if (p.phase === 'reveal') nextTurn(S);
    }
  },

  onEmit(ctx, d, from){
    lastCtx = ctx;
    if (d.k === 'need') {
      if (ctx.pub.drawer === ctx.me && d.key === strokeKey) ctx.emit({ k:'all', key:strokeKey, strokes }, from);
      return;
    }
    if (from !== ctx.pub.drawer) return;
    applyEmit(d);
  },

  render(root, ctx){
    style();
    lastCtx = ctx;
    const p = ctx.pub, me = ctx.me, names = ctx.players.map(x => x.name), word = ctx.priv && ctx.priv.word;
    if (!root.querySelector('#dr-cv')) skeleton(root);
    const $ = s => root.querySelector(s);
    if (strokeKey !== p.key) { resetStrokes(p.key); if (p.drawer !== me && p.phase !== 'choose') { asked = ''; } }
    if (p.phase === 'draw' && p.drawer !== me && asked !== p.key + ':' + ctx.round) { asked = p.key + ':' + ctx.round; ctx.emit({ k:'need', key:p.key }, p.drawer); }

    const drawing = p.phase === 'draw' && p.drawer === me;
    const iGot = p.guessed.includes(me);
    /* word / hint */
    $('#dr-word').innerHTML =
      p.phase === 'end' ? `<span class="w">خلصت اللعبة</span>` :
      p.phase === 'choose' ? `<span class="w">${p.drawer === me ? 'اختار كلمة' : `${esc(names[p.drawer])} بيختار…`}</span><small>الجولة ${p.round} من ${p.rounds}</small>` :
      p.phase === 'reveal' ? `<span class="w">${esc(p.word)}</span><small>دي كانت الكلمة</small>` :
      word ? `<span class="w">${esc(word)}</span><small>${drawing ? 'ارسمها! من غير حروف ولا أرقام' : 'عرفتها ✓'}</small>` :
      `<span class="hint">${p.hint.map(c => c === ' ' ? ' ' : esc(c)).join('')}</span><small>${p.hint.filter(c => c !== ' ').length} حروف · الجولة ${p.round} من ${p.rounds}</small>`;
    /* players */
    $('#dr-chips').innerHTML = K.chips(ctx.players.map((x, i) => ({ name:(i === p.drawer && p.phase !== 'end' ? '✎ ' : '') + x.name + (p.guessed.includes(i) ? ' ✓' : ''), seat:i, turn:i === p.drawer && p.phase !== 'end', online:ctx.online(i), extra:p.points[i] })));
    /* tools */
    $('#dr-tools').hidden = !drawing; if (drawing) toolsState();
    canvas.style.cursor = drawing ? 'crosshair' : 'default';
    /* overlay */
    const over = $('#dr-over');
    if (p.phase === 'choose' && p.drawer === me && ctx.priv && ctx.priv.choices) {
      over.hidden = false;
      over.innerHTML = `<h3>اختار كلمة ترسمها</h3><div class="ch">${ctx.priv.choices.map(w => `<button class="stamp" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div>`;
      over.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { ctx.act({ t:'pick', word:b.dataset.w }); over.innerHTML = '<p class="muted">يلا ارسم…</p>'; });
    } else if (p.phase === 'choose') {
      over.hidden = false; over.innerHTML = `<span class="dot wait big"></span><h3>${esc(names[p.drawer])} بيختار كلمة</h3>`;
    } else if (p.phase === 'reveal') {
      over.hidden = false;
      const g = Object.entries(p.gained).sort((a, b) => b[1] - a[1]);
      over.innerHTML = `<p class="muted">الكلمة كانت</p><h2>${esc(p.word)}</h2>${g.length ? `<ul class="dr-rank" style="width:min(280px,100%)">${g.map(([s, v]) => `<li style="--pc:${K.color(+s)}"><span>${esc(names[s])}</span><b>+${v}</b></li>`).join('')}</ul>` : '<p class="muted">محدش عرفها المرة دي.</p>'}`;
    } else over.hidden = true;
    /* chat */
    const lines = p.chat.filter(e => e.only == null || e.only === me);
    $('#dr-chat').innerHTML = lines.map(e => e.sys ? `<li class="sys">${esc(e.sys)}</li>`
      : e.ok ? `<li class="ok" style="--pc:${K.color(e.s)}">${esc(names[e.s])} عرف الكلمة! +${e.pts}</li>`
      : e.close ? `<li class="close">"${esc(e.txt)}" قرّبت جداً!</li>`
      : `<li style="--pc:${K.color(e.s)}"><b>${esc(names[e.s])}:</b> ${esc(e.txt)}</li>`).join('');
    if (p.chat.length !== lastChat) { $('#dr-chat').scrollTop = 1e6; const last = p.chat[p.chat.length-1]; if (last && last.ok) K.tick(880, .1); lastChat = p.chat.length; }
    /* input */
    const inp = $('#dr-in'), canGuess = p.phase === 'draw' && !drawing && !iGot;
    inp.disabled = drawing; inp.placeholder = drawing ? 'انت بترسم دلوقتي' : iGot ? 'عرفتها! استنى الباقي…' : canGuess ? 'خمّن الكلمة…' : 'اكتب رسالة…';
    $('#dr-form').hidden = p.phase === 'end';
    /* host can push a stuck turn along */
    let sk = $('#dr-skip');
    const stuck = ctx.isHost && p.phase !== 'end' && !ctx.online(p.drawer);
    if (stuck && !sk) { sk = document.createElement('button'); sk.id = 'dr-skip'; sk.className = 'ghost'; sk.textContent = 'عدّي الرسام (مش متصل)'; sk.onclick = () => ctx.act({ t:'skip' }); $('#dr-chat').before(sk); }
    if (!stuck && sk) sk.remove();
    /* game over */
    const end = $('#dr-end');
    end.hidden = p.phase !== 'end';
    if (p.phase === 'end') {
      over.hidden = true;
      const rank = p.points.map((v, i) => [i, v]).sort((a, b) => b[1] - a[1]);
      if (!ctx.local.celebrated) { ctx.local.celebrated = true; ctx.saveLocal(); if (rank[0][0] === me) K.celebrate(); }
      end.innerHTML = `<h2 style="text-align:center;margin-bottom:8px">${rank[0][0] === me ? 'انت الأول!' : `${esc(names[rank[0][0]])} الأول!`}</h2>
        <ul class="dr-rank">${rank.map(([s, v]) => `<li style="--pc:${K.color(s)}"><span>${esc(names[s])}</span><b>${v}</b></li>`).join('')}</ul>
        ${ctx.isHost ? '<div class="row" style="margin-top:10px"><button class="stamp" data-again>العب تاني</button><button class="ghost" data-lobby>رجوع للأوضة</button></div>' : '<p class="hint">صاحب الأوضة هيبدأ اللي بعده.</p>'}`;
      end.querySelector('[data-again]')?.addEventListener('click', () => ctx.again());
      end.querySelector('[data-lobby]')?.addEventListener('click', () => ctx.toLobby());
    }
    clock();
  },
});
})();
