// Relatório do caso: os cinco quadros do roteiro ("Análise de cenários e decisões comerciais"), no formato de tabelas do
// material da disciplina, com o texto completo das etapas (sem resumo nem corte). O mesmo modelo alimenta a tela, a
// impressão em PDF e o arquivo do Word. A aparência é fixa: o tema visual vale só para os slides.
import { h } from './ui.js';
import { FOCUS, IPEA, referenciasPublicadas, fmt, comUnidade } from './refdata.js';
import { CENARIOS, DIMENSOES, variaveisAtivas, horizonteTxt, mesesHorizonte, simular, classificarValor, numSimples, direcao, quadro, catalogo, serieDe, observadoEm, cenariosTxt, SETA } from './modelo.js';
import { zip } from './zip.js';

const limpo = s => String(s ?? '').trim();
const linha = (rot, val) => ({ t: 'linha', rot, val: limpo(val) });
const campo = (rot, txt, linhas = 2) => ({ t: 'campo', rot, txt: limpo(txt), linhas });
const rotulo = txt => ({ t: 'rot', txt });
const nota = txt => ({ t: 'nota', txt });

const TXT_DIR = { sobe: 'sobe', cai: 'cai', estavel: 'fica estável' };
// Movimento da variável no cenário: o base é comparado com o dado de hoje; os demais, com o cenário base.
function movimento(caso, v, sId) {
  const base = caso.cenarios.base.traj[v.uid]?.valor;
  if (sId === 'base') {
    const q = quadro(v), d = direcao(base, q.hoje ? q.hoje.num : v.valorNum);
    return d ? { dir: d, txt: `${TXT_DIR[d]} ${q.hoje ? 'ante hoje' : 'ante o dado atual'}` } : null;
  }
  const d = direcao(caso.cenarios[sId].traj[v.uid]?.valor, base);
  return d ? { dir: d, txt: `${TXT_DIR[d]} ante o cenário base` } : null;
}

function blocoQuadro(v) {
  const q = quadro(v);
  if (!q.temQuadro) return null;
  // A legenda da projeção é a curta: fonte, publicação e período completos vêm logo abaixo, nos campos do modelo.
  const b = (tag, titulo, x, vazio, curta = false) => ({ tag, titulo, valor: x ? x.valor : '—', dir: x?.dir && x.delta ? x.dir : null, delta: x?.dir && x.delta ? x.delta : '', leg: x ? ((curta && x.curta) || x.longa) : vazio });
  return { t: 'quadro', blocos: [
    b('Dado observado', 'Onde está hoje', q.hoje, 'Ainda não há dado observado carregado para esta variável.'),
    b('Projeção publicada', 'Para onde deve ir', q.proj, 'O dado registrado não é uma projeção publicada.', true),
    b('Revisão da projeção', 'A previsão mudou?', q.rev, q.proj ? 'Sem edição anterior carregada para comparar.' : 'Não se aplica.')] };
}

// Referências do documento: as duas edições usadas no caso, as séries de dados observados e as fontes que o autor registrou à mão.
function referencias(caso) {
  const refs = [`${FOCUS.citacao} Disponível em: ${FOCUS.url}.`, `${IPEA.citacao} Disponível em: ${IPEA.url}.`];
  const vistos = new Set();
  for (const v of variaveisAtivas(caso)) {
    const cat = catalogo(v.tipo), serie = cat ? serieDe(cat.id) : null, o = v.origem || null;
    const obs = serie ? observadoEm(serie, o?.fonte === 'ipea' ? IPEA.data : FOCUS.data) : null;
    if (obs && !vistos.has(serie)) {
      vistos.add(serie);
      refs.push(`${obs.meta.fonte.split(/[(,]/)[0].trim().toUpperCase()}. ${obs.meta.nome}: ${obs.atual.rotulo}. Fonte: ${obs.meta.fonte}.`);
    }
    if (!o && limpo(v.fonte)) {
      const t = [limpo(v.fonte), limpo(v.publicacao)].filter(Boolean).join(', ');
      if (!vistos.has(t)) { vistos.add(t); refs.push(/[.!?]$/.test(t) ? t : `${t}.`); }
    }
  }
  return refs;
}

// Modelo do relatório: cabeçalho e seções, cada uma com uma tabela de duas colunas (rótulo | conteúdo) e/ou blocos soltos.
// Campo sem texto fica com "txt" vazio e é desenhado como linhas em branco, iguais às do modelo da disciplina.
export function montarRelatorio(caso) {
  const vars = variaveisAtivas(caso);
  const meses = mesesHorizonte(caso.ident);
  const secoes = [];

  secoes.push({ num: '01', titulo: 'Diagnóstico do negócio e exposição macroeconômica', tabela: { c1: 'Dimensão estratégica', c2: 'Registro executivo', linhas: [
    { titulo: 'Identificação', blocos: [linha('Participante:', caso.ident.aluno), linha('Empresa:', caso.ident.empresa)] },
    { titulo: 'Setor e portfólio', blocos: [campo('Setor de atuação e principais produtos ou serviços.', caso.diag.setor, 3)] },
    { titulo: 'Perfil dos clientes', blocos: [campo('Segmentos atendidos e necessidades que orientam a compra.', caso.diag.clientes, 3)] },
    { titulo: 'Dinâmica do mercado', blocos: [campo('Características do mercado relevantes para o desempenho comercial.', caso.diag.mercado, 3)] },
    { titulo: 'Exposição macroeconômica', blocos: [campo('Variáveis prioritárias e mecanismos pelos quais afetam o negócio.', caso.diag.exposicao, 4)] },
  ] } });

  const linhasVar = [...vars, ...Array(Math.max(0, 3 - vars.length)).fill(null)].map((v, i) => ({
    titulo: `Variável ${i + 1}`, sub: v ? v.nome : '', subVazio: !v,
    blocos: [v ? blocoQuadro(v) : null,
      linha('Dado ou projeção / unidade:', v?.dado), linha('Natureza da informação:', v?.natureza), linha('Fonte / título:', v?.fonte),
      linha('Publicação / período de referência:', v ? [limpo(v.publicacao), limpo(v.periodo)].filter(Boolean).join(' / ') : ''),
      campo('Tendência e evidência de sustentação:', v?.tendencia), campo('Implicação para o mercado da empresa:', v?.implicacao)].filter(Boolean) }));
  secoes.push({ num: '02', titulo: 'Evidências econômicas e implicações para o negócio', tabela: { c1: 'Indicador / fonte', c2: 'Evidência e interpretação executiva', linhas: [
    ...linhasVar,
    { titulo: 'Relatório Focus', sub: 'Consulta obrigatória', blocos: [linha('Data / período:', caso.consultas.focusData), campo('Expectativas relevantes e contribuição para a análise:', caso.consultas.focusTexto, 3)] },
    { titulo: 'Carta de Conjuntura — Ipea', sub: 'Consulta obrigatória', blocos: [linha('Título / publicação / período:', caso.consultas.ipeaTitulo), campo('Argumento central e contribuição para a análise:', caso.consultas.ipeaTexto, 3)] },
  ] } });

  const trajetorias = sId => (vars.length ? vars : [null, null, null]).map((v, i) => {
    if (!v) return { t: 'traj', nome: `Variável ${i + 1}`, valor: '', selo: null, just: '' };
    const t = caso.cenarios[sId].traj[v.uid] || {}, n = numSimples(t.valor);
    const cls = classificarValor(referenciasPublicadas(v.tipo), t.valor);
    return { t: 'traj', nome: v.nome, valor: n === null ? '' : comUnidade(n, v.unidade), selo: cls?.tipo || null, just: limpo(t.justificativa) };
  });
  secoes.push({ num: '03', titulo: 'Arquitetura de cenários — Horizonte de 12 meses',
    intro: [rotulo('Premissas, evidências e hipóteses por cenário'), linha('Horizonte comum:', meses ? `de ${horizonteTxt(caso.ident)} (${meses} ${meses === 1 ? 'mês' : 'meses'}).` : '')],
    tabela: { c1: 'Cenário', c2: 'Premissas, trajetórias e fundamentação', linhas: CENARIOS.map(s => ({ titulo: s.nome, sub: s.desc, blocos: [
      campo('Condição econômica e premissas centrais', caso.cenarios[s.id].premissas),
      rotulo('Trajetória das variáveis e justificativas'), ...trajetorias(s.id),
      campo('Projeções publicadas — fonte e data', caso.cenarios[s.id].publicadas),
      campo('Hipóteses próprias — fundamentação', caso.cenarios[s.id].hipoteses)] })) } });

  const sim = simular(caso);
  secoes.push({ num: '04', titulo: 'Impactos comerciais e relações de causa e efeito', tabela: { c1: 'Cenário', c2: 'Análise dos impactos e fundamentação', linhas: CENARIOS.map(s => {
    const imp = caso.impactos[s.id];
    const cadeias = (vars.length ? vars : [null]).map(v => (v
      ? { t: 'cadeia', nome: v.nome, mov: movimento(caso, v, s.id), cliente: limpo(imp.cadeias[v.uid]?.cliente), vendas: limpo(imp.cadeias[v.uid]?.vendas) }
      : { t: 'campo', rot: '', txt: '', linhas: 2 }));
    const d = sim[s.id]?.delta;
    const sens = s.id !== 'base' && sim[s.id]?.usados > 0
      ? nota(`Exercício de sensibilidade (hipótese do autor): receita estimada ${d > 0 ? '+' : d < 0 ? '−' : ''}${fmt(Math.abs(d), 1)}% em relação ao cenário base.`) : null;
    return { titulo: s.curto, blocos: [
      ...DIMENSOES.map(dm => campo(`${dm.nome}:`, imp[dm.id], dm.id === 'clientes' || dm.id === 'resultado' ? 2 : 1)),
      rotulo('Fundamentação: variável → efeito no cliente → efeito nas vendas.'), ...cadeias, sens].filter(Boolean) };
  }) } });

  const comConteudo = caso.decisoes.filter((d, i) => i < 3 || ['acao', 'evidencia', 'risco', 'contribuicao'].some(k => limpo(d[k])) || d.cenarios?.length);
  secoes.push({ num: '05', titulo: 'Recomendações comerciais e justificativa estratégica', tabela: { c1: 'Recomendação', c2: 'Decisão e lógica de criação de valor', linhas: comConteudo.map((d, i) => ({
    titulo: `Decisão ${i + 1}`, blocos: [
      campo('Ação comercial proposta:', d.acao), linha('Cenário(s) de aplicação:', cenariosTxt(d.cenarios)),
      campo('Indicador, evidência e impacto que sustentam a decisão:', d.evidencia),
      campo('Risco mitigado ou oportunidade capturada:', d.risco),
      campo('Contribuição esperada para vendas e rentabilidade:', d.contribuicao)] })) } });

  secoes.push({ titulo: 'Síntese executiva', blocos: [campo('', caso.sintese, 4)] });
  secoes.push({ titulo: 'Referências', blocos: [...referencias(caso).map(r => ({ t: 'ref', txt: r })),
    nota(`P = valor publicado nas fontes; H = hipótese do autor. Dados observados e projeções na data do Focus de ${FOCUS.dataTxt}.`)] });

  return {
    kicker: 'ESTUDO DE CASO 2 · MBA EM GESTÃO COMERCIAL E SALESTECH',
    titulo: 'Cenários econômicos e estratégias de vendas',
    subRot: 'Análise de cenários e decisões comerciais:', empresa: limpo(caso.ident.empresa), autor: limpo(caso.ident.aluno),
    meta: [caso.ident.aluno ? `Autor: ${limpo(caso.ident.aluno)}` : '', meses ? `Horizonte: ${horizonteTxt(caso.ident)}` : '', `Fontes: Focus de ${FOCUS.dataTxt} e ${IPEA.curto} (Ipea)`].filter(Boolean).join(' · '),
    secoes,
  };
}
const SELO = { P: 'P · projeção publicada', H: 'H · hipótese do autor' };
const paragrafos = t => limpo(t).split(/\n+/).map(x => x.trim()).filter(Boolean);

// ---------- Tela e impressão (HTML) ----------
const branco = (extra = '') => h('span', { class: `rel-branco ${extra}`, 'aria-label': 'campo ainda não preenchido', role: 'img' });
function blocoEl(b) {
  if (b.t === 'linha') return h('p', { class: `rel-linha ${b.val ? '' : 'vazia'}` }, h('strong', {}, b.rot), ' ', b.val || branco());
  if (b.t === 'campo') return h('div', { class: 'rel-campo' }, b.rot ? h('p', { class: 'rel-rot' }, b.rot) : null,
    b.txt ? paragrafos(b.txt).map(p => h('p', {}, p)) : Array.from({ length: b.linhas }, () => branco('bloco')));
  if (b.t === 'rot') return h('p', { class: 'rel-rot solto' }, b.txt);
  if (b.t === 'nota') return h('p', { class: 'rel-nota' }, b.txt);
  if (b.t === 'ref') return h('p', { class: 'rel-ref' }, b.txt);
  if (b.t === 'quadro') return h('div', { class: 'rel-quadro' }, b.blocos.map(q => h('div', { class: 'rel-q' },
    h('span', { class: 'rel-q-tag' }, q.tag), h('strong', {}, q.titulo), h('span', { class: 'rel-q-valor' }, q.valor),
    q.dir ? h('span', { class: 'rel-q-delta' }, h('span', { 'aria-hidden': 'true' }, SETA[q.dir]), ' ', q.delta) : null,
    h('span', { class: 'rel-q-leg' }, q.leg))));
  if (b.t === 'traj') return h('div', { class: 'rel-campo' },
    h('p', { class: `rel-linha ${b.valor ? '' : 'vazia'}` }, h('strong', {}, `${b.nome}:`), ' ', b.valor || branco(), b.selo ? h('span', { class: 'rel-selo' }, SELO[b.selo]) : null),
    b.just ? paragrafos(b.just).map(p => h('p', {}, p)) : branco('bloco'));
  if (b.t === 'cadeia') return h('p', { class: 'rel-cadeia' }, h('strong', {}, b.nome),
    b.mov ? h('span', { class: 'rel-mov' }, h('span', { 'aria-hidden': 'true' }, SETA[b.mov.dir]), ' ', b.mov.txt) : null,
    h('span', { 'aria-hidden': 'true' }, '→'), b.cliente ? h('span', {}, b.cliente) : branco('curto'),
    h('span', { 'aria-hidden': 'true' }, '→'), b.vendas ? h('span', {}, b.vendas) : branco('curto'));
  return null;
}
export function relatorioHTML(m) {
  return h('article', { class: 'rel-doc', lang: 'pt-BR' },
    h('header', { class: 'rel-cab' },
      h('p', { class: 'rel-kicker' }, m.kicker), h('h1', {}, m.titulo),
      h('p', { class: `rel-sub rel-linha ${m.empresa ? '' : 'vazia'}` }, h('strong', {}, m.subRot), ' ', m.empresa || branco()),
      h('p', { class: 'rel-meta' }, m.meta)),
    m.secoes.map(s => h('section', { class: 'rel-secao' },
      h('h2', {}, s.num ? `${s.num} | ${s.titulo}` : s.titulo),
      s.intro ? s.intro.map(blocoEl) : null,
      s.tabela ? h('table', { class: 'rel-tabela' },
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, s.tabela.c1), h('th', { scope: 'col' }, s.tabela.c2))),
        h('tbody', {}, s.tabela.linhas.map(l => h('tr', {},
          h('th', { scope: 'row' }, l.titulo, l.sub ? h('span', {}, l.sub) : l.subVazio ? branco('bloco') : null),
          h('td', {}, l.blocos.map(blocoEl)))))) : null,
      s.blocos ? s.blocos.map(blocoEl) : null)));
}

// ---------- Arquivo do Word (.docx) ----------
const NAVY = '1F3864', CEL = 'E7ECF3', REGUA = '3A4658', CINZA = '5B6675';
const L_PAG = 9638, L_C1 = 2200, L_C2 = L_PAG - L_C1, L_Q = Math.floor((L_C2 - 220) / 3);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const run = (t, o = {}) => `<w:r><w:rPr>${o.b ? '<w:b/><w:bCs/>' : ''}${o.i ? '<w:i/><w:iCs/>' : ''}${o.cor ? `<w:color w:val="${o.cor}"/>` : ''}${o.tam ? `<w:sz w:val="${o.tam}"/><w:szCs w:val="${o.tam}"/>` : ''}</w:rPr><w:t xml:space="preserve">${esc(t)}</w:t></w:r>`;
const par = (runs, o = {}) => `<w:p><w:pPr>${o.estilo ? `<w:pStyle w:val="${o.estilo}"/>` : ''}${o.junto ? '<w:keepNext/>' : ''}<w:spacing w:before="${o.antes ?? 0}" w:after="${o.depois ?? 80}"/>${o.recuo ? `<w:ind w:left="${o.recuo}" w:hanging="${o.recuo}"/>` : ''}${o.alinh ? `<w:jc w:val="${o.alinh}"/>` : ''}</w:pPr>${[runs].flat().join('')}</w:p>`;
const TRACO = n => '_'.repeat(n);
const bordas = (cor, lados = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']) => lados.map(l => `<w:${l} w:val="single" w:sz="4" w:space="0" w:color="${cor}"/>`).join('');
const cel = (conteudo, larg, fundo) => `<w:tc><w:tcPr><w:tcW w:w="${larg}" w:type="dxa"/>${fundo ? `<w:shd w:val="clear" w:color="auto" w:fill="${fundo}"/>` : ''}</w:tcPr>${conteudo}</w:tc>`;
const textoOuTracos = (txt, linhas) => (txt ? paragrafos(txt).map(p => par(run(p))) : Array.from({ length: linhas }, () => par(run(TRACO(52), { cor: REGUA })))).join('');

function blocoDocx(b) {
  if (b.t === 'linha') return par([run(`${b.rot} `, { b: true }), run(b.val || TRACO(30), b.val ? {} : { cor: REGUA })], { depois: 60 });
  if (b.t === 'campo') return (b.rot ? par(run(b.rot, { b: true }), { antes: 60, depois: 20, junto: true }) : '') + textoOuTracos(b.txt, b.linhas);
  if (b.t === 'rot') return par(run(b.txt, { b: true }), { antes: 60, depois: 60, junto: true });
  if (b.t === 'nota') return par(run(b.txt, { tam: 18, cor: CINZA }), { antes: 60 });
  if (b.t === 'ref') return par(run(b.txt), { depois: 120 });
  if (b.t === 'quadro') {
    const cels = b.blocos.map(q => cel(
      par(run(q.tag, { tam: 16, cor: CINZA }), { depois: 0 }) + par(run(q.titulo, { b: true, tam: 18 }), { depois: 20 })
      + par(run(q.valor, { b: true, tam: 24, cor: NAVY }), { depois: 20 })
      + (q.dir ? par(run(`${SETA[q.dir]} ${q.delta}`, { b: true, tam: 18 }), { depois: 20 }) : '')
      + par(run(q.leg, { tam: 16, cor: CINZA }), { depois: 0 }), L_Q, 'F4F6FA')).join('');
    return `<w:tbl><w:tblPr><w:tblW w:w="${L_Q * 3}" w:type="dxa"/><w:tblBorders>${bordas('C5CEDB')}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr>`
      + `<w:tblGrid>${`<w:gridCol w:w="${L_Q}"/>`.repeat(3)}</w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>${cels}</w:tr></w:tbl>` + par(run('', { tam: 8 }), { depois: 40 });
  }
  if (b.t === 'traj') return par([run(`${b.nome}: `, { b: true }), run(b.valor || TRACO(16), b.valor ? {} : { cor: REGUA }), b.selo ? run(`  (${SELO[b.selo]})`, { tam: 18, cor: CINZA }) : ''], { depois: 20, junto: true }) + textoOuTracos(b.just, 1);
  if (b.t === 'cadeia') return par([run(b.nome, { b: true }), b.mov ? run(`  ${SETA[b.mov.dir]} ${b.mov.txt}`, { tam: 18 }) : '',
    run('  →  '), run(b.cliente || TRACO(18), b.cliente ? {} : { cor: REGUA }), run('  →  '), run(b.vendas || TRACO(18), b.vendas ? {} : { cor: REGUA })], { depois: 100 });
  return '';
}
function tabelaDocx(t) {
  const cab = `<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>${cel(par(run(t.c1, { b: true, cor: 'FFFFFF' }), { depois: 0 }), L_C1, NAVY)}${cel(par(run(t.c2, { b: true, cor: 'FFFFFF' }), { depois: 0 }), L_C2, NAVY)}</w:tr>`;
  const linhas = t.linhas.map(l => {
    const esq = par(run(l.titulo, { b: true }), { depois: 40 }) + (l.sub ? par(run(l.sub, { tam: 18 }), { depois: 0 }) : l.subVazio ? par(run(TRACO(14), { cor: REGUA }), { depois: 0 }) : '');
    let dir = l.blocos.map(blocoDocx).join('');
    if (!dir.endsWith('</w:p>')) dir += par(run(''));
    return `<w:tr>${cel(esq, L_C1, CEL)}${cel(dir, L_C2)}</w:tr>`;
  }).join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="${L_PAG}" w:type="dxa"/><w:tblBorders>${bordas(REGUA)}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="110" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="110" w:type="dxa"/></w:tblCellMar></w:tblPr>`
    + `<w:tblGrid><w:gridCol w:w="${L_C1}"/><w:gridCol w:w="${L_C2}"/></w:tblGrid>${cab}${linhas}</w:tbl>` + par(run('', { tam: 12 }), { depois: 0 });   // respiro depois da tabela (há editores que ignoram o espaço antes do título seguinte)
}

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
function documentoXml(m) {
  const corpo = [
    par(run(m.kicker, { b: true, tam: 17, cor: CINZA }), { depois: 60 }),
    par(run(m.titulo), { estilo: 'Heading1' }),
    par([run(`${m.subRot} `, { b: true, tam: 22 }), run(m.empresa || TRACO(30), m.empresa ? { tam: 22 } : { tam: 22, cor: REGUA })], { depois: 60 }),
    `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="8" w:color="${NAVY}"/></w:pBdr><w:spacing w:before="0" w:after="120"/></w:pPr>${run(m.meta, { tam: 18, cor: CINZA })}</w:p>`,
    ...m.secoes.map(s => par(run(s.num ? `${s.num} | ${s.titulo}` : s.titulo), { estilo: 'Heading2' })
      + (s.intro ? s.intro.map(blocoDocx).join('') : '') + (s.tabela ? tabelaDocx(s.tabela) : '') + (s.blocos ? s.blocos.map(blocoDocx).join('') : '')),
  ].join('');
  return `${XML}<w:document ${NS}><w:body>${corpo}<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;
}
const ESTILOS = `${XML}<w:styles ${NS}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:color w:val="1B2430"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="pt-BR" w:eastAsia="pt-BR" w:bidi="ar-SA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>`
  + `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>`
  + `<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="0" w:after="100"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:bCs/><w:color w:val="${NAVY}"/><w:sz w:val="38"/><w:szCs w:val="38"/></w:rPr></w:style>`
  + `<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="300" w:after="100"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:bCs/><w:color w:val="${NAVY}"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>`
  + `<w:style w:type="paragraph" w:styleId="Footer"><w:name w:val="footer"/><w:basedOn w:val="Normal"/></w:style></w:styles>`;
const campoPagina = `<w:r><w:rPr><w:color w:val="${CINZA}"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:color w:val="${CINZA}"/><w:sz w:val="16"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:color w:val="${CINZA}"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="${CINZA}"/><w:sz w:val="16"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:color w:val="${CINZA}"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>`;
const RODAPE = `${XML}<w:ftr ${NS}><w:p><w:pPr><w:pStyle w:val="Footer"/><w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/></w:pPr>${run('MBA Gestão Comercial e SalesTech | Estudo de Caso 2 · página ', { cor: CINZA, tam: 16 })}${campoPagina}</w:p></w:ftr>`;

export function nomeDoArquivo(caso, ext) {
  return `Caso2_Relatorio_${(caso.ident.empresa || 'cenarios').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'cenarios'}.${ext}`;
}
// Monta os bytes do .docx (um ZIP com as partes do documento).
export function gerarDocx(caso) {
  const m = montarRelatorio(caso);
  const agora = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  return zip([
    { nome: '[Content_Types].xml', texto: `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>` },
    { nome: '_rels/.rels', texto: `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>` },
    { nome: 'docProps/core.xml', texto: `${XML}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(`Estudo de Caso 2 — ${m.titulo}${m.empresa ? `: ${m.empresa}` : ''}`)}</dc:title><dc:creator>${esc(m.autor)}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${agora}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${agora}</dcterms:modified></cp:coreProperties>` },
    { nome: 'word/document.xml', texto: documentoXml(m) },
    { nome: 'word/styles.xml', texto: ESTILOS },
    { nome: 'word/footer1.xml', texto: RODAPE },
    { nome: 'word/_rels/document.xml.rels', texto: `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>` },
  ]);
}
export function exportarDocx(caso) {
  const nome = nomeDoArquivo(caso, 'docx');
  const url = URL.createObjectURL(new Blob([gerarDocx(caso)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
  const a = h('a', { href: url, download: nome });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return nome;
}
