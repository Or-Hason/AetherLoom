/**
 * Node helper utilities for Playwright tests
 * Functions for interacting with individual nodes
 */

import { Page } from '@playwright/test';

/**
 * Get the value from a text input node
 * @param page - Playwright page object
 * @param nodeId - ID of the text input node
 */
export async function getTextInputValue(page: Page, nodeId: string): Promise<string> {
  const input = page.locator(`[data-id="${nodeId}"] input[type="text"]`);
  return (await input.inputValue()) || '';
}

/**
 * Set the value of a text input node
 * @param page - Playwright page object
 * @param nodeId - ID of the text input node
 * @param value - New value to set
 */
export async function setTextInputValue(
  page: Page,
  nodeId: string,
  value: string
): Promise<void> {
  const input = page.locator(`[data-id="${nodeId}"] input[type="text"]`);
  await input.fill(value);
  
  // Wait for the value to be updated
  await page.waitForTimeout(100);
}

/**
 * Get the value from a number input node
 * @param page - Playwright page object
 * @param nodeId - ID of the number input node
 */
export async function getNumberInputValue(page: Page, nodeId: string): Promise<number> {
  const input = page.locator(`[data-id="${nodeId}"] input[type="number"]`);
  const value = await input.inputValue();
  return parseFloat(value) || 0;
}

/**
 * Set the value of a number input node
 * @param page - Playwright page object
 * @param nodeId - ID of the number input node
 * @param value - New value to set
 */
export async function setNumberInputValue(
  page: Page,
  nodeId: string,
  value: number
): Promise<void> {
  const input = page.locator(`[data-id="${nodeId}"] input[type="number"]`);
  await input.fill(value.toString());
  
  // Wait for the value to be updated
  await page.waitForTimeout(100);
}

/**
 * Get the operation type from a math operation node
 * @param page - Playwright page object
 * @param nodeId - ID of the math operation node
 */
export async function getMathOperation(page: Page, nodeId: string): Promise<string> {
  const select = page.locator(`[data-id="${nodeId}"] select`);
  // TODO: Decide if it's good to have a default value in this case (while considering it doesn't have an empty value as an option)
  return (await select.inputValue()) || 'add';
}

/**
 * Set the operation type of a math operation node
 * @param page - Playwright page object
 * @param nodeId - ID of the math operation node
 * @param operation - Operation type ('add', 'subtract', 'multiply', 'divide')
 */
export async function setMathOperation(
  page: Page,
  nodeId: string,
  operation: 'add' | 'subtract' | 'multiply' | 'divide'
): Promise<void> {
  const select = page.locator(`[data-id="${nodeId}"] select`);
  await select.selectOption(operation);
  
  // Wait for the operation to be updated
  await page.waitForTimeout(100);
}

/**
 * Get the displayed value from an output node
 * @param page - Playwright page object
 * @param nodeId - ID of the output node
 */
export async function getOutputValue(page: Page, nodeId: string): Promise<string> {
  const output = page.locator(`[data-id="${nodeId}"] .output-value`);
  return (await output.textContent()) || '';
}

/**
 * Check if a node has an error state
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 */
export async function hasNodeError(page: Page, nodeId: string): Promise<boolean> {
  const node = page.locator(`[data-id="${nodeId}"]`);
  const classList = await node.getAttribute('class');
  return classList?.includes('error') || false;
}

/**
 * Get the status LED color of a node
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 */
export async function getNodeStatus(
  page: Page,
  nodeId: string
): Promise<'idle' | 'running' | 'success' | 'error' | null> {
  return await page.evaluate((id) => {
    const node = document.querySelector(`[data-id="${id}"]`);
    if (!node) return null;
    
    const statusLed = node.querySelector('[data-status-led]');
    if (!statusLed) return null;
    
    const status = statusLed.getAttribute('data-status');
    return status as 'idle' | 'running' | 'success' | 'error' | null;
  }, nodeId);
}

/**
 * Check if a node is selected
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 */
export async function isNodeSelected(page: Page, nodeId: string): Promise<boolean> {
  const node = page.locator(`[data-id="${nodeId}"]`);
  const classList = await node.getAttribute('class');
  return classList?.includes('selected') || false;
}

/**
 * Get the number of input handles on a node
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 */
export async function getInputHandleCount(page: Page, nodeId: string): Promise<number> {
  const handles = page.locator(`[data-id="${nodeId}"] .react-flow__handle-left`);
  return await handles.count();
}

/**
 * Get the number of output handles on a node
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 */
export async function getOutputHandleCount(page: Page, nodeId: string): Promise<number> {
  const handles = page.locator(`[data-id="${nodeId}"] .react-flow__handle-right`);
  return await handles.count();
}

/**
 * Check if a handle is connected
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 * @param handleId - ID of the handle
 */
export async function isHandleConnected(
  page: Page,
  nodeId: string,
  handleId: string
): Promise<boolean> {
  return await page.evaluate(
    ({ id, handle }) => {
      const edges = (window as any).__flowStore?.getState?.()?.edges || [];
      return edges.some(
        (edge: any) =>
          (edge.source === id && edge.sourceHandle === handle) ||
          (edge.target === id && edge.targetHandle === handle)
      );
    },
    { id: nodeId, handle: handleId }
  );
}
