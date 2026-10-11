FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY *.mjs ./
RUN mkdir /data && chown node:node /data
USER node
ENV DB_PATH=/data/push.sqlite
EXPOSE 3000
CMD ["node","server.mjs"]
