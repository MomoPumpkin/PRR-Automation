import os
import json
import base64
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from app.services.gemini_service import analyze_diagram
from app.models.analysis import AnalysisType
import tempfile

app = FastAPI(title="PRR Automation MCP Server")

class AnalyzeArchitectureRequest(BaseModel):
    diagram_base64: str = Field(..., description="Base64-encoded image of the architecture diagram")
    analysis_type: str = Field(..., description="Type of analysis to perform: system_analysis, destructive_testing, or prr")
    description: Optional[str] = Field(None, description="Optional description of the system")

class AnalyzeArchitectureResponse(BaseModel):
    result: Dict[str, Any] = Field(..., description="Analysis result")

@app.post("/analyze_architecture", response_model=AnalyzeArchitectureResponse)
async def analyze_architecture(request: AnalyzeArchitectureRequest):
    """
    Analyze an architecture diagram and generate a reliability analysis.
    """
    try:
        # Decode the base64 image
        image_data = base64.b64decode(request.diagram_base64)
        
        # Save to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            temp_file.write(image_data)
            temp_file_path = temp_file.name
        
        # Determine analysis type
        if request.analysis_type == "system_analysis":
            analysis_type = AnalysisType.SYSTEM_ANALYSIS
        elif request.analysis_type == "destructive_testing":
            analysis_type = AnalysisType.DESTRUCTIVE_TESTING
        elif request.analysis_type == "prr":
            analysis_type = AnalysisType.PRR
        else:
            raise HTTPException(status_code=400, detail=f"Invalid analysis type: {request.analysis_type}")
        
        # Analyze the diagram
        result = await analyze_diagram(
            file_path=temp_file_path,
            analysis_type=analysis_type,
            description=request.description
        )
        
        # Clean up the temporary file
        os.unlink(temp_file_path)
        
        return {"result": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)