from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.email.nodes import email_node


def build_email_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("email_node", email_node)
    workflow.set_entry_point("email_node")
    workflow.add_edge("email_node", END)
    compiled = workflow.compile()

    async def run(state: AgentState) -> AgentState:
        result = await compiled.ainvoke(state)
        return result

    return run