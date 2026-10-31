import { CharacterDetails, LabScope, SwitchFX } from 'vyrathen';
import type { Character } from 'vyrathen';

const stats = (hp: number, mp: number, hit: number, block: number, dodge: number, mental: number, speed: number) =>
  ([['HP MÁXIMO', hp], ['MP MÁXIMO', mp], ['GOLPEAR', hit], ['BLOQUEAR', block], ['ESQUIVAR', dodge], ['MENTAL', mental], ['VELOCIDAD', speed]] as const)
    .map(([label, value]) => ({ label, value: String(value) }));

// Héroes sintéticos de la demo (src/data/demo.ts), con la tríada de acentos del Lab.
const vesper: Character = { id: 'vesper', name: 'Vesper', title: 'PSICO // NIVEL 07', code: 'VYR-H2', archive: 'PSICO // ARCHIVO', category: 'PSICO', quote: 'Sin cita registrada en el archivo.', intro: 'Héroe de demostración del Laboratorio Aurora. Valores de configuración, no canónicos.', tags: ['PSICO', 'DAR ÓRDENES · N4', 'DEMO'], stats: stats(330, 155, 64, 53, 69, 82, 69), accent: '#BB84FF', accentRgb: '187,132,255', surface: '#251a49', art: '' };
const kael: Character = { id: 'kael', name: 'Kael', title: 'ENERGÍA // NIVEL 08', code: 'VYR-H1', archive: 'ENERGÍA // ARCHIVO', category: 'ENERGÍA', quote: 'Sin cita registrada en el archivo.', intro: 'Héroe de demostración del Laboratorio Aurora. Valores de configuración, no canónicos.', tags: ['ENERGÍA', 'FUEGO · N5', 'DEMO'], stats: stats(360, 130, 75, 55, 52, 48, 72), accent: '#FF785F', accentRgb: '255,120,95', surface: '#3d1521', art: '' };

// El SELECT se ancla al borde derecho del contenedor posicionado más cercano
// (en el Lab, la pantalla de juego), sobre el margen que el panel le reserva.
const screen = { position: 'relative' as const, height: 640, width: '100%', maxWidth: 540 };

/** SELECT en reposo: una sola pieza vertical, blanca, anclada a la derecha del panel. */
export const Reposo = () => (
  <div style={screen}>
    <div className="info-slot" style={{ height: '100%' }}>
      <CharacterDetails character={vesper} tab="stats" reduced={false} />
    </div>
    <SwitchFX active={false} targetName={vesper.name} sequence={0} reduced={false} />
  </div>
);

/** Con otro personaje el SELECT no cambia de color: el acento solo tiñe el panel. */
export const ReposoEnergia = () => (
  <LabScope accent={kael.accent} accentRgb={kael.accentRgb} scene={kael.surface} accentSoft="#FFE8DB">
    <div style={screen}>
      <div className="info-slot" style={{ height: '100%' }}>
        <CharacterDetails character={kael} tab="stats" reduced={false} />
      </div>
      <SwitchFX active={false} targetName={kael.name} sequence={0} reduced={false} />
    </div>
  </LabScope>
);
