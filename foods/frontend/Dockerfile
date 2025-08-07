FROM node:18 as build

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Fazer build de produção
RUN npm run build

# Stage de produção
FROM nginx:alpine

# Copiar os arquivos buildados
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"] 