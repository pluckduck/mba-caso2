-- Avaliação do aplicativo: nota de 0 a 5 estrelas e comentário opcional, pedidos depois que o participante
-- exporta a entrega (PPTX, Word ou PDF). Cada participante grava e lê apenas as próprias avaliações;
-- o administrador vê todas pela função painel_avaliacoes().

create table if not exists public.avaliacoes (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nota smallint not null check (nota between 0 and 5),
  comentario text check (comentario is null or char_length(comentario) <= 2000),
  origem text check (origem in ('pptx', 'docx', 'pdf-slides', 'pdf-relatorio')),
  criado_em timestamptz not null default now()
);
create index if not exists avaliacoes_user_idx on public.avaliacoes (user_id);
alter table public.avaliacoes enable row level security;

create policy avaliacoes_inserir_propria on public.avaliacoes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy avaliacoes_ver_propria on public.avaliacoes for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.avaliacoes from anon, authenticated;
grant select, insert on public.avaliacoes to authenticated;

create or replace function public.painel_avaliacoes()
returns table (nome text, email text, nota smallint, comentario text, origem text, criado_em timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.administradores a where a.user_id = (select auth.uid())) then
    raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
  end if;
  return query
    select coalesce(u.raw_user_meta_data->>'nome', '')::text, u.email::text, av.nota, av.comentario, av.origem, av.criado_em
    from public.avaliacoes av
    join auth.users u on u.id = av.user_id
    order by av.criado_em desc;
end $$;
revoke all on function public.painel_avaliacoes() from public, anon;
grant execute on function public.painel_avaliacoes() to authenticated;
