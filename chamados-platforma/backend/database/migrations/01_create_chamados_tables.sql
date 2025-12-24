
-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: terceirize_mysql:3306
-- Tempo de geração: 18/12/2025 às 18:20
-- Versão do servidor: 8.0.44
-- Versão do PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `chamados_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `chamados`
--

CREATE TABLE `chamados` (
  `id` int NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sistema` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do sistema (implantacao, cozinha_industrial, etc)',
  `tela` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Rota/tela específica onde o problema ocorreu',
  `tipo` enum('bug','erro','melhoria','feature') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'bug',
  `status` enum('aberto','em_analise','em_desenvolvimento','em_teste','concluido','fechado') COLLATE utf8mb4_unicode_ci DEFAULT 'aberto',
  `prioridade` enum('baixa','media','alta','critica') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `usuario_abertura_id` int NOT NULL,
  `usuario_responsavel_id` int DEFAULT NULL,
  `data_abertura` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_conclusao` timestamp NULL DEFAULT NULL,
  `data_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ativo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `chamados_anexos`
--

CREATE TABLE `chamados_anexos` (
  `id` int NOT NULL,
  `chamado_id` int NOT NULL,
  `comentario_id` int DEFAULT NULL,
  `nome_arquivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caminho_arquivo` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_arquivo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tamanho` int DEFAULT NULL COMMENT 'Tamanho em bytes',
  `data_upload` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ativo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `chamados_comentarios`
--

CREATE TABLE `chamados_comentarios` (
  `id` int NOT NULL,
  `chamado_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `comentario` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('comentario','resolucao','atualizacao') COLLATE utf8mb4_unicode_ci DEFAULT 'comentario',
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ativo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `chamados_historico`
--

CREATE TABLE `chamados_historico` (
  `id` int NOT NULL,
  `chamado_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `campo_alterado` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valor_anterior` text COLLATE utf8mb4_unicode_ci,
  `valor_novo` text COLLATE utf8mb4_unicode_ci,
  `data_alteracao` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `permissoes_usuario`
--

CREATE TABLE `permissoes_usuario` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `tela` varchar(50) NOT NULL,
  `pode_visualizar` tinyint(1) DEFAULT '0',
  `pode_criar` tinyint(1) DEFAULT '0',
  `pode_editar` tinyint(1) DEFAULT '0',
  `pode_excluir` tinyint(1) DEFAULT '0',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pode_movimentar` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Despejando dados para a tabela `permissoes_usuario`
--

INSERT INTO `permissoes_usuario` (`id`, `usuario_id`, `tela`, `pode_visualizar`, `pode_criar`, `pode_editar`, `pode_excluir`, `criado_em`, `atualizado_em`, `pode_movimentar`) VALUES
(4351, 4, 'usuarios', 1, 1, 1, 1, '2025-12-18 18:04:29', '2025-12-18 18:04:29', 0),
(4352, 4, 'permissoes', 1, 1, 1, 1, '2025-12-18 18:04:29', '2025-12-18 18:04:29', 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel_de_acesso` enum('I','II','III') COLLATE utf8mb4_unicode_ci DEFAULT 'I',
  `tipo_de_acesso` enum('administrador','supervisor','nutricionista','usuario') COLLATE utf8mb4_unicode_ci DEFAULT 'usuario',
  `status` enum('ativo','inativo','bloqueado') COLLATE utf8mb4_unicode_ci DEFAULT 'ativo',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `nivel_de_acesso`, `tipo_de_acesso`, `status`, `criado_em`, `atualizado_em`) VALUES
(4, 'Luiz Nicolao', 'luiz.nicolao@terceirizemais.com.br', '$2y$10$MJ2Fa2btWKyZlOFvjHb64.vPJkZmzD1HHP6YG7K.EbIUt5WP4X6ii', 'III', 'administrador', 'ativo', '2025-07-15 19:30:52', '2025-09-08 22:18:36');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `chamados`
--
ALTER TABLE `chamados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sistema` (`sistema`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_prioridade` (`prioridade`),
  ADD KEY `idx_usuario_abertura` (`usuario_abertura_id`),
  ADD KEY `idx_usuario_responsavel` (`usuario_responsavel_id`),
  ADD KEY `idx_data_abertura` (`data_abertura`);

--
-- Índices de tabela `chamados_anexos`
--
ALTER TABLE `chamados_anexos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chamado` (`chamado_id`),
  ADD KEY `idx_comentario` (`comentario_id`);

--
-- Índices de tabela `chamados_comentarios`
--
ALTER TABLE `chamados_comentarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chamado` (`chamado_id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_data_criacao` (`data_criacao`);

--
-- Índices de tabela `chamados_historico`
--
ALTER TABLE `chamados_historico`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chamado` (`chamado_id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_data_alteracao` (`data_alteracao`);

--
-- Índices de tabela `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_permissoes_usuario_usuario_id` (`usuario_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `chamados`
--
ALTER TABLE `chamados`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `chamados_anexos`
--
ALTER TABLE `chamados_anexos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `chamados_comentarios`
--
ALTER TABLE `chamados_comentarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `chamados_historico`
--
ALTER TABLE `chamados_historico`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4353;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `chamados`
--
ALTER TABLE `chamados`
  ADD CONSTRAINT `chamados_ibfk_1` FOREIGN KEY (`usuario_abertura_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `chamados_ibfk_2` FOREIGN KEY (`usuario_responsavel_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `chamados_anexos`
--
ALTER TABLE `chamados_anexos`
  ADD CONSTRAINT `chamados_anexos_ibfk_1` FOREIGN KEY (`chamado_id`) REFERENCES `chamados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chamados_anexos_ibfk_2` FOREIGN KEY (`comentario_id`) REFERENCES `chamados_comentarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `chamados_comentarios`
--
ALTER TABLE `chamados_comentarios`
  ADD CONSTRAINT `chamados_comentarios_ibfk_1` FOREIGN KEY (`chamado_id`) REFERENCES `chamados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chamados_comentarios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT;

--
-- Restrições para tabelas `chamados_historico`
--
ALTER TABLE `chamados_historico`
  ADD CONSTRAINT `chamados_historico_ibfk_1` FOREIGN KEY (`chamado_id`) REFERENCES `chamados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chamados_historico_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT;

--
-- Restrições para tabelas `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  ADD CONSTRAINT `permissoes_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
