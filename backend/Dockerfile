FROM node:20-alpine

# Install Python for code execution and symlink it to python
RUN apk add --no-cache python3 && ln -sf python3 /usr/bin/python

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy rest of the application
COPY . .

# Expose the port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
