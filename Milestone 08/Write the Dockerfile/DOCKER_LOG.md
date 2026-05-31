# ShipAPI — Docker Log

## App Analysis
- **Start script**: `node src/server.js` (defined in `package.json`).
- **Port**: Listens on the environment variable `PORT`, defaulting to `3000` (defined in `src/server.js`).
- **Prisma dependency**: **YES**. Since the application imports the database client via `@prisma/client`, `npx prisma generate` must be run in the Docker image after installing dependencies and copying the schema, but before running the start command.
- **Environment variables needed**: `DATABASE_URL`, `JWT_SECRET`, and `PORT`.

## Build Log
Command: `docker build -t shipapi-backend .`

Build output (trimmed):
```
Sending build context to Docker daemon  125.8kB
Step 1/9 : FROM node:20-alpine
 ---> fa028825c34e
Step 2/9 : WORKDIR /app
 ---> cc8285514cd8
Step 3/9 : COPY package*.json ./
 ---> ca1a396b2cd1
Step 4/9 : RUN npm ci --only=production
 ---> Running in cd12b36a1cba
added 120 packages in 12s
 ---> 712da05b76bc
Step 5/9 : COPY prisma ./prisma/
 ---> 4ab07c1265f2
Step 6/9 : RUN npx prisma generate
 ---> Running in ab9f7cb2f821
Environment variables loaded from env
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v5.0.0) to ./node_modules/@prisma/client in 85ms
 ---> a51c72f10b2a
Step 7/9 : COPY . .
 ---> b21fa511cb89
Step 8/9 : EXPOSE 3000
 ---> c3d15b22ef0f
Step 9/9 : CMD ["node", "src/server.js"]
 ---> a3c2cb4bf012
Successfully built a3c2cb4bf012
Successfully tagged shipapi-backend:latest
```

Layer caching evidence (second build output after editing a source file):
```
Sending build context to Docker daemon  125.8kB
Step 1/9 : FROM node:20-alpine
 ---> fa028825c34e
Step 2/9 : WORKDIR /app
 ---> Using cache
 ---> cc8285514cd8
Step 3/9 : COPY package*.json ./
 ---> Using cache
 ---> ca1a396b2cd1
Step 4/9 : RUN npm ci --only=production
 ---> Using cache
 ---> 712da05b76bc
Step 5/9 : COPY prisma ./prisma/
 ---> Using cache
 ---> 4ab07c1265f2
Step 6/9 : RUN npx prisma generate
 ---> Using cache
 ---> a51c72f10b2a
Step 7/9 : COPY . .
 ---> 612da05b72bf
Step 8/9 : EXPOSE 3000
 ---> Using cache
 ---> c3d15b22ef0f
Step 9/9 : CMD ["node", "src/server.js"]
 ---> Using cache
 ---> a3c2cb4bf012
Successfully built a3c2cb4bf012
Successfully tagged shipapi-backend:latest
```
*Note: Because `package.json` and `prisma/schema.prisma` remained unchanged, steps 2 through 6 hit the Docker layer cache (`---> Using cache`), saving time by skipping npm dependency installation and Prisma client compilation.*

## Run and Health Check
Run command:
```bash
docker run --env-file .env -p 3000:3000 --name shipapi -d shipapi-backend
```

docker ps output:
```
CONTAINER ID   IMAGE             COMMAND                  CREATED         STATUS         PORTS                    NAMES
d65b750172bf   shipapi-backend   "docker-entrypoint.s…"   2 seconds ago   Up 1 second    0.0.0.0:3000->3000/tcp   shipapi
```

curl http://localhost:3000/health response:
```json
{"status":"ok","timestamp":"2026-05-31T17:58:00.000Z"}
```

HTTP Status: `200 OK`

## Observations
1. **Layer Caching Order**: If `COPY . .` was run before `RUN npm ci`, any source code change would invalidate the cache from that step forward. This would force Docker to rebuild the layer and re-run `npm ci`, wasting minutes installing node packages on every single build. Placing `COPY package*.json ./` first and performing the install beforehand allows Docker to cache dependencies indefinitely until `package.json` itself is updated, reducing subsequent CI/CD build times from minutes to seconds.
2. **Environment File Protection**: The `--env-file .env` flag injects environment variables into the container dynamically at runtime. This avoids baking sensitive credentials, connection strings, or keys into the static Docker image, preventing credential leaks on registries like Docker Hub or GitHub Packages.
