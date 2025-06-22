# Dockerfile
# Use the official Node.js 20 image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port (defaulting to 3000, but can be overridden by APP_PORT env var)
EXPOSE 3000

# Command to run the application
CMD [ "node", "dist/main" ]
