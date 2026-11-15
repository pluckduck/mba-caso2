// Aplicativo guiado do Estudo de Caso 2 — Cenários Econômicos e Estratégias de Vendas.
import * as api from './api.js';
import { h, campo, botao, aviso, modal, selo, barrasGrupos, anel, montarSlide } from './ui.js';
import { FOCUS, IPEA, VARIAVEIS, GRUPOS, variaveisDoGrupo, FONTES_CONSULTA, referenciasPublicadas, fmt, comUnidade } from './refdata.js';
import { TEMAS, FONTES_TIPO, OPCOES_ELEMENTOS, ROTULOS_CORES, resolverTema, aplicarTemaNaInterface, contraste } from './themes.js';
import { CENARIOS, DIMENSOES, NATUREZAS, ETAPAS, casoVazio, normalizar, novaVariavel, novaDecisao, variaveisAtivas, catalogo, mesesHorizonte,
  horizonteTxt, classificarValor, direcao, simular, validar, progresso, numSimples, uid, sugestaoEvidencia, opcoesEvidencia, mesmaOrigem, evidenciaFocus, evidenciaIpea } from './modelo.js';
import { construir, exportarPptx, notasApresentador, renderHTML, TITULOS } from './slides.js';
import { explorador } from './explorador.js';
import * as ed from './edicoes.js';

const estado = { caso: casoVazio(), tema: { id: 'executivo' }, salvo: 'ok', origemDados: 'arquivo', admin: false };
const raiz = document.getElementById('app');
let vivos = [];
let tSalvar = null, tVivo = null;

const temaAtual = () => resolverTema(estado.tema);

// ---------- Temas salvos pelo participante ("Meus temas") ----------
// Ficam dentro do próprio registro do tema: { id, cores, fontes, el, meu: <uid do tema salvo em uso>, salvos: [{ uid, nome, id, cores, fontes, el }] }.
const MAX_TEMAS_SALVOS = 12, MAX_NOME_TEMA = 40;
const copiar = o => JSON.parse(JSON.stringify(o || {}));
const soEscolha = t => ({ id: t.id, cores: t.cores || {}, fontes: t.fontes || {}, el: t.el || {} });
const mesmoTema = (a, b) => JSON.stringify(resolverTema(soEscolha(a))) === JSON.stringify(resolverTema(soEscolha(b)));
const temasSalvos = () => (Array.isArray(estado.tema.salvos) ? estado.tema.salvos : []);
const temaSalvoAtual = () => temasSalvos().find(x => x.uid === estado.tema.meu) || null;
const nomeTemaBase = id => (TEMAS.find(t => t.id === id) || TEMAS[0]).nome;
function normalizarTema(t) {
  if (!t || typeof t !== 'object' || !t.id) return { id: 'executivo' };
  const out = { ...t };
  const salvos = (Array.isArray(t.salvos) ? t.salvos : []).filter(x => x && typeof x === 'object' && x.uid && typeof x.nome === 'string' && x.nome.trim())
    .slice(0, MAX_TEMAS_SALVOS).map(x => ({ uid: String(x.uid), nome: x.nome.trim().slice(0, MAX_NOME_TEMA), ...soEscolha(x) }));
  if (salvos.length) out.salvos = salvos; else delete out.salvos;
  if (!salvos.some(x => x.uid === out.meu)) delete out.meu;
  return out;
}
// Há personalização que se perderia ao trocar de tema? (tema salvo alterado, ou tema do aplicativo alterado e ainda sem nome)
function temAlteracoesSoltas() {
  const salvo = temaSalvoAtual();
  return salvo ? !mesmoTema(estado.tema, salvo) : indiceCustomizacao(estado.tema).n > 0;
}
const confirmarTroca = () => !temAlteracoesSoltas() || confirm('As alterações que você fez neste tema ainda não foram salvas com um nome e serão perdidas. Trocar de tema mesmo assim?');
function escolherTemaBase(id) { estado.tema = { id, ...(temasSalvos().length ? { salvos: estado.tema.salvos } : {}) }; }
function escolherTemaSalvo(uidTema) {
  const x = temasSalvos().find(t => t.uid === uidTema); if (!x) return;
  estado.tema = { id: x.id, cores: copiar(x.cores), fontes: copiar(x.fontes), el: copiar(x.el), meu: x.uid, salvos: estado.tema.salvos };
}
// Devolve a mensagem de erro do nome, ou '' se estiver válido.
function erroNomeTema(nome, ignorarUid = null) {
  const n = nome.trim().toLowerCase();
  if (!n) return 'Dê um nome ao tema.';
  if (TEMAS.some(t => t.nome.toLowerCase() === n)) return 'Este nome já é de um dos dez temas do aplicativo. Escolha outro.';
  if (temasSalvos().some(t => t.uid !== ignorarUid && t.nome.toLowerCase() === n)) return 'Você já tem um tema salvo com este nome.';
  return '';
}

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
  try { await api.salvarCaso(estado.caso, estado.tema, progresso(validar(estado.caso))); marcarSalvo('ok'); }
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

// ---------- Edições dos relatórios em uso pelo caso ----------
const EDICAO_LEGADA = { focus: 'focus-2026-10-23', ipea: 'ipea-cc71' };   // as únicas que existiam antes de haver escolha de edição
const casoTemEvidencia = c => c.variaveis.some(v => v.dado || v.fonte || v.publicacao) || Boolean(c.consultas.focusData || c.consultas.ipeaTitulo);
// Define a edição de cada relatório para o caso aberto e carrega os dados correspondentes.
// Caso novo (ou ainda sem evidências): edição mais recente. Caso iniciado antes: fica na edição em que começou.
async function prepararEdicoes(casoJaExistia) {
  await ed.carregarLista();
  const c = estado.caso;
  for (const fonte of ['focus', 'ipea']) {
    const validas = ed.carregadas(fonte);
    let id = c.edicoes[fonte];
    if (!validas.some(e => e.id === id)) {
      const legada = casoJaExistia && casoTemEvidencia(c) && validas.find(e => e.id === EDICAO_LEGADA[fonte]);
      id = (legada || validas[0])?.id || '';
      c.edicoes[fonte] = id;
    }
    try { await ed.usarEdicao(fonte, id); }
    catch (e) { aviso(`Não foi possível carregar os dados ${fonte === 'focus' ? 'do Focus' : 'da Carta do Ipea'}: ${e.message}`, 'erro'); }
  }
  estado.origemDados = ed.estadoEdicoes.origem === 'supabase' ? 'supabase' : 'arquivo';
  inferirOrigens(c);
}
// Evidências registradas antes de o aplicativo guardar a origem: reconhece as que vieram do Focus ou da Carta pela fonte e pela data.
function inferirOrigens(c) {
  for (const v of c.variaveis) {
    if (v.origem || !v.dado) continue;
    const cat = catalogo(v.tipo);
    if (!cat) continue;
    const m = /^fim de (\d{4})$/.exec(v.periodo || '');
    if (cat.focus && m && v.publicacao === '23 de outubro de 2026' && /^Focus/.test(v.fonte || '')) v.origem = { fonte: 'focus', edicao: EDICAO_LEGADA.focus, tipo: 'anual', indicador: cat.focus, periodo: m[1], auto: false };
    else if (cat.ipea && /^Carta de Conjuntura nº 71/.test(v.fonte || '')) v.origem = { fonte: 'ipea', edicao: EDICAO_LEGADA.ipea, registro: null, chave: cat.ipea, ano: /^\d{4}$/.test(v.periodo || '') ? Number(v.periodo) : null, auto: false };
  }
}
let trocandoEdicao = false;
async function trocarEdicao(fonte, id) {
  const c = estado.caso;
  if (trocandoEdicao || !id || id === c.edicoes[fonte]) return;
  trocandoEdicao = true;
  try {
    const nova = await ed.usarEdicao(fonte, id);
    c.edicoes[fonte] = id;
    // Quem escolhe de propósito uma edição anterior não precisa do aviso de edição nova.
    const recente = ed.maisRecente(fonte);
    if (recente && recente.id !== id) c.edicoes.mantida[fonte] = recente.id; else delete c.edicoes.mantida[fonte];
    mudou(); aviso(`O caso passa a usar ${fonte === 'focus' ? 'o Focus de' : 'a Carta'} ${nova.rotulo}.`);
  } catch (e) { aviso(`Não foi possível trocar a edição: ${e.message}`, 'erro'); }
  trocandoEdicao = false; redesenhar();
}
function cartaoEdicoes() {
  const c = estado.caso;
  const seletor = (fonte, rotulo) => {
    const lista = ed.carregadas(fonte);
    const sel = h('select', { 'aria-label': rotulo, onchange: e => trocarEdicao(fonte, e.target.value) }, lista.map((e, i) => h('option', { value: e.id }, `${e.rotulo}${i === 0 ? ' (mais recente)' : ''}`)));
    sel.value = c.edicoes[fonte];
    return h('label', { class: 'campo' }, rotulo, sel);
  };
  const avisos = ['focus', 'ipea'].map(fonte => {
    const recente = ed.maisRecente(fonte), atual = ed.edicao(c.edicoes[fonte]);
    if (!recente || !atual || recente.data_referencia <= atual.data_referencia || c.edicoes.mantida[fonte] === recente.id) return null;
    const f = fonte === 'focus';
    return h('div', { class: 'aviso-edicao' },
      h('div', { class: 'caixa-titulo' }, h('strong', {}, f ? 'Há um Relatório Focus mais recente' : 'Há uma Carta de Conjuntura mais recente'), h('span', { class: 'selo pendente' }, recente.rotulo)),
      h('p', {}, `Este caso usa ${f ? 'o Focus de' : 'a Carta'} ${atual.rotulo}, e nada muda sozinho. Você decide se troca: os dados que já registrou só mudam se você confirmar, variável por variável.`),
      h('div', { class: 'acoes' },
        botao(`Usar ${f ? 'o Focus de' : 'a Carta'} ${recente.rotulo}`, () => trocarEdicao(fonte, recente.id), 'primario'),
        botao(`Manter ${f ? 'o de' : 'a Carta'} ${atual.rotulo}`, () => { c.edicoes.mantida[fonte] = recente.id; mudou(); redesenhar(); })));
  });
  const naMaisRecente = ['focus', 'ipea'].every(f => ed.maisRecente(f)?.id === c.edicoes[f]);
  return h('section', { class: 'cartao' }, h('h2', {}, 'Relatórios de referência deste caso'),
    h('p', { class: 'ajuda' }, 'O caso usa uma edição de cada relatório. Ela define os dados sugeridos nesta etapa, as referências publicadas da etapa 3 e a citação no rodapé dos slides.'),
    avisos,
    h('div', { class: 'grade-2' }, seletor('focus', 'Relatório Focus (Banco Central)'), seletor('ipea', 'Carta de Conjuntura (Ipea)')),
    naMaisRecente ? h('p', { class: 'nota-edicao' }, h('span', { class: 'selo obs' }, 'mais recente'), 'O caso usa a edição mais recente de cada relatório.') : null);
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
  const rotas = estado.admin ? [...ROTAS, { id: 'turma', titulo: 'Admin', icone: '☷', separador: true }] : ROTAS;
  nav.replaceChildren(...rotas.map(r => {
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
  else if (r === 'turma' && estado.admin) vista = vistaTurma();
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
    autoPreencher(alvo, cat);
  }
  mudou(); redesenhar();
}

const gruposAbertos = new Set();
function chipVariavel(v) {
  const ativa = estado.caso.variaveis.some(x => x.tipo === v.id);
  const origem = v.externa ? 'Fonte externa' : [v.focus && 'Focus', v.ipea && 'Ipea'].filter(Boolean).join(' · ');
  return h('button', { class: `chip ${ativa ? 'ativo' : ''} ${v.externa ? 'externa' : ''}`, 'aria-pressed': String(ativa), onclick: () => alternarVariavel(v.id) }, v.nome, h('small', {}, origem));
}
function etapa1() {
  const c = estado.caso;
  const marcadas = c.variaveis.filter(v => v.tipo || v.nome);
  const externasMarcadas = VARIAVEIS.filter(v => v.externa && c.variaveis.some(x => x.tipo === v.id));
  // Botão "Abrir/Recolher todos os temas": age direto nos <details>; o rótulo acompanha o estado real da tela.
  let todosAbertos = true;
  const temasNaTela = () => [...document.querySelectorAll('.grupo-vars')];
  const rotuloTemas = () => { const t = temasNaTela(); if (t.length) botaoTemas.textContent = t.every(d => d.open) ? 'Recolher todos os temas' : 'Abrir todos os temas'; };
  const botaoTemas = botao('Abrir todos os temas', () => { const t = temasNaTela(); const abrir = !t.every(d => d.open); t.forEach(d => { d.open = abrir; }); rotuloTemas(); });
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
      h('div', { class: 'legenda-fontes' },
        h('span', {}, selo('Focus', 'focus'), selo('Ipea', 'ipea'), 'dados já carregados no aplicativo'),
        h('span', {}, selo('Fonte externa', 'externa'), 'não consta dos dois relatórios; o aplicativo indica onde buscar')),
      h('div', { class: 'grupos-barra' },
        h('p', {}, 'Clique em um tema para abrir a lista de indicadores.'),
        botaoTemas),
      GRUPOS.map(g => {
        const lista = variaveisDoGrupo(g.id);
        const sel = lista.filter(v => c.variaveis.some(x => x.tipo === v.id)).length;
        const aberto = gruposAbertos.has(g.id) || (gruposAbertos.size === 0 && (sel > 0 || g.id === 'precos'));
        if (!aberto) todosAbertos = false;
        return h('details', { class: 'grupo-vars', open: aberto, ontoggle: e => { e.target.open ? gruposAbertos.add(g.id) : gruposAbertos.delete(g.id); if (!e.target.open && gruposAbertos.size === 0) gruposAbertos.add('_'); rotuloTemas(); } },
          h('summary', {},
            h('span', { class: 'grupo-titulo' }, h('span', { class: 'grupo-nome' }, g.nome), h('span', { class: 'grupo-n' }, `${lista.length} indicadores`), sel ? h('span', { class: 'grupo-sel' }, `${sel} selecionado${sel > 1 ? 's' : ''}`) : null),
            h('span', { class: 'grupo-acao' }, h('span', { class: 'abrir' }, 'Ver indicadores'), h('span', { class: 'fechar' }, 'Ocultar'))),
          h('div', { class: 'chips grandes' }, lista.map(chipVariavel)));
      }),
      (botaoTemas.textContent = todosAbertos ? 'Recolher todos os temas' : 'Abrir todos os temas', null),
      h('div', { class: 'chips grandes' }, h('button', { class: 'chip', onclick: () => alternarVariavel('outra') }, '+ Outra variável')),
      externasMarcadas.length ? h('div', { class: 'aviso-externa' },
        h('strong', {}, externasMarcadas.length > 1 ? 'Variáveis que não constam do Focus nem da Carta de Conjuntura' : `${externasMarcadas[0].nome} não consta do Focus nem da Carta de Conjuntura`),
        h('p', {}, 'O aplicativo não tem dados para sugerir. Na etapa 2, o valor, a fonte, a data de publicação e o período de referência deverão ser preenchidos manualmente.'),
        externasMarcadas.map(v => h('div', { class: 'onde-buscar' }, h('span', {}, `Onde buscar — ${v.nome}:`), v.fontes.map(f => h('a', { href: f.url, target: '_blank', rel: 'noopener' }, `${f.nome} ↗`)))),
        h('p', { class: 'ajuda' }, 'A consulta ao Relatório Focus e à Carta de Conjuntura continua obrigatória, mesmo quando a variável vem de outra fonte.')) : null,
      marcadas.length ? h('div', { class: 'sensib' }, h('h3', {}, 'Sensibilidade do negócio a cada variável'),
        marcadas.map(v => h('div', { class: 'sensib-linha' },
          h('span', {}, v.nome || 'Outra variável (defina o nome na etapa 2)', catalogo(v.tipo)?.externa ? selo('Fonte externa', 'externa') : null),
          h('div', { class: 'segmentos', role: 'radiogroup', 'aria-label': `Sensibilidade a ${v.nome}` }, [[1, 'Baixa'], [2, 'Média'], [3, 'Alta']].map(([n, t]) =>
            h('button', { role: 'radio', 'aria-checked': String(Number(v.sensibilidade) === n), class: Number(v.sensibilidade) === n ? 'ativo' : '', onclick: () => { v.sensibilidade = n; mudou(); redesenhar(); } }, t)))))) : null,
      C({ rotulo: 'Variáveis prioritárias e mecanismos de transmissão', ajuda: 'Explique por quais mecanismos essas variáveis afetam o negócio (por exemplo: juros → custo do financiamento do cliente → adiamento de compras).', obj: c.diag, chave: 'exposicao', linhas: 4 })),
    rodapeEtapa(1));
}

// ---------- Etapa 2 ----------
const temEvidenciaVar = v => ['dado', 'fonte', 'publicacao', 'periodo', 'tendencia'].some(k => String(v[k] || '').trim());
// Registra na variável um dado do Focus ou da Carta, guardando de onde veio (edição, série e período).
// O texto de tendência escrito pelo autor é preservado; só o texto sugerido pelo aplicativo é substituído.
function aplicarEvidencia(v, ev, { auto = false } = {}) {
  const manter = v.nome ? { tipo: v.tipo, nome: v.nome, unidade: v.unidade || ev.unidade } : {};
  const tendAutor = v.origem?.tend !== undefined && String(v.tendencia || '').trim() && v.tendencia !== v.origem.tend ? v.tendencia : null;
  const { origem, ...campos } = ev;
  Object.assign(v, campos, manter);
  if (tendAutor) v.tendencia = tendAutor;
  v.origem = origem ? { ...origem, auto, tend: ev.tendencia } : null;
  mudou();
  return Boolean(tendAutor);
}
// Preenche a variável com o dado sugerido (edição em uso), se ela ainda não tiver evidência registrada.
function autoPreencher(v, cat) {
  if (temEvidenciaVar(v)) return false;
  const ev = sugestaoEvidencia(cat, estado.caso.ident);
  if (!ev) return false;
  aplicarEvidencia(v, ev, { auto: true });
  return true;
}
// O mesmo dado (série e período) na edição que o caso usa agora; null se não existir.
function equivalenteAtual(o) {
  if (o.fonte === 'focus') {
    const linha = (o.tipo === 'mensal' ? FOCUS.mensal : FOCUS.anual).find(x => x.id === o.indicador);
    return linha?.v[o.periodo] ? evidenciaFocus(linha, o.periodo, o.tipo) : null;
  }
  const r = IPEA.registros.find(x => x.id === o.registro) || (o.chave ? IPEA.registros.find(x => x.chave === o.chave && (x.ano || null) === (o.ano || null)) : null);
  return r ? evidenciaIpea(r) : null;
}
const nomeEdicao = (fonte, e, reserva = '') => (fonte === 'focus' ? `Focus (BCB), ${e?.rotulo || reserva}` : `Carta de Conjuntura ${e?.rotulo || reserva} (Ipea)`);
// Faixa logo abaixo do título da variável: de onde veio o dado, sugestão disponível ou dado de edição anterior.
function faixaOrigem(v, cat) {
  const area = h('div', { class: 'faixa-area' });
  const desenhar = () => {
    const o = v.origem, c = estado.caso;
    if (!o) {
      const sug = cat && !temEvidenciaVar(v) ? sugestaoEvidencia(cat, c.ident) : null;
      return area.replaceChildren(...(sug ? [h('div', { class: 'faixa-origem sugestao' },
        h('span', {}, h('span', { class: 'selo contagem' }, 'Sugestão'), h('strong', {}, sug.dado), ` · ${nomeEdicao(sug.origem.fonte, ed.edicao(sug.origem.edicao))} · ${sug.periodo}`),
        botao('Usar esta sugestão', () => { aplicarEvidencia(v, sug, { auto: true }); redesenhar(); }, 'primario pequeno'))] : []));
    }
    const atualId = c.edicoes[o.fonte], f = o.fonte === 'focus';
    const deOrigem = ed.edicao(o.edicao), atual = ed.edicao(atualId);
    if (!atualId || o.edicao === atualId) return area.replaceChildren(h('div', { class: 'faixa-origem ok' },
      h('span', {}, h('span', { class: 'selo obs' }, o.auto ? 'Preenchido automaticamente' : 'Dado do relatório'), h('strong', {}, nomeEdicao(o.fonte, deOrigem, v.publicacao)),
        ` · ${v.periodo}${o.auto && f ? ', ano que concentra o horizonte do caso' : ''}`)));
    const novo = o.mantida === atualId ? null : equivalenteAtual(o);
    if (!novo) return area.replaceChildren(h('div', { class: 'faixa-origem' },
      h('span', {}, h('span', { class: 'selo' }, 'Edição anterior'), h('strong', {}, nomeEdicao(o.fonte, deOrigem, v.publicacao)), ` · ${v.periodo}${o.mantida === atualId ? ' · mantido por você' : ' · sem equivalente na edição em uso'}`)));
    const igual = novo.dado === v.dado;
    area.replaceChildren(h('div', { class: 'faixa-origem antiga' },
      h('span', {}, `Este dado veio ${f ? 'do Focus de' : 'da Carta'} `, h('strong', {}, deOrigem?.rotulo || v.publicacao), ` (${v.dado}, ${v.periodo}). ${f ? 'No Focus de' : 'Na Carta'} ${atual?.rotulo || ''}, ${igual ? 'o valor para o mesmo período continua em ' : `${f ? 'a mediana' : 'o valor'} para o mesmo período é `}`, h('strong', {}, novo.dado), '.'),
      h('div', { class: 'acoes' },
        botao('Atualizar este dado', () => { const manteve = aplicarEvidencia(v, novo, { auto: o.auto }); redesenhar(); aviso(manteve ? 'Dado atualizado. O texto de tendência é seu e foi mantido: revise-o.' : 'Dado atualizado para a edição em uso.'); }, 'primario pequeno'),
        botao('Manter', () => { v.origem.mantida = atualId; mudou(); desenhar(); }, 'pequeno'))));
  };
  desenhar();
  // Edição manual do dado, da fonte, da data ou do período: o vínculo com o relatório deixa de valer.
  area.esquecer = () => { v.origem = null; area.replaceChildren(); };
  return area;
}
function abrirBusca(v) {
  const cat = catalogo(v.tipo);
  const filtro = cat?.focus ? { aba: 'focus-anual' } : (cat?.ipea ? { aba: 'ipea', chave: cat.ipea } : null);
  const fechar = modal(`Buscar evidência para: ${v.nome || 'nova variável'}`, explorador({ filtro, aoUsar: ev => { aplicarEvidencia(v, ev); fechar(); redesenhar(); aviso('Evidência registrada com fonte, data e período.'); } }), { largo: true });
}
// Janela "Escolher outro dado": só as opções desta variável, nas edições que o caso está usando.
function abrirEscolha(v) {
  const cat = catalogo(v.tipo), ops = opcoesEvidencia(cat);
  if (!ops.focus.length && !ops.ipea.length) return abrirBusca(v);
  const c = estado.caso, sug = sugestaoEvidencia(cat, c.ident);
  let fechar = () => {};
  const usar = ev => { const manteve = aplicarEvidencia(v, ev); fechar(); redesenhar(); aviso(manteve ? 'Dado trocado. O texto de tendência é seu e foi mantido: revise-o.' : 'Dado trocado, com fonte, data e período.'); };
  const opcao = (periodo, ev, obs, nota) => {
    const emUso = mesmaOrigem(v.origem, ev) && v.dado === ev.dado;
    return h('button', { class: `opcao-dado ${emUso ? 'ativo' : ''}`, 'aria-pressed': String(emUso), onclick: () => (emUso ? fechar() : usar(ev)) },
      h('span', { class: 'opcao-esq' }, h('span', { class: 'opcao-per' }, periodo), h('strong', {}, ev.dado), emUso ? h('span', { class: 'selo contagem' }, 'em uso') : null,
        obs ? h('span', { class: 'opcao-obs' }, obs) : null, nota ? h('span', { class: 'opcao-nota' }, nota) : null),
      emUso ? null : h('span', { class: 'opcao-acao' }, 'Usar este dado'));
  };
  const grupo = (titulo, sub, linhas) => (linhas.length ? h('div', { class: 'grupo-opcoes' }, h('div', { class: 'grupo-opcoes-cab' }, h('h4', {}, titulo), h('span', {}, sub)), linhas) : null);
  const obsFocus = x => [mesmaOrigem(sug?.origem, x.ev) ? 'sugerido para o horizonte do caso' : '', x.tipo === 'mensal' ? 'expectativa mensal' : '',
    x.cel.comp !== 'estavel' ? `em ${x.cel.comp} há ${x.cel.sem} semana${x.cel.sem > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ');
  const corpo = h('div', { class: 'escolha-dado' },
    h('p', { class: 'ajuda' }, 'Só as opções desta variável, nas edições que o caso está usando.'),
    grupo('Relatório Focus (Banco Central)', `edição de ${ed.edicao(c.edicoes.focus)?.rotulo || FOCUS.dataTxt} · mediana das expectativas`, ops.focus.map(x => opcao(x.ev.periodo, x.ev, obsFocus(x)))),
    grupo('Carta de Conjuntura (Ipea)', `${ed.edicao(c.edicoes.ipea)?.rotulo || IPEA.periodo}`, ops.ipea.map(x => opcao(`${x.registro.indicador} · ${x.registro.periodo}`, x.ev, `${x.registro.natureza.toLowerCase()}, p. ${x.registro.pagina}`, x.registro.nota))),
    h('div', { class: 'escolha-pe' }, botao('Procurar em todas as séries do Focus e do Ipea', () => { fechar(); abrirBusca(v); }, 'contorno'), botao('Cancelar', () => fechar())));
  fechar = modal(`Escolher outro dado: ${v.nome}`, corpo, { largo: true });
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
  const cat = catalogo(v.tipo);
  const ext = Boolean(cat?.externa);
  const temSerie = Boolean(cat && (cat.focus || cat.ipea));
  const faixa = ext ? null : faixaOrigem(v, cat);
  const manual = () => { faixa?.esquecer(); mudou(); };
  return h('section', { class: `cartao variavel ${ext ? 'externa' : ''}` },
    h('div', { class: 'cab-linha' }, h('h3', {}, `Variável ${i + 1}`, v.nome ? ` — ${v.nome}` : '', ext ? selo('Fonte externa', 'externa') : null),
      h('div', { class: 'acoes' }, ext ? null : botao(temSerie ? 'Escolher outro dado' : 'Buscar no Focus ou no Ipea', () => abrirEscolha(v), temSerie && v.dado ? 'contorno pequeno' : 'primario pequeno'),
        botao('Remover', () => { if (!temDadosVar(v) || confirm('Remover esta variável e suas evidências?')) { removerVariavel(v.uid); mudou(); redesenhar(); } }, 'fantasma pequeno'))),
    ext ? h('div', { class: 'aviso-externa' },
      h('strong', {}, 'Esta variável não consta do Focus nem da Carta de Conjuntura'),
      h('p', {}, 'Preencha os campos abaixo com o dado encontrado na fonte indicada, informando a data de publicação e o período de referência.'),
      h('div', { class: 'onde-buscar' }, h('span', {}, 'Onde buscar:'), cat.fontes.map(f => h('a', { href: f.url, target: '_blank', rel: 'noopener' }, `${f.nome} ↗`)))) : null,
    faixa,
    h('div', { class: 'grade-3' },
      C({ rotulo: 'Tipo', obj: v, chave: 'tipo', tipo: 'select', opcoes: [['', 'Selecione…'], ...GRUPOS.flatMap(g => variaveisDoGrupo(g.id).map(x => [x.id, `${g.nome} — ${x.nome}${x.externa ? ' (fonte externa)' : ''}`])), ['outra', 'Outra variável']], aoMudar: val => { const cat = catalogo(val); if (cat && val !== 'outra') { v.nome = cat.nome; v.unidade = cat.unidade; autoPreencher(v, cat); } mudou(); redesenhar(); } }),
      C({ rotulo: 'Nome da variável', obj: v, chave: 'nome', tipo: 'text', placeholder: 'Ex.: Taxa de juros (Selic)' }),
      C({ rotulo: 'Unidade', obj: v, chave: 'unidade', tipo: 'text', placeholder: '%, % a.a., R$/US$…' })),
    h('div', { class: 'grade-2' },
      C({ rotulo: 'Dado ou projeção / unidade', obj: v, chave: 'dado', tipo: 'text', placeholder: 'Ex.: 13,25 % a.a.', aoMudar: val => { v.valorNum = numSimples(String(val).match(/-?\d+(?:[.,]\d+)?/)?.[0]); manual(); } }),
      C({ rotulo: 'Natureza da informação', obj: v, chave: 'natureza', tipo: 'select', opcoes: [['', 'Selecione…'], ...NATUREZAS] })),
    h('div', { class: 'grade-3' },
      C({ rotulo: 'Fonte / título', obj: v, chave: 'fonte', tipo: 'text', placeholder: 'Publicação e instituição', aoMudar: manual }),
      C({ rotulo: 'Data de publicação', obj: v, chave: 'publicacao', tipo: 'text', placeholder: 'Ex.: 23 de outubro de 2026', aoMudar: manual }),
      C({ rotulo: 'Período de referência', obj: v, chave: 'periodo', tipo: 'text', placeholder: 'Ex.: fim de 2027', aoMudar: manual })),
    C({ rotulo: 'Tendência e evidência de sustentação', ajuda: 'O que o dado indica (alta, queda, estabilidade) e que evidência sustenta essa leitura.', obj: v, chave: 'tendencia' }),
    C({ rotulo: 'Implicação para o mercado da empresa', ajuda: 'Como essa variável afeta os clientes e o desempenho comercial da empresa analisada.', obj: v, chave: 'implicacao' }),
    roteiro(v));
}
function etapa2() {
  const c = estado.caso;
  return h('div', { class: 'vista' }, cabecalhoEtapa(2),
    h('p', { class: 'lead' }, 'Para cada variável, registre o dado ou a projeção encontrada, a tendência, a relação com o mercado da empresa, a fonte, a data de publicação e o período de referência. Diferencie dados observados, projeções publicadas e hipóteses.'),
    cartaoEdicoes(),
    c.variaveis.map(cartaoVariavel),
    h('div', { class: 'acoes' }, botao('+ Adicionar variável', () => { c.variaveis.push(novaVariavel()); mudou(); redesenhar(); }, 'fantasma')),
    h('section', { class: 'cartao' }, h('h2', {}, 'Consultas obrigatórias'),
      h('div', { class: 'grade-2' },
        h('div', {},
          h('div', { class: 'cab-linha' }, h('h3', {}, 'Relatório Focus'), botao('Preencher a data do relatório', () => { c.consultas.focusData = FOCUS.dataTxt; mudou(); redesenhar(); }, 'fantasma pequeno')),
          C({ rotulo: 'Data / período', obj: c.consultas, chave: 'focusData', tipo: 'text', placeholder: 'Data do relatório consultado' }),
          C({ rotulo: 'Expectativas relevantes e contribuição para a análise', obj: c.consultas, chave: 'focusTexto', linhas: 5 })),
        h('div', {},
          h('div', { class: 'cab-linha' }, h('h3', {}, 'Carta de Conjuntura — Ipea'), botao('Preencher o título', () => { c.consultas.ipeaTitulo = `${IPEA.curtoNota} — ${IPEA.periodo}`; mudou(); redesenhar(); }, 'fantasma pequeno')),
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
      refs.length ? h('p', { class: 'refs' }, 'Referências publicadas: ', refs.map(r => h('span', { class: `selo ${r.origem}`, title: `${r.fonte} — ${r.periodo}` }, `${r.rotulo}: ${fmt(r.valor)}`))) : h('p', { class: 'ajuda' }, 'Não há projeção publicada para esta variável no Focus nem na Carta de Conjuntura; os valores serão marcados como hipótese do autor. Se a fonte externa publicar projeções, cite-as na justificativa.'),
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
  const salvos = temasSalvos();
  const atual = () => (temaSalvoAtual() ? `meu:${estado.tema.meu}` : temaAtual().id);
  const doApp = TEMAS.map(t => h('option', { value: t.id }, t.nome));
  const sel = h('select', { 'aria-label': 'Tema visual', onchange: e => {
    const v = e.target.value;
    if (!confirmarTroca()) { sel.value = atual(); return; }
    v.startsWith('meu:') ? escolherTemaSalvo(v.slice(4)) : escolherTemaBase(v);
    mudou(); redesenhar();
  } }, salvos.length ? [h('optgroup', { label: 'Meus temas' }, salvos.map(x => h('option', { value: `meu:${x.uid}` }, x.nome))), h('optgroup', { label: 'Temas do aplicativo' }, doApp)] : doApp);
  sel.value = atual();
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
      h('p', { class: 'lead' }, `Dados transcritos das edições em uso neste caso: Focus de ${FOCUS.dataTxt} e ${IPEA.curto} (${IPEA.periodo}). Confira sempre os valores no documento original antes de citá-los. `, h('a', { href: '#/etapa/2' }, 'Trocar de edição na etapa 2'), '.')),
    h('section', { class: 'cartao' }, explorador({ aoUsar: usar, origem: estado.origemDados === 'supabase' ? 'Dados carregados do banco de dados (Supabase).' : 'Dados carregados do arquivo incorporado ao aplicativo.' })));
}

// ---------- Tema ----------
function vistaTema() {
  const c = estado.caso;
  let slidePrev = 2;
  const previa = h('div', { class: 'previa' });
  const contr = h('div', { class: 'contrastes' });
  const galeria = h('div', { class: 'galeria' });
  const meus = h('div', {});
  const tituloMeus = h('h2', {}, 'Meus temas');
  const painelEd = h('div', { class: 'editor-tema' });
  const caixaSalvar = h('div', {});
  const seloEstado = h('span', {});
  let nomeRascunho = '';
  const garantir = k => (estado.tema[k] ||= {});
  const mini = t => montarSlide(construir(c, resolverTema(t)).slides[2], resolverTema(t), 'mini');
  const amostras = cores => h('div', { class: 'amostras' }, ['primaria', 'destaque', 'fundo', 'texto', 'favoravel', 'adverso'].map(k => h('i', { style: `background:${cores[k]}` })));
  // Pede um nome em uma janela (usado em "Salvar como novo tema" e "Renomear").
  const pedirNome = (titulo, inicial, rotuloBotao, ignorarUid, aoConfirmar) => {
    const erro = h('p', { class: 'erro', role: 'alert' });
    const entrada = h('input', { type: 'text', maxlength: MAX_NOME_TEMA, value: inicial, 'aria-label': 'Nome do tema' });
    const confirmar = () => { const msg = erroNomeTema(entrada.value, ignorarUid); if (msg) { erro.textContent = msg; entrada.focus(); return; } fechar(); aoConfirmar(entrada.value.trim()); };
    entrada.addEventListener('keydown', e => { if (e.key === 'Enter') confirmar(); });
    const fechar = modal(titulo, h('div', { class: 'form-nome-tema' }, h('label', { class: 'campo' }, 'Nome do tema', entrada), erro,
      h('div', { class: 'acoes' }, botao(rotuloBotao, confirmar, 'primario'), botao('Cancelar', () => fechar(), 'fantasma'))));
    entrada.focus(); entrada.select();
  };
  const salvarNovo = nome => {
    if (temasSalvos().length >= MAX_TEMAS_SALVOS) { aviso(`O limite é de ${MAX_TEMAS_SALVOS} temas salvos. Exclua um para salvar outro.`, 'erro'); return; }
    const novo = { uid: uid(), nome, ...copiar(soEscolha(estado.tema)) };
    estado.tema.salvos = [...temasSalvos(), novo]; estado.tema.meu = novo.uid; nomeRascunho = '';
    atualizar(true); aviso(`Tema "${nome}" salvo em Meus temas.`);
  };
  const desenharMeus = () => {
    const lista = temasSalvos();
    tituloMeus.replaceChildren('Meus temas', lista.length ? h('span', { class: 'selo contagem' }, lista.length === 1 ? '1 salvo' : `${lista.length} salvos`) : '');
    meus.className = lista.length ? 'galeria' : '';
    meus.replaceChildren(...(lista.length ? lista.map(x => {
      const ativo = estado.tema.meu === x.uid;
      return h('div', { class: `tema-meu ${ativo ? 'ativo' : ''}` },
        h('button', { class: 'tema-escolher', 'aria-pressed': String(ativo), onclick: () => { if (ativo || !confirmarTroca()) return; escolherTemaSalvo(x.uid); atualizar(true); } },
          mini(x), h('strong', {}, x.nome), h('span', {}, `Criado a partir de ${nomeTemaBase(x.id)}`), amostras(resolverTema(x).cores)),
        h('div', { class: 'acoes' },
          botao('Renomear', () => pedirNome('Renomear tema', x.nome, 'Salvar nome', x.uid, nome => { x.nome = nome; atualizar(true); aviso('Nome do tema atualizado.'); }), 'pequeno'),
          botao('Excluir', () => {
            if (!confirm(ativo ? `Excluir o tema "${x.nome}"? Os slides voltam ao tema ${nomeTemaBase(x.id)}.` : `Excluir o tema "${x.nome}"?`)) return;
            estado.tema.salvos = temasSalvos().filter(t => t.uid !== x.uid);
            if (ativo) escolherTemaBase(x.id); else if (!estado.tema.salvos.length) delete estado.tema.salvos;
            atualizar(true); aviso(`Tema "${x.nome}" excluído.`);
          }, 'pequeno perigo')));
    }) : [h('p', { class: 'vazio-temas' }, 'Nenhum tema salvo ainda. Personalize um dos dez temas e salve a combinação com um nome seu, no fim do quadro Personalização.')]));
  };
  // Caixa de salvamento: muda conforme o tema em uso (do aplicativo ou salvo) e se há alterações pendentes.
  const desenharSalvar = () => {
    const salvo = temaSalvoAtual(), base = nomeTemaBase(estado.tema.id), n = indiceCustomizacao(estado.tema).n;
    const pendente = temAlteracoesSoltas();
    seloEstado.className = `selo ${pendente ? 'pendente' : 'contagem'}`;
    seloEstado.textContent = salvo ? `Meu tema: ${salvo.nome}` : (n ? `${base}, com alterações` : base);
    if (salvo && !pendente) return caixaSalvar.replaceChildren(h('div', { class: 'caixa-salvar' },
      h('div', { class: 'caixa-titulo' }, h('strong', {}, salvo.nome), h('span', { class: 'selo obs' }, 'salvo')),
      h('p', {}, `Tema seu, criado a partir de ${base}. O que você alterar aqui poderá ser salvo neste tema ou em um novo.`)));
    if (salvo) return caixaSalvar.replaceChildren(h('div', { class: 'caixa-salvar' },
      h('div', { class: 'caixa-titulo' }, h('strong', {}, salvo.nome), h('span', { class: 'selo pendente' }, 'alterações não salvas')),
      h('p', {}, 'Você mudou este tema depois de salvar. Atualize o tema salvo ou guarde a nova combinação com outro nome.'),
      h('div', { class: 'acoes' },
        botao('Salvar alterações', () => { Object.assign(salvo, copiar(soEscolha(estado.tema))); atualizar(true); aviso(`Tema "${salvo.nome}" atualizado.`); }, 'primario'),
        botao('Salvar como novo tema', () => pedirNome('Salvar como novo tema', '', 'Salvar tema', null, salvarNovo), 'contorno'),
        botao('Descartar alterações', () => { escolherTemaSalvo(salvo.uid); atualizar(true); }))));
    if (!n) return caixaSalvar.replaceChildren(h('p', { class: 'ajuda' }, 'Altere cores, tipografia ou elementos para criar um tema seu. Depois, salve a combinação com um nome para voltar a ela quando quiser.'));
    const entrada = h('input', { type: 'text', maxlength: MAX_NOME_TEMA, value: nomeRascunho, placeholder: 'Ex.: Grafite com magenta', oninput: e => { nomeRascunho = e.target.value; } });
    const salvar = () => { const msg = erroNomeTema(entrada.value); if (msg) { aviso(msg, 'erro'); entrada.focus(); return; } salvarNovo(entrada.value.trim()); };
    entrada.addEventListener('keydown', e => { if (e.key === 'Enter') salvar(); });
    caixaSalvar.replaceChildren(
      h('div', { class: 'caixa-salvar' },
        h('div', { class: 'caixa-titulo' }, h('strong', {}, 'Salvar como meu tema'), h('span', { class: 'selo pendente' }, 'ainda não salvo')),
        h('p', {}, `Você alterou ${n} ${n === 1 ? 'item' : 'itens'} do tema ${base}. Dê um nome para guardar esta combinação e voltar a ela quando quiser.`),
        h('div', { class: 'linha-nome' }, h('label', {}, 'Nome do tema', entrada), botao('Salvar tema', salvar, 'primario'))),
      h('div', { class: 'acoes' }, botao(`Descartar alterações e voltar ao ${base}`, () => { escolherTemaBase(estado.tema.id); nomeRascunho = ''; atualizar(true); }, 'fantasma')));
  };
  const atualizar = (redesenharPainel = false, salvar = true) => {
    const tema = temaAtual();
    previa.replaceChildren(montarSlide(construir(c, tema).slides[slidePrev], tema));
    const pares = [['Texto sobre o fundo', tema.cores.texto, tema.cores.fundo], ['Texto sobre cartões', tema.cores.texto, tema.cores.superficie], ['Texto sobre a cor principal', tema.cores.sobrePrimaria, tema.cores.primaria], ['Texto secundário', tema.cores.suave, tema.cores.fundo]];
    contr.replaceChildren(...pares.map(([n, a, b]) => { const r = contraste(a, b); return h('span', { class: `selo ${r >= 4.5 ? 'obs' : 'alerta'}`, title: 'Razão de contraste (recomendado: 4,5 ou mais)' }, `${n}: ${fmt(r, 1)}:1 ${r >= 4.5 ? '✓' : '— baixo'}`); }));
    if (redesenharPainel) { desenharMeus(); desenharGaleria(); desenharEditor(); }
    desenharSalvar();
    if (salvar) mudou();
  };
  const desenharGaleria = () => galeria.replaceChildren(...TEMAS.map(t => {
    const ativo = !temaSalvoAtual() && temaAtual().id === t.id;
    return h('button', { class: `tema-cartao ${ativo ? 'ativo' : ''}`, 'aria-pressed': String(ativo), onclick: () => { if (!confirmarTroca()) return; escolherTemaBase(t.id); nomeRascunho = ''; atualizar(true); } },
      mini({ id: t.id }), h('strong', {}, t.nome), h('span', {}, t.descricao), amostras(t.cores));
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
      h('div', { class: 'chaves' }, chave('Rodapé', 'rodape'), chave('Numeração dos slides', 'numeracao'), chave('Fontes no rodapé', 'fontes'), chave('Títulos em caixa alta', 'caixaAlta')));
  };
  desenharMeus(); desenharGaleria(); desenharEditor(); atualizar(false, false);
  return h('div', { class: 'vista larga' },
    h('header', { class: 'cab-etapa' }, h('span', { class: 'kicker' }, 'Aparência dos slides'), h('h1', {}, 'Tema visual'),
      h('p', { class: 'lead' }, 'Escolha um dos dez temas e personalize cores, tipografia e elementos. A escolha vale apenas para os slides: na tela, no modo de apresentação e nos arquivos PPTX e PDF exportados. A aparência do aplicativo não muda.')),
    h('section', { class: 'cartao' }, tituloMeus, meus),
    h('section', { class: 'cartao' }, h('h2', {}, 'Dez temas'), galeria),
    h('div', { class: 'tema-dupla' },
      h('section', { class: 'cartao' }, h('h2', {}, 'Personalização ', seloEstado), painelEd, caixaSalvar),
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

// ---------- Turma (somente o administrador) ----------
const ATRIBUTOS_TEMA = Object.keys(TEMAS[0].cores).length + Object.keys(TEMAS[0].fontes).length + Object.keys(TEMAS[0].el).length;
// Índice de customização: parcela dos atributos do tema (cores, fontes e elementos) alterada em relação ao tema base.
function indiceCustomizacao(salvo) {
  const base = TEMAS.find(t => t.id === salvo?.id) || TEMAS[0];
  const res = resolverTema(salvo);
  const mudou = { cores: [], fontes: [], el: [] };
  for (const g of ['cores', 'fontes', 'el']) for (const k of Object.keys(base[g])) if (String(res[g][k]).toUpperCase() !== String(base[g][k]).toUpperCase()) mudou[g].push(k);
  const n = mudou.cores.length + mudou.fontes.length + mudou.el.length;
  return { base, res, mudou, n, pct: Math.round((n / ATRIBUTOS_TEMA) * 100) };
}
const dataHora = iso => (iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—');
function haQuanto(iso) {
  if (!iso) return '';
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  if (min < 1440) return `há ${Math.round(min / 60)} h`;
  return `há ${Math.round(min / 1440)} dia(s)`;
}
// Calendário dos relatórios: quando sai cada edição e o que já está carregado no aplicativo.
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dataExtenso = iso => `${Number(iso.slice(8, 10))} de ${MESES[Number(iso.slice(5, 7)) - 1]} de ${iso.slice(0, 4)}`;
function calendarioRelatorios() {
  const hoje = ed.hojeISO();
  const focus = ed.calendarioFocus(hoje), ipea = ed.calendarioIpea();
  const ROT = { carregado: 'carregado', falta: 'falta pedir a carga', previsto: 'previsto', aguardando: 'aguardando publicação' };
  const etiqueta = (txt, sit, extra = '') => h('span', { class: `cal-marca ${sit} ${extra}`, title: ROT[sit] }, txt);
  const marcas = new Map();
  const por = (iso, m) => { if (iso) marcas.set(iso, [...(marcas.get(iso) || []), m]); };
  for (const f of focus) por(f.saida, { a: 'Focus', b: f.situacao === 'previsto' ? '' : ed.dataCurta(f.ref), sit: f.situacao });
  for (const i of ipea) por(i.saida, { a: 'Ipea', b: `nº ${i.edicao.metadados?.numero ?? ''}`, sit: i.situacao });
  const mes = (ano, m) => {
    const vazios = (new Date(Date.UTC(ano, m, 1)).getUTCDay() + 6) % 7, dias = new Date(Date.UTC(ano, m + 1, 0)).getUTCDate();
    return h('div', { class: 'cal-mes' }, h('h3', {}, `${MESES[m][0].toUpperCase()}${MESES[m].slice(1)} de ${ano}`),
      h('div', { class: 'cal-grade' }, ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map(d => h('span', { class: 'cal-dia-sem' }, d)),
        Array.from({ length: vazios }, () => h('span', {})),
        Array.from({ length: dias }, (_, k) => {
          const iso = `${ano}-${String(m + 1).padStart(2, '0')}-${String(k + 1).padStart(2, '0')}`;
          return h('span', { class: `cal-dia ${iso === hoje ? 'hoje' : ''}` }, h('span', { class: 'cal-num' }, iso === hoje ? `${k + 1} · hoje` : String(k + 1)), (marcas.get(iso) || []).map(x => h('span', { class: `cal-marca ${x.sit}`, title: `${x.a} ${x.b} — ${ROT[x.sit]}` }, h('span', {}, x.a), x.b ? h('span', {}, x.b) : null)));
        })));
  };
  const [a, m] = [Number(hoje.slice(0, 4)), Number(hoje.slice(5, 7)) - 1];
  const previstos = focus.filter(f => f.situacao === 'previsto').slice(0, 2);
  const linhasFocus = [...focus.filter(f => f.situacao !== 'previsto'), ...previstos].map(f => h('tr', {},
    h('td', {}, h('strong', {}, 'Focus')), h('td', {}, f.edicao?.rotulo || dataExtenso(f.ref)),
    h('td', {}, f.situacao === 'carregado' ? `saiu em ${ed.dataCurta(f.saida)}` : (f.situacao === 'falta' ? `saída prevista para ${ed.dataCurta(f.saida)}` : `previsto para ${ed.dataCurta(f.saida)}`)),
    h('td', {}, etiqueta(ROT[f.situacao], f.situacao, 'larga'))));
  const linhasIpea = ipea.map(i => h('tr', {},
    h('td', {}, h('strong', {}, 'Ipea')), h('td', {}, `Carta ${i.edicao.rotulo}`),
    h('td', {}, i.situacao === 'carregado' ? `saiu em ${ed.dataCompleta(i.saida)}` : (i.edicao.metadados?.previsaoTxt || (i.saida ? `estimativa: ${ed.dataCurta(i.saida)}` : 'sem data oficial'))),
    h('td', {}, etiqueta(ROT[i.situacao], i.situacao, 'larga'))));
  return h('section', { class: 'cartao' }, h('h2', {}, 'Calendário dos relatórios'),
    h('p', { class: 'ajuda' }, 'Quando sai cada Relatório Focus e cada Carta de Conjuntura do Ipea, e o que já está carregado no aplicativo.'),
    h('div', { class: 'cal-legenda' }, [['carregado', 'carregado no aplicativo'], ['falta', 'já saiu, falta pedir a carga'], ['previsto', 'previsto']].map(([sit, t]) => h('span', {}, etiqueta('Focus', sit, 'larga'), t))),
    h('div', { class: 'cal-meses' }, mes(a, m), mes(m === 11 ? a + 1 : a, (m + 1) % 12)),
    h('div', { class: 'tabela-rolagem' }, h('table', { class: 'tabela' },
      h('thead', {}, h('tr', {}, ['Relatório', 'Edição', 'Saída', 'Situação'].map(t => h('th', {}, t)))),
      h('tbody', {}, linhasFocus, linhasIpea))),
    h('p', { class: 'ajuda' }, 'Focus: sai às segundas-feiras, às 8h25, com as expectativas coletadas até a sexta anterior; em feriado, no dia útil seguinte. Ipea: não há calendário oficial; a previsão segue o histórico das últimas edições (abril, julho, outubro e dezembro). As datas são calculadas por essa regra: o aplicativo não consulta os sites do Banco Central e do Ipea.'));
}
function vistaTurma() {
  const corpo = h('div', { class: 'turma-corpo' }, h('p', { class: 'carregando' }, 'Carregando…'));
  const nomeFonte = id => (FONTES_TIPO.find(f => f.id === id)?.nome || id).replace(/ \(.*\)$/, '');
  const rotuloOp = (grupo, v) => (OPCOES_ELEMENTOS[grupo].find(o => o[0] === v) || [v, v])[1];
  const desenhar = linhasDados => {
    const comCaso = linhasDados.filter(l => l.caso_atualizado_em);
    const comProg = linhasDados.filter(l => l.progresso !== null && l.progresso !== undefined);
    const media = comProg.length ? Math.round(comProg.reduce((a, l) => a + l.progresso, 0) / comProg.length) : null;
    const kpi = (rot, val, sub) => h('div', { class: 'kpi' }, h('span', { class: 'kpi-nome' }, rot), h('div', { class: 'kpi-vals' }, h('div', {}, h('strong', {}, val), sub ? h('small', {}, sub) : null)));
    const contas = h('section', { class: 'cartao' }, h('h2', {}, 'Contas e progresso'),
      h('div', { class: 'tabela-rolagem' }, h('table', { class: 'tabela' },
        h('thead', {}, h('tr', {}, ['Participante', 'Conta criada em', 'Último acesso', 'Progresso da entrega'].map(t => h('th', {}, t)))),
        h('tbody', {}, linhasDados.map(l => h('tr', {},
          h('td', {}, h('strong', {}, l.nome || '(sem nome)'), h('div', { class: 'nota' }, l.email)),
          h('td', {}, dataHora(l.conta_criada_em)),
          h('td', {}, dataHora(l.ultimo_acesso), h('div', { class: 'nota' }, haQuanto(l.ultimo_acesso))),
          h('td', {}, l.progresso === null || l.progresso === undefined
            ? h('span', { class: 'nota' }, l.caso_atualizado_em ? 'caso iniciado; progresso ainda não registrado' : 'ainda não iniciou o caso')
            : h('div', { class: 'prog' }, h('div', { class: 'prog-trilho' }, h('div', { class: 'prog-valor', style: `width:${l.progresso}%` })), h('strong', {}, `${l.progresso}%`), h('span', { class: 'nota' }, `${l.itens_ok} de ${l.itens_total} itens`)))))))));

    const comTema = linhasDados.filter(l => l.tema && l.tema.id).map(l => ({ ...l, ic: indiceCustomizacao(l.tema) })).sort((a, b) => b.ic.pct - a.ic.pct);
    const contagem = TEMAS.map(t => ({ rotulo: t.nome, valor: comTema.filter(l => l.ic.base.id === t.id).length, cor: t.cores.primaria })).filter(x => x.valor > 0);
    const amostra = (ic, k) => h('i', { class: ic.mudou.cores.includes(k) ? 'alterada' : '', style: `background:${ic.res.cores[k]}`, title: `${ROTULOS_CORES[k]}: ${ic.res.cores[k]}${ic.mudou.cores.includes(k) ? ' (alterada)' : ''}` });
    const marca = (ic, grupo, k, texto) => h('span', { class: ic.mudou[grupo].includes(k) ? 'alterado' : '' }, texto);
    const custom = h('section', { class: 'cartao' }, h('h2', {}, 'Índice de customização visual'),
      h('p', { class: 'ajuda' }, `O índice é a parcela dos ${ATRIBUTOS_TEMA} atributos do tema (11 cores, 2 fontes e 8 elementos) que o participante alterou em relação ao tema base escolhido. Itens alterados aparecem destacados. A prévia aplica o tema de cada participante ao slide 3 do seu próprio caso.`),
      comTema.length ? [
        contagem.length ? h('div', { class: 'turma-dist' }, barrasGrupos([{ nome: 'Temas base escolhidos (participantes)', itens: contagem }], { casas: 0 })) : null,
        h('div', { class: 'tabela-rolagem' }, h('table', { class: 'tabela custom' },
          h('thead', {}, h('tr', {}, ['Participante', 'Tema', 'Índice', 'Paleta', 'Tipografia', 'Elementos', 'Prévia'].map(t => h('th', {}, t)))),
          h('tbody', {}, comTema.map(l => { const ic = l.ic, e = ic.res.el; return h('tr', {},
            h('td', {}, h('strong', {}, l.nome || l.email)),
            h('td', {}, (() => {
              const salvos = Array.isArray(l.tema.salvos) ? l.tema.salvos.filter(x => x && typeof x.nome === 'string') : [];
              const emUso = salvos.find(x => x.uid === l.tema.meu);
              return [emUso ? [h('strong', {}, emUso.nome), h('div', { class: 'nota' }, `tema próprio, a partir de ${ic.base.nome}`)] : ic.base.nome,
                salvos.length ? h('div', { class: 'nota' }, salvos.length === 1 ? '1 tema salvo' : `${salvos.length} temas salvos`) : null];
            })()),
            h('td', { class: 'num' }, `${ic.pct}%`, h('div', { class: 'nota' }, `${ic.n} de ${ATRIBUTOS_TEMA}`)),
            h('td', {}, h('div', { class: 'amostras grandes' }, Object.keys(ROTULOS_CORES).map(k => amostra(ic, k)))),
            h('td', {}, marca(ic, 'fontes', 'titulo', `Títulos: ${nomeFonte(ic.res.fontes.titulo)}`), h('br'), marca(ic, 'fontes', 'corpo', `Texto: ${nomeFonte(ic.res.fontes.corpo)}`)),
            h('td', { class: 'elementos' }, marca(ic, 'el', 'cabecalho', rotuloOp('cabecalho', e.cabecalho)), ' · ', marca(ic, 'el', 'cartao', `cartões: ${rotuloOp('cartao', e.cartao).toLowerCase()}`), ' · ', marca(ic, 'el', 'deco', `decoração: ${rotuloOp('deco', e.deco).toLowerCase()}`), ' · ', marca(ic, 'el', 'raio', `cantos ${e.raio}px`),
              h('br'), [['rodape', 'rodapé'], ['numeracao', 'numeração'], ['fontes', 'fontes no rodapé'], ['caixaAlta', 'caixa alta']].map(([k, t], i) => [i ? ' · ' : '', marca(ic, 'el', k, `${t}: ${e[k] ? 'sim' : 'não'}`)])),
            h('td', { class: 'previa-mini' }, montarSlide(construir(estado.caso, ic.res).slides[2], ic.res, 'mini'))); })))),
      ] : h('p', {}, 'Nenhum participante salvou um caso ainda.'));

    corpo.replaceChildren(
      h('div', { class: 'kpis' },
        kpi('Contas criadas', String(linhasDados.length)),
        kpi('Iniciaram o caso', String(comCaso.length), linhasDados.length ? ` de ${linhasDados.length}` : ''),
        kpi('Progresso médio', media === null ? '—' : `${media}%`, comProg.length ? ` entre ${comProg.length} com registro` : ''),
        kpi('Concluíram 100%', String(comProg.filter(l => l.progresso === 100).length))),
      contas, custom);
  };
  const carregar = () => api.painelAdmin().then(desenhar).catch(e => corpo.replaceChildren(h('p', { class: 'erro' }, `Não foi possível carregar: ${e.message}`)));
  carregar();
  return h('div', { class: 'vista larga' },
    h('header', { class: 'cab-etapa' }, h('span', { class: 'kicker' }, 'Administração · visível somente para você'), h('h1', {}, 'Admin'),
      h('p', { class: 'lead' }, 'Quem criou conta, quanto do roteiro já concluiu, quando acessou pela última vez e como personalizou o visual. O conteúdo dos casos dos colegas não é exibido.'),
      h('div', { class: 'acoes' }, botao('Atualizar Progresso da Turma', carregar, 'fantasma'))),
    corpo, calendarioRelatorios());
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
    const [registro, admin] = await Promise.all([api.carregarCaso(), api.ehAdmin()]);
    estado.admin = admin;
    api.registrarAcesso();
    estado.caso = normalizar(registro?.dados);
    estado.tema = normalizarTema(registro?.tema);
    if (!estado.caso.ident.aluno) estado.caso.ident.aluno = api.usuario()?.user_metadata?.nome || '';
    await prepararEdicoes(Boolean(registro));
  } catch (e) {
    if (api.remoto && /sess[aã]o/i.test(e.message)) return telaAcesso('entrar', e.message);
    aviso(`Falha ao carregar os dados: ${e.message}`, 'erro');
  }
  montarCasca();
}

// A interface do aplicativo tem aparência fixa (tema original); o tema escolhido pelo participante vale só para os slides.
aplicarTemaNaInterface(resolverTema({ id: 'executivo' }));
if (api.capturarRecuperacao()) telaAcesso('nova-senha');
else if (api.remoto && !api.usuario()) telaAcesso('entrar');
else iniciarSessao();
