# --- BUILD STAGE ---
# Use a Node.js image as the base for building the application.
# It's good practice to pin the Node.js version to ensure consistent builds.
FROM node:24-alpine AS build

# Set the working directory inside the container.
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first.
# This allows Docker to cache the 'npm install' step if dependencies haven't changed,
# speeding up subsequent builds.
COPY package*.json ./

# Install dependencies.
# Using --production will install only production dependencies, which can be optimized for the build.
# For NestJS, you usually need dev dependencies to build (e.g., TypeScript, @nestjs/cli),
# so we install all, then prune for the final stage.
RUN npm install

# Copy the rest of the application source code.
COPY . .

# Build the NestJS application.
# This compiles TypeScript files into JavaScript in the 'dist' directory.
RUN npm run build

# --- PRODUCTION STAGE ---
# Use a smaller, production-ready Node.js image for the final application.
# 'alpine' images are great for smaller footprint.
FROM node:24-alpine AS production

# Set environment variables for production.
ENV NODE_ENV=production

# Create the upload directory required by tus.io.
# This directory should ideally be mounted as a volume in production deployments for persistence.
RUN mkdir -p /app/uploads

# Set the working directory for the production application.
WORKDIR /app

# Copy package.json and package-lock.json from build stage (or directly from source if preferred)
COPY --from=build /app/package*.json ./

COPY --from=build /app/.env.example ./

# Install only production dependencies in the final stage.
RUN npm install --omit=dev --frozen-lockfile

# Copy the built application from the 'build' stage.
# This copies the compiled JavaScript output and other static assets.
COPY --from=build /app/dist ./dist

# Expose the port on which the NestJS application will run.
# Ensure this matches the PORT environment variable in your .env file.
EXPOSE 3000

# Command to run the application.
# 'npm run start:prod' is a common NestJS script for starting the production build.
CMD ["npm", "run", "start:prod"]




