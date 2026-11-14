// Dez temas visuais. Cada tema define cores, tipografia e elementos; tudo pode ser personalizado pelo aluno.

export const FONTES_TIPO = [
  { id: 'georgia', nome: 'Georgia (serifada)', css: 'Georgia, "Times New Roman", serif', pptx: 'Georgia' },
  { id: 'times', nome: 'Times New Roman (serifada)', css: '"Times New Roman", Times, serif', pptx: 'Times New Roman' },
  { id: 'garamond', nome: 'Garamond (serifada)', css: 'Garamond, "EB Garamond", Georgia, serif', pptx: 'Garamond' },
  { id: 'arial', nome: 'Arial (sem serifa)', css: 'Arial, Helvetica, sans-serif', pptx: 'Arial' },
  { id: 'calibri', nome: 'Calibri (sem serifa)', css: 'Calibri, Carlito, "Segoe UI", Arial, sans-serif', pptx: 'Calibri' },
  { id: 'segoe', nome: 'Segoe UI (sem serifa)', css: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', pptx: 'Segoe UI' },
  { id: 'verdana', nome: 'Verdana (sem serifa)', css: 'Verdana, Geneva, sans-serif', pptx: 'Verdana' },
  { id: 'trebuchet', nome: 'Trebuchet MS (sem serifa)', css: '"Trebuchet MS", "Segoe UI", sans-serif', pptx: 'Trebuchet MS' },
  { id: 'century', nome: 'Century Gothic (geométrica)', css: '"Century Gothic", "Avenir Next", Futura, Arial, sans-serif', pptx: 'Century Gothic' },
  { id: 'courier', nome: 'Courier New (monoespaçada)', css: '"Courier New", Courier, monospace', pptx: 'Courier New' },
];

export const OPCOES_ELEMENTOS = {
  cabecalho: [['faixa', 'Faixa colorida'], ['linha', 'Linha sob o título'], ['lateral', 'Barra lateral'], ['limpo', 'Somente título']],
  cartao: [['preenchido', 'Preenchido'], ['contorno', 'Contorno'], ['sombra', 'Sombra']],
  deco: [['nenhum', 'Nenhuma'], ['canto', 'Canto geométrico'], ['barra', 'Barra de destaque'], ['circulos', 'Círculos'], ['grade', 'Grade de pontos']],
};

const T = (id, nome, descricao, cores, fontes, el) => ({ id, nome, descricao, cores, fontes, el });

export const TEMAS = [
  T('executivo', 'Executivo Sóbrio', 'Fundo claro, azul-marinho e títulos serifados.',
    { fundo: '#F6F7F9', superficie: '#FFFFFF', texto: '#1B2430', suave: '#5B6675', primaria: '#14305A', sobrePrimaria: '#FFFFFF', destaque: '#B8862B', borda: '#D9DEE5', favoravel: '#2E7D5B', adverso: '#B4433A', base: '#3F6FA8' },
    { titulo: 'georgia', corpo: 'calibri' },
    { cabecalho: 'linha', cartao: 'contorno', deco: 'nenhum', raio: 6, rodape: true, numeracao: true, fontes: true, caixaAlta: false }),
  T('painel', 'Painel Escuro', 'Estilo dashboard financeiro, com foco em números.',
    { fundo: '#0F1722', superficie: '#182434', texto: '#E8EEF5', suave: '#93A3B8', primaria: '#38BDF8', sobrePrimaria: '#06202E', destaque: '#FBBF24', borda: '#2A3A50', favoravel: '#34D399', adverso: '#F87171', base: '#60A5FA' },
    { titulo: 'segoe', corpo: 'segoe' },
    { cabecalho: 'lateral', cartao: 'preenchido', deco: 'grade', raio: 10, rodape: true, numeracao: true, fontes: true, caixaAlta: false }),
  T('editorial', 'Editorial Minimalista', 'Muito espaço em branco e uma única cor de destaque.',
    { fundo: '#FFFFFF', superficie: '#FFFFFF', texto: '#111111', suave: '#6B6B6B', primaria: '#111111', sobrePrimaria: '#FFFFFF', destaque: '#E4572E', borda: '#E5E5E5', favoravel: '#2F855A', adverso: '#C53030', base: '#4A5568' },
    { titulo: 'century', corpo: 'arial' },
    { cabecalho: 'limpo', cartao: 'contorno', deco: 'barra', raio: 0, rodape: true, numeracao: true, fontes: true, caixaAlta: false }),
  T('academico', 'Acadêmico Clássico', 'Papel creme, bordô e tipografia de livro.',
    { fundo: '#FBF7EF', superficie: '#FFFDF8', texto: '#2B2118', suave: '#6E6253', primaria: '#7A1F2B', sobrePrimaria: '#FFF8EE', destaque: '#A67C00', borda: '#E2D8C5', favoravel: '#4B7F52', adverso: '#9B2C2C', base: '#516B8C' },
    { titulo: 'garamond', corpo: 'georgia' },
    { cabecalho: 'linha', cartao: 'contorno', deco: 'nenhum', raio: 2, rodape: true, numeracao: true, fontes: true, caixaAlta: false }),
  T('corporativo', 'Corporativo Azul', 'Faixa de título forte e cartões com sombra.',
    { fundo: '#EEF3FA', superficie: '#FFFFFF', texto: '#172B4D', suave: '#5E6C84', primaria: '#0052CC', sobrePrimaria: '#FFFFFF', destaque: '#00A3BF', borda: '#D5DEEC', favoravel: '#1F845A', adverso: '#C9372C', base: '#0C66E4' },
    { titulo: 'calibri', corpo: 'calibri' },
    { cabecalho: 'faixa', cartao: 'sombra', deco: 'canto', raio: 8, rodape: true, numeracao: true, fontes: true, caixaAlta: false }),
  T('terra', 'Terra e Grafite', 'Tons quentes de terracota sobre grafite.',
    { fundo: '#F4EEE8', superficie: '#FFFAF5', texto: '#2E2A27', suave: '#756B63', primaria: '#B5532F', sobrePrimaria: '#FFF6EF', destaque: '#3D405B', borda: '#E3D6CA', favoravel: '#5B8C5A', adverso: '#A63D2F', base: '#6B7A8F' },
    { titulo: 'trebuchet', corpo: 'verdana' },
    { cabecalho: 'lateral', cartao: 'preenchido', deco: 'circulos', raio: 14, rodape: true, numeracao: true, fontes: true, caixaAlta: false }),
  T('verde', 'Verde Sustentável', 'Paleta verde, leve e institucional.',
    { fundo: '#F1F7F3', superficie: '#FFFFFF', texto: '#17332A', suave: '#567267', primaria: '#1E6B4F', sobrePrimaria: '#FFFFFF', destaque: '#8CB33A', borda: '#D3E4DA', favoravel: '#2E9E6B', adverso: '#C2513E', base: '#3C8D9B' },
    { titulo: 'segoe', corpo: 'calibri' },
    { cabecalho: 'faixa', cartao: 'contorno', deco: 'circulos', raio: 16, rodape: true, numeracao: true, fontes: true, caixaAlta: false }),
  T('contraste', 'Alto Contraste', 'Preto e amarelo, legibilidade máxima em projetores.',
    { fundo: '#000000', superficie: '#141414', texto: '#FFFFFF', suave: '#D0D0D0', primaria: '#FFD400', sobrePrimaria: '#000000', destaque: '#00E5FF', borda: '#5A5A5A', favoravel: '#5CFF8F', adverso: '#FF7A7A', base: '#8FC7FF' },
    { titulo: 'verdana', corpo: 'verdana' },
    { cabecalho: 'faixa', cartao: 'contorno', deco: 'nenhum', raio: 0, rodape: true, numeracao: true, fontes: true, caixaAlta: true }),
  T('neon', 'Tech Neon', 'Roxo profundo com acentos ciano e magenta.',
    { fundo: '#140F2D', superficie: '#1F1842', texto: '#F2EEFF', suave: '#A79FCB', primaria: '#22D3EE', sobrePrimaria: '#0B1030', destaque: '#F472B6', borda: '#3A3170', favoravel: '#4ADE80', adverso: '#FB7185', base: '#A78BFA' },
    { titulo: 'century', corpo: 'segoe' },
    { cabecalho: 'linha', cartao: 'preenchido', deco: 'canto', raio: 12, rodape: true, numeracao: true, fontes: true, caixaAlta: true }),
  T('jornal', 'Jornal Monocromático', 'Preto e branco, colunas e fios, como um caderno de economia.',
    { fundo: '#FAFAF7', superficie: '#FAFAF7', texto: '#0E0E0E', suave: '#555555', primaria: '#0E0E0E', sobrePrimaria: '#FAFAF7', destaque: '#8A0000', borda: '#0E0E0E', favoravel: '#1F5F3A', adverso: '#8A0000', base: '#3A3A3A' },
    { titulo: 'times', corpo: 'georgia' },
    { cabecalho: 'linha', cartao: 'contorno', deco: 'nenhum', raio: 0, rodape: true, numeracao: true, fontes: true, caixaAlta: false }),
];

export const ROTULOS_CORES = {
  fundo: 'Fundo', superficie: 'Cartões', texto: 'Texto', suave: 'Texto secundário', primaria: 'Cor principal',
  sobrePrimaria: 'Texto sobre a cor principal', destaque: 'Destaque', borda: 'Bordas e fios',
  base: 'Cenário base', favoravel: 'Cenário favorável', adverso: 'Cenário adverso',
};

const clone = o => JSON.parse(JSON.stringify(o));

// Combina o tema escolhido com as personalizações salvas ({ id, cores, fontes, el }).
export function resolverTema(salvo) {
  const base = clone(TEMAS.find(t => t.id === salvo?.id) || TEMAS[0]);
  if (salvo?.cores) Object.assign(base.cores, salvo.cores);
  if (salvo?.fontes) Object.assign(base.fontes, salvo.fontes);
  if (salvo?.el) Object.assign(base.el, salvo.el);
  return base;
}

export const fonteCss = id => (FONTES_TIPO.find(f => f.id === id) || FONTES_TIPO[3]).css;
export const fontePptx = id => (FONTES_TIPO.find(f => f.id === id) || FONTES_TIPO[3]).pptx;

// Aplica o tema à interface do aplicativo por meio de variáveis CSS.
export function aplicarTemaNaInterface(tema) {
  const r = document.documentElement.style;
  for (const [k, v] of Object.entries(tema.cores)) r.setProperty(`--c-${k}`, v);
  r.setProperty('--f-titulo', fonteCss(tema.fontes.titulo));
  r.setProperty('--f-corpo', fonteCss(tema.fontes.corpo));
  r.setProperty('--raio', `${tema.el.raio}px`);
  document.documentElement.dataset.cartao = tema.el.cartao;
  document.documentElement.dataset.escuro = luminancia(tema.cores.fundo) < 0.35 ? '1' : '0';
}

export function luminancia(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Mistura duas cores hex (p = peso da segunda), usada para tons de fundo de cartões e tabelas.
export function misturar(a, b, p) {
  const pa = a.replace('#', ''), pb = b.replace('#', '');
  const c = [0, 2, 4].map(i => Math.round(parseInt(pa.slice(i, i + 2), 16) * (1 - p) + parseInt(pb.slice(i, i + 2), 16) * p));
  return '#' + c.map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}
