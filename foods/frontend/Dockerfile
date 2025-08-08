# Build stage
FROM node:18 as build

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências globalmente primeiro
RUN npm install -g react-scripts

# Instalar todas as dependências (incluindo devDependencies)
RUN npm install --production=false

# Copiar o resto dos arquivos
COPY . .

# Build da aplicação
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar os arquivos de build
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuração do nginx
RUN echo 'server { \
    listen 80; \
    location /foods { \
        alias /usr/share/nginx/html; \
        try_files $uri $uri/ /foods/index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]