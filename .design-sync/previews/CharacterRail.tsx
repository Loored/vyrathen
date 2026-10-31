import { useState } from 'react';
import { CharacterRail, LabScope } from 'vyrathen';
import type { Character } from 'vyrathen';

// Marcador geométrico original: sustituye a las ilustraciones, que no salen del repo.
const marker = (accent: string, scene: string) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><defs><radialGradient id="g" cx="52%" cy="38%" r="55%"><stop offset="0" stop-color="${accent}" stop-opacity=".5"/><stop offset="1" stop-color="${scene}" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="900" fill="${scene}"/><rect width="1200" height="900" fill="url(#g)"/><g fill="none" stroke="${accent}" transform="translate(624 342)"><rect x="-130" y="-130" width="260" height="260" transform="rotate(45)" stroke-width="6"/><rect x="-215" y="-215" width="430" height="430" transform="rotate(45)" stroke-opacity=".35" stroke-width="3"/><circle r="70" stroke-width="4" stroke-opacity=".85"/><path d="M-520 330 520 -330" stroke-opacity=".3" stroke-width="3"/></g></svg>`,
  );

const stats = (hp: number, mp: number, hit: number, block: number, dodge: number, mental: number, speed: number) =>
  ([['HP MÁXIMO', hp], ['MP MÁXIMO', mp], ['GOLPEAR', hit], ['BLOQUEAR', block], ['ESQUIVAR', dodge], ['MENTAL', mental], ['VELOCIDAD', speed]] as const)
    .map(([label, value]) => ({ label, value: String(value) }));

// Héroes sintéticos de la demo (src/data/demo.ts), con la tríada de acentos del Lab.
const squad: Character[] = [
  { id: 'vesper', name: 'Vesper', title: 'PSICO // NIVEL 07', code: 'VYR-H2', archive: 'PSICO // ARCHIVO', category: 'PSICO', quote: 'Sin cita registrada en el archivo.', intro: 'Héroe de demostración del Laboratorio Aurora. Valores de configuración, no canónicos.', tags: ['PSICO', 'DAR ÓRDENES · N4', 'DEMO'], stats: stats(330, 155, 64, 53, 69, 82, 69), accent: '#BB84FF', accentRgb: '187,132,255', surface: '#251a49', art: marker('#BB84FF', '#251a49') },
  { id: 'kael', name: 'Kael', title: 'ENERGÍA // NIVEL 08', code: 'VYR-H1', archive: 'ENERGÍA // ARCHIVO', category: 'ENERGÍA', quote: 'Sin cita registrada en el archivo.', intro: 'Héroe de demostración del Laboratorio Aurora. Valores de configuración, no canónicos.', tags: ['ENERGÍA', 'FUEGO · N5', 'DEMO'], stats: stats(360, 130, 75, 55, 52, 48, 72), accent: '#FF785F', accentRgb: '255,120,95', surface: '#3d1521', art: marker('#FF785F', '#3d1521') },
  { id: 'astra', name: 'Astra', title: 'DEFENSA // NIVEL 09', code: 'VYR-H3', archive: 'DEFENSA // ARCHIVO', category: 'DEFENSA', quote: 'Sin cita registrada en el archivo.', intro: 'Héroe de demostración del Laboratorio Aurora. Valores de configuración, no canónicos.', tags: ['DEFENSA', 'REGENERACIÓN · N5', 'DEMO'], stats: stats(425, 115, 70, 85, 40, 65, 45), accent: '#5ED8FF', accentRgb: '94,216,255', surface: '#112a43', art: marker('#5ED8FF', '#112a43') },
];
const soft: Record<string, string> = { vesper: '#F2E6FF', kael: '#FFE8DB', astra: '#D8F8FF' };

// El rail ocupa una columna alta: dale altura para que el pie quede abajo.
const column = { display: 'grid', width: 114, height: 470 };

/** Selección interactiva: el acento del LabScope sigue al personaje elegido. */
export const Seleccion = () => {
  const [selected, setSelected] = useState(0);
  const c = squad[selected];
  return (
    <LabScope accent={c.accent} accentRgb={c.accentRgb} scene={c.surface} accentSoft={soft[c.id]}>
      <div style={column}>
        <CharacterRail characters={squad} selected={selected} requested={selected} busy={false} reduced={false} onSelect={setSelected} />
      </div>
    </LabScope>
  );
};

/** Durante el cambio: el marcador sigue en el actual, el contador y aria-pressed ya apuntan al destino y el rail se bloquea. */
export const CambioEnCurso = () => (
  <div style={column}>
    <CharacterRail characters={squad} selected={0} requested={2} busy reduced={false} onSelect={() => {}} />
  </div>
);

/** Con Kael elegido, el borde y el brillo toman su acento coral. */
export const AcentoEnergia = () => (
  <LabScope accent="#FF785F" accentRgb="255,120,95" scene="#3d1521" accentSoft="#FFE8DB">
    <div style={column}>
      <CharacterRail characters={squad} selected={1} requested={1} busy={false} reduced={false} onSelect={() => {}} />
    </div>
  </LabScope>
);
