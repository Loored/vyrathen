import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './base.css';
const App = lazy(() => import('./App.tsx'));
const CharacterLabRoute = lazy(() => import('./features/character-lab/CharacterLabRoute'));
const node = document.getElementById('root');
if (!node) throw new Error('No se encontró el punto de montaje de la app');
const isLab = window.location.pathname.replace(/\/$/, '') === '/character-lab';
createRoot(node).render(
  <React.StrictMode>
    <Suspense fallback={<p role="status">Cargando Vyrathen...</p>}>
      {isLab ? <CharacterLabRoute /> : <App />}
    </Suspense>
  </React.StrictMode>
);
