import React, { memo, useState, useCallback } from "react";
import { NodeProps } from "reactflow";
import { FileText, Copy, Check } from "lucide-react";

import BaseOutputNode from "../base/BaseOutputNode";

/**
 * TextOutputNode - Displays formatted text output from upstream nodes
 *
 * Configuration:
 * - format (string, optional): Output format ("plain", "json", "pretty")
 * - max_display_length (number, optional): Maximum characters to display
 *
 * Features:
 * - Copy to clipboard functionality
 * - Format-aware display (plain text, JSON with syntax highlighting, pretty print)
 * - Truncation indicator when text exceeds max_display_length
 */
export const TextOutputNode = (props: NodeProps) => {
  const { data } = props;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const textToCopy = String(data.value ?? "");

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  }, [data.value]);

  // Format the display value based on configuration
  const formatValue = useCallback(() => {
    const rawValue = data.value;
    const format = data.config?.format || "plain";
    const maxLength = data.config?.max_display_length;

    if (rawValue === null || rawValue === undefined) {
      return { text: "", isTruncated: false };
    }

    let formattedText: string;

    // Apply formatting
    if (format === "json") {
      try {
        if (typeof rawValue === "object") {
          formattedText = JSON.stringify(rawValue, null, 2);
        } else {
          formattedText = JSON.stringify({ value: rawValue }, null, 2);
        }
      } catch {
        formattedText = String(rawValue);
      }
    } else if (format === "pretty") {
      const valueType = typeof rawValue;
      formattedText = `[${valueType}] ${rawValue}`;
    } else {
      // plain
      formattedText = String(rawValue);
    }

    // Apply truncation if needed
    let isTruncated = false;
    if (maxLength && formattedText.length > maxLength) {
      formattedText = formattedText.substring(0, maxLength) + "...";
      isTruncated = true;
    }

    return { text: formattedText, isTruncated };
  }, [data.value, data.config]);

  const { text: displayValue, isTruncated } = formatValue();
  const format = data.config?.format || "plain";
  const isEmpty = !data.value && data.value !== 0 && data.value !== false;

  return (
    <BaseOutputNode {...props} label="Text Output" symbol={FileText}>
      <div className="flex flex-col gap-2">
        {/* Output display */}
        <div className="relative">
          <pre
            className={`
              text-xs p-2 rounded border
              ${format === "json" ? "font-mono" : ""}
              ${
                isEmpty
                  ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500"
                  : "bg-stone-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
              }
              max-h-32 overflow-auto whitespace-pre-wrap wrap-break-word
            `}
          >
            {isEmpty ? "No output yet" : displayValue}
          </pre>

          {/* Copy button */}
          {!isEmpty && (
            <button
              onClick={handleCopy}
              className="absolute top-1 right-1 p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              title="Copy to clipboard"
              aria-label="Copy output to clipboard"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
              )}
            </button>
          )}
        </div>

        {/* Metadata indicators */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {format !== "plain" && (
            <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {format}
            </span>
          )}
          {isTruncated && (
            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
              truncated
            </span>
          )}
          {!isEmpty && (
            <span className="text-xs">{displayValue.length} chars</span>
          )}
        </div>
      </div>
    </BaseOutputNode>
  );
};

export default memo(TextOutputNode);
