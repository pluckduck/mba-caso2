-- Gerado por scripts/gerar-observados.mjs. Não edite manualmente.
insert into public.observados (serie, data, valor, rotulo, curto, disponivel_em, fonte) values
('selic', '2026-09-16', 13.75, 'Copom de 16/09/2026', 'Copom, 16/9', '2026-09-16', 'Banco Central do Brasil (Copom)'),
('selic', '2026-11-04', 13.75, 'Copom de 04/11/2026', 'Copom, 4/11', '2026-11-04', 'Banco Central do Brasil (Copom)'),
('cambio', '2026-09-17', 5.1521, 'PTAX de 17/09/2026', 'PTAX de 17/9', '2026-09-17', 'Banco Central do Brasil (PTAX)'),
('cambio', '2026-09-25', 5.1991, 'PTAX de 25/09/2026', 'PTAX de 25/9', '2026-09-25', 'Banco Central do Brasil (PTAX)'),
('cambio', '2026-10-09', 4.9892, 'PTAX de 09/10/2026', 'PTAX de 9/10', '2026-10-09', 'Banco Central do Brasil (PTAX)'),
('cambio', '2026-10-16', 5.0826, 'PTAX de 16/10/2026', 'PTAX de 16/10', '2026-10-16', 'Banco Central do Brasil (PTAX)'),
('cambio', '2026-10-23', 5.0377, 'PTAX de 23/10/2026', 'PTAX de 23/10', '2026-10-23', 'Banco Central do Brasil (PTAX)'),
('cambio', '2026-11-06', 5.5013, 'PTAX de 06/11/2026', 'PTAX de 6/11', '2026-11-06', 'Banco Central do Brasil (PTAX)'),
('cambio', '2026-11-13', 5.6518, 'PTAX de 13/11/2026', 'PTAX de 13/11', '2026-11-13', 'Banco Central do Brasil (PTAX)'),
('ipca', '2026-08-31', 4.22, '12 meses até agosto de 2026', '12 meses até ago.', '2026-09-11', 'IBGE (IPCA)'),
('ipca', '2026-09-30', 4.58, '12 meses até setembro de 2026', '12 meses até set.', '2026-10-09', 'IBGE (IPCA)'),
('ipca', '2026-10-31', 4.63, '12 meses até outubro de 2026', '12 meses até out.', '2026-11-12', 'IBGE (IPCA)'),
('pib', '2026-03-31', 2, 'quatro trimestres até o 1º trimestre de 2026', '4 trim. até 1º tri/26', '2026-07-08', 'IBGE (Contas Nacionais Trimestrais)'),
('pib', '2026-06-30', 1.9, 'quatro trimestres até o 2º trimestre de 2026', '4 trim. até 2º tri/26', '2026-09-01', 'IBGE (Contas Nacionais Trimestrais)'),
('fbcf', '2026-03-31', -1.4, '1º trimestre de 2026 ante o 1º de 2025', '1º tri/26 ante 1º tri/25', '2026-07-08', 'IBGE (Contas Nacionais Trimestrais), via Carta de Conjuntura do Ipea'),
('fbcf', '2026-06-30', 1.4, '2º trimestre de 2026 ante o 2º de 2025', '2º tri/26 ante 2º tri/25', '2026-09-01', 'IBGE (Contas Nacionais Trimestrais), via Carta de Conjuntura do Ipea')
on conflict (serie, data) do update set valor = excluded.valor, rotulo = excluded.rotulo, curto = excluded.curto, disponivel_em = excluded.disponivel_em, fonte = excluded.fonte;
