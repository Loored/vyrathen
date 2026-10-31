import type { CSSProperties } from 'react';
import { LabScope, HeroSigil, toHeroProfile } from 'vyrathen';
import type { Hero } from 'vyrathen';

import { vesper, kael, astra, nyra } from '../fixtures';

// El sigilo toma su color de `--hero-accent`: ponlo en un ancestro con el acento del perfil.
const Card = ({ hero }: { hero: Hero }) => {
  const profile = toHeroProfile(hero);
  return (
    <div style={{ '--hero-accent': profile.presentation.accent, width: 240, background: 'var(--vyr-panel)', border: '1px solid var(--vyr-border)' } as CSSProperties}>
      <HeroSigil profile={profile} />
    </div>
  );
};

/** Símbolo provisional por tipo, rombos concéntricos, nombre fantasma y registro `VYR / H2`. */
export const Psico = () => <LabScope surface="game"><Card hero={vesper} /></LabScope>;
export const Energia = () => <LabScope surface="game"><Card hero={kael} /></LabScope>;
export const Defensa = () => <LabScope surface="game"><Card hero={astra} /></LabScope>;
export const Control = () => <LabScope surface="game"><Card hero={nyra} /></LabScope>;

/** En la columna de identidad de la ficha el sigilo crece (200 px de alto, símbolo de 76 px). */
export const FichaDeHeroe = () => {
  const profile = toHeroProfile(vesper);
  return (
    <LabScope surface="game">
    <div style={{ paddingLeft: 16 }}>
      <div className="vyr-profile-identity" style={{ '--hero-accent': profile.presentation.accent, width: 280 } as CSSProperties}>
        <HeroSigil profile={profile} />
      </div>
    </div>
    </LabScope>
  );
};
