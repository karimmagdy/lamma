/* Shared helpers for the shell and every game. Games register themselves with Lamma.register(). */
(function(){
const K = window.Lamma = { games: [] };

K.register = g => K.games.push(g);
K.game = id => K.games.find(g => g.id === id);

K.$ = id => document.getElementById(id);
K.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
K.color = seat => `var(--c${seat % 8})`;

K.store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
K.fetch = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch(e){ return null; } };
K.drop = k => { try { localStorage.removeItem(k); } catch(e){} };

K.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

let ac = null;
K.tick = (freq = 520, dur = .08) => {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = freq; o.type = 'triangle';
    g.gain.setValueAtTime(.15, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + dur);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
  } catch(e){}
};
K.buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch(e){} };

K.celebrate = () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = K.$('confetti'); c.hidden = false; const x = c.getContext('2d'); const d = devicePixelRatio || 1;
  const W = c.width = innerWidth * d, H = c.height = innerHeight * d;
  c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
  const cols = ['#d2412e','#2448c9','#167a55','#c2410c','#7c3aed','#be185d'];
  const P = [...Array(110)].map(() => ({x:Math.random()*W, y:-Math.random()*H*.5, vy:(2+Math.random()*4)*d, vx:(Math.random()-.5)*2*d, r:Math.random()*6, s:(6+Math.random()*10)*d, c:cols[Math.random()*cols.length|0]}));
  let t = 0;
  (function f(){
    x.clearRect(0,0,W,H);
    P.forEach(p => { p.y+=p.vy; p.x+=p.vx; p.r+=.08; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-p.s/2,-p.s/6,p.s,p.s/3); x.restore(); });
    if (++t < 180) requestAnimationFrame(f); else { x.clearRect(0,0,W,H); c.hidden = true; }
  })();
  [523,659,784,1046].forEach((f,i) => setTimeout(() => K.tick(f,.18), i*120));
};

/* chip row of players: [{name, seat, online, turn, extra}] */
K.chips = list => `<div class="strip">${list.map(p =>
  `<span class="chip${p.turn?' turn':''}${p.online===false?' off':''}" style="--pc:${K.color(p.seat)}"><span class="n">${K.esc(p.name)}</span>${p.extra!=null?`<b>${p.extra}</b>`:''}</span>`).join('')}</div>`;

K.scores = (players, score) => `<div class="scores">${players.map((p,i) => `<div style="--pc:${K.color(i)}"><span>${K.esc(p.name)}</span><b>${score[i]||0}</b></div>`).join('')}</div>`;
})();
