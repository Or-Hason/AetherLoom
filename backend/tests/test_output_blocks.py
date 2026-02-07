"""
Unit tests for Output Block processors (TextOutputBlock, NumberOutputBlock).
"""

import pytest
from app.blocks.output_blocks import TextOutputBlock, NumberOutputBlock
from app.blocks.base import BlockResult


class TestTextOutputBlock:
    """Test cases for TextOutputBlock."""

    def test_plain_text_output(self):
        """Test plain text formatting."""
        block = TextOutputBlock(
            node_id="out1",
            config={"format": "plain"}
        )
        result = block.run({"input1": "Hello, World!"})
        
        assert result.success is True
        assert result.value == "Hello, World!"
        assert result.metadata["format"] == "plain"

    def test_json_format_dict(self):
        """Test JSON formatting for dictionary."""
        block = TextOutputBlock(
            node_id="out2",
            config={"format": "json"}
        )
        input_dict = {"name": "Alice", "age": 30}
        result = block.run({"input1": input_dict})
        
        assert result.success is True
        assert '"name"' in result.value
        assert '"Alice"' in result.value
        assert result.metadata["format"] == "json"

    def test_json_format_list(self):
        """Test JSON formatting for list."""
        block = TextOutputBlock(
            node_id="out3",
            config={"format": "json"}
        )
        input_list = [1, 2, 3, 4, 5]
        result = block.run({"input1": input_list})
        
        assert result.success is True
        assert "[" in result.value
        assert result.metadata["format"] == "json"

    def test_pretty_format(self):
        """Test pretty formatting with type information."""
        block = TextOutputBlock(
            node_id="out4",
            config={"format": "pretty"}
        )
        result = block.run({"input1": 42})
        
        assert result.success is True
        assert "[int]" in result.value
        assert "42" in result.value

    def test_max_display_length_truncation(self):
        """Test max_display_length truncation."""
        block = TextOutputBlock(
            node_id="out5",
            config={"max_display_length": 10}
        )
        long_text = "This is a very long text that should be truncated"
        result = block.run({"input1": long_text})
        
        assert result.success is True
        assert len(result.value) == 13  # 10 chars + "..."
        assert result.value.endswith("...")
        assert result.metadata["truncated"] is True

    def test_no_truncation_within_limit(self):
        """Test no truncation when within limit."""
        block = TextOutputBlock(
            node_id="out6",
            config={"max_display_length": 100}
        )
        short_text = "Short text"
        result = block.run({"input1": short_text})
        
        assert result.success is True
        assert result.value == short_text
        assert result.metadata["truncated"] is False

    def test_no_inputs_warning(self):
        """Test handling of no inputs."""
        block = TextOutputBlock(node_id="out7", config={})
        result = block.run({})
        
        assert result.success is True
        assert result.value == ""
        assert result.metadata["input_count"] == 0

    def test_number_to_string_conversion(self):
        """Test automatic conversion of numbers to string."""
        block = TextOutputBlock(node_id="out8", config={})
        result = block.run({"input1": 12345})
        
        assert result.success is True
        assert result.value == "12345"

    def test_boolean_to_string_conversion(self):
        """Test automatic conversion of boolean to string."""
        block = TextOutputBlock(node_id="out9", config={})
        result = block.run({"input1": True})
        
        assert result.success is True
        assert result.value == "True"


class TestNumberOutputBlock:
    """Test cases for NumberOutputBlock."""

    def test_integer_output(self):
        """Test integer output."""
        block = NumberOutputBlock(node_id="num_out1", config={})
        result = block.run({"input1": 42})
        
        assert result.success is True
        assert result.value == "42"
        assert result.metadata["type"] == "int"

    def test_float_output(self):
        """Test float output."""
        block = NumberOutputBlock(node_id="num_out2", config={})
        result = block.run({"input1": 3.14159})
        
        assert result.success is True
        assert "3.14159" in result.value

    def test_decimal_places_formatting(self):
        """Test decimal places formatting."""
        block = NumberOutputBlock(
            node_id="num_out3",
            config={"decimal_places": 2}
        )
        result = block.run({"input1": 3.14159})
        
        assert result.success is True
        assert result.value == "3.14"

    def test_thousands_separator(self):
        """Test thousands separator."""
        block = NumberOutputBlock(
            node_id="num_out4",
            config={"use_thousands_separator": True}
        )
        result = block.run({"input1": 1000000})
        
        assert result.success is True
        assert "," in result.value
        assert result.value == "1,000,000"

    def test_scientific_notation(self):
        """Test scientific notation formatting."""
        block = NumberOutputBlock(
            node_id="num_out5",
            config={"scientific_notation": True, "decimal_places": 2}
        )
        result = block.run({"input1": 1500000})
        
        assert result.success is True
        assert "e" in result.value.lower()

    def test_automatic_scientific_notation(self):
        """Test automatic scientific notation for large numbers."""
        block = NumberOutputBlock(
            node_id="num_out6",
            config={"scientific_threshold": 1e6}
        )
        result = block.run({"input1": 5000000.0})
        
        assert result.success is True
        assert "e" in result.value.lower()

    def test_nan_handling(self):
        """Test NaN special value handling."""
        block = NumberOutputBlock(node_id="num_out7", config={})
        result = block.run({"input1": float('nan')})
        
        assert result.success is True
        assert result.value == "NaN"
        assert result.metadata["is_special"] is True
        assert result.metadata["special_type"] == "NaN"

    def test_infinity_handling(self):
        """Test positive infinity handling."""
        block = NumberOutputBlock(node_id="num_out8", config={})
        result = block.run({"input1": float('inf')})
        
        assert result.success is True
        assert result.value == "∞"
        assert result.metadata["is_special"] is True

    def test_negative_infinity_handling(self):
        """Test negative infinity handling."""
        block = NumberOutputBlock(node_id="num_out9", config={})
        result = block.run({"input1": float('-inf')})
        
        assert result.success is True
        assert result.value == "-∞"
        assert result.metadata["is_special"] is True

    def test_string_to_number_conversion(self):
        """Test automatic conversion from string to number."""
        block = NumberOutputBlock(node_id="num_out10", config={})
        result = block.run({"input1": "123.45"})
        
        assert result.success is True
        assert "123.45" in result.value

    def test_invalid_input_type_error(self):
        """Test error for invalid input type."""
        block = NumberOutputBlock(node_id="num_out11", config={})
        result = block.run({"input1": "not a number"})
        
        assert result.success is False
        assert "Cannot convert" in result.error

    def test_no_input_error(self):
        """Test error when no input is provided."""
        block = NumberOutputBlock(node_id="num_out12", config={})
        result = block.run({})
        
        assert result.success is False
        assert "No input provided" in result.error

    def test_negative_number_output(self):
        """Test negative number formatting."""
        block = NumberOutputBlock(node_id="num_out13", config={})
        result = block.run({"input1": -42})
        
        assert result.success is True
        assert result.value == "-42"

    def test_zero_output(self):
        """Test zero value output."""
        block = NumberOutputBlock(node_id="num_out14", config={})
        result = block.run({"input1": 0})
        
        assert result.success is True
        assert result.value == "0"

    def test_float_with_thousands_separator(self):
        """Test float with thousands separator."""
        block = NumberOutputBlock(
            node_id="num_out15",
            config={
                "use_thousands_separator": True,
                "decimal_places": 2,
                "scientific_threshold": 1e10  # Set high threshold to prevent scientific notation
            }
        )
        result = block.run({"input1": 1234567.89})
        
        assert result.success is True
        assert "," in result.value
        assert "1,234,567.89" == result.value
