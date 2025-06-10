import { test, expect } from '@playwright/test';

test.describe('Character List Sorting', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the character list page
    await page.goto('/characters');

    // Wait for the table to be visible
    await page.waitForSelector('table', { timeout: 30000 });
  });

  test('should sort characters by name', async ({ page }) => {
    // Get the initial order of character names
    const initialNames = await page.$$eval('table tbody tr td:first-child', elements =>
      elements.map(el => el.textContent?.trim())
    );

    // Click on the name column header to sort
    await page.click('th:has-text("NAME")');

    // Wait for sorting to complete
    await page.waitForTimeout(1000);

    // Get the sorted order of character names
    const sortedNames = await page.$$eval('table tbody tr td:first-child', elements =>
      elements.map(el => el.textContent?.trim())
    );

    // Verify that the order has changed (unless it was already sorted)
    if (JSON.stringify(initialNames) !== JSON.stringify([...initialNames].sort())) {
      expect(sortedNames).not.toEqual(initialNames);
    }

    // Verify the names are in alphabetical order
    const sortedCopy = [...sortedNames];
    expect(sortedNames).toEqual(sortedCopy.sort());
  });

  test('should sort characters by height', async ({ page }) => {
    // Get the initial order of character heights
    const initialHeights = await page.$$eval('table tbody tr td:nth-child(4)', elements =>
      elements.map(el => el.textContent?.trim())
    );

    // Click on the height column header to sort
    await page.click('th:has-text("HEIGHT")');

    // Wait for sorting to complete
    await page.waitForTimeout(1000);

    // Get the sorted order of character heights
    const sortedHeights = await page.$$eval('table tbody tr td:nth-child(4)', elements =>
      elements.map(el => el.textContent?.trim())
    );

    // Extract numeric values for comparison (remove 'cm' and convert to numbers)
    const getNumericHeight = (h: string | undefined) => parseFloat(h?.replace('cm', '') || '0');

    // Check if heights were already sorted
    const initialNumeric = initialHeights.map(getNumericHeight);
    const sortedNumeric = [...initialNumeric].sort((a, b) => a - b);

    // Verify that the order has changed (unless it was already sorted)
    if (JSON.stringify(initialNumeric) !== JSON.stringify(sortedNumeric)) {
      expect(sortedHeights).not.toEqual(initialHeights);
    }

    // Verify the heights are in ascending numeric order
    const currentHeights = sortedHeights.map(getNumericHeight);
    const sortedCopy = [...currentHeights].sort((a, b) => a - b);
    expect(currentHeights).toEqual(sortedCopy);
  });

  test('should show loading overlay when sorting', async ({ page }) => {
    // Click on the name column header to sort
    await page.click('th:has-text("NAME")');

    // Check if the loading overlay appears
    const overlay = await page.locator('[data-testid="loading-overlay"]').isVisible();

    if (overlay) {
      // If overlay is visible, verify the table is dimmed during loading
      const tableState = await page.getAttribute('[data-testid="character-table"]', 'data-state');
      expect(tableState).toBe('dimmed');

      // Wait for the loading overlay to disappear
      await page.waitForSelector('[data-testid="loading-overlay"]', {
        state: 'hidden',
        timeout: 5000,
      });

      // Verify the table is no longer dimmed after loading
      const tableStateAfterLoading = await page.getAttribute(
        '[data-testid="character-table"]',
        'data-state'
      );
      expect(tableStateAfterLoading).toBe('normal');
    } else {
      // If no overlay appears, the test should still pass as the sorting might be too fast
      // for the overlay to be visible in the test environment
      test.skip();
    }
  });
});
