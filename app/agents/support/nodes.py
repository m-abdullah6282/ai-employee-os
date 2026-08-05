from langchain_core.messages import AIMessage, SystemMessage
from app.agents.state import AgentState
from app.agents.supervisor import get_llm

SUPPORT_PROMPT = """You are an AI Customer Support Agent for a business.
You help with:
- Resolving customer complaints
- Answering product/service questions
- Processing refund requests
- Escalating complex issues
- Writing support responses

Be empathetic, patient, and solution-focused.
Always acknowledge the customer's concern first.
"""

def support_node(state: AgentState) -> AgentState:
    llm = get_llm()
    messages = [SystemMessage(content=SUPPORT_PROMPT)] + state["messages"]
    response = llm.invoke(messages)
    return {
        **state,
        "messages": [AIMessage(content=response.content)],
        "final_response": response.content,
        "current_agent": "support",
    }