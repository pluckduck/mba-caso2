// Gera os dados das edições dos relatórios (tabelas relatorios, focus_dados e ipea_dados).
//   node scripts/gerar-edicoes.mjs            -> SQL de todas as edições (supabase/edicoes.sql)
//   node scripts/gerar-edicoes.mjs <id>       -> SQL de uma edição só (para carregar um relatório novo)
//   node scripts/gerar-edicoes.mjs --json     -> JSON (usado nos testes com o servidor simulado)
// Fontes: a edição embutida em site/js/refdata.js e os arquivos supabase/edicoes/*.json.
import { readdirSync, readFileSync } from 'node:fs';
import { FOCUS, IPEA, EDICOES_EMBUTIDAS } from '../site/js/refdata.js';

const dir = new URL('../supabase/edicoes/', import.meta.url);
const edicoes = [];

// 1) Edição embutida (Focus de 23/10/2026 e Carta nº 71).
const [edFocus, edIpea] = EDICOES_EMBUTIDAS;
let ordem = 0;
const focus = [];
for (const [tipo, lista, periodos] of [['anual', FOCUS.anual, FOCUS.anos], ['mensal', FOCUS.mensal, FOCUS.periodosMensais]]) {
  for (const l of lista) for (const p of periodos) {
    const c = l.v[p];
    if (!c) continue;
    focus.push({ ordem: ++ordem, tipo, indicador_id: l.id, indicador: l.indicador, unidade: l.unidade, periodo: String(p), ha_4_semanas: c.h4, ha_1_semana: c.h1, hoje: c.hoje, comportamento: c.comp, semanas: c.sem ?? null, respondentes: c.resp ?? null, cinco_dias: c.d5 ?? null, respondentes_5d: c.resp5 ?? null });
  }
}
edicoes.push({ relatorio: edFocus, focus });
edicoes.push({ relatorio: edIpea, ipea: IPEA.registros.map((r, i) => ({ id: r.id, ordem: i + 1, tema: r.tema, indicador: r.indicador, valor: r.valor, unidade: r.unidade, periodo: r.periodo, natureza: r.natureza, pagina: r.pagina, nota: r.nota || null, chave: r.chave ?? null, ano: r.ano ?? null })) });

// 2) Edições em arquivo (uma por relatório carregado depois) e edições previstas.
for (const nome of readdirSync(dir).filter(n => n.endsWith('.json')).sort()) {
  const conteudo = JSON.parse(readFileSync(new URL(nome, dir), 'utf8'));
  for (const ed of Array.isArray(conteudo) ? conteudo : [conteudo]) edicoes.push(ed);
}

const arg = process.argv[2];
if (arg === '--json') {
  console.log(JSON.stringify({ relatorios: edicoes.map(e => e.relatorio), focus_dados: edicoes.flatMap(e => (e.focus || []).map(l => ({ relatorio_id: e.relatorio.id, ...l }))), ipea_dados: edicoes.flatMap(e => (e.ipea || []).map(l => ({ relatorio_id: e.relatorio.id, ...l }))) }));
} else {
  const q = v => (v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
  const escolhidas = arg ? edicoes.filter(e => e.relatorio.id === arg) : edicoes;
  if (!escolhidas.length) { console.error(`Edição não encontrada: ${arg}`); process.exit(1); }
  const out = ['-- Gerado por scripts/gerar-edicoes.mjs. Não edite manualmente.', 'begin;'];
  for (const { relatorio: r, focus: f, ipea: ip } of escolhidas) {
    out.push(`delete from public.relatorios where id = ${q(r.id)};`);
    out.push(`insert into public.relatorios (id, fonte, data_referencia, data_divulgacao, rotulo, situacao, metadados) values (${q(r.id)}, ${q(r.fonte)}, ${q(r.data_referencia)}, ${q(r.data_divulgacao ?? null)}, ${q(r.rotulo)}, ${q(r.situacao)}, ${q(JSON.stringify(r.metadados || {}))}::jsonb);`);
    if (f?.length) out.push('insert into public.focus_dados (relatorio_id, ordem, tipo, indicador_id, indicador, unidade, periodo, ha_4_semanas, ha_1_semana, hoje, comportamento, semanas, respondentes, cinco_dias, respondentes_5d) values\n'
      + f.map(l => `(${q(r.id)}, ${l.ordem}, ${q(l.tipo)}, ${q(l.indicador_id)}, ${q(l.indicador)}, ${q(l.unidade)}, ${q(l.periodo)}, ${q(l.ha_4_semanas)}, ${q(l.ha_1_semana)}, ${q(l.hoje)}, ${q(l.comportamento)}, ${q(l.semanas)}, ${q(l.respondentes)}, ${q(l.cinco_dias)}, ${q(l.respondentes_5d)})`).join(',\n') + ';');
    if (ip?.length) out.push('insert into public.ipea_dados (relatorio_id, id, ordem, tema, indicador, valor, unidade, periodo, natureza, pagina, nota, chave, ano) values\n'
      + ip.map(l => `(${q(r.id)}, ${q(l.id)}, ${l.ordem}, ${q(l.tema)}, ${q(l.indicador)}, ${q(l.valor)}, ${q(l.unidade)}, ${q(l.periodo)}, ${q(l.natureza)}, ${q(l.pagina)}, ${q(l.nota)}, ${q(l.chave)}, ${q(l.ano)})`).join(',\n') + ';');
  }
  out.push('commit;');
  console.log(out.join('\n'));
}
