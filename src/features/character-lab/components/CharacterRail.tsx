import { motion } from 'motion/react';
import type { Character } from '../data/characters';

interface Props {
  characters: Character[];
  selected: number;
  requested: number;
  busy: boolean;
  reduced: boolean;
  onSelect: (index: number) => void;
}

export function CharacterRail({ characters, selected, requested, busy, reduced, onSelect }: Props) {
  return (
    <aside className="rail" aria-label="Selector de personajes">
      <div className="rail-kicker">ARCHIVE <span>◆</span></div>
      <div className="rail-count">{String(requested + 1).padStart(2, '0')} / {String(characters.length).padStart(2, '0')}</div>
      <div className="rail-list">
        {characters.map((c, i) => (
          <motion.button
            key={c.id}
            className="person"
            type="button"
            aria-label={`Seleccionar ${c.name}`}
            aria-pressed={i === requested}
            data-selected={i === requested}
            disabled={busy}
            onClick={() => onSelect(i)}
            whileHover={reduced ? undefined : { x: 5, scale: 1.03 }}
            whileTap={reduced ? undefined : { scale: .95 }}
            transition={{ duration: .16 }}
          >
            <img src={c.art} alt="" draggable={false} />
            <span className="person-index">0{i + 1}</span>
            {i === selected && <span className="person-marker" aria-hidden="true" />}
          </motion.button>
        ))}
      </div>
      <div className="rail-bottom">
        <span>CHARACTER DATABASE</span>
        <strong>VYR // 0.5</strong>
      </div>
    </aside>
  );
}
