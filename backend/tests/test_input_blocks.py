"""
Unit tests for Input Block processors (TextInputBlock, NumberInputBlock).
"""

import pytest
from app.blocks.io.input_blocks import TextInputBlock, NumberInputBlock
from app.blocks.base import BlockResult


class TestTextInputBlock:
    """Test cases for TextInputBlock."""

    def test_basic_text_input(self):
        """Test basic text input returns configured value."""
        block = TextInputBlock(
            node_id="text1",
            config={"value": "Hello, World!"}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == "Hello, World!"
        assert result.metadata["length"] == 13

    def test_empty_text_input(self):
        """Test empty text input."""
        block = TextInputBlock(node_id="text2", config={"value": ""})
        result = block.run({})
        
        assert result.success is True
        assert result.value == ""
        assert result.metadata["length"] == 0

    def test_multiline_text_input(self):
        """Test multiline text input."""
        multiline_text = "Line 1\nLine 2\nLine 3"
        block = TextInputBlock(
            node_id="text3",
            config={"value": multiline_text, "multiline": True}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == multiline_text
        assert result.metadata["multiline"] is True

    def test_max_length_validation(self):
        """Test max_length constraint."""
        block = TextInputBlock(
            node_id="text4",
            config={"value": "This is a long text", "max_length": 10}
        )
        result = block.run({})
        
        assert result.success is False
        assert "exceeds maximum" in result.error

    def test_max_length_within_limit(self):
        """Test text within max_length limit."""
        block = TextInputBlock(
            node_id="text5",
            config={"value": "Short", "max_length": 10}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == "Short"

    def test_non_string_value_error(self):
        """Test that non-string values are rejected."""
        block = TextInputBlock(
            node_id="text6",
            config={"value": 12345}  # Not a string
        )
        result = block.run({})
        
        assert result.success is False
        assert "must be a string" in result.error

    def test_default_empty_value(self):
        """Test default empty value when not configured."""
        block = TextInputBlock(node_id="text7", config={})
        result = block.run({})
        
        assert result.success is True
        assert result.value == ""


class TestNumberInputBlock:
    """Test cases for NumberInputBlock."""

    def test_integer_input(self):
        """Test integer input."""
        block = NumberInputBlock(
            node_id="num1",
            config={"value": 42, "number_type": "int"}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == 42
        assert isinstance(result.value, int)

    def test_float_input(self):
        """Test float input."""
        block = NumberInputBlock(
            node_id="num2",
            config={"value": 3.14159, "number_type": "float"}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == 3.14159
        assert isinstance(result.value, float)

    def test_auto_detect_integer(self):
        """Test auto-detection of integer."""
        block = NumberInputBlock(
            node_id="num3",
            config={"value": 100, "number_type": "auto"}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == 100

    def test_auto_detect_float(self):
        """Test auto-detection of float."""
        block = NumberInputBlock(
            node_id="num4",
            config={"value": 2.718, "number_type": "auto"}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == 2.718

    def test_string_to_int_conversion(self):
        """Test conversion from string to int."""
        block = NumberInputBlock(
            node_id="num5",
            config={"value": "123", "number_type": "int"}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == 123
        assert isinstance(result.value, int)

    def test_string_to_float_conversion(self):
        """Test conversion from string to float."""
        block = NumberInputBlock(
            node_id="num6",
            config={"value": "3.14", "number_type": "float"}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == 3.14
        assert isinstance(result.value, float)

    def test_scientific_notation(self):
        """Test scientific notation parsing."""
        block = NumberInputBlock(
            node_id="num7",
            config={"value": "1.5e10", "number_type": "auto"}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == 1.5e10

    def test_min_value_constraint(self):
        """Test min_value constraint."""
        block = NumberInputBlock(
            node_id="num8",
            config={"value": 5, "min_value": 10}
        )
        result = block.run({})
        
        assert result.success is False
        assert "less than minimum" in result.error

    def test_max_value_constraint(self):
        """Test max_value constraint."""
        block = NumberInputBlock(
            node_id="num9",
            config={"value": 100, "max_value": 50}
        )
        result = block.run({})
        
        assert result.success is False
        assert "exceeds maximum" in result.error

    def test_value_within_range(self):
        """Test value within min/max range."""
        block = NumberInputBlock(
            node_id="num10",
            config={"value": 25, "min_value": 0, "max_value": 50}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == 25

    def test_invalid_string_conversion(self):
        """Test invalid string that cannot be converted."""
        block = NumberInputBlock(
            node_id="num11",
            config={"value": "not a number", "number_type": "int"}
        )
        result = block.run({})
        
        assert result.success is False
        assert "Cannot convert" in result.error

    def test_default_zero_value(self):
        """Test default zero value when not configured."""
        block = NumberInputBlock(node_id="num12", config={})
        result = block.run({})
        
        assert result.success is True
        assert result.value == 0

    def test_negative_numbers(self):
        """Test negative number handling."""
        block = NumberInputBlock(
            node_id="num13",
            config={"value": -42, "number_type": "int"}
        )
        result = block.run({})
        
        assert result.success is True
        assert result.value == -42
