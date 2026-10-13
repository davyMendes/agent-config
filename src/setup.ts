import {
  cp,
  lstat,
  mkdir,
  realpath,
  rename,
  rm,
  symlink,
  unlink,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative } from "node:path";
import {
  displayPath,
  homeDir,
  linkSpecs,
  type LinkSpec,
} from "./config.ts";

type LinkState = "linked" | "absent" | "conflict";

const args = Bun.argv.slice(2).filter((arg) => arg !== "--");
const apply = args.includes("--apply");
const dryRun = args.includes("--dry-run");
const unknownArgs = args.filter(
  (arg) => arg !== "--apply" && arg !== "--dry-run",
);

if (unknownArgs.length > 0 || apply === dryRun) {
  console.error("Uso: bun run setup -- --dry-run | --apply");
  process.exit(1);
}

const timestamp = new Date().toISOString().replaceAll(":", "-");
const backupRoot = join(
  homeDir,
  ".local",
  "state",
  "agent-config",
  "backups",
  timestamp,
);
let createdBackup = false;
const isWindows = process.platform === "win32";

async function exists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function inspectLink(spec: LinkSpec): Promise<LinkState> {
  if (!(await exists(spec.target))) {
    return "absent";
  }

  const targetStats = await lstat(spec.target);
  if (!targetStats.isSymbolicLink()) {
    return "conflict";
  }

  try {
    const [sourcePath, targetPath] = await Promise.all([
      realpath(spec.source),
      realpath(spec.target),
    ]);
    return sourcePath === targetPath ? "linked" : "conflict";
  } catch {
    return "conflict";
  }
}

// Junctions não exigem privilégio no Windows; links de arquivo continuam exigindo.
function symlinkType(isDirectory: boolean): "junction" | "dir" | "file" {
  if (!isDirectory) {
    return "file";
  }
  return isWindows ? "junction" : "dir";
}

function backupPathFor(target: string): string {
  const relativeTarget = relative(homeDir, target);
  if (isAbsolute(relativeTarget) || relativeTarget.startsWith("..")) {
    throw new Error(`Destino fora do diretório pessoal: ${target}`);
  }
  return join(backupRoot, relativeTarget);
}

async function movePath(source: string, target: string): Promise<void> {
  try {
    await rename(source, target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EXDEV") {
      throw error;
    }

    await cp(source, target, {
      recursive: true,
      errorOnExist: true,
      force: false,
      verbatimSymlinks: true,
    });
    await rm(source, { recursive: true });
  }
}

async function applyLink(spec: LinkSpec, state: LinkState): Promise<void> {
  if (state === "linked") {
    console.log(`✓ ${spec.label}: já configurado`);
    return;
  }

  await mkdir(dirname(spec.target), { recursive: true });
  let backupPath: string | undefined;

  if (state === "conflict") {
    backupPath = backupPathFor(spec.target);
    await mkdir(dirname(backupPath), { recursive: true });
    await movePath(spec.target, backupPath);
    createdBackup = true;
  }

  try {
    const sourceStats = await lstat(spec.source);
    await symlink(
      spec.source,
      spec.target,
      symlinkType(sourceStats.isDirectory()),
    );
  } catch (error) {
    if (await exists(spec.target)) {
      await unlink(spec.target);
    }
    if (backupPath) {
      await movePath(backupPath, spec.target);
    }
    if ((error as NodeJS.ErrnoException).code === "EPERM" && isWindows) {
      throw new Error(
        `Sem permissão para criar ${displayPath(spec.target)}. No Windows, ative o Modo de Desenvolvedor ou execute o terminal como administrador.`,
        { cause: error },
      );
    }
    throw error;
  }

  const backupMessage = backupPath
    ? ` (backup: ${displayPath(backupPath)})`
    : "";
  console.log(
    `✓ ${spec.label}: ${displayPath(spec.target)} → ${displayPath(spec.source)}${backupMessage}`,
  );
}

const missingSources: string[] = [];
for (const spec of linkSpecs) {
  if (!(await exists(spec.source))) {
    missingSources.push(spec.source);
  }
}

if (missingSources.length > 0) {
  for (const source of missingSources) {
    console.error(`✗ Fonte ausente: ${displayPath(source)}`);
  }
  process.exit(1);
}

const states = await Promise.all(
  linkSpecs.map(async (spec) => ({ spec, state: await inspectLink(spec) })),
);

if (dryRun) {
  console.log("Dry-run; nenhuma alteração será realizada.\n");
  for (const { spec, state } of states) {
    if (state === "linked") {
      console.log(`= ${spec.label}: já configurado`);
    } else if (state === "absent") {
      console.log(
        `+ ${spec.label}: criar ${displayPath(spec.target)} → ${displayPath(spec.source)}`,
      );
    } else {
      console.log(
        `~ ${spec.label}: mover o destino atual para backup e criar o link`,
      );
    }
  }
  process.exit(0);
}

for (const { spec, state } of states) {
  await applyLink(spec, state);
}

if (createdBackup) {
  console.log(`\nBackup criado em ${displayPath(backupRoot)}`);
}
