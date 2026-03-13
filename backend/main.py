from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.database import engine
from app import models
from app.routers import auth, anunturi, ai_agent, mesaje

# Create tables
models.Base.metadata.create_all(bind=engine)

# Create uploads dir
os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="ImoFree API",
    description="Platformă imobiliare direct între particulari",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(anunturi.router)
app.include_router(ai_agent.router)
app.include_router(mesaje.router)

@app.get("/")
def root():
    return {"message": "ImoFree API v1.0 — Imobiliare fără agenții"}

@app.get("/health")
def health():
    return {"status": "ok"}
