"""
Unit tests for the BaseBlock abstract class and BlockResult model.
"""

import pytest
from typing import Dict, Any

from app.blocks.base import BaseBlock, BlockResult


class MockBlock(BaseBlock):
    """Mock implementation of BaseBlock for testing."""

    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        """Simple mock implementation that returns the sum of inputs."""
        if not inputs:
            return BlockResult(
                success=True,
                value=42,
                metadata={"source": "mock_block"}
            )
        
        try:
            total = sum(inputs.values())
            return BlockResult(
                success=True,
                value=total,
                metadata={"input_count": len(inputs)}
            )
        except Exception as e:
            return BlockResult(
                success=False,
                value=None,
                error=str(e)
            )


class TestBlockResult:
    """Test cases for BlockResult model."""

    def test_block_result_success(self):
        """Test creating a successful BlockResult."""
        result = BlockResult(success=True, value=100)
        assert result.success is True
        assert result.value == 100
        assert result.error is None
        assert result.metadata is None

    def test_block_result_with_metadata(self):
        """Test BlockResult with metadata."""
        metadata = {"execution_time": 0.5, "node_type": "processor"}
        result = BlockResult(
            success=True,
            value="output",
            metadata=metadata
        )
        assert result.success is True
        assert result.value == "output"
        assert result.metadata == metadata

    def test_block_result_failure(self):
        """Test creating a failed BlockResult."""
        result = BlockResult(
            success=False,
            value=None,
            error="Division by zero"
        )
        assert result.success is False
        assert result.value is None
        assert result.error == "Division by zero"

    def test_block_result_serialization(self):
        """Test BlockResult can be serialized to dict."""
        result = BlockResult(
            success=True,
            value={"key": "value"},
            metadata={"test": True}
        )
        result_dict = result.model_dump()
        assert isinstance(result_dict, dict)
        assert result_dict["success"] is True
        assert result_dict["value"] == {"key": "value"}
        assert result_dict["metadata"] == {"test": True}


class TestBaseBlock:
    """Test cases for BaseBlock abstract class."""

    def test_base_block_instantiation(self):
        """Test that BaseBlock can be instantiated through a subclass."""
        block = MockBlock(node_id="test-node-1", config={"param": "value"})
        assert block.node_id == "test-node-1"
        assert block.config == {"param": "value"}

    def test_base_block_default_config(self):
        """Test BaseBlock with default empty config."""
        block = MockBlock(node_id="test-node-2")
        assert block.node_id == "test-node-2"
        assert block.config == {}

    def test_base_block_run_with_no_inputs(self):
        """Test running a block with no inputs."""
        block = MockBlock(node_id="test-node-3", config={})
        result = block.run({})
        assert result.success is True
        assert result.value == 42
        assert result.metadata == {"source": "mock_block"}

    def test_base_block_run_with_inputs(self):
        """Test running a block with inputs."""
        block = MockBlock(node_id="test-node-4", config={})
        inputs = {"input1": 10, "input2": 20, "input3": 30}
        result = block.run(inputs)
        assert result.success is True
        assert result.value == 60
        assert result.metadata == {"input_count": 3}

    def test_base_block_cannot_instantiate_directly(self):
        """Test that BaseBlock cannot be instantiated directly."""
        with pytest.raises(TypeError):
            BaseBlock(node_id="test", config={})  # type: ignore

    def test_base_block_requires_run_implementation(self):
        """Test that subclasses must implement run method."""
        
        class IncompleteBlock(BaseBlock):
            pass
        
        with pytest.raises(TypeError):
            IncompleteBlock(node_id="test", config={})  # type: ignore
