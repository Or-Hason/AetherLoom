import useFlowStore from "@/store/useFlowStore";
import React, { memo, useState, useCallback } from "react";
import { NodeProps } from "reactflow";
import { Hash, AlertCircle } from "lucide-react";

import BaseInputNode from "../base/BaseInputNode";

/**
 * NumberInputNode - Provides numeric input with type validation
 *
 * Configuration:
 * - value (number): The numeric value
 * - number_type (string, optional): "int", "float", or "auto" (default: "auto")
 * - min_value (number, optional): Minimum allowed value
 * - max_value (number, optional): Maximum allowed value
 */
export const NumberInputNode = (props: NodeProps) => {
  const { id, data } = props;
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;

      // Allow empty input
      if (rawValue === "") {
        setValidationError(null);
        updateNodeData(id, { value: null });
        return;
      }

      // Parse based on number_type configuration
      const numberType = data.config?.number_type || "auto";
      let parsedValue: number;

      try {
        if (numberType === "int") {
          // Parse as integer
          parsedValue = parseInt(rawValue, 10);
          if (!Number.isInteger(parsedValue) || isNaN(parsedValue)) {
            setValidationError("Value must be a valid integer");
            return;
          }
        } else if (numberType === "float") {
          // Parse as float
          parsedValue = parseFloat(rawValue);
          if (isNaN(parsedValue)) {
            setValidationError("Value must be a valid number");
            return;
          }
        } else {
          // Auto-detect: use parseFloat for flexibility
          parsedValue = parseFloat(rawValue);
          if (isNaN(parsedValue)) {
            setValidationError("Value must be a valid number");
            return;
          }
        }

        // Validate min/max constraints
        const { min_value, max_value } = data.config || {};

        if (min_value !== undefined && parsedValue < min_value) {
          setValidationError(`Value must be at least ${min_value}`);
          return;
        }

        if (max_value !== undefined && parsedValue > max_value) {
          setValidationError(`Value must be at most ${max_value}`);
          return;
        }

        // All validations passed
        setValidationError(null);
        updateNodeData(id, { value: parsedValue });
      } catch (error) {
        setValidationError("Invalid number format");
        console.error(`NumberInputNode ${id} parsing error:`, error);
      }
    },
    [id, data.config, updateNodeData],
  );

  const { min_value, max_value, number_type } = data.config || {};
  const hasConstraints = min_value !== undefined || max_value !== undefined;

  return (
    <BaseInputNode {...props} label="Number Input" symbol={Hash}>
      <div className="flex flex-col gap-1">
        <input
          type="number"
          value={data.value ?? ""}
          onChange={handleChange}
          step={number_type === "int" ? "1" : "any"}
          min={min_value}
          max={max_value}
          className="nodrag w-full p-1 text-sm border rounded bg-stone-50 dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter number..."
          aria-label="Number input field"
          aria-invalid={!!validationError}
          aria-describedby={validationError ? `${id}-error` : undefined}
        />

        {/* Constraints display */}
        {hasConstraints && !validationError && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {min_value !== undefined && max_value !== undefined
              ? `Range: ${min_value} - ${max_value}`
              : min_value !== undefined
                ? `Min: ${min_value}`
                : `Max: ${max_value}`}
          </div>
        )}

        {/* Type indicator */}
        {number_type && number_type !== "auto" && !validationError && (
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Type: {number_type}
          </div>
        )}

        {/* Validation error display */}
        {validationError && (
          <div
            id={`${id}-error`}
            className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{validationError}</span>
          </div>
        )}
      </div>
    </BaseInputNode>
  );
};

export default memo(NumberInputNode);
