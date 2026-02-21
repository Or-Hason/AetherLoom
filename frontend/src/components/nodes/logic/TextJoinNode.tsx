import React, { memo, useCallback, useState } from "react";
import { NodeProps } from "reactflow";
import { Link } from "lucide-react";
import { cn } from "@/lib/utils";
import useFlowStore from "@/store/useFlowStore";
import BaseLogicNode from "../base/BaseLogicNode";

// ---------------------------------------------------------------------------
// Separator preset definitions
// ---------------------------------------------------------------------------

/** A single separator preset entry. */
interface SeparatorPreset {
  /** Short display label shown on the button. */
  label: string;
  /** The actual separator value stored in config. */
  value: string;
  /** Accessible description for the ARIA label. */
  ariaLabel: string;
  /** data-testid suffix, e.g. "space" → data-testid="text-join-preset-space-{id}" */
  testId: string;
}

const SEPARATOR_PRESETS: SeparatorPreset[] = [
  { label: "Space", value: " ", ariaLabel: "Space separator", testId: "space" },
  {
    label: "Comma",
    value: ", ",
    ariaLabel: "Comma separator",
    testId: "comma",
  },
  {
    label: "Newline",
    value: "\n",
    ariaLabel: "Newline separator",
    testId: "newline",
  },
  { label: "Empty", value: "", ariaLabel: "Empty separator", testId: "empty" },
];

/** Maximum characters shown in the live preview before truncation. */
const PREVIEW_MAX_LENGTH = 28;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable representation of a separator for the live preview.
 * Converts special characters to visible glyphs so the preview is informative.
 */
function formatSeparatorForPreview(separator: string): string {
  if (separator === "\n") return "↵";
  if (separator === "\t") return "→";
  if (separator === "") return "∅";
  return separator;
}

/**
 * Builds the live preview string and truncates it if it exceeds the limit.
 */
function buildPreview(separator: string): string {
  const sep = formatSeparatorForPreview(separator);
  const preview = `A${sep}B`;
  if (preview.length > PREVIEW_MAX_LENGTH) {
    return preview.slice(0, PREVIEW_MAX_LENGTH) + "…";
  }
  return preview;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * TextJoinNode — Concatenates two text inputs with a configurable separator.
 *
 * Features:
 * - Two input handles (A and B) provided by `BaseLogicNode`
 * - One output handle provided by `BaseLogicNode`
 * - Shadcn-styled text input for a custom separator (default: single space)
 * - Four quick-select preset buttons: Space, Comma, Newline, Empty
 * - Live preview showing `"A [separator] B"` with visible special characters
 * - Status LED reflecting execution state (idle / running / success / error)
 * - `Link` icon (lucide-react) as the visual identifier
 *
 * Configuration (stored in `data.config`):
 * - `separator` {string}: The string inserted between the two inputs at runtime
 *
 * Store integration:
 * Calls `updateNodeData` from the Zustand flow store whenever the separator
 * changes, ensuring the value is immediately available to the graph executor.
 *
 * @param props - Standard ReactFlow `NodeProps`
 */
export const TextJoinNode = (props: NodeProps) => {
  const { id, data } = props;
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Derive separator from node config; fall back to a single space.
  const currentSeparator: string =
    typeof data.config?.separator === "string" ? data.config.separator : " ";

  /**
   * Uncontrolled-to-controlled bridge: we keep local state purely for the
   * native input element so its display is immediately responsive, then sync
   * to the Zustand store on every change.
   */
  const [localSeparator, setLocalSeparator] =
    useState<string>(currentSeparator);

  /**
   * Commits a new separator value to local state and the Zustand store atomically.
   */
  const applyValue = useCallback(
    (value: string) => {
      setLocalSeparator(value);
      updateNodeData(id, {
        config: {
          ...data.config,
          separator: value,
        },
      });
    },
    [id, data.config, updateNodeData],
  );

  /** Handles typing in the input field. */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      applyValue(e.target.value);
    },
    [applyValue],
  );

  /** Handles clicking a preset button. */
  const handlePresetClick = useCallback(
    (value: string) => {
      applyValue(value);
    },
    [applyValue],
  );

  const preview = buildPreview(localSeparator);

  return (
    <BaseLogicNode {...props} label="Text Join" symbol={Link}>
      <div className="flex flex-col gap-2">
        {/* ── Separator Input ── */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`text-join-separator-${id}`}
            className="text-xs text-zinc-500 dark:text-zinc-400 font-medium"
          >
            Separator
          </label>
          <input
            id={`text-join-separator-${id}`}
            type="text"
            value={localSeparator}
            onChange={handleInputChange}
            aria-label="Separator character"
            data-testid={`text-join-separator-input-${id}`}
            placeholder='e.g. ", " or "\n"'
            className={cn(
              "nodrag h-8 w-full rounded-md border border-zinc-200 dark:border-zinc-700",
              "bg-white dark:bg-zinc-800 px-2 text-xs text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
              "focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500",
              "transition-colors",
            )}
          />
        </div>

        {/* ── Separator Preset Buttons ── */}
        <div
          role="group"
          aria-label="Separator presets"
          className="grid grid-cols-4 gap-1"
        >
          {SEPARATOR_PRESETS.map((preset) => {
            const isActive = localSeparator === preset.value;
            return (
              <button
                key={preset.testId}
                type="button"
                aria-label={preset.ariaLabel}
                aria-pressed={isActive}
                data-testid={`text-join-preset-${preset.testId}-${id}`}
                onClick={() => handlePresetClick(preset.value)}
                className={cn(
                  "nodrag h-7 rounded text-[10px] font-medium transition-all duration-150",
                  "border focus:outline-none focus:ring-1 focus:ring-zinc-400",
                  isActive
                    ? "bg-zinc-800 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border-zinc-800 dark:border-zinc-100"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* ── Live Preview ── */}
        <div
          data-testid={`text-join-preview-${id}`}
          aria-label="Live joined preview"
          className={cn(
            "flex items-center justify-center px-2 py-1.5 rounded",
            "bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
          )}
        >
          <span
            className="font-mono text-xs text-zinc-700 dark:text-zinc-300 truncate"
            title={preview}
          >
            {preview}
          </span>
        </div>
      </div>
    </BaseLogicNode>
  );
};

export default memo(TextJoinNode);
