from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai import ask_ai

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    useSearch: bool = False


@router.post("/chat")
async def chat(req: ChatRequest):
    response = await ask_ai(
        message=req.message,
        use_search=req.useSearch
    )

    return {
        "reply": response
    }