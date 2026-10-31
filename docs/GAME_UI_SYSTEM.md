# Game UI System v1

`src/ui/game-ui.css` es la fuente compartida de tokens estructurales (superficies, texto, borde, espacio, foco, tipografía de interfaz y duraciones), semánticos de tipo y primitivas de panel, acción, pestañas y estadística. Cada ruta consume el contrato con sus propios valores: la aplicación usa los valores base y `#vyr-character-lab` redefine sólo los tokens estructurales para conservar su negro azulado, Inter, borde y controles aprobados.

Patrones compartidos con consumidores reales:

- `--vyr-bg`, `--vyr-panel`, `--vyr-surface`, `--vyr-border`, `--vyr-text`, `--vyr-muted` y `--vyr-font-ui`: alias del marco del juego y raíz/shell/superficies de Character Lab.
- Espacio, foco y movimiento (`--vyr-space-*`, `--vyr-focus`, `--vyr-fast`, `--vyr-ease`, `--vyr-standard`): acciones y paneles del juego; foco, controles y transiciones de controles del Lab.
- Control estructural (`--vyr-control-*`): acción secundaria de la aplicación y los controles `mode` del Lab, con override de paleta propio del Lab.
- Pestañas y estadística: `GameTabs.tsx` concentra teclado, IDs y `aria-controls` para Archivo; `CharacterTabs` reutiliza su navegación de teclado. Las filas de estadísticas del Lab consumen borde compartido y la ficha usa `game-stat`/`game-stat-list`.

El SELECT, shards, reveal/glitch, composición del retrato, acentos por personaje y las ilustraciones permanecen específicos de Character Lab.

La aplicación adopta paneles/acciones compartidos y la ficha de héroe. La propuesta de marco global e Inicio de 2026-10-20 extiende la composición a `src/app/GameFrame.tsx` y `src/features/home/Home.tsx`. Mis héroes, ficha, Combate y Archivo conservan su composición interna y recorridos dentro del nuevo marco. No se rediseñan reglas ni simulación. La propuesta está pendiente de revisión artística; véase [GLOBAL_FRAME_PROPOSAL.md](design/GLOBAL_FRAME_PROPOSAL.md).

`src/features/heroes/heroProfile.ts` adapta `Hero` de forma pura. Los cinco héroes son datos demo: los colores, símbolos y fallback sin arte son presentación provisional. La ficha muestra máximos de configuración, nunca el estado final de `Fighter`, y separa poderes catalogados de poderes sin catálogo. Selene, Kuroe y Orion no participan en este adaptador.

Pendiente de revisión del propietario: composición final de siete valores y tratamiento final de arte original para héroes reales. No se altera la identidad ni coreografía aprobada del Lab.

## Revisión automatizada

Ejecuta `npm run review:ui`. Playwright inicia Vite aislado en `127.0.0.1:4173`, usa Chromium, datos de prueba por contexto y deja reporte HTML en `output/playwright/report/index.html`; las capturas estables van a `output/playwright/screenshots/` y vídeos/trazas útiles a `output/playwright/test-results/`. Antes de capturar espera el contenido significativo, `document.fonts`, las imágenes y dos frames de composición; la secuencia del Lab espera además a que desaparezca su overlay de transición. `review-metadata.json` registra las dimensiones medidas por el navegador para cada captura, y las configuraciones fijan el viewport después del device descriptor. Estos artefactos están ignorados: son candidatos de revisión, no baselines aprobados.

No se comparan píxeles entre macOS y Linux ni se aumentan tolerancias automáticamente: fuentes, rasterizado y GPU pueden variar. La entrega actual comprueba recorridos, foco, reducción de movimiento, overflow y accesibilidad con axe-core. Cualquier baseline o CI se decide en un incremento posterior tras revisión humana de capturas en ambos entornos.

## CI y revisión en Work Mode

`.github/workflows/ui-review.yml` corre en Ubuntu 22.04 para PRs a `main`, pushes a `main` y ejecución manual. Instala con `npm ci`, instala Chromium y dependencias con la versión fijada por el lockfile, ejecuta tests, typecheck, build y `npm run test:ui:ci`. Esta última ruta sirve la build mediante `vite preview`; `review:ui` conserva Vite de desarrollo para la revisión local.

El artefacto de cada ejecución se llama `ui-evidence-<commit>-chromium-ubuntu-22.04`, se conserva siete días y contiene `output/playwright/`: reporte, capturas, vídeos, trazas de fallo, `ci-metadata.json` del entorno y `review-metadata.json` de las dimensiones efectivamente medidas. En Work Mode: abrir la ejecución de Actions, descargar el artefacto y abrir `report/index.html`; comparar las capturas candidatas de Linux con las inspeccionadas en Mac sin declararlas aprobadas. No hay snapshots visuales ni actualización automática de referencias en CI.

## Marco e Inicio: consumidores de la propuesta

- `GameFrame`: navegación compacta, marca serif espaciada del Lab, HUD de recursos a partir de `SaveData`, región viva de confirmaciones, salto al contenido y menú móvil con foco contenido, Escape, retorno y fondo inerte. El marco aparece en las cuatro secciones del juego; Character Lab conserva su documento independiente.
- `Home`: identidad guardada del laboratorio, formación de cinco símbolos del adaptador existente, objetivo con coste previo y recompensa, y entrada al simulador. La consulta de tipos/procedencia ocupa un desplegable secundario. Sin personajes, recursos ni reglas adicionales.
- `game-panel` admite `--vyr-panel-bg` y `--vyr-panel-radius`; `game-action` admite `--vyr-action-bg`, `--vyr-action-text`, `--vyr-action-radius`. Se conservan valores por defecto fuera de los consumidores nuevos y el contrato secundario `--vyr-control-*`.
- `.vyr-frame` aplica `--vyr-bg/panel/surface/border/text/muted/font-ui` y `--vyr-font-display` localmente. Las acciones usan `--vyr-fast/ease`, las entradas `--vyr-standard`. Tipos conservan sus símbolos y acentos semánticos; el blanco indica selección/acción y el menta, foco. El Lab no recibe estos overrides.
- Se retiraron de `src/styles.css` las familias heredadas del marco (`shell`, `sidebar`, `brand`, `nav-*`, `world-*`, `side-explainer`, `topbar`, `content`, `toast`, `mobile-*`, `main-footer`) y de Inicio (`welcome-head`, `metric*`, `overview-*`, `hero-roster`, `next-quest`, `quest-*`, `taxonomy-*`, `type-node/path`, `source-panel/icon`). Se conservan las reglas usadas por roster, ficha, combate y archivo. La hoja minificada heredada se separó por reglas para revisar la eliminación.

Pendiente: revisión artística de Personajes v1, composición del simulador, catálogo y sus microtextos; asignar ilustraciones con procedencia comprobada. El SELECT, shards, reveal y ambiente del Lab siguen siendo propios de selección. El marco nuevo usa ambiente gráfico estático: no necesita un control de pausa. Entradas de 260 ms y microfeedback de 160 ms; movimiento reducido muestra el contenido final sin animación.

## Evidencia reproducible de marco e Inicio

Después de `npm run build && npm run test:ui:ci`, ejecutar `node scripts/ui-evidence-index.mjs`. Abrir `output/playwright/index.html` para comparar roster/ficha y acceder a páginas completas, otras secciones y vídeo; `npx playwright show-report output/playwright/report` sirve el informe desde CLI. No requiere editor.

`characters-before/` y `characters-after/` incluyen versión visual v1 de personajes, fase, plataforma, Chromium, modo production y resolución en cada nombre. Cada JSON registra SHA, partida inicial v1, dimensiones reales, estado de fuentes y altura completa. Se espera contenido, imágenes, fuentes, animaciones finitas y dos frames. Se conserva el viewport después del device descriptor. En PRs, CI captura la base del PR en un checkout aislado con el mismo spec/fixture y luego captura el SHA exacto de la rama; ambos quedan en el mismo artefacto. Son candidatos, nunca baselines.

Los nuevos recorridos comprueban HUD y acciones dentro de 1366×768, navegación con mouse/teclado, activo y foco separados, menú móvil, cambio de breakpoint con menú abierto, coste y recompensa, guardado v1 tras el Lab, ficha y retorno, pestañas y movimiento reducido dinámico. Axe se ejecuta sin exclusiones en Inicio, roster, ficha, combate, las tres pestañas del Archivo y menú móvil. La ampliación detectó y corrigió nombres de barras, jerarquía de encabezados, contraste de nivel/VS y retorno de foco; no se ocultaron hallazgos mediante desactivaciones.

## Personajes v1 — candidato, no aprobación artística

- `HeroRoster`: cinco paneles con «Consultar ficha» como única acción por héroe; nombre/nivel/tipo, HP/MP máximos y poder. El último consultado conserva resaltado y etiqueta al volver; ningún héroe se resalta antes de consultar.
- `HeroProfile`: dossier asimétrico, siete valores reales, poder y disponibilidad documentada. Foco inicial en h1 y retorno al botón de origen. El roster no incorpora un control independiente de selección.
- `HeroSigil` y `HeroVitals`: patrones compartidos entre ambas pantallas, consumen el adaptador puro existente. Geometría y SVG tipográfico decorativo, sin asignación de arte.
- Tokens adoptados: `--vyr-bg/panel/border/text/muted/focus/font-ui/font-display/fast/standard/ease`; `--hero-accent` procede del adaptador. Acciones y kickers existentes, sin nueva biblioteca.
- CSS acotado en `features/heroes/characters.css`. Se retiran `hero-card*`, `hero-avatar*`, `avatar-halo`, `power-lvl`, `stat-track`, `hero-grid-full`, `hero-expanded-stats`, `hero-stat-line`, `mini-stats`, `type-explainer`, `type-card*` y `hero-profile*` heredados; se conserva `type-pill` para Archivo.
- Fuera de alcance: interiores del simulador/Archivo, arte asignado, progresión/equipamiento/formación editable. GameFrame, Inicio y Lab no se modifican.
- Evidencia extendida en el workflow actual: roster inicial, ficha Vesper y retorno resaltado en cuatro tamaños; comparación base/head, vídeo normal y metadatos por SHA. Interacción rápida con mouse/teclado reales, registro de eventos confiables durante animación, sin dispatchEvent ni force. `node scripts/ui-evidence-index.mjs` genera la galería; `npx playwright show-report output/playwright/report` sirve los recorridos sin editor.

Composición, contratos, estados, hallazgos y decisiones pendientes: [Personajes v1](design/CHARACTERS_V1_PROPOSAL.md).

## Combat Experience — v0.1 aprobado, recursos v0.2 candidatos

Combate reutiliza tokens, acciones y HeroSigil. Formaciones, evento, roles, reloj y selección de ronda son específicos de `features/combat/`; no se promueven como primitivas globales. La [composición v0.1](design/COMBAT_EXPERIENCE_V01.md) y el intervalo de 2500 ms están aprobados. Las barras de recursos actuales, consumo por acción y K.O. persistente de [v0.2](design/COMBAT_EXPERIENCE_V02.md) también permanecen específicos de Combate y requieren revisión de sus adiciones visuales. La galería `output/playwright/combat.html` compara base/head en los mismos eventos, registra fallback antiguo y enlaza prueba de equivalencia; no crea baselines.
