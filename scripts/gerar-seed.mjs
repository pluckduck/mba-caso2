// Gera supabase/seed.sql a partir de site/js/refdata.js (fonte única dos dados de referência).
// Uso: npm run seed
import { FOCUS, IPEA } from '../site/js/refdata.js';

const q = v => (v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const linhas = [];
linhas.push('-- Gerado por scripts/gerar-seed.mjs a partir de site/js/refdata.js. Não edite manualmente.');
linhas.push('begin;');
linhas.push('delete from public.focus_expectativas;', 'delete from public.ipea_indicadores;', 'delete from public.fontes_referencia;');

const meta = ({ titulo, instituicao, data, dataTxt, periodo, publicacao, url, citacao, nota, argumentos }) =>
  JSON.stringify({ titulo, instituicao, data, dataTxt, periodo, publicacao, url, citacao, nota, argumentos });
linhas.push(`insert into public.fontes_referencia (id, metadados) values ('focus', ${q(meta(FOCUS))}::jsonb), ('ipea', ${q(meta(IPEA))}::jsonb);`);

let ordem = 0;
const focus = [];
for (const [tipo, lista, periodos] of [['anual', FOCUS.anual, FOCUS.anos], ['mensal', FOCUS.mensal, FOCUS.periodosMensais]]) {
  for (const l of lista) for (const p of periodos) {
    const c = l.v[p];
    if (!c) continue;
    focus.push(`(${++ordem}, ${q(tipo)}, ${q(l.id)}, ${q(l.indicador)}, ${q(l.unidade)}, ${q(String(p))}, ${q(c.h4)}, ${q(c.h1)}, ${q(c.hoje)}, ${q(c.comp)}, ${q(c.sem)}, ${q(c.resp)}, ${q(c.d5)}, ${q(c.resp5)}, ${q(FOCUS.data)})`);
  }
}
linhas.push('insert into public.focus_expectativas (ordem, tipo, indicador_id, indicador, unidade, periodo, ha_4_semanas, ha_1_semana, hoje, comportamento, semanas, respondentes, cinco_dias, respondentes_5d, data_relatorio) values\n' + focus.join(',\n') + ';');

const ipea = IPEA.registros.map((r, i) => `(${q(r.id)}, ${i + 1}, ${q(r.tema)}, ${q(r.indicador)}, ${q(r.valor)}, ${q(r.unidade)}, ${q(r.periodo)}, ${q(r.natureza)}, ${q(r.pagina)}, ${q(r.nota)}, ${q(r.chave ?? null)}, ${q(r.ano ?? null)})`);
linhas.push('insert into public.ipea_indicadores (id, ordem, tema, indicador, valor, unidade, periodo, natureza, pagina, nota, chave, ano) values\n' + ipea.join(',\n') + ';');
linhas.push('commit;');
console.log(linhas.join('\n'));
