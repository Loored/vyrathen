# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Las reglas no negociables del proyecto (identidad Vyrathen, procedencia de reglas, seguridad, qué documentos leer por tarea) están en `AGENTS.md`. Este archivo no las repite; complementa con comandos y arquitectura. La UI, los docs y los mensajes del motor están en español.

Las skills de `.agents/skills/` usan formato Codex y Claude Code no las carga automáticamente. Lee a mano el `SKILL.md` que corresponda: `game-ui-implementation` (implementar UI / integrar Lab), `game-feel-engineer` (motion, SELECT, VFX), `game-art-direction`, `game-ux-designer`, `gameplay-fidelity-auditor` (cualquier cambio en reglas, stats, economía o afirmaciones históricas).

## Comandos

Node 22.16+ (el test runner ejecuta TS directamente con `--experimental-strip-types`; no hay Vitest/Jest ni linter).

```bash
npm run dev                 # Vite en http://localhost:5173  (/ y /character-lab)
npm test                    # node --test sobre tests/*.test.ts y tests/*.test.mjs (no incluye e2e)
npm run typecheck           # tsc --noEmit
npm run build               # typecheck + vite build
```

Un archivo o un test concreto:

```bash
node --experimental-strip-types --test tests/engine.test.ts
node --experimental-strip-types --test --test-name-pattern="13:1" tests/engine.test.ts
```

E2E con Playwright (Chromium; `npx playwright install chromium` la primera vez):

```bash
npm run test:ui                                  # levanta dev server en 127.0.0.1:4173 (el puerto debe estar libre)
npx playwright test tests/e2e/combat.spec.ts     # un spec
npm run build && npm run test:ui:ci              # como en CI: sirve dist/ con vite preview
```

Config por defecto de Playwright: 1366×768, `colorScheme: dark`, `reducedMotion: 'reduce'`, vídeo siempre. Toda la salida (informe, vídeos, capturas de evidencia, `combat-equivalence.json`) va a `output/playwright/`, ignorado por Git.

## Arquitectura

### Dos rutas, sin router
`src/main.tsx` elige por `location.pathname`: `/character-lab` → `CharacterLabRoute`, cualquier otra → `App`. Ambas se cargan con `lazy()` para que el CSS global de la alfa no se filtre al Lab (ADR-010). El CSS del Lab está acotado a `#vyr-character-lab`. Lo que comparten está en `src/ui/` (`GameTabs`, `game-ui.css`, ADR-011).

`App.tsx` concentra el estado de la alfa (sección, guardado, archivo) y dibuja las secciones dentro de `app/GameFrame.tsx`. Persiste `SaveData` (versión 1) en localStorage con la clave `vyrathen-v01`, mezclándolo superficialmente sobre `INITIAL_SAVE`. Cambiar la forma de `SaveData` exige migrar sin romper guardados v1. Los e2e inyectan estado escribiendo esa clave con `addInitScript` (ver `tests/e2e/pilot-helpers.ts`).

### Motor (`src/engine/`): TS puro, sin React/DOM/almacenamiento
- `rules.ts`: sólo helpers con respaldo documental (ciclo de tipos `beats`, `countTypePoints`, `chooseVictor` con empate a favor del defensor, daño nominal y coste de MP).
- `simulator.ts`: `simulateCombat(attackers, defenders, seed)` exige 5v5 con IDs únicos y usa un RNG xorshift con semilla (`createRng`). Iniciativa, probabilidad de actuar, acierto, esquiva, bloqueo y daño final son `remake_assumption`. Devuelve los combatientes **finales**, eventos por ronda (`r{ronda}-{n}`) y un `trace?` aditivo (v0.2): estado inicial más una entrada por evento con recursos antes/después. El evento K.O. enlaza la acción pero no lleva `attempt`.
- `quest.ts`: si no hay cambio devuelve **el mismo objeto**; `App` lo detecta con `next === save`.
- El tipo `Provenance` de `types.ts` hoy es `historical_document | observed_on_page | remake_assumption`, que no coincide del todo con la lista de `AGENTS.md`. Para añadir otra etiqueta hay que ampliar el tipo.

**La salida del motor está congelada.** `tests/combat-trace.test.ts` compara 60 proyecciones (SHA-256 en `tests/fixtures/combat-v01-projections.json`) y `combat-v01-1024.json` contra el motor base sin instrumentar. Cambiar el orden de llamadas al RNG o cualquier resultado rompe ese test. Si es intencional, se regenera la línea base y se documenta en un ADR.

### Reproducción del combate (`src/features/combat/`): presentación pura sobre un `CombatResult` inmutable
1. `playback.ts`: `adaptBattle` aplana las rondas en una timeline (una ronda vacía añade una parada de navegación, nunca un evento inventado). `transition` es el reducer de cursor único. `PLAYBACK_INTERVAL_MS = 2500` es el único reloj.
2. `resourcePlayback.ts`: `adaptResources` valida el `trace` **completo** antes de exponer frames de HP/MP. Si falta, es de otra versión o es inválido, pasa entero a modo `legacy` (guardados antiguos). No hay recuperación parcial ni reconstrucción a partir de fórmulas o de `message`.
3. `pilotModel.ts` / `pilotGeometry.ts`: `pilotTransition` envuelve `transition` y sólo añade vista, fase de inspección, `visualSerial` y permiso de animar. Nunca mueve el cursor por su cuenta. Las poses son CSS sobre spritesheets 4×2. No hay callbacks `animationend` ni timers por actor.
4. `pilotClip.ts`: clip grabado v0.4 Nyra (`h4`) → Grim (`e3`) de 2100 ms dentro del intervalo de 2500 ms.
   - Solo se usa si `eligibleClip` ve un intento de poder registrado y acertado, con ambos actores en pie. Los demás cruces usan el piloto.
   - Hojas 3×2 de celdas de 512 px (`nyra-sequence`, `grim-sequence`) y recortes reparados (`grim-repaired`).

Invariantes: la presentación no consume el RNG del motor, no escribe el guardado, no parsea `event.message` y se basa en `event.kind` y en los IDs del trace.

Arte del piloto: `public/combat-pilot/*.png` más `manifest.json`, que guarda dimensiones, orden de poses, anclajes y SHA-256. `tests/pilot-model.test.ts` verifica los hashes, así que al cambiar un PNG hay que actualizar el manifest.

### Héroes y Character Lab
- `features/heroes/heroProfile.ts`: `toHeroProfile` es un adaptador puro desde `Hero`. HP/MP son máximos de configuración, no el estado del último combate.
- `features/character-lab/`: sandbox visual **no canónico**. Sus personajes y stats (`data/characters.ts`) y su arte (`public/character-lab/art/`) no deben conectarse a `Hero`, al motor ni al combate. Su especificación está en `docs/design/CHARACTER_LAB_SPEC.md`.

### Detalles de los módulos que ejecuta Node
Todo lo que importan los tests unitarios (motor, `data/demo.ts`, modelos `.ts` de features) corre sin bundler:
- imports relativos con extensión `.ts` explícita;
- JSON con `with { type: 'json' }`;
- sólo sintaxis TS borrable: nada de `enum`, `namespace` ni parameter properties.

`tests/character-lab.test.mjs` es distinto: monta las rutas en jsdom mediante `vite.ssrLoadModule`.

Los e2e buscan elementos por nombres accesibles en español (p. ej. «Simulador de combate», «Avanzar un evento», «Escena 2D · candidata»). Renombrar etiquetas rompe esas pruebas.

## CI (`.github/workflows/`)
En PR a `main`, Chromium en ubuntu-22.04:
- captura evidencia «antes» sobre el checkout del commit base (`.cache/ui-base`);
- luego ejecuta `npm test`, `typecheck`, `build`, `test:ui:ci`;
- extrae frames del vídeo de la secuencia (`scripts/sequence-video-frames.mjs`);
- monta la galería de comparación (`scripts/ui-evidence-index.mjs`) y sube `output/playwright/` como artefacto.

Los specs `*-evidence.spec.ts` sacan capturas para que el propietario las revise; no hay baselines visuales. El workflow copia dentro del checkout base estos archivos, así que renombrarlos rompe CI:
- `tests/e2e/{frame,combat,pilot,sequence}-evidence.spec.ts`;
- `tests/e2e/{pilot,sequence}-helpers.ts`;
- `tests/fixtures/combat-v01-1024.json`.

## Decisiones
Las decisiones técnicas y de producto se registran como ADR numerados en `docs/DECISION_LOG.md` (el último es ADR-014). Las decisiones visuales aprobadas están en `docs/design/DECISIONS_V05.md`. Para cambios de arte o identidad, la aprobación del propietario es explícita: una aprobación artística no aprueba mecánicas ni derechos.

Catálogo de diseño y paso Claude Design → Codex CLI: [fuentes de verdad, ejecución y validación](docs/design/DESIGN_CATALOG.md).
