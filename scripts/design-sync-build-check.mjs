import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const root = '.design-sync/.cache/site';
const files = readdirSync(root, { recursive: true });
assert(!files.some(file => /\.(png|webp|jpe?g)$/i.test(file)), 'El sitio de validación no debe copiar arte');
for (const file of files.filter(file => /\.(js|css|html)$/.test(file))) {
  const text = readFileSync(`${root}/${file}`, 'utf8');
  assert(!/character-lab\/art\/|combat-pilot\//.test(text), `Recurso externo o arte excluido en ${file}`);
}
console.log('Build local del catálogo sin ilustraciones, sprites ni una fuente Inter propia. No es una conversión del paquete externo.');
