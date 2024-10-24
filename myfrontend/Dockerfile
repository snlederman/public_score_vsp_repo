# Dockerfile for React
FROM node:14

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json /app/
COPY package-lock.json /app/
RUN npm install

# Copy project
COPY . /app/

# Expose the port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
