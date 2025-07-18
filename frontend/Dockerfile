FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências
RUN npm install

# Verificar se react-scripts foi instalado
RUN npx react-scripts --version || echo "react-scripts não encontrado"

# Copiar o resto dos arquivos
COPY . .

# Expor porta 3000
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"] 