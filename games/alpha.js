/* A to Z — guess the hidden English word in a category, 1–8 players.
   Every guess is placed in alphabetical order around a "?" slot where the answer sits.
   Each guess shows an arrow toward the answer and how far it is in dictionary order.

   Three levels, picked by the room creator:
     easy   — 12 guesses, familiar answers, the first letter is given, distance as a number, 3 letter hints
     medium — 8 guesses, familiar answers, distance as a number, 2 letter hints
     hard   — 6 guesses, harder answers, only near / far (no number), 1 letter hint
   Points for solving with k of G guesses: 50 + 70·(G−k)/(G−1), plus 30 / 20 / 10 for the first three,
   minus 15 for each letter hint used (never below 10). */
(function(){
const K = Lamma, esc = K.esc;

const CATS = [
  ['Animals', 'حيوانات', 'dog cat horse lion tiger rabbit monkey zebra elephant giraffe camel bear', 'armadillo platypus wolverine meerkat ocelot tapir okapi pangolin hyena walrus'],
  ['Fruits', 'فواكه', 'apple banana orange mango grape lemon peach cherry strawberry watermelon pear', 'apricot papaya guava lychee kumquat persimmon quince pomegranate nectarine'],
  ['Vegetables', 'خضار', 'carrot potato tomato onion garlic lettuce cucumber pepper broccoli cabbage', 'artichoke asparagus zucchini turnip radish leek okra eggplant celery'],
  ['Countries', 'دول', 'egypt france japan brazil canada mexico italy spain china india germany', 'bhutan uruguay latvia mongolia ecuador malta yemen botswana iceland'],
  ['Sports', 'رياضات', 'football tennis boxing swimming golf cricket hockey baseball basketball volleyball', 'fencing archery lacrosse curling rowing badminton polo surfing wrestling'],
  ['Jobs', 'وظايف', 'doctor teacher pilot chef farmer nurse police dentist engineer driver', 'plumber surgeon architect pharmacist carpenter jeweler librarian astronaut'],
  ['Body parts', 'جسم الإنسان', 'hand head nose mouth finger shoulder knee elbow stomach heart', 'kidney ankle wrist eyebrow spine lung liver forehead thumb'],
  ['Kitchen things', 'حاجات المطبخ', 'spoon fork knife plate cup oven fridge kettle pan bowl', 'spatula colander whisk ladle grater blender toaster skillet'],
  ['Colours', 'ألوان', 'red blue green yellow purple orange pink brown black white', 'maroon turquoise magenta indigo crimson beige lavender olive'],
  ['Insects and bugs', 'حشرات', 'ant bee butterfly spider mosquito fly beetle ladybug cockroach worm', 'termite cricket grasshopper dragonfly scorpion firefly caterpillar centipede'],
  ['Clothes', 'لبس', 'shirt dress jacket shoes hat socks scarf jeans coat skirt', 'sweater blouse vest gloves pajamas sandals tuxedo overalls'],
  ['Music instruments', 'آلات موسيقية', 'piano guitar drum violin flute trumpet harp saxophone', 'cello clarinet accordion banjo oboe ukulele trombone xylophone'],
  ['Vehicles', 'مواصلات', 'car bus train bicycle truck boat plane taxi motorcycle helicopter', 'tram ferry scooter yacht submarine tractor ambulance canoe'],
  ['Nature', 'طبيعة', 'rain snow wind cloud sun storm river mountain ocean desert', 'volcano glacier tornado canyon lagoon meadow avalanche rainbow'],
  ['Birds', 'طيور', 'eagle parrot pigeon owl duck chicken penguin ostrich swan crow', 'flamingo pelican vulture sparrow peacock falcon hummingbird woodpecker'],
  ['Around the house', 'في البيت', 'chair table bed sofa door window lamp mirror shelf carpet', 'wardrobe cushion curtain drawer staircase chandelier armchair cupboard'],
].map(([en, ar, easy, hard]) => ({ en, ar, easy:easy.split(' '), hard:hard.split(' ') }));

const LEVELS = {
  easy:   { G:12, hints:3, first:true,  number:true,  pool:'easy' },
  medium: { G:8,  hints:2, first:false, number:true,  pool:'easy' },
  hard:   { G:6,  hints:1, first:false, number:false, pool:'hard' },
};

/* Dictionary-order position of a word, scaled to a 40,000-word dictionary.
   First letters follow how many dictionary words start with each letter; later letters follow
   ordinary English letter frequency, with "end of word" sorting first. */
const FIRST = { a:6.0,b:5.6,c:9.4,d:5.9,e:4.0,f:4.0,g:3.3,h:3.6,i:3.6,j:.8,k:.9,l:3.2,m:5.5,n:2.3,o:2.6,p:8.0,q:.5,r:5.4,s:11.4,t:5.0,u:3.0,v:1.5,w:2.4,x:.1,y:.3,z:.3 };
const LATER = { $:9,a:8.2,b:1.5,c:2.8,d:4.3,e:12.7,f:2.2,g:2.0,h:6.1,i:7.0,j:.2,k:.8,l:4.0,m:2.4,n:6.7,o:7.5,p:1.9,q:.1,r:6.0,s:6.3,t:9.1,u:2.8,v:1,w:2.4,x:.2,y:2.0,z:.1 };
function cdf(tab){ const keys = Object.keys(tab).sort(), tot = keys.reduce((s, k) => s + tab[k], 0); let acc = 0; const out = {}; for (const k of keys) { out[k] = [acc / tot, tab[k] / tot]; acc += tab[k]; } return out; }
const F1 = cdf(FIRST), FN = cdf(LATER);
const DICT = 40000;
function pos(word){
  let lo = 0, w = 1;
  const s = word + '$';
  for (let i = 0; i < Math.min(s.length, 8); i++) {
    const t = (i === 0 ? F1 : FN)[s[i]]; if (!t) break;
    lo += w * t[0]; w *= t[1];
    if (s[i] === '$') break;
  }
  return lo * DICT;
}
function distance(a, b){ return a === b ? 0 : Math.max(1, Math.round(Math.abs(pos(a) - pos(b)))); }
function heat(d){ return d <= 60 ? 'h0' : d <= 400 ? 'h1' : d <= 2000 ? 'h2' : 'h3'; }
const HEAT_AR = { h0:'قريب جدًا', h1:'قريب', h2:'بعيد', h3:'بعيد جدًا' };
function clean(w){ return String(w || '').toLowerCase().replace(/[^a-z]/g, ''); }
function same(g, ans){ return g === ans || g === ans + 's' || g + 's' === ans || g === ans + 'es'; }

const BETWEEN_MS = 7000;
function startRound(S){
  const p = S.pub, store = S.secret[S.n], L = LEVELS[p.level];
  let cats = CATS.map((c, i) => i).filter(i => !store.cats.includes(i)); if (!cats.length) { store.cats = []; cats = CATS.map((c, i) => i); }
  const ci = cats[Math.floor(Math.random() * cats.length)], cat = CATS[ci], list = cat[L.pool];
  const ans = list[Math.floor(Math.random() * list.length)];
  store.cats.push(ci); store.ans = ans;
  Object.assign(p, { phase:'play', deadline:S.now + p.time * 1000, cat:cat.en, catAr:cat.ar, ans:null,
    count:Array(S.n).fill(0), done:Array(S.n).fill(false), solvedOrder:[], gained:Array(S.n).fill(0), hintsUsed:Array(S.n).fill(0) });
  for (let i = 0; i < S.n; i++) S.secret[i] = { rows:[], hint:L.first ? ans[0] : '' };
}
function endRound(S){ const p = S.pub; p.phase = 'between'; p.ans = S.secret[S.n].ans; p.deadline = S.now + BETWEEN_MS; }

const css = `
.az-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.az-time{font-family:var(--display);font-size:21px;min-width:58px;height:58px;border-radius:50%;border:3px solid var(--ink);display:grid;place-items:center;background:var(--card);font-variant-numeric:tabular-nums}
.az-time.low{border-color:var(--stamp);color:var(--stamp)}
.az-cat{text-align:center}
.az-cat b{display:block;font-family:var(--display);font-size:30px;direction:ltr;line-height:1.1}
.az-cat span{font-size:13px;color:var(--muted)}
.az-meta{display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:14px;direction:ltr}
.az-list{display:flex;flex-direction:column;gap:6px;direction:ltr}
.az-row{display:flex;align-items:stretch;border-radius:9px;overflow:hidden;border:2px solid var(--ink);background:var(--card);min-height:46px;box-shadow:0 2px 0 var(--ink)}
.az-row .w{flex:1;padding:8px 12px;font-size:20px;font-weight:800;text-transform:capitalize;display:flex;align-items:center}
.az-row .d{min-width:110px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:800;font-size:18px;color:#fff;border-left:2px solid var(--ink)}
.az-row .d small{font-size:12px}
.az-row.new{animation:azpop .35s}
@keyframes azpop{from{transform:scale(.96);opacity:.3}}
.az-row.slot .w{color:var(--muted);letter-spacing:.15em}
.az-row.slot .d{background:#9b968a}
.az-row.win .w{color:#167a55}
.az-row.win .d{background:#167a55}
.az-row .d.h0{background:#2f9e5b} .az-row .d.h1{background:#d4a017} .az-row .d.h2{background:#e2771f} .az-row .d.h3{background:#c2410c}
.az-form{display:flex;gap:8px;direction:ltr}
.az-form input{flex:1;min-width:0;font-size:20px;direction:ltr;text-align:left}
.az-tools{display:flex;justify-content:space-between;align-items:center;gap:8px}
.az-hint{font-weight:800;direction:ltr;letter-spacing:.08em}
.az-msg{text-align:center;font-weight:800;min-height:1.5em}
.az-others{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.az-other{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px;font-weight:800;color:var(--pc)}
.az-dots{display:flex;gap:2px;direction:ltr}
.az-dots i{width:7px;height:7px;border-radius:50%;background:var(--grid)}
.az-dots i.u{background:var(--pc)}
.az-word{font-family:var(--display);font-size:40px;letter-spacing:.06em;text-transform:uppercase;direction:ltr;text-align:center}
`;
let styled = false;
function style(){ if (styled) return; styled = true; const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

let lastCtx = null, timerT = null, flash = '', newest = '';
function clock(){
  const el = document.getElementById('az-time'); if (!el) { clearInterval(timerT); return; }
  const ctx = lastCtx; if (!ctx) return;
  const left = ctx.pub.deadline ? Math.max(0, Math.ceil((ctx.pub.deadline - ctx.now()) / 1000)) : 0;
  el.textContent = ctx.pub.phase === 'end' ? '–' : left;
  el.classList.toggle('low', ctx.pub.phase === 'play' && left <= 15);
}
function submit(){
  const ctx = lastCtx; if (!ctx) return;
  const p = ctx.pub, me = ctx.me, inp = document.getElementById('az-in');
  if (p.phase !== 'play' || p.done[me]) return;
  const w = clean(inp.value);
  if (w.length < 2) { flash = 'اكتب كلمة إنجليزي'; return draw(ctx); }
  const rows = (ctx.priv && ctx.priv.rows) || [];
  if (rows.some(r => r.w === w)) { flash = 'جرّبتها قبل كده'; return draw(ctx); }
  newest = w; inp.value = ''; K.tick(560, .05);
  ctx.act({ t:'guess', w });
}

function draw(ctx){
  const root = document.getElementById('az-root'); if (!root) return;
  const p = ctx.pub, me = ctx.me, L = LEVELS[p.level], names = ctx.players.map(x => x.name);
  const priv = ctx.priv || {}, rows = priv.rows || [];
  const playing = p.phase === 'play' && !p.done[me];
  root.querySelector('#az-cat').innerHTML = p.cat ? `<b>${esc(p.cat)}</b><span>${esc(p.catAr)} · ${{ easy:'سهل', medium:'متوسط', hard:'صعب' }[p.level]}</span>` : '';
  root.querySelector('#az-left').textContent = `Guesses: ${rows.length}/${L.G}`;
  const solved = rows.some(r => r.d === 0);
  // alphabetical list with the answer slot in its place
  const items = rows.map(r => ({ ...r }));
  if (!solved) items.push({ slot:true });
  items.sort((a, b) => {
    if (a.slot) return b.dir === 'down' ? 1 : -1;
    if (b.slot) return a.dir === 'down' ? -1 : 1;
    return a.w < b.w ? -1 : a.w > b.w ? 1 : 0;
  });
  root.querySelector('#az-list').innerHTML = items.map(r => {
    if (r.slot) return `<div class="az-row slot"><div class="w">${p.ans ? esc(p.ans) : esc((priv.hint || '').toUpperCase()) + '…'}</div><div class="d">?</div></div>`;
    if (r.d === 0) return `<div class="az-row win${r.w === newest ? ' new' : ''}"><div class="w">${esc(r.w)}</div><div class="d">✓</div></div>`;
    const h = heat(r.d), arrow = r.dir === 'down' ? '▼' : '▲';
    return `<div class="az-row${r.w === newest ? ' new' : ''}"><div class="w">${esc(r.w)}</div><div class="d ${h}">${arrow} ${L.number ? r.d : `<small>${HEAT_AR[h]}</small>`}</div></div>`;
  }).join('') || '';
  const form = root.querySelector('#az-form'), tools = root.querySelector('#az-tools');
  form.hidden = !playing; tools.hidden = !playing;
  const hl = L.hints - (p.hintsUsed[me] || 0);
  const hb = root.querySelector('#az-hintbtn');
  hb.textContent = `اكشف حرف (${hl})`; hb.disabled = hl <= 0 || ctx.busy;
  root.querySelector('#az-hint').textContent = priv.hint ? `Starts with: ${priv.hint.toUpperCase()}…` : '';
  const rank = p.solvedOrder.indexOf(me);
  root.querySelector('#az-msg').textContent = flash || (p.phase !== 'play' ? '' : p.done[me] ? (rank >= 0 ? `حلّيتها! +${p.gained[me]}` : 'خلصت محاولاتك، استنى الباقي') : '');
  flash = '';
  root.querySelector('#az-others').innerHTML = ctx.players.map((x, i) => i === me ? '' :
    `<div class="az-other" style="--pc:${K.color(i)}"><div class="az-dots">${[...Array(L.G)].map((_, k) => `<i class="${k < (p.count[i] || 0) ? 'u' : ''}"></i>`).join('')}</div>${esc(x.name)}${p.solvedOrder.includes(i) ? ' ✓' : ''}</div>`).join('');
  const between = root.querySelector('#az-between');
  between.hidden = p.phase === 'play';
  if (p.phase === 'between') between.innerHTML = `<p class="muted" style="text-align:center">الكلمة كانت</p><div class="az-word">${esc(p.ans || '')}</div>${K.scores(ctx.players, p.points)}<p class="hint">الجولة ${p.round} من ${p.rounds}، الجاية بعد ثواني…</p>`;
  if (p.phase === 'end') {
    const order = p.points.map((v, i) => [i, v]).sort((a, b) => b[1] - a[1]);
    if (!ctx.local.celebrated) { ctx.local.celebrated = true; ctx.saveLocal(); if (order[0][0] === me) K.celebrate(); }
    between.innerHTML = `<h2 style="text-align:center">${order[0][0] === me ? 'انت الأول!' : `${esc(names[order[0][0]])} الأول!`}</h2>${p.ans ? `<div class="az-word">${esc(p.ans)}</div>` : ''}${K.scores(ctx.players, p.points)}
      ${ctx.isHost ? '<div class="row"><button class="stamp" data-again>العب تاني</button><button class="ghost" data-lobby>رجوع للأوضة</button></div>' : '<p class="hint">صاحب الأوضة هيبدأ اللي بعده.</p>'}`;
    between.querySelector('[data-again]')?.addEventListener('click', () => ctx.again());
    between.querySelector('[data-lobby]')?.addEventListener('click', () => ctx.toLobby());
  }
  root.querySelector('#az-round').textContent = p.phase === 'end' ? 'خلصت' : `جولة ${p.round} من ${p.rounds}`;
  clock();
}

Lamma.register({
  id:'alpha', icon:'↕', name:'A to Z', blurb:'خمّن الكلمة من الفئة، وكل تخمين يقولك هي قبله ولا بعده في الأبجدية وبعيدة قد إيه.', min:1, max:8,
  settings:[
    { key:'level', label:'المستوى', def:'medium', options:[{ v:'easy', label:'سهل' }, { v:'medium', label:'متوسط' }, { v:'hard', label:'صعب' }] },
    { key:'rounds', label:'عدد الكلمات', def:3, options:[{ v:1, label:'كلمة' }, { v:3, label:'3 كلمات' }, { v:5, label:'5 كلمات' }] },
    { key:'time', label:'وقت كل كلمة', def:150, options:[{ v:90, label:'دقيقة ونص' }, { v:150, label:'دقيقتين ونص' }, { v:240, label:'4 دقايق' }] },
  ],
  init(n, prev, set){ return { phase:'play', round:1, rounds:+set.rounds || 3, time:+set.time || 150, level:LEVELS[set.level] ? set.level : 'medium', deadline:0, points:Array(n).fill(0), count:[], done:[], solvedOrder:[], gained:[], hintsUsed:[] }; },
  secrets(pub, n){ const S = { pub, n, now:Date.now(), secret:[...Array(n).fill(null), { cats:[], ans:null }] }; startRound(S); return S.secret; },
  tick(S){
    const p = S.pub;
    if (p.phase === 'end' || S.now < p.deadline) return false;
    if (p.phase === 'play') endRound(S);
    else if (p.round >= p.rounds) { p.phase = 'end'; p.deadline = 0; }
    else { p.round++; startRound(S); }
    return true;
  },
  act(S, seat, a){
    const p = S.pub, ans = S.secret[S.n].ans, mine = S.secret[seat], L = LEVELS[p.level];
    if (p.phase !== 'play' || p.done[seat]) return;
    if (a.t === 'hint') {
      if (p.hintsUsed[seat] >= L.hints || mine.hint.length >= ans.length - 1) return;
      p.hintsUsed[seat]++; mine.hint = ans.slice(0, mine.hint.length + 1); return;
    }
    if (a.t !== 'guess') return;
    const w = clean(a.w);
    if (w.length < 2 || w.length > 24 || mine.rows.some(r => r.w === w)) return;
    if (same(w, ans)) {
      mine.rows.push({ w:ans, d:0 });
      const k = mine.rows.length;
      const pts = Math.max(10, Math.round(50 + 70 * (L.G - k) / (L.G - 1)) + ([30, 20, 10][p.solvedOrder.length] || 0) - 15 * p.hintsUsed[seat]);
      p.solvedOrder.push(seat); p.points[seat] += pts; p.gained[seat] = pts; p.done[seat] = true;
    } else {
      mine.rows.push({ w, d:distance(w, ans), dir:w < ans ? 'down' : 'up' });
      if (mine.rows.length >= L.G) p.done[seat] = true;
    }
    p.count[seat] = mine.rows.length;
    if (p.done.every(Boolean)) endRound(S);
  },
  render(root, ctx){
    style(); lastCtx = ctx;
    if (!root.querySelector('#az-root')) {
      root.innerHTML = `<div id="az-root" class="game-root">
        <div class="az-head"><span class="muted" id="az-round"></span><div class="az-cat" id="az-cat"></div><div class="az-time" id="az-time">–</div></div>
        <div class="az-others" id="az-others"></div>
        <div class="az-meta"><span id="az-left"></span><span class="muted">A → Z</span></div>
        <div class="az-list" id="az-list"></div>
        <p class="az-msg" id="az-msg"></p>
        <form class="az-form" id="az-form" autocomplete="off"><input id="az-in" maxlength="24" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type a word" aria-label="Your guess"><button class="stamp" type="submit">خمّن</button></form>
        <div class="az-tools" id="az-tools"><span class="az-hint" id="az-hint"></span><button type="button" class="ghost" id="az-hintbtn"></button></div>
        <div id="az-between" class="game-root" hidden></div></div>`;
      root.querySelector('#az-form').addEventListener('submit', e => { e.preventDefault(); submit(); });
      root.querySelector('#az-hintbtn').addEventListener('click', () => { const c = lastCtx; if (c && !c.busy) { c.act({ t:'hint' }); K.tick(420, .05); } });
      clearInterval(timerT); timerT = setInterval(clock, 250);
      newest = '';
    }
    const rowsNow = (ctx.priv && ctx.priv.rows) || [];
    if (ctx.local.rowsSeen !== undefined && rowsNow.length > ctx.local.rowsSeen && rowsNow[rowsNow.length - 1].d === 0) { K.tick(880, .08); K.celebrate(); }
    ctx.local.rowsSeen = ctx.pub.phase === 'play' ? rowsNow.length : 0;
    draw(ctx);
  },
});

if (typeof module !== 'undefined') module.exports = { pos, distance, CATS };
})();
