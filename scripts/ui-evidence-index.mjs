import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

// An inspection gallery, never a pixel baseline or an approval mechanism.
const root = 'output/playwright';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const files = path => existsSync(path) ? readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]) : [];
const snapshots = phase => files(join(root, `characters-${phase}`)).filter(path => path.endsWith('.json')).map(path => ({ ...JSON.parse(readFileSync(path, 'utf8')), prefix: path.slice(0, -5) }));
const before = snapshots('before'), after = snapshots('after');
const link = path => escape(relative(root, path));
function figure(snapshot, phase, section) {
  if (!snapshot) return '<p>Captura no disponible en este entorno.</p>';
  const path = `${snapshot.prefix}-${section}-viewport.png`;
  const image = existsSync(path) ? path : `${snapshot.prefix}-viewport.png`;
  return `<figure><figcaption>${phase} · ${escape(snapshot.sha.slice(0, 12))} · ${escape(snapshot.environment)}</figcaption><a href="${link(image)}"><img src="${link(image)}" alt="${section} ${phase}" loading="lazy"></a><a href="${link(`${snapshot.prefix}.json`)}">Dimensiones medidas y datos</a></figure>`;
}
const comparisons = after.map(snapshot => {
  const size = snapshot.captures[0].dimensions;
  const previous = before.find(candidate => {
    const dims = candidate.dimensions || candidate.captures[0].dimensions;
    return dims.width === size.width && dims.height === size.height && candidate.environment === snapshot.environment;
  });
  return `<section><h2>${size.width} × ${size.height}</h2><div>${['heroes', 'ficha-vesper', 'heroes-retorno-vesper'].map(section => `<h3>${section}</h3><div class="comparison">${figure(previous, 'Antes', section)}${figure(snapshot, 'Después', section)}</div>`).join('')}</div><details><summary>Marco en otras secciones y páginas completas</summary><ul>${files(join(root, 'characters-after')).filter(path => path.startsWith(snapshot.prefix) && path.endsWith('.png')).map(path => `<li><a href="${link(path)}">${escape(path.slice(snapshot.prefix.length + 1))}</a></li>`).join('')}</ul></details></section>`;
}).join('');
const videos = files(join(root, 'test-results')).filter(path => path.endsWith('.webm') && /(global-frame-v.deo|characters-v.deo)/.test(path));
writeFileSync(join(root, 'index.html'), `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vyrathen — Personajes v1</title><style>body{margin:0 auto;padding:32px;max-width:1800px;background:#080b13;color:#edf2ff;font:16px/1.6 system-ui}a{color:#8aefd3}h1{line-height:1.2}h2{margin-top:40px}figure{margin:0;min-width:0}figcaption{font-size:13px;margin-bottom:12px}img{width:100%;height:auto;border:1px solid #354157}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:24px}summary{cursor:pointer;padding:12px 0}video{max-width:100%}@media(max-width:700px){body{padding:16px}.comparison{grid-template-columns:1fr}}</style><h1>Personajes v1 — roster y ficha</h1><p>Propuesta funcional pendiente de revisión del propietario. Capturas candidatas; no se han creado ni aprobado baselines.</p><p>Misma partida inicial v1 y dimensiones medidas. La comparación se hace dentro de cada entorno, sin equiparar píxeles entre macOS y Linux.</p><p><a href="report/index.html">Reporte Playwright</a></p>${comparisons}<h2>Navegación y feedback</h2>${videos.map(path => `<video controls preload="metadata" src="${link(path)}"></video>`).join('')}<p>Revisar: cinco paneles comparables, identidad simbólica y dossier asimétrico. Sin arte nuevo ni cambios de mecánicas.</p></html>`);
console.log(`${root}/index.html — candidate comparison gallery`);
