FROM node:22-alpine
WORKDIR /app
COPY . .
ENV PORT=4000 TZ=Asia/Tashkent KARTO_DATA=/app/data
VOLUME /app/data
EXPOSE 4000
CMD ["node", "server/server.js"]
