import { Edge, Node, getOutgoers, Connection } from 'reactflow';

export const checkForCycles = (
  target: Node,
  source: Node,
  nodes: Node[],
  edges: Edge[]
): boolean => {
  // 1. Get all nodes that the 'target' node connects TO
  const outgoers = getOutgoers(target, nodes, edges);

  // 2. If one of those outgoers is the 'source' node, we have a cycle
  if (outgoers.some((outgoer) => outgoer.id === source.id)) {
    return true;
  }

  // 3. Otherwise, recursively check the outgoers
  // If any outgoer eventually leads back to 'source', it's a cycle
  return outgoers.some((outgoer) =>
    checkForCycles(outgoer, source, nodes, edges)
  );
};

export const isValidConnection = (
  connection: Connection,
  nodes: Node[],
  edges: Edge[]
): boolean => {
  const { source, target } = connection;

  // 1. Prevent self-connections
  if (source === target) return false;

  // 2. Prevent multiple connections to the same Input Handle
  // Find if there is already an edge where target === connection.target AND targetHandle === connection.targetHandle
  const hasExistingInputConnection = edges.some(
    (edge) =>
      edge.target === target && edge.targetHandle === connection.targetHandle
  );

  if (hasExistingInputConnection) return false;

  // 3. Cycle Detection
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (!sourceNode || !targetNode) return false;

  // Check if connecting source -> target creates a path from target -> source
  if (checkForCycles(targetNode, sourceNode, nodes, edges)) {
    return false;
  }

  return true;
};
