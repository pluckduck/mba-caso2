// Confere os dados de referência antes de qualquer carga no banco: edições do Focus e da Carta do Ipea
// (a embutida em site/js/refdata.js e as de supabase/edicoes/*.json) e os valores observados.
//   node scripts/conferir-dados.mjs        -> lista erros e avisos; termina com código 1 se houver erro
// As regras vêm da conferência de 15/11/2026 (docs/conferencia-dados.md). Um erro aqui significa que algum
// número apareceria no aplicativo onde não deve: como referência em outra unidade, como comparação entre
// medidas diferentes ou como "revisão" entre indicadores que não são o mesmo.
import { readdirSync, readFileSync } from 'node:fs';
import { FOCUS, IPEA, EDICOES_EMBUTIDAS, VARIAVEIS, OBSERVADOS, SERIES_OBS, unidadeCompativel, classeUnidade } from '../site/js/refdata.js';

const erros = [], avisos = [];
const erro = (onde, msg) => erros.push(`${onde}: ${msg}`);
const aviso = (onde, msg) => avisos.push(`${onde}: ${msg}`);

// ---------- Edições ----------
const dir = new URL('../supabase/edicoes/', import.meta.url);
const edicoes = [];
const [edFocus, edIpea] = EDICOES_EMBUTIDAS;
edicoes.push({ relatorio: edFocus, focus: [...FOCUS.anual.map(l => ({ indicador_id: l.id, unidade: l.unidade })), ...FOCUS.mensal.map(l => ({ indicador_id: l.id, unidade: l.unidade }))] });
edicoes.push({ relatorio: edIpea, ipea: IPEA.registros.map(r => ({ ...r, chave: r.chave ?? null, ano: r.ano ?? null })) });
for (const nome of readdirSync(dir).filter(n => n.endsWith('.json')).sort()) {
  const conteudo = JSON.parse(readFileSync(new URL(nome, dir), 'utf8'));
  for (const ed of Array.isArray(conteudo) ? conteudo : [conteudo]) edicoes.push(ed);
}
const carregadas = edicoes.filter(e => e.relatorio.situacao === 'carregado');
const NATUREZAS = ['Dado observado', 'Projeção publicada', 'Estimativa ou análise da fonte'];
const PROJ = 'Projeção publicada';

// 1) Carta do Ipea: cada registro ligado a uma variável (campo "chave") precisa estar na unidade dela.
const ipea = carregadas.filter(e => e.relatorio.fonte === 'ipea').sort((a, b) => a.relatorio.data_referencia.localeCompare(b.relatorio.data_referencia));
for (const ed of ipea) {
  const onde = ed.relatorio.id, ids = new Set(), projecoes = new Map();
  if (!ed.ipea?.length) { erro(onde, 'edição carregada sem registros'); continue; }
  for (const r of ed.ipea) {
    const ref = `${onde} › ${r.id}`;
    if (ids.has(r.id)) erro(ref, 'id repetido na mesma edição'); ids.add(r.id);
    if (!NATUREZAS.includes(r.natureza)) erro(ref, `natureza desconhecida: "${r.natureza}"`);
    if (typeof r.valor !== 'number' || !Number.isFinite(r.valor)) erro(ref, 'valor não numérico');
    if (!Number.isInteger(r.pagina) || r.pagina < 1) erro(ref, 'página inválida');
    if (!r.chave) { if (r.ano) aviso(ref, 'tem ano mas não está ligado a nenhuma variável'); continue; }
    const v = VARIAVEIS.find(x => x.ipea === r.chave);
    if (!v) { erro(ref, `chave "${r.chave}" não corresponde a nenhuma variável do catálogo`); continue; }
    // Unidade diferente: o valor apareceria como referência ou dado sugerido em outra unidade (ex.: 2,5% como R$/US$).
    if (!unidadeCompativel(r.unidade, v.unidade)) erro(ref, `unidade "${r.unidade}" incompatível com a variável "${v.nome}" (${v.unidade}). Retire a chave ou registre a medida na unidade da variável.`);
    if (r.natureza === PROJ) {
      // Projeção ligada a variável precisa do ano: é ele que permite comparar com o dado de hoje e com a edição anterior.
      if (!r.ano) erro(ref, 'projeção ligada a uma variável sem o campo "ano"');
      const k = `${r.chave}|${r.ano}`;
      if (projecoes.has(k)) erro(ref, `duas projeções para a mesma variável e o mesmo ano (${projecoes.get(k)} e ${r.id})`);
      projecoes.set(k, r.id);
    } else if (r.ano) aviso(ref, 'dado observado com o campo "ano": só projeções devem tê-lo');
  }
}
// 2) Entre edições: o mesmo id deve medir a mesma coisa. Para projeções é erro, porque a "revisão" compara por id.
const porId = new Map();
for (const ed of ipea) for (const r of ed.ipea || []) { if (!porId.has(r.id)) porId.set(r.id, []); porId.get(r.id).push({ ed: ed.relatorio.id, r }); }
for (const [id, lista] of porId) {
  if (new Set(lista.map(x => classeUnidade(x.r.unidade))).size > 1) erro(`id ${id}`, `unidades diferentes entre edições: ${lista.map(x => `${x.ed} (${x.r.unidade})`).join(', ')}`);
  if (new Set(lista.map(x => x.r.indicador)).size > 1) {
    const txt = `indicador com nomes diferentes entre edições: ${lista.map(x => `${x.ed} = "${x.r.indicador}"`).join('; ')}`;
    if (lista.some(x => x.r.natureza === PROJ)) erro(`id ${id}`, `${txt}. Use outro id se a medida for outra.`); else aviso(`id ${id}`, txt);
  }
}
// 3) Focus: as séries ligadas a variáveis precisam estar na unidade delas.
for (const ed of carregadas.filter(e => e.relatorio.fonte === 'focus')) {
  if (!ed.focus?.length) { erro(ed.relatorio.id, 'edição carregada sem dados'); continue; }
  const unidades = new Map(ed.focus.map(l => [l.indicador_id, l.unidade]));
  for (const v of VARIAVEIS.filter(x => x.focus)) {
    if (!unidades.has(v.focus)) aviso(ed.relatorio.id, `sem a série "${v.focus}" (variável "${v.nome}")`);
    else if (!unidadeCompativel(unidades.get(v.focus), v.unidade)) erro(`${ed.relatorio.id} › ${v.focus}`, `unidade "${unidades.get(v.focus)}" incompatível com a variável "${v.nome}" (${v.unidade})`);
  }
}

// ---------- Valores observados ----------
const menosDias = (iso, n) => new Date(new Date(`${iso}T12:00:00Z`).getTime() - n * 86400000).toISOString().slice(0, 10);
const chaves = new Set();
for (const r of OBSERVADOS) {
  const ref = `observados › ${r.serie} ${r.data}`;
  if (!SERIES_OBS[r.serie]) { erro(ref, 'série sem definição em SERIES_OBS'); continue; }
  if (chaves.has(`${r.serie}|${r.data}`)) erro(ref, 'linha repetida'); chaves.add(`${r.serie}|${r.data}`);
  if (typeof r.valor !== 'number' || !Number.isFinite(r.valor)) erro(ref, 'valor não numérico');
  if (!r.rotulo || !r.curto) erro(ref, 'falta o rótulo ou o rótulo curto');
  if (!r.disponivel_em) aviso(ref, 'sem data de divulgação: o valor será tratado como disponível em qualquer edição');
  else if (r.disponivel_em < r.data && SERIES_OBS[r.serie].modo === 'periodo') erro(ref, 'divulgado antes do fim do período medido');
}
for (const [serie, meta] of Object.entries(SERIES_OBS)) {
  const v = VARIAVEIS.find(x => x.id === meta.variavel);
  if (!v) erro(`SERIES_OBS › ${serie}`, `variável "${meta.variavel}" não existe no catálogo`);
  else if (!unidadeCompativel(meta.unidade, v.unidade)) erro(`SERIES_OBS › ${serie}`, `unidade "${meta.unidade}" incompatível com a variável "${v.nome}" (${v.unidade})`);
}
// Para cada edição carregada, cada série precisa do valor do dia e do valor de comparação; senão o bloco "hoje" fica sem seta.
for (const ed of carregadas) {
  const d = ed.relatorio.data_referencia;
  for (const [serie, meta] of Object.entries(SERIES_OBS)) {
    const vis = OBSERVADOS.filter(r => r.serie === serie && (r.disponivel_em || r.data) <= d).sort((a, b) => a.data.localeCompare(b.data));
    if (!vis.length) { aviso(`${ed.relatorio.id} › ${serie}`, `sem valor observado disponível em ${d}`); continue; }
    const anterior = meta.modo === 'nivel' ? vis.filter(r => r.data <= menosDias(d, 28)).at(-1) : vis.at(-2);
    if (!anterior) aviso(`${ed.relatorio.id} › ${serie}`, meta.modo === 'nivel' ? `sem valor de quatro semanas antes (${menosDias(d, 28)} ou anterior)` : 'sem a medição anterior para comparar');
  }
}

for (const a of avisos) console.log(`aviso  ${a}`);
for (const e of erros) console.log(`ERRO   ${e}`);
console.log(`\n${carregadas.length} edições carregadas, ${ipea.reduce((n, e) => n + (e.ipea?.length || 0), 0)} registros do Ipea e ${OBSERVADOS.length} valores observados conferidos: ${erros.length} ${erros.length === 1 ? 'erro' : 'erros'}, ${avisos.length} ${avisos.length === 1 ? 'aviso' : 'avisos'}.`);
process.exit(erros.length ? 1 : 0);
