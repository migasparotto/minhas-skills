---
name: guardar-licao
description: Guarda uma lição aprendida (kaizen) no lugar certo, em qualquer projeto. Usar quando o usuário disser "guarda a lição", quando aparecer na sessão um erro ou uma armadilha, quando algo demorar demais ou tiver retrabalho, quando o usuário corrigir o Claude, e na revisão de fim de sessão do "pmp boa noite". Escreve a lição em uma linha, decide o destino, mostra o diff e só grava com o OK dele.
---

# Guardar lição

Transforma o que deu errado em uma linha, ou um teste, que evita o mesmo problema da próxima vez.

## Quando usar

- O usuário disse "guarda a lição": seguir os passos agora.
- Apareceu um erro ou uma armadilha, algo demorou demais, houve retrabalho ou o usuário corrigiu o Claude: terminar o que está em andamento e propor a lição. Sem o pedido dele, propor uma vez só; se ele recusar, não insistir.
- "pmp boa noite": antes do commit, revisar a sessão e propor **no máximo 3 lições**, as mais úteis.

Não vale guardar o que o código, o histórico do git ou os documentos do projeto já contam, nem o que só importa nesta sessão.

## Passos

1. **Escrever a lição em uma linha:** o que acontece + o que fazer + a origem entre parênteses, curta: `(Tambor, 31/10/2026)`. Precisa servir para quem não viu esta sessão, então nada de "hoje" ou "aquele erro". Escrever a regra geral por trás do caso, não só o caso: a lição deve servir para situações parecidas, não apenas para a que aconteceu.
2. **Decidir o destino.** A pergunta é: **"isso vale fora deste projeto?"**

   | Destino | Quando |
   | --- | --- |
   | **Global:** `~/.claude/CLAUDE.md`, seção "Lições" | Sim, vale fora: ferramentas e processos de qualquer projeto (cargo, npm, PowerShell, GitHub, Dependabot, CI, Tauri em geral). **É o destino padrão.** |
   | **Projeto:** `CLAUDE.md` do projeto, "Armadilhas" ou "Regras" | Não, é específico daquele projeto. |
   | **Teste** de regressão | O erro foi um comportamento do código: propor um teste em vez de uma linha escrita, ou além dela. |
   | **Backlog** do projeto | Exige um trabalho a fazer: vira tarefa, e não aviso. |
   | **Skill** existente | Corrige um passo ou o gatilho daquela skill. |

   Se o `~/.claude/CLAUDE.md` não existir, criar o arquivo com a seção "Lições"; se só faltar a seção, acrescentá-la. Se o projeto não tiver o destino escolhido, perguntar ao usuário onde guardar, com uma sugestão.

3. **Conferir o destino antes de escrever:** ler o que já está lá.
   - Se a lição já existir, não repetir.
   - Se houver outra parecida ou obsoleta, propor juntar ou remover, e mostrar isso no diff.
4. **Antes de propor, conferir a qualidade da lição.** Corrigir o texto até passar nos quatro pontos:
   - **Uma ideia por lição:** se a frase tem "e" juntando duas regras, vira duas lições.
   - **Regra geral primeiro:** o detalhe da ferramenta ou do sistema vem depois, como o "como" ou o exemplo.
   - **Ação concreta:** dizer o que fazer. Evitar "lembrar que", "ter cuidado", "prestar atenção".
   - **Só o que foi comprovado:** não gravar como regra uma hipótese ou uma correção que ainda não se provou.
5. **Mostrar o diff, com a proposta no formato abaixo.**
6. **Só gravar com o OK do usuário** ("ok lição"). Sem OK, nada muda. Se ele pedir ajuste, mostrar de novo. Esta skill grava o arquivo, mas não faz commit.

## Formato da proposta

Toda lição proposta aparece **no fim da mensagem**, sempre neste bloco, com uma linha em branco antes do primeiro `---` e dois espaços no fim de cada linha do bloco, para elas não se juntarem na tela:

---
> 💡 **LIÇÃO PROPOSTA**  
> **Lição:** <uma linha: o que acontece + o que fazer>  
> **Onde:** Global | Projeto (Armadilhas/Regras) | Teste | Backlog | Skill <nome>  
> **Por quê:** <uma frase sobre o que aconteceu>  
> Responda **"ok lição"** para gravar, ou diga o ajuste.
---

Com mais de uma lição, um bloco para cada, com o número no título (`LIÇÃO PROPOSTA 1`). "ok lição" grava todas; "ok lição 2" grava só aquela.

## Exemplos de lição

Estilo a seguir, com lições reais:

- Global: A simulação do `cargo update` (`--dry-run`) só lista as versões que mudam, não as dependências que passam a apontar para outra versão. Sempre conferir o diff real do `Cargo.lock` antes de aprovar uma atualização. (Tambor, 31/10/2026)
- Global: O CI não gera o instalador. Mudanças que afetam o build do Tauri (ícones, NSIS, empacotamento) só se comprovam rodando o CD. (Tambor, 31/10/2026)
- Projeto: Notas de lançamento: ficam no `CHANGELOG.md`, escritas antes da tag, e o CD as lê (`scripts/release-notes.mjs`). Não rodar o CD de novo numa tag em rascunho, nem editar as notas só no rascunho: o que importa fica no `CHANGELOG.md`. (Tambor, 31/10/2026)
- Global: No Windows, `npm ci` com o `npm run app:dev` ou outro servidor do projeto aberto falha por arquivo travado e deixa o `node_modules` incompleto; encerrar o app antes de reinstalar. (Tambor, 01/11/2026)
- Global: Quando um app cai sem aviso, buscar a evidência da falha antes de levantar hipóteses: no Windows, o Visualizador de Eventos (Aplicativo, ID 1000) mostra módulo e código do erro, e o dump em %LOCALAPPDATA%\CrashDumps mostra a pilha. (Tambor, 01/11/2026)
