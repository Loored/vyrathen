import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PLAYER_TEAM, INITIAL_SAVE } from '../../src/data/demo';

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`personajes: contratos, selección, teclado, foco y partida — ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(save => localStorage.setItem('vyrathen-v01', JSON.stringify(save)), { ...INITIAL_SAVE, questProgress: 4, turns: 176 });
    await page.goto('/');
    const saved = await page.evaluate(() => localStorage.getItem('vyrathen-v01'));
    await page.getByRole('button', { name: 'Mis héroes', exact: true }).click();
    for (const hero of PLAYER_TEAM) {
      const select = page.getByRole('button', { name: `Seleccionar ${hero.name}`, exact: true });
      await select.focus();
      await page.keyboard.press('Space');
      await expect(select).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.vyr-roster-select[aria-pressed=true]')).toHaveCount(1);
      await page.keyboard.press('Tab');
      const opener = page.getByRole('button', { name: `Consultar ficha de ${hero.name}`, exact: true });
      await expect(opener).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('heading', { name: hero.name, exact: true })).toBeFocused();
      await expect(page.locator('.vyr-hero-vitals dd')).toHaveText([String(hero.maxHp), String(hero.maxMp)]);
      await expect(page.locator('.vyr-profile-stats dd')).toHaveText([hero.hit, hero.block, hero.dodge, hero.mental, hero.speed].map(String));
      await expect(page.locator('#hero-power-title')).toHaveText(hero.power);
      await expect(page.getByText('Sin ilustración asignada.', { exact: false })).toBeVisible();
      await expect(page.locator('.hero-profile img')).toHaveCount(0);
      await expect(page.locator('.vyr-profile-stats')).toBeInViewport({ ratio: 1 });
      await expect(page.getByRole('button', { name: 'Abrir simulador' })).toBeInViewport({ ratio: 1 });
      if (reducedMotion === 'reduce') await expect(page.locator('.hero-profile')).toHaveCSS('animation-name', 'none');
      await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
      await expect(opener).toBeFocused();
      await expect(select).toHaveAttribute('aria-pressed', 'true');
    }
    // Rapid real input: selection is synchronous, with no animation locks or overlays.
    await page.locator('.vyr-roster-select').first().dispatchEvent('click');
    await page.locator('.vyr-roster-select').last().dispatchEvent('click');
    await expect(page.locator('.vyr-roster-select').last()).toHaveAttribute('aria-pressed', 'true');
    for (const hero of [PLAYER_TEAM[1], PLAYER_TEAM[3], PLAYER_TEAM[0]]) {
      await page.getByRole('button', { name: `Consultar ficha de ${hero.name}` }).dispatchEvent('click');
      await expect(page.locator('#hero-profile-name')).toHaveText(hero.name);
      await page.getByRole('button', { name: 'Volver a Mis héroes' }).dispatchEvent('click');
      await expect(page.getByRole('button', { name: `Consultar ficha de ${hero.name}` })).toBeFocused();
    }
    expect(await page.evaluate(() => localStorage.getItem('vyrathen-v01'))).toBe(saved);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1366);
  });
}

test('personajes móvil: selección y ficha accesibles sin overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('button', { name: 'Mis héroes', exact: true }).click();
  await page.getByRole('button', { name: 'Seleccionar Astra' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Consultar ficha de Astra' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
  await expect(page.getByRole('button', { name: 'Consultar ficha de Astra' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Seleccionar Astra' })).toHaveAttribute('aria-pressed', 'true');
});

test('vídeo personajes: selección, consulta y retorno con movimiento normal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Mis héroes', exact: true }).click();
  await page.waitForTimeout(1000); // Readable holds for owner review, not synchronization.
  for (const name of ['Vesper', 'Astra']) {
    await page.getByRole('button', { name: `Seleccionar ${name}` }).click();
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: `Consultar ficha de ${name}` }).click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
    await page.waitForTimeout(700);
  }
});
