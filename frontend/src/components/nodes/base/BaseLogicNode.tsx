import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for BaseLogicNode component
 *
 * @extends NodeProps - Standard ReactFlow node props
 * @property {string} label - Display label for the node
 * @property {LucideIcon} symbol - Icon component to display
 * @property {React.ReactNode} children - Logic configuration UI to render
 */
interface BaseLogicNodeProps extends NodeProps {
  label: string;
  symbol: LucideIcon;
  children?: React.ReactNode;
}

/**
 * BaseLogicNode - Base component for all logic/processing nodes
 *
 * Provides consistent styling and structure for logic nodes with:
 * - Status indicator LED (idle/running/success/error)
 * - Icon and label header
 * - Two input handles on the left (id: "a" at 30%, "b" at 70%)
 * - Single output handle on the right
 * - Customizable logic configuration UI via children
 */
const BaseLogicNode = ({
  data,
  selected,
  label,
  symbol: Icon,
  children,
}: BaseLogicNodeProps) => {
  const statusColor = {
    idle: "bg-zinc-400",
    running: "bg-blue-500",
    success: "bg-emerald-500",
    error: "bg-red-500",
  }[(data.status as string) || "idle"];

  return (
    <div
      className={cn(
        "px-4 py-3 shadow-md rounded-md bg-white dark:bg-zinc-900 border-2 min-w-[150px]",
        selected ? "border-primary" : "border-zinc-200 dark:border-zinc-700",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ top: "30%" }}
        className="w-3 h-3 bg-zinc-400 dark:bg-zinc-500 border-2 border-white dark:border-zinc-900"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{ top: "70%" }}
        className="w-3 h-3 bg-zinc-400 dark:bg-zinc-500 border-2 border-white dark:border-zinc-900"
      />

      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-2 h-2 rounded-full", statusColor)} />
        <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-sm">
          <Icon className="w-3 h-3 text-zinc-500" />
        </div>
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
          {label}
        </span>
      </div>

      <div className="flex flex-col gap-1">{children}</div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-zinc-400 dark:bg-zinc-500 border-2 border-white dark:border-zinc-900"
      />
    </div>
  );
};

export default memo(BaseLogicNode);
