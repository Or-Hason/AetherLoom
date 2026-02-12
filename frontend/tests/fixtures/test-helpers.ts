/**
 * Test helper functions
 * Utility functions for common test operations
 */

import { Page } from '@playwright/test';

/**
 * Wait for a specific duration
 * @param ms - Milliseconds to wait
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get the current flow state from the Zustand store
 * @param page - Playwright page object
 */
export async function getFlowState(page: Page): Promise<any> {
  return await page.evaluate(() => {
    // Access the Zustand store from window (if exposed)
    // TODO: This may need adjustment based on actual implementation
    return {
      nodes: (window as any).__flowStore?.getState?.()?.nodes || [],
      edges: (window as any).__flowStore?.getState?.()?.edges || [],
    };
  });
}

/**
 * Clear the canvas (remove all nodes and edges)
 * @param page - Playwright page object
 */
export async function clearCanvas(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Select all nodes
    // TODO: Check if the following line is relevant, and if so, replace "platform" as it is deprecated:
    // const selectAllShortcut = navigator.platform.includes('Mac') ? 'Meta+a' : 'Control+a';
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }));
  });
  // TODO: Why evaluate is needed? Maybe replace with the following:
  // await page.keyboard.down('Control');
  // await page.keyboard.press('a');
  // await page.keyboard.up('Control');
  
  // Delete selected nodes
  await page.keyboard.press('Delete');
  // TODO: Check if possible to replace waits with a more robust method
  await wait(500); // Wait for deletion to complete
}

/**
 * Take a screenshot with a descriptive name
 * @param page - Playwright page object
 * @param name - Screenshot name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Wait for network idle (no pending requests)
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Check if an element is visible on the page
 * @param page - Playwright page object
 * @param selector - CSS selector or data attribute
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Get text content from an element
 * @param page - Playwright page object
 * @param selector - CSS selector or data attribute
 */
export async function getTextContent(page: Page, selector: string): Promise<string | null> {
  try {
    const element = page.locator(selector);
    return await element.textContent();
  } catch {
    return null;
  }
}

/**
 * Count the number of nodes on the canvas
 * @param page - Playwright page object
 */
export async function countNodes(page: Page): Promise<number> {
  const nodes = page.locator('.react-flow__node');
  return await nodes.count();
}

/**
 * Count the number of edges on the canvas
 * @param page - Playwright page object
 */
export async function countEdges(page: Page): Promise<number> {
  const edges = page.locator('.react-flow__edge');
  return await edges.count();
}
