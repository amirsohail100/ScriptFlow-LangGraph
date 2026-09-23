import os
from state.StatePipeline import PipelineState
from langgraph.graph import StateGraph, START, END
from tools.nodes import editor_node,scriptwriter_node,translator_node


_graph = StateGraph(PipelineState)
_graph.add_node("editor", editor_node)
_graph.add_node("scriptwriter", scriptwriter_node)
_graph.add_node("translator", translator_node)

_graph.add_edge(START, "editor")
_graph.add_edge("editor", "scriptwriter")
_graph.add_edge("scriptwriter", "translator")
_graph.add_edge("translator", END)

compiled_graph = _graph.compile()


def run_pipeline(raw_input: str) -> dict:
    """Runs editor -> scriptwriter -> translator and returns the full final state."""
    return compiled_graph.invoke({"raw_input": raw_input})
