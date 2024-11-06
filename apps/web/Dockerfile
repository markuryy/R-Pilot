FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Install dependencies using bun at the root level
RUN bun install

# Set working directory to web app
WORKDIR /app/apps/web

# Create .env.local with the services URL
ARG NEXT_PUBLIC_SERVICES_URL
RUN echo "NEXT_PUBLIC_SERVICES_URL=$NEXT_PUBLIC_SERVICES_URL" > .env.local

# Disable lint during build
ENV NEXT_DISABLE_ESLINT=true

# Build the application
RUN bun run build

# Copy standalone directory and static files
RUN cp -r .next/static .next/standalone/.next/static && \
    cp -r public .next/standalone/public

# Set the working directory to the standalone directory
WORKDIR /app/apps/web/.next/standalone

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["bun", "server.js"]
