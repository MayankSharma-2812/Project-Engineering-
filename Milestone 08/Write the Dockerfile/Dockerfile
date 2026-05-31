FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy remaining source code
COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
