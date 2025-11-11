FROM node:18-alpine

WORKDIR /app

# Instalar dependências necessárias para Puppeteer/Chrome
RUN apk add --no-cache \
    python3 \
    py3-pip \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Definir variável de ambiente para Puppeteer usar o Chrome instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./

RUN npm install

COPY . .

# Instalar dependências Python do serviço de PDF
RUN python3 -m venv /app/venv \
    && /app/venv/bin/pip install --upgrade pip \
    && if [ -f requirements.txt ]; then /app/venv/bin/pip install -r requirements.txt; fi

EXPOSE 3001

CMD ["npm", "start"] 