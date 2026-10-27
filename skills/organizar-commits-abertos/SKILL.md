---
name: organizar-commits-abertos
description: Analisa alteracoes locais ainda nao commitadas, corrige problemas mecanicos de whitespace, organiza o trabalho em commits funcionais e cria esses commits com mensagens claras e amigaveis. Use quando o usuario pedir para revisar, separar, organizar ou realizar os commits das mudancas em aberto no repositorio atual; nao use para apenas resumir um branch ou preparar uma descricao de PR.
---

# Organizar Commits Abertos

Transforme o estado local do repositorio em commits pequenos, especificos e compreensiveis, preservando o conteudo produzido pelo usuario, exceto pelas correcoes mecanicas de whitespace permitidas nesta skill.

## Respeite a autorizacao

- Considere autorizada a criacao de commits somente quando o pedido incluir explicitamente executar, fazer, criar ou realizar os commits. Se o usuario pedir apenas analise, revisao ou um plano, mantenha o trabalho somente leitura.
- A autorizacao cobre apenas adicionar ao indice e criar novos commits com as mudancas locais em escopo.
- Nao execute `push`, `pull`, `fetch`, troca de branch, merge, rebase, amend, reset, tag ou criacao de PR sem um pedido explicito separado.
- Nao altere o codigo para melhorar, corrigir ou formatar as mudancas durante este fluxo, exceto para remover trailing whitespace apontado por `git diff --check`. Se encontrar outro defeito relevante, segredo, artefato gerado ou duvida de autoria, pare antes do commit afetado e explique objetivamente.
- Nunca descarte mudancas. Preserve arquivos, hunks parcialmente staged e trabalho nao relacionado.

## Corrija whitespace com seguranca

- Quando `git diff --check` apontar trailing whitespace em linhas adicionadas ou alteradas que estejam no escopo dos commits, remova somente os espacos ou tabs ao final dessas linhas. Se uma linha adicionada contiver apenas whitespace, deixe-a vazia preservando a quebra de linha.
- Considere essa limpeza mecanica autorizada junto com a organizacao dos commits; nao solicite confirmacao adicional somente para ela.
- Nao execute formatador global, nao normalize o arquivo inteiro e nao altere indentacao, encoding ou finais de linha como efeito colateral.
- Em arquivos com hunks parcialmente staged ou com mudancas de grupos diferentes, corrija apenas as ocorrencias apontadas e revise novamente os diffs staged e unstaged para garantir que nenhuma intencao do usuario foi alterada.
- Depois da limpeza, execute novamente `git diff --check`. Se ainda houver erro ou a correcao exigir interpretar ou reescrever codigo, pare antes do commit afetado e explique o bloqueio.

## Entenda o estado real

1. Localize a raiz do repositorio, leia as instrucoes aplicaveis como `AGENTS.md` e confirme o branch atual.
2. Inspecione `git status --short --branch`, as diferencas staged e unstaged, os arquivos nao rastreados e os submodulos relevantes. Leia o conteudo dos arquivos nao rastreados antes de inclui-los.
3. Consulte commits recentes para seguir o idioma e o estilo real das mensagens, sem copiar titulos vagos.
4. Identifique o framework, a solucao ou o mecanismo de validacao somente no nivel necessario para validar as mudancas com compatibilidade.
5. Explique em uma atualizacao curta quais grupos funcionais serao commitados e prossiga sem pedir confirmacao quando a divisao for segura e o usuario ja tiver autorizado os commits.

## Forme commits pequenos e coerentes

Use como unidade a menor mudanca com um objetivo funcional claro, que possa ser revisada e, quando praticavel, revertida isoladamente. O fato de alteracoes pertencerem ao mesmo modulo, arquivo, fluxo maior ou pedido do usuario nao basta para reuni-las.

- Identifique primeiro os resultados independentes das mudancas. Separe correcoes de defeitos distintos, regras de negocio distintas e contratos ou endpoints distintos, mesmo quando estiverem no mesmo servico ou arquivo.
- Mantenha juntos codigo, contrato, registro de dependencia, migracao e teste que sejam necessarios para completar um unico resultado. Nao fragmente uma mudanca que deixaria commits intermediarios incompletos ou enganosos.
- Separe documentacao, configuracao, refatoracao e ajustes de testes quando forem objetivos autonomos. Se uma dessas partes apenas viabilizar ou comprovar a mudanca principal, mantenha-a com ela.
- Nao imponha limite fixo de arquivos, linhas ou commits. O criterio e a independencia do proposito, nao o tamanho mecanico do diff.
- Teste cada grupo com uma frase: "Este commit [verbo] [resultado concreto]". Se a frase precisar de "e tambem", "diversas melhorias" ou uma lista de resultados independentes, divida o grupo.
- Se um arquivo contiver mudancas independentes, use staging por hunk quando os limites forem inequivocos. Nunca reescreva o arquivo apenas para facilitar o staging. Se a separacao exigir interpretar ou reconstruir codigo, mantenha a unidade segura e explique a limitacao.
- Respeite um agrupamento ja staged quando ele for coerente. Se reorganiza-lo puder apagar a intencao do usuario ou misturar hunks staged e unstaged, solicite orientacao antes de mudar o indice.
- Inclua arquivos novos ou removidos apenas quando sua relacao com o grupo estiver comprovada.
- Exclua credenciais, arquivos locais de ambiente, binarios, saidas de build e artefatos gerados, salvo quando o repositorio demonstrar claramente que sao versionados de proposito.

Antes do primeiro commit, apresente um plano curto com um titulo provisorio por grupo e os principais arquivos ou hunks de cada um. Revise esse plano ao encontrar dependencias no diff. Cada commit deve representar uma unidade revisavel e, quando praticavel, deixar o projeto em estado consistente.

## Valide antes de gravar

- Execute `git diff --check` sobre as mudancas em escopo.
- Rode a validacao focada indicada pelo repositorio e proporcional ao risco, como build ou testes do projeto afetado. Nao acione integracoes de producao ou testes manuais sem autorizacao.
- Se uma validacao falhar por causa provavel da mudanca, nao crie o commit afetado. Relate o erro e o caminho causal observado.
- Se a falha for claramente preexistente ou ambiental, registre a limitacao e continue apenas quando isso nao esconder um problema introduzido pelas mudancas.

## Crie cada commit com controle explicito

Para cada grupo:

1. Adicione somente os caminhos ou hunks planejados. Evite `git add .`, `git add -A` sem caminhos e globais equivalentes.
2. Revise `git diff --cached --stat` e o diff staged completo.
3. Confirme que o indice contem apenas a unidade planejada e execute `git diff --cached --check`.
4. Siga o formato predominante do repositorio. Quando ele usar emojis, use um unico emoji no inicio do titulo, escolhido pelo efeito principal. Quando adotar Conventional Commits, use `tipo(escopo): descricao` sem acrescentar emoji antes do tipo. Se nao houver padrao, prefira Conventional Commits.
5. Escreva o titulo em portugues com uma acao e um resultado concreto no dominio; inclua o objeto ou a condicao afetada quando isso distinguir o commit. Prefira `🐛 corrige persistencia da gorjeta no pedido` a `🐛 altera MesaServico`. Evite titulos que apenas nomeiem arquivos, camadas ou "ajustes".
6. Para mudancas nao triviais, acrescente um corpo curto que explique o comportamento anterior, o novo comportamento e a motivacao. Cite detalhes tecnicos que ajudem a revisar, como endpoint, tabela ou restricao de compatibilidade. Se o corpo precisar enumerar varios resultados independentes, volte ao plano e divida o commit. Nao repita o titulo, a lista completa de arquivos nem estatisticas do diff.
7. Revise a mensagem completa junto com o diff staged antes de criar o commit.
8. Registre o hash e o titulo criados antes de seguir ao proximo grupo.

### Convencao para os titulos

A granularidade segue o principio de mudancas logicas e independentes do Git. Conventional Commits padroniza a forma da mensagem, nao determina quantas alteracoes entram em cada commit. Use `feat` para funcionalidade e `fix` para correcao; escolha tipos como `refactor`, `test`, `docs` e `chore` quando refletirem o objetivo e o historico local. O escopo, quando usado, deve nomear o modulo ou dominio afetado. Nao force esse formato em um repositorio que ja segue outro padrao consistente.

### Escolha o emoji pelo efeito principal

Use a taxonomia abaixo como guia sem transformar o titulo em decoracao. Quando o commit tiver mais de um tipo de mudanca, escolha o emoji que represente sua finalidade principal e explique os efeitos secundarios no corpo.

| Efeito principal | Emoji |
| --- | --- |
| Funcionalidade nova | `✨` |
| Correcao de defeito | `🐛` |
| Correcao critica ou urgente | `🚑` |
| Refatoracao interna | `🔨` |
| Melhoria de estrutura ou formatacao | `🎨` |
| Interface ou ajuste visual | `🎨` |
| Desempenho | `🐎` |
| Seguranca | `🔒` |
| Testes adicionados ou atualizados | `✅` |
| Documentacao | `📚` |
| Comentarios ou documentacao no codigo | `💡` |
| Configuracao ou build | `🔧` |
| Integracao continua | `👷` |
| Correcao da integracao continua | `💚` |
| Dependencia adicionada ou removida | `➕` ou `➖` |
| Dependencia atualizada ou rebaixada | `⬆️` ou `⬇️` |
| Codigo ou arquivo removido | `🔥` |
| Arquivo movido ou renomeado | `🚚` |
| Reversao de mudanca | `⏪` |
| Mudanca incompativel | `💥` |
| Container ou Docker | `🐳` |
| Implantacao | `🚀` |
| Versao ou release | `🔖` |

Use outro emoji simples somente quando nenhuma categoria representar bem a finalidade. Evite emojis ambiguos, mais de um emoji no titulo e commits `WIP`, salvo pedido explicito do usuario.

Exemplo de mensagem para uma mudanca nao trivial:

```text
🐛 persiste a gorjeta informada no pedido Fast Food

- Define o valor solicitado antes de salvar a mesa.
- Evita divergencia entre o valor emitido e o valor registrado no pedido.
```

Se o indice ficar vazio, nao crie commit vazio.

## Confira e apresente o resultado

Ao terminar:

- Verifique `git status --short --branch` e os commits recem-criados.
- Confirme quais mudancas permaneceram abertas, se houver, e por que nao foram incluidas.
- Informe as validacoes executadas e diferencie sucesso, falha de codigo, falha ambiental e verificacao nao executada.
- Entregue um resumo amigavel em portugues, listando cada hash curto, titulo e descricao funcional. Diga explicitamente que nenhum `push` foi realizado.
