#!/usr/bin/env node
// One-time setup script for a new repo created from this template.
// Prompts for a package name, description, and npm visibility,
// rewrites placeholders across the repo, then deletes itself.

import { readFile, writeFile, unlink } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const PLACEHOLDER = 'PACKAGE_NAME';

const FILES_TO_REWRITE = ['package.json', 'README.md', 'src/index.ts', 'src/index.test.ts'];

function ask(rl, question, { required = true, defaultValue } = {}) {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  return (async () => {
    while (true) {
      const answer = (await rl.question(`${question}${suffix}: `)).trim();
      if (answer) return answer;
      if (defaultValue) return defaultValue;
      if (!required) return '';
      console.log('  (required)');
    }
  })();
}

function isValidPackageName(name) {
  // npm rules — lowercase, alphanumeric + hyphens, no leading dot/underscore.
  return /^[a-z0-9][a-z0-9-]*$/.test(name) && name.length <= 214;
}

async function rewriteFile(path, replacements) {
  let content = await readFile(path, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    await writeFile(path, content);
    console.log(`  rewrote ${relative(repoRoot, path)}`);
  }
}

async function updatePackageJson(pkgPath, { name, description, isPublic }) {
  const raw = await readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(raw);
  pkg.name = `@amali-tech/${name}`;
  pkg.description = description;
  pkg.homepage = `https://github.com/amalitech-packages/${name}#readme`;
  pkg.bugs = { url: `https://github.com/amalitech-packages/${name}/issues` };
  pkg.repository = {
    type: 'git',
    url: `git+https://github.com/amalitech-packages/${name}.git`,
  };
  pkg.publishConfig = {
    ...pkg.publishConfig,
    access: isPublic ? 'public' : 'restricted',
  };
  delete pkg.scripts.setup;
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log('  rewrote package.json');
}

async function deleteSelf() {
  const selfPath = fileURLToPath(import.meta.url);
  await unlink(selfPath);
  console.log(`  removed ${relative(repoRoot, selfPath)}`);
}

async function main() {
  console.log('\n  AmaliTech package template — setup\n');

  const rl = createInterface({ input, output });

  try {
    let name;
    while (true) {
      name = await ask(rl, 'Package name (e.g. "logger", will become @amali-tech/<name>)');
      if (isValidPackageName(name)) break;
      console.log(
        '  Invalid name. Use lowercase letters, digits, and hyphens. Must start with a letter or digit.',
      );
    }

    const description = await ask(rl, 'Short description (one line)');

    let isPublic;
    while (true) {
      const answer = (
        await ask(rl, 'npm visibility — public or private?', { defaultValue: 'public' })
      ).toLowerCase();
      if (answer === 'public' || answer === 'p') {
        isPublic = true;
        break;
      }
      if (answer === 'private' || answer === 'restricted' || answer === 'r') {
        isPublic = false;
        break;
      }
      console.log('  Please answer "public" or "private".');
    }

    console.log('\nApplying...');

    const replacements = [[PLACEHOLDER, name]];

    await updatePackageJson(join(repoRoot, 'package.json'), { name, description, isPublic });

    for (const rel of FILES_TO_REWRITE) {
      if (rel === 'package.json') continue;
      await rewriteFile(join(repoRoot, rel), replacements);
    }

    await deleteSelf();

    console.log(`
Done. Next:

  1. pnpm install      # refresh the lockfile with the new name
  2. git add -A && git commit -m "chore: initial setup"
  3. Push and open a PR (or push to main if you're the only one so far).

Reminder: set the NPM_TOKEN secret on this repo before the first release.
`);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
