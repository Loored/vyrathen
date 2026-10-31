export type HeroType = 'Psico' | 'Energía' | 'Defensa' | 'Control';
export type Side = 'atacante' | 'defensor';
export type Provenance = 'historical_document' | 'observed_on_page' | 'remake_assumption';
export interface Hero {
  id: string;
  name: string;
  type: HeroType;
  level: number;
  maxHp: number;
  maxMp: number;
  hit: number;
  block: number;
  dodge: number;
  mental: number;
  speed: number;
  power: string;
  powerLevel: number;
}
export interface Fighter extends Hero { hp: number; mp: number }
export interface CombatEvent {
  id: string;
  round: number;
  side: Side | 'sistema';
  actor: string;
  target?: string;
  kind: 'normal' | 'power' | 'blocked' | 'dodged' | 'miss' | 'ko' | 'skip' | 'info';
  message: string;
  damage?: number;
  ruleOrigin: Provenance;
}
export interface RoundSnapshot {
  round: number;
  events: CombatEvent[];
  attackerAlive: number;
  defenderAlive: number;
}
export interface CombatResources { hp: number; mp: number }
export interface ResourceChange {
  id: string;
  before: CombatResources;
  after: CombatResources;
}
export type CombatAttempt =
  | { kind: 'basic'; mpSpent: 0 }
  | { kind: 'power'; power: string; mpSpent: number };
export interface CombatEventTrace {
  eventId: string;
  /** One-based position in the existing flattened event stream. */
  sequence: number;
  actorId?: string;
  targetId?: string;
  actionId?: string;
  /** Present only on the action's resolution, never repeated on its K.O. consequence. */
  attempt?: CombatAttempt;
  changes: ResourceChange[];
  defeatedId?: string;
}
export interface CombatTrace {
  version: 1;
  initial: (CombatResources & { id: string })[];
  events: CombatEventTrace[];
}
export interface CombatResult {
  seed: number;
  rounds: RoundSnapshot[];
  attackers: Fighter[];
  defenders: Fighter[];
  typePoints: { attacker: number; defender: number };
  attackerKOs: number;
  defenderKOs: number;
  victor: Side;
  summary: string;
  /** Optional additive telemetry; absent in results saved before Combat Experience v0.2. */
  trace?: CombatTrace;
}
export interface SaveData {
  version: 1;
  laboratoryName: string;
  funds: number;
  turns: number;
  questProgress: number;
  questCompletions: number;
  selectedEnemy: 'patrulla' | 'guardianes';
  seed: number;
  battles: number;
  lastBattle?: CombatResult;
}
