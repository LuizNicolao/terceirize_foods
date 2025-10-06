-- Usar o banco de dados de implantação
USE implantacao_db;

-- ==============================================
-- TABELAS ESSENCIAIS (COPIADAS DO FOODS)
-- ==============================================

-- Tabela de usuários (copiada do foods)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `senha` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nivel_de_acesso` enum('I','II','III') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'I',
  `tipo_de_acesso` enum('administrador','coordenador','administrativo','gerente','supervisor','nutricionista') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'administrativo',
  `status` enum('ativo','inativo','bloqueado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela de permissões (copiada do foods)
CREATE TABLE IF NOT EXISTS `permissoes_usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `tela` varchar(50) NOT NULL,
  `pode_visualizar` tinyint(1) DEFAULT '0',
  `pode_criar` tinyint(1) DEFAULT '0',
  `pode_editar` tinyint(1) DEFAULT '0',
  `pode_excluir` tinyint(1) DEFAULT '0',
  `pode_movimentar` tinyint(1) DEFAULT '0',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `tela` (`tela`),
  CONSTRAINT `permissoes_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==============================================
-- DADOS INICIAIS
-- ==============================================

-- Inserir usuário administrador padrão (mesmo do foods)
INSERT IGNORE INTO `usuarios` (`id`, `nome`, `email`, `senha`, `nivel_de_acesso`, `tipo_de_acesso`, `status`) VALUES
(1, 'Administrador', 'luiz.nicolao@terceirizemais.com.br', '$2y$10$MJ2Fa2btWKyZlOFvjHb64.vPJkZmzD1HHP6YG7K.EbIUt5WP4X6ii', 'III', 'administrador', 'ativo');

-- Tabela de auditoria (mesma estrutura do sistema Foods)
CREATE TABLE IF NOT EXISTS `auditoria_acoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `acao` varchar(50) NOT NULL,
  `recurso` varchar(100) NOT NULL,
  `detalhes` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_acao` (`acao`),
  KEY `idx_recurso` (`recurso`),
  KEY `idx_timestamp` (`timestamp`),
  CONSTRAINT `auditoria_acoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserir permissões básicas para o administrador
INSERT IGNORE INTO `permissoes_usuario` (`usuario_id`, `tela`, `pode_visualizar`, `pode_criar`, `pode_editar`, `pode_excluir`, `pode_movimentar`) VALUES
(1, 'dashboard', 1, 0, 0, 0, 0),
(1, 'usuarios', 1, 1, 1, 1, 0),
(1, 'permissoes', 1, 1, 1, 1, 0),
(1, 'escolas', 1, 1, 1, 1, 0),
(1, 'necessidades', 1, 1, 1, 1, 0),
(1, 'produtos', 1, 1, 1, 1, 0),
(1, 'auditoria', 1, 0, 0, 0, 0);