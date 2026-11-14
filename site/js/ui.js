// Utilitários de interface: criação de elementos, campos, modal, avisos, gráficos SVG e montagem de slides.
import { renderHTML, W, H } from './slides.js';
import { fmt } from './refdata.js';

export function h(tag, attrs = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else if (k === 'checked') el.checked = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat(Infinity)) {
    if (f === null || f === undefined || f === false) continue;
    el.append(f.nodeType ? f : document.createTextNode(String(f)));
  }
  return el;
}

let idSeq = 0;
// Campo de formulário com rótulo, ajuda e ligação direta ao estado (obj[chave]).
export function campo({ rotulo, ajuda, obj, chave, aoMudar, linhas = 3, tipo = 'textarea', placeholder = '', opcoes, classe = '', atributos = {} }) {
  const id = `c${++idSeq}`;
  let entrada;
  const valor = obj[chave] ?? '';
  const mudar = e => { obj[chave] = e.target.value; aoMudar?.(e.target.value, e); };
  if (tipo === 'textarea') entrada = h('textarea', { id, rows: linhas, placeholder, oninput: mudar, ...atributos }, valor);
  else if (tipo === 'select') {
    entrada = h('select', { id, onchange: mudar, ...atributos }, opcoes.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; return h('option', { value: v }, t); }));
    entrada.value = valor;
  } else entrada = h('input', { id, type: tipo, placeholder, value: valor, oninput: mudar, ...atributos });
  return h('div', { class: `campo ${classe}` },
    rotulo && h('label', { for: id }, rotulo),
    entrada,
    ajuda && h('p', { class: 'ajuda' }, ajuda));
}

export function botao(texto, aoClicar, classe = '', attrs = {}) {
  return h('button', { type: 'button', class: `btn ${classe}`, onclick: aoClicar, ...attrs }, texto);
}

export function aviso(texto, tipo = 'ok') {
  let area = document.getElementById('avisos');
  if (!area) { area = h('div', { id: 'avisos', role: 'status', 'aria-live': 'polite' }); document.body.append(area); }
  const el = h('div', { class: `aviso ${tipo}` }, texto);
  area.append(el);
  setTimeout(() => el.remove(), tipo === 'erro' ? 7000 : 3500);
}

export function modal(titulo, conteudo, { largo = false } = {}) {
  const fechar = () => { fundo.remove(); document.removeEventListener('keydown', tecla); };
  const tecla = e => { if (e.key === 'Escape') fechar(); };
  const fundo = h('div', { class: 'modal-fundo', onmousedown: e => { if (e.target === fundo) fechar(); } },
    h('div', { class: `modal ${largo ? 'largo' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo },
      h('header', {}, h('h3', {}, titulo), h('button', { class: 'btn fantasma', 'aria-label': 'Fechar', onclick: fechar }, '✕')),
      h('div', { class: 'modal-corpo' }, conteudo)));
  document.body.append(fundo);
  document.addEventListener('keydown', tecla);
  return fechar;
}

export function selo(texto, classe = '') { return h('span', { class: `selo ${classe}` }, texto); }

// ---------- Gráficos SVG ----------
const NS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs = {}, ...filhos) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) el.setAttribute(k, v);
  for (const f of filhos.flat()) if (f) el.append(f.nodeType ? f : document.createTextNode(String(f)));
  return el;
}

// Minigráfico da revisão das expectativas: há 4 semanas → há 1 semana → hoje.
export function faisca(valores, cor = 'var(--c-primaria)') {
  const w = 54, alt = 18, v = valores.filter(x => x !== null);
  const lo = Math.min(...v), hi = Math.max(...v), amp = hi - lo || 1;
  const pts = v.map((x, i) => [3 + (i * (w - 6)) / (v.length - 1), alt - 3 - ((x - lo) / amp) * (alt - 6)]);
  return svg('svg', { width: w, height: alt, viewBox: `0 0 ${w} ${alt}`, class: 'faisca', 'aria-hidden': 'true' },
    svg('polyline', { points: pts.map(p => p.join(',')).join(' '), fill: 'none', stroke: cor, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }),
    svg('circle', { cx: pts.at(-1)[0], cy: pts.at(-1)[1], r: 2.4, fill: cor }));
}

// Barras horizontais agrupadas: grupos = [{ nome, itens: [{ rotulo, valor, cor }] }]
export function barrasGrupos(grupos, { casas = 2, sufixo = '' } = {}) {
  const linhaH = 22, topo = 22, larg = 520, xRot = 150, xVal = 70;
  let y = 0;
  const filhos = [];
  for (const g of grupos) {
    const vals = g.itens.map(i => i.valor).filter(v => v !== null && v !== undefined);
    const hi = Math.max(...vals, 0), lo = Math.min(...vals, 0), amp = hi - lo || 1;
    filhos.push(svg('text', { x: 0, y: y + 14, class: 'g-titulo' }, g.nome));
    y += topo;
    const zero = xRot + ((0 - lo) / amp) * (larg - xRot - xVal);
    for (const it of g.itens) {
      filhos.push(svg('text', { x: 0, y: y + 14, class: 'g-rot' }, it.rotulo));
      filhos.push(svg('rect', { x: xRot, y: y + 3, width: larg - xRot - xVal, height: 14, rx: 3, class: 'g-trilho' }));
      if (it.valor !== null && it.valor !== undefined) {
        const xv = xRot + ((it.valor - lo) / amp) * (larg - xRot - xVal);
        filhos.push(svg('rect', { x: Math.min(zero, xv), y: y + 3, width: Math.max(2, Math.abs(xv - zero)), height: 14, rx: 3, fill: it.cor }));
        filhos.push(svg('text', { x: larg - xVal + 6, y: y + 14, class: 'g-val' }, `${fmt(it.valor, casas)}${sufixo}`));
      } else filhos.push(svg('text', { x: larg - xVal + 6, y: y + 14, class: 'g-val' }, '—'));
      y += linhaH;
    }
    y += 10;
  }
  return svg('svg', { viewBox: `0 0 ${larg} ${Math.max(y, 10)}`, class: 'grafico', role: 'img' }, filhos);
}

// Linhas: series = [{ nome, cor, pontos: [[rotuloX, valor]], tracejado }]
export function linhas(series, rotulosX, { casas = 2 } = {}) {
  const larg = 520, alt = 220, mE = 46, mD = 16, mT = 14, mB = 30;
  const todos = series.flatMap(s => s.pontos.map(p => p[1])).filter(v => v !== null);
  let lo = Math.min(...todos), hi = Math.max(...todos);
  const folga = (hi - lo || 1) * 0.15; lo -= folga; hi += folga;
  const X = i => mE + (i * (larg - mE - mD)) / Math.max(rotulosX.length - 1, 1);
  const Y = v => mT + (1 - (v - lo) / (hi - lo)) * (alt - mT - mB);
  const filhos = [];
  for (let i = 0; i <= 4; i++) {
    const v = lo + ((hi - lo) * i) / 4;
    filhos.push(svg('line', { x1: mE, x2: larg - mD, y1: Y(v), y2: Y(v), class: 'g-grade' }));
    filhos.push(svg('text', { x: mE - 6, y: Y(v) + 4, class: 'g-eixo', 'text-anchor': 'end' }, fmt(v, casas)));
  }
  rotulosX.forEach((r, i) => filhos.push(svg('text', { x: X(i), y: alt - 8, class: 'g-eixo', 'text-anchor': 'middle' }, r)));
  for (const s of series) {
    const pts = s.pontos.map(([r, v]) => (v === null ? null : [X(rotulosX.indexOf(r)), Y(v), v])).filter(Boolean);
    if (pts.length > 1) filhos.push(svg('polyline', { points: pts.map(p => `${p[0]},${p[1]}`).join(' '), fill: 'none', stroke: s.cor, 'stroke-width': 2.2, 'stroke-dasharray': s.tracejado ? '5 4' : null }));
    for (const p of pts) {
      filhos.push(svg('circle', { cx: p[0], cy: p[1], r: 3.6, fill: s.cor }));
      filhos.push(svg('text', { x: p[0], y: p[1] - 8, class: 'g-val', 'text-anchor': 'middle' }, fmt(p[2], casas)));
    }
  }
  return svg('svg', { viewBox: `0 0 ${larg} ${alt}`, class: 'grafico', role: 'img' }, filhos);
}

export function anel(pct, tamanho = 84) {
  const r = tamanho / 2 - 7, circ = 2 * Math.PI * r;
  return svg('svg', { width: tamanho, height: tamanho, viewBox: `0 0 ${tamanho} ${tamanho}`, class: 'anel', role: 'img', 'aria-label': `${pct}% concluído` },
    svg('circle', { cx: tamanho / 2, cy: tamanho / 2, r, class: 'anel-trilho' }),
    svg('circle', { cx: tamanho / 2, cy: tamanho / 2, r, class: 'anel-valor', 'stroke-dasharray': `${(circ * pct) / 100} ${circ}`, transform: `rotate(-90 ${tamanho / 2} ${tamanho / 2})` }),
    svg('text', { x: tamanho / 2, y: tamanho / 2 + tamanho * 0.07, 'text-anchor': 'middle', class: 'anel-texto', style: `font-size:${Math.max(11, Math.round(tamanho * 0.2))}px` }, `${pct}%`));
}

// ---------- Slides ----------
// Monta um slide em escala para caber no contêiner (o slide é desenhado a 1280 px e reduzido por transform).
export function montarSlide(els, tema, classe = '') {
  const caixa = h('div', { class: `slide-caixa ${classe}` });
  const slide = renderHTML(els, tema, 1280);
  slide.style.transformOrigin = 'top left';
  // Fora do fluxo: o slide (1280 px antes da escala) não deve alargar o contêiner.
  slide.style.position = 'absolute'; slide.style.left = '0'; slide.style.top = '0';
  caixa.append(slide);
  const ajustar = () => { const s = caixa.clientWidth / 1280; if (s > 0) { slide.style.transform = `scale(${s})`; caixa.style.height = `${(1280 * H / W) * s}px`; } };
  new ResizeObserver(ajustar).observe(caixa);
  requestAnimationFrame(ajustar);
  return caixa;
}
