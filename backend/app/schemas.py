from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Any, Dict
from uuid import UUID

# strict typing using Pydantic models

class NodeData(BaseModel):
    """
    Stores the payload and configuration for a node.
    """
    label: str = "Node"
    value: Optional[Any] = None
    config: Dict[str, Any] = {}
    is_output: bool = False

class Node(BaseModel):
    """
    Represents a single node in the flow.
    """
    id: str  # Kept as str to allow UUIDs or other string identifiers
    type: str  # Using str for flexibility in MVP
    data: NodeData

class Edge(BaseModel):
    """
    Represents a connection between two nodes.
    """
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class FlowExecutionRequest(BaseModel):
    """
    Request model for executing a flow.
    """
    nodes: List[Node]
    edges: List[Edge]


# ============================================================================
# Block Configuration Schemas
# ============================================================================

class TextInputConfig(BaseModel):
    """
    Configuration schema for Text Input blocks.
    
    Attributes:
        value: The text value to return
        max_length: Maximum allowed text length (optional)
        multiline: Whether multiline input is enabled (optional)
    """
    value: str = ""
    max_length: Optional[int] = Field(None, ge=1, description="Maximum text length")
    multiline: bool = False


class NumberInputConfig(BaseModel):
    """
    Configuration schema for Number Input blocks.
    
    Attributes:
        value: The numeric value to return
        number_type: Type of number ("int", "float", or "auto")
        min_value: Minimum allowed value (optional)
        max_value: Maximum allowed value (optional)
    """
    value: float | int = 0
    number_type: str = Field("auto", pattern="^(int|float|auto)$")
    min_value: Optional[float | int] = None
    max_value: Optional[float | int] = None


class TextOutputConfig(BaseModel):
    """
    Configuration schema for Text Output blocks.
    
    Attributes:
        format: Output format ("plain", "json", "pretty")
        max_display_length: Maximum characters to display (optional)
    """
    format: str = Field("plain", pattern="^(plain|json|pretty)$")
    max_display_length: Optional[int] = Field(None, ge=1, description="Max display length")


class NumberOutputConfig(BaseModel):
    """
    Configuration schema for Number Output blocks.
    
    Attributes:
        decimal_places: Number of decimal places for floats
        use_thousands_separator: Add thousands separators
        scientific_notation: Use scientific notation
        scientific_threshold: Threshold for automatic scientific notation
    """
    decimal_places: Optional[int] = Field(None, ge=0, le=10, description="Decimal precision")
    use_thousands_separator: bool = False
    scientific_notation: bool = False
    scientific_threshold: float = Field(1e6, gt=0, description="Threshold for scientific notation")


# Canonical type alias — used by both MathBlockConfig and MathOperationBlock for
# strict typing; extending operations in the future requires only this one-liner change.
MathOperation = Literal["add", "subtract", "multiply", "divide"]


class MathBlockConfig(BaseModel):
    """
    Configuration schema for Math Operation blocks.

    Pydantic validates ``operation`` against the ``MathOperation`` Literal at
    parse time.

    Attributes:
        operation: The arithmetic operation to perform. Must be one of
            ``"add"``, ``"subtract"``, ``"multiply"``, or ``"divide"``.
    """

    operation: MathOperation = "add"


class TextJoinConfig(BaseModel):
    """
    Configuration schema for Text Join blocks.

    Attributes:
        separator: String used to join the two text inputs. Defaults to a
            single space. Accepts any string including ``"\\n"``, ``"\\t"``,
            and ``""`` (empty string for concatenation).
    """

    separator: str = " "

