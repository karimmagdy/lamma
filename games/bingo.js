/* Bingo for 2–8 players.
   Each phone arranges 1–25 on its own board and never sends it until the round ends.
   Players take turns calling a number; after each call every phone reports how many
   lines it has, and the host ends the round when someone reaches 5 (ties share the win). */
(function(){
const K = Lamma, esc = K.esc;
const LETTERS = ['B','I','N','G','O'];
const LINES = (() => { const L=[]; for(let r=0;r<5;r++) L.push([0,1,2,3,4].map(c=>r*5+c)); for(let c=0;c<5;c++) L.push([0,1,2,3,4].map(r=>r*5+c)); L.push([0,6,12,18,24]); L.push([4,8,12,16,20]); return L; })();
const doneLines = (b, called) => { const s = new Set(called); return LINES.map((l,i) => l.every(k => s.has(b[k])) ? i : -1).filter(i => i >= 0); };

const css = `
.bg-top{display:flex;justify-content:space-between;align-items:flex-end;gap:10px}
.bg-top .who{font-family:var(--display);font-size:28px;line-height:1.1}
.bg-letters{display:flex;gap:4px;direction:ltr}
.bg-letters span{font-family:var(--display);font-size:30px;width:36px;height:42px;display:grid;place-items:center;position:relative}
.bg-letters.big span{font-size:44px;width:50px;height:56px}
.bg-letters span.x::after{content:"";position:absolute;inset:44% -3px auto;height:5px;border-radius:4px;background:var(--stamp);transform:rotate(-14deg)}
.bg-wrap{position:relative;width:100%;aspect-ratio:1;direction:ltr}
.bg-board{position:absolute;inset:0;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(5,1fr);gap:6px;padding:8px;background:var(--card);border:3px solid var(--ink);border-radius:16px;box-shadow:4px 5px 0 var(--ink)}
.bg-cell{position:relative;display:grid;place-items:center;border-radius:10px;font-weight:800;font-size:clamp(22px,7vw,32px);font-variant-numeric:tabular-nums;background:transparent;border:1.5px solid var(--grid);color:var(--pen);cursor:pointer;user-select:none;padding:0;min-height:0;box-shadow:none}
.bg-cell:active{transform:none;box-shadow:none}
.bg-cell.empty{color:var(--grid);border-style:dashed}
.bg-cell.called{color:var(--muted)}
.bg-cell.called::after{content:"";position:absolute;inset:10%;border:4px solid var(--stamp);border-radius:48% 52% 45% 55%/55% 45% 55% 45%;transform:rotate(-8deg);animation:bgstamp .28s ease-out}
.bg-cell.fresh::after{border-width:5px}
.bg-cell.pending{background:color-mix(in srgb,var(--stamp) 14%,transparent)}
.bg-board.locked .bg-cell{cursor:default}
@keyframes bgstamp{from{transform:scale(1.6) rotate(-30deg);opacity:0}to{transform:rotate(-8deg);opacity:1}}
.bg-lines{position:absolute;inset:0;pointer-events:none;padding:8px}
.bg-lines svg{width:100%;height:100%;overflow:visible}
.bg-lines line{stroke-width:.13;stroke-linecap:round;opacity:.75}
.bg-hist{display:flex;flex-wrap:wrap;gap:5px;direction:ltr;justify-content:flex-end}
.bg-hist span{font-weight:800;font-size:13px;min-width:28px;height:28px;padding:0 5px;border-radius:14px;display:grid;place-items:center;background:var(--card);border:1.5px solid var(--pc);color:var(--pc);font-variant-numeric:tabular-nums}
.bg-minis{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.bg-mini{display:flex;flex-direction:column;gap:4px;min-width:0}
.bg-mini .nm{font-weight:800;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--pen)}
.bg-mini .bg-board{gap:2px;padding:4px;border-width:2px;box-shadow:2px 3px 0 var(--ink);border-radius:10px}
.bg-mini .bg-cell{font-size:clamp(10px,3.2vw,15px);border-radius:5px;border-width:1px}
.bg-mini .bg-cell.called::after{border-width:2px;animation:none}
.bg-mini .bg-lines{padding:4px}
.bg-mini.win .bg-board{border-color:var(--stamp);box-shadow:2px 3px 0 var(--stamp)}
.bg-result{text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
.bg-wait{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.bg-wait li{display:flex;justify-content:space-between;align-items:center;background:var(--card);border-radius:12px;padding:8px 12px;border:1.5px solid var(--grid);font-weight:700;color:var(--pc)}
`;
let styled = false;
function style(){ if (styled) return; styled = true; const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

function boardHTML(b, called, pen, opts = {}){
  const set = new Set(called);
  const cells = b.map((n, i) => {
    const cls = 'bg-cell' + (n == null ? ' empty' : '') + (n != null && set.has(n) ? ' called' : '') + (n === opts.fresh ? ' fresh' : '') + (n != null && n === opts.pending ? ' pending' : '');
    return opts.mini ? `<div class="${cls}">${n ?? ''}</div>`
      : `<button type="button" class="${cls}" data-i="${i}" aria-label="${n == null ? 'مربع فاضي' : set.has(n) ? n + ' متشطب' : n}">${n ?? '·'}</button>`;
  }).join('');
  const seg = i => { const l = LINES[i], a = l[0], z = l[4]; return [a%5+.5, Math.floor(a/5)+.5, z%5+.5, Math.floor(z/5)+.5]; };
  const lines = called.length ? doneLines(b, called).map(i => { const [x1,y1,x2,y2] = seg(i), dx=(x2-x1)*.08, dy=(y2-y1)*.08;
    return `<line x1="${x1-dx}" y1="${y1-dy}" x2="${x2+dx}" y2="${y2+dy}" style="stroke:${pen}"/>`; }).join('') : '';
  return `<div class="bg-wrap"><div class="bg-board${opts.locked ? ' locked' : ''}" style="--pen:${pen}">${cells}</div><div class="bg-lines"><svg viewBox="-.15 -.15 5.3 5.3" aria-hidden="true">${lines}</svg></div></div>`;
}
const letters = (n, big) => `<div class="bg-letters${big ? ' big' : ''}" aria-label="${n} من 5 خطوط">${LETTERS.map((L,i) => `<span class="${i < n ? 'x' : ''}">${L}</span>`).join('')}</div>`;

let sentKey = '', boardKey = '', freshNum = null, lastCalls = 0;

Lamma.register({
  id:'bingo', icon:'B', name:'بينجو', blurb:'رتّب 1 لـ 25 في السر، واختاروا أرقام بالدور. أول واحد يكمّل 5 خطوط يكسب.', min:2, max:8,

  init(n, prev){
    const starter = prev ? (prev.starter + 1) % n : 0;
    return { phase:'setup', ready:Array(n).fill(false), called:[], callers:[], turn:starter, starter, check:0,
      lines:Array(n).fill(null), shown:Array(n).fill(0), winners:[], boards:Array(n).fill(null),
      score: prev ? prev.score : Array(n).fill(0) };
  },

  act(S, seat, a){
    const p = S.pub;
    const advance = () => {
      const winners = p.lines.map((c, i) => c >= 5 ? i : -1).filter(i => i >= 0);
      p.shown = p.lines.map((c, i) => c ?? p.shown[i]);
      p.check = 0;
      if (winners.length) { p.phase = 'end'; p.winners = winners; winners.forEach(w => p.score[w]++); }
      else p.turn = (p.turn + 1) % S.n;
    };
    if (a.t === 'ready' && p.phase === 'setup') {
      p.ready[seat] = true;
      if (p.ready.every(Boolean)) { p.phase = 'play'; p.turn = p.starter; }
    }
    else if (a.t === 'call' && p.phase === 'play' && seat === p.turn && !p.check && a.n >= 1 && a.n <= 25 && !p.called.includes(a.n)) {
      p.called.push(a.n); p.callers.push(seat); p.check = p.called.length; p.lines = Array(S.n).fill(null);
    }
    else if (a.t === 'lines' && p.phase === 'play' && p.check && a.len === p.check && p.lines[seat] == null) {
      p.lines[seat] = a.count;
      if (p.lines.every(c => c != null)) advance();
    }
    else if (a.t === 'board' && p.phase === 'end' && Array.isArray(a.b)) p.boards[seat] = a.b;
    /* host keeps the game moving when someone drops */
    else if (a.t === 'skip' && seat === S.hostSeat) {
      if (p.phase === 'setup') { p.ready = p.ready.map(() => true); p.phase = 'play'; p.turn = p.starter; }
      else if (p.phase === 'play' && p.check) { p.lines = p.lines.map((c, i) => c ?? p.shown[i]); advance(); }
      else if (p.phase === 'play') p.turn = (p.turn + 1) % S.n;
    }
  },

  sync(ctx){
    const p = ctx.pub, me = ctx.me, b = ctx.local.board;
    if (p.phase === 'play' && p.check && p.check === p.called.length && p.lines[me] == null && b) {
      const k = `${ctx.round}:${me}:${p.check}`;
      if (sentKey !== k) { sentKey = k; ctx.act({ t:'lines', len:p.check, count:doneLines(b, p.called).length }); }
    }
    if (p.phase === 'end' && p.boards[me] == null && b) {
      const k = `${ctx.round}:${me}`;
      if (boardKey !== k) { boardKey = k; ctx.act({ t:'board', b }); }
    }
  },

  render(root, ctx){
    style();
    const p = ctx.pub, me = ctx.me, L = ctx.local, pen = K.color(me);
    if (!L.board) { L.board = Array(25).fill(null); }
    if (p.called.length > lastCalls) { freshNum = p.called[p.called.length-1]; K.tick(660,.09); K.buzz(20); setTimeout(() => { freshNum = null; ctx.rerender(); }, 900); }
    lastCalls = p.called.length;
    const names = ctx.players.map(x => x.name);
    const hostBtn = (label) => ctx.isHost ? `<button class="ghost" data-skip>${label}</button>` : '';

    /* ---- arrange your board ---- */
    if (p.phase === 'setup') {
      if (!p.ready[me]) {
        const placed = L.board.filter(x => x != null).length;
        root.innerHTML = `
          <div class="bg-top"><div><p class="muted">رتّب جدولك في السر</p><div class="who" style="color:${pen}">${esc(names[me])}</div></div>
            <p class="muted">${placed < 25 ? `الرقم الجاي: <b>${placed+1}</b>` : 'الجدول كامل'}</p></div>
          ${boardHTML(L.board, [], pen)}
          <p class="hint">اضغط على أي مربع فاضي يتحط فيه الرقم اللي عليه الدور، أو خلّيها عشوائي.</p>
          <div class="row"><button class="ghost" data-do="shuffle">عشوائي</button><button class="ghost" data-do="fill">كمّل عشوائي</button><button class="ghost" data-do="clear">امسح</button></div>
          <button class="stamp" data-do="ready" ${placed < 25 ? 'disabled' : ''}>جاهز</button>`;
        root.querySelectorAll('.bg-cell').forEach(c => c.onclick = () => {
          const i = +c.dataset.i; if (L.board[i] != null) return;
          L.board[i] = placed + 1; K.tick(440 + placed*12, .05); ctx.saveLocal(); ctx.rerender();
        });
        root.querySelectorAll('[data-do]').forEach(btn => btn.onclick = () => {
          const d = btn.dataset.do;
          if (d === 'shuffle') L.board = K.shuffle([...Array(25)].map((_, i) => i + 1));
          if (d === 'clear') L.board = Array(25).fill(null);
          if (d === 'fill') { let next = L.board.filter(x => x != null).length + 1; K.shuffle(L.board.map((v,i) => v == null ? i : -1).filter(i => i >= 0)).forEach(i => L.board[i] = next++); }
          if (d === 'ready') { ctx.act({ t:'ready' }); K.tick(600); }
          else K.tick(500);
          ctx.saveLocal(); ctx.rerender();
        });
      } else {
        const waiting = p.ready.map((r, i) => r ? -1 : i).filter(i => i >= 0);
        root.innerHTML = `
          <div class="screen center" style="flex:0;gap:10px;padding-top:24px"><span class="dot wait big"></span><h2>مستنيين الباقي يرتّبوا</h2></div>
          <ul class="bg-wait">${ctx.players.map((x, i) => `<li style="--pc:${K.color(i)}"><span>${esc(x.name)}</span><span>${p.ready[i] ? 'جاهز ✓' : ctx.online(i) ? 'بيرتّب…' : 'مش متصل'}</span></li>`).join('')}</ul>
          ${waiting.some(i => !ctx.online(i)) ? hostBtn('ابدأوا من غير اللي مش متصلين') : ''}`;
      }
    }

    /* ---- playing ---- */
    else if (p.phase === 'play') {
      const mine = p.turn === me, myCount = doneLines(L.board, p.called).length;
      const waitingOn = p.check ? p.lines.map((c, i) => c == null ? i : -1).filter(i => i >= 0) : [];
      const stuck = (p.check && waitingOn.some(i => !ctx.online(i))) || (!p.check && !ctx.online(p.turn));
      const pending = ctx.busy ? ctx.local.pendingCall : null;
      const locked = !mine || !!p.check || ctx.busy;
      root.innerHTML = `
        <div class="bg-top"><div><p class="muted">${mine ? 'دورك يا' : 'دلوقتي دور'}</p><div class="who" style="color:${K.color(p.turn)}">${esc(names[p.turn])}</div></div>${letters(myCount)}</div>
        ${boardHTML(L.board, p.called, pen, { fresh:freshNum, locked, pending })}
        ${K.chips(ctx.players.map((x, i) => ({ name:x.name, seat:i, turn:i === p.turn, online:ctx.online(i), extra:p.shown[i] })))}
        <p class="hint">${p.check ? 'بيتشطب عند الكل…' : mine ? 'اختار رقم مش متشطب.' : `استنى ${esc(names[p.turn])} يختار رقم.`}</p>
        ${stuck ? hostBtn(p.check ? 'كمّلوا من غير اللي فصل' : `عدّي دور ${esc(names[p.turn])}`) : ''}
        <div class="bg-hist">${p.called.map((x, k) => `<span style="--pc:${K.color(p.callers[k])}">${x}</span>`).join('')}</div>`;
      root.querySelectorAll('.bg-cell').forEach(c => c.onclick = () => {
        const n = L.board[+c.dataset.i];
        if (locked || p.called.includes(n)) { K.buzz(30); return; }
        ctx.local.pendingCall = n; K.tick(560,.06);
        ctx.act({ t:'call', n }); ctx.rerender();
      });
    }

    /* ---- round over ---- */
    else {
      const w = p.winners;
      const title = w.length > 1 ? `${w.map(i => esc(names[i])).join(' و ')} كسبوا!` : w[0] === me ? 'انت كسبت!' : `${esc(names[w[0]])} كسب!`;
      if (!ctx.local.celebrated) { ctx.local.celebrated = true; ctx.saveLocal(); K.celebrate(); }
      root.innerHTML = `
        <div class="bg-result">${letters(5, true)}<h2>${title}</h2><p class="muted">الجولة خلصت بعد ${p.called.length} رقم.</p></div>
        <div class="bg-minis">${ctx.players.map((x, i) => {
          const b = i === me ? L.board : p.boards[i];
          return `<div class="bg-mini${w.includes(i) ? ' win' : ''}" style="--pen:${K.color(i)}"><div class="nm">${esc(x.name)}</div>${b ? boardHTML(b, p.called, K.color(i), { mini:true }) : '<div class="bg-wrap"><div class="bg-board" style="place-items:center;display:grid"><span class="muted">…</span></div></div>'}</div>`;
        }).join('')}</div>
        ${K.scores(ctx.players, p.score)}
        ${ctx.isHost ? '<button class="stamp" data-again>جولة كمان</button><button class="ghost" data-lobby>رجوع للأوضة</button>' : '<p class="hint">صاحب الأوضة هيبدأ الجولة الجاية.</p>'}`;
      const ag = root.querySelector('[data-again]'); if (ag) ag.onclick = () => ctx.again();
      const lb = root.querySelector('[data-lobby]'); if (lb) lb.onclick = () => ctx.toLobby();
    }
    const sk = root.querySelector('[data-skip]'); if (sk) sk.onclick = () => ctx.act({ t:'skip' });
  },
});
})();
