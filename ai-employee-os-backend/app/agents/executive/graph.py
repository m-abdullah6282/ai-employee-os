from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.executive.nodes import executive_node


def build_executive_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("executive_node", executive_node)
    workflow.set_entry_point("executive_node")
    workflow.add_edge("executive_node", END)
    compiled = workflow.compile()

    async def run(state: AgentState) -> AgentState:
        result = await compiled.ainvoke(state)
        return result

    return run