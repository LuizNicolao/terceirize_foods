-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 17/07/2025 às 18:13
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `registros`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `nome_generico_produto`
--

CREATE TABLE `nome_generico_produto` (
  `id` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `grupo_id` int(11) DEFAULT NULL,
  `subgrupo_id` int(11) DEFAULT NULL,
  `classe_id` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `nome_generico_produto`
--

INSERT INTO `nome_generico_produto` (`id`, `nome`, `grupo_id`, `subgrupo_id`, `classe_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'PATINHO BOVINO EM CUBOS 1KG', 1, 1, 1, 1, '2025-07-17 15:01:22', '2025-07-17 15:14:39'),
(2, 'ALCATRA BOVINA EM BIFE 500G', NULL, NULL, NULL, 1, '2025-07-17 15:01:22', '2025-07-17 15:01:22'),
(3, 'FRANGO INTEIRO CONGELADO', NULL, NULL, NULL, 1, '2025-07-17 15:01:22', '2025-07-17 15:01:22'),
(4, 'SALMÃO FILET CONGELADO', NULL, NULL, NULL, 1, '2025-07-17 15:01:22', '2025-07-17 15:01:22'),
(5, 'ARROZ BRANCO TIPO 1', NULL, NULL, NULL, 1, '2025-07-17 15:01:22', '2025-07-17 15:01:22'),
(6, 'FEIJÃO PRETO', NULL, NULL, NULL, 1, '2025-07-17 15:01:22', '2025-07-17 15:01:22'),
(7, 'ÓLEO DE SOJA', NULL, NULL, NULL, 1, '2025-07-17 15:01:22', '2025-07-17 15:01:22'),
(8, 'FARINHA DE TRIGO', NULL, NULL, NULL, 1, '2025-07-17 15:01:22', '2025-07-17 15:01:22');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `nome_generico_produto`
--
ALTER TABLE `nome_generico_produto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_nome_generico` (`nome`),
  ADD KEY `idx_nome_generico_status` (`status`),
  ADD KEY `idx_nome_generico_nome` (`nome`),
  ADD KEY `idx_nome_generico_grupo` (`grupo_id`),
  ADD KEY `idx_nome_generico_subgrupo` (`subgrupo_id`),
  ADD KEY `idx_nome_generico_classe` (`classe_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `nome_generico_produto`
--
ALTER TABLE `nome_generico_produto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `nome_generico_produto`
--
ALTER TABLE `nome_generico_produto`
  ADD CONSTRAINT `fk_nome_generico_classe` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_nome_generico_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_nome_generico_subgrupo` FOREIGN KEY (`subgrupo_id`) REFERENCES `subgrupos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
