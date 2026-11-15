// Modelo do caso: espelha as cinco seções do roteiro do Estudo de Caso 2 e os critérios de validação da entrega.
import { VARIAVEIS, FOCUS, IPEA, fmt, comUnidade, valorIpea } from './refdata.js';

export const CENARIOS = [
  { id: 'base', nome: 'Cenário base', curto: 'Base', desc: 'Evolução considerada mais provável, fundamentada nas expectativas consultadas.' },
  { id: 'favoravel', nome: 'Cenário favorável', curto: 'Favorável', desc: 'Condições que beneficiam a demanda, os clientes e o desempenho comercial.' },
  { id: 'adverso', nome: 'Cenário adverso', curto: 'Adverso', desc: 'Condições que pressionam consumo, investimentos, crédito ou rentabilidade.' },
];

export const DIMENSOES = [
  { id: 'clientes', nome: 'Poder de compra e comportamento dos clientes', curto: 'Clientes' },
  { id: 'demanda', nome: 'Demanda', curto: 'Demanda' },
  { id: 'ciclo', nome: 'Ciclo de vendas e negociações', curto: 'Ciclo de vendas' },
  { id: 'precos', nome: 'Preços e condições de pagamento', curto: 'Preços e prazos' },
  { id: 'resultado', nome: 'Faturamento, metas e margens', curto: 'Faturamento e margens' },
];

export const NATUREZAS = ['Dado observado', 'Projeção publicada', 'Estimativa ou análise da fonte', 'Hipótese do autor'];

export const ETAPAS = [
  { n: 1, id: 'diagnostico', titulo: 'Empresa e exposição', sub: 'Diagnóstico do negócio e exposição macroeconômica' },
  { n: 2, id: 'evidencias', titulo: 'Evidências econômicas', sub: 'Indicadores do Focus e do Ipea e implicações para o negócio' },
  { n: 3, id: 'cenarios', titulo: 'Três cenários', sub: 'Arquitetura de cenários para um horizonte de 12 meses' },
  { n: 4, id: 'impactos', titulo: 'Impactos comerciais', sub: 'Relações de causa e efeito sobre clientes e vendas' },
  { n: 5, id: 'decisoes', titulo: 'Decisões comerciais', sub: 'Recomendações e justificativa estratégica' },
];

let seq = 0;
export const uid = () => `${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const novaVariavel = () => ({ uid: uid(), tipo: '', nome: '', dado: '', valorNum: null, unidade: '', natureza: '', fonte: '', publicacao: '', periodo: '', tendencia: '', implicacao: '', sensibilidade: 2, origem: null });
export const novaDecisao = () => ({ uid: uid(), acao: '', evidencia: '', risco: '', contribuicao: '' });
const novoCenario = () => ({ premissas: '', publicadas: '', hipoteses: '', traj: {} });
const novoImpacto = () => ({ clientes: '', demanda: '', ciclo: '', precos: '', resultado: '', cadeias: {} });

export function casoVazio() {
  return {
    versao: 1,
    ident: { aluno: '', empresa: '', inicio: '2026-11', fim: '2027-10' },
    diag: { setor: '', clientes: '', mercado: '', exposicao: '' },
    variaveis: [novaVariavel(), novaVariavel(), novaVariavel()],
    consultas: { focusData: '', focusTexto: '', ipeaTitulo: '', ipeaTexto: '' },
    // Edição de cada relatório usada pelo caso ('' = ainda não definida) e a edição mais recente que o autor preferiu não adotar.
    edicoes: { focus: '', ipea: '', mantida: {} },
    cenarios: { base: novoCenario(), favoravel: novoCenario(), adverso: novoCenario() },
    impactos: { base: novoImpacto(), favoravel: novoImpacto(), adverso: novoImpacto() },
    simulador: { receita: '', sens: {} },
    decisoes: [novaDecisao(), novaDecisao(), novaDecisao()],
    sintese: '',
    slides: { textos: {} },
  };
}

// Garante que um caso salvo (possivelmente de versão anterior ou incompleto) tenha todos os campos.
export function normalizar(c) {
  const v = casoVazio();
  if (!c || typeof c !== 'object') return v;
  const out = { ...v, ...c };
  for (const k of ['ident', 'diag', 'consultas', 'simulador', 'slides', 'edicoes']) out[k] = { ...v[k], ...(c[k] || {}) };
  out.edicoes.mantida = { ...(c.edicoes?.mantida || {}) };
  out.simulador.sens = { ...(c.simulador?.sens || {}) };
  out.slides.textos = { ...(c.slides?.textos || {}) };
  out.variaveis = (Array.isArray(c.variaveis) && c.variaveis.length ? c.variaveis : v.variaveis).map(x => ({ ...novaVariavel(), ...x }));
  out.decisoes = (Array.isArray(c.decisoes) && c.decisoes.length ? c.decisoes : v.decisoes).map(x => ({ ...novaDecisao(), ...x }));
  for (const s of CENARIOS) {
    out.cenarios[s.id] = { ...novoCenario(), ...(c.cenarios?.[s.id] || {}) };
    out.cenarios[s.id].traj = { ...(c.cenarios?.[s.id]?.traj || {}) };
    out.impactos[s.id] = { ...novoImpacto(), ...(c.impactos?.[s.id] || {}) };
    out.impactos[s.id].cadeias = { ...(c.impactos?.[s.id]?.cadeias || {}) };
  }
  return out;
}

const tem = s => typeof s === 'string' ? s.trim().length > 0 : s !== null && s !== undefined && s !== '';
export const num = s => {
  if (typeof s === 'number') return Number.isFinite(s) ? s : null;
  if (!tem(s)) return null;
  const n = Number(String(s).replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
};
export const numSimples = s => {
  if (typeof s === 'number') return Number.isFinite(s) ? s : null;
  if (!tem(s)) return null;
  const n = Number(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export const variaveisAtivas = caso => caso.variaveis.filter(v => tem(v.nome));
export const catalogo = tipo => VARIAVEIS.find(x => x.id === tipo) || null;

export function mesesHorizonte(ident) {
  const [a1, m1] = (ident.inicio || '').split('-').map(Number);
  const [a2, m2] = (ident.fim || '').split('-').map(Number);
  if (!a1 || !a2) return null;
  return (a2 - a1) * 12 + (m2 - m1) + 1;
}

const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
export const mesTxt = ym => { const [a, m] = (ym || '').split('-').map(Number); return a && m ? `${MESES[m - 1]} ${a}` : '—'; };
export const horizonteTxt = ident => `${mesTxt(ident.inicio)} a ${mesTxt(ident.fim)}`;

// Um valor de cenário é "publicado" quando coincide com uma referência do Focus ou do Ipea; caso contrário é hipótese do autor.
export function classificarValor(refs, valor) {
  const n = numSimples(valor);
  if (n === null) return null;
  const r = refs.find(x => Math.abs(x.valor - n) < 1e-9);
  return r ? { tipo: 'P', ref: r } : { tipo: 'H' };
}

export function direcao(valor, referencia) {
  const a = numSimples(valor), b = numSimples(referencia);
  if (a === null || b === null) return null;
  if (Math.abs(a - b) < 1e-9) return 'estavel';
  return a > b ? 'sobe' : 'cai';
}

// Simulador de sensibilidade: variação estimada da receita em cada cenário, em relação ao cenário base.
// É um exercício do autor (hipótese), não uma projeção das fontes.
export function simular(caso) {
  const vars = variaveisAtivas(caso);
  const receita = num(caso.simulador.receita);
  const out = {};
  for (const s of CENARIOS) {
    let delta = 0, usados = 0;
    const partes = [];
    for (const v of vars) {
      const sens = numSimples(caso.simulador.sens[v.uid]);
      const vb = numSimples(caso.cenarios.base.traj[v.uid]?.valor);
      const vs = numSimples(caso.cenarios[s.id].traj[v.uid]?.valor);
      if (sens === null || vb === null || vs === null) continue;
      const parcela = sens * (vs - vb);
      delta += parcela; usados++;
      partes.push({ nome: v.nome, parcela });
    }
    out[s.id] = { delta, usados, partes, receita: receita === null ? null : receita * (1 + delta / 100) };
  }
  out.completo = vars.length > 0 && CENARIOS.every(s => out[s.id].usados === vars.length);
  out.temDados = CENARIOS.some(s => out[s.id].usados > 0);
  return out;
}

// Validação da entrega: itens derivados do roteiro ("Validação da entrega") e dos critérios de avaliação.
export function validar(caso) {
  const itens = [];
  const add = (etapa, id, texto, ok, detalhe = '') => itens.push({ etapa, id, texto, ok: Boolean(ok), detalhe });
  const vars = variaveisAtivas(caso);

  add(1, 'empresa', 'Empresa identificada', tem(caso.ident.empresa));
  add(1, 'setor', 'Setor de atuação e principais produtos ou serviços', tem(caso.diag.setor));
  add(1, 'clientes', 'Perfil dos clientes e necessidades de compra', tem(caso.diag.clientes));
  add(1, 'mercado', 'Dinâmica do mercado relevante para o desempenho comercial', tem(caso.diag.mercado));
  add(1, 'exposicao', 'Exposição macroeconômica: variáveis prioritárias e mecanismos', tem(caso.diag.exposicao));

  add(2, 'tres', 'Pelo menos três variáveis econômicas selecionadas', vars.length >= 3, `${vars.length} de 3`);
  const completas = vars.filter(v => tem(v.dado) && tem(v.natureza) && tem(v.fonte) && tem(v.publicacao) && tem(v.periodo));
  add(2, 'rastreio', 'Cada variável com dado, natureza, fonte, data de publicação e período de referência', vars.length >= 3 && completas.length === vars.length, `${completas.length} de ${vars.length || 3} completas`);
  const interpretadas = vars.filter(v => tem(v.tendencia) && tem(v.implicacao));
  add(2, 'interpretacao', 'Tendência e implicação para o mercado da empresa em cada variável', vars.length >= 3 && interpretadas.length === vars.length, `${interpretadas.length} de ${vars.length || 3}`);
  add(2, 'focus', 'Consulta ao Relatório Focus registrada (data e contribuição)', tem(caso.consultas.focusData) && tem(caso.consultas.focusTexto));
  add(2, 'ipea', 'Consulta à Carta de Conjuntura do Ipea registrada (título e argumento central)', tem(caso.consultas.ipeaTitulo) && tem(caso.consultas.ipeaTexto));

  const meses = mesesHorizonte(caso.ident);
  add(3, 'horizonte', 'Horizonte comum de 12 meses definido', meses === 12, meses ? `${meses} meses` : '');
  for (const s of CENARIOS) {
    const c = caso.cenarios[s.id];
    const traj = vars.filter(v => tem(c.traj[v.uid]?.valor) && tem(c.traj[v.uid]?.justificativa));
    add(3, `cen_${s.id}`, `${s.nome}: premissas e trajetória justificada das variáveis`, tem(c.premissas) && vars.length >= 3 && traj.length === vars.length, `${traj.length} de ${vars.length || 3} variáveis`);
  }
  add(3, 'distincao', 'Projeções publicadas distinguidas das hipóteses próprias em cada cenário', CENARIOS.every(s => tem(caso.cenarios[s.id].publicadas) || tem(caso.cenarios[s.id].hipoteses)) && CENARIOS.some(s => tem(caso.cenarios[s.id].hipoteses)));
  const distintos = vars.length > 0 && vars.some(v => {
    const b = numSimples(caso.cenarios.base.traj[v.uid]?.valor), f = numSimples(caso.cenarios.favoravel.traj[v.uid]?.valor), a = numSimples(caso.cenarios.adverso.traj[v.uid]?.valor);
    return b !== null && f !== null && a !== null && (b !== f || b !== a);
  });
  add(3, 'coerencia', 'Cenários coerentes e diferenciados entre si', distintos, distintos ? '' : 'os valores dos três cenários ainda são iguais ou estão incompletos');

  for (const s of CENARIOS) {
    const i = caso.impactos[s.id];
    const n = DIMENSOES.filter(d => tem(i[d.id])).length;
    add(4, `imp_${s.id}`, `${s.nome}: impactos nas cinco dimensões comerciais`, n === DIMENSOES.length, `${n} de ${DIMENSOES.length}`);
  }
  const cadeiasOk = CENARIOS.every(s => vars.length > 0 && vars.some(v => tem(caso.impactos[s.id].cadeias[v.uid]?.cliente) && tem(caso.impactos[s.id].cadeias[v.uid]?.vendas)));
  add(4, 'cadeia', 'Fundamentação variável → efeito no cliente → efeito nas vendas em cada cenário', cadeiasOk);

  const decOk = caso.decisoes.filter(d => tem(d.acao) && tem(d.evidencia) && tem(d.risco) && tem(d.contribuicao));
  add(5, 'decisoes', 'Pelo menos três decisões comerciais completas e justificadas', decOk.length >= 3, `${decOk.length} de 3`);
  add(5, 'sintese', 'Síntese executiva redigida', tem(caso.sintese));

  return itens;
}

export function progresso(itens) {
  const porEtapa = {};
  for (const e of ETAPAS) {
    const l = itens.filter(i => i.etapa === e.n);
    porEtapa[e.n] = { total: l.length, ok: l.filter(i => i.ok).length };
  }
  const total = itens.length, ok = itens.filter(i => i.ok).length;
  return { porEtapa, total, ok, pct: total ? Math.round((ok / total) * 100) : 0 };
}

// Monta o registro de evidência a partir de uma célula do Focus.
export function evidenciaFocus(linha, periodo, tipoHorizonte) {
  const c = linha.v[periodo];
  const cat = VARIAVEIS.find(x => x.focus === linha.id) || null;
  const comp = { alta: 'revisão para cima', queda: 'revisão para baixo', estavel: 'estabilidade' }[c.comp];
  const perTxt = tipoHorizonte === 'anual' ? `fim de ${periodo}` : (periodo.startsWith('Infl') ? 'próximos 12 meses (suavizada)' : periodo);
  return {
    tipo: cat?.id || 'outra',
    nome: cat?.nome || linha.indicador,
    dado: comUnidade(c.hoje, linha.unidade, linha.casas),
    valorNum: c.hoje,
    unidade: cat?.unidade || linha.unidade,
    natureza: 'Projeção publicada',
    fonte: 'Focus – Relatório de Mercado (Banco Central do Brasil), mediana das expectativas',
    publicacao: FOCUS.dataTxt,
    periodo: perTxt,
    tendencia: `Mediana em ${fmt(c.hoje, linha.casas)} (hoje), ante ${fmt(c.h1, linha.casas)} há uma semana e ${fmt(c.h4, linha.casas)} há quatro semanas; ${comp} há ${c.sem} semana${c.sem > 1 ? 's' : ''} (${c.resp} respondentes).`,
    origem: { fonte: 'focus', edicao: FOCUS.edicao, tipo: tipoHorizonte, indicador: linha.id, periodo: String(periodo) },
  };
}

// Monta o registro de evidência a partir de um indicador da Carta de Conjuntura do Ipea.
export function evidenciaIpea(r) {
  const cat = (r.chave && VARIAVEIS.find(x => x.ipea === r.chave)) || null;
  return {
    tipo: cat?.id || 'outra',
    nome: cat?.nome || r.indicador,
    dado: valorIpea(r),
    valorNum: r.valor,
    unidade: cat?.unidade || r.unidade,
    natureza: r.natureza,
    fonte: `${IPEA.curtoNota} (Ipea), p. ${r.pagina}`,
    publicacao: IPEA.publicacao,
    periodo: r.periodo,
    tendencia: `${r.indicador}${r.nota ? ': ' + r.nota : '.'}`,
    origem: { fonte: 'ipea', edicao: IPEA.edicao, registro: r.id, chave: r.chave || null, ano: r.ano || null },
  };
}

// Ano que concentra o horizonte do caso (o que tem mais meses entre o início e o fim; em empate, o mais tardio).
export function anoDoHorizonte(ident) {
  const [a1, m1] = (ident?.inicio || '').split('-').map(Number);
  const [a2, m2] = (ident?.fim || '').split('-').map(Number);
  if (!a1 || !a2 || a2 < a1) return a2 || a1 || null;
  let melhor = a1, maior = -1;
  for (let a = a1; a <= a2; a++) {
    const meses = (a === a2 ? m2 : 12) - (a === a1 ? m1 : 1) + 1;
    if (meses >= maior) { maior = meses; melhor = a; }
  }
  return melhor;
}

// Dado sugerido para uma variável do catálogo, na edição em uso: Focus primeiro (projeção para o fim do ano
// que concentra o horizonte); a Carta do Ipea quando o Focus não cobre a variável. Fonte externa: sem sugestão.
export function sugestaoEvidencia(cat, ident) {
  if (!cat || cat.externa || cat.id === 'outra') return null;
  const ano = anoDoHorizonte(ident) || FOCUS.anos[0];
  if (cat.focus) {
    const linha = FOCUS.anual.find(x => x.id === cat.focus);
    const anos = [ano, ...FOCUS.anos].filter(a => linha?.v[a]);
    if (anos.length) return evidenciaFocus(linha, anos[0], 'anual');
  }
  if (cat.ipea) {
    const rs = IPEA.registros.filter(r => r.chave === cat.ipea);
    const r = rs.find(x => x.ano === ano) || rs.filter(x => x.ano).sort((a, b) => Math.abs(a.ano - ano) - Math.abs(b.ano - ano))[0] || rs[0];
    if (r) return evidenciaIpea(r);
  }
  return null;
}

// Todas as opções de dado para uma variável do catálogo, na edição em uso (janela "Escolher outro dado").
export function opcoesEvidencia(cat) {
  const out = { focus: [], ipea: [] };
  if (!cat) return out;
  if (cat.focus) {
    const anual = FOCUS.anual.find(x => x.id === cat.focus), mensal = FOCUS.mensal.find(x => x.id === cat.focus);
    for (const a of FOCUS.anos) if (anual?.v[a]) out.focus.push({ linha: anual, periodo: a, tipo: 'anual', ev: evidenciaFocus(anual, a, 'anual'), cel: anual.v[a] });
    for (const p of FOCUS.periodosMensais) if (mensal?.v[p]) out.focus.push({ linha: mensal, periodo: p, tipo: 'mensal', ev: evidenciaFocus(mensal, p, 'mensal'), cel: mensal.v[p] });
  }
  if (cat.ipea) for (const r of IPEA.registros.filter(x => x.chave === cat.ipea)) out.ipea.push({ registro: r, ev: evidenciaIpea(r) });
  return out;
}

// A evidência registrada na variável ainda corresponde a este registro de origem?
export const mesmaOrigem = (o, ev) => Boolean(o && ev?.origem && o.fonte === ev.origem.fonte && o.edicao === ev.origem.edicao
  && (o.fonte === 'focus' ? o.tipo === ev.origem.tipo && o.indicador === ev.origem.indicador && String(o.periodo) === String(ev.origem.periodo) : o.registro === ev.origem.registro));
