import { useState } from 'react';
import { GameTabs } from 'vyrathen';

// Las pestañas del Archivo de la alfa (src/App.tsx).
const archive = [
  { id: 'poderes', label: 'Poderes · 24 + 3' },
  { id: 'pasivas', label: 'Pasivas · 15' },
  { id: 'estructuras', label: 'Estructuras · 16' },
];
const archiveText: Record<string, string> = {
  poderes: 'Poderes del catálogo de referencia. Nombres, efectos y balance siguen en revisión.',
  pasivas: 'Pasivas del catálogo de referencia. Se revisarán para la identidad propia de Vyrathen.',
  estructuras: 'Estructuras del laboratorio disponibles en esta versión alfa.',
};

function Archivo({ initial, panelId }: { initial: string; panelId: string }) {
  const [active, setActive] = useState(initial);
  return (
    <div style={{ width: '100%', maxWidth: 560, padding: '18px 22px', background: 'var(--vyr-panel)', border: '1px solid var(--vyr-border)' }}>
      <span className="game-section-kicker">CÓDICE // SISTEMAS</span>
      <GameTabs label="Secciones del archivo" panelId={panelId} tabs={archive} active={active} onChange={setActive} />
      {/* El tabpanel se enlaza con aria-labelledby al id `${panelId}-tab-${active}`. */}
      <section id={panelId} role="tabpanel" aria-labelledby={`${panelId}-tab-${active}`} tabIndex={0}
        style={{ padding: '14px 0 2px', color: 'var(--vyr-muted)', fontSize: 14, lineHeight: 1.6 }}>
        {archiveText[active]}
      </section>
    </div>
  );
}

/** Primera pestaña activa: subrayado y texto en el color de foco (blanco dentro del Lab). */
export const Poderes = () => <Archivo initial="poderes" panelId="archivo-poderes" />;

/** Otra pestaña activa; ←/→, Inicio y Fin mueven la selección y el foco. */
export const Pasivas = () => <Archivo initial="pasivas" panelId="archivo-pasivas" />;
