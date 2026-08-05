from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.checkpointer import get_checkpointer
from app.config import settings


SUPERVISOR_PROMPT = """You are the AI Employee OS Supervisor.
Your job is to analyze the user's request and route it to the correct AI employee.

Available AI Employees:
- executive: General tasks, scheduling, reminders, summaries
- email: Email drafting, replies, follow-ups, email management
- crm: Customer management, leads, contacts, sales pipeline
- finance: Invoices, quotations, payments, financial reports
- support: Customer support, complaints, FAQs

Respond with ONLY one word — the agent name to route to.
Examples:
- "Send an email to John" → email
- "Create invoice for Ahmed" → finance
- "Add new lead from yesterday's meeting" → crm
- "Schedule a meeting for Friday" → executive
- "Customer complaint about order" → support
"""

def get_llm():
    if settings.default_llm_provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=settings.default_model,
            api_key=settings.groq_api_key,
            temperature=0,
        )
    elif settings.default_llm_provider == "anthropic":
        return ChatAnthropic(
            model="claude-sonnet-4-6",
            api_key=settings.anthropic_api_key,
        )
    return ChatOpenAI(
        model=settings.default_model,
        api_key=settings.openai_api_key,
        temperature=0,
    )

def supervisor_node(state: AgentState) -> AgentState:
    """Routes user request to the correct agent."""
    llm = get_llm()

    last_message = state["messages"][-1]
    user_input = last_message.content if hasattr(last_message, "content") else str(last_message)

    response = llm.invoke([
        SystemMessage(content=SUPERVISOR_PROMPT),
        HumanMessage(content=f"Route this request: {user_input}")
    ])

    route = response.content.strip().lower()

    valid_routes = ["executive", "email", "crm", "finance", "support"]
    if route not in valid_routes:
        route = "executive"

    return {
        **state,
        "current_agent": route,
        "next_agent": route,
    }


def route_to_agent(state: AgentState) -> str:
    return state.get("next_agent", "executive")


def build_supervisor_graph():
    from app.agents.executive.graph import build_executive_graph
    from app.agents.email.graph import build_email_graph
    from app.agents.crm.graph import build_crm_graph
    from app.agents.finance.graph import build_finance_graph
    from app.agents.support.graph import build_support_graph

    workflow = StateGraph(AgentState)

    # Add supervisor node
    workflow.add_node("supervisor", supervisor_node)

    # Add agent nodes
    workflow.add_node("executive", build_executive_graph())
    workflow.add_node("email", build_email_graph())
    workflow.add_node("crm", build_crm_graph())
    workflow.add_node("finance", build_finance_graph())
    workflow.add_node("support", build_support_graph())

    # Set entry point
    workflow.set_entry_point("supervisor")

    # Supervisor routes to agents
    workflow.add_conditional_edges(
        "supervisor",
        route_to_agent,
        {
            "executive": "executive",
            "email": "email",
            "crm": "crm",
            "finance": "finance",
            "support": "support",
        }
    )

    # All agents end after response
    workflow.add_edge("executive", END)
    workflow.add_edge("email", END)
    workflow.add_edge("crm", END)
    workflow.add_edge("finance", END)
    workflow.add_edge("support", END)

    checkpointer = get_checkpointer()
    return workflow.compile(checkpointer=checkpointer)


# Singleton graph instance
_graph = None

def get_supervisor_graph():
    global _graph
    if _graph is None:
        _graph = build_supervisor_graph()
    return _graph