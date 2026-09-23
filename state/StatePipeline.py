from typing import TypedDict

class PipelineState(TypedDict):
    raw_input: str
    edited_text: str
    script_text: str
    final_output: str