from langgraph.checkpoint.memory import MemorySaver

# In-memory checkpointer for development
# In production replace with PostgresSaver
memory_checkpointer = MemorySaver()


def get_checkpointer():
    return memory_checkpointer