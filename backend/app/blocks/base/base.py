from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel

class BlockResult(BaseModel):
    """
    Standard result format returned by all blocks.
    """
    success: bool
    value: Any  # computed value for downstream nodes
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class BaseBlock(ABC):
    """
    Abstract base class for all executable blocks (Inputs, Processors, Outputs).
    All node types must inherit from this class and implement the run() method.
    """

    def __init__(self, node_id: str, config: Dict[str, Any] = {}):
        self.node_id = node_id
        self.config = config

    @abstractmethod
    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        """
        Executes the block's logic.
        
        Args:
            inputs: Dictionary mapping input handle IDs to their values.
            - For input nodes, this will be empty {}.
            - For processing nodes, this contains upstream node results.
        
        Returns:
            BlockResult with success status, computed value, and optional error/metadata.
        """
        pass