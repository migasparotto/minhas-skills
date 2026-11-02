---
name: release
description: Leva uma versão nova até o rascunho do release conferido. Usar quando o usuário pedir uma "versão", "release" ou "tag", ou no fim de uma sprint que termina em versão. Nunca cria a tag nem publica sem o OK dele.
---

# Release

Leva o `main` até um release em rascunho conferido, pronto para o usuário publicar.

## Regras que nunca mudam

- **Nunca criar a tag nem publicar sem o OK do usuário**, pedido na hora e para esta versão. OK dado em outra versão não vale.
- **Nunca reescrever uma tag já publicada:** nada de apagar, mover ou forçar. Se algo saiu errado, a correção vira uma versão nova.
- **Não rodar o CD de novo numa tag em rascunho.** Se o CD falhar, parar e mostrar o erro ao usuário, com uma sugestão.

## Passos

Os arquivos de versão, o que o CD gera e o teste rápido depois de publicar vêm da seção Release do `CLAUDE.md` do projeto; se ela não existir, perguntar ao usuário e propor criá-la.

1. **Conferir o ponto de partida:** branch principal atualizada, sem mudanças pendentes e com CI verde. Ler a seção "Não lançado" do `CHANGELOG.md` e conferir com o que mudou desde a última tag: o que muda para quem usa e faltar na seção entra agora. Se o projeto ainda não tiver essa seção, propor criá-la.
2. **Tirar o número da seção "Não lançado":**

   | Mudou | Versão | Exemplo a partir da 0.3.0 | Exemplo a partir da 1.2.0 |
   | --- | --- | --- | --- |
   | Só "Correções" | patch | 0.3.1 | 1.2.1 |
   | "Novidades" | minor | 0.4.0 | 1.3.0 |
   | "Quebras": algo deixa de funcionar ou exige ação de quem usa | em 0.x, minor; a partir da 1.0.0, major | 0.4.0 | 2.0.0 |

   Com mudanças de mais de um tipo, vale a maior. Mudança só interna (testes, CI, documentação) não entra no `CHANGELOG.md` nem pede versão: com a seção vazia, avisar o usuário.

   **A 1.0.0 só acontece quando o usuário decidir que o app está estável:** nunca propor 1.0.0 por conta própria.
3. **Criar a branch** `release/vX.Y.Z` e **atualizar a versão** nos arquivos de versão e nos lockfiles. Conferir o diff dos lockfiles: só a linha da versão do próprio app pode mudar.
4. **Transformar a seção "Não lançado" na versão nova**, com a data de hoje, e deixar no topo uma "Não lançado" vazia:
   - `## [X.Y.Z] - AAAA-MM-DD`, mantendo só as categorias com conteúdo (`### Novidades`, `### Correções`, `### Quebras`).
   - Só o que mudou para quem usa, em linguagem simples, sem falar de código.
   - `### Instalação`, com os arquivos que o CD gera e a versão anterior, se houver o que instalar.
5. **Atualizar o README e o backlog** com o que a versão muda.
6. **Se a versão mexeu no CD ou no build,** rodar o CD à mão nesta branch, porque o CI não prova o que o CD gera.
7. **Enviar:** chamar o agente `revisar-antes-de-enviar` (com a pasta, a branch e o resumo), mostrar o veredito e, se for ✅, fazer o push e abrir o PR. Esperar o CI verde.
8. **PARAR e mostrar ao usuário** o texto do CHANGELOG, o número da versão e o motivo do número. Pedir o OK para o merge e a tag.
9. **Com o OK:** fazer o merge, atualizar a branch principal local, conferir a versão nela e criar a tag `vX.Y.Z` no commit do merge. Enviar só essa tag.
10. **Acompanhar o CD** até o fim.
11. **Conferir o rascunho**, comparando de verdade:
    - O release está como rascunho, com a tag e o nome certos.
    - O texto das notas é **idêntico** à seção do `CHANGELOG.md` (ignorando diferenças de quebra de linha).
    - Os arquivos que o CD gera estão anexados, com a versão certa no nome, e o upload terminou.
12. **PARAR e avisar o usuário,** com o link do rascunho e o resultado de cada conferência. Quem publica é ele. Só publicar por ele se ele pedir, para esta versão.
13. **Depois de publicado:**
    - Conferir que o release é o mais recente.
    - Lembrar o usuário de fazer o teste rápido de quem usa.
    - **Só depois do ok dele nesse teste,** marcar a versão como concluída no backlog e anotar o próximo passo.
    - Se algo tiver dado errado na release, rodar a skill `guardar-licao`.

## Se der errado

- **CI vermelho no PR:** corrigir na branch; é o caminho normal, e nada foi publicado.
- **CD vermelho antes de existir rascunho:** a tag não foi publicada, mas não mexer nela sem combinar com o usuário. Mostrar a causa e sugerir o caminho.
- **Rascunho errado:** não publicar e não rodar o CD de novo. Mostrar a diferença ao usuário.
- **Erro achado depois de publicar:** corrigir numa versão patch nova, com esta mesma skill.
