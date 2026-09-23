import os

from state.StatePipeline import PipelineState
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END

load_dotenv()

llm = ChatGroq(model="openai/gpt-oss-20b", api_key=os.getenv("GROQ_API_KEY"))


def editor_node(state: PipelineState) -> dict:
    """Stage 1: Cleans up grammar, removes typos, and refines the tone."""
    prompt = (
        "You are an expert copyeditor. Clean up the following raw text. "
        "Fix any grammatical errors, spelling mistakes, and smooth out the transition flow "
        "while keeping the core message intact. Return only the edited text.\n\n"
        f"Text:\n{state['raw_input']}"
    )
    response = llm.invoke(prompt)
    return {"edited_text": response.content.strip()}


def scriptwriter_node(state: PipelineState) -> dict:
    """Stage 2: Formats the clean text into an engaging video script style."""
    prompt = (
        "You are a charismatic YouTube content creator. Take this edited text and transform "
        "it into a highly engaging, punchy, conversational video script hook. Make it sound "
        "like a real person speaking passionately. Return only the script content.\n\n"
        f"Edited Text:\n{state['edited_text']}"
    )
    response = llm.invoke(prompt)
    return {"script_text": response.content.strip()}


def translator_node(state: PipelineState) -> dict:
    """Stage 3: Translates the script into natural flowing Hinglish."""
    prompt = (
        "You are an expert content localizer for the Indian market. Take the following script "
        "and convert it into natural, flowing 'Hinglish'. Do not simply translate it sentence-by-sentence "
        "or repeat information. Alternating comfortably between Hindi and English phrases just like "
        "an intellectual tech educator would speak naturally on a live stream. Keep the energy high! "
        "Return only the final Hinglish text.\n\n"
        f"Script:\n{state['script_text']}"
    )
    response = llm.invoke(prompt)
    return {"final_output": response.content.strip()}


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
