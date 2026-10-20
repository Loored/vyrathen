import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { characters, type CharacterTab } from './data/characters';
import { CharacterRail } from './components/CharacterRail';
import { CharacterStage } from './components/CharacterStage';
import { CharacterDetails } from './components/CharacterDetails';
import { CharacterTabs } from './components/CharacterTabs';
import { SwitchFX } from './components/SwitchFX';
import { useReducedMotionPreference } from './hooks/useReducedMotionPreference';

interface Transition { target: number; sequence: number }

export function CharacterLabApp() {
  const systemPrefersReduced = useReducedMotionPreference();
  const [overrideReduced, setOverrideReduced] = useState<boolean | null>(null);
  const reduced = overrideReduced ?? systemPrefersReduced;
  const [ambient, setAmbient] = useState(true);
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<CharacterTab>('stats');
  const [transition, setTransition] = useState<Transition | null>(null);
  const nextSequence = useRef(0);
  const changing = transition !== null;
  const requested = transition?.target ?? selected;
  const character = characters[selected];

  const selectCharacter = useCallback((target: number) => {
    if (transition) return; // deterministic, avoid interrupting a partially changed UI
    const safeTarget = (target + characters.length) % characters.length;
    if (safeTarget === selected) return;
    if (reduced) {
      setSelected(safeTarget);
    } else {
      setTransition({ target: safeTarget, sequence: ++nextSequence.current });
    }
  }, [reduced, selected, transition]);

  useEffect(() => {
    if (!transition) return;
    if (reduced) {
      setSelected(transition.target);
      setTransition(null);
      return;
    }
    // One choreography clock; the SELECT flies first, scene data swaps under cover.
    const reveal = window.setTimeout(() => setSelected(transition.target), 315);
    const complete = window.setTimeout(() => setTransition(null), 800);
    return () => { window.clearTimeout(reveal); window.clearTimeout(complete); };
  }, [transition, reduced]);

  const chooseTab = useCallback((t: CharacterTab) => setTab(t), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.metaKey || event.ctrlKey) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)) return;
      if ((event.target as HTMLElement)?.isContentEditable) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        if (document.activeElement?.getAttribute('role') === 'tab') return;
        event.preventDefault();
        selectCharacter(requested + (event.key === 'ArrowRight' ? 1 : -1));
      }
      if (event.key === '1') chooseTab('stats');
      if (event.key === '2') chooseTab('skills');
      if (event.key === '3') chooseTab('equipment');
      if (!event.repeat && event.key.toLowerCase() === 'm') setAmbient(v => !v);
      if (!event.repeat && event.key.toLowerCase() === 'r') setOverrideReduced(v => !(v ?? systemPrefersReduced));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chooseTab, requested, selectCharacter, systemPrefersReduced]);

  const theme = {
    '--accent': character.accent,
    '--accent-rgb': character.accentRgb,
    '--scene': character.surface,
    '--accent-soft': character.id === 'kuroe' ? '#FFE8DB' : character.id === 'orion' ? '#D8F8FF' : '#F2E6FF',
  } as CSSProperties;

  return (
    <div className="app" style={theme} data-reduced={reduced} data-ambient={ambient}>
      <main className="shell" aria-label="Vyrathen: prototipo de interfaz de personajes">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">VYRATHEN</div>
            <div className="brand-bar" />
            <div className="brand-meta"><b>PERSONNEL ARCHIVE</b><span>MOTION STUDY // 0.5</span><span>NEON × EXPRESSION</span></div>
          </div>
          <div className="topbar-right">
            <a className="mode" href="/">VOLVER AL JUEGO</a>
            <button className="mode" type="button" disabled={changing} onClick={() => selectCharacter(selected + 1)}>▶ REPLAY</button>
            <button className="mode" type="button" aria-pressed={ambient} data-active={ambient} onClick={() => setAmbient(v => !v)}>AMBIENT {ambient ? 'ON' : 'OFF'}</button>
            <button className="mode" type="button" aria-pressed={reduced} data-active={reduced} onClick={() => setOverrideReduced(v => !(v ?? systemPrefersReduced))}>REDUCED {reduced ? 'ON' : 'OFF'}</button>
            <div className="demo-note">INTERACTIVE STUDY<br />NOT GAMEPLAY</div>
          </div>
        </header>
        <div className={`game-screen ${changing ? 'is-switching' : ''}`}>
          <CharacterRail characters={characters} selected={selected} requested={requested} busy={changing} reduced={reduced} onSelect={selectCharacter} />
          <CharacterStage character={character} ambient={ambient} reduced={reduced} />
          <div id="character-panel" className="info-slot" role="tabpanel" aria-labelledby={`character-tab-${tab}`} tabIndex={0}>
            <CharacterDetails character={character} tab={tab} reduced={reduced} />
          </div>
          <CharacterTabs active={tab} onChange={chooseTab} reduced={reduced} />
          <SwitchFX active={changing} targetName={characters[requested].name} sequence={transition?.sequence ?? nextSequence.current} reduced={reduced} />
        </div>
      </main>
      <footer className="footer">
        <span>PROTOTYPE // NON-CANON CHARACTERS & STATS // REUSABLE REACT COMPONENTS</span>
        <span><b>← →</b> PERSONAJES &nbsp; · &nbsp; <b>1–3</b> PESTAÑAS &nbsp; · &nbsp; <b>M</b> AMBIENTE &nbsp; · &nbsp; <b>R</b> REDUCIR MOVIMIENTO</span>
      </footer>
      <div className="sr-only" role="status" aria-live="polite">Personaje actual: {character.name}. {tab}.</div>
    </div>
  );
}
