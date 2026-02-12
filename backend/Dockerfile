FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

USER node

EXPOSE 4000

ENTRYPOINT ["node", "src/server.js"]
