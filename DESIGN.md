# AetherLoom - Visual Logic Playground

## Project Overview

AetherLoom is a high-performance, web-based visual programming environment. It allows users to build complex logical workflows using a drag-and-drop interface, execute them in real-time, and observe data flow through a modular "Node & Edge" architecture.


### Primary Goals

* **Professional Showcase**: Demonstrating a transition from ATE Engineering to Fullstack Development.

* **Observability**: Providing live visual feedback during logic execution to ensure transparency and debugging efficiency.

* **Extensibility**: A foundation built to eventually support AI integrations and external hardware control.

---

## Technical Architecture

### 1. Monorepo Structure

The project is divided into two main components to ensure separation of concerns and scalability:

* **`/frontend`**: Built with Next.js (App Router), TypeScript, and Tailwind CSS. It handles the UI/UX and the interactive canvas using **React Flow**.

* **`/backend`**: Built with FastAPI (Python) to manage logic execution, data processing, and AI integrations.


### 2. State Management & Data Modeling

* **Frontend State**: Managed via **Zustand** for lightweight and reactive handling of the canvas state.

* **Data Persistence**:
    * **PostgreSQL (SQL)**: Storing users, projects, and structured metadata via **Drizzle ORM**.

    * **JSONB (Relational NoSQL)**: The logic "Flow" (nodes and edges) is stored as a dynamic JSON object within PostgreSQL to allow flexibility in node types .

---

## Roadmap Summary

### Phase 1: MVP (Versions 1-3)

* Core canvas engine with basic Logic Blocks (Math, Text, Timers) .

* User authentication and project saving.

* Live Execution Engine with WebSocket feedback.


### Phase 2: Advanced Logic & Personal Branding (Versions 4-5)

* Implementation of Loops (For/While) and Conditions (If/Else) on the canvas .

* Dedicated blocks for recruiter engagement (Resume display, LinkedIn integration) .


### Phase 3: AI & Scalability (Versions 6-10)

* AI-driven blocks for image description, text-to-speech, and vision processing .

* Advanced debugging tools and team collaboration features.

---

## Development Standards

* **Strict Typing**: All components and endpoints must use TypeScript interfaces or Pydantic models.

* **Security**: All inputs must be sanitized, especially within Python execution blocks.

* **Modularity**: Code must follow SOLID principles, with a clear separation between business logic and UI components.
