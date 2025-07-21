# 🚀 Guia de Configuração da Integração

## 📋 Pré-requisitos

1. **Sistema Principal** (terceirize_foods) rodando na porta 3001
2. **Sistema de Cotação** (cotacao_v2) rodando na porta 3002
3. **Frontend do Sistema de Cotação** rodando na porta 3003
4. **Banco de dados** compartilhado ou separado (usuários sincronizados)

## ⚙️ Configuração das Variáveis de Ambiente

### Sistema Principal (.env)
```env
# Configurações de Integração
COTACAO_URL=http://localhost:3002
```

### Sistema de Cotação (.env)
```env
# Configurações do Frontend
FRONTEND_URL=http://localhost:3003
```

## 🔧 Configuração dos Bancos de Dados

### 1. Sistema Principal (foods_db)
- Banco já configurado
- Tabela `usuarios` com estrutura existente

### 2. Sistema de Cotação (cotacao_db)
- Banco já configurado
- Tabela `usuarios` deve ter estrutura compatível:
  ```sql
  CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tipo_acesso VARCHAR(50) DEFAULT 'usuario',
    nivel_acesso VARCHAR(10) DEFAULT 'I',
    senha VARCHAR(255) NOT NULL,
    status TINYINT DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
  ```

## 🚀 Como Funciona a Integração

### 1. **Acesso via Sidebar**
- Usuário clica em "Suprimentos > Cotação" no sistema principal
- Sistema gera token JWT com dados do usuário
- Redireciona para sistema de cotação com autenticação automática

### 2. **Autenticação Automática**
- Sistema de cotação recebe token via URL
- Valida token e cria/atualiza usuário localmente
- Gera novo token para sessão no sistema de cotação
- Redireciona para dashboard com usuário logado

### 3. **Sincronização de Usuários**
- Usuários são criados automaticamente no sistema de cotação
- Dados sincronizados: nome, email, tipo_acesso, nivel_acesso
- Senha padrão: "senha123" (pode ser alterada posteriormente)

## 🔐 Segurança

- Tokens JWT com expiração de 1 hora (integração) e 8 horas (sessão)
- Validação de origem do token (sistema principal)
- Verificação de permissões no sistema principal

## 📱 Testando a Integração

1. **Faça login no sistema principal**
2. **Clique em "Suprimentos > Cotação"**
3. **Sistema deve abrir em nova aba com usuário logado**
4. **Verifique se os dados do usuário estão corretos**

## 🛠️ Solução de Problemas

### Erro: "Token não fornecido"
- Verifique se a rota `/api/integration/cotacao` está funcionando
- Confirme se o token está sendo gerado corretamente

### Erro: "Token inválido"
- Verifique se o JWT_SECRET é o mesmo nos dois sistemas
- Confirme se o token não expirou

### Erro: "Usuário não encontrado"
- Verifique se o usuário existe no sistema principal
- Confirme se a estrutura da tabela usuarios está correta

### Erro: "CORS"
- Verifique as configurações de CORS nos dois sistemas
- Confirme se as URLs estão corretas

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Logs do console do navegador
2. Logs do backend dos dois sistemas
3. Configurações de rede e firewall
4. Variáveis de ambiente 