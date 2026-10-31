import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Character, CharacterTab } from '../data/characters';

interface Props { character: Character; tab: CharacterTab; reduced: boolean }
const easing = [0.22, 0.83, 0.18, 1] as const;

function Stats({ character, reduced }: { character: Character; reduced: boolean }) {
  return (
    <div className="stats-list">
      {character.stats.map((stat, i) => (
        <motion.div
          key={`${character.id}-${stat.label}`}
          className="stat-row"
          initial={reduced ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduced ? 0 : .3, delay: reduced ? 0 : .035 + .04 * i, ease: easing }}
        >
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <span className="stat-flare" aria-hidden="true" />
        </motion.div>
      ))}
    </div>
  );
}

function Skills({ reduced }: { reduced: boolean }) {
  const icons = ['✦', '⟁', '✳', '⬡', '✧', '⌁'];
  return (
    <div className="skills-grid">
      {icons.map((symbol, i) => (
        <motion.div
          className="skill-node" key={i}
          initial={reduced ? false : { opacity: 0, y: 16, scale: .9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 25, delay: reduced ? 0 : .03 * i, duration: reduced ? 0 : undefined }}
        >
          <span className="skill-symbol">{symbol}</span><span>ABILITY 0{i + 1}</span>
        </motion.div>
      ))}
      <p className="fixture-annotation">Estructura de habilidades demostrativa; no representa reglas históricas.</p>
    </div>
  );
}

function Equipment({ character, reduced }: { character: Character; reduced: boolean }) {
  const [slot, setSlot] = useState(0);
  useEffect(() => setSlot(0), [character.id]);
  return (
    <div className="equipment-container">
      <motion.div
        className="equipment-ring"
        initial={reduced ? false : { opacity: 0, scale: .8, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: reduced ? 0 : .45, ease: easing }}
      >
        <div className="equipment-orbit" aria-hidden="true" />
        <span className="equipment-core" aria-hidden="true">✧</span>
        {['A', 'B', 'C', 'D'].map((letter, i) => (
          <motion.button
            type="button"
            className={`equipment-slot slot-${i}`}
            key={letter}
            aria-pressed={slot === i}
            onClick={() => setSlot(i)}
            whileTap={reduced ? undefined : { scale: .92 }}
          >{letter}</motion.button>
        ))}
      </motion.div>
      <div className="equipment-readout">SLOT {['A', 'B', 'C', 'D'][slot]} // <b>DEMO SELECTION</b></div>
      <p className="fixture-annotation">Cantidad y tipos de ranuras son exclusivamente ilustrativos.</p>
    </div>
  );
}

export function CharacterDetails({ character, tab, reduced }: Props) {
  const [showQuote, setShowQuote] = useState(false);
  useEffect(() => setShowQuote(false), [character.id, tab]);
  return (
    <section className="detail-panel" aria-label="Información del personaje">
      <div className="detail-lines" aria-hidden="true"><span /><span /></div>
      <div className="detail-topline"><span>SUBJECT INFORMATION</span><span>{character.code.replace('-', ' // ')}</span></div>
      <div className="detail-tags-top"><strong>{character.code}</strong><span>{character.archive}</span></div>
      <div className="detail-kicker"><b>SUBJECT // ACTIVE</b><i /></div>
      <AnimatePresence initial={false} mode="wait">
        <motion.div key={character.id} className="identity-block"
          initial={reduced ? false : { opacity: .6 }} animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }} transition={{ duration: reduced ? 0 : .1 }}
        >
          <h1 className={`character-name ${reduced ? '' : 'glitch-reveal'}`} data-text={character.name} aria-label={character.name}>
            <span className="character-name-fill">{character.name}</span>
          </h1>
          <motion.div className="character-title"
            initial={reduced ? false : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0 : .29, delay: reduced ? 0 : .1 }}>{character.title}</motion.div>
          <div className="tag-strip">{character.tags.map((tag, i) => (
            <motion.span key={tag} initial={reduced ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .2, delay: reduced ? 0 : .13 + i * .04 }}>{tag}</motion.span>))}</div>
          <p className="character-intro">{character.intro}</p>
        </motion.div>
      </AnimatePresence>
      <div className="detail-section-heading">
        <strong>{tab === 'stats' ? 'BASE STATS' : tab === 'skills' ? 'SKILLS' : 'EQUIPMENT'}</strong>
        <span>DATA // {tab === 'stats' ? '01' : tab === 'skills' ? '02' : '03'}</span>
      </div>
      <div className="detail-content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${character.id}-${tab}`} className="detail-content-inner"
            initial={reduced ? false : { opacity: 0, x: 14, filter: 'brightness(1.4)' }}
            animate={{ opacity: 1, x: 0, filter: 'brightness(1)' }}
            exit={reduced ? undefined : { opacity: 0, x: -8 }}
            transition={{ duration: reduced ? 0 : .2, ease: easing }}
          >
            {tab === 'stats' ? <Stats character={character} reduced={reduced} /> :
              tab === 'skills' ? <Skills reduced={reduced} /> :
                <Equipment character={character} reduced={reduced} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <button type="button" className="lore-toggle" onClick={() => setShowQuote(v => !v)}
        aria-expanded={showQuote} aria-label="Mostrar u ocultar cita del personaje">
        <span>✧</span> LORE SIGNAL <b>{showQuote ? '−' : '+'}</b>
      </button>
      <AnimatePresence>
        {showQuote && <motion.div className="lore-quote" key={character.id}
          initial={reduced ? false : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          transition={{ duration: reduced ? 0 : .2 }}>
          “{character.quote}”
        </motion.div>}
      </AnimatePresence>
    </section>
  );
}
