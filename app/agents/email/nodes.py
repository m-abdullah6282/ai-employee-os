from langchain_core.messages import AIMessage, SystemMessage
from app.agents.state import AgentState
from app.agents.supervisor import get_llm

EMAIL_PROMPT = """You are an AI Email Assistant for a business.
You help with:
- Drafting professional emails
- Writing follow-up emails
- Replying to customer emails
- Summarizing email threads
- Creating email templates

Always ask for: recipient name, subject, and key points if not provided.
Write emails in a professional yet friendly tone.
Format: Subject line first, then email body.
"""

def email_node(state: AgentState) -> AgentState:
    llm = get_llm()
    messages = [SystemMessage(content=EMAIL_PROMPT)] + state["messages"]
    response = llm.invoke(messages)
    return {
        **state,
        "messages": [AIMessage(content=response.content)],
        "final_response": response.content,
        "current_agent": "email",
    }   