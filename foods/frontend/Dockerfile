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

# Configurar variáveis de ambiente para aceitar hosts externos
ENV HOST=0.0.0.0
ENV WDS_SOCKET_HOST=0.0.0.0
ENV WDS_SOCKET_PORT=3000
ENV CHOKIDAR_USEPOLLING=true

# Comando para iniciar
CMD ["npm", "start"] 