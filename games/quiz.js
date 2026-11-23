/* Quiz Rush — timed list quizzes in Arabic or English (picked in the lobby), 1–8 players.
   Everyone gets the same quiz ("Name the 8 planets") and types answers against the clock;
   an answer is accepted the moment it's typed right. 10 points per answer, and 5 extra
   for being the first in the room to find it. The room creator sets quizzes and time. */
(function(){
const K = Lamma, esc = K.esc;

/* each answer: display name, then accepted spellings separated by | */
const QUIZZES = [
  { id:'continents', title:'Name the 7 continents', a:['Africa','Antarctica','Asia','Australia|oceania','Europe','North America','South America'] },
  { id:'planets', title:'Name the 8 planets of the solar system', a:['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'] },
  { id:'oceans', title:'Name the 5 oceans', a:['Pacific','Atlantic','Indian','Southern|antarctic','Arctic'] },
  { id:'rainbow', title:'Name the 7 colours of the rainbow', a:['Red','Orange','Yellow','Green','Blue','Indigo','Violet|purple'] },
  { id:'days', title:'Name the days of the week', a:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
  { id:'months', title:'Name the 12 months', a:['January','February','March','April','May','June','July','August','September','October','November','December'] },
  { id:'zodiac', title:'Name the 12 zodiac signs', a:['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] },
  { id:'chess', title:'Name the 6 chess pieces', a:['King','Queen','Rook|castle','Bishop','Knight|horse','Pawn'] },
  { id:'wonders', title:'Name the 7 Wonders of the Ancient World', a:['Great Pyramid of Giza|pyramid|great pyramid|pyramid of giza','Hanging Gardens of Babylon|hanging gardens','Statue of Zeus|zeus','Temple of Artemis|artemis','Mausoleum at Halicarnassus|mausoleum','Colossus of Rhodes|colossus','Lighthouse of Alexandria|lighthouse|pharos'] },
  { id:'worldcup', title:'Name the 8 countries that have won the FIFA World Cup', a:['Brazil','Germany|west germany','Italy','Argentina','France','Uruguay','England','Spain'] },
  { id:'southamerica', title:'Name the 12 countries of South America', a:['Argentina','Bolivia','Brazil','Chile','Colombia','Ecuador','Guyana','Paraguay','Peru','Suriname','Uruguay','Venezuela'] },
  { id:'noble', title:'Name the noble gases', a:['Helium','Neon','Argon','Krypton','Xenon','Radon','Oganesson'] },
  { id:'arab', title:'Name the 22 members of the Arab League', a:['Algeria','Bahrain','Comoros','Djibouti','Egypt','Iraq','Jordan','Kuwait','Lebanon','Libya','Mauritania','Morocco','Oman','Palestine','Qatar','Saudi Arabia|saudi|ksa','Somalia','Sudan','Syria','Tunisia','United Arab Emirates|uae|emirates','Yemen'] },
  { id:'g7', title:'Name the 7 countries of the G7', a:['Canada','France','Germany','Italy','Japan','United Kingdom|uk|britain|great britain|england','United States|usa|us|america|united states of america'] },
  { id:'senses', title:'Name the 5 human senses', a:['Sight|vision|seeing','Hearing','Smell|smelling','Taste|tasting','Touch|feeling'] },
  { id:'rings', title:'Name the 5 colours of the Olympic rings', a:['Blue','Yellow','Black','Green','Red'] },
  { id:'states', title:'Name the 50 US states', a:'Alabama Alaska Arizona Arkansas California Colorado Connecticut Delaware Florida Georgia Hawaii Idaho Illinois Indiana Iowa Kansas Kentucky Louisiana Maine Maryland Massachusetts Michigan Minnesota Mississippi Missouri Montana Nebraska Nevada New_Hampshire New_Jersey New_Mexico New_York North_Carolina North_Dakota Ohio Oklahoma Oregon Pennsylvania Rhode_Island South_Carolina South_Dakota Tennessee Texas Utah Vermont Virginia Washington West_Virginia Wisconsin Wyoming'.split(' ').map(s => s.replace(/_/g, ' ')) },
  { id:'capitals', title:'Name the capitals: Egypt, France, Japan, Italy, Spain, Canada, Australia, Brazil, Turkey, Morocco', a:['Cairo','Paris','Tokyo','Rome','Madrid','Ottawa','Canberra','Brasilia','Ankara','Rabat'] },
  { id:'instruments', title:'Name the 4 sections of an orchestra', a:['Strings|string','Woodwinds|woodwind','Brass','Percussion'] },
  { id:'shapes', title:'Name the polygons with 3 to 10 sides', a:['Triangle','Quadrilateral|square|rectangle','Pentagon','Hexagon','Heptagon|septagon','Octagon','Nonagon|enneagon','Decagon'] },
];

/* Arabic quizzes: same shape. Matching ignores ال, hamza forms, ة/ه, ى/ي, spaces and diacritics. */
const QUIZZES_AR = [
  { id:'ar-days', title:'اكتب أيام الأسبوع', a:['السبت','الأحد|حد','الاثنين|اتنين|الإثنين','الثلاثاء|التلات|تلات','الأربعاء|الاربع|اربع','الخميس','الجمعة'] },
  { id:'ar-months', title:'اكتب الشهور الميلادية الـ12', a:['يناير','فبراير','مارس','أبريل|ابريل|إبريل','مايو','يونيو|يونيه','يوليو|يوليه','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'] },
  { id:'ar-hijri', title:'اكتب الشهور الهجرية الـ12', a:['محرم','صفر','ربيع الأول|ربيع اول','ربيع الآخر|ربيع الثاني|ربيع تاني|ربيع اخر','جمادى الأولى|جماد اول|جمادى اول','جمادى الآخرة|جمادى الثانية|جماد تاني|جمادى اخر','رجب','شعبان','رمضان','شوال','ذو القعدة|ذي القعدة|القعدة','ذو الحجة|ذي الحجة|الحجة'] },
  { id:'ar-planets', title:'اكتب كواكب المجموعة الشمسية الـ8', a:['عطارد','الزهرة','الأرض','المريخ','المشتري','زحل','أورانوس|يورانوس','نبتون'] },
  { id:'ar-continents', title:'اكتب القارات السبع', a:['أفريقيا|إفريقيا','آسيا','أوروبا','أمريكا الشمالية|امريكا شمالية','أمريكا الجنوبية|امريكا جنوبية','أستراليا|أوقيانوسيا','أنتاركتيكا|القارة القطبية|القطبية الجنوبية|انتاركتيكا'] },
  { id:'ar-rainbow', title:'اكتب ألوان قوس قزح السبعة', a:['أحمر','برتقالي','أصفر','أخضر','أزرق','نيلي','بنفسجي|موف'] },
  { id:'ar-senses', title:'اكتب الحواس الخمس', a:['البصر|النظر|الشوف','السمع','الشم','التذوق|الذوق','اللمس'] },
  { id:'ar-pillars', title:'اكتب أركان الإسلام الخمسة', a:['الشهادتان|الشهادتين|الشهادة','الصلاة','الزكاة','الصوم|الصيام','الحج'] },
  { id:'ar-egypt', title:'اكتب محافظات مصر الـ27', a:['القاهرة','الجيزة','الإسكندرية|اسكندرية','القليوبية','الشرقية','الدقهلية','الغربية','المنوفية','كفر الشيخ','البحيرة','دمياط','بورسعيد|بور سعيد','الإسماعيلية','السويس','الفيوم','بني سويف','المنيا','أسيوط','سوهاج','قنا','الأقصر','أسوان','البحر الأحمر','الوادي الجديد','مطروح|مرسى مطروح','شمال سيناء','جنوب سيناء'] },
  { id:'ar-arab', title:'اكتب الدول الأعضاء في جامعة الدول العربية الـ22', a:['مصر','السعودية','الإمارات','الكويت','قطر','البحرين','عمان|سلطنة عمان','اليمن','العراق','سوريا','لبنان','الأردن','فلسطين','السودان','ليبيا','تونس','الجزائر','المغرب','موريتانيا','الصومال','جيبوتي','جزر القمر|القمر'] },
  { id:'ar-capitals', title:'اكتب عواصم: مصر، السعودية، المغرب، فرنسا، اليابان، إيطاليا، تركيا، لبنان، العراق، إنجلترا', a:['القاهرة','الرياض','الرباط','باريس','طوكيو','روما','أنقرة','بيروت','بغداد','لندن'] },
  { id:'ar-seasons', title:'اكتب فصول السنة الأربعة', a:['الربيع','الصيف','الخريف','الشتاء|الشتا'] },
  { id:'ar-chess', title:'اكتب قطع الشطرنج الست', a:['الملك|الشاه','الوزير|الملكة','الطابية|القلعة|الرخ','الفيل','الحصان','العسكري|البيدق|الجندي'] },
  { id:'ar-fingers', title:'اكتب أسماء أصابع اليد الخمسة', a:['الإبهام|الابهام','السبابة','الوسطى','البنصر','الخنصر'] },
  { id:'ar-worldcup', title:'اكتب الدول الـ8 اللي كسبت كأس العالم', a:['البرازيل','ألمانيا','إيطاليا','الأرجنتين','فرنسا','أوروجواي|الأوروغواي|أوروغواي','إنجلترا','إسبانيا'] },
  { id:'ar-wonders', title:'اكتب عجائب الدنيا السبع القديمة', a:['الهرم الأكبر|هرم خوفو|الهرم|الأهرامات','حدائق بابل المعلقة|حدائق بابل','تمثال زيوس|زيوس','معبد أرتميس|أرتميس','ضريح موسولوس|الضريح|ضريح هاليكارناسوس','تمثال رودس|عملاق رودس|رودس','منارة الإسكندرية|فنار الإسكندرية|المنارة'] },
  { id:'ar-zodiac', title:'اكتب الأبراج الـ12', a:['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'] },
  { id:'ar-polygons', title:'اكتب المضلعات من 3 لـ 10 أضلاع', a:['مثلث','رباعي|مربع|مستطيل','خماسي','سداسي','سباعي','ثماني|ثماني الأضلاع','تساعي','عشاري'] },
  { id:'ar-rings', title:'اكتب ألوان الحلقات الأولمبية الخمسة', a:['أزرق','أصفر','أسود','أخضر','أحمر'] },
  { id:'ar-prophets', title:'اكتب أولي العزم من الرسل الخمسة', a:['نوح','إبراهيم','موسى','عيسى','محمد'] },
];
const normAR = s => String(s || '').trim().toLowerCase()
  .replace(/[ً-ٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/(^|s)ال/g, '$1').replace(/[^ء-يa-z0-9]/g, '');
const BANK = { en:QUIZZES, ar:QUIZZES_AR };
const findQ = id => QUIZZES.find(x => x.id === id) || QUIZZES_AR.find(x => x.id === id);
const normEN = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
let norm = normEN;
const accepts = ans => ans.split('|').map(norm);
const shown = ans => ans.split('|')[0];
const BETWEEN_MS = 9000;

function startQuiz(S){
  const p = S.pub, q = findQ(p.order[p.qi]);
  p.phase = 'play'; p.quiz = q.id; p.deadline = S.now + p.time * 1000;
  p.found = Array(S.n).fill(0); p.firsts = {}; p.done = Array(S.n).fill(false); p.gained = Array(S.n).fill(0);
  S.secret[S.n].got = [...Array(S.n)].map(() => []);
}

const css = `
.qz-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.qz-time{font-family:var(--display);font-size:24px;min-width:56px;height:56px;border-radius:50%;border:3px solid var(--ink);display:grid;place-items:center;background:var(--card);font-variant-numeric:tabular-nums;flex:none}
.qz-time.low{border-color:var(--stamp);color:var(--stamp)}
.qz-title{font-family:var(--display);font-size:24px;line-height:1.2;text-align:start}
.qz-count{font-family:var(--display);font-size:20px;text-align:center}
.qz-in{text-align:start;font-size:20px}
.qz-in.hit{border-color:var(--ok);box-shadow:0 0 0 3px color-mix(in srgb,var(--ok) 30%,transparent)}
.qz-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px}
.qz-list div{background:var(--card);border:1.5px dashed var(--grid);border-radius:8px;padding:6px 8px;font-weight:700;font-size:14px;min-height:34px;color:var(--muted)}
.qz-list div.got{border-style:solid;border-color:var(--ok);color:var(--ink)}
.qz-list div.miss{border-style:solid;border-color:var(--stamp);color:var(--stamp)}
.qz-list div .first{color:var(--stamp);font-size:12px}
`;
let styled = false;
function style(){ if (styled) return; styled = true; const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

let lastCtx = null, timerT = null, view = '';
function mineGot(ctx){ const L = ctx.local; const key = ctx.pub.quiz + ':' + ctx.pub.qi; if (L.qkey !== key) { L.qkey = key; L.got = []; } return L.got; }
function clock(){
  const el = document.getElementById('qz-time'); if (!el) { clearInterval(timerT); return; }
  const ctx = lastCtx; if (!ctx) return;
  const left = ctx.pub.deadline ? Math.max(0, Math.ceil((ctx.pub.deadline - ctx.now()) / 1000)) : 0;
  el.textContent = ctx.pub.phase === 'end' ? '–' : left;
  el.classList.toggle('low', ctx.pub.phase === 'play' && left <= 10);
}

Lamma.register({
  id:'quiz', cat:'en', icon:'?', name:'كويز', blurb:'اكتب أكتر إجابات تقدر عليها قبل ما الوقت يخلص. عربي أو English.', min:1, max:8,
  settings:[
    { key:'lang', label:'اللغة', def:'ar', options:[{ v:'ar', label:'عربي' }, { v:'en', label:'English' }] },
    { key:'count', label:'عدد الكويزات', def:3, options:[{ v:1, label:'كويز' }, { v:3, label:'3 كويزات' }, { v:5, label:'5 كويزات' }] },
    { key:'time', label:'وقت كل كويز', def:90, options:[{ v:60, label:'دقيقة' }, { v:90, label:'دقيقة ونص' }, { v:150, label:'دقيقتين ونص' }] },
  ],
  init(n, prev, set){
    const count = +set.count || 3;
    const lang = set.lang === 'en' ? 'en' : 'ar';
    const order = K.shuffle(BANK[lang].map(q => q.id)).slice(0, count);
    return { lang, phase:'play', qi:0, order, count, time:+set.time || 90, quiz:null, deadline:0, points:Array(n).fill(0), found:[], firsts:{}, done:[], gained:[] };
  },
  secrets(pub, n){ const S = { pub, n, now:Date.now(), secret:[...Array(n).fill(null), { got:[] }] }; startQuiz(S); return S.secret; },
  tick(S){
    const p = S.pub;
    if (p.phase === 'end' || S.now < p.deadline) return false;
    if (p.phase === 'play') { p.phase = 'between'; p.deadline = S.now + BETWEEN_MS; }
    else if (p.qi + 1 >= p.order.length) { p.phase = 'end'; p.deadline = 0; }
    else { p.qi++; startQuiz(S); }
    return true;
  },
  act(S, seat, a){
    const p = S.pub, got = S.secret[S.n].got[seat];
    if (p.phase !== 'play') return;
    const q = findQ(p.quiz);
    if (a.t === 'found' && a.q === p.quiz && Number.isInteger(a.i) && a.i >= 0 && a.i < q.a.length && !got.includes(a.i)) {
      got.push(a.i); p.found[seat] = got.length;
      let pts = 10; if (p.firsts[a.i] == null) { p.firsts[a.i] = seat; pts += 5; }
      p.points[seat] += pts; p.gained[seat] += pts;
      if (got.length === q.a.length) p.done[seat] = true;
    }
    if (a.t === 'giveup') p.done[seat] = true;
    if (p.done.every(Boolean)) { p.phase = 'between'; p.deadline = S.now + BETWEEN_MS; }
  },
  render(root, ctx){
    style(); lastCtx = ctx;
    const p = ctx.pub, me = ctx.me, names = ctx.players.map(x => x.name);
    norm = p.lang === 'ar' ? normAR : normEN;
    const dir = p.lang === 'ar' ? 'rtl' : 'ltr';
    const q = findQ(p.quiz), got = mineGot(ctx);
    const key = p.phase + ':' + p.qi;
    if (view !== key || !root.querySelector('#qz-root')) {
      view = key;
      root.innerHTML = `<div id="qz-root" class="game-root">
        <div class="qz-head"><span class="muted">كويز ${p.qi + 1} من ${p.order.length}</span><div class="qz-time" id="qz-time">–</div></div>
        <div id="qz-chips"></div>
        ${p.phase === 'end' ? '' : `<div class="qz-title" dir="${dir}">${esc(q.title)}</div>`}
        ${p.phase === 'play' ? `<input class="qz-in" id="qz-in" dir="${dir}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${p.lang === 'ar' ? 'اكتب إجابة…' : 'Type an answer…'}" aria-label="Answer">
          <div class="qz-count" id="qz-count"></div>` : ''}
        <div id="qz-body"></div></div>`;
      clearInterval(timerT); timerT = setInterval(clock, 250);
      const inp = root.querySelector('#qz-in');
      if (inp) {
        inp.addEventListener('input', () => {
          const v = norm(inp.value); if (!v) return;
          const L = mineGot(lastCtx);
          const i = q.a.findIndex((ans, j) => !L.includes(j) && accepts(ans).includes(v));
          if (i < 0) return;
          L.push(i); lastCtx.saveLocal(); lastCtx.act({ t:'found', q:q.id, i });
          inp.value = ''; inp.classList.add('hit'); setTimeout(() => inp.classList.remove('hit'), 300);
          K.tick(700 + L.length * 15, .06); update(lastCtx);
        });
        setTimeout(() => inp.focus(), 50);
      }
    }
    update(ctx);
  },
});

function update(ctx){
  const root = document.getElementById('qz-root'); if (!root) return;
  const p = ctx.pub, me = ctx.me, names = ctx.players.map(x => x.name);
  const q = findQ(p.quiz), got = mineGot(ctx);
  root.querySelector('#qz-chips').innerHTML = K.chips(ctx.players.map((x, i) => ({ name:x.name + (p.done[i] && p.phase === 'play' ? ' ✓' : ''), seat:i, online:ctx.online(i), extra:p.phase === 'end' ? p.points[i] : `${p.found[i] || 0}/${q.a.length}` })));
  const cnt = root.querySelector('#qz-count'); if (cnt) cnt.textContent = `${got.length} من ${q.a.length}`;
  const body = root.querySelector('#qz-body');
  if (p.phase === 'play') {
    body.innerHTML = `<div class="qz-list" dir="${p.lang === 'ar' ? 'rtl' : 'ltr'}">${q.a.map((ans, i) => `<div class="${got.includes(i) ? 'got' : ''}">${got.includes(i) ? esc(shown(ans)) : ''}</div>`).join('')}</div>
      ${p.done[me] ? '<p class="hint">خلصت، استنى الباقي…</p>' : '<button class="ghost" id="qz-giveup">خلّصت كده</button>'}`;
    body.querySelector('#qz-giveup')?.addEventListener('click', () => ctx.act({ t:'giveup' }));
  } else if (p.phase === 'between') {
    body.innerHTML = `<div class="qz-list" dir="${p.lang === 'ar' ? 'rtl' : 'ltr'}">${q.a.map((ans, i) => {
        const f = p.firsts[i];
        return `<div class="${got.includes(i) ? 'got' : 'miss'}">${esc(shown(ans))}${f != null ? ` <span class="first">· ${esc(names[f])}</span>` : ''}</div>`; }).join('')}</div>
      ${K.scores(ctx.players, p.points)}<p class="hint">الكويز الجاي بعد ثواني…</p>`;
  } else {
    const rank = p.points.map((v, i) => [i, v]).sort((a, b) => b[1] - a[1]);
    if (!ctx.local.celebrated) { ctx.local.celebrated = true; ctx.saveLocal(); if (rank[0][0] === me) K.celebrate(); }
    body.innerHTML = `<h2 style="text-align:center">${rank[0][0] === me ? 'انت الأول!' : `${esc(names[rank[0][0]])} الأول!`}</h2>${K.scores(ctx.players, p.points)}
      ${ctx.isHost ? '<div class="row"><button class="stamp" data-again>العب تاني</button><button class="ghost" data-lobby>رجوع للأوضة</button></div>' : '<p class="hint">صاحب الأوضة هيبدأ اللي بعده.</p>'}`;
    body.querySelector('[data-again]')?.addEventListener('click', () => ctx.again());
    body.querySelector('[data-lobby]')?.addEventListener('click', () => ctx.toLobby());
  }
  clock();
}
})();
