# Notas de /design-sync para Vyrathen

Alcance acordado con el propietario (2026-10-31): **solo la identidad del Character Lab**. Ni el arte del Lab (`public/character-lab/art/*.webp`) ni las hojas del piloto 2D salen del repo. No hay Storybook (`shape: package`).

## Estado del primer intento (2026-10-31)

- `DesignSync(create_project, "Vyrathen Design System")` falló con `HTTP 403 permission_denied: subscription required for this action`. El propietario eligió **solo local**: la build se verificó entera, pero **no se subió nada** y `config.json` **no tiene `projectId`**.
- La próxima ejecución es, a efectos del skill, una primera sincronización:
  1. crear el proyecto (o reutilizar uno vacío con ese nombre);
  2. guardar el `projectId`;
  3. ruta incremental.
  Las vistas previas de `previews/` se reutilizan tal cual.

## Particularidades del repo

- **Sin `dist/` de librería ni `.d.ts`.**
  - `vite build` produce la app, no un paquete.
  - La entrada es `.design-sync/entry.tsx`, que hay que pasar siempre con `--entry ./.design-sync/entry.tsx` y `--node-modules ./node_modules`.
  - No hay `buildCmd`: el convertidor empaqueta directamente desde `src/`.
- **Las props están escritas a mano en `cfg.dtsPropsFor`.** El convertidor solo extrae tipos de un árbol `.d.ts` (`[DTS] parsed 0 .d.ts files`); sin él, cada `<Name>Props` sale como `[key: string]: unknown`. Si cambian las props de algún componente, hay que actualizarlas a mano (ver riesgos).
- **`LabScope` vive en `entry.tsx`, no en `src/`.**
  - Es el `cfg.provider`.
  - Reproduce `#vyr-character-lab > .app` de `CharacterLabRoute`/`CharacterLabApp`.
  - Anidado, solo cambia el acento y los modos, sin repetir el id.
- **`.design-sync/sync.css`** (solo para la sincronización):
  - carga Inter desde Google Fonts (`[FONT_REMOTE]`, esperado);
  - quita el `min-height:100svh` y el layout centrado del contenedor;
  - define `--vyr-font-display` = `--vyr-font-ui`, porque el Lab no tiene fuente display.
- **`guidelinesGlob: []` a propósito.** El valor por defecto copiaría `docs/*.md` (DECISION_LOG, ORIGEN_REGLAS, PRIVATE_RESEARCH_USAGE…) a `guidelines/`, y eso queda fuera del alcance.
- **El arte no está en el bundle.**
  - `CharacterTabs` importa `data/characters.ts`, pero esbuild poda `characters`: ni siquiera quedan las cadenas `character-lab/art/*.webp`.
  - Las vistas previas usan un marcador SVG geométrico original en línea.
  - Antes de cada subida, comprueba con `find ds-bundle -iname '*.webp' -o -iname '*.png' | grep -v _screenshots` que la salida esté vacía.
- **Posición en la rejilla.** Las piezas del Lab traen `grid-column`/`grid-row` para `.game-screen`.
  - Dentro de un `display:grid` cualquiera crean columnas fantasma: el escenario a media celda, las pestañas desplazadas.
  - En las vistas previas, el escenario va en `grid-template-columns: 0 minmax(0,1fr)` y las pestañas en un bloque normal.
- **`CharacterTabs`:**
  - tiene `aria-controls="character-panel"` fijo, así que el `.info-slot` que lo acompaña debe llevar ese id;
  - usa `layoutId="selected-tab"` de motion. Con varias instancias en la misma página (la tarjeta en rejilla), el fondo activo puede animarse desde otra celda al montar; la captura por celda (`?story=`) no lo sufre.
- **Instalación de las dependencias del convertidor.** Usa `npm i --prefix "$PWD/.ds-sync" esbuild ts-morph @types/react`. Sin `--prefix`, el primer intento las escribió en el `package.json` y el `package-lock.json` del repo, y hubo que restaurarlos.
- **Playwright** se resuelve desde el `node_modules` del repo (1.64.1, con Chromium 1248 en `~/Library/Caches/ms-playwright`). No se instala nada aparte.

## Avisos conocidos del render check

- `tokens: … (1 missing, below threshold)`: es `--hero-accent`. Lo fija en línea quien compone cada héroe (roster, ficha, vistas previas de `HeroSigil`/`HeroVitals`). Es lo esperado.
- `[FONT_REMOTE] "Inter"`: es lo esperado (lo trae `sync.css`).

## Estados que no se pueden renderizar en estático

- `SwitchFX` con `active` y sin `reduced`: el SELECT viaja y los fragmentos cruzan en 690–800 ms, y al acabar quedan en opacidad 0. Solo hay celdas en reposo.
- La secuencia completa se ve en vivo en `CharacterStage › PantallaDeSeleccion`: hay que pulsar un retrato del rail.
- Hover del retrato y de las pestañas (motion `whileHover`): sin celda.

## Riesgos para la próxima sincronización

- **`dtsPropsFor` duplica las props de los 8 componentes y la forma de `Character` y de `HeroProfileViewModel`.** Si cambian `src/features/character-lab/components/*.tsx`, `data/characters.ts`, `HeroPresentation.tsx` o `heroProfile.ts`, el contrato queda desfasado sin que nada avise. Compáralo a mano.
- **Los datos de las vistas previas están copiados de `src/data/demo.ts`** (Vesper, Kael, Astra y Nyra). Si cambia la demo, las tarjetas no se enteran.
- **La tríada de acentos del Lab se asigna a Vesper, Kael y Astra solo en las vistas previas.** No es una decisión de producto.
- **Riesgos de `LabScope`:**
  - si `CharacterLabApp` cambia su contenedor (clases, variables `--accent*`, `data-*`), `LabScope` deja de reproducirlo;
  - repetir `#vyr-character-lab` en cada celda deja un HTML con ids duplicados. El CSS funciona, pero sería mejor que el Lab usara una clase.
- **Textos en inglés fijos dentro de los componentes** (BASE STATS, SUBJECT INFORMATION, ABILITY 0N, VISUAL ENGINE…). Se subieron tal cual, y `conventions.md` los marca como provisionales.
- **Inter llega por la red** (Google Fonts). La app real todavía no carga Inter, así que los diseños de Claude Design se verán distintos hasta que la app la cargue (queda como seguimiento para el propietario).
- **Toolchain:**
  - Node 22.23.2;
  - convertidor de `bundled-skills/2.1.316`;
  - React 19.3.1 empaquetado con esbuild porque no hay UMD.
