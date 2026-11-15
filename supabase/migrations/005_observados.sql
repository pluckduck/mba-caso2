-- Dados observados ("onde está hoje"): o último valor medido de cada série, usado ao lado das projeções do Focus e do Ipea.
-- Cada linha é uma medição. O aplicativo escolhe a mais recente disponível na data da edição do relatório em uso no caso
-- e a compara com a medição anterior (séries por período) ou com a de quatro semanas antes (séries diárias).
-- Carregar um dado novo é inserir uma linha (ver supabase/observados.sql).
create table if not exists public.observados (
  serie text not null,
  data date not null,
  valor numeric not null,
  rotulo text not null,
  curto text not null,
  disponivel_em date,
  fonte text not null,
  primary key (serie, data)
);
comment on table public.observados is 'Valores observados por série (Selic, PTAX, IPCA em 12 meses, PIB e FBCF). Atualizados junto com as edições dos relatórios.';
comment on column public.observados.data is 'Data a que o valor se refere: dia da cotação ou da decisão, ou último dia do período medido.';
comment on column public.observados.disponivel_em is 'Data em que o valor foi divulgado. Vazio = divulgado antes de qualquer edição carregada.';

alter table public.observados enable row level security;
drop policy if exists observados_leitura on public.observados;
create policy observados_leitura on public.observados for select to anon, authenticated using (true);
revoke all on public.observados from anon, authenticated;
grant select on public.observados to anon, authenticated;
