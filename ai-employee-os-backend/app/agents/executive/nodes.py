from langchain_core.messages import AIMessage, SystemMessage
from app.agents.state import AgentState
from app.agents.supervisor import get_llm

EXECUTIVE_PROMPT = """You are an AI Executive Assistant for a business.
You help with:
- Scheduling and calendar management
- Task creation and reminders
- Meeting summaries
- General business queries
- Drafting documents and reports

Be professional, concise, and action-oriented.
Always confirm what action you took or will take.
"""

def executive_node(state: AgentState) -> AgentState:
    llm = get_llm()

    messages = [SystemMessage(content=EXECUTIVE_PROMPT)] + state["messages"]
    response = llm.invoke(messages)

    return {
        **state,
        "messages": [AIMessage(content=response.content)],
        "final_response": response.content,
        "current_agent": "executive",
    }