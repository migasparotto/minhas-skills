---
name: causa-raiz
description: Acha a causa raiz de um erro e a transforma numa regra geral. Usar quando o usuário pedir "causa raiz" ou "por que isso aconteceu", e quando outra skill chamar, como a guardar-licao e a corrigir. Só analisa: não corrige nem grava.
---

# Causa raiz

Leva do sintoma à causa, e da causa a uma regra que serve além deste caso.

**Só analisa e mostra.** Quem corrige ou grava é quem chamou.

## Passos

1. **Juntar a evidência:** a mensagem de erro, o arquivo ou o dado que mostra o que aconteceu. Sem evidência, buscá-la antes de analisar.
2. **Cinco porquês:** perguntar "por quê?" sobre o que aconteceu, e de novo sobre cada resposta, até chegar à causa raiz. Cinco é uma referência: parar quando a próxima resposta sair do que se pode mudar.
3. **Separar o comprovado da hipótese:** marcar cada resposta como comprovada (e por qual evidência) ou como hipótese. Se a cadeia parar numa hipótese, dizer isso em vez de inventar uma causa.
4. **Experimento,** quando uma hipótese pode ser testada mudando algo: escrever antes de rodar os cinco pontos do passo 7 ("Experimento") da skill [`investigar-falha`](../investigar-falha/SKILL.md), que é o único lugar deles; ler o passo lá, não de memória. Aqui o experimento só é proposto: quem chamou é que o roda.
5. **Procurar os irmãos:** buscar no código outras ocorrências da mesma causa e listá-las, com arquivo e linha. Dizer também onde se procurou, para "nenhum" significar alguma coisa. Só listar: quem decide o que fazer com eles é quem chamou.
6. **Escrever em dois níveis:**
   - **Regra geral:** o que acontece + o que fazer, sobre a causa e não sobre o sintoma.
   - **Caso:** o que aconteceu, em uma frase.
7. **Teste de abstração:** a regra serviria em outro projeto, outra linguagem e outro tipo de ferramenta? Se só serve nesse tipo de ferramenta, subir um nível. O detalhe da ferramenta fica como exemplo.
8. **Kaizen, antes de encerrar:** responder sempre as 3 perguntas, mesmo que a resposta seja "nenhum":
   1. **Onde mais?** O mesmo problema existe em outro ambiente (teste, e2e local, CI, app no PC, CD), script, skill ou projeto? O passo 5 olha o código; este olha todo lugar onde o código roda e todo processo parecido.
   2. **Que mecanismo impede a repetição?** Teste, script, regra do GitHub ou permissão, não só um texto.
   3. **Em que camada?** Projeto (`CLAUDE.md` dele), todos os projetos (`~/.claude/CLAUDE.md`) ou projetos futuros (cartilha).

   Se alguma resposta não for "nenhum", entregar a quem chamou, para ele propor no formato 💡 KAIZEN PROPOSTO (da skill `guardar-licao`).

## Formato do resultado

**Porquês:**
1. <por quê?> → <resposta> (comprovado: <evidência> | hipótese)
2. ...

**Causa raiz:** <uma frase>
**Experimento:** <proposto, com os cinco pontos | nenhum>
**Irmãos:** <arquivo:linha e o motivo | nenhum, procurado em <onde>>
**Regra geral:** <uma linha>
**Caso:** <uma frase>
**Kaizen:** onde mais: <lugares | nenhum, procurado em <onde>> · mecanismo: <qual | nenhum> · camada: <projeto | todos | futuros>
