---
name: pmp-boa-noite
description: Fecha o dia e encerra a conversa. Usar quando o usuário disser "executar pmp boa noite". Grava tudo o que ficou pendente, não faz nenhuma pergunta e termina com a linha fixa; depois dela, nada é executado até o "pmp bom dia" ou o "reabrir o dia".
---

# pmp boa noite

O boa noite **encerra a conversa**. Antes do fim, tudo o que ficou pendente é gravado no lugar dele, e o "pmp bom dia" seguinte começa pelas decisões. Durante o boa noite e depois dele, **nenhuma pergunta**: não pedir aprovação, não oferecer ação, não sugerir continuar. O que dependeria de uma resposta do usuário vira item em `~/.claude/pendentes.md`.

(Desde 08/11/2026, pedido do usuário depois de a conversa seguir além do boa noite pela 5ª vez.)

## Onde fica cada pendência

| O quê | Onde |
| --- | --- |
| Tarefa do projeto, próximo passo | Backlog do projeto, no "Próximo" |
| Achado do hansei | Registro do escopo dele, com status `aberto` (`hansei-registro.mjs add`) |
| Tarefa que já está no Todoist | Todoist, com um comentário do estado |
| Todo o resto que pede uma decisão do usuário: lição e kaizen propostos, commit ou push que não foram feitos, merge, qualquer pergunta que ficaria no ar | `~/.claude/pendentes.md`, com o texto inteiro da proposta (o bloco da `guardar-licao`, o veredito do `revisar-antes-de-enviar`) |

Cada item fica num lugar só: o `pendentes.md` não repete o que já está no backlog, no registro ou no Todoist. Ele fica no repositório privado do `~/.claude`, porque pode guardar mensagens do usuário; o repositório do projeto pode ser público.

## Passos

1. **Backlog:** marcar como concluídas as tarefas que terminamos e anotar o próximo passo. Todo item "feito" ou "pendente" leva a evidência ao lado (comando + resultado, ou "não conferido"), rodada na hora.
2. **Kaizen do dia:** revisar as falhas, correções e lacunas do dia com as 3 perguntas do kaizen (onde mais? que mecanismo impede a repetição? em que camada?) e revisar a sessão com a skill `guardar-licao`: no máximo 3 lições e os kaizens que aparecerem. As propostas vão inteiras para `~/.claude/pendentes.md`, marcadas "sem decisão"; o bom dia pede a decisão.
3. **Hansei:** chamar o agente `hansei` sobre o dia. Os achados ficam no registro do escopo, com status `aberto`.
4. **Todoist:** conferir as tarefas abertas dos projetos ligados ao repositório contra os PRs que entraram na main no dia (`node C:/Projetos/minhas-skills/scripts/prs-do-dia.mjs`). Fechar as que terminaram, com um comentário do que foi feito (PR e data); no resumo, dizer o que ficou aberto e por quê.
5. **Notion:** o que mudou chegou às páginas do projeto? O que faltar, atualizar.
6. **Skills:** conferir que o repositório das skills (`~/.claude/skills`) está na `main`, sem commits por enviar; se não estiver, dizer no resumo e anotar em `~/.claude/pendentes.md`.
7. **Envio:** mostrar o que mudou desde o último envio.
   - O próprio comando "executar pmp boa noite" autoriza o commit dos registros do dia: backlog, `docs/hansei.md`, `~/.claude/pendentes.md` e o que o usuário já aprovou durante o dia.
   - Antes do push, chamar o agente `revisar-antes-de-enviar` e mostrar o veredito. Com ✅, fazer o push da branch (nunca na `main` direto, nunca merge).
   - Com ❌, ou para qualquer outra mudança: não fazer o commit nem o push; anotar em `~/.claude/pendentes.md` o que ficou e o veredito.
8. **Resumo final**, com as linhas "Kaizen:" e "Hansei:" e, no fim, a seção **"Em aberto"**:
   1. tudo o que ficou em aberto, separado em **Seu** (o que depende do usuário: decisões, passos no GitHub, testes) e **Meu** (o que fica com o Claude);
   2. para cada item, onde está registrado (backlog, registro do hansei, Todoist ou `~/.claude/pendentes.md`), para o bom dia retomar; item sem registro é registrado antes de fechar;
   3. a evidência do estado de cada item, rodada na hora.

   Sem nada em aberto, escrever "Nada em aberto".
9. **Última linha**, sozinha, exatamente:

   Boa noite encerrado. Retome com 'executar pmp bom dia'.

   Nada depois dela. Nenhuma pergunta, oferta ou sugestão em nenhum ponto do boa noite. Na caixa de fim de turno do app, quando houver, só o resumo, sem pergunta e sem botões.

## Depois do boa noite

- Toda mensagem que chegar é anotada em `~/.claude/pendentes.md` e respondida só com a linha fixa, sem executar nada. O hook `depois-da-boa-noite` já anota a mensagem e lembra a regra a cada mensagem.
- A única exceção é a mensagem "reabrir o dia": a conversa volta ao normal.

## Mecanismos

- `hooks/depois-da-boa-noite.mjs`: guarda que a conversa terminou com a linha fixa, anota cada mensagem que chega depois e lembra a regra.
- `scripts/boa-noite.test.mjs`: falha se este texto pedir aprovação ou não terminar com a linha fixa.
- Pergunta 10 do agente `hansei`, rodada no bom dia seguinte: a conversa anterior continuou depois da linha fixa?
