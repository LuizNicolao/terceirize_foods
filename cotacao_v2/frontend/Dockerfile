FROM node:16-alpine

WORKDIR /app

# Copiar package.json primeiro
COPY package.json ./

# Instalar dependências
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"] 