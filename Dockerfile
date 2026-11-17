FROM node:20-bookworm-slim

# Install system dependencies, C++ build tools for better-sqlite3, and ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces requires a non-root user with UID 1000
RUN useradd -m -u 1000 user

WORKDIR /app
RUN chown -R user:user /app

USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PORT=7860

# Install dependencies
COPY --chown=user:user package*.json ./
RUN npm install

# Copy application source files, data directory, and assets
COPY --chown=user:user . .

# Build production frontend assets
RUN npm run build

EXPOSE 7860

# Start Express server (listens on PORT 7860)
CMD ["node", "server/index.js"]
