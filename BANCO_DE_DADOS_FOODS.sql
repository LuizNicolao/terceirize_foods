-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Tempo de geração: 15/07/2025 às 16:15
-- Versão do servidor: 5.7.44
-- Versão do PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `BANCO DE DADOS FOODS`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `fornecedores`
--

CREATE TABLE `fornecedores` (
  `id` int(11) NOT NULL,
  `cnpj` varchar(18) NOT NULL,
  `razao_social` varchar(150) NOT NULL,
  `nome_fantasia` varchar(150) DEFAULT NULL,
  `logradouro` varchar(100) DEFAULT NULL,
  `numero` varchar(10) DEFAULT NULL,
  `cep` varchar(9) DEFAULT NULL,
  `bairro` varchar(50) DEFAULT NULL,
  `municipio` varchar(50) DEFAULT NULL,
  `uf` char(2) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupos`
--

CREATE TABLE `grupos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura para tabela `permissoes_usuario`
--

CREATE TABLE `permissoes_usuario` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tela` varchar(50) NOT NULL,
  `pode_visualizar` tinyint(1) DEFAULT '0',
  `pode_criar` tinyint(1) DEFAULT '0',
  `pode_editar` tinyint(1) DEFAULT '0',
  `pode_excluir` tinyint(1) DEFAULT '0',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `codigo_barras` varchar(50) DEFAULT NULL,
  `unidade` varchar(10) DEFAULT NULL,
  `unidade_tributavel` varchar(10) DEFAULT NULL,
  `preco_custo` decimal(10,2) DEFAULT NULL,
  `preco_venda` decimal(10,2) DEFAULT NULL,
  `estoque_atual` int(11) DEFAULT '0',
  `estoque_minimo` int(11) DEFAULT '0',
  `id_fornecedor` int(11) DEFAULT NULL,
  `peso_bruto` decimal(10,3) DEFAULT NULL,
  `peso_liquido` decimal(10,3) DEFAULT NULL,
  `grupo_id` int(11) DEFAULT NULL,
  `subgrupo_id` int(11) DEFAULT NULL,
  `grupo` varchar(50) DEFAULT NULL,
  `sub_grupo` varchar(50) DEFAULT NULL,
  `ncm` varchar(10) DEFAULT NULL,
  `cest` varchar(10) DEFAULT NULL,
  `cfop` varchar(10) DEFAULT NULL,
  `origem` varchar(2) DEFAULT NULL,
  `cst_icms` varchar(3) DEFAULT NULL,
  `csosn` varchar(3) DEFAULT NULL,
  `aliquota_icms` decimal(5,2) DEFAULT NULL,
  `aliquota_ipi` decimal(5,2) DEFAULT NULL,
  `aliquota_pis` decimal(5,2) DEFAULT NULL,
  `aliquota_cofins` decimal(5,2) DEFAULT NULL,
  `referencia` varchar(50) DEFAULT NULL,
  `unidade_id` int(11) DEFAULT NULL,
  `ean_tributavel` varchar(50) DEFAULT NULL,
  `info_adicionais` varchar(255) DEFAULT NULL,
  `descricao_nfe` varchar(255) DEFAULT NULL,
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura para tabela `subgrupos`
--

CREATE TABLE `subgrupos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura para tabela `unidades_medida`
--

CREATE TABLE `unidades_medida` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `sigla` varchar(10) NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `nivel_de_acesso` enum('I','II','III') DEFAULT 'I',
  `tipo_de_acesso` enum('administrador','coordenador','administrativo','gerente','supervisor') DEFAULT 'administrativo',
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tabelas despejadas
--

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
  ADD KEY `idx_usuarios_email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  ADD CONSTRAINT `permissoes_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
