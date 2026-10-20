import { useRef } from 'react';

export interface GameTab { id: string; label: string; }
export function nextTabIndex(key: string, current: number, length: number): number | null {
  if (key === 'ArrowRight') return (current + 1) % length;
  if (key === 'ArrowLeft') return (current + length - 1) % length;
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  return null;
}
export function GameTabs({ tabs, active, onChange, label }: { tabs: readonly GameTab[]; active: string; onChange: (id: string) => void; label: string }) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <nav className="game-tabs" role="tablist" aria-label={label}>{tabs.map((tab, index) => <button key={tab.id} ref={node => { buttons.current[index] = node; }} type="button" role="tab" aria-selected={active === tab.id} tabIndex={active === tab.id ? 0 : -1} onClick={() => onChange(tab.id)} onKeyDown={event => {
    const next = nextTabIndex(event.key, index, tabs.length); if (next === null) return;
    event.preventDefault(); onChange(tabs[next].id); buttons.current[next]?.focus();
  }}>{tab.label}</button>)}</nav>;
}
