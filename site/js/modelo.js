// Modelo do caso: espelha as cinco seções do roteiro do Estudo de Caso 2 e os critérios de validação da entrega.
import { VARIAVEIS, FOCUS, IPEA, SERIES_OBS, OBSERVADOS, fmt, comUnidade, valorIpea, registrosIpeaDe } from './refdata.js';

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
    entrega: { formato: '' },   // último formato de entrega aberto: 'slides' ou 'relatorio'
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

  const decOk = caso.decisoes.filter(d => tem(d.acao) && d.cenarios?.length > 0 && tem(d.evidencia) && tem(d.risco) && tem(d.contribuicao));
  add(5, 'decisoes', 'Pelo menos três decisões comerciais completas, com cenário de aplicação e justificativa', decOk.length >= 3, `${decOk.length} de 3`);
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
