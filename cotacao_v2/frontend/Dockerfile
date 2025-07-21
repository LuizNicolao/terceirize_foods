FROM node:18-alpine

WORKDIR /app

# Configurar npm para usar registry mais rápido e cache
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set cache /tmp/npm-cache

# Copiar package files primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instalar dependências com cache otimizado
RUN npm install --prefer-offline --no-audit && \
    npm cache clean --force

# Copiar código da aplicação
COPY . .

EXPOSE 3000

CMD ["npm", "start"] 