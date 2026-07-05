from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.event_controller import router as event_router
from app.controllers.mission_controller import router as mission_router
from app.exception_handlers import register_exception_handlers

app = FastAPI(
    title="Space Missions API",
    description="API simples para gerenciamento de missoes espaciais.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://space-missions.test",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)
app.include_router(mission_router)
app.include_router(event_router)
