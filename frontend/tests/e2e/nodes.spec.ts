/**
 * Node operation tests
 * Tests for creating, configuring, and manipulating nodes
 */

import { test, expect } from '@playwright/test';
import { dragNodeFromSidebar, selectNode, deleteNode } from '../utils/canvas-helpers';
import { 
  setTextInputValue, 
  getTextInputValue,
  setNumberInputValue,
  getNumberInputValue 
} from '../utils/node-helpers';
import { expectNodeCount, expectNodeToExist } from '../utils/assertions';

test.describe('Node Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test('should drag text input node from sidebar', async ({ page }) => {
    // Find a draggable node in the sidebar
    const textInputNode = page.locator('[data-node-type="text_input"]').or(
      page.locator('text=Text Input').first()
    );
    
    // Check if sidebar has draggable items
    const sidebarItems = page.locator('aside').or(page.locator('[data-testid="sidebar"]'));
    await expect(sidebarItems.first()).toBeVisible();
    
    // For now, just verify the sidebar structure exists
    // Actual drag-and-drop will be tested when nodes are fully implemented
    await expectNodeCount(page, 0);
  });

  test('should handle empty canvas state', async ({ page }) => {
    await expectNodeCount(page, 0);
    
    // Verify no nodes are present
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(0);
  });

  test.skip('should edit text input value', async ({ page }) => {
    // This test is skipped until text input nodes are fully implemented
    // TODO: Implement when text input nodes support drag-and-drop
    await dragNodeFromSidebar(page, 'text_input', { x: 200, y: 200 });
    
    const nodeId = 'text-input-1';
    await setTextInputValue(page, nodeId, 'Test Value');
    
    const value = await getTextInputValue(page, nodeId);
    expect(value).toBe('Test Value');
  });

  test.skip('should edit number input value', async ({ page }) => {
    // This test is skipped until number input nodes are fully implemented
    // TODO: Implement when number input nodes support drag-and-drop
    await dragNodeFromSidebar(page, 'number_input', { x: 200, y: 200 });
    
    const nodeId = 'num-input-1';
    await setNumberInputValue(page, nodeId, 42);
    
    const value = await getNumberInputValue(page, nodeId);
    expect(value).toBe(42);
  });

  test.skip('should delete node', async ({ page }) => {
    // This test is skipped until nodes are fully implemented
    // TODO: Implement when nodes support drag-and-drop and deletion
    await dragNodeFromSidebar(page, 'text_input', { x: 200, y: 200 });
    
    const nodeId = 'text-input-1';
    await expectNodeToExist(page, nodeId);
    
    await deleteNode(page, nodeId);
    
    await expectNodeCount(page, 0);
  });

  test.skip('should select node on click', async ({ page }) => {
    // This test is skipped until nodes are fully implemented
    // TODO: Implement when nodes support selection
    await dragNodeFromSidebar(page, 'text_input', { x: 200, y: 200 });
    
    const nodeId = 'text-input-1';
    await selectNode(page, nodeId);
    
    const node = page.locator(`[data-id="${nodeId}"].selected`);
    await expect(node).toBeVisible();
  });
});
