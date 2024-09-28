# Stage 1: Build the React app
FROM node:16-alpine AS client-builder
WORKDIR /app

# Copy the root package.json and install dependencies for both server and client
COPY package.json /app/

# Install client dependencies
COPY ./client/package.json ./client/package-lock.json* ./client/
RUN cd client && npm install

# Copy client code and build it
COPY ./client /app/client
RUN cd client && npm run build

# Stage 2: Setup the Node.js server
FROM node:16-alpine AS server
WORKDIR /app

# Copy the server package.json and install server dependencies
COPY ./server/package.json ./server/package-lock.json* ./server/
RUN cd server && npm install

# Copy the server code
COPY ./server /app/server

# Copy the built React app from the client-builder stage
COPY --from=client-builder /app/client/build /app/server/public

# Set environment variables (optional)
ENV NODE_ENV=production

# Expose the port your server is running on (3001 for example)
EXPOSE 3001

# Run the server
CMD ["node", "server/server.js"]