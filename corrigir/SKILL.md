---
name: corrigir
description: Corrige um bug seguindo um roteiro fixo, do teste que reproduz até a lição. Usar quando o usuário relatar um bug ou pedir para corrigir um defeito, e quando disser "tem um erro", "deu bug", "não funciona" ou "sumiu". Um bug por vez, sem refatoração de passagem.
---

# Corrigir

Corrige um bug de modo que ele não volte, e que a causa dele vire aprendizado.

## Regras que nunca mudam

- **Um bug por vez, a classe inteira.** Os irmãos com a mesma causa entram no mesmo PR, cada um com teste. Causa diferente é outro bug: é anotado e mostrado ao usuário, e não corrigido junto.
- **Correção mínima, sem refatoração de passagem.** O diff contém só o que o bug exige.
- **Sem sujeira (slop):** nada de código morto ou comentado, abstração especulativa, tratamento "por via das dúvidas", erro engolido, teste enfraquecido para passar ou `TODO` no lugar do trabalho.
- **Nada de correção antes do teste que falha.**
- **Push e merge continuam dependendo do OK do usuário.**

## Passos

1. **Reproduzir:** pelos passos do relato, ou pelos dados de quem viu o bug. Guardar a saída inteira em arquivo antes de filtrar. Se não reproduzir, parar e mostrar o que foi tentado.
2. **Causa raiz:** rodar a skill `causa-raiz` e mostrar o resultado, com os irmãos do bug. Se a causa for só hipótese, dizer isso antes de seguir. Se o conserto mudar um comportamento combinado ou uma decisão dos documentos, parar e levar para debate.
3. **Teste de regressão:** escrever o teste na camada mais baixa que pega o bug, e rodar para **vê-lo falhar pelo motivo certo**. Mostrar a falha. Cobrir também o caso de borda (vazio, zero, nenhum item), não só o caso visto. **Se o código chama uma ferramenta de fora (shell, comando do sistema, API), o teste roda a ferramenta de verdade no caso vazio**, não só a função que lê a saída dela: "nada encontrado" é resultado, e o código de saída da ferramenta pode dizer o contrário (Tambor, 07/11/2026: o `Get-Process` sem processo sai com 1 no `powershell -Command`, e o teste só lia um texto vazio). Cada irmão com a mesma causa ganha o seu teste. Se o bug só existir na tela ou no sistema, o teste é de ponta a ponta.
4. **Correção mínima**, em branch própria, incluindo os irmãos com a mesma causa. Se um dado mudar de formato, conferir todos os que o consomem, e não só o do bug. **Passo fixo, mesmo que a `causa-raiz` não aponte irmãos:** procurar o padrão do erro (ex.: `toISOString`, `merged:`) no repositório inteiro e nos vizinhos que o mesmo código alcança (outros scripts, skills, o outro repositório), com `grep` ou a busca da ferramenta, e mostrar no resumo o padrão, onde procurou e o que achou. O que tiver a mesma causa entra no PR; o resto é anotado. (Achado 2026-11-05-11 do Tambor: o mesmo bug de UTC apareceu no script vizinho no mesmo dia.)
5. **Teste verde:** o de regressão e a suíte inteira, com lint e build. Rodar cada conferência numa etapa própria e ler o código de saída antes de seguir: nunca encadear conferência com commit, merge ou push no mesmo comando. Se o conserto mudar um critério, atualizar também o backlog e o README. Se mudar algo para quem usa, acrescentar uma linha em "Correções", na seção "Não lançado" do `CHANGELOG.md`.
6. **Enviar:** um commit com o bug e a causa na mensagem. Se a correção atende a um achado do hansei, o mesmo commit marca o achado como feito no registro do projeto (`node <minhas-skills>/scripts/hansei-registro.mjs status docs/hansei.md <ID> feito "<PR e o que foi corrigido>"`), para o registro nunca ficar atrás do código. (Hansei 2026-11-07-9 do Tambor: o PR #51 dizia "-17 e -19 feitos" e o registro seguia "aceito".) Chamar o agente `revisar-antes-de-enviar` (com a pasta, a branch e o resumo), mostrar o veredito e, com o OK do usuário, fazer o push e abrir o PR. Esperar o CI verde **no commit exato enviado**: job pendente ou pulado não é verde.
7. **Pedir o reteste** a quem relatou, com o passo exato que falhava.
8. **Guardar a lição:** rodar a skill `guardar-licao` com o resultado da `causa-raiz`, sem refazer a análise.
