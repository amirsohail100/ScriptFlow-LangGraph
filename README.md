# AI Script Pipeline — FastAPI + HTML/CSS/JS UI

## Structure

```
ai-script-pipeline/
├── backend/
│   ├── main.py       # FastAPI app: /api/generate, /api/health, serves frontend
│   └── pipeline.py   # Your LangGraph pipeline, wrapped as run_pipeline()
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## Endpoints

- `GET  /api/health` → `{"status": "ok"}` — deploy check ke liye
- `POST /api/generate` → body `{"raw_input": "..."}`, returns `{"edited_text", "script_text", "final_output"}`
- `GET  /` → frontend (index.html) serve hota hai

## Run locally

```bash
cd backend
pip install fastapi uvicorn langchain_groq langgraph python-dotenv
# .env me GROQ_API_KEY=your_key rakho (backend folder ke andar, ya ek level upar)
uvicorn main:app --reload --port 8000
```

Browser me `http://localhost:8000` kholo — UI wahin se serve hoga, alag frontend server ki zaroorat nahi.

## Deploy note

`main.py` me `StaticFiles(directory="../frontend", ...)` ka path is baat par depend karta hai ki `uvicorn` `backend/` folder ke andar se run ho raha ho. Agar deploy karte waqt working directory alag ho (Docker, Render, Railway, etc.), to ye path absolute bana dena — jaise `os.path.join(os.path.dirname(__file__), "..", "frontend")`.
