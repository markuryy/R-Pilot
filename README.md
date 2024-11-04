# R-Pilot

Your AI-powered R programming assistant.

## Quick Start

1. Install [R](https://www.r-project.org/)
   - Windows: Download from https://cran.r-project.org/bin/windows/base/
   - Mac: `brew install r` or download from https://cran.r-project.org/bin/macosx/
   - Linux: `sudo apt-get install r-base`

2. Install [Bun](https://bun.sh/)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. Clone and setup:
   ```bash
   git clone https://github.com/markuryy/R-Pilot.git
   cd r-pilot
   bun install
   bun run setup
   ```

4. Start R-Pilot:
   ```bash
   bun run dev
   ```

5. Open the authentication link with the token shown in the terminal (starts with http://localhost:3000).

## Features

- AI-powered R programming assistance
- Interactive R code execution
- Real-time output and plotting
- Secure sandboxed environment

## Environment Configuration

The .env file contains these important settings:

```bash
# Required
OPENAI_API_KEY=           # Your OpenAI API key

# Optional (defaults shown)
INTERPRETER_TYPE=r        # Use R interpreter
INTERPRETER_TIMEOUT=120   # Timeout in seconds
ALLOWED_HOSTS=localhost:3000
```

The NextJS app uses a .env.local file (automatically created during setup) with these variables:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000    # Backend API URL
NEXT_PUBLIC_WS_URL=ws://localhost:8000       # WebSocket URL
NEXT_PUBLIC_SERVICES_URL=http://localhost:8000
```

## Need Help?

- Check [Common Issues](#common-issues) below
- See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup
- Visit our [GitHub Issues](https://github.com/your-repo/issues)

## Common Issues

1. Token Not Appearing
   - Check terminal output
   - Verify ALLOWED_HOSTS in .env

2. R Issues
   - Make sure R is installed: Run `R --version` in terminal
   - If R isn't found, reinstall from https://www.r-project.org/

3. Connection Failed
   - Check if backend is running (look for messages in terminal)
   - Make sure ports 3000 and 8000 are free
