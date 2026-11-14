// Cadastro com código da turma. Cria a conta já confirmada, sem depender de e-mail de confirmação
// (o envio de e-mails do plano gratuito do Supabase é limitado a poucos por hora).
// Publicar com verify_jwt = false: quem chama ainda não tem sessão.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const resposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return resposta({ erro: "Método não permitido." }, 405);

  let dados: Record<string, unknown>;
  try { dados = await req.json(); } catch { return resposta({ erro: "Requisição inválida." }, 400); }
  const nome = String(dados.nome ?? "").trim().slice(0, 120);
  const email = String(dados.email ?? "").trim().toLowerCase();
  const senha = String(dados.senha ?? "");
  const codigo = String(dados.codigo ?? "").trim();

  if (!nome) return resposta({ erro: "Informe o nome." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return resposta({ erro: "E-mail inválido." }, 400);
  if (senha.length < 8 || senha.length > 72) return resposta({ erro: "A senha deve ter entre 8 e 72 caracteres." }, 400);
  if (!codigo || codigo.length > 64) return resposta({ erro: "Informe o código da turma." }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: valido, error: erroCodigo } = await admin
    .from("codigos_turma").select("codigo").eq("codigo", codigo).eq("ativo", true).maybeSingle();
  if (erroCodigo) return resposta({ erro: "Não foi possível validar o código da turma." }, 500);
  if (!valido) return resposta({ erro: "Código da turma inválido." }, 403);

  const { error } = await admin.auth.admin.createUser({
    email, password: senha, email_confirm: true, user_metadata: { nome },
  });
  if (error) {
    const jaExiste = /already|registered|exists/i.test(error.message);
    return resposta({ erro: jaExiste ? "Já existe uma conta com este e-mail. Use \"Entrar\"." : "Não foi possível criar a conta." }, jaExiste ? 409 : 400);
  }
  return resposta({ ok: true });
});
