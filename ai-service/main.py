from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from assistant import assistant

app = FastAPI(
    title="DivyaSetu Scoped NL->SQL Assistant",
    description="Read-only natural language assistant for NGO field staff querying PostGIS assistive device inventory.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    requestedBy: Optional[int] = None

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "divyasetu-ai-service"}

@app.post("/ask")
def ask_question(req: QueryRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="question is required")
    
    try:
        response = assistant.process_question(req.question)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=403, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal assistant error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8488, reload=True)
