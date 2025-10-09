-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql_dev:3306
-- Tempo de geração: 30/09/2025 às 20:27
-- Versão do servidor: 8.0.43
-- Versão do PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `implantacao_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `auditoria_acoes`
--

CREATE TABLE `auditoria_acoes` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `acao` varchar(50) NOT NULL,
  `recurso` varchar(100) NOT NULL,
  `detalhes` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `auditoria_acoes`
--

INSERT INTO `auditoria_acoes` (`id`, `usuario_id`, `acao`, `recurso`, `detalhes`, `ip_address`, `timestamp`) VALUES
(1, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"clientes\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"produtos\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"grupos\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"subgrupos\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"classes\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"produto_origem\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"unidades\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"marcas\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"veiculos\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"motoristas\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"ajudantes\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"cotacao\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"produto_generico\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"intolerancias\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"efetivos\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"patrimonios\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"tipos_cardapio\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"periodos_refeicao\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"periodicidade\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"faturamento\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"receitas\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"necessidades_merenda\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}]}}', '::1', '2025-09-30 12:11:38'),
(2, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '::1', '2025-09-30 13:19:31'),
(3, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '::1', '2025-09-30 13:28:30'),
(4, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '::1', '2025-09-30 13:28:36'),
(5, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '::1', '2025-09-30 13:28:40'),
(6, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '::1', '2025-09-30 13:36:31'),
(7, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '::1', '2025-09-30 13:36:35'),
(8, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '::1', '2025-09-30 13:38:30'),
(9, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '::1', '2025-09-30 13:40:46'),
(10, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 13:41:33'),
(11, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 13:41:33'),
(12, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 13:44:36'),
(13, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 13:44:41'),
(14, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 13:44:48'),
(15, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 18:45:30'),
(16, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 18:45:30'),
(17, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 18:54:33'),
(18, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 18:54:33'),
(19, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 18:54:44'),
(20, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 18:54:44'),
(21, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 18:55:27'),
(22, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 18:55:27'),
(23, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 19:18:48'),
(24, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 19:18:48'),
(25, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 19:21:05'),
(26, 1, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-30 19:21:05'),
(27, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '::1', '2025-09-30 19:40:20'),
(28, 1, 'update', 'permissoes', '{\"url\": \"/api/permissoes/usuario/1\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\", \"resourceId\": \"1\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"produtos_per_capita\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"permissoes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '::1', '2025-09-30 19:44:19');

-- --------------------------------------------------------


CREATE TABLE `permissoes_usuario` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `tela` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `pode_visualizar` tinyint(1) DEFAULT '0',
  `pode_criar` tinyint(1) DEFAULT '0',
  `pode_editar` tinyint(1) DEFAULT '0',
  `pode_excluir` tinyint(1) DEFAULT '0',
  `pode_movimentar` tinyint(1) DEFAULT '0',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `permissoes_usuario`
--

INSERT INTO `permissoes_usuario` (`id`, `usuario_id`, `tela`, `pode_visualizar`, `pode_criar`, `pode_editar`, `pode_excluir`, `pode_movimentar`, `criado_em`, `atualizado_em`) VALUES
(93, 1, 'usuarios', 1, 1, 1, 1, 0, '2025-09-30 19:44:18', '2025-09-30 19:44:18'),
(94, 1, 'fornecedores', 1, 1, 1, 1, 0, '2025-09-30 19:44:18', '2025-09-30 19:44:18'),
(95, 1, 'filiais', 1, 1, 1, 1, 0, '2025-09-30 19:44:18', '2025-09-30 19:44:18'),
(96, 1, 'rotas_nutricionistas', 1, 1, 1, 1, 0, '2025-09-30 19:44:18', '2025-09-30 19:44:18'),
(97, 1, 'unidades_escolares', 1, 1, 1, 1, 0, '2025-09-30 19:44:18', '2025-09-30 19:44:18'),
(98, 1, 'produtos_per_capita', 1, 1, 1, 1, 0, '2025-09-30 19:44:18', '2025-09-30 19:44:18'),
(99, 1, 'permissoes', 1, 1, 1, 1, 0, '2025-09-30 19:44:19', '2025-09-30 19:44:19');

-- --------------------------------------------------------


CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `senha` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nivel_de_acesso` enum('I','II','III') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'I',
  `tipo_de_acesso` enum('administrador','coordenador','administrativo','gerente','supervisor','nutricionista') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'administrativo',
  `status` enum('ativo','inativo','bloqueado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `nivel_de_acesso`, `tipo_de_acesso`, `status`, `criado_em`, `atualizado_em`) VALUES
(1, 'Administrador', 'luiz.nicolao@terceirizemais.com.br', '$2y$10$MJ2Fa2btWKyZlOFvjHb64.vPJkZmzD1HHP6YG7K.EbIUt5WP4X6ii', 'III', 'administrador', 'ativo', '2025-09-29 17:27:20', '2025-09-29 17:27:20');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios_filiais`
--

CREATE TABLE `usuarios_filiais` (
  `usuario_id` int NOT NULL,
  `filial_id` int NOT NULL,
  `data_vinculo` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `auditoria_acoes`
--
ALTER TABLE `auditoria_acoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_acao` (`acao`),
  ADD KEY `idx_recurso` (`recurso`),
  ADD KEY `idx_timestamp` (`timestamp`);

--
-- Índices de tabela `filiais`
--
ALTER TABLE `filiais`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_filial` (`codigo_filial`),
  ADD UNIQUE KEY `cnpj` (`cnpj`);

--
-- Índices de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `tela` (`tela`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_nome` (`nome`),
  ADD KEY `idx_nome` (`nome`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_tipo` (`tipo`);

--
-- Índices de tabela `produtos_per_capita`
--
ALTER TABLE `produtos_per_capita`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_produto_ativo` (`produto_id`,`ativo`),
  ADD KEY `idx_produto_id` (`produto_id`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Índices de tabela `rotas_nutricionistas`
--
ALTER TABLE `rotas_nutricionistas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_codigo` (`codigo`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_supervisor_id` (`supervisor_id`),
  ADD KEY `idx_coordenador_id` (`coordenador_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_criado_em` (`criado_em`),
  ADD KEY `idx_usuario_status` (`usuario_id`,`status`),
  ADD KEY `idx_supervisor_status` (`supervisor_id`,`status`),
  ADD KEY `idx_coordenador_status` (`coordenador_id`,`status`);

--
-- Índices de tabela `unidades_escolares`
--
ALTER TABLE `unidades_escolares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_escola_rota` (`nome_escola`,`rota`),
  ADD KEY `idx_rota` (`rota`),
  ADD KEY `idx_nome_escola` (`nome_escola`),
  ADD KEY `idx_email_nutricionista` (`email_nutricionista`),
  ADD KEY `idx_codigo_teknisa` (`codigo_teknisa`),
  ADD KEY `idx_codigo_senior` (`codigo_senior`),
  ADD KEY `idx_ativo` (`ativo`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `usuarios_filiais`
--
ALTER TABLE `usuarios_filiais`
  ADD PRIMARY KEY (`usuario_id`,`filial_id`),
  ADD KEY `fk_usuarios_filiais_usuario` (`usuario_id`),
  ADD KEY `fk_usuarios_filiais_filial` (`filial_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `auditoria_acoes`
--
ALTER TABLE `auditoria_acoes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de tabela `filiais`
--
ALTER TABLE `filiais`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4404;

--
-- AUTO_INCREMENT de tabela `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT de tabela `produtos_per_capita`
--
ALTER TABLE `produtos_per_capita`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `rotas_nutricionistas`
--
ALTER TABLE `rotas_nutricionistas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `unidades_escolares`
--
ALTER TABLE `unidades_escolares`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `auditoria_acoes`
--
ALTER TABLE `auditoria_acoes`
  ADD CONSTRAINT `auditoria_acoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  ADD CONSTRAINT `permissoes_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `produtos_per_capita`
--
ALTER TABLE `produtos_per_capita`
  ADD CONSTRAINT `produtos_per_capita_ibfk_1` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `produtos_per_capita_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `produtos_per_capita_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `usuarios_filiais`
--
ALTER TABLE `usuarios_filiais`
  ADD CONSTRAINT `fk_usuarios_filiais_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_usuarios_filiais_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
