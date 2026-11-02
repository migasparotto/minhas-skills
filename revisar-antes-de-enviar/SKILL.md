---
name: revisar-antes-de-enviar
description: Revisa os commits ainda não enviados e dá um veredito. Usar antes de qualquer push ou PR, no "pmp boa noite", e quando o usuário pedir para revisar ou perguntar se pode enviar. Só revisa: nunca faz o push nem corrige.
---

# Revisar antes de enviar

Pega problemas antes de chegarem ao GitHub, olhando o conjunto do que vai ser enviado, e não só o último commit.

**Só revisa e mostra.** Não faz push, commit nem correção. O push continua dependendo da aprovação do usuário.

## Passos

1. **Descobrir o que vai ser enviado.** Rodar `git fetch`. A comparação é contra `@{u}` (a branch no GitHub) ou, se a branch ainda não existir lá, contra a branch principal em `origin`. Se não houver nada a enviar, dizer isso e parar.
2. **Listar os commits e os arquivos:** `git log --format='%h %s%n%b' <base>..HEAD` (a mensagem inteira, para ver atribuições) e `git diff --stat <base>...HEAD`.
3. **Ler o diff inteiro** (`git diff <base>...HEAD`) e `git status`, procurando os riscos abaixo.
4. **Conferir lint, testes e build:** rodar agora os comandos que o `CLAUDE.md` e o CI do projeto usam, incluindo os de outras linguagens do projeto (como o Rust). Não confiar em resultado de antes nem dizer que passou sem ter rodado. Se houver mudanças sem commit, avisar que elas entram nessa conferência, mas não no envio.
5. **Terminar com o resumo e o veredito**, no formato abaixo.

## Riscos a procurar

| Risco | O que olhar |
| --- | --- |
| **Fora do escopo** | Mudança que não combina com a mensagem do commit ou com a tarefa da sessão |
| **Arquivo esquecido** | Arquivo sem commit que deveria ir junto; manifesto sem lockfile, ou lockfile sem manifesto; código novo sem o teste ou o README que a tarefa pedia |
| **Segredo ou dado pessoal** | Chaves, tokens, senhas, arquivos `.env`, e-mails e caminhos pessoais (`C:\Users\...`, `/home/...`) |
| **Autor do commit** | E-mail de autor e de quem commitou (`git log --format='%ae %ce'`): em repositório público, só o `noreply` |
| **Sobra de teste ou depuração** | `console.log`, `debugger`, `dbg!`, `println!` de depuração, `.only`, `.skip`, código comentado, arquivos temporários |
| **Dependência nova** | Pacote novo ou trocado em `package.json`, `Cargo.toml` ou nos lockfiles, inclusive os indiretos: dizer qual é e por que entrou |
| **Co-autor** | Commit com `Co-Authored-By` ou outra atribuição ao Claude na mensagem |
| **Push direto na main** | Os commits estão na branch principal: avisar e sugerir branch + PR |

Apontar arquivo e linha de cada risco achado. Não apontar o que for legítimo só para encher a lista: um `console.log` de um script de linha de comando, por exemplo, não é sobra.

## Formato do resultado

```
**O que vai ser enviado:** N commits, M arquivos, em <branch>
- <hash> <mensagem>

**Riscos:** nenhum achado | lista com arquivo:linha e o motivo
**Lint / testes / build:** passou ou falhou, cada um

**Resumo:** <uma ou duas frases>
**Veredito:** ✅ Pode enviar | ❌ Corrigir antes: <o que corrigir>
```

- **Corrigir antes** quando um comando falhar, houver segredo ou dado pessoal, faltar um arquivo necessário ou houver co-autor na mensagem de um commit.
- Risco que só pede atenção, como uma dependência nova já combinada ou o push direto na main, não impede o envio: **pode enviar**, com o ponto citado no resumo.
