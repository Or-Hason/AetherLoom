"""
Math Logic Blocks
=================

Implements math processing block types for arithmetic operations on numeric inputs.
These blocks accept two numeric inputs and produce a single numeric result.
"""

import logging
from typing import Dict, Any, Union

from pydantic import ValidationError

from app.blocks.base import BaseBlock, BlockResult
from app.schemas import MathBlockConfig

logger = logging.getLogger(__name__)

# Type alias for numeric values accepted and returned by math blocks.
Numeric = Union[int, float]

# Maps operation names to human-readable labels used in log messages only.
_OPERATION_LABELS: Dict[str, str] = {
    "add": "addition",
    "subtract": "subtraction",
    "multiply": "multiplication",
    "divide": "division",
}


class MathOperationBlock(BaseBlock):
    """
    Math Operation Block — performs basic arithmetic on two numeric inputs.

    Configuration is parsed and validated by ``MathBlockConfig`` at the start of
    every ``run()`` call. Pydantic enforces that ``operation`` is one of the four
    supported values.

    Expected inputs (keyed by target handle name):
        - ``"a"`` (int | float): The left-hand operand.
        - ``"b"`` (int | float): The right-hand operand.

    Returns:
        BlockResult whose ``value`` is ``int`` when the mathematical result is a
        whole number and *both* operands were integers; ``float`` otherwise.

    Errors wrapped in BlockResult (success=False):
        - ``ValidationError``: operation string is not one of the four allowed values.
        - ``ZeroDivisionError``: divisor is zero.
        - ``TypeError``: an operand is not numeric (int or float).
        - ``KeyError``: a required input key (``"a"`` or ``"b"``) is missing.
    """

    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        """
        Execute the math operation block.

        Args:
            inputs: Dictionary of upstream values keyed by target handle ID.
                    Required keys: ``"a"`` and ``"b"``.

        Returns:
            BlockResult containing the arithmetic result on success, or a
            descriptive error message on failure.
        """
        try:
            # ── 1. Parse & validate configuration via Pydantic ───────────────
            # ValidationError is raised automatically if ``operation`` is not a
            # valid MathOperation Literal value — no manual checking required.
            cfg = MathBlockConfig.model_validate(self.config)

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
            if cfg.operation == "add":
                raw_result: Numeric = a + b
            elif cfg.operation == "subtract":
                raw_result = a - b
            elif cfg.operation == "multiply":
                raw_result = a * b
            else:  # "divide" — the only remaining Literal value
                if b == 0:
                    raise ZeroDivisionError("Division by zero is undefined.")
                raw_result = a / b

            # ── 5. Integer type preservation ─────────────────────────────────
            # Return int when both operands were integers and the division
            # produced a whole-number float (e.g. 10 / 2 → 5, not 5.0).
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
                "MathOperationBlock '%s' completed %s: result_type=%s",
                self.node_id,
                _OPERATION_LABELS[cfg.operation],
                type(result_value).__name__,
            )

            return BlockResult(
                success=True,
                value=result_value,
                metadata={
                    "operation": cfg.operation,
                    "result_type": type(result_value).__name__,
                },
            )

        except ValidationError as exc:
            # Pydantic reports the invalid operation value in its error details.
            # We surface only the human-readable message — no raw config leaked.
            logger.error(
                "MathOperationBlock '%s' invalid configuration: %s",
                self.node_id,
                exc.error_count(),
            )
            # Extract the first error's message for a concise BlockResult error.
            first_msg = exc.errors()[0].get("msg", "Invalid configuration.")
            return BlockResult(success=False, value=None, error=first_msg)

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
