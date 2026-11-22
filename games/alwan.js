/* ألوان — a shedding card game for 2–8 players (the Crazy Eights family with action cards).
   Match the top card's colour or symbol, or play a colour card. First to empty their hand wins.

   Cards are short strings: colour letter + symbol.
     colours: b (blue) g (green) o (orange) p (purple)
     symbols: 0–9, S (stop: next player loses a turn), R (reverse), D (next draws 2 and loses a turn)
     W  = colour card (choose the colour)   W4 = colour card, next player draws 4 and loses a turn
   Hands are per-seat secrets; the draw pile and discard pile live in secret[n] and secret[n+1]. */
(function(){
const K = Lamma, esc = K.esc;
const COLORS = { b:{ name:'أزرق', css:'#2448c9' }, g:{ name:'أخضر', css:'#167a55' }, o:{ name:'برتقالي', css:'#d4600f' }, p:{ name:'بنفسجي', css:'#7c3aed' } };
const CL = Object.keys(COLORS);
const HAND = 7;

function newDeck(){
  const d = [];
  for (const c of CL) {
    d.push(c + '0');
    for (const s of ['1','2','3','4','5','6','7','8','9','S','R','D']) d.push(c + s, c + s);
  }
  for (let i = 0; i < 4; i++) d.push('W', 'W4');
  return K.shuffle(d);
}
const isWild = c => c[0] === 'W';
const colorOf = c => isWild(c) ? null : c[0];
const symOf = c => isWild(c) ? c : c.slice(1);
const canPlay = (card, top, color) => isWild(card) || colorOf(card) === color || symOf(card) === symOf(top);
const sortHand = h => h.slice().sort((a, b) => {
  const ca = isWild(a) ? 9 : CL.indexOf(a[0]), cb = isWild(b) ? 9 : CL.indexOf(b[0]);
  if (ca !== cb) return ca - cb;
  const order = s => isNaN(+s) ? ({ S:10, R:11, D:12, W:13, W4:14 })[s] : +s;
  return order(symOf(a)) - order(symOf(b));
});

function face(card){
  const s = symOf(card);
  return ({ S:'⊘', R:'⇄', D:'+2', W:'✱', W4:'+4' })[s] ?? s;
}
function label(card){
  const s = symOf(card), col = isWild(card) ? '' : ' ' + COLORS[colorOf(card)].name;
  return (({ S:'وقف', R:'اعكس', D:'اسحب 2', W:'ورقة ألوان', W4:'ألوان اسحب 4' })[s] ?? s) + col;
}
function cardHTML(card, opts = {}){
  const col = isWild(card) ? '' : `--cc:${COLORS[colorOf(card)].css}`;
  return `<${opts.btn ? 'button type="button"' : 'div'} class="aw-card${isWild(card) ? ' wild' : ''}${opts.ok ? ' ok' : ''}${opts.big ? ' big' : ''}" style="${col}" ${opts.btn ? `data-c="${card}" aria-label="${label(card)}"` : ''}>
    <span class="cnr">${face(card)}</span><span class="mid">${face(card)}</span></${opts.btn ? 'button' : 'div'}>`;
}

const css = `
.aw-table{display:flex;align-items:center;justify-content:center;gap:18px;padding:10px 0}
.aw-card{position:relative;width:64px;height:92px;flex:none;border-radius:12px;background:var(--card);border:3px solid var(--cc,var(--ink));color:var(--cc,var(--ink));
  display:grid;place-items:center;font-family:var(--display);box-shadow:2px 3px 0 var(--ink);padding:0;min-height:0}
.aw-card .mid{font-size:34px;line-height:1}
.aw-card .cnr{position:absolute;top:3px;inset-inline-start:6px;font-size:14px;line-height:1}
.aw-card::before{content:"";position:absolute;inset:7px;border-radius:7px;border:1.5px dashed color-mix(in srgb,var(--cc,var(--ink)) 40%,transparent);pointer-events:none}
.aw-card.wild{background:conic-gradient(from 45deg,#2448c9 0 25%,#167a55 0 50%,#d4600f 0 75%,#7c3aed 0);color:#fff;border-color:var(--ink)}
.aw-card.wild .mid{background:var(--card);color:var(--ink);border-radius:50%;width:44px;height:44px;display:grid;place-items:center;font-size:24px}
.aw-card.wild::before{display:none}
.aw-card.big{width:96px;height:138px}
.aw-card.big .mid{font-size:52px}
.aw-card.big.wild .mid{width:64px;height:64px;font-size:34px}
.aw-pile{position:relative;width:64px;height:92px;border-radius:12px;background:repeating-linear-gradient(45deg,var(--ink) 0 6px,#2e3446 6px 12px);border:3px solid var(--ink);color:var(--paper);display:grid;place-items:center;font-family:var(--display);font-size:20px;box-shadow:2px 3px 0 var(--grid)}
.aw-now{display:flex;flex-direction:column;align-items:center;gap:6px}
.aw-swatch{display:inline-flex;align-items:center;gap:6px;font-weight:800;color:var(--sc)}
.aw-swatch::before{content:"";width:16px;height:16px;border-radius:50%;background:var(--sc)}
.aw-hand{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;padding-bottom:4px}
.aw-hand .aw-card{width:56px;height:80px;opacity:.55;cursor:default}
.aw-hand .aw-card .mid{font-size:28px}
.aw-hand .aw-card.wild .mid{width:38px;height:38px;font-size:20px}
.aw-hand .aw-card.ok{opacity:1;cursor:pointer;transform:translateY(-4px)}
.aw-hand.mine-off .aw-card{opacity:1}
.aw-msg{text-align:center;font-weight:700;min-height:1.6em}
.aw-dir{font-size:13px;color:var(--muted);text-align:center}
.aw-pick{position:fixed;inset:0;background:rgba(31,35,48,.55);display:grid;place-items:center;z-index:4;padding:16px}
.aw-pick>div{background:var(--paper);border:3px solid var(--ink);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;width:min(340px,100%);text-align:center}
.aw-pick .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.aw-pick .grid button{background:var(--sc);color:#fff;min-height:64px}
`;
let styled = false;
function style(){ if (styled) return; styled = true; const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

function draw(S, seat, k){
  const n = S.n, deck = S.secret[n], disc = S.secret[n+1];
  for (let i = 0; i < k; i++) {
    if (!deck.length) {                         // reshuffle the discard pile, keeping the top card
      const top = disc.pop();
      deck.push(...K.shuffle(disc)); disc.length = 0; disc.push(top);
      if (!deck.length) break;
    }
    S.secret[seat].push(deck.pop());
  }
  S.secret[seat] = sortHand(S.secret[seat]);
  S.pub.counts[seat] = S.secret[seat].length;
  S.pub.deck = deck.length;
}
const next = (p, n, steps = 1) => ((p.turn + p.dir * steps) % n + n) % n;

let pickFor = null, lastTop = '';

Lamma.register({
  id:'alwan', icon:'◐', name:'ألوان', blurb:'لعبة كوتشينة: طابق اللون أو الرقم، وخلّص ورقك الأول.', min:2, max:8,

  init(n, prev){
    const starter = prev ? (prev.starter + 1) % n : 0;
    return { phase:'play', turn:starter, starter, dir:1, top:null, color:null, counts:Array(n).fill(HAND), deck:0,
      drew:false, msg:'', winner:null, score: prev ? prev.score : Array(n).fill(0) };
  },

  secrets(pub, n){
    const deck = newDeck(), hands = [];
    for (let i = 0; i < n; i++) hands.push(sortHand(deck.splice(-HAND)));
    let top = deck.pop();
    while (isWild(top)) { deck.unshift(top); top = deck.pop(); }
    pub.top = top; pub.color = colorOf(top); pub.deck = deck.length;
    return [...hands, deck, [top]];
  },

  act(S, seat, a){
    const p = S.pub, n = S.n;
    if (p.phase !== 'play') return;
    const who = '';
    if (a.t === 'skip' && seat === S.hostSeat) { p.turn = next(p, n); p.drew = false; p.msg = 'عدّينا الدور'; return; }
    if (seat !== p.turn) return;
    const hand = S.secret[seat];

    if (a.t === 'draw' && !p.drew) {
      draw(S, seat, 1); p.drew = true; p.msg = 'سحب ورقة';
      return;
    }
    if (a.t === 'pass' && p.drew) { p.turn = next(p, n); p.drew = false; p.msg = 'عدّى'; return; }

    if (a.t === 'play') {
      const i = hand.indexOf(a.card);
      if (i < 0 || !canPlay(a.card, p.top, p.color)) return;
      if (isWild(a.card) && !CL.includes(a.color)) return;
      if (p.drew && a.card !== a.drawn && false) return;
      hand.splice(i, 1);
      S.secret[n+1].push(a.card);
      p.top = a.card; p.color = isWild(a.card) ? a.color : colorOf(a.card);
      p.counts[seat] = hand.length; p.drew = false;
      const s = symOf(a.card);
      p.msg = label(a.card) + (isWild(a.card) ? ` ← ${COLORS[p.color].name}` : '');
      if (!hand.length) { p.phase = 'end'; p.winner = seat; p.score[seat]++; return; }
      if (s === 'R') { p.dir = -p.dir; p.turn = n === 2 ? p.turn : next(p, n); return; }
      if (s === 'S') { p.turn = next(p, n, 2); return; }
      if (s === 'D' || s === 'W4') { const v = next(p, n); draw(S, v, s === 'D' ? 2 : 4); p.turn = next(p, n, 2); return; }
      p.turn = next(p, n);
    }
  },

  render(root, ctx){
    style();
    const p = ctx.pub, me = ctx.me, hand = ctx.priv || [], names = ctx.players.map(x => x.name);
    const mine = p.phase === 'play' && p.turn === me && !ctx.busy;
    if (p.top !== lastTop) { lastTop = p.top; K.tick(620, .07); }

    if (p.phase === 'end') {
      if (!ctx.local.celebrated) { ctx.local.celebrated = true; ctx.saveLocal(); if (p.winner === me) K.celebrate(); }
      root.innerHTML = `
        <div class="screen center" style="flex:0;padding-top:12px">${cardHTML(p.top, { big:true })}
          <h2>${p.winner === me ? 'انت خلّصت ورقك وكسبت!' : `${esc(names[p.winner])} كسب!`}</h2></div>
        ${K.scores(ctx.players, p.score)}
        ${ctx.isHost ? '<button class="stamp" data-again>جولة كمان</button><button class="ghost" data-lobby>رجوع للأوضة</button>' : '<p class="hint">صاحب الأوضة هيبدأ الجولة الجاية.</p>'}`;
      root.querySelector('[data-again]')?.addEventListener('click', () => ctx.again());
      root.querySelector('[data-lobby]')?.addEventListener('click', () => ctx.toLobby());
      return;
    }

    const playable = c => mine && canPlay(c, p.top, p.color);
    const anyPlayable = hand.some(playable);
    const stuck = !ctx.online(p.turn);
    root.innerHTML = `
      ${K.chips(ctx.players.map((x, i) => ({ name:x.name, seat:i, turn:i === p.turn, online:ctx.online(i), extra:p.counts[i] + (p.counts[i] === 1 ? ' !' : '') })))}
      <p class="aw-dir">${p.dir === 1 ? 'الدور ماشي ←' : 'الدور ماشي →'} · فاضل في الكومة ${p.deck}</p>
      <div class="aw-table">
        <div class="aw-pile" aria-label="كومة السحب">${p.deck}</div>
        <div class="aw-now">${cardHTML(p.top, { big:true })}<span class="aw-swatch" style="--sc:${COLORS[p.color].css}">${COLORS[p.color].name}</span></div>
      </div>
      <p class="aw-msg">${p.msg ? esc(p.msg) : ''}</p>
      <h3 style="text-align:center;color:${K.color(p.turn)}">${p.turn === me ? 'دورك!' : `دور ${esc(names[p.turn])}`}</h3>
      <div class="aw-hand${p.turn === me ? '' : ' mine-off'}">${hand.map(c => cardHTML(c, { btn:true, ok:playable(c) })).join('')}</div>
      ${p.turn === me ? `<div class="row">
          ${!p.drew ? `<button class="${anyPlayable ? 'ghost' : 'stamp'}" data-draw ${mine ? '' : 'disabled'}>اسحب ورقة</button>`
                    : `<button class="ghost" data-pass ${mine ? '' : 'disabled'}>عدّي</button>`}
        </div>
        <p class="hint">${anyPlayable ? 'العب ورقة من اللي منوّرة.' : p.drew ? 'مفيش ورقة تنفع، عدّي الدور.' : 'مفيش ورقة تنفع، اسحب.'}</p>` : ''}
      ${stuck && ctx.isHost && p.turn !== me ? `<button class="ghost" data-skip>عدّي دور ${esc(names[p.turn])} (مش متصل)</button>` : ''}`;

    root.querySelectorAll('.aw-hand .aw-card').forEach(b => b.onclick = () => {
      const c = b.dataset.c;
      if (!playable(c)) { K.buzz(30); return; }
      if (isWild(c)) { pickFor = c; showPicker(ctx); return; }
      ctx.act({ t:'play', card:c }); K.tick(700, .06);
    });
    root.querySelector('[data-draw]')?.addEventListener('click', () => { ctx.act({ t:'draw' }); K.tick(420, .06); });
    root.querySelector('[data-pass]')?.addEventListener('click', () => ctx.act({ t:'pass' }));
    root.querySelector('[data-skip]')?.addEventListener('click', () => ctx.act({ t:'skip' }));
  },
});

function showPicker(ctx){
  const wrap = document.createElement('div');
  wrap.className = 'aw-pick';
  wrap.innerHTML = `<div><h3>اختار اللون</h3><div class="grid">${CL.map(c => `<button data-col="${c}" style="--sc:${COLORS[c].css}">${COLORS[c].name}</button>`).join('')}</div><button class="ghost" data-x>إلغاء</button></div>`;
  document.body.appendChild(wrap);
  wrap.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.col) { ctx.act({ t:'play', card:pickFor, color:b.dataset.col }); K.tick(700, .06); }
    wrap.remove(); pickFor = null;
  };
}
})();
