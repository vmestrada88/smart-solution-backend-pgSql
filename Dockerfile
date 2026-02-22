FROM node:20-alpine

WORKDIR /app

# Only copy production package.json
COPY package.prod.json ./package.json
COPY package-lock.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]