# Catálogo verificable de diseño

`.design-sync` es un catálogo local de ocho componentes existentes, preparado como entrada para Claude Design. No migra la aplicación, no define una biblioteca publicada ni aprueba un rediseño. El PR #11 incorporó las entradas; este slice añade paridad y validación reproducible.

## Fuentes de verdad y límites

| Elemento | Fuente |
|---|---|
| Tokens compartidos y contexto del marco real | `src/ui/game-ui.css` (`.vyr-frame` / `.vyr-game-scope`) |
| Composición y movimiento aprobados del Lab | `src/features/character-lab/`, `VISUAL_DIRECTION_V05.md`, `MOTION_LANGUAGE.md`, `DECISIONS_V05.md` |
| Componentes y tipos | `src/ui/GameTabs.tsx`, componentes del Lab, `HeroPresentation.tsx`, `heroProfile.ts`, tipos del dominio |
| Datos demo | `src/data/demo.ts`; `.design-sync/fixtures.ts` adapta con `toHeroProfile`, sin guardados |
| Superficie exportable | `.design-sync/entry.tsx`, mapa de ocho componentes en `config.json`, `conventions.md` |
| Reglas verificadas y supuestos | `docs/HISTORICAL_RULES.md`, `ORIGEN_REGLAS.md`, `src/engine/`; nunca los previews |

Selene, Kuroe y Orion son conceptuales. Los héroes de `PLAYER_TEAM` también son datos de demostración, no personajes históricos definitivos. La tríada de acentos del catálogo es una asignación de exploración; no sustituye los acentos semánticos del adaptador real. Los nodos de habilidades y ranuras A–D son composiciones ilustrativas, no requisitos, inventario ni progresión aprobados. Los paneles conservan su anotación visible y el catálogo añade contexto explícito.

El roadmap de 2026-10-20 es una propuesta histórica: ya existen tokens, ficha real/adaptador, roster, replay/trace y combate v0.4. Su texto sobre carencias del trace describe aquel estado, no el código actual. No reutilizarlo como lista pendiente sin auditar implementación.

## Paridad y diferencias intencionadas

La aplicación declara Inter en su cadena CSS pero `index.html` sólo carga DM Sans y Space Grotesk. Se retira el `@import` exclusivo de Inter de `sync.css`: no se cambia la tipografía global aprobada. Si Inter está instalada, la cadena puede resolverla; si no, usa el fallback del sistema. El servidor de catálogo reutiliza exactamente los enlaces de fuentes del HTML de producción, sin mantener una segunda lista. Una fuente declarada en `font-family` o un `document.fonts.check()` verdadero no prueban que se haya cargado: la evidencia incluye caras registradas y fuentes efectivas de Chromium mediante CDP.

`LabScope` reproduce tokens, acentos y modos del Lab con una clase reutilizable, sin repetir el ID de la ruta. Los selectores `:is(#vyr-character-lab, .vyr-character-lab)` conservan la especificidad previa de producción. `surface="game"` permite a HeroSigil, HeroVitals y GameTabs consumir los tokens reales del marco, extraídos sin cambiar valores. Las reglas compartidas de GameTabs también cubren su uso dentro del scope del juego anidado en el Lab: el reset de botones del Lab no puede sobrescribir sus 12 px, peso y color de producción. El proveedor adapta exclusivamente el layout de pantalla completa a piezas sueltas. Las fuentes de estilos siguen en `src/`; `sync.css` sólo adapta el envoltorio.

`PantallaDeSeleccion` es la composición existente: conserva rail, escenario, panel, pestañas y un SELECT. Usa 740 px de altura (ampliados desde los 600 px del preview anterior para mostrar los siete valores demo sin scroll a 1440×900) en escritorio y altura automática en móvil; producción añade shell, cabecera y pie y calcula su altura desde el viewport. El catálogo sustituye el arte por el marcador geométrico original y muestra Vesper demo; el Lab de producción muestra Selene conceptual. Las capturas completas y de viewport permiten interpretar el contexto; no son imágenes destinadas a igualdad de píxeles. La ficha Vesper usa el mismo perfil, con ancho natural en producción y 280 px en el preview. El SELECT sigue siendo exclusivo de selección.

`CharacterTabs.panelId` debe ser único por composición cuando conviven instancias; el valor por defecto conserva los IDs de la única instancia del Lab de producción. Cada instancia tiene su propio `LayoutGroup`; los previews enlazan tab y panel con `useId`. Los ecos decorativos del nombre no duplican su nombre accesible. Movimiento reducido se obtiene del hook de producción, también al cambiar la preferencia durante una transición; no se escribe persistencia.

## Ejecutar y comprobar

Con Node 22.16+ y `npm ci`:

```bash
npm run design:typecheck
npm run design:build
npm run design:dev
# http://127.0.0.1:4174/catalog.html
# ?story=CharacterStage.PantallaDeSeleccion para aislar la composición
```

Para validar contra builds de producción (puertos 4173 y 4174 libres):

```bash
npm test
npm run typecheck
npm run build
npm run design:build
npm run design:test
npm run test:ui:ci
node scripts/sequence-video-frames.mjs
node scripts/ui-evidence-index.mjs
```

La suite existente se conserva. Playwright inicia ambos servidores; incluso para `test:ui` se requiere antes `design:build`. `design:preview` sirve el catálogo compilado. No incorpora rutas nuevas al juego ni copia `public/` en el catálogo.

| Comprobación | Qué demuestra | Qué no demuestra |
|---|---|---|
| `design:typecheck` | TS estricto incluye entry, fixtures, previews y harness; ocho declaraciones manuales comparadas con props reales y exports | Conversión ni subida |
| `design:build` | Vite compila el sitio local y comprueba exclusión de ilustraciones/sprites | Bundle del convertidor externo |
| `design:test` (5 recorridos) | Carga de los 25 previews / ocho componentes, teclado, relaciones ARIA, instancias independientes, selección, reducción dinámica, ausencia de errores JS/escrituras y candidatos 1440×900 / 320×720 | Aprobación visual, lector de pantalla humano ni igualdad Mac/Linux |
| Convertidor externo | Sólo puede afirmarse tras ejecutarlo y revisar su salida | No ejecutado en este slice |
| Sincronización remota | Sólo puede afirmarse tras respuesta verificada del servicio | Fuera del slice; no intentada |

`config.json.dtsPropsFor` sigue siendo manual porque la herramienta externa lo exige. El chequeo genera tipos sólo en `.design-sync/.cache/contracts.ts` y compara estructuralmente claves, opcionalidad, callbacks y campos anidados contra `ComponentProps`. Añadir una prop opcional anidada o cambiar su obligatoriedad también debe fallar. Cambiar componentes requiere actualizar el contrato explícito, no silenciar la comprobación. El mapa y los exports se contrastan con el código real.

CI usa el workflow existente con `contents: read`: añade la build/contratos del catálogo y ejecuta los cinco recorridos dentro de la suite de producción, conservando toda la evidencia anterior. `output/playwright/design-sync.html` enlaza parejas, JSON con SHA, entorno, viewport, fuentes y contexto; `index.html` enlaza esa galería. Artefactos de Actions conservados siete días. Las fuentes de Google se bloquean por igual en las comparaciones para comprobar el fallback reproducible; el resto de recorridos conserva la carga normal. No se crean baselines ni tolerancias visuales.

## De Claude Design a Codex CLI

1. Partir de `PantallaDeSeleccion` y de los componentes existentes. Adjuntar el objetivo y las diferencias de contexto; mantener los siete valores del perfil real y el estado de arte ausente. Para Personajes v2, proponer primero una ficha Vesper de sólo consulta, escritorio y móvil, sin slots ni mecánicas nuevas.
2. Revisar la propuesta con el propietario: composición, jerarquía y tratamiento provisional. Una propuesta de Claude Design no es aprobación de arte ni reglas.
3. Entregar a Codex CLI la propuesta concreta, referencias/archivos, decisiones aprobadas y criterios de aceptación. Codex audita el repo actual, implementa un slice en rama, reutiliza `src/` y sus tipos/adaptador y conserva motor, guardados, navegación y combate de 2500 ms.
4. Ejecutar checks de aplicación y catálogo, comparar candidatos, abrir PR en borrador y revisar Actions sobre el SHA final. No copiar un prototipo completo sobre `App.tsx` ni introducir dependencias del servicio en el juego.

La conversión/subida es un paso externo separado. Se mantiene `guidelinesGlob: []` y sólo `conventions.md` como cabecera deliberada; no exportar automáticamente `docs/`, investigación privada, ilustraciones del Lab ni sprites del piloto. Tras una futura conversión, inspeccionar la salida real del convertidor (archivos y referencias de recursos) antes de subir. El 403 registrado en el primer intento es evidencia de ese intento fechado; no demuestra el estado actual del servicio ni exige repetirlo para validar este slice.
