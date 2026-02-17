import useFlowStore from "@/store/useFlowStore";
import React, { memo, useState, useCallback } from "react";
import { NodeProps } from "reactflow";
import { Type, AlertCircle } from "lucide-react";

import BaseInputNode from "../base/BaseInputNode";

/**
 * TextInputNode - Provides editable text input with validation
 *
 * Configuration:
 * - value (string): The text value
 * - max_length (number, optional): Maximum allowed text length
 * - multiline (boolean, optional): Enable multiline input (future)
 */
export const TextInputNode = (props: NodeProps) => {
  const { id, data } = props;
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      const maxLength = data.config?.max_length;

      // Sanitize input to prevent XSS attacks
      // Remove HTML tags and script content
      newValue = newValue
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]*>/g, "");

      // Validate max_length constraint
      if (maxLength && newValue.length >= maxLength) {
        setValidationError(
          `Text reached maximum length of ${maxLength} characters`,
        );
        if (newValue.length > maxLength) {
          return;
        }
      } else {
        // Clear validation error and update value
        setValidationError(null);
      }
      updateNodeData(id, { value: newValue });
    },
    [id, data.config?.max_length, updateNodeData],
  );

  const currentLength = (data.value as string)?.length ?? 0;
  const maxLength = data.config?.max_length;

  return (
    <BaseInputNode {...props} label="Text Input" symbol={Type}>
      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={data.value ?? ""}
          onChange={handleChange}
          className="nodrag w-full p-1 text-sm border rounded bg-stone-50 dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          data-testid={`text-input-field-${id}`}
          placeholder="Enter text..."
          aria-label="Text input field"
          aria-invalid={!!validationError}
          aria-describedby={validationError ? `${id}-error` : undefined}
        />

        {/* Character counter */}
        {maxLength && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 text-right">
            {currentLength}/{maxLength}
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

export default memo(TextInputNode);
