"""
Unit tests for the GraphExecutor and topological sort algorithm.
"""

import pytest
from typing import Dict, Any

from app.engine.graph_executor import GraphExecutor, CyclicGraphError
from app.schemas import Node, NodeData, Edge
from app.blocks.base import BaseBlock, BlockResult


class MockInputBlock(BaseBlock):
    """Mock input block that returns a configured value."""

    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        value = self.config.get("value", 0)
        return BlockResult(success=True, value=value)


class MockProcessorBlock(BaseBlock):
    """Mock processor block that sums its inputs."""

    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        if not inputs:
            return BlockResult(
                success=False,
                value=None,
                error="No inputs provided"
            )
        
        try:
            total = sum(inputs.values())
            return BlockResult(success=True, value=total)
        except Exception as e:
            return BlockResult(
                success=False,
                value=None,
                error=str(e)
            )


class TestTopologicalSort:
    """Test cases for topological sort algorithm."""

    def test_simple_linear_graph(self):
        """Test topological sort on a simple linear graph: A -> B -> C."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A")),
            Node(id="B", type="processor", data=NodeData(label="B")),
            Node(id="C", type="output", data=NodeData(label="C")),
        ]
        edges = [
            Edge(id="e1", source="A", target="B"),
            Edge(id="e2", source="B", target="C"),
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        sorted_order = executor.topological_sort()

        # A must come before B, B must come before C
        assert sorted_order.index("A") < sorted_order.index("B")
        assert sorted_order.index("B") < sorted_order.index("C")
        assert len(sorted_order) == 3

    def test_diamond_graph(self):
        """Test topological sort on a diamond graph: A -> B,C -> D."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A")),
            Node(id="B", type="processor", data=NodeData(label="B")),
            Node(id="C", type="processor", data=NodeData(label="C")),
            Node(id="D", type="output", data=NodeData(label="D")),
        ]
        edges = [
            Edge(id="e1", source="A", target="B"),
            Edge(id="e2", source="A", target="C"),
            Edge(id="e3", source="B", target="D"),
            Edge(id="e4", source="C", target="D"),
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        sorted_order = executor.topological_sort()

        # A must come before B, C, and D
        assert sorted_order.index("A") < sorted_order.index("B")
        assert sorted_order.index("A") < sorted_order.index("C")
        assert sorted_order.index("A") < sorted_order.index("D")
        
        # B and C must come before D
        assert sorted_order.index("B") < sorted_order.index("D")
        assert sorted_order.index("C") < sorted_order.index("D")
        
        assert len(sorted_order) == 4

    def test_multiple_independent_nodes(self):
        """Test topological sort with multiple independent nodes."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A")),
            Node(id="B", type="input", data=NodeData(label="B")),
            Node(id="C", type="input", data=NodeData(label="C")),
        ]
        edges = []  # No edges, all independent

        executor = GraphExecutor(nodes=nodes, edges=edges)
        sorted_order = executor.topological_sort()

        # All nodes should be present
        assert set(sorted_order) == {"A", "B", "C"}
        assert len(sorted_order) == 3

    def test_complex_graph(self):
        """Test topological sort on a more complex graph."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A")),
            Node(id="B", type="input", data=NodeData(label="B")),
            Node(id="C", type="processor", data=NodeData(label="C")),
            Node(id="D", type="processor", data=NodeData(label="D")),
            Node(id="E", type="processor", data=NodeData(label="E")),
            Node(id="F", type="output", data=NodeData(label="F")),
        ]
        edges = [
            Edge(id="e1", source="A", target="C"),
            Edge(id="e2", source="B", target="C"),
            Edge(id="e3", source="B", target="D"),
            Edge(id="e4", source="C", target="E"),
            Edge(id="e5", source="D", target="E"),
            Edge(id="e6", source="E", target="F"),
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        sorted_order = executor.topological_sort()

        # Verify dependencies
        assert sorted_order.index("A") < sorted_order.index("C")
        assert sorted_order.index("B") < sorted_order.index("C")
        assert sorted_order.index("B") < sorted_order.index("D")
        assert sorted_order.index("C") < sorted_order.index("E")
        assert sorted_order.index("D") < sorted_order.index("E")
        assert sorted_order.index("E") < sorted_order.index("F")
        
        assert len(sorted_order) == 6


class TestCycleDetection:
    """Test cases for cycle detection in graphs."""

    def test_simple_cycle(self):
        """Test detection of a simple cycle: A -> B -> A."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A")),
            Node(id="B", type="processor", data=NodeData(label="B")),
        ]
        edges = [
            Edge(id="e1", source="A", target="B"),
            Edge(id="e2", source="B", target="A"),  # Creates cycle
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        
        with pytest.raises(CyclicGraphError) as exc_info:
            executor.topological_sort()
        
        assert "cycle" in str(exc_info.value).lower()

    def test_self_loop(self):
        """Test detection of a self-loop: A -> A."""
        nodes = [
            Node(id="A", type="processor", data=NodeData(label="A")),
        ]
        edges = [
            Edge(id="e1", source="A", target="A"),  # Self-loop
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        
        with pytest.raises(CyclicGraphError):
            executor.topological_sort()

    def test_complex_cycle(self):
        """Test detection of a cycle in a larger graph: A -> B -> C -> D -> B."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A")),
            Node(id="B", type="processor", data=NodeData(label="B")),
            Node(id="C", type="processor", data=NodeData(label="C")),
            Node(id="D", type="processor", data=NodeData(label="D")),
        ]
        edges = [
            Edge(id="e1", source="A", target="B"),
            Edge(id="e2", source="B", target="C"),
            Edge(id="e3", source="C", target="D"),
            Edge(id="e4", source="D", target="B"),  # Creates cycle B->C->D->B
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        
        with pytest.raises(CyclicGraphError):
            executor.topological_sort()


class TestGraphExecutorInputs:
    """Test cases for input retrieval in GraphExecutor."""

    def test_get_node_inputs_no_edges(self):
        """Test getting inputs for a node with no incoming edges."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A", value=10)),
        ]
        edges = []

        executor = GraphExecutor(nodes=nodes, edges=edges)
        inputs = executor._get_node_inputs("A")

        assert inputs == {}

    def test_get_node_inputs_single_source(self):
        """Test getting inputs for a node with one incoming edge."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A")),
            Node(id="B", type="processor", data=NodeData(label="B")),
        ]
        edges = [
            Edge(id="e1", source="A", target="B", targetHandle="input1"),
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        
        # Simulate A has been executed
        executor.results["A"] = BlockResult(success=True, value=42)
        
        inputs = executor._get_node_inputs("B")

        assert "input1" in inputs
        assert inputs["input1"] == 42

    def test_get_node_inputs_multiple_sources(self):
        """Test getting inputs for a node with multiple incoming edges."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A")),
            Node(id="B", type="input", data=NodeData(label="B")),
            Node(id="C", type="processor", data=NodeData(label="C")),
        ]
        edges = [
            Edge(id="e1", source="A", target="C", targetHandle="input1"),
            Edge(id="e2", source="B", target="C", targetHandle="input2"),
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        
        # Simulate A and B have been executed
        executor.results["A"] = BlockResult(success=True, value=10)
        executor.results["B"] = BlockResult(success=True, value=20)
        
        inputs = executor._get_node_inputs("C")

        assert "input1" in inputs
        assert "input2" in inputs
        assert inputs["input1"] == 10
        assert inputs["input2"] == 20

    def test_get_node_inputs_failed_upstream(self):
        """Test getting inputs when an upstream node failed."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A")),
            Node(id="B", type="processor", data=NodeData(label="B")),
        ]
        edges = [
            Edge(id="e1", source="A", target="B", targetHandle="input1"),
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        
        # Simulate A failed
        executor.results["A"] = BlockResult(
            success=False,
            value=None,
            error="Execution failed"
        )
        
        inputs = executor._get_node_inputs("B")

        # Failed upstream should result in None value
        assert "input1" in inputs
        assert inputs["input1"] is None


class TestGraphExecutorExecution:
    """Test cases for graph execution."""

    def test_execute_raises_not_implemented(self):
        """Test that execute raises NotImplementedError for unimplemented block types."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A", value=10)),
        ]
        edges = []

        executor = GraphExecutor(nodes=nodes, edges=edges)
        
        # Should not raise during execution, but should log warning
        # and create error results for unimplemented blocks
        results = executor.execute()
        
        assert "A" in results
        assert results["A"]["success"] is False
        assert "not yet implemented" in results["A"]["error"].lower()

    def test_execute_cyclic_graph_raises_error(self):
        """Test that execute raises CyclicGraphError for cyclic graphs."""
        nodes = [
            Node(id="A", type="processor", data=NodeData(label="A")),
            Node(id="B", type="processor", data=NodeData(label="B")),
        ]
        edges = [
            Edge(id="e1", source="A", target="B"),
            Edge(id="e2", source="B", target="A"),
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        
        with pytest.raises(CyclicGraphError):
            executor.execute()

    def test_execute_returns_dict(self):
        """Test that execute returns a dictionary of results."""
        nodes = [
            Node(id="A", type="input", data=NodeData(label="A")),
        ]
        edges = []

        executor = GraphExecutor(nodes=nodes, edges=edges)
        results = executor.execute()

        assert isinstance(results, dict)
        assert "A" in results
        assert isinstance(results["A"], dict)
        assert "success" in results["A"]
        assert "value" in results["A"]
