"""
Unit tests for MathOperationBlock.

Tests cover all four arithmetic operations, type preservation semantics,
edge cases (division by zero, non-numeric inputs, missing inputs, large numbers),
and registry integration through the GraphExecutor dispatcher.
"""

import pytest
from typing import Dict, Any

from app.blocks.logic.math_blocks import MathOperationBlock
from app.blocks.base import BlockResult


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_block(operation: str) -> MathOperationBlock:
    """Create a MathOperationBlock pre-configured with a given operation."""
    return MathOperationBlock(
        node_id=f"math-test-{operation}",
        config={"operation": operation},
    )


def _run(operation: str, a: Any, b: Any) -> BlockResult:
    """Convenience: create block, run with inputs a and b, return BlockResult."""
    block = _make_block(operation)
    return block.run({"a": a, "b": b})


# ---------------------------------------------------------------------------
# Addition
# ---------------------------------------------------------------------------

class TestAddOperation:
    """Tests for the 'add' operation."""

    def test_add_integers(self):
        """3 + 4 should return 7 as int."""
        result = _run("add", 3, 4)
        assert result.success is True
        assert result.value == 7
        assert isinstance(result.value, int)

    def test_add_floats(self):
        """1.5 + 2.5 should return 4.0 as float."""
        result = _run("add", 1.5, 2.5)
        assert result.success is True
        assert result.value == 4.0
        assert isinstance(result.value, float)

    def test_add_int_and_float(self):
        """int + float should return float."""
        result = _run("add", 2, 3.5)
        assert result.success is True
        assert result.value == 5.5
        assert isinstance(result.value, float)

    def test_add_negative_numbers(self):
        """-5 + 3 should return -2."""
        result = _run("add", -5, 3)
        assert result.success is True
        assert result.value == -2

    def test_add_zeros(self):
        """0 + 0 should return 0."""
        result = _run("add", 0, 0)
        assert result.success is True
        assert result.value == 0


# ---------------------------------------------------------------------------
# Subtraction
# ---------------------------------------------------------------------------

class TestSubtractOperation:
    """Tests for the 'subtract' operation."""

    def test_subtract_integers(self):
        """10 - 3 should return 7 as int."""
        result = _run("subtract", 10, 3)
        assert result.success is True
        assert result.value == 7
        assert isinstance(result.value, int)

    def test_subtract_floats(self):
        """5.5 - 2.5 = 3.0 as float."""
        result = _run("subtract", 5.5, 2.5)
        assert result.success is True
        assert result.value == 3.0
        assert isinstance(result.value, float)

    def test_subtract_negative_result(self):
        """3 - 10 should return -7."""
        result = _run("subtract", 3, 10)
        assert result.success is True
        assert result.value == -7


# ---------------------------------------------------------------------------
# Multiplication
# ---------------------------------------------------------------------------

class TestMultiplyOperation:
    """Tests for the 'multiply' operation."""

    def test_multiply_integers(self):
        """6 × 7 should return 42 as int."""
        result = _run("multiply", 6, 7)
        assert result.success is True
        assert result.value == 42
        assert isinstance(result.value, int)

    def test_multiply_floats(self):
        """2.5 × 4.0 should return 10.0 as float."""
        result = _run("multiply", 2.5, 4.0)
        assert result.success is True
        assert result.value == 10.0
        assert isinstance(result.value, float)

    def test_multiply_by_zero(self):
        """Any number × 0 should return 0 (not an error)."""
        result = _run("multiply", 99, 0)
        assert result.success is True
        assert result.value == 0

    def test_multiply_negative(self):
        """-3 × 4 should return -12."""
        result = _run("multiply", -3, 4)
        assert result.success is True
        assert result.value == -12


# ---------------------------------------------------------------------------
# Division
# ---------------------------------------------------------------------------

class TestDivideOperation:
    """Tests for the 'divide' operation."""

    def test_divide_exact(self):
        """10 ÷ 2 should return 5 as int (type-preserved)."""
        result = _run("divide", 10, 2)
        assert result.success is True
        assert result.value == 5
        assert isinstance(result.value, int)

    def test_divide_float_result(self):
        """7 ÷ 2 should return 3.5 as float."""
        result = _run("divide", 7, 2)
        assert result.success is True
        assert result.value == 3.5
        assert isinstance(result.value, float)

    def test_divide_float_inputs(self):
        """9.0 ÷ 3.0 should return float (inputs are float, no type-preservation)."""
        result = _run("divide", 9.0, 3.0)
        assert result.success is True
        assert result.value == 3.0
        assert isinstance(result.value, float)

    def test_divide_by_negative(self):
        """10 ÷ -2 should return -5."""
        result = _run("divide", 10, -2)
        assert result.success is True
        assert result.value == -5

    def test_divide_by_zero_integer(self):
        """Division by integer zero should fail with ZeroDivisionError message."""
        result = _run("divide", 7, 0)
        assert result.success is False
        assert result.value is None
        assert "zero" in result.error.lower()

    def test_divide_by_zero_float(self):
        """Division by float zero should fail with ZeroDivisionError message."""
        result = _run("divide", 7.0, 0.0)
        assert result.success is False
        assert result.value is None
        assert "zero" in result.error.lower()

    def test_divide_float_exact_result_not_promoted_to_int(self):
        """9.0 ÷ 3.0 = 3.0 — even if result is whole, inputs are float so stays float."""
        result = _run("divide", 9.0, 3.0)
        assert result.success is True
        # result is 3.0 (float); type-preservation only promotes int→int when both inputs are int
        assert isinstance(result.value, float)


# ---------------------------------------------------------------------------
# Type Preservation
# ---------------------------------------------------------------------------

class TestTypePreservation:
    """Tests specifically targeting int-preservation semantics."""

    def test_int_add_preserves_int(self):
        """int + int with whole result → int."""
        result = _run("add", 5, 3)
        assert isinstance(result.value, int)

    def test_float_add_stays_float(self):
        """float + float → float, even if numerically whole."""
        result = _run("add", 1.0, 2.0)
        assert isinstance(result.value, float)

    def test_int_divide_exact_preserves_int(self):
        """int ÷ int with exact result → int."""
        result = _run("divide", 12, 4)
        assert result.value == 3
        assert isinstance(result.value, int)

    def test_int_divide_non_exact_returns_float(self):
        """int ÷ int with fractional result → float."""
        result = _run("divide", 1, 3)
        assert isinstance(result.value, float)


# ---------------------------------------------------------------------------
# Error Handling
# ---------------------------------------------------------------------------

class TestErrorHandling:
    """Tests for input validation and typed error cases."""

    def test_non_numeric_input_a(self):
        """String input for 'a' should fail with TypeError info."""
        result = _run("add", "hello", 2)
        assert result.success is False
        assert result.value is None
        assert result.error is not None
        assert "type" in result.error.lower() or "numeric" in result.error.lower()

    def test_non_numeric_input_b(self):
        """String input for 'b' should fail with TypeError info."""
        result = _run("multiply", 5, "world")
        assert result.success is False
        assert result.value is None

    def test_missing_input_a(self):
        """Missing 'a' key should fail with KeyError info."""
        block = _make_block("add")
        result = block.run({"b": 5})
        assert result.success is False
        assert result.value is None
        assert "'a'" in result.error

    def test_missing_input_b(self):
        """Missing 'b' key should fail with KeyError info."""
        block = _make_block("add")
        result = block.run({"a": 5})
        assert result.success is False
        assert result.value is None
        assert "'b'" in result.error

    def test_missing_all_inputs(self):
        """Empty inputs dict should fail with a KeyError for 'a'."""
        block = _make_block("subtract")
        result = block.run({})
        assert result.success is False
        assert result.value is None

    def test_none_input_a(self):
        """None value for 'a' should fail with TypeError info."""
        result = _run("add", None, 2)
        assert result.success is False

    def test_none_input_b(self):
        """None value for 'b' should fail with TypeError info."""
        result = _run("add", 2, None)
        assert result.success is False

    def test_unknown_operation(self):
        """An unrecognised operation string should fail gracefully."""
        block = MathOperationBlock(
            node_id="math-bad-op",
            config={"operation": "power"},
        )
        result = block.run({"a": 2, "b": 3})
        assert result.success is False
        assert result.value is None
        assert "power" in result.error.lower() or "unknown" in result.error.lower()

    def test_no_operation_in_config_defaults_to_add(self):
        """Missing operation key in config should default to 'add'."""
        block = MathOperationBlock(node_id="math-default", config={})
        result = block.run({"a": 3, "b": 4})
        assert result.success is True
        assert result.value == 7


# ---------------------------------------------------------------------------
# Large Numbers
# ---------------------------------------------------------------------------

class TestLargeNumbers:
    """Edge-case tests with very large or precise numbers."""

    def test_large_integer_add(self):
        """Python integers are arbitrary-precision — no overflow."""
        big = 10 ** 18
        result = _run("add", big, big)
        assert result.success is True
        assert result.value == 2 * 10 ** 18

    def test_large_float_multiplication(self):
        """Float multiplication with large numbers stays within float range."""
        result = _run("multiply", 1.23e10, 4.56e10)
        assert result.success is True
        assert isinstance(result.value, float)

    def test_small_float_division(self):
        """Very small float division does not error."""
        result = _run("divide", 1.0, 1e-15)
        assert result.success is True
        assert isinstance(result.value, float)


# ---------------------------------------------------------------------------
# Block Result Metadata
# ---------------------------------------------------------------------------

class TestBlockResultMetadata:
    """Verify BlockResult metadata is populated correctly on success."""

    def test_successful_result_has_metadata(self):
        """Successful run should include operation and result_type in metadata."""
        result = _run("multiply", 3, 7)
        assert result.success is True
        assert result.metadata is not None
        assert result.metadata["operation"] == "multiply"
        assert result.metadata["result_type"] == "int"

    def test_float_result_metadata(self):
        """Float result should report 'float' in metadata."""
        result = _run("divide", 7, 2)
        assert result.success is True
        assert result.metadata["result_type"] == "float"


# ---------------------------------------------------------------------------
# Registry Integration (via GraphExecutor)
# ---------------------------------------------------------------------------

class TestRegistryIntegration:
    """Verify MathOperationBlock is reachable through the GraphExecutor dispatcher."""

    def test_math_operation_dispatched_by_executor(self):
        """GraphExecutor._instantiate_block should resolve 'math_operation' without error."""
        from app.engine.graph_executor import GraphExecutor
        from app.schemas import Node, NodeData, Edge

        nodes = [
            Node(
                id="num-a",
                type="number_input",
                data=NodeData(label="A", config={"value": 6}),
            ),
            Node(
                id="num-b",
                type="number_input",
                data=NodeData(label="B", config={"value": 7}),
            ),
            Node(
                id="math1",
                type="math_operation",
                data=NodeData(label="Multiply", config={"operation": "multiply"}),
            ),
        ]
        edges = [
            Edge(id="e1", source="num-a", target="math1", targetHandle="a"),
            Edge(id="e2", source="num-b", target="math1", targetHandle="b"),
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        results = executor.execute()

        # All three nodes should be present
        assert "num-a" in results
        assert "num-b" in results
        assert "math1" in results

        # Number input nodes should succeed
        assert results["num-a"]["success"] is True
        assert results["num-b"]["success"] is True

        # Math operation should succeed: 6 × 7 = 42
        assert results["math1"]["success"] is True
        assert results["math1"]["value"] == 42
