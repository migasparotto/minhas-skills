# Registro do hansei

Cada achado do agente `hansei`, com o status. Gravado por `hansei-registro.mjs` (minhas-skills).
Um achado só sai de `aberto` pela decisão do usuário; `recusado pelo usuário` traz o motivo dele.

| ID | Data | Achado | Status | Decisão |
| --- | --- | --- | --- | --- |
| 2026-11-05-1 | 05/11/2026 | ~/.claude/skills é um link para C:/Projetos/minhas-skills, que está na branch fix/prs-do-dia-fuso: os hooks e skills de toda sessão rodam código ainda não revisado nem mergeado; a conferência 'skills na main' só existe em texto, no boa noite. | feito | Usuário aceitou em 05/11/2026: desenvolvimento no worktree C:\Projetos\minhas-skills-dev; pasta dos atalhos sempre na main; hook SessionStart aviso-skills-fora-da-main. |
| 2026-11-05-2 | 05/11/2026 | O CI do minhas-skills roda no fuso UTC (windows-latest), então os testes do caminho padrão de hora local (today(), localOffset, ID do registro) passariam mesmo com a volta do bug do UTC; falta TZ=America/Sao_Paulo no workflow. | feito | Usuário aceitou em 05/11/2026: TZ America/Sao_Paulo no testes.yml. |
| 2026-11-05-3 | 05/11/2026 | caminhos.mjs (aqui e no Tambor) varre só git ls-files, então rodar o teste antes do commit não vê os arquivos novos e passa (falha 3 de 05/11); incluir --others --exclude-standard. | aceito | Aprovado pelo usuário em 05/11/2026: a varredura de caminhos também olha os arquivos ainda não versionados |
| 2026-11-05-4 | 05/11/2026 | A causa de o hansei.md sujar a pasta da main não foi tratada: o agents/hansei.md manda registrar em '<pasta do projeto>/docs/hansei.md', que para o minhas-skills é a pasta da main, e o hook aviso-skills-fora-da-main só olha a branch, não as mudanças sem commit; o próximo hansei repete (este registro foi feito na minhas-skills-dev para não repetir). | aberto |  |
| 2026-11-05-5 | 05/11/2026 | Condições mudadas sem serem citadas: a regra do usuário 'lição sem mecanismo não entra no hansei' virou 'não entra aqui [Lições do CLAUDE.md] nem no hansei como feita', sem rever as cerca de 20 lições antigas sem mecanismo; e o 'link do run' pedido para a investigar-falha virou 'link do run ou o caminho do log'. | aberto |  |
