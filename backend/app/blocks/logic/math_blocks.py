"""
Math Logic Blocks
=================

Implements math processing block types for arithmetic operations on numeric inputs.
These blocks accept two numeric inputs and produce a single numeric result.
"""

import logging
from typing import Dict, Any, Union

from app.blocks.base import BaseBlock, BlockResult

logger = logging.getLogger(__name__)

# Type alias for numeric values accepted and returned by math blocks.
Numeric = Union[int, float]


class MathOperationBlock(BaseBlock):
    """
    Math Operation Block — performs basic arithmetic on two numeric inputs.

    Reads its operation mode from ``self.config["operation"]``, which must be one of:
    ``"add"``, ``"subtract"``, ``"multiply"``, or ``"divide"``.

    Expected inputs (keyed by target handle name, e.g. ``"a"``/``"b"``):
        - ``"a"`` (int | float): The left-hand operand.
        - ``"b"`` (int | float): The right-hand operand.

    Returns:
        BlockResult whose ``value`` is an ``int`` when the mathematical result is a
        whole number and both operands were integers; ``float`` otherwise.

    Raises (wrapped in BlockResult with success=False):
        - ZeroDivisionError: when dividing by zero.
        - TypeError: when either operand is not numeric.
        - KeyError: when a required input key is missing.
        - ValueError: when the configured operation is unrecognised.
    """

    # Supported operations mapped to human-readable display names for logging.
    _OPERATIONS: Dict[str, str] = {
        "add": "addition",
        "subtract": "subtraction",
        "multiply": "multiplication",
        "divide": "division",
    }

    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        """
        Execute the math operation block.

        Args:
            inputs: Dictionary of upstream values keyed by target handle ID.
                    Expected keys: ``"a"`` and ``"b"``.

        Returns:
            BlockResult containing the arithmetic result on success, or a
            descriptive error on failure.
        """
        operation = self.config.get("operation", "add")

        try:
            # ── 1. Validate operation ────────────────────────────────────────
            if operation not in self._OPERATIONS:
                raise ValueError(
                    f"Unknown operation '{operation}'. "
                    f"Supported: {', '.join(self._OPERATIONS.keys())}"
                )

            # ── 2. Extract operands ──────────────────────────────────────────
            try:
                a = inputs["a"]
            except KeyError:
                raise KeyError("Required input 'a' is missing from inputs.")

            try:
                b = inputs["b"]
            except KeyError:
                raise KeyError("Required input 'b' is missing from inputs.")

            # ── 3. Type validation ───────────────────────────────────────────
            if not isinstance(a, (int, float)):
                raise TypeError(
                    f"Input 'a' must be numeric (int or float), "
                    f"got {type(a).__name__}."
                )
            if not isinstance(b, (int, float)):
                raise TypeError(
                    f"Input 'b' must be numeric (int or float), "
                    f"got {type(b).__name__}."
                )

            # ── 4. Perform operation ─────────────────────────────────────────
            if operation == "add":
                raw_result: Numeric = a + b
            elif operation == "subtract":
                raw_result = a - b
            elif operation == "multiply":
                raw_result = a * b
            else:  # divide
                if b == 0:
                    raise ZeroDivisionError("Division by zero is undefined.")
                raw_result = a / b

            # ── 5. Type preservation ─────────────────────────────────────────
            # Preserve int type when both operands are integers and the result
            # is a whole number (e.g. 10 / 2 = 5, not 5.0).
            if (
                isinstance(raw_result, float)
                and raw_result.is_integer()
                and isinstance(a, int)
                and isinstance(b, int)
            ):
                result_value: Numeric = int(raw_result)
            else:
                result_value = raw_result

            logger.info(
                "MathOperationBlock '%s' completed %s: result type=%s",
                self.node_id,
                self._OPERATIONS[operation],
                type(result_value).__name__,
            )

            return BlockResult(
                success=True,
                value=result_value,
                metadata={
                    "operation": operation,
                    "result_type": type(result_value).__name__,
                },
            )

        except ZeroDivisionError as exc:
            logger.error(
                "MathOperationBlock '%s' division by zero error.",
                self.node_id,
            )
            return BlockResult(success=False, value=None, error=str(exc))

        except TypeError as exc:
            logger.error(
                "MathOperationBlock '%s' type error: %s",
                self.node_id,
                str(exc),
            )
            return BlockResult(success=False, value=None, error=str(exc))

        except KeyError as exc:
            logger.error(
                "MathOperationBlock '%s' missing input key: %s",
                self.node_id,
                str(exc),
            )
            return BlockResult(success=False, value=None, error=str(exc))

        except ValueError as exc:
            logger.error(
                "MathOperationBlock '%s' configuration error: %s",
                self.node_id,
                str(exc),
            )
            return BlockResult(success=False, value=None, error=str(exc))

        except Exception as exc:
            logger.error(
                "MathOperationBlock '%s' unexpected error.",
                self.node_id,
                exc_info=True,
            )
            return BlockResult(
                success=False,
                value=None,
                error=f"Unexpected error: {type(exc).__name__}",
            )
