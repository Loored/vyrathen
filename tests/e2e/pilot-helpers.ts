import { expect, type Page } from '@playwright/test';
import { INITIAL_SAVE } from '../../src/data/demo';
import type { CombatResult } from '../../src/engine/types';
import { pilotFixture } from '../fixtures/pilot-scenarios';

export async function openPilot(page: Page, battle = pilotFixture()) {
  await page.addInitScript(save => {
    if (!localStorage.getItem('vyrathen-v01')) localStorage.setItem('vyrathen-v01', JSON.stringify(save));
  }, { ...INITIAL_SAVE, battles: 3, seed: battle.seed, lastBattle: battle });
  await page.goto('/');
  if (page.viewportSize()!.width < 900) await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Simulador de combate', exact: true }).click();
}
export async function sceneView(page: Page) {
  await page.getByRole('button', { name: 'Escena 2D · candidata', exact: true }).click();
  await expect(page.getByLabel('Escena piloto 2D')).toBeVisible();
  await expect(page.locator('[data-pilot-id][data-art="loading"]')).toHaveCount(0);
}
export async function seekPilot(page: Page, battle: CombatResult, cursor: number) {
  const events = battle.rounds.flatMap(r => r.events);
  const round = battle.rounds.find(r => r.events.some(e => e.id === events[cursor].id))!;
  await page.getByLabel('Inspeccionar ronda').selectOption(String(round.round));
  const first = events.findIndex(e => e.id === round.events[0].id);
  for (let i = first; i < cursor; i++) await page.getByRole('button', { name: 'Avanzar un evento' }).click();
  await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor', String(cursor));
}
export async function inspectPose(page: Page, pose: string) {
  const detail = page.locator('.vyr-pilot-inspection');
  if (await detail.getAttribute('open') === null) await detail.locator('summary').click();
  await page.getByRole('combobox', { name: 'Pose de revisión', exact: true }).selectOption(pose);
}
export function outcomeFixture(kind: 'power' | 'blocked' | 'miss' | 'dodged') {
  for (let seed = 0; seed < 100; seed++) {
    const battle = pilotFixture('patrulla', seed), events = battle.rounds.flatMap(r => r.events);
    const cursor = events.findIndex((e, i) => e.kind === kind && battle.trace!.events[i].actorId === 'h4' && battle.trace!.events[i].targetId === 'e3' && battle.trace!.events[i].attempt?.kind === 'power');
    if (cursor >= 0) return { battle, cursor, seed };
  }
  throw new Error(`No real seeded h4 → e3 power ${kind} case found`);
}
