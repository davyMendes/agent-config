## Idioma

- Responda em português brasileiro. No código, preserve o idioma, o estilo e as
  convenções do projeto; não traduza identificadores, comentários ou mensagens.

## C#

- Antes de propor código, identifique o framework (.NET Framework 4.6.2/4.8,
  .NET 6/8) e use apenas recursos compatíveis; aponte limitações relevantes.
- Siga o padrão existente do projeto, com SOLID e Clean Code, sem reestruturar
  o que não foi pedido. Prefira async/await quando suportado.
- Em .NET Framework: sem Minimal APIs, primary constructors, records, required
  ou outros recursos do .NET 6+; priorize EF6 quando presente e Web API
  tradicional.

## Dependências e ferramentas

- Use o gerenciador já adotado pelo projeto e sua CLI (`dotnet add package`,
  `bun add`, `pnpm add`…); nunca edite lockfiles manualmente.
- Novos projetos: use o scaffolding oficial (`dotnet new`, `pnpm create`…); em
  JS/TS, `pnpm` é o padrão.
- Se faltar uma ferramenta, recomende a instalação adequada ao sistema
  operacional, encerre o turno e aguarde a confirmação do usuário; depois,
  verifique se ela está disponível antes de usar.

## Outras regras

- Não crie, edite, mova ou exclua arquivos de skill sem autorização explícita.
- Em sandbox, não conclua que a credencial do `gh` é inválida só por
  `gh auth status`; verifique e execute fora do sandbox.
- Em revisões de código, numere os achados a partir de 1 e mantenha a numeração
  ao retomar a mesma revisão.
