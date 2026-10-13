import { homedir } from "node:os";
import { join, resolve, sep } from "node:path";

export type LinkSpec = {
  label: string;
  source: string;
  target: string;
};

export const homeDir = homedir();
export const repoRoot = resolve(import.meta.dir, "..");
export const instructionsDir = join(repoRoot, "instructions");
export const skillsDir = join(repoRoot, "skills");
export const claudeDir = join(repoRoot, "claude");

export const linkSpecs: LinkSpec[] = [
  {
    label: "Instruções globais do Codex",
    source: join(instructionsDir, "AGENTS.md"),
    target: join(homeDir, ".codex", "AGENTS.md"),
  },
  {
    label: "Instruções globais do Claude Code",
    source: join(instructionsDir, "CLAUDE.md"),
    target: join(homeDir, ".claude", "CLAUDE.md"),
  },
  {
    label: "Skills canônicas",
    source: skillsDir,
    target: join(homeDir, ".agents", "skills"),
  },
  {
    label: "Skills do Claude Code",
    source: skillsDir,
    target: join(homeDir, ".claude", "skills"),
  },
  {
    label: "Statusline do Claude Code",
    source: join(claudeDir, "statusline-command.sh"),
    target: join(homeDir, ".claude", "statusline-command.sh"),
  },
];

export function displayPath(path: string): string {
  return path === homeDir || path.startsWith(`${homeDir}${sep}`)
    ? path.replace(homeDir, "~")
    : path;
}
