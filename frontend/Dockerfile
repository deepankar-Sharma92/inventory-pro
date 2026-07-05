# --- Inventory Pro frontend (React + Vite) ---

# Stage 1: build the static assets
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# The API URL is baked into the static build. Pass it at build time with:
#   docker compose build --build-arg VITE_API_URL=http://localhost:8001 frontend
ARG VITE_API_URL=http://localhost:8001
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: serve with nginx
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
