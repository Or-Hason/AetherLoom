"use client";

import React, { useRef, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  BackgroundVariant,
  ReactFlowInstance,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import useFlowStore from "@/store/useFlowStore";
import Sidebar from "@/components/Sidebar";
import InputNode from "@/components/nodes/InputNode";
import LogicNode from "@/components/nodes/LogicNode";
import OutputNode from "@/components/nodes/OutputNode";
import { isValidConnection } from "@/utils/flowValidation";

export default function Home() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useFlowStore();

  const nodeTypes = useMemo(
    () => ({
      text_input: InputNode,
      math_operation: LogicNode,
      display_result: OutputNode,
    }),
    [],
  );

  /*
    The following implementation includes full Drag and Drop logic
    to support the Sidebar integration.
  */
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    React.useState<ReactFlowInstance | null>(null);

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type || !reactFlowInstance) {
        return;
      }

      // Center the node. Assumes node is roughly 150x80.
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - 75,
        y: event.clientY - 40,
      });

      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position,
        data: { label: `${type} node`, status: "idle" },
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode],
  );

  return (
    <div className="flex h-screen w-screen bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          isValidConnection={(connection) =>
            isValidConnection(connection, nodes, edges)
          }
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="bg-zinc-50 dark:bg-zinc-900"
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm" />
        </ReactFlow>
      </div>
    </div>
  );
}
