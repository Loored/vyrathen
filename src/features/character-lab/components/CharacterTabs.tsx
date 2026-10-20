import { motion } from 'motion/react';
import { tabs, type CharacterTab } from '../data/characters';
interface Props { active: CharacterTab; onChange: (v: CharacterTab) => void; reduced: boolean }

export function CharacterTabs({ active, onChange, reduced }: Props) {
  return <nav className="tabs-bar" role="tablist" aria-label="Secciones del personaje">
    {tabs.map(({ id, label, index }) => (
      <motion.button
        className="tab-button"
        key={id}
        role="tab"
        type="button"
        aria-selected={active === id}
        aria-controls="character-panel"
        onClick={() => onChange(id)}
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
