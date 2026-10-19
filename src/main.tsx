import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
const node=document.getElementById('root');
if(!node) throw new Error('No se encontró el punto de montaje de la app');
createRoot(node).render(<React.StrictMode><App/></React.StrictMode>);
