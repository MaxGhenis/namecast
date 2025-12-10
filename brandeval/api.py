"""FastAPI backend for BrandEval."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from brandeval.evaluator import BrandEvaluator


app = FastAPI(
    title="BrandEval API",
    description="AI-powered brand name evaluation",
    version="0.1.0",
)

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

evaluator = BrandEvaluator()


class EvaluateRequest(BaseModel):
    name: str
    mission: str | None = None


class CompareRequest(BaseModel):
    names: list[str]
    mission: str | None = None


@app.get("/")
def root():
    return {"status": "ok", "service": "brandeval-api"}


@app.post("/evaluate")
def evaluate(request: EvaluateRequest):
    """Evaluate a single brand name."""
    if not request.name or len(request.name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")

    result = evaluator.evaluate(request.name, request.mission)
    return result.to_dict()


@app.post("/compare")
def compare(request: CompareRequest):
    """Compare multiple brand names."""
    if len(request.names) < 2:
        raise HTTPException(status_code=400, detail="Must provide at least 2 names to compare")

    results = [evaluator.evaluate(name, request.mission) for name in request.names]
    winner = max(results, key=lambda r: r.overall_score)

    return {
        "results": [r.to_dict() for r in results],
        "winner": winner.name,
        "winner_score": winner.overall_score,
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
