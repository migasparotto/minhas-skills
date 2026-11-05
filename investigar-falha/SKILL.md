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

1. **Guardar a evidência automática:** ler o que testes e app já salvaram, como a saída completa, o print e o log. **Falha relatada é falha medida:** antes de descrever a falha a alguém, tirar do log (1) a contagem de falhas e de aprovações (ex.: "8 falharam, 7 passaram", nunca "um teste falhou"); (2) o primeiro erro de cada tipo, com a linha; (3) o link do run ou o caminho do log. Sem os três, a falha não foi medida. Se a falha não deixou nada, esse é o primeiro problema a resolver, e não só ali: a mesma evidência costuma faltar nos outros lugares onde o código roda (ver o passo 11).
2. **Anotar o horário exato** e o que estava aberto. Copiar os logs relevantes para uma pasta fora do repositório.
3. **Visualizador de Eventos (Windows):**
   - **Aplicativo:** IDs 1000 e 1001, com módulo e código do erro.
   - **Segurança:** `Microsoft-Windows-CodeIntegrity/Operational`, IDs 3033 e 3077, para bloqueios como o do Smart App Control.
   - Em outros sistemas, usar os logs equivalentes.
4. **Dump e pilha:** ler o dump, com os símbolos da versão exata (o `.pdb` que bate com o `.exe`). Em corrupção de memória, a função no topo costuma ser a vítima, não a culpada. Listar também os módulos carregados que não são do sistema nem do app: programas como drivers de áudio injetam DLLs em quase todos os processos, e elas são suspeitas naturais.
5. **Comparar versões:** a falha existe em qual versão? O que mudou entre elas nos lockfiles, no código inseguro (`unsafe`) e nas bibliotecas que aparecem na pilha?
6. **Reproduzir:** repetir o cenário e contar: "1 em 21", não "às vezes". Um limite claro (só depois de compilar, só parado) também é evidência.
7. **Experimento,** quando uma hipótese pode ser testada mudando algo: escrever antes de rodar (1) a hipótese; (2) o estado de partida, com prova (o que o ambiente já faz: configuração, exclusões, versões, lido de verdade); (3) a única variável que muda; (4) o tipo e o número de execuções, iguais dos dois lados (não comparar, por exemplo, disparo manual com push); (5) o critério que confirma e o que derruba a hipótese. Sem os cinco escritos, não é experimento, é tentativa. Este é o único lugar dos cinco pontos: a `causa-raiz` e a lição do `CLAUDE.md` de usuário apontam para cá, e qualquer mudança neles é feita só aqui.
8. **Ferramentas numa cópia,** se ainda não houver causa: page heap, para parar na escrita errada; estresse, acelerando o que roda sozinho; execução longa com o app parado.
9. **Causa raiz:** rodar a skill `causa-raiz` com o que foi comprovado. Se parar numa hipótese, dizer isso.
10. **Decidir o próximo passo:**
   - **Causa comprovada, no nosso código:** usar a skill `corrigir`.
   - **Causa externa:** registrar a causa e o que fazer quando ela voltar.
   - **Sem causa:** deixar em observação, com o critério que reabre a investigação, e melhorar a evidência para a próxima vez.
11. **Kaizen, antes de encerrar:** responder sempre as 3 perguntas, mesmo que a resposta seja "nenhum":
    1. **Onde mais?** A mesma falha, ou a mesma falta de evidência, existe em outro ambiente (teste, e2e local, CI, app no PC, CD), script, skill ou projeto?
    2. **Que mecanismo impede a repetição?** Teste, script, regra do GitHub ou permissão, não só um texto.
    3. **Em que camada?** Projeto (`CLAUDE.md` dele), todos os projetos (`~/.claude/CLAUDE.md`) ou projetos futuros (cartilha).

    Se alguma resposta não for "nenhum", propor no formato 💡 KAIZEN PROPOSTO, da skill `guardar-licao`.

## Formato do resultado

**Falha:** <o que, quando, em qual versão>
**Medida:** <N falharam, M passaram · primeiro erro de cada tipo · link do run ou caminho do log>
**Evidência:** <o que foi lido | o que não cobre o horário>
**Tentado:** <o que não reproduziu ou não ajudou, com números>
**Causa:** <comprovada: evidência | hipótese | desconhecida>
**Próximo passo:** <corrigir | registrar | observação, e o que reabre>
**Kaizen:** onde mais: <lugares | nenhum, procurado em <onde>> · mecanismo: <qual | nenhum> · camada: <projeto | todos | futuros>

## Casos reais

### Resolvido: `spawn UNKNOWN` no e2e (Tambor, 02/11/2026)
Tratado como instabilidade por uma sessão. Com a saída guardada, o erro ficou exato, e o log do `CodeIntegrity` mostrou os eventos 3033 e 3077 no mesmo segundo: o Smart App Control bloqueava o `.exe` recém-compilado. **Foi o passo 3 que resolveu.** Repetir os testes, sozinho, não dizia nada.

### Em aberto: queda de memória (Tambor, 01/11/2026 e 02/11/2026)
`0xc0000005` em `ntdll.dll`, com o app parado.
- **Ajudou:** o evento e o dump mostraram a queda num pedido de memória do `wry`, o que sugere corrupção anterior.
- **Não reproduziu:** 1.749 trocas de foco, 2h25 aberto, 20 min de page heap com a consulta do cursor a 1 ms.
- **Não concluiu:** o log do `CodeIntegrity` foi consultado tarde e já não cobria os horários.
- **Caiu de novo em 02/11:** outro deslocamento no `ntdll` (`0x39531`, antes `0x88d4`): conferir o deslocamento nos dois eventos antes de dizer "mesma assinatura". De novo dentro do gerenciador de memória, chamado por uma mensagem de janela. O único módulo de terceiros nos dois dumps é uma DLL da Nahimic (áudio) injetada em quase todos os processos; o `unsafe` do app foi revisado sem achado. Próximos passos: `.pdb` de cada versão, Application Verifier e WinDbg.
- **Experimento que não testou nada:** a exclusão do Defender no runner do CI foi comparada sem ler o estado de partida (os discos já estavam excluídos) e com tipos de execução diferentes dos dois lados (manual contra push). Daí o passo 7.
- **Kaizen que faltou:** a falha do e2e no CI ficou sem evidência, e só o usuário perguntou onde mais ela faltava. Daí o passo 11.
