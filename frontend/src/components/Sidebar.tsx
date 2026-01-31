import React from "react";
import { Type, Calculator, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const categories = [
    {
      title: "Inputs",
      items: [{ type: "text_input", label: "Text Input", icon: Type }],
    },
    {
      title: "Logic",
      items: [
        { type: "math_operation", label: "Math Operation", icon: Calculator },
      ],
    },
    {
      title: "Outputs",
      items: [
        { type: "display_result", label: "Display Result", icon: MonitorPlay },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800",
        "flex flex-col h-full font-sans transition-colors",
      )}
    >
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 tracking-tight">
          Aether<span className="text-zinc-500 dark:text-zinc-400">Loom</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Industrial Creative Workflow
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {categories.map((category) => (
          <div key={category.title}>
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 pl-1">
              {category.title}
            </h2>
            <div className="space-y-2">
              {category.items.map((item) => (
                <div
                  key={item.type}
                  onDragStart={(event) => onDragStart(event, item.type)}
                  draggable
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-md cursor-grab active:cursor-grabbing",
                    "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                    "hover:border-zinc-400 dark:hover:border-zinc-600",
                    "shadow-sm hover:shadow-md transition-all duration-200",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 text-zinc-500 dark:text-zinc-400",
                      "group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium text-zinc-700 dark:text-zinc-200",
                      "group-hover:text-zinc-900 dark:group-hover:text-zinc-50",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
          v0.1.0 • Alpha
        </div>
      </div>
    </aside>
  );
}
