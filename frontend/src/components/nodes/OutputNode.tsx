import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";

const OutputNode = ({ data, selected }: NodeProps) => {
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
        className="w-3 h-3 bg-zinc-400 dark:bg-zinc-500 border-2 border-white dark:border-zinc-900"
      />

      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-2 h-2 rounded-full", statusColor)} />
        <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-sm">
          <MonitorPlay className="w-3 h-3 text-zinc-500" />
        </div>
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
          Output
        </span>
      </div>

      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        Displays final result
      </div>
    </div>
  );
};

export default memo(OutputNode);
