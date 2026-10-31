import { useReducedMotionPreference } from '../../src/features/character-lab/hooks/useReducedMotionPreference';
import { useState } from 'react';
import { CharacterRail, LabScope } from 'vyrathen';

import { squad, soft } from '../fixtures';

// El rail ocupa una columna alta: dale altura para que el pie quede abajo.
const column = { display: 'grid', width: 114, height: 470 };

/** Selección interactiva: el acento del LabScope sigue al personaje elegido. */
export const Seleccion = () => {
  const [selected, setSelected] = useState(0);
  const c = squad[selected];
  return (
    <LabScope accent={c.accent} accentRgb={c.accentRgb} scene={c.surface} accentSoft={soft[c.id]}>
      <div style={column}>
        <CharacterRail characters={squad} selected={selected} requested={selected} busy={false} reduced={useReducedMotionPreference()} onSelect={setSelected} />
      </div>
    </LabScope>
  );
};

/** Durante el cambio: el marcador sigue en el actual, el contador y aria-pressed ya apuntan al destino y el rail se bloquea. */
export const CambioEnCurso = () => (
  <div style={column}>
    <CharacterRail characters={squad} selected={0} requested={2} busy reduced={useReducedMotionPreference()} onSelect={() => {}} />
  </div>
);

/** Con Kael elegido, el borde y el brillo toman su acento coral. */
export const AcentoEnergia = () => (
  <LabScope accent="#FF785F" accentRgb="255,120,95" scene="#3d1521" accentSoft="#FFE8DB">
    <div style={column}>
      <CharacterRail characters={squad} selected={1} requested={1} busy={false} reduced={useReducedMotionPreference()} onSelect={() => {}} />
    </div>
  </LabScope>
);
