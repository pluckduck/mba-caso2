// Cliente mínimo do Supabase (Auth + PostgREST + Edge Functions) via fetch, sem dependências externas.
// Sem configuração (js/config.js vazio), o aplicativo funciona em modo local, salvando no navegador.
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

export const remoto = Boolean(SUPABASE_URL && SUPABASE_KEY);
const LS_SESSAO = 'caso2.sessao';
const LS_LOCAL = 'caso2.casoLocal';

let sessao = null;
try { sessao = JSON.parse(localStorage.getItem(LS_SESSAO) || 'null'); } catch { sessao = null; }

function guardarSessao(s) {
  sessao = s;
  if (s) localStorage.setItem(LS_SESSAO, JSON.stringify(s));
  else localStorage.removeItem(LS_SESSAO);
}

const MENSAGENS = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/email not confirmed/i, 'E-mail ainda não confirmado.'],
  [/already (been )?registered|already exists/i, 'Já existe uma conta com este e-mail. Use "Entrar".'],
  [/rate limit|too many/i, 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'],
  [/password should be|weak password/i, 'A senha deve ter pelo menos 8 caracteres.'],
  [/failed to fetch|networkerror|load failed/i, 'Não foi possível conectar ao servidor. Verifique sua internet.'],
];
function traduzir(msg) {
  const m = String(msg || 'Erro inesperado.');
  for (const [re, pt] of MENSAGENS) if (re.test(m)) return pt;
  return m;
}

async function chamar(caminho, { metodo = 'GET', corpo, token, cabecalhos = {} } = {}) {
  let resp;
  try {
    resp = await fetch(`${SUPABASE_URL}${caminho}`, {
      method: metodo,
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token || SUPABASE_KEY}`, 'Content-Type': 'application/json', ...cabecalhos },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch (e) { throw new Error(traduzir(e.message)); }
  const texto = await resp.text();
  let json = null;
  try { json = texto ? JSON.parse(texto) : null; } catch { json = null; }
  if (!resp.ok) {
    const msg = json?.erro || json?.error_description || json?.msg || json?.message || json?.error || `Erro ${resp.status}`;
    const erro = new Error(traduzir(msg));
    erro.status = resp.status;
    throw erro;
  }
  return json;
}

function sessaoDeResposta(r) {
  return { access_token: r.access_token, refresh_token: r.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (r.expires_in || 3600), user: r.user };
}

async function tokenValido() {
  if (!sessao) throw new Error('Sessão expirada. Entre novamente.');
  if (sessao.expires_at - 60 > Date.now() / 1000) return sessao.access_token;
  try {
    const r = await chamar('/auth/v1/token?grant_type=refresh_token', { metodo: 'POST', corpo: { refresh_token: sessao.refresh_token } });
    guardarSessao(sessaoDeResposta(r));
    return sessao.access_token;
  } catch (e) {
    guardarSessao(null);
    throw new Error('Sessão expirada. Entre novamente.');
  }
}

export const usuario = () => (remoto ? sessao?.user || null : { id: 'local', email: 'modo local', user_metadata: { nome: '' } });

export async function entrar(email, senha) {
  const r = await chamar('/auth/v1/token?grant_type=password', { metodo: 'POST', corpo: { email, password: senha } });
  guardarSessao(sessaoDeResposta(r));
  return sessao.user;
}

export async function cadastrar({ nome, email, senha, codigo }) {
  await chamar('/functions/v1/cadastro', { metodo: 'POST', corpo: { nome, email, senha, codigo } });
  return entrar(email, senha);
}

export async function sair() {
  if (remoto && sessao) {
    try { await chamar('/auth/v1/logout', { metodo: 'POST', token: sessao.access_token }); } catch { /* sessão já inválida */ }
  }
  guardarSessao(null);
}

export async function pedirRecuperacao(email) {
  await chamar(`/auth/v1/recover?redirect_to=${encodeURIComponent(location.origin + location.pathname)}`, { metodo: 'POST', corpo: { email } });
}

// Se a página foi aberta pelo link de recuperação de senha, a sessão vem no fragmento da URL.
export function capturarRecuperacao() {
  if (!remoto || !location.hash.includes('access_token=')) return false;
  const p = new URLSearchParams(location.hash.slice(1));
  if (p.get('type') !== 'recovery') return false;
  guardarSessao({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_at: Math.floor(Date.now() / 1000) + Number(p.get('expires_in') || 3600), user: null });
  history.replaceState(null, '', location.pathname);
  return true;
}

export async function definirSenha(nova) {
  const t = await tokenValido();
  const u = await chamar('/auth/v1/user', { metodo: 'PUT', token: t, corpo: { password: nova } });
  guardarSessao({ ...sessao, user: u });
}

export async function carregarCaso() {
  if (!remoto) {
    try { return JSON.parse(localStorage.getItem(LS_LOCAL) || 'null'); } catch { return null; }
  }
  const t = await tokenValido();
  if (!sessao.user) sessao.user = await chamar('/auth/v1/user', { token: t });
  const linhas = await chamar('/rest/v1/casos?select=dados,tema,atualizado_em&limit=1', { token: t });
  return linhas?.[0] || null;
}

export async function salvarCaso(dados, tema) {
  const registro = { dados, tema, atualizado_em: new Date().toISOString() };
  if (!remoto) { localStorage.setItem(LS_LOCAL, JSON.stringify(registro)); return registro; }
  const t = await tokenValido();
  await chamar('/rest/v1/casos?on_conflict=user_id', {
    metodo: 'POST', token: t, corpo: { user_id: sessao.user.id, ...registro },
    cabecalhos: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  });
  return registro;
}

// Dados de referência (Focus e Ipea) gravados no Supabase. Retorna null se indisponíveis.
export async function carregarReferencias() {
  if (!remoto) return null;
  try {
    const [fontes, focus, ipea] = await Promise.all([
      chamar('/rest/v1/fontes_referencia?select=*'),
      chamar('/rest/v1/focus_expectativas?select=*&order=ordem'),
      chamar('/rest/v1/ipea_indicadores?select=*&order=ordem'),
    ]);
    if (!focus?.length || !ipea?.length) return null;
    return { fontes, focus, ipea };
  } catch { return null; }
}
