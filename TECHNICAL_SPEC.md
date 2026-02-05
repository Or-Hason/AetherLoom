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

- **NodeData**:
    * `label` (str) - (Default: "Node").
    * `value` (Optional[Any]) - For initial values (e.g., hardcoded input inputs).
    * `config` (Dict[str, Any]) - Static configuration (Default: `{}`).
    * `is_output` (bool) - Marks if this node displays final results (Default: `False`).
- **Node**: `id` (str), `type` (str), `data` (NodeData)
- **Edge**: `id` (str), `source` (str), `target` (str), `sourceHandle` (Optional[str]), `targetHandle` (Optional[str])
- **FlowExecutionRequest**: `nodes` (List[Node]), `edges` (List[Edge])
- **ExecutionResult**: `execution_id` (str), `node_results` (Dict), `status` (success/failed), `error` (Optional[str])

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

---

## 3. Execution Engine (Algorithms & Base)

The engine must support dependency resolution and modular block execution.

### Base Block (`from abc import ABC`)
**All executable blocks** (Inputs, Processors, Outputs) must inherit from `BaseBlock`.
* **Path**: `backend/app/blocks/base.py`
* **Required Method**: `def run(self, inputs: Dict[str, Any]) -> BlockResult`

### Topological Sort (Kahn's Algorithm)
To determine execution order.
* **Path**: `backend/app/engine/topology.py`
* **Logic**:
    1. Build an **adjacency list** graph representation.
    2. Calculate **in-degrees** for all nodes.
    3. Use `collections.deque` for an efficient queue of nodes with 0 in-degree (Start Nodes).
    4. Process the queue to generate the sorted execution list, reducing in-degree of neighbors.
(*Note*: In v1, detect cycles and raise an error. Infinite loops are not supported yet).

---

## 4. Standard Block Definitions (v1)

### Math Operation
* **Type**: `math_operation`
* **Config Schema**:
  ```python
  class MathBlockConfig(BaseModel):
      operation: Literal["add", "subtract", "multiply", "divide"] = "add"
  ```
* **Behavior**: Performs the selected math operation on inputs.