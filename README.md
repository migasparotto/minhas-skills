# Minhas skills

Skills pessoais para o [Claude Code](https://claude.com/claude-code), que valem em todos os meus projetos. São inspiradas nas skills do Akita, como a `pr-post-audit`.

| Skill | O que faz |
| --- | --- |
| [`guardar-licao`](guardar-licao/SKILL.md) | Transforma um erro, uma armadilha ou uma correção em uma lição de uma linha, no lugar certo, e só grava com aprovação. |
| [`causa-raiz`](causa-raiz/SKILL.md) | Leva do sintoma à causa com os cinco porquês, procura outras ocorrências da mesma causa e escreve a regra geral. Só analisa. |
| [`corrigir`](corrigir/SKILL.md) | Corrige um bug por vez: reproduzir, causa raiz, teste que falha, correção mínima, teste verde e lição. Inspirada na `github-resolution` do Akita. |
| [`revisar-antes-de-enviar`](revisar-antes-de-enviar/SKILL.md) | Revisa os commits que ainda não foram enviados e termina com um veredito. Nunca faz o push. |
| [`release`](release/SKILL.md) | Leva uma versão nova até o rascunho do release conferido. Nunca cria a tag nem publica sem aprovação. |

## O histórico é parte do conteúdo

Toda mudança numa skill vira um commit cuja mensagem diz qual erro ou lição a causou. Assim, o histórico mostra por que cada regra existe.

## Como usar

Esta pasta fica ligada a `~/.claude/skills` por uma junction do Windows, para editar num lugar só:

```bat
mklink /J "%USERPROFILE%\.claude\skills" "C:\caminho\para\minhas-skills"
```

A pasta `synced/`, que o Claude Code mantém sozinho, fica fora do repositório.
