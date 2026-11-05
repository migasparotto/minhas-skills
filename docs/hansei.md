# Registro do hansei

Cada achado do agente `hansei`, com o status. Gravado por `hansei-registro.mjs` (minhas-skills).
Um achado só sai de `aberto` pela decisão do usuário; `recusado pelo usuário` traz o motivo dele.

| ID | Data | Achado | Status | Decisão |
| --- | --- | --- | --- | --- |
| 2026-11-05-1 | 05/11/2026 | ~/.claude/skills é um link para C:/Projetos/minhas-skills, que está na branch fix/prs-do-dia-fuso: os hooks e skills de toda sessão rodam código ainda não revisado nem mergeado; a conferência 'skills na main' só existe em texto, no boa noite. | feito | Usuário aceitou em 05/11/2026: desenvolvimento no worktree C:\Projetos\minhas-skills-dev; pasta dos atalhos sempre na main; hook SessionStart aviso-skills-fora-da-main. |
| 2026-11-05-2 | 05/11/2026 | O CI do minhas-skills roda no fuso UTC (windows-latest), então os testes do caminho padrão de hora local (today(), localOffset, ID do registro) passariam mesmo com a volta do bug do UTC; falta TZ=America/Sao_Paulo no workflow. | feito | Usuário aceitou em 05/11/2026: TZ America/Sao_Paulo no testes.yml. |
