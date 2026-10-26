import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'svelte/compiler';

// Semgrep CE does not parse Svelte; scan its scripts with original line numbers.
export function extractScripts(source, filename) {
  const ast = parse(source, { filename });
  return [['instance', ast.instance], ['module', ast.module]]
    .filter(([, script]) => script)
    .map(([kind, script]) => ({
      kind,
      code: '\n'.repeat((source.slice(0, script.content.start).match(/\n/g) || []).length)
        + source.slice(script.content.start, script.content.end)
    }));
}

function prepare(directory, output) {
  let count = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) count += prepare(file, output);
    else if (entry.name.endsWith('.svelte')) {
      for (const { kind, code } of extractScripts(readFileSync(file, 'utf8'), file)) {
        const target = join(output, `${file}.${kind}.js`);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, code);
        count++;
      }
    }
  }
  return count;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw new Error('Expected a temporary output directory');
  const output = resolve(process.argv[2]);
  const root = resolve('.');
  if (output === root || output.startsWith(root + '/') || output.startsWith(root + '\\')) {
    throw new Error('Security extraction must stay outside the checkout');
  }
  const count = prepare('src', output);
  if (!count) throw new Error('No Svelte scripts scanned');
  console.log(`Prepared ${count} Svelte script blocks for security analysis.`);
}
