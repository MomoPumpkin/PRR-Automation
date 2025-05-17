from pydantic import BaseModel, Field
from enum import Enum
from typing import Dict, Any, Optional, List
from datetime import datetime

class AnalysisType(str, Enum):
    SYSTEM_ANALYSIS = "system_analysis"
    DESTRUCTIVE_TESTING = "destructive_testing"
    PRR = "prr"

class AnalysisRequest(BaseModel):
    analysis_type: AnalysisType
    description: Optional[str] = None
    file_path: str

class ComponentType(str, Enum):
    STATELESS = "stateless"
    STATEFUL = "stateful"
    DATA_STORE = "data_store"
    MESSAGING = "messaging"
    LOAD_BALANCER = "load_balancer"
    GATEWAY = "gateway"
    CACHE = "cache"
    OTHER = "other"

class Component(BaseModel):
    name: str
    component_type: ComponentType
    description: str
    dependencies: List[str] = []

class SystemAnalysisResult(BaseModel):
    components: List[Component] = []
    single_points_of_failure: List[str] = []
    bottlenecks: List[str] = []
    scalability_issues: List[str] = []
    security_concerns: List[str] = []
    observability_gaps: List[str] = []
    performance_considerations: List[str] = []
    operational_complexity: List[str] = []
    recommendations: List[str] = []

class TestCase(BaseModel):
    name: str
    description: str
    components_affected: List[str]
    expected_impact: str
    recovery_mechanism: str
    validation_criteria: str

class DestructiveTestingResult(BaseModel):
    dependencies: List[Dict[str, Any]] = []
    steady_state_definitions: List[str] = []
    hypotheses: List[str] = []
    test_cases: List[TestCase] = []
    known_unknowns: List[str] = []
    unknown_unknowns: List[str] = []
    blast_radius_analysis: Dict[str, Any] = {}
    recommendations: List[str] = []

class PRRSection(BaseModel):
    title: str
    content: str

class PRRResult(BaseModel):
    executive_summary: str
    application_overview: str
    reliability_requirements: str
    risk_assessment: str
    observability_strategy: str
    destructive_testing_results: str
    incident_response: str
    reliability_roadmap: str
    sections: List[PRRSection] = []
    recommendations: List[str] = []

class AnalysisResult(BaseModel):
    id: str
    user_id: str
    analysis_type: AnalysisType
    description: str = ""
    file_name: str
    file_path: str
    result: Dict[str, Any]
    created_at: str
    updated_at: str