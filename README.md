# R-Pilot

![](assets/images/r-pilot_demo.gif)

Your AI-powered R pair programmer, based on [IncognitoPilot](https://github.com/silvanmelchior/IncognitoPilot).

## Prerequisites

Before you begin, ensure you have the following installed:
- [Git](https://git-scm.com/) for cloning the repository
- [Python 3](https://www.python.org/) (3.8 or higher)
- [R](https://www.r-project.org/)
  - Windows: Download from https://cran.r-project.org/bin/windows/base/
  - Mac: `brew install r` or download from https://cran.r-project.org/bin/macosx/
  - Linux: `sudo apt-get install r-base`
- [Bun](https://bun.sh/)
  - Linux & macOS:
    ```bash
    curl -fsSL https://bun.sh/install | bash
    ```
  - Windows:
    ```bash
    powershell -c "irm bun.sh/install.ps1 | iex"
    ```

## Quick Start

1. Clone and setup:
   ```bash
   git clone https://github.com/markuryy/R-Pilot.git
   cd r-pilot
   bun install
   bun run setup
   ```

2. Start R-Pilot:
   ```bash
   bun run dev
   ```
   Note: There's also a `start` script in package.json, but it currently doesn't work due to linting issues from rapid development. Stick with `dev` for now.

3. Open the authentication link with the token shown in the terminal (starts with http://localhost:3000).

## Features

- AI-powered R programming assistance
- Interactive R code execution
- Real-time output and plotting
- Sandboxed environment for sharing files

## Environment Configuration

The .env file contains these important settings:

```bash
# Required
OPENAI_API_KEY=               # Your OpenAI API key

# Optional (defaults shown)
INTERPRETER_TYPE=r            # Use R interpreter
INTERPRETER_TIMEOUT=3600      # Timeout in seconds
ALLOWED_HOSTS=localhost:3000
```

The NextJS app uses a .env.local file (automatically created during setup):

```bash
NEXT_PUBLIC_SERVICES_URL=http://localhost:8000  # Backend API URL
```

## Common Issues

1. Token Not Appearing
   - Check terminal output
   - Verify ALLOWED_HOSTS in .env

2. R Issues
   - Make sure R is installed: Run `R --version` in terminal
   - If R isn't found, reinstall from https://www.r-project.org/
   - If you must specify your own path, find it using `which R`

3. Connection Failed
   - Check if backend is running (look for messages in terminal)
   - Make sure ports 3000 and 8000 are free

## Deployment

This project was never meant for public deployment, so certain features like filesystem interactions will not be available in production on Vercel, for example. You may be able to containerize the whole stack and serve the frontend with nginx; open a pull request if you want to give it a try.
