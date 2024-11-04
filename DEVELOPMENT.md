# R-Pilot Development Guide

This guide covers detailed setup instructions for developers, including deployment configurations.

## Local Development Setup

### Prerequisites

- [R](https://www.r-project.org/) for the interpreter
- [Bun](https://bun.sh/) for package management
- [Python](https://www.python.org/) with Poetry for backend
- [OpenAI API Key](https://platform.openai.com/api-keys)

### Environment Setup

1. Clone and setup:
```bash
git clone <repository-url>
cd r-pilot
bun run setup  # This will install all dependencies and configure environment
```

2. Start development servers:
```bash
# From project root
bun run dev
```

The setup script will:
- Install bun dependencies
- Install Python dependencies via Poetry
- Auto-detect R installation or prompt for custom path
- Configure environment variables
- Create necessary directories

### Project Structure

```
r-pilot/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/            # App router pages
│   │   ├── components/     # UI components
│   │   └── lib/           # Utilities
│   └── api/                # FastAPI backend
│       └── services/      # Backend services
├── docker/                 # Docker configuration
└── docker-compose.yml     # Docker compose config
```

## Deployment

### Frontend (Vercel)

1. Connect your repository to Vercel
2. Set build settings:
   - Framework: Next.js
   - Root Directory: apps/web
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   NEXT_PUBLIC_WS_URL=wss://your-api-domain.com
   ```

### Backend (Docker)

1. Build the Docker image:
```bash
docker build -f docker/Dockerfile -t r-pilot-api .
```

2. Run with environment variables:
```bash
docker run -d \
  -p 8000:8000 \
  -e OPENAI_API_KEY=your-key \
  -e INTERPRETER_TYPE=r \
  -e INTERPRETER_TIMEOUT=120 \
  -v /path/to/workspace:/opt/app/workspace \
  r-pilot-api
```

### Production Setup

1. Set up your VPS:
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
sudo apt-get install docker-compose
```

2. Configure Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

3. Set up SSL:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

4. Deploy with Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

### Backend (.env)
```bash
OPENAI_API_KEY=           # Required: Your OpenAI API key
INTERPRETER_TYPE=r        # Optional: Use R interpreter (default)
INTERPRETER_TIMEOUT=120   # Optional: Timeout in seconds
ALLOWED_HOSTS=localhost:3000
R_PATH=/path/to/R        # Required: Path to R installation (auto-detected during setup)
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Development Workflow

- Frontend hot reload available at http://localhost:3000
- Backend auto-reload at http://localhost:8000
- WebSocket connections for real-time communication
- R environment isolated per session

## Testing

```bash
# Frontend tests
cd apps/web
bun test

# Backend tests
cd apps/api/services
poetry run pytest
```

## Advanced Configuration

### Custom R Packages

Add required R packages to docker/Dockerfile:
```dockerfile
RUN R -e "install.packages(c('package1', 'package2'))"
```

### Scaling Considerations

- Use Redis for session management
- Configure Nginx for WebSocket load balancing
- Set up monitoring with Prometheus/Grafana

## Troubleshooting

### Development Issues

1. Poetry Installation
   ```bash
   # If curl fails, try:
   pip install poetry
   ```

2. R Package Issues
   ```bash
   # Install system dependencies first
   sudo apt-get install libcurl4-openssl-dev libssl-dev
   ```

3. WebSocket Debugging
   - Check browser console
   - Verify proxy headers
   - Test with wscat

### Production Issues

1. Docker Logs
   ```bash
   docker logs r-pilot-api
   ```

2. Nginx Logs
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. SSL Renewal
   ```bash
   sudo certbot renew
