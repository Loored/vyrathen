import ts from 'typescript';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const config = JSON.parse(readFileSync('.design-sync/config.json', 'utf8'));
const names = Object.keys(config.componentSrcMap).sort();
assert.equal(names.length, 8, 'El catálogo curado contiene ocho componentes');
assert.deepEqual(Object.keys(config.dtsPropsFor).sort(), names, 'Mapa y contratos deben coincidir');
assert.deepEqual(config.guidelinesGlob, [], 'Exportación documental deliberadamente vacía');
assert.equal(config.shape, 'package');
assert.equal(config.readmeHeader, '.design-sync/conventions.md', 'Cabecera documental curada');
// Compile the manual converter declarations against the actual component props.
// Normalize aliases recursively before structural equality, including optional
// nested fields. The generated checks also verify the source map and entry.
let source = `import type { ComponentProps } from 'react';\nimport * as Entry from '../entry';\ntype Assert<T extends true> = T;\ntype Both<A,B> = [A] extends [B] ? [B] extends [A] ? true : false : false;\ntype Normalize<T> = T extends (...args: infer A) => infer R ? (...args: { [K in keyof A]: Normalize<A[K]> }) => Normalize<R> : T extends object ? { [K in keyof T]: Normalize<T[K]> } : T;\ntype Equal<A,B> = (<T>() => T extends Normalize<A> ? 1 : 2) extends (<T>() => T extends Normalize<B> ? 1 : 2) ? true : false;\ntype Keys<A,B> = Both<keyof A,keyof B>;\n`;
for (const name of names) {
  source += `import { ${name} as Source${name} } from '../../${config.componentSrcMap[name]}';\ntype Manual${name} = { ${config.dtsPropsFor[name]} };\ntype Actual${name} = ComponentProps<typeof Source${name}>;\nexport type Check${name} = Assert<Equal<Manual${name},Actual${name}>>;\nexport type Keys${name} = Assert<Keys<Manual${name},Actual${name}>>;\nexport type Export${name} = Assert<Both<typeof Entry.${name}, typeof Source${name}>>;\n`;
}
// Generated only in ignored cache. Production and previews are also checked by this program.
mkdirSync('.design-sync/.cache', { recursive: true });
writeFileSync('.design-sync/.cache/contracts.ts', source);
const parsed = ts.getParsedCommandLineOfConfigFile('.design-sync/tsconfig.json', {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: d => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n')); } });
const program = ts.createProgram(parsed.fileNames, parsed.options);
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: x => x, getCurrentDirectory: ts.sys.getCurrentDirectory, getNewLine: () => '\n' }));
  process.exitCode = 1;
} else console.log('Catálogo: ocho contratos manuales, exports, entry, fixtures y todos los previews comprobados. No convierte ni sincroniza el paquete.');
