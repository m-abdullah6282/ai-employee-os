import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from app.dependencies import get_current_user
from app.models.user import User
from app.agents.supervisor import get_supervisor_graph

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    agent_used: str
    conversation_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    graph = get_supervisor_graph()

    conversation_id = payload.conversation_id or str(uuid.uuid4())

    config = {
        "configurable": {
            "thread_id": conversation_id,
        }
    }

    initial_state = {
        "messages": [HumanMessage(content=payload.message)],
        "user_id": str(current_user.id),
        "org_id": str(current_user.organization_id),
        "role": current_user.role,
        "current_agent": "",
        "next_agent": "",
        "tools_output": [],
        "error": None,
        "final_response": None,
        "conversation_id": conversation_id,
        "context": {},
    }

    result = await graph.ainvoke(initial_state, config=config)

    return ChatResponse(
        response=result.get("final_response", "I could not process your request."),
        agent_used=result.get("current_agent", "unknown"),
        conversation_id=conversation_id,
    )