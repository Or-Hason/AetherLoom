"""
Graph Execution Engine

Implements topological sorting and execution orchestration for flow graphs.
Uses Kahn's algorithm for dependency resolution and ensures nodes execute
in the correct order based on their dependencies.
"""

import logging
from typing import Dict, List, Any, Set, Deque
from collections import deque, defaultdict

from app.schemas import Node, Edge, FlowExecutionRequest
from app.blocks.base import BaseBlock, BlockResult  # noqa: F401 — BlockResult used in type hints

logger = logging.getLogger(__name__)


class CyclicGraphError(Exception):
    """Raised when a cyclic dependency is detected in the graph."""
    pass


class GraphExecutor:
    """
    Orchestrates the execution of a flow graph by performing topological
    sorting and executing nodes in dependency order.
    """

    def __init__(self, nodes: List[Node], edges: List[Edge]):
        """
        Initialize the graph executor.

        Args:
            nodes: List of nodes in the flow graph
            edges: List of edges defining connections between nodes
        """
        self.nodes = {node.id: node for node in nodes}
        self.edges = edges
        self.results: Dict[str, BlockResult] = {}

    def _build_adjacency_list(self) -> Dict[str, List[str]]:
        """
        Build an adjacency list representing node dependencies.

        Returns:
            Dictionary mapping each node ID to a list of dependent node IDs
        """
        adjacency_list: Dict[str, List[str]] = defaultdict(list)

        # Initialize all nodes in the adjacency list
        for node_id in self.nodes.keys():
            if node_id not in adjacency_list:
                adjacency_list[node_id] = []

        # Build edges: source -> target
        for edge in self.edges:
            adjacency_list[edge.source].append(edge.target)

        return adjacency_list

    def _calculate_in_degrees(self, adjacency_list: Dict[str, List[str]]) -> Dict[str, int]:
        """
        Calculate the in-degree (number of incoming edges) for each node.

        Args:
            adjacency_list: Graph adjacency list

        Returns:
            Dictionary mapping node IDs to their in-degree counts
        """
        in_degrees: Dict[str, int] = {node_id: 0 for node_id in self.nodes.keys()}

        for source, targets in adjacency_list.items():
            for target in targets:
                in_degrees[target] += 1

        return in_degrees

    def topological_sort(self) -> List[str]:
        """
        Perform topological sort using Kahn's algorithm.

        Returns:
            List of node IDs in topologically sorted order

        Raises:
            CyclicGraphError: If the graph contains a cycle
        """
        adjacency_list = self._build_adjacency_list()
        in_degrees = self._calculate_in_degrees(adjacency_list)

        # Queue for nodes with no incoming edges
        queue: Deque[str] = deque()

        # Add all nodes with in-degree 0 to the queue
        for node_id, in_degree in in_degrees.items():
            if in_degree == 0:
                queue.append(node_id)

        sorted_order: List[str] = []

        while queue:
            # Remove a node from the queue
            current_node = queue.popleft()
            sorted_order.append(current_node)

            # Reduce in-degree for all neighbors
            for neighbor in adjacency_list[current_node]:
                in_degrees[neighbor] -= 1

                # If in-degree becomes 0, add to queue
                if in_degrees[neighbor] == 0:
                    queue.append(neighbor)

        # Check if all nodes were processed (no cycle)
        if len(sorted_order) != len(self.nodes):
            logger.error("Cyclic dependency detected in graph")
            raise CyclicGraphError(
                "Graph contains a cycle. Topological sort is not possible."
            )

        logger.debug(f"Topological sort order: {sorted_order}")
        return sorted_order

    def _get_node_inputs(self, node_id: str) -> Dict[str, Any]:
        """
        Retrieve input values for a node from previously executed nodes.

        Args:
            node_id: ID of the node to get inputs for

        Returns:
            Dictionary mapping input handle IDs to their values
        """
        inputs: Dict[str, Any] = {}

        # Find all edges that target this node
        for edge in self.edges:
            if edge.target == node_id:
                source_result = self.results.get(edge.source)
                if source_result and source_result.success:
                    # Use the target handle as the key, or source ID if no handle
                    input_key = edge.targetHandle or edge.source
                    inputs[input_key] = source_result.value
                elif source_result and not source_result.success:
                    # Propagate error from upstream node
                    logger.warning(
                        f"Upstream node {edge.source} failed, propagating error to {node_id}"
                    )
                    inputs[edge.targetHandle or edge.source] = None

        return inputs

    def _instantiate_block(self, node: Node) -> BaseBlock:
        """
        Instantiate the appropriate BaseBlock subclass for a node.

        Args:
            node: The node to instantiate a block for

        Returns:
            Instance of a BaseBlock subclass

        Raises:
            NotImplementedError: If the node type is not yet implemented
        """
        # Import block types from their respective sub-packages
        from app.blocks.io.input_blocks import TextInputBlock, NumberInputBlock
        from app.blocks.io.output_blocks import TextOutputBlock, NumberOutputBlock
        from app.blocks.logic.math_blocks import MathOperationBlock
        from app.blocks.logic.text_blocks import TextJoinBlock

        # Block registry mapping node types to block classes
        BLOCK_REGISTRY = {
            "text_input": TextInputBlock,
            "number_input": NumberInputBlock,
            "text_output": TextOutputBlock,
            "number_output": NumberOutputBlock,
            "math_operation": MathOperationBlock,
            "text_join": TextJoinBlock,
        }
        
        # Get the block class for this node type
        block_class = BLOCK_REGISTRY.get(node.type)
        
        if block_class is None:
            raise NotImplementedError(
                f"Block type '{node.type}' is not yet implemented. "
                f"Available types: {', '.join(BLOCK_REGISTRY.keys())}"
            )
        
        # Instantiate the block with node configuration
        return block_class(
            node_id=node.id,
            config=node.data.config if node.data.config else {}
        )


    def execute(self) -> Dict[str, Any]:
        """
        Execute the flow graph in topologically sorted order.

        Returns:
            Dictionary mapping node IDs to their execution results

        Raises:
            CyclicGraphError: If the graph contains cycles
            Exception: If execution fails
        """
        import time
        start_time = time.time()

        logger.info(f"Starting graph execution with {len(self.nodes)} nodes")

        # Get execution order
        try:
            execution_order = self.topological_sort()
        except CyclicGraphError as e:
            logger.error(f"Graph validation failed: {str(e)}")
            raise

        # Execute nodes in order
        for node_id in execution_order:
            node = self.nodes[node_id]
            logger.info(f"Executing node: {node_id} (type: {node.type})")

            try:
                # Get inputs from previously executed nodes
                inputs = self._get_node_inputs(node_id)

                # Instantiate and execute the block
                # NOTE: This will raise NotImplementedError until block types are implemented
                block = self._instantiate_block(node)
                result = block.run(inputs)

                # Store result for downstream nodes
                self.results[node_id] = result

                if result.success:
                    logger.info(f"Node {node_id} executed successfully")
                else:
                    logger.error(
                        f"Node {node_id} execution failed: {result.error}"
                    )

            except NotImplementedError as e:
                # For MVP, we'll create a placeholder result
                logger.warning(f"Block not implemented for node {node_id}: {str(e)}")
                self.results[node_id] = BlockResult(
                    success=False,
                    value=None,
                    error=str(e)
                )

            except Exception as e:
                logger.error(
                    f"Unexpected error executing node {node_id}: {str(e)}",
                    exc_info=True
                )
                self.results[node_id] = BlockResult(
                    success=False,
                    value=None,
                    error=f"Execution error: {str(e)}"
                )

        execution_time = time.time() - start_time
        logger.info(f"Graph execution completed in {execution_time:.3f} seconds")

        # Convert BlockResult objects to dictionaries for API response
        return {
            node_id: result.model_dump() for node_id, result in self.results.items()
        }
