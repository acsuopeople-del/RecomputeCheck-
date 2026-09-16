"""
RecomputeCheck - FastAPI Backend Service
Provides high-performance endpoints for claim extraction,
deterministic pandas recomputation, and report fidelity scoring.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
import uvicorn
from ml.verifier import NumericClaim, audit_report, TableContainer
from ml.extractor import extract_claims_from_report

# Pydantic Request/Response Models
class AuditRequest(BaseModel):
    csv_data: str = Field(..., description="Raw CSV text content")
    report_text: str = Field(..., description="LLM generated summary/report text")
    rel_tolerance: float = Field(0.02, description="Relative discrepancy tolerance (default 2%)")
    abs_tolerance: float = Field(0.5, description="Absolute discrepancy tolerance")

class ExtractClaimsRequest(BaseModel):
    report_text: str
    columns: List[str]

class RecomputeSingleClaimRequest(BaseModel):
    csv_data: str
    metric_type: str
    target_column: Optional[str] = None
    filter_column: Optional[str] = None
    filter_value: Optional[str] = None
    claimed_value: float
    rel_tolerance: float = 0.02

# Standard FastAPI app definition (compatible with uvicorn backend/main:app)
try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    app = FastAPI(
        title="RecomputeCheck API",
        description="Deterministic Recomputation & Verification of AI-Written Data Reports",
        version="1.0.0"
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "RecomputeCheck Backend"}

    @app.post("/api/extract-claims")
    def api_extract_claims(req: ExtractClaimsRequest):
        claims = extract_claims_from_report(req.report_text, req.columns)
        return {"claims": [c.__dict__ for c in claims]}

    @app.post("/api/audit")
    def api_audit_report(req: AuditRequest):
        try:
            table = TableContainer.from_csv_string(req.csv_data)
            claims = extract_claims_from_report(req.report_text, table.columns)
            result = audit_report(claims, req.csv_data, req.rel_tolerance, req.abs_tolerance)
            return result
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

except ImportError:
    # Fallback if fastapi is not in the active python environment
    app = None

if __name__ == "__main__":
    if app:
        uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
    else:
        print("FastAPI not installed in current Python environment. RecomputeCheck runs via Node/Express bridge.")
