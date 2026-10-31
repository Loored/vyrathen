import { useEffect, useMemo, useReducer, type CSSProperties } from 'react';
import { Swords, Zap, ShieldHalf, Wind, Crosshair, Skull, Minus, Radio, Play, Pause, StepForward, RotateCcw, SkipForward } from 'lucide-react';
import type { CombatResult } from '../../engine/types';
import { toHeroProfile } from '../heroes/heroProfile';
import { HeroSigil } from '../heroes/HeroPresentation';
import { actionCues, actionLabels, adaptBattle, eventParticipants, initialPlayback, PLAYBACK_INTERVAL_MS, transition } from './playback';
import './combat.css';

const statusLabels = { empty: 'Sin eventos', ready: 'Listo para reproducir', playing: 'Reproduciendo', paused: 'Pausado', finished: 'Finalizado' };
const actionIcons = { normal: Swords, power: Zap, blocked: ShieldHalf, dodged: Wind, miss: Crosshair, ko: Skull, skip: Minus, info: Radio };
export function CombatPlayback({ battle }: { battle: CombatResult }) {
  const timeline = useMemo(() => adaptBattle(battle), [battle]);
  const [state, dispatch] = useReducer((s: ReturnType<typeof initialPlayback>, a: Parameters<typeof transition>[1]) => transition(s, a, timeline), timeline, initialPlayback);
  useEffect(() => {
    if (state.status !== 'playing') return;
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), PLAYBACK_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [state]);
  const item = timeline[state.cursor];
  const event = item?.event;
  const participants = eventParticipants(battle, event);
  const round = battle.rounds.find(r => r.round === item?.round);
  const total = battle.rounds.reduce((sum, r) => sum + r.events.length, 0);
  const cue = event ? actionCues[event.kind] : undefined;
  const ActionIcon = event ? actionIcons[event.kind] : Radio;
  return <section className="vyr-combat" aria-label="Reproducción del encuentro">
    <header className="vyr-combat-header"><div><span className="eyebrow">ENCUENTRO REGISTRADO / #{battle.seed}</span><h2>Frente a frente</h2></div><a className="game-action secondary" href="#combat-final">Consultar resultado final</a></header>
    <div className="vyr-combat-stage" data-kind={event?.kind}>
      {([['atacante', battle.attackers], ['defensor', battle.defenders]] as const).map(([side, heroes]) => <section className={`vyr-combat-team ${side}`} key={side} aria-label={`Bando ${side}`}><h3>{side === 'atacante' ? '01 / Atacantes' : '02 / Defensores'}</h3><ol>{heroes.map(hero => {
        const profile = toHeroProfile(hero);
        const role = participants.target === hero.id ? event?.kind === 'ko' ? 'Objetivo · K.O.' : 'Objetivo' : participants.actor === hero.id ? 'Actor' : 'En espera';
        const activity = participants.target === hero.id ? cue?.target : participants.actor === hero.id ? cue?.actor : undefined;
        return <li key={hero.id} data-role={role} style={{ '--hero-accent': profile.presentation.accent } as CSSProperties}><HeroSigil profile={profile}/><div><strong>{hero.name}</strong><small>{hero.type} · Nv. {hero.level}</small></div><span className="vyr-combat-role">{role}{activity && activity !== 'Actor' && activity !== 'K.O.' ? ` · ${activity}` : ''}</span></li>;
      })}</ol></section>)}
      <div className="vyr-combat-event" aria-label="Evento actual">
        <span className="eyebrow">{item ? `RONDA ${item.round} / EVENTO ${item.ordinal} DE ${total}` : `SECUENCIA / ${total} EVENTOS`}</span>
        <div className="vyr-combat-event-content" key={state.cursor}>
          <div className="vyr-combat-action-heading">
            <div className="vyr-combat-action-icon"><ActionIcon size={28} aria-hidden="true"/></div>
            {cue && <span className="vyr-combat-action-category">{cue.category}</span>}
            <h3>{event ? actionLabels[event.kind] : item ? 'Ronda sin eventos' : 'A la espera de tu señal'}</h3>
          </div>
          {event && <div className="vyr-combat-chain"><span><small>{cue?.actor}</small>{event.actor || 'Actor no indicado'}</span><span aria-hidden="true">→</span><span><small>{cue?.target}</small>{event.target || 'Sin objetivo registrado'}</span></div>}
          <p>{event?.message ?? (item ? 'Esta ronda no contiene acciones registradas.' : 'El resultado ya está calculado. Reproduce o inspecciona cualquier ronda.')}</p>
          {event?.damage !== undefined && <div className="vyr-combat-damage"><strong>{event.damage}</strong><span>Daño registrado{event.kind === 'blocked' && <small>Tras bloqueo parcial</small>}</span></div>}
        </div>
        <small>Representación simbólica · sin HP/MP intermedios</small>
      </div>
    </div>
    <div className="vyr-combat-position"><progress aria-label="Posición de reproducción" max={Math.max(1, timeline.length)} value={state.cursor + 1}/><span>2,5 s por evento</span></div>
    <div className="vyr-combat-controls"><span role="status">{statusLabels[state.status]}</span><button className="game-action" disabled={state.status === 'empty' || state.status === 'finished'} onClick={() => dispatch({ type: state.status === 'playing' ? 'pause' : 'play' })}>{state.status === 'playing' ? <Pause size={15} aria-hidden="true"/> : <Play size={15} aria-hidden="true"/>}{state.status === 'playing' ? 'Pausar' : 'Continuar reproducción'}</button><button className="game-action secondary" disabled={state.status === 'empty' || state.status === 'finished'} onClick={() => dispatch({ type: 'step' })}><StepForward size={15} aria-hidden="true"/>Avanzar un evento</button><button className="game-action secondary" disabled={state.status === 'ready' || state.status === 'empty'} onClick={() => dispatch({ type: 'restart' })}><RotateCcw size={15} aria-hidden="true"/>Reiniciar reproducción</button><button className="game-action secondary" disabled={state.status === 'empty' || state.status === 'finished'} onClick={() => dispatch({ type: 'finish' })}><SkipForward size={15} aria-hidden="true"/>Ir al final</button></div>
    <label className="vyr-combat-round">Inspeccionar ronda <select value={item?.round ?? ''} onChange={e => dispatch({ type: 'round', round: Number(e.target.value) })}><option value="" disabled>Elegir ronda</option>{battle.rounds.map(r => <option key={r.round} value={r.round}>Ronda {r.round}</option>)}</select><span>Seleccionar una ronda pausa la reproducción.</span></label>
    <details className="vyr-combat-log"><summary>Registro textual {round ? `· Ronda ${round.round}` : '· Todas las rondas'}</summary>{(round ? [round] : battle.rounds).map(r => <section key={r.round}><h3>Ronda {r.round}</h3><p>Al cierre: {r.attackerAlive} atacantes y {r.defenderAlive} defensores en pie.</p><ol>{r.events.map((e, index) => <li key={`${e.id}-${index}`} aria-current={e === event ? 'step' : undefined}>{e.message}</li>)}</ol>{!r.events.length && <p>Sin eventos registrados.</p>}</section>)}</details>
    <section id="combat-final" className="vyr-combat-final" aria-label="Resultado final"><span className="eyebrow">RESULTADO FINAL / INDEPENDIENTE DE LA REPRODUCCIÓN</span><h3>Resultado del enfrentamiento</h3><p>{battle.summary}</p><p>K.O. causados · Atacantes {battle.attackerKOs} : {battle.defenderKOs} Defensores</p><p>Semilla #{battle.seed} · {battle.rounds.length} rondas · Puntos de tipos {battle.typePoints.attacker} : {battle.typePoints.defender}</p><details><summary>HP/MP finales de los participantes</summary>{([['Atacantes', battle.attackers], ['Defensores', battle.defenders]] as const).map(([label, heroes]) => <div key={label}><h4>{label} · valores finales</h4><ul>{heroes.map(h => <li key={h.id}>{h.name} — HP {h.hp}/{h.maxHp} · MP {h.mp}/{h.maxMp}{h.hp === 0 ? ' · K.O. final' : ''}</li>)}</ul></div>)}</details></section>
    <details className="combat-method"><summary>¿Qué reglas usa esta simulación?</summary><p>Documentadas: cinco por bando, diez rondas, K.O., empate favorable al defensor y conteo de tipos. El bonus de tipos no se aplica: su fórmula es desconocida.</p><p>Decisiones del remake: iniciativa, probabilidad de actuar, selección de objetivos, precisión, bloqueo, esquiva y daño final. El registro describe lo calculado, sin reconstruir habilidades ni consumos ausentes.</p></details>
  </section>;
}
