import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
# This ensures environment variables are loaded even when this module is used independently
load_dotenv()

def get_env_var(key: str, default: str = None, *, required: bool = True) -> str:
    value = os.getenv(key)
    if value is not None:
        return value

    if default is not None:
        return default

    if not required:
        return None

    print(f"ERROR: Missing environment variables {key}, exiting...", file=sys.stderr)
    sys.exit(1)
