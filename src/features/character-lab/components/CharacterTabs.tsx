import { LayoutGroup, motion } from 'motion/react';
import { useId, useRef } from 'react';
import { nextTabIndex } from '../../../ui/GameTabs.tsx';
import { tabs, type CharacterTab } from '../data/characters';
interface Props { active: CharacterTab; onChange: (v: CharacterTab) => void; reduced: boolean; panelId?: string }

export function CharacterTabs({ active, onChange, reduced, panelId = 'character-panel' }: Props) {
  const groupId = useId();
  const prefix = panelId === 'character-panel' ? 'character' : panelId;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <LayoutGroup id={groupId}><nav className="tabs-bar" role="tablist" aria-label="Secciones del personaje">
    {tabs.map(({ id, label, index }, position) => (
      <motion.button
        className="tab-button"
        key={id}
        role="tab"
        id={`${prefix}-tab-${id}`}
        ref={node => { buttons.current[position] = node; }}
        type="button"
        tabIndex={active === id ? 0 : -1}
        aria-selected={active === id}
        aria-controls={panelId}
        onClick={() => onChange(id)}
        onKeyDown={event => {
          const next = nextTabIndex(event.key, position, tabs.length);
          if (next === null) return;
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
  </nav></LayoutGroup>;
}
