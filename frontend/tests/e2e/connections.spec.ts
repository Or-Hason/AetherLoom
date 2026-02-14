/**
 * Connection/Edge tests
 * Tests for creating and validating connections between nodes
 */

import { test, expect } from '@playwright/test';
import { dragNodeFromSidebar, connectNodes } from '../utils/canvas-helpers';
import { expectEdgeCount, expectEdgeToExist } from '../utils/assertions';

test.describe('Node Connections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test('should start with no connections', async ({ page }) => {
    await expectEdgeCount(page, 0);
  });

  test.skip('should connect two nodes', async ({ page }) => {
    // This test is skipped until nodes are fully implemented
    // TODO: Implement when nodes support drag-and-drop and connections
    
    // Create two nodes
    await dragNodeFromSidebar(page, 'text_input', { x: 100, y: 100 });
    await dragNodeFromSidebar(page, 'text_output', { x: 400, y: 100 });
    
    // Connect them
    await connectNodes(page, 'text-input-1', 'text-output-1');
    
    // Verify connection exists
    await expectEdgeCount(page, 1);
    await expectEdgeToExist(page, 'text-input-1', 'text-output-1');
  });

  test.skip('should prevent invalid connections', async ({ page }) => {
    // This test is skipped until type validation is implemented
    // TODO: Implement when type-safe connections are enforced
    
    // Try to connect incompatible types
    await dragNodeFromSidebar(page, 'text_input', { x: 100, y: 100 });
    await dragNodeFromSidebar(page, 'number_output', { x: 400, y: 100 });
    
    // Attempt connection (should fail)
    await connectNodes(page, 'text-input-1', 'number-output-1');
    
    // Verify no connection was created
    await expectEdgeCount(page, 0);
  });

  test.skip('should allow deleting connections', async ({ page }) => {
    // This test is skipped until edge deletion is implemented
    // TODO: Implement when edges can be deleted
    
    // Create and connect nodes
    await dragNodeFromSidebar(page, 'text_input', { x: 100, y: 100 });
    await dragNodeFromSidebar(page, 'text_output', { x: 400, y: 100 });
    await connectNodes(page, 'text-input-1', 'text-output-1');
    
    await expectEdgeCount(page, 1);
    
    // Click on edge and delete
    const edge = page.locator('.react-flow__edge').first();
    await edge.click();
    // TODO: Check if it should be "Backspace" instead of "Delete"
    await page.keyboard.press('Delete');
    
    // Verify edge is deleted
    await expectEdgeCount(page, 0);
  });

  test.skip('should prevent cycles', async ({ page }) => {
    // This test is skipped until cycle detection is implemented
    // TODO: Implement when cycle detection is active

    // TODO: Does this test even make sense? Maybe it should be performed with nodes with more than one input/output?
    
    // Create three nodes in a potential cycle
    await dragNodeFromSidebar(page, 'text_input', { x: 100, y: 100 });
    await dragNodeFromSidebar(page, 'text_output', { x: 300, y: 100 });
    await dragNodeFromSidebar(page, 'text_input', { x: 200, y: 200 });
    
    // Create connections that would form a cycle
    await connectNodes(page, 'text-input-1', 'text-output-1');
    await connectNodes(page, 'text-output-1', 'text-input-2');
    
    // Try to create cycle (should fail)
    await connectNodes(page, 'text-input-2', 'text-input-1');
    
    // Should only have 2 edges, not 3
    await expectEdgeCount(page, 2);
  });
});
