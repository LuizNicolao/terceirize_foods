FROM node:16-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar o resto dos arquivos
COPY . .

# Expor a porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"] 