import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analysis, auth, users

app = FastAPI(
    title="PRR Automation API",
    description="API for analyzing architecture diagrams and generating reliability reviews",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to the PRR Automation API",
        "docs": "/docs",
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)