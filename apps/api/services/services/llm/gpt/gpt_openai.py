from openai import OpenAI

from services.utils import get_env_var
from .gpt import GPT


class GPTOpenAI(GPT):
    def __init__(self, model_name: str):
        api_key = get_env_var("OPENAI_API_KEY")
        api_base = get_env_var("OPENAI_API_BASE", required=False)
        
        client_kwargs = {"api_key": api_key}
        if api_base:
            client_kwargs["base_url"] = api_base
            
        self.client = OpenAI(**client_kwargs)
        super().__init__({"model": model_name})
