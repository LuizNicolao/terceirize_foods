FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json primeiro
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Verificar se react-scripts foi instalado
RUN ls -la node_modules/.bin/ | grep react-scripts || echo "react-scripts não encontrado"

# Copiar o resto dos arquivos
COPY . .

# Expor porta 3000
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"] 