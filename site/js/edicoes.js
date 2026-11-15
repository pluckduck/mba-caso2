// Edições dos relatórios de referência (Focus e Carta de Conjuntura do Ipea).
// Mantém a lista de edições, carrega os dados da edição em uso e calcula o calendário de divulgação.
// Os objetos FOCUS e IPEA (refdata.js) sempre refletem a edição em uso pelo caso aberto.
import { FOCUS, IPEA, EDICOES_EMBUTIDAS, OBSERVADOS } from './refdata.js';
import * as api from './api.js';

const copiar = o => JSON.parse(JSON.stringify(o));
// Cópia dos dados embutidos, para voltar a eles no modo local ou se o banco falhar.
const EMBUTIDO = { focus: { anual: copiar(FOCUS.anual), mensal: copiar(FOCUS.mensal) }, ipea: { registros: copiar(IPEA.registros) } };

export const estadoEdicoes = { lista: EDICOES_EMBUTIDAS, origem: 'embutido', emUso: { focus: FOCUS.edicao, ipea: IPEA.edicao } };
const cache = new Map();   // id da edição -> linhas de dados já buscadas

export const edicao = id => estadoEdicoes.lista.find(e => e.id === id) || null;
// Edições com dados, da mais recente para a mais antiga.
export const carregadas = fonte => estadoEdicoes.lista.filter(e => e.fonte === fonte && e.situacao === 'carregado')
  .sort((a, b) => b.data_referencia.localeCompare(a.data_referencia));
export const maisRecente = fonte => carregadas(fonte)[0] || null;
export const rotuloEdicao = e => (e ? (e.fonte === 'focus' ? e.rotulo : `Carta ${e.rotulo}`) : '');

// Busca a lista de edições no banco. Sem banco (modo local) ou em caso de falha, ficam as embutidas.
export async function carregarLista() {
  const lista = await api.listarRelatorios();
  if (Array.isArray(lista) && lista.some(e => e.fonte === 'focus' && e.situacao === 'carregado') && lista.some(e => e.fonte === 'ipea' && e.situacao === 'carregado')) {
    estadoEdicoes.lista = lista; estadoEdicoes.origem = 'supabase';
    // Valores observados: os do banco substituem a cópia embutida.
    const obs = await api.listarObservados();
    if (Array.isArray(obs) && obs.length) OBSERVADOS.splice(0, OBSERVADOS.length, ...obs.map(r => ({ ...r, valor: Number(r.valor) })));
  }
  return estadoEdicoes.lista;
}

function aplicarFocus(ed, linhas) {
  const cel = r => ({ h4: r.ha_4_semanas, h1: r.ha_1_semana, hoje: r.hoje, comp: r.comportamento, sem: r.semanas, resp: r.respondentes, d5: r.cinco_dias, resp5: r.respondentes_5d });
  for (const tipo of ['anual', 'mensal']) {
    const mapa = new Map();
    for (const r of linhas.filter(x => x.tipo === tipo)) {
      if (!mapa.has(r.indicador_id)) mapa.set(r.indicador_id, { id: r.indicador_id, indicador: r.indicador, unidade: r.unidade, casas: 2, v: {} });
      mapa.get(r.indicador_id).v[r.periodo] = cel(r);
    }
    FOCUS[tipo] = [...mapa.values()];
  }
  Object.assign(FOCUS, ed.metadados || {}, { edicao: ed.id, data: ed.data_referencia });
}
function aplicarIpea(ed, linhas) {
  IPEA.registros = linhas.map(r => ({ id: r.id, tema: r.tema, indicador: r.indicador, valor: r.valor, unidade: r.unidade, periodo: r.periodo, natureza: r.natureza, pagina: r.pagina, nota: r.nota || '', chave: r.chave || undefined, ano: r.ano || undefined }));
  Object.assign(IPEA, ed.metadados || {}, { edicao: ed.id, data: ed.data_referencia });
}
// Edição do Ipea imediatamente anterior à informada (base de comparação das projeções); null se não houver dados.
async function anteriorIpea(ed) {
  const ant = carregadas('ipea').find(e => e.data_referencia < ed.data_referencia);
  if (!ant) return null;
  try {
    const linhas = await dadosDe(ant);
    if (!linhas) return null;
    return { id: ant.id, numero: ant.metadados?.numero ?? null, curto: ant.metadados?.curto || `Carta ${ant.rotulo}`, registros: linhas.map(r => ({ id: r.id, indicador: r.indicador, valor: Number(r.valor), chave: r.chave || null, ano: r.ano || null })) };
  } catch { return null; }
}

// Dados de uma edição: do banco (com cache) ou, para as edições embutidas sem banco, da cópia local.
async function dadosDe(ed) {
  if (cache.has(ed.id)) return cache.get(ed.id);
  let linhas = null;
  if (estadoEdicoes.origem === 'supabase') linhas = await api.dadosRelatorio(ed.fonte, ed.id);
  if (!linhas?.length) {
    const emb = EDICOES_EMBUTIDAS.find(e => e.id === ed.id);
    if (!emb) throw new Error('Não foi possível carregar os dados desta edição.');
    return null;   // sinaliza: usar os dados embutidos
  }
  cache.set(ed.id, linhas);
  return linhas;
}

// Passa a usar uma edição: carrega os dados e atualiza FOCUS ou IPEA.
export async function usarEdicao(fonte, id) {
  const ed = edicao(id) || EDICOES_EMBUTIDAS.find(e => e.fonte === fonte);
  const linhas = await dadosDe(ed);
  if (linhas) (fonte === 'focus' ? aplicarFocus : aplicarIpea)(ed, linhas);
  else if (fonte === 'focus') { Object.assign(FOCUS, copiar(EMBUTIDO.focus), ed.metadados || {}, { edicao: ed.id }); }
  else { Object.assign(IPEA, copiar(EMBUTIDO.ipea), ed.metadados || {}, { edicao: ed.id, data: ed.data_referencia }); }
  if (fonte === 'ipea') IPEA.anterior = await anteriorIpea(ed);
  estadoEdicoes.emUso[fonte] = ed.id;
  return ed;
}

// Valor de uma série em outra edição já usada nesta sessão (para comparar o dado antigo com o atual). Devolve null se não houver.
export function linhasEmCache(id) { return cache.get(id) || null; }

// ---------- Calendário de divulgação ----------
const DIA = 86400000;
const deISO = s => new Date(`${s}T12:00:00Z`);
const paraISO = d => d.toISOString().slice(0, 10);
export const hojeISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const dataCurta = iso => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');
export const dataCompleta = iso => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '');

function pascoa(ano) {   // algoritmo de Meeus/Jones/Butcher
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia, 12));
}
const FIXOS = ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25'];
function semExpediente(d) {
  const dow = d.getUTCDay();
  if (dow === 0 || dow === 6) return true;
  const iso = paraISO(d);
  if (FIXOS.includes(iso.slice(5))) return true;
  const p = pascoa(d.getUTCFullYear()).getTime();
  return [-48, -47, -2, 60].some(n => paraISO(new Date(p + n * DIA)) === iso);   // Carnaval (seg. e ter.), Sexta-feira Santa, Corpus Christi
}
function proximoDiaUtil(d) { let x = d; while (semExpediente(x)) x = new Date(x.getTime() + DIA); return x; }

// Calendário do Focus: uma edição por semana (data de referência na sexta), divulgada na segunda seguinte,
// ou no dia útil seguinte quando a segunda não tem expediente. É uma previsão pela regra, não uma consulta ao Banco Central.
export function calendarioFocus(hoje = hojeISO(), semanasAdiante = 8) {
  const feitas = carregadas('focus');
  if (!feitas.length) return [];
  const sextaDe = d => new Date(d.getTime() + ((5 - d.getUTCDay() + 7) % 7) * DIA);
  let sexta = sextaDe(deISO(feitas.at(-1).data_referencia));
  const fim = deISO(hoje).getTime() + semanasAdiante * 7 * DIA;
  const out = [];
  for (; sexta.getTime() <= fim; sexta = new Date(sexta.getTime() + 7 * DIA)) {
    // Data de referência: a sexta-feira, ou o dia útil anterior quando a sexta não tem expediente.
    let diaRef = sexta; while (semExpediente(diaRef)) diaRef = new Date(diaRef.getTime() - DIA);
    const segunda = paraISO(new Date(sexta.getTime() - 4 * DIA)), ref = paraISO(diaRef);
    const ed = feitas.find(e => e.data_referencia >= segunda && e.data_referencia <= paraISO(sexta));
    const saida = ed?.data_divulgacao || paraISO(proximoDiaUtil(new Date(sexta.getTime() + 3 * DIA)));
    out.push({ fonte: 'focus', ref: ed?.data_referencia || ref, saida, edicao: ed || null, situacao: ed ? 'carregado' : (saida <= hoje ? 'falta' : 'previsto') });
  }
  return out;
}
// Calendário do Ipea: vem da lista de edições (as previstas são mantidas no banco, por estimativa).
export function calendarioIpea() {
  return estadoEdicoes.lista.filter(e => e.fonte === 'ipea').sort((a, b) => a.data_referencia.localeCompare(b.data_referencia))
    .map(e => ({ fonte: 'ipea', ref: e.data_referencia, saida: e.data_divulgacao || null, edicao: e, situacao: e.situacao === 'carregado' ? 'carregado' : (e.data_divulgacao ? 'previsto' : 'aguardando') }));
}
