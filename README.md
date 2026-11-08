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
| [`pmp-boa-noite`](pmp-boa-noite/SKILL.md) | Fecha o dia e encerra a conversa: grava tudo o que ficou pendente (backlog, registro do hansei, Todoist ou `~/.claude/pendentes.md`), não faz nenhuma pergunta e termina com a linha fixa "Boa noite encerrado. Retome com 'executar pmp bom dia'." |
| [`pmp-bom-dia`](pmp-bom-dia/SKILL.md) | Retoma o dia: começa pelas decisões pendentes da noite (`~/.claude/pendentes.md`), confere com o hansei se a conversa anterior parou no boa noite e continua pelo backlog. |
| [`release`](release/SKILL.md) | Leva uma versão nova até o rascunho do release conferido. Nunca cria a tag nem publica sem aprovação. |

As três que analisam ou guardam (`causa-raiz`, `investigar-falha`, `guardar-licao`) terminam sempre com as 3 perguntas do kaizen: onde mais? que mecanismo impede a repetição? em que camada?

## Agentes (conferem)

| Agente | O que faz |
| --- | --- |
| [`revisar-antes-de-enviar`](agents/revisar-antes-de-enviar.md) | Revisa os commits que ainda não foram enviados e termina com um veredito. Nunca faz o push. |
| [`hansei`](agents/hansei.md) | O exame honesto ao fim de todo trabalho, mesmo quando deu certo, por 9 perguntas com prova (e a 10ª, no bom dia: a conversa anterior parou no boa noite?). O hansei encontra; o kaizen melhora. |

## Hooks

| Hook | O que faz |
| --- | --- |
| [`exigir-hansei.mjs`](hooks/exigir-hansei.mjs) | Hook de parada (Stop): recusa encerrar um resumo final (com linhas "Kaizen:") que não tenha a linha "Hansei:" preenchida, ou que deixe de citar um achado ainda `aberto` em um dos dois registros: o `docs/hansei.md` do projeto e o do sistema (o `docs/hansei.md` deste repositório; `HANSEI_REGISTRO_SISTEMA` troca o caminho, para os testes). |
| [`aviso-mcp-altera.mjs`](hooks/aviso-mcp-altera.mjs) | **Proposto, ainda não ligado.** Antes de uma ferramenta dos MCPs `cadcraft`/`cadcraft-live` que muda o desenho aberto ou grava arquivo (PreToolUse, matcher `mcp__cadcraft(-live)?__(command_line\|script\|execute\|new_drawing\|open\|cancel\|save\|render)`), pede a aprovação do usuário com o motivo "⚠️ ALTERA:". Será ligado no Claude do Ubuntu, onde ficam esses MCPs; por isso não está no `settings.json` abaixo. |
| [`depois-da-boa-noite.mjs`](hooks/depois-da-boa-noite.mjs) | Em dois eventos. Na parada (Stop): guarda que a conversa terminou com a linha fixa do boa noite. Ao enviar uma mensagem (UserPromptSubmit) depois disso: anota a mensagem em `~/.claude/pendentes.md` e lembra a regra (não executar nada, responder só com a linha fixa). "reabrir o dia" desfaz. Só lembra, nunca trava. |
| [`aviso-tempo-de-chat.mjs`](hooks/aviso-tempo-de-chat.mjs) | Ao enviar uma mensagem (UserPromptSubmit): quando o contexto da sessão passa de 300 mil tokens, e de novo a cada 50 mil, pede o aviso "Tempo de chat" no fim da resposta. Só avisa, nunca trava. |
| [`aviso-skills-fora-da-main.mjs`](hooks/aviso-skills-fora-da-main.mjs) | Ao iniciar a sessão (SessionStart): avisa quando esta pasta, que o `~/.claude/skills` e o `~/.claude/agents` usam, não está na `main`. O desenvolvimento é feito no worktree `C:\Projetos\minhas-skills-dev`. Só avisa, nunca trava. |

## Scripts

| Script | O que faz |
| --- | --- |
| [`hansei-registro.mjs`](scripts/hansei-registro.mjs) | Registro dos achados do hansei (`docs/hansei.md` de cada projeto), com status `aberto`, `aceito`, `feito` ou `recusado pelo usuário` (este sempre com o motivo). |
| [`prs-do-dia.mjs`](scripts/prs-do-dia.mjs) | Lista os PRs que entraram na main num dia, para conferir o Todoist e o Notion no "pmp boa noite". |
| [`boa-noite.mjs`](scripts/boa-noite.mjs) | A linha fixa do boa noite e o subcomando `depois`, que mostra o que foi dito depois do último boa noite na conversa mais recente do projeto. Usado pela pergunta 10 do hansei, no bom dia. |
| [`caminhos.mjs`](scripts/caminhos.mjs) | Recusa, nos arquivos versionados, caminho do Windows quebrado (`C:` grudado numa letra) ou pessoal (pasta de usuário). Rodado pelo teste no CI; o mesmo arquivo existe no tambor-de-notas. |

Testes: `node --test hooks/*.test.mjs scripts/*.test.mjs`, também no CI (workflow `Testes`, no Windows). As linhas "Hansei:" reais que o hook já errou ficam em `hooks/casos-reais-hansei.json`.

## O histórico é parte do conteúdo

Toda mudança numa skill vira um commit cuja mensagem diz qual erro ou lição a causou. Assim, o histórico mostra por que cada regra existe.

## Como usar

As pastas ficam ligadas às do Claude Code por junctions do Windows, para editar num lugar só:

```bat
mklink /J "%USERPROFILE%\.claude\skills" "C:\caminho\para\minhas-skills"
mklink /J "%USERPROFILE%\.claude\agents" "C:\caminho\para\minhas-skills\agents"
```

**Onde desenvolver:** a pasta dos atalhos fica sempre na `main`, porque todas as sessões usam o que está nela. Mudanças são feitas num worktree separado, numa branch própria:

```bat
git -C "C:\caminho\para\minhas-skills" worktree add "C:\caminho\para\minhas-skills-dev" -b <branch> origin/main
```

Depois do merge, `git -C "C:\caminho\para\minhas-skills" pull` atualiza a pasta dos atalhos.

Os hooks são chamados direto daqui, no `~/.claude/settings.json`:

```json
"hooks": {
  "Stop": [{ "hooks": [
    { "type": "command", "command": "node \"C:/caminho/para/minhas-skills/hooks/exigir-hansei.mjs\"" },
    { "type": "command", "command": "node \"C:/caminho/para/minhas-skills/hooks/depois-da-boa-noite.mjs\"" }
  ] }],
  "UserPromptSubmit": [{ "hooks": [
    { "type": "command", "command": "node \"C:/caminho/para/minhas-skills/hooks/aviso-tempo-de-chat.mjs\"" },
    { "type": "command", "command": "node \"C:/caminho/para/minhas-skills/hooks/depois-da-boa-noite.mjs\"" }
  ] }],
  "SessionStart": [{ "hooks": [{ "type": "command", "command": "node \"C:/caminho/para/minhas-skills/hooks/aviso-skills-fora-da-main.mjs\"" }] }]
}
```

A pasta `synced/`, que o Claude Code mantém sozinho, fica fora do repositório.
