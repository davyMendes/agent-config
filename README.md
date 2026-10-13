# Agent Config

Fonte única para instruções globais e skills pessoais usadas pelo Codex e pelo
Claude Code.

## Requisitos

- [Bun](https://bun.sh/)
- Codex e/ou Claude Code
- [jq](https://jqlang.org/), usado pela statusline
- No Windows, o Modo de Desenvolvedor ativado (ou terminal como administrador)
  para criar os links de arquivo; diretórios usam junctions e não exigem
  privilégio

## Estrutura

- `instructions/AGENTS.md`: instruções globais carregadas pelo Codex.
- `instructions/CLAUDE.md`: instruções globais do Claude Code; importa
  `AGENTS.md` para evitar duplicação.
- `skills/`: cópia canônica das skills pessoais.
- `claude/statusline-command.sh`: script da statusline do Claude Code,
  referenciado por `statusLine.command` em `~/.claude/settings.json`.
- `src/setup.ts`: instala os links, com dry-run e backup automático.
- `src/doctor.ts`: valida links, instruções e estrutura das skills.

## Instalação

Revise primeiro o que será alterado:

```bash
bun run setup -- --dry-run
```

Depois aplique:

```bash
bun run setup -- --apply
bun run doctor
bun run typecheck
```

O setup configura:

```text
~/.codex/AGENTS.md              → instructions/AGENTS.md
~/.claude/CLAUDE.md             → instructions/CLAUDE.md
~/.agents/skills                → skills/
~/.claude/skills                → skills/
~/.claude/statusline-command.sh → claude/statusline-command.sh
```

Destinos existentes são movidos para um diretório datado em
`~/.local/state/agent-config/backups/` antes da criação dos links. Executar o
setup novamente é seguro: links corretos não são recriados.

## Gerenciar skills com skills.sh

Use diretamente o CLI do `skills.sh`, sempre com escopo global:

```bash
bunx skills add owner/repo@skill -g -a codex -a claude-code
bunx skills update -g
bunx skills remove --global nome-da-skill
```

Como `~/.agents/skills` aponta para este repositório, instalações globais são
gravadas em `skills/`. O CLI também mantém o lock global próprio em
`~/.agents/.skill-lock.json`; ele não é versionado aqui.

Após adicionar, atualizar ou remover uma skill, revise as mudanças antes de
criar um commit:

```bash
git status --short
git diff
```

Não use uma instalação sem `-g` para este fluxo: o escopo padrão do CLI é o
projeto aberto no terminal.

## Referências

- [OpenAI: AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [OpenAI: skills](https://learn.chatgpt.com/docs/build-skills)
- [Claude Code: memory](https://code.claude.com/docs/en/memory)
- [Claude Code: skills](https://code.claude.com/docs/en/slash-commands)
- [Skills CLI](https://github.com/vercel-labs/skills)
