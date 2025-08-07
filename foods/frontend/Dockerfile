FROM node:18

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências globalmente primeiro
RUN npm install -g react-scripts

# Instalar todas as dependências (incluindo devDependencies)
RUN npm install --production=false

# Verificar se react-scripts foi instalado
RUN which react-scripts || echo "react-scripts não encontrado no PATH"

# Copiar o resto dos arquivos
COPY . .

# Expor porta 3000
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"] 