from langchain_core.messages import AIMessage, SystemMessage
from app.agents.state import AgentState
from app.agents.supervisor import get_llm

FINANCE_PROMPT = """You are an AI Finance Assistant for a business.
You help with:
- Creating invoices and quotations
- Tracking payments and due dates
- Financial reporting and summaries
- Expense tracking
- Revenue analysis

Always be precise with numbers and dates.
Confirm all financial actions clearly.
"""

def finance_node(state: AgentState) -> AgentState:
    llm = get_llm()
    messages = [SystemMessage(content=FINANCE_PROMPT)] + state["messages"]
    response = llm.invoke(messages)
    return {
        **state,
        "messages": [AIMessage(content=response.content)],
        "final_response": response.content,
        "current_agent": "finance",
    }