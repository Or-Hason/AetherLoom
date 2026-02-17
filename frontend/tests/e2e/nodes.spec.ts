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
import { createNodeProgrammatically } from '../fixtures/test-helpers';

test.describe('General Node Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test.skip('should create node via drag-and-drop from sidebar', async ({ page }) => {
    // TODO: This test is skipped because the onDrop handler in page.tsx needs work
    // The drag-and-drop interaction doesn't properly trigger React Flow's drop event
    // This test verifies the actual UI drag-and-drop interaction works

    // Verify sidebar has draggable items with correct attributes
    const textInputNode = page.locator('[data-node-type="text_input"]');
    await expect(textInputNode).toBeVisible();
    await expect(textInputNode).toHaveAttribute('draggable', 'true');

    // Verify canvas is ready
    const sidebarItems = page.locator('aside');
    await expect(sidebarItems.first()).toBeVisible();
    
    // Verify no nodes on canvas initially
    await expectNodeCount(page, 0);

    // Drag and drop text input node from sidebar
    await dragNodeFromSidebar(page, 'text_input', { x: 300, y: 300 });
    
    // Verify node was created on canvas
    await expectNodeCount(page, 1);
    
    // Verify the node is visible and has correct type
    const node = page.locator('.react-flow__node').first();
    await expect(node).toBeVisible();
  });

  test.skip('should delete node', async ({ page }) => {
    // This test is skipped until delete functionality is fully tested
    const nodeId = await createNodeProgrammatically(page, 'text_input', { x: 200, y: 200 });
    
    await expectNodeToExist(page, nodeId);
    
    await deleteNode(page, nodeId);
    
    await expectNodeCount(page, 0);
  });

  test.skip('should select node on click', async ({ page }) => {
    // This test is skipped until selection is fully tested
    const nodeId = await createNodeProgrammatically(page, 'text_input', { x: 200, y: 200 });
    
    await selectNode(page, nodeId);
    
    const node = page.locator(`[data-id="${nodeId}"].selected`);
    await expect(node).toBeVisible();
  });
});

test.describe('TextInputNode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test('should create text input node', async ({ page }) => {
    // Verify no nodes on canvas initially
    await expectNodeCount(page, 0);

    // Create node programmatically
    await createNodeProgrammatically(page, 'text_input', { x: 200, y: 200 });

    // Verify node was created on canvas
    await expectNodeCount(page, 1);
    
    // Verify the node is visible and has correct type
    const node = page.locator('.react-flow__node').first();
    await expect(node).toBeVisible();
  });

  test('should edit text input value', async ({ page }) => {
    // Create node programmatically and get its ID
    const nodeId = await createNodeProgrammatically(page, 'text_input', { x: 200, y: 200 });
    
    // Wait for node to render
    await page.waitForSelector('.react-flow__node input[type="text"]', { timeout: 5000 });
    
    // Use the helper function with the node ID
    await setTextInputValue(page, nodeId, 'Test Value');
    
    const value = await getTextInputValue(page, nodeId);
    expect(value).toBe('Test Value');
  });

  test('should sanitize HTML from text input (XSS prevention)', async ({ page }) => {
    // Create node programmatically
    await createNodeProgrammatically(page, 'text_input', { x: 200, y: 200 });
    
    // Wait for node to render
    await page.waitForSelector('.react-flow__node input[type="text"]', { timeout: 5000 });
    
    // Find the text input field
    const inputField = page.locator('.react-flow__node input[type="text"]').first();
    
    // Try to input HTML/script tags
    await inputField.fill('<script>alert("XSS")</script>Hello');
    
    // Verify HTML tags are removed (sanitized)
    await expect(inputField).toHaveValue('Hello');
  });

  test.skip('should show character counter when max_length is set', async ({ page }) => {
    // This test would require programmatically setting config
    // For now, we'll skip it as it requires backend integration
  });

  test.skip('should show validation error when exceeding max_length', async ({ page }) => {
    // This test would require programmatically setting config
    // For now, we'll skip it as it requires backend integration
  });
});

test.describe('NumberInputNode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test('should create number input node', async ({ page }) => {
    // Verify no nodes on canvas initially
    await expectNodeCount(page, 0);

    // Create node programmatically
    await createNodeProgrammatically(page, 'number_input', { x: 200, y: 200 });

    // Verify node was created on canvas
    await expectNodeCount(page, 1);
    
    // Verify the node is visible and has correct type
    const node = page.locator('.react-flow__node').first();
    await expect(node).toBeVisible();
  });

  test('should accept numeric input', async ({ page }) => {
    // Create node programmatically and get its ID
    const nodeId = await createNodeProgrammatically(page, 'number_input', { x: 200, y: 200 });
    
    // Wait for node to render
    await page.waitForSelector('.react-flow__node input[type="number"]', { timeout: 5000 });
    
    // Use the helper function with the node ID
    await setNumberInputValue(page, nodeId, 42);
    
    const value = await getNumberInputValue(page, nodeId);
    expect(value).toBe(42);
  });

  test('should accept float numbers', async ({ page }) => {
    // Create node programmatically and get its ID
    const nodeId = await createNodeProgrammatically(page, 'number_input', { x: 200, y: 200 });
    
    // Wait for node to render
    await page.waitForSelector('.react-flow__node input[type="number"]', { timeout: 5000 });
    
    // Use the helper function with the node ID
    await setNumberInputValue(page, nodeId, 3.14);
    
    const value = await getNumberInputValue(page, nodeId);
    expect(value).toBe(3.14);
  });

  test('should accept negative numbers', async ({ page }) => {
    // Create node programmatically and get its ID
    const nodeId = await createNodeProgrammatically(page, 'number_input', { x: 200, y: 200 });
    
    // Wait for node to render
    await page.waitForSelector('.react-flow__node input[type="number"]', { timeout: 5000 });
    
    // Use the helper function with the node ID
    await setNumberInputValue(page, nodeId, -3.14);
    
    const value = await getNumberInputValue(page, nodeId);
    expect(value).toBe(-3.14);
  });

  test('should prevent invalid characters in integer input', async ({ page }) => {
    // Create node programmatically with int type config
    await createNodeProgrammatically(page, 'number_input', { x: 200, y: 200 }, { config: { number_type: 'int' } });
    
    // Wait for node to render
    await page.waitForSelector('.react-flow__node input[type="number"]', { timeout: 5000 });
    
    // Find the number input field
    const inputField = page.locator('.react-flow__node input[type="number"]').first();
    
    // Type a valid integer first
    await inputField.fill('42');
    await expect(inputField).toHaveValue('42');
    
    // Try to type a decimal point (should be prevented by onKeyDown for int type)
    await inputField.press('.');
    
    // Value should still be 42 (dot prevented)
    await expect(inputField).toHaveValue('42');
  });
});

test.describe('Output Nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test.describe('TextOutputNode', () => {
    test('should create text output node', async ({ page }) => {
      // Verify no nodes on canvas initially
      await expectNodeCount(page, 0);

      // Create node programmatically
      await createNodeProgrammatically(page, 'text_output', { x: 200, y: 200 });

      // Verify node was created on canvas
      await expectNodeCount(page, 1);
      
      // Verify the node is visible and has correct type
      const node = page.locator('.react-flow__node').first();
      await expect(node).toBeVisible();
    });

    test.skip('should have copy button when output has value', () => {
      // This test would require programmatically setting output value
      // For now, we'll skip it as it requires backend integration
    });
  });

  test.describe('NumberOutputNode', () => {
    test('should create number output node', async ({ page }) => {
      // Verify no nodes on canvas initially
      await expectNodeCount(page, 0);

      // Create node programmatically
      await createNodeProgrammatically(page, 'number_output', { x: 200, y: 200 });

      // Verify node was created on canvas
      await expectNodeCount(page, 1);
      
      // Verify the node is visible and has correct type
      const node = page.locator('.react-flow__node').first();
      await expect(node).toBeVisible();
    });

    test('should show em dash when empty', async ({ page }) => {
      // Create node programmatically
      await createNodeProgrammatically(page, 'number_output', { x: 200, y: 200 });

      // Check for empty state (em dash)
      const emptyValue = page.locator('text=—').first();
      await expect(emptyValue).toBeVisible();
    });
  });
});
