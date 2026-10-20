# Game UI System v1

`src/ui/game-ui.css` es la fuente compartida de tokens estructurales (superficies, texto, borde, espacio, foco, tipografía de interfaz y duraciones), semánticos de tipo y primitivas de panel, acción, pestañas y estadística. Cada ruta consume el contrato con sus propios valores: la aplicación usa los valores base y `#vyr-character-lab` redefine sólo los tokens estructurales para conservar su negro azulado, Inter, borde y controles aprobados.

Patrones compartidos con consumidores reales:

- `--vyr-bg`, `--vyr-panel`, `--vyr-surface`, `--vyr-border`, `--vyr-text`, `--vyr-muted` y `--vyr-font-ui`: alias del marco del juego y raíz/shell/superficies de Character Lab.
- Espacio, foco y movimiento (`--vyr-space-*`, `--vyr-focus`, `--vyr-fast`, `--vyr-ease`, `--vyr-standard`): acciones y paneles del juego; foco, controles y transiciones de controles del Lab.
- Control estructural (`--vyr-control-*`): acción secundaria de la aplicación y los controles `mode` del Lab, con override de paleta propio del Lab.
- Pestañas y estadística: `GameTabs.tsx` concentra teclado, IDs y `aria-controls` para Archivo; `CharacterTabs` reutiliza su navegación de teclado. Las filas de estadísticas del Lab consumen borde compartido y la ficha usa `game-stat`/`game-stat-list`.

El SELECT, shards, reveal/glitch, composición del retrato, acentos por personaje y las ilustraciones permanecen específicos de Character Lab.

La aplicación adopta paneles/acciones compartidos y la ficha de héroe. Inicio, Combate y Archivo conservan su lógica actual y su siguiente modernización se limita a adoptar gradualmente estas primitivas; no se rediseñan reglas ni simulación.

`src/features/heroes/heroProfile.ts` adapta `Hero` de forma pura. Los cinco héroes son datos demo: los colores, símbolos y fallback sin arte son presentación provisional. La ficha muestra máximos de configuración, nunca el estado final de `Fighter`, y separa poderes catalogados de poderes sin catálogo. Selene, Kuroe y Orion no participan en este adaptador.

Pendiente de revisión del propietario: composición final de siete valores y tratamiento final de arte original para héroes reales. No se altera la identidad ni coreografía aprobada del Lab.

## Revisión automatizada

Ejecuta `npm run review:ui`. Playwright inicia Vite aislado en `127.0.0.1:4173`, usa Chromium, datos de prueba por contexto y deja reporte HTML en `output/playwright/report/index.html`; las capturas estables van a `output/playwright/screenshots/` y vídeos/trazas útiles a `output/playwright/test-results/`. Antes de capturar espera el contenido significativo, `document.fonts`, las imágenes y dos frames de composición; la secuencia del Lab espera además a que desaparezca su overlay de transición. `review-metadata.json` registra las dimensiones medidas por el navegador para cada captura, y las configuraciones fijan el viewport después del device descriptor. Estos artefactos están ignorados: son candidatos de revisión, no baselines aprobados.

No se comparan píxeles entre macOS y Linux ni se aumentan tolerancias automáticamente: fuentes, rasterizado y GPU pueden variar. La entrega actual comprueba recorridos, foco, reducción de movimiento, overflow y accesibilidad con axe-core. Cualquier baseline o CI se decide en un incremento posterior tras revisión humana de capturas en ambos entornos.

## CI y revisión en Work Mode

`.github/workflows/ui-review.yml` corre en Ubuntu 22.04 para PRs a `main`, pushes a `main` y ejecución manual. Instala con `npm ci`, instala Chromium y dependencias con la versión fijada por el lockfile, ejecuta tests, typecheck, build y `npm run test:ui:ci`. Esta última ruta sirve la build mediante `vite preview`; `review:ui` conserva Vite de desarrollo para la revisión local.

El artefacto de cada ejecución se llama `ui-evidence-<commit>-chromium-ubuntu-22.04`, se conserva siete días y contiene `output/playwright/`: reporte, capturas, vídeos, trazas de fallo, `ci-metadata.json` del entorno y `review-metadata.json` de las dimensiones efectivamente medidas. En Work Mode: abrir la ejecución de Actions, descargar el artefacto y abrir `report/index.html`; comparar las capturas candidatas de Linux con las inspeccionadas en Mac sin declararlas aprobadas. No hay snapshots visuales ni actualización automática de referencias en CI.
