# PRR Automation

A comprehensive application for SRE engineers to analyze architecture diagrams and generate various types of analysis:
- System Analysis
- Destructive Testing Plans
- Production Reliability Reviews (PRRs)

## Features

- Upload architecture design diagrams
- Select analysis type (System Analysis, Destructive Testing, or PRR)
- View analysis results in a well-structured format
- Generate and download Litmus Chaos test configurations
- Export analysis results for team sharing
- MCP server integration for programmatic access

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Python, FastAPI
- **AI Integration**: Gemini API for diagram analysis
- **Authentication**: JWT-based authentication
- **Containerization**: Docker and Docker Compose

## Project Structure

```
prr-automation/
├── backend/                  # FastAPI backend
│   ├── app/                  # Application code
│   │   ├── models/           # Data models
│   │   ├── routers/          # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   ├── main.py               # Main application entry point
│   ├── mcp_server.py         # MCP server for integration
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Backend Docker configuration
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   ├── package.json          # Node.js dependencies
│   └── Dockerfile            # Frontend Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── run.sh                    # Script to run the application locally
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Python 3.11+ (accessible via `python` or `python3` command)
- Node.js 18+
- npm or yarn
- Gemini API key

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/prr-automation.git
cd prr-automation
```

2. Set up environment variables:
```bash
# Copy the example .env file
cp backend/.env.example backend/.env

# Edit the .env file with your Gemini API key
nano backend/.env
```

### Running with Docker

The easiest way to run the application is with Docker Compose:

```bash
docker-compose up
```

This will start both the backend and frontend services. The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Running Locally

Alternatively, you can run the application locally using the provided script:

```bash
./run.sh
```

The script will automatically detect whether to use `python` or `python3` command.

Or manually:

#### Backend Setup

```bash
cd backend
# Use python3 if python command is not available
python -m venv venv  # or python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Using the MCP Server

The PRR Automation application includes an MCP (Model Context Protocol) server that allows programmatic access to the analysis functionality.

### Starting the MCP Server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python mcp_server.py  # or python3 mcp_server.py
```

The MCP server will be available at http://localhost:8001.

### MCP Server API

The MCP server provides the following endpoint:

- `POST /analyze_architecture`: Analyze an architecture diagram

Example request:

```json
{
  "diagram_base64": "base64_encoded_image_data",
  "analysis_type": "system_analysis",
  "description": "Optional description of the system"
}
```

Example response:

```json
{
  "result": {
    "raw_text": "Analysis text...",
    "structured_data": {
      "components": [...],
      "single_points_of_failure": [...],
      "recommendations": [...]
    }
  }
}
```

## Troubleshooting

### Python Command Not Found

If you encounter an error like `python: command not found` when running the script, make sure Python is installed and accessible via either `python` or `python3` command. The script will automatically detect which command to use.

### Gemini API Key

Make sure to set your Gemini API key in the `backend/.env` file. Without a valid API key, the analysis functionality will not work.

## License

MIT