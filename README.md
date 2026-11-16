# Estudo de Caso 2 — Cenários Econômicos e Estratégias de Vendas

Aplicativo guiado para a execução individual do Estudo de Caso 2 da disciplina *Cenários Econômicos em Vendas* (MBA Gestão Comercial e SalesTech, aula de 14/11/2026). O aluno percorre as cinco seções do roteiro e, ao final, obtém a apresentação de cinco slides exigida na entrega.

## O que o aplicativo faz

| Etapa | Seção do roteiro | Recursos |
|---|---|---|
| 1 | Diagnóstico do negócio e exposição macroeconômica | Seleção das variáveis prioritárias e da sensibilidade do negócio a cada uma |
| 2 | Evidências econômicas | Explorador do Relatório Focus e da Carta de Conjuntura; registro automático de dado, natureza, fonte, data e período |
| 3 | Arquitetura de cenários (12 meses) | Trajetórias base, favorável e adversa; distinção automática entre valor publicado e hipótese do autor |
| 4 | Impactos comerciais | Matriz de impactos, cadeia variável → cliente → vendas e simulador de sensibilidade da receita |
| 5 | Recomendações | Decisões comerciais com cenário(s) de aplicação, síntese executiva e validação da entrega |
| Entrega | Slides | Cinco slides gerados a partir do caso (texto resumido), dez temas personalizáveis (o participante pode salvar temas próprios com nome), modo de apresentação, exportação em PPTX e PDF |
| Entrega | Relatório | Os quadros 01 a 05 do roteiro com o texto completo das etapas, referências geradas a partir das edições usadas, exportação em Word (.docx) e PDF |

A tela **Entrega: slides ou relatório** deixa o participante escolher o formato; os dois saem do mesmo caso. O relatório tem aparência fixa (tabelas do material da disciplina) e não usa o tema visual. Campos vazios saem como linhas em branco. O slide 5 traz as três primeiras decisões e avisa quantas outras estão no relatório.

Nas etapas, cada campo de texto mostra a contagem de caracteres e um **aviso de espaço**: se o texto cabe, fica apertado ou não cabe no slide em que aparece. O aviso usa o mesmo cálculo de encaixe dos slides (tema e número de variáveis atuais) e pode ser desligado. Quando o texto não cabe, o participante pode escrever ali mesmo uma **versão curta só para o slide**; o relatório continua com o texto completo.

Não há uso de inteligência artificial: os textos analíticos são sempre do aluno. Os "roteiros de raciocínio" são sugestões didáticas genéricas e estão identificados como tal.

## Dados de referência

Os dados vêm dos relatórios de apoio da atividade e são organizados em **edições**: cada Relatório Focus e cada Carta de Conjuntura carregados formam uma edição, guardada no Supabase (tabelas `relatorios`, `focus_dados` e `ipea_dados`). Edições carregadas:

- BANCO CENTRAL DO BRASIL. *Focus – Relatório de Mercado*: expectativas de mercado. Brasília: BCB, 23 out. 2026.
- BANCO CENTRAL DO BRASIL. *Focus – Relatório de Mercado*: expectativas de mercado. Brasília: BCB, 6 nov. 2026.
- BANCO CENTRAL DO BRASIL. *Focus – Relatório de Mercado*: expectativas de mercado. Brasília: BCB, 13 nov. 2026.
- SANTOS, Claudio Hamilton Matos dos; AMITRANO, Cláudio Roberto; ARAUJO, Mônica Mora y. Visão geral da conjuntura. *Carta de Conjuntura*, Brasília: Ipea, n. 71, Nota de Conjuntura 24, 2º trim. 2026.

Cada caso usa uma edição de cada relatório. Casos novos começam na mais recente; casos em andamento ficam na edição em que começaram e recebem um aviso quando sai outra. Cada registro do Ipea traz a página de origem. Os valores devem ser conferidos no documento original antes de serem citados.

### Carregar um relatório novo

Não exige nova publicação do site:

1. Transcrever o relatório em `supabase/edicoes/<id>.json` (mesmo formato de `focus-2026-11-06.json`), conferindo os números contra o PDF.
   - Na Carta do Ipea, só ligue um registro a uma variável (`chave`) se ele estiver na mesma unidade dela; projeção ligada a variável precisa de `ano`; o mesmo `id` entre edições só vale para o mesmo indicador. As regras e o motivo estão em `docs/conferencia-dados.md`.
   - `npm run conferir` precisa terminar sem erros antes de qualquer carga no banco.
2. `node scripts/gerar-edicoes.mjs <id>` gera o SQL da edição; executá-lo no Supabase.
3. `npm run edicoes` atualiza `supabase/edicoes.sql` (todas as edições), para manter o repositório em dia.

### Dados observados ("onde está hoje")

O quadro de cada variável compara a projeção com o último valor medido (Selic, PTAX, IPCA em 12 meses, PIB e FBCF), na data da edição do relatório em uso no caso. Esses valores ficam na tabela `observados` (migração `005_observados.sql`), com cópia embutida em `OBSERVADOS` (`site/js/refdata.js`), usada no modo local ou enquanto a tabela não existir.

Para carregar um valor novo: acrescente a linha em `OBSERVADOS`, rode `npm run conferir` e `npm run observados` (atualiza `supabase/observados.sql`) e execute esse SQL no banco. Séries diárias (Selic e PTAX) precisam também do valor de quatro semanas antes da data da edição, que é a janela de comparação.

A edição de 23/10/2026 e a Carta nº 71 também ficam em `site/js/refdata.js`, como reserva para o modo local ou para falha do banco. As tabelas `fontes_referencia`, `focus_expectativas` e `ipea_indicadores` (e `supabase/seed.sql`) pertencem à versão anterior do site e deixam de ser lidas pela versão atual.

## Arquitetura

- **Front-end** (`site/`): HTML, CSS e JavaScript em módulos, sem etapa de build e sem dependências de CDN. O PptxGenJS (licença MIT) está em `site/vendor/`. O arquivo do Word é montado no navegador por `site/js/relatorio.js` e `site/js/zip.js`, sem biblioteca externa.
- **Supabase** (`supabase/`): autenticação por e-mail e senha, um caso por aluno protegido por RLS, tabelas de referência somente leitura e a função `cadastro`, que cria a conta mediante o código da turma.
- **Netlify** (`netlify.toml`): publica a pasta `site` e define os cabeçalhos de segurança.

Com `site/js/config.js` vazio, o aplicativo roda em **modo local**: sem login, com os dados salvos apenas no navegador.

## Implantação

1. **Supabase**: aplicar `supabase/migrations/001_esquema.sql`, `002_admin.sql`, `003_edicoes.sql`, `004_permissoes.sql` e `005_observados.sql`, e depois `supabase/edicoes.sql` e `supabase/observados.sql`; publicar a função `supabase/functions/cadastro` com `verify_jwt = false`; cadastrar um código da turma:
   ```sql
   insert into public.codigos_turma (codigo) values ('ESCOLHA-UM-CODIGO');
   ```
2. **Configuração**: preencher `SUPABASE_URL` e `SUPABASE_KEY` (chave *publishable*) em `site/js/config.js`. Essa chave é pública por definição; a proteção dos dados vem das políticas de RLS.
3. **Netlify**: vincular este repositório; diretório de publicação `site`, sem comando de build.

## Painel do administrador

Quem estiver na tabela `public.administradores` vê o menu **Admin**: contas criadas, progresso da entrega, último acesso e as escolhas de tema de cada participante. O conteúdo dos casos não é exposto. Para tornar um usuário administrador:

```sql
insert into public.administradores (user_id) select id from auth.users where email = 'EMAIL-DO-ADMINISTRADOR';
```

## Desenvolvimento

```bash
npm run dev   # serve a pasta site em http://127.0.0.1:8765
```
