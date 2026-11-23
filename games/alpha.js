/* A to Z / أ → ي — guess the hidden word in a category, in English or Arabic (picked in the lobby), 1–8 players.
   Every guess is placed in alphabetical order around a "?" slot where the answer sits.
   Each guess shows an arrow toward the answer and how far it is in dictionary order.

   Three levels, picked by the room creator:
     easy   — 12 guesses, familiar answers, the first letter is given, distance as a number
     medium — 8 guesses, familiar answers, distance as a number
     hard   — 6 guesses, harder answers, only near / far (no number)
   "Reveal letter" can be used once per word by one player only: whoever takes it first gets one more
   letter, and it is locked for everyone else.
   Points for solving with k of G guesses: 50 + 70·(G−k)/(G−1), plus 30 / 20 / 10 for the first three,
   minus 15 for the player who took the letter (never below 10). */
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
  ['Sea creatures', 'كائنات بحرية', 'fish shark whale dolphin octopus crab shrimp turtle seal jellyfish', 'starfish seahorse stingray lobster squid oyster barracuda manatee'],
  ['Food', 'أكل', 'pizza burger pasta rice bread soup salad sandwich chicken cheese egg', 'lasagna omelette falafel risotto dumpling burrito kebab pancake'],
  ['Desserts', 'حلويات', 'cake cookie chocolate candy donut icecream pie cupcake pudding', 'brownie waffle croissant tiramisu macaron cheesecake custard sorbet'],
  ['Drinks', 'مشروبات', 'water milk tea coffee juice lemonade soda cocoa', 'smoothie milkshake espresso cappuccino latte yogurt mocha hibiscus'],
  ['School things', 'حاجات المدرسة', 'pen pencil book bag ruler eraser desk board notebook teacher', 'stapler sharpener calculator compass highlighter backpack textbook marker'],
  ['Tools', 'عِدّة', 'hammer saw drill nail screw ladder shovel rope brush scissors', 'wrench pliers chisel screwdriver crowbar trowel sandpaper wheelbarrow'],
  ['Space', 'الفضاء', 'sun moon star planet earth mars rocket comet', 'galaxy nebula asteroid meteor jupiter saturn satellite telescope'],
  ['Flowers and plants', 'زهور ونباتات', 'rose tree grass flower leaf cactus palm tulip', 'jasmine daisy orchid lily sunflower bamboo fern lavender'],
  ['Shapes', 'أشكال', 'circle square triangle star heart line oval cube', 'rectangle pentagon hexagon octagon diamond pyramid cylinder sphere'],
  ['Cities', 'مدن', 'cairo london paris rome tokyo dubai madrid berlin', 'istanbul barcelona alexandria marrakesh lisbon amsterdam vienna toronto'],
  ['Feelings', 'مشاعر', 'happy sad angry scared tired bored excited calm', 'anxious jealous proud nervous lonely grateful curious embarrassed'],
  ['Technology', 'تكنولوجيا', 'phone computer laptop mouse keyboard screen camera internet', 'printer router charger tablet headphones microphone speaker robot'],
  ['Toys and games', 'لعب وألعاب', 'ball doll kite puzzle chess cards dice balloon', 'yoyo marbles domino frisbee teddy lego scooter skateboard'],
  ['Family', 'العيلة', 'mother father sister brother baby uncle aunt cousin', 'grandmother grandfather nephew niece husband wife twin daughter'],
  ['Places in town', 'أماكن في البلد', 'school hospital bank market park mosque church library', 'museum pharmacy bakery stadium airport cinema theater factory'],
  ['Jewels and metals', 'معادن ومجوهرات', 'gold silver ring necklace diamond pearl watch bracelet', 'ruby emerald sapphire platinum copper bronze earring crown'],
  ['Reptiles and frogs', 'زواحف وضفادع', 'snake lizard turtle crocodile frog gecko toad', 'iguana chameleon python cobra salamander tortoise alligator newt'],
  ['Hobbies', 'هوايات', 'reading cooking painting dancing singing fishing hiking gardening', 'knitting pottery juggling origami camping baking sewing photography'],
  ['Bathroom things', 'حاجات الحمام', 'soap towel shampoo toothbrush toothpaste shower sink toilet', 'razor sponge plunger faucet bathtub lotion comb tissue'],
  ['In the garden', 'في الجنينة', 'flower tree grass seed hose soil fence pond', 'trellis compost sprinkler greenhouse hedge mulch rake shed'],
  ['Spices and herbs', 'توابل وأعشاب', 'salt pepper sugar mint garlic ginger honey', 'cumin cinnamon saffron oregano basil paprika nutmeg turmeric'],
  ['Languages', 'لغات', 'english arabic french spanish german italian chinese japanese', 'portuguese swahili hindi korean turkish greek dutch persian'],
  ['On the farm', 'في المزرعة', 'cow sheep goat pig hen barn tractor horse', 'haystack scarecrow silo stable plough orchard rooster donkey'],
  ['At the beach', 'على البحر', 'sand wave shell towel umbrella sunscreen boat ball', 'seagull lifeguard snorkel sandcastle surfboard pier tide coral'],
  ['In the office', 'في المكتب', 'desk chair paper pen computer phone printer meeting', 'stapler folder calendar envelope whiteboard deadline cubicle projector'],
  ['Mythical creatures', 'كائنات خيالية', 'dragon unicorn ghost giant mermaid vampire fairy witch', 'griffin phoenix goblin centaur werewolf cyclops sphinx kraken'],
  ['Weather', 'الجو', 'sunny rainy windy cloudy snowy hot cold warm', 'humid foggy drizzle thunder lightning hail breeze frost'],
].map(([en, ar, easy, hard]) => ({ title:en, sub:ar, easy:easy.split(' '), hard:hard.split(' ') }));

/* Arabic categories: answers written as people write them (with ال where natural); matching ignores ال and hamza forms. */
const CATS_AR = [
  ['حيوانات', 'قطة كلب حصان أسد نمر أرنب قرد زرافة فيل جمل دب خروف', 'وشق ضبع فهد غزال قنفذ سنجاب حرباء ثعلب'],
  ['فواكه', 'تفاح موز برتقال مانجو عنب ليمون خوخ فراولة بطيخ كمثرى', 'مشمش جوافة رمان تين كاكا قشطة برقوق كيوي'],
  ['خضار', 'طماطم بطاطس بصل ثوم خيار جزر فلفل كوسة باذنجان ملوخية', 'خرشوف قرنبيط بامية لفت فجل كرنب سبانخ بنجر'],
  ['دول', 'مصر السعودية المغرب تونس الجزائر العراق سوريا لبنان الأردن فرنسا اليابان الصين', 'موريتانيا جيبوتي البرتغال النرويج الفلبين الإكوادور بوتان أوغندا'],
  ['رياضات', 'سباحة ملاكمة تنس جري جودو كاراتيه مصارعة شطرنج', 'مبارزة تجديف رماية جمباز إسكواش فروسية بولينج تزلج'],
  ['وظايف', 'دكتور مدرس مهندس طيار ظابط ممرضة طباخ فلاح سواق نجار', 'صيدلي جراح محامي مترجم صحفي جواهرجي مذيع محاسب'],
  ['جسم الإنسان', 'إيد رجل راس عين ودن بق مناخير صباع قلب بطن', 'كلية كبد طحال رئة ركبة كوع حاجب جبهة'],
  ['حاجات المطبخ', 'معلقة شوكة سكينة طبق كوباية حلة فرن تلاجة براد صينية', 'مصفاة مغرفة مبشرة خلاط محمصة شواية هون مضرب'],
  ['ألوان', 'أحمر أزرق أخضر أصفر أسود أبيض بني بنفسجي برتقالي وردي', 'رمادي كحلي زيتي فيروزي بيج نبيتي موف فضي'],
  ['حشرات', 'نملة نحلة دبانة ناموسة فراشة صرصار عنكبوت دودة خنفسة', 'جرادة يعسوب عقرب قملة برغوث يرقة'],
  ['لبس', 'قميص فستان بنطلون جاكيت جزمة طاقية شراب كوفية بيجامة جيبة', 'جلابية بلوزة صديري جوانتي صندل عباية قفطان بدلة'],
  ['آلات موسيقية', 'عود بيانو جيتار طبلة كمان ناي قانون رق', 'تشيلو كلارينيت أكورديون مزمار ربابة ساكسفون هارب ترومبيت'],
  ['مواصلات', 'عربية أتوبيس قطر عجلة موتوسيكل طيارة مركب تاكسي ترام مترو', 'فلوكة غواصة هليكوبتر جرار إسعاف ميكروباص توكتوك يخت'],
  ['طبيعة', 'مطر شمس قمر سحاب جبل بحر نهر صحرا رمل ريح', 'بركان شلال واحة إعصار زلزال بحيرة كهف وادي'],
  ['طيور', 'حمامة عصفور نسر صقر بطة فرخة ديك بومة غراب ببغاء', 'بجعة طاووس هدهد نورس كروان سمان بلبل نعامة'],
  ['في البيت', 'كرسي ترابيزة سرير كنبة باب شباك لمبة مراية سجادة دولاب', 'ستارة مخدة نجفة درج سلم بلكونة فوتيه مكتبة'],
  ['أكلات', 'كشري فول طعمية ملوخية محشي فتة رز مكرونة شاورما بيتزا', 'كبسة منسف مقلوبة كفتة حواوشي قلقاس مسقعة فطير'],
  ['حلويات', 'كنافة بسبوسة قطايف بقلاوة جيلاتي كيكة شوكولاتة بسكوت', 'مهلبية زلابية غريبة كحك بسيمة معمول هريسة عاشورا'],
  ['مشروبات', 'مية لبن شاي قهوة عصير ليموناضة كاكاو سوبيا', 'كركديه تمرهندي عرقسوس خروب سحلب ينسون قرفة حلبة'],
  ['أدوات المدرسة', 'قلم كراسة كتاب شنطة مسطرة أستيكة براية سبورة', 'منقلة برجل طباشير دباسة مقلمة صلصال'],
  ['الفضاء', 'شمس قمر نجمة كوكب صاروخ أرض المريخ نيزك', 'مجرة سديم كويكب مذنب زحل عطارد المشتري تلسكوب'],
  ['مدن', 'القاهرة الإسكندرية الجيزة أسوان الأقصر دبي الرياض جدة بيروت دمشق', 'طنطا المنصورة الزقازيق دمياط بنغازي مراكش وهران صنعاء'],
  ['مشاعر', 'فرحان زعلان غضبان خايف تعبان مبسوط قلقان مكسوف', 'غيران فخور وحيد ممتن فضولي متوتر حنين ندمان'],
  ['العيلة', 'أم أب أخت أخ جد جدة عم خال عمة خالة', 'حفيد حماة حما نسيب سلفة توأم'],
  ['أماكن في البلد', 'مدرسة مستشفى بنك سوق جامع كنيسة مكتبة نادي', 'متحف صيدلية مخبز استاد مطار سينما مسرح مصنع'],
  ['تكنولوجيا', 'موبايل كمبيوتر لابتوب ماوس كيبورد شاشة كاميرا إنترنت', 'طابعة راوتر شاحن تابلت سماعة ميكروفون روبوت سيرفر'],
  ['أشكال', 'دايرة مربع مثلث نجمة قلب خط مستطيل بيضاوي', 'خماسي سداسي ثماني معين هرم أسطوانة كرة مكعب'],
  ['لعب وألعاب', 'كورة عروسة بازل شطرنج كوتشينة طاولة بلونة نحلة', 'دومينو بلي سيجا استغماية فريسبي ليجو مكعبات زحليقة'],
  ['معادن ومجوهرات', 'دهب فضة خاتم سلسلة ألماظ لولي ساعة غوشة', 'ياقوت زمرد بلاتين نحاس برونز حلق تاج فيروز'],
  ['كائنات بحرية', 'سمكة قرش حوت دولفين أخطبوط كابوريا جمبري سلحفاة', 'قنديل حبار استاكوزا محار مرجان فقمة سبيط بلطي'],
  ['توابل وأعشاب', 'ملح فلفل سكر نعناع ثوم كمون شطة كسبرة', 'زعفران كركم قرفة حبهان ريحان زعتر شبت بقدونس'],
  ['لغات', 'عربي إنجليزي فرنساوي ألماني إيطالي إسباني صيني ياباني', 'برتغالي سواحيلي هندي كوري تركي يوناني هولندي فارسي'],
  ['في المزرعة', 'بقرة جاموسة معزة خروف فرخة حمار حصان جرار', 'حظيرة فزاعة ساقية محراث بستان ديك وزة أرانب'],
  ['على البحر', 'رمل موجة صدفة شمسية فوطة مركب كورة مايوه', 'نورس منقذ سنوركل لوح جزر شعاب مرسى رصيف'],
  ['كائنات خيالية', 'تنين عفريت غول جنية عملاق ساحرة مصاص شبح', 'عنقاء رخ سفنكس قنطور مستذئب سيكلوب كراكن جني'],
  ['الجو', 'مشمس ممطر حر برد غيم ريح دافي تلج', 'رطوبة شبورة رذاذ رعد برق حبات صقيع نسمة'],
].map(([title, easy, hard]) => ({ title, sub:'', easy:easy.split(' ').filter(w => !w.includes('?')), hard:hard.split(' ').filter(w => !w.includes('?')) }));

const LEVELS = {
  easy:   { G:12, first:true,  number:true,  pool:'easy' },
  medium: { G:8,  first:false, number:true,  pool:'easy' },
  hard:   { G:6,  first:false, number:false, pool:'hard' },
};

/* Dictionary-order position of a word, scaled to a 40,000-word dictionary.
   First letters follow how many dictionary words start with each letter; later letters follow
   ordinary letter frequency, with "end of word" sorting first. Arabic words are compared without ال,
   with أ إ آ ء → ا, ؤ → و, ئ ى → ي and ة → ه. */
const FIRST_EN = { a:6.0,b:5.6,c:9.4,d:5.9,e:4.0,f:4.0,g:3.3,h:3.6,i:3.6,j:.8,k:.9,l:3.2,m:5.5,n:2.3,o:2.6,p:8.0,q:.5,r:5.4,s:11.4,t:5.0,u:3.0,v:1.5,w:2.4,x:.1,y:.3,z:.3 };
const LATER_EN = { $:9,a:8.2,b:1.5,c:2.8,d:4.3,e:12.7,f:2.2,g:2.0,h:6.1,i:7.0,j:.2,k:.8,l:4.0,m:2.4,n:6.7,o:7.5,p:1.9,q:.1,r:6.0,s:6.3,t:9.1,u:2.8,v:1,w:2.4,x:.2,y:2.0,z:.1 };
const FIRST_AR = { 'ا':9,'ب':5,'ت':7,'ث':1,'ج':3,'ح':4,'خ':3,'د':3,'ذ':1,'ر':3,'ز':2,'س':6,'ش':4,'ص':3,'ض':1.5,'ط':2.5,'ظ':.5,'ع':5,'غ':2,'ف':4,'ق':4,'ك':4,'ل':3,'م':14,'ن':4,'ه':2.5,'و':3,'ي':2 };
const LATER_AR = { $:9,'ا':12,'ب':4,'ت':5,'ث':.6,'ج':1.6,'ح':2.5,'خ':1.1,'د':3,'ذ':.6,'ر':6,'ز':.9,'س':3,'ش':1.4,'ص':1.2,'ض':.6,'ط':1.3,'ظ':.2,'ع':3.5,'غ':.6,'ف':2.5,'ق':2.5,'ك':2.5,'ل':7,'م':5,'ن':6,'ه':5,'و':6,'ي':9 };
const DICT = 40000;
function makeLang(cfg){
  const code = cfg.alpha === 'abcdefghijklmnopqrstuvwxyz' ? (c => c) : (c => [...c].map(ch => String.fromCharCode(97 + cfg.alpha.indexOf(ch))).join(''));
  const cdf = tab => { const ks = Object.keys(tab).map(k => [k === '$' ? '$' : code(k), tab[k]]).sort((a, b) => a[0] < b[0] ? -1 : 1);
    const tot = ks.reduce((s, k) => s + k[1], 0); let acc = 0; const out = {}; for (const [k, v] of ks) { out[k] = [acc / tot, v / tot]; acc += v; } return out; };
  const F1 = cdf(cfg.first), FN = cdf(cfg.later);
  const pos = c => { let lo = 0, w = 1; const s = code(c) + '$';
    for (let i = 0; i < Math.min(s.length, 8); i++) { const t = (i === 0 ? F1 : FN)[s[i]]; if (!t) break; lo += w * t[0]; w *= t[1]; if (s[i] === '$') break; }
    return lo * DICT; };
  return Object.assign(cfg, { code, pos, distance:(a, b) => a === b ? 0 : Math.max(1, Math.round(Math.abs(pos(a) - pos(b)))), before:(a, b) => code(a) < code(b) });
}
const LANGS = {
  en:makeLang({ cats:CATS, alpha:'abcdefghijklmnopqrstuvwxyz', first:FIRST_EN, later:LATER_EN,
    clean:w => String(w || '').toLowerCase().replace(/[^a-z]/g, ''),
    same:(g, a) => g === a || g === a + 's' || g + 's' === a || g === a + 'es',
    T:{ dir:'ltr', left:'Guesses', az:'A → Z', ph:'Type a word', starts:'Starts with: ', need:'اكتب كلمة إنجليزي' } }),
  ar:makeLang({ cats:CATS_AR, alpha:'ابتثجحخدذرزسشصضطظعغفقكلمنهوي', first:FIRST_AR, later:LATER_AR,
    clean:w => String(w || '').replace(/[\u064B-\u0670\u0640]/g, '').replace(/[أإآء]/g, 'ا').replace(/ؤ/g, 'و').replace(/[ئى]/g, 'ي').replace(/ة/g, 'ه')
      .replace(/[^\u0627-\u064A]/g, '').replace(/^ال(?=..)/, ''),
    same:(g, a) => g === a || g + 'ه' === a || g === a + 'ه',
    T:{ dir:'rtl', left:'التخمينات', az:'أ → ي', ph:'اكتب كلمة', starts:'بتبدأ بـ: ', need:'اكتب كلمة عربي' } }),
};
const lang = p => LANGS[p && p.lang === 'ar' ? 'ar' : 'en'];
function heat(d){ return d <= 60 ? 'h0' : d <= 400 ? 'h1' : d <= 2000 ? 'h2' : 'h3'; }
const HEAT_AR = { h0:'قريب جدًا', h1:'قريب', h2:'بعيد', h3:'بعيد جدًا' };

const BETWEEN_MS = 7000;
function startRound(S){
  const p = S.pub, store = S.secret[S.n], L = LEVELS[p.level], Lg = lang(p), CS = Lg.cats;
  let cats = CS.map((c, i) => i).filter(i => !store.cats.includes(i)); if (!cats.length) { store.cats = []; cats = CS.map((c, i) => i); }
  const ci = cats[Math.floor(Math.random() * cats.length)], cat = CS[ci], list = cat[L.pool];
  const ans = list[Math.floor(Math.random() * list.length)];
  store.cats.push(ci); store.ans = ans; store.c = Lg.clean(ans);
  Object.assign(p, { phase:'play', deadline:S.now + p.time * 1000, cat:cat.title, catAr:cat.sub, ans:null,
    count:Array(S.n).fill(0), done:Array(S.n).fill(false), solvedOrder:[], gained:Array(S.n).fill(0), hintsUsed:Array(S.n).fill(0), hintBy:-1 });
  for (let i = 0; i < S.n; i++) S.secret[i] = { rows:[], hint:L.first ? store.c[0] : '' };
}
function endRound(S){ const p = S.pub; p.phase = 'between'; p.ans = S.secret[S.n].ans; p.deadline = S.now + BETWEEN_MS; }

const css = `
.az-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.az-time{font-family:var(--display);font-size:21px;min-width:58px;height:58px;border-radius:50%;border:3px solid var(--ink);display:grid;place-items:center;background:var(--card);font-variant-numeric:tabular-nums}
.az-time.low{border-color:var(--stamp);color:var(--stamp)}
.az-cat{text-align:center}
.az-cat b{display:block;font-family:var(--display);font-size:30px;line-height:1.1}
.az-cat span{font-size:13px;color:var(--muted)}
.az-meta{display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:14px}
.az-list{display:flex;flex-direction:column;gap:6px}
.az-row{display:flex;align-items:stretch;border-radius:9px;overflow:hidden;border:2px solid var(--ink);background:var(--card);min-height:46px;box-shadow:0 2px 0 var(--ink)}
.az-row .w{flex:1;padding:8px 12px;font-size:20px;font-weight:800;text-transform:capitalize;display:flex;align-items:center}
.az-row .d{min-width:110px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:800;font-size:18px;color:#fff;border-inline-start:2px solid var(--ink)}
.az-row .d small{font-size:12px}
.az-row.new{animation:azpop .35s}
@keyframes azpop{from{transform:scale(.96);opacity:.3}}
.az-row.slot .w{color:var(--muted);letter-spacing:.15em}
.az-row.slot .d{background:#9b968a}
.az-row.win .w{color:#167a55}
.az-row.win .d{background:#167a55}
.az-row .d.h0{background:#2f9e5b} .az-row .d.h1{background:#d4a017} .az-row .d.h2{background:#e2771f} .az-row .d.h3{background:#c2410c}
.az-form{display:flex;gap:8px}
.az-form input{flex:1;min-width:0;font-size:20px;text-align:start}
.az-tools{display:flex;justify-content:space-between;align-items:center;gap:8px}
.az-hint{font-weight:800;letter-spacing:.08em}
.az-msg{text-align:center;font-weight:800;min-height:1.5em}
.az-others{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.az-other{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px;font-weight:800;color:var(--pc)}
.az-dots{display:flex;gap:2px;direction:ltr}
.az-dots i{width:7px;height:7px;border-radius:50%;background:var(--grid)}
.az-dots i.u{background:var(--pc)}
.az-word{font-family:var(--display);font-size:40px;letter-spacing:.06em;text-transform:uppercase;text-align:center}
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
  const Lg = lang(p), c = Lg.clean(inp.value);
  if (c.length < 2) { flash = Lg.T.need; return draw(ctx); }
  const rows = (ctx.priv && ctx.priv.rows) || [];
  if (rows.some(r => (r.c || r.w) === c)) { flash = 'جرّبتها قبل كده'; return draw(ctx); }
  const raw = inp.value; newest = c; inp.value = ''; K.tick(560, .05);
  ctx.act({ t:'guess', w:raw });
}

function draw(ctx){
  const root = document.getElementById('az-root'); if (!root) return;
  const p = ctx.pub, me = ctx.me, L = LEVELS[p.level], Lg = lang(p), T = Lg.T, names = ctx.players.map(x => x.name);
  const priv = ctx.priv || {}, rows = priv.rows || [];
  if (root.dir !== T.dir) { root.dir = T.dir; root.querySelector('#az-az').textContent = T.az; root.querySelector('#az-in').placeholder = T.ph; }
  const playing = p.phase === 'play' && !p.done[me];
  root.querySelector('#az-cat').innerHTML = p.cat ? `<b>${esc(p.cat)}</b><span>${p.catAr ? esc(p.catAr) + ' · ' : ''}${{ easy:'سهل', medium:'متوسط', hard:'صعب' }[p.level]}</span>` : '';
  root.querySelector('#az-left').textContent = `${T.left}: ${rows.length}/${L.G}`;
  const solved = rows.some(r => r.d === 0);
  // alphabetical list with the answer slot in its place
  const items = rows.map(r => ({ ...r }));
  if (!solved) items.push({ slot:true });
  items.sort((a, b) => {
    if (a.slot) return b.dir === 'down' ? 1 : -1;
    if (b.slot) return a.dir === 'down' ? -1 : 1;
    return Lg.before(a.c, b.c) ? -1 : Lg.before(b.c, a.c) ? 1 : 0;
  });
  root.querySelector('#az-list').innerHTML = items.map(r => {
    if (r.slot) return `<div class="az-row slot"><div class="w">${p.ans ? esc(p.ans) : esc((priv.hint || '').toUpperCase()) + '…'}</div><div class="d">?</div></div>`;
    if (r.d === 0) return `<div class="az-row win${r.c === newest ? ' new' : ''}"><div class="w">${esc(r.w)}</div><div class="d">✓</div></div>`;
    const h = heat(r.d), arrow = r.dir === 'down' ? '▼' : '▲';
    return `<div class="az-row${r.c === newest ? ' new' : ''}"><div class="w">${esc(r.w)}</div><div class="d ${h}">${arrow} ${L.number ? r.d : `<small>${HEAT_AR[h]}</small>`}</div></div>`;
  }).join('') || '';
  const form = root.querySelector('#az-form'), tools = root.querySelector('#az-tools');
  form.hidden = !playing; tools.hidden = !playing;
  const hb = root.querySelector('#az-hintbtn'), taken = p.hintBy >= 0;
  hb.textContent = !taken ? 'اكشف حرف (مرة واحدة للأوضة)' : p.hintBy === me ? 'خدت الحرف' : `${names[p.hintBy] || 'حد'} خد الحرف`;
  hb.disabled = taken || ctx.busy;
  root.querySelector('#az-hint').textContent = priv.hint ? `${T.starts}${priv.hint.toUpperCase()}…` : '';
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
  id:'alpha', cat:'en', icon:'↕', name:'أ → ي', blurb:'خمّن الكلمة من الفئة، وكل تخمين يقولك هي قبله ولا بعده في الأبجدية. عربي أو English.', min:1, max:8,
  settings:[
    { key:'lang', label:'اللغة', def:'ar', options:[{ v:'ar', label:'عربي' }, { v:'en', label:'English' }] },
    { key:'level', label:'المستوى', def:'medium', options:[{ v:'easy', label:'سهل' }, { v:'medium', label:'متوسط' }, { v:'hard', label:'صعب' }] },
    { key:'rounds', label:'عدد الكلمات', def:3, options:[{ v:1, label:'كلمة' }, { v:3, label:'3 كلمات' }, { v:5, label:'5 كلمات' }] },
    { key:'time', label:'وقت كل كلمة', def:150, options:[{ v:90, label:'دقيقة ونص' }, { v:150, label:'دقيقتين ونص' }, { v:240, label:'4 دقايق' }] },
  ],
  init(n, prev, set){ return { lang:set.lang === 'en' ? 'en' : 'ar', phase:'play', round:1, rounds:+set.rounds || 3, time:+set.time || 150, level:LEVELS[set.level] ? set.level : 'medium', deadline:0, points:Array(n).fill(0), count:[], done:[], solvedOrder:[], gained:[], hintsUsed:[] }; },
  secrets(pub, n){ const S = { pub, n, now:Date.now(), secret:[...Array(n).fill(null), { cats:[], ans:null, c:null }] }; startRound(S); return S.secret; },
  tick(S){
    const p = S.pub;
    if (p.phase === 'end' || S.now < p.deadline) return false;
    if (p.phase === 'play') endRound(S);
    else if (p.round >= p.rounds) { p.phase = 'end'; p.deadline = 0; }
    else { p.round++; startRound(S); }
    return true;
  },
  act(S, seat, a){
    const p = S.pub, store = S.secret[S.n], ans = store.c, mine = S.secret[seat], L = LEVELS[p.level], Lg = lang(p);
    if (p.phase !== 'play' || p.done[seat]) return;
    if (a.t === 'hint') {
      if (p.hintBy >= 0 || mine.hint.length >= ans.length - 1) return;
      p.hintBy = seat; p.hintsUsed[seat] = 1; mine.hint = ans.slice(0, mine.hint.length + 1); return;
    }
    if (a.t !== 'guess') return;
    const c = Lg.clean(a.w), w = p.lang === 'ar' ? String(a.w || '').replace(/[^\u0621-\u064A ]/g, '').trim().slice(0, 24) || c : c;
    if (c.length < 2 || c.length > 24 || mine.rows.some(r => r.c === c)) return;
    if (Lg.same(c, ans)) {
      mine.rows.push({ w:store.ans, c:ans, d:0 });
      const k = mine.rows.length;
      const pts = Math.max(10, Math.round(50 + 70 * (L.G - k) / (L.G - 1)) + ([30, 20, 10][p.solvedOrder.length] || 0) - 15 * p.hintsUsed[seat]);
      p.solvedOrder.push(seat); p.points[seat] += pts; p.gained[seat] = pts; p.done[seat] = true;
    } else {
      mine.rows.push({ w, c, d:Lg.distance(c, ans), dir:Lg.before(c, ans) ? 'down' : 'up' });
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
        <div class="az-meta"><span id="az-left"></span><span class="muted" id="az-az"></span></div>
        <div class="az-list" id="az-list"></div>
        <p class="az-msg" id="az-msg"></p>
        <form class="az-form" id="az-form" autocomplete="off"><input id="az-in" maxlength="24" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="" aria-label="Your guess"><button class="stamp" type="submit">خمّن</button></form>
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

if (typeof module !== 'undefined') module.exports = { LANGS };
})();
