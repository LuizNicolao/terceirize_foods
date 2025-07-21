FROM node:18-alpine

WORKDIR /app

# Configurar npm para usar registry mais rápido
RUN npm config set registry https://registry.npmjs.org/

# Copiar package files primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instalar dependências com cache
RUN npm ci && npm cache clean --force

# Copiar código da aplicação
COPY . .

EXPOSE 3000

CMD ["npm", "start"] 