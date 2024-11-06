import os
from contextlib import asynccontextmanager
from fastapi import FastAPI

from .websocket import ALLOWED_HOSTS
from .token import AUTH_TOKEN

@asynccontextmanager
async def welcome_lifespan(app: FastAPI):
    print("***")
    print("Welcome to R-Pilot")
    
    frontend_url = os.environ.get('FRONTEND_URL', 'localhost:3000')
    
    print("To start, open the following URL:")
    
    # Use http in development, https if specified in env
    protocol = "https" if os.environ.get('USE_HTTPS', '').lower() == 'true' else "http"
    
    # Generate URL with the frontend domain from environment variable
    print(f"  {protocol}://{frontend_url}?token={AUTH_TOKEN}")
    
    print("***")
    yield
