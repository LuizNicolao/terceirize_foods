FROM node:16-alpine

WORKDIR /app

# Instalar curl para o healthcheck
RUN apk add --no-cache curl

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"] 