// MSW setup for Playwright E2E tests
import { test as base } from '@playwright/test';
import { setupServer } from 'msw/node';
import { handlers } from '../../src/mocks/handlers';

// Extend the Playwright test with MSW context
export const test = base.extend({
  // Setup MSW for browser tests
  page: async ({ page }, use) => {
    // Inject MSW into the browser context
    await page.addInitScript(() => {
      window.localStorage.setItem('useMSW', 'true');
    });

    // Wait for page to load before running tests
    page.on('load', () => console.log('Page loaded'));

    // Add debug info for navigation events
    page.on('request', request => {
      console.log(`>> Request: ${request.method()} ${request.url()}`);
    });

    // Use the page with MSW enabled
    await use(page);
  },
});

// Create a server instance
export const server = setupServer(...handlers);

// Start the server before all tests
test.beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
  console.log('🔶 MSW server started for E2E tests');
});

// Reset handlers after each test
test.afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
test.afterAll(() => {
  server.close();
  console.log('🔶 MSW server stopped for E2E tests');
});

// Server is already exported above
