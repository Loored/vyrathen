import type { CSSProperties } from 'react';
import { HeroSigil, toHeroProfile } from 'vyrathen';
import type { Hero } from 'vyrathen';

// Héroes sintéticos de la demo (src/data/demo.ts), uno por tipo. Valores no canónicos.
const vesper: Hero = { id: 'h2', name: 'Vesper', type: 'Psico', level: 7, maxHp: 330, maxMp: 155, hit: 64, block: 53, dodge: 69, mental: 82, speed: 69, power: 'Dar ordenes', powerLevel: 4 };
const kael: Hero = { id: 'h1', name: 'Kael', type: 'Energía', level: 8, maxHp: 360, maxMp: 130, hit: 75, block: 55, dodge: 52, mental: 48, speed: 72, power: 'Fuego', powerLevel: 5 };
const astra: Hero = { id: 'h3', name: 'Astra', type: 'Defensa', level: 9, maxHp: 425, maxMp: 115, hit: 70, block: 85, dodge: 40, mental: 65, speed: 45, power: 'Regeneracion', powerLevel: 5 };
const nyra: Hero = { id: 'h4', name: 'Nyra', type: 'Control', level: 8, maxHp: 335, maxMp: 140, hit: 73, block: 46, dodge: 77, mental: 68, speed: 83, power: 'Telequinesis', powerLevel: 5 };

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
export const Psico = () => <Card hero={vesper} />;
export const Energia = () => <Card hero={kael} />;
export const Defensa = () => <Card hero={astra} />;
export const Control = () => <Card hero={nyra} />;

/** En la columna de identidad de la ficha el sigilo crece (200 px de alto, símbolo de 76 px). */
export const FichaDeHeroe = () => {
  const profile = toHeroProfile(vesper);
  return (
    <div style={{ paddingLeft: 16 }}>
      <div className="vyr-profile-identity" style={{ '--hero-accent': profile.presentation.accent, width: 280 } as CSSProperties}>
        <HeroSigil profile={profile} />
      </div>
    </div>
  );
};
