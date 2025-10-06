-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Tempo de geração: 04/09/2025 às 17:38
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
-- Banco de dados: `foods_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `ajudantes`
--

CREATE TABLE `ajudantes` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cpf` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `endereco` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('ativo','inativo','ferias','licenca') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `data_admissao` date DEFAULT NULL,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `filial_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `almoxarifados`
--

CREATE TABLE `almoxarifados` (
  `id` int NOT NULL,
  `filial_id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `almoxarifados`
--

INSERT INTO `almoxarifados` (`id`, `filial_id`, `nome`, `status`, `criado_em`, `atualizado_em`) VALUES
(2, 2, 'CD TOLEDO', 1, '2025-07-23 19:32:29', '2025-07-23 19:32:29'),
(3, 2, 'COZINHA TOLEDO', 1, '2025-07-23 19:32:38', '2025-07-23 19:32:38'),
(4, 1, 'TESTE', 1, '2025-08-28 15:08:10', '2025-08-28 15:08:10');

-- --------------------------------------------------------

--
-- Estrutura para tabela `almoxarifado_itens`
--

CREATE TABLE `almoxarifado_itens` (
  `id` int NOT NULL,
  `almoxarifado_id` int NOT NULL,
  `produto_id` int NOT NULL,
  `quantidade` decimal(12,3) NOT NULL DEFAULT '0.000',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `almoxarifado_unidades_escolares`
--

CREATE TABLE `almoxarifado_unidades_escolares` (
  `id` int NOT NULL,
  `unidade_escolar_id` int NOT NULL,
  `nome` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do almoxarifado (geralmente igual ao nome da escola)',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Ativo, 0=Inativo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `almoxarifado_unidades_escolares`
--

INSERT INTO `almoxarifado_unidades_escolares` (`id`, `unidade_escolar_id`, `nome`, `status`, `created_at`, `updated_at`) VALUES
(2, 17, 'CEJA CANOINHAS', 1, '2025-09-02 17:07:18', '2025-09-02 17:07:18');

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
(741, 4, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 15:26:09'),
(742, 4, 'editar', 'rotas-nutricionistas', '{\"codigo\": \"ROTA-CAN-002\", \"status\": \"ativo\", \"resourceId\": \"7\", \"usuario_id\": \"17\", \"observacoes\": \"Rota nutricionista para escolas do centro de Canoinhas - SC\", \"supervisor_id\": 18, \"coordenador_id\": 5, \"escolas_responsaveis\": \"\"}', NULL, '2025-09-04 15:26:17'),
(743, 4, 'update', 'rotas-nutricionistas', '{\"url\": \"/foods/api/rotas-nutricionistas/7\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"7\", \"statusCode\": 200, \"requestBody\": {\"id\": 7, \"codigo\": \"ROTA-CAN-002\", \"status\": \"ativo\", \"criado_em\": \"2025-09-04 15:26:06\", \"usuario_id\": \"17\", \"observacoes\": \"Rota nutricionista para escolas do centro de Canoinhas - SC\", \"usuario_nome\": \"Leonardo Ferreira\", \"atualizado_em\": \"2025-09-04 15:26:06\", \"supervisor_id\": 18, \"usuario_email\": \"leonardo.ferreira@terceirizemais.com.br\", \"coordenador_id\": 5, \"supervisor_nome\": \"Carline Sisti\", \"coordenador_nome\": \"Arlindo Borges\", \"supervisor_email\": \"carline.sisti@terceirizemais.com.br\", \"coordenador_email\": \"arlindo.borges@terceirizemais.com.br\", \"escolas_responsaveis\": \"\"}}', '187.45.102.250', '2025-09-04 15:26:17'),
(744, 4, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 15:26:17'),
(745, 4, 'editar', 'rotas-nutricionistas', '{\"codigo\": \"ROTA-CAN-003\", \"status\": \"ativo\", \"resourceId\": \"8\", \"usuario_id\": \"17\", \"observacoes\": \"Rota nutricionista para escolas do centro histórico de Canoinhas - SC\", \"supervisor_id\": 18, \"coordenador_id\": 5, \"escolas_responsaveis\": \"\"}', NULL, '2025-09-04 15:26:22'),
(746, 4, 'update', 'rotas-nutricionistas', '{\"url\": \"/foods/api/rotas-nutricionistas/8\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"8\", \"statusCode\": 200, \"requestBody\": {\"id\": 8, \"codigo\": \"ROTA-CAN-003\", \"status\": \"ativo\", \"criado_em\": \"2025-09-04 15:26:06\", \"usuario_id\": \"17\", \"observacoes\": \"Rota nutricionista para escolas do centro histórico de Canoinhas - SC\", \"usuario_nome\": \"Marcos Vinicius\", \"atualizado_em\": \"2025-09-04 15:26:06\", \"supervisor_id\": 18, \"usuario_email\": \"marcos.vinicius@tercerizemais.com.br\", \"coordenador_id\": 5, \"supervisor_nome\": \"Carline Sisti\", \"coordenador_nome\": \"Arlindo Borges\", \"supervisor_email\": \"carline.sisti@terceirizemais.com.br\", \"coordenador_email\": \"arlindo.borges@terceirizemais.com.br\", \"escolas_responsaveis\": \"\"}}', '187.45.102.250', '2025-09-04 15:26:22'),
(747, 4, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 15:26:22'),
(748, 4, 'editar', 'rotas-nutricionistas', '{\"codigo\": \"ROTA-CAN-005\", \"status\": \"ativo\", \"resourceId\": \"10\", \"usuario_id\": \"17\", \"observacoes\": \"Rota nutricionista para escolas rurais de Major Vieira - SC\", \"supervisor_id\": 18, \"coordenador_id\": 5, \"escolas_responsaveis\": \"\"}', NULL, '2025-09-04 15:26:25'),
(749, 4, 'update', 'rotas-nutricionistas', '{\"url\": \"/foods/api/rotas-nutricionistas/10\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"10\", \"statusCode\": 200, \"requestBody\": {\"id\": 10, \"codigo\": \"ROTA-CAN-005\", \"status\": \"ativo\", \"criado_em\": \"2025-09-04 15:26:06\", \"usuario_id\": \"17\", \"observacoes\": \"Rota nutricionista para escolas rurais de Major Vieira - SC\", \"usuario_nome\": \"Leonardo Ferreira\", \"atualizado_em\": \"2025-09-04 15:26:06\", \"supervisor_id\": 18, \"usuario_email\": \"leonardo.ferreira@terceirizemais.com.br\", \"coordenador_id\": 5, \"supervisor_nome\": \"Carline Sisti\", \"coordenador_nome\": \"Arlindo Borges\", \"supervisor_email\": \"carline.sisti@terceirizemais.com.br\", \"coordenador_email\": \"arlindo.borges@terceirizemais.com.br\", \"escolas_responsaveis\": \"\"}}', '187.45.102.250', '2025-09-04 15:26:25'),
(750, 4, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 15:26:25'),
(751, 4, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 15:26:37'),
(752, 4, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 15:27:19'),
(753, 4, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 16:09:50'),
(754, 4, 'editar', 'rotas-nutricionistas', '{\"codigo\": \"ROTA-CAN-001\", \"status\": \"ativo\", \"resourceId\": \"6\", \"usuario_id\": 17, \"observacoes\": \"Rota nutricionista para escolas da região de Major Vieira - SC\", \"supervisor_id\": 18, \"coordenador_id\": 5, \"escolas_responsaveis\": \"17,63,98,30,48\"}', NULL, '2025-09-04 16:10:16'),
(755, 4, 'update', 'rotas-nutricionistas', '{\"url\": \"/foods/api/rotas-nutricionistas/6\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"6\", \"statusCode\": 200, \"requestBody\": {\"id\": 6, \"codigo\": \"ROTA-CAN-001\", \"status\": \"ativo\", \"criado_em\": \"2025-09-04 15:26:06\", \"usuario_id\": 17, \"observacoes\": \"Rota nutricionista para escolas da região de Major Vieira - SC\", \"usuario_nome\": \"Maria Eudarda\", \"atualizado_em\": \"2025-09-04 15:26:06\", \"supervisor_id\": 18, \"usuario_email\": \"maria.eduarda@tericeirzemais.com.br\", \"coordenador_id\": 5, \"supervisor_nome\": \"Carline Sisti\", \"coordenador_nome\": \"Arlindo Borges\", \"supervisor_email\": \"carline.sisti@terceirizemais.com.br\", \"coordenador_email\": \"arlindo.borges@terceirizemais.com.br\", \"escolas_responsaveis\": \"17,63,98,30,48\"}}', '187.45.102.250', '2025-09-04 16:10:16'),
(756, 4, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 16:10:16'),
(757, 4, 'login', 'auth', '{\"email\": \"luiz.nicolao@terceirizemais.com.br\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"rememberMe\": false, \"tokenExpiration\": \"24h\"}', '187.45.102.250', '2025-09-04 16:12:06'),
(758, 4, 'login', 'auth', '{\"email\": \"luiz.nicolao@terceirizemais.com.br\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"rememberMe\": false, \"tokenExpiration\": \"24h\"}', '187.45.102.250', '2025-09-04 16:13:41'),
(759, 4, 'create', 'usuarios', '{\"url\": \"/foods/api/usuarios\", \"method\": \"POST\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"statusCode\": 201, \"requestBody\": {\"nome\": \"Eduardo Piana\", \"email\": \"eduardo.piana@terceirizemais.com.br\", \"senha\": \"[REDACTED]\", \"status\": \"ativo\", \"filiais\": [3, 1], \"tipo_de_acesso\": \"administrativo\", \"nivel_de_acesso\": \"II\"}}', '187.45.102.250', '2025-09-04 16:17:48'),
(760, 4, 'update', 'permissoes', '{\"url\": \"/foods/api/permissoes/usuario/19\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"19\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"clientes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"produtos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"grupos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"subgrupos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"classes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"produto_origem\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"marcas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"veiculos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"motoristas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"ajudantes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"cotacao\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"produto_generico\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"intolerancias\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"efetivos\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"permissoes\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"patrimonios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 1, \"pode_visualizar\": 1}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '187.45.102.250', '2025-09-04 16:18:31'),
(761, 19, 'login', 'auth', '{\"email\": \"eduardo.piana@terceirizemais.com.br\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"rememberMe\": false, \"tokenExpiration\": \"24h\"}', '187.45.102.250', '2025-09-04 16:22:57'),
(762, 19, 'create', 'marcas', '{\"url\": \"/foods/api/marcas\", \"method\": \"POST\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"statusCode\": 201, \"requestBody\": {\"marca\": \"SPOLU\", \"status\": 1, \"fabricante\": \"SPOLU\"}}', '187.45.102.250', '2025-09-04 16:26:18'),
(763, 19, 'create', 'grupos', '{\"url\": \"/foods/api/grupos\", \"method\": \"POST\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"statusCode\": 201, \"requestBody\": {\"nome\": \"EQUIPAMENTO\", \"codigo\": null, \"status\": \"1\", \"descricao\": \"\"}}', '187.45.102.250', '2025-09-04 16:27:39'),
(764, 19, 'create', 'subgrupos', '{\"url\": \"/foods/api/subgrupos\", \"method\": \"POST\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"statusCode\": 201, \"requestBody\": {\"nome\": \"FREEZER\", \"codigo\": null, \"status\": \"ativo\", \"grupo_id\": 10, \"descricao\": \"\"}}', '187.45.102.250', '2025-09-04 16:27:53'),
(765, 19, 'update', 'subgrupos', '{\"url\": \"/foods/api/subgrupos/16\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"16\", \"statusCode\": 200, \"requestBody\": {\"nome\": \"FREEZER\", \"codigo\": null, \"status\": \"ativo\", \"grupo_id\": 10, \"descricao\": \"\"}}', '187.45.102.250', '2025-09-04 16:28:01'),
(766, 4, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 16:34:22'),
(767, 4, 'create', 'grupos', '{\"url\": \"/foods/api/grupos\", \"method\": \"POST\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"statusCode\": 201, \"requestBody\": {\"nome\": \"TESTE\", \"codigo\": null, \"status\": \"1\", \"descricao\": \"\"}}', '187.45.102.250', '2025-09-04 16:34:53'),
(768, 4, 'update', 'grupos', '{\"url\": \"/foods/api/grupos/12\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"12\", \"statusCode\": 200, \"requestBody\": {\"nome\": \"TESTE\", \"codigo\": null, \"status\": \"1\", \"descricao\": \"\"}}', '187.45.102.250', '2025-09-04 16:34:55'),
(769, 4, 'create', 'subgrupos', '{\"url\": \"/foods/api/subgrupos\", \"method\": \"POST\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"statusCode\": 201, \"requestBody\": {\"nome\": \"teste\", \"codigo\": null, \"status\": \"inativo\", \"grupo_id\": 12, \"descricao\": \"\"}}', '187.45.102.250', '2025-09-04 16:35:02'),
(770, 4, 'update', 'subgrupos', '{\"url\": \"/foods/api/subgrupos/17\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"17\", \"statusCode\": 200, \"requestBody\": {\"nome\": \"teste\", \"codigo\": null, \"status\": \"ativo\", \"grupo_id\": 12, \"descricao\": \"\"}}', '187.45.102.250', '2025-09-04 16:35:04'),
(771, 4, 'create', 'classes', '{\"url\": \"/foods/api/classes\", \"method\": \"POST\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"statusCode\": 201, \"requestBody\": {\"nome\": \"TESTE\", \"codigo\": null, \"status\": \"inativo\", \"descricao\": \"\", \"subgrupo_id\": 17}}', '187.45.102.250', '2025-09-04 16:35:10'),
(772, 4, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:05:18'),
(773, 4, 'update', 'permissoes', '{\"url\": \"/foods/api/permissoes/usuario/15\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"15\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"clientes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"produtos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"grupos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"subgrupos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"classes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"produto_origem\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"marcas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"veiculos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"motoristas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"ajudantes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"cotacao\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"produto_generico\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"intolerancias\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"efetivos\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"permissoes\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"patrimonios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '187.45.102.250', '2025-09-04 17:18:30'),
(774, 4, 'update', 'permissoes', '{\"url\": \"/foods/api/permissoes/usuario/15\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"15\", \"statusCode\": 200, \"requestBody\": {\"permissoes\": [{\"tela\": \"usuarios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"fornecedores\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"clientes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"filiais\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"rotas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"produtos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"grupos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"subgrupos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"classes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"produto_origem\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"unidades_escolares\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"marcas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"veiculos\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"motoristas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"ajudantes\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"cotacao\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"produto_generico\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"intolerancias\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}, {\"tela\": \"efetivos\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"permissoes\", \"pode_criar\": 0, \"pode_editar\": 0, \"pode_excluir\": 0, \"pode_movimentar\": 0, \"pode_visualizar\": 0}, {\"tela\": \"patrimonios\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 1, \"pode_visualizar\": 1}, {\"tela\": \"rotas_nutricionistas\", \"pode_criar\": 1, \"pode_editar\": 1, \"pode_excluir\": 1, \"pode_movimentar\": 0, \"pode_visualizar\": 1}]}}', '187.45.102.250', '2025-09-04 17:19:18'),
(775, 15, 'login', 'auth', '{\"email\": \"natanael@terceirizemais.combr\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"rememberMe\": true, \"tokenExpiration\": \"30d\"}', '186.227.148.185', '2025-09-04 17:19:52'),
(776, 15, 'login', 'auth', '{\"email\": \"natanael@terceirizemais.combr\", \"userAgent\": \"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"rememberMe\": false, \"tokenExpiration\": \"24h\"}', '187.45.102.250', '2025-09-04 17:20:49'),
(777, 15, 'login', 'auth', '{\"email\": \"natanael@terceirizemais.combr\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"rememberMe\": true, \"tokenExpiration\": \"30d\"}', '186.227.148.185', '2025-09-04 17:21:18'),
(778, 15, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:21:32'),
(779, 15, 'criar', 'rotas-nutricionistas', '{\"codigo\": \"01\", \"status\": \"ativo\", \"resourceId\": 11, \"usuario_id\": \"17\", \"observacoes\": \"\", \"supervisor_id\": \"18\", \"coordenador_id\": \"5\", \"escolas_responsaveis\": \"17,63\"}', NULL, '2025-09-04 17:22:52'),
(780, 15, 'create', 'rotas-nutricionistas', '{\"url\": \"/foods/api/rotas-nutricionistas\", \"method\": \"POST\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"statusCode\": 201, \"requestBody\": {\"codigo\": \"01\", \"status\": \"ativo\", \"usuario_id\": \"17\", \"observacoes\": \"\", \"supervisor_id\": \"18\", \"coordenador_id\": \"5\", \"escolas_responsaveis\": \"17,63\"}}', '186.227.148.185', '2025-09-04 17:22:52'),
(781, 15, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:22:52'),
(782, 15, 'editar', 'rotas-nutricionistas', '{\"codigo\": \"01\", \"status\": \"ativo\", \"resourceId\": \"11\", \"usuario_id\": 17, \"observacoes\": \"\", \"supervisor_id\": 18, \"coordenador_id\": 5, \"escolas_responsaveis\": \"17,63,76\"}', NULL, '2025-09-04 17:23:10'),
(783, 15, 'update', 'rotas-nutricionistas', '{\"url\": \"/foods/api/rotas-nutricionistas/11\", \"method\": \"PUT\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"11\", \"statusCode\": 200, \"requestBody\": {\"id\": 11, \"codigo\": \"01\", \"status\": \"ativo\", \"criado_em\": \"2025-09-04 17:22:52\", \"usuario_id\": 17, \"observacoes\": \"\", \"usuario_nome\": \"Maria Eudarda\", \"atualizado_em\": \"2025-09-04 17:22:52\", \"supervisor_id\": 18, \"usuario_email\": \"maria.eduarda@tericeirzemais.com.br\", \"coordenador_id\": 5, \"supervisor_nome\": \"Carline Sisti\", \"coordenador_nome\": \"Arlindo Borges\", \"supervisor_email\": \"carline.sisti@terceirizemais.com.br\", \"coordenador_email\": \"arlindo.borges@terceirizemais.com.br\", \"escolas_responsaveis\": \"17,63,76\"}}', '186.227.148.185', '2025-09-04 17:23:10'),
(784, 15, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:23:10'),
(785, 15, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:24:21'),
(786, 15, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:24:56'),
(787, 15, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:25:10'),
(788, 15, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:25:22'),
(789, 15, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:25:26'),
(790, 15, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:29:14'),
(791, 15, 'excluir', 'rotas-nutricionistas', '{\"codigo\": \"01\", \"resourceId\": \"11\"}', NULL, '2025-09-04 17:29:18'),
(792, 15, 'delete', 'rotas-nutricionistas', '{\"url\": \"/foods/api/rotas-nutricionistas/11\", \"method\": \"DELETE\", \"userAgent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\", \"resourceId\": \"11\", \"statusCode\": 200}', '186.227.148.185', '2025-09-04 17:29:18'),
(793, 15, 'listar', 'rotas-nutricionistas', '{\"page\": 1, \"limit\": 10}', NULL, '2025-09-04 17:29:18');

-- --------------------------------------------------------

--
-- Estrutura para tabela `classes`
--

CREATE TABLE `classes` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome da classe (ex: BOVINO, SUÍNO, FRANGO)',
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código da classe (ex: BOVI, SUIN, FRAN)',
  `subgrupo_id` int NOT NULL COMMENT 'ID do subgrupo ao qual a classe pertence',
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descrição detalhada da classe',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status da classe',
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  `data_atualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela para armazenar classes de produtos';

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
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

-- --------------------------------------------------------

--
-- Estrutura para tabela `efetivos`
--

CREATE TABLE `efetivos` (
  `id` int NOT NULL,
  `unidade_escolar_id` int NOT NULL,
  `tipo_efetivo` enum('PADRAO','NAE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PADRAO',
  `quantidade` int NOT NULL DEFAULT '0',
  `intolerancia_id` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `filiais`
--

CREATE TABLE `filiais` (
  `id` int NOT NULL,
  `codigo_filial` varchar(50) DEFAULT NULL,
  `cnpj` varchar(18) DEFAULT NULL,
  `filial` varchar(255) DEFAULT NULL,
  `razao_social` varchar(255) DEFAULT NULL,
  `logradouro` varchar(150) DEFAULT NULL,
  `numero` varchar(10) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cep` varchar(15) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(5) DEFAULT NULL,
  `supervisao` varchar(100) DEFAULT NULL,
  `coordenacao` varchar(100) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `filiais`
--

INSERT INTO `filiais` (`id`, `codigo_filial`, `cnpj`, `filial`, `razao_social`, `logradouro`, `numero`, `bairro`, `cep`, `cidade`, `estado`, `supervisao`, `coordenacao`, `status`, `criado_em`, `atualizado_em`) VALUES
(1, 'CPC', '07.192.414/0013-42', 'CD CHAPECO', 'COSTA OESTE SERVICOS LTDA', 'CATARINA HOFF', '137-D', 'LIDER', '89805427', 'CHAPECO', 'SC', 'VILMAR COLPANI', 'FERNANDO GOMES', 1, '2025-07-23 18:38:24', '2025-07-31 20:05:11'),
(2, 'TLD', '07.192.414/0014-23', 'CD TOLEDO', 'COSTA OESTE SERVICOS LTDA', 'IRATEMA', '269', 'VILA INDUSTRIAL', '85904360', 'TOLEDO', 'PR', 'NADINE', 'FERNANDO GOMES', 1, '2025-07-23 19:31:15', '2025-07-23 20:09:45'),
(3, 'CTB', '07.192.414/0012-61', 'CD CURITIBANOS', 'COSTA OESTE SERVICOS LTDA', 'BR 470', '7565', 'GETULIO VARGAS', '89520000', 'CURITIBANOS', 'SC', 'ALEX RAFAEL SOUZA', 'ARLINDO BORGES JR', 1, '2025-07-23 18:37:37', '2025-07-23 19:59:46');

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
-- Estrutura para tabela `grupos`
--

CREATE TABLE `grupos` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do grupo (ex: Eletrônicos, Roupas, Alimentos)',
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código do grupo (ex: ELET, ROUP, ALIM)',
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descrição detalhada do grupo',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status do grupo',
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  `data_atualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela para armazenar grupos de produtos';

-- --------------------------------------------------------

--
-- Estrutura para tabela `intolerancias`
--

CREATE TABLE `intolerancias` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `marcas`
--

CREATE TABLE `marcas` (
  `id` int NOT NULL,
  `marca` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nome da marca (ex: KING, COCA-COLA, SADIA)',
  `fabricante` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nome do fabricante (ex: KING ALIMENTOS LTDA)',
  `status` tinyint(1) DEFAULT '1' COMMENT 'Status da marca (1=ativo, 0=inativo)',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `motoristas`
--

CREATE TABLE `motoristas` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cpf` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cnh` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `categoria_cnh` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `endereco` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('ativo','inativo','ferias','licenca') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `data_admissao` date DEFAULT NULL,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `filial_id` int DEFAULT NULL,
  `cnh_validade` date DEFAULT NULL COMMENT 'Data de validade da CNH do motorista'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela de motoristas com informações de CNH incluindo validade';

--
-- Despejando dados para a tabela `motoristas`
--

INSERT INTO `motoristas` (`id`, `nome`, `cpf`, `cnh`, `categoria_cnh`, `telefone`, `email`, `endereco`, `status`, `data_admissao`, `observacoes`, `criado_em`, `atualizado_em`, `filial_id`, `cnh_validade`) VALUES
(8, 'Arlindo Borges Junior', '00840136994', '11122233344', 'B', '49998185473', NULL, '', 'ativo', '2024-01-15', '', '2025-07-22 19:19:05', '2025-07-22 19:19:05', 3, NULL),
(9, 'Marcelo Alves de Ramos', '', '', '', '', NULL, '', 'ativo', NULL, '', '2025-07-23 00:11:06', '2025-07-23 00:11:06', 3, NULL),
(11, 'Robson Soares França', NULL, NULL, NULL, NULL, NULL, NULL, 'ativo', NULL, NULL, '2025-07-23 00:14:01', '2025-07-23 00:14:01', 3, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `patrimonios`
--

CREATE TABLE `patrimonios` (
  `id` int NOT NULL,
  `produto_id` int NOT NULL,
  `numero_patrimonio` varchar(20) NOT NULL,
  `local_origem_id` int DEFAULT NULL,
  `local_atual_id` int NOT NULL,
  `status` enum('ativo','manutencao','obsoleto','inativo') DEFAULT 'ativo',
  `data_aquisicao` date NOT NULL,
  `observacoes` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `patrimonios_movimentacoes`
--

CREATE TABLE `patrimonios_movimentacoes` (
  `id` int NOT NULL,
  `patrimonio_id` int NOT NULL,
  `tipo_local_origem` enum('filial','unidade_escolar') NOT NULL DEFAULT 'unidade_escolar',
  `tipo_local_destino` enum('filial','unidade_escolar') NOT NULL DEFAULT 'unidade_escolar',
  `local_origem_id` int NOT NULL,
  `local_destino_id` int NOT NULL,
  `data_movimentacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `responsavel_id` int NOT NULL,
  `motivo` enum('transferencia','manutencao','devolucao','outro') DEFAULT 'transferencia',
  `observacoes` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(1223, 4, 'ajudantes', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1224, 4, 'classes', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1225, 4, 'clientes', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1226, 4, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1227, 4, 'filiais', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1228, 4, 'fornecedores', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1229, 4, 'grupos', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1230, 4, 'intolerancias', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1231, 4, 'marcas', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1232, 4, 'motoristas', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1233, 4, 'patrimonios', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 1),
(1234, 4, 'permissoes', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1235, 4, 'produtos', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1236, 4, 'produto_generico', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1237, 4, 'produto_origem', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1238, 4, 'rotas', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1239, 4, 'rotas_nutricionistas', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1240, 4, 'subgrupos', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1241, 4, 'unidades', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1242, 4, 'unidades_escolares', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1243, 4, 'usuarios', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1244, 4, 'veiculos', 1, 1, 1, 1, '2025-09-04 15:25:29', '2025-09-04 15:25:29', 0),
(1245, 5, 'ajudantes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1246, 5, 'classes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1247, 5, 'clientes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1248, 5, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1249, 5, 'efetivos', 0, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1250, 5, 'filiais', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1251, 5, 'fornecedores', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1252, 5, 'grupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1253, 5, 'intolerancias', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1254, 5, 'marcas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1255, 5, 'motoristas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1256, 5, 'patrimonios', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 1),
(1257, 5, 'permissoes', 0, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1258, 5, 'produtos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1259, 5, 'produto_generico', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1260, 5, 'produto_origem', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1261, 5, 'rotas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1262, 5, 'subgrupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1263, 5, 'unidades', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1264, 5, 'unidades_escolares', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1265, 5, 'usuarios', 0, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1266, 5, 'veiculos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1267, 6, 'clientes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1268, 6, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1269, 6, 'fornecedores', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1270, 6, 'grupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1271, 6, 'marcas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1272, 6, 'produtos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1273, 6, 'subgrupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1274, 6, 'unidades', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1275, 7, 'fornecedores', 1, 1, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1276, 7, 'grupos', 1, 1, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1277, 7, 'marcas', 1, 1, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1278, 7, 'permissoes', 0, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1279, 7, 'produtos', 1, 1, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1280, 7, 'subgrupos', 1, 1, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1281, 7, 'unidades', 1, 1, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1282, 7, 'usuarios', 0, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1283, 8, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1284, 8, 'fornecedores', 1, 1, 1, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1285, 8, 'grupos', 1, 1, 1, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1286, 8, 'marcas', 1, 1, 1, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1287, 8, 'produtos', 1, 1, 1, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1288, 8, 'subgrupos', 1, 1, 1, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1289, 8, 'unidades', 1, 1, 1, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1290, 9, 'ajudantes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1291, 9, 'classes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1292, 9, 'clientes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1293, 9, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1294, 9, 'filiais', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1295, 9, 'fornecedores', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1296, 9, 'grupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1297, 9, 'marcas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1298, 9, 'motoristas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1299, 9, 'permissoes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1300, 9, 'produtos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1301, 9, 'produto_generico', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1302, 9, 'produto_origem', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1303, 9, 'rotas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1304, 9, 'subgrupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1305, 9, 'unidades', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1306, 9, 'unidades_escolares', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1307, 9, 'usuarios', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1308, 9, 'veiculos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1309, 10, 'ajudantes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1310, 10, 'classes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1311, 10, 'clientes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1312, 10, 'cotacao', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1313, 10, 'filiais', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1314, 10, 'fornecedores', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1315, 10, 'grupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1316, 10, 'marcas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1317, 10, 'motoristas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1318, 10, 'permissoes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1319, 10, 'produtos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1320, 10, 'produto_generico', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1321, 10, 'produto_origem', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1322, 10, 'rotas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1323, 10, 'subgrupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1324, 10, 'unidades', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1325, 10, 'unidades_escolares', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1326, 10, 'usuarios', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1327, 10, 'veiculos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1328, 11, 'ajudantes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1329, 11, 'classes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1330, 11, 'clientes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1331, 11, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1332, 11, 'filiais', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1333, 11, 'fornecedores', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1334, 11, 'grupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1335, 11, 'marcas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1336, 11, 'motoristas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1337, 11, 'permissoes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1338, 11, 'produtos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1339, 11, 'produto_generico', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1340, 11, 'produto_origem', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1341, 11, 'rotas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1342, 11, 'subgrupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1343, 11, 'unidades', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1344, 11, 'unidades_escolares', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1345, 11, 'usuarios', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1346, 11, 'veiculos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1347, 12, 'ajudantes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1348, 12, 'classes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1349, 12, 'clientes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1350, 12, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1351, 12, 'filiais', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1352, 12, 'fornecedores', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1353, 12, 'grupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1354, 12, 'marcas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1355, 12, 'motoristas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1356, 12, 'permissoes', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1357, 12, 'produtos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1358, 12, 'produto_generico', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1359, 12, 'produto_origem', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1360, 12, 'rotas', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1361, 12, 'subgrupos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1362, 12, 'unidades', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1363, 12, 'unidades_escolares', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1364, 12, 'usuarios', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1365, 12, 'veiculos', 1, 1, 1, 1, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1366, 13, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1367, 13, 'fornecedores', 1, 1, 1, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1368, 14, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1369, 14, 'fornecedores', 1, 1, 1, 0, '2025-09-04 15:25:55', '2025-09-04 15:25:55', 0),
(1408, 17, 'ajudantes', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1409, 17, 'classes', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1410, 17, 'clientes', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1411, 17, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1412, 17, 'filiais', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1413, 17, 'fornecedores', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1414, 17, 'grupos', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1415, 17, 'intolerancias', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1416, 17, 'marcas', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1417, 17, 'motoristas', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1418, 17, 'patrimonios', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1419, 17, 'permissoes', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1420, 17, 'produtos', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1421, 17, 'produto_generico', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1422, 17, 'produto_origem', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1423, 17, 'rotas', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1424, 17, 'rotas_nutricionistas', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1425, 17, 'subgrupos', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1426, 17, 'unidades', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1427, 17, 'unidades_escolares', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1428, 17, 'usuarios', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1429, 17, 'veiculos', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1430, 18, 'ajudantes', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1431, 18, 'classes', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1432, 18, 'clientes', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1433, 18, 'cotacao', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1434, 18, 'filiais', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1435, 18, 'fornecedores', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1436, 18, 'grupos', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1437, 18, 'intolerancias', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1438, 18, 'marcas', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1439, 18, 'motoristas', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1440, 18, 'patrimonios', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 1),
(1441, 18, 'permissoes', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1442, 18, 'produtos', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1443, 18, 'produto_generico', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1444, 18, 'produto_origem', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1445, 18, 'rotas', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1446, 18, 'rotas_nutricionistas', 1, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1447, 18, 'subgrupos', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1448, 18, 'unidades', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1449, 18, 'unidades_escolares', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1450, 18, 'usuarios', 0, 0, 0, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1451, 18, 'veiculos', 1, 1, 1, 0, '2025-09-04 15:25:56', '2025-09-04 15:25:56', 0),
(1474, 19, 'fornecedores', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1475, 19, 'clientes', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1476, 19, 'filiais', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1477, 19, 'rotas', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1478, 19, 'produtos', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1479, 19, 'grupos', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1480, 19, 'subgrupos', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1481, 19, 'classes', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1482, 19, 'produto_origem', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1483, 19, 'unidades', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1484, 19, 'unidades_escolares', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1485, 19, 'marcas', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1486, 19, 'veiculos', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1487, 19, 'motoristas', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1488, 19, 'ajudantes', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1489, 19, 'produto_generico', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1490, 19, 'intolerancias', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1491, 19, 'patrimonios', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 1),
(1492, 19, 'rotas_nutricionistas', 1, 1, 1, 0, '2025-09-04 16:18:31', '2025-09-04 16:18:31', 0),
(1513, 15, 'usuarios', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1514, 15, 'fornecedores', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1515, 15, 'clientes', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1516, 15, 'filiais', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1517, 15, 'rotas', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1518, 15, 'produtos', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1519, 15, 'grupos', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1520, 15, 'subgrupos', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1521, 15, 'classes', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1522, 15, 'produto_origem', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1523, 15, 'unidades', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1524, 15, 'unidades_escolares', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1525, 15, 'marcas', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1526, 15, 'veiculos', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1527, 15, 'motoristas', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1528, 15, 'ajudantes', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1529, 15, 'produto_generico', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1530, 15, 'intolerancias', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0),
(1531, 15, 'patrimonios', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 1),
(1532, 15, 'rotas_nutricionistas', 1, 1, 1, 1, '2025-09-04 17:19:18', '2025-09-04 17:19:18', 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int NOT NULL,
  `produto_origem_id` int DEFAULT NULL,
  `codigo_produto` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nome` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Exemplo: PATINHO BOVINO EM CUBOS KING',
  `codigo_barras` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Exemplo: 1234567891234',
  `fator_conversao` decimal(10,3) DEFAULT '1.000' COMMENT 'Fator de conversão do produto',
  `referencia_interna` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Referência interna do produto',
  `referencia_externa` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Exemplo: 123654',
  `referencia_mercado` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Exemplo: Corte Bovino / Patinho / Cubos',
  `unidade_id` int DEFAULT NULL COMMENT 'ID da unidade de medida - Exemplo: PCT',
  `grupo_id` int DEFAULT NULL COMMENT 'Agrupamento N1 - Exemplo: FRIOS',
  `subgrupo_id` int DEFAULT NULL COMMENT 'Agrupamento N2 - Exemplo: CONGELADO',
  `classe_id` int DEFAULT NULL,
  `nome_generico_id` int DEFAULT NULL COMMENT 'ID do nome genérico do produto',
  `marca_id` int DEFAULT NULL,
  `peso_liquido` decimal(10,3) DEFAULT NULL COMMENT 'Peso líquido em kg - Exemplo: 1',
  `peso_bruto` decimal(10,3) DEFAULT NULL COMMENT 'Peso bruto em kg - Exemplo: 1',
  `fabricante` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Exemplo: KING',
  `informacoes_adicionais` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT 'Exemplo: PRODUTO COM 5% DE GORDURA',
  `foto_produto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Caminho da foto - Exemplo: IMAGEM',
  `prazo_validade` int DEFAULT NULL COMMENT 'Prazo de validade (número) - Exemplo: 12',
  `unidade_validade` enum('DIAS','SEMANAS','MESES','ANOS') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Exemplo: DIAS',
  `regra_palet_un` int DEFAULT NULL COMMENT 'Regra palet (unidades) - Exemplo: 1200',
  `ficha_homologacao` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Exemplo: 123456',
  `registro_especifico` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Exemplo: 1234456 CA, REGISTRO, MODELO, Nº SERIE',
  `comprimento` decimal(10,2) DEFAULT NULL COMMENT 'Comprimento em cm - Exemplo: 20',
  `largura` decimal(10,2) DEFAULT NULL COMMENT 'Largura em cm - Exemplo: 15',
  `altura` decimal(10,2) DEFAULT NULL COMMENT 'Altura em cm - Exemplo: 10',
  `volume` decimal(10,2) DEFAULT NULL COMMENT 'Volume em cm³ - Exemplo: 3000',
  `integracao_senior` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Exemplo: 123654',
  `ncm` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Classificação NCM',
  `cest` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Código CEST',
  `cfop` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Código CFOP',
  `ean` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Código EAN',
  `cst_icms` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'CST ICMS',
  `csosn` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'CSOSN',
  `aliquota_icms` decimal(5,2) DEFAULT NULL COMMENT 'Alíquota ICMS (%)',
  `aliquota_ipi` decimal(5,2) DEFAULT NULL COMMENT 'Alíquota IPI (%)',
  `aliquota_pis` decimal(5,2) DEFAULT NULL COMMENT 'Alíquota PIS (%)',
  `aliquota_cofins` decimal(5,2) DEFAULT NULL COMMENT 'Alíquota COFINS (%)',
  `status` tinyint(1) DEFAULT '1' COMMENT 'Status do produto (1=ativo, 0=inativo)',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_criador_id` int DEFAULT NULL COMMENT 'ID do usuário que criou o produto',
  `usuario_atualizador_id` int DEFAULT NULL COMMENT 'ID do usuário que atualizou o produto',
  `tipo_registro` enum('ANVISA','MAPA','OUTROS') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Tipo do registro específico',
  `embalagem_secundaria_id` int DEFAULT NULL COMMENT 'ID da unidade de medida da embalagem secundária (ex: CX, PCT, FD)',
  `fator_conversao_embalagem` int DEFAULT '1' COMMENT 'Fator de conversão da embalagem secundária (ex: 1 CX = 12 UN)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `produtos_com_marcas`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `produtos_com_marcas` (
`id` int
,`produto_origem_id` int
,`codigo_produto` varchar(10)
,`nome` varchar(200)
,`codigo_barras` varchar(50)
,`fator_conversao` decimal(10,3)
,`referencia_interna` varchar(100)
,`referencia_externa` varchar(100)
,`referencia_mercado` varchar(200)
,`unidade_id` int
,`grupo_id` int
,`subgrupo_id` int
,`classe_id` int
,`nome_generico_id` int
,`marca_id` int
,`peso_liquido` decimal(10,3)
,`peso_bruto` decimal(10,3)
,`fabricante` varchar(100)
,`informacoes_adicionais` text
,`foto_produto` varchar(255)
,`prazo_validade` int
,`unidade_validade` enum('DIAS','SEMANAS','MESES','ANOS')
,`regra_palet_un` int
,`ficha_homologacao` varchar(50)
,`registro_especifico` varchar(200)
,`comprimento` decimal(10,2)
,`largura` decimal(10,2)
,`altura` decimal(10,2)
,`volume` decimal(10,2)
,`integracao_senior` varchar(50)
,`ncm` varchar(10)
,`cest` varchar(10)
,`cfop` varchar(10)
,`ean` varchar(50)
,`cst_icms` varchar(3)
,`csosn` varchar(3)
,`aliquota_icms` decimal(5,2)
,`aliquota_ipi` decimal(5,2)
,`aliquota_pis` decimal(5,2)
,`aliquota_cofins` decimal(5,2)
,`status` tinyint(1)
,`criado_em` timestamp
,`atualizado_em` timestamp
,`usuario_criador_id` int
,`usuario_atualizador_id` int
,`tipo_registro` enum('ANVISA','MAPA','OUTROS')
,`embalagem_secundaria_id` int
,`fator_conversao_embalagem` int
,`nome_marca` varchar(100)
,`fabricante_marca` varchar(200)
);

-- --------------------------------------------------------

--
-- Estrutura para tabela `produto_generico`
--

CREATE TABLE `produto_generico` (
  `id` int NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Código do produto origem',
  `nome` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nome do produto genérico',
  `produto_origem_id` int DEFAULT NULL COMMENT 'ID do produto de origem',
  `fator_conversao` decimal(10,3) DEFAULT '1.000' COMMENT 'Fator de conversão (3 casas decimais)',
  `grupo_id` int DEFAULT NULL COMMENT 'ID do grupo',
  `subgrupo_id` int DEFAULT NULL COMMENT 'ID do subgrupo',
  `classe_id` int DEFAULT NULL COMMENT 'ID da classe',
  `unidade_medida_id` int DEFAULT NULL COMMENT 'ID da unidade de medida',
  `referencia_mercado` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Referência de mercado',
  `produto_padrao` enum('Sim','Não') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Não' COMMENT 'Indica se é produto padrão',
  `peso_liquido` decimal(10,3) DEFAULT NULL COMMENT 'Peso líquido em kg',
  `peso_bruto` decimal(10,3) DEFAULT NULL COMMENT 'Peso bruto em kg',
  `regra_palet` int DEFAULT NULL COMMENT 'Regra palet (número inteiro)',
  `informacoes_adicionais` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT 'Informações adicionais do produto',
  `referencia_interna` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Referência interna do produto',
  `referencia_externa` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Referência externa do produto',
  `registro_especifico` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Registro específico (número)',
  `tipo_registro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Tipo de registro',
  `prazo_validade_padrao` int DEFAULT NULL COMMENT 'Prazo de validade padrão (número inteiro)',
  `unidade_validade` enum('Dias','Semanas','Meses','Anos') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Unidade de validade',
  `integracao_senior` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Código de integração com sistema Senior',
  `status` tinyint(1) DEFAULT '1' COMMENT 'Status (1=ativo, 0=inativo)',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_criador_id` int DEFAULT NULL COMMENT 'ID do usuário que criou o registro',
  `usuario_atualizador_id` int DEFAULT NULL COMMENT 'ID do usuário que atualizou o registro'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `produto_origem`
--

CREATE TABLE `produto_origem` (
  `id` int NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Código do produto origem',
  `nome` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nome do Produto Origem',
  `unidade_medida_id` int NOT NULL COMMENT 'ID da unidade de medida',
  `fator_conversao` decimal(10,3) DEFAULT '1.000' COMMENT 'Fator de conversão',
  `grupo_id` int DEFAULT NULL COMMENT 'ID do grupo',
  `subgrupo_id` int DEFAULT NULL COMMENT 'ID do subgrupo',
  `classe_id` int DEFAULT NULL COMMENT 'ID da classe',
  `peso_liquido` decimal(10,3) DEFAULT NULL COMMENT 'Peso líquido em kg',
  `referencia_mercado` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Referência de mercado',
  `produto_generico_padrao_id` int DEFAULT NULL COMMENT 'ID do produto genérico padrão vinculado',
  `status` tinyint(1) DEFAULT '1' COMMENT 'Status (1=ativo, 0=inativo)',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_criador_id` int DEFAULT NULL COMMENT 'ID do usuário que criou',
  `usuario_atualizador_id` int DEFAULT NULL COMMENT 'ID do usuário que atualizou'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `rotas`
--

CREATE TABLE `rotas` (
  `id` int NOT NULL,
  `filial_id` int NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `distancia_km` decimal(10,2) DEFAULT '0.00',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo',
  `tipo_rota` enum('semanal','quinzenal','mensal','transferencia') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'semanal',
  `custo_diario` decimal(10,2) DEFAULT '0.00',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `rotas`
--

INSERT INTO `rotas` (`id`, `filial_id`, `codigo`, `nome`, `distancia_km`, `status`, `tipo_rota`, `custo_diario`, `observacoes`, `created_at`, `updated_at`) VALUES
(1, 3, 'ROTA 03 CTB', 'R03 - Taio', 0.00, 'ativo', 'semanal', 2700.00, '', '2025-07-20 04:19:37', '2025-07-20 21:51:00'),
(2, 3, 'ROTA 01 CTB', 'R01 - Canoinhas', 0.00, 'ativo', 'semanal', 2700.00, NULL, '2025-07-20 04:19:37', '2025-08-14 13:57:20'),
(3, 3, 'ROTA 02 CTB', 'R02 - Ibirama', 0.00, 'ativo', 'semanal', 2700.00, '', '2025-07-20 04:19:37', '2025-07-20 21:50:29'),
(4, 3, 'ROTA 04 CTB', 'R04 - Curitibanos', 0.00, 'ativo', 'quinzenal', 2700.00, '', '2025-07-20 04:19:37', '2025-07-20 21:51:24'),
(6, 3, 'ROTA 05 CTB', 'R05 - Pouso Redondo', 0.00, 'ativo', 'semanal', 2700.00, '', '2025-07-20 17:19:45', '2025-07-20 21:51:37'),
(7, 3, 'ROTA 06 CTB', 'R06 - Lebon Regis', 0.00, 'ativo', 'quinzenal', 2700.00, '', '2025-07-20 17:20:54', '2025-07-20 21:51:53'),
(8, 3, 'ROTA 07 CTB', 'R07 - Cacador', 0.00, 'ativo', 'semanal', 2700.00, '', '2025-07-20 17:22:03', '2025-07-20 21:52:06'),
(9, 3, 'ROTA 08 CTB', 'R08 - Porto Uniao', 0.00, 'ativo', 'semanal', 2700.00, '', '2025-07-20 17:23:15', '2025-07-20 21:52:20'),
(10, 3, 'ROTA 09 CTB', 'R09 - Rio do Sul', 0.00, 'ativo', 'semanal', 2700.00, '', '2025-07-20 17:25:01', '2025-07-20 21:52:33');

-- --------------------------------------------------------

--
-- Estrutura para tabela `rotas_nutricionistas`
--

CREATE TABLE `rotas_nutricionistas` (
  `id` int NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `usuario_id` int NOT NULL,
  `supervisor_id` int NOT NULL,
  `coordenador_id` int NOT NULL,
  `escolas_responsaveis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela para gerenciar rotas nutricionistas';

-- --------------------------------------------------------

--
-- Estrutura para tabela `subgrupos`
--

CREATE TABLE `subgrupos` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do subgrupo (ex: Smartphones, Notebooks, Tablets)',
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código do subgrupo (ex: SMAR, NOTE, TABL)',
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descrição detalhada do subgrupo',
  `grupo_id` int NOT NULL COMMENT 'ID do grupo pai',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status do subgrupo',
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  `data_atualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela para armazenar subgrupos de produtos';

-- --------------------------------------------------------

--
-- Estrutura para tabela `unidades_escolares`
--

CREATE TABLE `unidades_escolares` (
  `id` int NOT NULL,
  `codigo_teknisa` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código teknisa da unidade',
  `nome_escola` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome da escola/unidade',
  `cidade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Cidade da unidade',
  `estado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Estado da unidade',
  `pais` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Brasil' COMMENT 'País da unidade',
  `endereco` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Endereço completo',
  `numero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Número do endereço',
  `bairro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Bairro da unidade',
  `cep` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CEP da unidade',
  `centro_distribuicao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Centro de distribuição responsável',
  `rota_id` int DEFAULT NULL COMMENT 'Rota que atende esta unidade',
  `regional` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Regional da unidade',
  `lot` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lote da unidade',
  `cc_senior` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'C.C. Senior',
  `codigo_senior` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código Senior',
  `abastecimento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipo de abastecimento',
  `ordem_entrega` int DEFAULT '0' COMMENT 'Ordem de entrega na rota',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status da unidade',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Observações adicionais',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  `filial_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `unidades_escolares`
--

INSERT INTO `unidades_escolares` (`id`, `codigo_teknisa`, `nome_escola`, `cidade`, `estado`, `pais`, `endereco`, `numero`, `bairro`, `cep`, `centro_distribuicao`, `rota_id`, `regional`, `lot`, `cc_senior`, `codigo_senior`, `abastecimento`, `ordem_entrega`, `status`, `observacoes`, `created_at`, `updated_at`, `filial_id`) VALUES
(12, '455', 'EEB LUIZ DAVET RIO NOVO', 'MAJOR VIEIRA', 'SC', 'BRASIL', 'LOCALIDADE DE RIO NOVO', '', 'LOCALIDADE DE RIO NOVO', '', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '', 'MENSAL', 1, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(13, '454', 'EEB LUIZ DAVET RIO CLARO', 'MAJOR VIEIRA', 'SC', 'BRASIL', 'LOCALIDADE DE RIO CLARO', '', 'LOCALIDADE DE RIO CLARO', '', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '', 'MENSAL', 2, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(14, '453', 'EEB LUIZ DAVET', 'MAJOR VIEIRA', 'SC', 'BRASIL', 'R LUIZ DAVET', '1193', 'CENTRO', '89480-000', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105777', 'SEMANAL', 3, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(15, '447', 'EEB JULIA BALEOLI ZANIOLO', 'CANOINHAS', 'SC', 'BRASIL', 'R JACOBE SCHEUER', '152', 'CAMPO DA AGUA VERDE', '89460-000', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105745', 'SEMANAL', 4, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(16, '479', 'EEB RODOLFO ZIPPERER', 'CANOINHAS', 'SC', 'BRASIL', 'AV EXPEDICIONARIOS', '566', 'CAMPO DA ÁGUA VERDE', '89466-072', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105742', 'SEMANAL', 5, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(17, '402', 'CEJA CANOINHAS', 'CANOINHAS', 'SC', 'BRASIL', 'ANEXO (EEF SAGRADO CORACAO DE JESUS)', '1182', 'CENTRO', '89460-152', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105766', 'SEMANAL', 6, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(18, '480', 'EEF SAGRADO CORACAO DE JESUS', 'CANOINHAS', 'SC', 'BRASIL', 'R BARAO DO RIO BRANCO', '1182', 'CENTRO', '89460-152', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105751', 'SEMANAL', 7, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(19, '408', 'EEB ALMIRANTE BARROSO', 'CANOINHAS', 'SC', 'BRASIL', 'R CURITIBANOS', '655', 'CENTRO', '89460-146', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105754', 'SEMANAL', 8, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(20, '443', 'EEB JOAO JOSE DE S CABRAL', 'CANOINHAS', 'SC', 'BRASIL', 'R BARAO DO RIO BRANCO', '59', 'TRICOLIN', '89460-000', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105748', 'SEMANAL', 9, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(21, '440', 'EEB IRMA MARIA FELICITAS', 'CANOINHAS', 'SC', 'BRASIL', 'R AGENOR FABIO GOMES', '100', 'ALTO DAS PALMEIRAS', '89460-104', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105760', 'SEMANAL', 10, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(22, '481', 'EEB SANTA CRUZ', 'CANOINHAS', 'SC', 'BRASIL', 'R BERNARDO OLSEN', '400', 'CENTRO', '89460-004', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105757', 'SEMANAL', 11, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(23, '477', 'EEB PROF MANOEL DA S QUADROS', 'CANOINHAS', 'SC', 'BRASIL', 'R BERNARDO OLSEN', '4602', 'MARCILHO DIAS', '89460-000', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105763', 'SEMANAL', 12, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(24, '433', 'EEB FREI MENANDRO KAMPS', 'TRES BARRAS', 'SC', 'BRASIL', 'AV ABRAO MUSSI', '4091', 'SÃO CRISTOVAO', '89490-000', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105809', 'SEMANAL', 13, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(25, '417', 'EEB COLOMBO MACHADO SALLES', 'TRES BARRAS', 'SC', 'BRASIL', 'R FELIX DA COSTA GOMES', '987', 'JOAO PAULO II', '89490-000', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105806', 'SEMANAL', 14, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(26, '435', 'EEB GENERAL OSORIO', 'TRES BARRAS', 'SC', 'BRASIL', 'R PROF NELIDE MARIA ANDRADE FIGUEIREDO', '276', 'CENTRO', '89490-000', 'CD CURITIBANOS', 2, 'CANOINHAS', 'LOTE 06', '267', '105803', 'SEMANAL', 15, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(27, '429', 'EEB ESTANISLAU SCHUMANN', 'BELA VISTA DO TOLDO', 'SC', 'BRASIL', 'R PROFESSOR ALFREDO LUDKA', '329', 'CENTRO', '89478-000', 'CD CURITIBANOS', 9, 'CANOINHAS', 'LOTE 06', '267', '105738', 'SEMANAL', 11, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(28, '484', 'EEB SAO JOAO BOSCO', 'APIUNA', 'SC', 'BRASIL', 'R ITAJUBA', '', 'CENTRO', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105861', 'SEMANAL', 1, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(29, '436', 'EEB GERTRUD AICHINGER', 'IBIRAMA', 'SC', 'BRASIL', 'R IMBUIA', '', 'CENTRO', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105875', 'SEMANAL', 2, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(30, '505', 'CEJA IBIRAMA', 'IBIRAMA', 'SC', 'BRASIL', 'RUA TRES DE MAIO S/N', '', 'CENTRO', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '', 'SEMANAL', 3, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(31, '427', 'EEB ELISEU GUILHERME', 'IBIRAMA', 'SC', 'BRASIL', 'R DR GETULIO VARGAS', '', 'BELA VISTA', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105872', 'SEMANAL', 4, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(32, '490', 'EEB WALMOR RIBEIRO', 'IBIRAMA', 'SC', 'BRASIL', 'AV MISSLER', '', '', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105878', 'SEMANAL', 5, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(33, '446', 'EEB JOSE CLEMENTE PEREIRA', 'JOSE BOITEUX', 'SC', 'BRASIL', 'R 7 DE SETEMBRO', '', 'CENTRO', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105882', 'SEMANAL', 6, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(34, '462', 'EEB ORLANDO BERTOLI', 'PRESIDENTE GETULIO', 'SC', 'BRASIL', 'R DR NEREU RAMOS', '', '', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105902', 'SEMANAL', 7, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(35, '414', 'EEB CECILIA AX', 'PRESIDENTE GETULIO', 'SC', 'BRASIL', 'R ABEL ALBERTO CEOLA', '', 'RIBEIRAO TUCANO', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105905', 'SEMANAL', 8, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(36, '463', 'EEB PAPA JOAO XXIII', 'PRESIDENTE GETULIO', 'SC', 'BRASIL', 'INGO RIKMANN', '', 'MIRADOR', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105899', 'SEMANAL', 9, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(37, '495', 'EEB BERNARDO MULLER', 'PRESIDENTE GETULIO', 'SC', 'BRASIL', 'ESTRADA GERAL SERRA DOS INDIOS', '', '', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105896', 'SEMANAL', 10, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(38, '508', 'UD GETULIO (EEB ORLANDO BERTOLI)', 'PRESIDENTE GETULIO', 'SC', 'BRASIL', 'R DR NEREU RAMOS', '', '', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '', 'SEMANAL', 11, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(39, '501', 'EEB PROF MARIA ANGELICA CALAZANS', 'DONA EMMA', 'SC', 'BRASIL', 'CAMINHO PINHAL', '', '', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105865', 'MENSAL', 12, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(40, '451', 'EEB LINDO SARDAGNA', 'DONA EMMA', 'SC', 'BRASIL', 'R ALBERTO KOGLIN', '', 'CENTRO', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105868', 'SEMANAL', 13, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(41, '485', 'EEB PROF SEMIRAMIS BOSCO', 'WITMARSUM', 'SC', 'BRASIL', 'R WILLY PETT', '', 'CENTRO', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105920', 'SEMANAL', 14, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(42, '511', 'UD DI WITMARSSUN', 'WITMARSUM', 'SC', 'BRASIL', '', '', '', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105923', 'SEMANAL', 15, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(43, '489', 'EEB VICTOR MEIRELLES', 'VITOR MEIRELES', 'SC', 'BRASIL', 'R LEOPOLDO KRAMBECK', '', 'CENTRO', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105916', 'SEMANAL', 16, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(44, '510', 'UD VICTOR MEIRELLES', 'VITOR MEIRELES', 'SC', 'BRASIL', 'ANEXO (EEB VICTOR MEIRELLES)', '', '', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '', 'SEMANAL', 17, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(45, '499', 'EEB PROF JOAO VENDRAMI', 'VITOR MEIRELES', 'SC', 'BRASIL', 'ESTRADA ITAIOPOLIS', '', 'BARRA DA PRATA', '', 'CD CURITIBANOS', 3, 'IBIRAMA', 'LOTE 06', '267', '105913', 'MENSAL', 18, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(46, '452', 'EEB LUIZ BERTOLI', 'TAIO', 'SC', 'BRASIL', 'R CEL FEDDERSEN 1356', '', 'CENTRO', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '106033', 'SEMANAL', 1, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(47, '449', 'EEB LEOPOLDO JACOBSEN', 'TAIO', 'SC', 'BRASIL', 'R ROBERTO MAYR 27', '', 'SEMINARIO', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '106024', 'SEMANAL', 2, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(48, '404', 'CEJA DE TAIO', 'TAIO', 'SC', 'BRASIL', 'ANEXO (EEB LEOPOLDO JACOBSEN )', '', '', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '106036', 'SEMANAL', 3, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(49, '494', 'EEF ADELE HEIDRICH (Himasa)', 'TAIO', 'SC', 'BRASIL', 'ESTRADA REAL', '', 'ALTO RIBEIRÃO DA VARGEM', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '106030', 'SEMANAL', 4, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(50, '498', 'EEF HERCILIO ANDERLE (Passo Manso)', 'TAIO', 'SC', 'BRASIL', 'R PEDRO FRANCISCO BELLI 131', '', 'PASSO MANSO', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '106027', 'SEMANAL', 5, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(51, '423', 'EEB DR FERNANDO F. DE MELLO', 'RIO DO CAMPO', 'SC', 'BRASIL', 'R 7 DE SETEMBRO 70', '', 'GUANABARA', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '106013', 'SEMANAL', 6, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(52, '513', 'UD RIO DO CAMPO', 'RIO DO CAMPO', 'SC', 'BRASIL', 'ANEXO (EEB DR FERNANDO F. DE MELLO)', '', '', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '', 'SEMANAL', 7, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(53, '457', 'EEB MAESTRO HEITOR VILLA LOBOS (Taiozinho)', 'RIO DO CAMPO', 'SC', 'BRASIL', 'TAIOZINHO', '', 'TAIOZINHO', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '106010', 'SEMANAL', 8, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(54, '496', 'EEF DR WALDOMIRO COLAUTTI (Rio da prata)', 'RIO DO CAMPO', 'SC', 'BRASIL', 'RIO DA PRATA', '', 'RIO DA PRATA', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '106007', 'SEMANAL', 9, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(55, '444', 'EEB JOAO KUCHLER', 'SANTA TEREZINHA', 'SC', 'BRASIL', 'Estrada Geral 1163', '', '', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '', 'MENSAL', 10, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(56, '467', 'EEB PE JOAO KOMINEK', 'SANTA TEREZINHA', 'SC', 'BRASIL', 'R BRUNO PIECZARKA 1304', '', 'CENTRO', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '', 'SEMANAL', 11, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(57, '437', 'EEB GUILHERME ANDRE DALRI', 'SALETE', 'SC', 'BRASIL', 'R PE LIBERMANN 79', '', 'CENTRO', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '106020', 'SEMANAL', 12, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(58, '502', 'EEF ROBERTO HEINZEN (Santa Margarida)', 'SALETE', 'SC', 'BRASIL', 'ESTRADA GERAL', '', 'STA MARGARIDA', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '106017', 'SEMANAL', 13, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(59, '509', 'UD SALETE', 'SALETE', 'SC', 'BRASIL', 'R VEREADOR HARTUR MORATELI', '', 'CACHOEIRA', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '', 'SEMANAL', 14, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(60, '411', 'EEB BRUNO HEIDRICH', 'MIRIM DOCE', 'SC', 'BRASIL', 'R BRUNO HEIDRICH 225', '', 'CENTRO', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '105990', 'SEMANAL', 15, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(61, '512', 'UD MIRIM', 'MIRIM DOCE', 'SC', 'BRASIL', 'ANNEXO ( EEB BRUNO HEIDRICH )', '', '', '', 'CD CURITIBANOS', 1, 'TAIO', 'LOTE 06', '267', '105993', 'SEMANAL', 16, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(62, '488', 'EEB URBANO SALLES', 'FREI ROGERIO', 'SC', 'BRASIL', 'R LUIZ DAROL 53', '', 'CENTRO', '', 'CD CURITIBANOS', 4, 'CURITIBANOS', 'LOTE 06', '267', '105839', 'QUINZENAL', 1, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(63, '514', 'CEJA CURITIBANOS', 'CURITIBANOS', 'SC', 'BRASIL', '', '', '', '', 'CD CURITIBANOS', 4, 'CURITIBANOS', 'LOTE 06', '267', '', 'QUINZENAL', 2, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(64, '482', 'EEB SANTA TERESINHA', 'CURITIBANOS', 'SC', 'BRASIL', 'AV FREI ROGERIO 96', '', 'CENTRO', '', 'CD CURITIBANOS', 4, 'CURITIBANOS', 'LOTE 06', '267', '105820', 'QUINZENAL', 3, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(65, '458', 'EEB MAR EURICO GASPAR DUTRA', 'CURITIBANOS', 'SC', 'BRASIL', 'R FLORIANOPOLIS', '', 'SÃO LUIZ', '', 'CD CURITIBANOS', 4, 'CURITIBANOS', 'LOTE 06', '267', '105826', 'QUINZENAL', 4, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(66, '413', 'EEB CASIMIRO DE ABREU', 'CURITIBANOS', 'SC', 'BRASIL', 'R LUIZ DACOL 93', '', 'CENTRIO', '', 'CD CURITIBANOS', 4, 'CURITIBANOS', 'LOTE 06', '267', '105829', 'QUINZENAL', 5, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(67, '470', 'EEB PROF ANTONIO FRANCISCO DE CAMPOS', 'CURITIBANOS', 'SC', 'BRASIL', 'R PRDRO DAVI F DE SOUZA 230', '', 'CENTRO', '', 'CD CURITIBANOS', 4, 'CURITIBANOS', 'LOTE 06', '267', '105832', 'QUINZENAL', 6, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(68, '419', 'EEB DEP ALTIR WEBBER DE MELLO', 'CURITIBANOS', 'SC', 'BRASIL', 'R CARLOS GOETTEN 584', '', 'BOM JESUS', '', 'CD CURITIBANOS', 4, 'CURITIBANOS', 'LOTE 06', '267', '105823', 'QUINZENAL', 7, 'ativo', '', '2025-07-20 14:41:42', '2025-09-03 14:04:14', 3),
(69, '428', 'EEB EMB EDMUNDO DA LUZ PINTO', 'CURITIBANOS', 'SC', 'BRASIL', 'R CARLOS GOMES', '', 'ANITA GARIBALDI', '', 'CD CURITIBANOS', 4, 'CURITIBANOS', 'LOTE 06', '267', '105817', 'QUINZENAL', 8, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(70, '486', 'EEB SOLON ROSA', 'CURITIBANOS', 'SC', 'BRASIL', 'R SALOMAO C DE ALMEIDA 1675', '', 'NS APARECIDA', '', 'CD CURITIBANOS', 4, 'CURITIBANOS', 'LOTE 06', '267', '105835', 'QUINZENAL', 9, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(71, '469', 'EEB PROF ANAIR MARGARIDA VOLTOLINI', 'POUSO REDONDO', 'SC', 'BRASIL', 'R ELLA STAMER 400', '', 'PROGRESSO', '', 'CD CURITIBANOS', 6, 'TAIO', 'LOTE 06', '267', '106000', 'SEMANAL', 1, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(72, '410', 'EEB PREF ARNO SIEWERDT', 'POUSO REDONDO', 'SC', 'BRASIL', 'R 7 DE SETEMBRO 329', '', 'CENTRO', '', 'CD CURITIBANOS', 6, 'TAIO', 'LOTE 06', '267', '106003', 'SEMANAL', 2, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(73, '507', 'UD POUSO', 'POUSO REDONDO', 'SC', 'BRASIL', 'R CENTRO DE EVENTOS', '', '', '', 'CD CURITIBANOS', 6, 'TAIO', 'LOTE 06', '267', '', 'SEMANAL', 3, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(74, '450', 'EEB LETICIA POSSAMAI', 'POUSO REDONDO', 'SC', 'BRASIL', 'R JOSE VALENTE DOS CAMPOS', '', 'DIST. ATERRADO', '', 'CD CURITIBANOS', 6, 'TAIO', 'LOTE 06', '267', '105997', 'SEMANAL', 4, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(75, '424', 'EEB DR HERMANN BLUMENAU', 'TROMBUDO CENTRAL', 'SC', 'BRASIL', 'R BLUMENAU', '', 'VILA NOVA', '', 'CD CURITIBANOS', 6, 'RIO DO SUL', 'LOTE 06', '267', '105983', 'SEMANAL', 5, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(76, '405', 'EEB ADOLFO BOVING', 'BRACO DO TROMBUDO', 'SC', 'BRASIL', 'R DOM PEDRO', '', 'CENTRO', '', 'CD CURITIBANOS', 6, 'RIO DO SUL', 'LOTE 06', '267', '105937', 'SEMANAL', 6, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(77, '468', 'EEB PEDRO AMERICO', 'AGROLANDIA', 'SC', 'BRASIL', 'R 13 DE AGOSTO', '', 'CENTRO', '', 'CD CURITIBANOS', 6, 'RIO DO SUL', 'LOTE 06', '267', '105927', 'SEMANAL', 7, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(78, '459', 'EEB MARIA REGINA DE OLIVEIRA', 'AGRONOMICA', 'SC', 'BRASIL', 'R XV DE NOVEMBRO', '', 'CENTRO', '', 'CD CURITIBANOS', 6, 'RIO DO SUL', 'LOTE 06', '267', '105933', 'SEMANAL', 8, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(79, '487', 'EEB TEREZA CRISTINA', 'LAURENTINO', 'SC', 'BRASIL', 'R PAULO POSSAMAI', '', 'CENTRO', '', 'CD CURITIBANOS', 6, 'RIO DO SUL', 'LOTE 06', '267', '105941', 'SEMANAL', 9, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(80, '430', 'EEB EXPEDICIONARIO MARIO NARDELLI', 'RIO DO OESTE', 'SC', 'BRASIL', 'R IRMA LILIA', '', 'JARDIM DAS HORTENCIAS', '', 'CD CURITIBANOS', 6, 'RIO DO SUL', 'LOTE 06', '267', '105948', 'SEMANAL', 10, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(81, '493', 'EEB TRINTA DE OUTUBRO', 'LEBON REGIS', 'SC', 'BRASIL', 'ASSENT RIOS DOS PATOS', '', 'INTERIOR', '', 'CD CURITIBANOS', 7, 'CACADOR', 'LOTE 06', '267', '105718', 'QUINZENAL', 1, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(82, '432', 'EEB FREI CANECA', 'LEBON REGIS', 'SC', 'BRASIL', 'R ARTHUR BARTH 556', '', 'CENTRO', '', 'CD CURITIBANOS', 7, 'CACADOR', 'LOTE 06', '267', '105715', 'QUINZENAL', 2, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(83, '503', 'EEB SANTA TEREZINHA', 'LEBON REGIS', 'SC', 'BRASIL', 'R ARTUR BARTH', '', 'CENTRO', '', 'CD CURITIBANOS', 7, 'CACADOR', 'LOTE 06', '267', '105712', 'QUINZENAL', 3, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(84, '456', 'EEB MACHADO DE ASSIS', 'TIMBO GRANDE', 'SC', 'BRASIL', 'R CLAUDIANO ALVES ROCHA 340', '', 'CENTRO', '', 'CD CURITIBANOS', 7, 'CACADOR', 'LOTE 06', '267', '105734', 'QUINZENAL', 4, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(85, '460', 'EEB MARIA SALETE CAZZAMALI', 'SANTA CECILIA', 'SC', 'BRASIL', 'R LAGES 53', '', 'RONDINHA II', '', 'CD CURITIBANOS', 7, 'CURITIBANOS', 'LOTE 06', '267', '105847', 'QUINZENAL', 5, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(86, '439', 'EEB IRMA IRENE', 'SANTA CECILIA', 'SC', 'BRASIL', 'R PEDRO DRISSEN 166', '', 'CENTRO', '', 'CD CURITIBANOS', 7, 'CURITIBANOS', 'LOTE 06', '267', '105850', 'QUINZENAL', 6, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(87, '448', 'EEB LEIA MATILDE GERBER', 'SANTA CECILIA', 'SC', 'BRASIL', 'AV NAKAYMA', '', 'MARCILIANO FERNANDES', '', 'CD CURITIBANOS', 7, 'CURITIBANOS', 'LOTE 06', '267', '105853', 'QUINZENAL', 7, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(88, '434', 'EEB FREI ROGERIO', 'PONTE ALTA DO NORTE', 'SC', 'BRASIL', 'R STA CATARINA 414', '', 'CENTRO', '', 'CD CURITIBANOS', 7, 'CURITIBANOS', 'LOTE 06', '267', '105843', 'QUINZENAL', 8, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(89, '471', 'EEB PROF ARGEU FURTADO', 'SAO CRISTOVAO DO SUL', 'SC', 'BRASIL', 'R AFONSO FAEDO', '', 'CENTRO', '', 'CD CURITIBANOS', 7, 'CURITIBANOS', 'LOTE 06', '267', '105857', 'QUINZENAL', 9, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(90, '483', 'EEB SANTOS ANJOS', 'RIO DAS ANTAS', 'SC', 'BRASIL', 'R ESTEFANO BONET 226', '', 'CENTRO', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105730', 'SEMANAL', 1, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(91, '473', 'EEB PROF DOMINGOS DA COSTA FRANCO', 'CACADOR', 'SC', 'BRASIL', 'ROD COMENDADOR PRIMO TEDESC', '', 'BOM SUCESSO', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105699', 'SEMANAL', 2, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(92, '491', 'EEB WANDA KRIEGER GOMES', 'CACADOR', 'SC', 'BRASIL', 'R JOSE IOSS JUNIOR 1000', '', 'MARTELLO', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105705', 'SEMANAL', 3, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(93, '425', 'EEB DR JOAO SANTO DAMO', 'CACADOR', 'SC', 'BRASIL', 'RODOVIA SC 302 KM 1', '', 'SAO CRISTOVAO', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105696', 'SEMANAL', 4, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(94, '497', 'EEF GRACIOSA COPETTI PEREIRA', 'CACADOR', 'SC', 'BRASIL', 'R ODELIR GODINHO 204', '', 'BELLO', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105702', 'SEMANAL', 5, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(95, '418', 'EEB DANTE MOSCONI', 'CACADOR', 'SC', 'BRASIL', 'R FERMIANO PAES CARNEIRO', '', 'GIOPPO', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105684', 'SEMANAL', 6, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(96, '442', 'EEB IRMAO LEO', 'CACADOR', 'SC', 'BRASIL', 'RUA CONSELHEIRO MAFRA 750', '', 'CENTRO', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105678', 'SEMANAL', 7, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(97, '426', 'EEB DR NAYA GONZAGA SAMPAIO', 'CACADOR', 'SC', 'BRASIL', 'R JOSE REICHMANN', '', 'DER', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105693', 'SEMANAL', 8, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(98, '401', 'CEJA DE CACADOR', 'CACADOR', 'SC', 'BRASIL', 'AVENIDA BARAO DO RIO BRANCO 7', '', 'CENTRO', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105708', 'SEMANAL', 9, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(99, '465', 'EEB PAULO SCHIEFFLER', 'CACADOR', 'SC', 'BRASIL', 'R NEREU RAMOS 351', '', 'CENTRO', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105687', 'SEMANAL', 10, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(100, '422', 'EEB DOM ORLANDO DOTTI', 'CACADOR', 'SC', 'BRASIL', 'R IRMAO TOMAS 293', '', 'BOM JESUS', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105690', 'SEMANAL', 11, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(101, '504', 'EEB THOMAZ PADILHA', 'CACADOR', 'SC', 'BRASIL', 'ROD SC 451 KM 22', '', 'TAQUARA VERDE', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105681', 'SEMANAL', 12, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(102, '406', 'EEB ALBINA MOSCONI', 'MACIEIRA', 'SC', 'BRASIL', 'R ERCOLIN TASCA 245', '', 'CENTRO', '', 'CD CURITIBANOS', 8, 'CACADOR', 'LOTE 06', '267', '105722', 'SEMANAL', 13, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(103, '412', 'EEB CALMON', 'CALMON', 'SC', 'BRASIL', 'R JOAO SERAFINI 85', '', 'CENTRO', '', 'CD CURITIBANOS', 9, 'CACADOR', 'LOTE 06', '267', '', 'SEMANAL', 1, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(104, '421', 'EEB DOM DANIEL HOSTIN', 'MATOS COSTA', 'SC', 'BRASIL', 'R CRUZ E SOUZA 50', '', 'CENTRO', '', 'CD CURITIBANOS', 9, 'CACADOR', 'LOTE 06', '267', '105726', 'SEMANAL', 2, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(105, '409', 'EEB ANTONIO GONZAGA', 'PORTO UNIAO', 'SC', 'BRASIL', 'R FRANCISCO DE BACELAR', '', 'SANTA ROSA', '', 'CD CURITIBANOS', 9, 'CANOINHAS', 'LOTE 06', '267', '105787', 'SEMANAL', 3, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(106, '472', 'EEB PROF BALDUINO CARDOSO', 'PORTO UNIAO', 'SC', 'BRASIL', 'AV GEN BORMAN 162', '', 'CENTRO', '', 'CD CURITIBANOS', 9, 'CANOINHAS', 'LOTE 06', '267', '105793', 'SEMANAL', 4, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(107, '415', 'EEB CEL CID GONZAGA', 'PORTO UNIAO', 'SC', 'BRASIL', 'R ANNES GUALBERTO', '', 'CENTRO', '', 'CD CURITIBANOS', 9, 'CANOINHAS', 'LOTE 06', '267', '105784', 'SEMANAL', 5, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(108, '475', 'EEB PROF GERMANO WAGENFUHR', 'PORTO UNIAO', 'SC', 'BRASIL', 'R WENCESLAU BRAZ', '', 'SAO PEDRO', '', 'CD CURITIBANOS', 9, 'CANOINHAS', 'LOTE 06', '267', '105799', 'SEMANAL', 6, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(109, '461', 'EEB NILO PECANHA', 'PORTO UNIAO', 'SC', 'BRASIL', 'R FRANCISCO PELUSKI', '', 'VICE KING', '', 'CD CURITIBANOS', 9, 'CANOINHAS', 'LOTE 06', '267', '105790', 'SEMANAL', 7, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(110, '416', 'EEB PROF CLEMENTINO BRITTO', 'PORTO UNIAO', 'SC', 'BRASIL', 'R GETULIO VARGAS 121', '', 'CENTRO', '', 'CD CURITIBANOS', 9, 'CANOINHAS', 'LOTE 06', '267', '105796', 'SEMANAL', 8, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(111, '438', 'EEB HORACIO NUNES', 'IRINEOPOLIS', 'SC', 'BRASIL', 'R PARANA 749', '', 'CENTRO', '', 'CD CURITIBANOS', 9, 'CANOINHAS', 'LOTE 06', '267', '105770', 'SEMANAL', 9, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(112, '441', 'EEB IRMA MARIA FELICITAS (EXTENÇÃO)', 'CANOINHAS', 'SC', 'BRASIL', 'ANEXO (EBM BENEDITO THEREZIO DE CARVALHO)', '', 'LOCALIDADE FELIPE SCHIMITD', '', 'CD CURITIBANOS', 9, 'CANOINHAS', 'LOTE 06', '267', '', 'MENSAL', 10, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(113, '474', 'EEB PROF FREDERICO NAVARRO LINS', 'RIO DO SUL', 'SC', 'BRASIL', 'R PATRICIO NOVELETO', '', 'BARRA DO TROMBUDO', '', 'CD CURITIBANOS', 10, 'RIO DO SUL', 'LOTE 06', '267', '105955', 'SEMANAL', 1, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(114, '407', 'EEB ALFREDO DALFOVO', 'RIO DO SUL', 'SC', 'BRASIL', 'R ENGENHEIRO ODEBRECHT', '', 'WALTER BUDAG', '', 'CD CURITIBANOS', 10, 'RIO DO SUL', 'LOTE 06', '267', '105967', 'SEMANAL', 2, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(115, '403', 'CEJA RIO DO SUL', 'RIO DO SUL', 'SC', 'BRASIL', 'RUI BARBOSA', '', 'SUMARE', '', 'CD CURITIBANOS', 10, 'RIO DO SUL', 'LOTE 06', '267', '105979', 'SEMANAL', 3, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(116, '464', 'EEB PAULO CORDEIRO', 'RIO DO SUL', 'SC', 'BRASIL', 'R XV DE NOVEMBRO', '', 'LARANJEIRAS', '', 'CD CURITIBANOS', 10, 'RIO DO SUL', 'LOTE 06', '267', '105964', 'SEMANAL', 4, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(117, '420', 'EEB DEP JOAO CUSTODIO DA LUZ', 'RIO DO SUL', 'SC', 'BRASIL', 'R LADEIRA PORTO VELHO', '', 'BOA VISTA', '', 'CD CURITIBANOS', 10, 'RIO DO SUL', 'LOTE 06', '267', '105961', 'SEMANAL', 5, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(118, '466', 'EEB PAULO ZIMMERMANN', 'RIO DO SUL', 'SC', 'BRASIL', 'R SAO JOAO', '', 'CENTRO', '', 'CD CURITIBANOS', 10, 'RIO DO SUL', 'LOTE 06', '267', '', 'SEMANAL', 6, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(119, '476', 'EEB PROF HENRIQUE DA SILVA FONTES', 'RIO DO SUL', 'SC', 'BRASIL', 'R JACO FINARDI', '', 'CANTA GALO', '', 'CD CURITIBANOS', 10, 'RIO DO SUL', 'LOTE 06', '267', '105973', 'SEMANAL', 7, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(120, '500', 'EEF LUIS LEDRA', 'RIO DO SUL', 'SC', 'BRASIL', 'ESTRADA GERAL BLUMENAU', '', 'TABOAO', '', 'CD CURITIBANOS', 10, 'RIO DO SUL', 'LOTE 06', '267', '105970', 'SEMANAL', 8, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(121, '492', 'EEB WILLY HERING', 'RIO DO SUL', 'SC', 'BRASIL', 'R CONSELHEIRO WILL HERING', '', 'BELA ALIANCA', '', 'CD CURITIBANOS', 10, 'RIO DO SUL', 'LOTE 06', '267', '105976', 'SEMANAL', 9, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(122, '445', 'EEB JOAO TOLENTINO JUNIOR', 'PRESIDENTE NEREU', 'SC', 'BRASIL', 'R ROBERTO JUNGKLAUS', '', 'CENTRO', '', 'CD CURITIBANOS', 10, 'IBIRAMA', 'LOTE 06', '267', '105909', 'MENSAL', 10, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(123, '506', 'UD LONTRAS', 'LONTRAS', 'SC', 'BRASIL', '', '', '', '', 'CD CURITIBANOS', 10, 'IBIRAMA', 'LOTE 06', '267', '', 'SEMANAL', 11, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(124, '478', 'EEB REGENTE FEIJO', 'LONTRAS', 'SC', 'BRASIL', 'R OSVALDO SCHROEDER', '', 'CENTRO', '', 'CD CURITIBANOS', 10, 'IBIRAMA', 'LOTE 06', '267', '105889', 'SEMANAL', 12, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3),
(125, '431', 'EEB FRANCISCO ALTAMIR WAGNER', 'RIO DO SUL', 'SC', 'BRASIL', 'ESTRADA BOA ESPERANCA', '', 'FUNDO CANOAS', '', 'CD CURITIBANOS', 10, 'RIO DO SUL', 'LOTE 06', '267', '105958', 'SEMANAL', 13, 'ativo', '', '2025-07-20 14:41:43', '2025-09-03 14:04:14', 3);

-- --------------------------------------------------------

--
-- Estrutura para tabela `unidades_medida`
--

CREATE TABLE `unidades_medida` (
  `id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `sigla` varchar(10) NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(4, 'Luiz Nicolao', 'luiz.nicolao@terceirizemais.com.br', '$2y$10$MJ2Fa2btWKyZlOFvjHb64.vPJkZmzD1HHP6YG7K.EbIUt5WP4X6ii', 'III', 'administrador', 'ativo', '2025-07-15 19:30:52', '2025-07-21 17:32:34'),
(5, 'Arlindo Borges', 'arlindo.borges@terceirizemais.com.br', '$2a$12$D58dplQkpB0hr9axnET0JOi7XbXkZ0wJyLVaE9EF55gcqp/47x8TG', 'III', 'coordenador', 'ativo', '2025-07-15 19:49:33', '2025-07-17 14:50:10'),
(6, 'Fernando Gomes', 'fernando.gomes@terceirizemais.com.br', '$2a$12$S4IXIOXy2uiESD9wgZVtC.QzS/ycs8HBiQqk5j60pXd//0P9hE53m', 'III', 'gerente', 'ativo', '2025-07-18 01:36:21', '2025-07-18 01:36:21'),
(7, 'Leonardo Ferreira', 'leonardo.ferreira@terceirizemais.com.br', '$2a$12$5Bjs15ugXy/OYJgKoKw0lOrfRUfHnv.wHQyF3jmkFBYxiAQSEMVxu', 'II', 'administrativo', 'ativo', '2025-07-18 12:41:03', '2025-07-21 12:49:39'),
(8, 'Marcos Vinicius', 'marcos.vinicius@tercerizemais.com.br', '$2a$12$PbW3Iq.L2KJTJYX/D.D/U.CzVrTftflsA4xItjg4skdqn.2keqAYm', 'II', 'administrativo', 'ativo', '2025-07-18 17:58:58', '2025-07-18 17:58:58'),
(9, 'Guilherme Brandão', 'suporte.dev1@costaoesteserv.com.br', '$2a$12$S22k1eE9gQLCguvbm4wAZe3yZdkM1wdORbMXa2LHM9E4b2yqGvl4m', 'III', 'administrador', 'ativo', '2025-08-15 18:19:29', '2025-08-15 18:19:29'),
(10, 'João Dysarz', 'planejamento@costaoesteserv.com.br', '$2a$12$EHz8ePlQn89HNfNnY8DVJeuGiOdZfpiKD/kL94suOT2Rf3BB2Gc/u', 'III', 'administrador', 'ativo', '2025-08-15 18:25:33', '2025-08-15 18:25:33'),
(11, 'Arthur Ritzel', 'suporte.dev2@costaoesteserv.com.br', '$2a$12$8EQsNZdRtuDftbR7EUW9Ku6hRejtCTNfbpnXD4raydF3FJ5Ab1iNW', 'III', 'administrador', 'ativo', '2025-08-18 12:00:20', '2025-08-18 12:00:20'),
(12, 'Tainá Dreissig', 'projetos2@costaoesteserv.com.br', '$2a$12$xmRVlO4W3bO60iAgfrR8CO9Y3Gl9oCeYPeu/sJ19MorJfYWAhJI0a', 'III', 'administrador', 'ativo', '2025-08-18 13:14:13', '2025-08-18 13:14:13'),
(13, 'Danielle Ferreira', 'danielle.ferreira@terceirizemais.com.br', '$2a$12$yHppddpK7xpN7y4ytmiuAeLefs8oWLHM/vCUxIUFcQCs0LqYP24Jq', 'I', 'administrativo', 'ativo', '2025-08-27 17:42:29', '2025-08-27 17:42:29'),
(14, 'Eliane Kuosinski', 'eliane.surpevisora@tercerizemais.com.br', '$2a$12$e5qkb970z/a1QIF7XPGaLe8VsfzJLvft55VPx0HYN1kX7xRWm0OyC', 'I', 'administrativo', 'ativo', '2025-08-27 18:03:01', '2025-08-27 18:03:01'),
(15, 'Natanael', 'natanael@terceirizemais.combr', '$2a$12$KTIPB6QnAg3qI0dL0WY0XeVKoaIv3qi.FsbqQkEXKvj5HaceLpvWO', 'III', 'administrador', 'ativo', '2025-08-28 16:09:21', '2025-08-28 16:09:21'),
(17, 'Maria Eudarda', 'maria.eduarda@tericeirzemais.com.br', '$2a$12$hash_criptografado', 'I', 'nutricionista', 'ativo', '2025-09-04 15:22:05', '2025-09-04 15:22:05'),
(18, 'Carline Sisti', 'carline.sisti@terceirizemais.com.br', '$2a$12$hash_criptografado', 'II', 'supervisor', 'ativo', '2025-09-04 15:22:05', '2025-09-04 15:22:05'),
(19, 'Eduardo Piana', 'eduardo.piana@terceirizemais.com.br', '$2a$12$m/UWMGinE1VLuUNIMpwq1eUC81kDo6NQLes63ZdQ4ixwQT7UUCJdC', 'II', 'administrativo', 'ativo', '2025-09-04 16:17:48', '2025-09-04 16:17:48');

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
-- Despejando dados para a tabela `usuarios_filiais`
--

INSERT INTO `usuarios_filiais` (`usuario_id`, `filial_id`, `data_vinculo`) VALUES
(19, 1, '2025-09-04 16:17:48'),
(19, 3, '2025-09-04 16:17:48');

-- --------------------------------------------------------

--
-- Estrutura para tabela `veiculos`
--

CREATE TABLE `veiculos` (
  `id` int NOT NULL,
  `placa` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `renavam` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `chassi` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `modelo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `marca` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fabricante` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ano_fabricacao` int DEFAULT NULL,
  `tipo_veiculo` enum('passeio','caminhao','moto','utilitario') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `carroceria` enum('Bau','Refrigerado','Bipartido','Grade Baixa','Sider','Graneleiro','Tanque','Cacamba') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `combustivel` enum('gasolina','diesel','etanol','flex','GNV','eletrico') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `categoria` enum('Frota','Agregado','Terceiro') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `capacidade_carga` decimal(10,2) DEFAULT NULL,
  `capacidade_volume` decimal(10,2) DEFAULT NULL,
  `numero_eixos` int DEFAULT NULL,
  `tara` decimal(10,2) DEFAULT NULL,
  `peso_bruto_total` decimal(10,2) DEFAULT NULL,
  `potencia_motor` decimal(8,2) DEFAULT NULL,
  `tipo_tracao` enum('4x2','4x4','dianteira','traseira') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quilometragem_atual` decimal(12,2) DEFAULT NULL,
  `data_emplacamento` date DEFAULT NULL,
  `vencimento_licenciamento` date DEFAULT NULL,
  `vencimento_ipva` date DEFAULT NULL,
  `vencimento_dpvat` date DEFAULT NULL,
  `numero_apolice_seguro` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `situacao_documental` enum('regular','alienado','bloqueado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `data_ultima_revisao` date DEFAULT NULL,
  `quilometragem_proxima_revisao` decimal(12,2) DEFAULT NULL,
  `data_ultima_troca_oleo` date DEFAULT NULL,
  `vencimento_alinhamento_balanceamento` date DEFAULT NULL,
  `proxima_inspecao_veicular` date DEFAULT NULL,
  `status` enum('ativo','inativo','manutencao') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `status_detalhado` enum('Ativo','Em manutencao','Alugado','Vendido') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `data_aquisicao` date DEFAULT NULL,
  `valor_compra` decimal(12,2) DEFAULT NULL,
  `fornecedor` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `numero_frota` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `situacao_financeira` enum('Proprio','Financiado','leasing') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `crlv_digitalizado` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `foto_frente` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `foto_traseira` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `foto_lateral` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `foto_interior` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contrato_seguro` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `filial_id` int DEFAULT NULL,
  `motorista_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `ajudantes`
--
ALTER TABLE `ajudantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpf` (`cpf`),
  ADD KEY `idx_ajudantes_nome` (`nome`),
  ADD KEY `idx_ajudantes_filial` (`filial_id`);

--
-- Índices de tabela `almoxarifados`
--
ALTER TABLE `almoxarifados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `filial_id` (`filial_id`);

--
-- Índices de tabela `almoxarifado_itens`
--
ALTER TABLE `almoxarifado_itens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_almoxarifado_produto` (`almoxarifado_id`,`produto_id`),
  ADD KEY `produto_id` (`produto_id`);

--
-- Índices de tabela `almoxarifado_unidades_escolares`
--
ALTER TABLE `almoxarifado_unidades_escolares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unidade_escolar_id` (`unidade_escolar_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Índices de tabela `auditoria_acoes`
--
ALTER TABLE `auditoria_acoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_auditoria_usuario` (`usuario_id`),
  ADD KEY `idx_auditoria_acao` (`acao`),
  ADD KEY `idx_auditoria_recurso` (`recurso`),
  ADD KEY `idx_auditoria_timestamp` (`timestamp`),
  ADD KEY `idx_auditoria_usuario_acao` (`usuario_id`,`acao`),
  ADD KEY `idx_auditoria_recurso_timestamp` (`recurso`,`timestamp`),
  ADD KEY `idx_auditoria_ip_timestamp` (`ip_address`,`timestamp`);

--
-- Índices de tabela `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_nome` (`nome`),
  ADD UNIQUE KEY `uk_codigo` (`codigo`),
  ADD KEY `idx_classes_nome` (`nome`),
  ADD KEY `idx_classes_subgrupo` (`subgrupo_id`),
  ADD KEY `idx_classes_status` (`status`);

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `efetivos`
--
ALTER TABLE `efetivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_unidade_escolar` (`unidade_escolar_id`),
  ADD KEY `idx_tipo_efetivo` (`tipo_efetivo`),
  ADD KEY `idx_intolerancia` (`intolerancia_id`);

--
-- Índices de tabela `filiais`
--
ALTER TABLE `filiais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_filiais_codigo` (`codigo_filial`);

--
-- Índices de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_nome` (`nome`),
  ADD UNIQUE KEY `uk_codigo` (`codigo`);

--
-- Índices de tabela `intolerancias`
--
ALTER TABLE `intolerancias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`);

--
-- Índices de tabela `marcas`
--
ALTER TABLE `marcas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_marcas_marca` (`marca`),
  ADD KEY `idx_marcas_fabricante` (`fabricante`),
  ADD KEY `idx_marcas_status` (`status`);

--
-- Índices de tabela `motoristas`
--
ALTER TABLE `motoristas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_motoristas_cnh_validade` (`cnh_validade`);

--
-- Índices de tabela `patrimonios`
--
ALTER TABLE `patrimonios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_patrimonio` (`numero_patrimonio`),
  ADD KEY `produto_id` (`produto_id`),
  ADD KEY `idx_tipo_local_origem` (`local_origem_id`),
  ADD KEY `idx_tipo_local_atual` (`local_atual_id`);

--
-- Índices de tabela `patrimonios_movimentacoes`
--
ALTER TABLE `patrimonios_movimentacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patrimonio_id` (`patrimonio_id`),
  ADD KEY `escola_origem_id` (`local_origem_id`),
  ADD KEY `escola_destino_id` (`local_destino_id`),
  ADD KEY `responsavel_id` (`responsavel_id`),
  ADD KEY `idx_tipo_local_origem` (`tipo_local_origem`,`local_origem_id`),
  ADD KEY `idx_tipo_local_destino` (`tipo_local_destino`,`local_destino_id`);

--
-- Índices de tabela `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_permissoes_usuario_usuario_id` (`usuario_id`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_produtos_nome` (`nome`),
  ADD KEY `idx_produtos_codigo_barras` (`codigo_barras`),
  ADD KEY `idx_produtos_referencia` (`referencia_interna`),
  ADD KEY `idx_produtos_referencia_externa` (`referencia_externa`),
  ADD KEY `idx_produtos_referencia_mercado` (`referencia_mercado`),
  ADD KEY `idx_produtos_fabricante` (`fabricante`),
  ADD KEY `idx_produtos_integracao_senior` (`integracao_senior`),
  ADD KEY `idx_produtos_ncm` (`ncm`),
  ADD KEY `idx_produtos_cest` (`cest`),
  ADD KEY `idx_produtos_ean` (`ean`),
  ADD KEY `idx_produtos_cst_icms` (`cst_icms`),
  ADD KEY `idx_produtos_csosn` (`csosn`),
  ADD KEY `idx_produtos_grupo` (`grupo_id`),
  ADD KEY `idx_produtos_subgrupo` (`subgrupo_id`),
  ADD KEY `idx_produtos_status` (`status`),
  ADD KEY `idx_produtos_classe_id` (`classe_id`),
  ADD KEY `idx_produtos_marca_id` (`marca_id`),
  ADD KEY `idx_produtos_codigo_produto` (`codigo_produto`),
  ADD KEY `idx_produtos_nome_generico` (`nome_generico_id`),
  ADD KEY `idx_produtos_fator_conversao` (`fator_conversao`),
  ADD KEY `idx_produtos_embalagem_secundaria` (`embalagem_secundaria_id`),
  ADD KEY `fk_produtos_origem` (`produto_origem_id`);

--
-- Índices de tabela `produto_generico`
--
ALTER TABLE `produto_generico`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_codigo_novo` (`codigo`),
  ADD KEY `unidade_medida_id` (`unidade_medida_id`),
  ADD KEY `idx_produto_generico_nome` (`nome`),
  ADD KEY `idx_produto_generico_status` (`status`),
  ADD KEY `idx_produto_generico_grupo` (`grupo_id`),
  ADD KEY `idx_produto_generico_subgrupo` (`subgrupo_id`),
  ADD KEY `idx_produto_generico_classe` (`classe_id`),
  ADD KEY `idx_produto_origem_id` (`produto_origem_id`);

--
-- Índices de tabela `produto_origem`
--
ALTER TABLE `produto_origem`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD UNIQUE KEY `uk_produto_origem_codigo` (`codigo`),
  ADD KEY `usuario_criador_id` (`usuario_criador_id`),
  ADD KEY `usuario_atualizador_id` (`usuario_atualizador_id`),
  ADD KEY `idx_produto_origem_codigo` (`codigo`),
  ADD KEY `idx_produto_origem_nome` (`nome`),
  ADD KEY `idx_produto_origem_unidade_medida_id` (`unidade_medida_id`),
  ADD KEY `idx_produto_origem_grupo_id` (`grupo_id`),
  ADD KEY `idx_produto_origem_subgrupo_id` (`subgrupo_id`),
  ADD KEY `idx_produto_origem_classe_id` (`classe_id`),
  ADD KEY `idx_produto_origem_status` (`status`);

--
-- Índices de tabela `rotas`
--
ALTER TABLE `rotas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_filial_id` (`filial_id`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tipo_rota` (`tipo_rota`);

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
  ADD KEY `idx_criado_em` (`criado_em`);

--
-- Índices de tabela `subgrupos`
--
ALTER TABLE `subgrupos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_nome` (`nome`),
  ADD UNIQUE KEY `uk_codigo` (`codigo`),
  ADD KEY `fk_subgrupos_grupo` (`grupo_id`);

--
-- Índices de tabela `unidades_escolares`
--
ALTER TABLE `unidades_escolares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_teknis` (`codigo_teknisa`),
  ADD KEY `idx_codigo_teknis` (`codigo_teknisa`),
  ADD KEY `idx_nome_escola` (`nome_escola`),
  ADD KEY `idx_cidade` (`cidade`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_rota_id` (`rota_id`),
  ADD KEY `idx_centro_distribuicao` (`centro_distribuicao`),
  ADD KEY `idx_regional` (`regional`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_ordem_entrega` (`ordem_entrega`),
  ADD KEY `fk_unidades_escolares_filial` (`filial_id`);

--
-- Índices de tabela `unidades_medida`
--
ALTER TABLE `unidades_medida`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_usuarios_email` (`email`);

--
-- Índices de tabela `usuarios_filiais`
--
ALTER TABLE `usuarios_filiais`
  ADD PRIMARY KEY (`usuario_id`,`filial_id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_filial_id` (`filial_id`);

--
-- Índices de tabela `veiculos`
--
ALTER TABLE `veiculos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `placa` (`placa`),
  ADD KEY `idx_veiculos_placa` (`placa`),
  ADD KEY `idx_veiculos_filial` (`filial_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `ajudantes`
--
ALTER TABLE `ajudantes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `almoxarifados`
--
ALTER TABLE `almoxarifados`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `almoxarifado_itens`
--
ALTER TABLE `almoxarifado_itens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `almoxarifado_unidades_escolares`
--
ALTER TABLE `almoxarifado_unidades_escolares`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `auditoria_acoes`
--
ALTER TABLE `auditoria_acoes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=794;

--
-- AUTO_INCREMENT de tabela `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `efetivos`
--
ALTER TABLE `efetivos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `filiais`
--
ALTER TABLE `filiais`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4404;

--
-- AUTO_INCREMENT de tabela `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `intolerancias`
--
ALTER TABLE `intolerancias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `marcas`
--
ALTER TABLE `marcas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `motoristas`
--
ALTER TABLE `motoristas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `patrimonios`
--
ALTER TABLE `patrimonios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `patrimonios_movimentacoes`
--
ALTER TABLE `patrimonios_movimentacoes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1533;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de tabela `produto_generico`
--
ALTER TABLE `produto_generico`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de tabela `produto_origem`
--
ALTER TABLE `produto_origem`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de tabela `rotas`
--
ALTER TABLE `rotas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `rotas_nutricionistas`
--
ALTER TABLE `rotas_nutricionistas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `subgrupos`
--
ALTER TABLE `subgrupos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `unidades_escolares`
--
ALTER TABLE `unidades_escolares`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT de tabela `unidades_medida`
--
ALTER TABLE `unidades_medida`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

-- --------------------------------------------------------

--
-- Estrutura para view `produtos_com_marcas`
--
DROP TABLE IF EXISTS `produtos_com_marcas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `produtos_com_marcas`  AS SELECT `p`.`id` AS `id`, `p`.`produto_origem_id` AS `produto_origem_id`, `p`.`codigo_produto` AS `codigo_produto`, `p`.`nome` AS `nome`, `p`.`codigo_barras` AS `codigo_barras`, `p`.`fator_conversao` AS `fator_conversao`, `p`.`referencia_interna` AS `referencia_interna`, `p`.`referencia_externa` AS `referencia_externa`, `p`.`referencia_mercado` AS `referencia_mercado`, `p`.`unidade_id` AS `unidade_id`, `p`.`grupo_id` AS `grupo_id`, `p`.`subgrupo_id` AS `subgrupo_id`, `p`.`classe_id` AS `classe_id`, `p`.`nome_generico_id` AS `nome_generico_id`, `p`.`marca_id` AS `marca_id`, `p`.`peso_liquido` AS `peso_liquido`, `p`.`peso_bruto` AS `peso_bruto`, `p`.`fabricante` AS `fabricante`, `p`.`informacoes_adicionais` AS `informacoes_adicionais`, `p`.`foto_produto` AS `foto_produto`, `p`.`prazo_validade` AS `prazo_validade`, `p`.`unidade_validade` AS `unidade_validade`, `p`.`regra_palet_un` AS `regra_palet_un`, `p`.`ficha_homologacao` AS `ficha_homologacao`, `p`.`registro_especifico` AS `registro_especifico`, `p`.`comprimento` AS `comprimento`, `p`.`largura` AS `largura`, `p`.`altura` AS `altura`, `p`.`volume` AS `volume`, `p`.`integracao_senior` AS `integracao_senior`, `p`.`ncm` AS `ncm`, `p`.`cest` AS `cest`, `p`.`cfop` AS `cfop`, `p`.`ean` AS `ean`, `p`.`cst_icms` AS `cst_icms`, `p`.`csosn` AS `csosn`, `p`.`aliquota_icms` AS `aliquota_icms`, `p`.`aliquota_ipi` AS `aliquota_ipi`, `p`.`aliquota_pis` AS `aliquota_pis`, `p`.`aliquota_cofins` AS `aliquota_cofins`, `p`.`status` AS `status`, `p`.`criado_em` AS `criado_em`, `p`.`atualizado_em` AS `atualizado_em`, `p`.`usuario_criador_id` AS `usuario_criador_id`, `p`.`usuario_atualizador_id` AS `usuario_atualizador_id`, `p`.`tipo_registro` AS `tipo_registro`, `p`.`embalagem_secundaria_id` AS `embalagem_secundaria_id`, `p`.`fator_conversao_embalagem` AS `fator_conversao_embalagem`, `m`.`marca` AS `nome_marca`, `m`.`fabricante` AS `fabricante_marca` FROM (`produtos` `p` left join `marcas` `m` on((`p`.`marca_id` = `m`.`id`))) ;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `almoxarifados`
--
ALTER TABLE `almoxarifados`
  ADD CONSTRAINT `almoxarifados_ibfk_1` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `almoxarifado_itens`
--
ALTER TABLE `almoxarifado_itens`
  ADD CONSTRAINT `almoxarifado_itens_ibfk_1` FOREIGN KEY (`almoxarifado_id`) REFERENCES `almoxarifados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `almoxarifado_itens_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE RESTRICT;

--
-- Restrições para tabelas `almoxarifado_unidades_escolares`
--
ALTER TABLE `almoxarifado_unidades_escolares`
  ADD CONSTRAINT `fk_almoxarifado_unidade_escolar` FOREIGN KEY (`unidade_escolar_id`) REFERENCES `unidades_escolares` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `auditoria_acoes`
--
ALTER TABLE `auditoria_acoes`
  ADD CONSTRAINT `auditoria_acoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `efetivos`
--
ALTER TABLE `efetivos`
  ADD CONSTRAINT `efetivos_ibfk_1` FOREIGN KEY (`unidade_escolar_id`) REFERENCES `unidades_escolares` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `efetivos_ibfk_2` FOREIGN KEY (`intolerancia_id`) REFERENCES `intolerancias` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `patrimonios`
--
ALTER TABLE `patrimonios`
  ADD CONSTRAINT `patrimonios_ibfk_1` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`);

--
-- Restrições para tabelas `patrimonios_movimentacoes`
--
ALTER TABLE `patrimonios_movimentacoes`
  ADD CONSTRAINT `patrimonios_movimentacoes_ibfk_1` FOREIGN KEY (`patrimonio_id`) REFERENCES `patrimonios` (`id`),
  ADD CONSTRAINT `patrimonios_movimentacoes_ibfk_4` FOREIGN KEY (`responsavel_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  ADD CONSTRAINT `permissoes_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `fk_produtos_origem` FOREIGN KEY (`produto_origem_id`) REFERENCES `produto_origem` (`id`),
  ADD CONSTRAINT `fk_produtos_unid_sec` FOREIGN KEY (`embalagem_secundaria_id`) REFERENCES `unidades_medida` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `rotas_nutricionistas`
--
ALTER TABLE `rotas_nutricionistas`
  ADD CONSTRAINT `fk_rotas_nutricionistas_coordenador` FOREIGN KEY (`coordenador_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rotas_nutricionistas_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rotas_nutricionistas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `subgrupos`
--
ALTER TABLE `subgrupos`
  ADD CONSTRAINT `fk_subgrupos_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `unidades_escolares`
--
ALTER TABLE `unidades_escolares`
  ADD CONSTRAINT `fk_unidades_escolares_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`),
  ADD CONSTRAINT `unidades_escolares_ibfk_1` FOREIGN KEY (`rota_id`) REFERENCES `rotas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `usuarios_filiais`
--
ALTER TABLE `usuarios_filiais`
  ADD CONSTRAINT `fk_usuarios_filiais_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuarios_filiais_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
