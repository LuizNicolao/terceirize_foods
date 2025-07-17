-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 17/07/2025 às 16:58
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
-- Estrutura para tabela `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL COMMENT 'Nome da classe (ex: BOVINO, SUÍNO, FRANGO)',
  `subgrupo_id` int(11) NOT NULL COMMENT 'ID do subgrupo ao qual a classe pertence',
  `descricao` text DEFAULT NULL COMMENT 'Descrição detalhada da classe',
  `status` tinyint(1) DEFAULT 1 COMMENT 'Status da classe (1=ativo, 0=inativo)',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `classes`
--

INSERT INTO `classes` (`id`, `nome`, `subgrupo_id`, `descricao`, `status`, `criado_em`, `atualizado_em`) VALUES
(1, 'BOVINO', 1, 'Produtos de carne bovina congelada', 1, '2025-07-17 13:39:06', '2025-07-17 13:39:06'),
(2, 'SUÍNO', 1, 'Produtos de carne suína congelada', 1, '2025-07-17 13:39:06', '2025-07-17 13:39:06'),
(3, 'FRANGO', 1, 'Produtos de frango congelado', 1, '2025-07-17 13:39:06', '2025-07-17 13:39:06');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_classes_nome` (`nome`),
  ADD KEY `idx_classes_subgrupo` (`subgrupo_id`),
  ADD KEY `idx_classes_status` (`status`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`subgrupo_id`) REFERENCES `subgrupos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
