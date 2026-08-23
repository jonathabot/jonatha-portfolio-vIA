import { test, expect } from '@playwright/test';

test('portfolio smoke: typing, theme, language, nav', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');

  // name types in
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'JONATHA BOTELHO',
    {
      timeout: 5000,
    },
  );

  // theme toggle flips <html data-theme>
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: /modo/i }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');

  // language starts in English and can switch to Portuguese
  await expect(page.getByRole('link', { name: 'toolkit' })).toBeVisible();
  await page.getByRole('button', { name: 'PT', exact: true }).click();
  await expect(page.getByRole('link', { name: 'ferramentas' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'JONATHA BOTELHO',
  );

  const orderedSections = await page
    .locator('#experiencia, #formacao, #cursos, #projetos, #contato')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(orderedSections).toEqual([
    'experiencia',
    'formacao',
    'cursos',
    'projetos',
    'contato',
  ]);

  // nav anchor works
  await page.getByRole('link', { name: 'projetos' }).click();
  await expect(page).toHaveURL(/#projetos/);
});

test('profile photo only appears when the hero fits in two columns', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');

  const photo = page.getByRole('img', { name: 'Jonatha Mathews' });
  await expect(photo).toBeHidden();

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(photo).toBeVisible();

  const photoBox = await photo.boundingBox();
  const headingBox = await page.getByRole('heading', { level: 1 }).boundingBox();
  expect(photoBox).not.toBeNull();
  expect(headingBox).not.toBeNull();
  expect(photoBox!.x).toBeGreaterThan(headingBox!.x + headingBox!.width);
});
