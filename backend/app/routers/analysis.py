from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict
from pydantic import BaseModel
from enum import Enum
import os
import uuid
import json
from datetime import datetime
import google.generativeai as genai
from ..services.gemini_service import analyze_diagram, analyze_diagram_all
from ..models.analysis import AnalysisType, AnalysisResult, AnalysisRequest
from .auth import get_current_active_user, User

router = APIRouter()

# Storage paths
UPLOAD_DIR = "uploads"
RESULTS_DIR = "results"

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# In-memory storage for analysis results (replace with database in production)
analysis_results = {}

@router.post("/analysis", response_model=AnalysisResult)
async def create_analysis(
    file: UploadFile = File(...),
    analysis_type: AnalysisType = Form(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new analysis based on an uploaded architecture diagram.
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Generate unique ID for this analysis
    analysis_id = str(uuid.uuid4())
    
    # Save the uploaded file
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{analysis_id}{file_extension}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    try:
        # Process the diagram with Gemini API
        result = await analyze_diagram(
            file_path=file_path,
            analysis_type=analysis_type,
            description=description
        )
        
        # Save the result
        timestamp = datetime.now().isoformat()
        analysis_result = AnalysisResult(
            id=analysis_id,
            user_id=current_user.username,
            analysis_type=analysis_type,
            description=description or "",
            file_name=file.filename,
            file_path=file_path,
            result=result,
            created_at=timestamp,
            updated_at=timestamp
        )
        
        # Store in memory (would be database in production)
        analysis_results[analysis_id] = analysis_result.dict()
        
        # Save to file as well (backup)
        result_path = os.path.join(RESULTS_DIR, f"{analysis_id}.json")
        with open(result_path, "w") as f:
            json.dump(analysis_result.dict(), f, indent=2)
        
        return analysis_result
        
    except Exception as e:
        # Clean up the uploaded file in case of error
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/analysis", response_model=List[AnalysisResult])
async def list_analysis(current_user: User = Depends(get_current_active_user)):
    """
    List all analysis for the current user.
    """
    user_analysis = [
        AnalysisResult(**result)
        for result in analysis_results.values()
        if result["user_id"] == current_user.username
    ]
    return user_analysis

@router.get("/analysis/{analysis_id}", response_model=AnalysisResult)
async def get_analysis(analysis_id: str, current_user: User = Depends(get_current_active_user)):
    """
    Get a specific analysis by ID.
    """
    if analysis_id not in analysis_results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    result = analysis_results[analysis_id]
    
    # Check if the user has access to this analysis
    if result["user_id"] != current_user.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this analysis"
        )
    
    return AnalysisResult(**result)

@router.delete("/analysis/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(analysis_id: str, current_user: User = Depends(get_current_active_user)):
    """
    Delete a specific analysis by ID.
    """
    if analysis_id not in analysis_results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    result = analysis_results[analysis_id]
    
    # Check if the user has access to this analysis
    if result["user_id"] != current_user.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this analysis"
        )
    
    # Delete the file
    file_path = result["file_path"]
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete the result file
    result_path = os.path.join(RESULTS_DIR, f"{analysis_id}.json")
    if os.path.exists(result_path):
        os.remove(result_path)
    
    # Remove from memory
    del analysis_results[analysis_id]
    
    return None

@router.post("/analysis/{analysis_id}/export", status_code=status.HTTP_200_OK)
async def export_analysis(
    analysis_id: str, 
    format: str = Form(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Export an analysis in the specified format.
    """
    if analysis_id not in analysis_results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    result = analysis_results[analysis_id]
    
    # Check if the user has access to this analysis
    if result["user_id"] != current_user.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to export this analysis"
        )
    
    # For now, we only support JSON export
    if format.lower() not in ["json", "pdf", "md"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported export format. Supported formats: json, pdf, md"
        )
    
    # In a real application, we would generate the appropriate format here
    # For now, we'll just return the JSON
    return JSONResponse(content=result)

@router.post("/analysis/all", response_model=Dict[str, AnalysisResult])
async def create_all_analysis(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create all three types of analysis (System Analysis, Destructive Testing, and PRR) based on an uploaded architecture diagram.
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Generate unique ID for this analysis
    analysis_id_base = str(uuid.uuid4())
    
    # Save the uploaded file
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{analysis_id_base}{file_extension}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    try:
        # Process the diagram with Gemini API for all three analysis types
        results = await analyze_diagram_all(
            file_path=file_path,
            description=description
        )
        
        # Save the results
        timestamp = datetime.now().isoformat()
        analysis_results_dict = {}
        
        for analysis_type, result in results.items():
            analysis_id = f"{analysis_id_base}_{analysis_type.value}"
            
            analysis_result = AnalysisResult(
                id=analysis_id,
                user_id=current_user.username,
                analysis_type=analysis_type,
                description=description or "",
                file_name=file.filename,
                file_path=file_path,
                result=result,
                created_at=timestamp,
                updated_at=timestamp
            )
            
            # Store in memory (would be database in production)
            analysis_results[analysis_id] = analysis_result.dict()
            
            # Save to file as well (backup)
            result_path = os.path.join(RESULTS_DIR, f"{analysis_id}.json")
            with open(result_path, "w") as f:
                json.dump(analysis_result.dict(), f, indent=2)
            
            analysis_results_dict[analysis_type.value] = analysis_result
        
        return analysis_results_dict
        
    except Exception as e:
        # Clean up the uploaded file in case of error
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )