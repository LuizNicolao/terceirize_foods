# 🚀 Guia Completo de Migração para MySQL

## 📋 Resumo da Migração Realizada

Este guia documenta a migração completa do app Android de Google Sheets para MySQL VPS, incluindo todas as configurações necessárias para replicar em outros projetos.

## 🎯 Objetivo

Migrar consultas de planilhas Google Sheets para banco MySQL em VPS, mantendo a mesma interface do usuário.

---

## 🖥️ **PARTE 1: CONFIGURAÇÃO DA VPS**

### 1.1 Pré-requisitos da VPS

```
Host: 191.252.110.115
Porta MySQL: 3306
Banco: app_manutencao
Usuário: app_user
Senha: app_passwd

```

### 1.2 Instalação do Node.js na VPS

```bash
# Conectar na VPS
ssh root@191.252.110.115

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL <https://deb.nodesource.com/setup_18.x> | sudo -E bash -
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version

```

### 1.3 Configuração do MySQL

```sql
-- Conectar no MySQL como root
mysql -u root -p

-- Criar banco de dados
CREATE DATABASE app_manutencao;

-- Criar usuário
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'app_manutencao';
CREATE USER 'app_user'@'127.0.0.1' IDENTIFIED BY 'app_manutencao';

-- Dar permissões
GRANT ALL PRIVILEGES ON app_manutencao.* TO 'app_user'@'localhost';
GRANT ALL PRIVILEGES ON app_manutencao.* TO 'app_user'@'127.0.0.1';
FLUSH PRIVILEGES;

-- Verificar usuários
SELECT user, host FROM mysql.user WHERE user = 'app_user';

```

### 1.4 Configuração do Firewall

```bash
# Abrir porta 8080
ufw allow 8080
ufw enable

# Verificar status
ufw status

```

---

## 📁 **PARTE 2: API NODE.JS**

### 2.1 Estrutura de Arquivos na VPS

```
/var/www/app-manutencao-api/
├── package.json
├── server.js
├── node_modules/
└── .env (opcional)

```

### 2.2 Criar Diretório da API

```bash
# Criar pasta
mkdir -p /var/www/app-manutencao-api
cd /var/www/app-manutencao-api

```

### 2.3 Arquivo package.json

```json
{
  "name": "app-manutencao-api",
  "version": "1.0.0",
  "description": "API REST para o app de manutenção",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "keywords": ["api", "manutencao", "mysql"],
  "author": "Seu Nome",
  "license": "MIT"
}

```

### 2.4 Arquivo server.js

```jsx
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do MySQL
const dbConfig = {
    host: '127.0.0.1', // Forçar IPv4
    port: 3306,
    user: 'app_user',
    password: 'app_manutencao',
    database: 'app_manutencao',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Pool de conexões MySQL
const pool = mysql.createPool(dbConfig);

// Teste de conexão
pool.getConnection()
    .then(connection => {
        console.log('✅ Conectado ao MySQL com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao MySQL:', err);
    });

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        message: 'API App Manutenção funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota para buscar estoque
app.get('/api/estoque', async (req, res) => {
    try {
        const { local } = req.query;

        let query = 'SELECT * FROM estoque';
        let params = [];

        if (local) {
            // Usa aba_nome para filtrar por local
            if (local === 'CCO') {
                query += ' WHERE aba_nome = ?';
                params.push('ESTOQUE CCO');
            } else if (local === 'CTB') {
                query += ' WHERE aba_nome = ?';
                params.push('ESTOQUE CTB');
            }
        }

        const [rows] = await pool.execute(query, params);

        console.log(`📦 Estoque consultado: ${rows.length} itens para local: ${local || 'todos'}`);

        // Se não encontrou dados com filtro, retorna todos os dados
        if (rows.length === 0 && local) {
            console.log(`⚠️ Nenhum dado encontrado para ${local}, retornando todos os dados`);
            const [allRows] = await pool.execute('SELECT * FROM estoque');
            res.json(allRows);
        } else {
            res.json(rows);
        }

    } catch (error) {
        console.error('❌ Erro ao buscar estoque:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

// Rota para buscar ordens de serviço
app.get('/api/ordens-servico', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM ordem_servico_manutentor');

        console.log(`🔧 Ordens de serviço consultadas: ${rows.length} registros`);

        res.json(rows);

    } catch (error) {
        console.error('❌ Erro ao buscar ordens de serviço:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

// Rota para buscar solicitações
app.get('/api/solicitacoes', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM solicitacoes_nutricionista');

        console.log(`📋 Solicitações consultadas: ${rows.length} registros`);

        res.json(rows);

    } catch (error) {
        console.error('❌ Erro ao buscar solicitações:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

// Rota para buscar manutentores
app.get('/api/manutentores', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM manutentores');

        console.log(`👷 Manutentores consultados: ${rows.length} registros`);

        res.json(rows);

    } catch (error) {
        console.error('❌ Erro ao buscar manutentores:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 API disponível em: <http://191.252.110.115>:${PORT}`);
    console.log(`🔗 Endpoints disponíveis:`);
    console.log(`   - GET /api/estoque?local=CCO`);
    console.log(`   - GET /api/estoque?local=CTB`);
    console.log(`   - GET /api/ordens-servico`);
    console.log(`   - GET /api/solicitacoes`);
    console.log(`   - GET /api/manutentores`);
});

```

### 2.5 Instalação e Configuração da API

```bash
# Na pasta da API
cd /var/www/app-manutencao-api

# Instalar dependências
npm install

# Testar API
npm start

# Testar endpoints
curl <http://191.252.110.115:8080/>
curl <http://191.252.110.115:8080/api/estoque?local=CCO>

```

### 2.6 Configurar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar API com PM2
pm2 start server.js --name "app-manutencao-api"

# Configurar para iniciar com o sistema
pm2 startup
pm2 save

# Ver logs
pm2 logs app-manutencao-api

# Ver status
pm2 status

```

---

## 📱 **PARTE 3: CONFIGURAÇÃO DO APP ANDROID**

### 3.1 Dependências no build.gradle

```
// Adicionar no app/build.gradle
dependencies {
    // ... outras dependências existentes ...

    // MySQL Connector para Android
    implementation 'mysql:mysql-connector-java:8.0.33'

    // OkHttp para requisições HTTP
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'

    // Gson para JSON
    implementation 'com.google.code.gson:gson:2.10.1'
}

```

### 3.2 Configuração do AndroidManifest.xml

```xml
<!-- Adicionar no AndroidManifest.xml -->
<application
    android:usesCleartextTraffic="true"
    ... >

```

### 3.3 Arquivo de Configuração VPSConfig.java

```java
package com.example.appmanutencao.config;

/**
 * Configurações da VPS MySQL
 */
public class VPSConfig {

    // Configurações do servidor
    public static final String VPS_HOST = "191.252.110.115";
    public static final int VPS_PORT = 3306;
    public static final String VPS_DATABASE = "app_manutencao";
    public static final String VPS_USER = "app_user";
    public static final String VPS_PASSWORD = "app_manutencao";

    // Configurações da API
    public static final String API_BASE_URL = "<http://191.252.110.115:8080/api>";

    // Timeouts
    public static final int CONNECTION_TIMEOUT = 10000; // 10 segundos
    public static final int READ_TIMEOUT = 30000; // 30 segundos

    // Configurações de retry
    public static final int MAX_RETRY_ATTEMPTS = 3;
    public static final int RETRY_DELAY_MS = 2000; // 2 segundos

    // URLs das APIs específicas
    public static final String API_ESTOQUE = "/estoque";
    public static final String API_ORDENS_SERVICO = "/ordens-servico";
    public static final String API_SOLICITACOES = "/solicitacoes";
    public static final String API_MANUTENTORES = "/manutentores";

    /**
     * Retorna a URL completa para uma API específica
     */
    public static String getApiUrl(String endpoint) {
        return API_BASE_URL + endpoint;
    }

    /**
     * Retorna a URL do estoque com parâmetros
     */
    public static String getEstoqueUrl(String local) {
        return getApiUrl(API_ESTOQUE) + "?local=" + local;
    }

    /**
     * Retorna a string de conexão JDBC
     */
    public static String getJdbcUrl() {
        return "jdbc:mysql://" + VPS_HOST + ":" + VPS_PORT + "/" + VPS_DATABASE;
    }
}

```

### 3.4 Manager MySQLManager.java

```java
package com.example.appmanutencao.manager;

import android.content.Context;
import android.util.Log;
import com.example.appmanutencao.model.ItemEstoque;
import com.example.appmanutencao.config.VPSConfig;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import okhttp3.*;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MySQLManager {
    private static final String TAG = "MySQLManager";

    // Configurações da VPS
    private static final String BASE_URL = VPSConfig.API_BASE_URL;
    private static final String DB_HOST = VPSConfig.VPS_HOST;
    private static final int DB_PORT = VPSConfig.VPS_PORT;
    private static final String DB_NAME = VPSConfig.VPS_DATABASE;
    private static final String DB_USER = VPSConfig.VPS_USER;
    private static final String DB_PASSWORD = VPSConfig.VPS_PASSWORD;

    private Context context;
    private OkHttpClient httpClient;
    private Gson gson;
    private ExecutorService executorService;

    public MySQLManager(Context context) {
        this.context = context;
        this.httpClient = new OkHttpClient();
        this.gson = new Gson();
        this.executorService = Executors.newSingleThreadExecutor();
    }

    /**
     * Busca todos os itens do estoque da VPS
     */
    public void buscarItensEstoque(String local, BuscaCallback callback) {
        executorService.execute(() -> {
            try {
                Log.d(TAG, "=== BUSCANDO ITENS DO ESTOQUE ===");
                Log.d(TAG, "Local: " + local);

                // Implementação real via HTTP para a API da VPS
                buscarEstoqueViaHTTP(local, callback);

            } catch (Exception e) {
                Log.e(TAG, "=== ERRO AO BUSCAR ESTOQUE ===");
                Log.e(TAG, "Erro: " + e.getMessage());
                Log.e(TAG, "Stack trace: ", e);

                if (callback != null) {
                    callback.onErro("Erro ao buscar estoque: " + e.getMessage());
                }
            }
        });
    }

    /**
     * Implementação real com HTTP para API da VPS
     */
    private void buscarEstoqueViaHTTP(String local, BuscaCallback callback) {
        try {
            // URL da API da VPS
            String url = BASE_URL + "/estoque?local=" + local;

            Request request = new Request.Builder()
                    .url(url)
                    .get()
                    .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.e(TAG, "Erro na requisição HTTP: " + e.getMessage());
                    if (callback != null) {
                        callback.onErro("Erro de conexão: " + e.getMessage());
                    }
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (response.isSuccessful()) {
                        String jsonResponse = response.body().string();
                        Log.d(TAG, "Resposta da API: " + jsonResponse);

                        try {
                            List<ItemEstoque> itens = gson.fromJson(jsonResponse,
                                new TypeToken<List<ItemEstoque>>(){}.getType());

                            if (callback != null) {
                                callback.onSucesso(itens);
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "Erro ao parsear JSON: " + e.getMessage());
                            if (callback != null) {
                                callback.onErro("Erro ao processar dados: " + e.getMessage());
                            }
                        }
                    } else {
                        Log.e(TAG, "Erro na resposta HTTP: " + response.code());
                        if (callback != null) {
                            callback.onErro("Erro do servidor: " + response.code());
                        }
                    }
                }
            });

        } catch (Exception e) {
            Log.e(TAG, "Erro na requisição HTTP: " + e.getMessage());
            if (callback != null) {
                callback.onErro("Erro na requisição: " + e.getMessage());
            }
        }
    }

    public interface BuscaCallback {
        void onSucesso(List<ItemEstoque> itens);
        void onErro(String mensagem);
    }

    public void destroy() {
        if (executorService != null && !executorService.isShutdown()) {
            executorService.shutdown();
        }
    }
}

```

### 3.5 Modificação das Activities

### EstoqueChapecoActivity.java

```java
// Adicionar import
import com.example.appmanutencao.manager.MySQLManager;

// Adicionar variável
private MySQLManager mysqlManager;

// No onCreate()
mysqlManager = new MySQLManager(this);

// Modificar método carregarDadosEstoque()
private void carregarDadosEstoque() {
    Log.d(TAG, "=== CARREGANDO DADOS DO ESTOQUE ===");
    mostrarProgresso(true);

    // Carrega dados da API MySQL diretamente
    mysqlManager.buscarItensEstoque("CCO", new MySQLManager.BuscaCallback() {
        @Override
        public void onSucesso(List<ItemEstoque> itens) {
            runOnUiThread(() -> {
                todosItens = itens;

                Log.d(TAG, "Itens carregados da API: " + todosItens.size());

                // Cria chips de categoria dinamicamente
                criarChipsCategoriaDinamicos();

                // Aplica filtros atuais
                aplicarFiltros();

                mostrarProgresso(false);

                // Mostra estatísticas
                mostrarEstatisticas();
            });
        }

        @Override
        public void onErro(String mensagem) {
            Log.e(TAG, "Erro ao carregar dados: " + mensagem);
            runOnUiThread(() -> {
                // Em caso de erro, carrega dados locais como fallback
                todosItens = estoqueManager.buscarTodosItens();

                Log.d(TAG, "Itens carregados do fallback: " + todosItens.size());

                criarChipsCategoriaDinamicos();
                aplicarFiltros();
                mostrarProgresso(false);
                mostrarEstatisticas();
            });
        }
    });
}

// Modificar método mostrarEstatisticas()
private void mostrarEstatisticas() {
    // Calcula estatísticas baseadas nos dados atuais
    int totalItens = todosItens.size();
    int totalQuantidade = 0;
    int itensEstoqueBaixo = 0;

    for (ItemEstoque item : todosItens) {
        totalQuantidade += item.getQuantidade();
        if (item.getQuantidade() < 10) {
            itensEstoqueBaixo++;
        }
    }

    Log.d(TAG, "=== ESTATÍSTICAS DO ESTOQUE ===");
    Log.d(TAG, "Total de itens: " + totalItens);
    Log.d(TAG, "Quantidade total: " + totalQuantidade);
    Log.d(TAG, "Itens com estoque baixo: " + itensEstoqueBaixo);

    if (itensEstoqueBaixo > 0) {
        Toast.makeText(this,
            "⚠️ " + itensEstoqueBaixo + " itens com estoque baixo",
            Toast.LENGTH_SHORT).show();
    }
}

```

### EstoqueCuritibanosActivity.java

```java
// Mesmas modificações, mas usar "CTB" ao invés de "CCO"
mysqlManager.buscarItensEstoque("CTB", new MySQLManager.BuscaCallback() {
    // ... mesmo código ...
});

```

---

## 🔧 **PARTE 4: PARA OUTROS APPS**

### 4.1 Criar Nova API para Outro App

```bash
# Criar nova pasta
mkdir -p /var/www/outro-app-api
cd /var/www/outro-app-api

# Copiar arquivos base
cp /var/www/app-manutencao-api/package.json .
cp /var/www/app-manutencao-api/server.js .

# Editar configurações
nano server.js
# Alterar:
# - Nome da API
# - Porta (ex: 8081)
# - Banco de dados
# - Tabelas específicas

```

### 4.2 Configurar Nova Porta

```bash
# Abrir nova porta
ufw allow 8081

# Iniciar nova API
pm2 start server.js --name "outro-app-api"

```

### 4.3 Modificar App Android

```java
// Alterar configurações no VPSConfig.java
public static final String API_BASE_URL = "<http://191.252.110.115:8081/api>";

// Alterar endpoints específicos
public static final String API_ESTOQUE = "/estoque-outro-app";

```

---

## 🧪 **PARTE 5: TESTES**

### 5.1 Teste da API

```bash
# Teste básico
curl <http://191.252.110.115:8080/>

# Teste estoque
curl <http://191.252.110.115:8080/api/estoque?local=CCO>
curl <http://191.252.110.115:8080/api/estoque?local=CTB>

# Teste outros endpoints
curl <http://191.252.110.115:8080/api/ordens-servico>
curl <http://191.252.110.115:8080/api/solicitacoes>

```

### 5.2 Teste do App Android

1. Compile o projeto
2. Execute no dispositivo
3. Acesse as telas de estoque
4. Verifique logs:
    
    ```
    === BUSCANDO ITENS DO ESTOQUE ===
    Local: CCO
    Itens carregados da API: 1
    
    ```
    

---

## 📊 **PARTE 6: MONITORAMENTO**

### 6.1 Logs da API

```bash
# Ver logs em tempo real
pm2 logs app-manutencao-api

# Ver status
pm2 status

# Reiniciar API
pm2 restart app-manutencao-api

```

### 6.2 Logs do App

```bash
# No Android Studio
adb logcat | grep "Estoque"

```

---

## 🔒 **PARTE 7: SEGURANÇA**

### 7.1 Recomendações

- Usar HTTPS (certificado SSL)
- Implementar autenticação
- Rate limiting
- Backup automático do banco
- Firewall configurado

### 7.2 Exemplo de HTTPS

```bash
# Instalar certbot
apt install certbot

# Gerar certificado (se tiver domínio)
certbot certonly --standalone -d seu-dominio.com

```

---

## ✅ **CHECKLIST DE MIGRAÇÃO**

### VPS

- [ ]  Node.js instalado
- [ ]  MySQL configurado
- [ ]  Usuários MySQL criados
- [ ]  Firewall configurado
- [ ]  API criada e funcionando
- [ ]  PM2 configurado

### App Android

- [ ]  Dependências adicionadas
- [ ]  AndroidManifest.xml configurado
- [ ]  VPSConfig.java criado
- [ ]  MySQLManager.java criado
- [ ]  Activities modificadas
- [ ]  Testes realizados

### Testes

- [ ]  API respondendo
- [ ]  App conectando
- [ ]  Dados exibidos corretamente
- [ ]  Estatísticas corretas
- [ ]  Logs funcionando

---

## 🆘 **TROUBLESHOOTING**

### Erro de CLEARTEXT

```xml
<!-- Adicionar no AndroidManifest.xml -->
android:usesCleartextTraffic="true"

```

### Erro de conexão MySQL

```bash
# Verificar se MySQL está rodando
systemctl status mysql

# Testar conexão
mysql -u app_user -p -h 127.0.0.1 app_manutencao

```

### API não responde

```bash
# Verificar se está rodando
pm2 status

# Ver logs
pm2 logs app-manutencao-api

# Verificar porta
netstat -tlnp | grep 8080

```

---

## 📝 **NOTAS IMPORTANTES**

1. **Sempre teste** a API antes de modificar o app
2. **Mantenha backups** do banco de dados
3. **Monitore logs** regularmente
4. **Use HTTPS** em produção
5. **Documente mudanças** para outros desenvolvedores

---

## 🎉 **RESULTADO FINAL**

Após seguir este guia, você terá:

- ✅ API REST funcionando na VPS
- ✅ App Android conectando com MySQL
- ✅ Dados reais sendo exibidos
- ✅ Interface mantida igual
- ✅ Sistema escalável para outros apps

**Para replicar em outros projetos, siga as mesmas etapas alterando apenas as configurações específicas (portas, bancos, endpoints).**