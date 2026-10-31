import { useReducedMotionPreference } from '../../src/features/character-lab/hooks/useReducedMotionPreference';
import { useEffect, useId, useRef, useState } from 'react';
import { CharacterDetails, CharacterRail, CharacterStage, CharacterTabs, LabScope, SwitchFX } from 'vyrathen';
import type { CharacterTab } from 'vyrathen';

import { squad, soft } from '../fixtures';
const [vesper, kael, astra] = squad;

// El CSS del escenario lo coloca en la columna 2 de `.game-screen`. Suelto, dale una
// rejilla con la columna 1 a 0 y una altura: si no, ocupa media celda o mide 0 px.
const frame = { display: 'grid', gridTemplateColumns: '0 minmax(0, 1fr)', width: '100%', height: 500 };

/**
 * Pantalla de selección completa sobre la rejilla `.game-screen` del Lab:
 * rail (col. 1), escenario (col. 2), panel `.info-slot` (col. 3), pestañas (fila 2) y SELECT.
 * Un solo reloj: el SELECT vuela, los datos cambian a 315 ms bajo el barrido y todo acaba a 800 ms.
 * El acento del LabScope sigue al personaje mostrado.
 */
export const PantallaDeSeleccion = () => {
  const reduced = useReducedMotionPreference();
  const panelId = useId();
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<CharacterTab>('stats');
  const [flight, setFlight] = useState<{ target: number; sequence: number } | null>(null);
  const sequence = useRef(0);
  useEffect(() => {
    if (!flight) return;
    if (reduced) { setSelected(flight.target); setFlight(null); return; }
    const reveal = window.setTimeout(() => setSelected(flight.target), 315);
    const done = window.setTimeout(() => setFlight(null), 800);
    return () => { window.clearTimeout(reveal); window.clearTimeout(done); };
  }, [flight, reduced]);
  const select = (index: number) => {
    if (reduced) { setSelected(index); return; }
    if (!flight && index !== selected) setFlight({ target: index, sequence: ++sequence.current });
  };
  const character = squad[selected];
  const requested = flight?.target ?? selected;
  return (
    <LabScope accent={character.accent} accentRgb={character.accentRgb} scene={character.surface} accentSoft={soft[character.id]}>
      <div className={`game-screen catalog-selection ${flight ? 'is-switching' : ''}`}>
        <CharacterRail characters={squad} selected={selected} requested={requested} busy={flight !== null} reduced={reduced} onSelect={select} />
        <CharacterStage character={character} ambient reduced={reduced} />
        {/* Panel e IDs locales a esta composición. */}
        <div id={panelId} className="info-slot" role="tabpanel" aria-labelledby={`${panelId}-tab-${tab}`} tabIndex={0}>
          <CharacterDetails character={character} tab={tab} reduced={reduced} />
        </div>
        <CharacterTabs panelId={panelId} active={tab} onChange={setTab} reduced={reduced} />
        <SwitchFX active={flight !== null} targetName={squad[requested].name} sequence={flight?.sequence ?? sequence.current} reduced={reduced} />
      </div>
    </LabScope>
  );
};

/** Escenario suelto: rejilla, tipografía ambiental delante y detrás, órbitas y viñeta. */
export const Vesper = () => (
  <div style={frame}>
    <CharacterStage character={vesper} ambient reduced={useReducedMotionPreference()} />
  </div>
);

/** Ambiente pausado (tecla M en el Lab): la tipografía y las órbitas se detienen. */
export const AmbientePausado = () => (
  <LabScope accent={kael.accent} accentRgb={kael.accentRgb} scene={kael.surface} accentSoft={soft.h1} ambient={false}>
    <div style={frame}>
      <CharacterStage character={kael} ambient={false} reduced={useReducedMotionPreference()} />
    </div>
  </LabScope>
);

/** Movimiento reducido: sin entrada de la ilustración y con todas las animaciones a 0. */
export const MovimientoReducido = () => (
  <LabScope accent={astra.accent} accentRgb={astra.accentRgb} scene={astra.surface} accentSoft={soft.h3} reduced>
    <div style={frame}>
      <CharacterStage character={astra} ambient reduced />
    </div>
  </LabScope>
);
