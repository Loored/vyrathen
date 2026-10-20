import { motion } from 'motion/react';
import { useRef } from 'react';
import { tabs, type CharacterTab } from '../data/characters';
interface Props { active: CharacterTab; onChange: (v: CharacterTab) => void; reduced: boolean }

export function CharacterTabs({ active, onChange, reduced }: Props) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <nav className="tabs-bar" role="tablist" aria-label="Secciones del personaje">
    {tabs.map(({ id, label, index }, position) => (
      <motion.button
        className="tab-button"
        key={id}
        role="tab"
        id={`character-tab-${id}`}
        ref={node => { buttons.current[position] = node; }}
        type="button"
        tabIndex={active === id ? 0 : -1}
        aria-selected={active === id}
        aria-controls="character-panel"
        onClick={() => onChange(id)}
        onKeyDown={event => {
          let next: number;
          if (event.key === 'ArrowRight') next = (position + 1) % tabs.length;
          else if (event.key === 'ArrowLeft') next = (position + tabs.length - 1) % tabs.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = tabs.length - 1;
          else return;
          event.preventDefault();
          event.stopPropagation();
          onChange(tabs[next].id);
          buttons.current[next]?.focus();
        }}
        whileHover={reduced ? undefined : { y: -3, scaleY: 1.035 }}
        whileTap={reduced ? undefined : { scale: .96, y: 1 }}
        transition={{ type: 'spring', stiffness: 460, damping: 25 }}
      >
        {active === id && <motion.span layoutId="selected-tab" className="tab-active-bg"
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 540, damping: 34 }} />}
        <span className="tab-button-text"><small>{index}</small> / {label}</span>
      </motion.button>
    ))}
  </nav>;
}
