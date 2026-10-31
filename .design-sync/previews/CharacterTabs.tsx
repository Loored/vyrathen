import { useState } from 'react';
import { CharacterTabs, LabScope } from 'vyrathen';
import type { CharacterTab } from 'vyrathen';

// Barra inferior del Lab: paralelogramos con fondo activo deslizante en `--accent-soft`.
// Su CSS la coloca en las columnas 2–3 de `.game-screen`. Fuera de esa rejilla, envuélvela
// en un bloque normal (no en un `grid`, que crearía una columna 1 vacía a la izquierda).
function Barra({ initial }: { initial: CharacterTab }) {
  const [tab, setTab] = useState<CharacterTab>(initial);
  return (
    <div style={{ width: '100%', maxWidth: 860 }}>
      <CharacterTabs active={tab} onChange={setTab} reduced={false} />
    </div>
  );
}

/** Estadísticas activa con el acento violeta por defecto. */
export const Estadisticas = () => <Barra initial="stats" />;

/** Habilidades activa bajo el acento coral de Kael. */
export const Habilidades = () => (
  <LabScope accent="#FF785F" accentRgb="255,120,95" scene="#3d1521" accentSoft="#FFE8DB">
    <Barra initial="skills" />
  </LabScope>
);

/** Equipo activa bajo el acento cian de Astra. */
export const Equipo = () => (
  <LabScope accent="#5ED8FF" accentRgb="94,216,255" scene="#112a43" accentSoft="#D8F8FF">
    <Barra initial="equipment" />
  </LabScope>
);
