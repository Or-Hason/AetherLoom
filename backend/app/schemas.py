from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from uuid import UUID

# strict typing using Pydantic models

class Position(BaseModel):
    """
    Represents the x and y coordinates of a node.
    """
    x: float
    y: float

class NodeData(BaseModel):
    """
    Stores the payload and configuration for a node.
    """
    label: str
    value: Optional[Any] = None
    config: Optional[Dict[str, Any]] = None
    is_output: bool = False

class Node(BaseModel):
    """
    Represents a single node in the flow.
    """
    id: str  # Kept as str to allow UUIDs or other string identifiers
    type: str  # Defined as Literal in spec but using str for flexibility in MVP
    position: Position
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
