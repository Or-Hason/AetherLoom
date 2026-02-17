import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

export type FlowState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
};

const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes: Node[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
  addNode: (node: Node) => {
    set({ nodes: get().nodes.concat(node) });
  },
  updateNodeData: (id: string, data: Record<string, unknown>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          // merged data update
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },
}));

// Expose store for testing (only in non-production)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as any).__flowStore = useFlowStore;
}

export default useFlowStore;
