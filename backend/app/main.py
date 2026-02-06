import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import FlowExecutionRequest
from app.engine.graph_executor import GraphExecutor, CyclicGraphError

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
    1. Parse the graph structure from nodes and edges.
    2. Perform topological sort to determine execution order.
    3. Validate for cyclic dependencies.
    4. Execute nodes in dependency order.
    5. Return structured execution results.
    """
    logger.info(f"Received flow execution request: {len(request.nodes)} nodes, {len(request.edges)} edges")
    
    try:
        # Initialize the graph executor
        executor = GraphExecutor(nodes=request.nodes, edges=request.edges)
        
        # Execute the flow graph
        results = executor.execute()
        
        logger.info("Flow execution processing completed successfully")
        return results

    except CyclicGraphError as e:
        logger.error(f"Cyclic graph detected: {str(e)}")
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid graph structure: {str(e)}"
        )
    
    except NotImplementedError as e:
        logger.warning(f"Block type not implemented: {str(e)}")
        raise HTTPException(
            status_code=501,
            detail=f"Feature not yet implemented: {str(e)}"
        )
    
    except Exception as e:
        logger.error(f"Error during flow execution: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Internal Server Error during flow execution: {str(e)}"
        )
