/**
 * Entrada curada del bundle de Claude Design (`window.Vyrathen`).
 *
 * Solo la identidad del Character Lab más las piezas compartidas que ya la
 * consumen. No exporta CharacterLabApp ni CharacterLabRoute: cargarían las
 * ilustraciones del Lab, que no salen del repo.
 */
import { createContext, useContext } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import '../src/ui/game-ui.css';
import '../src/features/character-lab/styles/character-lab.css';
import '../src/features/heroes/characters.css';
import './sync.css';

export { GameTabs } from '../src/ui/GameTabs.tsx';
export type { GameTab } from '../src/ui/GameTabs.tsx';
export { HeroSigil, HeroVitals } from '../src/features/heroes/HeroPresentation.tsx';
export { toHeroProfile } from '../src/features/heroes/heroProfile.ts';
export type { HeroProfileViewModel } from '../src/features/heroes/heroProfile.ts';
export type { Hero } from '../src/engine/types.ts';
export { CharacterRail } from '../src/features/character-lab/components/CharacterRail.tsx';
export { CharacterStage } from '../src/features/character-lab/components/CharacterStage.tsx';
export { CharacterDetails } from '../src/features/character-lab/components/CharacterDetails.tsx';
export { CharacterTabs } from '../src/features/character-lab/components/CharacterTabs.tsx';
export { SwitchFX } from '../src/features/character-lab/components/SwitchFX.tsx';
export type { Character, CharacterTab, Stat } from '../src/features/character-lab/data/characters.ts';

const InsideLabScope = createContext(false);

export interface LabScopeProps {
  children?: ReactNode;
  /** Acento del personaje, p. ej. `#BB84FF`. Por defecto, el violeta del Lab. */
  accent?: string;
  /** El mismo acento como `r,g,b` (lo usan los brillos `rgba(var(--accent-rgb), α)`). */
  accentRgb?: string;
  /** Fondo radial del escenario, p. ej. `#251a49`. */
  scene?: string;
  /** Tono claro del acento: relleno de la pestaña activa y degradado del nombre. */
  accentSoft?: string;
  /** Movimiento reducido: pone a 0 todas las animaciones y transiciones CSS. */
  reduced?: boolean;
  /** Ambiente: con `false` pausa la tipografía ambiental y las órbitas. */
  ambient?: boolean;
}

/**
 * Raíz de la identidad del Lab. Reproduce el contenedor `#vyr-character-lab > .app`
 * de `CharacterLabRoute`/`CharacterLabApp` (tokens `--vyr-*`, acento `--accent*`,
 * `data-reduced`, `data-ambient`) sin el layout de pantalla completa.
 * Anidado dentro de otro LabScope solo cambia el acento y los modos, sin repetir el id.
 */
export function LabScope({ children, accent, accentRgb, scene, accentSoft, reduced = false, ambient = true }: LabScopeProps) {
  const nested = useContext(InsideLabScope);
  const theme: Record<string, string> = {};
  if (accent) theme['--accent'] = accent;
  if (accentRgb) theme['--accent-rgb'] = accentRgb;
  if (scene) theme['--scene'] = scene;
  if (accentSoft) theme['--accent-soft'] = accentSoft;
  const app = (
    <div className="app vyr-lab-scope-app" style={theme as CSSProperties} data-reduced={reduced} data-ambient={ambient}>
      {children}
    </div>
  );
  if (nested) return app;
  return (
    <InsideLabScope.Provider value>
      <div id="vyr-character-lab" className="vyr-lab-scope">{app}</div>
    </InsideLabScope.Provider>
  );
}
