from pydantic import BaseModel

class GenerateRequest(BaseModel):
    raw_input: str


class GenerateResponse(BaseModel):
    edited_text: str
    script_text: str
    final_output: str