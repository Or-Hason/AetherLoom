<p align="center">
  <img src="docs/assets/banner.png" alt="AetherLoom Banner" width="100%" />
</p>

<h1 align="center">AetherLoom</h1>

<p align="center">
  <strong>Industrial-Grade Visual Block-Based Automation Platform</strong>
</p>

<p align="center">
  <em>Transform complex workflows into intuitive visual pipelines. Build, connect, and execute — all without writing a single line of code.</em>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-roadmap">Roadmap</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🧭 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Features](#-features)
- [Architecture](#%EF%B8%8F-architecture)
- [Getting Started](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Roadmap](#%EF%B8%8F-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**AetherLoom** is an advanced visual programming environment designed for building sophisticated data transformation and automation workflows. By leveraging an intuitive drag-and-drop interface, users can construct complex processing pipelines through interconnected nodes — each representing a discrete operation in the workflow.

Built on a modern, type-safe foundation with **Next.js 15** and **FastAPI**, AetherLoom delivers a seamless full-stack experience that bridges the gap between visual design and robust backend execution. Whether you're processing data, orchestrating APIs, or building interactive dashboards, AetherLoom provides the tools to bring your ideas to life.

### Why AetherLoom?

- **🎨 Visual-First Design**: Build workflows visually without sacrificing power or flexibility
- **⚡ Real-Time Execution**: Watch your data flow through the pipeline in real-time
- **🔒 Type-Safe Connections**: Intelligent validation prevents invalid node connections
- **🏗️ Industrial Architecture**: Enterprise-ready stack built for scale and maintainability

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <a href="https://reactflow.dev/">
        <img src="https://img.shields.io/badge/React_Flow-1A192B?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Flow" />
      </a>
      <br><sub><b>Canvas Engine</b></sub>
    </td>
    <td align="center" width="96">
      <a href="https://nextjs.org/">
        <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
      </a>
      <br><sub><b>Frontend</b></sub>
    </td>
    <td align="center" width="96">
      <a href="https://fastapi.tiangolo.com/">
        <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
      </a>
      <br><sub><b>Backend</b></sub>
    </td>
    <td align="center" width="96">
      <a href="https://tailwindcss.com/">
        <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
      </a>
      <br><sub><b>Styling</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="96">
      <a href="https://zustand-demo.pmnd.rs/">
        <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
      </a>
      <br><sub><b>State</b></sub>
    </td>
    <td align="center" width="96">
      <a href="https://www.postgresql.org/">
        <img src="https://img.shields.io/badge/PostgreSQL_18-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
      </a>
      <br><sub><b>Database</b></sub>
    </td>
    <td align="center" width="96">
      <a href="https://redis.io/">
        <img src="https://img.shields.io/badge/Redis_8-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
      </a>
      <br><sub><b>Cache</b></sub>
    </td>
    <td align="center" width="96">
      <a href="https://www.docker.com/">
        <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
      </a>
      <br><sub><b>Containers</b></sub>
    </td>
  </tr>
</table>

### Additional Technologies

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=flat-square&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Lucide](https://img.shields.io/badge/Lucide_Icons-F56040?style=flat-square&logo=lucide&logoColor=white)](https://lucide.dev/)

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>

---

## ✨ Features

### 🖼️ Visual Canvas

An infinite, pan-and-zoom canvas powered by React Flow, providing a fluid workspace for constructing visual workflows.

- **Drag-and-Drop Interface**: Intuitive node placement from the sidebar
- **Grid Background**: Precision alignment with dotted grid patterns
- **Smooth Animations**: Fluid transitions and visual feedback
- **Dark Mode Support**: Eye-friendly theme switching

### 🧱 Custom Node Components

Purpose-built node types with status indicators and specialized configurations:

| Node Type       | Description                                               | Status LED                                   |
| --------------- | --------------------------------------------------------- | -------------------------------------------- |
| **Input Node**  | Text data entry point                                     | 🔘 Idle / 🔵 Running / 🟢 Success / 🔴 Error |
| **Logic Node**  | Mathematical operations (Add, Subtract, Multiply, Divide) | 🔘 Idle / 🔵 Running / 🟢 Success / 🔴 Error |
| **Output Node** | Result display endpoint                                   | 🔘 Idle / 🔵 Running / 🟢 Success / 🔴 Error |

Each node features:

- **Status LED Indicator**: Real-time execution state visualization
- **Lucide Icons**: Clean, consistent iconography
- **Tailwind Styling**: Modern, responsive design with dark mode

### 🔗 Connection Validation

Robust client-side validation ensures graph integrity:

```typescript
// Self-connection prevention
if (source === target) return false;

// Single-input enforcement per handle
const hasExistingInputConnection = edges.some(
  (edge) =>
    edge.target === target && edge.targetHandle === connection.targetHandle,
);

// Cycle detection using recursive outgoer traversal
if (checkForCycles(targetNode, sourceNode, nodes, edges)) return false;
```

**Validation Rules:**

- ✅ Prevents self-referential connections
- ✅ Enforces single-input per handle
- ✅ Detects and blocks circular dependencies
- ✅ Validates node existence before connection

### 📦 Type-Safe State Management

Centralized flow state management with Zustand:

```typescript
export type FlowState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
};
```

### 🔧 Backend API

RESTful API built with FastAPI and Pydantic for strict type enforcement:

```python
class Node(BaseModel):
    id: str
    type: str
    position: Position
    data: NodeData

class FlowExecutionRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
```

**Endpoints:**

- `GET /health` — Service health check
- `POST /api/v1/engine/run` — Execute flow graph

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>

---

## 🏗️ Architecture

```
AetherLoom/
├── frontend/                    # Next.js 15 Application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   ├── components/
│   │   │   ├── nodes/           # Custom node components
│   │   │   │   ├── InputNode.tsx
│   │   │   │   ├── LogicNode.tsx
│   │   │   │   └── OutputNode.tsx
│   │   │   └── Sidebar.tsx      # Node palette sidebar
│   │   ├── store/
│   │   │   └── useFlowStore.ts  # Zustand state management
│   │   ├── utils/
│   │   │   └── flowValidation.ts # Connection validation logic
│   │   └── lib/
│   │       └── utils.ts         # Utility functions (cn)
│   └── package.json
│
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── main.py              # Application entry point
│   │   └── schemas.py           # Pydantic models
│   └── requirements.txt
│
├── docker-compose.yml           # PostgreSQL 18 + Redis 8
├── .env.example                 # Environment template
└── README.md
```

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>

---

## 🚀 Quick Start

### Prerequisites

> [!NOTE]
> **Docker Desktop** and **WSL 2** (Windows Subsystem for Linux) are **required** for local development. Ensure Docker Desktop is running before proceeding.

- **Docker Desktop** (v4.0+) with WSL 2 backend
- **Node.js** (v18.17+)
- **Python** (v3.12+)
- **pnpm** or **npm**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Or-Hason/AetherLoom.git
   cd AetherLoom
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your preferred values
   ```

3. **Start infrastructure services**

   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL 18 (port 5432)
   - Redis 8 (port 6379)

### Running the Application

**Backend (FastAPI)**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

**Frontend (Next.js)**

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

> [!WARNING]
> Ensure Docker containers are running before starting the backend. The application requires PostgreSQL and Redis connections.

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>

---

## 🗺️ Roadmap

AetherLoom follows a structured milestone-based development plan:

### v1.0 — Operational MVP ✨ _Current_

The foundation of AetherLoom, establishing core visual programming capabilities.

- [x] Visual canvas with React Flow integration
- [x] Custom node components (Input, Logic, Output)
- [x] Status LED indicators for execution state
- [x] Connection validation (cycles, self-loops, single-input)
- [x] Zustand state management
- [x] FastAPI backend with Pydantic schemas
- [x] Docker Compose development environment
- [ ] Graph execution engine (topological sort)
- [ ] Core I/O components (text, number)
- [ ] Math & text operation blocks
- [ ] Type-safe connection validation
- [ ] Execution results & observability logs

### v2.0 — Files, Projects & Users 📁

Enabling persistence, authentication, and rich media workflows.

- [ ] Supabase integration & user authentication
- [ ] Project persistence (save/load flows)
- [ ] Sidebar search & category filtering
- [ ] Workspace settings popup
- [ ] Rich media nodes (image, audio)
- [ ] Document processing (PDF, Word, Excel)
- [ ] Professional nodes (resume, social links)

### v3.0 — Visual Programming & Logic 🎨

Advanced logic gates and visual control flow for complex automation.

- [ ] Control Flow (For/While loops, If/Else conditions)
- [ ] Undo/Redo system (managed via Zustand)
- [ ] Live data flow visualization (Socket.io - Event Emitter)
- [ ] Advanced block inner settings
- [ ] Error Stringing nodes
- [ ] Multi-functional Timers (Delay/Countdown)
- [ ] Binary switches (with custom internal logic)
- [ ] Python & TypeScript execution code blocks (with input protection)
- [ ] Dark/Light mode
- [ ] Advanced automatic Zoom system (Zoom to Running Node, Zoom to failed Node)

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

See the [LICENSE](LICENSE) file for details.

<p align="right">(<a href="#-table-of-contents">back to top</a>)</p>

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Or-Hason">Or Hason</a></sub>
</p>
