import { AnimatePresence, motion } from 'motion/react';
import type { Character } from '../data/characters';

interface Props { character: Character; ambient: boolean; reduced: boolean }

export function CharacterStage({ character, ambient, reduced }: Props) {
  return (
    <section className={`hero-stage ${!ambient || reduced ? 'ambient-paused' : ''}`} aria-label={`Ilustración conceptual de ${character.name}`}>
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-back-plane" aria-hidden="true">
        <div className="back-type back-type-a">VYRATHEN / RESONANCE / SYSTEM</div>
        <div className="back-type back-type-b">WORLD DATA_ //</div>
        <div className="orbit orbit-outer" />
        <div className="orbit orbit-inner" />
      </div>
      <AnimatePresence initial={false} mode="sync">
        <motion.img
          key={character.id}
          className="hero-art"
          src={character.art}
          alt=""
          draggable={false}
          initial={reduced ? false : { opacity: 0, x: 38, scale: 1.075, filter: 'brightness(1.45)' }}
          animate={{ opacity: 1, x: 0, scale: 1.02, filter: 'brightness(1)' }}
          exit={reduced ? undefined : { opacity: 0, x: -24, scale: 1.065, filter: 'brightness(1.6)' }}
          transition={{ duration: reduced ? 0 : .45, ease: [.2, .8, .2, 1] }}
        />
      </AnimatePresence>
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-front-plane" aria-hidden="true">
        <span className="front-type front-a">// RESONANCE</span>
        <span className="front-type front-b">SIGNAL / 002 / VYR</span>
        <span className="front-type front-c">PROFILE SYSTEM</span>
        <span className="crosshair crosshair-a">＋</span>
        <span className="crosshair crosshair-b">◇</span>
      </div>
      <div className="hero-side">CHARACTER <b>//</b> SELECT</div>
      <div className="hero-corner-meta"><b>VYRATHEN</b><span>THE ARCHIVE IS ALIVE</span></div>
      <div className="hero-caption"><i /> VISUAL ENGINE <span>//</span> INTERACTIVE STUDY</div>
    </section>
  );
}
