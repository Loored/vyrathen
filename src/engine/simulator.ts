import { chooseVictor, countTypePoints, documentedMpCost, NOMINAL_POWER_DAMAGE } from './rules.ts';
import type { CombatEvent, CombatEventTrace, CombatResult, CombatTrace, Fighter, Hero, RoundSnapshot, Side } from './types.ts';

/** Provisional: NO reconstruye el algoritmo de acción/defensa ni RNG del PHP original. */
export function createRng(seed: number): () => number {
  if (!Number.isSafeInteger(seed)) throw new TypeError('Semilla debe ser un entero seguro');
  let state = (seed >>> 0) || 0x9e3779b9;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Simulación reproducible, explícitamente distinta del servidor original. */
export function simulateCombat(attackers: readonly Hero[], defenders: readonly Hero[], seed: number): CombatResult {
  if (attackers.length !== 5 || defenders.length !== 5) throw new RangeError('La demo requiere 5 héroes por bando');
  const ids = [...attackers, ...defenders].map(h => h.id);
  if (new Set(ids).size !== ids.length) throw new Error('Los identificadores deben ser distintos');
  const rng = createRng(seed);
  const left: Fighter[] = attackers.map(h => ({...h, hp:h.maxHp, mp:h.maxMp}));
  const right: Fighter[] = defenders.map(h => ({...h, hp:h.maxHp, mp:h.maxMp}));
  const resources = (fighter: Fighter) => ({ hp: fighter.hp, mp: fighter.mp });
  const trace: CombatTrace = {
    version: 1,
    initial: [...left, ...right].map(h => ({ id: h.id, ...resources(h) })),
    events: [],
  };
  const rounds: RoundSnapshot[] = [];
  let eventCounter = 0;
  let actionCounter = 0;
  const emit = (events: CombatEvent[], round: number, side: CombatEvent['side'], actor: string,
    kind: CombatEvent['kind'], message: string, extras: Partial<CombatEvent> = {},
    details: Omit<CombatEventTrace, 'eventId' | 'sequence'> = { changes: [] }) => {
    events.push({id:`r${round}-${++eventCounter}`,round,side,actor,kind,message,ruleOrigin:'remake_assumption',...extras});
    trace.events.push({ eventId: events[events.length - 1].id, sequence: eventCounter, ...details });
  };
  for (let round = 1; round <= 10; round++) {
    const events: CombatEvent[] = [];
    const actionOrder = [
      ...left.filter(h=>h.hp>0).map(h => ({h,side:'atacante' as Side,initiative:h.speed + rng()*40})),
      ...right.filter(h=>h.hp>0).map(h => ({h,side:'defensor' as Side,initiative:h.speed + rng()*40})),
    ].sort((a,b)=>b.initiative-a.initiative);
    if (left.every(h=>h.hp===0) || right.every(h=>h.hp===0)) {
      emit(events, round, 'sistema', 'Sistema', 'info', 'El enfrentamiento ya está decidido; no quedan acciones.',{ruleOrigin:'remake_assumption'});
    } else for (const {h,side} of actionOrder) {
      if (h.hp <= 0) continue;
      const opposition = side === 'atacante' ? right : left;
      const active = opposition.filter(e=>e.hp>0);
      if (!active.length) break;
      // No conocemos la probabilidad histórica de actuar basada en Velocidad.
      const actionChance = clamp(0.61 + (h.speed-60)*0.003, 0.4, 0.86);
      if (rng() > actionChance) {
        emit(events,round,side,h.name,'skip',`${h.name} no actúa en esta ronda.`,{}, { actorId: h.id, changes: [] });
        continue;
      }
      const target = active[Math.floor(rng()*active.length)];
      const powerFormula = NOMINAL_POWER_DAMAGE[h.power];
      const cost = documentedMpCost(h.power,h.powerLevel);
      const usePower = !!powerFormula && h.mp >= cost && rng() < 0.5;
      const actorBefore = resources(h);
      const targetBefore = resources(target);
      const actionId = `a${++actionCounter}`;
      if (usePower) h.mp -= cost;
      // Copy values at resolution; no Fighter references and no extra RNG calls.
      const actionTrace = (): Omit<CombatEventTrace, 'eventId' | 'sequence'> => ({
        actorId: h.id, targetId: target.id, actionId,
        attempt: usePower ? { kind: 'power', power: h.power, mpSpent: actorBefore.mp - h.mp } : { kind: 'basic', mpSpent: 0 },
        changes: [
          { id: h.id, before: actorBefore, after: resources(h) },
          { id: target.id, before: targetBefore, after: resources(target) },
        ],
      });
      // Daño final, impactos, bloqueo y esquiva son decisiones nuevas del remake.
      const defense = usePower ? (['Desatomizar','Radiactividad'].includes(h.power) ? target.mental : h.power==='Telequinesis' ? target.block : target.dodge) : target.dodge;
      const hitChance = clamp(0.75 + (h.hit-defense)*0.0016, 0.53, 0.9);
      if (rng() >= hitChance) {
        emit(events,round,side,h.name,'miss',`${h.name} falla ${usePower ? h.power : 'su ataque'} contra ${target.name}.`,{target:target.name},actionTrace());
        continue;
      }
      const dodges = rng() < clamp(target.dodge/600,0.025,0.2);
      if (dodges) {
        emit(events,round,side,h.name,'dodged',`${target.name} esquiva el ataque de ${h.name}.`,{target:target.name},actionTrace());
        continue;
      }
      const blocks = rng() < clamp(target.block/350,0.05,0.32);
      const nominal = usePower ? powerFormula(h.powerLevel) : 24 + h.level*3 + Math.floor(h.hit/5);
      const defenseFactor = 0.77 + rng()*0.17;
      let damage = Math.max(1, Math.round(nominal*defenseFactor*(blocks ? 0.4 : 1)));
      damage = Math.min(damage, target.hp);
      target.hp -= damage;
      emit(events,round,side,h.name,blocks?'blocked':usePower?'power':'normal',
        `${h.name} ${usePower ? `usa ${h.power}` : 'golpea'} a ${target.name} · ${damage} de daño${blocks ? ' (bloqueo parcial)' : ''}.`,
        {target:target.name,damage},actionTrace());
      if (target.hp===0) emit(events,round,side,h.name,'ko',`${target.name} ha quedado K.O.`,{target:target.name,ruleOrigin:'historical_document'},
        { actorId: h.id, targetId: target.id, actionId, defeatedId: target.id, changes: [] });
    }
    rounds.push({round,events,attackerAlive:left.filter(h=>h.hp>0).length,defenderAlive:right.filter(h=>h.hp>0).length});
  }
  const attackerKOs = right.filter(h=>h.hp===0).length;
  const defenderKOs = left.filter(h=>h.hp===0).length;
  const victor = chooseVictor(attackerKOs,defenderKOs);
  return {
    seed,rounds,attackers:left,defenders:right,typePoints:countTypePoints(attackers,defenders),
    attackerKOs,defenderKOs,victor,
    trace,
    summary: victor==='atacante' ? 'El laboratorio atacante gana por K.O.'
      : attackerKOs===defenderKOs ? 'Empate en K.O.: gana el defensor.' : 'El defensor conserva la victoria.',
  };
}
