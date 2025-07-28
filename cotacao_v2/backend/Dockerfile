FROM node:16-alpine

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./

# Instalar dependências como root
RUN npm install

# Copiar arquivos do projeto
COPY . .

# Mudar propriedade dos arquivos para o usuário nodejs
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

EXPOSE 5000

CMD ["npm", "run", "dev"] 