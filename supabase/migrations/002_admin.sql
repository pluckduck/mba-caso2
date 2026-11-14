-- Painel do administrador: quem criou conta, progresso, último acesso e escolhas de tema.
-- O administrador vê apenas esses metadados; o conteúdo dos casos dos colegas não é exposto.

-- Progresso calculado pelo aplicativo do próprio aluno a cada gravação.
alter table public.casos
  add column if not exists progresso smallint,
  add column if not exists itens_ok smallint,
  add column if not exists itens_total smallint;

-- Último acesso de cada usuário (gravado somente pela função registrar_acesso).
create table if not exists public.acessos (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ultimo_acesso timestamptz not null default now()
);
alter table public.acessos enable row level security;
revoke all on public.acessos from anon, authenticated;

create or replace function public.registrar_acesso()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then return; end if;
  insert into public.acessos (user_id) values ((select auth.uid()))
  on conflict (user_id) do update set ultimo_acesso = now();
end $$;
revoke all on function public.registrar_acesso() from public, anon;
grant execute on function public.registrar_acesso() to authenticated;

-- Administradores: cada usuário só consegue consultar se ele próprio é administrador.
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);
alter table public.administradores enable row level security;
create policy administradores_ver_proprio on public.administradores for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.administradores from anon, authenticated;
grant select on public.administradores to authenticated;

create or replace function public.painel_admin()
returns table (nome text, email text, conta_criada_em timestamptz, ultimo_acesso timestamptz,
               progresso smallint, itens_ok smallint, itens_total smallint, caso_atualizado_em timestamptz, tema jsonb)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.administradores a where a.user_id = (select auth.uid())) then
    raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
  end if;
  return query
    select coalesce(u.raw_user_meta_data->>'nome', '')::text, u.email::text, u.created_at,
           greatest(ac.ultimo_acesso, c.atualizado_em, u.last_sign_in_at),
           c.progresso, c.itens_ok, c.itens_total, c.atualizado_em, c.tema
    from auth.users u
    left join public.casos c on c.user_id = u.id
    left join public.acessos ac on ac.user_id = u.id
    order by 4 desc nulls last;
end $$;
revoke all on function public.painel_admin() from public, anon;
grant execute on function public.painel_admin() to authenticated;
