// Gera o SQL dos valores observados (tabela observados) a partir da cópia embutida em site/js/refdata.js.
//   node scripts/gerar-observados.mjs > supabase/observados.sql
// Para carregar um dado novo: acrescente a linha em OBSERVADOS (refdata.js), gere o SQL e execute-o no banco.
import { OBSERVADOS } from '../site/js/refdata.js';

const q = v => (v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const linhas = OBSERVADOS.map(r => `(${q(r.serie)}, ${q(r.data)}, ${q(r.valor)}, ${q(r.rotulo)}, ${q(r.curto)}, ${q(r.disponivel_em)}, ${q(r.fonte)})`);
console.log(['-- Gerado por scripts/gerar-observados.mjs. Não edite manualmente.',
  'insert into public.observados (serie, data, valor, rotulo, curto, disponivel_em, fonte) values',
  linhas.join(',\n'),
  'on conflict (serie, data) do update set valor = excluded.valor, rotulo = excluded.rotulo, curto = excluded.curto, disponivel_em = excluded.disponivel_em, fonte = excluded.fonte;'].join('\n'));
