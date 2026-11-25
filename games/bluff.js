/* فِشَر / Fake It — Arabic or English, chosen in the lobby — the bluffing game, 3–8 players.

   Before each question, one player (taking turns) picks the category. The question is a
   strange-but-true fact with a blank. Everyone writes a believable fake answer — once sent it
   can't be changed, and if you type the real answer you're told you're right but must write a
   fake instead. Then all the fakes and the real answer are shuffled and everyone votes for the
   one they think is true. Numbers match however they're written: 2, ٢, two, اتنين, اثنين, اثنان.
     +100 for picking the real answer
     +50 for every player your fake fooled
   The room creator sets the number of questions and the writing time. */
(function(){
const K = Lamma, esc = K.esc;

const EN = [
  { id:'animals', title:'Animals', qs:[
    ['An octopus has ___ hearts.', 'three'],
    ['Honey bees show each other where flowers are by doing a ___.', 'waggle dance'],
    ['Wombat poop is shaped like ___.', 'cubes'],
    ['Sea otters hold ___ while they sleep so they don\'t drift apart.', 'hands'],
    ['A snail can sleep for up to ___.', 'three years'],
    ['Butterflies taste food with their ___.', 'feet'],
    ['A lobster\'s blood is ___.', 'blue'],
    ['A blue whale\'s heart is about the size of a ___.', 'small car'],
    ['Pigeons can recognise themselves in a ___.', 'mirror'],
    ['Koalas have fingerprints that are almost identical to ___.', 'humans'],
    ['Rats laugh when they are ___.', 'tickled'],
    ['Crows can remember human ___.', 'faces'],
    ['Under its white fur, a polar bear\'s skin is ___.', 'black'],
    ['An ostrich\'s eye is bigger than its ___.', 'brain'],
    ['A shrimp\'s heart is in its ___.', 'head'],
    ['Dolphins sleep with ___ of their brain awake.', 'half'],
    ['A giraffe\'s tongue is ___ in colour.', 'dark blue'],
    ['A camel\'s hump stores ___.', 'fat'],
  ] },
  { id:'words', title:'Words and names', qs:[
    ['The national animal of Scotland is the ___.', 'unicorn'],
    ['A group of flamingos is called a ___.', 'flamboyance'],
    ['A group of crows is called a ___.', 'murder'],
    ['A group of owls is called a ___.', 'parliament'],
    ['A group of ravens is called an ___.', 'unkindness'],
    ['The dot over a lowercase "i" is called a ___.', 'tittle'],
    ['The plastic tip at the end of a shoelace is called an ___.', 'aglet'],
    ['A baby kangaroo is called a ___.', 'joey'],
    ['A "jiffy" is an actual unit of ___.', 'time'],
    ['When hot water freezes faster than cold water, it is called the ___ effect.', 'mpemba'],
    ['A googol is the number 1 followed by ___ zeros.', '100'],
    ['The Hawaiian alphabet has only ___ letters.', '13'],
  ] },
  { id:'science', title:'Science and nature', qs:[
    ['Botanically speaking, bananas are ___.', 'berries'],
    ['The Eiffel Tower grows about 15 cm taller in the ___.', 'summer'],
    ['A day on Venus is longer than a ___ on Venus.', 'year'],
    ['Peanuts are not nuts, they are ___.', 'legumes'],
    ['Strawberries are the only fruit with their seeds on the ___.', 'outside'],
    ['Sharks existed on Earth before ___.', 'trees'],
    ['The largest desert in the world is ___.', 'antarctica'],
    ['Measured from base to peak, the tallest mountain on Earth is ___.', 'mauna kea'],
    ['The largest organ of the human body is the ___.', 'skin'],
    ['An adult human body has ___ bones.', '206'],
  ] },
  { id:'history', title:'History and brands', qs:[
    ['The shortest war in history, Britain vs Zanzibar, lasted about ___.', '38 minutes'],
    ['The man who designed the Pringles can was buried in ___.', 'a pringles can'],
    ['Canada\'s national summer sport is ___.', 'lacrosse'],
    ['The most expensive spice in the world by weight is ___.', 'saffron'],
    ['Cleopatra lived closer in time to the ___ than to the building of the Great Pyramid.', 'moon landing'],
    ['Oxford University is older than the ___ Empire.', 'aztec'],
    ['Nintendo started in 1889 as a company making ___.', 'playing cards'],
    ['Coca-Cola was first sold as a ___.', 'medicine'],
    ['The Mona Lisa has no ___.', 'eyebrows'],
    ['There is a town in Norway called ___.', 'hell'],
  ] },
];
const AR = [
  { id:'land', title:'حيوانات', qs:[
    ['الفراشة بتدوق الأكل بـ ___', 'رجليها'],
    ['جلد الدب القطبي تحت الفرو لونه ___', 'أسود'],
    ['الحلزونة ممكن تنام لحد ___', '3 سنين'],
    ['الفيران بتضحك لما ___', 'حد يزغزغها'],
    ['بصمات الكوالا شبه بصمات ___', 'الإنسان'],
    ['الجمل بيخزن في سنامه ___', 'دهون'],
    ['النحل بيعرّف بعضه مكان الورد عن طريق ___', 'الرقص'],
    ['لسان الزرافة لونه ___', 'أزرق غامق'],
    ['عين النعامة أكبر من ___', 'مخها'],
    ['ابن الكنغر الصغير اسمه ___', 'جوي'],
    ['أغلب الأسود بتنام حوالي ___ ساعة في اليوم', '20'],
    ['الفيل هو الحيوان الوحيد اللي مايقدرش ___', 'ينط'],
  ] },
  { id:'sea', title:'بحر وطيور', qs:[
    ['الأخطبوط عنده ___ قلوب', 'تلاتة'],
    ['دم الاستاكوزا لونه ___', 'أزرق'],
    ['سمك القرش كان موجود على الأرض قبل ___', 'الشجر'],
    ['قلب الحوت الأزرق حجمه قد ___', 'عربية صغيرة'],
    ['الغراب بيفتكر ___ الناس', 'وشوش'],
    ['الحمام يقدر يعرف نفسه في ___', 'المراية'],
    ['قلب الجمبري موجود في ___', 'راسه'],
    ['الدولفين بينام وهو ___ مخه صاحي', 'نص'],
    ['ثعالب البحر بتمسك ___ وهي نايمة عشان ماتبعدش عن بعض', 'إيدين بعض'],
    ['البطريق الذكر بيقدّم للأنثى ___ عشان يخطبها', 'حصوة'],
    ['السلحفاة البحرية بتعيط عشان تطلّع ___ من جسمها', 'الملح'],
  ] },
  { id:'history', title:'تاريخ وشركات', qs:[
    ['أقصر حرب في التاريخ، بين بريطانيا وزنجبار، استمرت حوالي ___', '38 دقيقة'],
    ['كليوباترا عاشت أقرب لزمن ___ من زمن بناء الهرم الأكبر', 'نزول الإنسان على القمر'],
    ['شركة نينتندو بدأت سنة 1889 بتعمل ___', 'كوتشينة'],
    ['الكوكاكولا اتباعت في الأول على إنها ___', 'دوا'],
    ['الموناليزا مالهاش ___', 'حواجب'],
    ['اللي صمم علبة البرينجلز اتدفن في ___', 'علبة برينجلز'],
    ['جامعة أكسفورد أقدم من إمبراطورية ___', 'الأزتك'],
    ['أول فيلم مصري ناطق كان اسمه ___', 'أولاد الذوات'],
    ['شركة نوكيا في الأول كانت بتعمل ___', 'ورق'],
    ['الكلمة الإنجليزي "salary" (مرتب) جاية من كلمة ___', 'ملح'],
  ] },
  { id:'science', title:'علوم وطبيعة', qs:[
    ['الفول السوداني مش مكسرات، ده من ___', 'البقوليات'],
    ['اليوم على كوكب الزهرة أطول من ___ عليه', 'السنة'],
    ['برج إيفل بيطول حوالي 15 سم في ___', 'الصيف'],
    ['عدد عضم جسم الإنسان البالغ ___', '206'],
    ['الفراولة هي الفاكهة الوحيدة اللي بذورها ___', 'برة'],
    ['أكبر عضو في جسم الإنسان هو ___', 'الجلد'],
    ['الموز علمياً يعتبر من ___', 'التوت'],
    ['الأناناس بياخد حوالي ___ عشان يطلع', 'سنتين'],
  ] },
  { id:'world', title:'بلاد وغرايب', qs:[
    ['الحيوان الوطني لاسكتلندا هو ___', 'اليونيكورن'],
    ['أغلى بهار في العالم بالوزن هو ___', 'الزعفران'],
    ['عاصمة أستراليا هي ___', 'كانبرا'],
    ['أكبر صحرا في العالم هي ___', 'القارة القطبية الجنوبية'],
    ['فيه بلد في النرويج اسمها ___', 'الجحيم'],
    ['جماعة الغربان بالإنجليزي اسمها murder يعني ___', 'جريمة قتل'],
    ['النقطة اللي فوق حرف i بالإنجليزي اسمها ___', 'tittle'],
    ['الطرف البلاستيك اللي في آخر رباط الجزمة اسمه ___', 'aglet'],
    ['أطول نهر في العالم حسب أغلب المصادر هو ___', 'النيل'],
  ] },
];

/* Number words → digits, so "اتنين", "اثنين", "اثنان", "٢", "2" and "two" all count as the same answer.
   Runs of number words are added up: "تمانية وتلاتين" → 38, "two hundred six" → 206. */
const AR_SIMPLE = s => s.replace(/[ً-ْٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
const NUM_WORDS = {};
[[0, 'zero صفر'], [1, 'one واحد واحدة'], [2, 'two اتنين اثنين اثنان إثنين اتنان تنين'], [3, 'three تلاتة ثلاثة تلات ثلاث'],
 [4, 'four أربعة اربعة أربع اربع'], [5, 'five خمسة خمس'], [6, 'six ستة'], [7, 'seven سبعة'], [8, 'eight تمانية ثمانية ثمان ثماني تماني'],
 [9, 'nine تسعة تسع'], [10, 'ten عشرة عشر'], [11, 'eleven حداشر احداشر'], [12, 'twelve اتناشر اثناشر'], [13, 'thirteen تلتاشر'],
 [14, 'fourteen اربعتاشر'], [15, 'fifteen خمستاشر'], [16, 'sixteen ستاشر'], [17, 'seventeen سبعتاشر'], [18, 'eighteen تمنتاشر'],
 [19, 'nineteen تسعتاشر'], [20, 'twenty عشرين عشرون'], [30, 'thirty تلاتين ثلاثين ثلاثون'], [40, 'forty أربعين أربعون'],
 [50, 'fifty خمسين خمسون'], [60, 'sixty ستين ستون'], [70, 'seventy سبعين سبعون'], [80, 'eighty تمانين ثمانين ثمانون'],
 [90, 'ninety تسعين تسعون'], [100, 'hundred مية مائة مئة'], [200, 'ميتين مئتين مائتين مئتان'], [1000, 'thousand ألف'], [2000, 'ألفين']]
  .forEach(([v, words]) => words.split(' ').forEach(w => { NUM_WORDS[AR_SIMPLE(w)] = v; }));
function numWord(t){
  if (/^\d+$/.test(t)) return +t;
  for (const c of [t, t.replace(/^و(?=.)/, ''), t.replace(/^ال(?=..)/, ''), t.replace(/^وال(?=..)/, '')]) if (NUM_WORDS[c] != null) return NUM_WORDS[c];
  return null;
}
function numCanon(text){
  const toks = AR_SIMPLE(String(text || '').toLowerCase()).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[-,،]/g, ' ').split(/\s+/).filter(Boolean);
  const out = []; let total = 0, cur = 0, inNum = false;
  const flush = () => { if (inNum) out.push(String(total + cur)); total = cur = 0; inNum = false; };
  for (const t of toks) {
    if ((t === 'and' || t === 'و') && inNum) continue;
    const v = numWord(t);
    if (v == null) { flush(); out.push(t); continue; }
    inNum = true;
    if (v === 100 && cur) cur *= 100;
    else if (v === 1000 && (total || cur)) { total = (total + cur) * 1000; cur = 0; }
    else cur += v;
  }
  flush();
  return out.join(' ');
}
const normEN = s => numCanon(s).replace(/^(a|an|the)\s+/, '').replace(/[^a-z0-9]/g, '');
const normAR = s => numCanon(s).replace(/(^|\s)ال/g, '$1').replace(/[^ء-يa-z0-9]/g, '');
const REVEAL_MS = 9000;

function makeGame(cfg){
  const { id, cat, name, icon, blurb, langs } = cfg;
  let bank, norm, T;
  const use = p => (({ bank, norm, T } = langs[p && p.lang === 'en' ? 'en' : 'ar']), p);

  const PICK_MS = 15000;
  const left = (store, c) => c.qs.map((_, i) => c.id + ':' + i).filter(k => !store.used.includes(k));
  function startPick(S){
    const p = use(S.pub), store = S.secret[S.n];
    if (!bank.some(c => left(store, c).length)) store.used = [];
    p.phase = 'pick'; p.picker = (p.qn - 1) % S.n; p.q = ''; p.catTitle = '';
    p.cats = bank.filter(c => left(store, c).length).map(c => ({ id:c.id, title:c.title, n:left(store, c).length }));
    p.deadline = S.now + PICK_MS; p.wrote = Array(S.n).fill(false); p.voted = Array(S.n).fill(false); p.options = null; p.reveal = null;
    for (let i = 0; i < S.n; i++) S.secret[i] = null;
  }
  function startQ(S, catId){
    const p = use(S.pub), store = S.secret[S.n];
    const cat = bank.find(c => c.id === catId && left(store, c).length) || bank.find(c => p.cats.some(x => x.id === c.id) && left(store, c).length);
    const pool = left(store, cat), key = pool[Math.floor(Math.random() * pool.length)];
    store.used.push(key); store.cur = cat.qs[+key.split(':')[1]]; store.lies = {};
    p.phase = 'write'; p.q = store.cur[0]; p.catTitle = cat.title; p.cats = null; p.deadline = S.now + p.time * 1000;
    p.wrote = Array(S.n).fill(false); p.voted = Array(S.n).fill(false); p.options = null; p.reveal = null;
    for (let i = 0; i < S.n; i++) S.secret[i] = null;
  }
  function startVote(S){
    const p = use(S.pub), store = S.secret[S.n], truth = store.cur[1];
    const opts = [{ text:truth, by:[], truth:true }];
    Object.entries(store.lies).forEach(([seat, text]) => {
      const same = opts.find(o => !o.truth && norm(o.text) === norm(text));
      if (same) same.by.push(+seat); else opts.push({ text, by:[+seat], truth:false });
    });
    const shuffled = K.shuffle(opts).map((o, i) => Object.assign(o, { id:i }));
    store.opts = shuffled; store.votes = {};
    p.options = shuffled.map(o => ({ id:o.id, text:o.text }));
    p.phase = 'vote'; p.deadline = S.now + Math.max(25, Math.round(p.time * .6)) * 1000;
    for (let i = 0; i < S.n; i++) { const own = shuffled.find(o => o.by.includes(i)); S.secret[i] = { own: own ? own.id : null }; }
  }
  function doReveal(S){
    const p = use(S.pub), store = S.secret[S.n];
    const gained = Array(S.n).fill(0);
    Object.entries(store.votes).forEach(([seat, oid]) => {
      const o = store.opts.find(x => x.id === oid); if (!o) return;
      if (o.truth) gained[seat] += 100;
      else o.by.forEach(b => { if (b !== +seat) gained[b] += 50; });
    });
    gained.forEach((g, i) => p.points[i] += g);
    p.reveal = { opts: store.opts.map(o => ({ id:o.id, text:o.text, by:o.by, truth:o.truth, voters:Object.keys(store.votes).filter(s => store.votes[s] === o.id).map(Number) })), gained };
    p.phase = 'reveal'; p.deadline = S.now + REVEAL_MS;
  }

  const view = { key:'', lastCtx:null, timer:null };
  function clock(){
    const el = document.getElementById('bf-time'); if (!el) { clearInterval(view.timer); return; }
    const ctx = view.lastCtx; if (!ctx) return;
    const left = ctx.pub.deadline ? Math.max(0, Math.ceil((ctx.pub.deadline - ctx.now()) / 1000)) : 0;
    el.textContent = ctx.pub.phase === 'end' ? '–' : left;
    el.classList.toggle('low', left <= 10 && ctx.pub.phase !== 'end');
  }
  function question(q){ return esc(q).replace('___', '<span class="bf-blank">_____</span>'); }

  Lamma.register({
    id, cat, icon, name, blurb, min:3, max:8,
    settings:[
      { key:'lang', label:'اللغة', def:'ar', options:[{ v:'ar', label:'عربي' }, { v:'en', label:'English' }] },
      { key:'count', label:'عدد الأسئلة', def:8, options:[{ v:5, label:'5' }, { v:8, label:'8' }, { v:12, label:'12' }] },
      { key:'time', label:'وقت الكتابة', def:60, options:[{ v:45, label:'45 ثانية' }, { v:60, label:'60 ثانية' }, { v:90, label:'90 ثانية' }] },
    ],
    init(n, prev, set){ return { lang:set.lang === 'en' ? 'en' : 'ar', phase:'pick', picker:0, cats:null, catTitle:'', qn:1, count:+set.count || 8, time:+set.time || 60, q:'', deadline:0, points:Array(n).fill(0), wrote:[], voted:[], options:null, reveal:null }; },
    secrets(pub, n){ const S = { pub, n, now:Date.now(), secret:[...Array(n).fill(null), { used:[], lies:{} }] }; startPick(S); return S.secret; },
    tick(S){
      const p = use(S.pub);
      if (p.phase === 'end' || S.now < p.deadline) return false;
      if (p.phase === 'pick') { const c = p.cats[Math.floor(Math.random() * p.cats.length)]; startQ(S, c.id); }
      else if (p.phase === 'write') startVote(S);
      else if (p.phase === 'vote') doReveal(S);
      else if (p.qn >= p.count) { p.phase = 'end'; p.deadline = 0; }
      else { p.qn++; startPick(S); }
      return true;
    },
    act(S, seat, a){
      const p = use(S.pub), store = S.secret[S.n];
      if (a.t === 'cat' && p.phase === 'pick' && seat === p.picker && p.cats.some(c => c.id === a.id)) { startQ(S, a.id); return; }
      if (a.t === 'lie' && p.phase === 'write' && !p.wrote[seat] && typeof a.text === 'string') {
        const text = a.text.trim().slice(0, 60);
        if (!text) return;
        if (norm(text) === norm(store.cur[1])) { S.secret[seat] = { truthHit:Date.now() }; return; }
        store.lies[seat] = text; p.wrote[seat] = true; S.secret[seat] = { mine:text };
        if (p.wrote.every(Boolean)) startVote(S);
      }
      if (a.t === 'vote' && p.phase === 'vote' && Number.isInteger(a.id)) {
        const o = store.opts.find(x => x.id === a.id);
        if (!o || o.by.includes(seat)) return;
        store.votes[seat] = a.id; p.voted[seat] = true;
        if (p.voted.every(Boolean)) doReveal(S);
      }
      if (a.t === 'skip' && seat === S.hostSeat) S.pub.deadline = S.now;
    },
    render(root, ctx){
      style(); view.lastCtx = ctx;
      const p = use(ctx.pub), me = ctx.me, names = ctx.players.map(x => x.name), priv = ctx.priv || {};
      const key = p.phase + ':' + p.qn;
      const fresh = view.key !== key || !root.querySelector('#bf-root');
      if (fresh) {
        view.key = key;
        root.innerHTML = `<div id="bf-root" class="game-root" dir="${T.dir}">
          <div class="bf-head"><span class="muted" dir="rtl">${p.phase === 'end' ? 'خلصت' : `سؤال ${p.qn} من ${p.count}`}</span><div class="bf-time" id="bf-time">–</div></div>
          <div id="bf-chips" dir="rtl"></div>
          ${p.catTitle && p.phase !== 'end' ? `<div class="bf-cat">${esc(p.catTitle)}</div>` : ''}
          ${p.phase === 'end' || p.phase === 'pick' ? '' : `<div class="bf-q">${question(p.q)}</div>`}
          <div id="bf-body"></div></div>`;
        clearInterval(view.timer); view.timer = setInterval(clock, 250);
      }
      const chips = root.querySelector('#bf-chips');
      chips.innerHTML = K.chips(ctx.players.map((x, i) => ({ name:x.name + ((p.phase === 'write' && p.wrote[i]) || (p.phase === 'vote' && p.voted[i]) ? ' ✓' : ''), seat:i, online:ctx.online(i), extra:p.points[i] })));
      const body = root.querySelector('#bf-body');

      if (p.phase === 'pick') {
        const mine = p.picker === me;
        body.innerHTML = `<p class="bf-pickhead" dir="rtl">${mine ? 'دورك! اختار فئة السؤال' : `${esc(names[p.picker] || '')} بيختار فئة السؤال…`}</p>
          <div class="bf-cats">${p.cats.map(c => `<button class="bf-catbtn" data-cat="${c.id}" ${mine && !ctx.busy ? '' : 'disabled'}>${esc(c.title)}<small>${c.n} ${p.lang === 'en' ? 'left' : 'باقي'}</small></button>`).join('')}</div>`;
        if (mine) body.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { ctx.act({ t:'cat', id:b.dataset.cat }); K.tick(700, .05); body.querySelectorAll('[data-cat]').forEach(x => x.disabled = true); });
      }
      else if (p.phase === 'write') {
        if (fresh) {
          body.innerHTML = `<form class="bf-form" id="bf-form"><input id="bf-in" maxlength="60" autocomplete="off" placeholder="${esc(T.placeholder)}"><button class="stamp">${esc(T.send)}</button></form>
            <p class="bf-note" id="bf-note"></p>`;
          const f = body.querySelector('#bf-form'), inp = body.querySelector('#bf-in'), btn = f.querySelector('button');
          f.addEventListener('submit', e => { e.preventDefault(); const v = inp.value.trim(); if (!v || inp.disabled) return; inp.disabled = btn.disabled = true; view.lastCtx.act({ t:'lie', text:v }); K.tick(600, .05); });
          setTimeout(() => inp.focus(), 50);
        }
        const note = body.querySelector('#bf-note');
        const form = body.querySelector('#bf-form'), inp = body.querySelector('#bf-in');
        if (priv.mine) { form.hidden = true; note.textContent = `${T.yours}: ${priv.mine} 🔒`; note.className = 'bf-note ok'; }
        else if (priv.truthHit && priv.truthHit !== view.hit) {
          view.hit = priv.truthHit; note.textContent = T.truthHit; note.className = 'bf-note good'; K.buzz(60);
          inp.disabled = form.querySelector('button').disabled = false; inp.select(); inp.focus();
        }
      }
      else if (p.phase === 'vote') {
        const myVote = ctx.local.vote && ctx.local.vote.k === key ? ctx.local.vote.id : null;
        body.innerHTML = `<p class="hint" dir="rtl">${p.voted[me] || myVote != null ? 'استنى الباقي يصوّتوا…' : T.pick}</p>
          <div class="bf-opts">${p.options.map(o => {
            const own = priv.own === o.id;
            return `<button class="bf-opt${own ? ' own' : ''}${myVote === o.id ? ' picked' : ''}" data-id="${o.id}" ${own || p.voted[me] || myVote != null ? 'disabled' : ''}>${esc(o.text)}${own ? ` <small>(${esc(T.yours)})</small>` : ''}</button>`; }).join('')}</div>`;
        body.querySelectorAll('.bf-opt:not([disabled])').forEach(b => b.onclick = () => { ctx.local.vote = { k:key, id:+b.dataset.id }; ctx.saveLocal(); ctx.act({ t:'vote', id:+b.dataset.id }); K.tick(650, .05); ctx.rerender(); });
      }
      else if (p.phase === 'reveal') {
        const r = p.reveal;
        if (fresh) K.tick(r.gained[me] ? 880 : 400, .1);
        body.innerHTML = `<div class="bf-opts">${r.opts.slice().sort((a, b) => b.truth - a.truth).map(o => `
          <div class="bf-rev${o.truth ? ' truth' : ''}">
            <b>${esc(o.text)}</b>
            <small dir="rtl">${o.truth ? 'ده الصح ✓' : `كدبة ${o.by.map(s => esc(names[s])).join(' و ')}`}${o.voters.length ? ` · اختاروها: ${o.voters.map(s => esc(names[s])).join('، ')}` : ''}</small>
          </div>`).join('')}</div>
          <div class="bf-gain" dir="rtl">${r.gained.map((g, i) => g ? `<span class="chip" style="--pc:${K.color(i)}">${esc(names[i])} +${g}</span>` : '').join(' ')}</div>`;
      }
      else {
        const rank = p.points.map((v, i) => [i, v]).sort((a, b) => b[1] - a[1]);
        if (!ctx.local.celebrated) { ctx.local.celebrated = true; ctx.saveLocal(); if (rank[0][0] === me) K.celebrate(); }
        body.innerHTML = `<div dir="rtl" class="game-root"><h2 style="text-align:center">${rank[0][0] === me ? 'انت أشطر واحد بيفشر!' : `${esc(names[rank[0][0]])} الأول!`}</h2>${K.scores(ctx.players, p.points)}
          ${ctx.isHost ? '<div class="row"><button class="stamp" data-again>العب تاني</button><button class="ghost" data-lobby>رجوع للأوضة</button></div>' : '<p class="hint">صاحب الأوضة هيبدأ اللي بعده.</p>'}</div>`;
        body.querySelector('[data-again]')?.addEventListener('click', () => ctx.again());
        body.querySelector('[data-lobby]')?.addEventListener('click', () => ctx.toLobby());
      }
      let sk = root.querySelector('#bf-skip');
      const lagging = (p.phase === 'pick' && !ctx.online(p.picker)) || (p.phase === 'write' && p.wrote.some((w, i) => !w && !ctx.online(i))) || (p.phase === 'vote' && p.voted.some((v, i) => !v && !ctx.online(i)));
      if (ctx.isHost && lagging && !sk) { sk = document.createElement('button'); sk.id = 'bf-skip'; sk.className = 'ghost'; sk.textContent = 'كمّلوا من غير اللي فصل'; sk.onclick = () => ctx.act({ t:'skip' }); root.querySelector('#bf-root').appendChild(sk); }
      if (sk && !lagging) sk.remove();
      clock();
    },
  });
}

const css = `
.bf-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.bf-time{font-family:var(--display);font-size:24px;min-width:52px;height:52px;border-radius:50%;border:3px solid var(--ink);display:grid;place-items:center;background:var(--card);font-variant-numeric:tabular-nums;flex:none}
.bf-time.low{border-color:var(--stamp);color:var(--stamp)}
.bf-q{font-family:var(--display);font-size:clamp(22px,6.4vw,30px);line-height:1.35;background:var(--card);border:3px solid var(--ink);border-radius:16px;box-shadow:4px 5px 0 var(--ink);padding:16px;text-wrap:balance}
.bf-blank{color:var(--stamp);white-space:nowrap}
.bf-form{display:flex;gap:8px}
.bf-form button{flex:none}
.bf-note{font-weight:700;text-align:center;min-height:1.5em}
.bf-note.ok{color:var(--ok)} .bf-note.bad{color:var(--stamp)}
.bf-note.good{color:#fff;background:var(--ok);border-radius:10px;padding:8px 10px}
.bf-cat{align-self:center;font-weight:800;font-size:14px;border:2px solid var(--ink);border-radius:999px;padding:2px 12px;background:var(--card)}
.bf-pickhead{text-align:center;font-family:var(--display);font-size:22px}
.bf-cats{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.bf-catbtn{display:flex;flex-direction:column;gap:2px;align-items:center;min-height:74px;font-size:18px;background:var(--card);color:var(--ink);border:2.5px solid var(--ink);box-shadow:3px 4px 0 var(--ink)}
.bf-catbtn small{font-size:12px;color:var(--muted);font-weight:700}
.bf-catbtn:disabled{opacity:.75;box-shadow:none}
.bf-opts{display:flex;flex-direction:column;gap:8px}
.bf-opt{background:var(--card);color:var(--ink);border:2.5px solid var(--ink);box-shadow:3px 4px 0 var(--ink);text-align:start;font-size:18px}
.bf-opt.own{opacity:.5;box-shadow:none;border-style:dashed}
.bf-opt.picked{background:var(--ink);color:var(--paper)}
.bf-opt:disabled{cursor:default}
.bf-rev{background:var(--card);border:2px solid var(--grid);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px}
.bf-rev b{font-size:18px}
.bf-rev small{color:var(--muted);font-weight:600}
.bf-rev.truth{border:3px solid var(--ok);background:color-mix(in srgb,var(--ok) 8%,var(--card))}
.bf-gain{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
`;
let styled = false;
function style(){ if (styled) return; styled = true; const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

makeGame({ id:'fesher', cat:'en', name:'فِشَر', icon:'ف', blurb:'افشر إجابة تصدّقها الناس، ودوّر على الإجابة الصح. عربي أو English.',
  langs:{
    en:{ bank:EN, norm:normEN, T:{ dir:'ltr', placeholder:'Write a believable fake answer', send:'Send', truthHit:'You are right, that is the real answer! But you must change it: write a fake one.', yours:'Your fake', pick:'Which one is the real answer?' } },
    ar:{ bank:AR, norm:normAR, T:{ dir:'rtl', placeholder:'اكتب إجابة كدب تتصدّق', send:'ابعت', truthHit:'إجابتك صح! بس لازم تغيّرها: اكتب إجابة كدب.', yours:'فشرتك', pick:'أنهي واحدة الإجابة الصح؟' } },
  } });
})();
