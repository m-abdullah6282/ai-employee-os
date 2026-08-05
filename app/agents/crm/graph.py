from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.crm.nodes import crm_node


def build_crm_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("crm_node", crm_node)
    workflow.set_entry_point("crm_node")
    workflow.add_edge("crm_node", END)
    compiled = workflow.compile()

    async def run(state: AgentState) -> AgentState:
        result = await compiled.ainvoke(state)
        return result

    return run