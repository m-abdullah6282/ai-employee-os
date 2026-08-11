from typing import Annotated, Any
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    # Core
    messages: Annotated[list, add_messages]
    user_id: str
    org_id: str
    role: str

    # Routing
    current_agent: str
    next_agent: str

    # Context
    tools_output: list[dict]
    error: str | None
    final_response: str | None

    # Memory
    conversation_id: str | None
    context: dict[str, Any]