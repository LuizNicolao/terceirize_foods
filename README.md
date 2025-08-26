# 🏢 Terceirize Foods - Sistema de Gestão

Este repositório contém múltiplos sistemas de gestão para a empresa Terceirize Foods com banco de dados centralizado.

## 📁 Estrutura do Projeto

### 🗄️ **database/** - Banco de Dados Centralizado
Banco de dados MySQL e PHPMyAdmin compartilhado por todos os sistemas.

- **docker-compose.yml** - MySQL + PHPMyAdmin
- **init/** - Scripts de inicialização
- **README.md** - Documentação do banco

### 🍽️ **foods/** - Sistema Principal de Gestão
Sistema completo de cadastro e gestão de informações da empresa.

- **backend/** - API Node.js/Express
- **frontend/** - Interface React
- **docker-compose.yml** - Configuração Docker (sem banco)
- **README.md** - Documentação do sistema

### 📊 **cotacao/** - Sistema de Cotações
Sistema para gestão de cotações e fornecedores.

- **backend/** - API Node.js/Express
- **frontend/** - Interface React
- **docker-compose.yml** - Configuração Docker (sem banco)

### 📱 **conect_foods_app/** - Aplicativo Mobile
Aplicativo Flutter para operações em campo.

- **lib/** - Código fonte Dart/Flutter
- **android/** - Configurações Android
- **pubspec.yaml** - Dependências Flutter

## 🚀 Como Executar

### 1. Banco de Dados Centralizado (PRIMEIRO)
```bash
cd database
docker-compose up -d
```

### 2. Sistema Principal (foods)
```bash
cd foods
docker-compose up -d
```

### 3. Sistema de Cotações (cotacao)
```bash
cd cotacao
docker-compose up -d
```

### 4. App Mobile (conect_foods_app)
```bash
cd conect_foods_app
flutter pub get
flutter run
```

## 🌐 URLs de Acesso

### Banco Centralizado
- **PHPMyAdmin:** http://localhost:8080
  - **Usuário:** foods_user
  - **Senha:** foods123456

### Sistema Principal (foods)
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api

### Sistema de Cotações (cotacao)
- **Frontend:** http://localhost:3002
- **Backend API:** http://localhost:5000/api

## 🔧 Tecnologias Utilizadas

- **Backend:** Node.js, Express, MySQL
- **Frontend:** React, Styled Components
- **Mobile:** Flutter
- **Infraestrutura:** Docker, Docker Compose
- **Banco de Dados:** MySQL 8.0 (Centralizado)

## 📋 Documentação

- **database/README.md** - Documentação do banco centralizado
- **foods/README.md** - Documentação do sistema principal
- **foods/TRATATIVAS_FUTURAS.md** - Tratativas e melhorias futuras
- **foods/CORRECOES_PAGINAS.md** - Correções realizadas
- **foods/LIMPEZA_LOGS.md** - Limpeza de logs

## 🛠️ Manutenção

### Parar Todos os Sistemas
```bash
# Parar foods
cd foods && docker-compose down

# Parar cotacao
cd cotacao && docker-compose down

# Parar banco (ÚLTIMO)
cd database && docker-compose down
```

### Verificar Status
```bash
# Verificar todos os containers
docker ps

# Ver logs específicos
docker-compose logs -f
```

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento. 