import { test, expect } from '@playwright/test';

test('V2 portfolio navigation, language and project detail', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');

  await expect(
    page.getByText('JONATHA BOTELHO', { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'PT-BR', exact: true }).click();
  await page
    .getByRole('link', { name: /ACADEMICS & CERTS/ })
    .last()
    .click();
  await expect(page).toHaveURL('/academics');
  await expect(
    page.getByText('Pós-graduação em Engenharia de Software'),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeLessThanOrEqual(1080);

  await page
    .getByRole('link', { name: /PROJECTS/ })
    .last()
    .click();
  await expect(page).toHaveURL('/projects');
  await page
    .getByRole('link', { name: /see project/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/projects\/1$/);
  await expect(page.getByText('PROJECT SPECIFICATION')).toBeVisible();
});

test('mobile shell exposes menu and the real 3D portrait', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const character = page.getByRole('img', {
    name: 'Personagem 3D de Jonatha Botelho',
  });
  await expect(character).toBeVisible();

  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.getByRole('link', { name: /PROJECTS/ }).first(),
  ).toBeVisible();
});

test('character study renders the final GLB viewer', async ({ page }) => {
  await page.goto('/character');
  await expect(
    page.getByRole('heading', { level: 1, name: 'CHARACTER STUDY' }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Personagem 3D de Jonatha Botelho' }),
  ).toBeVisible();
  await expect(page.getByText('GLB / GLTF 2.0')).toBeVisible();
});
