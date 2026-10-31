import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { INITIAL_SAVE, PLAYER_TEAM, ENEMIES } from '../../src/data/demo';
import { simulateCombat } from '../../src/engine/simulator';
import type { CombatResult } from '../../src/engine/types';
import { combatScenario } from '../fixtures/combat-scenarios';

const battle = simulateCombat(PLAYER_TEAM, ENEMIES.patrulla.heroes, 1024);
async function enter(page: Page, result = battle) {
  await page.addInitScript(save => localStorage.setItem('vyrathen-v01', JSON.stringify(save)), { ...INITIAL_SAVE, battles: 3, lastBattle: result });
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Simulador de combate', exact: true }).click();
}
async function seek(page: Page, result: CombatResult, cursor: number) {
  const events = result.rounds.flatMap(r => r.events);
  const round = result.rounds.find(r => r.events.some(e => e.id === events[cursor].id))!;
  await page.getByLabel('Inspeccionar ronda').selectOption(String(round.round));
  const first = events.findIndex(e => e.id === round.events[0].id);
  for (let i = first; i < cursor; i++) await page.getByRole('button', { name: 'Avanzar un evento' }).click();
  await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-cursor', String(cursor));
}
async function assertResources(page: Page, result: CombatResult, cursor: number) {
  const resources = new Map(result.trace!.initial.map(r => [r.id, { hp: r.hp, mp: r.mp }]));
  for (const event of result.trace!.events.slice(0, cursor + 1)) for (const change of event.changes) resources.set(change.id, change.after);
  for (const hero of [...result.attackers, ...result.defenders]) {
    const row = page.locator(`[data-fighter-id="${hero.id}"]`), value = resources.get(hero.id)!;
    await expect(row.locator('[data-resource="HP"]')).toHaveText(`HP ${value.hp}/${hero.maxHp}`);
    await expect(row.locator('[data-resource="MP"]')).toHaveText(`MP ${value.mp}/${hero.maxMp}`);
    if (value.hp === 0) await expect(row).toHaveAttribute('data-knocked-out', 'true');
    else await expect(row).not.toHaveAttribute('data-knocked-out', 'true');
  }
}
for (const motion of ['reduce', 'no-preference'] as const) test(`synchronized resources, costs, persistent K.O., navigation and save — ${motion}`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: motion });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await enter(page);
  const before = await page.evaluate(() => localStorage.getItem('vyrathen-v01'));
  const scene = page.getByLabel('Reproducción del encuentro');
  await expect(scene).toHaveAttribute('data-recording', '1');
  await assertResources(page, battle, -1);
  await page.getByRole('button', { name: 'Continuar reproducción' }).click();
  await expect(scene).toHaveAttribute('data-cursor', '0', { timeout: 6000 });
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await assertResources(page, battle, 0);
  const step = page.getByRole('button', { name: 'Avanzar un evento' });
  await step.dblclick({ delay: 30 });
  await step.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await assertResources(page, battle, 4);
  const events = battle.rounds.flatMap(r => r.events);
  for (const kind of ['blocked', 'miss', 'dodged'] as const) {
    const cursor = events.findIndex((e, i) => e.kind === kind && battle.trace!.events[i].attempt?.kind === 'power');
    expect(cursor).toBeGreaterThanOrEqual(0);
    await seek(page, battle, cursor);
    await assertResources(page, battle, cursor);
    await expect(page.locator('.vyr-combat-cost')).toContainText(`MP consumido: ${battle.trace!.events[cursor].attempt!.mpSpent}`);
  }
  const ko = events.findIndex(e => e.kind === 'ko');
  await seek(page, battle, ko + 1);
  const defeated = battle.trace!.events[ko].defeatedId!;
  await expect(page.locator(`[data-fighter-id="${defeated}"]`)).toHaveAttribute('data-knocked-out', 'true');
  await assertResources(page, battle, ko + 1);
  if (motion === 'reduce') {
    expect(await page.locator('.vyr-combat-resource-track>span').first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.getByRole('button', { name: 'Ir al final' }).click();
  await assertResources(page, battle, events.length - 1);
  await page.getByRole('button', { name: 'Reiniciar reproducción' }).click();
  await assertResources(page, battle, -1);
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Continuar reproducción' }).click();
    await page.getByRole('navigation').getByRole('button', { name: 'Centro de control', exact: true }).click();
    await page.getByRole('navigation').getByRole('button', { name: 'Simulador de combate', exact: true }).click();
    await expect(scene).toHaveAttribute('data-cursor', '-1');
    await expect(page.getByRole('button', { name: 'Continuar reproducción' })).toBeEnabled();
    await assertResources(page, battle, -1);
  }
  await page.waitForTimeout(2800);
  await expect(scene).toHaveAttribute('data-cursor', '-1');
  expect(await page.evaluate(() => localStorage.getItem('vyrathen-v01'))).toBe(before);
  expect(errors).toEqual([]);
});

test('duplicate names use recorded IDs for actor, target and persistent resources', async ({ page }) => {
  const input = combatScenario('patrulla', 'fragile-duplicates');
  const result = simulateCombat(input.attackers, input.defenders, 1024);
  await enter(page, result);
  const cursor = result.trace!.events.findIndex(r => r.attempt);
  await seek(page, result, cursor);
  const record = result.trace!.events[cursor];
  await expect(page.locator(`[data-fighter-id="${record.actorId}"]`)).toHaveAttribute('data-role', 'Actor');
  await expect(page.locator(`[data-fighter-id="${record.targetId}"]`)).toHaveAttribute('data-role', 'Objetivo');
  await expect(page.locator('[data-role="Actor"]')).toHaveCount(1);
  await expect(page.locator('[data-role="Objetivo"]')).toHaveCount(1);
  await assertResources(page, result, cursor);
});

for (const issue of ['unsupported', 'partial', 'invalid-cost'] as const) test(`recording ${issue}: complete legacy fallback without writes`, async ({ page }) => {
  const result = structuredClone(battle);
  if (issue === 'unsupported') Object.assign(result.trace!, { version: 2 });
  if (issue === 'partial') result.trace!.events.pop();
  if (issue === 'invalid-cost') Object.assign(result.trace!.events[0].attempt!, { mpSpent: null });
  await enter(page, result);
  const before = await page.evaluate(() => localStorage.getItem('vyrathen-v01'));
  await expect(page.getByLabel('Reproducción del encuentro')).toHaveAttribute('data-recording', 'legacy');
  await page.getByRole('button', { name: 'Avanzar un evento' }).click();
  await expect(page.locator('.vyr-combat-resources')).toHaveCount(0);
  await expect(page.locator('.vyr-combat-cost')).toHaveCount(0);
  await expect(page.getByLabel('Evento actual')).toContainText('Modo clásico');
  await page.getByText('HP/MP finales de los participantes', { exact: true }).click();
  await expect(page.getByLabel('Resultado final')).toContainText('valores finales');
  expect(await page.evaluate(() => localStorage.getItem('vyrathen-v01'))).toBe(before);
});
