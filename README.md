# Minhas skills

Skills, agentes e hooks pessoais para o [Claude Code](https://claude.com/claude-code), que valem em todos os meus projetos. São inspirados nas skills do Akita, como a `pr-post-audit`.

**Quem faz não confere o próprio trabalho.** As skills fazem; os agentes conferem, com o contexto limpo: recebem só o material (diff, resumo, afirmações), nunca o raciocínio da sessão.

## Skills (fazem)

| Skill | O que faz |
| --- | --- |
| [`guardar-licao`](guardar-licao/SKILL.md) | Transforma um erro, uma armadilha ou uma correção em uma lição de uma linha, no lugar certo, e só grava com aprovação. Propõe também os kaizens (o que pode melhorar mesmo sem erro). |
| [`causa-raiz`](causa-raiz/SKILL.md) | Leva do sintoma à causa com os cinco porquês, procura outras ocorrências da mesma causa e escreve a regra geral. Só analisa. |
| [`corrigir`](corrigir/SKILL.md) | Corrige um bug por vez: reproduzir, causa raiz, teste que falha, correção mínima, teste verde e lição. Inspirada na `github-resolution` do Akita. |
| [`investigar-falha`](investigar-falha/SKILL.md) | Investiga uma falha sem causa conhecida, da evidência à causa provável, e entrega o conserto à `corrigir`. Não corrige. |
| [`release`](release/SKILL.md) | Leva uma versão nova até o rascunho do release conferido. Nunca cria a tag nem publica sem aprovação. |

As três que analisam ou guardam (`causa-raiz`, `investigar-falha`, `guardar-licao`) terminam sempre com as 3 perguntas do kaizen: onde mais? que mecanismo impede a repetição? em que camada?

## Agentes (conferem)

| Agente | O que faz |
| --- | --- |
| [`revisar-antes-de-enviar`](agents/revisar-antes-de-enviar.md) | Revisa os commits que ainda não foram enviados e termina com um veredito. Nunca faz o push. |
| [`hansei`](agents/hansei.md) | O exame honesto ao fim de todo trabalho, mesmo quando deu certo, por 8 perguntas com prova. O hansei encontra; o kaizen melhora. |

## Hooks

| Hook | O que faz |
| --- | --- |
| [`exigir-hansei.mjs`](hooks/exigir-hansei.mjs) | Hook de parada (Stop): recusa encerrar um resumo final (com linhas "Kaizen:") que não tenha a linha "Hansei:" preenchida, ou que deixe de citar um achado ainda `aberto` no `docs/hansei.md` do projeto. |
| [`aviso-tempo-de-chat.mjs`](hooks/aviso-tempo-de-chat.mjs) | Ao enviar uma mensagem (UserPromptSubmit): quando o contexto da sessão passa de 300 mil tokens, e de novo a cada 50 mil, pede o aviso "Tempo de chat" no fim da resposta. Só avisa, nunca trava. |

## Scripts

| Script | O que faz |
| --- | --- |
| [`hansei-registro.mjs`](scripts/hansei-registro.mjs) | Registro dos achados do hansei (`docs/hansei.md` de cada projeto), com status `aberto`, `aceito`, `feito` ou `recusado pelo usuário` (este sempre com o motivo). |
| [`prs-do-dia.mjs`](scripts/prs-do-dia.mjs) | Lista os PRs que entraram na main num dia, para conferir o Todoist e o Notion no "pmp boa noite". |

Testes: `node --test hooks/*.test.mjs scripts/*.test.mjs`.

## O histórico é parte do conteúdo

Toda mudança numa skill vira um commit cuja mensagem diz qual erro ou lição a causou. Assim, o histórico mostra por que cada regra existe.

## Como usar

As pastas ficam ligadas às do Claude Code por junctions do Windows, para editar num lugar só:

```bat
mklink /J "%USERPROFILE%\.claude\skills" "C:\caminho\para\minhas-skills"
mklink /J "%USERPROFILE%\.claude\agents" "C:\caminho\para\minhas-skills\agents"
```

Os hooks são chamados direto daqui, no `~/.claude/settings.json`:

```json
"hooks": {
  "Stop": [{ "hooks": [{ "type": "command", "command": "node \"C:/caminho/para/minhas-skills/hooks/exigir-hansei.mjs\"" }] }],
  "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "node \"C:/caminho/para/minhas-skills/hooks/aviso-tempo-de-chat.mjs\"" }] }]
}
```

A pasta `synced/`, que o Claude Code mantém sozinho, fica fora do repositório.
