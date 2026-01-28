import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import FlowExecutionRequest

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AetherLoom Cortex",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
# TODO: refine allowed origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint to verify service status.
    """
    logger.debug("Health check requested")
    return {"status": "ok", "version": "0.1.0", "service": "AetherLoom Cortex"}

@app.post("/api/v1/engine/run")
async def run_flow(request: FlowExecutionRequest) -> Dict[str, Any]:
    """
    Execute a flow based on the provided nodes and edges.
    
    Logic:
    1. Parse the graph.
    2. Validate connections.
    3. Execute logic.
    4. Return results.
    """
    logger.info(f"Received flow execution request: {len(request.nodes)} nodes, {len(request.edges)} edges")
    
    try:
        # Placeholder for actual execution logic
        # For initialization, we will just acknowledge the request and return empty/mock results
        # In a real implementation, this would invoke the Execution Engine service
        
        results: Dict[str, Any] = {}
        
        # Simple pass-through for V1 initialization
        for node in request.nodes:
            # If the node has a value in its config or data, we might return it?
            # For now just default to None or input value
            results[node.id] = node.data.value

        logger.info("Flow execution processing completed")
        return results

    except Exception as e:
        logger.error(f"Error during flow execution: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error during flow execution")
