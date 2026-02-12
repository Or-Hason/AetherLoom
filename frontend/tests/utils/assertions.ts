/**
 * Custom assertions for Playwright tests
 * Extended assertion functions for AetherLoom-specific testing
 */

import { expect, Page } from '@playwright/test';

/**
 * Assert that a node exists on the canvas
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 */
export async function expectNodeToExist(page: Page, nodeId: string): Promise<void> {
  const node = page.locator(`[data-id="${nodeId}"]`);
  await expect(node).toBeVisible();
}

/**
 * Assert that a node does not exist on the canvas
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 */
export async function expectNodeNotToExist(page: Page, nodeId: string): Promise<void> {
  const node = page.locator(`[data-id="${nodeId}"]`);
  await expect(node).not.toBeVisible();
}

/**
 * Assert that an edge exists between two nodes
 * @param page - Playwright page object
 * @param sourceId - Source node ID
 * @param targetId - Target node ID
 */
export async function expectEdgeToExist(
  page: Page,
  sourceId: string,
  targetId: string
): Promise<void> {
  const edgeExists = await page.evaluate(
    ({ source, target }) => {
      const edges = (window as any).__flowStore?.getState?.()?.edges || [];
      return edges.some((edge: any) => edge.source === source && edge.target === target);
    },
    { source: sourceId, target: targetId }
  );
  
  expect(edgeExists).toBe(true);
}

/**
 * Assert that the canvas has a specific number of nodes
 * @param page - Playwright page object
 * @param count - Expected number of nodes
 */
export async function expectNodeCount(page: Page, count: number): Promise<void> {
  const nodes = page.locator('.react-flow__node');
  await expect(nodes).toHaveCount(count);
}

/**
 * Assert that the canvas has a specific number of edges
 * @param page - Playwright page object
 * @param count - Expected number of edges
 */
export async function expectEdgeCount(page: Page, count: number): Promise<void> {
  const edges = page.locator('.react-flow__edge');
  await expect(edges).toHaveCount(count);
}

/**
 * Assert that a node has a specific status
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 * @param status - Expected status ('idle', 'running', 'success', 'error')
 */
export async function expectNodeStatus(
  page: Page,
  nodeId: string,
  status: 'idle' | 'running' | 'success' | 'error'
): Promise<void> {
  const actualStatus = await page.evaluate((id) => {
    const node = document.querySelector(`[data-id="${id}"]`);
    if (!node) return null;
    
    const statusLed = node.querySelector('[data-status-led]');
    return statusLed?.getAttribute('data-status');
  }, nodeId);
  
  expect(actualStatus).toBe(status);
}

/**
 * Assert that a text input has a specific value
 * @param page - Playwright page object
 * @param nodeId - ID of the text input node
 * @param expectedValue - Expected value
 */
export async function expectTextInputValue(
  page: Page,
  nodeId: string,
  expectedValue: string
): Promise<void> {
  const input = page.locator(`[data-id="${nodeId}"] input[type="text"]`);
  await expect(input).toHaveValue(expectedValue);
}

/**
 * Assert that a number input has a specific value
 * @param page - Playwright page object
 * @param nodeId - ID of the number input node
 * @param expectedValue - Expected value
 */
export async function expectNumberInputValue(
  page: Page,
  nodeId: string,
  expectedValue: number
): Promise<void> {
  const input = page.locator(`[data-id="${nodeId}"] input[type="number"]`);
  await expect(input).toHaveValue(expectedValue.toString());
}

/**
 * Assert that an output node displays a specific value
 * @param page - Playwright page object
 * @param nodeId - ID of the output node
 * @param expectedValue - Expected displayed value
 */
export async function expectOutputValue(
  page: Page,
  nodeId: string,
  expectedValue: string
): Promise<void> {
  const output = page.locator(`[data-id="${nodeId}"] .output-value`);
  await expect(output).toHaveText(expectedValue);
}

/**
 * Assert that a node is selected
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 */
export async function expectNodeToBeSelected(page: Page, nodeId: string): Promise<void> {
  const node = page.locator(`[data-id="${nodeId}"].selected`);
  await expect(node).toBeVisible();
}

/**
 * Assert that the canvas is empty
 * @param page - Playwright page object
 */
export async function expectCanvasToBeEmpty(page: Page): Promise<void> {
  await expectNodeCount(page, 0);
  await expectEdgeCount(page, 0);
}

/**
 * Assert that a validation error is displayed
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 * @param errorMessage - Expected error message (optional)
 */
export async function expectValidationError(
  page: Page,
  nodeId: string,
  errorMessage?: string
): Promise<void> {
  const errorElement = page.locator(`[data-id="${nodeId}"] .error-message`);
  await expect(errorElement).toBeVisible();
  
  if (errorMessage) {
    await expect(errorElement).toHaveText(errorMessage);
  }
}
