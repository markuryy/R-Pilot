from typing import Generator

from openai import OpenAIError

from services.llm.base import BaseLLM, LLMException
from services.llm.types import Message, Response
from .parsing import msg_to_gpt_msg, lazy_parse_args, fill_dict
from .prompt import FUNCTIONS, get_system_message


class GPT(BaseLLM):
    def __init__(self, model_selection: dict):
        self._model_selection = model_selection

    def chat(self, history: list[Message]) -> Generator[Response, None, None]:
        # Convert messages and prepend system message
        messages = [get_system_message()]
        messages.extend([msg_to_gpt_msg(msg) for msg in history])

        try:
            stream = self.client.chat.completions.create(
                **self._model_selection,
                messages=messages,
                temperature=0,
                functions=FUNCTIONS,
                function_call="auto",
                stream=True,
            )

            response = {}
            previous_code = None
            for chunk in stream:
                delta = chunk.choices[0].delta
                chunk_dict = {}
                
                if hasattr(delta, "content") and delta.content is not None:
                    chunk_dict["content"] = delta.content
                if hasattr(delta, "function_call"):
                    if not "function_call" in response:
                        response["function_call"] = {}
                    if hasattr(delta.function_call, "arguments"):
                        chunk_dict["function_call"] = {
                            "arguments": delta.function_call.arguments
                        }

                fill_dict(response, chunk_dict)

                text = None
                if "content" in response:
                    text = response["content"]

                code = None
                if (
                    "function_call" in response
                    and "arguments" in response["function_call"]
                ):
                    args = response["function_call"]["arguments"]
                    code = lazy_parse_args(args)
                if code is None:
                    code = previous_code
                previous_code = code

                yield Response(text=text, code=code)

        except OpenAIError as e:
            raise LLMException(str(e))
