-- Script de inicialização dos bancos de dados
-- Terceirize Foods - Sistema Centralizado

-- Criar banco de dados do sistema principal (foods)
CREATE DATABASE IF NOT EXISTS foods_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar banco de dados do sistema de cotações
CREATE DATABASE IF NOT EXISTS cotacao_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Mostrar bancos criados
SHOW DATABASES; 