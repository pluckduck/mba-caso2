// Gerador dos cinco slides. Cada slide é descrito por uma lista de formas e textos posicionados (em polegadas,
// num quadro 16:9 de 13,333 x 7,5). A mesma descrição alimenta a visualização em HTML e a exportação em PPTX,
// o que garante que o arquivo exportado corresponda ao que se vê na tela e permaneça editável no PowerPoint.
import { fonteCss, fontePptx, misturar, luminancia } from './themes.js';
import { CENARIOS, DIMENSOES, variaveisAtivas, horizonteTxt, simular, classificarValor, numSimples, direcao, catalogo, quadro, SETA as GLIFO } from './modelo.js';
import { FOCUS, IPEA, referenciasPublicadas, fmt, comUnidade } from './refdata.js';

export const W = 13.333, H = 7.5;
export const TITULOS = [
  'Empresa e características comerciais',
  'Indicadores pesquisados no Focus e no Ipea',
  'Cenários base, favorável e adverso',
  'Impactos sobre clientes e vendas',
  'Três decisões comerciais justificadas',
];

const sobre = cor => (luminancia(cor) > 0.42 ? '#111111' : '#FFFFFF');
const limpo = s => String(s ?? '').replace(/\s+\n/g, '\n').trim();
export const limparTexto = limpo;
const R = (x, y, w, h, o = {}) => ({ t: 'rect', x, y, w, h, ...o });
const E = (x, y, w, h, o = {}) => ({ t: 'ellipse', x, y, w, h, ...o });
const LN = (x, y, w, h, o = {}) => ({ t: 'line', x, y, w, h, ...o });
const P = (text, o = {}) => ({ text: String(text ?? ''), ...o });
const TX = (x, y, w, h, paras, o = {}) => ({
  t: 'text', x, y, w, h,
  paras: (Array.isArray(paras) ? paras : [paras]).map(p => (typeof p === 'string' ? P(p) : p)).filter(p => p.text.trim() !== ''),
  max: 12, min: 8, fonte: 'corpo', align: 'left', valign: 'top', ...o,
});

// ---------- Ajuste de texto (medição real no navegador) ----------
let medidor = null;
const cacheAjuste = new Map();

function parasHTML(paras, pt, k) {
  return paras.map((p, i) => {
    const px = (pt * (p.k || 1) / 72) * k;
    const gap = i < paras.length - 1 ? (pt * 0.32 / 72) * k : 0;
    const st = [`font-size:${px.toFixed(2)}px`, `margin:0 0 ${gap.toFixed(2)}px 0`];
    if (p.bold) st.push('font-weight:700');
    if (p.italic) st.push('font-style:italic');
    if (p.color) st.push(`color:${p.color}`);
    if (p.align) st.push(`text-align:${p.align}`);
    if (p.bullet) st.push('padding-left:1em', 'text-indent:-1em');
    const esc = p.text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return `<p style="${st.join(';')}">${p.bullet ? '•&nbsp;' : ''}${esc}</p>`;
  }).join('');
}

function altura(paras, wIn, pt, css) {
  if (!medidor) {
    medidor = document.createElement('div');
    medidor.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;line-height:1.2;white-space:pre-wrap;overflow-wrap:break-word;';
    document.body.appendChild(medidor);
  }
  medidor.style.width = `${wIn * 96 * 0.965}px`;
  medidor.style.fontFamily = css;
  medidor.innerHTML = parasHTML(paras, pt, 96);
  return medidor.offsetHeight / 96;
}

function ajustar(el, tema) {
  const css = fonteCss(tema.fontes[el.fonte]);
  const chave = JSON.stringify([el.paras, el.w, el.h, el.max, el.min, css, el.bold]);
  if (cacheAjuste.has(chave)) return cacheAjuste.get(chave);
  const paras = el.bold ? el.paras.map(p => ({ ...p, bold: true })) : el.paras;
  let pt = el.max, r = null;
  if (!paras.length) r = { size: el.max, paras, cortado: false };
  while (!r) {
    if (altura(paras, el.w, pt, css) <= el.h + 0.01) { r = { size: pt, paras, cortado: false }; break; }
    if (pt - 0.5 < el.min) break;
    pt -= 0.5;
  }
  if (!r) {
    // No tamanho mínimo o texto ainda não cabe: corta ao final e sinaliza para o autor resumir.
    const copia = paras.map(p => ({ ...p }));
    let guarda = 0;
    while (copia.length && altura(copia, el.w, el.min, css) > el.h + 0.01 && guarda++ < 400) {
      const u = copia[copia.length - 1];
      const palavras = u.text.replace(/…$/, '').trim().split(/\s+/);
      if (palavras.length <= 3) { if (copia.length > 1) copia.pop(); else { u.text = palavras.slice(0, 1).join(' ') + '…'; break; } continue; }
      u.text = palavras.slice(0, Math.max(3, Math.floor(palavras.length * 0.9))).join(' ').replace(/[,;:.\s]+$/, '') + '…';
    }
    r = { size: el.min, paras: copia, cortado: true };
  }
  if (cacheAjuste.size > 4000) cacheAjuste.clear();
  cacheAjuste.set(chave, r);
  return r;
}

// ---------- Encaixe dos textos do caso nos slides (avisos de espaço das etapas) ----------
// Tamanho de letra abaixo do qual a leitura em projeção fica difícil. Se o mínimo do bloco já é maior, não existe o estado "apertado".
const conforto = el => Math.max(el.min, Math.min(8.5, el.max - 1));
// Elemento de texto da página que mostra o texto de um bloco (o texto pode vir com prefixo ou junto de outras linhas).
function elementoDoBloco(els, texto) {
  if (!texto) return null;
  const textos = els.filter(e => e.t === 'text');
  return textos.find(e => e.paras.some(p => p.text === texto)) || textos.find(e => e.paras.map(p => p.text).join('\n').includes(texto)) || null;
}
// Quantos caracteres do trecho cabem no elemento, mantido o restante do conteúdo: "limite" (no tamanho mínimo de letra, antes
// de cortar) e "conforto" (sem a letra ficar pequena demais). A estimativa repete o próprio texto como sonda; null se o
// trecho não está inteiro em um parágrafo do elemento.
const cacheCapacidade = new Map();
export function capacidade(el, tema, trecho) {
  const i = trecho ? el.paras.findIndex(p => p.text.includes(trecho)) : -1;
  if (i < 0) return null;
  const css = fonteCss(tema.fontes[el.fonte]);
  const chave = JSON.stringify([el.paras, i, trecho, el.w, el.h, el.max, el.min, css, el.bold]);
  if (cacheCapacidade.has(chave)) return cacheCapacidade.get(chave);
  const base = el.paras[i].text, pos = base.indexOf(trecho);
  const semente = trecho.length >= 40 ? trecho : `${trecho} texto de exemplo para estimar o espaço disponível neste bloco do slide`;
  const sonda = n => { let s = trecho; while (s.length < n) s += ` ${semente}`; return s.slice(0, n); };
  const paras = n => el.paras.map((p, k) => { const q = k === i ? { ...p, text: base.slice(0, pos) + sonda(n) + base.slice(pos + trecho.length) } : p; return el.bold ? { ...q, bold: true } : q; });
  const cabe = (n, pt) => altura(paras(n), el.w, pt, css) <= el.h + 0.01;
  const maximo = pt => {
    if (!cabe(1, pt)) return 0;
    let lo = 1, hi = 64;
    while (hi <= 4096 && cabe(hi, pt)) { lo = hi; hi *= 2; }
    while (hi - lo > 6) { const m = (lo + hi) >> 1; if (cabe(m, pt)) lo = m; else hi = m; }
    return lo;
  };
  const limite = maximo(el.min);
  const r = { limite, conforto: conforto(el) > el.min ? Math.min(limite, maximo(conforto(el))) : limite };
  if (cacheCapacidade.size > 2000) cacheCapacidade.clear();
  cacheCapacidade.set(chave, r);
  return r;
}

// Página em construção e total de páginas (definidos por construir): um slide do roteiro pode ocupar mais de uma página.
let paginaAtual = null, totalPaginas = 5;

// ---------- Blocos de texto com possibilidade de edição específica para o slide ----------
function criarContexto(caso, tema) {
  const blocos = [];
  const c = tema.cores;
  const txt = (slide, key, rotulo, padrao) => {
    const original = limpo(padrao);
    const editado = caso.slides.textos[key];
    const texto = typeof editado === 'string' ? limpo(editado) : original;
    blocos.push({ slide, pag: paginaAtual ? paginaAtual.seq - 1 : slide - 1, key, rotulo, padrao: original, editado: typeof editado === 'string', texto });
    return texto;
  };
  const raio = Math.min(0.3, (tema.el.raio || 0) / 90);
  const tom = misturar(c.superficie, c.primaria, luminancia(c.fundo) < 0.35 ? 0.16 : 0.07);
  const cartao = (x, y, w, h, o = {}) => {
    const base = { r: raio, ...o };
    if (tema.el.cartao === 'preenchido') return R(x, y, w, h, { fill: o.fill || (c.superficie.toUpperCase() === c.fundo.toUpperCase() ? tom : c.superficie), ...base });
    if (tema.el.cartao === 'sombra') return R(x, y, w, h, { fill: o.fill || c.superficie, sombra: true, ...base });
    return R(x, y, w, h, { fill: o.fill || c.superficie, line: c.borda, lw: 0.75, ...base });
  };
  const rotulo = (x, y, w, texto, cor = c.destaque) => TX(x, y, w, 0.24, P(texto.toUpperCase(), { bold: true }), { max: 9, min: 7, color: cor, valign: 'middle' });
  return { caso, tema, c, txt, blocos, raio, tom, cartao, rotulo };
}

function moldura(ctx, n, fontes) {
  const { tema, c, caso } = ctx;
  const el = tema.el;
  const lateral = el.cabecalho === 'lateral';
  const X0 = lateral ? 0.78 : 0.6, X1 = W - 0.6;
  const els = [R(0, 0, W, H, { fill: c.fundo })];

  if (el.deco === 'canto') { els.push(R(W - 1.7, 0, 1.7, 0.16, { fill: c.destaque }), R(W - 0.16, 0, 0.16, 1.7, { fill: c.destaque })); }
  if (el.deco === 'circulos') { els.push(E(W - 1.55, -1.0, 2.5, 2.5, { fill: c.primaria, alpha: 0.13 }), E(W - 2.45, 0.35, 1.0, 1.0, { fill: c.destaque, alpha: 0.2 })); }
  if (el.deco === 'grade') { for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) els.push(E(W - 1.55 + i * 0.2, 0.28 + j * 0.2, 0.06, 0.06, { fill: c.suave, alpha: 0.55 })); }

  const pg = paginaAtual || { seq: n, parte: 1, partes: 1 };
  const tituloBase = TITULOS[n - 1] + (pg.partes > 1 ? ` · ${pg.parte}/${pg.partes}` : '');
  const titulo = el.caixaAlta ? tituloBase.toUpperCase() : tituloBase;
  const numero = `${pg.seq}/${totalPaginas}`;
  const kicker = `ESTUDO DE CASO 2 · CENÁRIOS ECONÔMICOS E ESTRATÉGIAS DE VENDAS`;
  const larguraTitulo = X1 - X0 - (el.deco === 'nenhum' || el.deco === 'barra' ? 0 : 1.9);
  if (el.cabecalho === 'faixa') {
    els.splice(1, 0, R(0, 0, W, 1.22, { fill: c.primaria }));
    els.push(TX(X0, 0.2, larguraTitulo, 0.24, P(kicker, { bold: true }), { max: 9, min: 7, color: misturar(c.sobrePrimaria, c.primaria, 0.25), valign: 'middle' }));
    els.push(TX(X0, 0.44, larguraTitulo, 0.66, titulo, { max: 26, min: 15, fonte: 'titulo', color: c.sobrePrimaria, bold: true, valign: 'middle' }));
  } else {
    if (lateral) els.push(R(0, 0, 0.3, H, { fill: c.primaria }));
    if (el.deco === 'barra') els.push(R(X0, 0.2, 0.9, 0.08, { fill: c.destaque }));
    els.push(TX(X0, 0.32, larguraTitulo, 0.24, P(kicker, { bold: true }), { max: 9, min: 7, color: c.suave, valign: 'middle' }));
    els.push(TX(X0, 0.55, larguraTitulo, 0.66, titulo, { max: el.cabecalho === 'limpo' ? 30 : 26, min: 15, fonte: 'titulo', color: el.cabecalho === 'limpo' ? c.texto : c.primaria, bold: true, valign: 'middle' }));
    if (el.cabecalho === 'linha') els.push(LN(X0, 1.27, X1 - X0, 0, { color: c.destaque, lw: 1.75 }));
  }

  let Y1 = 7.12;
  if (el.rodape) {
    Y1 = 6.74;
    els.push(LN(X0, 6.88, X1 - X0, 0, { color: c.borda, lw: 0.75 }));
    const esquerda = el.fontes && fontes ? `Fontes: ${fontes}` : 'MBA Gestão Comercial e SalesTech';
    els.push(TX(X0, 6.93, X1 - X0 - 3.3, 0.4, esquerda, { max: 8.5, min: 6.5, color: c.suave, valign: 'middle' }));
    const direita = [limpo(caso.ident.empresa), el.numeracao ? numero : ''].filter(Boolean).join('  ·  ');
    els.push(TX(X1 - 3.2, 6.93, 3.2, 0.4, direita, { max: 9, min: 7, color: c.suave, align: 'right', valign: 'middle' }));
  } else if (el.numeracao) {
    els.push(TX(X1 - 1, 7.08, 1, 0.3, numero, { max: 9, min: 7, color: c.suave, align: 'right', valign: 'middle' }));
  }
  return { els, X0, X1, Y0: 1.5, Y1 };
}

const FONTE_FOCUS = () => `Focus – Relatório de Mercado (BCB), ${FOCUS.dataTxt}`;
const FONTE_IPEA = () => `${IPEA.curto} (Ipea), ${IPEA.periodo}`;

// ---------- Slide 1: empresa ----------
function slide1(ctx) {
  const { caso, c, txt, cartao, rotulo } = ctx;
  const m = moldura(ctx, 1, 'elaboração do autor a partir do diagnóstico da empresa.');
  const { els, X0, X1, Y0, Y1 } = m;
  const hA = Y1 - Y0, wE = 4.05, gap = 0.22;
  const cp = sobre(c.primaria) === '#FFFFFF' && luminancia(c.sobrePrimaria) > 0.5 ? c.sobrePrimaria : sobre(c.primaria);
  els.push(R(X0, Y0, wE, hA, { fill: c.primaria, r: ctx.raio }));
  els.push(TX(X0 + 0.28, Y0 + 0.24, wE - 0.56, 0.24, P('EMPRESA ANALISADA', { bold: true }), { max: 9, min: 7, color: misturar(cp, c.primaria, 0.25), valign: 'middle' }));
  els.push(TX(X0 + 0.28, Y0 + 0.52, wE - 0.56, 1.15, txt(1, 's1.empresa', 'Empresa', caso.ident.empresa || 'Nome da empresa'), { max: 30, min: 15, fonte: 'titulo', color: cp, bold: true }));
  const meta = [P(`Autor: ${limpo(caso.ident.aluno) || '—'}`), P(`Horizonte dos cenários: ${horizonteTxt(caso.ident)}`)];
  els.push(TX(X0 + 0.28, Y0 + 1.75, wE - 0.56, 0.62, meta, { max: 11, min: 8, color: cp }));

  const vars = variaveisAtivas(caso).slice(0, 8);
  const yB = Y0 + 2.55;
  els.push(LN(X0 + 0.28, yB - 0.1, wE - 0.56, 0, { color: misturar(cp, c.primaria, 0.55), lw: 0.75 }));
  els.push(TX(X0 + 0.28, yB, wE - 0.56, 0.24, P('SENSIBILIDADE ÀS VARIÁVEIS', { bold: true }), { max: 9, min: 7, color: misturar(cp, c.primaria, 0.25), valign: 'middle' }));
  const espaco = Y1 - 0.25 - (yB + 0.34);
  const passo = Math.min(0.5, espaco / Math.max(vars.length, 1));
  const niveis = ['', 'baixa', 'média', 'alta'];
  vars.forEach((v, i) => {
    const y = yB + 0.34 + i * passo;
    const s = Math.max(1, Math.min(3, Number(v.sensibilidade) || 2));
    els.push(TX(X0 + 0.28, y, wE - 0.56, passo * 0.5, `${v.nome} — ${niveis[s]}`, { max: 10, min: 7, color: cp, valign: 'middle' }));
    const wT = wE - 0.56, yT = y + passo * 0.56, hT = Math.min(0.1, passo * 0.2);
    els.push(R(X0 + 0.28, yT, wT, hT, { fill: misturar(c.primaria, cp, 0.22), r: hT / 2 }));
    els.push(R(X0 + 0.28, yT, wT * (s / 3), hT, { fill: cp, r: hT / 2 }));
  });
  if (!vars.length) els.push(TX(X0 + 0.28, yB + 0.34, wE - 0.56, 0.6, 'Selecione as variáveis na etapa 2.', { max: 10, min: 8, color: cp, italic: true }));

  const xD = X0 + wE + gap, wD = X1 - xD, wC = (wD - gap) / 2, hC = (hA - gap) / 2;
  const cards = [
    ['s1.setor', 'Setor e portfólio', caso.diag.setor],
    ['s1.clientes', 'Perfil dos clientes', caso.diag.clientes],
    ['s1.mercado', 'Dinâmica do mercado', caso.diag.mercado],
    ['s1.exposicao', 'Exposição macroeconômica', caso.diag.exposicao],
  ];
  cards.forEach(([key, rot, valor], i) => {
    const x = xD + (i % 2) * (wC + gap), y = Y0 + Math.floor(i / 2) * (hC + gap);
    els.push(cartao(x, y, wC, hC));
    els.push(rotulo(x + 0.2, y + 0.16, wC - 0.4, rot));
    els.push(TX(x + 0.2, y + 0.46, wC - 0.4, hC - 0.62, txt(1, key, rot, valor), { max: 13, min: 8, color: c.texto }));
  });
  return els;
}

// ---------- Slide 2: indicadores ----------
// Cada variável mostra três blocos (dado observado, projeção publicada e revisão da projeção) e a leitura da tendência.
// Até 4 variáveis: uma página, com as consultas embaixo. A partir de 5: páginas de até 5 linhas em tamanho cheio;
// a última leva as linhas restantes (até 4) e as consultas ao Focus e ao Ipea.
function paginas2(ctx) {
  const vars = variaveisAtivas(ctx.caso);
  if (vars.length <= 4) return [() => pagina2(ctx, vars, 0, true)];
  const grupos = [];
  for (let i = 0; i < vars.length; i += 5) grupos.push({ ini: i, vars: vars.slice(i, i + 5) });
  if (grupos.at(-1).vars.length === 5) grupos.push({ ini: vars.length, vars: [] });
  return grupos.map((g, k) => () => pagina2(ctx, g.vars, g.ini, k === grupos.length - 1));
}
// Parágrafos de um bloco do quadro: valor, seta com a diferença e legenda. Sem dado: traço e o motivo.
function blocoQuadro(b, c, vazio = '') {
  if (!b) return [P('—', { bold: true, color: c.suave, k: 1.3 }), P(vazio, { color: c.suave, k: 0.82 })];
  const paras = [P(b.valor, { bold: true, color: b.cor || c.primaria, k: 1.3 })];
  const d = b.deltaCurto ?? b.delta;
  if (b.dir && d) paras.push(P(`${GLIFO[b.dir]} ${d}`));
  if (b.curta) paras.push(P(b.curta, { color: c.suave, k: 0.82 }));
  return paras;
}
function pagina2(ctx, vars, ini, comConsultas) {
  const { caso, c, txt, cartao, tom } = ctx;
  const m = moldura(ctx, 2, `${FONTE_FOCUS()}; ${FONTE_IPEA()}; dados observados: Banco Central do Brasil e IBGE.`);
  const { els, X0, X1, Y0, Y1 } = m;
  const wT = X1 - X0, gap = 0.16, hCab = 0.5;
  const total = variaveisAtivas(caso).length;
  const hStrip = !comConsultas ? 0 : (vars.length || !total) ? 1.12 : Y1 - Y0;
  if (vars.length || !total) {
    const prop = [0.13, 0.18, 0.18, 0.15, 0.36];
    const xs = prop.reduce((a, p, i) => { a.push(i === 0 ? X0 : a[i - 1] + prop[i - 1] * wT); return a; }, []);
    const cab = [['', 'Variável'], ['Dado observado', 'Onde está hoje'], ['Projeção publicada', 'Para onde deve ir'], ['Revisão da projeção', 'A previsão mudou?'], ['', 'Implicação para a empresa']];
    const corSub = misturar(c.sobrePrimaria, c.primaria, 0.25);
    els.push(R(X0, Y0, wT, hCab, { fill: c.primaria, r: ctx.raio * 0.5 }));
    cab.forEach(([sub, t], i) => els.push(TX(xs[i] + 0.1, Y0, prop[i] * wT - 0.2, hCab, sub ? [P(sub.toUpperCase(), { k: 0.72, color: corSub }), P(t, { bold: true })] : P(t, { bold: true }), { max: 10.5, min: 8, color: c.sobrePrimaria, valign: 'middle' })));
    const area = Y1 - Y0 - hCab - (hStrip ? hStrip + gap : 0);
    const hRow = Math.min(1.25, area / Math.max(vars.length, 1));
    vars.forEach((v, i) => {
      const n = ini + i + 1, y = Y0 + hCab + i * hRow, q = quadro(v);
      if (i % 2 === 1) els.push(R(X0, y, wT, hRow, { fill: tom }));
      els.push(LN(X0, y + hRow, wT, 0, { color: c.borda, lw: 0.5 }));
      const cel = (j, paras, o = {}) => els.push(TX(xs[j] + 0.1, y + 0.06, prop[j] * wT - 0.2, hRow - 0.12, paras, { max: 10.5, min: 7, color: c.texto, valign: 'middle', ...o }));
      cel(0, P(txt(2, `s2.nome.${v.uid}`, `Variável ${n}: nome`, v.nome), { bold: true }), { max: 11 });
      const leitura = txt(2, `s2.tendencia.${v.uid}`, `Variável ${n}: leitura da tendência`, v.tendencia);
      // Uma linha para a leitura; duas quando o texto é longo (por exemplo, o que o autor escreveu por extenso).
      const hL = leitura.length > 100 ? Math.min(0.34, hRow * 0.34) : Math.min(0.2, hRow * 0.2);
      const hC = hRow - 0.12 - (leitura ? hL : 0);
      const bloco = (j, paras) => els.push(TX(xs[j] + 0.1, y + 0.06, prop[j] * wT - 0.2, hC, paras, { max: 10, min: 7, color: c.texto, valign: 'middle' }));
      // Projeção: a publicada (com seta em relação a hoje) ou, para hipótese e estimativa, o valor com a sua natureza.
      const dado = txt(2, `s2.dado.${v.uid}`, `Variável ${n}: dado ou projeção`, v.dado);
      const hipotese = v.natureza === 'Hipótese do autor';
      const proj = q.proj ? { ...q.proj, valor: dado || q.proj.valor }
        : (dado && v.natureza !== 'Dado observado' ? { valor: dado, dir: null, cor: hipotese ? c.destaque : null, curta: [limpo(v.natureza), limpo(v.periodo)].filter(Boolean).join(' · ') } : null);
      bloco(1, blocoQuadro(q.hoje, c, 'sem dado observado carregado'));
      bloco(2, blocoQuadro(proj, c, 'sem projeção publicada'));
      bloco(3, blocoQuadro(q.rev, c, q.proj ? 'sem edição anterior para comparar' : ''));
      if (leitura) els.push(TX(xs[1] + 0.1, y + 0.06 + hC, (prop[1] + prop[2] + prop[3]) * wT - 0.2, hL, P(`Leitura: ${leitura}`, { italic: true }), { max: 8.5, min: 7, color: c.texto, valign: 'middle' }));
      cel(4, txt(2, `s2.implicacao.${v.uid}`, `Variável ${n}: implicação`, v.implicacao));
    });
    if (!total) els.push(TX(X0, Y0 + hCab + 0.2, wT, 0.5, 'Registre ao menos três variáveis na etapa 2.', { max: 12, color: c.suave, italic: true }));
  }
  if (hStrip) {
    const yS = Y1 - hStrip, wS = (wT - gap) / 2, alto = hStrip > 2;
    const consultas = [
      ['s2.focus', `Relatório Focus${caso.consultas.focusData ? ` — ${limpo(caso.consultas.focusData)}` : ''}`, caso.consultas.focusTexto],
      ['s2.ipea', `Ipea — ${limpo(caso.consultas.ipeaTitulo) || 'Carta de Conjuntura'}`, caso.consultas.ipeaTexto],
    ];
    consultas.forEach(([key, rot, valor], i) => {
      const x = X0 + i * (wS + gap), hT = alto ? 0.4 : 0.26;
      els.push(cartao(x, yS, wS, hStrip));
      els.push(R(x, yS, 0.07, hStrip, { fill: c.destaque }));
      els.push(TX(x + 0.22, yS + (alto ? 0.2 : 0.1), wS - 0.4, hT, P(rot, { bold: true }), { max: alto ? 14 : 10, min: 7.5, color: c.primaria, valign: 'middle' }));
      els.push(TX(x + 0.22, yS + (alto ? 0.75 : 0.38), wS - 0.4, hStrip - (alto ? 0.95 : 0.48), txt(2, key, rot, valor), { max: alto ? 14 : 10.5, min: 7, color: c.texto }));
    });
  }
  return els;
}

// ---------- Slide 3: cenários ----------
// Até 4 variáveis: uma página (cartões dos cenários e gráfico). A partir de 5: a primeira página traz premissas e
// fundamentação; as seguintes, a tabela com a trajetória de todas as variáveis (até 6 por página).
const FONTES3 = () => `${FONTE_FOCUS()}; ${FONTE_IPEA()}; hipóteses do autor. P = valor publicado nas fontes; H = hipótese do autor.`;
const corCenario = (c, cor) => (cor === c.fundo ? c.texto : (luminancia(c.superficie) < 0.35 ? cor : misturar(cor, c.texto, 0.25)));
function paginas3(ctx) {
  const vars = variaveisAtivas(ctx.caso);
  if (vars.length <= 4) return [() => slide3(ctx)];
  const fns = [() => slide3Premissas(ctx)];
  for (let i = 0; i < vars.length; i += 6) { const g = vars.slice(i, i + 6); fns.push(() => slide3Tabela(ctx, g)); }
  return fns;
}
function slide3Premissas(ctx) {
  const { caso, c, txt, cartao, rotulo } = ctx;
  const { els, X0, X1, Y0, Y1 } = moldura(ctx, 3, FONTES3());
  const gap = 0.2, wC = (X1 - X0 - 2 * gap) / 3, hC = Y1 - Y0;
  CENARIOS.forEach((s, i) => {
    const cen = caso.cenarios[s.id], cor = c[s.id], x = X0 + i * (wC + gap);
    els.push(cartao(x, Y0, wC, hC));
    els.push(R(x, Y0, wC, 0.46, { fill: cor, r: ctx.raio }));
    if (ctx.raio > 0) els.push(R(x, Y0 + 0.23, wC, 0.23, { fill: cor }));
    els.push(TX(x + 0.2, Y0, wC - 0.4, 0.46, P(s.nome, { bold: true }), { max: 14, min: 10, fonte: 'titulo', color: sobre(cor), valign: 'middle' }));
    let y = Y0 + 0.62;
    els.push(rotulo(x + 0.2, y, wC - 0.4, 'Premissas', c.suave));
    els.push(TX(x + 0.2, y + 0.28, wC - 0.4, 1.95, txt(3, `s3.premissas.${s.id}`, `${s.nome}: premissas`, cen.premissas), { max: 12, min: 8, color: c.texto }));
    y += 2.4;
    els.push(rotulo(x + 0.2, y, wC - 0.4, 'Fundamentação', c.suave));
    const padrao = [limpo(cen.publicadas) && `Projeções publicadas: ${limpo(cen.publicadas)}`, limpo(cen.hipoteses) && `Hipóteses do autor: ${limpo(cen.hipoteses)}`].filter(Boolean).join('\n');
    const fund = txt(3, `s3.fund.${s.id}`, `${s.nome}: fundamentação`, padrao);
    els.push(TX(x + 0.2, y + 0.28, wC - 0.4, Y0 + hC - 0.16 - (y + 0.28), fund.split('\n').map(l => P(l)), { max: 11, min: 7.5, color: c.texto }));
  });
  return els;
}
function slide3Tabela(ctx, vars) {
  const { caso, c, txt, tom } = ctx;
  const { els, X0, X1, Y0, Y1 } = moldura(ctx, 3, FONTES3());
  const wT = X1 - X0, hCab = 0.45, w0 = 1.8, wS = 2.6, wG = wT - w0 - 3 * wS;
  const cab = (x, w, t, cor) => { els.push(R(x, Y0, w, hCab, { fill: cor })); els.push(TX(x + 0.12, Y0, w - 0.24, hCab, P(t, { bold: true }), { max: 10.5, min: 8, color: sobre(cor), valign: 'middle' })); };
  cab(X0, w0, 'Variável', c.primaria);
  CENARIOS.forEach((s, i) => cab(X0 + w0 + i * wS, wS, s.nome, c[s.id]));
  cab(X0 + w0 + 3 * wS, wG, 'Comparação', c.primaria);
  const hRow = Math.min(0.96, (Y1 - Y0 - hCab) / vars.length);
  vars.forEach((v, r) => {
    const y = Y0 + hCab + r * hRow;
    if (r % 2 === 1) els.push(R(X0, y, wT, hRow, { fill: tom }));
    els.push(LN(X0, y + hRow, wT, 0, { color: c.borda, lw: 0.5 }));
    els.push(TX(X0 + 0.12, y + 0.05, w0 - 0.24, hRow - 0.1, [P(v.nome, { bold: true }), P(limpo(v.unidade), { color: c.suave, k: 0.8 })], { max: 10.5, min: 7.5, color: c.texto, valign: 'middle' }));
    const vals = CENARIOS.map(s => numSimples(caso.cenarios[s.id].traj[v.uid]?.valor));
    CENARIOS.forEach((s, i) => {
      const t = caso.cenarios[s.id].traj[v.uid] || {}, n = vals[i];
      const cls = classificarValor(referenciasPublicadas(v.tipo), t.valor);
      const valor = n === null ? '—' : `${comUnidade(n, v.unidade)}${cls ? `  (${cls.tipo})` : ''}`;
      const just = txt(3, `s3.just.${s.id}.${v.uid}`, `${v.nome} — ${s.curto}: justificativa`, t.justificativa);
      els.push(TX(X0 + w0 + i * wS + 0.12, y + 0.05, wS - 0.24, hRow - 0.1, [P(valor, { bold: true, color: corCenario(c, c[s.id]), k: 1.25 }), P(just)], { max: 9.5, min: 7, color: c.texto, valign: 'middle' }));
    });
    // Barras comparativas dos três cenários, na mesma escala do gráfico do slide único.
    const validos = vals.filter(n => n !== null), hi = Math.max(...validos, 0), lo = Math.min(...validos, 0);
    const xG = X0 + w0 + 3 * wS + 0.12, hB = Math.min(0.26, (hRow - 0.14) / 3), yB = y + (hRow - 3 * hB) / 2, wMax = wG - 0.24 - 0.8 - 0.62;
    CENARIOS.forEach((s, k) => {
      const yy = yB + k * hB, n = vals[k], frac = n === null || hi === lo ? 0 : (n - lo) / (hi - lo);
      els.push(TX(xG, yy, 0.76, hB, s.curto, { max: 8.5, min: 6.5, color: c.texto, valign: 'middle' }));
      els.push(R(xG + 0.8, yy + hB * 0.25, wMax, hB * 0.5, { fill: ctx.tom, r: 0.03 }));
      if (frac > 0) els.push(R(xG + 0.8, yy + hB * 0.25, Math.max(0.03, wMax * frac), hB * 0.5, { fill: c[s.id], r: 0.03 }));
      els.push(TX(xG + 0.8 + wMax + 0.06, yy, 0.56, hB, P(n === null ? '—' : fmt(n, 2), { bold: true }), { max: 9, min: 6.5, color: c.texto, valign: 'middle' }));
    });
  });
  return els;
}
function slide3(ctx) {
  const { caso, c, txt, cartao, rotulo } = ctx;
  const m = moldura(ctx, 3, FONTES3());
  const { els, X0, X1, Y0, Y1 } = m;
  const vars = variaveisAtivas(caso).slice(0, 4);
  const gap = 0.2, hG = 1.3, wC = (X1 - X0 - 2 * gap) / 3, hC = Y1 - Y0 - hG - gap;
  CENARIOS.forEach((s, i) => {
    const cen = caso.cenarios[s.id], cor = c[s.id], x = X0 + i * (wC + gap);
    els.push(cartao(x, Y0, wC, hC));
    els.push(R(x, Y0, wC, 0.46, { fill: cor, r: ctx.raio }));
    if (ctx.raio > 0) els.push(R(x, Y0 + 0.23, wC, 0.23, { fill: cor }));
    els.push(TX(x + 0.2, Y0, wC - 0.4, 0.46, P(s.nome, { bold: true }), { max: 14, min: 10, fonte: 'titulo', color: sobre(cor), valign: 'middle' }));
    let y = Y0 + 0.56;
    els.push(rotulo(x + 0.2, y, wC - 0.4, 'Premissas', c.suave));
    els.push(TX(x + 0.2, y + 0.26, wC - 0.4, 0.92, txt(3, `s3.premissas.${s.id}`, `${s.nome}: premissas`, cen.premissas), { max: 11, min: 7.5, color: c.texto }));
    y += 1.26;
    const hLinha = Math.min(0.3, 1.1 / Math.max(vars.length, 1));
    vars.forEach((v, j) => {
      const yy = y + j * hLinha, t = cen.traj[v.uid] || {};
      const cls = classificarValor(referenciasPublicadas(v.tipo), t.valor);
      const n = numSimples(t.valor);
      els.push(LN(x + 0.2, yy, wC - 0.4, 0, { color: c.borda, lw: 0.5 }));
      els.push(TX(x + 0.2, yy, wC - 2.0, hLinha, v.nome, { max: 10, min: 7, color: c.texto, valign: 'middle' }));
      const valor = n === null ? '—' : `${comUnidade(n, v.unidade)}${cls ? `  (${cls.tipo})` : ''}`;
      els.push(TX(x + wC - 1.85, yy, 1.65, hLinha, P(valor, { bold: true }), { max: 10.5, min: 7, color: cor === c.fundo ? c.texto : (luminancia(c.superficie) < 0.35 ? cor : misturar(cor, c.texto, 0.25)), align: 'right', valign: 'middle' }));
    });
    y += Math.max(vars.length, 1) * hLinha + 0.08;
    const resto = Y0 + hC - 0.14 - y;
    if (resto > 0.45) {
      els.push(rotulo(x + 0.2, y, wC - 0.4, 'Fundamentação', c.suave));
      const just = vars.map(v => { const j = limpo(cen.traj[v.uid]?.justificativa); return j ? `${v.nome}: ${j}` : ''; }).filter(Boolean).join(' ');
      const padrao = limpo(cen.hipoteses) ? `Hipóteses do autor: ${limpo(cen.hipoteses)}` : just;
      els.push(TX(x + 0.2, y + 0.25, wC - 0.4, resto - 0.25, txt(3, `s3.fund.${s.id}`, `${s.nome}: fundamentação`, padrao), { max: 9.5, min: 7, color: c.texto }));
    }
  });

  // Gráfico comparativo: uma pequena série de barras por variável.
  const yG = Y1 - hG;
  els.push(cartao(X0, yG, X1 - X0, hG));
  if (vars.length) {
    const wV = (X1 - X0 - 0.3) / vars.length;
    vars.forEach((v, j) => {
      const x = X0 + 0.15 + j * wV;
      const vals = CENARIOS.map(s => numSimples(caso.cenarios[s.id].traj[v.uid]?.valor));
      const validos = vals.filter(n => n !== null);
      const hi = Math.max(...validos, 0), lo = Math.min(...validos, 0);
      els.push(TX(x + 0.08, yG + 0.08, wV - 0.16, 0.24, P(`${v.nome}${v.unidade ? ` (${v.unidade})` : ''}`, { bold: true }), { max: 9, min: 6.5, color: c.suave, valign: 'middle' }));
      CENARIOS.forEach((s, k) => {
        const yy = yG + 0.38 + k * 0.28, n = vals[k];
        els.push(TX(x + 0.08, yy, 0.82, 0.24, s.curto, { max: 8.5, min: 6.5, color: c.texto, valign: 'middle' }));
        const wMax = wV - 0.16 - 0.86 - 0.72;
        const frac = n === null || hi === lo ? 0 : (n - lo) / (hi - lo);
        els.push(R(x + 0.92, yy + 0.05, wMax, 0.14, { fill: ctx.tom, r: 0.03 }));
        if (frac > 0) els.push(R(x + 0.92, yy + 0.05, Math.max(0.03, wMax * frac), 0.14, { fill: c[s.id], r: 0.03 }));
        els.push(TX(x + 0.92 + wMax + 0.06, yy, 0.66, 0.24, P(n === null ? '—' : fmt(n, 2), { bold: true }), { max: 9, min: 6.5, color: c.texto, valign: 'middle' }));
      });
    });
  } else {
    els.push(TX(X0 + 0.2, yG + 0.2, X1 - X0 - 0.4, 0.5, 'Defina as trajetórias das variáveis na etapa 3.', { max: 11, color: c.suave, italic: true }));
  }
  return els;
}

const SETA = { sobe: '↑', cai: '↓', estavel: '(estável)' };

// ---------- Slide 4: impactos ----------
// Até 4 variáveis: uma página (matriz, cadeia de causa e efeito e simulador). A partir de 5: a primeira página traz a
// matriz; as seguintes, a cadeia de todas as variáveis (até 6 por página), com o simulador na última.
const F4 = () => `elaboração do autor com base em ${FONTE_FOCUS()} e ${FONTE_IPEA()}.`;
// Movimento da variável no cenário base em relação ao dado observado ("hoje"); sem dado observado, em relação à evidência registrada.
function movimentoBase(caso, v) {
  const q = quadro(v);
  const base = numSimples(caso.cenarios.base.traj[v.uid]?.valor);
  const ref = q.hoje ? q.hoje.num : numSimples(v.valorNum);
  return { d: direcao(base, ref), base, ref, deHoje: Boolean(q.hoje), casas: q.hoje?.casas ?? 2 };
}
function paginas4(ctx) {
  const vars = variaveisAtivas(ctx.caso);
  if (vars.length <= 4) return [() => slide4(ctx)];
  const fns = [() => slide4Matriz(ctx)];
  for (let i = 0; i < vars.length; i += 6) { const g = vars.slice(i, i + 6), ultima = i + 6 >= vars.length; fns.push(() => slide4Cadeias(ctx, g, ultima)); }
  return fns;
}
function matriz4(ctx, els, X0, Y0, wT, hTotal, maxTxt = 10) {
  const { caso, c, txt, tom } = ctx;
  const w0 = 2.05, wC = (wT - w0) / 3, hCab = 0.4, hRow = (hTotal - hCab) / DIMENSOES.length;
  els.push(R(X0, Y0, w0, hCab, { fill: c.primaria }));
  els.push(TX(X0 + 0.1, Y0, w0 - 0.2, hCab, P('Dimensão comercial', { bold: true }), { max: 10.5, min: 8, color: c.sobrePrimaria, valign: 'middle' }));
  CENARIOS.forEach((s, i) => {
    const x = X0 + w0 + i * wC;
    els.push(R(x, Y0, wC, hCab, { fill: c[s.id] }));
    els.push(TX(x + 0.1, Y0, wC - 0.2, hCab, P(s.nome, { bold: true }), { max: 10.5, min: 8, color: sobre(c[s.id]), valign: 'middle' }));
  });
  DIMENSOES.forEach((d, r) => {
    const y = Y0 + hCab + r * hRow;
    if (r % 2 === 1) els.push(R(X0, y, wT, hRow, { fill: tom }));
    els.push(LN(X0, y + hRow, wT, 0, { color: c.borda, lw: 0.5 }));
    els.push(TX(X0 + 0.1, y + 0.05, w0 - 0.2, hRow - 0.1, P(d.curto, { bold: true }), { max: 10.5, min: 8, color: c.primaria, valign: 'middle' }));
    CENARIOS.forEach((s, i) => {
      els.push(TX(X0 + w0 + i * wC + 0.1, y + 0.05, wC - 0.2, hRow - 0.1, txt(4, `s4.${d.id}.${s.id}`, `${d.curto} — ${s.curto}`, caso.impactos[s.id][d.id]), { max: maxTxt, min: 6.5, color: c.texto, valign: 'middle' }));
    });
  });
}
function simulador4(ctx, els, sim, x, yS, wSim, hS) {
  const { c, cartao, rotulo, tom } = ctx;
  els.push(cartao(x, yS, wSim, hS));
  els.push(rotulo(x + 0.18, yS + 0.08, wSim - 0.36, 'Receita estimada ante o cenário base (hipótese do autor)', c.primaria));
  const alvo = ['favoravel', 'adverso'], maxAbs = Math.max(...alvo.map(k => Math.abs(sim[k].delta)), 0.0001);
  alvo.forEach((k, i) => {
    const yy = yS + 0.42 + i * 0.34, dlt = sim[k].delta, wMax = wSim - 0.36 - 0.9 - 0.85;
    els.push(TX(x + 0.18, yy, 0.9, 0.26, CENARIOS.find(s => s.id === k).curto, { max: 9.5, min: 7, color: c.texto, valign: 'middle' }));
    els.push(R(x + 1.08, yy + 0.06, wMax, 0.14, { fill: tom, r: 0.03 }));
    els.push(R(x + 1.08, yy + 0.06, Math.max(0.03, wMax * Math.abs(dlt) / maxAbs), 0.14, { fill: c[k], r: 0.03 }));
    els.push(TX(x + 1.08 + wMax + 0.06, yy, 0.8, 0.26, P(`${dlt > 0 ? '+' : ''}${fmt(dlt, 1)}%`, { bold: true }), { max: 10, min: 7, color: c.texto, valign: 'middle' }));
  });
}
function slide4Matriz(ctx) {
  const { els, X0, X1, Y0, Y1 } = moldura(ctx, 4, F4());
  matriz4(ctx, els, X0, Y0, X1 - X0, Y1 - Y0, 11);
  return els;
}
function slide4Cadeias(ctx, vars, ultima) {
  const { caso, c, txt, tom } = ctx;
  const { els, X0, X1, Y0, Y1 } = moldura(ctx, 4, F4());
  const wT = X1 - X0, hCab = 0.45, gap = 0.16, hS = 1.18, wSeta = 0.3, w0 = 3.14, wE = (wT - w0 - 2 * wSeta) / 2;
  const sim = simular(caso), comSim = ultima && sim.temDados;
  const xC = X0 + w0 + wSeta, xV = xC + wE + wSeta;
  els.push(R(X0, Y0, wT, hCab, { fill: c.primaria, r: ctx.raio * 0.5 }));
  [[X0, w0, 'Variável no cenário base'], [xC, wE, 'Efeito no cliente'], [xV, wE, 'Efeito nas vendas']].forEach(([x, w, t]) =>
    els.push(TX(x + 0.12, Y0, w - 0.24, hCab, P(t, { bold: true }), { max: 10.5, min: 8, color: c.sobrePrimaria, valign: 'middle' })));
  const hRow = Math.min(1.0, (Y1 - Y0 - hCab - (comSim ? hS + gap : 0)) / vars.length);
  vars.forEach((v, r) => {
    const y = Y0 + hCab + r * hRow, k = caso.impactos.base.cadeias[v.uid] || {}, mv = movimentoBase(caso, v);
    if (r % 2 === 1) els.push(R(X0, y, wT, hRow, { fill: tom }));
    els.push(LN(X0, y + hRow, wT, 0, { color: c.borda, lw: 0.5 }));
    const mov = !mv.d ? 'sem valor no cenário base ou sem referência'
      : mv.d === 'estavel' ? `${GLIFO.estavel} mantém ${comUnidade(mv.base, v.unidade)}${mv.deHoje ? ', o nível de hoje' : ''}`
      : `${GLIFO[mv.d]} de ${comUnidade(mv.ref, v.unidade, mv.casas)}${mv.deHoje ? ' (hoje)' : ''} para ${comUnidade(mv.base, v.unidade)}`;
    els.push(TX(X0 + 0.12, y + 0.05, w0 - 0.24, hRow - 0.1, [P(v.nome, { bold: true }), P(mov, { k: 0.88 })], { max: 10.5, min: 7.5, color: c.texto, valign: 'middle' }));
    [[xC, 'cliente', 'efeito no cliente'], [xV, 'vendas', 'efeito nas vendas']].forEach(([x, campo, rot]) => {
      els.push(TX(x - wSeta, y, wSeta, hRow, '→', { max: 13, min: 10, color: c.suave, align: 'center', valign: 'middle' }));
      els.push(TX(x + 0.12, y + 0.05, wE - 0.24, hRow - 0.1, txt(4, `s4.cad.${campo}.${v.uid}`, `${v.nome}: ${rot}`, k[campo]), { max: 10, min: 7, color: c.texto, valign: 'middle' }));
    });
  });
  if (comSim) simulador4(ctx, els, sim, X0, Y1 - hS, wT, hS);
  return els;
}
function slide4(ctx) {
  const { caso, c, txt, cartao, rotulo } = ctx;
  const m = moldura(ctx, 4, F4());
  const { els, X0, X1, Y0, Y1 } = m;
  const vars = variaveisAtivas(caso).slice(0, 4);
  const wT = X1 - X0, hS = vars.length > 3 ? 1.5 : 1.18, gap = 0.16;   // a quarta variável pede mais uma linha na cadeia
  matriz4(ctx, els, X0, Y0, wT, Y1 - Y0 - hS - gap);

  const sim = simular(caso);
  const yS = Y1 - hS, wSim = sim.temDados ? 3.9 : 0, wCad = wT - wSim - (wSim ? gap : 0);
  els.push(cartao(X0, yS, wCad, hS));
  els.push(R(X0, yS, 0.07, hS, { fill: c.destaque }));
  els.push(rotulo(X0 + 0.22, yS + 0.08, wCad - 0.4, 'Cadeia de causa e efeito no cenário base: variável → cliente → vendas', c.primaria));
  const cadeia = vars.map(v => {
    const k = caso.impactos.base.cadeias[v.uid] || {};
    if (!limpo(k.cliente) && !limpo(k.vendas)) return '';
    const d = movimentoBase(caso, v).d;
    return `${v.nome}${d ? ' ' + SETA[d] : ''} → ${limpo(k.cliente) || '…'} → ${limpo(k.vendas) || '…'}`;
  }).filter(Boolean).join('\n');
  const tCad = txt(4, 's4.cadeia', 'Cadeia de causa e efeito', cadeia);
  els.push(TX(X0 + 0.22, yS + 0.36, wCad - 0.4, hS - 0.46, tCad.split('\n').map(l => P(l, { bullet: true })), { max: 10, min: 6.5, color: c.texto }));
  if (wSim) simulador4(ctx, els, sim, X0 + wCad + gap, yS, wSim, hS);
  return els;
}

// ---------- Slide 5: decisões ----------
export const notaDecisoesExtras = n => (n === 1 ? '+1 decisão disponível no relatório completo' : `+${n} decisões disponíveis no relatório completo`);
function slide5(ctx) {
  const { caso, c, txt, cartao, rotulo } = ctx;
  const m = moldura(ctx, 5, `elaboração do autor com base em ${FONTE_FOCUS()} e ${FONTE_IPEA()}.`);
  const { els, X0, X1, Y0, Y1 } = m;
  // O slide traz as três primeiras decisões; as demais ficam no relatório, e uma nota avisa quantas são.
  const extras = caso.decisoes.slice(3).filter(d => limpo(d.acao)).length, hNota = extras ? 0.24 : 0;
  const gap = 0.2, hS = 1.12, wC = (X1 - X0 - 2 * gap) / 3, hC = Y1 - Y0 - hS - 0.16 - hNota;
  const dec = caso.decisoes.slice(0, 3);
  while (dec.length < 3) dec.push({ uid: `vazio${dec.length}`, acao: '', evidencia: '', risco: '', contribuicao: '' });
  dec.forEach((d, i) => {
    const x = X0 + i * (wC + gap);
    els.push(cartao(x, Y0, wC, hC));
    els.push(E(x + 0.2, Y0 + 0.2, 0.5, 0.5, { fill: c.primaria }));
    els.push(TX(x + 0.2, Y0 + 0.2, 0.5, 0.5, P(String(i + 1), { bold: true }), { max: 16, min: 12, fonte: 'titulo', color: c.sobrePrimaria, align: 'center', valign: 'middle' }));
    els.push(TX(x + 0.82, Y0 + 0.14, wC - 1.02, 0.86, P(txt(5, `s5.acao.${d.uid}`, `Decisão ${i + 1}: ação comercial`, d.acao), { bold: true }), { max: 13, min: 8.5, fonte: 'titulo', color: c.texto, valign: 'middle' }));
    els.push(LN(x + 0.2, Y0 + 1.08, wC - 0.4, 0, { color: c.borda, lw: 0.5 }));
    const blocos = [['evidencia', 'Indicador, evidência e impacto'], ['risco', 'Risco mitigado ou oportunidade'], ['contribuicao', 'Contribuição para vendas e rentabilidade']];
    const hB = (hC - 1.16 - 0.1) / 3;
    blocos.forEach(([campo, rot], j) => {
      const y = Y0 + 1.16 + j * hB;
      els.push(rotulo(x + 0.2, y, wC - 0.4, rot));
      els.push(TX(x + 0.2, y + 0.24, wC - 0.4, hB - 0.3, txt(5, `s5.${campo}.${d.uid}`, `Decisão ${i + 1}: ${rot.toLowerCase()}`, d[campo]), { max: 10.5, min: 7, color: c.texto }));
    });
  });
  const yS = Y1 - hS;
  if (extras) els.push(TX(X0, Y0 + hC + 0.05, X1 - X0, 0.22, notaDecisoesExtras(extras), { max: 9, min: 7, color: c.suave, align: 'right', valign: 'middle' }));
  els.push(R(X0, yS, X1 - X0, hS, { fill: c.primaria, r: ctx.raio }));
  els.push(TX(X0 + 0.25, yS + 0.1, X1 - X0 - 0.5, 0.24, P('SÍNTESE EXECUTIVA', { bold: true }), { max: 9, min: 7, color: misturar(c.sobrePrimaria, c.primaria, 0.2), valign: 'middle' }));
  els.push(TX(X0 + 0.25, yS + 0.36, X1 - X0 - 0.5, hS - 0.46, txt(5, 's5.sintese', 'Síntese executiva', caso.sintese), { max: 12, min: 7.5, color: c.sobrePrimaria }));
  return els;
}

// Constrói as páginas dos cinco slides do roteiro, já com o tamanho de fonte ajustado, além da lista de blocos
// editáveis e dos alertas. Um slide com 5 ou mais variáveis ocupa mais de uma página ("1/2", "2/2"); "paginas"
// informa, para cada página, o slide do roteiro (n), a parte e o total de partes.
export function construir(caso, tema) {
  const ctx = criarContexto(caso, tema);
  const plano = [[() => slide1(ctx)], paginas2(ctx), paginas3(ctx), paginas4(ctx), [() => slide5(ctx)]];
  totalPaginas = plano.reduce((a, fns) => a + fns.length, 0);
  const slides = [], paginas = [];
  plano.forEach((fns, i) => fns.forEach((fn, j) => {
    paginaAtual = { n: i + 1, parte: j + 1, partes: fns.length, seq: slides.length + 1 };
    slides.push(fn());
    paginas.push({ ...paginaAtual, rotulo: `Slide ${i + 1}${fns.length > 1 ? ` (parte ${j + 1}/${fns.length})` : ''}` });
  }));
  paginaAtual = null;
  const alertas = [];
  // encaixe[chave do bloco]: como o texto do bloco ficou no slide (cabe, apertado ou cortado), para os avisos das etapas.
  const encaixe = {};
  slides.forEach((els, i) => {
    let menor = 99, cortes = 0;
    for (const el of els) {
      if (el.t !== 'text') continue;
      const r = ajustar(el, tema);
      el.size = r.size; el.fit = r.paras; el.cortado = r.cortado;
      if (el.paras.length && el.max >= 10) menor = Math.min(menor, r.size);
      if (r.cortado) cortes++;
    }
    const rot = paginas[i].rotulo;
    for (const b of ctx.blocos) {
      if (b.pag !== i) continue;
      const el = elementoDoBloco(els, b.texto);
      if (el) encaixe[b.key] = { slide: paginas[i].n, rotulo: rot, size: el.size, cortado: el.cortado, estado: el.cortado ? 'nao' : el.size < conforto(el) ? 'apertado' : 'ok', el };
    }
    if (cortes) alertas.push({ slide: paginas[i].n, tipo: 'corte', texto: `${rot}: ${cortes === 1 ? '1 bloco de texto não coube e foi cortado' : `${cortes} blocos de texto não couberam e foram cortados`}. Resuma o texto do slide.` });
    else if (menor < 8.5) alertas.push({ slide: paginas[i].n, tipo: 'fonte', texto: `${rot}: há texto em corpo ${fmt(menor, 1)} pt, difícil de ler em projeção. Considere resumir.` });
  });
  return { slides, paginas, blocos: ctx.blocos, alertas, encaixe };
}
// Índice da primeira página de um slide do roteiro (1 a 5) no resultado de construir.
export const paginaDoSlide = (res, n) => Math.max(0, res.paginas.findIndex(p => p.n === n));

// ---------- Renderização em HTML ----------
export function renderHTML(els, tema, px = 1280) {
  const k = px / W;
  const raiz = document.createElement('div');
  raiz.className = 'slide';
  raiz.style.cssText = `width:${px}px;height:${(px * H) / W}px;position:relative;overflow:hidden;line-height:1.2;`;
  const partes = [];
  for (const el of els) {
    const pos = `position:absolute;left:${(el.x * k).toFixed(2)}px;top:${(el.y * k).toFixed(2)}px;width:${(el.w * k).toFixed(2)}px;`;
    if (el.t === 'rect' || el.t === 'ellipse') {
      const st = [pos, `height:${(el.h * k).toFixed(2)}px`, 'box-sizing:border-box'];
      if (el.fill) st.push(`background:${el.fill}`);
      if (el.line) st.push(`border:${Math.max(1, (el.lw || 0.75) / 72 * k).toFixed(2)}px solid ${el.line}`);
      if (el.t === 'ellipse') st.push('border-radius:50%'); else if (el.r) st.push(`border-radius:${(el.r * k).toFixed(2)}px`);
      if (el.alpha !== undefined) st.push(`opacity:${el.alpha}`);
      if (el.sombra) st.push('box-shadow:0 2px 10px rgba(0,0,0,.16)');
      partes.push(`<div style="${st.join(';')}"></div>`);
    } else if (el.t === 'line') {
      const esp = Math.max(1, (el.lw || 0.75) / 72 * k);
      partes.push(`<div style="${pos}height:${esp.toFixed(2)}px;background:${el.color};margin-top:${(-esp / 2).toFixed(2)}px"></div>`);
    } else if (el.t === 'text') {
      const jus = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[el.valign];
      const st = [pos, `height:${(el.h * k).toFixed(2)}px`, 'display:flex', 'flex-direction:column', `justify-content:${jus}`, `color:${el.color || tema.cores.texto}`,
        `font-family:${fonteCss(tema.fontes[el.fonte])}`, `text-align:${el.align}`, 'white-space:pre-wrap', 'overflow-wrap:break-word', 'overflow:hidden'];
      if (el.italic) st.push('font-style:italic');
      partes.push(`<div style="${st.join(';').replace(/"/g, '&quot;')}"><div>${parasHTML(el.fit || el.paras, el.size || el.max, k)}</div></div>`);
    }
  }
  raiz.innerHTML = partes.join('');
  return raiz;
}

// ---------- Exportação em PPTX (PptxGenJS, carregado sob demanda) ----------
const hx = c => String(c).replace('#', '').toUpperCase();

function carregarPptx() {
  if (window.PptxGenJS) return Promise.resolve();
  return new Promise((ok, erro) => {
    const s = document.createElement('script');
    s.src = 'vendor/pptxgen.bundle.js';
    s.onload = ok; s.onerror = () => erro(new Error('Não foi possível carregar o gerador de PPTX.'));
    document.head.appendChild(s);
  });
}

export async function exportarPptx(caso, tema, notas = []) {
  await carregarPptx();
  const { slides, paginas } = construir(caso, tema);
  const pptx = new window.PptxGenJS();
  pptx.defineLayout({ name: 'CASO2', width: W, height: H });
  pptx.layout = 'CASO2';
  pptx.title = `Estudo de Caso 2 — ${caso.ident.empresa || 'Cenários econômicos e estratégias de vendas'}`;
  pptx.author = caso.ident.aluno || '';
  pptx.subject = 'MBA Gestão Comercial e SalesTech — Cenários Econômicos em Vendas';
  slides.forEach((els, i) => {
    const sl = pptx.addSlide();
    for (const el of els) {
      const g = { x: el.x, y: el.y, w: el.w, h: el.h };
      if (el.t === 'rect' || el.t === 'ellipse') {
        if (el.x === 0 && el.y === 0 && el.w === W && el.h === H) { sl.background = { color: hx(el.fill) }; continue; }
        const o = { ...g };
        o.fill = el.fill ? { color: hx(el.fill), transparency: el.alpha !== undefined ? Math.round((1 - el.alpha) * 100) : 0 } : { type: 'none' };
        o.line = el.line ? { color: hx(el.line), width: el.lw || 0.75 } : { type: 'none' };
        if (el.sombra) o.shadow = { type: 'outer', color: '000000', opacity: 0.18, blur: 8, offset: 2, angle: 90 };
        if (el.t === 'ellipse') sl.addShape(pptx.ShapeType.ellipse, o);
        else if (el.r) sl.addShape(pptx.ShapeType.roundRect, { ...o, rectRadius: Math.min(el.r, el.w / 2, el.h / 2) });
        else sl.addShape(pptx.ShapeType.rect, o);
      } else if (el.t === 'line') {
        sl.addShape(pptx.ShapeType.line, { x: el.x, y: el.y, w: el.w, h: 0, line: { color: hx(el.color), width: el.lw || 0.75 } });
      } else if (el.t === 'text') {
        const paras = el.fit || el.paras;
        if (!paras.length) continue;
        const size = el.size || el.max;
        const runs = paras.map((p, j) => ({
          text: p.text,
          options: {
            bold: Boolean(p.bold || el.bold), italic: Boolean(p.italic || el.italic), color: hx(p.color || el.color || tema.cores.texto),
            fontSize: Math.round(size * (p.k || 1) * 10) / 10, breakLine: j < paras.length - 1, align: p.align || el.align,
            paraSpaceAfter: j < paras.length - 1 ? Math.round(size * 0.32 * 10) / 10 : 0,
            ...(p.bullet ? { bullet: { indent: Math.round(size) } } : {}),
          },
        }));
        sl.addText(runs, { ...g, fontFace: fontePptx(tema.fontes[el.fonte]), fontSize: size, align: el.align, valign: el.valign, margin: 0, lineSpacingMultiple: 1.0, fit: 'shrink', wrap: true });
      }
    }
    const nota = notas[paginas[i].n - 1];
    if (nota) sl.addNotes(nota);
  });
  const nome = `Caso2_${(caso.ident.empresa || 'cenarios').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'cenarios'}.pptx`;
  await pptx.writeFile({ fileName: nome });
  return nome;
}

// Notas do apresentador: fontes completas e lembretes por slide.
export function notasApresentador(caso) {
  const fontes = `Fontes: ${FOCUS.citacao} ${IPEA.citacao}`;
  return [
    `Apresente a empresa, o perfil dos clientes e por que as variáveis escolhidas importam para o negócio.\n${fontes}`,
    `Para cada indicador, diferencie dado observado, projeção publicada e hipótese; informe fonte, data e período.\n${fontes}`,
    `Explique as premissas de cada cenário para ${horizonteTxt(caso.ident)}. P = valor publicado nas fontes; H = hipótese do autor.\n${fontes}`,
    `Percorra a cadeia: variável econômica → efeito no cliente → efeito nas vendas. Estimativas de receita são hipóteses do autor.\n${fontes}`,
    `Para cada decisão, indique o risco mitigado ou a oportunidade capturada e o indicador que a sustenta.\n${fontes}`,
  ];
}
