---
name: preparar-pr
description: Revisa o branch atual para abrir um PR - analisa o diff próprio do branch, corrige whitespace, mantém a versão do aplicativo e entrega a descrição do PR em português pronta para o GitHub. Use quando o usuário pedir para preparar, revisar ou descrever um PR/branch. Não faz commit, push nem cria o PR sem pedido explícito.
---

# Preparar PR

Revise o branch, corrija o que for mecânico, mantenha a versão e entregue a descrição do PR em português. Não faça commit, push, tag nem crie o PR sem pedido explícito. Preserve trabalho local não relacionado.

Variações do pedido:
- **Só a descrição** ou **análise somente leitura**: não edite arquivos.
- **Só o texto para colar**: entregue apenas o Markdown da descrição, sem bloco de código nem relatório.
- Escopo, ordem ou formato explícitos do usuário prevalecem.

## 1. Coletar contexto (uma chamada)

Rode um `git fetch --quiet <remote>` (se falhar, avise que a base local pode estar defasada) e então, em uma única chamada Bash:

```bash
base="${BASE:-}"   # base informada pelo usuário, se houver
if [ -z "$base" ]; then
  for c in "$(git symbolic-ref -q --short refs/remotes/origin/HEAD)" origin/main origin/master main master; do
    [ -n "$c" ] && git rev-parse -q --verify "$c^{commit}" >/dev/null && base="$c" && break
  done
fi
mb=$(git merge-base "$base" HEAD)
echo "branch: $(git branch --show-current) | base: $base | merge-base: ${mb:0:9}"
echo "--- status"; git status --short
echo "--- commits"; git log --oneline --no-merges "$mb"..HEAD
echo "--- arquivos"; git diff --stat=120 -M "$base"...HEAD
echo "--- versao"; git diff "$base"...HEAD --name-only | grep -iE 'versao|version|AssemblyInfo|Directory\.Build\.props|\.csproj$' || echo "(nenhum arquivo de versão no diff)"
echo "--- whitespace"; { git diff --check "$base"...HEAD; git diff --cached --check; git diff --check; } || true
```

- Considere apenas o diff `base...HEAD`; ignore o que veio da base por merge. Commits são contexto, a conclusão vem do diff.
- Mudanças staged/não staged ainda não estão no PR; trate-as separadamente.
- Se a base for ambígua (bases plausíveis com resultados diferentes), pergunte.

## 2. Revisar

Leia o diff dos arquivos relevantes (`git diff "$base"...HEAD -- <arquivos>`), na profundidade proporcional ao tamanho e ao risco. Avalie comportamento, contratos públicos, compatibilidade e riscos. Relate problemas com evidência (arquivo:linha); não altere regra de negócio nem refatore.

## 3. Corrigir whitespace

Corrija apenas as linhas apontadas pelo `--check`, com edições pontuais, sem reformatar arquivos e preservando codificação e quebras de linha. Correção de algo já commitado só aparece no PR após um novo commit; não reescreva histórico.

## 4. Manter a versão

Localize a fonte efetiva da versão do aplicativo (ex.: `versao.txt`, `Directory.Build.props`, `.csproj`, `AssemblyInfo.cs`) e compare base atual, `HEAD` e trabalho local:

- Já incrementada no branch ou localmente: não incremente de novo; só sincronize registros divergentes.
- Não incrementada: siga a convenção comprovada no histórico (`git log --oneline -5 -- <arquivo>`) e garanta que avança em relação à base atual.
- Convenção ambígua, versão gerada automaticamente ou conflito com a base: não invente número; pergunte.

Não toque em versões de bibliotecas, testes ou artefatos não relacionados, nem crie arquivo de versão novo. Edite com a ferramenta Edit (não `sed -i`, que no Git Bash troca CRLF por LF).

## 5. Validar

Se editou algo, rode de novo os três `--check` e `git status --short`. Faça build ou teste focado só quando o risco justificar. Nunca rode testes contra produção, banco real, SEFAZ ou serviços externos sem autorização. Diferencie validação aprovada, não executada e inconclusiva.

## 6. Entregar

Resposta final nesta ordem, sem introdução nem fechamento:

1. `## 🔎 Problemas encontrados` — erros funcionais, whitespace, versão, riscos e pendências (incluindo o que depende de commit para entrar no PR), em grupos `✅ Corrigido`, `⚠️ Em aberto` e `🧪 Validações`. Cite os arquivos alterados localmente. Se nada for encontrado, diga isso sem afirmar que o branch está livre de erros.
2. `## 📝 Descrição do PR` — um único bloco ```` ```markdown ```` pronto para colar. Agrupe por comportamento funcional (não por commit ou arquivo); omita seções vazias. Não inclua mudanças da base, fatos não confirmados nem testes não executados como aprovados. Avisos sobre commits pendentes ficam fora do bloco.

### Estilo da descrição

Títulos amigáveis e com emoji, no padrão gitmoji do repositório:

- **Título do PR**: `# <emoji> <resultado em linguagem de negócio> - v<versão>`, curto e sem nome de classe. Emoji pelo tipo principal: 🐛 correção, ✨ funcionalidade nova, 🆙 melhoria/atualização, ⚡ desempenho, 🔒 segurança, ♻️ refatoração. Ex.: `# 🐛 Pedido do iFood não é mais gravado sem itens - v3.14.16`.
- **Seções**: `## 📋 Resumo`, `## 🔧 Principais alterações`, `## 🏷️ Versionamento`, `## ✅ Validações realizadas`, `## ⚠️ Pontos de atenção`.
- **Subtítulos** em Principais alterações: `### <emoji> <tema>` com emoji do assunto (ex.: 🍕 pedido, 🛵 iFood, 🗃️ banco/log, 🛠️ desenvolvimento).
- Um emoji por título; não use emojis no meio das frases.
