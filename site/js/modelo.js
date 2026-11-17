// Modelo do caso: espelha as cinco seções do roteiro do Estudo de Caso 2 e os critérios de validação da entrega.
import { VARIAVEIS, FOCUS, IPEA, SERIES_OBS, OBSERVADOS, fmt, comUnidade, valorIpea, registrosIpeaDe, referenciasPublicadas } from './refdata.js';

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
// cenarios: ids dos cenários em que a decisão se aplica ("Cenário(s) de aplicação" no quadro 05 do roteiro).
export const novaDecisao = () => ({ uid: uid(), acao: '', cenarios: [], evidencia: '', risco: '', contribuicao: '' });
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
    entrega: { formato: '', avisos: true },   // último formato aberto ('slides' ou 'relatorio') e avisos de espaço dos slides nas etapas
  };
}

// Garante que um caso salvo (possivelmente de versão anterior ou incompleto) tenha todos os campos.
export function normalizar(c) {
  const v = casoVazio();
  if (!c || typeof c !== 'object') return v;
  const out = { ...v, ...c };
  for (const k of ['ident', 'diag', 'consultas', 'simulador', 'slides', 'edicoes', 'entrega']) out[k] = { ...v[k], ...(c[k] || {}) };
  out.edicoes.mantida = { ...(c.edicoes?.mantida || {}) };
  out.simulador.sens = { ...(c.simulador?.sens || {}) };
  out.slides.textos = { ...(c.slides?.textos || {}) };
  out.variaveis = (Array.isArray(c.variaveis) && c.variaveis.length ? c.variaveis : v.variaveis).map(x => ({ ...novaVariavel(), ...x }));
  out.decisoes = (Array.isArray(c.decisoes) && c.decisoes.length ? c.decisoes : v.decisoes).map(x => ({ ...novaDecisao(), ...x, cenarios: CENARIOS.map(s => s.id).filter(id => Array.isArray(x.cenarios) && x.cenarios.includes(id)) }));
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
// Nome da variável seguido da unidade, para títulos de gráfico. Se o nome já traz a unidade ("Taxa de câmbio (R$/US$)"), ela não é repetida.
const semEspacos = s => String(s || '').toLowerCase().replace(/\s+/g, '');
export function nomeJaTemUnidade(v) {
  const u = semEspacos(v?.unidade), n = semEspacos(v?.nome);
  return Boolean(u) && (n.includes(`(${u})`) || (u.length > 1 && n.endsWith(u)));
}
export const nomeComUnidade = v => (tem(v?.unidade) && !nomeJaTemUnidade(v) ? `${v.nome} (${String(v.unidade).trim()})` : v.nome);
export const catalogo = tipo => VARIAVEIS.find(x => x.id === tipo) || null;

export function mesesHorizonte(ident) {
  const [a1, m1] = (ident.inicio || '').split('-').map(Number);
  const [a2, m2] = (ident.fim || '').split('-').map(Number);
  if (!a1 || !a2) return null;
  return (a2 - a1) * 12 + (m2 - m1) + 1;
}

const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
// Nomes dos cenários em que uma decisão se aplica, em texto corrido: "Base e adverso".
export function cenariosTxt(ids) {
  const n = CENARIOS.filter(s => (ids || []).includes(s.id)).map(s => s.curto.toLowerCase());
  if (!n.length) return '';
  const t = n.length === 1 ? n[0] : `${n.slice(0, -1).join(', ')} e ${n[n.length - 1]}`;
  return t[0].toUpperCase() + t.slice(1);
}
export const mesTxt = ym => { const [a, m] = (ym || '').split('-').map(Number); return a && m ? `${MESES[m - 1]} ${a}` : '—'; };
export const horizonteTxt = ident => `${mesTxt(ident.inicio)} a ${mesTxt(ident.fim)}`;

// ---------- Origem dos valores dos cenários ----------
// Cada valor de cenário guarda de onde veio (traj[uid].origem), gravado no momento da escolha:
//   referência publicada: { tipo: 'publicada', valor, fonte ('focus' | 'ipea'), edicao, edicaoTxt, serie, chave, ano, rotulo, periodo, natureza, citacao, casas }
//   valor digitado:       { tipo: 'autor', valor }
// O rótulo do valor vem sempre desse registro, nunca da comparação do número com as referências: dois relatórios
// podem trazer o mesmo número. O "valor" gravado amarra a origem ao número; se os dois não baterem (caso gravado
// antes de a origem existir, ou valor alterado por outra versão do aplicativo), a origem é tratada como não registrada.
export const origemDaReferencia = r => ({ tipo: 'publicada', valor: r.valor, fonte: r.origem, edicao: r.edicao, edicaoTxt: r.edicaoTxt, serie: r.serie, chave: r.chave ?? null, ano: r.ano ?? null,
  rotulo: r.rotulo, periodo: r.periodo, natureza: r.natureza || 'Projeção publicada', indicador: r.indicador || null, citacao: r.fonte, casas: r.casas });
const mesmoNumero = (a, b) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 1e-9;
// Chamado quando o autor digita o valor (ou move o controle): passa a ser hipótese do autor.
// Se o número continua igual ao gravado, a origem não muda (digitar "12,50" sobre "12,5" não troca nada).
export function registrarDigitacao(t) {
  const n = numSimples(t.valor);
  if (n === null) { delete t.origem; return; }
  if (t.origem && mesmoNumero(t.origem.valor, n)) return;
  t.origem = { tipo: 'autor', valor: n };
}
export const marcarComoHipotese = t => { const n = numSimples(t.valor); if (n === null) delete t.origem; else t.origem = { tipo: 'autor', valor: n }; };
// Classificação de um valor de cenário: null (sem valor), P (referência publicada), H (hipótese do autor) ou ? (origem não registrada).
export function origemValor(t) {
  const n = numSimples(t?.valor);
  if (n === null) return null;
  const o = t.origem;
  if (o && mesmoNumero(o.valor, n)) {
    if (o.tipo === 'publicada' && o.fonte && o.edicao) return { tipo: 'P', ref: o };
    if (o.tipo === 'autor') return { tipo: 'H' };
  }
  return { tipo: '?' };
}
export const rotuloOrigem = cls => (!cls ? 'sem valor' : cls.tipo === 'P' ? `${cls.ref.natureza === 'Dado observado' ? 'Dado observado publicado' : 'Projeção publicada'} · ${cls.ref.rotulo}`
  : cls.tipo === 'H' ? 'Hipótese do autor' : 'Origem não registrada');

// Dados da edição que o caso usa (FOCUS ou IPEA); null se, por falha de carga, os dados na tela forem de outra edição.
function edicaoEmUso(caso, fonte) {
  const d = fonte === 'focus' ? FOCUS : IPEA, id = caso.edicoes?.[fonte] || d.edicao;
  return d.edicao === id ? d : null;
}
// "6 de novembro de 2026" e "13 de novembro de 2026" -> "6 de novembro" e "13 de novembro" (o ano só aparece se for diferente).
function semAnoComum(a, b) {
  const ra = /^(.*) de (\d{4})$/.exec(a || ''), rb = /^(.*) de (\d{4})$/.exec(b || '');
  return ra && rb && ra[2] === rb[2] ? [ra[1], rb[1]] : [a || '', b || ''];
}
export function anosDoHorizonte(ident) {
  const a1 = Number((ident?.inicio || '').split('-')[0]), a2 = Number((ident?.fim || '').split('-')[0]);
  if (!a1 || !a2 || a2 < a1) return null;
  return Array.from({ length: a2 - a1 + 1 }, (_, i) => a1 + i);
}
// A mesma série e o mesmo período na edição em uso (para o botão "Atualizar"); null se não houver.
export function referenciaAtual(tipoVar, o) {
  const refs = referenciasPublicadas(tipoVar).filter(r => r.origem === o.fonte);
  if (o.fonte === 'focus') return refs.find(r => r.serie === o.serie && r.ano === o.ano) || null;
  const mesmoIndicador = r => !o.indicador || !r.indicador || r.indicador === o.indicador;
  return refs.find(r => r.serie === o.serie && mesmoIndicador(r))
    || (o.chave && o.ano ? refs.find(r => r.chave === o.chave && r.ano === o.ano && r.natureza === o.natureza && mesmoIndicador(r)) : null) || null;
}
// Avisos de um valor de cenário: origem não registrada, valor de outra edição e referência fora do horizonte do caso.
// Nada é trocado sozinho: cada aviso só descreve a divergência; quem decide é o autor.
export function avisosDoValor(caso, v, sId) {
  const cls = origemValor(caso.cenarios[sId]?.traj[v.uid]);
  if (!cls || cls.tipo === 'H') return [];
  if (cls.tipo === '?') return [{ tipo: 'origem', texto: 'Origem não registrada — confira ou escolha de novo a referência.' }];
  const o = cls.ref, out = [], emUso = edicaoEmUso(caso, o.fonte);
  if (emUso && o.edicao !== emUso.edicao) {
    const atual = referenciaAtual(v.tipo, o);
    let texto;
    if (o.fonte === 'focus') { const [de, para] = semAnoComum(o.edicaoTxt, FOCUS.dataTxt); texto = `Valor do Focus de ${de}; o caso usa a edição de ${para}.`; }
    else texto = `Valor da Carta ${o.edicaoTxt}; o caso usa a Carta nº ${IPEA.numero}.`;
    out.push({ tipo: 'edicao', texto, atual, igual: Boolean(atual) && mesmoNumero(atual.valor, o.valor) });
  }
  const anos = anosDoHorizonte(caso.ident);
  if (o.ano && anos && !anos.includes(o.ano)) out.push({ tipo: 'periodo', texto: `A referência ${o.rotulo} vale para ${o.ano}; o horizonte do caso vai de ${horizonteTxt(caso.ident)}.` });
  return out;
}

// Texto dos campos "Projeções publicadas — fonte e data" e "Hipóteses próprias — fundamentação", gerado a partir da origem gravada.
export function listaPublicadas(caso, sId) {
  return variaveisAtivas(caso).map(v => {
    const t = caso.cenarios[sId].traj[v.uid], cls = origemValor(t);
    return cls?.tipo === 'P' ? `${v.nome}: ${comUnidade(numSimples(t.valor), v.unidade)} — ${cls.ref.citacao}, ${cls.ref.periodo}.` : null;
  }).filter(Boolean).join('\n');
}
export function listaHipoteses(caso, sId) {
  return variaveisAtivas(caso).map(v => {
    const t = caso.cenarios[sId].traj[v.uid], cls = origemValor(t);
    return cls?.tipo === 'H' ? `${v.nome}: ${comUnidade(numSimples(t.valor), v.unidade)} — hipótese do autor: ${String(t.justificativa || '').trim() || '[fundamentar]'}` : null;
  }).filter(Boolean).join('\n');
}

// Datas escritas em um texto livre: "13 de novembro de 2026", "13 nov. 2026", "13/11/2026", "13/11", "2026-11-13".
const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export function datasNoTexto(txt) {
  const s = String(txt || '').toLowerCase(), out = [];
  const ano = a => (a ? (a.length === 2 ? 2000 + Number(a) : Number(a)) : null);
  for (const m of s.matchAll(/(\d{1,2})(?:º|°)?\s+(?:de\s+)?(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)(?![a-zà-ú])\.?(?:\s+(?:de\s+)?(\d{4}))?/g))
    out.push({ d: Number(m[1]), m: MESES_ABREV.indexOf(m[2].slice(0, 3)) + 1, a: ano(m[3]) });
  for (const m of s.matchAll(/(?:^|[^\d/])(\d{1,2})\/(\d{1,2})(?:\/(\d{4}|\d{2}))?(?![\d/])/g)) out.push({ d: Number(m[1]), m: Number(m[2]), a: ano(m[3]) });
  for (const m of s.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)) out.push({ d: Number(m[3]), m: Number(m[2]), a: Number(m[1]) });
  return out.filter(x => x.d >= 1 && x.d <= 31 && x.m >= 1 && x.m <= 12);
}
const mesmaData = (x, iso) => Boolean(iso) && x.d === Number(iso.slice(8, 10)) && x.m === Number(iso.slice(5, 7)) && (x.a === null || x.a === Number(iso.slice(0, 4)));
// A data é a da edição do Focus em uso? Vale a data de referência do relatório (sexta-feira) ou a de divulgação (segunda-feira).
const dataDoFocusEmUso = x => mesmaData(x, FOCUS.data) || mesmaData(x, FOCUS.divulgacao);
const dataTxt = x => `${x.d} de ${['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][x.m - 1]}${x.a ? ` de ${x.a}` : ''}`;
// Números de Carta de Conjuntura citados em um texto ("Carta de Conjuntura nº 72", "Carta 72", "nº 72").
export function cartasNoTexto(txt) {
  const s = String(txt || ''), out = [];
  for (const m of s.matchAll(/carta(?:\s+de\s+conjuntura)?\s*(?:n[º°o]?\.?\s*)?(\d{1,3})(?![\dº°ª])/gi)) out.push(Number(m[1]));
  if (!out.length) for (const m of s.matchAll(/(?:^|[^a-zà-ú])n[º°]\s*(\d{1,3})(?![\dº°ª])/gi)) out.push(Number(m[1]));
  return out;
}
// Datas que um texto atribui ao Focus (as que vêm logo depois da palavra "Focus").
function datasDoFocusNoTexto(txt) {
  const s = String(txt || ''), out = [];
  for (const m of s.matchAll(/focus/gi)) out.push(...datasNoTexto(s.slice(m.index, m.index + 70).split('\n')[0]));
  return out;
}

// Consultas obrigatórias da etapa 2: a data do Focus e o título da Carta registrados batem com as edições do caso?
// Só há aviso quando o texto identifica outra edição; texto sem data (ou sem número da Carta) não é julgado.
export function avisosConsultas(caso) {
  const out = { focus: null, ipea: null };
  if (edicaoEmUso(caso, 'focus')) {
    const datas = datasNoTexto(caso.consultas.focusData);
    if (datas.length && !datas.some(dataDoFocusEmUso)) out.focus = { registrado: dataTxt(datas[0]), atual: FOCUS.dataTxt,
      texto: `A data registrada (${dataTxt(datas[0])}) não é a da edição escolhida para o caso: o caso usa o Focus de ${FOCUS.dataTxt}. Clique em “Preencher a data do relatório” para atualizar.` };
  }
  if (edicaoEmUso(caso, 'ipea') && IPEA.numero) {
    const nums = cartasNoTexto(caso.consultas.ipeaTitulo);
    if (nums.length && !nums.includes(Number(IPEA.numero))) out.ipea = { registrado: `nº ${nums[0]}`, atual: `nº ${IPEA.numero}`,
      texto: `O título registrado é o da Carta nº ${nums[0]}; o caso usa a Carta nº ${IPEA.numero}. Clique em “Preencher o título” para atualizar.` };
  }
  return out;
}

// O texto de "Projeções publicadas — fonte e data" ficou desatualizado em relação aos valores ou à edição do caso?
//   1) cita o Focus de outra data, ou outra Carta, e não cita a edição em uso;
//   2) foi listado automaticamente e, depois disso, os valores ou as referências do cenário mudaram
//      (publicadasLista guarda o que o botão "Listar automaticamente" gerou da última vez).
export function avisoPublicadas(caso, sId) {
  const cen = caso.cenarios[sId], texto = String(cen.publicadas || '').trim();
  if (!texto) return null;
  const sugestao = 'Confira os valores deste cenário e clique de novo em “Listar automaticamente”.';
  if (edicaoEmUso(caso, 'focus')) {
    const datas = datasDoFocusNoTexto(texto), outra = datas.find(x => !dataDoFocusEmUso(x));
    if (outra && !datas.some(dataDoFocusEmUso)) return { tipo: 'edicao', texto: `Este texto cita o Focus de ${dataTxt(outra)}; o caso usa a edição de ${FOCUS.dataTxt}. ${sugestao}` };
  }
  if (edicaoEmUso(caso, 'ipea') && IPEA.numero) {
    const nums = cartasNoTexto(texto), outra = nums.find(n => n !== Number(IPEA.numero));
    if (outra !== undefined && !nums.includes(Number(IPEA.numero))) return { tipo: 'edicao', texto: `Este texto cita a Carta de Conjuntura nº ${outra}; o caso usa a Carta nº ${IPEA.numero}. ${sugestao}` };
  }
  if (typeof cen.publicadasLista === 'string') {
    const agora = listaPublicadas(caso, sId);
    if (agora !== cen.publicadasLista) {
      const editado = texto !== cen.publicadasLista.trim();
      return { tipo: 'valores', revisavel: editado, texto: agora
        ? 'Os valores ou as referências deste cenário mudaram depois que este texto foi listado. Clique de novo em “Listar automaticamente”.'
        : 'Nenhum valor deste cenário vem hoje de uma referência publicada, mas este texto ainda lista projeções publicadas. Apague-o ou reescreva-o.' };
    }
  }
  return null;
}

// O mesmo dado (série e período) de uma evidência da etapa 2 na edição que o caso usa agora; null se não existir.
export function equivalenteAtual(o) {
  if (o.fonte === 'focus') {
    const linha = (o.tipo === 'mensal' ? FOCUS.mensal : FOCUS.anual).find(x => x.id === o.indicador);
    return linha?.v[o.periodo] ? evidenciaFocus(linha, o.periodo, o.tipo) : null;
  }
  const r = IPEA.registros.find(x => x.id === o.registro) || (o.chave ? IPEA.registros.find(x => x.chave === o.chave && (x.ano || null) === (o.ano || null)) : null);
  return r ? evidenciaIpea(r) : null;
}
// Evidência da etapa 2 que veio de outra edição, tem equivalente na edição em uso e ainda não foi atualizada nem mantida pelo autor.
export function evidenciaDeOutraEdicao(caso, v) {
  const o = v.origem;
  if (!o || !tem(v.dado)) return false;
  const emUso = edicaoEmUso(caso, o.fonte);
  return Boolean(emUso && o.edicao && o.edicao !== emUso.edicao && o.mantida !== emUso.edicao && equivalenteAtual(o));
}

// ---------- Texto-modelo ----------
// Marcadores que o aplicativo escreve para o autor substituir (hoje, só o de "Listar hipóteses"). Enquanto um deles
// estiver em qualquer texto do caso, a entrega tem pendência: o marcador iria como está para os slides e o relatório.
export const MARCADORES = ['[fundamentar]'];
export const marcadoresEm = txt => { const t = String(txt || '').toLowerCase(); return MARCADORES.filter(m => t.includes(m)); };
// Onde há texto-modelo no caso: [{ etapa, onde }], na ordem das etapas.
export function textosComMarcador(caso) {
  const out = [], ver = (etapa, onde, txt) => { if (marcadoresEm(txt).length) out.push({ etapa, onde }); };
  const vars = variaveisAtivas(caso), cen = s => `cenário ${s.curto.toLowerCase()}`;
  for (const [k, rot] of [['setor', 'setor e portfólio'], ['clientes', 'perfil dos clientes'], ['mercado', 'dinâmica do mercado'], ['exposicao', 'exposição macroeconômica']]) ver(1, rot, caso.diag[k]);
  for (const v of vars) { ver(2, `${v.nome}, leitura da tendência`, v.tendencia); ver(2, `${v.nome}, implicação`, v.implicacao); }
  ver(2, 'consulta ao Focus', caso.consultas.focusTexto); ver(2, 'consulta à Carta de Conjuntura', caso.consultas.ipeaTexto);
  for (const s of CENARIOS) {
    const c = caso.cenarios[s.id];
    ver(3, `premissas do ${cen(s)}`, c.premissas); ver(3, `projeções publicadas do ${cen(s)}`, c.publicadas); ver(3, `hipóteses próprias do ${cen(s)}`, c.hipoteses);
    for (const v of vars) ver(3, `justificativa de ${v.nome} no ${cen(s)}`, c.traj[v.uid]?.justificativa);
  }
  for (const s of CENARIOS) {
    const i = caso.impactos[s.id];
    for (const d of DIMENSOES) ver(4, `${d.curto.toLowerCase()} no ${cen(s)}`, i[d.id]);
    for (const v of vars) { ver(4, `efeito de ${v.nome} no cliente, ${cen(s)}`, i.cadeias[v.uid]?.cliente); ver(4, `efeito de ${v.nome} nas vendas, ${cen(s)}`, i.cadeias[v.uid]?.vendas); }
  }
  caso.decisoes.forEach((d, n) => { for (const [k, rot] of [['acao', 'ação'], ['evidencia', 'evidência'], ['risco', 'risco ou oportunidade'], ['contribuicao', 'contribuição']]) ver(5, `decisão ${n + 1}, ${rot}`, d[k]); });
  ver(5, 'síntese executiva', caso.sintese);
  // Versões resumidas escritas só para os slides (chave "s<slide>. ..."): o slide n corresponde à etapa n.
  for (const [k, txt] of Object.entries(caso.slides?.textos || {})) { const n = Number(/^s([1-5])\./.exec(k)?.[1]); if (n) ver(n, `texto resumido do slide ${n}`, txt); }
  return out;
}

const enumerar = (itens, max = 3) => { const l = itens.slice(0, max), resto = itens.length - l.length; return `${l.join('; ')}${resto > 0 ? `; e mais ${resto}` : ''}`; };
// Divergências de origem do caso inteiro, já como itens de pendência do roteiro (etapas 2 e 3). Lista vazia = nada a avisar.
export function divergencias(caso) {
  const out = [], vars = variaveisAtivas(caso);
  const add = (etapa, id, texto, detalhe) => out.push({ etapa, id, texto, detalhe });

  const antigas = vars.filter(v => evidenciaDeOutraEdicao(caso, v));
  if (antigas.length) add(2, 'ev_edicao', 'Evidências na edição dos relatórios escolhida para o caso', `${enumerar(antigas.map(v => v.nome))}: ${antigas.length === 1 ? 'dado' : 'dados'} de outra edição; atualize ou mantenha no cartão da variável`);
  const cons = avisosConsultas(caso);
  if (cons.focus) add(2, 'consulta_focus', 'Data da consulta ao Focus igual à da edição escolhida para o caso', `registrada: ${cons.focus.registrado}; edição do caso: ${cons.focus.atual}`);
  if (cons.ipea) add(2, 'consulta_ipea', 'Título da Carta de Conjuntura igual ao da edição escolhida para o caso', `registrado: ${cons.ipea.registrado}; edição do caso: ${cons.ipea.atual}`);

  const porTipo = { origem: [], edicao: [], periodo: [] };
  for (const v of vars) for (const s of CENARIOS) for (const a of avisosDoValor(caso, v, s.id)) porTipo[a.tipo].push(`${v.nome}, cenário ${s.curto.toLowerCase()}`);
  const n = porTipo.origem.length;
  if (n) add(3, 'val_origem', 'Origem de cada valor dos cenários registrada', `${n === 1 ? '1 valor sem origem' : `${n} valores sem origem`}: confira ou escolha de novo a referência`);
  if (porTipo.edicao.length) add(3, 'val_edicao', 'Valores dos cenários na edição dos relatórios escolhida para o caso', `${enumerar(porTipo.edicao)}: de outra edição`);
  if (porTipo.periodo.length) add(3, 'val_periodo', 'Referências dos cenários dentro do horizonte do caso', `${enumerar(porTipo.periodo)}: referência de outro período`);
  const textos = CENARIOS.filter(s => avisoPublicadas(caso, s.id));
  if (textos.length) add(3, 'txt_publicadas', 'Texto de “Projeções publicadas — fonte e data” em dia com os valores e a edição do caso', `${textos.length === 1 ? 'cenário' : 'cenários'} ${cenariosTxt(textos.map(s => s.id)).toLowerCase()}: clique de novo em “Listar automaticamente”`);
  return out;
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
  // Avisos de origem (edição, período, origem não registrada): só entram na lista quando existem, sempre como pendência.
  const diverg = divergencias(caso);
  for (const d of diverg.filter(x => x.etapa === 2)) add(2, d.id, d.texto, false, d.detalhe);

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
  for (const d of diverg.filter(x => x.etapa === 3)) add(3, d.id, d.texto, false, d.detalhe);

  for (const s of CENARIOS) {
    const i = caso.impactos[s.id];
    const n = DIMENSOES.filter(d => tem(i[d.id])).length;
    add(4, `imp_${s.id}`, `${s.nome}: impactos nas cinco dimensões comerciais`, n === DIMENSOES.length, `${n} de ${DIMENSOES.length}`);
  }
  const cadeiasOk = CENARIOS.every(s => vars.length > 0 && vars.some(v => tem(caso.impactos[s.id].cadeias[v.uid]?.cliente) && tem(caso.impactos[s.id].cadeias[v.uid]?.vendas)));
  add(4, 'cadeia', 'Fundamentação variável → efeito no cliente → efeito nas vendas em cada cenário', cadeiasOk);

  const decOk = caso.decisoes.filter(d => tem(d.acao) && d.cenarios?.length > 0 && tem(d.evidencia) && tem(d.risco) && tem(d.contribuicao));
  add(5, 'decisoes', 'Pelo menos três decisões comerciais completas, com cenário de aplicação e justificativa', decOk.length >= 3, `${decOk.length} de 3`);
  add(5, 'sintese', 'Síntese executiva redigida', tem(caso.sintese));
  // Texto-modelo ("[fundamentar]") ainda não substituído: só entra na lista quando existe, sempre como pendência.
  const modelo = textosComMarcador(caso);
  for (const e of ETAPAS) {
    const l = modelo.filter(m => m.etapa === e.n);
    if (l.length) add(e.n, `modelo_${e.n}`, `Texto-modelo “${MARCADORES[0]}” substituído pelo seu texto`, false, enumerar(l.map(m => m.onde)));
  }

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

// ---------- Quadro "onde está hoje, para onde deve ir, a previsão mudou?" ----------
// Para cada variável, reúne o dado observado mais recente na data da edição do relatório, a projeção registrada e a
// revisão dessa projeção (quatro semanas no Focus; Carta anterior no Ipea). Cada bloco traz a direção, a diferença e
// as legendas; "leitura" é a frase que traduz a combinação dos três para quem não é da área.
const DIA_MS = 86400000;
const menosDias = (iso, n) => new Date(new Date(`${iso}T12:00:00Z`).getTime() - n * DIA_MS).toISOString().slice(0, 10);
export const dataCurta = iso => (iso ? `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}` : '');
export const serieDe = tipo => Object.keys(SERIES_OBS).find(k => SERIES_OBS[k].variavel === tipo) || null;
export const SETA = { sobe: '▲', cai: '▼', estavel: '=' };
const casasDoNum = n => Math.min(2, Math.max(1, String(n).split('.')[1]?.length || 0));
const menos = s => String(s).replace(/(^|[\s(])-(?=\d)/g, '$1−');   // sinal de menos tipográfico, igual ao das diferenças
// Direção de a em relação a b, na precisão em que os números são mostrados: uma diferença que arredonda para zero é estabilidade.
const dirDe = (a, b, casas = 9) => (a === null || a === undefined || b === null || b === undefined ? null : Math.abs(a - b) < 0.5 * 10 ** -casas ? 'estavel' : a > b ? 'sobe' : 'cai');
function deltaTxt(d, unidade, casas) {
  const s = d > 0 ? '+' : '−', v = fmt(Math.abs(d), casas), u = String(unidade || '').trim();
  if (u.startsWith('%') || /^varia/i.test(u)) return `${s}${v} p.p.`;
  if (u === 'R$/US$') return `${s}R$ ${v}`;
  if (/^(R\$|US\$)/.test(u)) return `${s}${comUnidade(Math.abs(d), u, casas)}`;
  return `${s}${v}${u ? ' ' + u : ''}`;
}

// Valor observado de uma série na data informada (só o que já estava divulgado) e o valor de comparação.
export function observadoEm(serie, data) {
  const meta = SERIES_OBS[serie];
  if (!meta || !data) return null;
  const visiveis = OBSERVADOS.filter(r => r.serie === serie && (r.disponivel_em || r.data) <= data).sort((a, b) => a.data.localeCompare(b.data));
  const atual = visiveis.at(-1);
  if (!atual) return null;
  const anterior = meta.modo === 'nivel' ? (visiveis.filter(r => r.data <= menosDias(data, 28)).at(-1) || null) : (visiveis.at(-2) || null);
  return { meta, atual, anterior };
}

function leituraDe(proj, rev, cat, fonte) {
  if (!proj) return '';
  const verbo = cat?.grupo === 'atividade' ? { sobe: 'acelerar', cai: 'desacelerar' } : { sobe: 'subir', cai: 'cair' };
  const ipea = fonte === 'ipea';
  const desde = ipea ? 'desde a Carta anterior' : 'em um mês';
  const sentido = d => (d === 'sobe' ? 'cima' : 'baixo');
  const r = rev?.dir || null;
  if (!proj.dir) {
    if (!r) return '';
    return r === 'estavel' ? `A previsão não mudou ${desde}.` : `A previsão foi revisada para ${sentido(r)} ${desde}.`;
  }
  const a = proj.dir === 'estavel' ? 'Deve ficar no nível de hoje' : `Deve ${verbo[proj.dir]} em relação a hoje`;
  if (!r) return `${a}.`;
  if (r === 'estavel') return `${a}, e a previsão não mudou ${desde}.`;
  if (proj.dir === 'estavel') return `${a}; a previsão foi revisada para ${sentido(r)} ${desde}.`;
  if (r === proj.dir) return ipea ? `${a}, e a previsão foi revisada para ${sentido(r)} ${desde}.` : `${a}, e a previsão vem sendo revisada para ${sentido(r)}.`;
  return `${a}, mas menos do que se previa ${ipea ? 'na Carta anterior' : 'há um mês'}.`;
}

export function quadro(v) {
  const cat = catalogo(v.tipo), o = v.origem || null;
  const unidade = v.unidade || cat?.unidade || '';
  const dataRef = o?.fonte === 'ipea' ? IPEA.data : FOCUS.data;
  const serie = cat ? serieDe(cat.id) : null;
  const obs = serie ? observadoEm(serie, dataRef) : null;
  const num = numSimples(v.valorNum);
  const ehProj = v.natureza === 'Projeção publicada' && num !== null;

  let hoje = null;
  if (obs) {
    const { meta, atual, anterior } = obs, nivel = meta.modo === 'nivel';
    const dir = dirDe(atual.valor, anterior?.valor, meta.casas);
    hoje = { num: atual.valor, valor: menos(comUnidade(atual.valor, meta.unidade, meta.casas)), dir,
      delta: !dir ? '' : dir === 'estavel' ? (nivel ? 'estável em 4 semanas' : 'estável') : `${deltaTxt(atual.valor - anterior.valor, meta.unidade, meta.casas)}${nivel ? ' em 4 semanas' : ''}`,
      curta: `${atual.curto}${anterior ? ` · antes ${menos(fmt(anterior.valor, meta.casas))}` : ''}`,
      longa: `${atual.rotulo}${anterior ? ` · era ${menos(fmt(anterior.valor, meta.casas))} ${nivel ? 'há 4 semanas' : `(${anterior.curto})`}` : ''} · fonte: ${meta.fonte}`,
      medida: meta.nome, casas: meta.casas, unidade: meta.unidade };
  } else if (v.natureza === 'Dado observado' && num !== null) {
    hoje = { num, valor: v.dado || comUnidade(num, unidade, casasDoNum(num)), dir: null, delta: '', curta: v.periodo || '', longa: [v.periodo, v.fonte].filter(Boolean).join(' · '), medida: v.nome, casas: casasDoNum(num), unidade };
  }

  let proj = null, rev = null;
  if (ehProj) {
    const casasP = o?.fonte === 'focus' ? 2 : casasDoNum(num);
    // Só se compara a projeção com o dado de hoje quando as duas são a mesma medida. Taxas e cotações (modo "nivel")
    // valem para qualquer período; variações acumuladas (IPCA, PIB, FBCF) só se comparam com projeções para o ano
    // inteiro, nunca com a variação de um mês ou de um trimestre.
    const anual = o?.fonte === 'focus' ? o.tipo === 'anual' : o?.fonte === 'ipea' ? Boolean(o.ano) : /^(fim de )?\d{4}$/.test(String(v.periodo || '').trim());
    const comparavel = Boolean(obs) && (obs.meta.modo === 'nivel' || anual);
    const casasD = comparavel ? Math.max(casasP, hoje.casas) : casasP;
    const dir = comparavel ? dirDe(num, hoje.num, casasD) : null;
    const origemCurta = o?.fonte === 'focus' ? `Focus de ${dataCurta(FOCUS.data)}` : o?.fonte === 'ipea' ? `Carta nº ${IPEA.numero} (Ipea)` : '';
    proj = { num, valor: v.dado || comUnidade(num, unidade, casasP), dir,
      delta: !dir ? '' : dir === 'estavel' ? 'no nível de hoje' : `${deltaTxt(num - hoje.num, unidade, casasD)} em relação a hoje`,
      deltaCurto: !dir ? '' : dir === 'estavel' ? 'igual a hoje' : deltaTxt(num - hoje.num, unidade, casasD),
      curta: [origemCurta, v.periodo].filter(Boolean).join(' · '), longa: [v.fonte, v.publicacao, v.periodo].filter(Boolean).join(' · '), casas: casasP };

    let ant = null, curta = '', longa = '';
    if (o?.fonte === 'focus') {
      const cel = (o.tipo === 'mensal' ? FOCUS.mensal : FOCUS.anual).find(x => x.id === o.indicador)?.v[o.periodo];
      if (cel && Math.abs(cel.hoje - num) < 1e-9 && cel.h4 !== null && cel.h4 !== undefined) {
        ant = cel.h4; curta = 'em 4 semanas';
        longa = `${fmt(cel.h1, casasP)} há 1 semana · ${fmt(cel.h4, casasP)} há 4 semanas${cel.resp ? ` · ${cel.resp} respondentes` : ''}`;
      }
    } else if (o?.fonte === 'ipea' && IPEA.anterior && o.edicao === IPEA.edicao) {
      // O registro da Carta anterior só serve de comparação se medir a mesma coisa: mesmo indicador, não apenas a mesma variável e o mesmo ano.
      const atual = IPEA.registros.find(x => x.id === o.registro) || null;
      const mesmo = x => !atual || !x.indicador || x.indicador === atual.indicador;
      const r = IPEA.anterior.registros.find(x => x.id === o.registro && mesmo(x)) || (o.chave ? IPEA.anterior.registros.find(x => x.chave === o.chave && (x.ano || null) === (o.ano || null) && mesmo(x)) : null);
      if (r) { ant = r.valor; curta = IPEA.anterior.numero ? `vs. Carta nº ${IPEA.anterior.numero}` : 'vs. Carta anterior'; longa = `${fmt(r.valor, casasP)} na ${IPEA.anterior.curto}`; }
    }
    if (ant !== null) {
      const dirR = dirDe(num, ant, casasP);
      rev = { num: ant, valor: `era ${menos(fmt(ant, casasP))}`, dir: dirR, delta: dirR === 'estavel' ? 'sem alteração' : `${deltaTxt(num - ant, unidade, casasP)}${o.fonte === 'focus' ? ' em 4 semanas' : ' desde a Carta anterior'}`,
        deltaCurto: dirR === 'estavel' ? 'sem alteração' : deltaTxt(num - ant, unidade, casasP), curta, longa };
    }
  }
  return { hoje, proj, rev, leitura: leituraDe(proj, rev, cat, o?.fonte || null), temQuadro: Boolean(hoje || proj) };
}
// A tendência sugerida para um dado do Focus ou da Carta é a leitura do quadro; sem projeção para comparar, fica o texto descritivo.
function comLeitura(ev) {
  const l = quadro(ev).leitura;
  return l ? { ...ev, tendencia: l } : ev;
}

// Monta o registro de evidência a partir de uma célula do Focus.
export function evidenciaFocus(linha, periodo, tipoHorizonte) {
  const c = linha.v[periodo];
  const cat = VARIAVEIS.find(x => x.focus === linha.id) || null;
  const comp = { alta: 'revisão para cima', queda: 'revisão para baixo', estavel: 'estabilidade' }[c.comp];
  const perTxt = tipoHorizonte === 'anual' ? `fim de ${periodo}` : (periodo.startsWith('Infl') ? 'próximos 12 meses (suavizada)' : periodo);
  const ev = {
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
  return comLeitura(ev);
}

// Monta o registro de evidência a partir de um indicador da Carta de Conjuntura do Ipea.
export function evidenciaIpea(r) {
  const cat = (r.chave && VARIAVEIS.find(x => x.ipea === r.chave)) || null;
  const ev = {
    tipo: cat?.id || 'outra',
    nome: cat?.nome || r.indicador,
    dado: valorIpea(r),
    valorNum: r.valor,
    unidade: cat?.unidade || r.unidade,
    natureza: r.natureza,
    fonte: `${IPEA.curtoNota} (Ipea), p. ${r.pagina}`,
    publicacao: IPEA.publicacao,
    periodo: r.periodo,
    tendencia: r.nota || `${r.indicador}.`,
    origem: { fonte: 'ipea', edicao: IPEA.edicao, registro: r.id, chave: r.chave || null, ano: r.ano || null },
  };
  return comLeitura(ev);
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
    const rs = registrosIpeaDe(cat);
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
  for (const r of registrosIpeaDe(cat)) out.ipea.push({ registro: r, ev: evidenciaIpea(r) });
  return out;
}

// A evidência registrada na variável ainda corresponde a este registro de origem?
export const mesmaOrigem = (o, ev) => Boolean(o && ev?.origem && o.fonte === ev.origem.fonte && o.edicao === ev.origem.edicao
  && (o.fonte === 'focus' ? o.tipo === ev.origem.tipo && o.indicador === ev.origem.indicador && String(o.periodo) === String(ev.origem.periodo) : o.registro === ev.origem.registro));
