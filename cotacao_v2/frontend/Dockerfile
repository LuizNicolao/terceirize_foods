FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Configurar variáveis de ambiente para aceitar hosts externos
ENV HOST=0.0.0.0
ENV WDS_SOCKET_HOST=0.0.0.0
ENV WDS_SOCKET_PORT=3000
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "start"] 