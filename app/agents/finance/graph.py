from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.finance.nodes import finance_node


def build_finance_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("finance_node", finance_node)
    workflow.set_entry_point("finance_node")
    workflow.add_edge("finance_node", END)
    compiled = workflow.compile()

    async def run(state: AgentState) -> AgentState:
        result = await compiled.ainvoke(state)
        return result

    return run