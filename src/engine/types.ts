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
