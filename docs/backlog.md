# Backlog do sistema

Trabalho que vale para todos os projetos: skills, agentes, hooks, scripts e a configuração do Claude. O que é de um projeto fica no backlog dele. Criado em 08/11/2026 (achado de sistema 2026-11-07-5), com os itens de sistema que estavam no backlog do Tambor de Notas.

## Próximo

- **S1 (antes item 19 do Tambor). "Próximo" do backlog como tabela fixa** (item | estado | evidência | registro), validada por um teste que recusa item fora da tabela ou sem evidência. Origem: hansei do Tambor 2026-11-05-23, 2026-11-07-6 e -7, e a lição "regra que falha pela segunda vez vira código". Quando: na próxima limpeza do backlog. Estado: não iniciado.
- **S2 (antes item 20). `scripts/conferir-repos`:** mostra o git status e os commits sem push no projeto, no minhas-skills e no `~/.claude`, e é chamado pelo bom dia e pelo boa noite. Origem: hansei do Tambor 2026-11-07-8 e a lição "Tudo enviado é saída de script". Quando: depois da S4 do Tambor (decisão do usuário, 07/11). Estado: não iniciado.
- **S3 (antes item 22). Configurar o Claude do Ubuntu (WSL)**, onde ficam os MCPs `cadcraft` e `cadcraft-live` do projeto da casa. Opção B, aprovada pelo usuário em 07/11, sem data.
  - Instalar o node no Ubuntu, com a aprovação do usuário.
  - Ligar o `~/.claude` do Ubuntu aos mesmos repositórios (configuracao-claude e minhas-skills), sem copiar arquivos, para manter uma fonte só.
  - Hooks com caminhos que funcionem no Windows e no Ubuntu, incluindo os `C:/Projetos/...` do agente `hansei` (os comandos `hansei-registro.mjs add|status|abertos|listar` e o registro do sistema), que não existem no Ubuntu.
  - Ligar ali o hook `aviso-mcp-altera` (na main desde o PR #12) e testar o "⚠️ ALTERA:" com o app aberto.
  - Teste de ponta a ponta do modo ao vivo: com o app aberto, `query_entities` pelo `cadcraft-live` devolve `count`; com ele fechado, o erro claro. O "Connected" do `--lazy` não prova a conexão.
  - Resolve os achados de sistema 2026-11-07-1, -2 e -8. Evidência de 07/11: o `~/.claude` do Ubuntu só tem `backups`, `cache`, `downloads`, `ide` e `sessions`, sem `settings.json`, e `command -v node` não acha nada. Estado: não iniciado.

## Feito

- **(antes item 21 do Tambor) `hansei-registro.mjs` escapava o `|` de novo a cada gravação:** corrigido no PR #12 (merge `667cc5b`), com o teste "gravar duas vezes não muda o texto", que falhou antes da correção; os achados de sistema A, B e C do hansei do #12 foram gravados no PR #13 (merge `87adeb1`).
