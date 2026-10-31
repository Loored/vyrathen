import type { CSSProperties } from 'react';
import { HeroVitals, toHeroProfile } from 'vyrathen';
import type { Hero } from 'vyrathen';

// Héroes sintéticos de la demo (src/data/demo.ts). Valores de configuración, no canónicos.
const vesper: Hero = { id: 'h2', name: 'Vesper', type: 'Psico', level: 7, maxHp: 330, maxMp: 155, hit: 64, block: 53, dodge: 69, mental: 82, speed: 69, power: 'Dar ordenes', powerLevel: 4 };
const astra: Hero = { id: 'h3', name: 'Astra', type: 'Defensa', level: 9, maxHp: 425, maxMp: 115, hit: 70, block: 85, dodge: 40, mental: 65, speed: 45, power: 'Regeneracion', powerLevel: 5 };

const rosterData: CSSProperties = { width: 260, padding: '0 14px', background: 'var(--vyr-panel)', border: '1px solid var(--vyr-border)' };

/** En la tarjeta del escuadrón: dos máximos de configuración en columnas. */
export const Psico = () => (
  <div style={rosterData}>
    <HeroVitals profile={toHeroProfile(vesper)} />
  </div>
);

export const Defensa = () => (
  <div style={rosterData}>
    <HeroVitals profile={toHeroProfile(astra)} />
  </div>
);

/** Dentro de la columna de identidad de la ficha (`.vyr-profile-identity`) los números crecen a 40 px. */
export const FichaDeHeroe = () => {
  const profile = toHeroProfile(vesper);
  // La columna de identidad no lleva padding a la izquierda: en la ficha la alinea la rejilla de la página.
  return (
    <div style={{ paddingLeft: 16 }}>
      <div className="vyr-profile-identity" style={{ '--hero-accent': profile.presentation.accent, width: 280 } as CSSProperties}>
        <HeroVitals profile={profile} />
      </div>
    </div>
  );
};
