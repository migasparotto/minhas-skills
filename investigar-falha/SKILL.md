---
name: investigar-falha
description: Investiga uma falha sem causa conhecida, da evidência à causa provável. Usar quando o app cair ou fechar sozinho, quando um teste passar e falhar sem mudança no código, e quando o usuário disser "caiu", "fechou sozinho", "travou" ou "falha intermitente". Não corrige: entrega a causa à skill corrigir.
---

# Investigar falha

Descobre por que algo falhou, olhando primeiro o que a falha deixou registrado. Para um bug que se reproduz com facilidade, usar direto a skill `corrigir`.

## Regras que nunca mudam

- **Evidência antes de hipótese.** Nada de mudar código para "ver se resolve".
- **Copiar a evidência logo.** Os logs do sistema são circulares e apagam o que é antigo.
- **Ausência de evento só prova algo se o log cobre aquele horário.** Conferir o registro mais antigo antes de concluir.
- **Toda ferramenta invasiva roda numa cópia,** nunca nos dados reais. O que for ligado no sistema é desligado no fim, e isso é conferido.
- **Instalar ou ligar uma ferramenta de sistema depende do OK do usuário.**
- **Dumps e logs ficam na máquina:** podem ter dados pessoais. Nunca entram no repositório.

## Passos

1. **Guardar a evidência automática:** ler o que testes e app já salvaram, como a saída completa, o print e o log. Se a falha não deixou nada, esse é o primeiro problema a resolver.
2. **Anotar o horário exato** e o que estava aberto. Copiar os logs relevantes para uma pasta fora do repositório.
3. **Visualizador de Eventos (Windows):**
   - **Aplicativo:** IDs 1000 e 1001, com módulo e código do erro.
   - **Segurança:** `Microsoft-Windows-CodeIntegrity/Operational`, IDs 3033 e 3077, para bloqueios como o do Smart App Control.
   - Em outros sistemas, usar os logs equivalentes.
4. **Dump e pilha:** ler o dump, com os símbolos da versão exata. Em corrupção de memória, a função no topo costuma ser a vítima, não a culpada.
5. **Comparar versões:** a falha existe em qual versão? O que mudou entre elas nos lockfiles, no código inseguro (`unsafe`) e nas bibliotecas que aparecem na pilha?
6. **Reproduzir:** repetir o cenário e contar: "1 em 21", não "às vezes". Um limite claro (só depois de compilar, só parado) também é evidência.
7. **Ferramentas numa cópia,** se ainda não houver causa: page heap, para parar na escrita errada; estresse, acelerando o que roda sozinho; execução longa com o app parado.
8. **Causa raiz:** rodar a skill `causa-raiz` com o que foi comprovado. Se parar numa hipótese, dizer isso.
9. **Decidir o próximo passo:**
   - **Causa comprovada, no nosso código:** usar a skill `corrigir`.
   - **Causa externa:** registrar a causa e o que fazer quando ela voltar.
   - **Sem causa:** deixar em observação, com o critério que reabre a investigação, e melhorar a evidência para a próxima vez.

## Formato do resultado

**Falha:** <o que, quando, em qual versão>
**Evidência:** <o que foi lido | o que não cobre o horário>
**Tentado:** <o que não reproduziu ou não ajudou, com números>
**Causa:** <comprovada: evidência | hipótese | desconhecida>
**Próximo passo:** <corrigir | registrar | observação, e o que reabre>

## Casos reais

### Resolvido: `spawn UNKNOWN` no e2e (Tambor, 02/11/2026)
Tratado como instabilidade por uma sessão. Com a saída guardada, o erro ficou exato, e o log do `CodeIntegrity` mostrou os eventos 3033 e 3077 no mesmo segundo: o Smart App Control bloqueava o `.exe` recém-compilado. **Foi o passo 3 que resolveu.** Repetir os testes, sozinho, não dizia nada.

### Em aberto: queda de memória (Tambor, 01/11/2026)
`0xc0000005` em `ntdll.dll`, com o app parado.
- **Ajudou:** o evento e o dump mostraram a queda num pedido de memória do `wry`, o que sugere corrupção anterior.
- **Não reproduziu:** 1.749 trocas de foco, 2h25 aberto, 20 min de page heap com a consulta do cursor a 1 ms.
- **Não concluiu:** o log do `CodeIntegrity` foi consultado tarde e já não cobria os horários.
- **Reabre se:** cair de novo, comparando o dump novo com o primeiro.
