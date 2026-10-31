import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';
import { LabScope } from './entry';
const modules = import.meta.glob<Record<string, ComponentType>>('./previews/*.tsx', { eager: true });
const story = new URLSearchParams(location.search).get('story');
createRoot(document.getElementById('root')!).render(<main aria-label="Catálogo de componentes existentes">
  <header style={{ padding: 12, fontFamily: 'system-ui' }}><h1 style={{ fontSize: 20, margin: 0 }}>Vyrathen · catálogo local</h1><p style={{ fontSize: 12, margin: '8px 0 0' }}>Candidatos de revisión. Datos demo; habilidades y equipo son exploraciones visuales sin contrato de producto.</p></header>
  {Object.entries(modules).flatMap(([path, exports]) => Object.entries(exports).map(([name, Preview]) => {
    const key = `${path.split('/').pop()!.replace('.tsx', '')}.${name}`;
    if (story && story !== key) return null;
    return <article key={key} data-story={key} style={{ marginBottom: 24 }}><h2 style={{ font: '16px system-ui', padding: 8, margin: 0 }}>{key}</h2><LabScope><Preview /></LabScope></article>;
  }))}
</main>);
