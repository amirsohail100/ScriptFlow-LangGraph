from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from schema.payload import GenerateRequest,GenerateResponse


from agent import run_pipeline

app = FastAPI(title="AI Script Pipeline API")

# Dev ke time frontend alag origin (e.g. Live Server) se call kar sake, isliye CORS open rakha hai.
# Production me isko apne actual frontend domain tak restrict kar dena.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/generate", response_model=GenerateResponse)
def generate(payload: GenerateRequest):
    if not payload.raw_input.strip():
        raise HTTPException(status_code=400, detail="raw_input khaali hai")

    try:
        result = run_pipeline(payload.raw_input)
    except Exception as exc:  # Groq API errors, network issues, etc.
        raise HTTPException(status_code=502, detail=str(exc))

    return GenerateResponse(
        edited_text=result["edited_text"],
        script_text=result["script_text"],
        final_output=result["final_output"],
    )


# Frontend (index.html/style.css/script.js) ko isi FastAPI server se serve karo.
# Isse ye line hamesha sabse aakhir me honi chahiye, kyunki ye "/" ko catch-all bana deti hai.
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
