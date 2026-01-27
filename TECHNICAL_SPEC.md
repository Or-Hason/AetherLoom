# Technical Specifications (v1)

## 1. Data Structures (JSON Schema)

The core data structure stored in the database and passed between Frontend and Backend.

### Node Schema

Every node in the flow must adhere to this structure:

```json
{
  "id": "uuid-string",
  "type": "string",
  "position": { "x": 0, "y": 0 },
  "data": {
    "label": "Node Label",
    "value": null, // optional
    "config": {},
    "is_output": false
  }
}
```

**Field Breakdown:**

- `type`: The logic type (e.g., '`input_number`', '`math_operation`').
- `value`: The runtime value (current state).
- `config`: Static configuration (e.g., which math operation to perform).

### Edge Schema

Represents the connection between two nodes.

```json
{
  "id": "uuid-string",
  "source": "node-source-id",
  "target": "node-target-id",
  "sourceHandle": "output-handle-id",
  "targetHandle": "input-handle-id"
}
```

---

## 2. Backend Architecture (FastAPI)

### Pydantic Models (`backend/app/schemas.py`)

Strict typing is required for all API interactions:

- **Position**: `x` (float), `y` (float)
- **NodeData**: `label` (str), `value` (Optional[Any]), `config` (Optional[Dict])
- **Node**: `id` (str), `type` (Literal), `position` (Position), `data` (NodeData)
- **Edge**: `id` (str), `source` (str), `target` (str), `sourceHandle` (Optional[str]), `targetHandle` (Optional[str])
- **FlowExecutionRequest**: `nodes` (List[Node]), `edges` (List[Edge])

### API Endpoints (`backend/app/main.py`)

#### 1. Health Check

- **Method**: `GET`
- **Path**: `/api/v1/health`
- **Response**:
  `{"status": "ok", "version": "0.1.0", "service": "AetherLoom Cortex"}`

#### 2. Run Flow (Execution Engine)

- **Method**: `POST`
- **Path**: `/api/v1/engine/run`
- **Body**: `FlowExecutionRequest` schema.
- **Logic**:
  1.  Parse the graph.
  2.  Validate connections.
  3.  Execute logic (Topological sort or immediate execution for v1).
  4.  Return results.
- **Response**: Dictionary mapping Node IDs to their final results.
