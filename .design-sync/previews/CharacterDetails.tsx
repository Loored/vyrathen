import { useReducedMotionPreference } from '../../src/features/character-lab/hooks/useReducedMotionPreference';
import { CharacterDetails, LabScope } from 'vyrathen';

import { squad } from '../fixtures';
const [vesper, kael, astra] = squad;

// En el Lab el panel vive en `.info-slot` (columna derecha, alto completo).
// El margen derecho del panel queda libre para el SELECT vertical.
const slot = { height: 640, width: '100%', maxWidth: 540 };

/** Pestaña de estadísticas: filas con números tabulares y una línea de barrido. */
export const Estadisticas = () => (
  <div className="info-slot" style={slot}>
    <CharacterDetails character={vesper} tab="stats" reduced={useReducedMotionPreference()} />
  </div>
);

/** Pestaña de habilidades: rejilla de nodos con chaflán (estructura demostrativa). */
export const Habilidades = () => (
  <LabScope accent={kael.accent} accentRgb={kael.accentRgb} scene={kael.surface} accentSoft="#FFE8DB">
    <div className="info-slot" style={slot}>
      <CharacterDetails character={kael} tab="skills" reduced={useReducedMotionPreference()} />
    </div>
  </LabScope>
);

/** Pestaña de equipo: anillo con rombo central y cuatro ranuras ilustrativas. */
export const Equipo = () => (
  <LabScope accent={astra.accent} accentRgb={astra.accentRgb} scene={astra.surface} accentSoft="#D8F8FF">
    <div className="info-slot" style={slot}>
      <CharacterDetails character={astra} tab="equipment" reduced={useReducedMotionPreference()} />
    </div>
  </LabScope>
);
