// Explorador dos dados de apoio: Relatório Focus (BCB) e Carta de Conjuntura (Ipea).
import { h, botao, selo, faisca, barrasGrupos, linhas } from './ui.js';
import { FOCUS, IPEA, fmt, valorIpea } from './refdata.js';
import { evidenciaFocus, evidenciaIpea } from './modelo.js';
import { dataCompleta } from './edicoes.js';

const SETAS = { alta: ['▲', 'alta'], queda: ['▼', 'queda'], estavel: ['＝', 'estável'] };

function tabelaFocus(tipo, aoUsar) {
  const linhasDados = tipo === 'anual' ? FOCUS.anual : FOCUS.mensal;
  const periodos = tipo === 'anual' ? FOCUS.anos : FOCUS.periodosMensais;
  return h('div', { class: 'tabela-rolagem' },
    h('table', { class: 'tabela focus' },
      h('thead', {}, h('tr', {}, h('th', {}, 'Indicador (mediana)'), periodos.map(p => h('th', {}, String(p))))),
      h('tbody', {}, linhasDados.map(l => h('tr', {},
        h('th', { scope: 'row' }, l.indicador, h('span', { class: 'unid' }, l.unidade)),
        periodos.map(p => {
          const c = l.v[p];
          if (!c) return h('td', { class: 'vazio' }, '—');
          const [seta, nome] = SETAS[c.comp];
          const conteudo = [
            h('div', { class: 'cel-topo' }, h('strong', {}, fmt(c.hoje, l.casas)), h('span', { class: `tend ${c.comp}`, title: `${nome} há ${c.sem} semana(s)` }, `${seta} ${c.sem}`)),
            h('div', { class: 'cel-base' }, faisca([c.h4, c.h1, c.hoje]), h('span', { class: 'antes' }, `4 sem.: ${fmt(c.h4, l.casas)}`)),
          ];
          return h('td', {}, aoUsar
            ? h('button', { class: 'cel-btn', title: 'Usar como evidência', onclick: () => aoUsar(evidenciaFocus(l, p, tipo)) }, conteudo)
            : h('div', { class: 'cel' }, conteudo));
        }))))));
}

function tabelaIpea(aoUsar, filtroInicial) {
  const estado = { tema: filtroInicial?.tema || 'Todos', busca: '', chave: filtroInicial?.chave || null };
  const corpo = h('tbody');
  const chips = h('div', { class: 'chips' });
  const desenhar = () => {
    // replaceChildren escreve "null" na tela se receber um valor vazio: por isso as listas são filtradas.
    chips.replaceChildren(...[...['Todos', ...IPEA.temas].map(t => h('button', { class: `chip ${estado.tema === t && !estado.chave ? 'ativo' : ''}`, onclick: () => { estado.tema = t; estado.chave = null; desenhar(); } }, t)),
      estado.chave ? h('button', { class: 'chip ativo', onclick: () => { estado.chave = null; desenhar(); } }, 'Relacionados à variável ✕') : null].filter(Boolean));
    const q = estado.busca.trim().toLowerCase();
    const lista = IPEA.registros.filter(r => (estado.chave ? r.chave === estado.chave : (estado.tema === 'Todos' || r.tema === estado.tema))
      && (!q || `${r.indicador} ${r.nota} ${r.periodo}`.toLowerCase().includes(q)));
    corpo.replaceChildren(...[...lista.map(r => h('tr', {},
      h('td', {}, h('strong', {}, r.indicador), h('div', { class: 'nota' }, r.nota)),
      h('td', { class: 'num' }, valorIpea(r)),
      h('td', {}, r.periodo),
      h('td', {}, selo(r.natureza, r.natureza === 'Projeção publicada' ? 'proj' : (r.natureza === 'Dado observado' ? 'obs' : 'ana'))),
      h('td', { class: 'num' }, `p. ${r.pagina}`),
      aoUsar ? h('td', {}, botao('Usar', () => aoUsar(evidenciaIpea(r)), 'pequeno')) : null)),
      lista.length ? null : h('tr', {}, h('td', { colspan: 6, class: 'vazio' }, 'Nenhum indicador encontrado com esse filtro.'))].filter(Boolean));
  };
  desenhar();
  return h('div', {},
    h('div', { class: 'linha-filtros' }, chips, h('input', { type: 'search', placeholder: 'Buscar indicador…', 'aria-label': 'Buscar indicador', oninput: e => { estado.busca = e.target.value; desenhar(); } })),
    h('div', { class: 'tabela-rolagem' }, h('table', { class: 'tabela' },
      h('thead', {}, h('tr', {}, ['Indicador', 'Valor', 'Período de referência', 'Natureza', 'Página', aoUsar ? '' : null].filter(x => x !== null).map(t => h('th', {}, t)))), corpo)));
}

function comparar() {
  const pares = [['ipca', 'IPCA (%)', 'ipca'], ['pib', 'PIB (%)', 'pib'], ['selic', 'Selic (% a.a.)', 'selic'], ['cambio', 'Câmbio (R$/US$)', 'cambio']];
  const blocos = pares.map(([idF, nome, chave]) => {
    const f = FOCUS.anual.find(x => x.id === idF);
    const itens = [];
    for (const ano of FOCUS.anos.slice(0, 2)) {
      if (!f?.v[ano]) continue;
      itens.push({ rotulo: `Focus ${ano} (${dataCompleta(FOCUS.data)})`, valor: f.v[ano].hoje, cor: 'var(--c-base)' });
      const r = IPEA.registros.find(x => x.chave === chave && x.ano === ano);
      if (r) itens.push({ rotulo: `Ipea ${ano} (Carta nº ${IPEA.numero})`, valor: r.valor, cor: 'var(--c-destaque)' });
    }
    return { nome, itens };
  });
  const serie = id => FOCUS.anos.map(a => [String(a), FOCUS.anual.find(x => x.id === id).v[a].hoje]);
  return h('div', { class: 'grade-2' },
    h('div', { class: 'cartao' }, h('h4', {}, 'Focus e Ipea lado a lado'),
      h('p', { class: 'ajuda' }, `As duas fontes têm datas diferentes: o Focus é de ${dataCompleta(FOCUS.data)} e a Carta do Ipea é do ${IPEA.periodo}. Diferenças entre elas ajudam a delimitar os cenários favorável e adverso.`),
      barrasGrupos(blocos)),
    h('div', { class: 'cartao' }, h('h4', {}, `Trajetória esperada pelo mercado (Focus), ${FOCUS.anos[0]}–${FOCUS.anos.at(-1)}`),
      linhas([{ nome: 'Selic', cor: 'var(--c-primaria)', pontos: serie('selic') }, { nome: 'IPCA', cor: 'var(--c-adverso)', pontos: serie('ipca') }, { nome: 'PIB', cor: 'var(--c-favoravel)', pontos: serie('pib') }], FOCUS.anos.map(String)),
      h('div', { class: 'legenda' }, [['Selic (% a.a.)', 'var(--c-primaria)'], ['IPCA (%)', 'var(--c-adverso)'], ['PIB (%)', 'var(--c-favoravel)']].map(([t, c]) => h('span', {}, h('i', { style: `background:${c}` }), t)))));
}

// aoUsar(evidencia): quando informado, as células e linhas viram botões "usar como evidência".
export function explorador({ aoUsar = null, filtro = null, origem = '' } = {}) {
  const abas = [['focus-anual', 'Focus · anual'], ['focus-mensal', 'Focus · mensal'], ['ipea', 'Ipea · indicadores'], ['ipea-args', 'Ipea · argumentos'], ['comparar', 'Comparar fontes']];
  let ativa = filtro?.aba || 'focus-anual';
  const corpo = h('div', { class: 'explorador-corpo' });
  const barra = h('div', { class: 'abas', role: 'tablist' });
  const desenhar = () => {
    barra.replaceChildren(...abas.map(([id, t]) => h('button', { role: 'tab', 'aria-selected': String(ativa === id), class: ativa === id ? 'ativa' : '', onclick: () => { ativa = id; desenhar(); } }, t)));
    let conteudo;
    if (ativa === 'focus-anual' || ativa === 'focus-mensal') {
      conteudo = [h('p', { class: 'ajuda' }, `${FOCUS.titulo} — ${FOCUS.instituicao}, ${FOCUS.dataTxt}. ${FOCUS.nota}${aoUsar ? ' Clique em um valor para usá-lo como evidência.' : ''}`),
        tabelaFocus(ativa === 'focus-anual' ? 'anual' : 'mensal', aoUsar)];
    } else if (ativa === 'ipea') {
      conteudo = [h('p', { class: 'ajuda' }, `${IPEA.titulo} — ${IPEA.periodo}. ${IPEA.nota}`), tabelaIpea(aoUsar, filtro)];
    } else if (ativa === 'ipea-args') {
      conteudo = [h('p', { class: 'ajuda' }, 'Guia de leitura: paráfrases dos argumentos centrais da Carta, com a página de origem. Use-o para localizar os trechos no original; não substitui a leitura.'),
        h('div', { class: 'grade-2' }, IPEA.argumentos.map(a => h('div', { class: 'cartao arg' }, h('h4', {}, a.titulo), h('p', {}, a.texto), h('span', { class: 'pag' }, `${IPEA.curto}, p. ${a.pagina}`))))];
    } else conteudo = [comparar()];
    corpo.replaceChildren(...conteudo);
  };
  desenhar();
  return h('div', { class: 'explorador' }, barra, corpo, origem ? h('p', { class: 'ajuda origem' }, origem) : null);
}
