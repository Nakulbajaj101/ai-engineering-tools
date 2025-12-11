# Build Stage for Frontend
FROM node:25-alpine as frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Final Stage
FROM node:25-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production

# Copy backend source code
COPY backend/ ./

# Copy built frontend assets from build stage
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
