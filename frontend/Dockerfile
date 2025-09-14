# Use Node.js 18 Alpine image
FROM node:18-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy project
COPY . .

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5173', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application in development mode for now
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
