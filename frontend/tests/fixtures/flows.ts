/**
 * Test fixtures for flow definitions
 * These fixtures provide reusable flow configurations for E2E tests
 */

import { Node, Edge } from 'reactflow';

/**
 * Simple text flow: Text input -> Text output
 * Tests basic data flow from input to output node
 */
export const simpleTextFlow = {
  nodes: [
    {
      id: 'text-input-1',
      type: 'text_input',
      position: { x: 100, y: 100 },
      data: { value: 'Hello World' },
    },
    {
      id: 'text-output-1',
      type: 'text_output',
      position: { x: 400, y: 100 },
      data: {},
    },
  ] as Node[],
  edges: [
    {
      id: 'e1',
      source: 'text-input-1',
      target: 'text-output-1',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
  ] as Edge[],
};

/**
 * Math operation flow: Two number inputs -> Math operation -> Number output
 * Tests mathematical computation with multiple inputs
 */
export const mathOperationFlow = {
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
      data: { value: 5 },
    },
    {
      id: 'math-op-1',
      type: 'math_operation',
      position: { x: 300, y: 150 },
      data: { operation: 'add' },
    },
    {
      id: 'num-output-1',
      type: 'number_output',
      position: { x: 500, y: 150 },
      data: {},
    },
  ] as Node[],
  edges: [
    {
      id: 'e1',
      source: 'num-input-1',
      target: 'math-op-1',
      sourceHandle: 'output',
      targetHandle: 'a',
    },
    {
      id: 'e2',
      source: 'num-input-2',
      target: 'math-op-1',
      sourceHandle: 'output',
      targetHandle: 'b',
    },
    {
      id: 'e3',
      source: 'math-op-1',
      target: 'num-output-1',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
  ] as Edge[],
};

/**
 * Complex flow with multiple operations
 * Tests chaining of multiple nodes and operations
 */
export const complexFlow = {
  nodes: [
    {
      id: 'text-input-1',
      type: 'text_input',
      position: { x: 50, y: 100 },
      data: { value: 'Test' },
    },
    {
      id: 'num-input-1',
      type: 'number_input',
      position: { x: 50, y: 200 },
      data: { value: 42 },
    },
    {
      id: 'num-input-2',
      type: 'number_input',
      position: { x: 50, y: 300 },
      data: { value: 8 },
    },
    {
      id: 'math-op-1',
      type: 'math_operation',
      position: { x: 250, y: 250 },
      data: { operation: 'multiply' },
    },
    {
      id: 'text-output-1',
      type: 'text_output',
      position: { x: 450, y: 100 },
      data: {},
    },
    {
      id: 'num-output-1',
      type: 'number_output',
      position: { x: 450, y: 250 },
      data: {},
    },
  ] as Node[],
  edges: [
    {
      id: 'e1',
      source: 'text-input-1',
      target: 'text-output-1',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
    {
      id: 'e2',
      source: 'num-input-1',
      target: 'math-op-1',
      sourceHandle: 'output',
      targetHandle: 'a',
    },
    {
      id: 'e3',
      source: 'num-input-2',
      target: 'math-op-1',
      sourceHandle: 'output',
      targetHandle: 'b',
    },
    {
      id: 'e4',
      source: 'math-op-1',
      target: 'num-output-1',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
  ] as Edge[],
};

/**
 * Empty flow for testing initial state
 */
export const emptyFlow = {
  nodes: [] as Node[],
  edges: [] as Edge[],
};
