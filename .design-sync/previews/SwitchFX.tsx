import { useReducedMotionPreference } from '../../src/features/character-lab/hooks/useReducedMotionPreference';
import { CharacterDetails, LabScope, SwitchFX } from 'vyrathen';

import { squad } from '../fixtures';
const [vesper, kael] = squad;

// El SELECT se ancla al borde derecho del contenedor posicionado más cercano
// (en el Lab, la pantalla de juego), sobre el margen que el panel le reserva.
const screen = { position: 'relative' as const, height: 640, width: '100%', maxWidth: 540 };

/** SELECT en reposo: una sola pieza vertical, blanca, anclada a la derecha del panel. */
export const Reposo = () => (
  <div style={screen}>
    <div className="info-slot" style={{ height: '100%' }}>
      <CharacterDetails character={vesper} tab="stats" reduced={useReducedMotionPreference()} />
    </div>
    <SwitchFX active={false} targetName={vesper.name} sequence={0} reduced={useReducedMotionPreference()} />
  </div>
);

/** Con otro personaje el SELECT no cambia de color: el acento solo tiñe el panel. */
export const ReposoEnergia = () => (
  <LabScope accent={kael.accent} accentRgb={kael.accentRgb} scene={kael.surface} accentSoft="#FFE8DB">
    <div style={screen}>
      <div className="info-slot" style={{ height: '100%' }}>
        <CharacterDetails character={kael} tab="stats" reduced={useReducedMotionPreference()} />
      </div>
      <SwitchFX active={false} targetName={kael.name} sequence={0} reduced={useReducedMotionPreference()} />
    </div>
  </LabScope>
);
