FROM node:16-alpine

WORKDIR /app

# Copiar package.json e package-lock.json primeiro
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar o resto dos arquivos
COPY . .

# Verificar se react-scripts foi instalado
RUN npm list react-scripts

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"] 