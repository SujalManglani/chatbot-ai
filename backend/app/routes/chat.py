from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai import ask_ai

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(req: ChatRequest):
    response = await ask_ai(req.message)

    return {
        "reply": response
    }