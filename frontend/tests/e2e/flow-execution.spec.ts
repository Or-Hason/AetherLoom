/**
 * Flow execution tests
 * Tests for executing flows and verifying results
 */

import { test, expect } from '@playwright/test';
import { loadFlowFixture } from '../utils/canvas-helpers';
import { simpleTextFlow, mathOperationFlow } from '../fixtures/flows';
import { expectNodeCount, expectOutputValue } from '../utils/assertions';

test.describe('Flow Execution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test.skip('should execute simple text flow', async ({ page }) => {
    // This test is skipped until flow execution is fully implemented
    // TODO: Implement when flow execution and run button are available
    
    await loadFlowFixture(page, simpleTextFlow);
    
    // Verify nodes are loaded
    await expectNodeCount(page, 2);
    
    // Click run button
    const runButton = page.locator('[data-testid="run-flow-button"]').or(
      page.locator('button:has-text("Run")')
    );
    await runButton.click();
    
    // Wait for execution
    await page.waitForSelector('[data-execution-status="success"]', { timeout: 5000 });
    
    // Verify output
    await expectOutputValue(page, 'text-output-1', 'Hello World');
  });

  test.skip('should execute math operation flow', async ({ page }) => {
    // This test is skipped until flow execution is fully implemented
    // TODO: Implement when flow execution and math nodes are available
    
    await loadFlowFixture(page, mathOperationFlow);
    
    // Verify nodes are loaded
    await expectNodeCount(page, 4);
    
    // Click run button
    const runButton = page.locator('[data-testid="run-flow-button"]').or(
      page.locator('button:has-text("Run")')
    );
    await runButton.click();
    
    // Wait for execution
    await page.waitForSelector('[data-execution-status="success"]', { timeout: 5000 });
    
    // Verify output (10 + 5 = 15)
    await expectOutputValue(page, 'num-output-1', '15');
  });

  test.skip('should handle execution errors', async ({ page }) => {
    // This test is skipped until error handling is implemented
    // TODO: Implement when error handling is available
    
    // Create a flow with an error (e.g., division by zero)
    const errorFlow = {
      nodes: [
        {
          id: 'num-input-1',
          type: 'number_input',
          position: { x: 100, y: 100 },
          data: { value: 10 },
        },
        {
          id: 'num-input-2',
          type: 'number_input',
          position: { x: 100, y: 200 },
          data: { value: 0 },
        },
        {
          id: 'math-op-1',
          type: 'math_operation',
          position: { x: 300, y: 150 },
          data: { operation: 'divide' },
        },
      ],
      edges: [
        { id: 'e1', source: 'num-input-1', target: 'math-op-1', sourceHandle: 'output', targetHandle: 'a' },
        { id: 'e2', source: 'num-input-2', target: 'math-op-1', sourceHandle: 'output', targetHandle: 'b' },
      ],
    };
    
    await loadFlowFixture(page, errorFlow);
    
    // Click run button
    const runButton = page.locator('[data-testid="run-flow-button"]');
    await runButton.click();
    
    // Wait for error state
    await page.waitForSelector('[data-execution-status="error"]', { timeout: 5000 });
    
    // Verify error message is displayed
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
  });

  test.skip('should update node status during execution', async ({ page }) => {
    // This test is skipped until node status updates are implemented
    // TODO: Implement when node status LEDs are functional
    
    await loadFlowFixture(page, simpleTextFlow);
    
    // Click run button
    const runButton = page.locator('[data-testid="run-flow-button"]');
    await runButton.click();
    
    // Check that nodes show running status
    const runningNode = page.locator('[data-status="running"]');
    await expect(runningNode).toBeVisible();
    
    // Wait for completion
    await page.waitForSelector('[data-execution-status="success"]', { timeout: 5000 });
    
    // Check that nodes show success status
    const successNode = page.locator('[data-status="success"]');
    await expect(successNode).toBeVisible();
  });
});
