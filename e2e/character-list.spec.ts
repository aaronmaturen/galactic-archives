import { expect } from '@playwright/test';
import { test } from './setup/msw.setup';

test.describe('Character List', () => {
  test('should load characters page', async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // Navigate directly to the characters page
    await page.goto('/characters');
    console.log('Navigated to characters page');

    // Verify we're on the characters page
    await expect(page).toHaveURL(/.*\/characters/);

    // Wait for the page to be visible and network to be idle
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    console.log('Network is idle');

    // Take a screenshot before checking for elements
    await page.screenshot({ path: 'test-results/characters-page-before.png' });

    // Print page HTML for debugging
    const html = await page.content();
    console.log('Page HTML structure:', html.substring(0, 500) + '...');

    // Check if any elements with data-testid exist
    const testIds = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]');
      return Array.from(elements).map(el => el.getAttribute('data-testid'));
    });
    console.log('Found data-testid elements:', testIds);

    // Verify that the page has loaded with the character list heading
    await expect(page.locator('[data-testid="character-list-heading"]')).toBeVisible({
      timeout: 10000,
    });

    // Check for character data (this will only pass if MSW is intercepting API requests)
    const characterText = await page.textContent('body');
    expect(characterText).toContain('Luke Skywalker');

    // Try to find character cards directly
    try {
      const cards = await page.$$('[data-testid="character-card"]');
      console.log(`Found ${cards.length} character cards`);

      if (cards.length > 0) {
        const firstCardText = await cards[0].textContent();
        console.log('First card text:', firstCardText);
      }
    } catch (e) {
      console.log('Error finding character cards:', e);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/characters-page-after.png' });
  });
});
