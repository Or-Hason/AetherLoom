# Base block package — exports BaseBlock and BlockResult for use across the entire
# blocks hierarchy without requiring callers to know the internal file layout.
from app.blocks.base.base import BaseBlock, BlockResult

__all__ = ["BaseBlock", "BlockResult"]
