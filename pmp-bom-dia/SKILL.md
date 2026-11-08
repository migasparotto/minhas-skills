---
name: pmp-bom-dia
description: Retoma o trabalho do dia. Usar quando o usuário disser "executar pmp bom dia". Começa pelas decisões que o boa noite anterior deixou em ~/.claude/pendentes.md e depois continua de onde paramos, pelo backlog do projeto.
---

# pmp bom dia

## Passos

1. **Pendentes da noite:** ler `~/.claude/pendentes.md`. Mostrar cada item e pedir a decisão do usuário, uma pergunta por vez, com sugestão de resposta. Item decidido vai para o destino (agora, backlog, registro do hansei, lição gravada, recusado com o motivo dele) e sai do arquivo. Arquivo vazio ou ausente: escrever "Nenhum pendente da noite".
2. **A conversa anterior parou no boa noite?** Chamar o agente `hansei` só com a pergunta 10, sobre a conversa anterior deste projeto. O achado, se houver, entra no registro como os outros.
3. **Ler:** o `~/.claude/CLAUDE.md`, o `CLAUDE.md` do projeto e os documentos-base que ele indicar.
4. **Backlog:** ver o que já foi concluído e qual é o próximo passo, e continuar de onde paramos. Fazer também os passos extras que o `CLAUDE.md` do projeto listar.
5. **Ordem sugerida:** todo item do "Próximo" do backlog recebe um destino: agora, depois (com o motivo) ou do usuário, separados em "o que o usuário faz" e "o que o Claude faz". Nenhum item some da lista sem ser citado. (Hansei 2026-11-05-15.)
6. **Evidência:** todo item "feito" ou "pendente" leva a evidência ao lado: comando + resultado, ou "não conferido". A consulta é rodada na hora, para cada estado citado, e o resultado é colado ao lado; nunca copiado de uma consulta anterior ou da memória. (Lição de 05/11/2026; consulta na hora: kaizen do usuário, 07/11/2026. Vale também no boa noite, nos resumos e nas lições.)
