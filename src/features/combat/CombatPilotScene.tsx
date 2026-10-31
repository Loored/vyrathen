import { useState, type CSSProperties } from 'react';
import type { CombatResult, Fighter } from '../../engine/types';
import { HeroSigil } from '../heroes/HeroPresentation';
import { toHeroProfile } from '../heroes/heroProfile';
import { inspectedPose, PILOT_ACTORS, PILOT_SHEET, POSE_FRAMES, type PilotActorState, type PilotFrame, type PilotPlayer, type PilotPose } from './pilotModel';
import './pilot.css';

const poseLabels: Record<PilotPose, string> = { idle: 'Reposo', anticipation: 'Anticipación', basic: 'Ataque básico', power: 'Poder', hit: 'Impacto', block: 'Bloqueo', dodge: 'Esquiva', ko: 'K.O.' };
function PilotActor({ hero, actor, player }: { hero: Fighter; actor: PilotActorState; player: PilotPlayer }) {
  const [art, setArt] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const asset = PILOT_ACTORS[actor.id as keyof typeof PILOT_ACTORS];
  const pose = inspectedPose(actor, player.animated ? 'event' : player.phase);
  const frame = POSE_FRAMES[pose];
  const sequence = actor.role === 'target' && actor.knockedOut ? 'fall' : actor.pose;
  const style = { '--pose-x': `${-(frame % PILOT_SHEET.columns) * PILOT_SHEET.cellWidth}px`, '--pose-y': `${-Math.floor(frame / PILOT_SHEET.columns) * PILOT_SHEET.cellHeight}px` } as CSSProperties;
  const clipId = `vyr-pilot-clip-${actor.id}`;
  return <div className={`vyr-pilot-actor ${asset.facing}`} data-pilot-id={actor.id} data-pose={pose} data-art={art} data-role={actor.role} data-ko={actor.knockedOut || undefined}>
    <div className="vyr-pilot-body" key={player.visualSerial} data-sequence={player.animated ? sequence : 'stable'}>
      {art === 'loading' && <span className="vyr-pilot-loading">Cargando arte…</span>}
      {art !== 'fallback' ? <svg viewBox={`0 0 ${PILOT_SHEET.cellWidth} ${PILOT_SHEET.cellHeight}`} className="vyr-pilot-sprite" aria-hidden="true" style={style}>
        <defs><clipPath id={clipId}><rect width={PILOT_SHEET.cellWidth} height={PILOT_SHEET.cellHeight}/></clipPath></defs>
        <g clipPath={`url(#${clipId})`}><image href={asset.src} width={PILOT_SHEET.width} height={PILOT_SHEET.height} className="vyr-pilot-sheet" onLoad={() => setArt('ready')} onError={() => setArt('fallback')}/></g>
      </svg> : <div className="vyr-pilot-art-fallback"><HeroSigil profile={toHeroProfile(hero)}/><span>Arte no disponible</span></div>}
    </div>
    <span className="vyr-pilot-name">{hero.name}<small>{poseLabels[pose]}</small></span>
  </div>;
}

export function CombatPilotScene({ battle, frame, player }: { battle: CombatResult; frame: PilotFrame; player: PilotPlayer }) {
  if (!frame.supported) return null;
  const heroes = [...battle.attackers, ...battle.defenders];
  const symbols = frame.action ? [frame.action.actorId, frame.action.targetId].filter(id => !frame.actors.some(a => a.id === id)).flatMap(id => {
    const hero = heroes.find(h => h.id === id);
    return hero ? [hero] : [];
  }) : [];
  const direction = frame.action && battle.attackers.some(h => h.id === frame.action!.actorId) ? 'right' : 'left';
  const anchor = (id: string) => frame.actors.some(a => a.id === id) ? id === 'h4' ? 110 : 230 : battle.attackers.some(h => h.id === id) ? 25 : 315;
  const from = frame.action ? anchor(frame.action.actorId) : 110;
  const to = frame.action ? anchor(frame.action.targetId) : 230;
  const fromY = frame.action && frame.actors.some(a => a.id === frame.action!.actorId) ? frame.action.kind === 'power' ? 60 : 70 : 86;
  const contact = frame.action && ['normal', 'power', 'blocked'].includes(frame.action.outcome);
  return <div className="vyr-pilot-scene" aria-label="Escena piloto 2D" data-visual-serial={player.visualSerial} data-phase={player.animated ? 'event' : player.phase} data-animated={player.animated} data-running={player.status === 'playing'} data-action-id={frame.action?.id} data-actor-id={frame.action?.actorId} data-target-id={frame.action?.targetId} data-outcome={frame.action?.outcome} data-direction={direction}>
    <span className="vyr-pilot-kicker">PILOTO 2D / {frame.actors.length} DE {heroes.length} · 5 CONTRA 5</span>
    <div className="vyr-pilot-floor" aria-hidden="true"/>
    {frame.actors.map(actor => <PilotActor key={actor.id} hero={heroes.find(h => h.id === actor.id)!} actor={actor} player={player}/>)}
    {symbols.map(hero => <div key={hero.id} className={`vyr-pilot-symbol ${battle.attackers.some(h => h.id === hero.id) ? 'right' : 'left'}`} data-symbol-id={hero.id}><HeroSigil profile={toHeroProfile(hero)}/><span>{hero.name}</span></div>)}
    {frame.action && <svg className="vyr-pilot-effect" viewBox="0 0 340 180" preserveAspectRatio="none" aria-hidden="true" key={`effect-${player.visualSerial}`}>
      <path className="vyr-pilot-path" d={`M${from} ${fromY} Q${(from + to) / 2} ${['miss','dodged'].includes(frame.action.outcome) ? 24 : 58} ${to} ${['miss','dodged'].includes(frame.action.outcome) ? 32 : 86}`}/>
      {contact && <g className="vyr-pilot-contact" data-contact={frame.action.outcome === 'blocked' ? 'guard' : 'impact'} transform={`translate(${to} 86)`}><circle r="12"/><path d="M-15 0h30M0 -15v30"/></g>}
    </svg>}
  </div>;
}
