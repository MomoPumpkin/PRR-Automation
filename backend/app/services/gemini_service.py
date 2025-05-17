import os
import google.generativeai as genai
from PIL import Image
from typing import Dict, Any, Optional, List
from ..models.analysis import AnalysisType, AnalysisRequest
import json
import logging
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
logger.info(f"Using Gemini API key: {GEMINI_API_KEY[:5]}...{GEMINI_API_KEY[-5:] if GEMINI_API_KEY else None}")
genai.configure(api_key=GEMINI_API_KEY)

# Prompts for different analysis types
SYSTEM_ANALYSIS_PROMPT = """
# ENHANCED SYSTEM ANALYSIS PROMPT WITH NALSD & STAMP METHODOLOGIES

I am an SRE engineer analyzing a system architecture design diagram using Google's Non-Abstract Large System Design (NALSD) approach combined with the System-Theoretic Accident Model and Processes (STAMP) methodology. I need a comprehensive System Analysis that includes:

## 1. NALSD FOUNDATION ANALYSIS
### Architecture Component Inventory:
- Identify all components in the architecture (services, databases, queues, etc.)
- Classify components by type (stateless, stateful, data store, messaging, etc.)
- Document the purpose and function of each component
- Identify component relationships and dependencies

### Capacity Planning:
- Calculate required resources (CPU, memory, storage, network) for each component
- Determine scaling requirements based on expected load
- Identify resource constraints and bottlenecks
- Analyze data volume and throughput requirements
- Use specific numbers and quantitative analysis for all calculations

### Basic Design Viability:
- Evaluate if the design is possible within typical constraints
- Identify areas where the design can be optimized (e.g., improving from O(N) to O(log N))
- Assess algorithmic and architectural efficiency

### Scaled Design Analysis:
- Determine if the design can scale given hardware, network, and other constraints
- Evaluate what distributed design modifications would be needed at scale
- Apply "the numbers everyone should know" for latency and throughput calculations

## 2. RELIABILITY ASSESSMENT
### Single Points of Failure (SPOFs):
- Identify all SPOFs in the system
- Analyze failure impact and blast radius for each component
- Assess redundancy and failover mechanisms
- Create a control structure diagram showing relationships between components

### Resilience Mechanisms:
- Evaluate disaster recovery capabilities
- Assess data persistence and storage strategies
- Analyze circuit breakers, retries, and backoff mechanisms
- Identify fault isolation boundaries

### Degradation Modes:
- Document graceful degradation strategies
- Identify critical vs. non-critical service paths
- Define service level indicators (SLIs) and service level objectives (SLOs)
- Assess the system's ability to maintain core functionality during partial failures

## 3. STAMP-BASED SAFETY ANALYSIS
### Control Structure Mapping:
- Create a hierarchical control structure showing:
  * Controllers (services that make decisions)
  * Actuators (components that implement changes)
  * Controlled processes (the operations being managed)
  * Sensors (monitoring and feedback mechanisms)

### Hazard Analysis:
- Identify potential hazard states (conditions that could lead to system failure)
- Document unsafe control actions (UCAs) that could lead to hazards
- Analyze control algorithm flaws that could lead to failure
- Assess process model inconsistencies

### Feedback Mechanisms:
- Evaluate monitoring and observability solutions
- Assess metrics collection capabilities
- Review distributed tracing implementation
- Identify monitoring gaps and alerting capabilities
- Evaluate the effectiveness of system feedback loops

## 4. SCALABILITY ANALYSIS
- Assess horizontal and vertical scaling capabilities
- Identify potential scaling limitations
- Evaluate load balancing strategies
- Analyze caching mechanisms
- Review data partitioning approaches

## 5. SECURITY EVALUATION
- Identify authentication and authorization mechanisms
- Assess network security boundaries
- Evaluate data encryption (at rest and in transit)
- Review API security patterns
- Identify potential security vulnerabilities

## 6. PERFORMANCE CONSIDERATIONS
- Identify potential latency hotspots
- Assess resource utilization patterns
- Evaluate throughput capabilities
- Review transaction paths and critical performance metrics
- Identify performance optimization opportunities

## 7. OPERATIONAL COMPLEXITY
- Assess deployment complexity
- Evaluate operational maintenance requirements
- Review dependency management challenges
- Identify operational automation opportunities
- Assess troubleshooting capabilities

## 8. SYSTEM IMPROVEMENT RECOMMENDATIONS
- Prioritized list of reliability enhancements
- Specific recommendations for enhancing system resilience
- Suggested metrics and SLOs to track system health
- Proposed safety control mechanisms
- Implementation timeline and resource requirements

The System Analysis should be detailed and quantitative wherever possible, focusing on both strengths and areas for improvement. It should include specific recommendations for enhancing system reliability, scalability, security, and observability using the NALSD iterative approach and STAMP safety principles.
"""

DESTRUCTIVE_TESTING_PROMPT = """
# ENHANCED DESTRUCTIVE TESTING ANALYSIS PROMPT WITH LITMUS CHAOS INTEGRATION

I am an SRE engineer creating a comprehensive Chaos Testing plan around the attached architecture design. Using industry best practices from chaos engineering and LitmusChaos (a CNCF incubating project), I will provide a complete destructive testing analysis that includes:

## 1. ARCHITECTURE VULNERABILITY ASSESSMENT
### Dependency Analysis:
- Identify all key system dependencies, interconnections, and potential single points of failure (SPOFs) for chaos testing
- Map critical paths and essential services required for core functionality
- Document upstream/downstream dependencies and external integrations
- Categorize dependencies by criticality (critical, high, medium, low)
- Create visual dependency maps highlighting potential failure points

### Control Structure Analysis:
- Identify key controllers and decision points in the system
- Map feedback loops and monitoring mechanisms
- Identify areas with inadequate observability
- Document control boundaries and isolation zones

## 2. STEADY STATE HYPOTHESIS DEFINITION
- Generate the top 10 Steady State Definitions with specific SLIs and health indicators
- Define clear and measurable thresholds for each indicator
- Document precise validation methods for each steady state
- For each component, define:
  * Expected availability SLO (e.g., 99.9% uptime)
  * Performance SLOs (e.g., latency < 100ms at P95)
  * Error rate thresholds (e.g., error rate < 0.1%)
  * Resource utilization expectations
  * Specific health check endpoints and expected responses

## 3. HYPOTHESIS GENERATION
- Develop specific hypotheses for each potential failure point, including:
  * Isolated component failures and expected system behavior
  * Cascading failure scenarios and expected blast radius
  * Recovery time objectives and expected self-healing capabilities
  * Resource exhaustion impacts and degradation patterns
- Ensure hypotheses cover both infrastructure and application layers
- Include multi-component correlated failure scenarios
- Document expected resilience mechanisms that should mitigate each failure

## 4. CHAOS EXPERIMENT DESIGN
- Design a comprehensive test suite using LitmusChaos experiments
- Prioritize experiments based on risk and potential impact
- For each experiment, define:
  * Precise fault injection mechanism
  * Target components and selection criteria
  * Experiment duration and repeatability parameters
  * Success/failure criteria
  * Expected blast radius
  * Abort conditions to prevent unintended damage
  * Monitoring and observability requirements
- Include experiments for:
  * Application/Pod level failures
  * Infrastructure/Node level failures
  * Network degradation scenarios
  * Resource contention situations
  * External dependency failures

## 5. LITMUS CHAOS EXPERIMENT IMPLEMENTATIONS
- Provide detailed LitmusChaos YAML configurations for key experiments including:
  
  ### Pod Chaos Experiments:
  * Pod-Delete Test: Force delete of pods to test self-healing
  * Container-Kill Test: Abruptly terminate containers to test restart policies
  * Pod-Autoscaler Test: Verify horizontal pod autoscaling functionality
  
  ### Resource Chaos Experiments:
  * CPU Stress Test: Inject CPU pressure to test resource limits
  * Memory Hog Test: Consume memory to test OOM handling
  * Disk Fill Test: Fill disk space to test storage pressure handling
  
  ### Network Chaos Experiments:
  * Network Latency Test: Inject latency to test timeout handling
  * Network Loss Test: Create packet loss to test retry mechanisms
  * DNS Error Test: Corrupt DNS to test name resolution resilience
  
  ### State Chaos Experiments:
  * Database Connection Loss Test: Sever database connections
  * Persistent Volume Failure Test: Simulate storage failures
  * State Corruption Test: Test data integrity mechanisms

## 6. RUMSFELD MATRIX - KNOWN UNKNOWNS
- Create a comprehensive Rumsfeld Matrix categorizing:
  * Known Knowns: Failure modes we understand and can predict
  * Known Unknowns: Areas of uncertainty we're aware of
  * Unknown Unknowns: Potential blind spots in our understanding
- Provide actionable insights for addressing Known Unknowns
- Suggest monitoring and detection strategies for Unknown Unknowns
- Include recommendations for ongoing learning and improvement

## 7. AUTOMATED TEST CASE MANAGEMENT
- Define a workflow for integrating chaos testing into CI/CD pipelines
- Document procedures for test case management and results tracking
- Provide guidance on test scheduling and frequency
- Include sample GitHub Actions or CI integration configurations
- Define procedures for creating and documenting new test cases

## 8. BLAST RADIUS ANALYSIS AND CONTROL
- For each experiment, document:
  * Expected impact boundaries
  * Potential for cascading failures
  * Mitigation strategies to control blast radius
  * Safety mechanisms to abort runaway tests
- Visualize blast radius for critical experiments
- Define progressive testing strategy from dev to staging to production

## 9. COMPLETE COVERAGE ASSESSMENT
- Map all experiments to system components to ensure comprehensive coverage
- Identify gaps in test coverage
- Provide recommendations for custom experiments where standard tests are insufficient
- Include a testing roadmap from basic to advanced scenarios

## 10. RECOVERY VALIDATION
- Define specific recovery validation procedures for each experiment
- Document expected recovery patterns and timeframes
- Establish metrics for recovery success/failure
- Define procedures for post-experiment analysis

The analysis will be presented with clear visualizations, actionable findings, and specific YAML configurations ready for implementation. Each recommendation will be prioritized based on risk, implementation effort, and potential impact.

## SAMPLE LITMUS CHAOS EXPERIMENTS

### 1. Pod Delete Experiment (Basic Resilience Test)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: app-pod-delete
  namespace: default
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=sample-app"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            # Duration of chaos in seconds
            - name: TOTAL_CHAOS_DURATION
              value: '60'
            # Interval between successive pod failures (in sec)
            - name: CHAOS_INTERVAL
              value: '10'
            # Force delete the pod
            - name: FORCE
              value: 'false'
            # Percentage of pods to target
            - name: PODS_AFFECTED_PERC
              value: '50'
"""

PRR_PROMPT = """
# ENHANCED PRODUCTION RELIABILITY REVIEW (PRR) PROMPT

I am an SRE engineer creating a comprehensive Production Reliability Review (PRR) document based on Google's SRE methodology. Using the System Analysis and Destructive Testing Analysis generated for this architecture, I will create a thorough PRR that evaluates the production readiness of the system and provides actionable recommendations to achieve target reliability levels.

## 1. EXECUTIVE SUMMARY
- Provide a concise overview of the service's purpose, architecture, and critical reliability considerations
- Summarize key findings, risks, and recommendations prioritized by impact
- Present a reliability readiness score and qualification status (Ready/Not Ready/Conditionally Ready)
- Highlight critical blockers that must be addressed before production deployment
- Identify the level of SRE support recommended based on service complexity and criticality

## 2. APPLICATION OVERVIEW
### Service Description:
- Detailed description of the service's purpose and business significance
- Target user base and expected usage patterns
- Critical business functions and service tier classification
- Production deployment timeline and key milestones

### Architecture Assessment:
- Comprehensive component inventory with detailed dependency mapping
- Visual representation of the system architecture highlighting control points
- Assessment of architectural patterns and their impact on reliability
- Identification of high-risk components and potential failure domains
- Technical stack evaluation and infrastructure details
- Evaluation of stateless vs. stateful components and data persistence strategies

### Risk Classification:
- Service criticality assessment (Tier 1/2/3) with justification
- Business impact analysis for service degradation or outage scenarios
- Data sensitivity classification and compliance requirements
- Assessment of blast radius for potential failures
- Risk matrix mapping likelihood and impact for identified risks

## 3. RELIABILITY REQUIREMENTS
### Service Level Objectives (SLOs):
- Clearly defined availability targets with rationale based on service tier
- Latency SLOs at critical percentiles (p50, p90, p99, p99.9)
- Throughput requirements and capacity planning projections
- Other quality metrics specific to the service function
- Documentation of how SLOs were derived (data-based or stakeholder-defined)

### Error Budget Policy:
- Defined error budget based on SLO targets
- Explicit consequences for breaching error budgets
- Escalation procedures for approaching or exceeding budgets
- Process for incorporating reliability improvements when budgets are exhausted
- Error budget allocation strategy across various system components

### Critical User Journeys:
- Identification and documentation of essential user flows
- Reliability expectations and success criteria for each journey
- Mapping of technical dependencies for each critical path
- Service degradation tiers and fallback mechanisms

## 4. RISK ASSESSMENT
### Single Points of Failure (SPOFs):
- Comprehensive inventory of all identified SPOFs
- Impact assessment for each SPOF
- Recommended mitigations with implementation complexity
- Tracking mechanism for SPOF remediation

### Scalability Assessment:
- Current capacity limits and projected growth
- Scaling strategy (horizontal/vertical) for each component
- Resource utilization thresholds and scaling triggers
- Assessment of auto-scaling capabilities and limitations
- Identified scaling bottlenecks and remediation strategies

### Security Vulnerabilities:
- Security assessment findings from threat modeling
- Authentication and authorization mechanisms review
- Data protection measures (encryption, access controls)
- Network security boundaries and segmentation
- API security evaluation and potential vulnerabilities
- Certificate management and rotation processes

### Data Integrity and Durability:
- Data backup and recovery procedures
- Data consistency mechanisms and failure modes
- Retention policies and compliance verification
- Data loss scenarios and mitigation strategies
- Cross-region/zone data replication assessment

### Third-Party Dependencies:
- Inventory of external services and their reliability profiles
- Dependency failure impact analysis
- Fallback mechanisms for critical dependencies
- Vendor SLA alignment with service SLOs
- Contingency plans for third-party outages

## 5. OBSERVABILITY ASSESSMENT
### Monitoring Strategy:
- Metrics coverage assessment for all critical components
- Golden signals implementation (latency, traffic, errors, saturation)
- Custom metrics for service-specific functionality
- Aggregation and visualization strategy (dashboards, tools)
- Gap analysis for missing monitoring coverage

### Alerting Framework:
- Alert definition and thresholds aligned with SLOs
- Alert severity classification and escalation paths
- On-call rotation and escalation procedures
- Alert fatigue assessment and mitigation strategy
- PagerDuty or equivalent integration evaluation

### Logging Implementation:
- Logging coverage and consistency across components
- Log levels, retention, and storage strategy
- Sensitive data handling in logs
- Log aggregation and search capabilities
- Correlation mechanisms for distributed transactions

### Distributed Tracing:
- Tracing implementation assessment
- Sampling strategy and overhead evaluation
- Span naming conventions and consistency
- Cross-service trace propagation verification
- Trace visualization and analysis tools

### Dashboard Requirements:
- SLO tracking dashboards
- Resource utilization dashboards
- User journey success/failure dashboards
- Dependency health dashboards
- Business metrics correlation dashboards

## 6. DESTRUCTIVE TESTING RESULTS
### Chaos Engineering Approach:
- Summary of chaos testing methodology 
- Testing environment and isolation mechanisms
- Test coverage and prioritization strategy
- Tools and frameworks utilized

### Key Findings from Destructive Tests:
- Component failure resilience assessment
- Recovery pattern analysis and shortcomings
- Performance degradation responses
- Resource exhaustion handling
- Network failure tolerance

### Resilience Gaps:
- Identified weaknesses in failure handling
- Recovery time objective (RTO) misalignments
- Self-healing capability gaps
- Fault isolation limitations
- Missing or inadequate circuit breakers

### Litmus Chaos Experiment Results:
- Detailed findings from each chaos experiment
- Success/failure analysis for each test
- Unexpected behaviors and their root causes
- Metrics impact during chaos scenarios
- Remediation recommendations from test results

## 7. OPERATIONAL READINESS
### Deployment Strategy:
- Evaluation of CI/CD pipeline and deployment automation
- Progressive rollout capabilities (canary, blue/green)
- Feature flag implementation and testing
- Deployment frequency and batch size assessment
- Rollback procedures and verification

### Configuration Management:
- Configuration change control process
- Environment configuration consistency
- Secret management and rotation
- Feature flag governance
- Configuration validation mechanisms

### Incident Response:
- Incident detection and triage procedures
- Escalation paths and on-call rotation
- Communication templates and stakeholder notification
- Incident classification framework
- Post-incident review process

### Runbooks and Documentation:
- Inventory of operational procedures
- Common failure scenario runbooks
- Debugging guides and troubleshooting procedures
- Recovery playbooks for critical failures
- Knowledge base accessibility and maintenance

### Capacity Planning:
- Resource utilization projections
- Scaling thresholds and triggers
- Growth forecasting methodology
- Resource reservation strategy
- Cost optimization approach

## 8. RELIABILITY ROADMAP
### Critical Remediation Items:
- Prioritized list of blockers for production readiness
- Timeline and ownership for addressing critical gaps
- Required verification methods for remediation
- Interim risk mitigation strategies

### Short-Term Improvements (0-3 months):
- High-impact reliability enhancements
- Implementation timeline and resource requirements
- Expected reliability improvements
- Validation criteria for success

### Medium-Term Initiatives (3-6 months):
- Architectural improvements for resilience
- Tooling enhancements for observability
- Process improvements for operational efficiency
- Testing framework expansions

### Long-Term Strategy (6+ months):
- Significant architectural evolutions
- Organizational capability building
- Advanced reliability engineering initiatives
- Continuous improvement framework

## 9. APPENDICES
### A. SLO Definitions and Calculations:
- Detailed SLI implementation specs
- Measurement methodology
- Exclusion criteria
- Historical performance data

### B. Architecture Diagrams:
- Detailed component diagrams
- Network topology
- Data flow diagrams
- Dependency graphs

### C. Risk Register:
- Comprehensive risk inventory
- Probability and impact assessment
- Mitigation status
- Risk ownership

### D. Chaos Testing Reports:
- Detailed experiment configurations
- Raw test results
- Failure scenarios explored
- Recovery metrics

### E. Readiness Checklist:
- Production readiness criteria
- Compliance status for each item
- Remediation plans for gaps
- Sign-off requirements

The PRR document will be comprehensive and data-driven, highlighting both strengths and reliability gaps in the system. It will provide actionable recommendations for improving the overall reliability posture of the application, with clear prioritization based on risk and impact.

## SAMPLE SLO DEFINITIONS

```yaml
# Availability SLO
service: payment-processing-api
slo_name: availability
slo_description: The proportion of successful API requests
slo_target: 99.95%
measurement_window: 28 days
sli_metric:
  counter_metric_name: "requests_total"
  success_metric_name: "successful_requests_total"
  calculation: "successful_requests_total / requests_total"
error_budget_policy:
  burn_rate_threshold: 2.0
  alert_notification_channel: "payment-team-pagerduty"
  consequence_threshold: 
    yellow: 50%
    red: 90%
  consequences:
    yellow: "Begin incident response procedures"
    red: "Halt all non-critical deployments and feature work"
"""

async def analyze_diagram(file_path: str, analysis_type: AnalysisType, description: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze an architecture diagram using Gemini API.
    
    Args:
        file_path: Path to the uploaded diagram image
        analysis_type: Type of analysis to perform
        description: Optional description of the system
    
    Returns:
        Dictionary containing the analysis results
    """
    try:
        # Load the image
        image = Image.open(file_path)
        
        # Select the appropriate prompt based on analysis type
        if analysis_type == AnalysisType.SYSTEM_ANALYSIS:
            prompt = SYSTEM_ANALYSIS_PROMPT
        elif analysis_type == AnalysisType.DESTRUCTIVE_TESTING:
            prompt = DESTRUCTIVE_TESTING_PROMPT
        elif analysis_type == AnalysisType.PRR:
            prompt = PRR_PROMPT
        else:
            raise ValueError(f"Unsupported analysis type: {analysis_type}")
        
        # Add description to the prompt if provided
        if description:
            prompt = f"System Description: {description}\n\n{prompt}"
        
        # Add instructions for structured output
        prompt += "\n\nPlease format your response in a structured way with clear headings, subheadings, and bullet points for better readability."
        
        # Initialize Gemini model
        # Using gemini-1.5-flash as gemini-pro-vision has been deprecated
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate content
        response = model.generate_content([prompt, image])
        
        # Process the response
        if hasattr(response, 'text'):
            result_text = response.text
        else:
            # Handle different response formats
            result_text = str(response)
        
        # Parse the result into a structured format
        result = {
            "raw_text": result_text,
            "structured_data": parse_analysis_result(result_text, analysis_type)
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error analyzing diagram: {str(e)}")
        raise

async def analyze_diagram_all(file_path: str, description: Optional[str] = None) -> Dict[AnalysisType, Dict[str, Any]]:
    """
    Analyze an architecture diagram using Gemini API for all three types of analysis.
    
    Args:
        file_path: Path to the uploaded diagram image
        description: Optional description of the system
    
    Returns:
        Dictionary containing the analysis results for all three types
    """
    try:
        results = {}
        
        # Perform all three types of analysis
        for analysis_type in [AnalysisType.SYSTEM_ANALYSIS, AnalysisType.DESTRUCTIVE_TESTING, AnalysisType.PRR]:
            result = await analyze_diagram(file_path, analysis_type, description)
            results[analysis_type] = result
        
        return results
        
    except Exception as e:
        logger.error(f"Error analyzing diagram for all types: {str(e)}")
        raise

def extract_section(sections: Dict[str, str], possible_keys: List[str]) -> str:
    """
    Extract a section from the sections dictionary using a list of possible keys.
    
    Args:
        sections: Dictionary of sections
        possible_keys: List of possible keys for the section
    
    Returns:
        The content of the section if found, otherwise an empty string
    """
    for key in possible_keys:
        for section_key in sections.keys():
            if key in section_key:
                return sections[section_key]
    
    return ""

def parse_analysis_result(text: str, analysis_type: AnalysisType) -> Dict[str, Any]:
    """
    Parse the raw text response from Gemini into a structured format.
    
    Args:
        text: Raw text response from Gemini
        analysis_type: Type of analysis performed
    
    Returns:
        Structured data based on the analysis type
    """
    # If the text is empty, return an empty structure
    if not text:
        return {"text": "No analysis data available"}
    
    # Split the text into sections based on headings
    sections = {}
    current_section = "overview"
    current_content = []
    
    # More aggressive heading detection
    heading_patterns = [
        # Markdown headings
        r'^#+\s+',
        # ALL CAPS headings
        r'^[A-Z][A-Z\s]+:',
        # Numbered headings
        r'^\d+\.\s+[A-Z]',
        # Common section names
        r'^(ARCHITECTURE|COMPONENTS|RELIABILITY|SCALABILITY|SECURITY|OBSERVABILITY|PERFORMANCE|OPERATIONAL|RECOMMENDATIONS|DEPENDENCY|STEADY STATE|HYPOTHESIS|EXPERIMENT|RUMSFELD|TEST CASE|BLAST RADIUS|COVERAGE|EXECUTIVE SUMMARY|APPLICATION OVERVIEW|REQUIREMENTS|RISK|INCIDENT|ROADMAP)'
    ]
    
    heading_regex = re.compile('|'.join(heading_patterns))
    
    lines = text.split('\n')
    for i, line in enumerate(lines):
        # Check if line is a heading
        if heading_regex.match(line) or (line.strip().isupper() and len(line.strip()) > 3):
            # Save the previous section
            if current_content:
                sections[current_section] = '\n'.join(current_content)
                current_content = []
            
            # Start a new section
            section_name = line.strip().lower()
            # Remove markdown heading symbols
            section_name = re.sub(r'^#+\s+', '', section_name)
            # Remove trailing colons
            section_name = re.sub(r':$', '', section_name)
            # Replace spaces with underscores
            section_name = section_name.replace(' ', '_')
            
            if not section_name:
                section_name = "section_" + str(len(sections))
            
            current_section = section_name
        else:
            current_content.append(line)
    
    # Save the last section
    if current_content:
        sections[current_section] = '\n'.join(current_content)
    
    # If no sections were found, use the entire text as a single section
    if not sections:
        sections["full_text"] = text
    
    # Create structured data based on analysis type
    if analysis_type == AnalysisType.SYSTEM_ANALYSIS:
        # If no sections were found, try to extract sections based on content
        if len(sections) <= 1:
            sections = extract_sections_from_content(text)
        
        structured_data = {
            "components": extract_section(sections, ["components", "architecture_component", "component_analysis", "architecture"]),
            "reliability": extract_section(sections, ["reliability", "reliability_assessment", "spof", "single_points_of_failure"]),
            "scalability": extract_section(sections, ["scalability", "scalability_analysis", "scaling"]),
            "security": extract_section(sections, ["security", "security_evaluation", "authentication", "authorization"]),
            "observability": extract_section(sections, ["observability", "observability_assessment", "monitoring", "logging"]),
            "performance": extract_section(sections, ["performance", "performance_considerations", "latency", "throughput"]),
            "operational_complexity": extract_section(sections, ["operational_complexity", "operations", "deployment", "maintenance"]),
            "recommendations": extract_section(sections, ["recommendations", "improvements", "suggested", "enhancement"])
        }
        
        # If no structured data was found, use the raw text
        if not any(structured_data.values()):
            structured_data = {
                "components": text,
                "reliability": "",
                "scalability": "",
                "security": "",
                "observability": "",
                "performance": "",
                "operational_complexity": "",
                "recommendations": ""
            }
    
    elif analysis_type == AnalysisType.DESTRUCTIVE_TESTING:
        # If no sections were found, try to extract sections based on content
        if len(sections) <= 1:
            sections = extract_sections_from_content(text)
        
        structured_data = {
            "dependency_analysis": extract_section(sections, ["dependency_analysis", "dependencies", "interconnections"]),
            "steady_state_definition": extract_section(sections, ["steady_state_definition", "steady_state", "sli", "slo"]),
            "hypothesis_generation": extract_section(sections, ["hypothesis_generation", "hypotheses", "hypothesis"]),
            "experiment_design": extract_section(sections, ["experiment_design", "experiments", "test_cases", "chaos_testing"]),
            "rumsfeld_matrix": extract_section(sections, ["rumsfeld_matrix", "known_unknowns", "unknown_unknowns"]),
            "test_case_management": extract_section(sections, ["test_case_management", "test_cases", "litmus_chaos"]),
            "blast_radius_analysis": extract_section(sections, ["blast_radius_analysis", "blast_radius", "impact_scope"]),
            "coverage": extract_section(sections, ["coverage", "complete_coverage", "test_coverage"])
        }
        
        # If no structured data was found, use the raw text
        if not any(structured_data.values()):
            structured_data = {
                "dependency_analysis": text,
                "steady_state_definition": "",
                "hypothesis_generation": "",
                "experiment_design": "",
                "rumsfeld_matrix": "",
                "test_case_management": "",
                "blast_radius_analysis": "",
                "coverage": ""
            }
    
    elif analysis_type == AnalysisType.PRR:
        # If no sections were found, try to extract sections based on content
        if len(sections) <= 1:
            sections = extract_sections_from_content(text)
        
        structured_data = {
            "executive_summary": extract_section(sections, ["executive_summary", "summary", "overview"]),
            "application_overview": extract_section(sections, ["application_overview", "application", "overview"]),
            "reliability_requirements": extract_section(sections, ["reliability_requirements", "requirements", "slo", "availability"]),
            "risk_assessment": extract_section(sections, ["risk_assessment", "risks", "vulnerabilities", "spof"]),
            "observability_strategy": extract_section(sections, ["observability_strategy", "observability", "monitoring", "logging"]),
            "destructive_testing_results": extract_section(sections, ["destructive_testing_results", "testing_results", "chaos_testing"]),
            "incident_response": extract_section(sections, ["incident_response", "response", "escalation", "runbook"]),
            "reliability_roadmap": extract_section(sections, ["reliability_roadmap", "roadmap", "improvements"])
        }
        
        # If no structured data was found, use the raw text
        if not any(structured_data.values()):
            structured_data = {
                "executive_summary": text,
                "application_overview": "",
                "reliability_requirements": "",
                "risk_assessment": "",
                "observability_strategy": "",
                "destructive_testing_results": "",
                "incident_response": "",
                "reliability_roadmap": ""
            }
    
    else:
        structured_data = {"text": text}
    
    # Add the full sections dictionary for complete coverage
    structured_data["sections"] = sections
    
    return structured_data

def extract_sections_from_content(text: str) -> Dict[str, str]:
    """
    Extract sections from content based on common section keywords.
    
    Args:
        text: Raw text to extract sections from
    
    Returns:
        Dictionary of sections
    """
    sections = {}
    
    # Define common section keywords for each analysis type
    system_analysis_keywords = [
        "architecture", "components", "reliability", "scalability", "security", 
        "observability", "performance", "operational", "recommendations"
    ]
    
    destructive_testing_keywords = [
        "dependency", "dependencies", "steady state", "hypothesis", "experiment", 
        "rumsfeld", "test case", "blast radius", "coverage"
    ]
    
    prr_keywords = [
        "executive summary", "application overview", "reliability requirements", 
        "risk assessment", "observability strategy", "destructive testing", 
        "incident response", "reliability roadmap"
    ]
    
    # Combine all keywords
    all_keywords = system_analysis_keywords + destructive_testing_keywords + prr_keywords
    
    # Try to find sections based on keywords
    for keyword in all_keywords:
        # Look for the keyword followed by a colon or newline
        pattern = re.compile(f"({keyword}:?)[^\n]*\n", re.IGNORECASE)
        matches = pattern.finditer(text)
        
        for match in matches:
            # Find the start of the section
            start_pos = match.end()
            
            # Find the end of the section (next keyword or end of text)
            end_pos = len(text)
            for next_keyword in all_keywords:
                next_pattern = re.compile(f"({next_keyword}:?)[^\n]*\n", re.IGNORECASE)
                next_match = next_pattern.search(text, start_pos)
                if next_match and next_match.start() < end_pos:
                    end_pos = next_match.start()
            
            # Extract the section content
            section_content = text[start_pos:end_pos].strip()
            
            # Add to sections dictionary
            section_key = keyword.lower().replace(" ", "_")
            sections[section_key] = section_content
    
    return sections