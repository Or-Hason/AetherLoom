"""
Unit tests for TextJoinBlock.

Tests cover:
- Two-string joining with various separators (space, comma, newline, empty)
- Multi-input joining (3+ inputs via extra handles)
- Edge cases: empty list equivalent (missing both inputs), single-item
- Non-string input coercion (int, float, bool)
- None value handling (treated as empty string)
- Custom separator defaults
- Escape-sequence resolution (\\n → real newline, \\t → real tab)
- Error cases: missing required handles, invalid config
- Registry integration via GraphExecutor dispatcher
"""

import pytest
from typing import Dict, Any

from app.blocks.logic.text_blocks import TextJoinBlock
from app.blocks.base import BlockResult
from app.schemas import TextJoinConfig


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_block(separator: str = "", node_id: str = "test-node") -> TextJoinBlock:
    """Create a TextJoinBlock with the given separator config."""
    return TextJoinBlock(node_id=node_id, config={"separator": separator})


def _run(inputs: Dict[str, Any], separator: str = " ") -> BlockResult:
    """Shorthand: create a block and run it with the given inputs."""
    block = _make_block(separator=separator)
    return block.run(inputs)


# ---------------------------------------------------------------------------
# Class: TestTextJoinBasicJoining
# ---------------------------------------------------------------------------

class TestTextJoinBasicJoining:
    """Tests for standard two-string joining with various separators."""

    def test_join_two_strings_space(self):
        """['Hello', 'World'] with ' ' separator → 'Hello World'."""
        result = _run({"a": "Hello", "b": "World"}, separator=" ")
        assert result.success is True
        assert result.value == "Hello World"

    def test_join_two_strings_comma(self):
        """['a', 'b'] with ', ' separator → 'a, b'."""
        result = _run({"a": "a", "b": "b"}, separator=", ")
        assert result.success is True
        assert result.value == "a, b"

    def test_join_empty_separator(self):
        """['foo', 'bar'] with '' separator → 'foobar'."""
        result = _run({"a": "foo", "b": "bar"}, separator="")
        assert result.success is True
        assert result.value == "foobar"

    def test_join_newline_separator_literal(self):
        """['line1', 'line2'] with literal '\\n' config (frontend escape) → 'line1\\nline2'."""
        # The frontend stores "\\n" (backslash + n), not a real newline.
        # TextJoinBlock._resolve_separator() must translate this.
        result = _run({"a": "line1", "b": "line2"}, separator="\\n")
        assert result.success is True
        assert result.value == "line1\nline2"

    def test_join_tab_separator_literal(self):
        """['col1', 'col2'] with literal '\\t' config → 'col1\\tcol2'."""
        result = _run({"a": "col1", "b": "col2"}, separator="\\t")
        assert result.success is True
        assert result.value == "col1\tcol2"

    def test_join_real_newline_separator(self):
        """['a', 'b'] with a real '\\n' char in config still works."""
        result = _run({"a": "a", "b": "b"}, separator="\n")
        assert result.success is True
        assert result.value == "a\nb"

    def test_join_custom_separator(self):
        """['x', 'y'] with ' | ' separator → 'x | y'."""
        result = _run({"a": "x", "b": "y"}, separator=" | ")
        assert result.success is True
        assert result.value == "x | y"

    def test_join_empty_strings(self):
        """[' ', ''] with ' ' separator → '  ' (two chars)."""
        result = _run({"a": " ", "b": ""}, separator=" ")
        assert result.success is True
        assert result.value == "  "


# ---------------------------------------------------------------------------
# Class: TestTextJoinMultipleInputs
# ---------------------------------------------------------------------------

class TestTextJoinMultipleInputs:
    """Tests for joining more than two inputs via extra handles."""

    def test_join_three_strings(self):
        """['a', 'b', 'c'] with ' ' → 'a b c'."""
        result = _run({"a": "a", "b": "b", "c": "c"}, separator=" ")
        assert result.success is True
        assert result.value == "a b c"

    def test_join_four_strings(self):
        """['w', 'x', 'y', 'z'] → 'w-x-y-z'."""
        result = _run({"a": "w", "b": "x", "c": "y", "d": "z"}, separator="-")
        assert result.success is True
        assert result.value == "w-x-y-z"

    def test_extra_handles_in_sorted_order(self):
        """Extra handles 'c', 'b' (already in primary), 'd' are appended in sorted order."""
        result = _run({"a": "1", "b": "2", "d": "4", "c": "3"}, separator=",")
        assert result.success is True
        # Expected: a=1, b=2, c=3, d=4 (extra handles c and d sorted)
        assert result.value == "1,2,3,4"


# ---------------------------------------------------------------------------
# Class: TestTextJoinEdgeCases
# ---------------------------------------------------------------------------

class TestTextJoinEdgeCases:
    """Edge cases: single-item, empty inputs, whitespace."""

    def test_missing_handle_a(self):
        """Missing required handle 'a' → success=False."""
        block = _make_block(separator=" ")
        result = block.run({"b": "only"})
        assert result.success is False
        assert result.error is not None
        assert "a" in result.error

    def test_missing_handle_b(self):
        """Only handle 'a' with no 'b' → KeyError (b required)."""
        block = _make_block(separator=" ")
        result = block.run({"a": "only"})
        assert result.success is False
        assert result.error is not None
        assert "b" in result.error

    def test_empty_inputs_dict(self):
        """Empty {} → missing 'a' required handle."""
        result = _run({}, separator=" ")
        assert result.success is False
        assert result.error is not None
        assert "a" in result.error

    def test_join_both_empty_strings(self):
        """['', ''] with space → ' '."""
        result = _run({"a": "", "b": ""}, separator=" ")
        assert result.success is True
        assert result.value == " "

    def test_join_both_empty_strings_no_separator(self):
        """['', ''] with '' → ''."""
        result = _run({"a": "", "b": ""}, separator="")
        assert result.success is True
        assert result.value == ""


# ---------------------------------------------------------------------------
# Class: TestTextJoinTypeCoercion
# ---------------------------------------------------------------------------

class TestTextJoinTypeCoercion:
    """Non-string input values are coerced to str before joining."""

    def test_non_string_int_coercion(self):
        """[42, 'text'] → '42 text'."""
        result = _run({"a": 42, "b": "text"}, separator=" ")
        assert result.success is True
        assert result.value == "42 text"

    def test_non_string_float_coercion(self):
        """[3.14, 'pi'] → '3.14 pi'."""
        result = _run({"a": 3.14, "b": "pi"}, separator=" ")
        assert result.success is True
        assert result.value == "3.14 pi"

    def test_non_string_bool_coercion(self):
        """[True, False] → 'True-False'."""
        result = _run({"a": True, "b": False}, separator="-")
        assert result.success is True
        assert result.value == "True-False"

    def test_integer_integer_join(self):
        """[10, 20] → '10 20'."""
        result = _run({"a": 10, "b": 20}, separator=" ")
        assert result.success is True
        assert result.value == "10 20"

    def test_mixed_types(self):
        """[1, 'two', 3.0] → '1 two 3.0'."""
        result = _run({"a": 1, "b": "two", "c": 3.0}, separator=" ")
        assert result.success is True
        assert result.value == "1 two 3.0"


# ---------------------------------------------------------------------------
# Class: TestTextJoinNoneHandling
# ---------------------------------------------------------------------------

class TestTextJoinNoneHandling:
    """None inputs are treated as empty string ''."""

    def test_none_first_input(self):
        """[None, 'text'] → ' text' (None → '')."""
        result = _run({"a": None, "b": "text"}, separator=" ")
        assert result.success is True
        assert result.value == " text"

    def test_none_second_input(self):
        """['text', None] → 'text '."""
        result = _run({"a": "text", "b": None}, separator=" ")
        assert result.success is True
        assert result.value == "text "

    def test_both_none(self):
        """[None, None] → ' ' (with space separator)."""
        result = _run({"a": None, "b": None}, separator=" ")
        assert result.success is True
        assert result.value == " "

    def test_none_with_empty_separator(self):
        """[None, 'hello'] → 'hello' (empty separator, None coerced to '')."""
        result = _run({"a": None, "b": "hello"}, separator="")
        assert result.success is True
        assert result.value == "hello"


# ---------------------------------------------------------------------------
# Class: TestTextJoinDefaultSeparator
# ---------------------------------------------------------------------------

class TestTextJoinDefaultSeparator:
    """Tests for the default separator behaviour."""

    def test_default_separator_is_empty_string(self):
        """TextJoinConfig default separator is '' (empty string)."""
        cfg = TextJoinConfig()
        assert cfg.separator == ""

    def test_block_default_config_uses_empty_separator(self):
        """A block instantiated with an empty config dict defaults to '' separator."""
        block = TextJoinBlock(node_id="default-test", config={})
        result = block.run({"a": "Hello", "b": "World"})
        assert result.success is True
        assert result.value == "HelloWorld"


# ---------------------------------------------------------------------------
# Class: TestTextJoinMetadata
# ---------------------------------------------------------------------------

class TestTextJoinMetadata:
    """BlockResult metadata is populated correctly."""

    def test_metadata_input_count(self):
        """Metadata reflects the number of joined parts."""
        result = _run({"a": "x", "b": "y"}, separator="-")
        assert result.success is True
        assert result.metadata is not None
        assert result.metadata["input_count"] == 2

    def test_metadata_output_length(self):
        """Metadata output_length matches the actual result length."""
        result = _run({"a": "Hello", "b": "World"}, separator=" ")
        assert result.success is True
        assert result.metadata is not None
        assert result.metadata["output_length"] == len("Hello World")

    def test_metadata_separator_is_raw_config_value(self):
        """Metadata separator stores the raw '\\n' string, not the resolved newline."""
        result = _run({"a": "a", "b": "b"}, separator="\\n")
        assert result.success is True
        assert result.metadata is not None
        # Should be the literal backslash-n, not a real newline
        assert result.metadata["separator"] == "\\n"

    def test_metadata_three_inputs(self):
        """Three inputs: input_count = 3."""
        result = _run({"a": "1", "b": "2", "c": "3"}, separator=",")
        assert result.success is True
        assert result.metadata is not None
        assert result.metadata["input_count"] == 3


# ---------------------------------------------------------------------------
# Class: TestTextJoinRegistryIntegration
# ---------------------------------------------------------------------------

class TestTextJoinRegistryIntegration:
    """Verify TextJoinBlock is dispatched correctly via GraphExecutor."""

    def test_text_join_in_block_registry(self):
        """'text_join' is registered in the block registry and can be instantiated."""
        from app.schemas import Node, NodeData, Edge
        from app.engine.graph_executor import GraphExecutor

        nodes = [
            Node(
                id="input-a",
                type="text_input",
                data=NodeData(label="A", config={"value": "Hello"}),
            ),
            Node(
                id="input-b",
                type="text_input",
                data=NodeData(label="B", config={"value": "World"}),
            ),
            Node(
                id="join-node",
                type="text_join",
                data=NodeData(label="Join", config={"separator": " "}),
            ),
        ]
        edges = [
            Edge(
                id="e1",
                source="input-a",
                target="join-node",
                sourceHandle="output",
                targetHandle="a",
            ),
            Edge(
                id="e2",
                source="input-b",
                target="join-node",
                sourceHandle="output",
                targetHandle="b",
            ),
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        results = executor.execute()

        join_result = results.get("join-node")
        assert join_result is not None
        assert join_result["success"] is True
        assert join_result["value"] == "Hello World"

    def test_text_join_with_escape_separator_via_executor(self):
        """End-to-end: '\\n' separator in config produces a real newline in output."""
        from app.schemas import Node, NodeData, Edge
        from app.engine.graph_executor import GraphExecutor

        nodes = [
            Node(id="n1", type="text_input", data=NodeData(label="L1", config={"value": "line1"})),
            Node(id="n2", type="text_input", data=NodeData(label="L2", config={"value": "line2"})),
            Node(id="jn", type="text_join", data=NodeData(label="Join", config={"separator": "\\n"})),
        ]
        edges = [
            Edge(id="e1", source="n1", target="jn", targetHandle="a"),
            Edge(id="e2", source="n2", target="jn", targetHandle="b"),
        ]

        executor = GraphExecutor(nodes=nodes, edges=edges)
        results = executor.execute()

        assert results["jn"]["success"] is True
        assert results["jn"]["value"] == "line1\nline2"
