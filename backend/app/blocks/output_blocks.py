"""
Output Block Processors

Implements output node types that format and display execution results.
These blocks accept inputs from upstream nodes and format them for display.
"""

import logging
from typing import Dict, Any
import json

from app.blocks.base import BaseBlock, BlockResult

logger = logging.getLogger(__name__)


class TextOutputBlock(BaseBlock):
    """
    Text Output Block - Accepts any input and converts it to string format.
    
    Configuration:
        - format (str, optional): Output format ("plain", "json", "pretty")
        - max_display_length (int, optional): Maximum characters to display
    
    Returns:
        BlockResult with the formatted text output
    """
    
    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        """
        Execute the text output block.
        
        Args:
            inputs: Dictionary of input values from upstream nodes
            
        Returns:
            BlockResult containing the formatted text output
        """
        try:
            # If no inputs, return empty string
            if not inputs:
                logger.warning(f"TextOutputBlock {self.node_id} received no inputs")
                return BlockResult(
                    success=True,
                    value="",
                    metadata={"input_count": 0}
                )
            
            # Get the first input value (output nodes typically have one input)
            input_value = list(inputs.values())[0]
            
            # Get formatting configuration
            output_format = self.config.get("format", "plain")
            max_length = self.config.get("max_display_length")
            
            # Format the output based on configuration
            if output_format == "json":
                try:
                    # Try to format as JSON
                    if isinstance(input_value, (dict, list)):
                        formatted_text = json.dumps(input_value, indent=2)
                    else:
                        formatted_text = json.dumps({"value": input_value}, indent=2)
                except (TypeError, ValueError):
                    # Fall back to string conversion
                    formatted_text = str(input_value)
            
            elif output_format == "pretty":
                # Pretty print with type information
                value_type = type(input_value).__name__
                formatted_text = f"[{value_type}] {input_value}"
            
            else:  # plain
                formatted_text = str(input_value)
            
            # Apply max length constraint if configured
            if max_length is not None and len(formatted_text) > max_length:
                formatted_text = formatted_text[:max_length] + "..."
                truncated = True
            else:
                truncated = False
            
            logger.debug(f"TextOutputBlock {self.node_id} formatted output: {formatted_text[:100]}...")
            
            return BlockResult(
                success=True,
                value=formatted_text,
                metadata={
                    "format": output_format,
                    "length": len(formatted_text),
                    "truncated": truncated,
                    "input_type": type(input_value).__name__
                }
            )
            
        except Exception as e:
            logger.error(f"Error in TextOutputBlock {self.node_id}: {str(e)}", exc_info=True)
            return BlockResult(
                success=False,
                value=None,
                error=f"Unexpected error: {str(e)}"
            )


class NumberOutputBlock(BaseBlock):
    """
    Number Output Block - Validates numeric input and formats for display.
    
    Configuration:
        - decimal_places (int, optional): Number of decimal places for floats
        - use_thousands_separator (bool, optional): Add thousands separators
        - scientific_notation (bool, optional): Use scientific notation for large numbers
        - scientific_threshold (float, optional): Threshold for scientific notation (default: 1e6)
    
    Returns:
        BlockResult with the formatted numeric output
    """
    
    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        """
        Execute the number output block.
        
        Args:
            inputs: Dictionary of input values from upstream nodes
            
        Returns:
            BlockResult containing the formatted numeric output
        """
        try:
            # If no inputs, return error
            if not inputs:
                return BlockResult(
                    success=False,
                    value=None,
                    error="No input provided to number output block"
                )
            
            # Get the first input value
            input_value = list(inputs.values())[0]
            
            # Validate that it's a number
            if not isinstance(input_value, (int, float)):
                # Try to convert to number
                try:
                    if isinstance(input_value, str):
                        input_value = float(input_value) if '.' in input_value else int(input_value)
                    else:
                        return BlockResult(
                            success=False,
                            value=None,
                            error=f"Expected numeric input, got {type(input_value).__name__}"
                        )
                except (ValueError, TypeError):
                    return BlockResult(
                        success=False,
                        value=None,
                        error=f"Cannot convert '{input_value}' to number"
                    )
            
            # Check for special values
            is_special = False
            special_type = None
            formatted_value = str(input_value)  # Default formatting
            
            if isinstance(input_value, float):
                if input_value != input_value:  # NaN check
                    is_special = True
                    special_type = "NaN"
                    formatted_value = "NaN"
                elif input_value == float('inf'):
                    is_special = True
                    special_type = "Infinity"
                    formatted_value = "∞"
                elif input_value == float('-inf'):
                    is_special = True
                    special_type = "-Infinity"
                    formatted_value = "-∞"
            
            # Format the number if not special
            if not is_special:
                # Get formatting configuration
                decimal_places = self.config.get("decimal_places")
                use_thousands_sep = self.config.get("use_thousands_separator", False)
                use_scientific = self.config.get("scientific_notation", False)
                sci_threshold = self.config.get("scientific_threshold", 1e6)
                
                # Determine if we should use scientific notation
                if use_scientific or (abs(input_value) >= sci_threshold and isinstance(input_value, float)):
                    formatted_value = f"{input_value:.{decimal_places or 2}e}"
                elif isinstance(input_value, float):
                    if decimal_places is not None:
                        formatted_value = f"{input_value:.{decimal_places}f}"
                    else:
                        formatted_value = str(input_value)
                else:  # int
                    formatted_value = str(input_value)
                
                # Add thousands separator if requested
                if use_thousands_sep and not use_scientific:
                    parts = formatted_value.split('.')
                    parts[0] = f"{int(parts[0]):,}"
                    formatted_value = '.'.join(parts)
            
            logger.debug(f"NumberOutputBlock {self.node_id} formatted output: {formatted_value}")
            
            return BlockResult(
                success=True,
                value=formatted_value,
                metadata={
                    "original_value": input_value,
                    "type": type(input_value).__name__,
                    "is_special": is_special,
                    "special_type": special_type
                }
            )
            
        except Exception as e:
            logger.error(f"Error in NumberOutputBlock {self.node_id}: {str(e)}", exc_info=True)
            return BlockResult(
                success=False,
                value=None,
                error=f"Unexpected error: {str(e)}"
            )
