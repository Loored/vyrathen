import type { CSSProperties } from 'react';
import { LabScope, HeroVitals, toHeroProfile } from 'vyrathen';

import { vesper, astra } from '../fixtures';

const rosterData: CSSProperties = { width: 260, padding: '0 14px', background: 'var(--vyr-panel)', border: '1px solid var(--vyr-border)' };

/** En la tarjeta del escuadrón: dos máximos de configuración en columnas. */
export const Psico = () => (
  <LabScope surface="game">
  <div style={rosterData}>
    <HeroVitals profile={toHeroProfile(vesper)} />
  </div>
  </LabScope>
);

export const Defensa = () => (
  <LabScope surface="game">
  <div style={rosterData}>
    <HeroVitals profile={toHeroProfile(astra)} />
  </div>
  </LabScope>
);

/** Dentro de la columna de identidad de la ficha (`.vyr-profile-identity`) los números crecen a 40 px. */
export const FichaDeHeroe = () => {
  const profile = toHeroProfile(vesper);
  // La columna de identidad no lleva padding a la izquierda: en la ficha la alinea la rejilla de la página.
  return (
    <LabScope surface="game">
    <div style={{ paddingLeft: 16 }}>
      <div className="vyr-profile-identity" style={{ '--hero-accent': profile.presentation.accent, width: 280 } as CSSProperties}>
        <HeroVitals profile={profile} />
      </div>
    </div>
    </LabScope>
  );
};
