import { useEffect, useRef, useState } from 'react';
import { CharacterDetails, CharacterRail, CharacterStage, CharacterTabs, LabScope, SwitchFX } from 'vyrathen';
import type { Character, CharacterTab } from 'vyrathen';

// Marcador geométrico original: sustituye a las ilustraciones, que no salen del repo.
const marker = (accent: string, scene: string) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><defs><radialGradient id="g" cx="52%" cy="38%" r="55%"><stop offset="0" stop-color="${accent}" stop-opacity=".5"/><stop offset="1" stop-color="${scene}" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="900" fill="${scene}"/><rect width="1200" height="900" fill="url(#g)"/><g fill="none" stroke="${accent}" transform="translate(624 342)"><rect x="-130" y="-130" width="260" height="260" transform="rotate(45)" stroke-width="6"/><rect x="-215" y="-215" width="430" height="430" transform="rotate(45)" stroke-opacity=".35" stroke-width="3"/><circle r="70" stroke-width="4" stroke-opacity=".85"/><path d="M-520 330 520 -330" stroke-opacity=".3" stroke-width="3"/></g></svg>`,
  );

const stats = (hp: number, mp: number, hit: number, block: number, dodge: number, mental: number, speed: number) =>
  ([['HP MÁXIMO', hp], ['MP MÁXIMO', mp], ['GOLPEAR', hit], ['BLOQUEAR', block], ['ESQUIVAR', dodge], ['MENTAL', mental], ['VELOCIDAD', speed]] as const)
    .map(([label, value]) => ({ label, value: String(value) }));

const base = { quote: 'Sin cita registrada en el archivo.', intro: 'Héroe de demostración del Laboratorio Aurora. Valores de configuración, no canónicos.' };
// Héroes sintéticos de la demo (src/data/demo.ts), con la tríada de acentos del Lab.
const squad: Character[] = [
  { ...base, id: 'vesper', name: 'Vesper', title: 'PSICO // NIVEL 07', code: 'VYR-H2', archive: 'PSICO // ARCHIVO', category: 'PSICO', tags: ['PSICO', 'DAR ÓRDENES · N4', 'DEMO'], stats: stats(330, 155, 64, 53, 69, 82, 69), accent: '#BB84FF', accentRgb: '187,132,255', surface: '#251a49', art: marker('#BB84FF', '#251a49') },
  { ...base, id: 'kael', name: 'Kael', title: 'ENERGÍA // NIVEL 08', code: 'VYR-H1', archive: 'ENERGÍA // ARCHIVO', category: 'ENERGÍA', tags: ['ENERGÍA', 'FUEGO · N5', 'DEMO'], stats: stats(360, 130, 75, 55, 52, 48, 72), accent: '#FF785F', accentRgb: '255,120,95', surface: '#3d1521', art: marker('#FF785F', '#3d1521') },
  { ...base, id: 'astra', name: 'Astra', title: 'DEFENSA // NIVEL 09', code: 'VYR-H3', archive: 'DEFENSA // ARCHIVO', category: 'DEFENSA', tags: ['DEFENSA', 'REGENERACIÓN · N5', 'DEMO'], stats: stats(425, 115, 70, 85, 40, 65, 45), accent: '#5ED8FF', accentRgb: '94,216,255', surface: '#112a43', art: marker('#5ED8FF', '#112a43') },
];
const soft: Record<string, string> = { vesper: '#F2E6FF', kael: '#FFE8DB', astra: '#D8F8FF' };
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
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<CharacterTab>('stats');
  const [flight, setFlight] = useState<{ target: number; sequence: number } | null>(null);
  const sequence = useRef(0);
  useEffect(() => {
    if (!flight) return;
    const reveal = window.setTimeout(() => setSelected(flight.target), 315);
    const done = window.setTimeout(() => setFlight(null), 800);
    return () => { window.clearTimeout(reveal); window.clearTimeout(done); };
  }, [flight]);
  const select = (index: number) => {
    if (!flight && index !== selected) setFlight({ target: index, sequence: ++sequence.current });
  };
  const character = squad[selected];
  const requested = flight?.target ?? selected;
  return (
    <LabScope accent={character.accent} accentRgb={character.accentRgb} scene={character.surface} accentSoft={soft[character.id]}>
      <div className={`game-screen ${flight ? 'is-switching' : ''}`} style={{ height: 600 }}>
        <CharacterRail characters={squad} selected={selected} requested={requested} busy={flight !== null} reduced={false} onSelect={select} />
        <CharacterStage character={character} ambient reduced={false} />
        {/* CharacterTabs apunta con aria-controls a `character-panel`. */}
        <div id="character-panel" className="info-slot" role="tabpanel" aria-labelledby={`character-tab-${tab}`} tabIndex={0}>
          <CharacterDetails character={character} tab={tab} reduced={false} />
        </div>
        <CharacterTabs active={tab} onChange={setTab} reduced={false} />
        <SwitchFX active={flight !== null} targetName={squad[requested].name} sequence={flight?.sequence ?? sequence.current} reduced={false} />
      </div>
    </LabScope>
  );
};

/** Escenario suelto: rejilla, tipografía ambiental delante y detrás, órbitas y viñeta. */
export const Vesper = () => (
  <div style={frame}>
    <CharacterStage character={vesper} ambient reduced={false} />
  </div>
);

/** Ambiente pausado (tecla M en el Lab): la tipografía y las órbitas se detienen. */
export const AmbientePausado = () => (
  <LabScope accent={kael.accent} accentRgb={kael.accentRgb} scene={kael.surface} accentSoft={soft.kael} ambient={false}>
    <div style={frame}>
      <CharacterStage character={kael} ambient={false} reduced={false} />
    </div>
  </LabScope>
);

/** Movimiento reducido: sin entrada de la ilustración y con todas las animaciones a 0. */
export const MovimientoReducido = () => (
  <LabScope accent={astra.accent} accentRgb={astra.accentRgb} scene={astra.surface} accentSoft={soft.astra} reduced>
    <div style={frame}>
      <CharacterStage character={astra} ambient reduced />
    </div>
  </LabScope>
);
