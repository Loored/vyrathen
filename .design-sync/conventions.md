# Vyrathen: identidad del Character Lab

Interfaz oscura de tipo dossier o terminal: grafito azul marino, líneas finas de 1 px, chaflanes con `clip-path`, radio 0 y un acento por personaje. El blanco marca lo activo.

## Envoltorio obligatorio: `LabScope`

Todo va dentro de `<LabScope>` (`window.Vyrathen.LabScope`). Reproduce `#vyr-character-lab > .app`. Sin él no se aplican el fondo, el texto, el foco blanco, Inter ni `--accent*`, y los componentes salen sin estilo.

- Props: `accent`, `accentRgb` (`"187,132,255"`), `scene`, `accentSoft`, `reduced` y `ambient`.
- El acento sigue al personaje mostrado. Para cambiarlo en una zona, anida otro `LabScope`; el anidado no repite el id.
- Tríada del Lab (accent / accentRgb / scene / accentSoft):
  - violeta `#BB84FF` / `187,132,255` / `#251a49` / `#F2E6FF`;
  - coral `#FF785F` / `255,120,95` / `#3d1521` / `#FFE8DB`;
  - cian `#5ED8FF` / `94,216,255` / `#112a43` / `#D8F8FF`.

## Estilo: CSS global y tokens (no hay utilidades ni props de estilo)

- **Tokens:**
  - colores: `var(--vyr-bg)`, `--vyr-panel`, `--vyr-surface`, `--vyr-border`, `--vyr-text`, `--vyr-muted` y `--vyr-focus` (blanco en el Lab);
  - espaciado: `--vyr-space-1|2|3|4|6` (4/8/12/16/24 px);
  - movimiento: `--vyr-ease`, `--vyr-fast` y `--vyr-standard`;
  - fuente: `--vyr-font-ui` (Inter);
  - controles: `--vyr-control-bg|text|border|hover`.
- **Acento:**
  - `var(--accent)` para etiquetas cortas y bordes de selección;
  - `rgba(var(--accent-rgb), .1–.5)` para brillos y chips;
  - `--accent-soft` para el relleno activo;
  - `--scene` para el fondo del escenario.
- **Clases:**
  - `.game-section-kicker` para microetiquetas;
  - `.game-panel`;
  - `.game-action--secondary` (junto con `.game-action`).
  - `.game-action` a secas es el primario menta heredado de la alfa. Para el primario de esta identidad, fija `--vyr-action-bg:#f0f3fc; --vyr-action-text:#0b1020; --vyr-action-radius:2px` en un ancestro, como hace el marco global.
- **Tipos de héroe** (solo semántica de juego, no acento de identidad): `--vyr-type-psico`, `--vyr-type-energia`, `--vyr-type-defensa` y `--vyr-type-control`.
- **Fuentes de verdad:** `styles.css` → `_ds_bundle.css`, y el `.d.ts` y el `.prompt.md` de cada componente.

## Composición

- Las piezas del Lab ya traen su sitio en la rejilla `.game-screen` (114 px | 1fr | 37 %; filas 1fr | 78 px):
  - `CharacterRail`: columna 1;
  - `CharacterStage`: columna 2;
  - `CharacterDetails`: dentro de `<div id="character-panel" className="info-slot" role="tabpanel">`, en la columna 3;
  - `CharacterTabs`: fila 2;
  - `SwitchFX`: absoluto, dentro de `.game-screen`.
- Fuera de la rejilla:
  - `CharacterStage` necesita un padre `display:grid; grid-template-columns:0 minmax(0,1fr)` con altura;
  - `CharacterTabs` necesita un bloque normal;
  - `CharacterDetails` necesita altura.
- `HeroSigil` y `HeroVitals` reciben `toHeroProfile(hero)`. `HeroSigil` además necesita `--hero-accent: profile.presentation.accent` en un ancestro.
- `reduced` sale de `prefers-reduced-motion`; pásalo igual a `LabScope` y a cada componente.

## Reglas

- **Español primero, con voz dossier:** `//`, códigos (`VYR-H2`, `DATA // 01`) y mayúsculas cortas. Las etiquetas en inglés que traen dentro `CharacterDetails`, `CharacterTabs`, `CharacterStage`, `CharacterRail` y `SwitchFX` son provisionales: no las copies en texto nuevo.
- **El SELECT (`SwitchFX`), los fragmentos y los retratos del rail son exclusivos de la selección de personaje.** Nunca aparecen en navegación, diálogos ni acciones. Solo hay un SELECT vertical.
- **Stats del dominio:** HP máximo, MP máximo, Golpear, Bloquear, Esquivar, Mental y Velocidad. Nada de ATK, CRIT ni ENERGY.
- **Sin ilustraciones de personaje:** en `art`, usa un marcador geométrico propio (SVG).

```jsx
const { LabScope, CharacterRail, CharacterStage, CharacterDetails, CharacterTabs, SwitchFX } = window.Vyrathen;
<LabScope accent={c.accent} accentRgb={c.accentRgb} scene={c.surface} accentSoft="#F2E6FF" reduced={reduced}>
  <div className="game-screen" style={{ height: 600 }}>
    <CharacterRail characters={squad} selected={i} requested={i} busy={false} reduced={reduced} onSelect={setI} />
    <CharacterStage character={c} ambient reduced={reduced} />
    <div id="character-panel" className="info-slot" role="tabpanel" aria-labelledby={`character-tab-${tab}`} tabIndex={0}>
      <CharacterDetails character={c} tab={tab} reduced={reduced} />
    </div>
    <CharacterTabs active={tab} onChange={setTab} reduced={reduced} />
    <SwitchFX active={false} targetName={c.name} sequence={0} reduced={reduced} />
  </div>
</LabScope>
```
