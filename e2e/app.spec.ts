// e2e/app.spec.ts
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Wait for the title to be visible
  await expect(page.locator('h1')).toContainText('Galactic Archives');
});

test('navigates to home page', async ({ page }) => {
  await page.goto('/');

  // Check if the app shell is rendered
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});
