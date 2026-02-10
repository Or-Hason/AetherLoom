import React, { memo, useMemo } from "react";
import { NodeProps } from "reactflow";
import { Hash, Infinity as InfinityIcon, AlertTriangle } from "lucide-react";

import BaseOutputNode from "../base/BaseOutputNode";

/**
 * NumberOutputNode - Displays formatted numeric output from upstream nodes
 *
 * Configuration:
 * - decimal_places (number, optional): Number of decimal places for floats
 * - use_thousands_separator (boolean, optional): Add thousands separators (default: true)
 * - scientific_notation (boolean, optional): Force scientific notation
 * - scientific_threshold (number, optional): Threshold for auto scientific notation (default: 1e6)
 *
 * Features:
 * - Formatted number display with locale-aware separators
 * - Special value indicators (NaN, Infinity, -Infinity)
 * - Configurable decimal precision
 * - Scientific notation support
 */
export const NumberOutputNode = (props: NodeProps) => {
  const { data } = props;

  const formatNumber = useMemo(() => {
    const rawValue = data.value;

    // Handle empty/null values
    if (rawValue === null || rawValue === undefined) {
      return {
        displayValue: "—",
        isSpecial: false,
        specialType: null,
        isEmpty: true,
      };
    }

    // Parse to number if it's a string
    let numericValue: number;
    if (typeof rawValue === "string") {
      numericValue = parseFloat(rawValue);
    } else if (typeof rawValue === "number") {
      numericValue = rawValue;
    } else {
      return {
        displayValue: "Invalid",
        isSpecial: true,
        specialType: "invalid",
        isEmpty: false,
      };
    }

    // Check for special values
    if (Number.isNaN(numericValue)) {
      return {
        displayValue: "NaN",
        isSpecial: true,
        specialType: "nan",
        isEmpty: false,
      };
    }

    if (numericValue === Infinity) {
      return {
        displayValue: "∞",
        isSpecial: true,
        specialType: "infinity",
        isEmpty: false,
      };
    }

    if (numericValue === -Infinity) {
      return {
        displayValue: "-∞",
        isSpecial: true,
        specialType: "-infinity",
        isEmpty: false,
      };
    }

    // Get formatting configuration
    const decimalPlaces = data.config?.decimal_places;
    const useThousandsSep = data.config?.use_thousands_separator ?? true;
    const useScientific = data.config?.scientific_notation ?? false;
    const sciThreshold = data.config?.scientific_threshold ?? 1e6;

    let formattedValue: string;

    // Determine if we should use scientific notation
    const shouldUseScientific =
      useScientific || Math.abs(numericValue) >= sciThreshold;

    if (shouldUseScientific && !Number.isInteger(numericValue)) {
      // Scientific notation
      const precision = decimalPlaces ?? 2;
      formattedValue = numericValue.toExponential(precision);
    } else if (Number.isInteger(numericValue)) {
      // Integer formatting
      if (useThousandsSep) {
        formattedValue = numericValue.toLocaleString("en-US");
      } else {
        formattedValue = numericValue.toString();
      }
    } else {
      // Float formatting
      if (decimalPlaces !== undefined) {
        const fixed = numericValue.toFixed(decimalPlaces);
        if (useThousandsSep) {
          // Format with thousands separator
          const parts = fixed.split(".");
          parts[0] = parseInt(parts[0]).toLocaleString("en-US");
          formattedValue = parts.join(".");
        } else {
          formattedValue = fixed;
        }
      } else {
        if (useThousandsSep) {
          formattedValue = numericValue.toLocaleString("en-US");
        } else {
          formattedValue = numericValue.toString();
        }
      }
    }

    return {
      displayValue: formattedValue,
      isSpecial: false,
      specialType: null,
      isEmpty: false,
      originalValue: numericValue,
      isInteger: Number.isInteger(numericValue),
    };
  }, [data.value, data.config]);

  const {
    displayValue,
    isSpecial,
    specialType,
    isEmpty,
    originalValue,
    isInteger,
  } = formatNumber;

  // Determine icon and styling for special values
  const getSpecialValueStyle = () => {
    if (specialType === "nan" || specialType === "invalid") {
      return {
        icon: AlertTriangle,
        className: "text-amber-600 dark:text-amber-400",
        bgClassName: "bg-amber-50 dark:bg-amber-900/20",
      };
    }
    if (specialType === "infinity" || specialType === "-infinity") {
      return {
        icon: InfinityIcon,
        className: "text-purple-600 dark:text-purple-400",
        bgClassName: "bg-purple-50 dark:bg-purple-900/20",
      };
    }
    return null;
  };

  const specialStyle = getSpecialValueStyle();

  return (
    <BaseOutputNode {...props} label="Number Output" symbol={Hash}>
      <div className="flex flex-col gap-2">
        {/* Number display */}
        <div
          className={`
            text-lg font-mono font-semibold p-2 rounded border text-center
            ${
              isEmpty
                ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500"
                : isSpecial && specialStyle
                  ? `${specialStyle.bgClassName} border-current ${specialStyle.className}`
                  : "bg-stone-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
            }
          `}
        >
          {isEmpty ? "—" : displayValue}
        </div>

        {/* Metadata indicators */}
        {!isEmpty && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Type indicator */}
            {!isSpecial && (
              <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {isInteger ? "integer" : "float"}
              </span>
            )}

            {/* Special value indicator */}
            {isSpecial && specialStyle && (
              <span
                className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${specialStyle.bgClassName} ${specialStyle.className}`}
              >
                <specialStyle.icon className="w-3 h-3" />
                {specialType}
              </span>
            )}

            {/* Original value tooltip for formatted numbers */}
            {!isSpecial && originalValue !== undefined && (
              <span
                className="text-zinc-500 dark:text-zinc-400"
                title={`Original: ${originalValue}`}
              >
                raw: {originalValue}
              </span>
            )}
          </div>
        )}
      </div>
    </BaseOutputNode>
  );
};

export default memo(NumberOutputNode);
