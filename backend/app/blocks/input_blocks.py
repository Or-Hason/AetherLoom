"""
Input Block Processors

Implements input node types that provide data entry points for flow execution.
These blocks return configured values without requiring upstream inputs.
"""

import logging
from typing import Dict, Any

from app.blocks.base import BaseBlock, BlockResult

logger = logging.getLogger(__name__)


class TextInputBlock(BaseBlock):
    """
    Text Input Block - Returns a configured text value.
    
    Configuration:
        - value (str): The text value to return
        - max_length (int, optional): Maximum allowed length
        - multiline (bool, optional): Whether multiline is enabled
    
    Returns:
        BlockResult with the configured text value
    """
    
    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        """
        Execute the text input block.
        
        Args:
            inputs: Empty dict (input nodes don't have upstream dependencies)
            
        Returns:
            BlockResult containing the configured text value
        """
        try:
            # Get the configured text value
            text_value = self.config.get("value", "")
            
            # Validate it's a string
            if not isinstance(text_value, str):
                return BlockResult(
                    success=False,
                    value=None,
                    error=f"Text value must be a string, got {type(text_value).__name__}"
                )
            
            # Check max_length constraint if configured
            max_length = self.config.get("max_length")
            if max_length is not None and len(text_value) > max_length:
                return BlockResult(
                    success=False,
                    value=None,
                    error=f"Text length {len(text_value)} exceeds maximum {max_length}"
                )
            
            logger.debug(f"TextInputBlock {self.node_id} returning value: {text_value[:50]}...")
            
            return BlockResult(
                success=True,
                value=text_value,
                metadata={
                    "length": len(text_value),
                    "multiline": self.config.get("multiline", False)
                }
            )
            
        except Exception as e:
            logger.error(f"Error in TextInputBlock {self.node_id}: {str(e)}", exc_info=True)
            return BlockResult(
                success=False,
                value=None,
                error=f"Unexpected error: {str(e)}"
            )


class NumberInputBlock(BaseBlock):
    """
    Number Input Block - Returns a configured numeric value.
    
    Configuration:
        - value (int|float): The numeric value to return
        - number_type (str, optional): "int" or "float" (default: auto-detect)
        - min_value (int|float, optional): Minimum allowed value
        - max_value (int|float, optional): Maximum allowed value
    
    Returns:
        BlockResult with the configured numeric value
    """
    
    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        """
        Execute the number input block.
        
        Args:
            inputs: Empty dict (input nodes don't have upstream dependencies)
            
        Returns:
            BlockResult containing the configured numeric value
        """
        try:
            # Get the configured numeric value
            raw_value = self.config.get("value", 0)
            
            # Determine the expected type
            number_type = self.config.get("number_type", "auto")
            
            # Convert and validate the value
            if number_type == "int":
                try:
                    numeric_value = int(raw_value)
                except (ValueError, TypeError):
                    return BlockResult(
                        success=False,
                        value=None,
                        error=f"Cannot convert '{raw_value}' to integer"
                    )
            elif number_type == "float":
                try:
                    numeric_value = float(raw_value)
                except (ValueError, TypeError):
                    return BlockResult(
                        success=False,
                        value=None,
                        error=f"Cannot convert '{raw_value}' to float"
                    )
            else:  # auto-detect
                if isinstance(raw_value, (int, float)):
                    numeric_value = raw_value
                else:
                    try:
                        # Try int first, then float
                        if '.' in str(raw_value) or 'e' in str(raw_value).lower():
                            numeric_value = float(raw_value)
                        else:
                            numeric_value = int(raw_value)
                    except (ValueError, TypeError):
                        return BlockResult(
                            success=False,
                            value=None,
                            error=f"Cannot convert '{raw_value}' to number"
                        )
            
            # Validate min/max constraints
            min_value = self.config.get("min_value")
            max_value = self.config.get("max_value")
            
            if min_value is not None and numeric_value < min_value:
                return BlockResult(
                    success=False,
                    value=None,
                    error=f"Value {numeric_value} is less than minimum {min_value}"
                )
            
            if max_value is not None and numeric_value > max_value:
                return BlockResult(
                    success=False,
                    value=None,
                    error=f"Value {numeric_value} exceeds maximum {max_value}"
                )
            
            logger.debug(f"NumberInputBlock {self.node_id} returning value: {numeric_value}")
            
            return BlockResult(
                success=True,
                value=numeric_value,
                metadata={
                    "type": type(numeric_value).__name__,
                    "original_value": raw_value
                }
            )
            
        except Exception as e:
            logger.error(f"Error in NumberInputBlock {self.node_id}: {str(e)}", exc_info=True)
            return BlockResult(
                success=False,
                value=None,
                error=f"Unexpected error: {str(e)}"
            )
