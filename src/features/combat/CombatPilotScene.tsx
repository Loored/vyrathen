import { useState, type CSSProperties } from 'react';
import type { CombatResult } from '../../engine/types';
import { HeroSigil } from '../heroes/HeroPresentation';
import { toHeroProfile } from '../heroes/heroProfile';
import { inspectedPose, PILOT_ACTORS, type PilotActorState, type PilotFrame, type PilotPlayer, type PilotPose } from './pilotModel';
import { pilotLayout, projectPose, type Point } from './pilotGeometry';
import { CLIP_ID, CLIP_STARTS, clipDrawing, clipPose, clipStep, eligibleClip } from './pilotClip';
import './pilot.css';

const poseLabels: Record<PilotPose, string> = { idle:'Reposo', anticipation:'Anticipación', basic:'Ataque básico', power:'Poder', hit:'Impacto', block:'Bloqueo', dodge:'Esquiva', ko:'K.O.' };
/** Five held beats, one inherited CSS timeline. No playback callbacks or resource writes. */
export function beatPose(actor: PilotActorState, beat: number): PilotPose {
  if (actor.knockedOut) return actor.role === 'target' && beat < 2 ? 'idle' : beat === 2 && actor.role === 'target' ? 'hit' : 'ko';
  return inspectedPose(actor, beat === 0 ? 'anticipation' : beat === 1 ? 'action' : beat < 4 ? 'reaction' : 'rest');
}
export function CombatPilotScene({ battle, frame, player }: { battle:CombatResult; frame:PilotFrame; player:PilotPlayer }) {
  const [art,setArt]=useState<Record<string,'ready'|'fallback'>>({});
  if (!frame.supported) return null;
  const clip=eligibleClip(frame);
  const layout=pilotLayout(player.framing), heroes=[...battle.attackers,...battle.defenders];
  const symbols=frame.action ? [frame.action.actorId,frame.action.targetId].filter(id=>!frame.actors.some(a=>a.id===id)).flatMap(id=>heroes.find(h=>h.id===id)??[]) : [];
  const symbolPoint=(id:string):Point=>[layout.symbols[battle.attackers.some(h=>h.id===id)?0:1],layout.ground*.58];
  const direction=frame.action && battle.attackers.some(h=>h.id===frame.action!.actorId)?'right':'left';
  const contact=frame.action && ['normal','power','blocked'].includes(frame.action.outcome);
  const posesFor=(beat:number)=>Object.fromEntries(frame.actors.map(actor=>[actor.id,clip?clipPose(actor.id as 'h4'|'e3',beat):player.animated?beatPose(actor,beat):inspectedPose(actor,player.phase)]));
  const load=(id:string,status:'ready'|'fallback')=>setArt(old=>old[id]===status||old[id]==='fallback'?old:{...old,[id]:status});
  return <div className="vyr-pilot-scene" aria-label="Escena piloto 2D" data-clip={clip?CLIP_ID:undefined} data-framing={player.framing} data-visual-serial={player.visualSerial} data-phase={player.animated?'event':player.phase} data-animated={player.animated} data-running={player.status==='playing'} data-action-id={frame.action?.id} data-actor-id={frame.action?.actorId} data-target-id={frame.action?.targetId} data-outcome={frame.action?.outcome} data-direction={direction}>
    <span className="vyr-pilot-kicker">PILOTO 2D / {frame.actors.length} DE {heroes.length} · 5 CONTRA 5</span>
    <svg className="vyr-pilot-world" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
      <ellipse cx={layout.width/2} cy={layout.ground} rx={layout.width*.46} ry="15" className="vyr-pilot-floor"/>
      <g className="vyr-pilot-sequence" key={player.visualSerial}>
        {(clip?(player.animated?CLIP_STARTS.map((_,i)=>i):[clipStep(player.phase)]):(player.animated?[0,1,2,3,4]:[2])).map(beat=>{
          const poses=posesFor(beat);
          const point=(id:string,kind:'hand'|'contact'):Point=>{
            const actor=frame.actors.find(a=>a.id===id);
            if(!actor || art[id]==='fallback')return actor?[layout.feet[id as 'h4'|'e3'],layout.ground*.58]:symbolPoint(id);
            const projected=projectPose(id as 'h4'|'e3',poses[id],player.framing,clip?clipDrawing(id as 'h4'|'e3',beat):undefined);
            return projected[kind]??projected.contact;
          };
          const from=frame.action?point(frame.action.actorId,'hand'):[0,0], to=frame.action?point(frame.action.targetId,'contact'):[0,0];
          const showPath=clip?beat===4:player.animated?beat===1||beat===2:['event','action'].includes(player.phase);
          const showContact=contact && (clip?beat===5||beat===6:player.animated?beat===2||beat===3:['event','reaction'].includes(player.phase));
          const end:Point=frame.action && ['miss','dodged'].includes(frame.action.outcome)?[to[0],Math.max(20,to[1]-layout.height*.24)]:to as Point;
          return <g key={beat} className="vyr-pilot-beat" data-beat={beat} data-clip-step={clip?beat:undefined} style={{'--beat':beat} as CSSProperties}>
            {frame.actors.map(actor=>{
              const id=actor.id as 'h4'|'e3',pose=poses[id], geometry=projectPose(id,pose,player.framing,clip?clipDrawing(id,beat):undefined),asset=PILOT_ACTORS[id];
              return <g key={id} data-render-id={id} data-render-pose={pose} data-drawing={geometry.src??asset.src} data-bounds={JSON.stringify(geometry.bounds)}>
                {art[id]!=='fallback' && <svg x={geometry.x} y={geometry.y} width={geometry.cellWidth*geometry.scale} height={geometry.cellHeight*geometry.scale} viewBox={`0 0 ${geometry.cellWidth} ${geometry.cellHeight}`} overflow="hidden">
                  <image href={geometry.src??asset.src} x={geometry.frameX} y={geometry.frameY} width={geometry.width} height={geometry.height} onLoad={()=>load(id,'ready')} onError={()=>load(id,'fallback')}/>
                </svg>}
                {player.debugAnchors && <g className="vyr-pilot-anchors" data-anchor-id={id}>
                  {([['support',geometry.support],['contact',geometry.contact],['hand',geometry.hand]] as const).map(([name,p])=>p && <g key={name} data-anchor={name} transform={`translate(${p[0]} ${p[1]})`}><path d="M-7 0h14M0 -7v14"/><circle r="4"/><text x="8" y="-5">{id} {name}</text></g>)}
                </g>}
              </g>;
            })}
            {frame.action && <g className="vyr-pilot-effect">
              {showPath && <path className="vyr-pilot-path" data-from={from.join(',')} data-to={end.join(',')} d={`M${from.join(' ')} Q${(from[0]+end[0])/2} ${Math.min(from[1],end[1])-20} ${end.join(' ')}`}/>}
              {showContact && <g className="vyr-pilot-contact" data-contact={frame.action.outcome==='blocked'?'guard':'impact'} transform={`translate(${to.join(' ')})`}><circle r="12"/><path d="M-15 0h30M0 -15v30"/></g>}
            </g>}
          </g>;
        })}
      </g>
      {player.debugAnchors && <path className="vyr-pilot-ground-debug" d={`M0 ${layout.ground}H${layout.width}`}/>}
    </svg>
    {frame.actors.map(actor=>{
      const id=actor.id as 'h4'|'e3',pose=clip&&!player.animated?clipPose(id,clipStep(player.phase)):inspectedPose(actor,player.animated?'event':player.phase),hero=heroes.find(h=>h.id===id)!;
      return <div className="vyr-pilot-actor" key={id} style={{left:`${layout.feet[id]/layout.width*100}%`}} data-pilot-id={id} data-pose={pose} data-art={art[id]??'loading'} data-role={actor.role} data-ko={actor.knockedOut||undefined}>
        {!art[id] && <span className="vyr-pilot-loading">Cargando arte…</span>}
        {art[id]==='fallback' && <div className="vyr-pilot-art-fallback"><HeroSigil profile={toHeroProfile(hero)}/><span>Arte no disponible</span></div>}
        <span className="vyr-pilot-name">{hero.name}<small>{poseLabels[pose]}</small></span>
      </div>;
    })}
    {symbols.map(hero=><div key={hero.id} className="vyr-pilot-symbol" style={{left:`${symbolPoint(hero.id)[0]/layout.width*100}%`,top:`${symbolPoint(hero.id)[1]/layout.height*100}%`}} data-symbol-id={hero.id}><HeroSigil profile={toHeroProfile(hero)}/><span>{hero.name}</span></div>)}
  </div>;
}
