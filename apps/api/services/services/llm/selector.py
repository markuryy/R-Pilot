from services.llm.gpt import GPTAzure, GPTOpenAI
from services.llm.base import BaseLLM


MAP_LLM = {
    "gpt-openai": GPTOpenAI,
    "gpt-azure": GPTAzure,
}


def get_llm(llm_setting: str) -> BaseLLM:
    for prefix, llm_class in MAP_LLM.items():
        if llm_setting.startswith(prefix):
            return llm_class(llm_setting[len(prefix) + 1 :])

    raise ValueError(f"Unknown LLM setting: {llm_setting}")
