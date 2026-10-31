import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { INITIAL_SAVE, PLAYER_TEAM, ENEMIES } from '../../src/data/demo';
import { simulateCombat } from '../../src/engine/simulator';
const storedBattle = simulateCombat(PLAYER_TEAM, ENEMIES.patrulla.heroes, 1024);
const fixture = { ...INITIAL_SAVE, battles: 7, lastBattle: storedBattle };
async function enter(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Simulador de combate', exact: true }).click();
}
test('legacy result: trusted rapid input, timers, navigation and persistence', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const tracked = new Set<number>();
    Object.assign(window, { combatTimeouts: tracked });
    const schedule = window.setTimeout.bind(window);
    const cancel = window.clearTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => {
      if (delay !== 2500) return schedule(handler, delay, ...args);
      const id = schedule(() => {
        tracked.delete(id);
        if (typeof handler === 'function') handler(...args);
      }, delay);
      tracked.add(id);
      return id;
    }) as typeof window.setTimeout;
    window.clearTimeout = id => { tracked.delete(id!); cancel(id); };
  });
  await page.addInitScript(save => localStorage.setItem('vyrathen-v01', JSON.stringify(save)), fixture);
  await enter(page);
  const readSave = () => page.evaluate(() => localStorage.getItem('vyrathen-v01'));
  const before = await readSave();
  const status = page.getByRole('status').filter({ hasText: /Listo|Reproduciendo|Pausado|Finalizado/ });
  await expect(status).toHaveText('Listo para reproducir');
  await page.getByRole('button', { name: 'Continuar reproducción' }).click();
  await page.waitForTimeout(1400);
  await expect(page.getByLabel('Evento actual')).toContainText('A la espera de tu señal');
  await expect(page.getByLabel('Evento actual')).toContainText('EVENTO 1 DE');
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  const step = page.getByRole('button', { name: 'Avanzar un evento' });
  await step.dblclick({ delay: 30 });
  await step.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(page.getByLabel('Evento actual')).toContainText('EVENTO 5 DE');
  await page.getByRole('button', { name: 'Continuar reproducción' }).click();
  await page.getByLabel('Inspeccionar ronda').selectOption('4');
  await expect(status).toHaveText('Pausado');
  const paused = await page.getByLabel('Evento actual').textContent();
  await page.waitForTimeout(2800);
  await expect(page.getByLabel('Evento actual')).toHaveText(paused!);
  await page.getByRole('button', { name: 'Ir al final' }).click();
  await expect(status).toHaveText('Finalizado');
  await expect(step).toBeDisabled();
  await page.getByRole('button', { name: 'Reiniciar reproducción' }).click();
  await page.getByRole('button', { name: 'Continuar reproducción' }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { combatTimeouts: Set<number> }).combatTimeouts.size)).toBe(1);
  await page.getByRole('navigation').getByRole('button', { name: 'Centro de control', exact: true }).click();
  expect(await page.evaluate(() => (window as Window & { combatTimeouts: Set<number> }).combatTimeouts.size)).toBe(0);
  await page.waitForTimeout(2800);
  await page.getByRole('navigation').getByRole('button', { name: 'Simulador de combate', exact: true }).click();
  await expect(status).toHaveText('Listo para reproducir');
  expect(await readSave()).toBe(before);
  await page.getByText('Configurar nueva simulación · rival y semilla', { exact: true }).click();
  await page.getByLabel('Semilla del simulador').fill('42');
  await page.getByRole('button', { name: /Guardianes/ }).click();
  await expect(page.getByLabel('Reproducción del encuentro')).toContainText('#1024');
  await page.getByRole('button', { name: 'Nueva simulación' }).click();
  await expect(status).toHaveText('Listo para reproducir');
  await expect(page.getByLabel('Reproducción del encuentro')).toContainText('#42');
  const saved = JSON.parse((await readSave())!);
  expect(saved.battles).toBe(8);
  expect(saved.funds).toBe(fixture.funds);
  expect(saved.turns).toBe(fixture.turns);
  expect(saved.lastBattle).toEqual(simulateCombat(PLAYER_TEAM, ENEMIES.guardianes.heroes, 42));
});
test('structured action cues distinguish an attacking defender, partial block, dodge and recorded damage', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const base = storedBattle.rounds[0].events[0];
  const kinds = ['normal', 'blocked', 'dodged', 'power', 'miss', 'ko'] as const;
  const battle = { ...storedBattle, rounds: kinds.map((kind, index) => ({
    round: index + 1, attackerAlive: 5, defenderAlive: 5,
    events: [{ ...base, id: `cue-${index}`, round: index + 1, kind, side: 'defensor' as const,
      actor: storedBattle.defenders[0].name, target: storedBattle.attackers[0].name,
      damage: ['normal', 'blocked', 'power'].includes(kind) ? 37 : undefined,
      message: 'Descripción registrada sin detalles adicionales.' }],
  })) };
  await page.addInitScript(save => localStorage.setItem('vyrathen-v01', JSON.stringify(save)), { ...fixture, lastBattle: battle });
  await enter(page);
  const step = page.getByRole('button', { name: 'Avanzar un evento' });
  await step.click();
  await expect(page.locator('.vyr-combat-team.defensor [data-role="Actor"]')).toContainText('Ataca');
  await expect(page.locator('.vyr-combat-damage')).toContainText('37');
  await step.click();
  await expect(page.locator('.vyr-combat-team.atacante [data-role="Objetivo"]')).toContainText('Bloquea parcialmente');
  await expect(page.locator('.vyr-combat-damage')).toContainText('Tras bloqueo parcial');
  await step.click();
  await expect(page.locator('.vyr-combat-team.atacante [data-role="Objetivo"]')).toContainText('Esquiva');
  await expect(page.locator('.vyr-combat-damage')).toHaveCount(0);
  await step.click();
  await expect(page.locator('.vyr-combat-action-category')).toHaveText('Poder');
  await expect(page.locator('.vyr-combat-damage')).toContainText('37');
  await step.click();
  await expect(page.locator('.vyr-combat-action-category')).toHaveText('Ataque fallido');
  await expect(page.locator('.vyr-combat-damage')).toHaveCount(0);
  await step.click();
  await expect(page.locator('.vyr-combat-team.atacante [data-role="Objetivo · K.O."]')).toHaveCount(1);
  await expect(page.locator('.vyr-combat-team.defensor [data-role="Actor"]')).toHaveCount(1);
  await expect(page.locator('.vyr-combat-damage')).toHaveCount(0);
});
test('reduced motion, textual inspection and accessibility', async ({ page }) => {
  await page.addInitScript(save => localStorage.setItem('vyrathen-v01', JSON.stringify(save)), fixture);
  await enter(page);
  await page.getByLabel('Inspeccionar ronda').selectOption('2');
  await page.getByText('Registro textual · Ronda 2', { exact: true }).click();
  await expect(page.locator('.vyr-combat-log')).toContainText(storedBattle.rounds[1].events[0].message);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test('empty rounds, system events and ambiguous K.O. keep readable fallbacks', async ({ page }) => {
  const battle = structuredClone(storedBattle);
  battle.defenders[1].name = battle.defenders[0].name;
  const base = battle.rounds[0].events[0];
  battle.rounds = [
    { round: 1, events: [], attackerAlive: 5, defenderAlive: 5 },
    { round: 2, events: [{ ...base, side: 'sistema', actor: 'Sistema', target: undefined, kind: 'info', message: 'Evento de sistema sin objetivo.' }], attackerAlive: 5, defenderAlive: 5 },
    { round: 3, events: [{ ...base, side: 'atacante', actor: battle.attackers[0].name, target: battle.defenders[0].name, kind: 'ko', message: 'Objetivo ambiguo registrado.' }], attackerAlive: 5, defenderAlive: 4 },
  ];
  await page.addInitScript(save => localStorage.setItem('vyrathen-v01', JSON.stringify(save)), { ...fixture, lastBattle: battle });
  await enter(page);
  await page.getByLabel('Inspeccionar ronda').selectOption('1');
  await expect(page.getByLabel('Evento actual')).toContainText('Ronda sin eventos');
  await page.getByRole('button', { name: 'Avanzar un evento' }).click();
  await expect(page.getByLabel('Evento actual')).toContainText('Sin objetivo registrado');
  await expect(page.locator('[data-role="Actor"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Avanzar un evento' }).click();
  await expect(page.locator('[data-role="Actor"]')).toHaveCount(1);
  await expect(page.locator('[data-role^="Objetivo"]')).toHaveCount(0);
  await expect(page.getByLabel('Evento actual')).toContainText('Objetivo ambiguo registrado.');
});
