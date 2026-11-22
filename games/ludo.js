/* Ludo for 2–4 players. Roll the die, bring your four tokens out on a 6, run them around
   the board and up your home lane. Landing on an opponent (off a safe square) sends it home.
   A 6, a capture or bringing a token home gives another roll. First to bring all four home wins.

   Token progress: -1 in the yard, 0..50 on the shared track (counted from the colour's own
   start square), 51..55 in the home lane, 56 home. */
(function(){
const K = Lamma, esc = K.esc;

/* the 52 shared track squares on a 15×15 grid, clockwise from the left arm */
const TRACK = [
  [6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0],
];
/* four colour slots: start index on TRACK, home lane cells, yard corner */
const SLOTS = [
  { start:0,  lane:[[7,1],[7,2],[7,3],[7,4],[7,5]], yard:[1,1], css:'#2448c9', name:'أزرق' },
  { start:13, lane:[[1,7],[2,7],[3,7],[4,7],[5,7]], yard:[1,10], css:'#167a55', name:'أخضر' },
  { start:26, lane:[[7,13],[7,12],[7,11],[7,10],[7,9]], yard:[10,10], css:'#d4600f', name:'برتقالي' },
  { start:39, lane:[[13,7],[12,7],[11,7],[10,7],[9,7]], yard:[10,1], css:'#7c3aed', name:'بنفسجي' },
];
const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const slotsFor = n => n === 2 ? [0, 2] : n === 3 ? [0, 1, 2] : [0, 1, 2, 3];
const abs = (slot, prog) => (SLOTS[slot].start + prog) % 52;

function cellOf(slot, prog, tokenIndex){
  if (prog < 0) { const [r, c] = SLOTS[slot].yard; return [r + (tokenIndex >> 1) * 2 + .5, c + (tokenIndex & 1) * 2 + .5]; }
  if (prog <= 50) { const [r, c] = TRACK[abs(slot, prog)]; return [r + .5, c + .5]; }
  if (prog <= 55) { const [r, c] = SLOTS[slot].lane[prog - 51]; return [r + .5, c + .5]; }
  return [[7.5, 6.6], [6.6, 7.5], [7.5, 8.4], [8.4, 7.5]][slot];   // this colour's triangle in the middle
}
function moves(p, seat, roll){
  return p.tokens[seat].map((prog, i) => {
    if (prog < 0) return roll === 6 ? i : -1;
    return prog + roll <= 56 ? i : -1;
  }).filter(i => i >= 0);
}

const css = `
.ld-board{position:relative;width:100%;aspect-ratio:1;display:grid;grid-template-columns:repeat(15,1fr);grid-template-rows:repeat(15,1fr);
  background:var(--card);border:3px solid var(--ink);border-radius:12px;box-shadow:4px 5px 0 var(--ink);overflow:hidden;direction:ltr}
.ld-c{border:.5px solid var(--grid)}
.ld-c.trk{background:var(--card)}
.ld-c.lane,.ld-c.st{background:var(--sc)}
.ld-c.star{background-image:radial-gradient(circle,var(--ink) 0 18%,transparent 20%)}
.ld-yard{grid-row:span 6;grid-column:span 6;background:color-mix(in srgb,var(--sc) 85%,white);display:grid;place-items:center;border:none}
.ld-yard>div{width:66%;height:66%;background:var(--card);border-radius:14%}
.ld-mid{grid-row:7/10;grid-column:7/10;background:conic-gradient(from -45deg,${SLOTS[1].css} 0 25%,${SLOTS[2].css} 0 50%,${SLOTS[3].css} 0 75%,${SLOTS[0].css} 0)}
.ld-tok{position:absolute;width:5.2%;height:5.2%;border-radius:50%;background:var(--tc);border:2px solid var(--ink);transform:translate(-50%,-50%);
  box-shadow:0 2px 0 var(--ink);display:grid;place-items:center;color:#fff;font-size:10px;font-weight:800;padding:0;min-height:0;transition:left .25s,top .25s}
.ld-tok.go{outline:3px solid var(--stamp);outline-offset:2px;animation:ldpulse .7s ease-in-out infinite alternate;cursor:pointer;z-index:2}
@keyframes ldpulse{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.2)}}
.ld-bar{display:flex;align-items:center;justify-content:space-between;gap:12px}
.ld-die{width:64px;height:64px;border-radius:14px;background:var(--card);border:3px solid var(--ink);box-shadow:3px 4px 0 var(--ink);display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);padding:8px;flex:none}
.ld-die i{width:10px;height:10px;border-radius:50%;background:var(--ink);place-self:center;visibility:hidden}
.ld-die i.on{visibility:visible}
.ld-die.roll{animation:ldroll .4s ease-out}
@keyframes ldroll{from{transform:rotate(-200deg) scale(.6)}to{transform:none}}
`;
let styled = false;
function style(){ if (styled) return; styled = true; const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }
const PIPS = { 1:[4], 2:[0,8], 3:[0,4,8], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8] };
const die = (v, anim) => `<div class="ld-die${anim ? ' roll' : ''}" aria-label="الزهر ${v || ''}">${[...Array(9)].map((_, i) => `<i class="${v && PIPS[v].includes(i) ? 'on' : ''}"></i>`).join('')}</div>`;

function boardBase(){
  const cells = [];
  const trackIdx = new Map(TRACK.map(([r, c], i) => [r * 15 + c, i]));
  const laneOf = new Map(); SLOTS.forEach((s, si) => s.lane.forEach(([r, c]) => laneOf.set(r * 15 + c, si)));
  const yards = [[0,0,0],[0,9,1],[9,9,2],[9,0,3]];
  const inYard = (r, c) => yards.find(([yr, yc]) => r >= yr && r < yr + 6 && c >= yc && c < yc + 6);
  for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) {
    const y = inYard(r, c);
    if (y) { if (r === y[0] && c === y[1]) cells.push(`<div class="ld-c ld-yard" style="grid-row:${r+1}/span 6;grid-column:${c+1}/span 6;--sc:${SLOTS[y[2]].css}"><div></div></div>`); continue; }
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) { if (r === 6 && c === 6) cells.push('<div class="ld-mid"></div>'); continue; }
    const k = r * 15 + c, ti = trackIdx.get(k), li = laneOf.get(k);
    if (li != null) cells.push(`<div class="ld-c lane" style="grid-row:${r+1};grid-column:${c+1};--sc:${SLOTS[li].css}"></div>`);
    else if (ti != null) {
      const st = SLOTS.findIndex(s => s.start === ti);
      cells.push(`<div class="ld-c trk${st >= 0 ? ' st' : ''}${SAFE.has(ti) && st < 0 ? ' star' : ''}" style="grid-row:${r+1};grid-column:${c+1};${st >= 0 ? `--sc:${SLOTS[st].css}` : ''}"></div>`);
    } else cells.push(`<div class="ld-c" style="grid-row:${r+1};grid-column:${c+1}"></div>`);
  }
  return cells.join('');
}
let baseHTML = null, lastRollKey = '';

Lamma.register({
  id:'ludo', icon:'⚄', name:'لودو', blurb:'ارمي الزهر ووصّل عساكرك الأربعة للبيت.', min:2, max:4,

  init(n, prev){
    const starter = prev ? (prev.starter + 1) % n : 0;
    return { phase:'play', turn:starter, starter, slots:slotsFor(n), tokens:[...Array(n)].map(() => [-1,-1,-1,-1]),
      roll:null, rolled:false, rolls:0, msg:'', winner:null, score: prev ? prev.score : Array(n).fill(0) };
  },

  act(S, seat, a){
    const p = S.pub, n = S.n;
    if (p.phase !== 'play') return;
    const pass = () => { p.turn = (p.turn + 1) % n; p.rolled = false; };
    if (a.t === 'skip' && seat === S.hostSeat) { pass(); p.msg = 'عدّينا الدور'; return; }
    if (seat !== p.turn) return;

    if (a.t === 'roll' && !p.rolled) {
      p.roll = 1 + Math.floor(Math.random() * 6); p.rolls++; p.rolled = true;
      if (!moves(p, seat, p.roll).length) {
        p.msg = p.roll === 6 ? 'طلعت 6 بس مفيش حركة، ارمي تاني' : 'مفيش حركة بالرقم ده';
        if (p.roll === 6) p.rolled = false; else pass();
      } else p.msg = '';
      return;
    }
    if (a.t === 'move' && p.rolled) {
      const i = a.tok, slot = p.slots[seat], toks = p.tokens[seat];
      if (!moves(p, seat, p.roll).includes(i)) return;
      toks[i] = toks[i] < 0 ? 0 : toks[i] + p.roll;
      let bonus = p.roll === 6, captured = 0;
      if (toks[i] <= 50) {
        const sq = abs(slot, toks[i]);
        if (!SAFE.has(sq)) p.tokens.forEach((other, s) => { if (s === seat) return;
          other.forEach((pr, j) => { if (pr >= 0 && pr <= 50 && abs(p.slots[s], pr) === sq) { other[j] = -1; captured++; } }); });
      }
      if (captured) { bonus = true; p.msg = `أكل ${captured === 1 ? 'عسكري' : captured + ' عساكر'}!`; }
      else if (toks[i] === 56) { bonus = true; p.msg = 'عسكري وصل البيت!'; }
      else p.msg = '';
      if (toks.every(t => t === 56)) { p.phase = 'end'; p.winner = seat; p.score[seat]++; return; }
      if (bonus) p.rolled = false; else pass();
    }
  },

  render(root, ctx){
    style();
    const p = ctx.pub, me = ctx.me, names = ctx.players.map(x => x.name);
    if (!baseHTML) baseHTML = boardBase();
    const mine = p.phase === 'play' && p.turn === me && !ctx.busy;
    const movable = mine && p.rolled ? moves(p, me, p.roll) : [];
    const rollKey = p.rolls + ':' + p.turn;
    const anim = rollKey !== lastRollKey && p.roll; if (anim) { lastRollKey = rollKey; K.tick(300, .12); }

    const toks = [];
    p.tokens.forEach((arr, s) => {
      const slot = p.slots[s];
      const placed = {};
      arr.forEach((prog, i) => {
        let [r, c] = cellOf(slot, prog, i);
        const key = prog < 0 ? 'y' + i : prog === 56 ? 'home' + s : r + ':' + c;
        const k = placed[key] = (placed[key] || 0) + 1;
        if (k > 1 && prog >= 0) { r -= .18 * (k - 1); c += .18 * (k - 1); }
        const go = s === me && movable.includes(i);
        toks.push(`<button type="button" class="ld-tok${go ? ' go' : ''}" data-t="${go ? i : ''}" style="--tc:${SLOTS[slot].css};left:${c / 15 * 100}%;top:${r / 15 * 100}%" aria-label="عسكري ${SLOTS[slot].name}"></button>`);
      });
    });

    if (p.phase === 'end') {
      if (!ctx.local.celebrated) { ctx.local.celebrated = true; ctx.saveLocal(); if (p.winner === me) K.celebrate(); }
    }
    const homeCount = s => p.tokens[s].filter(t => t === 56).length;
    root.innerHTML = `
      ${K.chips(ctx.players.map((x, i) => ({ name:x.name, seat:i, turn:p.phase === 'play' && i === p.turn, online:ctx.online(i), extra:`${homeCount(i)}/4` })))}
      <div class="ld-board">${baseHTML}${toks.join('')}</div>
      ${p.phase === 'end' ? `
        <h2 style="text-align:center">${p.winner === me ? 'انت كسبت!' : `${esc(names[p.winner])} كسب!`}</h2>
        ${K.scores(ctx.players, p.score)}
        ${ctx.isHost ? '<button class="stamp" data-again>جولة كمان</button><button class="ghost" data-lobby>رجوع للأوضة</button>' : '<p class="hint">صاحب الأوضة هيبدأ الجولة الجاية.</p>'}`
      : `
        <div class="ld-bar">
          <div><p class="muted">${p.turn === me ? 'دورك يا' : 'دلوقتي دور'}</p><h3 style="color:${SLOTS[p.slots[p.turn]].css}">${esc(names[p.turn])}</h3></div>
          ${die(p.roll, anim)}
        </div>
        <p class="hint" style="font-weight:700">${esc(p.msg) || (mine ? (p.rolled ? 'اختار عسكري يتحرك.' : 'ارمي الزهر.') : '')}</p>
        ${mine && !p.rolled ? '<button class="stamp" data-roll>ارمي الزهر</button>' : ''}
        ${!ctx.online(p.turn) && ctx.isHost && p.turn !== me ? `<button class="ghost" data-skip>عدّي دور ${esc(names[p.turn])} (مش متصل)</button>` : ''}`}`;
    root.querySelectorAll('.ld-tok.go').forEach(b => b.onclick = () => { ctx.act({ t:'move', tok:+b.dataset.t }); K.tick(520, .05); });
    root.querySelector('[data-roll]')?.addEventListener('click', () => ctx.act({ t:'roll' }));
    root.querySelector('[data-skip]')?.addEventListener('click', () => ctx.act({ t:'skip' }));
    root.querySelector('[data-again]')?.addEventListener('click', () => ctx.again());
    root.querySelector('[data-lobby]')?.addEventListener('click', () => ctx.toLobby());
  },
});
})();
