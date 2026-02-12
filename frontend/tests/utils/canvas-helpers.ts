/**
 * Canvas helper utilities for Playwright tests
 * Functions for interacting with the React Flow canvas
 */

import { Page } from '@playwright/test';

/**
 * Drag a node from the sidebar to the canvas
 * @param page - Playwright page object
 * @param nodeType - Type of node to drag (e.g., 'text_input', 'number_input')
 * @param position - Target position on canvas {x, y}
 */
export async function dragNodeFromSidebar(
  page: Page,
  nodeType: string,
  position: { x: number; y: number }
): Promise<void> {
  // Locate the node item in the sidebar
  const nodeItem = page.locator(`[data-node-type="${nodeType}"]`);
  
  // Locate the canvas
  const canvas = page.locator('.react-flow');
  
  // Perform drag and drop
  await nodeItem.dragTo(canvas, { targetPosition: position });
  
  // Wait for the node to appear on canvas
  await page.waitForSelector(`[data-id*="${nodeType}"]`, { timeout: 5000 });
}

/**
 * Connect two nodes by dragging from source handle to target handle
 * @param page - Playwright page object
 * @param sourceNodeId - ID of the source node
 * @param targetNodeId - ID of the target node
 * @param sourceHandle - Handle ID on source node (default: 'output')
 * @param targetHandle - Handle ID on target node (default: 'input')
 */
export async function connectNodes(
  page: Page,
  sourceNodeId: string,
  targetNodeId: string,
  sourceHandle = 'output',
  targetHandle = 'input'
): Promise<void> {
  // Locate the source handle
  const sourceHandleEl = page.locator(
    `[data-nodeid="${sourceNodeId}"] [data-handleid="${sourceHandle}"]`
  );
  
  // Locate the target handle
  const targetHandleEl = page.locator(
    `[data-nodeid="${targetNodeId}"] [data-handleid="${targetHandle}"]`
  );
  
  // Drag from source to target
  await sourceHandleEl.dragTo(targetHandleEl);
  
  // Wait for edge to appear
  await page.waitForSelector('.react-flow__edge', { timeout: 5000 });
}

/**
 * Load a flow fixture into the canvas
 * @param page - Playwright page object
 * @param flow - Flow object with nodes and edges
 */
export async function loadFlowFixture(page: Page, flow: any): Promise<void> {
  // Store the flow in localStorage or inject it into the store
  await page.evaluate((flowData) => {
    // Store in localStorage for the app to load
    window.localStorage.setItem('aetherloom-flow', JSON.stringify(flowData));
    
    // If the store is exposed, we can also directly set it
    if ((window as any).__flowStore) {
      const store = (window as any).__flowStore;
      store.setState({
        nodes: flowData.nodes,
        edges: flowData.edges,
      });
    }
  }, flow);
  
  // Reload the page to apply the flow
  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Pan the canvas by dragging
 * @param page - Playwright page object
 * @param deltaX - Horizontal distance to pan
 * @param deltaY - Vertical distance to pan
 */
export async function panCanvas(
  page: Page,
  deltaX: number,
  deltaY: number
): Promise<void> {
  const canvas = page.locator('.react-flow');
  const box = await canvas.boundingBox();
  
  if (!box) {
    throw new Error('Canvas not found');
  }
  
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + deltaX, startY + deltaY);
  await page.mouse.up();
}

/**
 * Zoom the canvas using mouse wheel
 * @param page - Playwright page object
 * @param delta - Zoom delta (negative to zoom in, positive to zoom out)
 */
export async function zoomCanvas(page: Page, delta: number): Promise<void> {
  const canvas = page.locator('.react-flow');
  await canvas.hover();
  await page.mouse.wheel(0, delta);
  
  // Wait for zoom animation to complete
  await page.waitForTimeout(300);
}

/**
 * Click on a node to select it
 * @param page - Playwright page object
 * @param nodeId - ID of the node to select
 */
export async function selectNode(page: Page, nodeId: string): Promise<void> {
  const node = page.locator(`[data-id="${nodeId}"]`);
  await node.click();
  
  // Wait for selection to be applied
  await page.waitForTimeout(100);
}

/**
 * Delete a node by ID
 * @param page - Playwright page object
 * @param nodeId - ID of the node to delete
 */
export async function deleteNode(page: Page, nodeId: string): Promise<void> {
  await selectNode(page, nodeId);
  // TODO: Check if it shouldn't be 'Backspace' instead
  await page.keyboard.press('Delete');
  
  // Wait for deletion to complete
  await page.waitForTimeout(300);
}

/**
 * Get the position of a node
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 */
export async function getNodePosition(
  page: Page,
  nodeId: string
): Promise<{ x: number; y: number } | null> {
  return await page.evaluate((id) => {
    const store = (window as any).__flowStore;
    if (!store) return null;
    
    const nodes = store.getState().nodes;
    const node = nodes.find((n: any) => n.id === id);
    return node ? node.position : null;
  }, nodeId);
}

/**
 * Update node data
 * @param page - Playwright page object
 * @param nodeId - ID of the node
 * @param data - New data object
 */
export async function updateNodeData(
  page: Page,
  nodeId: string,
  data: any
): Promise<void> {
  await page.evaluate(
    ({ id, newData }) => {
      const store = (window as any).__flowStore;
      if (!store) return;
      
      const nodes = store.getState().nodes;
      const updatedNodes = nodes.map((node: any) =>
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      );
      
      store.setState({ nodes: updatedNodes });
    },
    { id: nodeId, newData: data }
  );
}
