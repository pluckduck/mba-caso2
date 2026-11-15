-- A função rls_auto_enable() é um gatilho de evento da plataforma (liga o RLS em tabelas novas do esquema public).
-- Ela não precisa ser executável pelos papéis da API: o gatilho continua funcionando, pois é disparado pelo dono (postgres).
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
