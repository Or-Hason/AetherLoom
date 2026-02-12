/**
 * Test fixtures for node configurations
 * These fixtures provide reusable node configuration objects for E2E tests
 */

/**
 * Text input node configuration
 */
export const textInputNodeConfig = {
  type: 'text_input',
  data: {
    value: 'Test text',
    maxLength: 1000,
  },
};

/**
 * Number input node configuration
 */
export const numberInputNodeConfig = {
  type: 'number_input',
  data: {
    value: 42,
    min: 0,
    max: 100,
  },
};

/**
 * Math operation node configuration (addition)
 */
export const mathAddNodeConfig = {
  type: 'math_operation',
  data: {
    operation: 'add',
  },
};

/**
 * Math operation node configuration (subtraction)
 */
export const mathSubtractNodeConfig = {
  type: 'math_operation',
  data: {
    operation: 'subtract',
  },
};

/**
 * Math operation node configuration (multiplication)
 */
export const mathMultiplyNodeConfig = {
  type: 'math_operation',
  data: {
    operation: 'multiply',
  },
};

/**
 * Math operation node configuration (division)
 */
export const mathDivideNodeConfig = {
  type: 'math_operation',
  data: {
    operation: 'divide',
  },
};

/**
 * Text output node configuration
 */
export const textOutputNodeConfig = {
  type: 'text_output',
  data: {},
};

/**
 * Number output node configuration
 */
export const numberOutputNodeConfig = {
  type: 'number_output',
  data: {},
};

/**
 * Display result node configuration
 */
export const displayResultNodeConfig = {
  type: 'display_result',
  data: {},
};
