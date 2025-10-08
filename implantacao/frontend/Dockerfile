# Build stage
FROM node:18 as build

WORKDIR /workspace

# Copiar estrutura de pastas (manter hierarquia)
COPY foods/frontend /workspace/foods/frontend
COPY implantacao/frontend /workspace/implantacao/frontend

# Ir para diretório do implantacao
WORKDIR /workspace/implantacao/frontend

# Instalar dependências (vai resolver file:../../foods/frontend)
RUN npm install

# Build da aplicação
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar a configuração do nginx
COPY implantacao/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos buildados
COPY --from=build /workspace/implantacao/frontend/build /usr/share/nginx/html

# Expor porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
