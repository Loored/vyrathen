import { useEffect, useMemo, useReducer, type CSSProperties } from 'react';
import { Swords, Zap, ShieldHalf, Wind, Crosshair, Skull, Minus, Radio, Play, Pause, StepForward, RotateCcw, SkipForward } from 'lucide-react';
import type { CombatResult } from '../../engine/types';
import { toHeroProfile } from '../heroes/heroProfile';
import { HeroSigil } from '../heroes/HeroPresentation';
import { actionCues, actionLabels, adaptBattle, eventParticipants, PLAYBACK_INTERVAL_MS } from './playback';
import { adaptResources, resourcesAtCursor } from './resourcePlayback';
import { initialPilotPlayer, pilotFrame, pilotTransition, type PilotAction, type PilotPhase, type PilotPlayer } from './pilotModel';
import { CombatPilotScene } from './CombatPilotScene';
import './combat.css';

const statusLabels = { empty: 'Sin eventos', ready: 'Listo para reproducir', playing: 'Reproduciendo', paused: 'Pausado', finished: 'Finalizado' };
const actionIcons = { normal: Swords, power: Zap, blocked: ShieldHalf, dodged: Wind, miss: Crosshair, ko: Skull, skip: Minus, info: Radio };
export function CombatPlayback({ battle }: { battle: CombatResult }) {
  const timeline = useMemo(() => adaptBattle(battle), [battle]);
  const recording = useMemo(() => adaptResources(battle), [battle]);
  const [state, dispatch] = useReducer((s: PilotPlayer, a: PilotAction) => pilotTransition(s, a, timeline), timeline, initialPilotPlayer);
  useEffect(() => {
    if (state.status !== 'playing') return;
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), PLAYBACK_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [state.cursor, state.status]);
  const item = timeline[state.cursor];
  const event = item?.event;
  const record = event && recording.mode === 'recorded' ? recording.events[item.ordinal - 1] : undefined;
  const participants = record ? { actor: record.actorId, target: record.targetId } : eventParticipants(battle, event);
  const currentResources = resourcesAtCursor(recording, timeline, state.cursor);
  const round = battle.rounds.find(r => r.round === item?.round);
  const total = battle.rounds.reduce((sum, r) => sum + r.events.length, 0);
  const cue = event ? actionCues[event.kind] : undefined;
  const ActionIcon = event ? actionIcons[event.kind] : Radio;
  const scene = pilotFrame(battle, recording, timeline, state.cursor);
  return <section className="vyr-combat" aria-label="Reproducción del encuentro" data-view={state.view} data-cursor={state.cursor} data-recording={recording.mode === 'recorded' ? recording.version : 'legacy'}>
    <header className="vyr-combat-header"><div><span className="eyebrow">ENCUENTRO REGISTRADO / #{battle.seed}</span><h2>Frente a frente</h2></div><div className="vyr-combat-header-tools">
      <div role="group" aria-label="Vista de combate" className="vyr-pilot-view-switch">
        <button className="game-action secondary" aria-pressed={state.view === 'tactical'} onClick={() => dispatch({ type: 'view', view: 'tactical' })}>Vista táctica</button>
        <button className="game-action secondary" aria-pressed={state.view === 'scene'} disabled={!scene.supported} title={!scene.supported ? 'Este encuentro no tiene un registro de recursos compatible.' : undefined} onClick={() => dispatch({ type: 'view', view: 'scene' })}>Escena 2D · candidata</button>
      </div>
      <a className="game-action secondary" href="#combat-final">Consultar resultado final</a>
    </div></header>
    <div className="vyr-combat-stage" data-kind={event?.kind}>
      {([['atacante', battle.attackers], ['defensor', battle.defenders]] as const).map(([side, heroes]) => <section className={`vyr-combat-team ${side}`} key={side} aria-label={`Bando ${side}`}><h3>{side === 'atacante' ? '01 / Atacantes' : '02 / Defensores'}</h3><ol>{heroes.map(hero => {
        const profile = toHeroProfile(hero);
        const resource = currentResources?.get(hero.id);
        const knockedOut = resource?.hp === 0;
        const role = participants.target === hero.id ? event?.kind === 'ko' ? 'Objetivo · K.O.' : 'Objetivo' : participants.actor === hero.id ? 'Actor' : knockedOut ? 'K.O.' : 'En espera';
        const activity = participants.target === hero.id ? cue?.target : participants.actor === hero.id ? cue?.actor : undefined;
        return <li key={hero.id} data-fighter-id={hero.id} data-role={role} data-knocked-out={knockedOut || undefined} style={{ '--hero-accent': profile.presentation.accent } as CSSProperties}>
          <HeroSigil profile={profile}/>
          <div className="vyr-combat-identity"><strong>{hero.name}</strong><small>{hero.type} · Nv. {hero.level}</small></div>
          {resource && <div className="vyr-combat-resources" role="group" aria-label={`${hero.name} · recursos actuales`}>
            {([['HP', resource.hp, hero.maxHp], ['MP', resource.mp, hero.maxMp]] as const).map(([label, value, max]) => <div key={label} data-resource={label}>
              <span>{label} <b>{value}/{max}</b></span>
              <div className="vyr-combat-resource-track" aria-hidden="true"><span style={{ transform: `scaleX(${max > 0 ? value / max : 0})` }}/></div>
            </div>)}
          </div>}
          <span className="vyr-combat-role">{knockedOut && !role.includes('K.O.') && <b className="vyr-combat-ko">K.O. · </b>}{role}{activity && activity !== 'Actor' && activity !== 'K.O.' ? ` · ${activity}` : ''}</span>
        </li>;
      })}</ol></section>)}
      <div className="vyr-combat-event" aria-label="Evento actual">
        <span className="eyebrow">{item ? `RONDA ${item.round} / EVENTO ${item.ordinal} DE ${total}` : `SECUENCIA / ${total} EVENTOS`}</span>
        {state.view === 'scene' && <CombatPilotScene battle={battle} frame={scene} player={state}/>}
        <div className="vyr-combat-event-content" key={state.cursor}>
          <div className="vyr-combat-action-heading">
            <div className="vyr-combat-action-icon"><ActionIcon size={28} aria-hidden="true"/></div>
            {cue && <span className="vyr-combat-action-category">{cue.category}</span>}
            <h3>{event ? actionLabels[event.kind] : item ? 'Ronda sin eventos' : 'A la espera de tu señal'}</h3>
          </div>
          {event && <div className="vyr-combat-chain"><span><small>{cue?.actor}</small>{event.actor || 'Actor no indicado'}</span><span aria-hidden="true">→</span><span><small>{cue?.target}</small>{event.target || 'Sin objetivo registrado'}</span></div>}
          <p className="vyr-combat-description">{event?.message ?? (item ? 'Esta ronda no contiene acciones registradas.' : 'El resultado ya está calculado. Reproduce o inspecciona cualquier ronda.')}</p>
          {event?.damage !== undefined && <div className="vyr-combat-damage"><strong>{event.damage}</strong><span>Daño registrado{event.kind === 'blocked' && <small>Tras bloqueo parcial</small>}</span></div>}
          {record?.attempt && <p className="vyr-combat-cost">{record.attempt.kind === 'power' ? `Poder intentado · ${record.attempt.power}` : 'Ataque básico'}<span>MP consumido: <b>{record.attempt.mpSpent}</b></span></p>}
        </div>
        <small>{recording.mode === 'recorded' ? state.cursor < 0 ? 'Recursos iniciales del encuentro' : 'Recursos tras este evento' : 'Modo clásico · sin registro de HP/MP intermedios'}</small>
      </div>
    </div>
    <div className="vyr-combat-position"><progress aria-label="Posición de reproducción" max={Math.max(1, timeline.length)} value={state.cursor + 1}/><span>2,5 s por evento</span></div>
    <div className="vyr-combat-controls"><span role="status">{statusLabels[state.status]}</span><button className="game-action" disabled={state.status === 'empty' || state.status === 'finished'} onClick={() => dispatch({ type: state.status === 'playing' ? 'pause' : 'play' })}>{state.status === 'playing' ? <Pause size={15} aria-hidden="true"/> : <Play size={15} aria-hidden="true"/>}{state.status === 'playing' ? 'Pausar' : 'Continuar reproducción'}</button><button className="game-action secondary" disabled={state.status === 'empty' || state.status === 'finished'} onClick={() => dispatch({ type: 'step' })}><StepForward size={15} aria-hidden="true"/>Avanzar un evento</button><button className="game-action secondary" disabled={state.status === 'ready' || state.status === 'empty'} onClick={() => dispatch({ type: 'restart' })}><RotateCcw size={15} aria-hidden="true"/>Reiniciar reproducción</button><button className="game-action secondary" disabled={state.status === 'empty' || state.status === 'finished'} onClick={() => dispatch({ type: 'finish' })}><SkipForward size={15} aria-hidden="true"/>Ir al final</button></div>
    <label className="vyr-combat-round">Inspeccionar ronda <select value={item?.round ?? ''} onChange={e => dispatch({ type: 'round', round: Number(e.target.value) })}><option value="" disabled>Elegir ronda</option>{battle.rounds.map(r => <option key={r.round} value={r.round}>Ronda {r.round}</option>)}</select><span>Seleccionar una ronda pausa la reproducción.</span></label>
    {state.view === 'scene' && scene.supported && <details className="vyr-pilot-inspection"><summary>Inspección de poses del piloto</summary>
      <label>Pose de revisión <select value={state.phase} disabled={state.status === 'playing'} onChange={e => dispatch({ type: 'inspect', phase: e.target.value as PilotPhase })}>
        <option value="event">Acción registrada</option><option value="anticipation">Anticipación</option><option value="action">Acción</option><option value="reaction">Reacción</option><option value="rest">Reposo / K.O.</option>
      </select></label><p>Las cifras corresponden al estado posterior al evento. La pose sólo permite inspeccionar su presentación; el registro textual conserva la descripción completa.</p>
    </details>}
    <details className="vyr-combat-log"><summary>Registro textual {round ? `· Ronda ${round.round}` : '· Todas las rondas'}</summary>{(round ? [round] : battle.rounds).map(r => <section key={r.round}><h3>Ronda {r.round}</h3><p>Al cierre: {r.attackerAlive} atacantes y {r.defenderAlive} defensores en pie.</p><ol>{r.events.map((e, index) => <li key={`${e.id}-${index}`} aria-current={e === event ? 'step' : undefined}>{e.message}</li>)}</ol>{!r.events.length && <p>Sin eventos registrados.</p>}</section>)}</details>
    <section id="combat-final" className="vyr-combat-final" aria-label="Resultado final"><span className="eyebrow">RESULTADO FINAL / INDEPENDIENTE DE LA REPRODUCCIÓN</span><h3>Resultado del enfrentamiento</h3><p>{battle.summary}</p><p>K.O. causados · Atacantes {battle.attackerKOs} : {battle.defenderKOs} Defensores</p><p>Semilla #{battle.seed} · {battle.rounds.length} rondas · Puntos de tipos {battle.typePoints.attacker} : {battle.typePoints.defender}</p><details><summary>HP/MP finales de los participantes</summary>{([['Atacantes', battle.attackers], ['Defensores', battle.defenders]] as const).map(([label, heroes]) => <div key={label}><h4>{label} · valores finales</h4><ul>{heroes.map(h => <li key={h.id}>{h.name} — HP {h.hp}/{h.maxHp} · MP {h.mp}/{h.maxMp}{h.hp === 0 ? ' · K.O. final' : ''}</li>)}</ul></div>)}</details></section>
    <details className="combat-method"><summary>¿Qué reglas usa esta simulación?</summary><p>Documentadas: cinco por bando, diez rondas, K.O., empate favorable al defensor y conteo de tipos. El bonus de tipos no se aplica: su fórmula es desconocida.</p><p>Decisiones del remake: iniciativa, probabilidad de actuar, selección de objetivos, precisión, bloqueo, esquiva y daño final. El registro describe lo calculado, sin reconstruir habilidades ni consumos ausentes.</p></details>
  </section>;
}
