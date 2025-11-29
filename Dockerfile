FROM node:20-alpine

WORKDIR /app

COPY package.prod.json ./package.json
ENV NODE_ENV=production
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]