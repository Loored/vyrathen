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

const combatImages = files(root).filter(path => /combat-(before|after)\//.test(path) && path.endsWith('.png'));
const combatPairs = combatImages.filter(path => path.includes('combat-after/') && path.endsWith('-initial-viewport.png')).map(path => { const before = path.replace('combat-after/', 'combat-before/'); return `<h2>${escape(path.split('/').pop())}</h2><section>${[before,path].map(p => existsSync(p) ? `<figure><figcaption>${p.includes('combat-before') ? 'Antes' : 'Después'}</figcaption><img src="${link(p)}"></figure>` : '<p>Base no disponible</p>').join('')}</section>`; }).join('');
const combatVideos = files(join(root, 'test-results')).filter(path => path.endsWith('.webm') && /combat-evidence-combat-v/.test(path));
writeFileSync(join(root, 'combat.html'), `<!doctype html><html lang="es"><meta charset="utf-8"><title>Combat Experience — candidato</title><style>body{background:#0a0d14;color:white;font:16px system-ui;padding:24px}a{color:#8aefd3}img,video{max-width:100%}section{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0}</style><h1>Combat Experience v0.1 — pendiente de revisión artística</h1><p>Fixture: patrulla, semilla 1024, guardado v1. Comparar initial antes/después dentro del mismo entorno. Paused-event-1 y final se fijan por controles reales. Metadatos JSON junto a cada grupo.</p><ul>${files(root).filter(path => /combat-(before|after)\//.test(path) && path.endsWith('.json')).map(path => `<li><a href="${link(path)}">${escape(path)}</a></li>`).join('')}</ul>${combatPairs}<h2>Todos los estados y páginas completas</h2><section>${combatImages.map(path => `<figure><a href="${link(path)}">${escape(path)}</a><img loading="lazy" src="${link(path)}"></figure>`).join('')}</section>${combatVideos.map(path => `<video controls src="${link(path)}"></video>`).join('')}</html>`);
