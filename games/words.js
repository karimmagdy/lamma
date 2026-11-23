/* Five Letters — an English five-letter word race, 1–8 players.
   Everyone gets the same hidden word and six tries. After each guess a letter turns
   green (right letter, right spot), yellow (in the word, wrong spot) or grey (not in it).
   Other players see your colours as you go, never your letters.

   Points for solving in k tries: 100 − 15·(k−1), plus 30 / 20 / 10 for the first three to solve.
   A round ends when everyone is done or the clock runs out; the room creator sets rounds and time. */
(function(){
const K = Lamma, esc = K.esc;
const ANSWERS = `about above abuse actor adapt adult after again agent agree ahead alarm album alert alike alive allow alone along alter among anger angle angry apart apple apply arena argue arise array aside asset audio avoid award aware badge baker basic beach beard beast begin being below bench birth black blade blame blank blast blend bless blind block blood bloom board boast bonus boost booth brain brand brave bread break brick bride brief bring broad brown brush build bunch burst buyer cabin cable camel candy cargo carry catch cause chain chair chalk charm chart chase cheap check cheek chess chest chief child chill choir civil claim class clean clear clerk click cliff climb clock close cloth cloud coach coast color couch could count court cover crack craft crane crash crazy cream crime crisp cross crowd crown crust curve cycle daily dance dealt death debut delay depth diary dirty doubt dough draft drain drama dream dress drift drink drive eagle early earth eight elbow elect empty enemy enjoy enter entry equal error event every exact exist extra faith false fancy fault feast fence fever field fifth fight final flame flash fleet flesh float flood floor flour fluid focus force forge forth forty forum found frame fresh front frost fruit funny ghost giant given glass globe glory grace grade grain grand grant grape grass grave great green greet grief grill group grown guard guess guest guide habit happy harsh heart heavy hello hobby honey horse hotel house human humor hurry ideal image index inner input issue ivory jelly jewel joint judge juice knife knock label labor large laser later laugh layer learn lemon level light limit linen liver lobby local logic loose lover lower loyal lucky lunch magic major maker mango march match maybe mayor medal media mercy metal meter might minor model money month moral motor mount mouse mouth movie music naval nerve never night noble noise north novel nurse ocean offer often olive onion opera orbit order organ other outer owner paint panel panic paper party pasta patch peace peach pearl phase phone photo piano piece pilot pitch pizza place plain plane plant plate plaza point polar pound power press price pride prime print prize proof proud prove pulse punch pupil queen quick quiet quilt quote radio raise rally ranch range rapid ratio reach react ready realm relax reply rider ridge right rival river roast robot rocky round route royal rural sadly salad sauce scale scene scope score scout sense serve seven shade shake shape share shark sharp sheep shelf shell shift shine shirt shock shoot short shout sight silly since skill skirt sleep slice slide smart smile smoke snack snake solid solve sorry sound south space spare speak speed spend spice spike spoon sport spray squad stack staff stage stair stamp stand start state steam steel steep stick still stock stone stool storm story stove straw strip study style sugar suite sunny super sweet swing sword table taste teach teeth thank theme thick thing think third throw thumb tiger tight timer tired title toast today tooth topic torch total touch tough tower toxic trace track trade trail train treat trend trial tribe trick truck truly trust truth twice uncle under union unity until upper upset urban usage usual valid value video virus visit vital vivid voice voter waste watch water whale wheat wheel where which while white whole woman world worry worth would write wrong yacht young youth zebra`.split(/\s+/).filter(w => /^[a-z]{5}$/.test(w));

function colors(guess, word){
  const res = Array(5).fill('b'), left = {};
  for (let i = 0; i < 5; i++) { if (guess[i] === word[i]) res[i] = 'g'; else left[word[i]] = (left[word[i]] || 0) + 1; }
  for (let i = 0; i < 5; i++) if (res[i] !== 'g' && left[guess[i]]) { res[i] = 'y'; left[guess[i]]--; }
  return res.join('');
}
const BETWEEN_MS = 7000;

function startRound(S){
  const p = S.pub, store = S.secret[S.n];
  let pool = ANSWERS.filter(w => !store.used.includes(w)); if (!pool.length) pool = ANSWERS;
  const word = pool[Math.floor(Math.random() * pool.length)];
  store.used.push(word); store.word = word;
  p.phase = 'play'; p.deadline = S.now + p.time * 1000; p.word = null;
  p.rows = Array(S.n).fill(0).map(() => []); p.done = Array(S.n).fill(false); p.solvedOrder = []; p.gained = Array(S.n).fill(0);
  for (let i = 0; i < S.n; i++) S.secret[i] = { rows:[] };
}
function endRound(S){
  const p = S.pub;
  p.phase = 'between'; p.word = S.secret[S.n].word; p.deadline = S.now + BETWEEN_MS;
}

const KEYS = ['qwertyuiop', 'asdfghjkl', '⏎zxcvbnm⌫'];
const css = `
.wd-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.wd-time{font-family:var(--display);font-size:21px;min-width:58px;height:58px;border-radius:50%;border:3px solid var(--ink);display:grid;place-items:center;background:var(--card);font-variant-numeric:tabular-nums}
.wd-time.low{border-color:var(--stamp);color:var(--stamp)}
.wd-grid{display:grid;grid-template-rows:repeat(6,1fr);gap:5px;width:min(300px,78vw);margin:0 auto;direction:ltr}
.wd-row{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.wd-row.shake{animation:wdshake .35s}
@keyframes wdshake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.wd-t{aspect-ratio:1;display:grid;place-items:center;font-family:var(--display);font-size:28px;text-transform:uppercase;border:2.5px solid var(--grid);background:var(--card);border-radius:6px;color:var(--ink)}
.wd-t.f{border-color:var(--ink)}
.wd-t.g{background:#167a55;border-color:#167a55;color:#fff}
.wd-t.y{background:#d4a017;border-color:#d4a017;color:#fff}
.wd-t.b{background:#8b8b85;border-color:#8b8b85;color:#fff}
.wd-kb{display:flex;flex-direction:column;gap:6px;direction:ltr}
.wd-kb div{display:flex;gap:4px;justify-content:center}
.wd-kb button{flex:1;min-width:0;max-width:40px;min-height:50px;padding:0;font-size:17px;text-transform:uppercase;background:#d9d3c2;color:var(--ink);box-shadow:none;border-radius:8px}
.wd-kb button.wide{max-width:60px;flex:1.5;font-size:20px}
.wd-kb button.g{background:#167a55;color:#fff} .wd-kb button.y{background:#d4a017;color:#fff} .wd-kb button.b{background:#8b8b85;color:#fff}
.wd-others{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.wd-other{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px;font-weight:800;color:var(--pc)}
.wd-mini{display:grid;grid-template-columns:repeat(5,9px);gap:2px;direction:ltr}
.wd-mini i{width:9px;height:9px;border-radius:2px;background:var(--grid)}
.wd-mini i.g{background:#167a55} .wd-mini i.y{background:#d4a017} .wd-mini i.b{background:#8b8b85}
.wd-msg{text-align:center;font-weight:800;min-height:1.5em}
.wd-word{font-family:var(--display);font-size:40px;letter-spacing:.2em;text-transform:uppercase;direction:ltr;text-align:center}
`;
let styled = false;
function style(){ if (styled) return; styled = true; const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

let typed = '', lastCtx = null, timerT = null, keyBound = false, flash = '';
function press(k){
  const ctx = lastCtx; if (!ctx) return;
  const p = ctx.pub, me = ctx.me;
  if (p.phase !== 'play' || p.done[me] || ctx.busy) return;
  if (k === '⌫' || k === 'Backspace') typed = typed.slice(0, -1);
  else if (k === '⏎' || k === 'Enter') {
    if (typed.length < 5) { flash = 'الكلمة 5 حروف'; shake(); }
    else { ctx.act({ t:'guess', w:typed }); typed = ''; K.tick(560, .05); }
  }
  else if (/^[a-z]$/i.test(k) && typed.length < 5) typed += k.toLowerCase();
  draw(ctx);
}
function shake(){ const r = document.querySelector('.wd-row.cur'); if (r) { r.classList.remove('shake'); void r.offsetWidth; r.classList.add('shake'); } K.buzz(40); }
function clock(){
  const el = document.getElementById('wd-time'); if (!el) { clearInterval(timerT); return; }
  const ctx = lastCtx; if (!ctx) return;
  const left = ctx.pub.deadline ? Math.max(0, Math.ceil((ctx.pub.deadline - ctx.now()) / 1000)) : 0;
  el.textContent = ctx.pub.phase === 'end' ? '–' : left;
  el.classList.toggle('low', ctx.pub.phase === 'play' && left <= 15);
}

function draw(ctx){
  const root = document.getElementById('wd-root'); if (!root) return;
  const p = ctx.pub, me = ctx.me, names = ctx.players.map(x => x.name);
  const rows = (ctx.priv && ctx.priv.rows) || [];
  const grid = [];
  for (let r = 0; r < 6; r++) {
    const row = rows[r], cur = !row && r === rows.length && p.phase === 'play' && !p.done[me];
    const letters = row ? row.w : cur ? typed : '';
    grid.push(`<div class="wd-row${cur ? ' cur' : ''}">${[0,1,2,3,4].map(i => `<div class="wd-t${row ? ' ' + row.c[i] : letters[i] ? ' f' : ''}">${esc(letters[i] || '')}</div>`).join('')}</div>`);
  }
  const keyState = {};
  rows.forEach(row => [...row.w].forEach((ch, i) => { const c = row.c[i], prev = keyState[ch]; if (c === 'g' || (c === 'y' && prev !== 'g') || (!prev)) keyState[ch] = c; }));
  const solvedRank = p.solvedOrder.indexOf(me);
  const msg = flash || (p.phase === 'between' ? '' : p.done[me] ? (solvedRank >= 0 ? `حلّيتها! +${p.gained[me]}` : 'خلصت محاولاتك، استنى الباقي') : '');
  flash = '';
  root.querySelector('#wd-grid').innerHTML = grid.join('');
  root.querySelector('#wd-msg').textContent = msg;
  root.querySelector('#wd-kb').innerHTML = KEYS.map(line => `<div>${[...line].map(k => `<button type="button" data-k="${k}" class="${'⏎⌫'.includes(k) ? 'wide' : keyState[k] || ''}" aria-label="${k === '⏎' ? 'Enter' : k === '⌫' ? 'مسح' : k}">${k}</button>`).join('')}</div>`).join('');
  root.querySelector('#wd-kb').hidden = p.phase !== 'play' || p.done[me];
  root.querySelector('#wd-others').innerHTML = ctx.players.map((x, i) => i === me ? '' :
    `<div class="wd-other" style="--pc:${K.color(i)}"><div class="wd-mini">${[...Array(6)].map((_, r) => { const c = (p.rows[i] || [])[r]; return [0,1,2,3,4].map(j => `<i class="${c ? c[j] : ''}"></i>`).join(''); }).join('')}</div>${esc(x.name)}${p.solvedOrder.includes(i) ? ' ✓' : ''}</div>`).join('');
  const between = root.querySelector('#wd-between');
  between.hidden = p.phase === 'play';
  if (p.phase === 'between') between.innerHTML = `<p class="muted" style="text-align:center">الكلمة كانت</p><div class="wd-word">${esc(p.word || '')}</div>${K.scores(ctx.players, p.points)}<p class="hint">الجولة ${p.round} من ${p.rounds}، الجاية بعد ثواني…</p>`;
  if (p.phase === 'end') {
    const rank = p.points.map((v, i) => [i, v]).sort((a, b) => b[1] - a[1]);
    if (!ctx.local.celebrated) { ctx.local.celebrated = true; ctx.saveLocal(); if (rank[0][0] === me) K.celebrate(); }
    between.innerHTML = `<h2 style="text-align:center">${rank[0][0] === me ? 'انت الأول!' : `${esc(names[rank[0][0]])} الأول!`}</h2>${p.word ? `<div class="wd-word">${esc(p.word)}</div>` : ''}${K.scores(ctx.players, p.points)}
      ${ctx.isHost ? '<div class="row"><button class="stamp" data-again>العب تاني</button><button class="ghost" data-lobby>رجوع للأوضة</button></div>' : '<p class="hint">صاحب الأوضة هيبدأ اللي بعده.</p>'}`;
    between.querySelector('[data-again]')?.addEventListener('click', () => ctx.again());
    between.querySelector('[data-lobby]')?.addEventListener('click', () => ctx.toLobby());
  }
  root.querySelector('#wd-round').textContent = p.phase === 'end' ? 'خلصت' : `جولة ${p.round} من ${p.rounds}`;
  clock();
}

Lamma.register({
  id:'words', cat:'en', icon:'W', name:'Five Letters', blurb:'خمّن الكلمة الإنجليزي في 6 محاولات، وسابق صحابك.', min:1, max:8,
  settings:[
    { key:'rounds', label:'عدد الكلمات', def:3, options:[{ v:1, label:'كلمة' }, { v:3, label:'3 كلمات' }, { v:5, label:'5 كلمات' }] },
    { key:'time', label:'وقت كل كلمة', def:180, options:[{ v:120, label:'دقيقتين' }, { v:180, label:'3 دقايق' }, { v:300, label:'5 دقايق' }] },
  ],
  init(n, prev, set){ return { phase:'play', round:1, rounds:+set.rounds || 3, time:+set.time || 180, deadline:0, points:Array(n).fill(0), rows:[], done:[], solvedOrder:[], gained:[] }; },
  secrets(pub, n){ const S = { pub, n, now:Date.now(), secret:[...Array(n).fill(null), { used:[], word:null }] }; startRound(S); return S.secret; },
  tick(S){
    const p = S.pub;
    if (p.phase === 'end' || S.now < p.deadline) return false;
    if (p.phase === 'play') endRound(S);
    else if (p.round >= p.rounds) { p.phase = 'end'; p.deadline = 0; }
    else { p.round++; startRound(S); }
    return true;
  },
  act(S, seat, a){
    const p = S.pub, word = S.secret[S.n].word, mine = S.secret[seat];
    if (a.t !== 'guess' || p.phase !== 'play' || p.done[seat]) return;
    const w = String(a.w || '').toLowerCase();
    if (!/^[a-z]{5}$/.test(w)) return;
    const c = colors(w, word);
    mine.rows.push({ w, c }); p.rows[seat].push(c);
    if (c === 'ggggg') {
      const k = mine.rows.length, pts = 100 - 15 * (k - 1) + ([30, 20, 10][p.solvedOrder.length] || 0);
      p.solvedOrder.push(seat); p.points[seat] += pts; p.gained[seat] = pts; p.done[seat] = true;
    } else if (mine.rows.length >= 6) p.done[seat] = true;
    if (p.done.every(Boolean)) endRound(S);
  },
  render(root, ctx){
    style(); lastCtx = ctx;
    if (!root.querySelector('#wd-root')) {
      root.innerHTML = `<div id="wd-root" class="game-root">
        <div class="wd-head"><span class="muted" id="wd-round"></span><div class="wd-time" id="wd-time">–</div></div>
        <div class="wd-others" id="wd-others"></div>
        <div class="wd-grid" id="wd-grid"></div>
        <p class="wd-msg" id="wd-msg"></p>
        <div class="wd-kb" id="wd-kb"></div>
        <div id="wd-between" class="game-root" hidden></div></div>`;
      root.querySelector('#wd-kb').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
      clearInterval(timerT); timerT = setInterval(clock, 250);
      typed = '';
    }
    if (!keyBound) { keyBound = true; document.addEventListener('keydown', e => { if (document.getElementById('wd-root') && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) press(e.key); }); }
    const rowsNow = (ctx.priv && ctx.priv.rows) || [];
    if (ctx.local.rowsSeen !== undefined && rowsNow.length > ctx.local.rowsSeen) { const last = rowsNow[rowsNow.length - 1]; K.tick(last.c === 'ggggg' ? 880 : 500, .08); if (last.c === 'ggggg') K.celebrate(); }
    ctx.local.rowsSeen = ctx.pub.phase === 'play' ? rowsNow.length : 0;
    draw(ctx);
  },
});
})();
