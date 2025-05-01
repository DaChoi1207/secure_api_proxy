# Use official Node.js 18 slim image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose the port (matching your server.js)
EXPOSE 3000

# Command to run the server
CMD ["node", "server.js"]
