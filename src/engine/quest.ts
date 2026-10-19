import type { SaveData } from './types.ts';

/** Misión Pekín, 2010: 10 pasos y 12M dólares × nivel del laboratorio (nivel 1 en demo). */
export const STARTER_QUEST = { title:'Un trabajo bien remunerado', city:'Pekín', steps:10, rewardPerLaboratoryLevel:12_000_000 } as const;

/** Consumo de 1 turno/paso: una REGLA NUEVA de esta demo, no fórmula documentada. */
export function advanceStarterQuest(save:SaveData): SaveData {
  if(save.turns<=0 || save.questProgress>=STARTER_QUEST.steps) return save;
  return {...save,questProgress:save.questProgress+1,turns:save.turns-1};
}
/** Recompensa histórica. Demo fija nivel 1; futuro backend calculará nivel del laboratorio. */
export function claimStarterQuest(save:SaveData,laboratoryLevel=1): SaveData {
  if(save.questProgress!==STARTER_QUEST.steps) return save;
  if(!Number.isInteger(laboratoryLevel)||laboratoryLevel<1) throw new RangeError('Nivel de laboratorio inválido');
  return {...save,questProgress:0,questCompletions:save.questCompletions+1,funds:save.funds+STARTER_QUEST.rewardPerLaboratoryLevel*laboratoryLevel};
}
