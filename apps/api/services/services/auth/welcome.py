import os
from contextlib import asynccontextmanager
from fastapi import FastAPI

from .websocket import ALLOWED_HOSTS
from .token import AUTH_TOKEN

@asynccontextmanager
async def welcome_lifespan(app: FastAPI):
    print("***")
    print("Welcome to R-Pilot")
    
    # Use first allowed host or default to localhost
    frontend_host = ALLOWED_HOSTS[0] if ALLOWED_HOSTS else 'localhost:3000'
    
    if len(ALLOWED_HOSTS) == 1:
        print("To start, open the following URL:")
    else:
        print("To start, open one of the following URLs:")
    
    # Generate URLs with the actual frontend host
    print(f"  http://{frontend_host}#token={AUTH_TOKEN}")
    
    print("***")
    yield
