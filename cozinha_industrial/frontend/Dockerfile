# Build stage
FROM node:18 as build

WORKDIR /app

# Copiar foods-shared (dependência local)
COPY foods/frontend /foods-shared

# Copiar package.json do cozinha_industrial
COPY cozinha_industrial/frontend/package.json ./

# Instalar dependências (incluindo foods-shared local)
RUN npm install

# Copiar o resto dos arquivos do cozinha_industrial
COPY cozinha_industrial/frontend .

# Build da aplicação
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar a configuração do nginx
COPY cozinha_industrial/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos buildados
COPY --from=build /app/build /usr/share/nginx/html

# Expor porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
