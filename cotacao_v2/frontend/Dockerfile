FROM node:16-alpine

WORKDIR /app

# Copiar package.json primeiro
COPY package.json ./

# Limpar cache e instalar dependências
RUN npm cache clean --force && npm install

# Copiar o resto dos arquivos
COPY . .

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"] 