# Grab Node.js, which is the engine that runs React
FROM node:18-alpine

# Set up our working folder inside the container
WORKDIR /app

# Copy the package file first and install the React tools
COPY package.json ./
RUN npm install

# Copy the rest of the React files over
COPY . ./

# Start the React development server!
CMD ["npm", "start"]