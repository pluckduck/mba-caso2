-- Edições dos relatórios de referência (Focus e Carta de Conjuntura do Ipea).
-- Cada relatório carregado é uma edição; os números ficam ligados a ela. Carregar um relatório novo é
-- inserir uma linha em "relatorios" e as linhas de dados correspondentes (ver supabase/edicoes.sql).
-- As tabelas antigas (fontes_referencia, focus_expectativas, ipea_indicadores) permanecem intactas
-- para a versão anterior do site continuar funcionando até a nova ser publicada.

create table if not exists public.relatorios (
  id text primary key,
  fonte text not null check (fonte in ('focus', 'ipea')),
  data_referencia date not null,
  data_divulgacao date,
  rotulo text not null,
  situacao text not null default 'carregado' check (situacao in ('carregado', 'previsto')),
  metadados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);
comment on table public.relatorios is 'Edições dos relatórios de referência. situacao = previsto marca edições ainda sem dados (usadas só no calendário do administrador).';
comment on column public.relatorios.data_referencia is 'Focus: data do relatório (sexta-feira de referência). Ipea: data de divulgação, ou estimativa quando previsto.';

create table if not exists public.focus_dados (
  id bigint generated always as identity primary key,
  relatorio_id text not null references public.relatorios (id) on delete cascade,
  ordem integer not null,
  tipo text not null check (tipo in ('anual', 'mensal')),
  indicador_id text not null,
  indicador text not null,
  unidade text not null,
  periodo text not null,
  ha_4_semanas numeric,
  ha_1_semana numeric,
  hoje numeric not null,
  comportamento text not null check (comportamento in ('alta', 'queda', 'estavel')),
  semanas integer,
  respondentes integer,
  cinco_dias numeric,
  respondentes_5d integer,
  unique (relatorio_id, tipo, indicador_id, periodo)
);
create index if not exists focus_dados_relatorio on public.focus_dados (relatorio_id, ordem);

create table if not exists public.ipea_dados (
  relatorio_id text not null references public.relatorios (id) on delete cascade,
  id text not null,
  ordem integer not null,
  tema text not null,
  indicador text not null,
  valor numeric not null,
  unidade text not null,
  periodo text not null,
  natureza text not null,
  pagina integer not null,
  nota text,
  chave text,
  ano integer,
  primary key (relatorio_id, id)
);

alter table public.relatorios enable row level security;
alter table public.focus_dados enable row level security;
alter table public.ipea_dados enable row level security;
drop policy if exists relatorios_leitura on public.relatorios;
drop policy if exists focus_dados_leitura on public.focus_dados;
drop policy if exists ipea_dados_leitura on public.ipea_dados;
create policy relatorios_leitura on public.relatorios for select to anon, authenticated using (true);
create policy focus_dados_leitura on public.focus_dados for select to anon, authenticated using (true);
create policy ipea_dados_leitura on public.ipea_dados for select to anon, authenticated using (true);
revoke all on public.relatorios, public.focus_dados, public.ipea_dados from anon, authenticated;
grant select on public.relatorios, public.focus_dados, public.ipea_dados to anon, authenticated;
