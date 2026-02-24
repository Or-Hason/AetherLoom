"""
Text Logic Blocks
=================

Implements text processing block types for string operations.
``TextJoinBlock`` concatenates two (or more) text inputs using a configurable
separator, coercing non-string values to strings before joining.
"""

import logging
from typing import Any, Dict, List

from pydantic import ValidationError

from app.blocks.base import BaseBlock, BlockResult
from app.schemas import TextJoinConfig

logger = logging.getLogger(__name__)

# Escape-sequence map: the frontend stores literal backslash-n / backslash-t
# so the input box is not invisible and the user can read what they typed.
# We translate these to real control characters before joining.
_ESCAPE_MAP: Dict[str, str] = {
    "\\n": "\n",
    "\\t": "\t",
    "\\r": "\r",
}


def _resolve_separator(raw: str) -> str:
    """Translate literal escape sequences to real control characters.

    Args:
        raw: Separator string as stored in config (e.g. ``"\\n"``).

    Returns:
        Separator with escape sequences replaced (e.g. ``"\n"``).
    """
    return _ESCAPE_MAP.get(raw, raw)


def _coerce_input(value: Any, handle_id: str, node_id: str) -> str:
    """Coerce a single input value to ``str``.

    Args:
        value: The raw input value from an upstream node.
        handle_id: Handle identifier, used only for debug logging.
        node_id: Node identifier, used only for debug logging.

    Returns:
        String representation of *value*. ``None`` is mapped to ``""``.

    Raises:
        TypeError: If the value cannot be coerced to a string (e.g. a
            custom object whose ``__str__`` raises).
    """
    if value is None:
        logger.debug(
            "TextJoinBlock '%s' handle '%s': None coerced to empty string.",
            node_id,
            handle_id,
        )
        return ""

    if isinstance(value, str):
        return value

    try:
        coerced = str(value)
        logger.debug(
            "TextJoinBlock '%s' handle '%s': %s coerced to str.",
            node_id,
            handle_id,
            type(value).__name__,
        )
        return coerced
    except Exception as exc:  # pragma: no cover — defensive guard
        raise TypeError(
            f"Input on handle '{handle_id}' of type {type(value).__name__} "
            f"cannot be converted to string."
        ) from exc


class TextJoinBlock(BaseBlock):
    """Text Join Block — concatenates text inputs with a configurable separator.

    Reads ordered inputs from the ``inputs`` dictionary using the handle IDs
    defined by the ``BaseLogicNode`` frontend component: ``"a"`` and ``"b"``.
    Additional handles can follow the pattern ``"c"``, ``"d"``, etc. — they
    will be joined in lexicographic handle order after ``"a"`` and ``"b"``.

    Non-string inputs are coerced to ``str`` (logged at DEBUG level).
    ``None`` values are treated as empty strings (logged at DEBUG level).

    Configuration is validated by ``TextJoinConfig`` via Pydantic at the start
    of every ``run()`` call, so invalid config is caught immediately.

    Args (via ``inputs`` dict, keyed by target handle ID):
        ``"a"`` (Any): First text input (required).
        ``"b"`` (Any): Second text input (required).
        Additional handles are optional and joined in sorted order.

    Returns:
        ``BlockResult`` whose ``value`` is the joined string, or a descriptive
        error string on failure.

    Errors wrapped in ``BlockResult`` (``success=False``):
        - ``ValidationError``: config is structurally invalid.
        - ``KeyError``: a required handle key (``"a"`` or ``"b"``) is missing.
        - ``TypeError``: an input cannot be coerced to string.
    """

    def run(self, inputs: Dict[str, Any]) -> BlockResult:
        """Execute the text join block.

        Args:
            inputs: Dictionary of upstream values keyed by target handle ID.
                    Required keys: ``"a"`` and ``"b"``.

        Returns:
            ``BlockResult`` containing the joined string on success, or a
            descriptive error message on failure.
        """
        try:
            # ── 1. Parse & validate configuration via Pydantic ───────────────
            cfg = TextJoinConfig.model_validate(self.config)
            separator = _resolve_separator(cfg.separator)

            # ── 2. Extract and coerce inputs ─────────────────────────────────
            # Require at least the two primary handles "a" and "b".
            for required_handle in ("a", "b"):
                if required_handle not in inputs:
                    raise KeyError(
                        f"Required input '{required_handle}' is missing from inputs."
                    )

            # Build an ordered list: "a", "b", then any extra handles sorted.
            primary_handles = ["a", "b"]
            extra_handles = sorted(k for k in inputs if k not in primary_handles)
            ordered_handles = primary_handles + extra_handles

            parts: List[str] = []
            for handle_id in ordered_handles:
                parts.append(_coerce_input(inputs[handle_id], handle_id, self.node_id))

            # ── 3. Join ──────────────────────────────────────────────────────
            result_value: str = separator.join(parts)

            logger.info(
                "TextJoinBlock '%s' joined %d input(s); separator=%r; "
                "output_length=%d chars.",
                self.node_id,
                len(parts),
                cfg.separator,  # log the raw config value, not the resolved one
                len(result_value),
            )

            return BlockResult(
                success=True,
                value=result_value,
                metadata={
                    "input_count": len(parts),
                    "separator": cfg.separator,
                    "output_length": len(result_value),
                },
            )

        except ValidationError as exc:
            logger.error(
                "TextJoinBlock '%s' invalid configuration: %d error(s).",
                self.node_id,
                exc.error_count(),
            )
            first_msg = exc.errors()[0].get("msg", "Invalid configuration.")
            return BlockResult(success=False, value=None, error=first_msg)

        except KeyError as exc:
            logger.error(
                "TextJoinBlock '%s' missing input key: %s",
                self.node_id,
                str(exc),
            )
            return BlockResult(success=False, value=None, error=str(exc))

        except TypeError as exc:
            logger.error(
                "TextJoinBlock '%s' type coercion error.",
                self.node_id,
            )
            return BlockResult(success=False, value=None, error=str(exc))

        except Exception as exc:
            logger.error(
                "TextJoinBlock '%s' unexpected error.",
                self.node_id,
                exc_info=True,
            )
            return BlockResult(
                success=False,
                value=None,
                error=f"Unexpected error: {type(exc).__name__}",
            )
