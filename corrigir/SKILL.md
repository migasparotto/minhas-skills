---
name: corrigir
description: Corrige um bug seguindo um roteiro fixo, do teste que reproduz até a lição. Usar quando o usuário relatar um bug ou pedir para corrigir um defeito, e quando disser "tem um erro", "deu bug", "não funciona" ou "sumiu". Um bug por vez, sem refatoração de passagem.
---

# Corrigir

Corrige um bug de modo que ele não volte, e que a causa dele vire aprendizado.

## Regras que nunca mudam

- **Um bug por vez.** Outro defeito achado no caminho é anotado e mostrado ao usuário, e não corrigido junto.
- **Correção mínima, sem refatoração de passagem.** O diff contém só o que o bug exige.
- **Nada de correção antes do teste que falha.**
- **Push e merge continuam dependendo do OK do usuário.**

## Passos

1. **Reproduzir:** pelos passos do relato, ou pelos dados de quem viu o bug. Guardar a saída inteira em arquivo antes de filtrar. Se não reproduzir, parar e mostrar o que foi tentado.
2. **Causa raiz:** rodar a skill `causa-raiz` e mostrar o resultado, com os irmãos do bug. Se a causa for só hipótese, dizer isso antes de seguir. Se o conserto mudar um comportamento combinado ou uma decisão dos documentos, parar e levar para debate.
3. **Teste de regressão:** escrever o teste na camada mais baixa que pega o bug, e rodar para **vê-lo falhar pelo motivo certo**. Mostrar a falha. Cobrir também o caso de borda (vazio, zero, nenhum item), não só o caso visto. Se o bug só existir na tela ou no sistema, o teste é de ponta a ponta.
4. **Correção mínima**, em branch própria.
5. **Teste verde:** o de regressão e a suíte inteira, com lint e build. Se o conserto mudar um critério, atualizar também o backlog e o README.
6. **Enviar:** um commit com o bug e a causa na mensagem. Rodar a skill `revisar-antes-de-enviar`, mostrar o veredito e, com o OK do usuário, fazer o push e abrir o PR. Esperar o CI verde.
7. **Pedir o reteste** a quem relatou, com o passo exato que falhava.
8. **Guardar a lição:** rodar a skill `guardar-licao` com o resultado da `causa-raiz`, sem refazer a análise.
