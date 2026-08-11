from langchain_core.messages import AIMessage, SystemMessage
from app.agents.state import AgentState
from app.agents.supervisor import get_llm

CRM_PROMPT = """You are an AI CRM Assistant for a business.
You help with:
- Adding and updating contacts
- Managing leads and sales pipeline
- Tracking customer interactions
- Providing customer insights
- Following up on deals

Be data-driven and sales-focused.
Always confirm CRM actions taken.
"""

def crm_node(state: AgentState) -> AgentState:
    llm = get_llm()
    messages = [SystemMessage(content=CRM_PROMPT)] + state["messages"]
    response = llm.invoke(messages)
    return {
        **state,
        "messages": [AIMessage(content=response.content)],
        "final_response": response.content,
        "current_agent": "crm",
    }