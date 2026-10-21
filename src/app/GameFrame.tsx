import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, BookOpen, Clock3, Dna, House, Info, Menu, RotateCcw, Sparkles, Swords, Wallet, X } from 'lucide-react';
import type { SaveData } from '../engine/types';
import './game-frame.css';

export type Section = 'inicio' | 'heroes' | 'combate' | 'archivo';
const navigation = [
  { id: 'inicio', label: 'Centro de control', short: 'Inicio', icon: House },
  { id: 'heroes', label: 'Mis héroes', short: 'Mis héroes', icon: Dna },
  { id: 'combate', label: 'Simulador de combate', short: 'Combate', icon: Swords },
  { id: 'archivo', label: 'Archivo de reglas', short: 'Archivo', icon: BookOpen },
] as const;
const number = new Intl.NumberFormat('es-MX');

export function GameFrame({ section, save, notice, onNavigate, onReset, onDismissNotice, children }: {
  section: Section; save: SaveData; notice: string; onNavigate: (section: Section) => void;
  onReset: () => void; onDismissNotice: () => void; children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);
  function closeMenu() { setMenuOpen(false); requestAnimationFrame(() => trigger.current?.focus()); }
  function navigate(next: Section) {
    onNavigate(next);
    if (menuOpen) { setMenuOpen(false); requestAnimationFrame(() => main.current?.focus()); }
  }
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menu.current?.querySelector<HTMLButtonElement>('.vyr-frame-close')?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(); }
      if (event.key !== 'Tab') return;
      const controls = [...(menu.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    const desktop = window.matchMedia('(min-width: 901px)');
    const resize = () => { if (desktop.matches) { setMenuOpen(false); requestAnimationFrame(() => main.current?.focus()); } };
    document.addEventListener('keydown', keydown);
    desktop.addEventListener('change', resize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keydown);
      desktop.removeEventListener('change', resize);
    };
  }, [menuOpen]);

  return <div className="vyr-frame">
    <a className="vyr-frame-skip" href="#game-content">Saltar al contenido</a>
    <div ref={menu} id="game-navigation" className="vyr-frame-rail" data-open={menuOpen}
      role={menuOpen ? 'dialog' : 'complementary'} aria-modal={menuOpen || undefined} aria-label="Navegación del juego">
      <div className="vyr-frame-brand"><span aria-hidden="true" className="vyr-frame-mark">//</span><strong>VYRATHEN</strong><small>SCI-FI STRATEGY RPG</small>
        <button className="vyr-frame-close" aria-label="Cerrar menú" onClick={closeMenu}><X size={20}/></button>
      </div>
      <span className="vyr-frame-kicker">OPERACIONES / 01</span>
      <nav aria-label="Navegación principal">
        {navigation.map(({ id, label, icon: Icon }) => <button key={id} type="button" className="vyr-frame-nav"
          aria-current={section === id ? 'page' : undefined} onClick={() => navigate(id)}>
          <Icon size={19} aria-hidden="true"/><span>{label}</span>
        </button>)}
      </nav>
      <a className="vyr-frame-lab" href="/character-lab"><Sparkles size={18} aria-hidden="true"/><span>Character Lab<small>Estudio visual</small></span><ArrowUpRight size={15} aria-hidden="true"/></a>
      <div className="vyr-frame-local"><span>PARTIDA LOCAL</span><p>Tu laboratorio.<br/>Tu próxima leyenda.</p><small>Alfa 0.1 · Demo independiente</small></div>
      <button className="vyr-frame-reset" onClick={onReset}><RotateCcw size={15} aria-hidden="true"/>Reiniciar demo</button>
    </div>
    {menuOpen && <div className="vyr-frame-scrim" aria-hidden="true" onClick={closeMenu}/>}
    <div className="vyr-frame-body" inert={menuOpen}>
      <header className="vyr-frame-hud">
        <div className="vyr-frame-location"><button ref={trigger} className="vyr-frame-menu" aria-label="Abrir menú" aria-expanded={menuOpen} aria-controls="game-navigation" onClick={() => setMenuOpen(true)}><Menu size={22}/></button>
          <div><span>VYR / LABORATORIO 01</span><strong>{navigation.find(item => item.id === section)?.short}</strong></div>
        </div>
        <dl className="vyr-frame-resources" aria-label="Recursos del laboratorio">
          <div><dt><Wallet size={15} aria-hidden="true"/>Fondos</dt><dd>${number.format(save.funds)}</dd></div>
          <div><dt><Clock3 size={15} aria-hidden="true"/>Turnos</dt><dd>{number.format(save.turns)}<small> / 2,000</small></dd></div>
          <div><dt><Swords size={15} aria-hidden="true"/>Combates</dt><dd>{String(save.battles).padStart(2, '0')}</dd></div>
        </dl>
      </header>
      <main ref={main} id="game-content" tabIndex={-1} className="vyr-frame-content">
        <div key={section} className="vyr-frame-section">{children}</div>
        <footer className="vyr-frame-footer"><span>VYRATHEN / ALFA LOCAL</span><span>Un universo independiente · Mecánicas en evolución</span></footer>
      </main>
      <div className="vyr-frame-feedback" role="status" aria-live="polite" aria-atomic="true">
        {notice && <div><Info size={18} aria-hidden="true"/><span>{notice}</span><button aria-label="Cerrar aviso" onClick={onDismissNotice}><X size={18}/></button></div>}
      </div>
    </div>
  </div>;
}
