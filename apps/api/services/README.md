# R-Pilot API Docker Deployment

## Prerequisites
- Docker
- Docker Compose

## Environment Configuration
The application uses environment variables to configure its behavior. Key configurations include:

### OpenAI and Interpreter Settings
- `OPENAI_API_KEY`: Your OpenAI API key
- `INTERPRETER_TYPE`: Set to 'r' for R interpreter
- `INTERPRETER_TIMEOUT`: Timeout for interpreter sessions (default: 120 seconds)
- `R_PATH`: Path to R executable (default: /usr/local/bin/R)

### Network and CORS
- `ENABLE_CORS`: Enable Cross-Origin Resource Sharing (default: TRUE)
- `ALLOWED_HOSTS`: Allowed host for CORS (default: localhost:3000)

### Frontend URLs
- `NEXT_PUBLIC_API_URL`: Base URL for API (default: http://localhost:8000)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL (default: ws://localhost:8000)

### Workspace
- `WORKING_DIRECTORY`: Directory for temporary files and workspace (default: /workspace)

## Deployment Options

### Local Development
```bash
# Build the Docker image
docker-compose build

# Run the API
docker-compose up
```

### Coolify Deployment
1. Connect your repository
2. Set build context to `apps/api/services`
3. Configure environment variables in Coolify settings
4. Use the generated Dockerfile

## Key Features
- Pre-installed R environment
- Python 3.11 base image
- Poetry for dependency management
- FastAPI backend
- Configurable environment variables
- Persistent workspace volume

## Accessing the API
The API will be available at `http://localhost:8000`

### Endpoints
- `/health`: Health check endpoint
- `/auth/*`: Authentication routes
- `/interpreter/*`: Interpreter routes
- `/llm/*`: LLM routes
