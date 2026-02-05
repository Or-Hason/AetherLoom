from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
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
