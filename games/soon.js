/* Games planned for the next steps; shown on the home screen as "coming soon". */
[
  { id:'alwan',  icon:'◐', name:'ألوان',        blurb:'لعبة كوتشينة: طابق اللون أو الرقم، وخلّص ورقك الأول.', min:2, max:8 },
  { id:'ludo',   icon:'⚄', name:'لودو',         blurb:'ارمي الزهر ووصّل عساكرك الأربعة للبيت.',               min:2, max:4 },
  { id:'words',  icon:'W', name:'Five Letters', blurb:'خمّن الكلمة الإنجليزي في 6 محاولات، وسابق صحابك.',     min:1, max:8 },
  { id:'quiz',   icon:'?', name:'Quiz Rush',    blurb:'اكتب أكتر إجابات تقدر عليها قبل ما الوقت يخلص.',        min:1, max:8 },
  { id:'fakeit', icon:'✎', name:'Fake It',      blurb:'اكتب إجابة كدب تقنع بيها الباقي، ودوّر على الصح.',      min:3, max:8 },
  { id:'fesher', icon:'ف', name:'فِشَر',         blurb:'نفس فكرة Fake It بس بالعربي: افشر صح واكسب.',           min:3, max:8 },
].forEach(g => Lamma.register(Object.assign({ soon:true }, g)));
