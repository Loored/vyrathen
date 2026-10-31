import type { PilotFraming } from './pilotGeometry.ts';
import type { CombatEvent, CombatResult } from '../../engine/types.ts';
import { initialPlayback, transition, type Playback, type PlaybackAction, type Timeline } from './playback.ts';
import { resourcesAtCursor, type ResourcePlayback } from './resourcePlayback.ts';

export type PilotPhase = 'event' | 'anticipation' | 'action' | 'reaction' | 'rest';
export type PilotPose = 'idle' | 'anticipation' | 'basic' | 'power' | 'hit' | 'block' | 'dodge' | 'ko';
export type PilotPlayer = Playback & { view: 'tactical' | 'scene'; phase: PilotPhase; animated: boolean; visualSerial: number; framing: PilotFraming; debugAnchors: boolean };
export type PilotAction = PlaybackAction | { type: 'view'; view: PilotPlayer['view'] } | { type: 'inspect'; phase: PilotPhase } | { type:'framing'; framing:PilotFraming } | { type:'anchors'; enabled:boolean };
export function initialPilotPlayer(timeline: Timeline): PilotPlayer {
  return { ...initialPlayback(timeline), view: 'tactical', phase: 'rest', animated: false, visualSerial: 0, framing:'expanded', debugAnchors:false };
}
/** Only the existing playback transition changes cursor/status. No additional clock. */
export function pilotTransition(state: PilotPlayer, action: PilotAction, timeline: Timeline): PilotPlayer {
  if (action.type === 'anchors') return { ...state, debugAnchors:action.enabled };
  if (action.type === 'framing') return action.framing === state.framing ? state : { ...state, framing:action.framing, phase:'rest', animated:false, visualSerial:state.visualSerial+1 };
  if (action.type === 'view') return action.view === state.view ? state : { ...state, view: action.view, phase: 'rest', animated: false, visualSerial: state.visualSerial + 1 };
  if (action.type === 'inspect') return state.status === 'playing' ? state : { ...state, phase: action.phase, animated: false, visualSerial: state.visualSerial + 1 };
  const next = transition({ cursor: state.cursor, status: state.status }, action, timeline);
  if (action.type === 'restart') return { ...state, ...next, phase: 'rest', animated: false, visualSerial: state.visualSerial + 1 };
  if (next.cursor === state.cursor && next.status === state.status) return state;
  if (next.cursor !== state.cursor) return {
    ...state, ...next, phase: next.status === 'finished' ? 'rest' : action.type === 'step' ? 'event' : 'rest',
    animated: action.type === 'tick' && state.view === 'scene' && next.status === 'playing', visualSerial: state.visualSerial + 1,
  };
  // Pause freezes presentation; resume continues it, without re-enacting the current event.
  return { ...state, ...next };
}

export const PILOT_SHEET = { width:1536, height:1024, columns:4, rows:2, cellWidth:384, cellHeight:512, frames:8 } as const;
export const PILOT_ACTORS = {
  h4: { name: 'Nyra', side: 'atacante', facing: 'right', src: '/combat-pilot/nyra-poses.png' },
  e3: { name: 'Grim', side: 'defensor', facing: 'left', src: '/combat-pilot/grim-poses.png' },
} as const;
export interface PilotActorState { id: string; pose: PilotPose; knockedOut: boolean; role: 'actor' | 'target' | 'idle' }
export interface PilotFrame {
  supported: boolean;
  actors: PilotActorState[];
  action?: { id: string; eventId: string; actorId: string; targetId: string; kind: 'basic' | 'power'; outcome: CombatEvent['kind'] };
}
export function pilotFrame(battle: CombatResult, recording: ResourcePlayback, timeline: Timeline, cursor: number): PilotFrame {
  if (recording.mode !== 'recorded') return { supported: false, actors: [] };
  const item = timeline[cursor], event = item?.event;
  const record = event ? recording.events[item.ordinal - 1] : undefined;
  const resources = resourcesAtCursor(recording, timeline, cursor)!;
  const action = record?.attempt && record.actionId && record.actorId && record.targetId && event ? {
    id: record.actionId, eventId: event.id, actorId: record.actorId, targetId: record.targetId, kind: record.attempt.kind, outcome: event.kind,
  } : undefined;
  const actors = Object.entries(PILOT_ACTORS).flatMap(([id, asset]) => {
    const team = asset.side === 'atacante' ? battle.attackers : battle.defenders;
    if (!team.some(h => h.id === id)) return [];
    const knockedOut = resources.get(id)?.hp === 0;
    const role = action?.actorId === id ? 'actor' as const : action?.targetId === id ? 'target' as const : 'idle' as const;
    const pose: PilotPose = knockedOut ? 'ko' : role === 'actor' ? action!.kind : role === 'target'
      ? event?.kind === 'blocked' ? 'block' : event?.kind === 'dodged' ? 'dodge' : event?.kind === 'miss' ? 'idle' : 'hit' : 'idle';
    return [{ id, pose, knockedOut, role }];
  });
  return { supported: true, actors, action };
}
export function inspectedPose(actor: PilotActorState, phase: PilotPhase): PilotPose {
  if (actor.knockedOut) return 'ko';
  if (phase === 'rest') return 'idle';
  if (phase === 'anticipation') return actor.role === 'actor' ? 'anticipation' : 'idle';
  if (phase === 'action') return actor.role === 'actor' ? actor.pose : 'idle';
  if (phase === 'reaction') return actor.role === 'target' ? actor.pose : 'idle';
  return actor.pose;
}
export const POSE_FRAMES: Record<PilotPose, number> = { idle: 0, anticipation: 1, basic: 2, power: 3, hit: 4, block: 5, dodge: 6, ko: 7 };
