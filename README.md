# Estudo de Caso 2 — Cenários Econômicos e Estratégias de Vendas

Aplicativo guiado para a execução individual do Estudo de Caso 2 da disciplina *Cenários Econômicos em Vendas* (MBA Gestão Comercial e SalesTech, aula de 14/11/2026). O aluno percorre as cinco seções do roteiro e, ao final, obtém a apresentação de cinco slides exigida na entrega.

## O que o aplicativo faz

| Etapa | Seção do roteiro | Recursos |
|---|---|---|
| 1 | Diagnóstico do negócio e exposição macroeconômica | Seleção das variáveis prioritárias e da sensibilidade do negócio a cada uma |
| 2 | Evidências econômicas | Explorador do Relatório Focus e da Carta de Conjuntura; registro automático de dado, natureza, fonte, data e período |
| 3 | Arquitetura de cenários (12 meses) | Trajetórias base, favorável e adversa; distinção automática entre valor publicado e hipótese do autor |
| 4 | Impactos comerciais | Matriz de impactos, cadeia variável → cliente → vendas e simulador de sensibilidade da receita |
| 5 | Recomendações | Decisões comerciais, síntese executiva e validação da entrega |
| Slides | Entrega | Cinco slides gerados a partir do caso, dez temas personalizáveis (o participante pode salvar temas próprios com nome), modo de apresentação, exportação em PPTX e PDF |

Não há uso de inteligência artificial: os textos analíticos são sempre do aluno. Os "roteiros de raciocínio" são sugestões didáticas genéricas e estão identificados como tal.

## Dados de referência

Os dados foram transcritos dos dois arquivos de apoio da atividade e ficam em `site/js/refdata.js` (fonte única):

- BANCO CENTRAL DO BRASIL. *Focus – Relatório de Mercado*: expectativas de mercado. Brasília: BCB, 23 out. 2026.
- SANTOS, Claudio Hamilton Matos dos; AMITRANO, Cláudio Roberto; ARAUJO, Mônica Mora y. Visão geral da conjuntura. *Carta de Conjuntura*, Brasília: Ipea, n. 71, Nota de Conjuntura 24, 2º trim. 2026.

`npm run seed` gera `supabase/seed.sql` a partir desse arquivo. Cada registro do Ipea traz a página de origem. Os valores devem ser conferidos no documento original antes de serem citados.

## Arquitetura

- **Front-end** (`site/`): HTML, CSS e JavaScript em módulos, sem etapa de build e sem dependências de CDN. O PptxGenJS (licença MIT) está em `site/vendor/`.
- **Supabase** (`supabase/`): autenticação por e-mail e senha, um caso por aluno protegido por RLS, tabelas de referência somente leitura e a função `cadastro`, que cria a conta mediante o código da turma.
- **Netlify** (`netlify.toml`): publica a pasta `site` e define os cabeçalhos de segurança.

Com `site/js/config.js` vazio, o aplicativo roda em **modo local**: sem login, com os dados salvos apenas no navegador.

## Implantação

1. **Supabase**: aplicar `supabase/migrations/001_esquema.sql`, `supabase/migrations/002_admin.sql` e `supabase/seed.sql`; publicar a função `supabase/functions/cadastro` com `verify_jwt = false`; cadastrar um código da turma:
   ```sql
   insert into public.codigos_turma (codigo) values ('ESCOLHA-UM-CODIGO');
   ```
2. **Configuração**: preencher `SUPABASE_URL` e `SUPABASE_KEY` (chave *publishable*) em `site/js/config.js`. Essa chave é pública por definição; a proteção dos dados vem das políticas de RLS.
3. **Netlify**: vincular este repositório; diretório de publicação `site`, sem comando de build.

## Painel do administrador

Quem estiver na tabela `public.administradores` vê o menu **Turma**: contas criadas, progresso da entrega, último acesso e as escolhas de tema de cada participante. O conteúdo dos casos não é exposto. Para tornar um usuário administrador:

```sql
insert into public.administradores (user_id) select id from auth.users where email = 'EMAIL-DO-ADMINISTRADOR';
```

## Desenvolvimento

```bash
npm run dev   # serve a pasta site em http://127.0.0.1:8765
```
