import { CharacterDetails, LabScope } from 'vyrathen';
import type { Character } from 'vyrathen';

const stats = (hp: number, mp: number, hit: number, block: number, dodge: number, mental: number, speed: number) =>
  ([['HP MÁXIMO', hp], ['MP MÁXIMO', mp], ['GOLPEAR', hit], ['BLOQUEAR', block], ['ESQUIVAR', dodge], ['MENTAL', mental], ['VELOCIDAD', speed]] as const)
    .map(([label, value]) => ({ label, value: String(value) }));

// Héroes sintéticos de la demo (src/data/demo.ts), con la tríada de acentos del Lab.
const vesper: Character = { id: 'vesper', name: 'Vesper', title: 'PSICO // NIVEL 07', code: 'VYR-H2', archive: 'PSICO // ARCHIVO', category: 'PSICO', quote: 'Sin cita registrada en el archivo.', intro: 'Héroe de demostración del Laboratorio Aurora. Valores de configuración, no canónicos.', tags: ['PSICO', 'DAR ÓRDENES · N4', 'DEMO'], stats: stats(330, 155, 64, 53, 69, 82, 69), accent: '#BB84FF', accentRgb: '187,132,255', surface: '#251a49', art: '' };
const kael: Character = { id: 'kael', name: 'Kael', title: 'ENERGÍA // NIVEL 08', code: 'VYR-H1', archive: 'ENERGÍA // ARCHIVO', category: 'ENERGÍA', quote: 'Sin cita registrada en el archivo.', intro: 'Héroe de demostración del Laboratorio Aurora. Valores de configuración, no canónicos.', tags: ['ENERGÍA', 'FUEGO · N5', 'DEMO'], stats: stats(360, 130, 75, 55, 52, 48, 72), accent: '#FF785F', accentRgb: '255,120,95', surface: '#3d1521', art: '' };
const astra: Character = { id: 'astra', name: 'Astra', title: 'DEFENSA // NIVEL 09', code: 'VYR-H3', archive: 'DEFENSA // ARCHIVO', category: 'DEFENSA', quote: 'Sin cita registrada en el archivo.', intro: 'Héroe de demostración del Laboratorio Aurora. Valores de configuración, no canónicos.', tags: ['DEFENSA', 'REGENERACIÓN · N5', 'DEMO'], stats: stats(425, 115, 70, 85, 40, 65, 45), accent: '#5ED8FF', accentRgb: '94,216,255', surface: '#112a43', art: '' };

// En el Lab el panel vive en `.info-slot` (columna derecha, alto completo).
// El margen derecho del panel queda libre para el SELECT vertical.
const slot = { height: 640, width: '100%', maxWidth: 540 };

/** Pestaña de estadísticas: filas con números tabulares y una línea de barrido. */
export const Estadisticas = () => (
  <div className="info-slot" style={slot}>
    <CharacterDetails character={vesper} tab="stats" reduced={false} />
  </div>
);

/** Pestaña de habilidades: rejilla de nodos con chaflán (estructura demostrativa). */
export const Habilidades = () => (
  <LabScope accent={kael.accent} accentRgb={kael.accentRgb} scene={kael.surface} accentSoft="#FFE8DB">
    <div className="info-slot" style={slot}>
      <CharacterDetails character={kael} tab="skills" reduced={false} />
    </div>
  </LabScope>
);

/** Pestaña de equipo: anillo con rombo central y cuatro ranuras ilustrativas. */
export const Equipo = () => (
  <LabScope accent={astra.accent} accentRgb={astra.accentRgb} scene={astra.surface} accentSoft="#D8F8FF">
    <div className="info-slot" style={slot}>
      <CharacterDetails character={astra} tab="equipment" reduced={false} />
    </div>
  </LabScope>
);
