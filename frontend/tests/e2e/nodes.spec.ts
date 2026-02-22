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

test.describe('MathOperationNode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test('should create math operation node', async ({ page }) => {
    // Verify no nodes on canvas initially
    await expectNodeCount(page, 0);

    // Create node programmatically
    const nodeId = await createNodeProgrammatically(page, 'math_operation', { x: 200, y: 200 });

    // Verify node was created on canvas
    await expectNodeCount(page, 1);
    
    // Verify the node is visible
    await expectNodeToExist(page, nodeId);
  });

  test('should render with Calculator icon and MATH OPERATION label', async ({ page }) => {
    // Create node programmatically
    await createNodeProgrammatically(page, 'math_operation', { x: 200, y: 200 });

    // Wait for node to render
    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // Verify label is present (uppercase)
    // TODO: Improve to support multilangual label
    const label = page.locator('text=MATH OPERATION').first();
    await expect(label).toBeVisible();

    // Verify Calculator icon is present (lucide-react renders as svg)
    const icon = page.locator('.react-flow__node svg').first();
    await expect(icon).toBeVisible();
  });

  test('should display status LED in idle state by default', async ({ page }) => {
    // Create node programmatically with default idle status
    await createNodeProgrammatically(page, 'math_operation', { x: 200, y: 200 });

    // Wait for node to render
    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // Find the status LED (should be a colored dot)
    // The BaseLogicNode renders a div with bg-zinc-400 for idle status
    const statusLED = page.locator('.react-flow__node .bg-zinc-400').first();
    await expect(statusLED).toBeVisible();
  });

  test('should render operation selector dropdown', async ({ page }) => {
    // Create node programmatically
    const nodeId = await createNodeProgrammatically(page, 'math_operation', { x: 200, y: 200 });

    // Wait for node to render
    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // Verify the select trigger is present with correct test ID
    const selectTrigger = page.locator(`[data-testid="math-operation-select-${nodeId}"]`);
    await expect(selectTrigger).toBeVisible();

    // Verify label is present
    const label = page.locator('text=Operation').first();
    await expect(label).toBeVisible();
  });

  test('should display default operation (Addition)', async ({ page }) => {
    // Create node programmatically (default operation is "add")
    await createNodeProgrammatically(page, 'math_operation', { x: 200, y: 200 });

    // Wait for node to render
    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // Verify the operation display shows "+" symbol
    const operationSymbol = page.locator('.react-flow__node .font-mono.font-bold', { hasText: '+' }).first();
    await expect(operationSymbol).toBeVisible();

    // Verify the description shows "Add A + B"
    // TODO: Improve to support multilangual text
    const description = page.locator('text=Add A + B').first();
    await expect(description).toBeVisible();
  });

  test('should change operation via Shadcn Select dropdown', async ({ page }) => {
    // Create node programmatically
    const nodeId = await createNodeProgrammatically(page, 'math_operation', { x: 200, y: 200 });

    // Wait for node to render
    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // Click the select trigger to open dropdown
    const selectTrigger = page.locator(`[data-testid="math-operation-select-${nodeId}"]`);
    await selectTrigger.click();

    // Wait for dropdown to appear
    await page.waitForSelector('[role="option"]', { timeout: 5000 });

    // Click on Subtraction option
    // TODO: There is a bug where 2 dropdowns can be open at the same time. Verify this bug is solved or it can be failed as multiple locators will be found
    const subtractionOption = page.locator('[data-testid="math-operation-option-subtract"]');
    await expect(subtractionOption).toBeVisible();
    await subtractionOption.click();

    // Verify the operation display updates to show "-" symbol
    const operationSymbol = page.locator('.react-flow__node .font-mono.font-bold', { hasText: '−' }).or(
      page.locator('.react-flow__node .font-mono.font-bold', { hasText: '-' })
    ).first();
    await expect(operationSymbol).toBeVisible();

    // Verify the description updates to "Subtract A - B"
    const description = page.locator('text=Subtract A - B').first();
    await expect(description).toBeVisible();
  });

  test('should update Zustand store when operation changes', async ({ page }) => {
    // Create node programmatically
    const nodeId = await createNodeProgrammatically(page, 'math_operation', { x: 200, y: 200 });

    // Wait for node to render
    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // Get initial store state
    const initialState = await page.evaluate(() => {
      return (window as any).__ZUSTAND_STORE__;
    });

    // Click the select trigger to open dropdown
    const selectTrigger = page.locator(`[data-testid="math-operation-select-${nodeId}"]`);
    await selectTrigger.click();

    // Wait for dropdown to appear
    await page.waitForSelector('[role="option"]', { timeout: 5000 });

    // Click on Multiplication option
    const multiplyOption = page.locator('[data-testid="math-operation-option-multiply"]');
    await multiplyOption.click();

    // Wait a bit for state to update
    await page.waitForTimeout(500);

    // Verify store was updated by checking the node's config
    const updatedState = await page.evaluate((id) => {
      const store = (window as any).__flowStore?.getState?.();
      const node = store?.nodes?.find((n: any) => n.id === id);
      return node?.data?.config?.operation;
    }, nodeId);

    expect(updatedState).toBe('multiply');
  });

  test('should display all four operation options in dropdown', async ({ page }) => {
    // Create node programmatically
    const nodeId = await createNodeProgrammatically(page, 'math_operation', { x: 200, y: 200 });

    // Wait for node to render
    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // Click the select trigger to open dropdown
    const selectTrigger = page.locator(`[data-testid="math-operation-select-${nodeId}"]`);
    await selectTrigger.click();

    // Wait for dropdown to appear
    await page.waitForSelector('[role="option"]', { timeout: 5000 });

    // Verify all four operations are present
    const addOption = page.locator('[data-testid="math-operation-option-add"]');
    const subtractOption = page.locator('[data-testid="math-operation-option-subtract"]');
    const multiplyOption = page.locator('[data-testid="math-operation-option-multiply"]');
    const divideOption = page.locator('[data-testid="math-operation-option-divide"]');

    await expect(addOption).toBeVisible();
    await expect(subtractOption).toBeVisible();
    await expect(multiplyOption).toBeVisible();
    await expect(divideOption).toBeVisible();

    // Verify operation labels are displayed in options (using data-testid to be specific)
    // TODO: Improve to support multilangual text
    await expect(addOption.locator('text=Addition')).toBeVisible();
    await expect(subtractOption.locator('text=Subtraction')).toBeVisible();
    await expect(multiplyOption.locator('text=Multiplication')).toBeVisible();
    await expect(divideOption.locator('text=Division')).toBeVisible();
  });

  test('should have two input handles and one output handle', async ({ page }) => {
    // Create node programmatically
    const nodeId = await createNodeProgrammatically(page, 'math_operation', { x: 200, y: 200 });

    // Wait for node to render
    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // Find the node element
    const node = page.locator(`[data-id="${nodeId}"]`);

    // Verify two target handles (inputs) exist
    const targetHandles = node.locator('.react-flow__handle-left');
    await expect(targetHandles).toHaveCount(2);

    // Verify one source handle (output) exists
    const sourceHandles = node.locator('.react-flow__handle-right');
    await expect(sourceHandles).toHaveCount(1);
  });

  test('should display operation symbols correctly for all operations', async ({ page }) => {
    const operations = [
      { value: 'add', symbol: '+', description: 'Add A + B' },
      { value: 'subtract', symbol: '-', description: 'Subtract A - B' },
      { value: 'multiply', symbol: '×', description: 'Multiply A × B' },
      { value: 'divide', symbol: '÷', description: 'Divide A ÷ B' }
    ];

    for (const op of operations) {
      // Create node with specific operation
      const nodeId = await createNodeProgrammatically(
        page, 
        'math_operation', 
        { x: 200, y: 200 },
        { config: { operation: op.value } }
      );

      // Wait for node to render
      await page.waitForSelector('.react-flow__node', { timeout: 5000 });

      // Verify the operation symbol is displayed
      const operationSymbol = page.locator('.react-flow__node .font-mono.font-bold').first();
      await expect(operationSymbol).toContainText(op.symbol);

      // Verify the description is displayed
      // TODO: Improve to support multilangual text
      const description = page.locator(`text=${op.description}`).first();
      await expect(description).toBeVisible();

      // Clean up - delete the node for next iteration
      await page.evaluate((id) => {
        const store = (window as any).__flowStore?.getState?.();
        store?.setNodes?.(store.nodes.filter((n: any) => n.id !== id));
      }, nodeId);

      await page.waitForTimeout(200);
    }
  });
});

// ==========================================================================
// TextJoinNode
// ==========================================================================

test.describe('TextJoinNode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test('should create text join node', async ({ page }) => {
    await expectNodeCount(page, 0);

    const nodeId = await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await expectNodeCount(page, 1);
    await expectNodeToExist(page, nodeId);
  });

  test('should render with Link icon and TEXT JOIN label', async ({ page }) => {
    await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // Label is uppercased by CSS
    const label = page.locator('text=TEXT JOIN').first();
    await expect(label).toBeVisible();

    // lucide-react renders icons as <svg>
    const icon = page.locator('.react-flow__node svg').first();
    await expect(icon).toBeVisible();
  });

  test('should display status LED in idle state by default', async ({ page }) => {
    await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // BaseLogicNode renders bg-zinc-400 for "idle" status
    const statusLED = page.locator('.react-flow__node .bg-zinc-400').first();
    await expect(statusLED).toBeVisible();
  });

  test('should render separator input with default empty value', async ({ page }) => {
    const nodeId = await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    const input = page.locator(`[data-testid="text-join-separator-input-${nodeId}"]`);
    await expect(input).toBeVisible();

    // Default separator is an empty string
    await expect(input).toHaveValue('');
  });

  test('should change separator via input field', async ({ page }) => {
    const nodeId = await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    const input = page.locator(`[data-testid="text-join-separator-input-${nodeId}"]`);
    await input.fill('|');

    await expect(input).toHaveValue('|');
  });

  test('should update Zustand store when separator changes', async ({ page }) => {
    const nodeId = await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    const input = page.locator(`[data-testid="text-join-separator-input-${nodeId}"]`);
    await input.fill('-');

    // Allow React to flush the state update
    await page.waitForTimeout(300);

    const storedSeparator = await page.evaluate((id) => {
      const store = (window as any).__flowStore?.getState?.();
      const node = store?.nodes?.find((n: any) => n.id === id);
      return node?.data?.config?.separator;
    }, nodeId);

    expect(storedSeparator).toBe('-');
  });

  test('should apply Space preset separator', async ({ page }) => {
    const nodeId = await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    const spaceBtn = page.locator(`[data-testid="text-join-preset-space-${nodeId}"]`);
    await spaceBtn.click();

    await page.waitForTimeout(300);

    const storedSeparator = await page.evaluate((id) => {
      const store = (window as any).__flowStore?.getState?.();
      const node = store?.nodes?.find((n: any) => n.id === id);
      return node?.data?.config?.separator;
    }, nodeId);

    expect(storedSeparator).toBe(' ');
  });

  test('should apply Comma preset separator', async ({ page }) => {
    const nodeId = await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    const commaBtn = page.locator(`[data-testid="text-join-preset-comma-${nodeId}"]`);
    await commaBtn.click();

    await page.waitForTimeout(300);

    const storedSeparator = await page.evaluate((id) => {
      const store = (window as any).__flowStore?.getState?.();
      const node = store?.nodes?.find((n: any) => n.id === id);
      return node?.data?.config?.separator;
    }, nodeId);

    expect(storedSeparator).toBe(', ');
  });

  test('should apply Newline preset separator', async ({ page }) => {
    const nodeId = await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    const newlineBtn = page.locator(`[data-testid="text-join-preset-newline-${nodeId}"]`);
    await newlineBtn.click();

    await page.waitForTimeout(300);

    const storedSeparator = await page.evaluate((id) => {
      const store = (window as any).__flowStore?.getState?.();
      const node = store?.nodes?.find((n: any) => n.id === id);
      return node?.data?.config?.separator;
    }, nodeId);

    expect(storedSeparator).toBe('\\n');
  });

  test('should apply Empty preset separator', async ({ page }) => {
    const nodeId = await createNodeProgrammatically(
      page,
      'text_join',
      { x: 200, y: 200 },
      { config: { separator: ',' } }, // start with comma so Empty is a real change
    );

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    const emptyBtn = page.locator(`[data-testid="text-join-preset-empty-${nodeId}"]`);
    await emptyBtn.click();

    await page.waitForTimeout(300);

    const storedSeparator = await page.evaluate((id) => {
      const store = (window as any).__flowStore?.getState?.();
      const node = store?.nodes?.find((n: any) => n.id === id);
      return node?.data?.config?.separator;
    }, nodeId);

    expect(storedSeparator).toBe('');
  });

  test('should highlight active preset button', async ({ page }) => {
    const nodeId = await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    // Click Comma preset
    const commaBtn = page.locator(`[data-testid="text-join-preset-comma-${nodeId}"]`);
    await commaBtn.click();
    await page.waitForTimeout(200);

    // aria-pressed should be "true" on the active button
    await expect(commaBtn).toHaveAttribute('aria-pressed', 'true');

    // The previously active Space preset should no longer be pressed
    const spaceBtn = page.locator(`[data-testid="text-join-preset-space-${nodeId}"]`);
    await expect(spaceBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('should have two input handles and one output handle', async ({ page }) => {
    const nodeId = await createNodeProgrammatically(page, 'text_join', { x: 200, y: 200 });

    await page.waitForSelector('.react-flow__node', { timeout: 5000 });

    const node = page.locator(`[data-id="${nodeId}"]`);

    // Two left-side target handles (id: "a" at 30%, "b" at 70%)
    const targetHandles = node.locator('.react-flow__handle-left');
    await expect(targetHandles).toHaveCount(2);

    // One right-side source handle
    const sourceHandles = node.locator('.react-flow__handle-right');
    await expect(sourceHandles).toHaveCount(1);
  });
});

