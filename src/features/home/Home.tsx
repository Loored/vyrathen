import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Check, Compass, Play, Target } from 'lucide-react';
import type { Hero, SaveData } from '../../engine/types';
import { STARTER_QUEST } from '../../engine/quest';
import { toHeroProfile } from '../heroes/heroProfile';
import './home.css';

export function Home({ save, heroes, onHeroes, onCombat, onArchive, onAdvance, onClaim }: {
  save: SaveData; heroes: readonly Hero[]; onHeroes: () => void; onCombat: () => void;
  onArchive: () => void; onAdvance: () => void; onClaim: () => void;
}) {
  const ready = save.questProgress === STARTER_QUEST.steps;
  return <div className="vyr-home">
    <header className="vyr-home-heading">
      <div><span className="game-section-kicker">CENTRO DE OPERACIONES / NIVEL 01</span><h1>{save.laboratoryName}</h1></div>
      <p>Una base. Cinco héroes.<br/><strong>Tu siguiente movimiento.</strong></p>
    </header>
    <div className="vyr-home-operations">
      <section className="vyr-home-squad game-panel" aria-labelledby="squad-title">
        <div className="vyr-home-section-head"><div><span className="game-section-kicker">ESCUADRÓN ACTIVO</span><h2 id="squad-title">Tus cinco héroes <small>05 / 05</small></h2></div><button className="vyr-home-link" onClick={onHeroes}>Ver escuadrón <ArrowUpRight size={16} aria-hidden="true"/></button></div>
        <ol className="vyr-home-formation">
          {heroes.map((hero, index) => {
            const { presentation } = toHeroProfile(hero);
            return <li key={hero.id} style={{ '--squad-accent': presentation.accent } as CSSProperties}>
              <div className="vyr-home-sigil" aria-hidden="true"><span className="vyr-home-unit">0{index + 1}</span><span className="vyr-home-symbol">{presentation.symbol}</span><span className="vyr-home-level">NV {String(hero.level).padStart(2, '0')}</span></div>
              <div className="vyr-home-hero-name"><h3>{hero.name}</h3><span>{hero.type} <span className="sr-only">· Nivel {hero.level}</span></span></div>
              <p>{hero.power}<small>PODER · NV {hero.powerLevel}</small></p>
            </li>;
          })}
        </ol>
        <p className="vyr-home-caption">Héroes de demostración · Representación simbólica provisional</p>
      </section>
      <section className="vyr-home-mission game-panel" aria-labelledby="mission-title">
        <div className="vyr-home-section-head"><span className="game-section-kicker">OBJETIVO ACTUAL / PRIMERA MISIÓN</span><Target size={19} aria-hidden="true"/></div>
        <span className="vyr-home-city"><Compass size={14} aria-hidden="true"/>{STARTER_QUEST.city} · Laboratorio nivel 1</span>
        <h2 id="mission-title">{STARTER_QUEST.title}</h2>
        <div className="vyr-home-progress-label"><span>Progreso de misión</span><b key={save.questProgress}>{save.questProgress} / {STARTER_QUEST.steps} pasos</b></div>
        <progress aria-label="Progreso de misión" max={STARTER_QUEST.steps} value={save.questProgress}/>
        <div className="vyr-home-reward"><span>RECOMPENSA AL COMPLETAR</span><strong>+ ${new Intl.NumberFormat('es-MX').format(STARTER_QUEST.rewardPerLaboratoryLevel)}</strong></div>
        <p className="vyr-home-cost">{ready ? 'Diez pasos completados. Recompensa lista.' : <>Siguiente paso: <strong>−1 turno</strong> · {save.turns} disponibles</>}</p>
        {ready ? <button className="game-action" onClick={onClaim}><Check size={18} aria-hidden="true"/>Reclamar recompensa</button>
          : <button className="game-action" onClick={onAdvance} disabled={save.turns <= 0}><ArrowRight size={18} aria-hidden="true"/>Avanzar un paso</button>}
        {save.turns <= 0 && !ready && <p className="vyr-home-no-turns">Sin turnos disponibles para avanzar.</p>}
        <p className="vyr-home-caption">1 turno/paso: supuesto de la demo. Diez pasos y recompensa por nivel: documentados.</p>
      </section>
      <section className="vyr-home-simulator" aria-labelledby="simulator-title">
        <div className="vyr-home-sim-mark" aria-hidden="true">5<span>×</span>5</div>
        <div><span className="game-section-kicker">SIMULADOR TÁCTICO</span><h2 id="simulator-title">Pon a prueba tu escuadrón.</h2><p>Diez rondas · Resultado por K.O. · Semilla reproducible</p></div>
        <button className="game-action game-action--secondary" onClick={onCombat}><Play size={17} aria-hidden="true"/>Iniciar combate<ArrowUpRight size={17} aria-hidden="true"/></button>
      </section>
    </div>
    <section className="vyr-home-reference" aria-label="Tipos y procedencia">
      <details><summary>Ventajas de tipos y procedencia</summary><div><p><strong>Defensa → Psico → Energía → Control → Defensa.</strong> Cada tipo vence al siguiente. La conversión de puntos a bonus sigue sin conocerse.</p><p>Personajes y estadísticas creados para esta demo. Catálogo de referencia: 24 poderes y 15 pasivas; no todos sus efectos se ejecutan en combate.</p></div></details>
      <button className="vyr-home-link" onClick={onArchive}>Explorar el Archivo <ArrowRight size={16} aria-hidden="true"/></button>
    </section>
  </div>;
}
