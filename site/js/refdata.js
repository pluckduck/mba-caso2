// Dados de referência do Estudo de Caso 2, transcritos dos arquivos de apoio da aula de 14/11/2026.
// Fonte única: este arquivo alimenta o aplicativo e gera o seed do Supabase (scripts/gerar-seed.mjs).

const a = (h4, h1, hoje, comp, sem, resp, d5 = null, resp5 = null) => ({ h4, h1, hoje, comp, sem, resp, d5, resp5 });

export const FOCUS = {
  id: 'focus',
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
  titulo: 'Carta de Conjuntura nº 71 — Nota de Conjuntura 24 — Visão geral da conjuntura',
  instituicao: 'Instituto de Pesquisa Econômica Aplicada (Ipea)',
  periodo: '2º trimestre de 2026',
  publicacao: 'junho de 2026',
  url: 'https://www.ipea.gov.br/cartadeconjuntura/',
  citacao: 'SANTOS, Claudio Hamilton Matos dos; AMITRANO, Cláudio Roberto; ARAUJO, Mônica Mora y. Visão geral da conjuntura. Carta de Conjuntura, Brasília: Ipea, n. 71, Nota de Conjuntura 24, 2º trim. 2026.',
  nota: 'A capa do arquivo indica divulgação em 08/06/2026, mas o texto menciona fatos de até o fim de junho de 2026 (Copom de 16–17/06 e Focus de 26/06). Ao citar, use "2º trimestre de 2026" como período de referência.',
  temas: ['Atividade', 'Projeções PIB', 'Preços', 'Juros e câmbio', 'Trabalho e renda', 'Crédito e famílias', 'Fiscal', 'Setor externo'],
  registros: [
    // Atividade (observado)
    { id: 'pib_1t26_aa', tema: 'Atividade', indicador: 'PIB — 1º tri/2026 ante 1º tri/2025', valor: 1.8, unidade: '%', periodo: '1º trimestre de 2026', natureza: OBS, pagina: 1, nota: 'Crescimento liderado pela agropecuária (oferta) e por consumo das famílias e FBCF (demanda).' },
    { id: 'pib_1t26_margem', tema: 'Atividade', indicador: 'PIB — 1º tri/2026 ante 4º tri/2025 (dessazonalizado)', valor: 1.1, unidade: '%', periodo: '1º trimestre de 2026', natureza: OBS, pagina: 1, nota: 'Acima da previsão anterior do Ipea (0,8%).' },
    { id: 'pib_4tri', tema: 'Atividade', indicador: 'PIB — acumulado em quatro trimestres', valor: 2.0, unidade: '%', periodo: 'até o 1º trimestre de 2026', natureza: OBS, pagina: 26, nota: 'Desaceleração ante 2,3% no período anterior.' },
    { id: 'carry_2026', tema: 'Atividade', indicador: 'Carry-over (carregamento estatístico) para 2026', valor: 1.4, unidade: '%', periodo: '2026', natureza: OBS, pagina: 26, nota: 'Era de 0,2% antes do resultado do 1º trimestre.' },
    { id: 'pim_mai26', tema: 'Atividade', indicador: 'Produção industrial (PIM-PF) — variação na margem', valor: -0.2, unidade: '%', periodo: 'maio de 2026', natureza: OBS, pagina: 16, nota: 'Interrompe quatro meses de alta (ganho acumulado de 4,3%); 16 dos 25 ramos avançaram.' },
    { id: 'pmc_abr26_restrito', tema: 'Atividade', indicador: 'Varejo restrito (PMC) — variação na margem', valor: -1.5, unidade: '%', periodo: 'abril de 2026', natureza: OBS, pagina: 16, nota: 'Série dessazonalizada.' },
    { id: 'pmc_abr26_ampliado', tema: 'Atividade', indicador: 'Varejo ampliado (PMC) — variação na margem', valor: -0.7, unidade: '%', periodo: 'abril de 2026', natureza: OBS, pagina: 16, nota: 'Série dessazonalizada.' },
    { id: 'pms_abr26_margem', tema: 'Atividade', indicador: 'Volume de serviços (PMS) — variação na margem', valor: 1.2, unidade: '%', periodo: 'abril de 2026', natureza: OBS, pagina: 17, nota: 'Recupera a perda de março (-1,1%); avanço disseminado.' },
    { id: 'pms_abr26_aa', tema: 'Atividade', indicador: 'Volume de serviços (PMS) — variação interanual', valor: 1.9, unidade: '%', periodo: 'abril de 2026', natureza: OBS, pagina: 17, nota: '25ª taxa interanual positiva consecutiva.' },

    // Projeções do PIB e componentes (Tabela 5.1)
    { id: 'pib_2026', tema: 'Projeções PIB', indicador: 'PIB', valor: 2.3, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Revisado de 1,8% para 2,3%. Observado: 3,4% (2024) e 2,3% (2025).', chave: 'pib', ano: 2026 },
    { id: 'pib_2027', tema: 'Projeções PIB', indicador: 'PIB', valor: 2.0, unidade: '%', periodo: '2027', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Ritmo mais moderado; carry-over de 0,8% para 2027.', chave: 'pib', ano: 2027 },
    { id: 'pib_2t26', tema: 'Projeções PIB', indicador: 'PIB — 2º tri/2026 ante trimestre anterior (dessaz.)', valor: 0.5, unidade: '%', periodo: '2º trimestre de 2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Alta de 2,0% ante o 2º tri/2025.' },
    { id: 'serv_2026', tema: 'Projeções PIB', indicador: 'Serviços', valor: 2.4, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 2,0%. Sustentado por emprego e massa salarial.', chave: 'servicos', ano: 2026 },
    { id: 'ind_2026', tema: 'Projeções PIB', indicador: 'Indústria', valor: 2.0, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 1,9%. Extrativa forte; transformação contida pelo custo do crédito.', chave: 'industria', ano: 2026 },
    { id: 'agro_2026', tema: 'Projeções PIB', indicador: 'Agropecuária', valor: 1.8, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 2,0%. Observado em 2025: 11,7%.', chave: 'agro', ano: 2026 },
    { id: 'consumo_2026', tema: 'Projeções PIB', indicador: 'Consumo das famílias', valor: 1.9, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Observado: 5,1% (2024) e 1,3% (2025).', chave: 'consumo', ano: 2026 },
    { id: 'consumo_2027', tema: 'Projeções PIB', indicador: 'Consumo das famílias', valor: 1.7, unidade: '%', periodo: '2027', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1.', chave: 'consumo', ano: 2027 },
    { id: 'governo_2026', tema: 'Projeções PIB', indicador: 'Consumo do governo', valor: 1.8, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 2,0%.' },
    { id: 'fbcf_2026', tema: 'Projeções PIB', indicador: 'Investimento (FBCF)', valor: 1.2, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Revisado de queda para alta; núcleo sensível a juros segue contido.', chave: 'fbcf', ano: 2026 },
    { id: 'fbcf_2027', tema: 'Projeções PIB', indicador: 'Investimento (FBCF)', valor: 3.1, unidade: '%', periodo: '2027', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Efeitos defasados da flexibilização monetária.', chave: 'fbcf', ano: 2027 },
    { id: 'export_2026', tema: 'Projeções PIB', indicador: 'Exportações de bens e serviços', valor: 4.5, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 2,7%.' },
    { id: 'import_2026', tema: 'Projeções PIB', indicador: 'Importações de bens e serviços', valor: 3.3, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 29, nota: 'Tabela 5.1. Projeção para 2027: 4,0%.' },

    // Preços
    { id: 'ipca_12m_fev26', tema: 'Preços', indicador: 'IPCA — acumulado em 12 meses', valor: 3.8, unidade: '%', periodo: 'fevereiro de 2026', natureza: OBS, pagina: 7, nota: 'Ponto de partida antes do choque de oferta.' },
    { id: 'ipca_12m_mai26', tema: 'Preços', indicador: 'IPCA — acumulado em 12 meses', valor: 4.7, unidade: '%', periodo: 'maio de 2026', natureza: OBS, pagina: 7, nota: 'Acima do limite superior da meta de inflação (4,5%).' },
    { id: 'ipca_2026', tema: 'Preços', indicador: 'IPCA', valor: 5.3, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 31, nota: 'Tabela 5.3. Projeção anterior (março/2026): 4,2%.', chave: 'ipca', ano: 2026 },
    { id: 'ipca_alim_2026', tema: 'Preços', indicador: 'IPCA — alimentos no domicílio', valor: 7.3, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 31, nota: 'Tabela 5.3. Projeção anterior: 3,9%. Contribuição de 1,2 p.p. para o IPCA.' },
    { id: 'ipca_ind_2026', tema: 'Preços', indicador: 'IPCA — bens industriais', valor: 3.6, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 31, nota: 'Tabela 5.3. Projeção anterior: 2,6%. Contribuição de 0,8 p.p.' },
    { id: 'ipca_serv_2026', tema: 'Preços', indicador: 'IPCA — serviços (totais)', valor: 5.8, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 31, nota: 'Tabela 5.3. Projeção anterior: 5,5%. Contribuição de 2,1 p.p.' },
    { id: 'ipca_adm_2026', tema: 'Preços', indicador: 'IPCA — preços administrados', valor: 4.8, unidade: '%', periodo: '2026', natureza: PROJ, pagina: 31, nota: 'Tabela 5.3. Projeção anterior: 4,3%. Contribuição de 1,2 p.p.' },
    { id: 'brent', tema: 'Preços', indicador: 'Petróleo Brent — preço do barril', valor: 75, unidade: 'US$', periodo: 'fim de junho de 2026', natureza: OBS, pagina: 30, nota: 'Cerca de US$ 72 no fim de fevereiro; acima de US$ 130 no início de abril; próximo de US$ 100 até meados de maio.' },

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
    { id: 'servico_divida', tema: 'Crédito e famílias', indicador: 'Despesas das famílias com serviço da dívida — crescimento real', valor: 10, unidade: '% a.a.', periodo: 'desde setembro de 2024', natureza: OBS, pagina: 6, nota: 'Valor aproximado ("perto de 10% ao ano"). A renda líquida do serviço da dívida ainda cresce 1,8% a.a.' },
    { id: 'inadimplentes', tema: 'Crédito e famílias', indicador: 'Brasileiros inadimplentes (Serasa Experian)', valor: 83, unidade: 'milhões', periodo: 'maio de 2026', natureza: OBS, pagina: 4, nota: 'Contexto do Novo Desenrola (MP nº 1.355/2026), que já beneficiou mais de 6 milhões de pessoas.' },

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
export const valorIpea = r => comUnidade(r.valor, r.unidade, casasDe(r.valor));

// Referências publicadas para uma variável do catálogo (Focus e Ipea), usadas no simulador de cenários.
export function referenciasPublicadas(varId) {
  const v = VARIAVEIS.find(x => x.id === varId);
  if (!v) return [];
  const out = [];
  if (v.focus) {
    const linha = FOCUS.anual.find(x => x.id === v.focus);
    for (const ano of [2026, 2027]) {
      const c = linha?.v[ano];
      if (c) out.push({ valor: c.hoje, rotulo: `Focus ${ano}`, fonte: `Focus (BCB), ${FOCUS.dataTxt}`, periodo: `fim de ${ano}`, origem: 'focus' });
    }
  }
  if (v.ipea) {
    for (const r of IPEA.registros.filter(x => x.chave === v.ipea)) {
      out.push({ valor: r.valor, rotulo: `Ipea ${r.ano || ''}`.trim() + (r.ano ? '' : ` · ${r.indicador.split('—')[0].trim()}`), fonte: `Carta de Conjuntura nº 71 (Ipea), p. ${r.pagina}`, periodo: r.periodo, origem: 'ipea', natureza: r.natureza, indicador: r.indicador });
    }
  }
  return out;
}
