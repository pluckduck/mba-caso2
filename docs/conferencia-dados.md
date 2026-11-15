# Conferência dos dados de referência — 15/11/2026

## O que motivou

Na etapa 3, a variável "Taxa de câmbio (R$/US$)" passou a oferecer a referência "Ipea · Depreciação cambial: 2,5". O número existe na Carta de Conjuntura nº 72 (p. 24), mas é um percentual observado (o real perdeu 2,5% entre maio e agosto de 2026), não uma cotação nem uma projeção. Ele foi carregado ligado à variável de câmbio, e o aplicativo listava como referência tudo o que estivesse ligado à variável, sem olhar a unidade.

## O que foi conferido

| Conjunto | Como | Resultado |
|---|---|---|
| Cartas nº 70, 71 e 72 (130 registros) | cada valor procurado na página indicada do PDF | todos localizados |
| Focus de 23/10 e de 06/11/2026 (119 linhas) | sequência "há 4 semanas, há 1 semana, hoje" procurada no PDF | todas localizadas |
| Registros ligados a variáveis (campo `chave`) | unidade do registro contra a unidade da variável | 5 incompatíveis |
| Mesmo `id` em edições diferentes | nome do indicador e unidade | 2 ids medindo coisas diferentes |
| Dado sugerido automaticamente | qual registro o aplicativo escolhe para cada variável sem Focus | 1 variável recebia valor em outra unidade |
| Quadro "hoje, projeção e revisão" | se a projeção e o dado de hoje são a mesma medida | 1 comparação indevida no código |
| Casos já gravados no banco | uso dos registros incompatíveis | nenhum caso afetado |

## Achados e correções

1. **Percentual ligado à variável de câmbio.** "Depreciação cambial: 2,5%" (Carta nº 72) e "Valorização do real: 4%" (Carta nº 71) apareciam como referência em R$/US$. Correção: os dois registros deixaram de estar ligados à variável; continuam na lista de dados da Carta.
2. **Valor em reais ligado a variável em percentual.** "Massa salarial" em R$ bilhões (Cartas nº 70, 71 e 72) estava ligada a "Renda e massa salarial", que é em %. Além de aparecer como referência, era o dado sugerido automaticamente para essa variável. Correção: desligada da variável; a sugestão passa a ser a variação percentual da massa salarial.
3. **Mesmo `id`, medidas diferentes.** `primario_2026` era "governo central" na Carta nº 70 e "setor público" nas nº 71 e 72: a revisão da projeção compararia indicadores diferentes. `renda_disponivel` era crescimento desde set/2024 na nº 71 e alta em 12 meses na nº 72. Correção: os registros divergentes ganharam ids próprios (`primario_gc_2026` na nº 70 e `rndbf_12m` na nº 72).
4. **Comparação entre medidas diferentes no quadro.** A projeção mensal do IPCA (variação no mês) seria comparada com o IPCA acumulado em 12 meses. Correção no código: variações acumuladas (IPCA, PIB, FBCF) só são comparadas com projeções para o ano inteiro; taxas e cotações (Selic, câmbio) valem para qualquer período.
5. **Seta para diferença que arredonda para zero.** Uma diferença menor que a precisão exibida gerava seta com "+R$ 0,00". Correção: passa a ser tratada como estabilidade.
6. **Câmbio sem valor de quatro semanas antes na data da Carta nº 72.** Incluída a PTAX de 17/09/2026 (R$ 5,1521).

## Como evitar que se repita

### Regras para ligar um registro a uma variável (`chave`)

- Só ligue se o registro estiver na **mesma unidade** da variável (% com %, R$/US$ com R$/US$).
- **Projeção** ligada a variável precisa do campo `ano`.
- Dado de contexto (variação num intervalo, valor em outra unidade, efeito estimado) fica **sem `chave`**: aparece na lista da Carta, mas não como referência da variável.
- O mesmo `id` em edições diferentes só vale para o **mesmo indicador**. Se a medida mudou, use outro `id`.

### Verificador automático

`npm run conferir` (`scripts/conferir-dados.mjs`) aplica essas regras a todas as edições e aos valores observados, e termina com erro se alguma for violada. **Deve passar antes de qualquer carga no banco.** Ele também avisa quando falta um valor observado, ou o valor de comparação, na data de uma edição.

### Proteção no código

Mesmo que um registro incompatível seja carregado, o aplicativo deixa de usá-lo: referências da etapa 3, opções de dado e dado sugerido passam por `registrosIpeaDe`, que exige unidade compatível. A revisão de projeções do Ipea só compara registros com o mesmo nome de indicador.

### Conferência contra o PDF

Depois de transcrever uma edição, procure cada valor na página indicada do PDF (foi o que se fez aqui, com `pdftotext`). Essa etapa ainda é manual: o verificador automático não lê os PDFs.

## Limitações que permanecem

- **Dados observados só para Selic, câmbio, IPCA, PIB e FBCF.** As demais variáveis mostram traço em "Onde está hoje".
- **Datas das Cartas nº 70 e nº 71 sem dados observados de Selic, câmbio e IPCA.** Só afeta quem escolher uma dessas Cartas e um dado delas para essas variáveis.
- **FBCF de hoje e projeção não são exatamente a mesma medida.** O dado observado é o trimestre contra o mesmo trimestre do ano anterior; a projeção é o crescimento do ano. A comparação é aproximada e a legenda informa a medida.
- **Medidas mensais do Ipea como referência.** Variações mensais (indústria, varejo, serviços) continuam listadas como referência para variáveis em %, identificadas pelo nome do indicador e pelo período.
- **PTAX de 06/11/2026 (R$ 5,5013)** veio de uma única fonte jornalística, coerente com os fechamentos vizinhos; vale confirmar na série do Banco Central.
