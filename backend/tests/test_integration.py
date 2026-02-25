"""
Integration tests for the complete flow execution pipeline.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas import Node, NodeData, Edge


client = TestClient(app)


class TestFlowExecutionEndpoint:
    """Integration tests for the /api/v1/engine/run endpoint."""

    def test_health_check(self):
        """Test that the health check endpoint works."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "version" in data

    def test_execute_simple_flow(self):
        """Test executing a simple flow with unimplemented blocks."""
        payload = {
            "nodes": [
                {
                    "id": "node1",
                    "type": "input",
                    "data": {
                        "label": "Input Node",
                        "value": 10,
                        "config": {},
                        "is_output": False
                    }
                }
            ],
            "edges": []
        }

        response = client.post("/api/v1/engine/run", json=payload)
        
        # Should return 200 but with error results since blocks aren't implemented
        assert response.status_code == 200
        data = response.json()
        assert "node1" in data
        assert data["node1"]["success"] is False
        assert "not yet implemented" in data["node1"]["error"].lower()

    def test_execute_linear_flow(self):
        """Test executing a linear flow: A -> B -> C."""
        payload = {
            "nodes": [
                {
                    "id": "A",
                    "type": "input",
                    "data": {
                        "label": "Node A",
                        "value": 5,
                        "config": {},
                        "is_output": False
                    }
                },
                {
                    "id": "B",
                    "type": "processor",
                    "data": {
                        "label": "Node B",
                        "value": None,
                        "config": {},
                        "is_output": False
                    }
                },
                {
                    "id": "C",
                    "type": "output",
                    "data": {
                        "label": "Node C",
                        "value": None,
                        "config": {},
                        "is_output": True
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "A",
                    "target": "B",
                    "sourceHandle": None,
                    "targetHandle": "input1"
                },
                {
                    "id": "e2",
                    "source": "B",
                    "target": "C",
                    "sourceHandle": None,
                    "targetHandle": "input1"
                }
            ]
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # All nodes should be in results
        assert "A" in data
        assert "B" in data
        assert "C" in data

    def test_execute_cyclic_flow_returns_400(self):
        """Test that a cyclic flow returns a 400 error."""
        payload = {
            "nodes": [
                {
                    "id": "A",
                    "type": "processor",
                    "data": {
                        "label": "Node A",
                        "value": None,
                        "config": {},
                        "is_output": False
                    }
                },
                {
                    "id": "B",
                    "type": "processor",
                    "data": {
                        "label": "Node B",
                        "value": None,
                        "config": {},
                        "is_output": False
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "A",
                    "target": "B"
                },
                {
                    "id": "e2",
                    "source": "B",
                    "target": "A"  # Creates cycle
                }
            ]
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "cycle" in data["detail"].lower()

    def test_execute_diamond_flow(self):
        """Test executing a diamond flow: A -> B,C -> D."""
        payload = {
            "nodes": [
                {
                    "id": "A",
                    "type": "input",
                    "data": {
                        "label": "Input",
                        "value": 10,
                        "config": {},
                        "is_output": False
                    }
                },
                {
                    "id": "B",
                    "type": "processor",
                    "data": {
                        "label": "Processor B",
                        "value": None,
                        "config": {},
                        "is_output": False
                    }
                },
                {
                    "id": "C",
                    "type": "processor",
                    "data": {
                        "label": "Processor C",
                        "value": None,
                        "config": {},
                        "is_output": False
                    }
                },
                {
                    "id": "D",
                    "type": "output",
                    "data": {
                        "label": "Output",
                        "value": None,
                        "config": {},
                        "is_output": True
                    }
                }
            ],
            "edges": [
                {"id": "e1", "source": "A", "target": "B"},
                {"id": "e2", "source": "A", "target": "C"},
                {"id": "e3", "source": "B", "target": "D"},
                {"id": "e4", "source": "C", "target": "D"}
            ]
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # All nodes should be present
        assert len(data) == 4
        assert all(node_id in data for node_id in ["A", "B", "C", "D"])

    def test_execute_empty_flow(self):
        """Test executing an empty flow."""
        payload = {
            "nodes": [],
            "edges": []
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data == {}

    def test_execute_independent_nodes(self):
        """Test executing multiple independent nodes."""
        payload = {
            "nodes": [
                {
                    "id": "A",
                    "type": "input",
                    "data": {"label": "A", "value": 1, "config": {}, "is_output": False}
                },
                {
                    "id": "B",
                    "type": "input",
                    "data": {"label": "B", "value": 2, "config": {}, "is_output": False}
                },
                {
                    "id": "C",
                    "type": "input",
                    "data": {"label": "C", "value": 3, "config": {}, "is_output": False}
                }
            ],
            "edges": []
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_invalid_request_missing_nodes(self):
        """Test that invalid requests are rejected."""
        payload = {
            "edges": []
            # Missing 'nodes' field
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 422  # Unprocessable Entity

    def test_invalid_request_missing_edges(self):
        """Test that invalid requests are rejected."""
        payload = {
            "nodes": []
            # Missing 'edges' field
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 422  # Unprocessable Entity


# ---------------------------------------------------------------------------
# Integration tests — real node types
# Verifies that math and text nodes execute correctly and results propagate.
# ---------------------------------------------------------------------------

class TestCoreLogicBlocksIntegration:
    """End-to-end integration tests for MathOperationBlock and TextJoinBlock
    via the /api/v1/engine/run HTTP endpoint.
    """

    def test_math_operation_flow_add(self):
        """text_input(5) + text_input(3) → math_operation(add) → number_output = 8."""
        payload = {
            "nodes": [
                {
                    "id": "num-a", "type": "number_input",
                    "data": {"label": "A", "config": {"value": 5}, "is_output": False}
                },
                {
                    "id": "num-b", "type": "number_input",
                    "data": {"label": "B", "config": {"value": 3}, "is_output": False}
                },
                {
                    "id": "math", "type": "math_operation",
                    "data": {"label": "Add", "config": {"operation": "add"}, "is_output": False}
                },
                {
                    "id": "out", "type": "number_output",
                    "data": {"label": "Out", "config": {}, "is_output": True}
                },
            ],
            "edges": [
                {"id": "e1", "source": "num-a", "target": "math", "targetHandle": "a"},
                {"id": "e2", "source": "num-b", "target": "math", "targetHandle": "b"},
                {"id": "e3", "source": "math", "target": "out", "targetHandle": "input"},
            ],
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 200
        data = response.json()

        # math_operation node should succeed with 5 + 3 = 8
        assert data["math"]["success"] is True
        assert data["math"]["value"] == 8

        # number_output should receive the propagated value
        assert data["out"]["success"] is True

    def test_math_operation_flow_divide_by_zero_propagates_error(self):
        """Division by zero produces success=False; downstream node receives None."""
        payload = {
            "nodes": [
                {
                    "id": "num-a", "type": "number_input",
                    "data": {"label": "A", "config": {"value": 10}, "is_output": False}
                },
                {
                    "id": "num-b", "type": "number_input",
                    "data": {"label": "B", "config": {"value": 0}, "is_output": False}
                },
                {
                    "id": "math", "type": "math_operation",
                    "data": {"label": "Div", "config": {"operation": "divide"}, "is_output": False}
                },
            ],
            "edges": [
                {"id": "e1", "source": "num-a", "target": "math", "targetHandle": "a"},
                {"id": "e2", "source": "num-b", "target": "math", "targetHandle": "b"},
            ],
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["math"]["success"] is False
        assert "zero" in data["math"]["error"].lower()

    def test_text_join_flow(self):
        """text_input('Hello') + text_input('World') → text_join(' ') → text_output = 'Hello World'."""
        payload = {
            "nodes": [
                {
                    "id": "txt-a", "type": "text_input",
                    "data": {"label": "A", "config": {"value": "Hello"}, "is_output": False}
                },
                {
                    "id": "txt-b", "type": "text_input",
                    "data": {"label": "B", "config": {"value": "World"}, "is_output": False}
                },
                {
                    "id": "join", "type": "text_join",
                    "data": {"label": "Join", "config": {"separator": " "}, "is_output": False}
                },
                {
                    "id": "out", "type": "text_output",
                    "data": {"label": "Out", "config": {}, "is_output": True}
                },
            ],
            "edges": [
                {"id": "e1", "source": "txt-a", "target": "join", "targetHandle": "a"},
                {"id": "e2", "source": "txt-b", "target": "join", "targetHandle": "b"},
                {"id": "e3", "source": "join", "target": "out", "targetHandle": "input"},
            ],
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["join"]["success"] is True
        assert data["join"]["value"] == "Hello World"
        assert data["out"]["success"] is True

    def test_text_join_newline_separator_flow(self):
        """text_join with literal '\\n' separator resolves to a real newline in the output."""
        payload = {
            "nodes": [
                {
                    "id": "l1", "type": "text_input",
                    "data": {"label": "L1", "config": {"value": "line1"}, "is_output": False}
                },
                {
                    "id": "l2", "type": "text_input",
                    "data": {"label": "L2", "config": {"value": "line2"}, "is_output": False}
                },
                {
                    "id": "join", "type": "text_join",
                    # Frontend stores literal backslash-n, not a real newline
                    "data": {"label": "Join", "config": {"separator": "\\n"}, "is_output": False}
                },
            ],
            "edges": [
                {"id": "e1", "source": "l1", "target": "join", "targetHandle": "a"},
                {"id": "e2", "source": "l2", "target": "join", "targetHandle": "b"},
            ],
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["join"]["success"] is True
        # _resolve_separator should have turned \\n into a real newline
        assert data["join"]["value"] == "line1\nline2"

    def test_combined_math_and_text_flow(self):
        """Flow combining math and text nodes: computes 6+4=10, joins with a label string."""
        payload = {
            "nodes": [
                {
                    "id": "n6", "type": "number_input",
                    "data": {"label": "6", "config": {"value": 6}, "is_output": False}
                },
                {
                    "id": "n4", "type": "number_input",
                    "data": {"label": "4", "config": {"value": 4}, "is_output": False}
                },
                {
                    "id": "math", "type": "math_operation",
                    "data": {"label": "Add", "config": {"operation": "add"}, "is_output": False}
                },
                {
                    "id": "label-txt", "type": "text_input",
                    "data": {"label": "Label", "config": {"value": "Result:"}, "is_output": False}
                },
                {
                    "id": "join", "type": "text_join",
                    "data": {"label": "Join", "config": {"separator": " "}, "is_output": False}
                },
                {
                    "id": "out", "type": "text_output",
                    "data": {"label": "Out", "config": {}, "is_output": True}
                },
            ],
            "edges": [
                {"id": "e1", "source": "n6", "target": "math", "targetHandle": "a"},
                {"id": "e2", "source": "n4", "target": "math", "targetHandle": "b"},
                # math result (10) feeds into text_join as handle 'b' — coerced to "10"
                {"id": "e3", "source": "label-txt", "target": "join", "targetHandle": "a"},
                {"id": "e4", "source": "math", "target": "join", "targetHandle": "b"},
                {"id": "e5", "source": "join", "target": "out", "targetHandle": "input"},
            ],
        }

        response = client.post("/api/v1/engine/run", json=payload)
        assert response.status_code == 200
        data = response.json()

        # math: 6 + 4 = 10
        assert data["math"]["success"] is True
        assert data["math"]["value"] == 10

        # join: "Result:" + " " + "10" (int coerced to str) = "Result: 10"
        assert data["join"]["success"] is True
        assert data["join"]["value"] == "Result: 10"

        assert data["out"]["success"] is True

