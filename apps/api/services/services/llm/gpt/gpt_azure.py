from openai import AzureOpenAI

from services.utils import get_env_var
from .gpt import GPT


class GPTAzure(GPT):
    def __init__(self, deployment_name: str):
        api_key = get_env_var("AZURE_OPENAI_API_KEY")
        api_version = get_env_var("AZURE_OPENAI_API_VERSION", default="2023-07-01-preview")
        azure_endpoint = get_env_var("AZURE_OPENAI_ENDPOINT")
        
        self.client = AzureOpenAI(
            api_key=api_key,
            api_version=api_version,
            azure_endpoint=azure_endpoint
        )
        super().__init__({"model": deployment_name})
