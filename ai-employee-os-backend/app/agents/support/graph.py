from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.support.nodes import support_node


def build_support_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("support_node", support_node)
    workflow.set_entry_point("support_node")
    workflow.add_edge("support_node", END)
    compiled = workflow.compile()

    async def run(state: AgentState) -> AgentState:
        result = await compiled.ainvoke(state)
        return result

    return run