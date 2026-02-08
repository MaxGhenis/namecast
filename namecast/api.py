"""FastAPI backend for Namecast."""

import json
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from namecast.evaluator import BrandEvaluator, NamecastWorkflow, NameCandidate


NAMECAST_API_PASSWORD = os.environ.get("NAMECAST_API_PASSWORD")

app = FastAPI(
    title="Namecast API",
    description="AI-powered brand name oracle",
    version="0.1.0",
)

# Allow CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:3000",
        "https://maxghenis.github.io",
        "https://namecast.ai",
        "https://www.namecast.ai",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

evaluator = BrandEvaluator()
workflow = NamecastWorkflow()


def check_password(request: Request):
    """Validate API password if one is configured."""
    if not NAMECAST_API_PASSWORD:
        return
    password = request.headers.get("X-API-Password", "")
    if password != NAMECAST_API_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid API password")


class EvaluateRequest(BaseModel):
    name: str
    mission: str | None = None


class CompareRequest(BaseModel):
    names: list[str]
    mission: str | None = None


class WorkflowRequest(BaseModel):
    project_description: str
    name_ideas: list[str] | None = None
    generate_count: int = 10
    max_to_evaluate: int = 5


@app.get("/")
def root():
    return {"status": "ok", "service": "namecast-api"}


@app.post("/evaluate")
def evaluate(request: EvaluateRequest, req: Request):
    """Evaluate a single brand name."""
    check_password(req)

    if not request.name or len(request.name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")

    result = evaluator.evaluate(request.name, request.mission)
    return result.to_dict()


@app.post("/compare")
def compare(request: CompareRequest, req: Request):
    """Compare multiple brand names."""
    check_password(req)

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


@app.post("/workflow")
def run_workflow(request: WorkflowRequest, req: Request):
    """Run the full naming workflow: generate + filter + evaluate."""
    check_password(req)

    if not request.project_description or len(request.project_description) < 10:
        raise HTTPException(
            status_code=400,
            detail="Project description must be at least 10 characters"
        )

    result = workflow.run(
        project_description=request.project_description,
        user_name_ideas=request.name_ideas,
        generate_count=request.generate_count,
        max_to_evaluate=request.max_to_evaluate,
    )

    return {
        "project_description": result.project_description,
        "all_candidates": [
            {
                "name": c.name,
                "source": c.source,
                "domains_available": c.domains_available,
                "passed_domain_filter": c.passed_domain_filter,
                "rejection_reason": c.rejection_reason,
                "evaluation": c.evaluation.to_dict() if c.evaluation else None,
            }
            for c in result.all_candidates
        ],
        "viable_count": len(result.viable_candidates),
        "evaluated_count": len(result.evaluated_candidates),
        "recommended": {
            "name": result.recommended.name,
            "source": result.recommended.source,
            "score": result.recommended.evaluation.overall_score if result.recommended.evaluation else 0,
            "evaluation": result.recommended.evaluation.to_dict() if result.recommended.evaluation else None,
        } if result.recommended else None,
    }


@app.post("/workflow/stream")
async def run_workflow_stream(request: WorkflowRequest, req: Request):
    """Run the naming workflow with streaming progress updates via SSE."""
    check_password(req)

    if not request.project_description or len(request.project_description) < 10:
        raise HTTPException(
            status_code=400,
            detail="Project description must be at least 10 characters"
        )

    def event_stream():
        """Generator that yields SSE events as workflow progresses."""
        all_candidates: list[NameCandidate] = []

        # Step 1: Add user ideas
        def send_event(event_type: str, data: dict):
            return f"data: {json.dumps({'type': event_type, **data})}\n\n"

        yield send_event("status", {"message": "Starting workflow..."})

        if request.name_ideas:
            for name in request.name_ideas:
                all_candidates.append(NameCandidate(
                    name=name.strip(),
                    source="user"
                ))
            yield send_event("status", {"message": f"Added {len(request.name_ideas)} of your ideas"})

        # Step 2: Generate names
        yield send_event("status", {"message": "Generating name candidates..."})
        generated_names = workflow._generate_names(request.project_description, request.generate_count)
        for name in generated_names:
            if not any(c.name.lower() == name.lower() for c in all_candidates):
                all_candidates.append(NameCandidate(name=name, source="generated"))

        yield send_event("status", {"message": f"Generated {len(generated_names)} candidates"})
        yield send_event("candidates", {
            "count": len(all_candidates),
            "names": [c.name for c in all_candidates]
        })

        # Step 3: Domain filtering
        yield send_event("status", {"message": "Checking domain availability..."})
        viable_candidates: list[NameCandidate] = []

        for i, candidate in enumerate(all_candidates):
            yield send_event("progress", {
                "message": f"Checking domains for {candidate.name}...",
                "current": i + 1,
                "total": len(all_candidates)
            })

            domains = evaluator.quick_domain_check(candidate.name)
            candidate.domains_available = domains

            if domains.get(".com") or domains.get(".ai") or domains.get(".io"):
                candidate.passed_domain_filter = True
                viable_candidates.append(candidate)
            else:
                candidate.rejection_reason = "No .com, .ai, or .io domain available"

        yield send_event("filter_complete", {
            "viable_count": len(viable_candidates),
            "filtered_out": len(all_candidates) - len(viable_candidates)
        })

        # Step 4: Full evaluation
        viable_candidates.sort(key=lambda c: (
            0 if c.source == "user" else 1,
            0 if c.domains_available.get(".com") else 1
        ))

        evaluated_candidates: list[NameCandidate] = []
        max_eval = request.max_to_evaluate

        for i, candidate in enumerate(viable_candidates[:max_eval]):
            yield send_event("progress", {
                "message": f"Evaluating {candidate.name}...",
                "current": i + 1,
                "total": min(len(viable_candidates), max_eval)
            })

            try:
                candidate.evaluation = evaluator.evaluate(
                    candidate.name,
                    mission=request.project_description
                )
                evaluated_candidates.append(candidate)

                # Send partial result
                yield send_event("evaluation", {
                    "name": candidate.name,
                    "score": round(candidate.evaluation.overall_score),
                    "source": candidate.source
                })
            except Exception as e:
                candidate.rejection_reason = f"Evaluation failed: {e}"

        # Step 5: Final result
        recommended = None
        if evaluated_candidates:
            recommended = max(
                evaluated_candidates,
                key=lambda c: c.evaluation.overall_score if c.evaluation else 0
            )

        final_result = {
            "project_description": request.project_description,
            "all_candidates": [
                {
                    "name": c.name,
                    "source": c.source,
                    "domains_available": c.domains_available,
                    "passed_domain_filter": c.passed_domain_filter,
                    "rejection_reason": c.rejection_reason,
                    "evaluation": c.evaluation.to_dict() if c.evaluation else None,
                }
                for c in all_candidates
            ],
            "viable_count": len(viable_candidates),
            "evaluated_count": len(evaluated_candidates),
            "recommended": {
                "name": recommended.name,
                "source": recommended.source,
                "score": recommended.evaluation.overall_score if recommended.evaluation else 0,
                "evaluation": recommended.evaluation.to_dict() if recommended.evaluation else None,
            } if recommended else None,
        }

        yield send_event("complete", {"result": final_result})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
