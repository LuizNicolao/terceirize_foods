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

--
-- Estrutura para tabela `filiais`
--

CREATE TABLE `filiais` (
  `id` int NOT NULL,
  `codigo_filial` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cnpj` varchar(18) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `filial` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `razao_social` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `logradouro` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `numero` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bairro` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cep` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cidade` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` varchar(5) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `supervisao` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `coordenacao` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `fornecedores`
--

CREATE TABLE `fornecedores` (
  `id` int NOT NULL,
  `cnpj` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `razao_social` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nome_fantasia` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `logradouro` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `numero` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cep` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bairro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `municipio` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `uf` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `fornecedores`
--

INSERT INTO `fornecedores` (`id`, `cnpj`, `razao_social`, `nome_fantasia`, `logradouro`, `numero`, `cep`, `bairro`, `municipio`, `uf`, `email`, `telefone`, `criado_em`, `atualizado_em`, `status`) VALUES
(4131, '76430438010134', 'IRMAOS MUFFATO S.A', 'SUPER MUFFATO', 'JOROSLAU SOCHAKI', '1193', '83055400', 'IPE', 'SAO JOSE DOS PINHAIS', 'PR', '', '4540095000undefined', '2025-07-18 13:27:44', '2025-07-18 13:27:44', 1),
(4132, '80700578000190', 'JULIO CEZAR PARNOFF & CIA LTDA', 'DAJU ALIMENTOS', 'SAO DOMINGOS', '940D', '89805273', 'LIDER', 'CHAPECO', 'SC', '', '4933313175undefined', '2025-07-18 13:27:45', '2025-07-18 13:27:45', 1),
(4133, '15716279000181', 'KING ALIMENTOS LTDA', '', 'JOAO TERTULINO DUARTE', 'S/N', '88395000', 'ZONA RURAL', 'SAO JOAO DO ITAPERIU', 'SC', '', '4734580303undefined', '2025-07-18 13:27:46', '2025-07-18 13:27:46', 1),
(4134, '79863569004985', 'COASUL COOPERATIVA AGROINDUSTRIAL', 'CD - SEARA', 'PREFEITO ETELVINO PEDRO TUMELERO', '443', '89770000', 'SAO JOAO', 'SEARA', 'SC', '', '4635338100undefined', '2025-07-18 13:27:47', '2025-07-18 13:27:47', 1),
(4135, '78269545000195', 'LATICINIOS SAO JOAO S/A', '', 'SC 493 - KM.3', 'S/N', '89897000', 'INTERIOR', 'SAO JOAO DO OESTE', 'SC', '', '4936361136undefined', '2025-07-18 13:27:49', '2025-07-18 13:27:49', 1),
(4136, '86512647002595', 'COOPERATIVA REGIONAL AGROPECUARIA SUL CATARINENSE', 'COOPERSULCA', 'LUDOVICO MENEGARO', '1001', '88930000', 'SAO LUIZ', 'TURVO', 'SC', '', '4835258300undefined', '2025-07-18 13:27:50', '2025-07-18 13:27:50', 1),
(4137, '83017350000198', 'TAF DISTRIBUIDORA DE ALIMENTOS E BEBIDAS LTDA', 'TAF ATACADO', 'VIDAL PROCOPIO LOHN', '155', '88104810', 'AREA INDUSTRIAL', 'SAO JOSE', 'SC', '', '4821065000undefined', '2025-07-18 13:27:51', '2025-07-18 13:27:51', 1),
(4138, '81611931000985', 'OESA COMERCIO E REPRESENTACOES S/A', 'BAIA NORTE FOOD SERVICE', 'SEBASTIAO LARA', 'SN', '88164160', 'VENDAVAL', 'BIGUACU', 'SC', '', '4733769500undefined', '2025-07-18 13:27:52', '2025-07-18 13:27:52', 1),
(4139, '72316342000126', 'ALBERTI COMERCIO DE ALIMENTOS LTDA', '', 'MARECHAL MASCARENHAS DE MARAES', '834', '89803600', 'PARQUE DAS PALMEIRAS', 'CHAPECO', 'SC', '', '4933220289undefined', '2025-07-18 13:27:53', '2025-07-18 13:27:53', 1),
(4140, '83731927004116', 'COOPERATIVA REGIONAL AURIVERDE', 'AURIVERDE', 'MOURA BRASIL', 'S/N', '89890000', 'CENTRO', 'CUNHA PORA', 'SC', '', '', '2025-07-18 13:27:54', '2025-07-18 13:27:54', 1),
(4141, '82891805000137', 'PATRIMONIAL SEGURANCA LTDA', '', 'GENERAL OSORIO D', '1372', '89802212', 'CENTRO', 'CHAPECO', 'SC', '', '4933212222undefined', '2025-07-18 13:27:55', '2025-07-18 13:27:55', 1),
(4142, '29656930000180', 'GAMA UTENSILIOS LTDA', 'GAMA INOX', 'GENERAL OSORIO', '1109', '89041000', 'VELHA', 'BLUMENAU', 'SC', '', '4730413088undefined', '2025-07-18 13:27:56', '2025-07-18 13:27:56', 1),
(4143, '25184465000170', 'ALESSI INDUSTRIA DE ALIMENTOS LTDA', '', 'SC 160', '3269', '89980000', 'PRIMAVERA', 'CAMPO ERE', 'SC', '', '4991367490undefined', '2025-07-18 13:27:57', '2025-07-18 13:27:57', 1),
(4144, '82922212000190', 'DISTRIBUIDORA ANDRADE LTDA', 'DISANDRADE DISTRIBUIDORA', 'JERONIMO KLOCK', '344', '89170000', 'VILA NOVA', 'LAURENTINO', 'SC', '', '4735461306undefined', '2025-07-18 13:27:58', '2025-07-18 13:27:58', 1),
(4145, '75384404000125', 'RZ REZZADORI & CIA LTDA', 'RZ REZZADORI', 'AVENIDA JAYME ERNESTO BERTASO', '244', '89810315', 'AGUA SANTA', 'CHAPECO', 'SC', '', '4933310600undefined', '2025-07-18 13:28:00', '2025-07-18 13:28:00', 1),
(4146, '79245296000160', 'MEPAR FERRAGENS E FERRAMENTAS LTDA', 'MEPAR', 'FERNANDO MACHADO', '3240', '89805203', 'LIDER', 'CHAPECO', 'SC', '', '4933217777undefined', '2025-07-18 13:28:01', '2025-07-18 13:28:01', 1),
(4147, '77852176000104', 'GOLDEN HOTEL LTDA', '', 'GETULIO DORNELES VARGAS', '402', '89801000', 'CENTRO', 'CHAPECO', 'SC', '', '4933310311undefined', '2025-07-18 13:28:02', '2025-07-18 13:28:02', 1),
(4148, '21028053000190', 'RONIVAN LUIZ TRANTENMULLER', 'LIMPA FOSSAS IPORA', 'JOAO PAULO I', '1180', '89899000', 'VILA NOVA', 'IPORA DO OESTE', 'SC', '', '4936341144undefined', '2025-07-18 13:28:04', '2025-07-18 13:28:04', 1),
(4149, '20348458000143', 'KI BREAD PANIFICACAO INDUSTRIAL LTDA', 'KI BREAD', 'ASSIS BRASIL E', '2250', '89805600', 'PASSO DOS FORTES', 'CHAPECO', 'SC', '', '4933294230undefined', '2025-07-18 13:28:06', '2025-07-18 13:28:06', 1),
(4150, '52114548000166', '52.114.548 FRANCIELI CAVALI REINEHR', '', 'URUGUAI - E', '101', '89801570', 'CENTRO', 'CHAPECO', 'SC', '', '4985030734undefined', '2025-07-18 13:28:11', '2025-07-18 13:28:11', 1),
(4151, '52658478000107', '52.658.478 VERONICA PRESTES', '', 'ESTOCOLMO', '234', '89805218', 'LIDER', 'CHAPECO', 'SC', '', '4984256040undefined', '2025-07-18 13:28:12', '2025-07-18 13:28:12', 1),
(4152, '73426579000122', 'COMERCIO DE CARNES FINCO LTDA', 'FINCO ALIMENTOS', 'PREFEITO ETELVINO PEDRO TUMELERO', '443', '89770000', 'SAO JOAO', 'SEARA', 'SC', '', '4934528200undefined', '2025-07-18 13:28:14', '2025-07-18 13:28:14', 1),
(4153, '22575903000133', 'ESTEFANO WUIGK LTDA', 'EW INDUSTRIA DE PAES', 'VISCONDE DE MAUA', '65', '89930000', 'SAO CRISTOVAO', 'SAO JOSE DO CEDRO', 'SC', '', '4991649133undefined', '2025-07-18 13:28:15', '2025-07-18 13:28:15', 1),
(4154, '78860863000126', 'APTI ALIMENTOS LTDA', '', 'RANCHO QUEIMADO', '264', '89804440', 'ALVORADA', 'CHAPECO', 'SC', '', '4933615755undefined', '2025-07-18 13:28:16', '2025-07-18 13:28:16', 1),
(4155, '32641554000164', 'INDUSTRIA DE SUCOS RONDINHA LTDA', 'SUCOS DI FIORI', 'LINHA RONDINHA', 'SN', '89560000', 'INTERIOR', 'VIDEIRA', 'SC', '', '4935660800undefined', '2025-07-18 13:28:17', '2025-07-18 13:28:17', 1),
(4156, '43798851000134', 'PRIME COMERCIO E REPRESENTACOES LTDA', 'PRIME REPRESENTACOES', 'CURITIBANOS', '370', '89810410', 'BELVEDERE', 'CHAPECO', 'SC', '', '5599463299undefined', '2025-07-18 13:28:22', '2025-07-18 13:28:22', 1),
(4157, '26073046000124', 'COMERCIO BG LTDA', 'COMERCIO BG LTDA', 'BATISTA FELICE RIGO', '174', '89565639', 'CAMPINA BELA', 'VIDEIRA', 'SC', '', '4935333241undefined', '2025-07-18 13:50:04', '2025-07-18 13:50:04', 1),
(4158, '22459813000187', 'FRUTEIRA DA LUZ LTDA', 'FRUTEIRA DA LUZ', 'FERNANDO MACHADO', '605', '89802110', 'CENTRO', 'CHAPECO', 'SC', '', '4933299140undefined', '2025-07-18 13:50:05', '2025-07-18 13:50:05', 1),
(4159, '83305235001000', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'MARECHAL DEODORO', '260', '89850000', 'CENTRO', 'QUILOMBO', 'SC', '', '4933463135undefined', '2025-07-18 13:50:06', '2025-07-18 13:50:06', 1),
(4160, '83305235002839', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'JOINVILLE', '473', '89883000', 'CENTRO', 'AGUAS DE CHAPECO', 'SC', '', '4933390999undefined', '2025-07-18 13:50:07', '2025-07-18 13:50:07', 1),
(4161, '83428250000154', 'SAN WILLA\'S HOTEL LTDA', 'SANWILLAS', '31 DE MARCO', 'S/N', '89900000', 'CENTRO', 'SAO MIGUEL DO OESTE', 'SC', '', '', '2025-07-18 13:50:08', '2025-07-18 13:50:08', 1),
(4162, '29479517000197', 'PROLIDER MOVIMENTACAO LTDA', 'PROLIDER MOVIMENTACAO', 'MAXIMILIANO KODERER', '365', '89805244', 'LIDER', 'CHAPECO', 'SC', '', '4933237254undefined', '2025-07-18 13:50:09', '2025-07-18 13:50:09', 1),
(4163, '83305235008365', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'XV DE NOVEMBRO', '785', '89900000', 'CENTRO', 'SAO MIGUEL DO OESTE', 'SC', '', '4936210066undefined', '2025-07-18 13:50:10', '2025-07-18 13:50:10', 1),
(4164, '83305235006826', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'VERONICA SCHEIDT', 'S/N', '89982000', 'CENTRO', 'SAO BERNARDINO', 'SC', '', '4936540000undefined', '2025-07-18 13:50:11', '2025-07-18 13:50:11', 1),
(4165, '83305235009094', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'DOZE DE OUTUBRO', '661', '89908000', 'CENTRO', 'ROMELANDIA', 'SC', '', '4936240102undefined', '2025-07-18 13:50:12', '2025-07-18 13:50:12', 1),
(4166, '15206085000136', 'MARCELO CASAGRANDA', 'MARGUI SERVICOS GERAIS', 'LINHA BARAO DO TRIUNFO', 'S/N\'', '89859000', 'INTERIOR', 'FORMOSA DO SUL', 'SC', '', '4984136466undefined', '2025-07-18 13:50:13', '2025-07-18 13:50:13', 1),
(4167, '36165915000102', 'CRISTAL 10 PANIFICADORA LTDA', 'CRISTAL 10', 'VOLUNTARIOS DA PATRIA', '1085', '89812380', 'ESPLANADA', 'CHAPECO', 'SC', '', '4989055919undefined', '2025-07-18 13:50:15', '2025-07-18 13:50:15', 1),
(4168, '83690339000194', 'DIFRISUL DISTRIBUIDORA LTDA', 'DIFRISUL', 'MARSELHA', '579', '89805205', 'LIDER', 'CHAPECO', 'SC', '', '4933222919undefined', '2025-07-18 13:50:16', '2025-07-18 13:50:16', 1),
(4169, '36348595000622', 'REDE AMERICAS COMERCIO DE MAQUINAS LTDA', 'MERCOSUL STORE', 'OROSIMBO MAIA', '1175', '13023002', 'VILA ITAPURA', 'CAMPINAS', 'SP', '', '1925158700undefined', '2025-07-18 13:50:17', '2025-07-18 13:50:17', 1),
(4170, '59500139000147', '59.500.139 JULIANA SUTILLE MULINARI', '', 'BORGES DE MEDEIROS - E', '2349', '89805570', 'PASSO DOS FORTES', 'CHAPECO', 'SC', '', '4998428033undefined', '2025-07-18 13:50:18', '2025-07-18 13:50:18', 1),
(4171, '83573212000438', 'COOPERATIVA DE PRODUCAO E CONSUMO CONCORDIA', 'COPERDIA', 'ANITA GARIBALDI', '387', '89770000', 'CENTRO', 'SEARA', 'SC', '', '4934522311undefined', '2025-07-18 13:50:19', '2025-07-18 13:50:19', 1),
(4172, '28232087000141', 'PINGO EQUIPAMENTOS LTDA', '', 'COLOMBIA', '130', '89805216', 'LIDER', 'CHAPECO', 'SC', '', '4933197999undefined', '2025-07-18 13:50:24', '2025-07-18 13:50:24', 1),
(4173, '80746738000131', 'CENTRALFRIOS COMERCIO DE FRIOS LTDA.', '', 'GETULIO DORNELES VARGAS', '3812', '89805186', 'LIDER', 'CHAPECO', 'SC', '', '4933112600undefined', '2025-07-18 13:50:25', '2025-07-18 13:50:25', 1),
(4174, '83305235004025', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'CHAPECO', 'SN', '89845000', 'CENTRO', 'UNIAO DO OESTE', 'SC', '', '4933481111undefined', '2025-07-18 13:50:26', '2025-07-18 13:50:26', 1),
(4175, '56065247000140', 'JV INDUSTRIA DE ALIMENTOS LTDA', 'GRAO FINO', 'PORTO SEGURO', '748', '88521090', 'GUARUJA', 'LAGES', 'SC', '', '4932246997undefined', '2025-07-18 13:50:27', '2025-07-18 13:50:27', 1),
(4176, '30863735000100', 'RYJO ALIMENTOS LTDA', 'COMPRETUDO SUPERMERCADOS', 'ANDRE LUNARDI', '775', '89825000', 'CENTRO', 'XAXIM', 'SC', '', '4933535006undefined', '2025-07-18 13:50:28', '2025-07-18 13:50:28', 1),
(4177, '17327450000196', 'PRESTADORA DE SERVICOS QUALIDADE LTDA', 'QUALIDADE CONSTRUCOES E SERVICOS', 'JULIO CASTILHOS', 'SN', '89840000', 'RURAL', 'CORONEL FREITAS', 'SC', '', '4988106388undefined', '2025-07-18 13:50:29', '2025-07-18 13:50:29', 1),
(4178, '23301967000109', 'DESINTUPIDORA SILVEIRA LTDA', 'PINTURAS E DESENTUPIDORA SILVEIRA', 'DO COMERCIO', '610', '89920000', 'CENTRO', 'GUARACIABA', 'SC', '', '4988864651undefined', '2025-07-18 13:50:30', '2025-07-18 13:50:30', 1),
(4179, '20730497000100', 'JUNIOR CEZAR PARISOTTO', 'PARISOTTO INSTALADORA E DECOR', 'RIO GRANDE DO SUL', '614', '89930000', 'CENTRO', 'SAO JOSE DO CEDRO', 'SC', '', '4991864891undefined', '2025-07-18 13:50:31', '2025-07-18 13:50:31', 1),
(4180, '48320570000195', 'CL MEGA ATACADISTA LTDA', 'MEGA LAR', 'DUQUE DE CAXIAS', '435', '89874000', 'CENTRO', 'MARAVILHA', 'SC', '', '4984080502undefined', '2025-07-18 13:50:32', '2025-07-18 13:50:32', 1),
(4181, '49286269000175', '49.286.269 FABIO MOREIRA DOS ANJOS', '', '2116', '404', '88390000', 'ITAJUBA', 'BARRA VELHA', 'SC', '', '4792755507undefined', '2025-07-18 13:50:33', '2025-07-18 13:50:33', 1),
(4182, '52936966000139', '52.936.966 EDSON LUIS TERHORST', '', 'RUA CHRISTIAN SCHOOL', '47', '89895000', 'CENTRO', 'RIQUEZA', 'SC', '', '4999543545undefined', '2025-07-18 13:50:34', '2025-07-18 13:50:34', 1),
(4183, '27095472000121', 'ANA PAULA B.S. KNAPP LTDA', 'HOTEL OASIS', 'CARLOS GOMES', '50', '89887000', 'CENTRO', 'PALMITOS', 'SC', '', '4936470285undefined', '2025-07-18 13:50:39', '2025-07-18 13:50:39', 1),
(4184, '55170447000109', 'GASPERIN LTDA', '', 'SANTO ANTONIO', '76', '89930000', 'CENTRO', 'SAO JOSE DO CEDRO', 'SC', '', '4936430177undefined', '2025-07-18 13:50:40', '2025-07-18 13:50:40', 1),
(4185, '82819665000196', 'HOTEL UNIAO LTDA', 'HOTEL UNIAO', 'DO COMERCIO', '412', '89896000', 'CENTRO', 'ITAPIRANGA', 'SC', '', '', '2025-07-18 13:50:41', '2025-07-18 13:50:41', 1),
(4186, '82853144000155', 'PASTORE & CIA LTDA', 'TURIS HOTEL', 'GETULIO VARGAS', '565', '89830000', 'CENTRO', 'ABELARDO LUZ', 'SC', '', '4934454080undefined', '2025-07-18 13:50:42', '2025-07-18 13:50:42', 1),
(4187, '81611931000128', 'OESA COMERCIO E REPRESENTACOES S/A', '', 'ERVIN RUX', '1000', '89264600', 'RIO DA LUZ I', 'JARAGUA DO SUL', 'SC', '', '4733769500undefined', '2025-07-18 13:50:44', '2025-07-18 13:50:44', 1),
(4188, '83305235000208', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'LINHA ALTO DA SERRA', 'S/N', '89804460', 'INTERIOR', 'CHAPECO', 'SC', '', '4937230061undefined', '2025-07-18 13:50:45', '2025-07-18 13:50:45', 1),
(4189, '83305235004459', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'GAUCHA', 'SN', '89850000', 'INTERIOR', 'QUILOMBO', 'SC', '', '4933217000undefined', '2025-07-18 13:50:46', '2025-07-18 13:50:46', 1),
(4190, '83305235001352', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'SC 468', '205', '89859000', 'CENTRO', 'FORMOSA DO SUL', 'SC', '', '4933430004undefined', '2025-07-18 13:50:47', '2025-07-18 13:50:47', 1),
(4191, '83305235002596', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'PARA', '420', '89840000', 'CENTRO', 'CORONEL FREITAS', 'SC', '', '4933470184undefined', '2025-07-18 13:50:48', '2025-07-18 13:50:48', 1),
(4192, '83573212000276', 'COOPERATIVA DE PRODUCAO E CONSUMO CONCORDIA', '', '1 DE MAIO', '259', '89735000', 'CENTRO', 'LINDOIA DO SUL', 'SC', '', '4934461117undefined', '2025-07-18 13:50:49', '2025-07-18 13:50:49', 1),
(4193, '83573212000357', 'COOPERATIVA DE PRODUCAO E CONSUMO CONCORDIA', 'COPERDIA', 'TIRADENTES', '80', '89790000', 'CENTRO', 'IPUMIRIM', 'SC', '', '4934381031undefined', '2025-07-18 13:50:50', '2025-07-18 13:50:50', 1),
(4194, '97397046000128', 'JAIME TUR LTDA', '', 'FAIC', 'SN', '89899000', 'INTERIOR', 'IPORA DO OESTE', 'SC', '', '4936341144undefined', '2025-07-18 13:50:51', '2025-07-18 13:50:51', 1),
(4195, '19908982000142', 'HABECK & CIA. LTDA.', 'HORTIFRUTI RABEKINHA\'S', 'CLAUMIR LUIZ TREVISOL', 'SN', '89887000', 'INDUSTRIAL', 'PALMITOS', 'SC', '', '4936472614undefined', '2025-07-18 13:50:52', '2025-07-18 13:50:52', 1),
(4196, '19869863000128', 'JKA TRANSPORTES E TURISMO LTDA', 'JK TRANSPORTES E TURISMO', 'NOSSA SENHORA DAS GRACAS', '380', '89830000', 'ALVORADA', 'ABELARDO LUZ', 'SC', '', '4999109869undefined', '2025-07-18 13:50:53', '2025-07-18 13:50:53', 1),
(4197, '85354587000190', 'COMERCIAL ELETRICA ROCHA LTDA', '', 'BARAO DO RIO BRANCO', '122', '89801030', 'CENTRO', 'CHAPECO', 'SC', '', '', '2025-07-18 13:50:54', '2025-07-18 13:50:54', 1),
(4198, '83305235003487', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'DO COMERCIO', '27', '89856000', 'CENTRO', 'IRATI', 'SC', '', '4933490003undefined', '2025-07-18 13:50:56', '2025-07-18 13:50:56', 1),
(4199, '78268984000183', 'INDUSTRIA E COMERCIO DE SABAO ZAVASKI LIMITADA', '', 'ESTEVAO MACIESKI', '270', '88750000', 'SAO BASILIO', 'BRACO DO NORTE', 'SC', '', '', '2025-07-18 13:50:57', '2025-07-18 13:50:57', 1),
(4200, '35030372000650', 'PLUSVAL AGROAVICOLA LTDA', '', 'RIO GRANDE DO SUL', '2880', '85760000', 'SANTA BARBARA', 'CAPANEMA', 'PR', '', '4532291061undefined', '2025-07-18 13:50:58', '2025-07-18 13:50:58', 1),
(4201, '49697947000192', 'FRIGORIFICO WITT PESCADOS LTDA', 'PESCADOS WITT', 'RURAL', 'SN', '89309899', 'AREA RURAL DE MAFRA', 'MAFRA', 'SC', '', '4799929852undefined', '2025-07-18 13:50:59', '2025-07-18 13:50:59', 1),
(4202, '83297168000138', 'HOTEL FIORINI LTDA', 'HOTEL FIORINI', 'SAO PAULO', '933', '89870000', 'CENTRO', 'PINHALZINHO', 'SC', '', '', '2025-07-18 13:51:00', '2025-07-18 13:51:00', 1),
(4203, '40752846000100', 'ALEXANDRE ROGER DE LARA PRESSER 06219423917', '', 'OIAPOC', '636', '89900000', 'AGOSTINI', 'SAO MIGUEL DO OESTE', 'SC', '', '4991074476undefined', '2025-07-18 13:51:01', '2025-07-18 13:51:01', 1),
(4204, '76872514000107', 'OESTE ELETRO MOVEIS LTDA', '', 'PAUL HARRIS', '34', '89885000', 'CENTRO', 'SAO CARLOS', 'SC', '', '4933254099undefined', '2025-07-18 13:51:02', '2025-07-18 13:51:02', 1),
(4205, '17448163000134', '17.448.163 ALMIR ZANCHET', '', 'PADRE JOAO BOTERO', '667', '89687000', 'CENTRO', 'PASSOS MAIA', 'SC', '', '4984328976undefined', '2025-07-18 13:51:03', '2025-07-18 13:51:03', 1),
(4206, '21648300000151', 'ADRIANO TITON 05165677990', '', 'EDUARDO DIEHL', '260', '89895000', 'CENTRO', 'RIQUEZA', 'SC', '', '4999338456undefined', '2025-07-18 13:51:04', '2025-07-18 13:51:04', 1),
(4207, '45224392000100', 'HOTEL PALMA SOLA LTDA', 'HOTEL PALMA SOLA', 'SC 161', 'S/N', '89985000', 'LOTEAMENTO INDUSTRIAL', 'PALMA SOLA', 'SC', '', '4991462737undefined', '2025-07-18 13:51:05', '2025-07-18 13:51:05', 1),
(4208, '12612656000144', 'SPOLU - BENESSE DO BRASIL LTDA', 'SPOLU - BENESSE DO BRASIL LTDA.', 'ARACAJU', '205', '15840000', 'CENTRO', 'ITAJOBI', 'SP', '', '1735469050undefined', '2025-07-18 13:51:10', '2025-07-18 13:51:10', 1),
(4209, '61602199025530', 'COMPANHIA ULTRAGAZ S A', 'COMPANHIA ULTRAGAZ S/A - FILIAL', 'PASCHOAL CORTELLINI', '800-D', '89814830', 'DOM PASCOAL', 'CHAPECO', 'SC', '', '1131772677undefined', '2025-07-18 13:51:11', '2025-07-18 13:51:11', 1),
(4210, '83731927005600', 'COOPERATIVA REGIONAL AURIVERDE', 'AURIVERDE', 'ESPIRITO SANTO', '771', '89890000', 'CENTRO', 'CUNHA PORA', 'SC', '', '4936460222undefined', '2025-07-18 13:51:12', '2025-07-18 13:51:12', 1),
(4211, '83573212001590', 'COOPERATIVA DE PRODUCAO E CONSUMO CONCORDIA', 'COPERDIA', 'ADILIO HILARIO MUTZEMBERG', '363', '89740000', 'CENTRO', 'ARABUTA', 'SC', '', '4934480099undefined', '2025-07-18 13:51:13', '2025-07-18 13:51:13', 1),
(4212, '30196330000165', 'DDXAN DEDETIZADORA XANXERE LTDA', '', 'ADAO ANTONIO DA SILVA', '345', '89820000', 'NOSSA SENHORA DE LOURDES', 'XANXERE', 'SC', '', '4999790590undefined', '2025-07-18 13:51:15', '2025-07-18 13:51:15', 1),
(4213, '14049467005108', 'LACTALIS DO BRASIL - COMERCIO, IMPORTACAO E EXPORTACAO DE LATICINIOS LTDA.', '', 'BR-101', '2160', '88135010', 'PACHECOS', 'PALHOCA', 'SC', '', '4833428141undefined', '2025-07-18 13:51:16', '2025-07-18 13:51:16', 1),
(4214, '83305235008527', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'RIO GRANDE DO SUL', '663', '89930000', 'CENTRO', 'SAO JOSE DO CEDRO', 'SC', '', '4936430300undefined', '2025-07-18 13:51:17', '2025-07-18 13:51:17', 1),
(4215, '59324148000124', '59.324.148 GABRIELA MULINARI MONACO', '', 'BORGES DE MEDEIROS - E', '2349', '89805570', 'PASSO DOS FORTES', 'CHAPECO', 'SC', '', '4933230359undefined', '2025-07-18 13:51:18', '2025-07-18 13:51:18', 1),
(4216, '24092810000183', 'MARELISE SIMON RAMBO 08803593900', '', 'QUERINO PIRAN', '510', '89899000', 'CENTRO', 'IPORA DO OESTE', 'SC', '', '4991528622undefined', '2025-07-18 13:51:19', '2025-07-18 13:51:19', 1),
(4217, '30965295000100', 'MONSEG CALCADOS E EPIS LTDA', 'MONSEG', 'MAESTRO ANTONIO PASSARELLI', '1305', '16200004', 'CENTRO', 'BIRIGUI', 'SP', '', '1836343131undefined', '2025-07-18 13:51:20', '2025-07-18 13:51:20', 1),
(4218, '32267535000110', '32.267.535 ANDERSON LUCAS JUNG', '', 'PRESIDENTE KENNEDY', '1392', '89874000', 'CENTRO', 'MARAVILHA', 'SC', '', '4998324068undefined', '2025-07-18 13:51:21', '2025-07-18 13:51:21', 1),
(4219, '83422139000150', 'ORGANIZACOES GOBBI MERCADO E FERRAGENS LTDA', '', 'FERNANDO MACHADO', '3895', '89804000', 'LIDER', 'CHAPECO', 'SC', '', '4933240114undefined', '2025-07-18 13:51:22', '2025-07-18 13:51:22', 1),
(4220, '28947271000178', 'TOMASI E CHRIST REFRIGERACAO LTDA', 'REFRIGERACAO MURARO', 'ERNESTO BEUTER', '970', '89990000', 'BRASILIA', 'SAO LOURENCO DO OESTE', 'SC', '', '4999156450undefined', '2025-07-18 13:51:23', '2025-07-18 13:51:23', 1),
(4221, '50704028000188', 'FEMANN COMERCIO E SERVICOS LTDA', '', 'ATILIO PEDRO PAGANI', '115', '88132149', 'PAGANI', 'PALHOCA', 'SC', '', '4899027409undefined', '2025-07-18 13:51:24', '2025-07-18 13:51:24', 1),
(4222, '83305235000704', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'DOMINGOS FRAZON', 'S/N', '89865000', 'CENTRO', 'NOVA ERECHIM', 'SC', '', '4933330701undefined', '2025-07-18 13:51:25', '2025-07-18 13:51:25', 1),
(4223, '29857792000288', 'ALLOYBR ALUMINIO LTDA', '', 'ERNANI SANDER COMPL SUBTRECHO 01 DO CONTORNO VIARIO OESTE', 'S/N', '89801000', 'ENGENHO BRAUN', 'CHAPECO', 'SC', '', '4732318800undefined', '2025-07-18 13:51:27', '2025-07-18 13:51:27', 1),
(4224, '33320997000116', 'FLOR DO MORANGO ROUPAS E ACESSORIOS PROFISSIONAIS LTDA', 'FLOR DO MORANGO CONFECCAO', 'ORIENTE ROSALEM', '738', '13471190', 'JARDIM SAO DOMINGOS', 'AMERICANA', 'SP', '', '1934618084undefined', '2025-07-18 13:51:28', '2025-07-18 13:51:28', 1),
(4225, '24803360000190', 'COPEC - COMERCIO DE PECAS DE EQUIPAMENTOS DE COZINHA INDUSTRIAL LTDA', '', 'JOSE MILLECK', '16', '82560450', 'BOA VISTA', 'CURITIBA', 'PR', '', '4130906714undefined', '2025-07-18 13:51:29', '2025-07-18 13:51:29', 1),
(4226, '29485466000106', 'DAVILLE DISTRIBUIDORA ALIMENTOS LTDA', 'DAVILLE DISTRIBUIDORA DE ALIMENTOS', 'MAX HEIDEN', '121', '89203380', 'ANITA GARIBALDI', 'JOINVILLE', 'SC', '', '4791621616undefined', '2025-07-18 13:51:30', '2025-07-18 13:51:30', 1),
(4227, '80145758000157', 'DIFLORIPA E FATIMA INDUSTRIA E COMERCIO DE ALIMENTOS LTDA', '', 'GRACILIANO RAMOS', '95', '88130660', 'PONTE DO IMARUIM', 'PALHOCA', 'SC', '', '4832421380undefined', '2025-07-18 13:51:31', '2025-07-18 13:51:31', 1),
(4228, '92660406001433', 'FRIGELAR COMERCIO E INDUSTRIA LTDA', 'AA FRIGELAR S.A.', 'CRUZEIRO', '899/01', '94930615', 'DISTRITO INDUSTRIAL', 'CACHOEIRINHA', 'RS', '', '1132552525undefined', '2025-07-18 13:51:32', '2025-07-18 13:51:32', 1),
(4229, '83731927005511', 'COOPERATIVA REGIONAL AURIVERDE', 'AURIVERDE', 'DO COMERCIO', '389', '89885000', 'CENTRO', 'SAO CARLOS', 'SC', '', '4936460222undefined', '2025-07-18 13:51:33', '2025-07-18 13:51:33', 1),
(4230, '37988523000106', 'SUPERMERCADO SOUZA LTDA', 'SUPER BOM', 'PADRE JOAO BOTERO', '698', '89687000', 'CENTRO', 'PASSOS MAIA', 'SC', '', '4998007661undefined', '2025-07-18 13:51:34', '2025-07-18 13:51:34', 1),
(4231, '83305235009760', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'EGIDIO JOAO GUERRA', '1293', '89830000', 'CENTRO', 'ABELARDO LUZ', 'SC', '', '4934455446undefined', '2025-07-18 13:51:39', '2025-07-18 13:51:39', 1),
(4232, '47541755000167', 'UNIAO CONTAINER LTDA', '', 'BR 101', '4260', '88313001', 'SALSEIROS', 'ITAJAI', 'SC', '', '4732483369undefined', '2025-07-18 13:51:40', '2025-07-18 13:51:40', 1),
(4233, '31857347000189', 'GEORGE REBOQUE E AUTO CENTER LTDA', 'BRAVA SERVICOS AUTOMOTIVOS', 'CONSELHEIRO JOAO GAYA', '1078', '88370390', 'CENTRO', 'NAVEGANTES', 'SC', '', '4796400856undefined', '2025-07-18 13:51:41', '2025-07-18 13:51:41', 1),
(4234, '35559014000124', 'L & M - ALPHA COMERCIO LTDA', 'ALPHA ATACADO', 'IRMA BONAVITA', '1661', '88090150', 'CAPOEIRAS', 'FLORIANOPOLIS', 'SC', '', '4888421969undefined', '2025-07-18 13:51:42', '2025-07-18 13:51:42', 1),
(4235, '46355291000131', 'JEFERSON DREYER DE MELLO 08232785900', '', 'SANTA HELENA', 'S/N', '89910000', 'JAROSESKI', 'DESCANSO', 'SC', '', '4989173978undefined', '2025-07-18 13:51:43', '2025-07-18 13:51:43', 1),
(4236, '79416541000155', 'RAMPINELLI ALIMENTOS LTDA', 'RAMPINELLI ALIMENTOS', 'ANTONIO VALMOR CANELA', '2300', '88850000', 'SANGA DO COQUEIRO', 'FORQUILHINHA', 'SC', '', '4834638700undefined', '2025-07-18 13:51:44', '2025-07-18 13:51:44', 1),
(4237, '82992249000195', 'TECELAGEM MARTINS LTDA', 'COMPANHIA MARTINS', 'VEREADOR SILVERIO REGIS', '517', '88360000', 'LAGEADO BAIXO', 'GUABIRUBA', 'SC', '', '4733540241undefined', '2025-07-18 13:51:45', '2025-07-18 13:51:45', 1),
(4238, '81373441000130', 'MAQDIMA FERRAMENTAS E EQUIPAMENTOS LTDA', '', 'FERNANDO MACHADO', '3435', '89804000', 'BELA VISTA', 'CHAPECO', 'SC', '', '4933616000undefined', '2025-07-18 13:51:46', '2025-07-18 13:51:46', 1),
(4239, '59937563000153', '59.937.563 QUELI ANGELA BONSERE', '', 'VICKY LECUONA', '320', '89806046', 'SAO LUCAS', 'CHAPECO', 'SC', '', '4991666421undefined', '2025-07-18 13:51:47', '2025-07-18 13:51:47', 1),
(4240, '83305235013873', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'OSVALDO ARANHA', '347', '89835000', 'CENTRO', 'SAO DOMINGOS', 'SC', '', '4934430804undefined', '2025-07-18 13:51:48', '2025-07-18 13:51:48', 1),
(4241, '83305235020810', 'COOPERATIVA AGROINDUSTRIAL ALFA', '', '3 DE MAIO', '895', '89694000', 'CENTRO', 'FAXINAL DOS GUEDES', 'SC', '', '4933217000undefined', '2025-07-18 13:51:49', '2025-07-18 13:51:49', 1),
(4242, '83305235003304', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'HERCILIO LUZ', '79', '89860000', 'CENTRO', 'MAREMA', 'SC', '', '4933540166undefined', '2025-07-18 13:51:50', '2025-07-18 13:51:50', 1),
(4243, '83305235004297', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'RIO GRANDE', '125', '89828000', 'CENTRO', 'LAJEADO GRANDE', 'SC', '', '4933550017undefined', '2025-07-18 13:51:51', '2025-07-18 13:51:51', 1),
(4244, '11917826000217', 'L.A. ALIMENTOS LTDA', '', 'DEONELO LUCIANO COLOMBO', '415', '89950000', 'TRES FRONTEIRAS', 'DIONISIO CERQUEIRA', 'SC', '', '4936442946undefined', '2025-07-18 13:51:52', '2025-07-18 13:51:52', 1),
(4245, '59733523000190', '59.733.523 WILLIAM DANIEL DE QUEIROS', '', 'MARIO ROMANINI', '134', '89810413', 'BELVEDERE', 'CHAPECO', 'SC', '', '4999569140undefined', '2025-07-18 13:51:53', '2025-07-18 13:51:53', 1),
(4246, '79014437000134', 'SPESSATTO & SPESSATTO LTDA', 'HOTEL BRASIL', 'WALDEMAR ERNESTO GLUFKE', '260', '89893000', 'CENTRO', 'MONDAI', 'SC', '', '0496740366undefined', '2025-07-18 13:51:54', '2025-07-18 13:51:54', 1),
(4247, '52237535000184', 'OXIGENIO CHAPECO COMERCIO DE GASES ATMOSFERICOS E PRODUTOS PARA SAUDE LTDA', '', 'CUBA', 'S/N', '89805225', 'LIDER', 'CHAPECO', 'SC', '', '4935210363undefined', '2025-07-18 13:51:56', '2025-07-18 13:51:56', 1),
(4248, '80126071000174', 'SUPERMERCADO E FERRAGEM OURO VERDE LTDA', '', 'JOAO MARIA CONRADO', '247', '89834000', 'CENTRO', 'OURO VERDE', 'SC', '', '', '2025-07-18 13:51:57', '2025-07-18 13:51:57', 1),
(4249, '35908969000140', 'FRIVALE TRANSPORTES E SERVICOS LTDA', '', 'ANTONIO MORANDI', '710 E', '89809722', 'EFAPI', 'CHAPECO', 'SC', '', '4931993671undefined', '2025-07-18 13:51:58', '2025-07-18 13:51:58', 1),
(4250, '49861406000158', 'CONDOMINIO DO EDIFICIO ILLUMINATO', '', 'GENERAL OSORIO', '319', '89874000', 'CENTRO', 'MARAVILHA', 'SC', '', '4936640087undefined', '2025-07-18 13:51:59', '2025-07-18 13:51:59', 1),
(4251, '83305235002243', 'COOPERATIVA AGROINDUSTRIAL ALFA', 'COOPERALFA', 'FERNANDO MACHADO', '2690-D', '89805052', 'PASSO DOS FORTES', 'CHAPECO', 'SC', '', '4933217010undefined', '2025-07-18 13:52:00', '2025-07-18 13:52:00', 1),
(4252, '54685900000220', 'MERCO STORE LTDA', '', 'ROMILDO PRADO ITATIBA-LOUVEIRA', 'SN', '13255750', 'LEITE DOS', 'ITATIBA', 'SP', '', '3432150968undefined', '2025-07-18 13:52:01', '2025-07-18 13:52:01', 1),
(4253, '86224177000197', 'AVENIDA HOTEL LTDA', 'HOTEL AVENIDA', 'AVENIDA BRASIL', '1027', '89990000', 'CENTRO', 'SAO LOURENCO DO OESTE', 'SC', '', '4933441235undefined', '2025-07-18 13:52:02', '2025-07-18 13:52:02', 1),
(4254, '31281309000120', 'DEDETIZADORA NOVO LAR LTDA', '', 'FATIMA', 'S/N', '89850000', 'RURAL', 'QUILOMBO', 'SC', '', '4985032636undefined', '2025-07-18 13:52:03', '2025-07-18 13:52:03', 1),
(4255, '83573212000942', 'COOPERATIVA DE PRODUCAO E CONSUMO CONCORDIA', '', 'TANCREDO NEVES', '2218', '89760000', 'CENTRO', 'ITA', 'SC', '', '4934581141undefined', '2025-07-18 13:52:04', '2025-07-18 13:52:04', 1),
(4256, '11001445000102', 'ASSOC PROD ORGANICOS DO PLAN V DO ITAJAI E LITORAL CAT - ECOFRUTAS', 'ECOFRUTAS', 'EXPEDICIONARIO ALEANDRO STEDILE', '2800', '89160001', 'ITOUPAVA', 'RIO DO SUL', 'SC', '', '4735255557undefined', '2025-07-18 13:52:07', '2025-07-18 13:52:07', 1),
(4257, '12720068000124', 'COOPERATIVA CENTRAL SABOR COLONIAL', 'COOPER SABOR COLONIAL', 'MONTEVIDEO E', '2119', '89805750', 'PASSO DOS FORTES', 'CHAPECO', 'SC', '', '4933220634undefined', '2025-07-18 13:52:08', '2025-07-18 13:52:08', 1),
(4258, '13693075000147', 'BRASIL SUL SERVICOS DE MONITORAMENTO LTDA', 'BRASIL SUL SERVICOS DE MONITORAMENTO', 'SALOMAO CARNEIRO DE ALMEIDA', '2032', '89520000', 'AGUA SANTA', 'CURITIBANOS', 'SC', '', '4932413272undefined', '2025-07-18 13:52:09', '2025-07-18 13:52:09', 1),
(4259, '17002350000270', 'CONSTRUMALL SERVICOS LTDA', 'PLANALTO SUL ATACADO DE CONSTRUCAO', 'DR LEOBERTO LEAL', '2617', '89520000', 'BOM JESUS', 'CURITIBANOS', 'SC', '', '4932417656undefined', '2025-07-18 13:52:22', '2025-07-18 13:52:22', 1),
(4260, '83396697000199', 'DISTRIBUIDORA HAVITA LTDA', '', 'BR-282', '3120', '88520115', 'PASSO FUNDO', 'LAGES', 'SC', '', '4932515612undefined', '2025-07-18 13:52:26', '2025-07-18 13:52:26', 1),
(4261, '31772092000232', 'NILES MATERIAIS DE CONSTRUCAO LTDA', '', 'GOVERNADOR JORGE LACERDA', '268', '89520000', 'BOM JESUS', 'CURITIBANOS', 'SC', '', '4932450057undefined', '2025-07-18 13:52:27', '2025-07-18 13:52:27', 1),
(4262, '29067113015460', 'POLIMIX CONCRETO LTDA', 'POLIMIX', 'BR 470 - KM 253', 'S/N', '89520000', 'CURITIBANOS', 'CURITIBANOS', 'SC', '', '', '2025-07-18 13:52:30', '2025-07-18 13:52:30', 1),
(4263, '30898542000194', 'LAVACAR E MECANICA AUTOMOTIVA DOIS IRMAOS LTDA', '', 'VISCONDE DE MAUA', '100', '89500064', 'CENTRO', 'CACADOR', 'SC', '', '4999981156undefined', '2025-07-18 13:52:32', '2025-07-18 13:52:32', 1),
(4264, '95754859001093', 'PANIFICADORA E CONFEITARIA SANTELMO LTDA', 'PANIFICADORA E CONFEITARIA SANTELMO', 'GOIAS', '95', '89506093', 'DER', 'CACADOR', 'SC', '', '4935633264undefined', '2025-07-18 13:52:33', '2025-07-18 13:52:33', 1),
(4265, '80162902000163', 'MARCOS MARTARELLO', '', 'CEL VIDAL RAMOS', '1026', '89520000', 'CENTRO', 'CURITIBANOS', 'SC', '', '', '2025-07-18 13:52:34', '2025-07-18 13:52:34', 1),
(4266, '39802192000195', 'JUV INDUSTRIA DE ALIMENTOS LTDA', 'GRAOFINO', 'BRASIL', '309', '88509310', 'SAO CRISTOVAO', 'LAGES', 'SC', '', '4932246997undefined', '2025-07-18 13:52:35', '2025-07-18 13:52:35', 1),
(4267, '45441009000176', '45.441.009 EDIANE DA SILVA', '', 'RUY BARBOSA', '402', '89520000', 'SAO LUIZ', 'CURITIBANOS', 'SC', '', '4991832361undefined', '2025-07-18 13:52:37', '2025-07-18 13:52:37', 1),
(4268, '32430501000102', 'PRISCILA DA SILVA ALVES SS RECICLA', 'SS RECICLA', 'GOVERNADOR JORGE LACERDA', '1196', '89520000', 'BOM JESUS', 'CURITIBANOS', 'SC', '', '4989179797undefined', '2025-07-18 13:52:38', '2025-07-18 13:52:38', 1),
(4269, '18326204000506', 'L.F.A COMERCIO DE GAS LTDA', '', 'JOAO SILVA COLOMENO', '154', '89520000', 'SAO LUIZ', 'CURITIBANOS', 'SC', '', '4930184888undefined', '2025-07-18 13:52:40', '2025-07-18 13:52:40', 1),
(4270, '97397202000150', 'PADARIA GEHRKE LTDA', 'PADARIA GEHRKE', 'CORONEL FEDDERSEN', '558', '89190000', 'CENTRO', 'TAIO', 'SC', '', '4735620143undefined', '2025-07-18 13:52:44', '2025-07-18 13:52:44', 1),
(4271, '75846394000100', 'SUPERMERCADO HAAG LTDA', '', 'DOS EXPEDICIONARIOS', '1457', '89466314', 'CAMPO DA AGUA VERDE', 'CANOINHAS', 'SC', '', '4736225048undefined', '2025-07-18 13:52:45', '2025-07-18 13:52:45', 1),
(4272, '18326204000425', 'L.F.A COMERCIO DE GAS LTDA', 'GAS JA', 'PAPA JOAO XXIII', '399', '89540000', 'CENTRO', 'SANTA CECILIA', 'SC', '', '4991312465undefined', '2025-07-18 13:52:46', '2025-07-18 13:52:46', 1),
(4273, '57617975000180', '57.617.975 MARIA LETICIA DE MORAES', '', 'VALDIR ORTIGARI', '120', '89520000', 'SAO LUIZ', 'CURITIBANOS', 'SC', '', '4991847243undefined', '2025-07-18 13:52:48', '2025-07-18 13:52:48', 1),
(4274, '85606606000128', 'HOTEL SAN RAFAEL LTDA', 'HOTEL SAN RAFAEL', 'XV DE NOVEMBRO', '125', '89400000', '', 'PORTO UNIAO', 'SC', '', '', '2025-07-18 13:52:49', '2025-07-18 13:52:49', 1),
(4275, '31370437000140', 'SCHEILA COMERCIO DE FRUTAS E VERDURAS LTDA', 'FRUTAS BOHM', 'JOAO BERTOLI', '89', '89190000', 'CENTRO', 'TAIO', 'SC', '', '4791575552undefined', '2025-07-18 13:52:51', '2025-07-18 13:52:51', 1),
(4276, '13642521000194', 'JOSLAINE DE FATIMA BALBOENA', 'FRUTOLANDIA DO BAIXINHO', 'BR 280', '3932', '89400000', 'PINTADO', 'PORTO UNIAO', 'SC', '', '4235226952undefined', '2025-07-18 13:52:55', '2025-07-18 13:52:55', 1),
(4277, '18326204000182', 'L.F.A COMERCIO DE GAS LTDA', 'GAS JA', 'JOAO DA SILVA CALOMENO', '154', '89520000', 'SAO LUIZ', 'CURITIBANOS', 'SC', '', '4932433635undefined', '2025-07-18 13:52:56', '2025-07-18 13:52:56', 1),
(4278, '27061814000192', 'WILSON RIBEIRO CHAVES TRANSPORTES', '', 'LEONARDO FONTES', '24', '89520000', 'CENTRO', 'CURITIBANOS', 'SC', '', '4999757228undefined', '2025-07-18 13:52:59', '2025-07-18 13:52:59', 1),
(4279, '10724306000144', 'CONFEITARIA GEHRKE LTDA', 'GEHRKE O CONFEITEIRO', 'EMILIO TAMBOSI', '888', '89190000', 'SAO JOAO', 'TAIO', 'SC', '', '4735629000undefined', '2025-07-18 13:53:01', '2025-07-18 13:53:01', 1),
(4280, '60598680000119', '60.598.680 JAIME SPIEVAKOSKI JUNIOR', '', 'VALDIR ORTIGARY', '120', '89520000', 'CENTRO', 'CURITIBANOS', 'SC', '', '4998229460undefined', '2025-07-18 13:53:03', '2025-07-18 13:53:03', 1),
(4281, '75862961000104', 'ARDUINO NARDELLI E FILHOS LTDA', 'NARDELLI MATERIAIS DE CONSTRUCAO', '7 DE SETEMBRO', '81', '89170000', 'CENTRO', 'LAURENTINO', 'SC', '', '4735463400undefined', '2025-07-18 13:53:04', '2025-07-18 13:53:04', 1),
(4282, '79235248000191', 'HOTEL RIOSULENSE LTDA', '', 'ARISTILIANO RAMOS', '384', '89160001', 'CENTRO', 'RIO DO SUL', 'SC', '', '4735210044undefined', '2025-07-18 13:53:05', '2025-07-18 13:53:05', 1),
(4283, '92660406001603', 'FRIGELAR COMERCIO E INDUSTRIA LTDA', 'AA FRIGELAR S.A.', 'CRUZEIRO', '899/02', '94930615', 'DISTRITO INDUSTRIAL', 'CACHOEIRINHA', 'RS', '', '1132552525undefined', '2025-07-18 13:53:09', '2025-07-18 13:53:09', 1),
(4284, '80694185000110', 'ELETRO REFRIGERACAO TROPICAL LTDA', 'REFRIGERACAO TROPICAL', 'MATHEUS CONCEICAO', '324', '89520000', 'CENTRO', 'CURITIBANOS', 'SC', '', '4932451340undefined', '2025-07-18 13:53:10', '2025-07-18 13:53:10', 1),
(4285, '33513485000176', 'HOTEL POUSO REDONDO LTDA', 'HOTEL SCOZ', 'BR 470', '10490', '89172000', 'CENTRO', 'POUSO REDONDO', 'SC', '', '4735451235undefined', '2025-07-18 13:53:11', '2025-07-18 13:53:11', 1),
(4286, '17410933000150', 'ADRIANO DE MELLO', 'ADM SOLUCOES ELETRONICAS', 'DR LAURO MULLER', '488', '89520000', 'CENTRO', 'CURITIBANOS', 'SC', '', '4984284829undefined', '2025-07-18 13:53:12', '2025-07-18 13:53:12', 1),
(4287, '57305809000149', '57.305.809 MARIZA MORAES ROSA DOS SANTOS', '', 'LAGES', '427', '89520000', 'CENTRO', 'CURITIBANOS', 'SC', '', '4998500000undefined', '2025-07-18 13:53:13', '2025-07-18 13:53:13', 1),
(4288, '40942730000126', 'KAUANE PAOLA DE SOUZA 10499184955', '', 'JOAO PEDRO CARNEIRO', '279', '89520000', 'BOM JESUS', 'CURITIBANOS', 'SC', '', '4932413790undefined', '2025-07-18 13:53:14', '2025-07-18 13:53:14', 1),
(4289, '21295776000156', 'EDSR HORTIFRUTIGRANJEIRO LTDA', '', 'BR-467', 'S/N', '85813450', 'CANADA', 'CASCAVEL', 'PR', '', '4530358303undefined', '2025-07-18 13:53:15', '2025-07-18 13:53:15', 1),
(4290, '26490174000173', 'REIS CASAGRANDE ALIMENTOS LTDA', 'DISTRIBUIDORA DE CARNES IMPERATRIZ', 'FLORIANOPOLIS', '1641', '85927000', 'NOVO SARANDI', 'TOLEDO', 'PR', '', '4532731631undefined', '2025-07-18 13:53:16', '2025-07-18 13:53:16', 1),
(4291, '15188000000134', 'LIGUEFIO MATERIAIS ELETRICOS LTDA', '', 'MINISTRO CIRNE LIMA', '2158', '85903590', 'JARDIM COOPAGRO', 'TOLEDO', 'PR', '', '4530548832undefined', '2025-07-18 13:53:17', '2025-07-18 13:53:17', 1),
(4292, '80800196000138', 'C L POLACHINI & CIA LTDA', 'EMPOL COM DE EMBALAGENS', 'PARIGOT DE SOUZA', '2906', '85904270', 'JARDIM INDUSTRIAL', 'TOLEDO', 'PR', '', '0452782351undefined', '2025-07-18 13:53:18', '2025-07-18 13:53:18', 1),
(4293, '55580442000146', 'MIX TOTAL EMBALAGENS LTDA', 'MIX TOTAL EMBALAGENS', 'ALMIRANTE TAMANDARE', '972', '85900270', 'CENTRO', 'TOLEDO', 'PR', '', '4530554676undefined', '2025-07-18 13:53:19', '2025-07-18 13:53:19', 1),
(4294, '16417108000114', 'BOCCHI ATACADO LTDA', '', 'ARACY TANAKA BIAZETTO', '15372', '85804605', 'SANTOS DUMONT', 'CASCAVEL', 'PR', '', '4533216000undefined', '2025-07-18 13:53:20', '2025-07-18 13:53:20', 1),
(4295, '81894255000570', 'DUSNEI ALIMENTOS LTDA', '', 'DAS AGROINDUSTRIAS', '1500', '85818117', 'DOMICILIANO THEOBALDO BRESOLIN', 'CASCAVEL', 'PR', '', '4432675256undefined', '2025-07-18 13:53:21', '2025-07-18 13:53:21', 1),
(4296, '76087964000423', 'BIGOLIN MATERIAIS DE CONSTRUCAO LTDA', '', 'BARO DO RIO BRANCO', '1614', '85905020', 'CENTRO', 'TOLEDO', 'PR', '', '453220900undefined', '2025-07-18 13:53:22', '2025-07-18 13:53:22', 1),
(4297, '81611931001108', 'OESA COMERCIO E REPRESENTACOES S/A', '', 'JOAO SABIM', '123', '83606489', 'SALGADINHO', 'CAMPO LARGO', 'PR', '', '4733769500undefined', '2025-07-18 13:53:23', '2025-07-18 13:53:23', 1),
(4298, '51879363000180', 'AQUARIU S PEIXES E FRUTOS DO MAR LTDA', 'AQUARIU S PEIXES E FRUTOS DO MAR', 'JOSÉ JOÃO MURARO', '2003', '85906370', 'JARDIM PORTO ALEGRE', 'TOLEDO', 'PR', '', '4298158895undefined', '2025-07-18 13:53:25', '2025-07-18 13:53:25', 1),
(4299, '43076735000101', 'TOLEDO EMBALAGENS LTDA', 'TOLEDO EMBALAGENS', 'DOM PEDRO II', '560', '85914000', 'JARDIM PARIZZOTTO', 'TOLEDO', 'PR', '', '4530554776undefined', '2025-07-18 13:53:26', '2025-07-18 13:53:26', 1),
(4300, '26342973000100', 'C W ALIMENTOS LTDA', '', 'ARMANDO LUIZ ARROSI', '748', '85901020', 'CENTRO', 'TOLEDO', 'PR', '', '4532773836undefined', '2025-07-18 13:53:27', '2025-07-18 13:53:27', 1),
(4301, '32050303000105', 'STUANI COMIDA TRANSPORTADA LTDA', 'FS COMIDA TRANSPORTADA', 'MINISTRO CIRNE LIMA', '692', '85902400', 'JARDIM PANCERA', 'TOLEDO', 'PR', '', '4599469294undefined', '2025-07-18 13:53:28', '2025-07-18 13:53:28', 1),
(4302, '79863569005361', 'COASUL COOPERATIVA AGROINDUSTRIAL', 'CD - PATO BRANCO', 'BR-158 KM 529', '4100', '85504670', 'PARQUE INDUSTRIAL THEOFILO PETRYCOSKI', 'PATO BRANCO', 'PR', '', '4635338100undefined', '2025-07-18 13:53:29', '2025-07-18 13:53:29', 1),
(4303, '31326871000123', 'EMBALABEM COMERCIO DE EMBALAGENS E ALIMENTOS LTDA', 'EMBALABEM', 'LOPEI', '207', '85910230', 'VILA PIONEIRO', 'TOLEDO', 'PR', '', '4532528128undefined', '2025-07-18 13:53:30', '2025-07-18 13:53:30', 1),
(4304, '54479873000158', 'TRANSPORTES RODOVIARIOS DE CARGAS VIEIRA LTDA', 'TRANSPORTES RODOVIARIOS DE CARGAS VIEIRA', 'ROTARY', '480', '89520000', 'CENTRO', 'CURITIBANOS', 'SC', '', '4932412252undefined', '2025-07-18 13:53:32', '2025-07-18 13:53:32', 1),
(4305, '47457016000191', 'CRA ALIMENTOS LTDA', 'CRA ALIMENTOS', 'RURAL, LINHA VISTA ALEGRE', 'S/N', '85919899', 'AREA RURAL DE TOLEDO', 'TOLEDO', 'PR', '', '4541029659undefined', '2025-07-18 13:53:33', '2025-07-18 13:53:33', 1),
(4306, '39877895000182', '39.877.895 MARCELO ANDRES SANCHEZ', '', 'MARIPA', '4384', '85901000', 'CENTRO', 'TOLEDO', 'PR', '', '4591123997undefined', '2025-07-18 13:53:34', '2025-07-18 13:53:34', 1),
(4307, '16914559000167', 'G PLASTICOS COMERCIO VAREJISTA E ATACADISTA DE PLASTICOS LTDA', 'G PLASTICOS', 'MAURICIO SIROTSKY SOBRINHO', '2673', '95088600', 'SAO VICTOR COHAB', 'CAXIAS DO SUL', 'RS', '', '5499593699undefined', '2025-07-18 13:53:36', '2025-07-18 13:53:36', 1),
(4308, '15548575000110', 'F G P FIORENTIN AUTO FOSSA E TRANSPORTES LTDA', '', 'SANTO ANGELO', '640', '85904150', 'VILA INDUSTRIAL', 'TOLEDO', 'PR', '', '4591355087undefined', '2025-07-18 13:53:37', '2025-07-18 13:53:37', 1),
(4309, '08474752000104', 'ONFINITY COMERCIAL LTDA', 'ONFINITY', 'BENEDITO NOVO', '100', '89810060', 'CRISTO REI', 'CHAPECO', 'SC', '', '4933287959undefined', '2025-07-18 13:58:52', '2025-07-18 13:58:52', 1),
(4310, '04359521000190', 'IMPESCAL - INDUSTRIA DE PESCADOS LTDA', 'IMPESCAL', 'MUNICIPAL', 'S/N', '89845000', 'STO ANTONIO DO MEIO', 'UNIAO DO OESTE', 'SC', '', '4999288553undefined', '2025-07-18 13:58:53', '2025-07-18 13:58:53', 1),
(4311, '07144456000174', 'ITALIA COMERCIO E DISTRIBUIDORA LTDA', 'EASYCHEF FOODS', 'BR 101 KM 132', 'S/N', '88349175', 'MONTE ALEGRE', 'CAMBORIU', 'SC', '', '4730469488undefined', '2025-07-18 13:58:54', '2025-07-18 13:58:54', 1),
(4312, '07125517000156', 'COOPERATIVA DA AGRICULTURA FAMILIAR DO VALE DO ITAJAI', '', 'PREFEITO SIDO SCHROEDER', '133', '89155000', 'CENTRO', 'DONA EMMA', 'SC', '', '4733640237undefined', '2025-07-18 13:58:55', '2025-07-18 13:58:55', 1),
(4313, '01398128000118', 'MOGANO BUSINESS HOTEL LTDA', '', 'GETULIO VARGAS ESQUINA S.JOAO', '1372', '89804460', 'CENTRO', 'CHAPECO', 'SC', '', '', '2025-07-18 13:58:57', '2025-07-18 13:58:57', 1),
(4314, '00964245000139', 'BRINGHENTTI INDUSTRIA E COMERCIO LTDA', 'BRINGHENTTI INDUSTRIA E COMERCIO', 'PLINIO ARLINDO DE NES', '1304 D', '89810300', 'ELDORADO', 'CHAPECO', 'SC', '', '4933307200undefined', '2025-07-18 13:59:01', '2025-07-18 13:59:01', 1),
(4315, '02798814000149', 'NUTYLAC INDUSTRIA E COMERCIO DE ALIMENTOS LTDA', '', 'FERNANDO STECCA', '467', '18087149', 'IPORANGA', 'SOROCABA', 'SP', '', '', '2025-07-18 13:59:02', '2025-07-18 13:59:02', 1),
(4316, '04823762000149', 'LASAROLI ALIMENTOS INDUSTRIA E COMERCIO LTDA', 'LATICINIO SILVA & LASAROLI', 'SC 108', '1700', '88475000', 'RIO ALFA', 'ANITAPOLIS', 'SC', '', '4832560363undefined', '2025-07-18 13:59:05', '2025-07-18 13:59:05', 1),
(4317, '04696157000154', 'GAUDIO MARIO POZZAN', 'CARIMBOS E CHAVES GOLD', 'QUINTINO BOCAIUVA', '140E', '89801080', 'CENTRO', 'CHAPECO', 'SC', '', '4998084979undefined', '2025-07-18 13:59:06', '2025-07-18 13:59:06', 1),
(4318, '04915352000128', 'INDUSTRIA E COMERCIO DE LATICINIOS VENEZA LTDA', 'LEITE VENEZA', 'VALENTIM DAMIANI', '3500', '88865000', 'GUARAPARI', 'NOVA VENEZA', 'SC', '', '4834361351undefined', '2025-07-18 13:59:08', '2025-07-18 13:59:08', 1),
(4319, '08904113000123', 'MAIS FRANGO MIRAGUAI LTDA', 'MAIS FRANGO MIRAGUAI', 'RS 330', 'S/N', '98540000', 'DISTRITO DE IRAPUA', 'MIRAGUAI', 'RS', '', '5535541003undefined', '2025-07-18 13:59:09', '2025-07-18 13:59:09', 1),
(4320, '00711505000164', 'CRISTAL EQUIPAMENTOS LTDA', '', 'FAXINAL DOS GUEDES', '700-D', '89810010', 'CRISTO REI', 'CHAPECO', 'SC', '', '4933244911undefined', '2025-07-18 13:59:10', '2025-07-18 13:59:10', 1),
(4321, '07213191000119', 'BORSATO GAS LTDA', 'BORSATO GAS', 'DO TRIUNFO', '660', '89888000', 'CENTRO', 'CAIBI', 'SC', '', '4936480144undefined', '2025-07-18 13:59:13', '2025-07-18 13:59:13', 1),
(4322, '01953530000117', 'PAN DISTRIBUIDORA LTDA', 'DISAPAR DISTRIBUIDORA', 'FERNANDO MACHADO', '2536', '89803000', 'PASSO DOS FORTES', 'CHAPECO', 'SC', '', '4933210800undefined', '2025-07-18 13:59:15', '2025-07-18 13:59:15', 1),
(4323, '07132542000167', 'ELAINE CENTER COPY LTDA', 'ELAINE PRINT IMPRESSAO DIGITAL', 'MARECHAL DEODORO DA FONSECA', '170', '89802140', 'CENTRO', 'CHAPECO', 'SC', '', '4933225303undefined', '2025-07-18 13:59:18', '2025-07-18 13:59:18', 1),
(4324, '09262983000109', 'TJ DEDETIZACOES E SERVICOS LTDA', 'DESINSUL', 'NOVA TRENTO', '649', '89160282', 'SANTANA', 'RIO DO SUL', 'SC', '', '4735226039undefined', '2025-07-18 13:59:19', '2025-07-18 13:59:19', 1),
(4325, '05594286000102', 'DISTRIOESTE DISTRIBUIDORA LTDA', '', 'NEREU RAMOS', '3100', '89805103', 'LIDER', 'CHAPECO', 'SC', '', '4933231897undefined', '2025-07-18 13:59:20', '2025-07-18 13:59:20', 1),
(4326, '09159163000196', 'DOBRAPERFIL PERFILADOS DE ACO LTDA', 'DOBRAPERFIL', 'COLOMBIA E', '175', '89805215', 'LIDER', 'CHAPECO', 'SC', '', '4933243806undefined', '2025-07-18 13:59:25', '2025-07-18 13:59:25', 1),
(4327, '01314317000165', 'TOZZO ALIMENTOS LTDA', '', 'PLINIO ARLINDO DE NES - ACS BR 282', '4303-D', '89810460', 'BELVEDERE', 'CHAPECO', 'SC', '', '4933211000undefined', '2025-07-18 13:59:28', '2025-07-18 13:59:28', 1),
(4328, '03470626000664', 'COOPERATIVA A1', 'COOPER A1', 'JOAO BERNARDES', '179', '89895000', 'CENTRO', 'RIQUEZA', 'SC', '', '4936479045undefined', '2025-07-18 13:59:37', '2025-07-18 13:59:37', 1),
(4329, '07973283000105', 'DUDU SUPERMERCADO LTDA', 'MERCADO FERRARI', 'CORONEL ERNESTO BERTASO', '1363', '89850000', 'CENTRO', 'QUILOMBO', 'SC', '', '4933463362undefined', '2025-07-18 13:59:39', '2025-07-18 13:59:39', 1),
(4330, '08548343000105', 'IVONEI RAHMEIER', '', 'LAURO MULLER', '291', '89740000', 'CENTRO', 'ARABUTA', 'SC', '', '4999840413undefined', '2025-07-18 13:59:41', '2025-07-18 13:59:41', 1),
(4331, '03212385000149', 'IGUATEMI ALIMENTOS LTDA', 'IGUATEMI SUPERMERCADOS', 'SUL BRASIL', '1746', '89874000', 'NOVO BAIRRO', 'MARAVILHA', 'SC', '', '0498640340undefined', '2025-07-18 13:59:42', '2025-07-18 13:59:42', 1),
(4332, '08971433000104', 'COOPERATIVA DE PEQUENOS AGRICULTORES DE VIDEIRA E IOMERE - COPAVIDI', 'COPAVIDI', 'SEM DENOMIN / DESM. ZARPELON', 'S/N', '89560000', 'SANTA GEMA', 'VIDEIRA', 'SC', '', '4935327660undefined', '2025-07-18 13:59:43', '2025-07-18 13:59:43', 1),
(4333, '05344269000109', 'MERCADO E PADARIA REAL LTDA', 'MERCADO E PADARIA REAL', 'TOLDINHO,', '174', '89862000', 'CENTRO', 'ENTRE RIOS', 'SC', '', '493510052undefined', '2025-07-18 13:59:50', '2025-07-18 13:59:50', 1),
(4334, '05640268000373', 'AMAURI COMERCIO DE ALIMENTOS LTDA', '', 'GETULIO VARGAS', '534', '89980000', 'CENTRO', 'CAMPO ERE', 'SC', '', '4933443510undefined', '2025-07-18 13:59:52', '2025-07-18 13:59:52', 1),
(4335, '01435328000284', 'COOPERATIVA REGIONAL DE COMERCIALIZACAO DO EXTREMO OESTE - COOPEROESTE', 'COOPEROESTE FILIAL 02', 'LINHA BELA VISTA DAS FLORES', 'S/N', '89900000', 'INTERIOR', 'SAO MIGUEL DO OESTE', 'SC', '', '4936310200undefined', '2025-07-18 13:59:55', '2025-07-18 13:59:55', 1),
(4336, '05646086000148', 'SABADINI COMERCIO DE CARNES LTDA', 'CENTER BOI', 'PERU', '275 D', '89805180', 'LIDER', 'CHAPECO', 'SC', '', '', '2025-07-18 13:59:56', '2025-07-18 13:59:56', 1),
(4337, '08199996008011', 'JBS AVES LTDA.', 'JBS AVES', 'RS 324, KM 69', 'S/N', '99615000', 'LINHA BAU', 'TRINDADE DO SUL', 'RS', '', '1131445600undefined', '2025-07-18 13:59:57', '2025-07-18 13:59:57', 1),
(4338, '01034199000131', 'LEANDRA MARINA BREDA HERDINA', '', 'WILLY BARTH', '4736', '89900000', 'CENTRO', 'SAO MIGUEL DO OESTE', 'SC', '', '4936220960undefined', '2025-07-18 14:00:04', '2025-07-18 14:00:04', 1),
(4339, '08949707000150', 'IVETE CADORE GEWEHR & CIA LTDA', 'HOTEL E CHURRASCARIA AVENIDA', 'ITUPORA', '718', '89980000', 'CENTRO', 'CAMPO ERE', 'SC', '', '4936551027undefined', '2025-07-18 14:00:05', '2025-07-18 14:00:05', 1),
(4340, '05640268000101', 'AMAURI COMERCIO DE ALIMENTOS LTDA', 'AMAURI SUPERMERCADOS', 'RIO DE JANEIRO', '545', '89990000', 'BRASILIA', 'SAO LOURENCO DO OESTE', 'SC', '', '4933443510undefined', '2025-07-18 14:00:11', '2025-07-18 14:00:11', 1),
(4341, '06073701000137', 'SEDEVILLE DEDETIZADORA E LIMPEZA LTDA', '', 'SAO JOSE DOS CEDROS', '489', '89227040', 'IRIRIU', 'JOINVILLE', 'SC', '', '4734370157undefined', '2025-07-18 14:00:12', '2025-07-18 14:00:12', 1),
(4342, '04586523000112', 'MARLI E. T. FRANK', 'AGRO MERCADO KEKE', 'SC - 497, KM. 10,0', 'S/N', '89887000', 'SEDE OLDENBURG', 'PALMITOS', 'SC', '', '0496470001undefined', '2025-07-18 14:00:16', '2025-07-18 14:00:16', 1),
(4343, '03851333000112', 'AMINNA ALIMENTOS LTDA', '', 'EDMUND THUROW', '153', '89032430', 'PASSO MANSO', 'BLUMENAU', 'SC', '', '4733251511undefined', '2025-07-18 14:00:18', '2025-07-18 14:00:18', 1),
(4344, '07902335000144', 'DISMAFF ATACADISTA E COMERCIO DE MATERIAIS DE CONSTRUCAO LTDA', 'DISMAFF ATACADISTA', 'IPIRA', '38', '89810190', 'ELDORADO', 'CHAPECO', 'SC', '', '4933228782undefined', '2025-07-18 14:00:19', '2025-07-18 14:00:19', 1),
(4345, '00186044000158', 'HIDROLAR MATERIAIS DE CONSTRUCAO LTDA', 'HIDROLAR', 'BORGES DE MEDEIROS', '1022-E', '89801161', 'PRES. MEDICI', 'CHAPECO', 'SC', '', '4933222280undefined', '2025-07-18 14:00:20', '2025-07-18 14:00:20', 1),
(4346, '07256903000187', 'RET PRODUTOS ALIMENTICIOS LTDA', 'NUTRIPLENO', 'SANTANA DO RIO PRETO', '535', '08421060', 'VILA COSMOPOLITA', 'SAO PAULO', 'SP', '', '1125189700undefined', '2025-07-18 14:00:25', '2025-07-18 14:00:25', 1),
(4347, '04869719000114', 'VITAO ALIMENTOS LTDA', '', 'REGINA TISSER STIER', '307', '81260020', 'CIDADE INDUSTRIAL DE CURITIBA', 'CURITIBA', 'PR', '', '4135236500undefined', '2025-07-18 14:00:26', '2025-07-18 14:00:26', 1),
(4348, '04132505000160', 'W H R ELETROMECANICA LTDA', 'REFRIGERACAO OFICINA DO FRIO LTDA', 'SENADOR ATILIO FRANCISCO XAVIER FONTANA', '3421', '89809506', 'EFAPI', 'CHAPECO', 'SC', '', '4933288399undefined', '2025-07-18 14:00:32', '2025-07-18 14:00:32', 1),
(4349, '02963675000161', 'MARCOS AIRTON PILZ & CIA LTDA', 'SUPERMERCADO GIRASSOL', 'RUI BARBOSA', '101', '89890000', 'CENTRO', 'CUNHA PORA', 'SC', '', '4936460023undefined', '2025-07-18 14:00:33', '2025-07-18 14:00:33', 1),
(4350, '03429847000184', 'MARAVILHAS PARK HOTEL LTDA.', 'MARAVILHAS PARK HOTEL', 'BR 282', 'S/N', '89874000', 'SEDE', 'MARAVILHA', 'SC', '', '4936643015undefined', '2025-07-18 14:00:34', '2025-07-18 14:00:34', 1),
(4351, '08357638000196', 'SUPERMERCADO AMADEU LTDA', 'MERCEARIA VITORIA', 'INES BERTUOL', '167', '89820000', 'SUFIATTI', 'XANXERE', 'SC', '', '4999294342undefined', '2025-07-18 14:00:35', '2025-07-18 14:00:35', 1),
(4352, '03470626000583', 'COOPERATIVA A1', 'COOPER A1', 'GUSTAVO FETTER', '1560', '89899000', 'CENTRO', 'IPORA DO OESTE', 'SC', '', '0498341140undefined', '2025-07-18 14:00:37', '2025-07-18 14:00:37', 1),
(4353, '00192861000119', 'HIDRO FILTROS DO BRASIL INDUSTRIA E COMERCIO DE FILTROS LTDA', 'HIDRO FILTROS', 'QUINZE DE OUTUBRO', '158', '89239700', 'PIRABEIRABA', 'JOINVILLE', 'SC', '', '4730032003undefined', '2025-07-18 14:00:40', '2025-07-18 14:00:40', 1),
(4354, '05509738000100', 'IND. E COM. DE ALIMENTOS FUCHINA LTDA', 'GIRASSOL ALIMENTOS', 'TIRADENTES', '1087', '89990000', 'SAO FRANCISCO', 'SAO LOURENCO DO OESTE', 'SC', '', '4933441910undefined', '2025-07-18 14:00:44', '2025-07-18 14:00:44', 1),
(4355, '05245502000104', 'MHNET TELECOMUNICACOES LTDA', 'MHNET TELECOM', 'PRESIDENTE KENNEDY', '527', '89874000', 'CENTRO', 'MARAVILHA', 'SC', '', '4931983198undefined', '2025-07-18 14:00:47', '2025-07-18 14:00:47', 1),
(4356, '08327985000176', 'PLATINOX COMERCIO DE EQUIPAMENTOS PARA GASTRONOMIA LTDA', '', 'ARY CLAUDINO ZIEMER', '363', '81870050', 'PINHEIRINHO', 'CURITIBA', 'PR', '', '4133491600undefined', '2025-07-18 14:00:48', '2025-07-18 14:00:48', 1),
(4357, '01685426000199', 'MERCADO POUCO PRECO LTDA', '', 'PADRE ANCHIETA', '290', '89887000', 'CENTRO', 'PALMITOS', 'SC', '', '04978720306undefined', '2025-07-18 14:00:51', '2025-07-18 14:00:51', 1);
INSERT INTO `fornecedores` (`id`, `cnpj`, `razao_social`, `nome_fantasia`, `logradouro`, `numero`, `cep`, `bairro`, `municipio`, `uf`, `email`, `telefone`, `criado_em`, `atualizado_em`, `status`) VALUES
(4358, '01754239001868', 'REFRIGERACAO DUFRIO COMERCIO E IMPORTACAO S.A.', 'REFRIGERACAO DUFRIO COM. E IMP. LTDA', 'DARLY SANTOS', '800', '29104491', 'JARDIM ASTECA', 'VILA VELHA', 'ES', '', '5137787560undefined', '2025-07-18 14:00:53', '2025-07-18 14:00:53', 1),
(4359, '00523549000160', 'S & V EQUIPAMENTOS PARA ESCRITORIO LTDA', '', 'FERNANDO MACHADO', '703', '89802111', 'CENTRO', 'CHAPECO', 'SC', '', '4933310290undefined', '2025-07-18 14:00:55', '2025-07-18 14:00:55', 1),
(4360, '00685642000171', 'JOSE VALCIR STANGA', 'SULMEL ENTREPOSTO DE MEL E CERA DE ABELHA', 'RUA IRACI DERVANOSCKI', '28', '89825000', 'BELA VISTA', 'XAXIM', 'SC', '', '4933532765undefined', '2025-07-18 14:00:59', '2025-07-18 14:00:59', 1),
(4361, '01754239005006', 'REFRIGERACAO DUFRIO COMERCIO E IMPORTACAO S.A.', '', 'DORALICE RAMOS PINHO', '52', '88111310', 'JARDIM CIDADE DE FLORIANOPOLIS', 'SAO JOSE', 'SC', '', '5137787567undefined', '2025-07-18 14:01:00', '2025-07-18 14:01:00', 1),
(4362, '09487203000200', 'COOPER PINHEIRO - COOPERATIVA DE PRODUCAO DA AGRICULTURA FAMILIAR DE PINHEIRO PRETO', 'COOPER PINHEIRO', 'SANTO ISIDORO', 'SN', '89570000', 'INTERIOR', 'PINHEIRO PRETO', 'SC', '', '4935621405undefined', '2025-07-18 14:01:02', '2025-07-18 14:01:02', 1),
(4363, '05884885000152', 'JLA COMERCIO E DISTRIBUICAO LTDA', 'JLA COMERCIO E DISTRIBUICAO', 'SC 496', '1655', '89897000', 'INTERIOR', 'SAO JOAO DO OESTE', 'SC', '', '4936361400undefined', '2025-07-18 14:01:03', '2025-07-18 14:01:03', 1),
(4364, '03095212000198', 'CASA DO EPI - COMERCIO DE MATERIAIS DE SEGURANCA LTDA', 'CASA DO EPI', 'MARTINHO LUTERO', '332', '89804010', 'SO CRISTOVAO', 'CHAPECO', 'SC', '', '4933283448undefined', '2025-07-18 14:01:04', '2025-07-18 14:01:04', 1),
(4365, '06080348000112', 'GINO TRANSPORTES E LOCACAO DE GUINDASTES LTDA', 'GINO ENGENHARIA ELETRICA', 'SERVIDAO ORIVALDI ZANUZZO', '30-D', '89805732', 'PASSO DOS FORTES', 'CHAPECO', 'SC', '', '4933229063undefined', '2025-07-18 14:01:08', '2025-07-18 14:01:08', 1),
(4366, '05392679000125', 'KASA DO SOCORRO RESIDENCIAL E TRANSPORTES LTDA', 'KASA DO SOCORRO RESIDENCIAL', 'PLINIO ARLINDO DE NES', 'SN', '89810740', 'TREVO', 'CHAPECO', 'SC', '', '4933233850undefined', '2025-07-18 14:01:14', '2025-07-18 14:01:14', 1),
(4367, '04648723000152', 'RB CARNES COMERCIO DE ALIMENTOS LTDA', 'RB CARNES', 'LEOPOLDINA MARCELINO', '2000', '88106700', 'FORQUILHINHAS', 'SAO JOSE', 'SC', '', '4832200256undefined', '2025-07-18 14:01:16', '2025-07-18 14:01:16', 1),
(4368, '09414838000104', 'MERCADO E ACOUGUE PAINI LTDA', 'SOLAR SUPERMERCADO', 'ANACLETO AGOSTINI', '369', '89900000', 'AGOSTINI', 'SAO MIGUEL DO OESTE', 'SC', '', '4936220541undefined', '2025-07-18 14:01:18', '2025-07-18 14:01:18', 1),
(4369, '01435328001680', 'COOPERATIVA REGIONAL DE COMERCIALIZACAO DO EXTREMO OESTE - COOPEROESTE', 'COOPEROESTE FILIAL 16', 'SAO JOSE BR 282', 'KM 573', '89865000', 'INTERIOR', 'NOVA ERECHIM', 'SC', '', '4936310200undefined', '2025-07-18 14:01:20', '2025-07-18 14:01:20', 1),
(4370, '02996504000139', 'RUVER INDUSTRIA E TECNOLOGIA DE REFRIGERACAO LTDA', 'CHOPEIRAS RUVER', 'REGENTE DIOGO A. FEIJO', '295 D', '89803230', 'SAO CRISTOVAO', 'CHAPECO', 'SC', '', '4933230888undefined', '2025-07-18 14:01:21', '2025-07-18 14:01:21', 1),
(4371, '03377305000105', 'VOLNEI GILBERTO OBERDOERFER LTDA', 'TITU\'S BAR', 'DO COMERCIO', 'S/N', '89890000', 'AUGUSTO KEMPFER', 'CUNHA PORA', 'SC', '', '4936460313undefined', '2025-07-18 14:01:23', '2025-07-18 14:01:23', 1),
(4372, '06010802000169', 'STEVIA NATUS PRODUTOS NATURAIS LTDA', 'STEVIA NATUS', 'BRASIL', 'A-589', '86890000', 'CENTRO', 'CAMBIRA', 'PR', '', '4334361820undefined', '2025-07-18 14:01:28', '2025-07-18 14:01:28', 1),
(4373, '05528325000165', 'VINTER PLASTICOS INDUSTRIAIS LTDA', '', 'MARIO ROMANINI', '451 E', '89810413', 'BELVEDERE', 'CHAPECO', 'SC', '', '4933305444undefined', '2025-07-18 14:01:32', '2025-07-18 14:01:32', 1),
(4374, '03367127000131', 'SC COPIAS LTDA', 'SC COPIAS', 'SALOMAO CARNEIRO DE ALMEIDA', '685', '89520000', 'CENTRO', 'CURITIBANOS', 'SC', '', '4991282003undefined', '2025-07-18 14:01:35', '2025-07-18 14:01:35', 1),
(4375, '02484235000121', 'COOPERATIVA DOS ASSENTADOS DA REGIAO DO CONTESTADO', 'COOPER CONTESTADO', 'SC 355 RODOVIA DA MACA', 'SN', '89580000', 'BUTIA VERDE', 'FRAIBURGO', 'SC', '', '4935650046undefined', '2025-07-18 14:01:37', '2025-07-18 14:01:37', 1),
(4376, '03972731000197', 'IZIDORO INDUSTRIA E COMERCIO LTDA', 'ELETRO IZIDORO', 'BR 470', '7565', '89520000', 'GETULIO VARGAS', 'CURITIBANOS', 'SC', '', '4735629000undefined', '2025-07-18 14:01:41', '2025-07-18 14:01:41', 1),
(4377, '52967152000161', 'VEX TELECOMUNICACOES LTDA', '', 'DR LAURO MULLER', '291', '89520000', 'CENTRO', 'CURITIBANOS', 'SC', '', '4733800800undefined', '2025-07-18 14:01:43', '2025-07-18 14:01:43', 1),
(4378, '02013392000159', 'SAMUEL GALDINO', 'LAVACAO MUCA', 'CEL. FEDDERSEN', '2380', '89190000', 'CENTRO', 'TAIO', 'SC', '', '', '2025-07-18 14:01:51', '2025-07-18 14:01:51', 1),
(4379, '03551654000100', 'S Q SUPERMERCADOS LTDA', 'QUELUZ SUPERMERCADOS', 'LAGES', '17', '89520000', 'CENTRO', 'CURITIBANOS', 'SC', '', '4932451138undefined', '2025-07-18 14:02:00', '2025-07-18 14:02:00', 1),
(4380, '07019308000128', 'BRITANIA ELETRONICOS S.A.', 'BRITANIA ELETRONICOS', 'DONA FRANCISCA', '12340', '89239270', 'PIRABEIRABA', 'JOINVILLE', 'SC', '', '4132187700undefined', '2025-07-18 14:02:02', '2025-07-18 14:02:02', 1),
(4381, '03348292000146', 'COMERCIAL MEURER LTDA', 'PANIFICADORA MEURER', 'DOM PEDRO II', '79', '89138000', 'ESTACAO', 'ASCURRA', 'SC', '', '4733831034undefined', '2025-07-18 14:02:07', '2025-07-18 14:02:07', 1),
(4382, '02666159000256', 'I. TRAPP & CIA LTDA', '', 'DOM PEDRO II', '352', '89160001', 'CANOAS', 'RIO DO SUL', 'SC', '', '475218891undefined', '2025-07-18 14:02:08', '2025-07-18 14:02:08', 1),
(4383, '01652394000125', 'JEAN COMERCIO DE ALIMENTOS E TRANSPORTES LTDA', 'HORTIFRUTIGRANJEIROS NUNES', 'ADOLFO BATSCHAUER', '685', '88303530', 'DOM BOSCO', 'ITAJAI', 'SC', '', '4733489072undefined', '2025-07-18 14:02:09', '2025-07-18 14:02:09', 1),
(4384, '00823717000133', 'COZIGAS COMERCIO E TRANSPORTE DE GASES LTDA', '', 'COMENDADOR SELVINO CARAMORI', '135', '89500383', 'BERGER', 'CACADOR', 'SC', '', '4935670046undefined', '2025-07-18 14:02:11', '2025-07-18 14:02:11', 1),
(4385, '00075831000122', 'WALDEVINO ESTEVES MARTINS LTDA', 'TRANSPORTADORA E DISTRIBUIDORA DE GAS SANTA HELENA', 'SC 477', '200', '89460000', 'AGUA VERDE', 'CANOINHAS', 'SC', '', '4736240670undefined', '2025-07-18 14:02:22', '2025-07-18 14:02:22', 1),
(4386, '02049007000123', 'WALMIR J. DE FREITAS & CIA LTDA', 'UNIGAZ', 'PROFESSORA AMAZILIA', '1254', '84600324', 'SAO BERNARDO', 'UNIAO DA VITORIA', 'PR', '', '4235236000undefined', '2025-07-18 14:02:23', '2025-07-18 14:02:23', 1),
(4387, '08011379000147', 'MAIS VIDA BENEFICIAMENTO DE GENEROS ALIMENTICIOS LTDA', 'NUTRI & WIEDER', 'VENDELINO HOLZ', '446', '98960000', 'CENTRO', 'SANTO CRISTO', 'RS', '', '5535411867undefined', '2025-07-18 14:02:30', '2025-07-18 14:02:30', 1),
(4388, '06059358000176', 'COOPERATIVA MISTA AGRICOLA DE PISCICULTORES - COOMAPEIXE', '', 'DONA CLARA', '1100', '89120000', 'DONA CLARA', 'TIMBO', 'SC', '', '4933827834undefined', '2025-07-18 14:02:34', '2025-07-18 14:02:34', 1),
(4389, '02489545000139', 'PANIFICADORA E CONFEITARIA TAMBOSI LTDA', '', '7 DE SETEMBRO', '336', '89172000', 'CENTRO', 'POUSO REDONDO', 'SC', '', '', '2025-07-18 14:02:40', '2025-07-18 14:02:40', 1),
(4390, '02158816001650', 'SCHUMANN MOVEIS E ELETRODOMESTICOS LTDA EM RECUPERACAO JUDICIAL', '', 'GETULIO VARGAS', '563 N', '89802000', 'CENTRO', 'CHAPECO', 'SC', '', '4933193333undefined', '2025-07-18 14:02:45', '2025-07-18 14:02:45', 1),
(4391, '08693420000102', 'INDUSTRIA DE PRODUTOS COLONIAIS DO RIO TIGRINHO LTDA', '', 'COMUNIDADE DO RIO BUGRE', 'S/N', '89514899', 'INTERIOR', 'CACADOR', 'SC', '', '4935670811undefined', '2025-07-18 14:02:53', '2025-07-18 14:02:53', 1),
(4392, '00834971000803', 'ZERO GRAU INDUSTRIA E COMERCIO LTDA', 'ZERO GRAU PLASTICOS', 'RUA PROFESSOR EVALDO KISSLER', '213', '85930016', 'PARQUE INDUSTRIAL', 'NOVA SANTA ROSA', 'PR', '', '4599230584undefined', '2025-07-18 14:02:56', '2025-07-18 14:02:56', 1),
(4393, '09174650000128', 'EMBALAMAIS DOCES E EMBALAGENS LTDA', 'EMBALAMAIS - DOCES E EMBALAGENS', 'MARIPA', '4344', '85901000', 'CENTRO', 'TOLEDO', 'PR', '', '4530554776undefined', '2025-07-18 14:02:59', '2025-07-18 14:02:59', 1),
(4394, '06075718000123', 'VIAVEL COMERCIO DE GAS LTDA', '', 'VICENTE ROOS', '241', '85903390', 'JARDIM COOPAGRO', 'TOLEDO', 'PR', '', '4532770070undefined', '2025-07-18 14:03:00', '2025-07-18 14:03:00', 1),
(4395, '02168202001144', 'PRIMATO COOPERATIVA AGROINDUSTRIAL', 'PRIMATO', 'PARIGOT DE SOUZA, ESQUINA COM AVENIDA CIRNE LIMA', '4550', '85903170', 'JARDIM SANTA MARIA', 'TOLEDO', 'PR', '', '4530567511undefined', '2025-07-18 14:03:03', '2025-07-18 14:03:03', 1),
(4396, '05643675000172', 'MADEIREIRA J. K. LTDA', '', 'JOSE JOAO MURARO', '2316', '85906370', 'JARDIM PORTO ALEGRE', 'TOLEDO', 'PR', '', '4436495184undefined', '2025-07-18 14:03:06', '2025-07-18 14:03:06', 1),
(4398, '04247793000107', 'CONCORDE LOGISTICA & DISTRIBUICAOLTDA', 'CONCORDE', 'SENADOR SALGADO FILHO', '1099', '81510000', 'GUABIRUTUBA', 'CURITIBA', 'PR', '', '0413772211undefined', '2025-07-18 14:03:11', '2025-07-18 14:03:11', 1),
(4399, '09529706000110', 'LANCHERO ALIMENTOS DO BRASIL LTDA', '', 'JOAQUIM PALACIO', '215', '17539062', 'JOSE FERREIRA DA COSTA JUNIOR (LACIO)', 'MARILIA', 'SP', '', '1434172002undefined', '2025-07-18 14:03:12', '2025-07-18 14:03:12', 1),
(4400, '03304180000193', 'A. A. ROTTA & CIA, LTDA', '', 'BR 158 KM 529', '4100', '85504670', 'PARQUE INDUSTRIAL THEOFILO PETRYCOSKI', 'PATO BRANCO', 'PR', '', '4632202121undefined', '2025-07-18 14:03:22', '2025-07-18 14:03:22', 1),
(4401, '08983947000171', 'KITAL ALIMENTOS LTDA', '', 'PR 182', 'SN', '85922500', 'BIOPARK', 'TOLEDO', 'PR', '', '4598240032undefined', '2025-07-18 14:03:23', '2025-07-18 14:03:23', 1),
(4403, '07.192.414/0013-42', 'COSTA OESTE SERVICOS LTDA', 'TERCEIRIZE FOODS', 'CATARINA HOFF', '137-D', '89805427', 'LIDER', 'CHAPECO', 'SC', '', '(45) 3055-3644', '2025-07-18 14:21:00', '2025-07-29 20:19:53', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `permissoes_usuario`
--

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

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int NOT NULL,
  `nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidade_medida` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('Horti','Pao','Pereciveis','Base Seca','Limpeza') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Horti',
  `ativo` tinyint(1) DEFAULT '1',
  `data_cadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome`, `unidade_medida`, `tipo`, `ativo`, `data_cadastro`) VALUES
(1, 'ABACAXI - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(2, 'ABOBORA CABOTIA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(3, 'ABOBRINHA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(4, 'ACELGA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(5, 'AIPIM / MANDIOCA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(6, 'ALFACE CRESPA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(7, 'ALHO - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(8, 'BANANA DA TERRA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(9, 'BANANA PRATA - UN', 'UN', 'Horti', 1, '2025-09-17 21:51:59'),
(10, 'BATATA DOCE - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(11, 'BATATA INGLESA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(12, 'BETERRABA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(13, 'CEBOLA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(14, 'CENOURA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(15, 'CHEIRO VERDE - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(16, 'CHUCHU - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(17, 'COENTRO - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(18, 'COUVE MANTEIGA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(19, 'GOIABA - UN', 'UN', 'Horti', 1, '2025-09-17 21:51:59'),
(20, 'HORTELA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(21, 'INHAME - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(22, 'LARANJA - UN', 'UN', 'Horti', 1, '2025-09-17 21:51:59'),
(23, 'LIMAO - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(24, 'MACA FUJI - UN', 'UN', 'Horti', 1, '2025-09-17 21:51:59'),
(25, 'MAMAO FORMOSA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(26, 'MELANCIA - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(27, 'MELAO - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(28, 'OVO DE GALINHA - UN', 'UN', 'Horti', 1, '2025-09-17 21:51:59'),
(29, 'PEPINO - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(30, 'REPOLHO BRANCO- KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(31, 'REPOLHO ROXO - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(32, 'TANGERINA - UN', 'UN', 'Horti', 1, '2025-09-17 21:51:59'),
(33, 'TOMATE - KG', 'KG', 'Horti', 1, '2025-09-17 21:51:59'),
(67, 'PAO CASEIRO - KG', 'KG', 'Pao', 1, '2025-09-18 14:59:03'),
(68, 'PAO DE BATATA - UN', 'UN', 'Pao', 1, '2025-09-18 14:59:03'),
(69, 'PAO DE FORMA INTEGRAL 500G - PCT', 'PCT', 'Pao', 1, '2025-09-18 14:59:03'),
(70, 'PAO DE FORMA TRADICIONAL 500 G - PCT', 'PCT', 'Pao', 1, '2025-09-18 14:59:03'),
(71, 'PAO DE HAMBURGUER - UN', 'UN', 'Pao', 1, '2025-09-18 14:59:03'),
(72, 'PAO DE MILHO - UN', 'UN', 'Pao', 1, '2025-09-18 14:59:03'),
(73, 'PAO FAT. S/GLUTEN/LACTOSE 300 G - PCT', 'PCT', 'Pao', 1, '2025-09-18 14:59:03'),
(74, 'PAO HOT DOG - UN', 'UN', 'Pao', 1, '2025-09-18 14:59:03'),
(75, 'PAO HOT DOG ZERO LACTOSE - UN', 'UN', 'Pao', 1, '2025-09-18 14:59:03'),
(76, 'ALMONDEGA BOVINA - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(77, 'BIFE DE HAMBURGUER BOVINO - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(78, 'FILE DE TILAPIA 1 KG - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(79, 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(80, 'FILE DE SASSAMI 1 KG - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(81, 'IOGURTE DIET 200 G - PT', 'PT', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(82, 'IOGURTE NATURAL DESNATADO - LT', 'LT', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(83, 'IOGURTE SABOR COCO - LT', 'LT', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(84, 'IOGURTE SABOR MORANGO - LT', 'LT', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(85, 'IOGURTE ZERO LACTOSE - LT', 'LT', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(86, 'LINGUICA CALABRESA (FINA) - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(87, 'MANTEIGA C/SAL 500G - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(88, 'PATINHO BOVINO CUBOS 1 KG - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(89, 'PATINHO BOVINO MOIDO 1 KG - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(90, 'PERNIL SUINO CUBOS 1 KG - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(91, 'POLPA DE ABACAXI - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(92, 'POLPA DE ACEROLA - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(93, 'POLPA DE CAJU - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(94, 'POLPA DE GOIABA - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(95, 'POLPA DE GRAVIOLA - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(96, 'POLPA DE MANGA - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(97, 'POLPA DE MARACUJA - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(98, 'POLPA DE MORANGO - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(99, 'QUEIJO BRANCO - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(100, 'QUEIJO MUSSARELA PECA - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(101, 'REQUEIJAO CREMOSO 400 G - PT', 'PT', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(102, 'REQUEIJAO LIGHT 180 G - PT', 'PT', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(103, 'REQUEIJAO ZERO LACTOSE 400 G - PT', 'PT', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(104, 'SALSICHA - KG', 'KG', 'Pereciveis', 1, '2025-09-18 15:00:46'),
(105, 'ACHOCOLATADO EM PO - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(106, 'ACHOCOLATADO EM PO DIET 200 G - UN', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(107, 'ACHOCOLATADO EM PO ZERO LACTOSE - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(108, 'ACUCAR CRISTAL 5 KG - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(109, 'ADOCANTE SUCRALOSE 100 ML - UN', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(110, 'AMIDO DE MILHO 1 KG - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(111, 'ARROZ BRANCO - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(112, 'ARROZ INTEGRAL 1 KG - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(113, 'AZEITE EXTRA VIRGEM 500 ML- UN', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(114, 'BEBIDA LACTEA ACHOCOLATADO 200ML - UN', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(115, 'BISCOITO CREAM CRACKER - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(116, 'BISCOITO DE ARROZ INTEGRAL 120G - PCT', 'PCT', 'Base Seca', 1, '2025-09-18 15:01:36'),
(117, 'BISCOITO DE POLVILHO - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(118, 'BISCOITO DOCE INTEGRAL - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(119, 'BISCOITO MAISENA - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(120, 'BISCOITO SALGADO INTEGRAL - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(121, 'BISCOITO ZERO LACTOSE DOCE - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(122, 'BISCOITO ZERO LACTOSE SALGADO - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(123, 'CAFE EM PO 500 G - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(124, 'CANELA EM PO 30 G - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(125, 'CANJIQUINHA DE MILHO - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(126, 'COCO RALADO S/ ACUCAR - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(127, 'COLORAU EM PO 500 G - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(128, 'CREME DE LEITE 200G - UN', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(129, 'CREME DE LEITE S/ LACTOSE 200G - UN', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(130, 'CURAU DE MILHO - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(131, 'EXTRATO DE TOMATE - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(132, 'FARINHA DE AVEIA 170G - UN', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(133, 'FARINHA DE MANDIOCA 1 KG - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(134, 'FARINHA DE MILHO EM FLOCOS - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(135, 'FARINHA DE TAPIOCA 500 G - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(136, 'FARINHA DE TRIGO 1 KG - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(137, 'FARINHA DE TRIGO INTEGRAL 1 KG - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(138, 'FARINHA DE ARROZ SEM GLUTEN 1 KG - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(139, 'FEIJAO CARIOCA - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(140, 'FEIJAO PRETO 1 KG - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(141, 'FERMENTO BIOLOGICO - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(142, 'FERMENTO QUIMICO EM PO 200 G - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(143, 'FLOCOS DE MILHO S/ACUCAR - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(144, 'FUBA 1 KG - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(145, 'GELEIA DE FRUTAS - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(146, 'GELEIA DE FRUTAS DIET - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(147, 'LEITE DE COCO - LT', 'LT', 'Base Seca', 1, '2025-09-18 15:01:36'),
(148, 'LEITE DE SOJA - LT', 'LT', 'Base Seca', 1, '2025-09-18 15:01:36'),
(149, 'LEITE EM PO DESNATADO 200 G - PCT', 'PCT', 'Base Seca', 1, '2025-09-18 15:01:36'),
(150, 'LEITE EM PO INTEGRAL - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(151, 'LEITE EM PO ZERO LACTOSE 300 G - PCT', 'PCT', 'Base Seca', 1, '2025-09-18 15:01:36'),
(152, 'MACARRAO ESPAGUETE C/ SEMOLA - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(153, 'MACARRAO INTEGRAL ESPAGUETE 500 G - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(154, 'MILHO CANJICA 500 G - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(155, 'MILHO PIPOCA - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(156, 'MILHO VERDE EM CONSERVA 170G - UND', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(157, 'MILHO VERDE IN NATURA - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(158, 'OLEO DE GIRASSOL 900ML - UN', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(159, 'OLEO DE SOJA 900 ML - UND', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(160, 'OREGANO MOIDO 30 G - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(161, 'PROTEINA DE SOJA CLARA - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(162, 'ROSQUINHA DOCE - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(163, 'ROSQUINHA SALGADA - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(164, 'SAL REFINADO 1 KG - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(165, 'SUCO NECTAR - LT', 'LT', 'Base Seca', 1, '2025-09-18 15:01:36'),
(166, 'TRIGO PARA QUIBE 500 G - KG', 'KG', 'Base Seca', 1, '2025-09-18 15:01:36'),
(167, 'VINAGRE DE ALCOOL 750 ML - UND', 'UN', 'Base Seca', 1, '2025-09-18 15:01:36'),
(168, 'AGUA SANITARIA 1 LT - LT', 'LT', 'Limpeza', 1, '2025-09-18 15:02:47'),
(169, 'ALCOOL 1 LT - LT', 'LT', 'Limpeza', 1, '2025-09-18 15:02:47'),
(170, 'ALCOOL EM GEL 500ML - UN', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(171, 'BOBINA PLASTICA PICOTADA 40X60 - RL', 'RL', 'Limpeza', 1, '2025-09-18 15:02:47'),
(172, 'DESINCRUSTANTE CONCENTRADO 5 LT - LT', 'LT', 'Limpeza', 1, '2025-09-18 15:02:47'),
(173, 'DETERGENTE NEUTRO 500 ML - FR', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(174, 'ESCOVA PLASTICA P/ LIMPEZA', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(175, 'ESPONJA DUPLA FACE - UN', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(176, 'ESPONJA FIBRA 125 X 87 X 20 MM  - UN', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(177, 'FITA ADESIVA TRANSPARENTE 45MM X 100MT', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(178, 'FOSFORO 40 PALITOS - PC 10 CX', 'CX', 'Limpeza', 1, '2025-09-18 15:02:47'),
(179, 'GUARDANAPO 19.5 X 19.5 PCT 50 UND - PCT', 'PCT', 'Limpeza', 1, '2025-09-18 15:02:47'),
(180, 'LIMPA ALUMINIO - UN', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(181, 'LUVA DE BORRACHA - M', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(182, 'LUVA PLASTICA DESCARTAVEL PCT C/100', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(183, 'PANO DE CHAO - UN', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(184, 'PAPEL TOALHA INTERFOLHADO 1000 FLS - PCT', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(185, 'PULVERIZADOR DE PLASTICO - UN', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(186, 'RODINHO DE PIA - UN', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(187, 'RODO 40 CM - UN', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(188, 'SABONETE LIQUIDO NEUTRO - LT', 'LT', 'Limpeza', 1, '2025-09-18 15:02:47'),
(189, 'SACO DE AMOSTRA C/ 500 UN - PCT', 'PCT', 'Limpeza', 1, '2025-09-18 15:02:47'),
(190, 'SACO DE LIXO 100 LT C/100 UN - PCT', 'PCT', 'Limpeza', 1, '2025-09-18 15:02:47'),
(191, 'SACO DE LIXO 200LT C/ 100 UN - PCT', 'PCT', 'Limpeza', 1, '2025-09-18 15:02:47'),
(192, 'SACO P/ EMBALAR LANCHE - PCT', 'PCT', 'Limpeza', 1, '2025-09-18 15:02:47'),
(193, 'SACO PLASTICO CESTA BASICA 50X80 - PCT 100 UND', 'PCT', 'Limpeza', 1, '2025-09-18 15:02:47'),
(194, 'SANITIZANTE EM PO - UN', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(195, 'TOUCA DESCARTAVEL PCT C/100', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47'),
(196, 'VASSOURA DE NYLON C/ CABO - UN', 'UN', 'Limpeza', 1, '2025-09-18 15:02:47');

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos_per_capita`
--

CREATE TABLE `produtos_per_capita` (
  `id` int NOT NULL,
  `produto_id` int NOT NULL,
  `per_capita_lanche_manha` decimal(10,3) DEFAULT '0.000',
  `per_capita_almoco` decimal(10,3) DEFAULT '0.000',
  `per_capita_lanche_tarde` decimal(10,3) DEFAULT '0.000',
  `per_capita_parcial` decimal(10,3) DEFAULT '0.000',
  `per_capita_eja` decimal(10,3) DEFAULT '0.000',
  `ativo` tinyint(1) DEFAULT '1',
  `observacoes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `rotas_nutricionistas`
--

CREATE TABLE `rotas_nutricionistas` (
  `id` int NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'CÃ³digo Ãºnico identificador da rota nutricionista',
  `usuario_id` int NOT NULL COMMENT 'ID do usuÃ¡rio nutricionista responsÃ¡vel pela rota',
  `supervisor_id` int NOT NULL COMMENT 'ID do supervisor que gerencia a rota',
  `coordenador_id` int NOT NULL COMMENT 'ID do coordenador responsÃ¡vel pela Ã¡rea',
  `escolas_responsaveis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT 'IDs das escolas responsÃ¡veis separados por vÃ­rgula (ex: 1,5,12)',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'ativo' COMMENT 'Status atual da rota nutricionista',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT 'ObservaÃ§Ãµes adicionais sobre a rota',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criaÃ§Ã£o do registro',
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data e hora da Ãºltima atualizaÃ§Ã£o'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela para gerenciar rotas nutricionistas';

-- --------------------------------------------------------

--
-- Estrutura para tabela `unidades_escolares`
--

CREATE TABLE `unidades_escolares` (
  `id` int NOT NULL,
  `codigo_teknisa` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unidade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cidade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pais` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nome_escola` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `endereco` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bairro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cep` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supervisao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coordenacao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `centro_distribuicao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rota` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `regional` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lote` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cc_senior` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_senior` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `abastecimento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ordem_entrega` int DEFAULT NULL,
  `atendimento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `horario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_nutricionista` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `data_cadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `unidades_escolares`
--

INSERT INTO `unidades_escolares` (`id`, `codigo_teknisa`, `unidade`, `cidade`, `estado`, `pais`, `nome_escola`, `endereco`, `numero`, `bairro`, `cep`, `supervisao`, `coordenacao`, `centro_distribuicao`, `rota`, `regional`, `lote`, `cc_senior`, `codigo_senior`, `abastecimento`, `lat`, `lng`, `status`, `ordem_entrega`, `atendimento`, `horario`, `email_nutricionista`, `ativo`, `data_cadastro`, `data_atualizacao`) VALUES
(1, '1001', 'EEEFM SILVIO ROCIO', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM SILVIO ROCIO', 'RUA TEREZINHA', 'S/N', 'SAO TORQUATO', '29114-002', 'JOSIANE', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 1, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota4.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(2, '1071', 'EEEFM DR FRANCISCO FREITAS LIM', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM DR FRANCISCO FREITAS LIMA', 'RUA ANTONIO ABRAAO', 'S/N', 'ILHA DAS FLORES', '29115-550', 'JOSIANE', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 2, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota4.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(3, '1066', 'EEEFM ADOLFINA ZAMPROGNO', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM ADOLFINA ZAMPROGNO', 'RUA SEBASTIAO GAIBA', 'S/N', 'VILA GARRIDO', '29116-300', 'JOSIANE', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 3, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota4.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(4, '1067', 'CEEFMTI ASSISOLINA ASSIS ANDRA', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'CEEFMTI ASSISOLINA ASSIS ANDRADE', 'RUA SALVADOR', 'S/N', 'ARIBIRI', '29120-020', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 4, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(5, '1070', 'EEEFM LUIZ MANOEL VELLOZO', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM LUIZ MANOEL VELLOZO', 'RUA MOURISCO', 'S/N', 'GLORIA', '29122-070', 'JOSIANE', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 5, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota4.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(6, '1068', 'EEEM GODOFREDO SCHNEIDER', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEM GODOFREDO SCHNEIDER', 'RUA BERNARDO SCHINEIDER', 'S/N', 'CENTRO', '29100-170', 'JOSIANE', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 6, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota4.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(7, '1059', 'EEEFM AGENOR DE SOUZA LE', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM AGENOR DE SOUZA LE', 'RUA ALAN KARDEC', 'S/N', 'DIVINO ESPIRITO\n SANTO', '29107-240', 'JOSIANE', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 7, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota4.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(8, '1060', 'EEEFM PROF GERALDO COSTA ALVES', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM PROF GERALDO COSTA ALVES', 'RUA RUBEM BRAGA', 'S/N', 'BOA VISTA I', '29102-640', 'JOSIANE', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 8, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota4.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(9, '1054', 'EEEFM FLORENTINO AVIDOS', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM FLORENTINO AVIDOS', 'AVENIDA VITORIA REGIA', 'S/N', 'SANTA INES', '29108-055', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 9, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(10, '1065', 'CEEFTI GALDINO ANTONIO VIEIRA', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'CEEFTI GALDINO ANTONIO VIEIRA', 'RUA PAULO NEVES', 'S/N', 'SANTA RITA', '29118-590', 'JOSIANE', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 10, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota4.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(11, '1073', 'CEEFMTI PASTOR OLIVEIRA', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'CEEFMTI PASTOR OLIVEIRA', 'AV OTÁVIO BORIN', 'S/N', 'COBILANDIA', '29111-205', 'JOSIANE', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 11, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota4.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(12, '1069', 'EEEM ORMANDA GONCALVES', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEM ORMANDA GONCALVES', 'RUA THADEU RAUTA', 'S/N', 'COBILANDIA', '29111-065', 'JOSIANE', 'BIANKA', 'VILA VELHA', 'ROTA 01 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 12, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota4.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(13, '1063', 'EEEFM JUDITH DA SILVA GOES COU', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM JUDITH DA SILVA GOES COUTINHO', 'AVENIDA JUDITH GOES COUTINHO', 'S/N', 'PONTA DA FRUTA', '29129-030', 'FLAVIA', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 1, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota5.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(14, '1062', 'EEEFM TERRA VERMELHA', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM TERRA VERMELHA', 'RUA E', 'S/N', 'TERRA VERMELHA', '29100-010', 'FLAVIA', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 2, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota5.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(15, '1061', 'EEEM MARIO GURGEL', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEM MARIO GURGEL', 'AVENIDA MARROCOS', 'S/N', 'JABAETE', '29126-747', 'FLAVIA', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 3, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota5.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(16, '1064', 'EEEFM MARCILIO DIAS', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM MARCILIO DIAS', 'RUA JOAO COUTINHO', 'S/N', 'BARRA DO JUCU', '29125-030', 'FLAVIA', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 4, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota5.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(17, '1057', 'EEEF FRANCELINA CARNEIRO SETUB', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEF FRANCELINA CARNEIRO SETUBAL', 'AVENIDA LEOPOLDINA', 'S/N', 'COQUEIRAL DE ITAPARICA', '29102-375', 'FLAVIA', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 5, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota5.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(18, '1055', 'EEEM PROFESSOR AGENOR RORIS', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEM PROFESSOR AGENOR RORIS', 'AVENIDA JOAO MENDES', 'S/N', 'ITAPARICA', '29105-200', 'FLAVIA', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 6, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota5.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(19, '1058', 'CEEFMTI PROF MAURA ABAURRE', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'CEEFMTI PROF MAURA ABAURRE', 'RUA ONZE', '100', 'VILA NOVA', '29105-110', 'FLAVIA', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 7, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota5.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(20, '1056', 'EEEFM CATHARINA CHEQUER', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM CATHARINA CHEQUER', 'RUA ALECRIM', '100', 'NOVO MEXICO', '29104-100', 'FLAVIA', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 8, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota5.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(21, '1053', 'EEEFM BENICIO GONCALVES', 'VILA VELHA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM BENICIO GONCALVES', 'AVENIDA GABRIEL DA PALHA', 'S/N', 'VALE ENCANTADO', '29113-300', 'FLAVIA', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 9, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota5.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(22, '1077', 'EEEFM MARIA DE NOVAES PINHEIRO', 'VIANA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM MARIA DE NOVAES PINHEIRO', 'RUA SANTA HELENA', '125', 'VILA BETHANIA', '29130-010', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 10, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(23, '1076', 'EEEM IRMA DULCE LOPES PONTE', 'VIANA', 'ESPIRITO SANTO', 'BRASIL', 'EEEM IRMA DULCE LOPES PONTE', 'RUA ESPIRITO SANTO', 'S/N', 'MARCILIO DE NORONHA', '29130-010', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 11, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(24, '1074', 'EEEM AUGUSTO RUSCHI', 'VIANA', 'ESPIRITO SANTO', 'BRASIL', 'EEEM AUGUSTO RUSCHI', 'RUA GOIAS', 'S/N', 'UNIVERSAL', '29130-010', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 02 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 12, 'NOTURNO', '16:00 as 21:00', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(25, '1081', 'EEEFM PROF FILOMENA QUITIBA', 'PIUMA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM PROF FILOMENA QUITIBA', 'RUA MIMOSO DO SUL', '884', 'CENTRO', '29285-000', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 1, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(26, '1080', 'EEEFM CORONEL GOMES DE OLIVEIR', 'ANCHIETA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM CORONEL GOMES DE OLIVEIRA', 'ESTRADA DE RODAGEM ESTADUAL ANCHIETA X JABAQUARA', '1078', 'NOVA ESPERRANÇA', '29230-000', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 2, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(27, '1079', 'CEEMTI PAULO FREIRE (ANCHIETA)', 'ANCHIETA', 'ESPIRITO SANTO', 'BRASIL', 'CEEMTI PAULO FREIRE (ANCHIETA)', 'AVENIDA MARIANA DAMAZIO FLORES', '701', 'ANCHIETA', '29230-000', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 3, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(28, '1010', 'EEEF MANOEL ROSINDO DA SILVA', 'GUARAPARI', 'ESPIRITO SANTO', 'BRASIL', 'EEEF MANOEL ROSINDO DA SILVA', 'AVENIDA SANTANA', NULL, 'MEAIPE', '29208-180', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 4, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(29, '1009', 'EEEFM LYRA RIBEIRO SANTOS', 'GUARAPARI', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM LYRA RIBEIRO SANTOS', 'RUA WALTRUDES ALVES ROSA', NULL, 'KUBITSCHEK', '29203-150', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 5, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(30, '1008', 'EEEFM ZENOBIA LEAO', 'GUARAPARI', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM ZENOBIA LEAO', 'RUA FERNANDO DE ABREU', '417', 'SAO JUDAS TADEU', '29200-490', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 6, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(31, '1007', 'EEEM GUARAPARI', 'GUARAPARI', 'ESPIRITO SANTO', 'BRASIL', 'EEEM GUARAPARI', 'RUA JOAQUIM DA SILVA LIMA', '58', 'CENTRO', '29200-260', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 7, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(32, '1006', 'EEEFM ZULEIMA FORTES FARIA', 'GUARAPARI', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM ZULEIMA FORTES FARIA', 'AVENIDA ANTONIO GUIMARAES', '100', 'ITAPEBUSSU', '29210-190', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 8, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(33, '1005', 'EEEFM ANGELICA PAIXAO', 'GUARAPARI', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM ANGELICA PAIXAO', 'RUA PROJETADA', NULL, 'ITAPEBUSSU', '29210-210', 'FLAVIA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 9, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota5.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(34, '1004', 'EEEM DR SILVA MELLO', 'GUARAPARI', 'ESPIRITO SANTO', 'BRASIL', 'EEEM DR SILVA MELLO', 'RUA HORACIO SANTANA', '155', 'PARQUE DA AREIA\n PRETA', '29200-750', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 10, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(35, '1003', 'EEEFM LEANDRO ESCOBAR', 'GUARAPARI', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM LEANDRO ESCOBAR', 'RUA CAMPO BELO', NULL, 'SANTA ROSA', '29220-525', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 11, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(36, '1002', 'EEEFM RIO CLARO', 'GUARAPARI', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM RIO CLARO', 'RUA RIO CLARO', NULL, 'ZONA RURAL', '29200-010', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 03 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 12, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(37, '1078', 'EEEFM NELSON VIEIRA PIMENTEL', 'VIANA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM NELSON VIEIRA PIMENTEL', 'RUA DOUTOR OLIVAL PIMENTEL', '124', 'CENTRO', '29130-145', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 04 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 1, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(38, '1020', 'EEEFM TEOFILO PAULINO', 'DOMINGOS MARTINS', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM TEOFILO PAULINO', 'ALAMEDA DOS PINHAIS', 'S/N', 'CENTRO', '29260-000', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 04 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 2, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(39, '1021', 'EEEFM EMILIO OSCAR HULLE', 'MARECHAL FLORIANO', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM EMILIO OSCAR HULLE', 'RUA COLINA DA FE E DA CIENCIA', '0', 'CENTRO', '29255-000', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 04 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 3, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(40, '1023', 'EEEFM DE PONTO DO ALTO', 'DOMINGOS MARTINS', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM DE PONTO DO ALTO', 'RUA REINOLDO KIEFER', '92', 'PONTO ALTO', '29273-993', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 04 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 4, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(41, '1022', 'EEEFM GISELA SALLOKER FAYET', 'DOMINGOS MARTINS', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM GISELA SALLOKER FAYET', 'ESTRADA PRINCIPAL', '35', 'PARAJU', '29273-000', 'IVINY', 'BIANKA', 'VILA VELHA', 'ROTA 04 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 5, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota6.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(42, '1025', 'EEEFM VICTORIO BRAVIM', 'MARECHAL FLORIANO', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM VICTORIO BRAVIM', 'RUA PROJETADA', 'S/N', 'ARAGUAIA', '29258-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 04 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 6, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(43, '1026', 'EEEFM CAMILA MOTTA (ANEXO FELI', 'ALFREDO CHAVES', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM CAMILA MOTTA (ANEXO FELIPE MODULO)', 'ES-383, RUA JOSE MARIA CAMILETTI', 'S/N', 'MATILDE', '29240-000', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 04 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 7, 'NOTURNO', '16:00 as 21:00', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(44, '1027', 'EEEFM CAMILA MOTTA', 'ALFREDO CHAVES', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM CAMILA MOTTA', 'RUA NELSON DA COSTA MELLO', '197', 'OURO BRANCO', '29240-000', 'RAYSSA', 'BIANKA', 'VILA VELHA', 'ROTA 04 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 8, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota7.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(45, '1051', 'EEEM FRANCISCO GUILHERME', 'SANTA MARIA DE JETIBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEM FRANCISCO GUILHERME', 'AVENIDA JOÃO PEDRO LAUVERS', 'S/N', 'GARRAFAO', '29645-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 1, 'VESPERTINO', '12:00 as 17:00', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(46, '1052', 'EEEM MATA FRIA', 'AFONSO CLAUDIO', 'ESPIRITO SANTO', 'BRASIL', 'EEEM MATA FRIA', 'CORREGO FRANCISCO CORREA', 'S/N', 'MATA FRIA', '29600-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 2, 'NOTURNO', '16:00 as 21:00', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(47, '1050', 'EEEFM ALTO RIO POSSMOSER', 'SANTA MARIA DE JETIBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM ALTO RIO POSSMOSER', 'AVENIDA GERMANO MARQUARDT', 'S/N', 'ALTO RIO POSSMOSER', '29645-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 3, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(48, '1049', 'EEEFM FAZENDA EMILIO S (ANEXO)', 'SANTA MARIA DE JETIBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM FAZENDA EMILIO SCHROEDER (ANEXO)', 'ALTO ALTO SANTA MARIA', 'S/N', 'ZONA RURAL', '29645-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 4, 'MATUTINO', '7:00 as 12:00', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(49, '1048', 'EEEFM FAZENDA EMILIO SCHROEDER', 'SANTA MARIA DE JETIBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM FAZENDA EMILIO SCHROEDER', 'ALTO ALTO SANTA MARIA', 'S/N', 'ZONA RURAL', '29645-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 5, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(50, '1047', 'EEEFM GRACA ARANHA', 'SANTA MARIA DE JETIBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM GRACA ARANHA', 'RUA HERMANN ROELKE', '131', 'CENTRO', '29645-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 6, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(51, '1046', 'EEEFM SAO LUIS', 'SANTA MARIA DE JETIBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM SAO LUIS', 'RUA HENRIQUE JJ KUSTER', '355', 'SAO LUIS', '29645-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 7, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(52, '1045', 'EEEFM PROF HERMANN BERGER', 'SANTA MARIA DE JETIBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM PROF HERMANN BERGER', 'RODOVIA DR AFONSO SCHWAB KM5', 'S/N', 'SAO SEBASTIAO DE\n BELEM', '29645-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 8, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(53, '1044', 'EEEFM FREDERICO BOLDT', 'SANTA MARIA DE JETIBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM FREDERICO BOLDT', 'RUA ARTHUR LEMKE', 'S/N', 'CARAMURU', '29645-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 9, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(54, '1011', 'EEEFM ALTO JATIBOCAS', 'ITARANA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM ALTO JATIBOCAS', 'ALTO JATIBÓCAS', 'S/N', 'ALTO JATIBOCAS', '29620-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 10, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(55, '1013', 'EEEFM PROF ALEYDE COSME', 'ITARANA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM PROF ALEYDE COSME', 'RUA VALENTIN DE MARTIN', '303', 'CENTRO', '29620-000', 'SOLINEIA', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 11, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota2.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(56, '1017', 'EEEFM EURICO SALLES', 'ITAGUACU', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM EURICO SALLES', 'AVENIDA 17 DE FEVEREIRO', '160', 'CENTRO', '29690-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 12, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(57, '1018', 'EEEFM FABIANO FRANCISCO TOMASI', 'ITAGUACU', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM FABIANO FRANCISCO TOMASINI', 'ESTRADA ALTO LAGE', 'S/N', 'ZONA RURAL', '29690-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 13, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(58, '1019', 'EEEFM ALFREDO LEMOS', 'ITAGUACU', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM ALFREDO LEMOS', 'RUA MALVINA PASSAMANI', 'S/N', 'ITAIMBE', '29690-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 14, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(59, '1014', 'EEEFM JOAQUIM CAETANO DE PAIVA', 'LARANJA DA TERRA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM JOAQUIM CAETANO DE PAIVA', 'RUA GUILHERME PIZZAIA', 'S/N', 'JOATUBA', '29615-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 15, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(60, '1015', 'EEEFM LUIZ JOUFFROY', 'LARANJA DA TERRA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM LUIZ JOUFFROY', 'AVENIDA CARLOS PALACIO', '264', 'CENTRO', '29615-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 16, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(61, '1016', 'EEEM SOBREIRO', 'LARANJA DA TERRA', 'ESPIRITO SANTO', 'BRASIL', 'EEEM SOBREIRO', 'RUA PRINCIPAL', 'S/N', 'SOBREIRO', '29615-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 05 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 17, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(62, '1024', 'EEEFM PEDRA AZUL (PEDREIRAS)', 'DOMINGOS MARTINS', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM PEDRA AZUL (PEDREIRAS)', 'RUA PETERLE', 'S/N', 'PEDRA AZUL', '29278-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 1, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(63, '1034', 'EEEF DOMINGOS PERIM', 'VENDA NOVA DO IMIGRANTE', 'ESPIRITO SANTO', 'BRASIL', 'EEEF DOMINGOS PERIM', 'RUA LA VILLE', '134', 'TRINTA DE DEZEMBRO', '29375-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 2, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(64, '1035', 'EEEFM FIORAVANTE CALIMAN', 'VENDA NOVA DO IMIGRANTE', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM FIORAVANTE CALIMAN', 'AVENIDA EVANDI AMERICO\n COMARELA', '675', 'CENTRO', '29375-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 3, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(65, '1028', 'EEEFM JOSE GIESTAS', 'AFONSO CLAUDIO', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM JOSE GIESTAS', 'RUA WERNER RUCHDESCHEL', '227', 'VILA PONTOES', '29604-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 4, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(66, '1029', 'EEEFM MARIA DE ABREU ALVIM', 'AFONSO CLAUDIO', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM MARIA DE ABREU ALVIM', 'RUA ANTONIETA SOUZA LIMA', 'S/N', 'FAZENDA GUANDU', '29609-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 5, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(67, '1030', 'EEEFM JOSE ROBERTO CHRISTO', 'AFONSO CLAUDIO', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM JOSE ROBERTO CHRISTO', 'RUA ALIPIO VIEIRA DA CUNHA', '307', 'PIRACEMA', '29600-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 6, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(68, '1031', 'EEEFM JOSE CUPERTINO', 'AFONSO CLAUDIO', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM JOSE CUPERTINO', 'RUA UTE AMELIA GASTIN PADUA', '49', 'SÃO TARCISIO', '29600-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 7, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(69, '1032', 'CEEMTI AFONSO CLAUDIO', 'AFONSO CLAUDIO', 'ESPIRITO SANTO', 'BRASIL', 'CEEMTI AFONSO CLAUDIO', 'RUA UTE AMELIA GASTIN PADUA', '50/124', 'SAO TARCISIO', '29600-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 8, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(70, '1033', 'EEEFM ELVIRA BARROS', 'AFONSO CLAUDIO', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM ELVIRA BARROS', 'AVENIDA LEVY DIAS DE CARVALHO', '200', 'SERRA PELADA', '29603-000', 'BEATRIZ', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 9, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota3.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(71, '1040', 'EEEFM SAO JORGE', 'BREJETUBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM SAO JORGE', 'RUA NEPHTALY ANTONIO\n CAETANO', '160', 'SAO JORGE DE OLIVEIRA', '29635-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 10, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(72, '1041', 'EEEFM LEOGILDO SEVERIANO DE SO', 'BREJETUBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM LEOGILDO SEVERIANO DE SOUZA', 'FAZENDA LEOGILDO', 'S/N', 'ZONA RURAL', '29630-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 11, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(73, '1039', 'EEEFM ALVARO CASTELO', 'BREJETUBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM ALVARO CASTELO', 'RUA PRAÇA 15 DE DEZEMBRO', '100', 'BELARMINO ULIANA', '29630-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 12, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(74, '1038', 'EEEFM MARLENE BRANDAO', 'BREJETUBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM MARLENE BRANDAO', 'ESTRADA DE BREJAUBINHA', '120', 'ZONA RURAL', '29630-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 13, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(75, '1037', 'EEEFM FAZENDA CAMPORES', 'BREJETUBA', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM FAZENDA CAMPORES', 'VILA RANCHO DANTAS', 'S/N', 'ZONA RURAL', '29630-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 14, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(76, '1043', 'EEEFM PROF ALDY SOARES MERCON', 'CONCEICAO DO CASTELO', 'ESPIRITO SANTO', 'BRASIL', 'EEEFM PROF ALDY SOARES MERCON VARGAS', 'PRACA DA MATRIZ', '9', 'CENTRO', '29370-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 15, 'MAT / VESP / NOTURNO', '07:00 as 21:00', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23'),
(77, '1042', 'CEEFMTI ELISA PAIVA', 'CONCEICAO DO CASTELO', 'ESPIRITO SANTO', 'BRASIL', 'CEEFMTI ELISA PAIVA', 'AVENIDA JOSE GRILO', '348', 'CENTRO', '29370-000', 'KAROLLINE', 'BIANKA', 'VILA VELHA', 'ROTA 06 VVL', NULL, 'LOTE 02', '288', NULL, 'SEMANAL', NULL, NULL, 'ATIVA', 16, 'MATUTINO / VESPERTINO', '07:00 as 16:48', 'rota1.lote2es@gmail.com', 1, '2025-09-17 22:28:23', '2025-09-17 22:28:23');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

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
