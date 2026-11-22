/* Fake It (English) and فِشَر (Arabic) — the bluffing game, 3–8 players.

   Each question is a strange-but-true fact with a blank. Everyone writes a believable fake
   answer; then all the fakes and the real answer are shuffled and everyone votes for the
   one they think is true.
     +100 for picking the real answer
     +50 for every player your fake fooled
   The room creator sets the number of questions and the writing time. */
(function(){
const K = Lamma, esc = K.esc;

const EN = [
  ['The national animal of Scotland is the ___.', 'unicorn'],
  ['A group of flamingos is called a ___.', 'flamboyance'],
  ['A group of crows is called a ___.', 'murder'],
  ['A group of owls is called a ___.', 'parliament'],
  ['A group of ravens is called an ___.', 'unkindness'],
  ['An octopus has ___ hearts.', 'three'],
  ['Botanically speaking, bananas are ___.', 'berries'],
  ['The dot over a lowercase "i" is called a ___.', 'tittle'],
  ['The plastic tip at the end of a shoelace is called an ___.', 'aglet'],
  ['A baby kangaroo is called a ___.', 'joey'],
  ['Honey bees show each other where flowers are by doing a ___.', 'waggle dance'],
  ['Wombat poop is shaped like ___.', 'cubes'],
  ['The Eiffel Tower grows about 15 cm taller in the ___.', 'summer'],
  ['A "jiffy" is an actual unit of ___.', 'time'],
  ['Sea otters hold ___ while they sleep so they don\'t drift apart.', 'hands'],
  ['The shortest war in history, Britain vs Zanzibar, lasted about ___.', '38 minutes'],
  ['A snail can sleep for up to ___.', 'three years'],
  ['The man who designed the Pringles can was buried in ___.', 'a pringles can'],
  ['A day on Venus is longer than a ___ on Venus.', 'year'],
  ['When hot water freezes faster than cold water, it is called the ___ effect.', 'mpemba'],
  ['Canada\'s national summer sport is ___.', 'lacrosse'],
  ['Peanuts are not nuts, they are ___.', 'legumes'],
  ['The most expensive spice in the world by weight is ___.', 'saffron'],
  ['Strawberries are the only fruit with their seeds on the ___.', 'outside'],
  ['Butterflies taste food with their ___.', 'feet'],
  ['Sharks existed on Earth before ___.', 'trees'],
  ['A lobster\'s blood is ___.', 'blue'],
  ['Cleopatra lived closer in time to the ___ than to the building of the Great Pyramid.', 'moon landing'],
  ['Oxford University is older than the ___ Empire.', 'aztec'],
  ['A blue whale\'s heart is about the size of a ___.', 'small car'],
  ['Nintendo started in 1889 as a company making ___.', 'playing cards'],
  ['Coca-Cola was first sold as a ___.', 'medicine'],
  ['A googol is the number 1 followed by ___ zeros.', '100'],
  ['Pigeons can recognise themselves in a ___.', 'mirror'],
  ['The Hawaiian alphabet has only ___ letters.', '13'],
  ['The Mona Lisa has no ___.', 'eyebrows'],
  ['The largest desert in the world is ___.', 'antarctica'],
  ['Koalas have fingerprints that are almost identical to ___.', 'humans'],
  ['Rats laugh when they are ___.', 'tickled'],
  ['Crows can remember human ___.', 'faces'],
  ['Under its white fur, a polar bear\'s skin is ___.', 'black'],
  ['Measured from base to peak, the tallest mountain on Earth is ___.', 'mauna kea'],
  ['There is a town in Norway called ___.', 'hell'],
  ['An ostrich\'s eye is bigger than its ___.', 'brain'],
  ['A shrimp\'s heart is in its ___.', 'head'],
  ['Dolphins sleep with ___ of their brain awake.', 'half'],
  ['The largest organ of the human body is the ___.', 'skin'],
  ['A giraffe\'s tongue is ___ in colour.', 'dark blue'],
  ['An adult human body has ___ bones.', '206'],
  ['A camel\'s hump stores ___.', 'fat'],
];
const AR = [
  ['الحيوان الوطني لاسكتلندا هو ___', 'اليونيكورن'],
  ['الأخطبوط عنده ___ قلوب', 'تلاتة'],
  ['دم الاستاكوزا لونه ___', 'أزرق'],
  ['الفراشة بتدوق الأكل بـ ___', 'رجليها'],
  ['أقصر حرب في التاريخ، بين بريطانيا وزنجبار، استمرت حوالي ___', '38 دقيقة'],
  ['جلد الدب القطبي تحت الفرو لونه ___', 'أسود'],
  ['أغلى بهار في العالم بالوزن هو ___', 'الزعفران'],
  ['عاصمة أستراليا هي ___', 'كانبرا'],
  ['أكبر صحرا في العالم هي ___', 'القارة القطبية الجنوبية'],
  ['كليوباترا عاشت أقرب لزمن ___ من زمن بناء الهرم الأكبر', 'نزول الإنسان على القمر'],
  ['شركة نينتندو بدأت سنة 1889 بتعمل ___', 'كوتشينة'],
  ['الكوكاكولا اتباعت في الأول على إنها ___', 'دوا'],
  ['الفول السوداني مش مكسرات، ده من ___', 'البقوليات'],
  ['الحلزونة ممكن تنام لحد ___', '3 سنين'],
  ['الموناليزا مالهاش ___', 'حواجب'],
  ['الفيران بتضحك لما ___', 'حد يزغزغها'],
  ['اليوم على كوكب الزهرة أطول من ___ عليه', 'السنة'],
  ['برج إيفل بيطول حوالي 15 سم في ___', 'الصيف'],
  ['سمك القرش كان موجود على الأرض قبل ___', 'الشجر'],
  ['قلب الحوت الأزرق حجمه قد ___', 'عربية صغيرة'],
  ['بصمات الكوالا شبه بصمات ___', 'الإنسان'],
  ['اللي صمم علبة البرينجلز اتدفن في ___', 'علبة برينجلز'],
  ['الجمل بيخزن في سنامه ___', 'دهون'],
  ['عدد عضم جسم الإنسان البالغ ___', '206'],
  ['الفراولة هي الفاكهة الوحيدة اللي بذورها ___', 'برة'],
  ['جامعة أكسفورد أقدم من إمبراطورية ___', 'الأزتك'],
  ['الغراب بيفتكر ___ الناس', 'وشوش'],
  ['فيه بلد في النرويج اسمها ___', 'الجحيم'],
  ['أكبر عضو في جسم الإنسان هو ___', 'الجلد'],
  ['النحل بيعرّف بعضه مكان الورد عن طريق ___', 'الرقص'],
  ['لسان الزرافة لونه ___', 'أزرق غامق'],
  ['الحمام يقدر يعرف نفسه في ___', 'المراية'],
  ['الموز علمياً يعتبر من ___', 'التوت'],
  ['عين النعامة أكبر من ___', 'مخها'],
  ['قلب الجمبري موجود في ___', 'راسه'],
  ['أول فيلم مصري ناطق كان اسمه ___', 'أولاد الذوات'],
  ['الدولفين بينام وهو ___ مخه صاحي', 'نص'],
  ['جماعة الغربان بالإنجليزي اسمها murder يعني ___', 'جريمة قتل'],
  ['النقطة اللي فوق حرف i بالإنجليزي اسمها ___', 'tittle'],
  ['الطرف البلاستيك اللي في آخر رباط الجزمة اسمه ___', 'aglet'],
  ['ابن الكنغر الصغير اسمه ___', 'جوي'],
  ['ثعالب البحر بتمسك ___ وهي نايمة عشان ماتبعدش عن بعض', 'إيدين بعض'],
  ['أغلب الأسود بتنام حوالي ___ ساعة في اليوم', '20'],
  ['شركة نوكيا في الأول كانت بتعمل ___', 'ورق'],
  ['البطريق الذكر بيقدّم للأنثى ___ عشان يخطبها', 'حصوة'],
  ['السلحفاة البحرية بتعيط عشان تطلّع ___ من جسمها', 'الملح'],
  ['الأناناس بياخد حوالي ___ عشان يطلع', 'سنتين'],
  ['الكلمة الإنجليزي "salary" (مرتب) جاية من كلمة ___', 'ملح'],
  ['أطول نهر في العالم حسب أغلب المصادر هو ___', 'النيل'],
  ['الفيل هو الحيوان الوحيد اللي مايقدرش ___', 'ينط'],
];

const normEN = s => String(s || '').toLowerCase().replace(/^(a|an|the)\s+/, '').replace(/[^a-z0-9]/g, '');
const normAR = s => String(s || '').trim().toLowerCase()
  .replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
  .replace(/(^|\s)ال/g, '$1').replace(/[^؀-ۿa-z0-9]/g, '');
const REVEAL_MS = 9000;

function makeGame(cfg){
  const { id, name, icon, blurb, bank, norm, T } = cfg;

  function startQ(S){
    const p = S.pub, store = S.secret[S.n];
    let pool = bank.map((_, i) => i).filter(i => !store.used.includes(i)); if (!pool.length) pool = bank.map((_, i) => i);
    const qi = pool[Math.floor(Math.random() * pool.length)];
    store.used.push(qi); store.qi = qi; store.lies = {};
    p.phase = 'write'; p.q = bank[qi][0]; p.deadline = S.now + p.time * 1000;
    p.wrote = Array(S.n).fill(false); p.voted = Array(S.n).fill(false); p.options = null; p.reveal = null;
    for (let i = 0; i < S.n; i++) S.secret[i] = null;
  }
  function startVote(S){
    const p = S.pub, store = S.secret[S.n], truth = bank[store.qi][1];
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
    const p = S.pub, store = S.secret[S.n];
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
    id, icon, name, blurb, min:3, max:8,
    settings:[
      { key:'count', label:T.count, def:8, options:[{ v:5, label:'5' }, { v:8, label:'8' }, { v:12, label:'12' }] },
      { key:'time', label:T.time, def:60, options:[{ v:45, label:'45 ثانية' }, { v:60, label:'60 ثانية' }, { v:90, label:'90 ثانية' }] },
    ],
    init(n, prev, set){ return { phase:'write', qn:1, count:+set.count || 8, time:+set.time || 60, q:'', deadline:0, points:Array(n).fill(0), wrote:[], voted:[], options:null, reveal:null }; },
    secrets(pub, n){ const S = { pub, n, now:Date.now(), secret:[...Array(n).fill(null), { used:[], lies:{} }] }; startQ(S); return S.secret; },
    tick(S){
      const p = S.pub;
      if (p.phase === 'end' || S.now < p.deadline) return false;
      if (p.phase === 'write') startVote(S);
      else if (p.phase === 'vote') doReveal(S);
      else if (p.qn >= p.count) { p.phase = 'end'; p.deadline = 0; }
      else { p.qn++; startQ(S); }
      return true;
    },
    act(S, seat, a){
      const p = S.pub, store = S.secret[S.n];
      if (a.t === 'lie' && p.phase === 'write' && typeof a.text === 'string') {
        const text = a.text.trim().slice(0, 60);
        if (!text) return;
        if (norm(text) === norm(bank[store.qi][1])) { S.secret[seat] = { truthHit:Date.now() }; return; }
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
      const p = ctx.pub, me = ctx.me, names = ctx.players.map(x => x.name), priv = ctx.priv || {};
      const key = p.phase + ':' + p.qn;
      const fresh = view.key !== key || !root.querySelector('#bf-root');
      if (fresh) {
        view.key = key;
        root.innerHTML = `<div id="bf-root" class="game-root" dir="${T.dir}">
          <div class="bf-head"><span class="muted" dir="rtl">${p.phase === 'end' ? 'خلصت' : `سؤال ${p.qn} من ${p.count}`}</span><div class="bf-time" id="bf-time">–</div></div>
          <div id="bf-chips" dir="rtl"></div>
          ${p.phase === 'end' ? '' : `<div class="bf-q">${question(p.q)}</div>`}
          <div id="bf-body"></div></div>`;
        clearInterval(view.timer); view.timer = setInterval(clock, 250);
      }
      const chips = root.querySelector('#bf-chips');
      chips.innerHTML = K.chips(ctx.players.map((x, i) => ({ name:x.name + ((p.phase === 'write' && p.wrote[i]) || (p.phase === 'vote' && p.voted[i]) ? ' ✓' : ''), seat:i, online:ctx.online(i), extra:p.points[i] })));
      const body = root.querySelector('#bf-body');

      if (p.phase === 'write') {
        if (fresh) {
          body.innerHTML = `<form class="bf-form" id="bf-form"><input id="bf-in" maxlength="60" autocomplete="off" placeholder="${esc(T.placeholder)}"><button class="stamp">${esc(T.send)}</button></form>
            <p class="bf-note" id="bf-note"></p>`;
          const f = body.querySelector('#bf-form'), inp = body.querySelector('#bf-in');
          f.addEventListener('submit', e => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; view.lastCtx.act({ t:'lie', text:v }); K.tick(600, .05); });
          setTimeout(() => inp.focus(), 50);
        }
        const note = body.querySelector('#bf-note');
        if (priv.truthHit && priv.truthHit !== view.hit) { view.hit = priv.truthHit; note.textContent = T.truthHit; note.className = 'bf-note bad'; K.buzz(60); }
        else if (priv.mine) { note.textContent = `${T.yours}: ${priv.mine}`; note.className = 'bf-note ok'; }
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
      const lagging = (p.phase === 'write' && p.wrote.some((w, i) => !w && !ctx.online(i))) || (p.phase === 'vote' && p.voted.some((v, i) => !v && !ctx.online(i)));
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

makeGame({ id:'fakeit', name:'Fake It', icon:'✎', blurb:'اكتب إجابة كدب تقنع بيها الباقي، ودوّر على الصح. (English)',
  bank:EN, norm:normEN,
  T:{ dir:'ltr', count:'عدد الأسئلة', time:'وقت الكتابة', placeholder:'Write a believable fake answer', send:'Send', truthHit:'That\'s actually the real answer! Write a fake one.', yours:'Your fake', pick:'Which one is the real answer?' } });
makeGame({ id:'fesher', name:'فِشَر', icon:'ف', blurb:'افشر إجابة تصدّقها الناس، ودوّر على الإجابة الصح. (عربي)',
  bank:AR, norm:normAR,
  T:{ dir:'rtl', count:'عدد الأسئلة', time:'وقت الكتابة', placeholder:'اكتب إجابة كدب تتصدّق', send:'ابعت', truthHit:'دي الإجابة الصح فعلاً! اكتب حاجة تانية كدب.', yours:'فشرتك', pick:'أنهي واحدة الإجابة الصح؟' } });
})();
