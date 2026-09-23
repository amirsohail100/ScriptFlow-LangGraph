import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from schema.payload import GenerateRequest,GenerateResponse


from agent import run_pipeline

app = FastAPI(title="AI Script Pipeline API")

# Rate limiting: IP address ke hisaab se limit lagayi hai, kyunki har call Groq
# API ko hit karti hai aur wo paid/quota-limited hai. Values apni traffic ke
# hisaab se tune kar lena (env var se bhi le sakte ho agar chahiye).
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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


# 5 requests per minute, per IP. Ye number "worker + Groq calls" ke hisaab se hai —
# agar public traffic zyada expect ho to isse tighter ya looser kar lena.
@app.post("/api/generate", response_model=GenerateResponse)
@limiter.limit("5/minute")
def generate(request: Request, payload: GenerateRequest):
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
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")