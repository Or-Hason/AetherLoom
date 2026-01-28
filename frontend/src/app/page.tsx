"use client";

import React from "react";
import ReactFlow, { Background, Controls, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";
import useFlowStore from "@/store/useFlowStore";

export default function Home() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useFlowStore();

  return (
    <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
