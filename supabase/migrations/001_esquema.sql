-- Estudo de Caso 2 — esquema do banco de dados.
-- Cada aluno enxerga e altera somente o próprio caso (RLS). Os dados de referência são somente leitura.

create table if not exists public.casos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  dados jsonb not null default '{}'::jsonb,
  tema jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
comment on table public.casos is 'Um caso por aluno: respostas do roteiro (dados) e tema visual escolhido (tema).';

alter table public.casos enable row level security;
create policy casos_ler_proprio on public.casos for select to authenticated using ((select auth.uid()) = user_id);
create policy casos_criar_proprio on public.casos for insert to authenticated with check ((select auth.uid()) = user_id);
create policy casos_alterar_proprio on public.casos for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy casos_apagar_proprio on public.casos for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.casos from anon;
grant select, insert, update, delete on public.casos to authenticated;

-- Dados de referência transcritos dos arquivos de apoio da aula de 14/11/2026.
create table if not exists public.fontes_referencia (
  id text primary key,
  metadados jsonb not null
);
create table if not exists public.focus_expectativas (
  id bigint generated always as identity primary key,
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
  data_relatorio date not null,
  unique (tipo, indicador_id, periodo, data_relatorio)
);
comment on table public.focus_expectativas is 'Medianas do Focus – Relatório de Mercado (BCB) de 23/10/2026.';
create table if not exists public.ipea_indicadores (
  id text primary key,
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
  ano integer
);
comment on table public.ipea_indicadores is 'Indicadores e projeções da Carta de Conjuntura nº 71 (Ipea), 2º trimestre de 2026.';

alter table public.fontes_referencia enable row level security;
alter table public.focus_expectativas enable row level security;
alter table public.ipea_indicadores enable row level security;
create policy fontes_leitura on public.fontes_referencia for select to anon, authenticated using (true);
create policy focus_leitura on public.focus_expectativas for select to anon, authenticated using (true);
create policy ipea_leitura on public.ipea_indicadores for select to anon, authenticated using (true);
grant select on public.fontes_referencia, public.focus_expectativas, public.ipea_indicadores to anon, authenticated;

-- Códigos da turma: lidos apenas pela função de cadastro (service role). Sem políticas = sem acesso público.
create table if not exists public.codigos_turma (
  codigo text primary key,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table public.codigos_turma enable row level security;
revoke all on public.codigos_turma from anon, authenticated;
