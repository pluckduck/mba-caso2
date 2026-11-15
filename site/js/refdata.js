// Dados de referência do Estudo de Caso 2, transcritos dos arquivos de apoio da aula de 14/11/2026.
// Fonte única: este arquivo alimenta o aplicativo e gera o seed do Supabase (scripts/gerar-seed.mjs).

const a = (h4, h1, hoje, comp, sem, resp, d5 = null, resp5 = null) => ({ h4, h1, hoje, comp, sem, resp, d5, resp5 });

export const FOCUS = {
  id: 'focus',
  edicao: 'focus-2026-10-23',
  titulo: 'Focus — Relatório de Mercado',
  instituicao: 'Banco Central do Brasil',
  data: '2026-10-23',
  dataTxt: '23 de outubro de 2026',
  url: 'https://www.bcb.gov.br/publicacoes/focus',
  citacao: 'BANCO CENTRAL DO BRASIL. Focus – Relatório de Mercado: expectativas de mercado. Brasília: BCB, 23 out. 2026.',
  nota: 'Medianas das expectativas de mercado (agregado). "Comportamento semanal" indica a direção da revisão desde o relatório anterior e há quantas semanas ela se repete.',
  anos: [2026, 2027, 2028, 2029],
  anual: [
    { id: 'ipca', indicador: 'IPCA', unidade: 'variação %', casas: 2, v: {
      2026: a(4.99, 5.22, 5.19, 'queda', 1, 142, 5.20, 107), 2027: a(4.31, 4.32, 4.34, 'alta', 2, 142, 4.47, 107),
      2028: a(3.80, 3.75, 3.75, 'estavel', 1, 124), 2029: a(3.50, 3.50, 3.50, 'estavel', 2, 116) } },
    { id: 'pib', indicador: 'PIB Total', unidade: 'variação % sobre ano anterior', casas: 2, v: {
      2026: a(1.86, 1.83, 1.80, 'queda', 2, 113, 1.78, 72), 2027: a(1.41, 1.32, 1.31, 'queda', 2, 113, 1.24, 72),
      2028: a(1.83, 1.81, 1.81, 'estavel', 1, 83), 2029: a(2.00, 2.00, 2.00, 'estavel', 84, 76) } },
    { id: 'cambio', indicador: 'Câmbio', unidade: 'R$/US$', casas: 2, v: {
      2026: a(5.20, 5.13, 5.05, 'queda', 3, 112, 5.00, 80), 2027: a(5.28, 5.22, 5.15, 'queda', 3, 111, 5.13, 80),
      2028: a(5.30, 5.29, 5.20, 'queda', 2, 87), 2029: a(5.35, 5.30, 5.28, 'queda', 1, 82) } },
    { id: 'selic', indicador: 'Selic', unidade: '% a.a.', casas: 2, v: {
      2026: a(13.50, 13.25, 13.25, 'estavel', 2, 137, 13.25, 87), 2027: a(12.00, 12.00, 11.75, 'queda', 1, 136, 11.50, 86),
      2028: a(10.50, 10.50, 10.00, 'queda', 1, 115), 2029: a(10.00, 10.00, 10.00, 'estavel', 25, 110) } },
    { id: 'igpm', indicador: 'IGP-M', unidade: 'variação %', casas: 2, v: {
      2026: a(4.76, 5.26, 5.61, 'alta', 1, 63, 5.70, 40), 2027: a(4.11, 4.00, 4.01, 'alta', 1, 61, 4.04, 39),
      2028: a(3.92, 3.90, 3.92, 'alta', 1, 56), 2029: a(3.81, 3.81, 3.80, 'queda', 1, 53) } },
    { id: 'ipca_adm', indicador: 'IPCA Administrados', unidade: 'variação %', casas: 2, v: {
      2026: a(4.63, 4.84, 4.80, 'queda', 2, 98, 4.74, 75), 2027: a(3.82, 3.86, 3.99, 'alta', 2, 97, 4.05, 74),
      2028: a(3.62, 3.63, 3.63, 'estavel', 1, 71), 2029: a(3.50, 3.50, 3.50, 'estavel', 67, 67) } },
    { id: 'conta_corrente', indicador: 'Conta corrente', unidade: 'US$ bilhões', casas: 2, v: {
      2026: a(-60.00, -60.00, -60.00, 'estavel', 16, 42, -59.80, 25), 2027: a(-59.30, -59.35, -59.35, 'estavel', 1, 42, -58.90, 25),
      2028: a(-62.68, -64.93, -64.90, 'alta', 1, 34), 2029: a(-62.00, -62.63, -62.61, 'alta', 1, 31) } },
    { id: 'balanca', indicador: 'Balança comercial', unidade: 'US$ bilhões', casas: 2, v: {
      2026: a(77.00, 80.15, 80.00, 'queda', 1, 40, 79.90, 23), 2027: a(79.00, 79.70, 79.80, 'alta', 2, 39, 79.90, 22),
      2028: a(78.00, 81.31, 83.04, 'alta', 2, 35), 2029: a(79.16, 83.42, 85.00, 'alta', 2, 29) } },
    { id: 'idp', indicador: 'Investimento direto no país', unidade: 'US$ bilhões', casas: 2, v: {
      2026: a(80.00, 80.00, 80.00, 'estavel', 7, 39, 80.00, 23), 2027: a(79.00, 80.00, 80.00, 'estavel', 1, 39, 80.00, 23),
      2028: a(80.00, 80.00, 80.00, 'estavel', 37, 33), 2029: a(80.00, 80.00, 80.00, 'estavel', 24, 30) } },
    { id: 'divida', indicador: 'Dívida líquida do setor público', unidade: '% do PIB', casas: 2, v: {
      2026: a(70.00, 70.10, 70.10, 'estavel', 1, 54, 70.10, 32), 2027: a(73.80, 74.00, 74.00, 'estavel', 1, 53, 74.00, 31),
      2028: a(76.45, 76.70, 76.60, 'queda', 1, 49), 2029: a(79.07, 79.13, 79.13, 'estavel', 1, 47) } },
    { id: 'primario', indicador: 'Resultado primário', unidade: '% do PIB', casas: 2, v: {
      2026: a(-0.41, -0.48, -0.48, 'estavel', 1, 58, -0.41, 35), 2027: a(-0.40, -0.40, -0.30, 'alta', 1, 57, -0.27, 34),
      2028: a(-0.30, -0.20, 0.00, 'alta', 2, 53), 2029: a(-0.15, -0.13, 0.10, 'alta', 3, 49) } },
    { id: 'nominal', indicador: 'Resultado nominal', unidade: '% do PIB', casas: 2, v: {
      2026: a(-8.90, -8.90, -8.93, 'queda', 2, 53, -8.95, 34), 2027: a(-8.50, -8.50, -8.50, 'estavel', 8, 52, -8.50, 33),
      2028: a(-7.91, -7.90, -7.90, 'estavel', 2, 47), 2029: a(-7.50, -7.40, -7.40, 'estavel', 1, 43) } },
  ],
  periodosMensais: ['out/2026', 'nov/2026', 'dez/2026', 'Infl. 12 m suav.'],
  mensal: [
    { id: 'ipca', indicador: 'IPCA', unidade: 'variação %', casas: 2, v: {
      'out/2026': a(0.33, 0.32, 0.28, 'queda', 2, 135, 0.26), 'nov/2026': a(0.35, 0.34, 0.33, 'queda', 2, 135, 0.33),
      'dez/2026': a(0.56, 0.56, 0.58, 'alta', 1, 135, 0.58), 'Infl. 12 m suav.': a(4.65, 4.51, 4.53, 'alta', 2, 129, 4.56) } },
    { id: 'cambio', indicador: 'Câmbio', unidade: 'R$/US$', casas: 2, v: {
      'out/2026': a(5.17, 5.10, 5.04, 'queda', 3, 109, 5.04), 'nov/2026': a(5.18, 5.12, 5.03, 'queda', 3, 109, 5.00),
      'dez/2026': a(5.20, 5.13, 5.05, 'queda', 3, 112, 5.00) } },
    { id: 'selic', indicador: 'Selic', unidade: '% a.a.', casas: 2, v: {
      'nov/2026': a(13.50, 13.50, 13.50, 'estavel', 4, 133, 13.50), 'dez/2026': a(13.50, 13.25, 13.25, 'estavel', 2, 137, 13.25) } },
    { id: 'igpm', indicador: 'IGP-M', unidade: 'variação %', casas: 2, v: {
      'out/2026': a(0.60, 0.80, 1.38, 'alta', 2, 61, 1.47), 'nov/2026': a(0.50, 0.48, 0.47, 'queda', 2, 61, 0.48),
      'dez/2026': a(0.47, 0.45, 0.39, 'queda', 2, 61, 0.40), 'Infl. 12 m suav.': a(4.70, 4.34, 4.28, 'queda', 7, 58, 4.34) } },
  ],
};

const OBS = 'Dado observado';
const PROJ = 'Projeção publicada';
const ANA = 'Estimativa ou análise da fonte';

export const IPEA = {
  id: 'ipea',
  edicao: 'ipea-cc71',
  data: '2026-07-08',
  anterior: null,   // edição imediatamente anterior (para comparar projeções); preenchida por edicoes.js
  numero: 71,
  curto: 'Carta de Conjuntura nº 71',
  curtoNota: 'Carta de Conjuntura nº 71, Nota de Conjuntura 24',
  titulo: 'Carta de Conjuntura nº 71 — Nota de Conjuntura 24 — Visão geral da conjuntura',
  instituicao: 'Instituto de Pesquisa Econômica Aplicada (Ipea)',
  periodo: '2º trimestre de 2026',
  publicacao: 'junho de 2026',
  url: 'https://www.ipea.gov.br/cartadeconjuntura/',
  citacao: 'SANTOS, Claudio Hamilton Matos dos; AMITRANO, Cláudio Roberto; ARAUJO, Mônica Mora y. Visão geral da conjuntura. Carta de Conjuntura, Brasília: Ipea, n. 71, Nota de Conjuntura 24, 2º trim. 2026.',
  nota: 'A data de publicação segue a capa do arquivo de apoio (08/06/2026). O site do Ipea registra a publicação em 08/07/2026, e o texto menciona fatos de até o fim de junho de 2026 (Copom de 16–17/06 e Focus de 26/06). Ao citar, use "2º trimestre de 2026" como período de referência.',
  temas: ['Atividade', 'Projeções PIB', 'Preços', 'Juros e câmbio', 'Trabalho e renda', 'Crédito e famílias', 'Fiscal', 'Setor externo'],
  registros: [
    // Atividade (observado)
    { id: 'pib_1t26_aa', tema: 'Atividade', indicador: 'PIB — 1º tri/2026 ante 1º tri/2025', valor: 1.8, unidade: '%', periodo: '1º trimestre de 2026', natureza: OBS, pagina: 1, nota: 'Crescimento liderado pela agropecuária (oferta) e por consumo das famílias e FBCF (demanda).' },
    { id: 'pib_1t26_margem', tema: 'Atividade', indicador: 'PIB — 1º tri/2026 ante 4º tri/2025 (dessazonalizado)', valor: 1.1, unidade: '%', periodo: '1º trimestre de 2026', natureza: OBS, pagina: 1, nota: 'Acima da previsão anterior do Ipea (0,8%).' },
    { id: 'pib_4tri', tema: 'Atividade', indicador: 'PIB — acumulado em quatro trimestres', valor: 2.0, unidade: '%', periodo: 'até o 1º trimestre de 2026', natureza: OBS, pagina: 26, nota: 'Desaceleração ante 2,3% no período anterior.' },
    { id: 'carry_2026', tema: 'Atividade', indicador: 'Carry-over (carregamento estatístico) para 2026', valor: 1.4, unidade: '%', periodo: '2026', natureza: OBS, pagina: 26, nota: 'Era de 0,2% antes do resultado do 1º trimestre.' },
    { id: 'pim_mai26', tema: 'Atividade', indicador: 'Produção industrial (PIM-PF) — variação na margem', valor: -0.2, unidade: '%', periodo: 'maio de 2026', natureza: OBS, pagina: 16, nota: 'Interrompe quatro meses de alta (ganho acumulado de 4,3%); 16 dos 25 ramos avançaram.', chave: 'industria' },
    { id: 'pmc_abr26_restrito', tema: 'Atividade', indicador: 'Varejo restrito (PMC) — variação na margem', valor: -1.5, unidade: '%', periodo: 'abril de 2026', natureza: OBS, pagina: 16, nota: 'Série dessazonalizada.', chave: 'varejo' },
    { id: 'pmc_abr26_ampliado', tema: 'Atividade', indicador: 'Varejo ampliado (PMC) — variação na margem', valor: -0.7, unidade: '%', periodo: 'abril de 2026', natureza: OBS, pagina: 16, nota: 'Série dessazonalizada.', chave: 'varejo' },
    { id: 'pms_abr26_margem', tema: 'Atividade', indicador: 'Volume de serviços (PMS) — variação na margem', valor: 1.2, unidade: '%', periodo: 'abril de 2026', natureza: OBS, pagina: 17, nota: 'Recupera a perda de março (-1,1%); avanço disseminado.', chave: 'servicos' },
    { id: 'pms_abr26_aa', tema: 'Atividade', indicador: 'Volume de serviços (PMS) — variação interanual', valor: 1.9, unidade: '%', periodo: 'abril de 2026', natureza: OBS, pagina: 17, nota: '25ª taxa interanual positiva consecutiva.', chave: 'servicos' },

    // Projeções do PIB e componentes (Tabela 5.1)
    { id: 'pib_2026', tema: 'Projeções PIB', indicador: 'PIB', valor: 2.3, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Revisado de 1,8% para 2,3%. Observado: 3,4% (2024) e 2,3% (2025).', chave: 'pib', ano: 2026 },
    { id: 'pib_2027', tema: 'Projeções PIB', indicador: 'PIB', valor: 2.0, unidade: '%', periodo: '2027', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Ritmo mais moderado; carry-over de 0,8% para 2027.', chave: 'pib', ano: 2027 },
    { id: 'pib_2t26', tema: 'Projeções PIB', indicador: 'PIB — 2º tri/2026 ante trimestre anterior (dessaz.)', valor: 0.5, unidade: '%', periodo: '2º trimestre de 2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Alta de 2,0% ante o 2º tri/2025.' },
    { id: 'serv_2026', tema: 'Projeções PIB', indicador: 'Serviços', valor: 2.4, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 2,0%. Sustentado por emprego e massa salarial.', chave: 'servicos', ano: 2026 },
    { id: 'ind_2026', tema: 'Projeções PIB', indicador: 'Indústria', valor: 2.0, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 1,9%. Extrativa forte; transformação contida pelo custo do crédito.', chave: 'industria', ano: 2026 },
    { id: 'agro_2026', tema: 'Projeções PIB', indicador: 'Agropecuária', valor: 1.8, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 2,0%. Observado em 2025: 11,7%.', chave: 'agro', ano: 2026 },
    { id: 'consumo_2026', tema: 'Projeções PIB', indicador: 'Consumo das famílias', valor: 1.9, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Observado: 5,1% (2024) e 1,3% (2025).', chave: 'consumo', ano: 2026 },
    { id: 'consumo_2027', tema: 'Projeções PIB', indicador: 'Consumo das famílias', valor: 1.7, unidade: '%', periodo: '2027', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1.', chave: 'consumo', ano: 2027 },
    { id: 'governo_2026', tema: 'Projeções PIB', indicador: 'Consumo do governo', valor: 1.8, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 2,0%.', chave: 'governo', ano: 2026 },
    { id: 'fbcf_2026', tema: 'Projeções PIB', indicador: 'Investimento (FBCF)', valor: 1.2, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Revisado de queda para alta; núcleo sensível a juros segue contido.', chave: 'fbcf', ano: 2026 },
    { id: 'fbcf_2027', tema: 'Projeções PIB', indicador: 'Investimento (FBCF)', valor: 3.1, unidade: '%', periodo: '2027', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Efeitos defasados da flexibilização monetária.', chave: 'fbcf', ano: 2027 },
    { id: 'export_2026', tema: 'Projeções PIB', indicador: 'Exportações de bens e serviços', valor: 4.5, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 2,7%.', chave: 'exportacoes', ano: 2026 },
    { id: 'import_2026', tema: 'Projeções PIB', indicador: 'Importações de bens e serviços', valor: 3.3, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 4,0%.', chave: 'importacoes', ano: 2026 },

    // Preços
    { id: 'ipca_12m_fev26', tema: 'Preços', indicador: 'IPCA — acumulado em 12 meses', valor: 3.8, unidade: '%', periodo: 'fevereiro de 2026', natureza: OBS, pagina: 7, nota: 'Ponto de partida antes do choque de oferta.' },
    { id: 'ipca_12m_mai26', tema: 'Preços', indicador: 'IPCA — acumulado em 12 meses', valor: 4.7, unidade: '%', periodo: 'maio de 2026', natureza: OBS, pagina: 7, nota: 'Acima do limite superior da meta de inflação (4,5%).' },
    { id: 'ipca_2026', tema: 'Preços', indicador: 'IPCA', valor: 5.3, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 31, nota: 'Tabela 5.3. Projeção anterior (março/2026): 4,2%.', chave: 'ipca', ano: 2026 },
    { id: 'ipca_alim_2026', tema: 'Preços', indicador: 'IPCA — alimentos no domicílio', valor: 7.3, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 31, nota: 'Tabela 5.3. Projeção anterior: 3,9%. Contribuição de 1,2 p.p. para o IPCA.', chave: 'alimentos', ano: 2026 },
    { id: 'ipca_ind_2026', tema: 'Preços', indicador: 'IPCA — bens industriais', valor: 3.6, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 31, nota: 'Tabela 5.3. Projeção anterior: 2,6%. Contribuição de 0,8 p.p.', chave: 'bens_industriais', ano: 2026 },
    { id: 'ipca_serv_2026', tema: 'Preços', indicador: 'IPCA — serviços (totais)', valor: 5.8, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 31, nota: 'Tabela 5.3. Projeção anterior: 5,5%. Contribuição de 2,1 p.p.', chave: 'servicos_precos', ano: 2026 },
    { id: 'ipca_adm_2026', tema: 'Preços', indicador: 'IPCA — preços administrados', valor: 4.8, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 31, nota: 'Tabela 5.3. Projeção anterior: 4,3%. Contribuição de 1,2 p.p.', chave: 'ipca_adm', ano: 2026 },
    { id: 'brent', tema: 'Preços', indicador: 'Petróleo Brent — preço do barril', valor: 75, unidade: 'US$', periodo: 'fim de junho de 2026', natureza: OBS, pagina: 30, nota: 'Cerca de US$ 72 no fim de fevereiro; acima de US$ 130 no início de abril; próximo de US$ 100 até meados de maio.', chave: 'petroleo' },

    // Juros e câmbio (Tabela 5.2)
    { id: 'selic_2026', tema: 'Juros e câmbio', indicador: 'Taxa Selic — fim de período', valor: 12.5, unidade: '% a.a.', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.2. Atenção: o texto da mesma página menciona hipótese de 14% a.a. no fim de 2026; confira no original antes de citar. Observado: 12,25% (2024) e 15,00% (2025).', chave: 'selic', ano: 2026 },
    { id: 'selic_2027', tema: 'Juros e câmbio', indicador: 'Taxa Selic — fim de período', valor: 11.0, unidade: '% a.a.', periodo: '2027', natureza: PROJ, pagina: 29, nota: 'Tabela 5.2. Atenção: o texto da mesma página menciona hipótese de 12% a.a. no fim de 2027; confira no original antes de citar.', chave: 'selic', ano: 2027 },
    { id: 'cambio_2026', tema: 'Juros e câmbio', indicador: 'Taxa de câmbio — fim de período', valor: 5.30, unidade: 'R$/US$', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.2. Observado: 6,19 (2024) e 5,50 (2025).', chave: 'cambio', ano: 2026 },
    { id: 'cambio_2027', tema: 'Juros e câmbio', indicador: 'Taxa de câmbio — fim de período', valor: 5.40, unidade: 'R$/US$', periodo: '2027', natureza: PROJ, pagina: 29, nota: 'Tabela 5.2.', chave: 'cambio', ano: 2027 },

    // Trabalho e renda
    { id: 'desocupacao', tema: 'Trabalho e renda', indicador: 'Taxa de desocupação (PNAD Contínua)', valor: 5.8, unidade: '%', periodo: 'trimestre encerrado em abril de 2026', natureza: OBS, pagina: 18, nota: 'Recuo de 0,8 p.p. ante o mesmo período de 2025; mínimos históricos.', chave: 'desemprego' },
    { id: 'massa_salarial', tema: 'Trabalho e renda', indicador: 'Massa salarial real — média mensal', valor: 377.6, unidade: 'R$ bilhões', periodo: '1º trimestre de 2026', natureza: OBS, pagina: 18, nota: 'Alta de 7,1% ante o 1º tri/2025 (R$ 25 bilhões a mais).', chave: 'renda' },
    { id: 'massa_salarial_var', tema: 'Trabalho e renda', indicador: 'Massa salarial real — variação interanual', valor: 7.1, unidade: '%', periodo: '1º trimestre de 2026', natureza: OBS, pagina: 18, nota: 'No trimestre móvel até abril/2026, a massa habitual cresceu 6,5%.', chave: 'renda' },
    { id: 'renda_disponivel', tema: 'Trabalho e renda', indicador: 'Renda disponível bruta das famílias — crescimento real', valor: 4.6, unidade: '% a.a.', periodo: 'desde o aperto monetário (set/2024)', natureza: OBS, pagina: 5, nota: 'Valor aproximado informado pela fonte ("próxima de 4,6% ao ano").', chave: 'renda' },

    // Crédito e famílias
    { id: 'credito_livre_pf', tema: 'Crédito e famílias', indicador: 'Crédito livre a pessoas físicas — saldo, variação real', valor: 6.9, unidade: '%', periodo: 'setembro de 2025 ante setembro de 2024', natureza: OBS, pagina: 2, nota: 'Era 7,4% um ano antes: desaceleração limitada apesar das altas da Selic.', chave: 'credito' },
    { id: 'credito_total_pf', tema: 'Crédito e famílias', indicador: 'Crédito total a pessoas físicas — crescimento real', valor: 7.0, unidade: '% a.a.', periodo: 'desde o aperto monetário (set/2024)', natureza: OBS, pagina: 5, nota: 'Valor aproximado informado pela fonte; sinais de acomodação nos dois meses mais recentes.', chave: 'credito' },
    { id: 'credito_emergencial', tema: 'Crédito e famílias', indicador: 'Crédito emergencial (cheque especial e cartão rotativo/parcelado) — variação real', valor: 22, unidade: '%', periodo: 'setembro de 2024 a maio de 2026', natureza: OBS, pagina: 2, nota: 'O dobro do ritmo do crédito livre a pessoas físicas como um todo.', chave: 'credito' },
    { id: 'selic_credito_lp', tema: 'Crédito e famílias', indicador: 'Efeito de +1 p.p. na Selic sobre concessões de longo prazo a pessoas físicas', valor: -3.7, unidade: '% em 12 meses', periodo: 'estudo do BCB (março de 2026)', natureza: ANA, pagina: 2, nota: 'Único canal de crédito com transmissão estatisticamente significativa, segundo o estudo citado.' },
    { id: 'servico_divida', tema: 'Crédito e famílias', indicador: 'Despesas das famílias com serviço da dívida — crescimento real', valor: 10, unidade: '% a.a.', periodo: 'desde setembro de 2024', natureza: OBS, pagina: 6, nota: 'Valor aproximado ("perto de 10% ao ano"). A renda líquida do serviço da dívida ainda cresce 1,8% a.a.', chave: 'servico_divida' },
    { id: 'inadimplentes', tema: 'Crédito e famílias', indicador: 'Brasileiros inadimplentes (Serasa Experian)', valor: 83, unidade: 'milhões', periodo: 'maio de 2026', natureza: OBS, pagina: 4, nota: 'Contexto do Novo Desenrola (MP nº 1.355/2026), que já beneficiou mais de 6 milhões de pessoas.', chave: 'inadimplencia' },

    // Fiscal
    { id: 'primario_2026', tema: 'Fiscal', indicador: 'Resultado primário do setor público — expectativa de mercado', valor: -0.5, unidade: '% do PIB', periodo: '2026', natureza: PROJ, pagina: 6, nota: 'Mediana das expectativas de mercado citada pelo Ipea; para 2027, déficit de 0,4% do PIB.', chave: 'primario', ano: 2026 },

    // Setor externo
    { id: 'real_efetivo', tema: 'Setor externo', indicador: 'Valorização do real (câmbio efetivo real)', valor: 4, unidade: '%', periodo: 'janeiro a abril de 2026', natureza: OBS, pagina: 6, nota: 'Associada ao aumento do valor das exportações de petróleo após o choque de oferta.', chave: 'cambio' },
  ],
  // Guia de leitura: paráfrases do argumento da Carta, com a página de origem.
  argumentos: [
    { titulo: 'Atividade mais forte que o previsto', texto: 'A economia iniciou 2026 em aceleração, e o Ipea considera possível um crescimento próximo ou superior ao de 2025, mesmo com juros reais muito altos.', pagina: 1 },
    { titulo: 'Setores pouco sensíveis ao ciclo doméstico', texto: 'Agropecuária e indústria extrativa (petróleo) sustentam parte do crescimento por razões de oferta, com pouca relação com a taxa Selic.', pagina: 1 },
    { titulo: 'Mercado de trabalho e gastos sociais', texto: 'Desocupação em mínimos históricos e renda em máximos são atribuídas à combinação de baixa potência da política monetária com gastos sociais elevados.', pagina: 2 },
    { titulo: 'Crédito responde pouco à Selic', texto: 'Somente o crédito de longo prazo reage de forma significativa aos juros; modalidades emergenciais crescem justamente quando há estresse financeiro das famílias.', pagina: 2 },
    { titulo: 'Endividamento como freio ao consumo', texto: 'O serviço da dívida pesa cada vez mais na renda das famílias, embora a renda disponível líquida ainda cresça.', pagina: 6 },
    { titulo: 'Choque de oferta e inflação', texto: 'O conflito no Oriente Médio elevou o petróleo e, somado a efeitos climáticos sobre alimentos, levou o IPCA acima do teto da meta.', pagina: 7 },
    { titulo: 'Riscos para a inflação', texto: 'Cenário adverso: agravamento do conflito, clima mais severo ou câmbio depreciado. Cenário benigno: acordo de paz, atividade mais moderada ou desaceleração global.', pagina: 30 },
    { titulo: 'Política fiscal sem mudança em 2026', texto: 'O Ipea não antevê alteração da política fiscal no ano; a dívida segue em alta e o tema deve entrar no debate eleitoral.', pagina: 6 },
  ],
};

// ---------- Dados observados ("onde está hoje") ----------
// Séries com o último valor medido, para comparar com as projeções. modo "nivel": o valor vale até mudar (taxa, cotação)
// e é comparado com o de quatro semanas antes, a mesma janela do Focus. modo "periodo": cada medição cobre um período
// (mês, trimestre) e é comparada com a medição anterior.
export const SERIES_OBS = {
  selic: { variavel: 'juros', nome: 'Taxa Selic (meta)', unidade: '% a.a.', casas: 2, modo: 'nivel', fonte: 'Banco Central do Brasil (Copom)' },
  cambio: { variavel: 'cambio', nome: 'Dólar PTAX (venda)', unidade: 'R$/US$', casas: 2, modo: 'nivel', fonte: 'Banco Central do Brasil (PTAX)' },
  ipca: { variavel: 'inflacao', nome: 'IPCA acumulado em 12 meses', unidade: '%', casas: 2, modo: 'periodo', fonte: 'IBGE (IPCA)' },
  pib: { variavel: 'pib', nome: 'PIB acumulado em quatro trimestres', unidade: '%', casas: 1, modo: 'periodo', fonte: 'IBGE (Contas Nacionais Trimestrais)' },
  fbcf: { variavel: 'investimento', nome: 'FBCF ante o mesmo trimestre do ano anterior', unidade: '%', casas: 1, modo: 'periodo', fonte: 'IBGE (Contas Nacionais Trimestrais), via Carta de Conjuntura do Ipea' },
};
const o = (serie, data, valor, rotulo, curto, disponivel_em = null) => ({ serie, data, valor, rotulo, curto, disponivel_em, fonte: SERIES_OBS[serie].fonte });
// Cópia embutida (modo local ou falha do banco). No uso normal, os valores vêm da tabela "observados".
export const OBSERVADOS = [
  o('selic', '2026-09-16', 13.75, 'Copom de 16/09/2026', 'Copom, 16/9', '2026-09-16'),
  o('selic', '2026-11-04', 13.75, 'Copom de 04/11/2026', 'Copom, 4/11', '2026-11-04'),
  o('cambio', '2026-09-25', 5.1991, 'PTAX de 25/09/2026', 'PTAX de 25/9', '2026-09-25'),
  o('cambio', '2026-10-09', 4.9892, 'PTAX de 09/10/2026', 'PTAX de 9/10', '2026-10-09'),
  o('cambio', '2026-10-23', 5.0377, 'PTAX de 23/10/2026', 'PTAX de 23/10', '2026-10-23'),
  o('cambio', '2026-11-06', 5.5013, 'PTAX de 06/11/2026', 'PTAX de 6/11', '2026-11-06'),
  o('ipca', '2026-08-31', 4.22, '12 meses até agosto de 2026', '12 meses até ago.', '2026-09-11'),
  o('ipca', '2026-09-30', 4.58, '12 meses até setembro de 2026', '12 meses até set.', '2026-10-09'),
  o('ipca', '2026-10-31', 4.63, '12 meses até outubro de 2026', '12 meses até out.', '2026-11-12'),
  o('pib', '2026-03-31', 2.0, 'quatro trimestres até o 1º trimestre de 2026', '4 trim. até 1º tri/26', '2026-07-08'),   // disponível, no mais tardar, na Carta nº 71
  o('pib', '2026-06-30', 1.9, 'quatro trimestres até o 2º trimestre de 2026', '4 trim. até 2º tri/26', '2026-09-01'),
  o('fbcf', '2026-03-31', -1.4, '1º trimestre de 2026 ante o 1º de 2025', '1º tri/26 ante 1º tri/25', '2026-07-08'),
  o('fbcf', '2026-06-30', 1.4, '2º trimestre de 2026 ante o 2º de 2025', '2º tri/26 ante 2º tri/25', '2026-09-01'),
];

// Edições embutidas no aplicativo: são a reserva para o modo local ou para falha do banco de dados.
// No uso normal, as edições (inclusive estas) vêm das tabelas relatorios, focus_dados e ipea_dados.
export const EDICOES_EMBUTIDAS = [
  { id: FOCUS.edicao, fonte: 'focus', data_referencia: FOCUS.data, data_divulgacao: '2026-10-26', rotulo: FOCUS.dataTxt, situacao: 'carregado',
    metadados: { titulo: FOCUS.titulo, instituicao: FOCUS.instituicao, data: FOCUS.data, dataTxt: FOCUS.dataTxt, url: FOCUS.url, citacao: FOCUS.citacao, nota: FOCUS.nota, anos: FOCUS.anos, periodosMensais: FOCUS.periodosMensais } },
  { id: IPEA.edicao, fonte: 'ipea', data_referencia: '2026-07-08', data_divulgacao: '2026-07-08', rotulo: `nº ${IPEA.numero}, ${IPEA.periodo}`, situacao: 'carregado',
    metadados: { titulo: IPEA.titulo, instituicao: IPEA.instituicao, periodo: IPEA.periodo, publicacao: IPEA.publicacao, url: IPEA.url, citacao: IPEA.citacao, nota: IPEA.nota, temas: IPEA.temas, argumentos: IPEA.argumentos, numero: IPEA.numero, curto: IPEA.curto, curtoNota: IPEA.curtoNota } },
];

// Catálogo de variáveis: liga cada variável aos indicadores publicados e a um roteiro de raciocínio.
// Os "canais" são roteiros didáticos genéricos (não são conclusões das fontes): devem ser adaptados à empresa.
export const VARIAVEIS = [
  { id: 'inflacao', nome: 'Inflação (IPCA)', unidade: '%', focus: 'ipca', ipea: 'ipca', passo: 0.1, min: 0, max: 15,
    sobe: { cliente: 'Perda de poder de compra; maior sensibilidade a preço; antecipação ou adiamento de compras.', vendas: 'Pressão de custos e de repasse; negociações mais longas; risco para margens e volume.' },
    cai: { cliente: 'Recomposição da renda real; maior previsibilidade de orçamento.', vendas: 'Menor pressão por reajustes; espaço para contratos mais longos e planejamento de preços.' } },
  { id: 'juros', nome: 'Taxa de juros (Selic)', unidade: '% a.a.', focus: 'selic', ipea: 'selic', passo: 0.25, min: 2, max: 20,
    sobe: { cliente: 'Crédito mais caro; adiamento de investimentos e de compras financiadas; maior custo de oportunidade.', vendas: 'Ciclo de vendas mais longo; pedidos de prazo e desconto; maior risco de inadimplência.' },
    cai: { cliente: 'Financiamento mais acessível; retomada de projetos e de bens duráveis.', vendas: 'Ciclos mais curtos; maior tíquete financiado; espaço para condições de pagamento competitivas.' } },
  { id: 'pib', nome: 'Atividade econômica (PIB)', unidade: '%', focus: 'pib', ipea: 'pib', passo: 0.1, min: -5, max: 8,
    sobe: { cliente: 'Maior confiança, receita e disposição a investir ou consumir.', vendas: 'Expansão de demanda e de carteira; metas mais ambiciosas; disputa por capacidade de entrega.' },
    cai: { cliente: 'Cautela, cortes de orçamento e priorização do essencial.', vendas: 'Queda de volume; mais concorrência por preço; foco em retenção e em contas resilientes.' } },
  { id: 'cambio', nome: 'Taxa de câmbio (R$/US$)', unidade: 'R$/US$', focus: 'cambio', ipea: 'cambio', passo: 0.05, min: 3, max: 8,
    sobe: { cliente: 'Encarecimento de importados e de insumos dolarizados; ganho para exportadores.', vendas: 'Reajuste de tabelas e contratos indexados; risco de margem em produtos importados.' },
    cai: { cliente: 'Alívio de custos importados; menor receita em reais para exportadores.', vendas: 'Oportunidade de preço em itens importados; pressão competitiva de concorrentes externos.' } },
  { id: 'desemprego', nome: 'Emprego (taxa de desocupação)', unidade: '%', focus: null, ipea: 'desemprego', passo: 0.1, min: 2, max: 16,
    sobe: { cliente: 'Queda da renda e da confiança das famílias; consumo defensivo.', vendas: 'Retração em bens e serviços discricionários; maior inadimplência no varejo.' },
    cai: { cliente: 'Mais renda e segurança para consumir e assumir parcelas.', vendas: 'Demanda sustentada; pressão de custos salariais e disputa por mão de obra.' } },
  { id: 'renda', nome: 'Renda e massa salarial', unidade: '%', focus: null, ipea: 'renda', passo: 0.1, min: -5, max: 12,
    sobe: { cliente: 'Maior capacidade de consumo, sobretudo em serviços e bens de menor dependência de crédito.', vendas: 'Aumento de volume e de tíquete médio; oportunidade de mix de maior valor.' },
    cai: { cliente: 'Orçamento restrito; troca por marcas e opções mais baratas.', vendas: 'Pressão por desconto; queda de tíquete; foco em produtos de entrada.' } },
  { id: 'credito', nome: 'Crédito e endividamento', unidade: '%', focus: null, ipea: 'credito', passo: 0.5, min: -10, max: 30,
    sobe: { cliente: 'Mais acesso a financiamento no curto prazo; maior comprometimento da renda adiante.', vendas: 'Impulso a vendas parceladas; atenção à qualidade da carteira e à inadimplência.' },
    cai: { cliente: 'Restrição de financiamento; compras à vista ou adiadas.', vendas: 'Queda em itens financiados; necessidade de alternativas de pagamento.' } },
  { id: 'consumo', nome: 'Consumo das famílias', unidade: '%', focus: null, ipea: 'consumo', passo: 0.1, min: -5, max: 8,
    sobe: { cliente: 'Maior giro e reposição; consumidor disposto a experimentar.', vendas: 'Crescimento de sell-out; necessidade de estoque e de cobertura de canais.' },
    cai: { cliente: 'Consumo seletivo e sensível a promoções.', vendas: 'Excesso de estoque no canal; campanhas e condições comerciais mais agressivas.' } },
  { id: 'investimento', nome: 'Investimento (FBCF)', unidade: '%', focus: null, ipea: 'fbcf', passo: 0.1, min: -10, max: 12,
    sobe: { cliente: 'Empresas ampliam capacidade e aprovam projetos (CAPEX).', vendas: 'Mais oportunidades B2B de maior valor; pipeline de projetos mais robusto.' },
    cai: { cliente: 'Projetos postergados; preferência por despesas operacionais (OPEX).', vendas: 'Ciclos longos e aprovações mais rígidas; valor de ofertas por assinatura ou serviço.' } },
  { id: 'igpm', nome: 'IGP-M (contratos e aluguéis)', unidade: '%', focus: 'igpm', ipea: null, passo: 0.1, min: -5, max: 20,
    sobe: { cliente: 'Reajustes maiores em contratos indexados e aluguéis.', vendas: 'Renegociações de contratos; oportunidade ou risco conforme o indexador usado.' },
    cai: { cliente: 'Alívio em custos contratuais indexados.', vendas: 'Menor reajuste de receita recorrente indexada ao IGP-M.' } },
  { id: 'outra', nome: 'Outra variável', unidade: '', focus: null, ipea: null, passo: 0.1, min: -100, max: 1000,
    sobe: { cliente: '', vendas: '' }, cai: { cliente: '', vendas: '' } },
];

// ---------- Catálogo ampliado ----------
export const GRUPOS = [
  { id: 'precos', nome: 'Preços' },
  { id: 'juros', nome: 'Juros e crédito' },
  { id: 'atividade', nome: 'Atividade e setores' },
  { id: 'trabalho', nome: 'Trabalho e renda' },
  { id: 'externo', nome: 'Setor externo' },
  { id: 'fiscal', nome: 'Contas públicas' },
  { id: 'mundo', nome: 'Cenário internacional' },
];
const GRUPO_DE = { inflacao: 'precos', igpm: 'precos', juros: 'juros', credito: 'juros', pib: 'atividade', consumo: 'atividade', investimento: 'atividade',
  desemprego: 'trabalho', renda: 'trabalho', cambio: 'externo', outra: 'outra' };
VARIAVEIS.forEach(x => { x.grupo = GRUPO_DE[x.id]; });

const nv = (id, nome, grupo, unidade, o = {}) => ({ id, nome, grupo, unidade, focus: null, ipea: null, passo: 0.1, min: -100, max: 1000,
  sobe: { cliente: '', vendas: '' }, cai: { cliente: '', vendas: '' }, ...o });
const mec = (sc, sv, cc, cv) => ({ sobe: { cliente: sc, vendas: sv }, cai: { cliente: cc, vendas: cv } });
const ATIV = mec('Mais receita e confiança no setor; disposição a investir e contratar.', 'Expansão de demanda dos clientes desse setor; pipeline mais robusto.',
  'Cautela e cortes de orçamento no setor.', 'Queda de volume; foco em retenção e em contas resilientes.');

// Fontes externas: só entram aqui variáveis cuja fonte oficial foi localizada e conferida em 14/11/2026.
const NOVAS = [
  nv('precos_adm', 'Preços administrados (energia, combustíveis, tarifas)', 'precos', '%', { focus: 'ipca_adm', ipea: 'ipca_adm', min: 0, max: 15,
    ...mec('Contas de consumo e transporte mais caras; menos renda livre.', 'Custos operacionais e de frete maiores; pressão sobre margens.', 'Alívio no orçamento de famílias e empresas.', 'Menor pressão de custos logísticos e de energia.') }),
  nv('alimentos', 'Preços de alimentos', 'precos', '%', { ipea: 'alimentos', min: -5, max: 20,
    ...mec('Renda das famílias mais comprometida com o básico.', 'Queda de itens discricionários; troca por opções mais baratas.', 'Sobra de renda para outros gastos.', 'Espaço para recuperação de categorias não essenciais.') }),
  nv('bens_industriais', 'Preços de bens industriais', 'precos', '%', { ipea: 'bens_industriais', min: -5, max: 15 }),
  nv('precos_servicos', 'Preços de serviços', 'precos', '%', { ipea: 'servicos_precos', min: 0, max: 15 }),
  nv('petroleo', 'Petróleo (Brent)', 'precos', 'US$', { ipea: 'petroleo', passo: 1, min: 30, max: 160,
    ...mec('Combustíveis e fretes mais caros; pressão inflacionária.', 'Custos de entrega maiores; reajustes de tabela.', 'Alívio de custos de transporte e energia.', 'Margens logísticas melhores; menos pressão por repasse.') }),
  nv('combustiveis', 'Preços de combustíveis (gasolina, diesel, etanol)', 'precos', 'R$/litro', { externa: true, passo: 0.05, min: 2, max: 12,
    fontes: [{ nome: 'ANP — Preços de combustíveis (levantamento semanal)', url: 'https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos' },
      { nome: 'ANP — Série histórica de preços de combustíveis e de GLP', url: 'https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/serie-historica-de-precos-de-combustiveis' }],
    ...mec('Deslocamento e frete mais caros.', 'Custo de visita, entrega e distribuição maior.', 'Alívio no custo de transporte.', 'Margem logística melhor.') }),
  nv('commodities', 'Commodities (agrícolas, energia e metais)', 'precos', 'US$', { externa: true, passo: 1, min: 0, max: 5000,
    fontes: [{ nome: 'Banco Mundial — Commodity Markets ("Pink Sheet", preços mensais)', url: 'https://www.worldbank.org/en/research/commodity-markets' }],
    ...mec('Insumos mais caros; produtores e exportadores com mais receita.', 'Pressão de custos em quem compra; oportunidade em clientes do agro e da mineração.', 'Alívio de custos de insumos; menor receita de exportadores.', 'Menos pressão por reajuste; cautela em clientes produtores.') }),

  nv('inadimplencia', 'Inadimplência das famílias', 'juros', 'milhões', { ipea: 'inadimplencia', passo: 1, min: 40, max: 120,
    ...mec('Mais consumidores com restrição de crédito.', 'Queda de vendas a prazo; maior risco de carteira.', 'Mais consumidores aptos a comprar a prazo.', 'Retomada de vendas financiadas.') }),
  nv('servico_divida', 'Serviço da dívida das famílias', 'juros', '% a.a.', { ipea: 'servico_divida', passo: 0.5, min: -10, max: 30 }),
  nv('endividamento_familias', 'Endividamento e inadimplência das famílias (PEIC)', 'juros', '%', { externa: true, passo: 0.1, min: 0, max: 100,
    fontes: [{ nome: 'CNC — Observatório do Comércio: Pesquisas CNC (PEIC)', url: 'https://observatorio.portaldocomercio.org.br/dado/pesquisas-cnc/' }],
    ...mec('Mais renda comprometida com dívidas; menos espaço para novas compras a prazo.', 'Queda de vendas financiadas; maior risco de carteira.', 'Mais folga no orçamento das famílias.', 'Retomada de compras parceladas.') }),
  nv('juros_eua', 'Juros dos Estados Unidos (Fed funds)', 'mundo', '% a.a.', { externa: true, passo: 0.25, min: 0, max: 8,
    fontes: [{ nome: 'Federal Reserve — comunicados do FOMC', url: 'https://www.federalreserve.gov/' }],
    ...mec('Dólar mais forte e crédito externo mais caro.', 'Pressão sobre câmbio e sobre custos dolarizados.', 'Mais apetite por emergentes; câmbio mais favorável.', 'Alívio em custos importados e em juros domésticos.') }),

  nv('ibc_br', 'Atividade mensal (IBC-Br)', 'atividade', 'índice', { externa: true, passo: 0.1, min: 50, max: 200,
    fontes: [{ nome: 'Banco Central — IBC-Br (dados abertos, série mensal)', url: 'https://dadosabertos.bcb.gov.br/dataset/24363-indice-de-atividade-economica-do-banco-central---ibc-br' }], ...ATIV }),
  nv('servicos', 'Serviços', 'atividade', '%', { ipea: 'servicos', min: -10, max: 12, ...ATIV }),
  nv('industria', 'Indústria', 'atividade', '%', { ipea: 'industria', min: -10, max: 12, ...ATIV }),
  nv('agro', 'Agropecuária', 'atividade', '%', { ipea: 'agro', min: -10, max: 20, ...ATIV }),
  nv('varejo', 'Varejo (vendas do comércio)', 'atividade', '%', { ipea: 'varejo', min: -10, max: 12, ...ATIV }),
  nv('governo', 'Consumo do governo', 'atividade', '%', { ipea: 'governo', min: -5, max: 8 }),
  nv('confianca_consumidor', 'Confiança do consumidor', 'atividade', 'pontos', { externa: true, passo: 0.5, min: 40, max: 160,
    fontes: [{ nome: 'FecomercioSP — Pesquisas e indicadores (Índice de Confiança do Consumidor)', url: 'https://pesquisas.fecomercio.com.br' }],
    ...mec('Mais disposição para comprar e assumir parcelas.', 'Conversão maior; espaço para mix de maior valor.', 'Consumo defensivo; adiamento de compras.', 'Ciclo mais longo; promoções e condições facilitadas.') }),
  nv('intencao_consumo', 'Intenção de consumo das famílias (ICF)', 'atividade', 'pontos', { externa: true, passo: 0.5, min: 40, max: 160,
    fontes: [{ nome: 'CNC — Pesquisa Intenção de Consumo das Famílias (ICF)', url: 'https://pesquisascnc.com.br/pesquisa-icf/' },
      { nome: 'CNC — Observatório do Comércio: Pesquisas CNC', url: 'https://observatorio.portaldocomercio.org.br/dado/pesquisas-cnc/' }],
    ...mec('Famílias mais satisfeitas com renda e emprego; mais disposição para comprar.', 'Potencial de vendas maior no comércio e nos serviços.', 'Famílias mais cautelosas com emprego e crédito.', 'Vendas mais lentas, sobretudo de bens duráveis.') }),
  nv('veiculos', 'Produção e vendas de veículos', 'atividade', 'mil unidades', { externa: true, passo: 1, min: 0, max: 400,
    fontes: [{ nome: 'Anfavea — Central de dados (estatísticas)', url: 'https://anfavea.com.br/site/central-de-dados/' },
      { nome: 'Anfavea — Carta da Anfavea (boletim mensal)', url: 'https://anfavea.com.br/site/conteudos/carta-da-anfavea/' }], ...ATIV }),
  nv('confianca_industria', 'Confiança do empresário industrial (ICEI)', 'atividade', 'pontos', { externa: true, passo: 0.5, min: 20, max: 80,
    fontes: [{ nome: 'CNI — ICEI: Índice de Confiança do Empresário Industrial (estatísticas mensais)', url: 'https://www.portaldaindustria.com.br/estatisticas/icei-indice-de-confianca-do-empresario-industrial/' }],
    ...mec('Mais projetos aprovados e contratações.', 'Mais oportunidades B2B; decisões mais rápidas.', 'Projetos adiados; orçamentos travados.', 'Ciclos longos; foco em eficiência e redução de custos.') }),

  nv('salario_minimo', 'Salário mínimo', 'trabalho', 'R$', { externa: true, passo: 1, min: 1000, max: 2500,
    fontes: [{ nome: 'Planalto — Decreto nº 12.797/2025 (valor vigente em 2026)', url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12797.htm' }],
    ...mec('Mais renda para famílias de menor renda e beneficiários.', 'Impulso em itens básicos e populares; folha mais cara.', 'Menor ganho de renda na base.', 'Demanda popular mais fraca.') }),

  nv('exportacoes', 'Exportações', 'externo', '%', { ipea: 'exportacoes', min: -15, max: 20,
    ...mec('Exportadores com mais receita e caixa.', 'Oportunidades em clientes exportadores.', 'Menor receita externa dos clientes.', 'Cautela em setores exportadores.') }),
  nv('importacoes', 'Importações', 'externo', '%', { ipea: 'importacoes', min: -15, max: 20 }),
  nv('balanca', 'Balança comercial', 'externo', 'US$ bilhões', { focus: 'balanca', passo: 1, min: -50, max: 150 }),
  nv('conta_corrente', 'Conta corrente', 'externo', 'US$ bilhões', { focus: 'conta_corrente', passo: 1, min: -150, max: 50 }),
  nv('idp', 'Investimento direto no país', 'externo', 'US$ bilhões', { focus: 'idp', passo: 1, min: 0, max: 150 }),

  nv('primario', 'Resultado primário (fiscal)', 'fiscal', '% do PIB', { focus: 'primario', ipea: 'primario', min: -5, max: 5,
    ...mec('Menor risco fiscal; confiança e juros futuros mais baixos.', 'Ambiente de crédito e de investimento mais favorável.', 'Maior risco fiscal; pressão sobre juros e câmbio.', 'Crédito mais caro; clientes mais cautelosos.') }),
  nv('nominal', 'Resultado nominal', 'fiscal', '% do PIB', { focus: 'nominal', min: -15, max: 5 }),
  nv('divida', 'Dívida líquida do setor público', 'fiscal', '% do PIB', { focus: 'divida', passo: 0.5, min: 30, max: 110 }),

  nv('pib_mundial', 'Crescimento da economia mundial', 'mundo', '%', { externa: true, min: -5, max: 8,
    fontes: [{ nome: 'FMI — World Economic Outlook', url: 'https://www.imf.org/en/Publications/WEO' }],
    ...mec('Mais demanda externa e preços de exportação.', 'Oportunidades em clientes ligados ao comércio exterior.', 'Menor demanda externa; aversão a risco.', 'Cautela de multinacionais e exportadores.') }),
];
VARIAVEIS.splice(VARIAVEIS.length - 1, 0, ...NOVAS);
export const variaveisDoGrupo = g => VARIAVEIS.filter(x => x.grupo === g);

export const FONTES_CONSULTA = [
  { n: '01', nome: 'Banco Central do Brasil (BCB)', desc: 'Selic, câmbio, crédito, juros, atividade econômica e estatísticas monetárias.', url: 'https://www.bcb.gov.br/' },
  { n: '02', nome: 'Relatório Focus — Banco Central', desc: 'Expectativas de mercado para IPCA, PIB, Selic, câmbio e outros indicadores.', url: 'https://www.bcb.gov.br/publicacoes/focus', prioritaria: true },
  { n: '03', nome: 'SGS — Séries Temporais do BCB', desc: 'Séries históricas de juros, câmbio, crédito, inflação e outros indicadores.', url: 'https://www3.bcb.gov.br/sgspub/' },
  { n: '04', nome: 'IBGE — Indicadores Econômicos', desc: 'PIB, IPCA, desemprego, indústria, comércio e serviços.', url: 'https://www.ibge.gov.br/indicadores', prioritaria: true },
  { n: '05', nome: 'SIDRA — IBGE', desc: 'Tabelas e séries estatísticas detalhadas do IBGE.', url: 'https://sidra.ibge.gov.br/' },
  { n: '06', nome: 'Ipea — Carta de Conjuntura', desc: 'Análises de atividade, inflação, mercado de trabalho, setor externo e contas públicas.', url: 'https://www.ipea.gov.br/cartadeconjuntura/', prioritaria: true },
  { n: '07', nome: 'Tesouro Nacional / Tesouro Transparente', desc: 'Dívida pública, resultado fiscal, receitas e despesas.', url: 'https://www.tesourotransparente.gov.br/' },
  { n: '08', nome: 'FMI — World Economic Outlook', desc: 'Dados e projeções internacionais de PIB, inflação, desemprego e setor externo.', url: 'https://www.imf.org/en/Publications/WEO', prioritaria: true },
  { n: '09', nome: 'Banco Mundial — Data', desc: 'Indicadores econômicos, sociais e institucionais de diversos países.', url: 'https://data.worldbank.org/' },
  { n: '10', nome: 'FGV IBRE', desc: 'Índices de confiança, IGP-M, sondagens empresariais e indicadores antecedentes.', url: 'https://portalibre.fgv.br/', prioritaria: true },
  { n: '11', nome: 'CNI — Confederação Nacional da Indústria', desc: 'Indicadores industriais, confiança, produção e expectativas.', url: 'https://www.portaldaindustria.com.br/cni/' },
  { n: '12', nome: 'FecomercioSP', desc: 'Pesquisas sobre comércio, consumo, confiança e conjuntura.', url: 'https://www.fecomercio.com.br/' },
  { n: '13', nome: 'Trading Economics — Brasil', desc: 'Painéis de indicadores macroeconômicos brasileiros e internacionais.', url: 'https://tradingeconomics.com/brazil/indicators' },
];

export const fmt = (n, casas = 2) => (n === null || n === undefined || Number.isNaN(n)) ? '—'
  : Number(n).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

// Formata um valor com a sua unidade no padrão brasileiro: 13,25% a.a.; R$ 5,05/US$; US$ 80,00 bilhões.
export function comUnidade(n, unidade = '', casas = 2) {
  const v = fmt(n, casas), u = String(unidade || '').trim();
  if (!u) return v;
  if (/^varia/i.test(u)) return `${v}%`;
  if (u.startsWith('%')) return `${v}${u}`;
  if (u === 'R$/US$') return `R$ ${v}/US$`;
  if (/^(R\$|US\$)/.test(u)) { const [moeda, ...resto] = u.split(' '); return `${moeda} ${v}${resto.length ? ' ' + resto.join(' ') : ''}`; }
  return `${v} ${u}`;
}
const casasDe = n => (Number.isInteger(n) ? 0 : (String(n).split('.')[1]?.length || 1));
// Taxas em % sempre com ao menos uma casa decimal (2,0% e não 2%).
export const valorIpea = r => comUnidade(r.valor, r.unidade, String(r.unidade || '').startsWith('%') ? Math.max(1, casasDe(r.valor)) : casasDe(r.valor));

// Referências publicadas para uma variável do catálogo (Focus e Ipea), usadas no simulador de cenários.
export function referenciasPublicadas(varId) {
  const v = VARIAVEIS.find(x => x.id === varId);
  if (!v) return [];
  const out = [];
  if (v.focus) {
    const linha = FOCUS.anual.find(x => x.id === v.focus);
    for (const ano of FOCUS.anos.slice(0, 2)) {
      const c = linha?.v[ano];
      if (c) out.push({ valor: c.hoje, casas: linha.casas ?? 2, rotulo: `Focus ${ano}`, fonte: `Focus (BCB), ${FOCUS.dataTxt}`, periodo: `fim de ${ano}`, origem: 'focus' });
    }
  }
  if (v.ipea) {
    for (const r of IPEA.registros.filter(x => x.chave === v.ipea)) {
      out.push({ valor: r.valor, casas: casasDe(r.valor), rotulo: r.ano ? `Ipea ${r.ano}` : `Ipea · ${r.indicador}`, fonte: `${IPEA.curto} (Ipea), p. ${r.pagina}`, periodo: r.periodo, origem: 'ipea', natureza: r.natureza, indicador: r.indicador });
    }
  }
  return out;
}
