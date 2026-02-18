import React, { memo, useCallback } from "react";
import { NodeProps } from "reactflow";
import { Calculator } from "lucide-react";
import useFlowStore from "@/store/useFlowStore";
import BaseLogicNode from "../base/BaseLogicNode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Operation type for math operations
 */
type MathOperation = "add" | "subtract" | "multiply" | "divide";

/**
 * Operation metadata for display and configuration
 */
const OPERATIONS: Record<
  MathOperation,
  { label: string; symbol: string; description: string }
> = {
  add: {
    label: "Addition",
    symbol: "+",
    description: "Add A + B"
  },
  subtract: {
    label: "Subtraction",
    symbol: "-",
    description: "Subtract A - B",
  },
  multiply: {
    label: "Multiplication",
    symbol: "×",
    description: "Multiply A × B",
  },
  divide: {
    label: "Division",
    symbol: "÷",
    description: "Divide A ÷ B"
  },
};

/**
 * MathOperationNode - Performs arithmetic operations on two numeric inputs
 *
 * Features:
 * - Two input handles (A and B) on the left side
 * - One output handle on the right side
 * - Dropdown selector for operation type (add, subtract, multiply, divide)
 * - Visual display of selected operation symbol
 * - Status LED indicating execution state
 *
 * Configuration:
 * - operation (MathOperation): The arithmetic operation to perform
 *   - "add": Addition (A + B)
 *   - "subtract": Subtraction (A - B)
 *   - "multiply": Multiplication (A × B)
 *   - "divide": Division (A ÷ B)
 *
 * @param props - Standard ReactFlow NodeProps
 */
export const MathOperationNode = (props: NodeProps) => {
  const { id, data } = props;
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Get current operation from node data, default to "add"
  const currentOperation: MathOperation =
    data.config?.operation || ("add" as MathOperation);

  /**
   * Handle operation change from dropdown
   */
  const handleOperationChange = useCallback(
    (value: string) => {
      const operation = value as MathOperation;
      updateNodeData(id, {
        config: {
          ...data.config,
          operation,
        },
      });
    },
    [id, data.config, updateNodeData],
  );

  const operationMeta = OPERATIONS[currentOperation];

  return (
    <BaseLogicNode {...props} label="Math Operation" symbol={Calculator}>
      <div className="flex flex-col gap-2">
        {/* Operation Selector */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`operation-select-${id}`}
            className="text-xs text-zinc-500 dark:text-zinc-400 font-medium"
          >
            Operation
          </label>
          <Select
            value={currentOperation}
            onValueChange={handleOperationChange}
          >
            <SelectTrigger
              id={`operation-select-${id}`}
              data-testid={`math-operation-select-${id}`}
              className="nodrag w-full h-8 text-sm"
              aria-label="Select math operation"
            >
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(OPERATIONS) as MathOperation[]).map((op) => (
                <SelectItem
                  key={op}
                  value={op}
                  data-testid={`math-operation-option-${op}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base w-4 text-center">
                      {OPERATIONS[op].symbol}
                    </span>
                    <span>{OPERATIONS[op].label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operation Display */}
        <div className="flex items-center justify-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">A</span>
          <span
            className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100"
            aria-label={`Operation symbol: ${operationMeta.label}`}
          >
            {operationMeta.symbol}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">B</span>
        </div>

        {/* Operation Description */}
        <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
          {operationMeta.description}
        </div>
      </div>
    </BaseLogicNode>
  );
};

export default memo(MathOperationNode);
