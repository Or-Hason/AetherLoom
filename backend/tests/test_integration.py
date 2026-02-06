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
