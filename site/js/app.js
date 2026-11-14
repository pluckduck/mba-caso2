// Aplicativo guiado do Estudo de Caso 2 — Cenários Econômicos e Estratégias de Vendas.
import * as api from './api.js';
import { h, campo, botao, aviso, modal, selo, barrasGrupos, anel, montarSlide } from './ui.js';
import { FOCUS, IPEA, VARIAVEIS, FONTES_CONSULTA, referenciasPublicadas, fmt, comUnidade } from './refdata.js';
import { TEMAS, FONTES_TIPO, OPCOES_ELEMENTOS, ROTULOS_CORES, resolverTema, aplicarTemaNaInterface, contraste } from './themes.js';
import { CENARIOS, DIMENSOES, NATUREZAS, ETAPAS, casoVazio, normalizar, novaVariavel, novaDecisao, variaveisAtivas, catalogo, mesesHorizonte,
  horizonteTxt, classificarValor, direcao, simular, validar, progresso, numSimples } from './modelo.js';
import { construir, exportarPptx, notasApresentador, renderHTML, TITULOS } from './slides.js';
import { explorador } from './explorador.js';

const estado = { caso: casoVazio(), tema: { id: 'executivo' }, salvo: 'ok', origemDados: 'arquivo' };
const raiz = document.getElementById('app');
let vivos = [];
let tSalvar = null, tVivo = null;

const temaAtual = () => resolverTema(estado.tema);

// ---------- Persistência ----------
function marcarSalvo(s) {
  estado.salvo = s;
  const el = document.getElementById('estado-salvo');
  if (!el) return;
  el.className = `estado-salvo ${s}`;
  el.textContent = { ok: api.remoto ? 'Salvo na nuvem' : 'Salvo neste navegador', pendente: 'Salvando…', erro: 'Erro ao salvar' }[s];
}
async function salvarAgora() {
  clearTimeout(tSalvar);
  try { await api.salvarCaso(estado.caso, estado.tema); marcarSalvo('ok'); }
  catch (e) { marcarSalvo('erro'); aviso(`Não foi possível salvar: ${e.message}`, 'erro'); }
}
function mudou() {
  marcarSalvo('pendente');
  clearTimeout(tSalvar); tSalvar = setTimeout(salvarAgora, 900);
  clearTimeout(tVivo); tVivo = setTimeout(() => { vivos.forEach(f => f()); atualizarNav(); }, 220);
}
// Região que se redesenha sozinha quando os dados mudam (nunca contém campos em edição).
function vivo(fn, classe = '') {
  const c = h('div', { class: classe });
  const rodar = () => c.replaceChildren(...[fn()].flat(Infinity).filter(Boolean));
  rodar(); vivos.push(rodar);
  return c;
}
window.addEventListener('beforeunload', e => { if (estado.salvo === 'pendente') { salvarAgora(); e.preventDefault(); e.returnValue = ''; } });

// ---------- Dados de referência vindos do Supabase ----------
function hidratarReferencias(refs) {
  if (!refs) return;
  const cel = r => ({ h4: r.ha_4_semanas, h1: r.ha_1_semana, hoje: r.hoje, comp: r.comportamento, sem: r.semanas, resp: r.respondentes, d5: r.cinco_dias, resp5: r.respondentes_5d });
  for (const tipo of ['anual', 'mensal']) {
    const mapa = new Map();
    for (const r of refs.focus.filter(x => x.tipo === tipo)) {
      if (!mapa.has(r.indicador_id)) mapa.set(r.indicador_id, { id: r.indicador_id, indicador: r.indicador, unidade: r.unidade, casas: 2, v: {} });
      mapa.get(r.indicador_id).v[r.periodo] = cel(r);
    }
    if (mapa.size) FOCUS[tipo] = [...mapa.values()];
  }
  IPEA.registros = refs.ipea.map(r => ({ id: r.id, tema: r.tema, indicador: r.indicador, valor: r.valor, unidade: r.unidade, periodo: r.periodo, natureza: r.natureza, pagina: r.pagina, nota: r.nota || '', chave: r.chave || undefined, ano: r.ano || undefined }));
  for (const f of refs.fontes || []) Object.assign(f.id === 'focus' ? FOCUS : IPEA, f.metadados || {});
  estado.origemDados = 'supabase';
}

// ---------- Navegação ----------
const ROTAS = [
  { id: 'painel', titulo: 'Painel', icone: '◎' },
  ...ETAPAS.map(e => ({ id: `etapa/${e.n}`, titulo: `${e.n}. ${e.titulo}`, etapa: e.n })),
  { id: 'slides', titulo: 'Slides da entrega', icone: '▣', separador: true },
  { id: 'dados', titulo: 'Dados: Focus e Ipea', icone: '≡' },
  { id: 'tema', titulo: 'Tema visual', icone: '◐' },
  { id: 'fontes', titulo: 'Fontes de consulta', icone: '↗' },
];
const rotaAtual = () => (location.hash.replace(/^#\/?/, '') || 'painel');
const ir = r => { location.hash = `#/${r}`; };

function atualizarNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const prog = progresso(validar(estado.caso));
  const atual = rotaAtual();
  nav.replaceChildren(...ROTAS.map(r => {
    const p = r.etapa ? prog.porEtapa[r.etapa] : null;
    return h('a', { href: `#/${r.id}`, class: `nav-item ${atual === r.id ? 'ativo' : ''} ${r.separador ? 'separador' : ''}`, 'aria-current': atual === r.id ? 'page' : null },
      h('span', { class: `nav-ico ${p && p.ok === p.total ? 'feito' : ''}` }, p ? (p.ok === p.total ? '✓' : String(r.etapa)) : r.icone),
      h('span', { class: 'nav-txt' }, r.etapa ? r.titulo.replace(/^\d\.\s/, '') : r.titulo),
      p ? h('span', { class: 'nav-prog' }, `${p.ok}/${p.total}`) : null);
  }));
  const pct = document.getElementById('nav-pct');
  if (pct) pct.replaceChildren(anel(prog.pct, 56), h('div', {}, h('strong', {}, 'Entrega'), h('span', {}, `${prog.ok} de ${prog.total} itens`)));
}

function montarCasca() {
  const u = api.usuario();
  raiz.replaceChildren(
    h('a', { href: '#conteudo', class: 'pular' }, 'Pular para o conteúdo'),
    h('aside', { class: 'lateral' },
      h('div', { class: 'marca' }, h('div', {}, h('strong', {}, 'Estudo de Caso 2'), h('span', {}, 'Cenários econômicos e vendas'))),
      h('div', { id: 'nav-pct', class: 'nav-pct' }),
      h('nav', { id: 'nav', 'aria-label': 'Etapas do caso' }),
      h('div', { class: 'lateral-pe' },
        h('span', { id: 'estado-salvo', class: 'estado-salvo ok' }, ''),
        h('span', { class: 'usuario', title: u?.email || '' }, api.remoto ? (u?.user_metadata?.nome || u?.email || '') : 'Modo local (sem login)'),
        api.remoto ? botao('Sair', async () => { await salvarAgora(); await api.sair(); location.hash = ''; location.reload(); }, 'fantasma pequeno') : null)),
    h('main', { id: 'conteudo', tabindex: '-1' }));
  marcarSalvo(estado.salvo);
  desenharRota();
}

function desenharRota(manterRolagem = false) {
  const main = document.getElementById('conteudo');
  if (!main) return;
  const y = window.scrollY;
  vivos = [];
  const r = rotaAtual();
  let vista;
  if (r.startsWith('etapa/')) vista = ({ 1: etapa1, 2: etapa2, 3: etapa3, 4: etapa4, 5: etapa5 }[Number(r.split('/')[1])] || painel)();
  else vista = ({ painel, slides: vistaSlides, dados: vistaDados, tema: vistaTema, fontes: vistaFontes }[r] || painel)();
  main.replaceChildren(vista);
  atualizarNav();
  window.scrollTo(0, manterRolagem ? y : 0);
}
const redesenhar = () => desenharRota(true);
window.addEventListener('hashchange', () => desenharRota());

function cabecalhoEtapa(n) {
  const e = ETAPAS[n - 1];
  return h('header', { class: 'cab-etapa' },
    h('span', { class: 'kicker' }, `Etapa ${n} de 5 · seção ${String(n).padStart(2, '0')} do roteiro`),
    h('h1', {}, e.sub),
    vivo(() => {
      const itens = validar(estado.caso).filter(i => i.etapa === n);
      return h('ul', { class: 'criterios' }, itens.map(i => h('li', { class: i.ok ? 'ok' : '' }, h('span', { class: 'marca-ok' }, i.ok ? '✓' : '○'), i.texto, i.detalhe && !i.ok ? h('em', {}, ` (${i.detalhe})`) : null)));
    }));
}
function rodapeEtapa(n) {
  return h('footer', { class: 'pe-etapa' },
    n > 1 ? botao(`← ${ETAPAS[n - 2].titulo}`, () => ir(`etapa/${n - 1}`), 'fantasma') : botao('← Painel', () => ir('painel'), 'fantasma'),
    n < 5 ? botao(`${ETAPAS[n].titulo} →`, () => ir(`etapa/${n + 1}`), 'primario') : botao('Gerar os 5 slides →', () => ir('slides'), 'primario'));
}
const C = (o) => campo({ aoMudar: mudou, ...o });

// ---------- Painel ----------
function painel() {
  const caso = estado.caso;
  const itens = validar(caso), prog = progresso(itens);
  const proxima = ETAPAS.find(e => prog.porEtapa[e.n].ok < prog.porEtapa[e.n].total);
  const destaque = id => { const l = FOCUS.anual.find(x => x.id === id); return h('div', { class: 'kpi' },
    h('span', { class: 'kpi-nome' }, l.indicador, h('small', {}, l.unidade)),
    h('div', { class: 'kpi-vals' }, [2026, 2027].map(a => h('div', {}, h('small', {}, a), h('strong', {}, fmt(l.v[a].hoje)), h('span', { class: `tend ${l.v[a].comp}` }, { alta: '▲', queda: '▼', estavel: '＝' }[l.v[a].comp]))))); };
  const ip = id => IPEA.registros.find(r => r.id === id);
  return h('div', { class: 'vista' },
    h('header', { class: 'heroi' },
      h('div', {},
        h('span', { class: 'kicker' }, 'MBA Gestão Comercial e SalesTech · Cenários Econômicos em Vendas'),
        h('h1', {}, caso.ident.empresa ? `Caso: ${caso.ident.empresa}` : 'Cenários econômicos e estratégias de vendas'),
        h('p', { class: 'lead' }, 'Objetivo da atividade: interpretar indicadores macroeconômicos, construir cenários prospectivos e transformar informações econômicas em decisões estratégicas para a gestão comercial, com consulta obrigatória ao Relatório Focus (BCB) e à Carta de Conjuntura (Ipea).'),
        h('div', { class: 'acoes' },
          botao(proxima ? `Continuar: ${proxima.titulo} →` : 'Revisar os slides →', () => ir(proxima ? `etapa/${proxima.n}` : 'slides'), 'primario'),
          botao('Ver os 5 slides', () => ir('slides'), 'fantasma'))),
      h('div', { class: 'heroi-anel' }, anel(prog.pct, 132), h('span', {}, `${prog.ok} de ${prog.total} itens da entrega`))),

    h('section', { class: 'cadeia' }, ['Indicador', 'Cenário', 'Impacto no cliente', 'Impacto nas vendas', 'Decisão comercial'].map((t, i) =>
      [h('a', { href: `#/etapa/${[2, 3, 4, 4, 5][i]}`, class: 'elo' }, h('small', {}, `Etapa ${[2, 3, 4, 4, 5][i]}`), t), i < 4 ? h('span', { class: 'seta', 'aria-hidden': 'true' }, '→') : null])),

    h('div', { class: 'grade-2' },
      h('section', { class: 'cartao' },
        h('h2', {}, 'Pendências da entrega'),
        prog.ok === prog.total ? h('p', { class: 'ok-msg' }, 'Todos os itens do roteiro foram atendidos. Revise os slides e exporte a apresentação.') :
          h('ul', { class: 'pendencias' }, ETAPAS.map(e => { const pend = itens.filter(i => i.etapa === e.n && !i.ok); return pend.length ? h('li', {}, h('a', { href: `#/etapa/${e.n}` }, `${e.n}. ${e.titulo}`), h('ul', {}, pend.map(p => h('li', {}, p.texto, p.detalhe ? h('em', {}, ` (${p.detalhe})`) : null)))) : null; }))),
      h('section', { class: 'cartao' },
        h('h2', {}, 'Critérios de avaliação'),
        h('ol', { class: 'lista-criterios' }, ['Qualidade da pesquisa', 'Interpretação dos indicadores', 'Coerência dos cenários', 'Relação com a realidade comercial', 'Fundamentação das decisões'].map(t => h('li', {}, t))),
        h('p', { class: 'ajuda' }, 'Entrega: apresentação de até cinco slides, com identificação das fontes, datas e períodos de referência dos indicadores utilizados.'))),

    h('section', { class: 'cartao' },
      h('div', { class: 'cab-linha' }, h('h2', {}, 'Expectativas de mercado em destaque'), h('a', { href: '#/dados' }, 'Explorar todos os dados →')),
      h('p', { class: 'ajuda' }, `Medianas do ${FOCUS.titulo} de ${FOCUS.dataTxt}. A seta indica a direção da revisão na última semana.`),
      h('div', { class: 'kpis' }, ['ipca', 'pib', 'selic', 'cambio'].map(destaque)),
      h('p', { class: 'ajuda' }, `Contraponto do Ipea (${IPEA.periodo}): PIB de ${fmt(ip('pib_2026').valor, 1)}% em 2026 e ${fmt(ip('pib_2027').valor, 1)}% em 2027; IPCA de ${fmt(ip('ipca_2026').valor, 1)}% em 2026; taxa de desocupação de ${fmt(ip('desocupacao').valor, 1)}% no trimestre até abril de 2026.`)));
}

// ---------- Etapa 1 ----------
function temDadosVar(v) { return ['dado', 'fonte', 'tendencia', 'implicacao'].some(k => String(v[k] || '').trim()); }
function removerVariavel(uidV) {
  const c = estado.caso;
  c.variaveis = c.variaveis.filter(v => v.uid !== uidV);
  while (c.variaveis.length < 3) c.variaveis.push(novaVariavel());
  for (const s of CENARIOS) { delete c.cenarios[s.id].traj[uidV]; delete c.impactos[s.id].cadeias[uidV]; }
  delete c.simulador.sens[uidV];
}
function alternarVariavel(catId) {
  const c = estado.caso, cat = catalogo(catId);
  const existente = catId !== 'outra' && c.variaveis.find(v => v.tipo === catId);
  if (existente) {
    if (temDadosVar(existente) && !confirm(`Remover "${existente.nome}" e as evidências já registradas para ela?`)) return;
    removerVariavel(existente.uid);
  } else {
    let alvo = c.variaveis.find(v => !v.nome && !v.tipo);
    if (!alvo) { alvo = novaVariavel(); c.variaveis.push(alvo); }
    Object.assign(alvo, { tipo: cat.id, nome: catId === 'outra' ? '' : cat.nome, unidade: cat.unidade });
  }
  mudou(); redesenhar();
}

function etapa1() {
  const c = estado.caso;
  const marcadas = c.variaveis.filter(v => v.tipo || v.nome);
  return h('div', { class: 'vista' }, cabecalhoEtapa(1),
    h('section', { class: 'cartao' }, h('h2', {}, 'Identificação'),
      h('div', { class: 'grade-2' },
        C({ rotulo: 'Autor (participante)', obj: c.ident, chave: 'aluno', tipo: 'text', placeholder: 'Seu nome completo' }),
        C({ rotulo: 'Empresa analisada', obj: c.ident, chave: 'empresa', tipo: 'text', placeholder: 'Empresa conhecida, de preferência a mesma do Estudo de Caso 1' }))),
    h('section', { class: 'cartao' }, h('h2', {}, 'Diagnóstico do negócio'),
      C({ rotulo: 'Setor e portfólio', ajuda: 'Setor de atuação e principais produtos ou serviços.', obj: c.diag, chave: 'setor' }),
      C({ rotulo: 'Perfil dos clientes', ajuda: 'Segmentos atendidos e necessidades que orientam a compra.', obj: c.diag, chave: 'clientes' }),
      C({ rotulo: 'Dinâmica do mercado', ajuda: 'Características do mercado relevantes para o desempenho comercial (concorrência, sazonalidade, canais, dependência de crédito ou de importados).', obj: c.diag, chave: 'mercado' })),
    h('section', { class: 'cartao' }, h('h2', {}, 'Exposição macroeconômica'),
      h('p', { class: 'ajuda' }, 'Marque no mínimo três variáveis econômicas relevantes para a empresa. Elas serão investigadas na etapa 2 e projetadas na etapa 3.'),
      h('div', { class: 'chips grandes' }, VARIAVEIS.map(v => {
        const ativa = v.id !== 'outra' && c.variaveis.some(x => x.tipo === v.id);
        const fontesDisp = [v.focus && 'Focus', v.ipea && 'Ipea'].filter(Boolean).join(' · ');
        return h('button', { class: `chip ${ativa ? 'ativo' : ''}`, 'aria-pressed': String(ativa), onclick: () => alternarVariavel(v.id) }, v.id === 'outra' ? '+ Outra variável' : v.nome, fontesDisp ? h('small', {}, fontesDisp) : null);
      })),
      marcadas.length ? h('div', { class: 'sensib' }, h('h3', {}, 'Sensibilidade do negócio a cada variável'),
        marcadas.map(v => h('div', { class: 'sensib-linha' },
          h('span', {}, v.nome || 'Outra variável (defina o nome na etapa 2)'),
          h('div', { class: 'segmentos', role: 'radiogroup', 'aria-label': `Sensibilidade a ${v.nome}` }, [[1, 'Baixa'], [2, 'Média'], [3, 'Alta']].map(([n, t]) =>
            h('button', { role: 'radio', 'aria-checked': String(Number(v.sensibilidade) === n), class: Number(v.sensibilidade) === n ? 'ativo' : '', onclick: () => { v.sensibilidade = n; mudou(); redesenhar(); } }, t)))))) : null,
      C({ rotulo: 'Variáveis prioritárias e mecanismos de transmissão', ajuda: 'Explique por quais mecanismos essas variáveis afetam o negócio (por exemplo: juros → custo do financiamento do cliente → adiamento de compras).', obj: c.diag, chave: 'exposicao', linhas: 4 })),
    rodapeEtapa(1));
}

// ---------- Etapa 2 ----------
function aplicarEvidencia(v, ev) {
  const manter = v.nome ? { tipo: v.tipo, nome: v.nome, unidade: v.unidade || ev.unidade } : {};
  Object.assign(v, ev, manter);
  mudou();
}
function abrirBusca(v) {
  const cat = catalogo(v.tipo);
  const filtro = cat?.focus ? { aba: 'focus-anual' } : (cat?.ipea ? { aba: 'ipea', chave: cat.ipea } : null);
  const fechar = modal(`Buscar evidência para: ${v.nome || 'nova variável'}`, explorador({ filtro, aoUsar: ev => { aplicarEvidencia(v, ev); fechar(); redesenhar(); aviso('Evidência registrada com fonte, data e período.'); } }), { largo: true });
}
function roteiro(v) {
  const cat = catalogo(v.tipo);
  if (!cat || !cat.sobe.cliente) return null;
  return h('details', { class: 'roteiro' }, h('summary', {}, 'Roteiro de raciocínio para a implicação'),
    h('p', { class: 'ajuda' }, 'Roteiro didático genérico, que não provém das fontes. Adapte-o à realidade da empresa antes de usar.'),
    h('div', { class: 'grade-2' }, [['sobe', 'Se a variável sobe'], ['cai', 'Se a variável cai']].map(([k, t]) => h('div', {}, h('strong', {}, t), h('p', {}, h('em', {}, 'Cliente: '), cat[k].cliente), h('p', {}, h('em', {}, 'Vendas: '), cat[k].vendas)))));
}
function cartaoVariavel(v, i) {
  const c = estado.caso;
  return h('section', { class: 'cartao variavel' },
    h('div', { class: 'cab-linha' }, h('h3', {}, `Variável ${i + 1}`, v.nome ? ` — ${v.nome}` : ''),
      h('div', { class: 'acoes' }, botao('Buscar no Focus ou no Ipea', () => abrirBusca(v), 'primario pequeno'),
        botao('Remover', () => { if (!temDadosVar(v) || confirm('Remover esta variável e suas evidências?')) { removerVariavel(v.uid); mudou(); redesenhar(); } }, 'fantasma pequeno'))),
    h('div', { class: 'grade-3' },
      C({ rotulo: 'Tipo', obj: v, chave: 'tipo', tipo: 'select', opcoes: [['', 'Selecione…'], ...VARIAVEIS.map(x => [x.id, x.nome])], aoMudar: val => { const cat = catalogo(val); if (cat && val !== 'outra') { v.nome = cat.nome; v.unidade = cat.unidade; } mudou(); redesenhar(); } }),
      C({ rotulo: 'Nome da variável', obj: v, chave: 'nome', tipo: 'text', placeholder: 'Ex.: Taxa de juros (Selic)' }),
      C({ rotulo: 'Unidade', obj: v, chave: 'unidade', tipo: 'text', placeholder: '%, % a.a., R$/US$…' })),
    h('div', { class: 'grade-2' },
      C({ rotulo: 'Dado ou projeção / unidade', obj: v, chave: 'dado', tipo: 'text', placeholder: 'Ex.: 13,25 % a.a.', aoMudar: val => { v.valorNum = numSimples(String(val).match(/-?\d+(?:[.,]\d+)?/)?.[0]); mudou(); } }),
      C({ rotulo: 'Natureza da informação', obj: v, chave: 'natureza', tipo: 'select', opcoes: [['', 'Selecione…'], ...NATUREZAS] })),
    h('div', { class: 'grade-3' },
      C({ rotulo: 'Fonte / título', obj: v, chave: 'fonte', tipo: 'text', placeholder: 'Publicação e instituição' }),
      C({ rotulo: 'Data de publicação', obj: v, chave: 'publicacao', tipo: 'text', placeholder: 'Ex.: 23 de outubro de 2026' }),
      C({ rotulo: 'Período de referência', obj: v, chave: 'periodo', tipo: 'text', placeholder: 'Ex.: fim de 2027' })),
    C({ rotulo: 'Tendência e evidência de sustentação', ajuda: 'O que o dado indica (alta, queda, estabilidade) e que evidência sustenta essa leitura.', obj: v, chave: 'tendencia' }),
    C({ rotulo: 'Implicação para o mercado da empresa', ajuda: 'Como essa variável afeta os clientes e o desempenho comercial da empresa analisada.', obj: v, chave: 'implicacao' }),
    roteiro(v));
}
function etapa2() {
  const c = estado.caso;
  return h('div', { class: 'vista' }, cabecalhoEtapa(2),
    h('p', { class: 'lead' }, 'Para cada variável, registre o dado ou a projeção encontrada, a tendência, a relação com o mercado da empresa, a fonte, a data de publicação e o período de referência. Diferencie dados observados, projeções publicadas e hipóteses.'),
    c.variaveis.map(cartaoVariavel),
    h('div', { class: 'acoes' }, botao('+ Adicionar variável', () => { c.variaveis.push(novaVariavel()); mudou(); redesenhar(); }, 'fantasma')),
    h('section', { class: 'cartao' }, h('h2', {}, 'Consultas obrigatórias'),
      h('div', { class: 'grade-2' },
        h('div', {},
          h('div', { class: 'cab-linha' }, h('h3', {}, 'Relatório Focus'), botao('Preencher a data do relatório', () => { c.consultas.focusData = FOCUS.dataTxt; mudou(); redesenhar(); }, 'fantasma pequeno')),
          C({ rotulo: 'Data / período', obj: c.consultas, chave: 'focusData', tipo: 'text', placeholder: 'Data do relatório consultado' }),
          C({ rotulo: 'Expectativas relevantes e contribuição para a análise', obj: c.consultas, chave: 'focusTexto', linhas: 5 })),
        h('div', {},
          h('div', { class: 'cab-linha' }, h('h3', {}, 'Carta de Conjuntura — Ipea'), botao('Preencher o título', () => { c.consultas.ipeaTitulo = `Carta de Conjuntura nº 71, Nota de Conjuntura 24 — ${IPEA.periodo}`; mudou(); redesenhar(); }, 'fantasma pequeno')),
          C({ rotulo: 'Título / publicação / período', obj: c.consultas, chave: 'ipeaTitulo', tipo: 'text', placeholder: 'Edição consultada' }),
          C({ rotulo: 'Argumento central e contribuição para a análise', obj: c.consultas, chave: 'ipeaTexto', linhas: 5 }))),
      h('details', { class: 'roteiro' }, h('summary', {}, 'Guia de leitura da Carta de Conjuntura (com páginas)'),
        h('ul', {}, IPEA.argumentos.map(a => h('li', {}, h('strong', {}, `${a.titulo}: `), a.texto, h('em', {}, ` (p. ${a.pagina})`)))))),
    rodapeEtapa(2));
}

// ---------- Etapa 3 ----------
function etapa3() {
  const c = estado.caso, vars = variaveisAtivas(c);
  const blocoVar = v => {
    const cat = catalogo(v.tipo) || VARIAVEIS.at(-1);
    const refs = referenciasPublicadas(v.tipo);
    const coluna = s => {
      const t = (c.cenarios[s.id].traj[v.uid] ||= { valor: '', justificativa: '' });
      const tag = h('span', { class: 'tag' });
      const pintar = () => {
        const cls = classificarValor(refs, t.valor);
        tag.className = `tag ${cls ? cls.tipo : ''}`;
        tag.textContent = !cls ? 'sem valor' : (cls.tipo === 'P' ? `${cls.ref.natureza === 'Dado observado' ? 'Dado observado publicado' : 'Projeção publicada'} · ${cls.ref.rotulo}` : 'Hipótese do autor');
        tag.title = cls?.ref ? `${cls.ref.fonte} — ${cls.ref.periodo}` : '';
      };
      const entrada = h('input', { type: 'number', step: cat.passo, value: t.valor, 'aria-label': `${v.nome} no ${s.nome}`, oninput: e => { t.valor = e.target.value; faixa.value = e.target.value; pintar(); mudou(); } });
      const faixa = h('input', { type: 'range', min: cat.min, max: cat.max, step: cat.passo, value: numSimples(t.valor) ?? numSimples(v.valorNum) ?? (cat.min + cat.max) / 2, 'aria-label': `Ajuste de ${v.nome} no ${s.nome}`, oninput: e => { t.valor = e.target.value; entrada.value = e.target.value; pintar(); mudou(); } });
      const sel = refs.length ? h('select', { 'aria-label': 'Usar referência publicada', onchange: e => { if (e.target.value === '') return; t.valor = String(refs[Number(e.target.value)].valor); entrada.value = t.valor; faixa.value = t.valor; e.target.value = ''; pintar(); mudou(); } },
        h('option', { value: '' }, 'Usar referência publicada…'), refs.map((r, i) => h('option', { value: i }, `${r.rotulo}: ${fmt(r.valor)} (${r.periodo})`))) : null;
      pintar();
      return h('div', { class: `cen-col ${s.id}` }, h('h4', {}, s.curto),
        h('div', { class: 'valor-linha' }, entrada, h('span', { class: 'unid' }, v.unidade)), faixa, tag, sel,
        C({ rotulo: 'Justificativa', obj: t, chave: 'justificativa', linhas: 2, placeholder: 'Por que este valor neste cenário?' }));
    };
    return h('section', { class: 'cartao' },
      h('div', { class: 'cab-linha' }, h('h3', {}, v.nome), h('span', { class: 'ajuda' }, v.dado ? `Evidência registrada: ${v.dado} (${v.periodo || 'período não informado'})` : 'Sem evidência registrada na etapa 2')),
      refs.length ? h('p', { class: 'refs' }, 'Referências publicadas: ', refs.map(r => h('span', { class: `selo ${r.origem}`, title: `${r.fonte} — ${r.periodo}` }, `${r.rotulo}: ${fmt(r.valor)}`))) : h('p', { class: 'ajuda' }, 'Não há projeção publicada para esta variável nos arquivos de apoio; os valores serão hipóteses do autor.'),
      h('div', { class: 'grade-3 cen-grade' }, CENARIOS.map(coluna)));
  };
  const listar = (s, tipo) => {
    const linhasTxt = vars.map(v => {
      const t = c.cenarios[s.id].traj[v.uid]; const cls = classificarValor(referenciasPublicadas(v.tipo), t?.valor);
      if (!cls || cls.tipo !== tipo) return null;
      const val = `${v.nome}: ${comUnidade(numSimples(t.valor), v.unidade)}`;
      return tipo === 'P' ? `${val} — ${cls.ref.fonte}, ${cls.ref.periodo}.` : `${val} — hipótese do autor: ${String(t.justificativa || '').trim() || '[fundamentar]'}`;
    }).filter(Boolean);
    return linhasTxt.join('\n');
  };
  const meses = mesesHorizonte(c.ident);
  return h('div', { class: 'vista' }, cabecalhoEtapa(3),
    h('section', { class: 'cartao' }, h('h2', {}, 'Horizonte comum'),
      h('div', { class: 'grade-3' },
        C({ rotulo: 'Início', obj: c.ident, chave: 'inicio', tipo: 'month' }),
        C({ rotulo: 'Fim', obj: c.ident, chave: 'fim', tipo: 'month' }),
        vivo(() => { const m = mesesHorizonte(c.ident); return h('p', { class: `horizonte ${m === 12 ? 'ok' : 'alerta'}` }, m ? `${m} meses: ${horizonteTxt(c.ident)}` : 'Defina início e fim', m && m !== 12 ? ' — o roteiro pede 12 meses.' : ''); }))),
    vars.length ? vars.map(blocoVar) : h('section', { class: 'cartao' }, h('p', {}, 'Selecione e nomeie pelo menos três variáveis nas etapas 1 e 2 para projetar as trajetórias.'), botao('Ir para a etapa 2', () => ir('etapa/2'), 'primario')),
    vars.length ? h('section', { class: 'cartao' }, h('h2', {}, 'Comparação dos cenários'),
      vivo(() => barrasGrupos(vars.map(v => ({ nome: `${v.nome}${v.unidade ? ` (${v.unidade})` : ''}`, itens: CENARIOS.map(s => ({ rotulo: s.curto, valor: numSimples(c.cenarios[s.id].traj[v.uid]?.valor), cor: `var(--c-${s.id})` })) }))))) : null,
    h('div', { class: 'grade-3 cen-grade' }, CENARIOS.map(s => {
      const cen = c.cenarios[s.id];
      return h('section', { class: `cartao cen-col ${s.id}` }, h('h3', {}, s.nome), h('p', { class: 'ajuda' }, s.desc),
        C({ rotulo: 'Condição econômica e premissas centrais', obj: cen, chave: 'premissas', linhas: 4 }),
        h('div', { class: 'cab-linha' }, h('label', {}, 'Projeções publicadas — fonte e data'), botao('Listar automaticamente', () => { const t = listar(s, 'P'); if (!t) return aviso('Nenhum valor deste cenário coincide com um valor publicado no Focus ou no Ipea.', 'alerta'); cen.publicadas = t; mudou(); redesenhar(); }, 'fantasma pequeno')),
        C({ obj: cen, chave: 'publicadas', linhas: 3 }),
        h('div', { class: 'cab-linha' }, h('label', {}, 'Hipóteses próprias — fundamentação'), botao('Listar hipóteses', () => { const t = listar(s, 'H'); if (!t) return aviso('Nenhum valor deste cenário é hipótese própria.', 'alerta'); cen.hipoteses = t; mudou(); redesenhar(); }, 'fantasma pequeno')),
        C({ obj: cen, chave: 'hipoteses', linhas: 3 }));
    })),
    h('details', { class: 'roteiro cartao' }, h('summary', {}, 'Fatores de risco apontados pelo Ipea (apoio para os cenários favorável e adverso)'),
      h('ul', {}, IPEA.argumentos.filter(a => /Riscos|Choque|Endividamento|Crédito/.test(a.titulo)).map(a => h('li', {}, h('strong', {}, `${a.titulo}: `), a.texto, h('em', {}, ` (p. ${a.pagina})`))))),
    rodapeEtapa(3));
}

// ---------- Etapa 4 ----------
const ROT_DIR = { sobe: '↑ sobe', cai: '↓ cai', estavel: '→ estável' };
function direcaoCenario(v, sId) {
  const c = estado.caso;
  return sId === 'base'
    ? { d: direcao(c.cenarios.base.traj[v.uid]?.valor, v.valorNum), ref: 'ante o dado atual' }
    : { d: direcao(c.cenarios[sId].traj[v.uid]?.valor, c.cenarios.base.traj[v.uid]?.valor), ref: 'ante o cenário base' };
}
function etapa4() {
  const c = estado.caso, vars = variaveisAtivas(c);
  const matriz = h('section', { class: 'cartao' }, h('h2', {}, 'Impactos por cenário'),
    h('p', { class: 'ajuda' }, 'Escreva de forma sintética: estes textos alimentam a matriz do slide 4.'),
    h('div', { class: 'matriz' },
      h('div', { class: 'matriz-cab' }, h('span', {}), CENARIOS.map(s => h('strong', { class: `cen-tit ${s.id}` }, s.nome))),
      DIMENSOES.map(d => h('div', { class: 'matriz-linha' }, h('span', { class: 'matriz-rot' }, d.nome),
        CENARIOS.map(s => C({ obj: c.impactos[s.id], chave: d.id, linhas: 3, atributos: { 'aria-label': `${d.nome} — ${s.nome}` } }))))));
  const cadeias = h('section', { class: 'cartao' }, h('h2', {}, 'Fundamentação: variável → efeito no cliente → efeito nas vendas'),
    vars.length ? vars.map(v => {
      const cat = catalogo(v.tipo);
      return h('div', { class: 'cadeia-var' }, h('h3', {}, v.nome),
        h('div', { class: 'grade-3 cen-grade' }, CENARIOS.map(s => {
          const k = (c.impactos[s.id].cadeias[v.uid] ||= { cliente: '', vendas: '' });
          const { d, ref } = direcaoCenario(v, s.id);
          const sugerir = () => {
            if (!cat?.sobe.cliente || !d || d === 'estavel') return aviso('Defina na etapa 3 um valor diferente da referência para obter um roteiro.', 'alerta');
            if ((k.cliente || k.vendas) && !confirm('Substituir os textos atuais pelo roteiro genérico?')) return;
            k.cliente = cat[d].cliente; k.vendas = cat[d].vendas; mudou(); redesenhar();
          };
          return h('div', { class: `cen-col ${s.id}` },
            h('div', { class: 'cab-linha' }, h('h4', {}, s.curto), h('span', { class: `dir ${d || ''}` }, d ? `${ROT_DIR[d]} ${ref}` : 'sem valor na etapa 3')),
            C({ rotulo: 'Efeito no cliente', obj: k, chave: 'cliente', linhas: 2 }),
            C({ rotulo: 'Efeito nas vendas', obj: k, chave: 'vendas', linhas: 2 }),
            cat?.sobe.cliente ? botao('Inserir roteiro genérico', sugerir, 'fantasma pequeno') : null);
        })));
    }) : h('p', {}, 'Defina as variáveis nas etapas anteriores.'),
    h('p', { class: 'ajuda' }, 'Os roteiros genéricos são pontos de partida didáticos e não provêm das fontes: reescreva-os com a realidade da empresa.'));
  const simulador = h('section', { class: 'cartao' }, h('h2', {}, 'Simulador de sensibilidade da receita'),
    h('p', { class: 'ajuda' }, 'Exercício opcional. Informe em quantos pontos percentuais a receita variaria para cada aumento de uma unidade em cada variável (use valor negativo quando a alta da variável reduz a receita). O resultado é uma hipótese do autor, não uma projeção das fontes, e deve ser apresentado como tal.'),
    h('div', { class: 'grade-2' },
      h('div', {},
        C({ rotulo: 'Receita anual de referência no cenário base (opcional)', obj: c.simulador, chave: 'receita', tipo: 'text', placeholder: 'Ex.: 12000000' }),
        vars.map(v => C({ rotulo: `${v.nome}: variação da receita (%) para cada +1 ${v.unidade || 'unidade'}`, obj: c.simulador.sens, chave: v.uid, tipo: 'number', atributos: { step: '0.1' } }))),
      vivo(() => {
        const sim = simular(c);
        if (!sim.temDados) return h('p', { class: 'ajuda' }, 'Preencha as sensibilidades e os valores dos cenários (etapa 3) para ver a estimativa.');
        return [barrasGrupos([{ nome: 'Variação estimada da receita ante o cenário base', itens: ['favoravel', 'adverso'].map(k => ({ rotulo: CENARIOS.find(s => s.id === k).curto, valor: sim[k].delta, cor: `var(--c-${k})` })) }], { casas: 1, sufixo: '%' }),
          sim.base.receita !== null ? h('p', {}, ['favoravel', 'adverso'].map(k => `${CENARIOS.find(s => s.id === k).curto}: R$ ${fmt(sim[k].receita, 0)}`).join(' · '), ` (base: R$ ${fmt(sim.base.receita, 0)})`) : null,
          h('ul', { class: 'decomp' }, ['favoravel', 'adverso'].flatMap(k => sim[k].partes.map(p => h('li', {}, `${CENARIOS.find(s => s.id === k).curto} · ${p.nome}: ${p.parcela > 0 ? '+' : ''}${fmt(p.parcela, 1)} p.p.`)))),
          sim.completo ? null : h('p', { class: 'ajuda' }, 'Estimativa parcial: há variáveis sem sensibilidade ou sem valor em algum cenário.')];
      })));
  return h('div', { class: 'vista' }, cabecalhoEtapa(4), matriz, cadeias, simulador, rodapeEtapa(4));
}

// ---------- Etapa 5 ----------
function etapa5() {
  const c = estado.caso;
  return h('div', { class: 'vista' }, cabecalhoEtapa(5),
    h('p', { class: 'lead' }, 'Proponha no mínimo três decisões comerciais fundamentadas nos cenários (segmentação de clientes, preços, condições de pagamento, prospecção, gestão da carteira, metas ou preservação de margens) e explique como cada uma reduz riscos ou aproveita oportunidades.'),
    c.decisoes.map((d, i) => h('section', { class: 'cartao' },
      h('div', { class: 'cab-linha' }, h('h3', {}, `Decisão ${i + 1}`, i > 2 ? h('small', {}, ' (não aparece no slide 5, que traz as três primeiras)') : null),
        c.decisoes.length > 3 ? botao('Remover', () => { c.decisoes.splice(i, 1); mudou(); redesenhar(); }, 'fantasma pequeno') : null),
      C({ rotulo: 'Ação comercial proposta', obj: d, chave: 'acao', linhas: 2 }),
      h('div', { class: 'grade-3' },
        C({ rotulo: 'Indicador, evidência e impacto que sustentam a decisão', obj: d, chave: 'evidencia', linhas: 4 }),
        C({ rotulo: 'Risco mitigado ou oportunidade capturada', obj: d, chave: 'risco', linhas: 4 }),
        C({ rotulo: 'Contribuição esperada para vendas e rentabilidade', obj: d, chave: 'contribuicao', linhas: 4 })))),
    h('div', { class: 'acoes' }, botao('+ Adicionar decisão', () => { c.decisoes.push(novaDecisao()); mudou(); redesenhar(); }, 'fantasma')),
    h('section', { class: 'cartao' }, h('h2', {}, 'Síntese executiva'),
      C({ ajuda: 'Consolide a leitura do cenário, as principais implicações para a empresa e a justificativa das decisões recomendadas. Reflexão final do roteiro: como transformar indicadores e expectativas econômicas em decisões comerciais capazes de melhorar a competitividade e preservar a rentabilidade?', obj: c, chave: 'sintese', linhas: 5 })),
    h('section', { class: 'cartao' }, h('h2', {}, 'Validação da entrega'),
      vivo(() => { const itens = validar(c); return h('ul', { class: 'criterios todos' }, itens.map(i => h('li', { class: i.ok ? 'ok' : '' }, h('span', { class: 'marca-ok' }, i.ok ? '✓' : '○'), h('a', { href: `#/etapa/${i.etapa}` }, `Etapa ${i.etapa}`), ' — ', i.texto, i.detalhe && !i.ok ? h('em', {}, ` (${i.detalhe})`) : null))); })),
    rodapeEtapa(5));
}

// ---------- Slides ----------
function apresentar(inicio = 0) {
  const tema = temaAtual();
  let i = inicio, slidesEls = construir(estado.caso, tema).slides;
  const palco = h('div', { class: 'palco' });
  const tela = h('div', { class: 'apresentacao', tabindex: '0' }, palco, h('div', { class: 'apres-dica' }, '← → para navegar · Esc para sair'));
  const mostrar = () => {
    const s = renderHTML(slidesEls[i], tema, 1280);
    const esc = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    s.style.transform = `scale(${esc})`; s.style.transformOrigin = 'center center';
    palco.replaceChildren(s);
  };
  const sairApres = () => { document.removeEventListener('keydown', tecla); window.removeEventListener('resize', mostrar); if (document.fullscreenElement) document.exitFullscreen?.(); tela.remove(); };
  const tecla = e => {
    if (e.key === 'Escape') sairApres();
    else if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { i = Math.min(4, i + 1); mostrar(); e.preventDefault(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { i = Math.max(0, i - 1); mostrar(); e.preventDefault(); }
  };
  tela.addEventListener('click', e => { i = e.clientX > window.innerWidth / 2 ? Math.min(4, i + 1) : Math.max(0, i - 1); mostrar(); });
  document.addEventListener('keydown', tecla); window.addEventListener('resize', mostrar);
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && tela.isConnected && tela.dataset.cheia) sairApres(); });
  document.body.append(tela);
  tela.requestFullscreen?.().then(() => { tela.dataset.cheia = '1'; mostrar(); }).catch(() => {});
  mostrar(); tela.focus();
}
function imprimir() {
  const tema = temaAtual();
  document.getElementById('impressao')?.remove();
  const area = h('div', { id: 'impressao' }, construir(estado.caso, tema).slides.map(els => h('div', { class: 'pagina' }, renderHTML(els, tema, 1280))));
  document.body.append(area);
  window.print();
}
function seletorTema() {
  const sel = h('select', { 'aria-label': 'Tema visual', onchange: e => { estado.tema = { id: e.target.value }; aplicarTemaNaInterface(temaAtual()); mudou(); redesenhar(); } }, TEMAS.map(t => h('option', { value: t.id }, t.nome)));
  sel.value = temaAtual().id;
  return sel;
}
function vistaSlides() {
  const c = estado.caso;
  const aberto = new Set();
  const area = h('div', { class: 'slides-lista' });
  const alertasEl = h('div', {});
  const desenharAlertas = alertas => {
    const pend = validar(c).filter(i => !i.ok).length;
    alertasEl.replaceChildren(
      pend ? h('div', { class: 'faixa-alerta' }, `Há ${pend} item(ns) do roteiro ainda pendente(s). Os slides são gerados com o que já foi preenchido. `, h('a', { href: '#/painel' }, 'Ver pendências')) : h('div', { class: 'faixa-ok' }, 'Todos os itens do roteiro foram atendidos.'),
      ...alertas.map(a => h('div', { class: 'faixa-alerta' }, a.texto)));
  };
  const desenhar = () => {
    const tema = temaAtual();
    const { slides, blocos, alertas } = construir(c, tema);
    desenharAlertas(alertas);
    area.replaceChildren(...slides.map((els, i) => {
      const meus = blocos.filter(b => b.slide === i + 1);
      const painelTxt = h('div', { class: 'editor-textos' },
        h('p', { class: 'ajuda' }, 'Edite aqui a versão resumida para o slide. O texto completo do caso não é alterado.'),
        meus.map(b => {
          const ta = h('textarea', { rows: 2, 'aria-label': b.rotulo, oninput: e => { c.slides.textos[b.key] = e.target.value; agendar(); } }, c.slides.textos[b.key] ?? b.padrao);
          return h('div', { class: 'campo' }, h('label', {}, b.rotulo, b.editado ? selo('editado', 'proj') : null), ta,
            b.editado ? botao('Restaurar o texto do caso', () => { delete c.slides.textos[b.key]; mudou(); desenhar(); }, 'fantasma pequeno') : null);
        }));
      return h('section', { class: 'slide-item' },
        h('div', { class: 'cab-linha' }, h('h2', {}, `Slide ${i + 1} — ${TITULOS[i]}`),
          h('div', { class: 'acoes' }, botao(aberto.has(i) ? 'Fechar edição' : 'Editar textos do slide', () => { aberto.has(i) ? aberto.delete(i) : aberto.add(i); desenhar(); }, 'fantasma pequeno'), botao('Apresentar daqui', () => apresentar(i), 'fantasma pequeno'))),
        h('div', { class: aberto.has(i) ? 'slide-edicao' : '' }, montarSlide(els, tema), aberto.has(i) ? painelTxt : null));
    }));
  };
  let t = null;
  // Ao digitar no editor, só o desenho do slide é atualizado (o campo em edição é preservado).
  const agendar = () => { mudou(); clearTimeout(t); t = setTimeout(() => {
    const tema = temaAtual(); const { slides, alertas } = construir(c, tema);
    area.querySelectorAll('.slide-item').forEach((sec, i) => { const caixa = sec.querySelector('.slide-caixa'); caixa?.replaceWith(montarSlide(slides[i], tema)); });
    desenharAlertas(alertas);
  }, 350); };
  desenhar();
  return h('div', { class: 'vista larga' },
    h('header', { class: 'cab-etapa' }, h('span', { class: 'kicker' }, 'Entrega final'), h('h1', {}, 'Apresentação em cinco slides'),
      h('p', { class: 'lead' }, 'Os slides são gerados a partir do caso: (1) empresa e características comerciais; (2) indicadores pesquisados no Focus e no Ipea; (3) cenários base, favorável e adverso; (4) impactos sobre clientes e vendas; (5) três decisões comerciais justificadas.')),
    h('div', { class: 'barra-slides' },
      h('label', {}, 'Tema ', seletorTema()), botao('Personalizar tema', () => ir('tema'), 'fantasma'),
      h('span', { class: 'espaco' }),
      botao('▶ Apresentar', () => apresentar(0), 'fantasma'),
      botao('Imprimir / salvar em PDF', imprimir, 'fantasma'),
      botao('Exportar PPTX', async e => { const b = e.currentTarget; b.disabled = true; b.textContent = 'Gerando…'; try { const nome = await exportarPptx(c, temaAtual(), notasApresentador(c)); aviso(`Arquivo ${nome} gerado.`); } catch (err) { aviso(err.message, 'erro'); } b.disabled = false; b.textContent = 'Exportar PPTX'; }, 'primario')),
    alertasEl, area);
}

// ---------- Dados ----------
function vistaDados() {
  const c = estado.caso;
  const usar = ev => {
    const fechar = modal('Usar como evidência em qual variável?', h('div', { class: 'lista-escolha' },
      h('p', {}, h('strong', {}, ev.nome), ` — ${ev.dado} · ${ev.fonte} · ${ev.periodo}`),
      c.variaveis.map((v, i) => botao(`Variável ${i + 1}: ${v.nome || '(vazia)'}`, () => { aplicarEvidencia(v, ev); fechar(); aviso('Evidência registrada.'); ir('etapa/2'); }, 'fantasma')),
      botao('+ Nova variável', () => { const v = novaVariavel(); c.variaveis.push(v); aplicarEvidencia(v, ev); fechar(); ir('etapa/2'); }, 'primario')));
  };
  return h('div', { class: 'vista larga' },
    h('header', { class: 'cab-etapa' }, h('span', { class: 'kicker' }, 'Arquivos de apoio do estudo de caso'), h('h1', {}, 'Dados do Relatório Focus e da Carta de Conjuntura'),
      h('p', { class: 'lead' }, 'Dados transcritos dos dois arquivos de apoio fornecidos na aula de 14/11/2026. Confira sempre os valores no documento original antes de citá-los.')),
    h('section', { class: 'cartao' }, explorador({ aoUsar: usar, origem: estado.origemDados === 'supabase' ? 'Dados carregados do banco de dados (Supabase).' : 'Dados carregados do arquivo incorporado ao aplicativo.' })));
}

// ---------- Tema ----------
function vistaTema() {
  const c = estado.caso;
  let slidePrev = 2;
  const previa = h('div', { class: 'previa' });
  const contr = h('div', { class: 'contrastes' });
  const galeria = h('div', { class: 'galeria' });
  const painelEd = h('div', { class: 'editor-tema' });
  const garantir = k => (estado.tema[k] ||= {});
  const atualizar = (redesenharPainel = false, salvar = true) => {
    const tema = temaAtual();
    aplicarTemaNaInterface(tema);
    previa.replaceChildren(montarSlide(construir(c, tema).slides[slidePrev], tema));
    const pares = [['Texto sobre o fundo', tema.cores.texto, tema.cores.fundo], ['Texto sobre cartões', tema.cores.texto, tema.cores.superficie], ['Texto sobre a cor principal', tema.cores.sobrePrimaria, tema.cores.primaria], ['Texto secundário', tema.cores.suave, tema.cores.fundo]];
    contr.replaceChildren(...pares.map(([n, a, b]) => { const r = contraste(a, b); return h('span', { class: `selo ${r >= 4.5 ? 'obs' : 'alerta'}`, title: 'Razão de contraste (recomendado: 4,5 ou mais)' }, `${n}: ${fmt(r, 1)}:1 ${r >= 4.5 ? '✓' : '— baixo'}`); }));
    if (redesenharPainel) { desenharGaleria(); desenharEditor(); }
    if (salvar) mudou();
  };
  const desenharGaleria = () => galeria.replaceChildren(...TEMAS.map(t => {
    const mini = montarSlide(construir(c, resolverTema({ id: t.id })).slides[2], resolverTema({ id: t.id }), 'mini');
    return h('button', { class: `tema-cartao ${temaAtual().id === t.id ? 'ativo' : ''}`, 'aria-pressed': String(temaAtual().id === t.id), onclick: () => { estado.tema = { id: t.id }; atualizar(true); } },
      mini, h('strong', {}, t.nome), h('span', {}, t.descricao),
      h('div', { class: 'amostras' }, ['primaria', 'destaque', 'fundo', 'texto', 'favoravel', 'adverso'].map(k => h('i', { style: `background:${t.cores[k]}` }))));
  }));
  const desenharEditor = () => {
    const tema = temaAtual();
    const cor = k => h('label', { class: 'cor' }, h('input', { type: 'color', value: tema.cores[k], oninput: e => { garantir('cores')[k] = e.target.value.toUpperCase(); atualizar(); } }), ROTULOS_CORES[k]);
    const sel = (rot, grupo, k, ops) => { const s = h('select', { onchange: e => { garantir(grupo)[k] = e.target.value; atualizar(); } }, ops.map(([v, t]) => h('option', { value: v }, t))); s.value = tema[grupo][k]; return h('label', { class: 'campo' }, rot, s); };
    const chave = (rot, k) => h('label', { class: 'chave' }, h('input', { type: 'checkbox', checked: tema.el[k], onchange: e => { garantir('el')[k] = e.target.checked; atualizar(); } }), rot);
    painelEd.replaceChildren(
      h('h3', {}, 'Cores'), h('div', { class: 'cores' }, Object.keys(ROTULOS_CORES).map(cor)),
      h('h3', {}, 'Tipografia'), h('div', { class: 'grade-2' }, sel('Títulos', 'fontes', 'titulo', FONTES_TIPO.map(f => [f.id, f.nome])), sel('Texto', 'fontes', 'corpo', FONTES_TIPO.map(f => [f.id, f.nome]))),
      h('h3', {}, 'Elementos'), h('div', { class: 'grade-3' }, sel('Cabeçalho', 'el', 'cabecalho', OPCOES_ELEMENTOS.cabecalho), sel('Cartões', 'el', 'cartao', OPCOES_ELEMENTOS.cartao), sel('Decoração', 'el', 'deco', OPCOES_ELEMENTOS.deco)),
      h('label', { class: 'campo' }, `Arredondamento dos cantos: ${tema.el.raio}px`, h('input', { type: 'range', min: 0, max: 24, step: 1, value: tema.el.raio, oninput: e => { garantir('el').raio = Number(e.target.value); e.target.parentElement.firstChild.textContent = `Arredondamento dos cantos: ${e.target.value}px`; atualizar(); } })),
      h('div', { class: 'chaves' }, chave('Rodapé', 'rodape'), chave('Numeração dos slides', 'numeracao'), chave('Fontes no rodapé', 'fontes'), chave('Títulos em caixa alta', 'caixaAlta')),
      h('div', { class: 'acoes' }, botao('Restaurar o tema original', () => { estado.tema = { id: tema.id }; atualizar(true); }, 'fantasma')));
  };
  desenharGaleria(); desenharEditor(); atualizar(false, false);
  return h('div', { class: 'vista larga' },
    h('header', { class: 'cab-etapa' }, h('span', { class: 'kicker' }, 'Aparência do aplicativo e dos slides'), h('h1', {}, 'Tema visual'),
      h('p', { class: 'lead' }, 'Escolha um dos dez temas e personalize cores, tipografia e elementos. A escolha vale para o aplicativo, para os slides na tela e para o arquivo PPTX exportado.')),
    h('section', { class: 'cartao' }, h('h2', {}, 'Dez temas'), galeria),
    h('div', { class: 'tema-dupla' },
      h('section', { class: 'cartao' }, h('h2', {}, 'Personalização'), painelEd),
      h('section', { class: 'cartao fixo' },
        h('div', { class: 'cab-linha' }, h('h2', {}, 'Pré-visualização'), (() => { const s = h('select', { 'aria-label': 'Slide da pré-visualização', onchange: e => { slidePrev = Number(e.target.value); atualizar(); } }, TITULOS.map((t, i) => h('option', { value: i }, `Slide ${i + 1}`))); s.value = slidePrev; return s; })()),
        previa, h('h3', {}, 'Legibilidade'), contr)));
}

// ---------- Fontes ----------
function vistaFontes() {
  const copiar = t => navigator.clipboard?.writeText(t).then(() => aviso('Referência copiada.'), () => aviso('Não foi possível copiar.', 'erro'));
  return h('div', { class: 'vista' },
    h('header', { class: 'cab-etapa' }, h('span', { class: 'kicker' }, 'Material de apoio da disciplina'), h('h1', {}, 'Fontes para pesquisa')),
    h('section', { class: 'cartao' }, h('h2', {}, 'Referências das fontes obrigatórias'),
      [FOCUS, IPEA].map(f => h('div', { class: 'referencia' }, h('p', {}, f.citacao), h('p', { class: 'ajuda' }, f.nota), h('div', { class: 'acoes' }, botao('Copiar referência', () => copiar(f.citacao), 'fantasma pequeno'), h('a', { href: f.url, target: '_blank', rel: 'noopener' }, 'Abrir a página oficial ↗')))),
      h('p', { class: 'ajuda' }, 'As referências acima seguem o padrão geral da ABNT, mas devem ser conferidas com o documento original e com as normas adotadas pelo curso.')),
    h('section', { class: 'cartao' }, h('h2', {}, 'Sites recomendados'),
      h('ul', { class: 'fontes' }, FONTES_CONSULTA.map(f => h('li', {}, h('a', { href: f.url, target: '_blank', rel: 'noopener' }, `${f.n}. ${f.nome} ↗`), f.prioritaria ? selo('prioritária', 'proj') : null, h('span', {}, f.desc))))));
}

// ---------- Acesso ----------
function telaAcesso(modo = 'entrar', msg = '') {
  const d = { nome: '', email: '', senha: '', codigo: '' };
  const erro = h('p', { class: 'erro', role: 'alert' }, msg);
  const enviar = async e => {
    e.preventDefault(); erro.textContent = '';
    const b = e.submitter; if (b) b.disabled = true;
    try {
      if (modo === 'entrar') await api.entrar(d.email.trim(), d.senha);
      else if (modo === 'criar') {
        if (d.senha.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
        await api.cadastrar({ nome: d.nome.trim(), email: d.email.trim(), senha: d.senha, codigo: d.codigo.trim() });
      } else if (modo === 'recuperar') { await api.pedirRecuperacao(d.email.trim()); telaAcesso('entrar', 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.'); return; }
      else if (modo === 'nova-senha') { if (d.senha.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.'); await api.definirSenha(d.senha); }
      await iniciarSessao();
    } catch (er) { erro.textContent = er.message; if (b) b.disabled = false; }
  };
  const cmp = (rotulo, chave, tipo, extra = {}) => campo({ rotulo, obj: d, chave, tipo, atributos: { required: true, ...extra } });
  const titulos = { entrar: 'Entrar', criar: 'Criar conta', recuperar: 'Recuperar senha', 'nova-senha': 'Definir nova senha' };
  raiz.replaceChildren(h('div', { class: 'acesso' },
    h('div', { class: 'acesso-lado' },
      h('p', { class: 'acesso-curso' }, h('span', { class: 'kicker' }, 'Cenários Econômicos em Vendas'), h('span', { class: 'acesso-prof' }, 'Prof. Dr. José Alberto de Camargo')),
      h('h1', {}, 'Estudo de Caso 2'), h('p', {}, 'Cenários econômicos e estratégias de vendas'),
      h('p', { class: 'ajuda' }, 'MBA Gestão Comercial e SalesTech · roteiro guiado com os dados do Relatório Focus e da Carta de Conjuntura do Ipea, e geração dos cinco slides da entrega.')),
    h('form', { class: 'acesso-form cartao', onsubmit: enviar },
      h('h2', {}, titulos[modo]),
      modo === 'criar' ? cmp('Nome completo', 'nome', 'text', { autocomplete: 'name' }) : null,
      modo !== 'nova-senha' ? cmp('E-mail', 'email', 'email', { autocomplete: 'email' }) : null,
      modo !== 'recuperar' ? cmp(modo === 'nova-senha' ? 'Nova senha' : 'Senha', 'senha', 'password', { autocomplete: modo === 'entrar' ? 'current-password' : 'new-password', minlength: modo === 'entrar' ? null : 8 }) : null,
      modo === 'criar' ? campo({ rotulo: 'Código da turma (peça pro Daniel Fassa)', obj: d, chave: 'codigo', tipo: 'text', atributos: { required: true, autocomplete: 'off' } }) : null,
      erro,
      h('button', { type: 'submit', class: 'btn primario' }, { entrar: 'Entrar', criar: 'Criar conta e entrar', recuperar: 'Enviar link', 'nova-senha': 'Salvar nova senha' }[modo]),
      h('div', { class: 'acesso-links' },
        modo !== 'entrar' && modo !== 'nova-senha' ? botao('Já tenho conta', () => telaAcesso('entrar'), 'link') : null,
        modo === 'entrar' ? botao('Criar conta', () => telaAcesso('criar'), 'link') : null,
        modo === 'entrar' ? botao('Esqueci a senha', () => telaAcesso('recuperar'), 'link') : null))));
}

async function iniciarSessao() {
  raiz.replaceChildren(h('div', { class: 'carregando' }, 'Carregando…'));
  try {
    const [registro, refs] = await Promise.all([api.carregarCaso(), api.carregarReferencias()]);
    hidratarReferencias(refs);
    estado.caso = normalizar(registro?.dados);
    estado.tema = registro?.tema && registro.tema.id ? registro.tema : { id: 'executivo' };
    if (!estado.caso.ident.aluno) estado.caso.ident.aluno = api.usuario()?.user_metadata?.nome || '';
  } catch (e) {
    if (api.remoto && /sess[aã]o/i.test(e.message)) return telaAcesso('entrar', e.message);
    aviso(`Falha ao carregar os dados: ${e.message}`, 'erro');
  }
  aplicarTemaNaInterface(temaAtual());
  montarCasca();
}

aplicarTemaNaInterface(temaAtual());
if (api.capturarRecuperacao()) telaAcesso('nova-senha');
else if (api.remoto && !api.usuario()) telaAcesso('entrar');
else iniciarSessao();
