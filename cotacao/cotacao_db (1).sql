-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Tempo de geração: 21/07/2025 às 18:17
-- Versão do servidor: 8.0.42
-- Versão do PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `cotacao_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `cotacoes`
--

CREATE TABLE `cotacoes` (
  `id` int NOT NULL,
  `comprador` varchar(100) NOT NULL,
  `local_entrega` varchar(100) NOT NULL,
  `tipo_compra` enum('programada','emergencial') NOT NULL,
  `motivo_emergencial` varchar(255) DEFAULT NULL,
  `justificativa` text,
  `motivo_final` varchar(255) DEFAULT NULL,
  `status` enum('pendente','em_analise','aguardando_aprovacao','renegociacao','liberado_gerencia','aprovada','rejeitada') DEFAULT 'pendente',
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `total_produtos` int DEFAULT '0',
  `produtos_duplicados` int DEFAULT '0',
  `total_quantidade` int DEFAULT '0',
  `total_fornecedores` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `cotacoes`
--

INSERT INTO `cotacoes` (`id`, `comprador`, `local_entrega`, `tipo_compra`, `motivo_emergencial`, `justificativa`, `motivo_final`, `status`, `data_criacao`, `data_atualizacao`, `total_produtos`, `produtos_duplicados`, `total_quantidade`, `total_fornecedores`) VALUES
(10, 'Administrador', 'CD CURITIBANOS', 'programada', '', 'asdasd', 'Compra Programada', 'em_analise', '2025-07-14 22:47:57', '2025-07-19 23:53:25', 2, 0, 60, 1),
(11, 'Administrador', 'CD CURITIBANOS', 'programada', '', 'asdasd', 'Compra Programada', 'aguardando_aprovacao', '2025-07-19 18:59:27', '2025-07-19 23:37:38', 2, 0, 60, 1),
(12, 'Administrador', 'CD CHAPECO', 'programada', '', 'asdasdas', 'Compra Programada', 'renegociacao', '2025-07-19 21:45:03', '2025-07-19 22:31:22', 2, 0, 60, 1),
(153, 'Marcos Vinicius', 'CD CHAPECO', 'programada', '', '', 'Aprovado', 'aprovada', '2025-05-15 16:13:27', '2025-05-22 17:03:04', 13, 0, 2228, 3),
(154, 'Marcos Vinicius', 'CD CHAPECO', 'programada', '', '', 'Aprovado', 'aprovada', '2025-05-21 19:52:46', '2025-05-22 17:03:21', 3, 0, 332, 1),
(155, 'Marcos Vinicius', 'CD CHAPECO', 'programada', '', '', 'Aprovado', 'aprovada', '2025-05-22 14:45:35', '2025-05-22 17:03:41', 1, 0, 2, 1),
(156, 'Danielle Ferreira', 'CD CHAPECO', 'programada', '', '', 'Aprovado', 'aprovada', '2025-05-22 16:38:26', '2025-05-22 17:04:31', 9, 0, 21, 3),
(160, 'Danielle Ferreira', 'CD CHAPECO', 'programada', '', '', 'Aguardando Aprova????o', 'aguardando_aprovacao', '2025-05-23 18:54:20', '2025-05-23 18:54:20', 50, 0, 91970, 5),
(162, 'Eliane Sup', 'CD CHAPECO', 'programada', '', '', 'Em An??lise', 'em_analise', '2025-05-23 19:35:28', '2025-05-23 19:35:28', 4, 0, 2400, 2),
(163, 'Danielle Ferreira', 'CD CHAPECO', 'programada', '', '', 'Aprovado', 'aprovada', '2025-04-30 16:12:25', '2025-06-04 13:29:04', 29, 0, 86774, 20),
(164, 'Danielle Ferreira', 'CD CURITIBANOS', 'programada', '', '', 'Aprovado', 'aprovada', '2025-04-30 16:12:25', '2025-06-04 15:08:35', 23, 0, 49230, 16),
(168, 'Marcos Vinicius', 'MANUTEN????O CHAPECO', 'programada', '', '', 'Aprovado', 'aprovada', '2025-06-04 12:24:05', '2025-06-18 14:08:24', 0, 0, NULL, 0),
(169, 'Marcos Vinicius', 'MANUTEN????O CHAPECO', 'programada', '', '', 'Aprovado', 'aprovada', '2025-06-13 15:16:42', '2025-06-13 15:24:34', 4, 0, 34, 1),
(170, 'Marcos Vinicius', 'MANUTEN????O CHAPECO', 'programada', '', '', 'Aprovado', 'aprovada', '2025-06-25 18:04:39', '2025-06-30 11:50:43', 0, 0, NULL, 0),
(171, 'Eliane Sup', 'CD CURITIBANOS', 'programada', '', '', 'Aprovado', 'aprovada', '2025-07-01 16:41:37', '2025-07-01 19:19:12', 0, 0, NULL, 0),
(172, 'Eliane Sup', 'CD CHAPECO', 'programada', '', '', 'Renegocia????o', 'renegociacao', '2025-07-02 17:28:14', '2025-07-02 17:28:14', 23, 0, 2332, 6),
(173, 'Eliane Sup', 'CD CURITIBANOS', 'programada', '', '', 'Aguardando Aprova????o', 'aguardando_aprovacao', '2025-07-03 11:33:26', '2025-07-03 11:33:26', 42, 0, 42360, 11),
(174, 'Marcos Vinicius', 'MANUTEN????O CHAPECO', 'programada', '', '', 'Renegocia????o', 'renegociacao', '2025-07-03 16:40:16', '2025-07-03 16:40:16', 2, 0, 7, 1),
(175, 'Eliane Sup', 'CD CHAPECO', 'programada', '', '', 'Pendente', 'pendente', '2025-07-04 14:30:16', '2025-07-04 14:30:16', 77, 0, 109590, 10),
(176, 'Administrador', 'CD CHAPECO', 'programada', '', '', 'Pendente', 'pendente', '2025-07-07 09:17:16', '2025-07-07 09:17:16', 1, 0, 50, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `fornecedores`
--

CREATE TABLE `fornecedores` (
  `id` int NOT NULL,
  `cotacao_id` int NOT NULL,
  `fornecedor_id` varchar(100) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `tipo_frete` varchar(10) DEFAULT NULL,
  `valor_frete` decimal(12,2) DEFAULT '0.00',
  `prazo_pagamento` varchar(100) DEFAULT NULL,
  `frete` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `fornecedores`
--

INSERT INTO `fornecedores` (`id`, `cotacao_id`, `fornecedor_id`, `nome`, `tipo_frete`, `valor_frete`, `prazo_pagamento`, `frete`) VALUES
(8, 10, 'forn_1752533422086_7bmfxris9', 'FRIGELAR', NULL, 0.00, NULL, NULL),
(9, 10, 'forn_1752535480325_zex04pabm', 'MEPAR', NULL, 0.00, NULL, NULL),
(10, 11, 'forn_1752951723402_psarb0rs5', 'asdasdads', NULL, 0.00, NULL, NULL),
(11, 12, 'forn_1752961488819_93wymbmjs', 'asdasdasd', NULL, 0.00, NULL, NULL),
(393, 155, 'forn_1753023793_c8f9c45f', 'CRISTAL', NULL, 0.00, '28', '0.00'),
(394, 156, 'forn_1753023793_83893027', 'CASA DO EPI', NULL, 0.00, '30', '0.00'),
(395, 156, 'forn_1753023793_183f4d9d', 'SESEG EPI', NULL, 0.00, '30', '0.00'),
(396, 156, 'forn_1753023793_4f133b33', 'PINGO', NULL, 0.00, '28', '0.00'),
(397, 153, 'forn_1753023793_59bb86b1', 'MEPAR', NULL, 0.00, '15/28/56', '0.00'),
(398, 153, 'forn_1753023793_63f0a7dc', 'MAQDIMA', NULL, 0.00, '30', '0.00'),
(399, 153, 'forn_1753023793_7a191fb1', 'DISMAFF', NULL, 0.00, '', '0.00'),
(400, 154, 'forn_1753023793_011528db', 'ALLOY', NULL, 0.00, '20/40/60', '0.00'),
(401, 162, 'forn_1753023793_5e89229e', 'LIGIA', NULL, 0.00, '7', '0.00'),
(402, 162, 'forn_1753023793_beec0e7f', 'MARILENE', NULL, 0.00, '7', '0.00'),
(403, 160, 'forn_1753023793_5c547f37', 'ARROZ FAZENDA', NULL, 0.00, '28/35/42/56', '0.00'),
(404, 160, 'forn_1753023793_0cd0779e', 'BRINGHENTTI', NULL, 0.00, '28/35/42', '0.00'),
(405, 160, 'forn_1753023793_756f6310', 'COPAVIDI', NULL, 0.00, '28/35/42', '0.00'),
(406, 160, 'forn_1753023793_c9de16e7', 'REALTA', NULL, 0.00, '21/28', '0.00'),
(407, 160, 'forn_1753023793_7813211a', 'SUL MEL', NULL, 0.00, '28 DIAS ', '0.00'),
(408, 163, 'forn_1753023793_dd6d1440', 'COOPEROESTE', NULL, 0.00, '21/28/35', '0.00'),
(409, 163, 'forn_1753023793_7813211a', 'SUL MEL', NULL, 0.00, '28 DIAS', '0.00'),
(410, 163, 'forn_1753023793_cfad27e0', 'TOZZO', NULL, 0.00, '28 DIAS ', '0.00'),
(411, 163, 'forn_1753023793_328e8f95', 'ALBERT', NULL, 0.00, '21/28/35/42', '0.00'),
(412, 163, 'forn_1753023793_0cd0779e', 'BRINGHENTTI', NULL, 0.00, '21/28/35/42', '0.00'),
(413, 163, 'forn_1753023793_9ebcd89a', 'APTI', NULL, 0.00, '28 DIAS', '0.00'),
(414, 163, 'forn_1753023793_2b48cef2', 'TECELAGEM MARTINS', NULL, 0.00, '35 DIAS ', '0.00'),
(415, 163, 'forn_1753023793_bbee0d04', 'AURI VERDE', NULL, 0.00, '28 DIAS ', '0.00'),
(416, 163, 'forn_1753023793_612502fd', 'ONFINITY', NULL, 0.00, '28/42/56', '0.00'),
(417, 163, 'forn_1753023793_f6856826', 'DVILLE', NULL, 0.00, '28/35/42', '0.00'),
(418, 163, 'forn_1753023793_f9aac9e7', 'COOPERFAVI', NULL, 0.00, '28/35/42', '0.00'),
(419, 163, 'forn_1753023793_2aa7027a', 'RAMPINELI', NULL, 0.00, '28/35/42', '0.00'),
(420, 163, 'forn_1753023793_6a47ed4e', 'DAJU', NULL, 0.00, '28/35/42', '0.00'),
(421, 163, 'forn_1753023793_048d2613', 'ZAVASKI', NULL, 0.00, '28/35/43', '0.00'),
(422, 163, 'forn_1753023793_9151be7f', 'MUFFATO', NULL, 0.00, '21/28/35', '0.00'),
(423, 163, 'forn_1753023793_cd91cb91', 'TAF', NULL, 0.00, '21/28', '0.00'),
(424, 163, 'forn_1753023793_cdcb42d9', 'BAIA NORTE', NULL, 0.00, '21/28', '0.00'),
(425, 163, 'forn_1753023793_446c6c15', 'NUTYLAC', NULL, 0.00, '28 DIAS', '0.00'),
(426, 163, 'forn_1753023793_804c7a16', 'DIFIORI', NULL, 0.00, '45 dias', '0.00'),
(427, 163, 'forn_1753023793_756f6310', 'COPAVIDI', NULL, 0.00, '21/28/35/42', '0.00'),
(428, 164, 'forn_1753023793_dd6d1440', 'COOPEROESTE', NULL, 0.00, '21/28/35', '0.00'),
(429, 164, 'forn_1753023793_7813211a', 'SUL MEL', NULL, 0.00, '28 DIAS', '0.00'),
(430, 164, 'forn_1753023793_cfad27e0', 'TOZZO', NULL, 0.00, '28 DIAS ', '0.00'),
(431, 164, 'forn_1753023793_328e8f95', 'ALBERT', NULL, 0.00, '21/28/35/42', '0.00'),
(432, 164, 'forn_1753023793_0cd0779e', 'BRINGHENTTI', NULL, 0.00, '21/28/35/42', '0.00'),
(433, 164, 'forn_1753023793_9ebcd89a', 'APTI', NULL, 0.00, '28 DIAS', '0.00'),
(434, 164, 'forn_1753023793_2b48cef2', 'TECELAGEM MARTINS', NULL, 0.00, '35 DIAS ', '0.00'),
(435, 164, 'forn_1753023793_bbee0d04', 'AURI VERDE', NULL, 0.00, '28 DIAS ', '0.00'),
(436, 164, 'forn_1753023793_612502fd', 'ONFINITY', NULL, 0.00, '28/42/56', '0.00'),
(437, 164, 'forn_1753023793_f6856826', 'DVILLE', NULL, 0.00, '28/35/42', '0.00'),
(438, 164, 'forn_1753023793_f9aac9e7', 'COOPERFAVI', NULL, 0.00, '28/35/42', '0.00'),
(439, 164, 'forn_1753023793_2aa7027a', 'RAMPINELI', NULL, 0.00, '28/35/42', '0.00'),
(440, 164, 'forn_1753023793_6a47ed4e', 'DAJU', NULL, 0.00, '28/35/42', '0.00'),
(441, 164, 'forn_1753023793_9151be7f', 'MUFFATO', NULL, 0.00, '21/28/35', '0.00'),
(442, 164, 'forn_1753023793_cd91cb91', 'TAF', NULL, 0.00, '21/28', '0.00'),
(443, 164, 'forn_1753023793_cdcb42d9', 'BAIA NORTE', NULL, 0.00, '21/28', '0.00'),
(444, 169, 'forn_1753023793_b0955496', 'DOBRAPERFIL', NULL, 0.00, '14/28', '0.00'),
(445, 172, 'forn_1753023793_508a1b6c', 'ALBERTI', NULL, 0.00, '28/35', '0.00'),
(446, 172, 'forn_1753023793_928d875e', 'SAO JOAO', NULL, 0.00, '28/35', '0.00'),
(447, 172, 'forn_1753023793_bb6a373e', 'AMINNA', NULL, 0.00, '21', '0.00'),
(448, 172, 'forn_1753023793_6b77ac10', 'SQ SUPERMERCADO', NULL, 0.00, '28', '0.00'),
(449, 172, 'forn_1753023793_bfe15e3a', 'GIRASSOL ALIMENTOS', NULL, 0.00, '28', '0.00'),
(450, 172, 'forn_1753023793_23632af8', 'SUPERALDA', NULL, 0.00, '30', '0.00'),
(451, 173, 'forn_1753023793_2cb2e41f', 'KIN ALIMENTOS', NULL, 0.00, '28/35/42', '0.00'),
(452, 173, 'forn_1753023793_dcb38b80', 'RB CARNES', NULL, 0.00, '14/21', '0.00'),
(453, 173, 'forn_1753023793_edadc4b4', 'VARPI CARNES', NULL, 0.00, '14', '0.00'),
(454, 173, 'forn_1753023793_5e4046f3', 'SABADI CARNES', NULL, 0.00, '28/35', '0.00'),
(455, 173, 'forn_1753023793_e315e003', 'VENEZA', NULL, 0.00, '28/35', '0.00'),
(456, 173, 'forn_1753023793_c1e02231', 'LASAROLI ALIMENTOS', NULL, 0.00, '28/35', '0.00'),
(457, 173, 'forn_1753023793_4323e815', 'OESA', NULL, 0.00, '21/28', '0.00'),
(458, 173, 'forn_1753023793_cd0c6595', 'FINCO', NULL, 0.00, '14/21', '0.00'),
(459, 173, 'forn_1753023793_6528acfd', 'ITALIA', NULL, 0.00, '14/21', '0.00'),
(460, 173, 'forn_1753023793_3ada8874', 'LASAROLI', NULL, 0.00, '28/35', '0.00'),
(461, 173, 'forn_1753023793_09a1ac4c', 'SAMARA', NULL, 0.00, '28', '0.00'),
(462, 174, 'forn_1753023793_b772de76', 'DOBRA PERIL', NULL, 0.00, '14', '0.00'),
(463, 175, 'forn_1753023793_7422993d', 'KING ALIMENTOS', NULL, 0.00, '28/35/42', '0.00'),
(464, 175, 'forn_1753023793_c8ee22e1', 'RB', NULL, 0.00, '14/21', '0.00'),
(465, 175, 'forn_1753023793_edadc4b4', 'VARPI CARNES', NULL, 0.00, '14', '0.00'),
(466, 175, 'forn_1753023793_8f85c622', 'SABADINI CARNES', NULL, 0.00, '28/35', '0.00'),
(467, 175, 'forn_1753023793_d1e185a7', 'ALESSI CARNES', NULL, 0.00, '14/21/28', '0.00'),
(468, 175, 'forn_1753023793_ddba2c81', 'FINCO ALIMENTOS', NULL, 0.00, '14/21', '0.00'),
(469, 175, 'forn_1753023793_4323e815', 'OESA', NULL, 0.00, '21/28', '0.00'),
(470, 175, 'forn_1753023793_87c49f51', 'COASUL', NULL, 0.00, '14/21', '0.00'),
(471, 175, 'forn_1753023793_6528acfd', 'ITALIA', NULL, 0.00, '14/21', '0.00'),
(472, 175, 'forn_1753023793_09a1ac4c', 'SAMARA', NULL, 0.00, '2/8', '0.00'),
(473, 176, 'forn_1753023793_59bb86b1', 'MEPAR', NULL, 0.00, '', '0.00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int NOT NULL,
  `cotacao_id` int NOT NULL,
  `produto_id` varchar(100) NOT NULL,
  `id_original` int DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `qtde` decimal(12,2) NOT NULL,
  `un` varchar(20) DEFAULT NULL,
  `entrega` varchar(100) DEFAULT NULL,
  `prazo_entrega` varchar(100) DEFAULT NULL,
  `is_duplicado` tinyint(1) DEFAULT '0',
  `produtos_originais` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `cotacao_id`, `produto_id`, `id_original`, `nome`, `qtde`, `un`, `entrega`, `prazo_entrega`, `is_duplicado`, `produtos_originais`) VALUES
(17, 10, 'prod_1283594267_1752533419136', 1, 'ABRACADEIRA 14 X 22 MM', 50.00, 'UN', '06/06/2025', '06/06/2025', 0, '[1]'),
(18, 10, 'prod_1781283118_1752533419136', 2, 'ALCA CORPO CANNER', 10.00, 'UN', '06/06/2025', '06/06/2025', 0, '[2]'),
(19, 11, 'prod_1283594267_1752951719438', 1, 'ABRACADEIRA 14 X 22 MM', 50.00, 'UN', '06/06/2025', '06/06/2025', 0, '[1]'),
(20, 11, 'prod_1781283118_1752951719438', 2, 'ALCA CORPO CANNER', 10.00, 'UN', '06/06/2025', '06/06/2025', 0, '[2]'),
(21, 12, 'prod_1283594267_1752961486511', 1, 'ABRACADEIRA 14 X 22 MM', 50.00, 'UN', '06/06/2025', '06/06/2025', 0, '[1]'),
(22, 12, 'prod_1781283118_1752961486511', 2, 'ALCA CORPO CANNER', 10.00, 'UN', '06/06/2025', '06/06/2025', 0, '[2]'),
(1556, 153, 'prod_1_1753023793', 1, 'BROCA ACO RAPIDO 4,25MM', 8.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[1]'),
(1557, 153, 'prod_2_1753023793', 2, 'BROCA P/ CONCRETO 6,0MM', 4.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[2]'),
(1558, 153, 'prod_3_1753023793', 3, 'DISCO DE CORTE 4.1/2\" X 1/16\" X 7/8\"', 20.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[3]'),
(1559, 153, 'prod_4_1753023793', 4, 'DOBRADICA PINO SOLTO ALUMINIO 64X40', 60.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[4]'),
(1560, 153, 'prod_5_1753023793', 5, 'FECHO MAGNETICO C/ BATENTE 2 FUROS BRANCO', 20.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[5]'),
(1561, 153, 'prod_6_1753023793', 6, 'PUXADOR U - NORMAL ZINCADO', 30.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[6]'),
(1562, 153, 'prod_7_1753023793', 7, 'REBITE 4,0 X 12,7MM', 2000.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[7]'),
(1563, 153, 'prod_8_1753023793', 8, 'SILICONE PU 44', 2.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[8]'),
(1564, 153, 'prod_9_1753023793', 9, 'SILICONE TRANSPARENTE', 20.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[9]'),
(1565, 153, 'prod_10_1753023793', 10, 'SILICONE TRANSPARENTE', 20.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[10]'),
(1566, 153, 'prod_11_1753023793', 11, 'BROCA P/ CONCRETO 6,0MM', 4.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[11]'),
(1567, 153, 'prod_12_1753023793', 12, 'DISCO DE CORTE 4.1/2\" X 1/16\" X 7/8\"', 20.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[12]'),
(1568, 153, 'prod_13_1753023793', 13, 'SILICONE TRANSPARENTE', 20.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[13]'),
(1569, 154, 'prod_1_1753023793', 1, 'GUARNICAO ENGATE LINHA 20', 150.00, 'MT', 'PRONTA ENTREGA', NULL, 0, '[1]'),
(1570, 154, 'prod_2_1753023793', 2, 'TELA MOSQUETEIRA CINZA 1,5 X 100 MT', 150.00, 'MT', 'PRONTA ENTREGA', NULL, 0, '[2]'),
(1571, 154, 'prod_3_1753023793', 3, 'TUBO DE ALUMINIO 6060 ANOD FOSCO 6MT', 32.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[3]'),
(1572, 155, 'prod_1_1753023793', 1, 'RESISTENCIA FORNO ELETRICO 3300W', 2.00, 'UN', 'PRONTA ENTREGA', NULL, 0, '[1]'),
(1573, 156, 'prod_1_1753023793', 1, 'BOTINA DE SEGURANCA C/ BICO PVC N44', 1.00, 'UN', '1', NULL, 0, '[1]'),
(1574, 156, 'prod_2_1753023793', 2, 'CALCA DE BRIM CINZA TAM. EXG', 3.00, 'UN', '1', NULL, 0, '[2]'),
(1575, 156, 'prod_3_1753023793', 3, 'CALCA DE BRIM CINZA TAM. GG', 3.00, 'UN', '1', NULL, 0, '[3]'),
(1576, 156, 'prod_4_1753023793', 4, 'BOTINA DE SEGURANCA C/ BICO PVC N44', 1.00, 'UN', '2', NULL, 0, '[4]'),
(1577, 156, 'prod_5_1753023793', 5, 'CALCA DE BRIM CINZA TAM. EXG', 3.00, 'UN', '2', NULL, 0, '[5]'),
(1578, 156, 'prod_6_1753023793', 6, 'CALCA DE BRIM CINZA TAM. GG', 3.00, 'UN', '2', NULL, 0, '[6]'),
(1579, 156, 'prod_7_1753023793', 7, 'BOTINA DE SEGURANCA C/ BICO PVC N44', 1.00, 'UN', '1', NULL, 0, '[7]'),
(1580, 156, 'prod_8_1753023793', 8, 'CALCA DE BRIM CINZA TAM. EXG', 3.00, 'UN', '1', NULL, 0, '[8]'),
(1581, 156, 'prod_9_1753023793', 9, 'CALCA DE BRIM CINZA TAM. GG', 3.00, 'UN', '1', NULL, 0, '[9]'),
(1582, 160, 'prod_1_1753023793', 1, 'ARROZ INTEGRAL 1 KG - PCT', 1400.00, 'PC', '7 DIAS ', '7 DIAS ', 0, '[1]'),
(1583, 160, 'prod_2_1753023793', 2, 'ARROZ PARBOILIZADO 1 KG - PCT', 6500.00, 'PC', '7 DIAS ', '7 DIAS ', 0, '[2]'),
(1584, 160, 'prod_3_1753023793', 3, 'ARROZ INTEGRAL 1 KG - PCT', 2000.00, 'PC', '7 DIAS ', NULL, 0, '[3]'),
(1585, 160, 'prod_4_1753023793', 4, 'ARROZ INTEGRAL 1 KG - PCT', 1400.00, 'PC', '7 DIAS ', NULL, 0, '[4]'),
(1586, 160, 'prod_5_1753023793', 5, 'ARROZ PARBOILIZADO 1 KG - PCT', 6500.00, 'PC', '7 DIAS ', NULL, 0, '[5]'),
(1587, 160, 'prod_6_1753023793', 6, 'AMIDO DE MILHO 1 KG - PCT', 250.00, 'PC', '2 dias ', '2 dias ', 0, '[6]'),
(1588, 160, 'prod_7_1753023793', 7, 'OREGANO MOIDO 10 G - PCT', 340.00, 'PC', '2 dias ', '2 dias ', 0, '[7]'),
(1589, 160, 'prod_8_1753023793', 8, 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 6000.00, 'LT', '2 dias ', '2 dias ', 0, '[8]'),
(1590, 160, 'prod_9_1753023793', 9, 'AMIDO DE MILHO 1 KG - PCT', 250.00, 'PC', '2 dias ', NULL, 0, '[9]'),
(1591, 160, 'prod_10_1753023793', 10, 'ARROZ INTEGRAL 1 KG - PCT', 1400.00, 'PC', '2 dias ', '2 dias ', 0, '[10]'),
(1592, 160, 'prod_11_1753023793', 11, 'ARROZ PARBOILIZADO 1 KG - PCT', 6500.00, 'PC', '2 dias ', '2 dias ', 0, '[11]'),
(1593, 160, 'prod_12_1753023793', 12, 'FEIJAO PRETO 1 KG  - PCT', 4000.00, 'PC', '2 dias ', '2 dias ', 0, '[12]'),
(1594, 160, 'prod_13_1753023793', 13, 'FARINHA DE MANDIOCA 1 KG - PCT', 600.00, 'PC', '2 dias ', '2 dias ', 0, '[13]'),
(1595, 160, 'prod_14_1753023793', 14, 'FUBA 1 KG - PCT', 600.00, 'PC', '2 dias ', '2 dias ', 0, '[14]'),
(1596, 160, 'prod_15_1753023793', 15, 'FARINHA DE TRIGO 1 KG - PCT', 2200.00, 'PC', '2 dias ', '2 dias ', 0, '[15]'),
(1597, 160, 'prod_16_1753023793', 16, 'FARINHA DE TRIGO INTEGRAL 1 KG - PCT', 100.00, 'PC', '2 dias ', '2 dias ', 0, '[16]'),
(1598, 160, 'prod_17_1753023793', 17, 'MACARRAO ESPAGUETE C/OVOS 500 G - PCT', 4800.00, 'PC', '2 dias ', '2 dias ', 0, '[17]'),
(1599, 160, 'prod_18_1753023793', 18, 'COLORAU EM PO 500 G - PCT', 500.00, 'UN', '2 dias ', '2 dias ', 0, '[18]'),
(1600, 160, 'prod_19_1753023793', 19, 'VINAGRE DE ALCOOL 900 ML - UND', 1200.00, 'UN', '2 dias ', '2 dias ', 0, '[19]'),
(1601, 160, 'prod_20_1753023793', 20, 'OLEO DE SOJA 900 ML - UND', 1700.00, 'UN', '2 dias ', '2 dias ', 0, '[20]'),
(1602, 160, 'prod_21_1753023793', 21, 'ARROZ INTEGRAL 1 KG - PCT', 2000.00, 'PC', '2 dias ', NULL, 0, '[21]'),
(1603, 160, 'prod_22_1753023793', 22, 'CAFE EM PO 500 G - PCT', 760.00, 'PC', '2 dias ', '2 dias ', 0, '[22]'),
(1604, 160, 'prod_23_1753023793', 23, 'FEIJAO PRETO 1 KG  - PCT', 2000.00, 'PC', '2 dias ', NULL, 0, '[23]'),
(1605, 160, 'prod_24_1753023793', 24, 'FARINHA DE MANDIOCA 1 KG - PCT', 600.00, 'PC', '2 dias ', NULL, 0, '[24]'),
(1606, 160, 'prod_25_1753023793', 25, 'CANELA EM PO 30 G - PCT', 1500.00, 'PC', '2 dias ', '2 dias ', 0, '[25]'),
(1607, 160, 'prod_26_1753023793', 26, 'SAL REFINADO 1 KG - PCT', 1500.00, 'PC', '2 dias ', '2 dias ', 0, '[26]'),
(1608, 160, 'prod_27_1753023793', 27, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 1500.00, 'PC', '2 dias ', '2 dias ', 0, '[27]'),
(1609, 160, 'prod_28_1753023793', 28, 'MEL DE ABELHAS 1 KG - PT', 270.00, 'PT', '2 dias ', '2 dias ', 0, '[28]'),
(1610, 160, 'prod_29_1753023793', 29, 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 6000.00, 'LT', '2 dias ', NULL, 0, '[29]'),
(1611, 160, 'prod_30_1753023793', 30, 'ARROZ INTEGRAL 1 KG - PCT', 1400.00, 'PC', '2 dias ', NULL, 0, '[30]'),
(1612, 160, 'prod_31_1753023793', 31, 'ARROZ PARBOILIZADO 1 KG - PCT', 6500.00, 'PC', '2 dias ', NULL, 0, '[31]'),
(1613, 160, 'prod_32_1753023793', 32, 'FEIJAO PRETO 1 KG  - PCT', 1500.00, 'PC', '2 dias ', NULL, 0, '[32]'),
(1614, 160, 'prod_33_1753023793', 33, 'FARINHA DE TRIGO 1 KG - PCT', 2200.00, 'PC', '2 dias ', NULL, 0, '[33]'),
(1615, 160, 'prod_34_1753023793', 34, 'TRIGO PARA QUIBE 500 G - PCT', 150.00, 'PC', '2 dias ', '2 dias ', 0, '[34]'),
(1616, 160, 'prod_35_1753023793', 35, 'COLORAU EM PO 500 G - PCT', 500.00, 'UN', '2 dias ', NULL, 0, '[35]'),
(1617, 160, 'prod_36_1753023793', 36, 'OREGANO MOIDO 10 G - PCT', 340.00, 'PC', '2 dias ', NULL, 0, '[36]'),
(1618, 160, 'prod_37_1753023793', 37, 'FERMENTO QUIMICO EM PO 200 G - UND', 600.00, 'UN', '2 dias ', '2 dias ', 0, '[37]'),
(1619, 160, 'prod_38_1753023793', 38, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 1500.00, 'PC', '2 dias ', NULL, 0, '[38]'),
(1620, 160, 'prod_39_1753023793', 39, 'OLEO DE SOJA 900 ML - UND', 1700.00, 'UN', '2 dias ', NULL, 0, '[39]'),
(1621, 160, 'prod_40_1753023793', 40, 'FEIJAO PRETO 1 KG  - PCT', 4000.00, 'PC', '2 dias ', NULL, 0, '[40]'),
(1622, 160, 'prod_41_1753023793', 41, 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 200.00, 'PC', '2 dias ', '2 dias ', 0, '[41]'),
(1623, 160, 'prod_42_1753023793', 42, 'COLORAU EM PO 500 G - PCT', 400.00, 'UN', '7 DIAS ', '7 DIAS ', 0, '[42]'),
(1624, 160, 'prod_43_1753023793', 43, 'DOCE DE BANANA ORGANICO 400 G - PT', 40.00, 'PT', '7 DIAS ', '7 DIAS ', 0, '[43]'),
(1625, 160, 'prod_44_1753023793', 44, 'DOCE DE MORANGO ORGANICO 1 KG - PT', 30.00, 'PT', '7 DIAS ', '7 DIAS ', 0, '[44]'),
(1626, 160, 'prod_45_1753023793', 45, 'CANELA EM PO 30 G - PCT', 1500.00, 'PC', '7 DIAS ', '7 DIAS ', 0, '[45]'),
(1627, 160, 'prod_46_1753023793', 46, 'MEL DE ABELHAS 1 KG - PT', 270.00, 'PT', '7 DIAS ', '7 DIAS ', 0, '[46]'),
(1628, 160, 'prod_47_1753023793', 47, 'FARINHA DE TRIGO 1 KG - PCT', 2200.00, 'PC', '7 DIAS ', '7 DIAS ', 0, '[47]'),
(1629, 160, 'prod_48_1753023793', 48, 'FARINHA DE TRIGO INTEGRAL 1 KG - PCT', 100.00, 'PC', '7 DIAS ', '7 DIAS ', 0, '[48]'),
(1630, 160, 'prod_49_1753023793', 49, 'FARINHA DE TRIGO 1 KG - PCT', 2200.00, 'PC', '7 DIAS ', NULL, 0, '[49]'),
(1631, 160, 'prod_50_1753023793', 50, 'MEL DE ABELHAS 1 KG - PT', 270.00, 'PT', '7 DIAS ', '7 DIAS ', 0, '[50]'),
(1632, 162, 'prod_1_1753023793', 1, 'PINHAO CONGELADO 1 KG - PCT', 600.00, 'PC', '5', '5', 0, '[1]'),
(1633, 162, 'prod_2_1753023793', 2, 'PINHAO CONGELADO 1 KG - PCT', 600.00, 'PC', '5', '5', 0, '[2]'),
(1634, 162, 'prod_3_1753023793', 3, 'PINHAO CONGELADO 1 KG - PCT', 600.00, 'PC', '5', '5', 0, '[3]'),
(1635, 162, 'prod_4_1753023793', 4, 'PINHAO CONGELADO 1 KG - PCT', 600.00, 'PC', '5', '5', 0, '[4]'),
(1636, 163, 'prod_1_1753023793', 1, 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 12240.00, 'LT', '14/05/2025', '28/05/2025', 0, '[1]'),
(1637, 163, 'prod_2_1753023793', 2, 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 8640.00, 'LT', '28/05/2025', '28/05/2025', 0, '[2]'),
(1638, 163, 'prod_1_1753023793', 1, 'MEL DE ABELHAS 1 KG - PT', 180.00, 'PT', '14/05/2025', '28/05/2025', 0, '[1]'),
(1639, 163, 'prod_2_1753023793', 2, 'MEL DE ABELHAS 1 KG - PT', 100.00, 'PT', '28/05/2025', '28/05/2025', 0, '[2]'),
(1640, 163, 'prod_8_1753023793', 8, 'FOSFORO 40 PALITOS - PC 10 CX', 140.00, 'CX', '14/05/2025', '14/05/2025', 0, '[8]'),
(1641, 163, 'prod_10_1753023793', 10, 'TRIGO PARA QUIBE', 50.00, 'UN', '14/05/2026', '14/05/2026', 0, '[10]'),
(1642, 163, 'prod_14_1753023793', 14, 'SAL REFINADO 1 KG - PCT', 900.00, 'PC', '14/05/2025', '28/05/2025', 0, '[14]'),
(1643, 163, 'prod_38_1753023793', 38, 'AVEIA EM FLOCOS 500 G - PCT', 300.00, 'PC', '21/05/2025', '21/05/2025', 0, '[38]'),
(1644, 163, 'prod_53_1753023793', 53, 'SAL REFINADO 1 KG - PCT', 900.00, 'PC', '28/05/2025', '28/05/2025', 0, '[53]'),
(1645, 163, 'prod_2_1753023793', 2, 'MACARRAO CONCHINHA C/OVOS 500 G - PCT', 2000.00, 'PC', '07/05/2025', '28/05/2025', 0, '[2]'),
(1646, 163, 'prod_6_1753023793', 6, 'CAFE EM PO 500 G - PCT', 600.00, 'PC', '14/05/2025', '28/05/2025', 0, '[6]'),
(1647, 163, 'prod_17_1753023793', 17, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 1300.00, 'PC', '14/05/2025', '04/06/2025', 0, '[17]'),
(1648, 163, 'prod_18_1753023793', 18, 'OLEO DE SOJA 900 ML - UND', 2000.00, 'UN', '14/05/2025', '28/05/2025', 0, '[18]'),
(1649, 163, 'prod_19_1753023793', 19, 'GUARDANAPO 19.5 X 19.5 PCT 50 UND - PCT', 2500.00, 'PC', '14/05/2025', '14/05/2025', 0, '[19]'),
(1650, 163, 'prod_21_1753023793', 21, 'SACO DE AMOSTRA C/ 500 UN - PCT', 150.00, 'PC', '14/05/2025', '14/05/2025', 0, '[21]'),
(1651, 163, 'prod_27_1753023793', 27, 'PANO DE LIMPEZA PERFLEX - RL', 190.00, 'RL', '14/05/2025', '14/05/2025', 0, '[27]'),
(1652, 163, 'prod_36_1753023793', 36, 'FEIJAO PRETO 1 KG  - PCT', 3000.00, 'PC', '21/05/2025', '21/05/2025', 0, '[36]'),
(1653, 163, 'prod_40_1753023793', 40, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 700.00, 'PC', '21/05/2025', '21/05/2025', 0, '[40]'),
(1654, 163, 'prod_44_1753023793', 44, 'CAFE EM PO 500 G - PCT', 650.00, 'PC', '28/05/2025', '28/05/2025', 0, '[44]'),
(1655, 163, 'prod_50_1753023793', 50, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 600.00, 'PC', '28/05/2025', '28/05/2025', 0, '[50]'),
(1656, 163, 'prod_52_1753023793', 52, 'OLEO DE SOJA 900 ML - UND', 1800.00, 'UN', '28/05/2025', '28/05/2025', 0, '[52]'),
(1657, 163, 'prod_56_1753023793', 56, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 700.00, 'PC', '04/06/2025', '04/06/2025', 0, '[56]'),
(1658, 163, 'prod_1_1753023793', 1, 'FERMENTO QUIMICO EM PO 200 G - UND', 800.00, 'UN', '14/05/2025', '21/05/2025', 0, '[1]'),
(1659, 163, 'prod_2_1753023793', 2, 'FERMENTO QUIMICO EM PO 200 G - UND', 240.00, 'UN', '21/05/2025', '21/05/2025', 0, '[2]'),
(1660, 163, 'prod_1_1753023793', 1, 'PANO DE CHAO - UN', 150.00, 'UN', '14/05/2025', '14/05/2025', 0, '[1]'),
(1661, 163, 'prod_1_1753023793', 1, 'FARINHA DE TRIGO 1 KG - PCT', 2000.00, 'PC', '14/05/2025', '21/05/2025', 0, '[1]'),
(1662, 163, 'prod_2_1753023793', 2, 'FARINHA DE TRIGO 1 KG - PCT', 1000.00, 'PC', '21/05/2025', '21/05/2025', 0, '[2]'),
(1663, 163, 'prod_3_1753023793', 3, 'FARINHA DE TRIGO INTEGRAL 1 KG - PCT', 120.00, 'PC', '21/05/2025', '21/05/2025', 0, '[3]'),
(1664, 163, 'prod_3_1753023793', 3, 'SACO DE LIXO 100 LT C/ 100 UN - PCT', 280.00, 'PC', '14/05/2025', '14/05/2025', 0, '[3]'),
(1665, 163, 'prod_4_1753023793', 4, 'ALCOOL 1LT - UND', 260.00, 'UN', '14/05/2025', '14/05/2025', 0, '[4]'),
(1666, 163, 'prod_6_1753023793', 6, 'ESPONJA DUPLA FACE - UN', 1200.00, 'UN', '14/05/2025', '14/05/2025', 0, '[6]'),
(1667, 163, 'prod_7_1753023793', 7, 'ESPONJA FIBRA 125 X 87 X 20 MM  - UN', 500.00, 'UN', '14/05/2025', '14/05/2025', 0, '[7]'),
(1668, 163, 'prod_13_1753023793', 13, 'LUVA PLASTICA DESCARTAVEL PCT C/100', 170.00, 'UN', '14/05/2025', '14/05/2025', 0, '[13]'),
(1669, 163, 'prod_3_1753023793', 3, 'BOBINA PLASTICA PICOTADA 40X60 - RL', 120.00, 'RL', '14/05/2025', '14/05/2025', 0, '[3]'),
(1670, 163, 'prod_10_1753023793', 10, 'PAPEL TOALHA INTERFOLHADO 1000 FLS - PCT', 170.00, 'UN', '14/05/2025', '14/05/2025', 0, '[10]'),
(1671, 163, 'prod_11_1753023793', 11, 'VASSOURA DE NYLON C/ CABO - UN', 204.00, 'UN', '14/05/2025', '14/05/2025', 0, '[11]'),
(1672, 163, 'prod_12_1753023793', 12, 'LUVA DE BORRACHA - M', 140.00, 'UN', '14/05/2025', '14/05/2025', 0, '[12]'),
(1673, 163, 'prod_14_1753023793', 14, 'TOUCA DESCARTAVEL PCT C/100', 140.00, 'LT', '14/05/2025', '14/05/2025', 0, '[14]'),
(1674, 163, 'prod_1_1753023793', 1, 'BISCOITO CASEIRO 1 KG - PCT', 1000.00, 'PC', '28/05/2025', '04/06/2025', 0, '[1]'),
(1675, 163, 'prod_2_1753023793', 2, 'BISCOITO CASEIRO 1 KG - PCT', 1200.00, 'PC', '04/06/2025', '04/06/2025', 0, '[2]'),
(1676, 163, 'prod_1_1753023793', 1, 'ARROZ INTEGRAL 1 KG - PCT', 1000.00, 'PC', '14/05/2025', '14/05/2025', 0, '[1]'),
(1677, 163, 'prod_2_1753023793', 2, 'ARROZ PARBOILIZADO 1 KG - PCT', 3000.00, 'PC', '14/05/2025', '14/05/2025', 0, '[2]'),
(1678, 163, 'prod_4_1753023793', 4, 'ARROZ PARBOILIZADO 1 KG - PCT', 3900.00, 'PC', '21/05/2025', '21/05/2025', 0, '[4]'),
(1679, 163, 'prod_5_1753023793', 5, 'ARROZ INTEGRAL 1 KG - PCT', 900.00, 'PC', '28/05/2025', '28/05/2025', 0, '[5]'),
(1680, 163, 'prod_6_1753023793', 6, 'ARROZ PARBOILIZADO 1 KG - PCT', 3000.00, 'PC', '28/05/2025', '28/05/2025', 0, '[6]'),
(1681, 163, 'prod_7_1753023793', 7, 'ARROZ PARBOILIZADO 1 KG - PCT', 2800.00, 'PC', '04/06/2025', '04/06/2025', 0, '[7]'),
(1682, 163, 'prod_1_1753023793', 1, 'OREGANO MOIDO 10 G - PCT', 300.00, 'PC', '07/05/2025', '28/05/2025', 0, '[1]'),
(1683, 163, 'prod_2_1753023793', 2, 'MILHO CANJICA 500G - PCT', 500.00, 'PC', '14/05/2025', '28/05/2025', 0, '[2]'),
(1684, 163, 'prod_3_1753023793', 3, 'CANELA EM PO 30 G - PCT', 650.00, 'PC', '14/05/2025', '04/06/2025', 0, '[3]'),
(1685, 163, 'prod_4_1753023793', 4, 'COLORAU EM PO 500 G - PCT', 450.00, 'UN', '14/05/2025', '28/05/2025', 0, '[4]'),
(1686, 163, 'prod_5_1753023793', 5, 'FUBA 1 KG - PCT', 750.00, 'PC', '21/05/2025', '21/05/2025', 0, '[5]'),
(1687, 163, 'prod_6_1753023793', 6, 'MILHO CANJICA 500G - PCT', 2020.00, 'PC', '28/05/2025', '28/05/2025', 0, '[6]'),
(1688, 163, 'prod_7_1753023793', 7, 'COLORAU EM PO 500 G - PCT', 380.00, 'UN', '28/05/2025', '28/05/2025', 0, '[7]'),
(1689, 163, 'prod_8_1753023793', 8, 'OREGANO MOIDO 10 G - PCT', 340.00, 'PC', '28/05/2025', '28/05/2025', 0, '[8]'),
(1690, 163, 'prod_9_1753023793', 9, 'CANELA EM PO 30 G - PCT', 350.00, 'PC', '04/06/2025', '04/06/2025', 0, '[9]'),
(1691, 163, 'prod_1_1753023793', 1, 'DETERGENTE NEUTRO 500 ML - FR', 3200.00, 'UN', '14/05/2025', '14/05/2025', 0, '[1]'),
(1692, 163, 'prod_1_1753023793', 1, 'MACARRAO PENNE C/OVOS 500 G - PCT', 600.00, 'PC', '07/05/2025', '07/05/2025', 0, '[1]'),
(1693, 163, 'prod_2_1753023793', 2, 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 1500.00, 'PC', '14/05/2025', '04/06/2025', 0, '[2]'),
(1694, 163, 'prod_4_1753023793', 4, 'AGUA SANITARIA 1LT - UND', 1600.00, 'UN', '14/05/2025', '14/05/2025', 0, '[4]'),
(1695, 163, 'prod_11_1753023793', 11, 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 3700.00, 'PC', '04/06/2025', '04/06/2025', 0, '[11]'),
(1696, 163, 'prod_13_1753023793', 13, 'VINAGRE DE ALCOOL 900 ML - UND', 600.00, 'UN', '14/05/2025', '28/05/2025', 0, '[13]'),
(1697, 163, 'prod_41_1753023793', 41, 'VINAGRE DE ALCOOL 900 ML - UND', 620.00, 'UN', '28/05/2025', '28/05/2025', 0, '[41]'),
(1698, 163, 'prod_46_1753023793', 46, 'FEIJAO VERMELHO 1 KG - PCT', 50.00, 'PC', '04/06/2025', '04/06/2025', 0, '[46]'),
(1699, 163, 'prod_9_1753023793', 9, 'FARINHA DE MANDIOCA 1 KG - PCT', 1100.00, 'PC', '14/05/2025', '14/05/2025', 0, '[9]'),
(1700, 163, 'prod_1_1753023793', 1, 'CACAU EM PO 100% 1 KG - PCT', 100.00, 'PC', '28/05/2025', '28/05/2025', 0, '[1]'),
(1701, 163, 'prod_1_1753023793', 1, 'SUCO INTEGRAL DE UVA 1,5 LT - GF', 2500.00, 'GF', '14/05/2025', '28/05/2025', 0, '[1]'),
(1702, 163, 'prod_2_1753023793', 2, 'SUCO INTEGRAL DE UVA 1,5 LT - GF', 1500.00, 'GF', '28/05/2025', '28/05/2025', 0, '[2]'),
(1703, 163, 'prod_1_1753023793', 1, 'DOCE DE MORANGO ORGANICO 1 KG - PT', 30.00, 'PT', '14/05/2025', '14/05/2025', 0, '[1]'),
(1704, 164, 'prod_1_1753023793', 1, 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 14000.00, 'PC', '07/05/2025', '07/05/2025', 0, '[1]'),
(1705, 164, 'prod_1_1753023793', 1, 'MEL DE ABELHAS 1 KG - PT', 160.00, 'PC', '14/05/2025', '14/05/2025', 0, '[1]'),
(1706, 164, 'prod_6_1753023793', 6, 'FOSFORO 40 PALITOS - PC 10 CX', 120.00, 'UN', '14/05/2025', '14/05/2025', 0, '[6]'),
(1707, 164, 'prod_6_1753023793', 6, 'AVEIA EM FLOCOS 500 G - PCT', 560.00, 'UN', '14/05/2025', '14/05/2025', 0, '[6]'),
(1708, 164, 'prod_6_1753023793', 6, 'CAFE EM PO 500 G - PCT', 500.00, 'PC', '14/05/2025', '14/05/2025', 0, '[6]'),
(1709, 164, 'prod_12_1753023793', 12, 'MACARRAO CONCHINHA C/OVOS 500 G - PCT', 800.00, 'PC', '14/05/2025', '14/05/2025', 0, '[12]'),
(1710, 164, 'prod_14_1753023793', 14, 'COLORAU EM PO 500 G - PCT', 700.00, 'PC', '14/05/2025', '14/05/2025', 0, '[14]'),
(1711, 164, 'prod_16_1753023793', 16, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 1000.00, 'CX', '14/05/2025', '14/05/2025', 0, '[16]'),
(1712, 164, 'prod_18_1753023793', 18, 'OLEO DE SOJA 900 ML - UND', 2000.00, 'UN', '14/05/2025', '14/05/2025', 0, '[18]'),
(1713, 164, 'prod_19_1753023793', 19, 'GUARDANAPO 19.5 X 19.5 PCT 50 UND - PCT', 1800.00, 'UN', '14/05/2025', '14/05/2025', 0, '[19]'),
(1714, 164, 'prod_20_1753023793', 20, 'SACO DE AMOSTRA C/ 500 UN - PCT', 80.00, 'PC', '14/05/2025', '14/05/2025', 0, '[20]'),
(1715, 164, 'prod_23_1753023793', 23, 'PANO DE LIMPEZA PERFLEX - RL', 120.00, 'UN', '14/05/2025', '14/05/2025', 0, '[23]'),
(1716, 164, 'prod_29_1753023793', 29, 'AMIDO DE MILHO 1 KG - PCT', 60.00, 'PC', '21/05/2025', '21/05/2025', 0, '[29]'),
(1717, 164, 'prod_31_1753023793', 31, 'FUBA 1 KG - PCT', 540.00, 'PC', '21/05/2025', '21/05/2025', 0, '[31]'),
(1718, 164, 'prod_34_1753023793', 34, 'CAFE EM PO 500 G - PCT', 400.00, 'PC', '28/05/2025', '28/05/2025', 0, '[34]'),
(1719, 164, 'prod_36_1753023793', 36, 'MACARRAO CONCHINHA C/OVOS 500 G - PCT', 740.00, 'UN', '28/05/2025', '28/05/2025', 0, '[36]'),
(1720, 164, 'prod_37_1753023793', 37, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 800.00, 'PC', '28/05/2025', '28/05/2025', 0, '[37]'),
(1721, 164, 'prod_1_1753023793', 1, 'FERMENTO QUIMICO EM PO 200 G - UND', 600.00, 'UN', '14/05/2025', '14/05/2025', 0, '[1]'),
(1722, 164, 'prod_1_1753023793', 1, 'PANO DE CHAO - UN', 140.00, 'RL', '14/05/2025', '14/05/2025', 0, '[1]'),
(1723, 164, 'prod_1_1753023793', 1, 'FARINHA DE TRIGO 1 KG - PCT', 1550.00, 'PC', '14/05/2025', '14/05/2025', 0, '[1]'),
(1724, 164, 'prod_1_1753023793', 1, 'ESPONJA DUPLA FACE - UN', 1600.00, 'LT', '07/05/2025', '07/05/2025', 0, '[1]'),
(1725, 164, 'prod_3_1753023793', 3, 'SACO DE LIXO 200LT C/ 100 UN  8 MICRAS- PCT', 130.00, 'PC', '14/05/2025', '14/05/2025', 0, '[3]'),
(1726, 164, 'prod_4_1753023793', 4, 'ALCOOL 1LT - UND', 300.00, 'PT', '14/05/2025', '14/05/2025', 0, '[4]'),
(1727, 164, 'prod_5_1753023793', 5, 'ESPONJA FIBRA 125 X 87 X 20 MM  - UN', 220.00, 'PC', '14/05/2025', '14/05/2025', 0, '[5]'),
(1728, 164, 'prod_11_1753023793', 11, 'LUVA PLASTICA DESCARTAVEL PCT C/100', 100.00, 'UN', '14/05/2025', '14/05/2025', 0, '[11]'),
(1729, 164, 'prod_7_1753023793', 7, 'PAPEL TOALHA INTERFOLHADO 1000 FLS - PCT', 100.00, 'UN', '14/05/2025', '14/05/2025', 0, '[7]'),
(1730, 164, 'prod_8_1753023793', 8, 'VASSOURA DE NYLON C/ CABO - UN', 130.00, 'PC', '14/05/2025', '14/05/2025', 0, '[8]'),
(1731, 164, 'prod_9_1753023793', 9, 'LUVA DE BORRACHA - M', 120.00, 'PC', '14/05/2025', '14/05/2025', 0, '[9]'),
(1732, 164, 'prod_11_1753023793', 11, 'TOUCA DESCARTAVEL PCT C/100', 100.00, 'UN', '14/05/2025', '14/05/2025', 0, '[11]'),
(1733, 164, 'prod_1_1753023793', 1, 'BISCOITO CASEIRO 1 KG - PCT', 1000.00, 'PC', '04/06/2025', '04/06/2025', 0, '[1]'),
(1734, 164, 'prod_1_1753023793', 1, 'ARROZ PARBOILIZADO 1 KG - PCT', 800.00, 'UN', '07/05/2025', '07/05/2025', 0, '[1]'),
(1735, 164, 'prod_2_1753023793', 2, 'ARROZ INTEGRAL 1 KG - PCT', 1800.00, 'PC', '14/05/2025', '14/05/2025', 0, '[2]'),
(1736, 164, 'prod_3_1753023793', 3, 'ARROZ PARBOILIZADO 1 KG - PCT', 4500.00, 'UN', '14/05/2025', '14/05/2025', 0, '[3]'),
(1737, 164, 'prod_4_1753023793', 4, 'ARROZ PARBOILIZADO 1 KG - PCT', 3600.00, 'PC', '28/05/2025', '28/05/2025', 0, '[4]'),
(1738, 164, 'prod_1_1753023793', 1, 'CANELA EM PO 30 G - PCT', 350.00, 'PC', '14/05/2025', '14/05/2025', 0, '[1]'),
(1739, 164, 'prod_2_1753023793', 2, 'OREGANO MOIDO 10 G - PCT', 340.00, 'PC', '28/05/2025', '28/05/2025', 0, '[2]'),
(1740, 164, 'prod_3_1753023793', 3, 'CANELA EM PO 30 G - PCT', 270.00, 'PC', '04/06/2025', '04/06/2025', 0, '[3]'),
(1741, 164, 'prod_1_1753023793', 1, 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 1000.00, 'UN', '14/05/2025', '14/05/2025', 0, '[1]'),
(1742, 164, 'prod_2_1753023793', 2, 'MACARRAO PENNE C/OVOS 500 G - PCT', 300.00, 'UN', '14/05/2025', '14/05/2025', 0, '[2]'),
(1743, 164, 'prod_3_1753023793', 3, 'AGUA SANITARIA 1LT - UND', 600.00, 'PC', '14/05/2025', '14/05/2025', 0, '[3]'),
(1744, 164, 'prod_9_1753023793', 9, 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 2200.00, 'PC', '04/06/2025', '04/06/2025', 0, '[9]'),
(1745, 164, 'prod_9_1753023793', 9, 'MILHO CANJICA 500G - PCT', 600.00, 'PC', '14/05/2025', '14/05/2025', 0, '[9]'),
(1746, 164, 'prod_23_1753023793', 23, 'SAL REFINADO 1 KG - PCT', 900.00, 'PC', '21/05/2025', '21/05/2025', 0, '[23]'),
(1747, 164, 'prod_28_1753023793', 28, 'MILHO CANJICA 500G - PCT', 1000.00, 'PC', '04/06/2025', '04/06/2025', 0, '[28]'),
(1748, 164, 'prod_34_1753023793', 34, 'FARINHA DE MANDIOCA 1 KG - PCT', 500.00, 'PC', '21/05/2025', '21/05/2025', 0, '[34]'),
(1749, 169, 'prod_1_1753023793', 1, 'CANTONEIRA 1.1/4x1/8', 1.00, 'BA', '13/06/2025', '13/06/2025', 0, '[1]'),
(1750, 169, 'prod_2_1753023793', 2, 'PERFIL DE CHAPA 0,80 GALV', 6.00, 'KG', '13/06/2025', '13/06/2025', 0, '[2]'),
(1751, 169, 'prod_3_1753023793', 3, 'PERFIL DE CHAPA 1.50', 21.00, 'UN', '14/06/2025', '14/06/2025', 0, '[3]'),
(1752, 169, 'prod_4_1753023793', 4, 'PERFIL DE CHAPA INOX 304', 6.00, 'KG', '13/06/2025', '13/06/2025', 0, '[4]'),
(1753, 172, 'prod_1_1753023793', 1, 'BISCOITO ZERO LACT ROSQ COCO/LEITE 250 G - PCT', 160.00, 'PC', '23/07/2025', '23/07/2025', 0, '[1]'),
(1754, 172, 'prod_2_1753023793', 2, 'FARINHA DE ARROZ SEM GLUTEN 1KG - PCT', 10.00, 'PC', '23/07/2025', '23/07/2025', 0, '[2]'),
(1755, 172, 'prod_3_1753023793', 3, 'LEITE UHT DESNATADO 1 LT - LT', 6.00, 'LT', '23/07/2025', '23/07/2025', 0, '[3]'),
(1756, 172, 'prod_4_1753023793', 4, 'LEITE ZERO LACTOSE UHT INTEGRAL 1 LT - LT', 300.00, 'LT', '23/07/2025', '23/07/2025', 0, '[4]'),
(1757, 172, 'prod_5_1753023793', 5, 'MACARRAO D ARROZ  S/GLUTEN ESPAGUETE 500 G - PCT', 20.00, 'PC', '23/07/2025', '23/07/2025', 0, '[5]'),
(1758, 172, 'prod_6_1753023793', 6, 'MACARRAO INTEGRAL ESPAGUETE 500 G - PCT', 20.00, 'PC', '23/07/2025', '23/07/2025', 0, '[6]'),
(1759, 172, 'prod_7_1753023793', 7, 'MANTEIGA ZERO LACTOSE 200G - PT', 100.00, 'PT', '23/07/2025', '23/07/2025', 0, '[7]'),
(1760, 172, 'prod_8_1753023793', 8, 'PAO FAT. S/OVOS/ACUCAR (CENOURA) 400 G - PCT', 80.00, 'PC', '23/07/2025', '23/07/2025', 0, '[8]'),
(1761, 172, 'prod_9_1753023793', 9, 'QUEIJO MUSSARELA ZERO LACTOSE 150 G - PCT', 150.00, 'PT', '23/07/2025', '23/07/2025', 0, '[9]'),
(1762, 172, 'prod_10_1753023793', 10, 'MANTEIGA ZERO LACTOSE 200G - PT', 100.00, 'PT', '0.027430167597765', '0.027430167597765', 0, '[10]'),
(1763, 172, 'prod_11_1753023793', 11, 'QUEIJO MUSSARELA ZERO LACTOSE 150 G - PCT', 150.00, 'PT', '0.31222882562278', '0.31222882562278', 0, '[11]'),
(1764, 172, 'prod_12_1753023793', 12, 'BISCOITO ZERO LACT ROSQ COCO/LEITE 250 G - PCT', 160.00, 'PC', '23/07/2025', '23/07/2025', 0, '[12]'),
(1765, 172, 'prod_13_1753023793', 13, 'PAO FAT. S/OVOS/ACUCAR (CENOURA) 400 G - PCT', 80.00, 'PC', '23/07/2025', '23/07/2025', 0, '[13]'),
(1766, 172, 'prod_14_1753023793', 14, 'FARINHA DE ARROZ SEM GLUTEN 1KG - PCT', 10.00, 'PC', '1.005212962963', '1.005212962963', 0, '[14]'),
(1767, 172, 'prod_15_1753023793', 15, 'LEITE UHT DESNATADO 1 LT - LT', 6.00, 'LT', '1.5375', '1.5375', 0, '[15]'),
(1768, 172, 'prod_16_1753023793', 16, 'LEITE ZERO LACTOSE UHT INTEGRAL 1 LT - LT', 300.00, 'LT', '0.43191745686452', '0.43191745686452', 0, '[16]'),
(1769, 172, 'prod_17_1753023793', 17, 'MACARRAO D ARROZ  S/GLUTEN ESPAGUETE 500 G - PCT', 20.00, 'PC', '0.73648648648649', '0.73648648648649', 0, '[17]'),
(1770, 172, 'prod_18_1753023793', 18, 'MACARRAO INTEGRAL ESPAGUETE 500 G - PCT', 20.00, 'PC', '0.47579365079365', '0.47579365079365', 0, '[18]'),
(1771, 172, 'prod_19_1753023793', 19, 'PAO FAT. S/OVOS/ACUCAR (CENOURA) 400 G - PCT', 80.00, 'PC', '2.0459167337099', '2.0459167337099', 0, '[19]'),
(1772, 172, 'prod_20_1753023793', 20, 'QUEIJO MUSSARELA ZERO LACTOSE 150 G - PCT', 150.00, 'PT', '0.31222882562278', '0.31222882562278', 0, '[20]'),
(1773, 172, 'prod_21_1753023793', 21, 'BISCOITO ZERO LACT ROSQ COCO/LEITE 250 G - PCT', 160.00, 'PC', '23/07/2025', '23/07/2025', 0, '[21]'),
(1774, 172, 'prod_22_1753023793', 22, 'MANTEIGA ZERO LACTOSE 200G - PT', 100.00, 'PT', '0.027430167597765', '0.027430167597765', 0, '[22]'),
(1775, 172, 'prod_23_1753023793', 23, 'QUEIJO MUSSARELA ZERO LACTOSE 150 G - PCT', 150.00, 'PT', '0.31222882562278', '0.31222882562278', 0, '[23]'),
(1776, 173, 'prod_1_1753023793', 1, 'PATINHO BOVINO CUBOS 1 KG - PCT', 1500.00, 'PC', '23/07/2025', '23/07/2025', 0, '[1]'),
(1777, 173, 'prod_2_1753023793', 2, 'PATINHO BOVINO CUBOS 1 KG - PCT', 2400.00, 'PC', '30/07/2025', '30/07/2025', 0, '[2]'),
(1778, 173, 'prod_3_1753023793', 3, 'PATINHO BOVINO ISCAS 1 KG - PCT', 250.00, 'PC', '06/08/2025', '06/08/2025', 0, '[3]'),
(1779, 173, 'prod_4_1753023793', 4, 'PATINHO BOVINO MOIDO 1 KG - PCT', 400.00, 'PC', '06/08/2025', '06/08/2025', 0, '[4]'),
(1780, 173, 'prod_5_1753023793', 5, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1200.00, 'PC', '23/07/2025', '23/07/2025', 0, '[5]'),
(1781, 173, 'prod_6_1753023793', 6, 'PERNIL SUINO CUBOS 1 KG - PCT', 1500.00, 'PC', '06/08/2025', '06/08/2025', 0, '[6]'),
(1782, 173, 'prod_7_1753023793', 7, 'PATINHO BOVINO CUBOS 1 KG - PCT', 1500.00, 'PC', '23/07/2025', '23/07/2025', 0, '[7]'),
(1783, 173, 'prod_8_1753023793', 8, 'PATINHO BOVINO CUBOS 1 KG - PCT', 2400.00, 'PC', '30/07/2025', '30/07/2025', 0, '[8]'),
(1784, 173, 'prod_9_1753023793', 9, 'PATINHO BOVINO ISCAS 1 KG - PCT', 250.00, 'PC', '06/08/2025', '06/08/2025', 0, '[9]'),
(1785, 173, 'prod_10_1753023793', 10, 'PATINHO BOVINO MOIDO 1 KG - PCT', 400.00, 'PC', '06/08/2025', '06/08/2025', 0, '[10]'),
(1786, 173, 'prod_11_1753023793', 11, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1200.00, 'PC', '23/07/2025', '23/07/2025', 0, '[11]'),
(1787, 173, 'prod_12_1753023793', 12, 'PERNIL SUINO CUBOS 1 KG - PCT', 1500.00, 'PC', '06/08/2025', '06/08/2025', 0, '[12]'),
(1788, 173, 'prod_13_1753023793', 13, 'PATINHO BOVINO CUBOS 1 KG - PCT', 1500.00, 'PC', '23/07/2025', '23/07/2025', 0, '[13]'),
(1789, 173, 'prod_14_1753023793', 14, 'PATINHO BOVINO CUBOS 1 KG - PCT', 2400.00, 'PC', '30/07/2025', '30/07/2025', 0, '[14]'),
(1790, 173, 'prod_15_1753023793', 15, 'PATINHO BOVINO ISCAS 1 KG - PCT', 250.00, 'PC', '06/08/2025', '06/08/2025', 0, '[15]'),
(1791, 173, 'prod_16_1753023793', 16, 'PATINHO BOVINO MOIDO 1 KG - PCT', 400.00, 'PC', '06/08/2025', '06/08/2025', 0, '[16]'),
(1792, 173, 'prod_17_1753023793', 17, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1200.00, 'PC', '23/07/2025', '23/07/2025', 0, '[17]'),
(1793, 173, 'prod_18_1753023793', 18, 'PERNIL SUINO CUBOS 1 KG - PCT', 1500.00, 'PC', '06/08/2025', '06/08/2025', 0, '[18]'),
(1794, 173, 'prod_19_1753023793', 19, 'PATINHO BOVINO CUBOS 1 KG - PCT', 1500.00, 'PC', '23/07/2025', '23/07/2025', 0, '[19]'),
(1795, 173, 'prod_20_1753023793', 20, 'PATINHO BOVINO CUBOS 1 KG - PCT', 2400.00, 'PC', '30/07/2025', '30/07/2025', 0, '[20]'),
(1796, 173, 'prod_21_1753023793', 21, 'PATINHO BOVINO ISCAS 1 KG - PCT', 250.00, 'PC', '06/08/2025', '06/08/2025', 0, '[21]'),
(1797, 173, 'prod_22_1753023793', 22, 'PATINHO BOVINO MOIDO 1 KG - PCT', 400.00, 'PC', '06/08/2025', '06/08/2025', 0, '[22]'),
(1798, 173, 'prod_23_1753023793', 23, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1200.00, 'PC', '23/07/2025', '23/07/2025', 0, '[23]'),
(1799, 173, 'prod_24_1753023793', 24, 'PERNIL SUINO CUBOS 1 KG - PCT', 1500.00, 'PC', '06/08/2025', '06/08/2025', 0, '[24]'),
(1800, 173, 'prod_25_1753023793', 25, 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 700.00, 'PC', '06/08/2025', '06/08/2025', 0, '[25]'),
(1801, 173, 'prod_26_1753023793', 26, 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 1600.00, 'PC', '23/07/2025', '23/07/2025', 0, '[26]'),
(1802, 173, 'prod_27_1753023793', 27, 'IOGURTE NATURAL INTEGRAL 900 ML - PCT', 240.00, 'UN', '23/07/2025', '23/07/2025', 0, '[27]'),
(1803, 173, 'prod_28_1753023793', 28, 'IOGURTE NATURAL INTEGRAL 900 ML - PCT', 320.00, 'UN', '30/07/2025', '30/07/2025', 0, '[28]'),
(1804, 173, 'prod_29_1753023793', 29, 'MANTEIGA C/ SAL 200G - PT', 850.00, 'PT', '23/07/2025', '23/07/2025', 0, '[29]'),
(1805, 173, 'prod_30_1753023793', 30, 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 700.00, 'PC', '06/08/2025', '06/08/2025', 0, '[30]'),
(1806, 173, 'prod_31_1753023793', 31, 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 1600.00, 'PC', '23/07/2025', '23/07/2025', 0, '[31]'),
(1807, 173, 'prod_32_1753023793', 32, 'MANTEIGA C/ SAL 200G - PT', 850.00, 'PT', '23/07/2025', '23/07/2025', 0, '[32]'),
(1808, 173, 'prod_33_1753023793', 33, 'MILHO VERDE CONGELADO 1,1 KG - PCT', 440.00, 'PC', '23/07/2025', '23/07/2025', 0, '[33]'),
(1809, 173, 'prod_34_1753023793', 34, 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 700.00, 'PC', '06/08/2025', '06/08/2025', 0, '[34]'),
(1810, 173, 'prod_35_1753023793', 35, 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 1600.00, 'PC', '23/07/2025', '23/07/2025', 0, '[35]'),
(1811, 173, 'prod_36_1753023793', 36, 'AIPIM CONGELADO 1 KG - PCT', 410.00, 'PC', '23/07/2025', '23/07/2025', 0, '[36]'),
(1812, 173, 'prod_37_1753023793', 37, 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - PCT', 1500.00, 'PC', '06/08/2025', '06/08/2025', 0, '[37]'),
(1813, 173, 'prod_38_1753023793', 38, 'MILHO VERDE CONGELADO 1,1 KG - PCT', 440.00, 'PC', '23/07/2025', '23/07/2025', 0, '[38]'),
(1814, 173, 'prod_39_1753023793', 39, 'MILHO VERDE CONGELADO 1,1 KG - PCT', 440.00, 'PC', '23/07/2025', '23/07/2025', 0, '[39]'),
(1815, 173, 'prod_41_1753023793', 41, 'IOGURTE NATURAL INTEGRAL 900 ML - PCT', 240.00, 'UN', '23/07/2025', '23/07/2025', 0, '[41]'),
(1816, 173, 'prod_42_1753023793', 42, 'IOGURTE NATURAL INTEGRAL 900 ML - PCT', 320.00, 'UN', '30/07/2025', '30/07/2025', 0, '[42]'),
(1817, 173, 'prod_43_1753023793', 43, 'AIPIM CONGELADO 1 KG - PCT', 410.00, 'PC', '23/07/2025', '23/07/2025', 0, '[43]'),
(1818, 174, 'prod_1_1753023793', 1, 'PERFIL DE CHAPA 0,50 INOX 430', 5.00, 'KG', '04/07/2025', '04/07/2025', 0, '[1]'),
(1819, 174, 'prod_2_1753023793', 2, 'PERFIL DE CHAPA 1.50', 2.00, 'UN', '04/07/2025', '04/07/2025', 0, '[2]'),
(1820, 175, 'prod_1_1753023793', 1, 'PATINHO BOVINO CUBOS 1 KG - PCT', 1800.00, 'PC', '06/08/2025', '06/08/2025', 0, '[1]'),
(1821, 175, 'prod_2_1753023793', 2, 'PATINHO BOVINO CUBOS 1 KG - PCT', 3000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[2]'),
(1822, 175, 'prod_3_1753023793', 3, 'PATINHO BOVINO CUBOS 1 KG - PCT', 2300.00, 'PC', '30/07/2025', '30/07/2025', 0, '[3]'),
(1823, 175, 'prod_4_1753023793', 4, 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '06/08/2025', '06/08/2025', 0, '[4]'),
(1824, 175, 'prod_5_1753023793', 5, 'PATINHO BOVINO ISCAS 1 KG - PCT', 1200.00, 'PC', '09/07/2025', '09/07/2025', 0, '[5]'),
(1825, 175, 'prod_6_1753023793', 6, 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '30/07/2025', '30/07/2025', 0, '[6]'),
(1826, 175, 'prod_7_1753023793', 7, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[7]'),
(1827, 175, 'prod_8_1753023793', 8, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '06/08/2025', '06/08/2025', 0, '[8]'),
(1828, 175, 'prod_9_1753023793', 9, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '30/07/2025', '30/07/2025', 0, '[9]'),
(1829, 175, 'prod_10_1753023793', 10, 'PERNIL SUINO CUBOS 1 KG - PCT', 1700.00, 'PC', '06/08/2025', '06/08/2025', 0, '[10]'),
(1830, 175, 'prod_11_1753023793', 11, 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[11]'),
(1831, 175, 'prod_12_1753023793', 12, 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '30/07/2025', '30/07/2025', 0, '[12]'),
(1832, 175, 'prod_13_1753023793', 13, 'PATINHO BOVINO CUBOS 1 KG - PCT', 1800.00, 'PC', '06/08/2025', '06/08/2025', 0, '[13]'),
(1833, 175, 'prod_14_1753023793', 14, 'PATINHO BOVINO CUBOS 1 KG - PCT', 3000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[14]'),
(1834, 175, 'prod_15_1753023793', 15, 'PATINHO BOVINO CUBOS 1 KG - PCT', 2300.00, 'PC', '30/07/2025', '30/07/2025', 0, '[15]'),
(1835, 175, 'prod_16_1753023793', 16, 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '06/08/2025', '06/08/2025', 0, '[16]'),
(1836, 175, 'prod_17_1753023793', 17, 'PATINHO BOVINO ISCAS 1 KG - PCT', 1200.00, 'PC', '09/07/2025', '09/07/2025', 0, '[17]'),
(1837, 175, 'prod_18_1753023793', 18, 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '30/07/2025', '30/07/2025', 0, '[18]'),
(1838, 175, 'prod_19_1753023793', 19, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[19]'),
(1839, 175, 'prod_20_1753023793', 20, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '06/08/2025', '06/08/2025', 0, '[20]'),
(1840, 175, 'prod_21_1753023793', 21, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '30/07/2025', '30/07/2025', 0, '[21]'),
(1841, 175, 'prod_22_1753023793', 22, 'PERNIL SUINO CUBOS 1 KG - PCT', 1700.00, 'PC', '06/08/2025', '06/08/2025', 0, '[22]'),
(1842, 175, 'prod_23_1753023793', 23, 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[23]'),
(1843, 175, 'prod_24_1753023793', 24, 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '30/07/2025', '30/07/2025', 0, '[24]'),
(1844, 175, 'prod_25_1753023793', 25, 'PATINHO BOVINO CUBOS 1 KG - PCT', 1800.00, 'PC', '06/08/2025', '06/08/2025', 0, '[25]'),
(1845, 175, 'prod_26_1753023793', 26, 'PATINHO BOVINO CUBOS 1 KG - PCT', 3000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[26]'),
(1846, 175, 'prod_27_1753023793', 27, 'PATINHO BOVINO CUBOS 1 KG - PCT', 2300.00, 'PC', '30/07/2025', '30/07/2025', 0, '[27]'),
(1847, 175, 'prod_28_1753023793', 28, 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '06/08/2025', '06/08/2025', 0, '[28]'),
(1848, 175, 'prod_29_1753023793', 29, 'PATINHO BOVINO ISCAS 1 KG - PCT', 1200.00, 'PC', '09/07/2025', '09/07/2025', 0, '[29]'),
(1849, 175, 'prod_30_1753023793', 30, 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '30/07/2025', '30/07/2025', 0, '[30]'),
(1850, 175, 'prod_31_1753023793', 31, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[31]'),
(1851, 175, 'prod_32_1753023793', 32, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '06/08/2025', '06/08/2025', 0, '[32]'),
(1852, 175, 'prod_33_1753023793', 33, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '30/07/2025', '30/07/2025', 0, '[33]'),
(1853, 175, 'prod_34_1753023793', 34, 'PERNIL SUINO CUBOS 1 KG - PCT', 1700.00, 'PC', '06/08/2025', '06/08/2025', 0, '[34]'),
(1854, 175, 'prod_35_1753023793', 35, 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[35]'),
(1855, 175, 'prod_36_1753023793', 36, 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '30/07/2025', '30/07/2025', 0, '[36]'),
(1856, 175, 'prod_37_1753023793', 37, 'PATINHO BOVINO CUBOS 1 KG - PCT', 1800.00, 'PC', '06/08/2025', '06/08/2025', 0, '[37]'),
(1857, 175, 'prod_38_1753023793', 38, 'PATINHO BOVINO CUBOS 1 KG - PCT', 3000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[38]'),
(1858, 175, 'prod_39_1753023793', 39, 'PATINHO BOVINO CUBOS 1 KG - PCT', 2300.00, 'PC', '30/07/2025', '30/07/2025', 0, '[39]'),
(1859, 175, 'prod_40_1753023793', 40, 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '06/08/2025', '06/08/2025', 0, '[40]'),
(1860, 175, 'prod_41_1753023793', 41, 'PATINHO BOVINO ISCAS 1 KG - PCT', 1200.00, 'PC', '09/07/2025', '09/07/2025', 0, '[41]'),
(1861, 175, 'prod_42_1753023793', 42, 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '30/07/2025', '30/07/2025', 0, '[42]'),
(1862, 175, 'prod_43_1753023793', 43, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[43]'),
(1863, 175, 'prod_44_1753023793', 44, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '06/08/2025', '06/08/2025', 0, '[44]'),
(1864, 175, 'prod_45_1753023793', 45, 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '30/07/2025', '30/07/2025', 0, '[45]'),
(1865, 175, 'prod_46_1753023793', 46, 'PERNIL SUINO CUBOS 1 KG - PCT', 1700.00, 'PC', '06/08/2025', '06/08/2025', 0, '[46]'),
(1866, 175, 'prod_47_1753023793', 47, 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[47]'),
(1867, 175, 'prod_48_1753023793', 48, 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '30/07/2025', '30/07/2025', 0, '[48]'),
(1868, 175, 'prod_49_1753023793', 49, 'PERNIL SUINO CUBOS 1 KG - PCT', 1700.00, 'PC', '06/08/2025', '06/08/2025', 0, '[49]'),
(1869, 175, 'prod_50_1753023793', 50, 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[50]'),
(1870, 175, 'prod_51_1753023793', 51, 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '30/07/2025', '30/07/2025', 0, '[51]'),
(1871, 175, 'prod_52_1753023793', 52, 'AIPIM CONGELADO 1 KG - PCT', 200.00, 'PC', '23/07/2025', '23/07/2025', 0, '[52]'),
(1872, 175, 'prod_53_1753023793', 53, 'AIPIM CONGELADO 1 KG - PCT', 520.00, 'PC', '30/07/2025', '30/07/2025', 0, '[53]'),
(1873, 175, 'prod_54_1753023793', 54, 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - PCT', 2400.00, 'PC', '06/08/2025', '06/08/2025', 0, '[54]'),
(1874, 175, 'prod_55_1753023793', 55, 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - PCT', 1500.00, 'PC', '30/07/2025', '30/07/2025', 0, '[55]'),
(1875, 175, 'prod_56_1753023793', 56, 'FILE DE SASSAMI 1 KG - PCT', 1000.00, 'PC', '06/08/2025', '06/08/2025', 0, '[56]'),
(1876, 175, 'prod_57_1753023793', 57, 'FILE DE SASSAMI 1 KG - PCT', 4500.00, 'PC', '30/07/2025', '30/07/2025', 0, '[57]'),
(1877, 175, 'prod_58_1753023793', 58, 'FILE DE SASSAMI 1 KG - PCT', 3000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[58]'),
(1878, 175, 'prod_59_1753023793', 59, 'MILHO VERDE CONGELADO 1,1 KG - PCT', 450.00, 'PC', '06/08/2025', '06/08/2025', 0, '[59]'),
(1879, 175, 'prod_60_1753023793', 60, 'MILHO VERDE CONGELADO 1,1 KG - PCT', 200.00, 'PC', '30/07/2025', '30/07/2025', 0, '[60]'),
(1880, 175, 'prod_61_1753023793', 61, 'FILE DE SASSAMI 1 KG - PCT', 1000.00, 'PC', '06/08/2025', '06/08/2025', 0, '[61]'),
(1881, 175, 'prod_62_1753023793', 62, 'FILE DE SASSAMI 1 KG - PCT', 4500.00, 'PC', '30/07/2025', '30/07/2025', 0, '[62]'),
(1882, 175, 'prod_63_1753023793', 63, 'FILE DE SASSAMI 1 KG - PCT', 3000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[63]'),
(1883, 175, 'prod_64_1753023793', 64, 'MANTEIGA C/ SAL 200G - PT', 1500.00, 'PT', '23/07/2025', '23/07/2025', 0, '[64]'),
(1884, 175, 'prod_65_1753023793', 65, 'MILHO VERDE CONGELADO 1,1 KG - PCT', 450.00, 'PC', '06/08/2025', '06/08/2025', 0, '[65]'),
(1885, 175, 'prod_66_1753023793', 66, 'MILHO VERDE CONGELADO 1,1 KG - PCT', 200.00, 'PC', '30/07/2025', '30/07/2025', 0, '[66]'),
(1886, 175, 'prod_67_1753023793', 67, 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 1100.00, 'PC', '06/08/2025', '06/08/2025', 0, '[67]'),
(1887, 175, 'prod_68_1753023793', 68, 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 2600.00, 'PC', '23/07/2025', '23/07/2025', 0, '[68]'),
(1888, 175, 'prod_69_1753023793', 69, 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - PCT', 2400.00, 'PC', '06/08/2025', '06/08/2025', 0, '[69]'),
(1889, 175, 'prod_70_1753023793', 70, 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - PCT', 1500.00, 'PC', '30/07/2025', '30/07/2025', 0, '[70]'),
(1890, 175, 'prod_71_1753023793', 71, 'FILE DE SASSAMI 1 KG - PCT', 1000.00, 'PC', '06/08/2025', '06/08/2025', 0, '[71]'),
(1891, 175, 'prod_72_1753023793', 72, 'FILE DE SASSAMI 1 KG - PCT', 4500.00, 'PC', '30/07/2025', '30/07/2025', 0, '[72]'),
(1892, 175, 'prod_73_1753023793', 73, 'FILE DE SASSAMI 1 KG - PCT', 3000.00, 'PC', '23/07/2025', '23/07/2025', 0, '[73]'),
(1893, 175, 'prod_74_1753023793', 74, 'MILHO VERDE CONGELADO 1,1 KG - PCT', 450.00, 'PC', '06/08/2025', '06/08/2025', 0, '[74]'),
(1894, 175, 'prod_75_1753023793', 75, 'MILHO VERDE CONGELADO 1,1 KG - PCT', 200.00, 'PC', '30/07/2025', '30/07/2025', 0, '[75]'),
(1895, 175, 'prod_76_1753023793', 76, 'AIPIM CONGELADO 1 KG - PCT', 200.00, 'PC', '23/07/2025', '23/07/2025', 0, '[76]'),
(1896, 175, 'prod_77_1753023793', 77, 'AIPIM CONGELADO 1 KG - PCT', 520.00, 'PC', '30/07/2025', '30/07/2025', 0, '[77]'),
(1897, 176, 'prod_1_1753023793', 1, 'ABRACADEIRA 14 X 22 MM', 50.00, 'UN', '06/06/2025', '06/06/2025', 0, '[1]');

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos_fornecedores`
--

CREATE TABLE `produtos_fornecedores` (
  `id` int NOT NULL,
  `fornecedor_id` int NOT NULL,
  `produto_id` varchar(100) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `qtde` decimal(12,2) NOT NULL,
  `un` varchar(20) DEFAULT NULL,
  `prazo_entrega` varchar(100) DEFAULT NULL,
  `ult_valor_aprovado` varchar(100) DEFAULT NULL,
  `ult_fornecedor_aprovado` varchar(100) DEFAULT NULL,
  `valor_anterior` varchar(100) DEFAULT NULL,
  `valor_unitario` decimal(12,2) DEFAULT '0.00',
  `primeiro_valor` decimal(12,2) DEFAULT '0.00',
  `difal` decimal(12,2) DEFAULT '0.00',
  `ipi` decimal(12,2) DEFAULT '0.00',
  `data_entrega_fn` varchar(100) DEFAULT NULL,
  `total` decimal(14,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `produtos_fornecedores`
--

INSERT INTO `produtos_fornecedores` (`id`, `fornecedor_id`, `produto_id`, `nome`, `qtde`, `un`, `prazo_entrega`, `ult_valor_aprovado`, `ult_fornecedor_aprovado`, `valor_anterior`, `valor_unitario`, `primeiro_valor`, `difal`, `ipi`, `data_entrega_fn`, `total`) VALUES
(15, 8, 'forn_prod_forn_1752533422086_7bmfxris9_prod_1283594267_1752533419136_1752533422086', 'ABRACADEIRA 14 X 22 MM', 50.00, 'UN', '06/06/2025', NULL, NULL, '4.00', 3.00, 1.00, 0.00, 0.00, '15/07/2025', 150.00),
(16, 8, 'forn_prod_forn_1752533422086_7bmfxris9_prod_1781283118_1752533419136_1752533422086', 'ALCA CORPO CANNER', 10.00, 'UN', '06/06/2025', NULL, NULL, '3.00', 4.00, 1.00, 0.00, 0.00, '15/07/2025', 40.00),
(17, 9, 'forn_prod_forn_1752535480325_zex04pabm_17_1752535480325', 'ABRACADEIRA 14 X 22 MM', 50.00, 'UN', '06/06/2025', NULL, NULL, '0', 1.00, 1.00, 0.00, 0.00, '20/07/2025', 50.00),
(18, 9, 'forn_prod_forn_1752535480325_zex04pabm_18_1752535480325', 'ALCA CORPO CANNER', 10.00, 'UN', '06/06/2025', NULL, NULL, '0', 1.00, 1.00, 0.00, 0.00, '20/07/2025', 10.00),
(19, 10, 'forn_prod_forn_1752951723402_psarb0rs5_prod_1283594267_1752951719438_1752951723402', 'ABRACADEIRA 14 X 22 MM', 50.00, 'UN', '06/06/2025', '', '', '', 1.00, 1.00, 0.00, 0.00, '06/06/2025', 50.00),
(20, 10, 'forn_prod_forn_1752951723402_psarb0rs5_prod_1781283118_1752951719438_1752951723402', 'ALCA CORPO CANNER', 10.00, 'UN', '06/06/2025', '', '', '', 1.00, 1.00, 0.00, 0.00, '06/06/2025', 10.00),
(21, 11, 'forn_prod_forn_1752961488819_93wymbmjs_prod_1283594267_1752961486511_1752961488819', 'ABRACADEIRA 14 X 22 MM', 50.00, 'UN', '06/06/2025', '', '', '', 11.00, 11.00, 0.00, 0.00, '06/06/2025', 550.00),
(22, 11, 'forn_prod_forn_1752961488819_93wymbmjs_prod_1781283118_1752961486511_1752961488819', 'ALCA CORPO CANNER', 10.00, 'UN', '06/06/2025', '', '', '', 11.00, 11.00, 0.00, 0.00, '06/06/2025', 110.00),
(1045, 397, 'forn_prod_forn_1753023793_59bb86b1_1_1753023793', 'BROCA ACO RAPIDO 4,25MM', 8.00, 'UN', 'PRONTA ENTREGA', '6.5600', 'MEPAR', '6.5600', 6.56, 6.56, 0.00, 0.00, NULL, 52.48),
(1046, 397, 'forn_prod_forn_1753023793_59bb86b1_2_1753023793', 'BROCA P/ CONCRETO 6,0MM', 4.00, 'UN', 'PRONTA ENTREGA', NULL, NULL, '8.0800', 8.08, 8.08, 0.00, 0.00, NULL, 32.32),
(1047, 397, 'forn_prod_forn_1753023793_59bb86b1_3_1753023793', 'DISCO DE CORTE 4.1/2\" X 1/16\" X 7/8\"', 20.00, 'UN', 'PRONTA ENTREGA', NULL, NULL, '5.1000', 5.10, 5.10, 0.00, 0.00, NULL, 102.00),
(1048, 397, 'forn_prod_forn_1753023793_59bb86b1_4_1753023793', 'DOBRADICA PINO SOLTO ALUMINIO 64X40', 60.00, 'UN', 'PRONTA ENTREGA', '3.4700', 'MEPAR', '3.4700', 3.47, 3.47, 0.00, 0.00, NULL, 208.20),
(1049, 397, 'forn_prod_forn_1753023793_59bb86b1_5_1753023793', 'FECHO MAGNETICO C/ BATENTE 2 FUROS BRANCO', 20.00, 'UN', 'PRONTA ENTREGA', '1.9500', 'MEPAR', '1.9500', 1.95, 1.95, 0.00, 0.00, NULL, 39.00),
(1050, 397, 'forn_prod_forn_1753023793_59bb86b1_6_1753023793', 'PUXADOR U - NORMAL ZINCADO', 30.00, 'UN', 'PRONTA ENTREGA', '8.2300', 'MEPAR', '8.2300', 8.23, 8.23, 0.00, 0.00, NULL, 246.90),
(1051, 397, 'forn_prod_forn_1753023793_59bb86b1_7_1753023793', 'REBITE 4,0 X 12,7MM', 2000.00, 'UN', 'PRONTA ENTREGA', '0.2508', 'MEPAR', '0.2508', 0.25, 0.25, 0.00, 0.00, NULL, 501.60),
(1052, 397, 'forn_prod_forn_1753023793_59bb86b1_8_1753023793', 'SILICONE PU 44', 2.00, 'UN', 'PRONTA ENTREGA', '36.5000', 'MEPAR', '36.5000', 36.50, 36.50, 0.00, 0.00, NULL, 73.00),
(1053, 397, 'forn_prod_forn_1753023793_59bb86b1_9_1753023793', 'SILICONE TRANSPARENTE', 20.00, 'UN', 'PRONTA ENTREGA', NULL, NULL, '11.5400', 11.54, 11.54, 0.00, 0.00, NULL, 230.80),
(1054, 398, 'forn_prod_forn_1753023793_63f0a7dc_10_1753023793', 'SILICONE TRANSPARENTE', 20.00, 'UN', 'PRONTA ENTREGA', NULL, NULL, '12.4520', 12.45, 12.45, 0.00, 0.00, NULL, 249.04),
(1055, 399, 'forn_prod_forn_1753023793_7a191fb1_11_1753023793', 'BROCA P/ CONCRETO 6,0MM', 4.00, 'UN', 'PRONTA ENTREGA', '4.0000', 'DISMAFF', '4.0000', 4.00, 4.00, 0.00, 0.00, NULL, 16.00),
(1056, 399, 'forn_prod_forn_1753023793_7a191fb1_12_1753023793', 'DISCO DE CORTE 4.1/2\" X 1/16\" X 7/8\"', 20.00, 'UN', 'PRONTA ENTREGA', NULL, NULL, '20.0000', 20.00, 20.00, 0.00, 0.00, NULL, 400.00),
(1057, 399, 'forn_prod_forn_1753023793_7a191fb1_13_1753023793', 'SILICONE TRANSPARENTE', 20.00, 'UN', 'PRONTA ENTREGA', '12.0000', 'DISMAFF', '12.0000', 12.00, 12.00, 0.00, 0.00, NULL, 240.00),
(1058, 400, 'forn_prod_forn_1753023793_011528db_1_1753023793', 'GUARNICAO ENGATE LINHA 20', 150.00, 'MT', 'PRONTA ENTREGA', '0.5300', 'ALLOY', '0.5300', 0.53, 0.53, 0.00, 0.00, NULL, 79.50),
(1059, 400, 'forn_prod_forn_1753023793_011528db_2_1753023793', 'TELA MOSQUETEIRA CINZA 1,5 X 100 MT', 150.00, 'MT', 'PRONTA ENTREGA', '13.0000', 'ALLOY', '13.0000', 13.00, 13.00, 0.00, 0.00, NULL, 1950.00),
(1060, 400, 'forn_prod_forn_1753023793_011528db_3_1753023793', 'TUBO DE ALUMINIO 6060 ANOD FOSCO 6MT', 32.00, 'UN', 'PRONTA ENTREGA', '54.0000', 'ALLOY', '54.0000', 54.00, 54.00, 0.00, 0.00, NULL, 1728.00),
(1061, 393, 'forn_prod_forn_1753023793_c8f9c45f_1_1753023793', 'RESISTENCIA FORNO ELETRICO 3300W', 2.00, 'UN', 'PRONTA ENTREGA', '190.0000', 'CRISTAL', '198.0000', 190.00, 198.00, 0.00, 0.00, NULL, 380.00),
(1062, 394, 'forn_prod_forn_1753023793_83893027_1_1753023793', 'BOTINA DE SEGURANCA C/ BICO PVC N44', 1.00, 'UN', '1', '75.0000', 'CASA DO EPI', '79.0000', 75.00, 79.00, 0.00, 0.00, NULL, 75.00),
(1063, 394, 'forn_prod_forn_1753023793_83893027_2_1753023793', 'CALCA DE BRIM CINZA TAM. EXG', 3.00, 'UN', '1', '68.9000', 'CASA DO EPI', '78.0000', 68.90, 78.00, 0.00, 0.00, NULL, 206.70),
(1064, 394, 'forn_prod_forn_1753023793_83893027_3_1753023793', 'CALCA DE BRIM CINZA TAM. GG', 3.00, 'UN', '1', '64.0000', 'CASA DO EPI', '68.0000', 64.00, 68.00, 0.00, 0.00, NULL, 192.00),
(1065, 395, 'forn_prod_forn_1753023793_183f4d9d_4_1753023793', 'BOTINA DE SEGURANCA C/ BICO PVC N44', 1.00, 'UN', '2', NULL, NULL, '132.5000', 132.50, 132.50, 0.00, 0.00, NULL, 132.50),
(1066, 395, 'forn_prod_forn_1753023793_183f4d9d_5_1753023793', 'CALCA DE BRIM CINZA TAM. EXG', 3.00, 'UN', '2', NULL, NULL, '99.0000', 99.00, 99.00, 0.00, 0.00, NULL, 297.00),
(1067, 395, 'forn_prod_forn_1753023793_183f4d9d_6_1753023793', 'CALCA DE BRIM CINZA TAM. GG', 3.00, 'UN', '2', NULL, NULL, '99.0000', 99.00, 99.00, 0.00, 0.00, NULL, 297.00),
(1068, 396, 'forn_prod_forn_1753023793_4f133b33_7_1753023793', 'BOTINA DE SEGURANCA C/ BICO PVC N44', 1.00, 'UN', '1', NULL, NULL, '93.5000', 90.00, 93.50, 0.00, 0.00, NULL, 90.00),
(1069, 396, 'forn_prod_forn_1753023793_4f133b33_8_1753023793', 'CALCA DE BRIM CINZA TAM. EXG', 3.00, 'UN', '1', NULL, NULL, '68.9000', 68.90, 68.90, 0.00, 0.00, NULL, 206.70),
(1070, 396, 'forn_prod_forn_1753023793_4f133b33_9_1753023793', 'CALCA DE BRIM CINZA TAM. GG', 3.00, 'UN', '1', NULL, NULL, '68.9000', 68.90, 68.90, 0.00, 0.00, NULL, 206.70),
(1071, 403, 'forn_prod_forn_1753023793_5c547f37_1_1753023793', 'ARROZ INTEGRAL 1 KG - PCT', 1400.00, 'PC', '7 DIAS ', NULL, NULL, '3.5000', 3.50, 3.50, 0.00, 0.00, '7 DIAS ', 4900.00),
(1072, 403, 'forn_prod_forn_1753023793_5c547f37_2_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 6500.00, 'PC', '7 DIAS ', NULL, NULL, '3.1600', 3.16, 3.16, 0.00, 0.00, '7 DIAS ', 20540.00),
(1073, 403, 'forn_prod_forn_1753023793_5c547f37_3_1753023793', 'ARROZ INTEGRAL 1 KG - PCT', 2000.00, 'PC', '7 DIAS ', NULL, NULL, '3.5000', 3.50, 3.50, 0.00, 0.00, NULL, 7000.00),
(1074, 403, 'forn_prod_forn_1753023793_5c547f37_4_1753023793', 'ARROZ INTEGRAL 1 KG - PCT', 1400.00, 'PC', '7 DIAS ', NULL, NULL, '3.5000', 3.50, 3.50, 0.00, 0.00, NULL, 4900.00),
(1075, 403, 'forn_prod_forn_1753023793_5c547f37_5_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 6500.00, 'PC', '7 DIAS ', NULL, NULL, '3.1600', 3.16, 3.16, 0.00, 0.00, NULL, 20540.00),
(1076, 404, 'forn_prod_forn_1753023793_0cd0779e_6_1753023793', 'AMIDO DE MILHO 1 KG - PCT', 250.00, 'PC', '2 dias ', NULL, NULL, '4.8800', 4.88, 4.88, 0.00, 0.00, '2 dias ', 1220.00),
(1077, 404, 'forn_prod_forn_1753023793_0cd0779e_7_1753023793', 'OREGANO MOIDO 10 G - PCT', 340.00, 'PC', '2 dias ', NULL, NULL, '3.8900', 3.89, 3.89, 0.00, 0.00, '2 dias ', 1322.60),
(1078, 404, 'forn_prod_forn_1753023793_0cd0779e_8_1753023793', 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 6000.00, 'LT', '2 dias ', NULL, NULL, '4.8400', 4.84, 4.84, 0.00, 0.00, '2 dias ', 29040.00),
(1079, 404, 'forn_prod_forn_1753023793_0cd0779e_9_1753023793', 'AMIDO DE MILHO 1 KG - PCT', 250.00, 'PC', '2 dias ', NULL, NULL, '4.8800', 4.88, 4.88, 0.00, 0.00, NULL, 1220.00),
(1080, 404, 'forn_prod_forn_1753023793_0cd0779e_10_1753023793', 'ARROZ INTEGRAL 1 KG - PCT', 1400.00, 'PC', '2 dias ', NULL, NULL, '4.7400', 4.74, 4.74, 0.00, 0.00, '2 dias ', 6636.00),
(1081, 404, 'forn_prod_forn_1753023793_0cd0779e_11_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 6500.00, 'PC', '2 dias ', NULL, NULL, '3.7800', 3.78, 3.78, 0.00, 0.00, '2 dias ', 24570.00),
(1082, 404, 'forn_prod_forn_1753023793_0cd0779e_12_1753023793', 'FEIJAO PRETO 1 KG  - PCT', 4000.00, 'PC', '2 dias ', NULL, NULL, '3.9000', 3.90, 3.90, 0.00, 0.00, '2 dias ', 15600.00),
(1083, 404, 'forn_prod_forn_1753023793_0cd0779e_13_1753023793', 'FARINHA DE MANDIOCA 1 KG - PCT', 600.00, 'PC', '2 dias ', NULL, NULL, '3.6900', 3.69, 3.69, 0.00, 0.00, '2 dias ', 2214.00),
(1084, 404, 'forn_prod_forn_1753023793_0cd0779e_14_1753023793', 'FUBA 1 KG - PCT', 600.00, 'PC', '2 dias ', NULL, NULL, '2.8800', 2.88, 2.88, 0.00, 0.00, '2 dias ', 1728.00),
(1085, 404, 'forn_prod_forn_1753023793_0cd0779e_15_1753023793', 'FARINHA DE TRIGO 1 KG - PCT', 2200.00, 'PC', '2 dias ', NULL, NULL, '3.3900', 3.39, 3.39, 0.00, 0.00, '2 dias ', 7458.00),
(1086, 404, 'forn_prod_forn_1753023793_0cd0779e_16_1753023793', 'FARINHA DE TRIGO INTEGRAL 1 KG - PCT', 100.00, 'PC', '2 dias ', NULL, NULL, '4.7400', 4.74, 4.74, 0.00, 0.00, '2 dias ', 474.00),
(1087, 404, 'forn_prod_forn_1753023793_0cd0779e_17_1753023793', 'MACARRAO ESPAGUETE C/OVOS 500 G - PCT', 4800.00, 'PC', '2 dias ', NULL, NULL, '2.3900', 2.39, 2.39, 0.00, 0.00, '2 dias ', 11472.00),
(1088, 404, 'forn_prod_forn_1753023793_0cd0779e_18_1753023793', 'COLORAU EM PO 500 G - PCT', 500.00, 'UN', '2 dias ', NULL, NULL, '3.2000', 3.20, 3.20, 0.00, 0.00, '2 dias ', 1600.00),
(1089, 404, 'forn_prod_forn_1753023793_0cd0779e_19_1753023793', 'VINAGRE DE ALCOOL 900 ML - UND', 1200.00, 'UN', '2 dias ', NULL, NULL, '2.8800', 2.88, 2.88, 0.00, 0.00, '2 dias ', 3456.00),
(1090, 404, 'forn_prod_forn_1753023793_0cd0779e_20_1753023793', 'OLEO DE SOJA 900 ML - UND', 1700.00, 'UN', '2 dias ', NULL, NULL, '7.2900', 7.29, 7.29, 0.00, 0.00, '2 dias ', 12393.00),
(1091, 404, 'forn_prod_forn_1753023793_0cd0779e_21_1753023793', 'ARROZ INTEGRAL 1 KG - PCT', 2000.00, 'PC', '2 dias ', NULL, NULL, '4.7400', 4.74, 4.74, 0.00, 0.00, NULL, 9480.00),
(1092, 404, 'forn_prod_forn_1753023793_0cd0779e_22_1753023793', 'CAFE EM PO 500 G - PCT', 760.00, 'PC', '2 dias ', NULL, NULL, '13.0000', 13.00, 13.00, 0.00, 0.00, '2 dias ', 9880.00),
(1093, 404, 'forn_prod_forn_1753023793_0cd0779e_23_1753023793', 'FEIJAO PRETO 1 KG  - PCT', 2000.00, 'PC', '2 dias ', NULL, NULL, '3.9000', 3.90, 3.90, 0.00, 0.00, NULL, 7800.00),
(1094, 404, 'forn_prod_forn_1753023793_0cd0779e_24_1753023793', 'FARINHA DE MANDIOCA 1 KG - PCT', 600.00, 'PC', '2 dias ', NULL, NULL, '3.6900', 3.69, 3.69, 0.00, 0.00, NULL, 2214.00),
(1095, 404, 'forn_prod_forn_1753023793_0cd0779e_25_1753023793', 'CANELA EM PO 30 G - PCT', 1500.00, 'PC', '2 dias ', NULL, NULL, '1.8900', 1.89, 1.89, 0.00, 0.00, '2 dias ', 2835.00),
(1096, 404, 'forn_prod_forn_1753023793_0cd0779e_26_1753023793', 'SAL REFINADO 1 KG - PCT', 1500.00, 'PC', '2 dias ', NULL, NULL, '1.6000', 1.60, 1.60, 0.00, 0.00, '2 dias ', 2400.00),
(1097, 404, 'forn_prod_forn_1753023793_0cd0779e_27_1753023793', 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 1500.00, 'PC', '2 dias ', NULL, NULL, '5.8400', 5.84, 5.84, 0.00, 0.00, '2 dias ', 8760.00),
(1098, 404, 'forn_prod_forn_1753023793_0cd0779e_28_1753023793', 'MEL DE ABELHAS 1 KG - PT', 270.00, 'PT', '2 dias ', NULL, NULL, '26.9000', 26.90, 26.90, 0.00, 0.00, '2 dias ', 7263.00),
(1099, 404, 'forn_prod_forn_1753023793_0cd0779e_29_1753023793', 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 6000.00, 'LT', '2 dias ', NULL, NULL, '4.8400', 4.84, 4.84, 0.00, 0.00, NULL, 29040.00),
(1100, 404, 'forn_prod_forn_1753023793_0cd0779e_30_1753023793', 'ARROZ INTEGRAL 1 KG - PCT', 1400.00, 'PC', '2 dias ', NULL, NULL, '4.7400', 4.74, 4.74, 0.00, 0.00, NULL, 6636.00),
(1101, 404, 'forn_prod_forn_1753023793_0cd0779e_31_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 6500.00, 'PC', '2 dias ', NULL, NULL, '3.7800', 3.78, 3.78, 0.00, 0.00, NULL, 24570.00),
(1102, 404, 'forn_prod_forn_1753023793_0cd0779e_32_1753023793', 'FEIJAO PRETO 1 KG  - PCT', 1500.00, 'PC', '2 dias ', NULL, NULL, '3.9000', 3.90, 3.90, 0.00, 0.00, NULL, 5850.00),
(1103, 404, 'forn_prod_forn_1753023793_0cd0779e_33_1753023793', 'FARINHA DE TRIGO 1 KG - PCT', 2200.00, 'PC', '2 dias ', NULL, NULL, '3.3900', 3.39, 3.39, 0.00, 0.00, NULL, 7458.00),
(1104, 404, 'forn_prod_forn_1753023793_0cd0779e_34_1753023793', 'TRIGO PARA QUIBE 500 G - PCT', 150.00, 'PC', '2 dias ', NULL, NULL, '4.2900', 4.29, 4.29, 0.00, 0.00, '2 dias ', 643.50),
(1105, 404, 'forn_prod_forn_1753023793_0cd0779e_35_1753023793', 'COLORAU EM PO 500 G - PCT', 500.00, 'UN', '2 dias ', NULL, NULL, '3.2000', 3.20, 3.20, 0.00, 0.00, NULL, 1600.00),
(1106, 404, 'forn_prod_forn_1753023793_0cd0779e_36_1753023793', 'OREGANO MOIDO 10 G - PCT', 340.00, 'PC', '2 dias ', NULL, NULL, '3.8900', 3.89, 3.89, 0.00, 0.00, NULL, 1322.60),
(1107, 404, 'forn_prod_forn_1753023793_0cd0779e_37_1753023793', 'FERMENTO QUIMICO EM PO 200 G - UND', 600.00, 'UN', '2 dias ', NULL, NULL, '4.6900', 4.69, 4.69, 0.00, 0.00, '2 dias ', 2814.00),
(1108, 404, 'forn_prod_forn_1753023793_0cd0779e_38_1753023793', 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 1500.00, 'PC', '2 dias ', NULL, NULL, '5.8400', 5.84, 5.84, 0.00, 0.00, NULL, 8760.00),
(1109, 404, 'forn_prod_forn_1753023793_0cd0779e_39_1753023793', 'OLEO DE SOJA 900 ML - UND', 1700.00, 'UN', '2 dias ', NULL, NULL, '7.2900', 7.29, 7.29, 0.00, 0.00, NULL, 12393.00),
(1110, 404, 'forn_prod_forn_1753023793_0cd0779e_40_1753023793', 'FEIJAO PRETO 1 KG  - PCT', 4000.00, 'PC', '2 dias ', NULL, NULL, '3.9000', 3.90, 3.90, 0.00, 0.00, NULL, 15600.00),
(1111, 404, 'forn_prod_forn_1753023793_0cd0779e_41_1753023793', 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 200.00, 'PC', '2 dias ', NULL, NULL, '2.3900', 2.39, 2.39, 0.00, 0.00, '2 dias ', 478.00),
(1112, 405, 'forn_prod_forn_1753023793_756f6310_42_1753023793', 'COLORAU EM PO 500 G - PCT', 400.00, 'UN', '7 DIAS ', NULL, NULL, '13.0000', 13.00, 13.00, 0.00, 0.00, '7 DIAS ', 5200.00),
(1113, 405, 'forn_prod_forn_1753023793_756f6310_43_1753023793', 'DOCE DE BANANA ORGANICO 400 G - PT', 40.00, 'PT', '7 DIAS ', NULL, NULL, '12.9000', 12.90, 12.90, 0.00, 0.00, '7 DIAS ', 516.00),
(1114, 405, 'forn_prod_forn_1753023793_756f6310_44_1753023793', 'DOCE DE MORANGO ORGANICO 1 KG - PT', 30.00, 'PT', '7 DIAS ', NULL, NULL, '37.2000', 37.20, 37.20, 0.00, 0.00, '7 DIAS ', 1116.00),
(1115, 405, 'forn_prod_forn_1753023793_756f6310_45_1753023793', 'CANELA EM PO 30 G - PCT', 1500.00, 'PC', '7 DIAS ', NULL, NULL, '4.6000', 4.60, 4.60, 0.00, 0.00, '7 DIAS ', 6900.00),
(1116, 405, 'forn_prod_forn_1753023793_756f6310_46_1753023793', 'MEL DE ABELHAS 1 KG - PT', 270.00, 'PT', '7 DIAS ', NULL, NULL, '36.0000', 36.00, 36.00, 0.00, 0.00, '7 DIAS ', 9720.00),
(1117, 406, 'forn_prod_forn_1753023793_c9de16e7_47_1753023793', 'FARINHA DE TRIGO 1 KG - PCT', 2200.00, 'PC', '7 DIAS ', NULL, NULL, '2.7100', 2.71, 2.71, 0.00, 0.00, '7 DIAS ', 5962.00),
(1118, 406, 'forn_prod_forn_1753023793_c9de16e7_48_1753023793', 'FARINHA DE TRIGO INTEGRAL 1 KG - PCT', 100.00, 'PC', '7 DIAS ', NULL, NULL, '4.0000', 4.00, 4.00, 0.00, 0.00, '7 DIAS ', 400.00),
(1119, 406, 'forn_prod_forn_1753023793_c9de16e7_49_1753023793', 'FARINHA DE TRIGO 1 KG - PCT', 2200.00, 'PC', '7 DIAS ', NULL, NULL, '2.7100', 2.71, 2.71, 0.00, 0.00, NULL, 5962.00),
(1120, 407, 'forn_prod_forn_1753023793_7813211a_50_1753023793', 'MEL DE ABELHAS 1 KG - PT', 270.00, 'PT', '7 DIAS ', NULL, NULL, '26.5000', 26.50, 26.50, 0.00, 0.00, '7 DIAS ', 7155.00),
(1121, 401, 'forn_prod_forn_1753023793_5e89229e_1_1753023793', 'PINHAO CONGELADO 1 KG - PCT', 600.00, 'PC', '5', NULL, NULL, '31.0000', 31.00, 31.00, 0.00, 0.00, '5', 18600.00),
(1122, 401, 'forn_prod_forn_1753023793_5e89229e_2_1753023793', 'PINHAO CONGELADO 1 KG - PCT', 600.00, 'PC', '5', NULL, NULL, '31.0000', 31.00, 31.00, 0.00, 0.00, '5', 18600.00),
(1123, 402, 'forn_prod_forn_1753023793_beec0e7f_3_1753023793', 'PINHAO CONGELADO 1 KG - PCT', 600.00, 'PC', '5', NULL, NULL, '35.0000', 35.00, 35.00, 0.00, 0.00, '5', 21000.00),
(1124, 402, 'forn_prod_forn_1753023793_beec0e7f_4_1753023793', 'PINHAO CONGELADO 1 KG - PCT', 600.00, 'PC', '5', NULL, NULL, '35.0000', 35.00, 35.00, 0.00, 0.00, '5', 21000.00),
(1125, 408, 'forn_prod_forn_1753023793_dd6d1440_1_1753023793', 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 12240.00, 'LT', '14/05/2025', '4.0500', 'COOPEROESTE', '4.0900', 4.05, 4.09, 0.00, 0.00, '28/05/2025', 49572.00),
(1126, 408, 'forn_prod_forn_1753023793_dd6d1440_2_1753023793', 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 8640.00, 'LT', '28/05/2025', '4.0500', 'COOPEROESTE', '4.0500', 4.05, 4.05, 0.00, 0.00, '28/05/2025', 34992.00),
(1127, 409, 'forn_prod_forn_1753023793_7813211a_1_1753023793', 'MEL DE ABELHAS 1 KG - PT', 180.00, 'PT', '14/05/2025', '26.5000', 'SUL MEL', '26.5000', 26.50, 26.50, 0.00, 0.00, '28/05/2025', 4770.00),
(1128, 409, 'forn_prod_forn_1753023793_7813211a_2_1753023793', 'MEL DE ABELHAS 1 KG - PT', 100.00, 'PT', '28/05/2025', '26.5000', 'SUL MEL', '26.5000', 26.50, 26.50, 0.00, 0.00, '28/05/2025', 2650.00),
(1129, 410, 'forn_prod_forn_1753023793_cfad27e0_8_1753023793', 'FOSFORO 40 PALITOS - PC 10 CX', 140.00, 'CX', '14/05/2025', '2.4000', 'TOZZO', '2.4000', 2.40, 2.40, 0.00, 0.00, '14/05/2025', 336.00),
(1130, 410, 'forn_prod_forn_1753023793_cfad27e0_10_1753023793', 'TRIGO PARA QUIBE', 50.00, 'UN', '14/05/2026', '4.1500', 'TOZZO', '4.1500', 4.15, 4.15, 0.00, 0.00, '14/05/2026', 207.50),
(1131, 411, 'forn_prod_forn_1753023793_328e8f95_14_1753023793', 'SAL REFINADO 1 KG - PCT', 900.00, 'PC', '14/05/2025', '1.2900', 'ALBERT', '1.4500', 1.29, 1.45, 0.00, 0.00, '28/05/2025', 1161.00),
(1132, 411, 'forn_prod_forn_1753023793_328e8f95_38_1753023793', 'AVEIA EM FLOCOS 500 G - PCT', 300.00, 'PC', '21/05/2025', '4.7000', 'ALBERT', '4.7900', 4.70, 4.79, 0.00, 0.00, '21/05/2025', 1410.00),
(1133, 411, 'forn_prod_forn_1753023793_328e8f95_53_1753023793', 'SAL REFINADO 1 KG - PCT', 900.00, 'PC', '28/05/2025', '1.2900', 'ALBERT', '1.4500', 1.29, 1.45, 0.00, 0.00, '28/05/2025', 1161.00),
(1134, 412, 'forn_prod_forn_1753023793_0cd0779e_2_1753023793', 'MACARRAO CONCHINHA C/OVOS 500 G - PCT', 2000.00, 'PC', '07/05/2025', '2.4500', 'BRINGHENTTI', '2.5400', 2.45, 2.54, 0.00, 0.00, '28/05/2025', 4900.00),
(1135, 412, 'forn_prod_forn_1753023793_0cd0779e_6_1753023793', 'CAFE EM PO 500 G - PCT', 600.00, 'PC', '14/05/2025', '13.0000', 'BRINGHENTTI', '13.9000', 13.00, 13.90, 0.00, 0.00, '28/05/2025', 7800.00),
(1136, 412, 'forn_prod_forn_1753023793_0cd0779e_17_1753023793', 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 1300.00, 'PC', '14/05/2025', '5.7000', 'BRINGHENTTI', '5.8800', 5.70, 5.88, 0.00, 0.00, '04/06/2025', 7410.00),
(1137, 412, 'forn_prod_forn_1753023793_0cd0779e_18_1753023793', 'OLEO DE SOJA 900 ML - UND', 2000.00, 'UN', '14/05/2025', '6.9500', 'BRINGHENTTI', '6.9900', 6.95, 6.99, 0.00, 0.00, '28/05/2025', 13900.00),
(1138, 412, 'forn_prod_forn_1753023793_0cd0779e_19_1753023793', 'GUARDANAPO 19.5 X 19.5 PCT 50 UND - PCT', 2500.00, 'PC', '14/05/2025', '0.7500', 'BRINGHENTTI', '0.7500', 0.75, 0.75, 0.00, 0.00, '14/05/2025', 1875.00),
(1139, 412, 'forn_prod_forn_1753023793_0cd0779e_21_1753023793', 'SACO DE AMOSTRA C/ 500 UN - PCT', 150.00, 'PC', '14/05/2025', '19.9000', 'BRINGHENTTI', '25.0000', 19.90, 25.00, 0.00, 0.00, '14/05/2025', 2985.00),
(1140, 412, 'forn_prod_forn_1753023793_0cd0779e_27_1753023793', 'PANO DE LIMPEZA PERFLEX - RL', 190.00, 'RL', '14/05/2025', '62.9000', 'BRINGHENTTI', '68.9000', 62.90, 68.90, 0.00, 0.00, '14/05/2025', 11951.00),
(1141, 412, 'forn_prod_forn_1753023793_0cd0779e_36_1753023793', 'FEIJAO PRETO 1 KG  - PCT', 3000.00, 'PC', '21/05/2025', '3.9000', 'BRINGHENTTI', '3.9900', 3.90, 3.99, 0.00, 0.00, '21/05/2025', 11700.00),
(1142, 412, 'forn_prod_forn_1753023793_0cd0779e_40_1753023793', 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 700.00, 'PC', '21/05/2025', '5.7000', 'BRINGHENTTI', '5.8800', 5.70, 5.88, 0.00, 0.00, '21/05/2025', 3990.00),
(1143, 412, 'forn_prod_forn_1753023793_0cd0779e_44_1753023793', 'CAFE EM PO 500 G - PCT', 650.00, 'PC', '28/05/2025', '13.0000', 'BRINGHENTTI', '13.0000', 13.00, 13.00, 0.00, 0.00, '28/05/2025', 8450.00),
(1144, 412, 'forn_prod_forn_1753023793_0cd0779e_50_1753023793', 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 600.00, 'PC', '28/05/2025', '5.7000', 'BRINGHENTTI', '5.8800', 5.70, 5.88, 0.00, 0.00, '28/05/2025', 3420.00),
(1145, 412, 'forn_prod_forn_1753023793_0cd0779e_52_1753023793', 'OLEO DE SOJA 900 ML - UND', 1800.00, 'UN', '28/05/2025', '6.9500', 'BRINGHENTTI', '6.9500', 6.95, 6.95, 0.00, 0.00, '28/05/2025', 12510.00),
(1146, 412, 'forn_prod_forn_1753023793_0cd0779e_56_1753023793', 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 700.00, 'PC', '04/06/2025', '5.7000', 'BRINGHENTTI', '5.8800', 5.70, 5.88, 0.00, 0.00, '04/06/2025', 3990.00),
(1147, 413, 'forn_prod_forn_1753023793_9ebcd89a_1_1753023793', 'FERMENTO QUIMICO EM PO 200 G - UND', 800.00, 'UN', '14/05/2025', '3.8700', 'APTI', '3.8900', 3.87, 3.89, 0.00, 0.00, '21/05/2025', 3096.00),
(1148, 413, 'forn_prod_forn_1753023793_9ebcd89a_2_1753023793', 'FERMENTO QUIMICO EM PO 200 G - UND', 240.00, 'UN', '21/05/2025', '3.8700', 'APTI', '3.8900', 3.87, 3.89, 0.00, 0.00, '21/05/2025', 928.80),
(1149, 414, 'forn_prod_forn_1753023793_2b48cef2_1_1753023793', 'PANO DE CHAO - UN', 150.00, 'UN', '14/05/2025', '2.0000', 'TECELAGEM MARTINS', '2.0000', 2.00, 2.00, 0.00, 0.00, '14/05/2025', 300.00),
(1150, 415, 'forn_prod_forn_1753023793_bbee0d04_1_1753023793', 'FARINHA DE TRIGO 1 KG - PCT', 2000.00, 'PC', '14/05/2025', '2.6900', 'AURI VERDE', '2.7200', 2.69, 2.72, 0.00, 0.00, '21/05/2025', 5380.00),
(1151, 415, 'forn_prod_forn_1753023793_bbee0d04_2_1753023793', 'FARINHA DE TRIGO 1 KG - PCT', 1000.00, 'PC', '21/05/2025', '2.6900', 'AURI VERDE', '2.7200', 2.69, 2.72, 0.00, 0.00, '21/05/2025', 2690.00),
(1152, 415, 'forn_prod_forn_1753023793_bbee0d04_3_1753023793', 'FARINHA DE TRIGO INTEGRAL 1 KG - PCT', 120.00, 'PC', '21/05/2025', '4.0000', 'AURI VERDE', '4.0000', 4.00, 4.00, 0.00, 0.00, '21/05/2025', 480.00),
(1153, 416, 'forn_prod_forn_1753023793_612502fd_3_1753023793', 'SACO DE LIXO 100 LT C/ 100 UN - PCT', 280.00, 'PC', '14/05/2025', '33.9700', 'ONFINITY', '33.9700', 33.97, 33.97, 0.00, 0.00, '14/05/2025', 9511.60),
(1154, 416, 'forn_prod_forn_1753023793_612502fd_4_1753023793', 'ALCOOL 1LT - UND', 260.00, 'UN', '14/05/2025', '4.9000', 'ONFINITY', '4.9000', 4.90, 4.90, 0.00, 0.00, '14/05/2025', 1274.00),
(1155, 416, 'forn_prod_forn_1753023793_612502fd_6_1753023793', 'ESPONJA DUPLA FACE - UN', 1200.00, 'UN', '14/05/2025', '0.5200', 'ONFINITY', '0.5200', 0.52, 0.52, 0.00, 0.00, '14/05/2025', 624.00),
(1156, 416, 'forn_prod_forn_1753023793_612502fd_7_1753023793', 'ESPONJA FIBRA 125 X 87 X 20 MM  - UN', 500.00, 'UN', '14/05/2025', '1.6100', 'ONFINITY', '1.6100', 1.61, 1.61, 0.00, 0.00, '14/05/2025', 805.00),
(1157, 416, 'forn_prod_forn_1753023793_612502fd_13_1753023793', 'LUVA PLASTICA DESCARTAVEL PCT C/100', 170.00, 'UN', '14/05/2025', '1.3000', 'ONFINITY', '1.3000', 1.30, 1.30, 0.00, 0.00, '14/05/2025', 221.00),
(1158, 417, 'forn_prod_forn_1753023793_f6856826_3_1753023793', 'BOBINA PLASTICA PICOTADA 40X60 - RL', 120.00, 'RL', '14/05/2025', '29.9000', 'DVILLE', '29.9000', 29.90, 29.90, 0.00, 0.00, '14/05/2025', 3588.00),
(1159, 417, 'forn_prod_forn_1753023793_f6856826_10_1753023793', 'PAPEL TOALHA INTERFOLHADO 1000 FLS - PCT', 170.00, 'UN', '14/05/2025', '9.5000', 'DVILLE', '9.5000', 9.50, 9.50, 0.00, 0.00, '14/05/2025', 1615.00),
(1160, 417, 'forn_prod_forn_1753023793_f6856826_11_1753023793', 'VASSOURA DE NYLON C/ CABO - UN', 204.00, 'UN', '14/05/2025', '5.9000', 'DVILLE', '7.5000', 5.90, 7.50, 0.00, 0.00, '14/05/2025', 1203.60),
(1161, 417, 'forn_prod_forn_1753023793_f6856826_12_1753023793', 'LUVA DE BORRACHA - M', 140.00, 'UN', '14/05/2025', '2.4500', 'DVILLE', '2.5000', 2.45, 2.50, 0.00, 0.00, '14/05/2025', 343.00),
(1162, 417, 'forn_prod_forn_1753023793_f6856826_14_1753023793', 'TOUCA DESCARTAVEL PCT C/100', 140.00, 'LT', '14/05/2025', '7.5600', 'DVILLE', '8.5000', 7.56, 8.50, 0.00, 0.00, '14/05/2025', 1058.40),
(1163, 418, 'forn_prod_forn_1753023793_f9aac9e7_1_1753023793', 'BISCOITO CASEIRO 1 KG - PCT', 1000.00, 'PC', '28/05/2025', '13.9500', 'COOPERFAVI', '14.5000', 13.95, 14.50, 0.00, 0.00, '04/06/2025', 13950.00),
(1164, 418, 'forn_prod_forn_1753023793_f9aac9e7_2_1753023793', 'BISCOITO CASEIRO 1 KG - PCT', 1200.00, 'PC', '04/06/2025', '13.9500', 'COOPERFAVI', '14.5000', 13.95, 14.50, 0.00, 0.00, '04/06/2025', 16740.00),
(1165, 419, 'forn_prod_forn_1753023793_2aa7027a_1_1753023793', 'ARROZ INTEGRAL 1 KG - PCT', 1000.00, 'PC', '14/05/2025', '3.7000', 'RAMPINELI', '3.7000', 3.70, 3.70, 0.00, 0.00, '14/05/2025', 3700.00),
(1166, 419, 'forn_prod_forn_1753023793_2aa7027a_2_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 3000.00, 'PC', '14/05/2025', '3.1400', 'RAMPINELI', '3.1400', 3.14, 3.14, 0.00, 0.00, '14/05/2025', 9420.00),
(1167, 419, 'forn_prod_forn_1753023793_2aa7027a_4_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 3900.00, 'PC', '21/05/2025', '3.1400', 'RAMPINELI', '3.1400', 3.14, 3.14, 0.00, 0.00, '21/05/2025', 12246.00),
(1168, 419, 'forn_prod_forn_1753023793_2aa7027a_5_1753023793', 'ARROZ INTEGRAL 1 KG - PCT', 900.00, 'PC', '28/05/2025', '3.7000', 'RAMPINELI', '3.7000', 3.70, 3.70, 0.00, 0.00, '28/05/2025', 3330.00),
(1169, 419, 'forn_prod_forn_1753023793_2aa7027a_6_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 3000.00, 'PC', '28/05/2025', '3.1400', 'RAMPINELI', '3.1400', 3.14, 3.14, 0.00, 0.00, '28/05/2025', 9420.00),
(1170, 419, 'forn_prod_forn_1753023793_2aa7027a_7_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 2800.00, 'PC', '04/06/2025', '3.1400', 'RAMPINELI', '3.1400', 3.14, 3.14, 0.00, 0.00, '04/06/2025', 8792.00),
(1171, 420, 'forn_prod_forn_1753023793_6a47ed4e_1_1753023793', 'OREGANO MOIDO 10 G - PCT', 300.00, 'PC', '07/05/2025', '1.2000', 'DAJU', '1.2000', 1.20, 1.20, 0.00, 0.00, '28/05/2025', 360.00),
(1172, 420, 'forn_prod_forn_1753023793_6a47ed4e_2_1753023793', 'MILHO CANJICA 500G - PCT', 500.00, 'PC', '14/05/2025', '2.1200', 'DAJU', '2.1200', 2.12, 2.12, 0.00, 0.00, '28/05/2025', 1060.00),
(1173, 420, 'forn_prod_forn_1753023793_6a47ed4e_3_1753023793', 'CANELA EM PO 30 G - PCT', 650.00, 'PC', '14/05/2025', '1.2600', 'DAJU', '1.2600', 1.26, 1.26, 0.00, 0.00, '04/06/2025', 819.00),
(1174, 420, 'forn_prod_forn_1753023793_6a47ed4e_4_1753023793', 'COLORAU EM PO 500 G - PCT', 450.00, 'UN', '14/05/2025', '2.4900', 'DAJU', '2.4900', 2.49, 2.49, 0.00, 0.00, '28/05/2025', 1120.50),
(1175, 420, 'forn_prod_forn_1753023793_6a47ed4e_5_1753023793', 'FUBA 1 KG - PCT', 750.00, 'PC', '21/05/2025', '2.6500', 'DAJU', '2.6500', 2.65, 2.65, 0.00, 0.00, '21/05/2025', 1987.50),
(1176, 420, 'forn_prod_forn_1753023793_6a47ed4e_6_1753023793', 'MILHO CANJICA 500G - PCT', 2020.00, 'PC', '28/05/2025', '2.1200', 'DAJU', '2.1200', 2.12, 2.12, 0.00, 0.00, '28/05/2025', 4282.40),
(1177, 420, 'forn_prod_forn_1753023793_6a47ed4e_7_1753023793', 'COLORAU EM PO 500 G - PCT', 380.00, 'UN', '28/05/2025', '2.4900', 'DAJU', '2.4900', 2.49, 2.49, 0.00, 0.00, '28/05/2025', 946.20),
(1178, 420, 'forn_prod_forn_1753023793_6a47ed4e_8_1753023793', 'OREGANO MOIDO 10 G - PCT', 340.00, 'PC', '28/05/2025', '1.2000', 'DAJU', '1.2000', 1.20, 1.20, 0.00, 0.00, '28/05/2025', 408.00),
(1179, 420, 'forn_prod_forn_1753023793_6a47ed4e_9_1753023793', 'CANELA EM PO 30 G - PCT', 350.00, 'PC', '04/06/2025', '1.2600', 'DAJU', '1.2600', 1.26, 1.26, 0.00, 0.00, '04/06/2025', 441.00),
(1180, 421, 'forn_prod_forn_1753023793_048d2613_1_1753023793', 'DETERGENTE NEUTRO 500 ML - FR', 3200.00, 'UN', '14/05/2025', '1.3000', 'ZAVASKI', '1.3000', 1.30, 1.30, 0.00, 0.00, '14/05/2025', 4160.00),
(1181, 422, 'forn_prod_forn_1753023793_9151be7f_1_1753023793', 'MACARRAO PENNE C/OVOS 500 G - PCT', 600.00, 'PC', '07/05/2025', '2.0000', 'MUFFATO', '2.0000', 2.00, 2.00, 0.00, 0.00, '07/05/2025', 1200.00),
(1182, 422, 'forn_prod_forn_1753023793_9151be7f_2_1753023793', 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 1500.00, 'PC', '14/05/2025', '2.0000', 'MUFFATO', '2.0000', 2.00, 2.00, 0.00, 0.00, '04/06/2025', 3000.00),
(1183, 422, 'forn_prod_forn_1753023793_9151be7f_4_1753023793', 'AGUA SANITARIA 1LT - UND', 1600.00, 'UN', '14/05/2025', '2.0000', 'MUFFATO', '2.0000', 2.00, 2.00, 0.00, 0.00, '14/05/2025', 3200.00),
(1184, 422, 'forn_prod_forn_1753023793_9151be7f_11_1753023793', 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 3700.00, 'PC', '04/06/2025', '2.0000', 'MUFFATO', '2.0000', 2.00, 2.00, 0.00, 0.00, '04/06/2025', 7400.00),
(1185, 423, 'forn_prod_forn_1753023793_cd91cb91_13_1753023793', 'VINAGRE DE ALCOOL 900 ML - UND', 600.00, 'UN', '14/05/2025', '1.5200', 'TAF', '1.5200', 1.52, 1.52, 0.00, 0.00, '28/05/2025', 912.00),
(1186, 423, 'forn_prod_forn_1753023793_cd91cb91_41_1753023793', 'VINAGRE DE ALCOOL 900 ML - UND', 620.00, 'UN', '28/05/2025', '1.5200', 'TAF', '1.5200', 1.52, 1.52, 0.00, 0.00, '28/05/2025', 942.40),
(1187, 423, 'forn_prod_forn_1753023793_cd91cb91_46_1753023793', 'FEIJAO VERMELHO 1 KG - PCT', 50.00, 'PC', '04/06/2025', '9.3300', 'TAF', '9.3300', 9.33, 9.33, 0.00, 0.00, '04/06/2025', 466.50),
(1188, 424, 'forn_prod_forn_1753023793_cdcb42d9_9_1753023793', 'FARINHA DE MANDIOCA 1 KG - PCT', 1100.00, 'PC', '14/05/2025', '3.3900', 'BAIA NORTE', '3.3900', 3.39, 3.39, 0.00, 0.00, '14/05/2025', 3729.00),
(1189, 425, 'forn_prod_forn_1753023793_446c6c15_1_1753023793', 'CACAU EM PO 100% 1 KG - PCT', 100.00, 'PC', '28/05/2025', '29.8900', 'NUTYLAC', '30.1000', 29.89, 30.10, 0.00, 0.00, '28/05/2025', 2989.00),
(1190, 426, 'forn_prod_forn_1753023793_804c7a16_1_1753023793', 'SUCO INTEGRAL DE UVA 1,5 LT - GF', 2500.00, 'GF', '14/05/2025', '13.5000', 'DIFIORI', '18.0000', 13.50, 18.00, 0.00, 0.00, '28/05/2025', 33750.00),
(1191, 426, 'forn_prod_forn_1753023793_804c7a16_2_1753023793', 'SUCO INTEGRAL DE UVA 1,5 LT - GF', 1500.00, 'GF', '28/05/2025', '13.5000', 'DIFIORI', '18.0000', 13.50, 18.00, 0.00, 0.00, '28/05/2025', 20250.00),
(1192, 427, 'forn_prod_forn_1753023793_756f6310_1_1753023793', 'DOCE DE MORANGO ORGANICO 1 KG - PT', 30.00, 'PT', '14/05/2025', '28.0000', 'COPAVIDI', '29.0000', 28.00, 29.00, 0.00, 0.00, '14/05/2025', 840.00),
(1193, 428, 'forn_prod_forn_1753023793_dd6d1440_1_1753023793', 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 14000.00, 'PC', '07/05/2025', '4.0500', 'COOPEROESTE', '4.0900', 4.05, 4.09, 0.00, 0.00, '07/05/2025', 56700.00),
(1194, 429, 'forn_prod_forn_1753023793_7813211a_1_1753023793', 'MEL DE ABELHAS 1 KG - PT', 160.00, 'PC', '14/05/2025', '26.5000', 'SUL MEL', '26.5000', 26.50, 26.50, 0.00, 0.00, '14/05/2025', 4240.00),
(1195, 430, 'forn_prod_forn_1753023793_cfad27e0_6_1753023793', 'FOSFORO 40 PALITOS - PC 10 CX', 120.00, 'UN', '14/05/2025', '2.4000', 'TOZZO', '2.4000', 2.40, 2.40, 0.00, 0.00, '14/05/2025', 288.00),
(1196, 431, 'forn_prod_forn_1753023793_328e8f95_6_1753023793', 'AVEIA EM FLOCOS 500 G - PCT', 560.00, 'UN', '14/05/2025', '4.7000', 'ALBERT', '4.7900', 4.70, 4.79, 0.00, 0.00, '14/05/2025', 2632.00),
(1197, 432, 'forn_prod_forn_1753023793_0cd0779e_6_1753023793', 'CAFE EM PO 500 G - PCT', 500.00, 'PC', '14/05/2025', '13.0000', 'BRINGHENTTI', '13.9000', 13.00, 13.90, 0.00, 0.00, '14/05/2025', 6500.00),
(1198, 432, 'forn_prod_forn_1753023793_0cd0779e_12_1753023793', 'MACARRAO CONCHINHA C/OVOS 500 G - PCT', 800.00, 'PC', '14/05/2025', '2.4500', 'BRINGHENTTI', '2.5400', 2.45, 2.54, 0.00, 0.00, '14/05/2025', 1960.00),
(1199, 432, 'forn_prod_forn_1753023793_0cd0779e_14_1753023793', 'COLORAU EM PO 500 G - PCT', 700.00, 'PC', '14/05/2025', '3.1000', 'BRINGHENTTI', '3.1900', 3.10, 3.19, 0.00, 0.00, '14/05/2025', 2170.00),
(1200, 432, 'forn_prod_forn_1753023793_0cd0779e_16_1753023793', 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 1000.00, 'CX', '14/05/2025', '5.7000', 'BRINGHENTTI', '5.8800', 5.70, 5.88, 0.00, 0.00, '14/05/2025', 5700.00),
(1201, 432, 'forn_prod_forn_1753023793_0cd0779e_18_1753023793', 'OLEO DE SOJA 900 ML - UND', 2000.00, 'UN', '14/05/2025', '6.9500', 'BRINGHENTTI', '6.9900', 6.95, 6.99, 0.00, 0.00, '14/05/2025', 13900.00),
(1202, 432, 'forn_prod_forn_1753023793_0cd0779e_19_1753023793', 'GUARDANAPO 19.5 X 19.5 PCT 50 UND - PCT', 1800.00, 'UN', '14/05/2025', '0.7500', 'BRINGHENTTI', '0.7500', 0.75, 0.75, 0.00, 0.00, '14/05/2025', 1350.00),
(1203, 432, 'forn_prod_forn_1753023793_0cd0779e_20_1753023793', 'SACO DE AMOSTRA C/ 500 UN - PCT', 80.00, 'PC', '14/05/2025', '19.9000', 'BRINGHENTTI', '25.0000', 19.90, 25.00, 0.00, 0.00, '14/05/2025', 1592.00),
(1204, 432, 'forn_prod_forn_1753023793_0cd0779e_23_1753023793', 'PANO DE LIMPEZA PERFLEX - RL', 120.00, 'UN', '14/05/2025', '62.9000', 'BRINGHENTTI', '68.9000', 62.90, 68.90, 0.00, 0.00, '14/05/2025', 7548.00),
(1205, 432, 'forn_prod_forn_1753023793_0cd0779e_29_1753023793', 'AMIDO DE MILHO 1 KG - PCT', 60.00, 'PC', '21/05/2025', '4.7500', 'BRINGHENTTI', '4.8800', 4.75, 4.88, 0.00, 0.00, '21/05/2025', 285.00),
(1206, 432, 'forn_prod_forn_1753023793_0cd0779e_31_1753023793', 'FUBA 1 KG - PCT', 540.00, 'PC', '21/05/2025', '2.8900', 'BRINGHENTTI', '3.2000', 2.89, 3.20, 0.00, 0.00, '21/05/2025', 1560.60),
(1207, 432, 'forn_prod_forn_1753023793_0cd0779e_34_1753023793', 'CAFE EM PO 500 G - PCT', 400.00, 'PC', '28/05/2025', '13.0000', 'BRINGHENTTI', '11.9000', 13.00, 11.90, 0.00, 0.00, '28/05/2025', 5200.00),
(1208, 432, 'forn_prod_forn_1753023793_0cd0779e_36_1753023793', 'MACARRAO CONCHINHA C/OVOS 500 G - PCT', 740.00, 'UN', '28/05/2025', '2.4500', 'BRINGHENTTI', '2.5400', 2.45, 2.54, 0.00, 0.00, '28/05/2025', 1813.00),
(1209, 432, 'forn_prod_forn_1753023793_0cd0779e_37_1753023793', 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 800.00, 'PC', '28/05/2025', '5.7000', 'BRINGHENTTI', '5.8800', 5.70, 5.88, 0.00, 0.00, '28/05/2025', 4560.00),
(1210, 433, 'forn_prod_forn_1753023793_9ebcd89a_1_1753023793', 'FERMENTO QUIMICO EM PO 200 G - UND', 600.00, 'UN', '14/05/2025', '3.8700', 'APTI', '3.8900', 3.87, 3.89, 0.00, 0.00, '14/05/2025', 2322.00),
(1211, 434, 'forn_prod_forn_1753023793_2b48cef2_1_1753023793', 'PANO DE CHAO - UN', 140.00, 'RL', '14/05/2025', '2.0000', 'TECELAGEM MARTINS', '2.0000', 2.00, 2.00, 0.00, 0.00, '14/05/2025', 280.00),
(1212, 435, 'forn_prod_forn_1753023793_bbee0d04_1_1753023793', 'FARINHA DE TRIGO 1 KG - PCT', 1550.00, 'PC', '14/05/2025', '2.6900', 'AURI VERDE', '2.7200', 2.69, 2.72, 0.00, 0.00, '14/05/2025', 4169.50),
(1213, 436, 'forn_prod_forn_1753023793_612502fd_1_1753023793', 'ESPONJA DUPLA FACE - UN', 1600.00, 'LT', '07/05/2025', '0.5200', 'ONFINITY', '0.5200', 0.52, 0.52, 0.00, 0.00, '07/05/2025', 832.00),
(1214, 436, 'forn_prod_forn_1753023793_612502fd_3_1753023793', 'SACO DE LIXO 200LT C/ 100 UN  8 MICRAS- PCT', 130.00, 'PC', '14/05/2025', '48.0000', 'ONFINITY', '55.8800', 48.00, 55.88, 0.00, 0.00, '14/05/2025', 6240.00),
(1215, 436, 'forn_prod_forn_1753023793_612502fd_4_1753023793', 'ALCOOL 1LT - UND', 300.00, 'PT', '14/05/2025', '4.9000', 'ONFINITY', '4.9000', 4.90, 4.90, 0.00, 0.00, '14/05/2025', 1470.00),
(1216, 436, 'forn_prod_forn_1753023793_612502fd_5_1753023793', 'ESPONJA FIBRA 125 X 87 X 20 MM  - UN', 220.00, 'PC', '14/05/2025', '1.6130', 'ONFINITY', '1.6130', 1.61, 1.61, 0.00, 0.00, '14/05/2025', 354.86),
(1217, 436, 'forn_prod_forn_1753023793_612502fd_11_1753023793', 'LUVA PLASTICA DESCARTAVEL PCT C/100', 100.00, 'UN', '14/05/2025', '1.3000', 'ONFINITY', '1.3000', 1.30, 1.30, 0.00, 0.00, '14/05/2025', 130.00),
(1218, 437, 'forn_prod_forn_1753023793_f6856826_7_1753023793', 'PAPEL TOALHA INTERFOLHADO 1000 FLS - PCT', 100.00, 'UN', '14/05/2025', '9.5000', 'DVILLE', '9.5000', 9.50, 9.50, 0.00, 0.00, '14/05/2025', 950.00),
(1219, 437, 'forn_prod_forn_1753023793_f6856826_8_1753023793', 'VASSOURA DE NYLON C/ CABO - UN', 130.00, 'PC', '14/05/2025', '5.9000', 'DVILLE', '7.5000', 5.90, 7.50, 0.00, 0.00, '14/05/2025', 767.00),
(1220, 437, 'forn_prod_forn_1753023793_f6856826_9_1753023793', 'LUVA DE BORRACHA - M', 120.00, 'PC', '14/05/2025', '2.4500', 'DVILLE', '2.5000', 2.45, 2.50, 0.00, 0.00, '14/05/2025', 294.00),
(1221, 437, 'forn_prod_forn_1753023793_f6856826_11_1753023793', 'TOUCA DESCARTAVEL PCT C/100', 100.00, 'UN', '14/05/2025', '7.5600', 'DVILLE', '8.5000', 7.56, 8.50, 0.00, 0.00, '14/05/2025', 756.00),
(1222, 438, 'forn_prod_forn_1753023793_f9aac9e7_1_1753023793', 'BISCOITO CASEIRO 1 KG - PCT', 1000.00, 'PC', '04/06/2025', '13.9500', 'COOPERFAVI', '14.5000', 13.95, 14.50, 0.00, 0.00, '04/06/2025', 13950.00),
(1223, 439, 'forn_prod_forn_1753023793_2aa7027a_1_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 800.00, 'UN', '07/05/2025', '3.1400', 'RAMPINELI', '3.1600', 3.14, 3.16, 0.00, 0.00, '07/05/2025', 2512.00),
(1224, 439, 'forn_prod_forn_1753023793_2aa7027a_2_1753023793', 'ARROZ INTEGRAL 1 KG - PCT', 1800.00, 'PC', '14/05/2025', '3.7000', 'RAMPINELI', '3.9000', 3.70, 3.90, 0.00, 0.00, '14/05/2025', 6660.00),
(1225, 439, 'forn_prod_forn_1753023793_2aa7027a_3_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 4500.00, 'UN', '14/05/2025', '3.1400', 'RAMPINELI', '3.1600', 3.14, 3.16, 0.00, 0.00, '14/05/2025', 14130.00),
(1226, 439, 'forn_prod_forn_1753023793_2aa7027a_4_1753023793', 'ARROZ PARBOILIZADO 1 KG - PCT', 3600.00, 'PC', '28/05/2025', '3.1400', 'RAMPINELI', '3.1600', 3.14, 3.16, 0.00, 0.00, '28/05/2025', 11304.00),
(1227, 440, 'forn_prod_forn_1753023793_6a47ed4e_1_1753023793', 'CANELA EM PO 30 G - PCT', 350.00, 'PC', '14/05/2025', '1.2600', 'DAJU', '1.2600', 1.26, 1.26, 0.00, 0.00, '14/05/2025', 441.00),
(1228, 440, 'forn_prod_forn_1753023793_6a47ed4e_2_1753023793', 'OREGANO MOIDO 10 G - PCT', 340.00, 'PC', '28/05/2025', '1.2000', 'DAJU', '1.2000', 1.20, 1.20, 0.00, 0.00, '28/05/2025', 408.00),
(1229, 440, 'forn_prod_forn_1753023793_6a47ed4e_3_1753023793', 'CANELA EM PO 30 G - PCT', 270.00, 'PC', '04/06/2025', '1.2600', 'DAJU', '1.2600', 1.26, 1.26, 0.00, 0.00, '04/06/2025', 340.20),
(1230, 441, 'forn_prod_forn_1753023793_9151be7f_1_1753023793', 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 1000.00, 'UN', '14/05/2025', '2.0000', 'MUFFATO', '2.0000', 2.00, 2.00, 0.00, 0.00, '14/05/2025', 2000.00),
(1231, 441, 'forn_prod_forn_1753023793_9151be7f_2_1753023793', 'MACARRAO PENNE C/OVOS 500 G - PCT', 300.00, 'UN', '14/05/2025', '2.0000', 'MUFFATO', '2.0000', 2.00, 2.00, 0.00, 0.00, '14/05/2025', 600.00),
(1232, 441, 'forn_prod_forn_1753023793_9151be7f_3_1753023793', 'AGUA SANITARIA 1LT - UND', 600.00, 'PC', '14/05/2025', '1.7900', 'MUFFATO', '1.7900', 1.79, 1.79, 0.00, 0.00, '14/05/2025', 1074.00),
(1233, 441, 'forn_prod_forn_1753023793_9151be7f_9_1753023793', 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 2200.00, 'PC', '04/06/2025', '2.0000', 'MUFFATO', '2.0000', 2.00, 2.00, 0.00, 0.00, '04/06/2025', 4400.00),
(1234, 442, 'forn_prod_forn_1753023793_cd91cb91_9_1753023793', 'MILHO CANJICA 500G - PCT', 600.00, 'PC', '14/05/2025', '2.1200', 'TAF', '2.1200', 2.12, 2.12, 0.00, 0.00, '14/05/2025', 1272.00),
(1235, 442, 'forn_prod_forn_1753023793_cd91cb91_23_1753023793', 'SAL REFINADO 1 KG - PCT', 900.00, 'PC', '21/05/2025', '1.3900', 'TAF', '1.3900', 1.39, 1.39, 0.00, 0.00, '21/05/2025', 1251.00),
(1236, 442, 'forn_prod_forn_1753023793_cd91cb91_28_1753023793', 'MILHO CANJICA 500G - PCT', 1000.00, 'PC', '04/06/2025', '2.1200', 'TAF', '2.1200', 2.12, 2.12, 0.00, 0.00, '04/06/2025', 2120.00),
(1237, 443, 'forn_prod_forn_1753023793_cdcb42d9_34_1753023793', 'FARINHA DE MANDIOCA 1 KG - PCT', 500.00, 'PC', '21/05/2025', '3.3900', 'BAIA NORTE', '3.3900', 3.39, 3.39, 0.00, 0.00, '21/05/2025', 1695.00),
(1238, 444, 'forn_prod_forn_1753023793_b0955496_1_1753023793', 'CANTONEIRA 1.1/4x1/8', 1.00, 'BA', '13/06/2025', '100.0000', 'DOBRAPERFIL', '105.0000', 100.00, 105.00, 0.00, 0.00, '13/06/2025', 100.00),
(1239, 444, 'forn_prod_forn_1753023793_b0955496_2_1753023793', 'PERFIL DE CHAPA 0,80 GALV', 6.00, 'KG', '13/06/2025', '44.0000', 'DOBRAPERFIL', '45.0000', 44.00, 45.00, 0.00, 0.00, '13/06/2025', 264.00),
(1240, 444, 'forn_prod_forn_1753023793_b0955496_3_1753023793', 'PERFIL DE CHAPA 1.50', 21.00, 'UN', '14/06/2025', '14.0000', 'DOBRAPERFIL', '15.0000', 14.00, 15.00, 0.00, 0.00, '14/06/2025', 294.00),
(1241, 444, 'forn_prod_forn_1753023793_b0955496_4_1753023793', 'PERFIL DE CHAPA INOX 304', 6.00, 'KG', '13/06/2025', '78.0000', 'DOBRAPERFIL', '80.0000', 78.00, 80.00, 0.00, 0.00, '13/06/2025', 468.00),
(1242, 445, 'forn_prod_forn_1753023793_508a1b6c_1_1753023793', 'BISCOITO ZERO LACT ROSQ COCO/LEITE 250 G - PCT', 160.00, 'PC', '23/07/2025', NULL, NULL, '5.9800', 5.90, 5.98, 0.00, 0.00, '23/07/2025', 944.00),
(1243, 445, 'forn_prod_forn_1753023793_508a1b6c_2_1753023793', 'FARINHA DE ARROZ SEM GLUTEN 1KG - PCT', 10.00, 'PC', '23/07/2025', NULL, NULL, '6.9800', 6.90, 6.98, 0.00, 0.00, '23/07/2025', 69.00),
(1244, 445, 'forn_prod_forn_1753023793_508a1b6c_3_1753023793', 'LEITE UHT DESNATADO 1 LT - LT', 6.00, 'LT', '23/07/2025', NULL, NULL, '5.4500', 5.40, 5.45, 0.00, 0.00, '23/07/2025', 32.40),
(1245, 445, 'forn_prod_forn_1753023793_508a1b6c_4_1753023793', 'LEITE ZERO LACTOSE UHT INTEGRAL 1 LT - LT', 300.00, 'LT', '23/07/2025', NULL, NULL, '5.4500', 5.40, 5.45, 0.00, 0.00, '23/07/2025', 1620.00),
(1246, 445, 'forn_prod_forn_1753023793_508a1b6c_5_1753023793', 'MACARRAO D ARROZ  S/GLUTEN ESPAGUETE 500 G - PCT', 20.00, 'PC', '23/07/2025', NULL, NULL, '5.4500', 5.40, 5.45, 0.00, 0.00, '23/07/2025', 108.00),
(1247, 445, 'forn_prod_forn_1753023793_508a1b6c_6_1753023793', 'MACARRAO INTEGRAL ESPAGUETE 500 G - PCT', 20.00, 'PC', '23/07/2025', NULL, NULL, '5.4500', 5.40, 5.45, 0.00, 0.00, '23/07/2025', 108.00),
(1248, 445, 'forn_prod_forn_1753023793_508a1b6c_7_1753023793', 'MANTEIGA ZERO LACTOSE 200G - PT', 100.00, 'PT', '23/07/2025', NULL, NULL, '10.9800', 10.95, 10.98, 0.00, 0.00, '23/07/2025', 1095.00),
(1249, 445, 'forn_prod_forn_1753023793_508a1b6c_8_1753023793', 'PAO FAT. S/OVOS/ACUCAR (CENOURA) 400 G - PCT', 80.00, 'PC', '23/07/2025', NULL, NULL, '16.9800', 16.92, 16.98, 0.00, 0.00, '23/07/2025', 1353.60),
(1250, 445, 'forn_prod_forn_1753023793_508a1b6c_9_1753023793', 'QUEIJO MUSSARELA ZERO LACTOSE 150 G - PCT', 150.00, 'PT', '23/07/2025', NULL, NULL, '9.9900', 9.80, 9.99, 0.00, 0.00, '23/07/2025', 1470.00),
(1251, 446, 'forn_prod_forn_1753023793_928d875e_10_1753023793', 'MANTEIGA ZERO LACTOSE 200G - PT', 100.00, 'PT', '0.027430167597765', NULL, NULL, '9.8200', 9.82, 9.82, 0.00, 0.00, '0.027430167597765', 982.00),
(1252, 446, 'forn_prod_forn_1753023793_928d875e_11_1753023793', 'QUEIJO MUSSARELA ZERO LACTOSE 150 G - PCT', 150.00, 'PT', '0.31222882562278', NULL, NULL, '8.2000', 8.20, 8.20, 0.00, 0.00, '0.31222882562278', 1230.00),
(1253, 447, 'forn_prod_forn_1753023793_bb6a373e_12_1753023793', 'BISCOITO ZERO LACT ROSQ COCO/LEITE 250 G - PCT', 160.00, 'PC', '23/07/2025', NULL, NULL, '0.0000', 0.00, 0.00, 0.00, 0.00, '23/07/2025', 0.00),
(1254, 447, 'forn_prod_forn_1753023793_bb6a373e_13_1753023793', 'PAO FAT. S/OVOS/ACUCAR (CENOURA) 400 G - PCT', 80.00, 'PC', '23/07/2025', NULL, NULL, '12.7625', 12.76, 12.76, 0.00, 0.00, '23/07/2025', 1021.00),
(1255, 448, 'forn_prod_forn_1753023793_6b77ac10_14_1753023793', 'FARINHA DE ARROZ SEM GLUTEN 1KG - PCT', 10.00, 'PC', '1.005212962963', NULL, NULL, '7.9900', 7.99, 7.99, 0.00, 0.00, '1.005212962963', 79.90),
(1256, 448, 'forn_prod_forn_1753023793_6b77ac10_15_1753023793', 'LEITE UHT DESNATADO 1 LT - LT', 6.00, 'LT', '1.5375', NULL, NULL, '5.9900', 5.99, 5.99, 0.00, 0.00, '1.5375', 35.94),
(1257, 448, 'forn_prod_forn_1753023793_6b77ac10_16_1753023793', 'LEITE ZERO LACTOSE UHT INTEGRAL 1 LT - LT', 300.00, 'LT', '0.43191745686452', NULL, NULL, '5.9900', 5.99, 5.99, 0.00, 0.00, '0.43191745686452', 1797.00),
(1258, 448, 'forn_prod_forn_1753023793_6b77ac10_17_1753023793', 'MACARRAO D ARROZ  S/GLUTEN ESPAGUETE 500 G - PCT', 20.00, 'PC', '0.73648648648649', NULL, NULL, '6.9900', 6.99, 6.99, 0.00, 0.00, '0.73648648648649', 139.80),
(1259, 448, 'forn_prod_forn_1753023793_6b77ac10_18_1753023793', 'MACARRAO INTEGRAL ESPAGUETE 500 G - PCT', 20.00, 'PC', '0.47579365079365', NULL, NULL, '6.9900', 6.99, 6.99, 0.00, 0.00, '0.47579365079365', 139.80),
(1260, 448, 'forn_prod_forn_1753023793_6b77ac10_19_1753023793', 'PAO FAT. S/OVOS/ACUCAR (CENOURA) 400 G - PCT', 80.00, 'PC', '2.0459167337099', NULL, NULL, '14.9900', 14.99, 14.99, 0.00, 0.00, '2.0459167337099', 1199.20),
(1261, 448, 'forn_prod_forn_1753023793_6b77ac10_20_1753023793', 'QUEIJO MUSSARELA ZERO LACTOSE 150 G - PCT', 150.00, 'PT', '0.31222882562278', NULL, NULL, '11.9900', 11.99, 11.99, 0.00, 0.00, '0.31222882562278', 1798.50),
(1262, 449, 'forn_prod_forn_1753023793_bfe15e3a_21_1753023793', 'BISCOITO ZERO LACT ROSQ COCO/LEITE 250 G - PCT', 160.00, 'PC', '23/07/2025', NULL, NULL, '2.8900', 2.89, 2.89, 0.00, 0.00, '23/07/2025', 462.40),
(1263, 450, 'forn_prod_forn_1753023793_23632af8_22_1753023793', 'MANTEIGA ZERO LACTOSE 200G - PT', 100.00, 'PT', '0.027430167597765', NULL, NULL, '24.9000', 24.90, 24.90, 0.00, 0.00, '0.027430167597765', 2490.00),
(1264, 450, 'forn_prod_forn_1753023793_23632af8_23_1753023793', 'QUEIJO MUSSARELA ZERO LACTOSE 150 G - PCT', 150.00, 'PT', '0.31222882562278', NULL, NULL, '12.9900', 12.99, 12.99, 0.00, 0.00, '0.31222882562278', 1948.50),
(1265, 451, 'forn_prod_forn_1753023793_2cb2e41f_1_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 1500.00, 'PC', '23/07/2025', NULL, NULL, '25.5000', 25.00, 25.50, 0.00, 0.00, '23/07/2025', 37500.00),
(1266, 451, 'forn_prod_forn_1753023793_2cb2e41f_2_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 2400.00, 'PC', '30/07/2025', NULL, NULL, '25.5000', 25.00, 25.50, 0.00, 0.00, '30/07/2025', 60000.00),
(1267, 451, 'forn_prod_forn_1753023793_2cb2e41f_3_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 250.00, 'PC', '06/08/2025', NULL, NULL, '25.5000', 25.00, 25.50, 0.00, 0.00, '06/08/2025', 6250.00),
(1268, 451, 'forn_prod_forn_1753023793_2cb2e41f_4_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 400.00, 'PC', '06/08/2025', NULL, NULL, '19.5000', 17.00, 19.50, 0.00, 0.00, '06/08/2025', 6800.00),
(1269, 451, 'forn_prod_forn_1753023793_2cb2e41f_5_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1200.00, 'PC', '23/07/2025', NULL, NULL, '19.5000', 17.00, 19.50, 0.00, 0.00, '23/07/2025', 20400.00),
(1270, 451, 'forn_prod_forn_1753023793_2cb2e41f_6_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1500.00, 'PC', '06/08/2025', NULL, NULL, '19.8000', 18.50, 19.80, 0.00, 0.00, '06/08/2025', 27750.00),
(1271, 452, 'forn_prod_forn_1753023793_dcb38b80_7_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 1500.00, 'PC', '23/07/2025', NULL, NULL, '28.9900', 28.99, 28.99, 0.00, 0.00, '23/07/2025', 43485.00),
(1272, 452, 'forn_prod_forn_1753023793_dcb38b80_8_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 2400.00, 'PC', '30/07/2025', NULL, NULL, '28.9900', 28.99, 28.99, 0.00, 0.00, '30/07/2025', 69576.00),
(1273, 452, 'forn_prod_forn_1753023793_dcb38b80_9_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 250.00, 'PC', '06/08/2025', NULL, NULL, '28.9900', 28.99, 28.99, 0.00, 0.00, '06/08/2025', 7247.50),
(1274, 452, 'forn_prod_forn_1753023793_dcb38b80_10_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 400.00, 'PC', '06/08/2025', NULL, NULL, '22.9900', 22.99, 22.99, 0.00, 0.00, '06/08/2025', 9196.00),
(1275, 452, 'forn_prod_forn_1753023793_dcb38b80_11_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1200.00, 'PC', '23/07/2025', NULL, NULL, '22.9900', 22.99, 22.99, 0.00, 0.00, '23/07/2025', 27588.00),
(1276, 452, 'forn_prod_forn_1753023793_dcb38b80_12_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1500.00, 'PC', '06/08/2025', NULL, NULL, '19.9900', 19.99, 19.99, 0.00, 0.00, '06/08/2025', 29985.00),
(1277, 453, 'forn_prod_forn_1753023793_edadc4b4_13_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 1500.00, 'PC', '23/07/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '23/07/2025', 38985.00),
(1278, 453, 'forn_prod_forn_1753023793_edadc4b4_14_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 2400.00, 'PC', '30/07/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '30/07/2025', 62376.00),
(1279, 453, 'forn_prod_forn_1753023793_edadc4b4_15_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 250.00, 'PC', '06/08/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '06/08/2025', 6497.50),
(1280, 453, 'forn_prod_forn_1753023793_edadc4b4_16_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 400.00, 'PC', '06/08/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '06/08/2025', 10396.00),
(1281, 453, 'forn_prod_forn_1753023793_edadc4b4_17_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1200.00, 'PC', '23/07/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '23/07/2025', 31188.00),
(1282, 453, 'forn_prod_forn_1753023793_edadc4b4_18_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1500.00, 'PC', '06/08/2025', NULL, NULL, '19.9900', 19.99, 19.99, 0.00, 0.00, '06/08/2025', 29985.00),
(1283, 454, 'forn_prod_forn_1753023793_5e4046f3_19_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 1500.00, 'PC', '23/07/2025', NULL, NULL, '29.5000', 29.50, 29.50, 0.00, 0.00, '23/07/2025', 44250.00),
(1284, 454, 'forn_prod_forn_1753023793_5e4046f3_20_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 2400.00, 'PC', '30/07/2025', NULL, NULL, '29.5000', 29.50, 29.50, 0.00, 0.00, '30/07/2025', 70800.00),
(1285, 454, 'forn_prod_forn_1753023793_5e4046f3_21_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 250.00, 'PC', '06/08/2025', NULL, NULL, '29.5000', 29.50, 29.50, 0.00, 0.00, '06/08/2025', 7375.00),
(1286, 454, 'forn_prod_forn_1753023793_5e4046f3_22_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 400.00, 'PC', '06/08/2025', NULL, NULL, '18.5000', 18.50, 18.50, 0.00, 0.00, '06/08/2025', 7400.00),
(1287, 454, 'forn_prod_forn_1753023793_5e4046f3_23_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1200.00, 'PC', '23/07/2025', NULL, NULL, '18.5000', 18.50, 18.50, 0.00, 0.00, '23/07/2025', 22200.00),
(1288, 454, 'forn_prod_forn_1753023793_5e4046f3_24_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1500.00, 'PC', '06/08/2025', NULL, NULL, '24.0000', 24.00, 24.00, 0.00, 0.00, '06/08/2025', 36000.00);
INSERT INTO `produtos_fornecedores` (`id`, `fornecedor_id`, `produto_id`, `nome`, `qtde`, `un`, `prazo_entrega`, `ult_valor_aprovado`, `ult_fornecedor_aprovado`, `valor_anterior`, `valor_unitario`, `primeiro_valor`, `difal`, `ipi`, `data_entrega_fn`, `total`) VALUES
(1289, 455, 'forn_prod_forn_1753023793_e315e003_25_1753023793', 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 700.00, 'PC', '06/08/2025', NULL, NULL, '13.9900', 13.99, 13.99, 0.00, 0.00, '06/08/2025', 9793.00),
(1290, 455, 'forn_prod_forn_1753023793_e315e003_26_1753023793', 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 1600.00, 'PC', '23/07/2025', NULL, NULL, '13.9900', 13.99, 13.99, 0.00, 0.00, '23/07/2025', 22384.00),
(1291, 456, 'forn_prod_forn_1753023793_c1e02231_27_1753023793', 'IOGURTE NATURAL INTEGRAL 900 ML - PCT', 240.00, 'UN', '23/07/2025', NULL, NULL, '6.4000', 6.40, 6.40, 0.00, 0.00, '23/07/2025', 1536.00),
(1292, 456, 'forn_prod_forn_1753023793_c1e02231_28_1753023793', 'IOGURTE NATURAL INTEGRAL 900 ML - PCT', 320.00, 'UN', '30/07/2025', NULL, NULL, '6.4000', 6.40, 6.40, 0.00, 0.00, '30/07/2025', 2048.00),
(1293, 456, 'forn_prod_forn_1753023793_c1e02231_29_1753023793', 'MANTEIGA C/ SAL 200G - PT', 850.00, 'PT', '23/07/2025', NULL, NULL, '7.3400', 7.34, 7.34, 0.00, 0.00, '23/07/2025', 6239.00),
(1294, 456, 'forn_prod_forn_1753023793_c1e02231_30_1753023793', 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 700.00, 'PC', '06/08/2025', NULL, NULL, '14.9000', 14.90, 14.90, 0.00, 0.00, '06/08/2025', 10430.00),
(1295, 456, 'forn_prod_forn_1753023793_c1e02231_31_1753023793', 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 1600.00, 'PC', '23/07/2025', NULL, NULL, '14.9000', 14.90, 14.90, 0.00, 0.00, '23/07/2025', 23840.00),
(1296, 457, 'forn_prod_forn_1753023793_4323e815_32_1753023793', 'MANTEIGA C/ SAL 200G - PT', 850.00, 'PT', '23/07/2025', NULL, NULL, '6.9900', 6.99, 6.99, 0.00, 0.00, '23/07/2025', 5941.50),
(1297, 457, 'forn_prod_forn_1753023793_4323e815_33_1753023793', 'MILHO VERDE CONGELADO 1,1 KG - PCT', 440.00, 'PC', '23/07/2025', NULL, NULL, '12.6500', 12.65, 12.65, 0.00, 0.00, '23/07/2025', 5566.00),
(1298, 457, 'forn_prod_forn_1753023793_4323e815_34_1753023793', 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 700.00, 'PC', '06/08/2025', NULL, NULL, '14.9900', 14.99, 14.99, 0.00, 0.00, '06/08/2025', 10493.00),
(1299, 457, 'forn_prod_forn_1753023793_4323e815_35_1753023793', 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 1600.00, 'PC', '23/07/2025', NULL, NULL, '14.9900', 14.99, 14.99, 0.00, 0.00, '23/07/2025', 23984.00),
(1300, 458, 'forn_prod_forn_1753023793_cd0c6595_36_1753023793', 'AIPIM CONGELADO 1 KG - PCT', 410.00, 'PC', '23/07/2025', NULL, NULL, '6.4093', 6.41, 6.41, 0.00, 0.00, '23/07/2025', 2627.81),
(1301, 458, 'forn_prod_forn_1753023793_cd0c6595_37_1753023793', 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - PCT', 1500.00, 'PC', '06/08/2025', NULL, NULL, '17.6000', 17.60, 17.60, 0.00, 0.00, '06/08/2025', 26400.00),
(1302, 458, 'forn_prod_forn_1753023793_cd0c6595_38_1753023793', 'MILHO VERDE CONGELADO 1,1 KG - PCT', 440.00, 'PC', '23/07/2025', NULL, NULL, '15.9900', 15.99, 15.99, 0.00, 0.00, '23/07/2025', 7035.60),
(1303, 459, 'forn_prod_forn_1753023793_6528acfd_39_1753023793', 'MILHO VERDE CONGELADO 1,1 KG - PCT', 440.00, 'PC', '23/07/2025', NULL, NULL, '12.9800', 12.98, 12.98, 0.00, 0.00, '23/07/2025', 5711.20),
(1304, 460, 'forn_prod_forn_1753023793_3ada8874_41_1753023793', 'IOGURTE NATURAL INTEGRAL 900 ML - PCT', 240.00, 'UN', '23/07/2025', NULL, NULL, '6.4000', 6.40, 6.40, 0.00, 0.00, '23/07/2025', 1536.00),
(1305, 460, 'forn_prod_forn_1753023793_3ada8874_42_1753023793', 'IOGURTE NATURAL INTEGRAL 900 ML - PCT', 320.00, 'UN', '30/07/2025', NULL, NULL, '6.4000', 6.40, 6.40, 0.00, 0.00, '30/07/2025', 2048.00),
(1306, 461, 'forn_prod_forn_1753023793_09a1ac4c_43_1753023793', 'AIPIM CONGELADO 1 KG - PCT', 410.00, 'PC', '23/07/2025', NULL, NULL, '7.5000', 7.50, 7.50, 0.00, 0.00, '23/07/2025', 3075.00),
(1307, 462, 'forn_prod_forn_1753023793_b772de76_1_1753023793', 'PERFIL DE CHAPA 0,50 INOX 430', 5.00, 'KG', '04/07/2025', NULL, NULL, '45.0000', 45.00, 45.00, 0.00, 0.00, '04/07/2025', 225.00),
(1308, 462, 'forn_prod_forn_1753023793_b772de76_2_1753023793', 'PERFIL DE CHAPA 1.50', 2.00, 'UN', '04/07/2025', NULL, NULL, '80.0000', 80.00, 80.00, 0.00, 0.00, '04/07/2025', 160.00),
(1309, 463, 'forn_prod_forn_1753023793_7422993d_1_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 1800.00, 'PC', '06/08/2025', NULL, NULL, '25.5000', 0.00, 25.50, 0.00, 0.00, '06/08/2025', 0.00),
(1310, 463, 'forn_prod_forn_1753023793_7422993d_2_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 3000.00, 'PC', '23/07/2025', NULL, NULL, '25.5000', 25.00, 25.50, 0.00, 0.00, '23/07/2025', 75000.00),
(1311, 463, 'forn_prod_forn_1753023793_7422993d_3_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 2300.00, 'PC', '30/07/2025', NULL, NULL, '25.5000', 25.00, 25.50, 0.00, 0.00, '30/07/2025', 57500.00),
(1312, 463, 'forn_prod_forn_1753023793_7422993d_4_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '06/08/2025', NULL, NULL, '25.5000', 25.00, 25.50, 0.00, 0.00, '06/08/2025', 12500.00),
(1313, 463, 'forn_prod_forn_1753023793_7422993d_5_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 1200.00, 'PC', '09/07/2025', NULL, NULL, '25.5000', 25.00, 25.50, 0.00, 0.00, '09/07/2025', 30000.00),
(1314, 463, 'forn_prod_forn_1753023793_7422993d_6_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '30/07/2025', NULL, NULL, '25.5000', 25.00, 25.50, 0.00, 0.00, '30/07/2025', 12500.00),
(1315, 463, 'forn_prod_forn_1753023793_7422993d_7_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '23/07/2025', NULL, NULL, '19.5000', 17.00, 19.50, 0.00, 0.00, '23/07/2025', 17000.00),
(1316, 463, 'forn_prod_forn_1753023793_7422993d_8_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '06/08/2025', NULL, NULL, '19.5000', 17.00, 19.50, 0.00, 0.00, '06/08/2025', 17000.00),
(1317, 463, 'forn_prod_forn_1753023793_7422993d_9_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '30/07/2025', NULL, NULL, '19.5000', 17.00, 19.50, 0.00, 0.00, '30/07/2025', 17000.00),
(1318, 463, 'forn_prod_forn_1753023793_7422993d_10_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1700.00, 'PC', '06/08/2025', NULL, NULL, '19.8000', 18.50, 19.80, 0.00, 0.00, '06/08/2025', 31450.00),
(1319, 463, 'forn_prod_forn_1753023793_7422993d_11_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '23/07/2025', NULL, NULL, '19.8000', 18.50, 19.80, 0.00, 0.00, '23/07/2025', 18500.00),
(1320, 463, 'forn_prod_forn_1753023793_7422993d_12_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '30/07/2025', NULL, NULL, '19.8000', 18.50, 19.80, 0.00, 0.00, '30/07/2025', 18500.00),
(1321, 464, 'forn_prod_forn_1753023793_c8ee22e1_13_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 1800.00, 'PC', '06/08/2025', NULL, NULL, '28.9900', 28.99, 28.99, 0.00, 0.00, '06/08/2025', 52182.00),
(1322, 464, 'forn_prod_forn_1753023793_c8ee22e1_14_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 3000.00, 'PC', '23/07/2025', NULL, NULL, '28.9900', 28.99, 28.99, 0.00, 0.00, '23/07/2025', 86970.00),
(1323, 464, 'forn_prod_forn_1753023793_c8ee22e1_15_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 2300.00, 'PC', '30/07/2025', NULL, NULL, '28.9900', 28.99, 28.99, 0.00, 0.00, '30/07/2025', 66677.00),
(1324, 464, 'forn_prod_forn_1753023793_c8ee22e1_16_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '06/08/2025', NULL, NULL, '28.9900', 28.99, 28.99, 0.00, 0.00, '06/08/2025', 14495.00),
(1325, 464, 'forn_prod_forn_1753023793_c8ee22e1_17_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 1200.00, 'PC', '09/07/2025', NULL, NULL, '28.9900', 28.99, 28.99, 0.00, 0.00, '09/07/2025', 34788.00),
(1326, 464, 'forn_prod_forn_1753023793_c8ee22e1_18_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '30/07/2025', NULL, NULL, '28.9900', 28.99, 28.99, 0.00, 0.00, '30/07/2025', 14495.00),
(1327, 464, 'forn_prod_forn_1753023793_c8ee22e1_19_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '23/07/2025', NULL, NULL, '22.9900', 22.99, 22.99, 0.00, 0.00, '23/07/2025', 22990.00),
(1328, 464, 'forn_prod_forn_1753023793_c8ee22e1_20_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '06/08/2025', NULL, NULL, '22.9900', 22.99, 22.99, 0.00, 0.00, '06/08/2025', 22990.00),
(1329, 464, 'forn_prod_forn_1753023793_c8ee22e1_21_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '30/07/2025', NULL, NULL, '22.9900', 22.99, 22.99, 0.00, 0.00, '30/07/2025', 22990.00),
(1330, 464, 'forn_prod_forn_1753023793_c8ee22e1_22_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1700.00, 'PC', '06/08/2025', NULL, NULL, '19.9900', 19.99, 19.99, 0.00, 0.00, '06/08/2025', 33983.00),
(1331, 464, 'forn_prod_forn_1753023793_c8ee22e1_23_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '23/07/2025', NULL, NULL, '19.9900', 19.99, 19.99, 0.00, 0.00, '23/07/2025', 19990.00),
(1332, 464, 'forn_prod_forn_1753023793_c8ee22e1_24_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '30/07/2025', NULL, NULL, '19.9900', 19.99, 19.99, 0.00, 0.00, '30/07/2025', 19990.00),
(1333, 465, 'forn_prod_forn_1753023793_edadc4b4_25_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 1800.00, 'PC', '06/08/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '06/08/2025', 46782.00),
(1334, 465, 'forn_prod_forn_1753023793_edadc4b4_26_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 3000.00, 'PC', '23/07/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '23/07/2025', 77970.00),
(1335, 465, 'forn_prod_forn_1753023793_edadc4b4_27_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 2300.00, 'PC', '30/07/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '30/07/2025', 59777.00),
(1336, 465, 'forn_prod_forn_1753023793_edadc4b4_28_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '06/08/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '06/08/2025', 12995.00),
(1337, 465, 'forn_prod_forn_1753023793_edadc4b4_29_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 1200.00, 'PC', '09/07/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '09/07/2025', 31188.00),
(1338, 465, 'forn_prod_forn_1753023793_edadc4b4_30_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '30/07/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '30/07/2025', 12995.00),
(1339, 465, 'forn_prod_forn_1753023793_edadc4b4_31_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '23/07/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '23/07/2025', 25990.00),
(1340, 465, 'forn_prod_forn_1753023793_edadc4b4_32_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '06/08/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '06/08/2025', 25990.00),
(1341, 465, 'forn_prod_forn_1753023793_edadc4b4_33_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '30/07/2025', NULL, NULL, '25.9900', 25.99, 25.99, 0.00, 0.00, '30/07/2025', 25990.00),
(1342, 465, 'forn_prod_forn_1753023793_edadc4b4_34_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1700.00, 'PC', '06/08/2025', NULL, NULL, '19.9900', 19.99, 19.99, 0.00, 0.00, '06/08/2025', 33983.00),
(1343, 465, 'forn_prod_forn_1753023793_edadc4b4_35_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '23/07/2025', NULL, NULL, '19.9900', 19.99, 19.99, 0.00, 0.00, '23/07/2025', 19990.00),
(1344, 465, 'forn_prod_forn_1753023793_edadc4b4_36_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '30/07/2025', NULL, NULL, '19.9900', 19.99, 19.99, 0.00, 0.00, '30/07/2025', 19990.00),
(1345, 466, 'forn_prod_forn_1753023793_8f85c622_37_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 1800.00, 'PC', '06/08/2025', NULL, NULL, '29.5000', 29.50, 29.50, 0.00, 0.00, '06/08/2025', 53100.00),
(1346, 466, 'forn_prod_forn_1753023793_8f85c622_38_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 3000.00, 'PC', '23/07/2025', NULL, NULL, '29.5000', 29.50, 29.50, 0.00, 0.00, '23/07/2025', 88500.00),
(1347, 466, 'forn_prod_forn_1753023793_8f85c622_39_1753023793', 'PATINHO BOVINO CUBOS 1 KG - PCT', 2300.00, 'PC', '30/07/2025', NULL, NULL, '29.5000', 29.50, 29.50, 0.00, 0.00, '30/07/2025', 67850.00),
(1348, 466, 'forn_prod_forn_1753023793_8f85c622_40_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '06/08/2025', NULL, NULL, '29.5000', 29.50, 29.50, 0.00, 0.00, '06/08/2025', 14750.00),
(1349, 466, 'forn_prod_forn_1753023793_8f85c622_41_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 1200.00, 'PC', '09/07/2025', NULL, NULL, '29.5000', 29.50, 29.50, 0.00, 0.00, '09/07/2025', 35400.00),
(1350, 466, 'forn_prod_forn_1753023793_8f85c622_42_1753023793', 'PATINHO BOVINO ISCAS 1 KG - PCT', 500.00, 'PC', '30/07/2025', NULL, NULL, '29.5000', 29.50, 29.50, 0.00, 0.00, '30/07/2025', 14750.00),
(1351, 466, 'forn_prod_forn_1753023793_8f85c622_43_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '23/07/2025', NULL, NULL, '18.5000', 18.50, 18.50, 0.00, 0.00, '23/07/2025', 18500.00),
(1352, 466, 'forn_prod_forn_1753023793_8f85c622_44_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '06/08/2025', NULL, NULL, '18.5000', 18.50, 18.50, 0.00, 0.00, '06/08/2025', 18500.00),
(1353, 466, 'forn_prod_forn_1753023793_8f85c622_45_1753023793', 'PATINHO BOVINO MOIDO 1 KG - PCT', 1000.00, 'PC', '30/07/2025', NULL, NULL, '18.5000', 18.50, 18.50, 0.00, 0.00, '30/07/2025', 18500.00),
(1354, 466, 'forn_prod_forn_1753023793_8f85c622_46_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1700.00, 'PC', '06/08/2025', NULL, NULL, '24.0000', 24.00, 24.00, 0.00, 0.00, '06/08/2025', 40800.00),
(1355, 466, 'forn_prod_forn_1753023793_8f85c622_47_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '23/07/2025', NULL, NULL, '24.0000', 24.00, 24.00, 0.00, 0.00, '23/07/2025', 24000.00),
(1356, 466, 'forn_prod_forn_1753023793_8f85c622_48_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '30/07/2025', NULL, NULL, '24.0000', 24.00, 24.00, 0.00, 0.00, '30/07/2025', 24000.00),
(1357, 467, 'forn_prod_forn_1753023793_d1e185a7_49_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1700.00, 'PC', '06/08/2025', NULL, NULL, '17.5000', 17.40, 17.50, 0.00, 0.00, '06/08/2025', 29580.00),
(1358, 467, 'forn_prod_forn_1753023793_d1e185a7_50_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '23/07/2025', NULL, NULL, '17.5000', 17.40, 17.50, 0.00, 0.00, '23/07/2025', 17400.00),
(1359, 467, 'forn_prod_forn_1753023793_d1e185a7_51_1753023793', 'PERNIL SUINO CUBOS 1 KG - PCT', 1000.00, 'PC', '30/07/2025', NULL, NULL, '17.5000', 17.40, 17.50, 0.00, 0.00, '30/07/2025', 17400.00),
(1360, 468, 'forn_prod_forn_1753023793_ddba2c81_52_1753023793', 'AIPIM CONGELADO 1 KG - PCT', 200.00, 'PC', '23/07/2025', NULL, NULL, '6.4093', 6.41, 6.41, 0.00, 0.00, '23/07/2025', 1281.86),
(1361, 468, 'forn_prod_forn_1753023793_ddba2c81_53_1753023793', 'AIPIM CONGELADO 1 KG - PCT', 520.00, 'PC', '30/07/2025', NULL, NULL, '6.4093', 6.41, 6.41, 0.00, 0.00, '30/07/2025', 3332.84),
(1362, 468, 'forn_prod_forn_1753023793_ddba2c81_54_1753023793', 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - PCT', 2400.00, 'PC', '06/08/2025', NULL, NULL, '17.6000', 17.60, 17.60, 0.00, 0.00, '06/08/2025', 42240.00),
(1363, 468, 'forn_prod_forn_1753023793_ddba2c81_55_1753023793', 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - PCT', 1500.00, 'PC', '30/07/2025', NULL, NULL, '17.6000', 17.60, 17.60, 0.00, 0.00, '30/07/2025', 26400.00),
(1364, 468, 'forn_prod_forn_1753023793_ddba2c81_56_1753023793', 'FILE DE SASSAMI 1 KG - PCT', 1000.00, 'PC', '06/08/2025', NULL, NULL, '16.9900', 16.99, 16.99, 0.00, 0.00, '06/08/2025', 16990.00),
(1365, 468, 'forn_prod_forn_1753023793_ddba2c81_57_1753023793', 'FILE DE SASSAMI 1 KG - PCT', 4500.00, 'PC', '30/07/2025', NULL, NULL, '16.9900', 16.99, 16.99, 0.00, 0.00, '30/07/2025', 76455.00),
(1366, 468, 'forn_prod_forn_1753023793_ddba2c81_58_1753023793', 'FILE DE SASSAMI 1 KG - PCT', 3000.00, 'PC', '23/07/2025', NULL, NULL, '16.9900', 16.99, 16.99, 0.00, 0.00, '23/07/2025', 50970.00),
(1367, 468, 'forn_prod_forn_1753023793_ddba2c81_59_1753023793', 'MILHO VERDE CONGELADO 1,1 KG - PCT', 450.00, 'PC', '06/08/2025', NULL, NULL, '15.9900', 15.99, 15.99, 0.00, 0.00, '06/08/2025', 7195.50),
(1368, 468, 'forn_prod_forn_1753023793_ddba2c81_60_1753023793', 'MILHO VERDE CONGELADO 1,1 KG - PCT', 200.00, 'PC', '30/07/2025', NULL, NULL, '15.9900', 15.99, 15.99, 0.00, 0.00, '30/07/2025', 3198.00),
(1369, 469, 'forn_prod_forn_1753023793_4323e815_61_1753023793', 'FILE DE SASSAMI 1 KG - PCT', 1000.00, 'PC', '06/08/2025', NULL, NULL, '16.5500', 16.55, 16.55, 0.00, 0.00, '06/08/2025', 16550.00),
(1370, 469, 'forn_prod_forn_1753023793_4323e815_62_1753023793', 'FILE DE SASSAMI 1 KG - PCT', 4500.00, 'PC', '30/07/2025', NULL, NULL, '16.5500', 16.55, 16.55, 0.00, 0.00, '30/07/2025', 74475.00),
(1371, 469, 'forn_prod_forn_1753023793_4323e815_63_1753023793', 'FILE DE SASSAMI 1 KG - PCT', 3000.00, 'PC', '23/07/2025', NULL, NULL, '16.5500', 16.55, 16.55, 0.00, 0.00, '23/07/2025', 49650.00),
(1372, 469, 'forn_prod_forn_1753023793_4323e815_64_1753023793', 'MANTEIGA C/ SAL 200G - PT', 1500.00, 'PT', '23/07/2025', NULL, NULL, '6.9900', 6.99, 6.99, 0.00, 0.00, '23/07/2025', 10485.00),
(1373, 469, 'forn_prod_forn_1753023793_4323e815_65_1753023793', 'MILHO VERDE CONGELADO 1,1 KG - PCT', 450.00, 'PC', '06/08/2025', NULL, NULL, '12.6500', 12.65, 12.65, 0.00, 0.00, '06/08/2025', 5692.50),
(1374, 469, 'forn_prod_forn_1753023793_4323e815_66_1753023793', 'MILHO VERDE CONGELADO 1,1 KG - PCT', 200.00, 'PC', '30/07/2025', NULL, NULL, '12.6500', 12.65, 12.65, 0.00, 0.00, '30/07/2025', 2530.00),
(1375, 469, 'forn_prod_forn_1753023793_4323e815_67_1753023793', 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 1100.00, 'PC', '06/08/2025', NULL, NULL, '14.9900', 14.99, 14.99, 0.00, 0.00, '06/08/2025', 16489.00),
(1376, 469, 'forn_prod_forn_1753023793_4323e815_68_1753023793', 'QUEIJO MUSSARELA FATIADO 15 A 17G 400G - PCT', 2600.00, 'PC', '23/07/2025', NULL, NULL, '14.9900', 14.99, 14.99, 0.00, 0.00, '23/07/2025', 38974.00),
(1377, 470, 'forn_prod_forn_1753023793_87c49f51_69_1753023793', 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - PCT', 2400.00, 'PC', '06/08/2025', NULL, NULL, '17.6000', 17.60, 17.60, 0.00, 0.00, '06/08/2025', 42240.00),
(1378, 470, 'forn_prod_forn_1753023793_87c49f51_70_1753023793', 'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - PCT', 1500.00, 'PC', '30/07/2025', NULL, NULL, '17.6000', 17.60, 17.60, 0.00, 0.00, '30/07/2025', 26400.00),
(1379, 470, 'forn_prod_forn_1753023793_87c49f51_71_1753023793', 'FILE DE SASSAMI 1 KG - PCT', 1000.00, 'PC', '06/08/2025', NULL, NULL, '16.9900', 16.99, 16.99, 0.00, 0.00, '06/08/2025', 16990.00),
(1380, 470, 'forn_prod_forn_1753023793_87c49f51_72_1753023793', 'FILE DE SASSAMI 1 KG - PCT', 4500.00, 'PC', '30/07/2025', NULL, NULL, '16.9900', 16.99, 16.99, 0.00, 0.00, '30/07/2025', 76455.00),
(1381, 470, 'forn_prod_forn_1753023793_87c49f51_73_1753023793', 'FILE DE SASSAMI 1 KG - PCT', 3000.00, 'PC', '23/07/2025', NULL, NULL, '16.9900', 16.99, 16.99, 0.00, 0.00, '23/07/2025', 50970.00),
(1382, 471, 'forn_prod_forn_1753023793_6528acfd_74_1753023793', 'MILHO VERDE CONGELADO 1,1 KG - PCT', 450.00, 'PC', '06/08/2025', NULL, NULL, '12.9800', 12.98, 12.98, 0.00, 0.00, '06/08/2025', 5841.00),
(1383, 471, 'forn_prod_forn_1753023793_6528acfd_75_1753023793', 'MILHO VERDE CONGELADO 1,1 KG - PCT', 200.00, 'PC', '30/07/2025', NULL, NULL, '12.9800', 12.98, 12.98, 0.00, 0.00, '30/07/2025', 2596.00),
(1384, 472, 'forn_prod_forn_1753023793_09a1ac4c_76_1753023793', 'AIPIM CONGELADO 1 KG - PCT', 200.00, 'PC', '23/07/2025', NULL, NULL, '5.4500', 5.45, 5.45, 0.00, 0.00, '23/07/2025', 1090.00),
(1385, 472, 'forn_prod_forn_1753023793_09a1ac4c_77_1753023793', 'AIPIM CONGELADO 1 KG - PCT', 520.00, 'PC', '30/07/2025', NULL, NULL, '5.4500', 5.45, 5.45, 0.00, 0.00, '30/07/2025', 2834.00),
(1386, 473, 'forn_prod_forn_1753023793_59bb86b1_1_1753023793', 'ABRACADEIRA 14 X 22 MM', 50.00, 'UN', '06/06/2025', NULL, NULL, '123.0000', 123.00, 123.00, 0.00, 0.00, '06/06/2025', 6150.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos_renegociacao`
--

CREATE TABLE `produtos_renegociacao` (
  `id` int NOT NULL,
  `cotacao_id` int NOT NULL,
  `produto_id` varchar(100) NOT NULL,
  `produto_nome` varchar(255) NOT NULL,
  `fornecedor_nome` varchar(255) NOT NULL,
  `motivo` text,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `saving`
--

CREATE TABLE `saving` (
  `id` int NOT NULL,
  `cotacao_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `data_registro` datetime NOT NULL,
  `valor_total_inicial` decimal(10,2) NOT NULL,
  `valor_total_final` decimal(10,2) NOT NULL,
  `economia` decimal(10,2) NOT NULL,
  `economia_percentual` decimal(5,2) NOT NULL,
  `rodadas` int NOT NULL,
  `status` enum('pendente','em_andamento','concluido','cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pendente',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `tipo` enum('programada','emergencial') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'programada',
  `motivo_emergencial` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `centro_distribuicao` enum('CD CHAPECO','CD CURITIBANOS','CD TOLEDO','MANUTENÇÃO CHAPECO','MANUTENÇÃO CURITIBANOS','MANUTENÇÃO TOLEDO') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'CD CHAPECO',
  `data_aprovacao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `saving`
--

INSERT INTO `saving` (`id`, `cotacao_id`, `usuario_id`, `data_registro`, `valor_total_inicial`, `valor_total_final`, `economia`, `economia_percentual`, `rodadas`, `status`, `observacoes`, `tipo`, `motivo_emergencial`, `centro_distribuicao`, `data_aprovacao`) VALUES
(31, 153, 3, '2025-05-22 17:03:04', 1377.18, 1377.18, 0.00, 0.00, 1, 'concluido', 'Cota????o aprovada: Aprovado', 'programada', NULL, 'CD CHAPECO', '2025-05-22 17:03:04'),
(32, 154, 3, '2025-05-22 17:03:21', 3757.50, 3757.50, 0.00, 0.00, 1, 'concluido', 'Cota????o aprovada: Aprovado!', 'programada', NULL, 'CD CHAPECO', '2025-05-22 17:03:21'),
(33, 155, 3, '2025-05-22 17:03:41', 396.00, 380.00, 16.00, 4.04, 1, 'concluido', 'Cota????o aprovada: Aprovado!', 'programada', NULL, 'CD CHAPECO', '2025-05-22 17:03:41'),
(34, 156, 6, '2025-05-22 17:04:31', 517.00, 473.70, 43.30, 8.38, 1, 'concluido', 'Cota????o aprovada: Aprovado!', 'programada', NULL, 'CD CHAPECO', '2025-05-22 17:04:31'),
(35, 163, 6, '2025-06-04 13:29:04', 420330.80, 396120.40, 24210.40, 5.76, 2, 'concluido', 'Cota????o aprovada: Aprovado melhor pre??o', 'programada', NULL, 'CD CHAPECO', NULL),
(36, 164, 6, '2025-06-04 15:08:35', 205729.26, 200721.16, 5008.10, 2.43, 1, 'concluido', 'Cota????o aprovada: Aprovado melhore pre??o!', 'programada', NULL, 'CD CHAPECO', NULL),
(37, 169, 3, '2025-06-13 15:24:34', 1170.00, 1126.00, 44.00, 3.76, 1, 'concluido', 'Cota????o aprovada: Aprovado!', 'programada', NULL, 'CD CHAPECO', NULL),
(38, 168, 3, '2025-06-18 14:08:24', 11914.62, 11229.14, 685.48, 5.75, 2, 'concluido', 'Cota????o aprovada: Alterar prazo de pagamento Mepar.', 'programada', NULL, 'CD CHAPECO', NULL),
(39, 170, 3, '2025-06-30 11:50:43', 571.34, 571.34, 0.00, 0.00, 1, 'concluido', 'Cota????o aprovada: Aprovado!', 'programada', NULL, 'CD CHAPECO', NULL),
(40, 171, 7, '2025-07-01 19:19:12', 1969.21, 1961.02, 8.19, 0.42, 2, 'concluido', 'Cota????o aprovada: Aprovado melhor pre??o!', 'programada', NULL, 'CD CHAPECO', '2025-07-01 19:19:12');

-- --------------------------------------------------------

--
-- Estrutura para tabela `saving_itens`
--

CREATE TABLE `saving_itens` (
  `id` int NOT NULL,
  `saving_id` int NOT NULL,
  `item_id` int NOT NULL,
  `descricao` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fornecedor` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `valor_unitario_inicial` decimal(10,2) NOT NULL,
  `valor_unitario_final` decimal(10,2) NOT NULL,
  `economia` decimal(10,2) NOT NULL,
  `economia_percentual` decimal(5,2) NOT NULL,
  `status` enum('aprovado','rejeitado','pendente') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'aprovado',
  `quantidade` int NOT NULL DEFAULT '1',
  `prazo_entrega` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `data_entrega_fn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `frete` decimal(10,2) DEFAULT '0.00',
  `difal` decimal(10,2) DEFAULT '0.00',
  `prazo_pagamento` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `saving_itens`
--

INSERT INTO `saving_itens` (`id`, `saving_id`, `item_id`, `descricao`, `fornecedor`, `valor_unitario_inicial`, `valor_unitario_final`, `economia`, `economia_percentual`, `status`, `quantidade`, `prazo_entrega`, `data_entrega_fn`, `frete`, `difal`, `prazo_pagamento`) VALUES
(1, 88, 2418, 'BROCA ACO RAPIDO 4,25MM', 'MEPAR', 6.56, 6.56, 0.00, 0.00, 'aprovado', 8, NULL, NULL, 0.00, 0.00, '15/28/56'),
(2, 88, 2421, 'DOBRADICA PINO SOLTO ALUMINIO 64X40', 'MEPAR', 3.47, 3.47, 0.00, 0.00, 'aprovado', 60, NULL, NULL, 0.00, 0.00, '15/28/56'),
(3, 88, 2422, 'FECHO MAGNETICO C/ BATENTE 2 FUROS BRANCO', 'MEPAR', 1.95, 1.95, 0.00, 0.00, 'aprovado', 20, NULL, NULL, 0.00, 0.00, '15/28/56'),
(4, 88, 2423, 'PUXADOR U - NORMAL ZINCADO', 'MEPAR', 8.23, 8.23, 0.00, 0.00, 'aprovado', 30, NULL, NULL, 0.00, 0.00, '15/28/56'),
(5, 88, 2424, 'REBITE 4,0 X 12,7MM', 'MEPAR', 0.25, 0.25, 0.00, 0.00, 'aprovado', 2000, NULL, NULL, 0.00, 0.00, '15/28/56'),
(6, 88, 2425, 'SILICONE PU 44', 'MEPAR', 36.50, 36.50, 0.00, 0.00, 'aprovado', 2, NULL, NULL, 0.00, 0.00, '15/28/56'),
(7, 88, 2428, 'BROCA P/ CONCRETO 6,0MM', 'DISMAFF', 4.00, 4.00, 0.00, 0.00, 'aprovado', 4, NULL, NULL, 0.00, 0.00, ''),
(8, 88, 2430, 'SILICONE TRANSPARENTE', 'DISMAFF', 12.00, 12.00, 0.00, 0.00, 'aprovado', 20, NULL, NULL, 0.00, 0.00, ''),
(9, 89, 2431, 'GUARNICAO ENGATE LINHA 20', 'ALLOY', 0.53, 0.53, 0.00, 0.00, 'aprovado', 150, NULL, NULL, 0.00, 0.00, '20/40/60'),
(10, 89, 2432, 'TELA MOSQUETEIRA CINZA 1,5 X 100 MT', 'ALLOY', 13.00, 13.00, 0.00, 0.00, 'aprovado', 150, NULL, NULL, 0.00, 0.00, '20/40/60'),
(11, 89, 2433, 'TUBO DE ALUMINIO 6060 ANOD FOSCO 6MT', 'ALLOY', 54.00, 54.00, 0.00, 0.00, 'aprovado', 32, NULL, NULL, 0.00, 0.00, '20/40/60'),
(12, 90, 2393, 'RESISTENCIA FORNO ELETRICO 3300W', 'CRISTAL', 198.00, 190.00, 16.00, 4.04, 'aprovado', 2, NULL, NULL, 0.00, 0.00, '28'),
(13, 91, 2394, 'BOTINA DE SEGURANCA C/ BICO PVC N44', 'CASA DO EPI', 79.00, 75.00, 4.00, 5.06, 'aprovado', 1, NULL, NULL, 0.00, 0.00, '30'),
(14, 91, 2395, 'CALCA DE BRIM CINZA TAM. EXG', 'CASA DO EPI', 78.00, 68.90, 27.30, 11.67, 'aprovado', 3, NULL, NULL, 0.00, 0.00, '30'),
(15, 91, 2396, 'CALCA DE BRIM CINZA TAM. GG', 'CASA DO EPI', 68.00, 64.00, 12.00, 5.88, 'aprovado', 3, NULL, NULL, 0.00, 0.00, '30'),
(16, 93, 2580, 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 'COOPEROESTE', 4.09, 4.05, 489.60, 0.98, 'aprovado', 12240, NULL, NULL, 0.00, 0.00, NULL),
(17, 93, 2581, 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 'COOPEROESTE', 4.05, 4.05, 0.00, 0.00, 'aprovado', 8640, NULL, NULL, 0.00, 0.00, NULL),
(18, 93, 2582, 'MEL DE ABELHAS 1 KG - PT', 'SUL MEL', 26.50, 26.50, 0.00, 0.00, 'aprovado', 180, NULL, NULL, 0.00, 0.00, NULL),
(19, 93, 2583, 'MEL DE ABELHAS 1 KG - PT', 'SUL MEL', 26.50, 26.50, 0.00, 0.00, 'aprovado', 100, NULL, NULL, 0.00, 0.00, NULL),
(20, 93, 2591, 'FOSFORO 40 PALITOS - PC 10 CX', 'TOZZO', 2.40, 2.40, 0.00, 0.00, 'aprovado', 140, NULL, NULL, 0.00, 0.00, NULL),
(21, 93, 2593, 'TRIGO PARA QUIBE', 'TOZZO', 4.15, 4.15, 0.00, 0.00, 'aprovado', 50, NULL, NULL, 0.00, 0.00, NULL),
(22, 93, 2615, 'SAL REFINADO 1 KG - PCT', 'ALBERT', 1.45, 1.29, 144.00, 11.03, 'aprovado', 900, NULL, NULL, 0.00, 0.00, NULL),
(23, 93, 2639, 'AVEIA EM FLOCOS 500 G - PCT', 'ALBERT', 4.79, 4.70, 27.00, 1.88, 'aprovado', 300, NULL, NULL, 0.00, 0.00, NULL),
(24, 93, 2654, 'SAL REFINADO 1 KG - PCT', 'ALBERT', 1.45, 1.29, 144.00, 11.03, 'aprovado', 900, NULL, NULL, 0.00, 0.00, NULL),
(25, 93, 2666, 'MACARRAO CONCHINHA C/OVOS 500 G - PCT', 'BRINGHENTTI', 2.54, 2.45, 180.00, 3.54, 'aprovado', 2000, NULL, NULL, 0.00, 0.00, NULL),
(26, 93, 2670, 'CAFE EM PO 500 G - PCT', 'BRINGHENTTI', 13.90, 13.00, 540.00, 6.47, 'aprovado', 600, NULL, NULL, 0.00, 0.00, NULL),
(27, 93, 2681, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 'BRINGHENTTI', 5.88, 5.70, 234.00, 3.06, 'aprovado', 1300, NULL, NULL, 0.00, 0.00, NULL),
(28, 93, 2682, 'OLEO DE SOJA 900 ML - UND', 'BRINGHENTTI', 6.99, 6.95, 80.00, 0.57, 'aprovado', 2000, NULL, NULL, 0.00, 0.00, NULL),
(29, 93, 2683, 'GUARDANAPO 19.5 X 19.5 PCT 50 UND - PCT', 'BRINGHENTTI', 0.75, 0.75, 0.00, 0.00, 'aprovado', 2500, NULL, NULL, 0.00, 0.00, NULL),
(30, 93, 2685, 'SACO DE AMOSTRA C/ 500 UN - PCT', 'BRINGHENTTI', 25.00, 19.90, 765.00, 20.40, 'aprovado', 150, NULL, NULL, 0.00, 0.00, NULL),
(31, 93, 2691, 'PANO DE LIMPEZA PERFLEX - RL', 'BRINGHENTTI', 68.90, 62.90, 1140.00, 8.71, 'aprovado', 190, NULL, NULL, 0.00, 0.00, NULL),
(32, 93, 2700, 'FEIJAO PRETO 1 KG  - PCT', 'BRINGHENTTI', 3.99, 3.90, 270.00, 2.26, 'aprovado', 3000, NULL, NULL, 0.00, 0.00, NULL),
(33, 93, 2704, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 'BRINGHENTTI', 5.88, 5.70, 126.00, 3.06, 'aprovado', 700, NULL, NULL, 0.00, 0.00, NULL),
(34, 93, 2708, 'CAFE EM PO 500 G - PCT', 'BRINGHENTTI', 13.00, 13.00, 0.00, 0.00, 'aprovado', 650, NULL, NULL, 0.00, 0.00, NULL),
(35, 93, 2714, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 'BRINGHENTTI', 5.88, 5.70, 108.00, 3.06, 'aprovado', 600, NULL, NULL, 0.00, 0.00, NULL),
(36, 93, 2716, 'OLEO DE SOJA 900 ML - UND', 'BRINGHENTTI', 6.95, 6.95, 0.00, 0.00, 'aprovado', 1800, NULL, NULL, 0.00, 0.00, NULL),
(37, 93, 2720, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 'BRINGHENTTI', 5.88, 5.70, 126.00, 3.06, 'aprovado', 700, NULL, NULL, 0.00, 0.00, NULL),
(38, 93, 2721, 'FERMENTO QUIMICO EM PO 200 G - UND', 'APTI', 3.89, 3.87, 16.00, 0.51, 'aprovado', 800, NULL, NULL, 0.00, 0.00, NULL),
(39, 93, 2722, 'FERMENTO QUIMICO EM PO 200 G - UND', 'APTI', 3.89, 3.87, 4.80, 0.51, 'aprovado', 240, NULL, NULL, 0.00, 0.00, NULL),
(40, 93, 2723, 'PANO DE CHAO - UN', 'TECELAGEM MARTINS', 2.00, 2.00, 0.00, 0.00, 'aprovado', 150, NULL, NULL, 0.00, 0.00, NULL),
(41, 93, 2724, 'FARINHA DE TRIGO 1 KG - PCT', 'AURI VERDE', 2.72, 2.69, 60.00, 1.10, 'aprovado', 2000, NULL, NULL, 0.00, 0.00, NULL),
(42, 93, 2725, 'FARINHA DE TRIGO 1 KG - PCT', 'AURI VERDE', 2.72, 2.69, 30.00, 1.10, 'aprovado', 1000, NULL, NULL, 0.00, 0.00, NULL),
(43, 93, 2726, 'FARINHA DE TRIGO INTEGRAL 1 KG - PCT', 'AURI VERDE', 4.00, 4.00, 0.00, 0.00, 'aprovado', 120, NULL, NULL, 0.00, 0.00, NULL),
(44, 93, 2729, 'SACO DE LIXO 100 LT C/ 100 UN - PCT', 'ONFINITY', 33.97, 33.97, 0.00, 0.00, 'aprovado', 280, NULL, NULL, 0.00, 0.00, NULL),
(45, 93, 2730, 'ALCOOL 1LT - UND', 'ONFINITY', 4.90, 4.90, 0.00, 0.00, 'aprovado', 260, NULL, NULL, 0.00, 0.00, NULL),
(46, 93, 2732, 'ESPONJA DUPLA FACE - UN', 'ONFINITY', 0.52, 0.52, 0.00, 0.00, 'aprovado', 1200, NULL, NULL, 0.00, 0.00, NULL),
(47, 93, 2733, 'ESPONJA FIBRA 125 X 87 X 20 MM  - UN', 'ONFINITY', 1.61, 1.61, 0.00, 0.00, 'aprovado', 500, NULL, NULL, 0.00, 0.00, NULL),
(48, 93, 2739, 'LUVA PLASTICA DESCARTAVEL PCT C/100', 'ONFINITY', 1.30, 1.30, 0.00, 0.00, 'aprovado', 170, NULL, NULL, 0.00, 0.00, NULL),
(49, 93, 2743, 'BOBINA PLASTICA PICOTADA 40X60 - RL', 'DVILLE', 29.90, 29.90, 0.00, 0.00, 'aprovado', 120, NULL, NULL, 0.00, 0.00, NULL),
(50, 93, 2750, 'PAPEL TOALHA INTERFOLHADO 1000 FLS - PCT', 'DVILLE', 9.50, 9.50, 0.00, 0.00, 'aprovado', 170, NULL, NULL, 0.00, 0.00, NULL),
(51, 93, 2751, 'VASSOURA DE NYLON C/ CABO - UN', 'DVILLE', 7.50, 5.90, 326.40, 21.33, 'aprovado', 204, NULL, NULL, 0.00, 0.00, NULL),
(52, 93, 2752, 'LUVA DE BORRACHA - M', 'DVILLE', 2.50, 2.45, 7.00, 2.00, 'aprovado', 140, NULL, NULL, 0.00, 0.00, NULL),
(53, 93, 2754, 'TOUCA DESCARTAVEL PCT C/100', 'DVILLE', 8.50, 7.56, 131.60, 11.06, 'aprovado', 140, NULL, NULL, 0.00, 0.00, NULL),
(54, 93, 2760, 'BISCOITO CASEIRO 1 KG - PCT', 'COOPERFAVI', 14.50, 13.95, 550.00, 3.79, 'aprovado', 1000, NULL, NULL, 0.00, 0.00, NULL),
(55, 93, 2761, 'BISCOITO CASEIRO 1 KG - PCT', 'COOPERFAVI', 14.50, 13.95, 660.00, 3.79, 'aprovado', 1200, NULL, NULL, 0.00, 0.00, NULL),
(56, 93, 2776, 'ARROZ INTEGRAL 1 KG - PCT', 'RAMPINELI', 3.70, 3.70, 0.00, 0.00, 'aprovado', 1000, NULL, NULL, 0.00, 0.00, NULL),
(57, 93, 2777, 'ARROZ PARBOILIZADO 1 KG - PCT', 'RAMPINELI', 3.14, 3.14, 0.00, 0.00, 'aprovado', 3000, NULL, NULL, 0.00, 0.00, NULL),
(58, 93, 2779, 'ARROZ PARBOILIZADO 1 KG - PCT', 'RAMPINELI', 3.14, 3.14, 0.00, 0.00, 'aprovado', 3900, NULL, NULL, 0.00, 0.00, NULL),
(59, 93, 2780, 'ARROZ INTEGRAL 1 KG - PCT', 'RAMPINELI', 3.70, 3.70, 0.00, 0.00, 'aprovado', 900, NULL, NULL, 0.00, 0.00, NULL),
(60, 93, 2781, 'ARROZ PARBOILIZADO 1 KG - PCT', 'RAMPINELI', 3.14, 3.14, 0.00, 0.00, 'aprovado', 3000, NULL, NULL, 0.00, 0.00, NULL),
(61, 93, 2782, 'ARROZ PARBOILIZADO 1 KG - PCT', 'RAMPINELI', 3.14, 3.14, 0.00, 0.00, 'aprovado', 2800, NULL, NULL, 0.00, 0.00, NULL),
(62, 93, 2783, 'OREGANO MOIDO 10 G - PCT', 'DAJU', 1.20, 1.20, 0.00, 0.00, 'aprovado', 300, NULL, NULL, 0.00, 0.00, NULL),
(63, 93, 2784, 'MILHO CANJICA 500G - PCT', 'DAJU', 2.12, 2.12, 0.00, 0.00, 'aprovado', 500, NULL, NULL, 0.00, 0.00, NULL),
(64, 93, 2785, 'CANELA EM PO 30 G - PCT', 'DAJU', 1.26, 1.26, 0.00, 0.00, 'aprovado', 650, NULL, NULL, 0.00, 0.00, NULL),
(65, 93, 2786, 'COLORAU EM PO 500 G - PCT', 'DAJU', 2.49, 2.49, 0.00, 0.00, 'aprovado', 450, NULL, NULL, 0.00, 0.00, NULL),
(66, 93, 2787, 'FUBA 1 KG - PCT', 'DAJU', 2.65, 2.65, 0.00, 0.00, 'aprovado', 750, NULL, NULL, 0.00, 0.00, NULL),
(67, 93, 2788, 'MILHO CANJICA 500G - PCT', 'DAJU', 2.12, 2.12, 0.00, 0.00, 'aprovado', 2020, NULL, NULL, 0.00, 0.00, NULL),
(68, 93, 2789, 'COLORAU EM PO 500 G - PCT', 'DAJU', 2.49, 2.49, 0.00, 0.00, 'aprovado', 380, NULL, NULL, 0.00, 0.00, NULL),
(69, 93, 2790, 'OREGANO MOIDO 10 G - PCT', 'DAJU', 1.20, 1.20, 0.00, 0.00, 'aprovado', 340, NULL, NULL, 0.00, 0.00, NULL),
(70, 93, 2791, 'CANELA EM PO 30 G - PCT', 'DAJU', 1.26, 1.26, 0.00, 0.00, 'aprovado', 350, NULL, NULL, 0.00, 0.00, NULL),
(71, 93, 2792, 'DETERGENTE NEUTRO 500 ML - FR', 'ZAVASKI', 1.30, 1.30, 0.00, 0.00, 'aprovado', 3200, NULL, NULL, 0.00, 0.00, NULL),
(72, 93, 2793, 'MACARRAO PENNE C/OVOS 500 G - PCT', 'MUFFATO', 2.00, 2.00, 0.00, 0.00, 'aprovado', 600, NULL, NULL, 0.00, 0.00, NULL),
(73, 93, 2794, 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 'MUFFATO', 2.00, 2.00, 0.00, 0.00, 'aprovado', 1500, NULL, NULL, 0.00, 0.00, NULL),
(74, 93, 2796, 'AGUA SANITARIA 1LT - UND', 'MUFFATO', 2.00, 2.00, 0.00, 0.00, 'aprovado', 1600, NULL, NULL, 0.00, 0.00, NULL),
(75, 93, 2803, 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 'MUFFATO', 2.00, 2.00, 0.00, 0.00, 'aprovado', 3700, NULL, NULL, 0.00, 0.00, NULL),
(76, 93, 2816, 'VINAGRE DE ALCOOL 900 ML - UND', 'TAF', 1.52, 1.52, 0.00, 0.00, 'aprovado', 600, NULL, NULL, 0.00, 0.00, NULL),
(77, 93, 2844, 'VINAGRE DE ALCOOL 900 ML - UND', 'TAF', 1.52, 1.52, 0.00, 0.00, 'aprovado', 620, NULL, NULL, 0.00, 0.00, NULL),
(78, 93, 2849, 'FEIJAO VERMELHO 1 KG - PCT', 'TAF', 9.33, 9.33, 0.00, 0.00, 'aprovado', 50, NULL, NULL, 0.00, 0.00, NULL),
(79, 93, 2870, 'FARINHA DE MANDIOCA 1 KG - PCT', 'BAIA NORTE', 3.39, 3.39, 0.00, 0.00, 'aprovado', 1100, NULL, NULL, 0.00, 0.00, NULL),
(80, 93, 2931, 'CACAU EM PO 100% 1 KG - PCT', 'NUTYLAC', 30.10, 29.89, 21.00, 0.70, 'aprovado', 100, NULL, NULL, 0.00, 0.00, NULL),
(81, 93, 2932, 'SUCO INTEGRAL DE UVA 1,5 LT - GF', 'DIFIORI', 18.00, 13.50, 11250.00, 25.00, 'aprovado', 2500, NULL, NULL, 0.00, 0.00, NULL),
(82, 93, 2933, 'SUCO INTEGRAL DE UVA 1,5 LT - GF', 'DIFIORI', 18.00, 13.50, 6750.00, 25.00, 'aprovado', 1500, NULL, NULL, 0.00, 0.00, NULL),
(83, 93, 2966, 'DOCE DE MORANGO ORGANICO 1 KG - PT', 'COPAVIDI', 29.00, 28.00, 30.00, 3.45, 'aprovado', 30, NULL, NULL, 0.00, 0.00, NULL),
(84, 95, 2967, 'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT', 'COOPEROESTE', 4.09, 4.05, 560.00, 0.98, 'aprovado', 14000, NULL, NULL, 0.00, 0.00, NULL),
(85, 95, 2968, 'MEL DE ABELHAS 1 KG - PT', 'SUL MEL', 26.50, 26.50, 0.00, 0.00, 'aprovado', 160, NULL, NULL, 0.00, 0.00, NULL),
(86, 95, 2974, 'FOSFORO 40 PALITOS - PC 10 CX', 'TOZZO', 2.40, 2.40, 0.00, 0.00, 'aprovado', 120, NULL, NULL, 0.00, 0.00, NULL),
(87, 95, 2982, 'AVEIA EM FLOCOS 500 G - PCT', 'ALBERT', 4.79, 4.70, 50.40, 1.88, 'aprovado', 560, NULL, NULL, 0.00, 0.00, NULL),
(88, 95, 3025, 'CAFE EM PO 500 G - PCT', 'BRINGHENTTI', 13.90, 13.00, 450.00, 6.47, 'aprovado', 500, NULL, NULL, 0.00, 0.00, NULL),
(89, 95, 3031, 'MACARRAO CONCHINHA C/OVOS 500 G - PCT', 'BRINGHENTTI', 2.54, 2.45, 72.00, 3.54, 'aprovado', 800, NULL, NULL, 0.00, 0.00, NULL),
(90, 95, 3033, 'COLORAU EM PO 500 G - PCT', 'BRINGHENTTI', 3.19, 3.10, 63.00, 2.82, 'aprovado', 700, NULL, NULL, 0.00, 0.00, NULL),
(91, 95, 3035, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 'BRINGHENTTI', 5.88, 5.70, 180.00, 3.06, 'aprovado', 1000, NULL, NULL, 0.00, 0.00, NULL),
(92, 95, 3037, 'OLEO DE SOJA 900 ML - UND', 'BRINGHENTTI', 6.99, 6.95, 80.00, 0.57, 'aprovado', 2000, NULL, NULL, 0.00, 0.00, NULL),
(93, 95, 3038, 'GUARDANAPO 19.5 X 19.5 PCT 50 UND - PCT', 'BRINGHENTTI', 0.75, 0.75, 0.00, 0.00, 'aprovado', 1800, NULL, NULL, 0.00, 0.00, NULL),
(94, 95, 3039, 'SACO DE AMOSTRA C/ 500 UN - PCT', 'BRINGHENTTI', 25.00, 19.90, 408.00, 20.40, 'aprovado', 80, NULL, NULL, 0.00, 0.00, NULL),
(95, 95, 3042, 'PANO DE LIMPEZA PERFLEX - RL', 'BRINGHENTTI', 68.90, 62.90, 720.00, 8.71, 'aprovado', 120, NULL, NULL, 0.00, 0.00, NULL),
(96, 95, 3048, 'AMIDO DE MILHO 1 KG - PCT', 'BRINGHENTTI', 4.88, 4.75, 7.80, 2.66, 'aprovado', 60, NULL, NULL, 0.00, 0.00, NULL),
(97, 95, 3050, 'FUBA 1 KG - PCT', 'BRINGHENTTI', 3.20, 2.89, 167.40, 9.69, 'aprovado', 540, NULL, NULL, 0.00, 0.00, NULL),
(98, 95, 3053, 'CAFE EM PO 500 G - PCT', 'BRINGHENTTI', 11.90, 13.00, -440.00, -9.24, 'aprovado', 400, NULL, NULL, 0.00, 0.00, NULL),
(99, 95, 3055, 'MACARRAO CONCHINHA C/OVOS 500 G - PCT', 'BRINGHENTTI', 2.54, 2.45, 66.60, 3.54, 'aprovado', 740, NULL, NULL, 0.00, 0.00, NULL),
(100, 95, 3056, 'ACUCAR CRISTAL ORGANICO 1 KG - PCT', 'BRINGHENTTI', 5.88, 5.70, 144.00, 3.06, 'aprovado', 800, NULL, NULL, 0.00, 0.00, NULL),
(101, 95, 3060, 'FERMENTO QUIMICO EM PO 200 G - UND', 'APTI', 3.89, 3.87, 12.00, 0.51, 'aprovado', 600, NULL, NULL, 0.00, 0.00, NULL),
(102, 95, 3061, 'PANO DE CHAO - UN', 'TECELAGEM MARTINS', 2.00, 2.00, 0.00, 0.00, 'aprovado', 140, NULL, NULL, 0.00, 0.00, NULL),
(103, 95, 3062, 'FARINHA DE TRIGO 1 KG - PCT', 'AURI VERDE', 2.72, 2.69, 46.50, 1.10, 'aprovado', 1550, NULL, NULL, 0.00, 0.00, NULL),
(104, 95, 3063, 'ESPONJA DUPLA FACE - UN', 'ONFINITY', 0.52, 0.52, 0.00, 0.00, 'aprovado', 1600, NULL, NULL, 0.00, 0.00, NULL),
(105, 95, 3065, 'SACO DE LIXO 200LT C/ 100 UN  8 MICRAS- PCT', 'ONFINITY', 55.88, 48.00, 1024.40, 14.10, 'aprovado', 130, NULL, NULL, 0.00, 0.00, NULL),
(106, 95, 3066, 'ALCOOL 1LT - UND', 'ONFINITY', 4.90, 4.90, 0.00, 0.00, 'aprovado', 300, NULL, NULL, 0.00, 0.00, NULL),
(107, 95, 3067, 'ESPONJA FIBRA 125 X 87 X 20 MM  - UN', 'ONFINITY', 1.61, 1.61, 0.00, 0.00, 'aprovado', 220, NULL, NULL, 0.00, 0.00, NULL),
(108, 95, 3073, 'LUVA PLASTICA DESCARTAVEL PCT C/100', 'ONFINITY', 1.30, 1.30, 0.00, 0.00, 'aprovado', 100, NULL, NULL, 0.00, 0.00, NULL),
(109, 95, 3081, 'PAPEL TOALHA INTERFOLHADO 1000 FLS - PCT', 'DVILLE', 9.50, 9.50, 0.00, 0.00, 'aprovado', 100, NULL, NULL, 0.00, 0.00, NULL),
(110, 95, 3082, 'VASSOURA DE NYLON C/ CABO - UN', 'DVILLE', 7.50, 5.90, 208.00, 21.33, 'aprovado', 130, NULL, NULL, 0.00, 0.00, NULL),
(111, 95, 3083, 'LUVA DE BORRACHA - M', 'DVILLE', 2.50, 2.45, 6.00, 2.00, 'aprovado', 120, NULL, NULL, 0.00, 0.00, NULL),
(112, 95, 3085, 'TOUCA DESCARTAVEL PCT C/100', 'DVILLE', 8.50, 7.56, 94.00, 11.06, 'aprovado', 100, NULL, NULL, 0.00, 0.00, NULL),
(113, 95, 3089, 'BISCOITO CASEIRO 1 KG - PCT', 'COOPERFAVI', 14.50, 13.95, 550.00, 3.79, 'aprovado', 1000, NULL, NULL, 0.00, 0.00, NULL),
(114, 95, 3098, 'ARROZ PARBOILIZADO 1 KG - PCT', 'RAMPINELI', 3.16, 3.14, 16.00, 0.63, 'aprovado', 800, NULL, NULL, 0.00, 0.00, NULL),
(115, 95, 3099, 'ARROZ INTEGRAL 1 KG - PCT', 'RAMPINELI', 3.90, 3.70, 360.00, 5.13, 'aprovado', 1800, NULL, NULL, 0.00, 0.00, NULL),
(116, 95, 3100, 'ARROZ PARBOILIZADO 1 KG - PCT', 'RAMPINELI', 3.16, 3.14, 90.00, 0.63, 'aprovado', 4500, NULL, NULL, 0.00, 0.00, NULL),
(117, 95, 3101, 'ARROZ PARBOILIZADO 1 KG - PCT', 'RAMPINELI', 3.16, 3.14, 72.00, 0.63, 'aprovado', 3600, NULL, NULL, 0.00, 0.00, NULL),
(118, 95, 3102, 'CANELA EM PO 30 G - PCT', 'DAJU', 1.26, 1.26, 0.00, 0.00, 'aprovado', 350, NULL, NULL, 0.00, 0.00, NULL),
(119, 95, 3103, 'OREGANO MOIDO 10 G - PCT', 'DAJU', 1.20, 1.20, 0.00, 0.00, 'aprovado', 340, NULL, NULL, 0.00, 0.00, NULL),
(120, 95, 3104, 'CANELA EM PO 30 G - PCT', 'DAJU', 1.26, 1.26, 0.00, 0.00, 'aprovado', 270, NULL, NULL, 0.00, 0.00, NULL),
(121, 95, 3105, 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 'MUFFATO', 2.00, 2.00, 0.00, 0.00, 'aprovado', 1000, NULL, NULL, 0.00, 0.00, NULL),
(122, 95, 3106, 'MACARRAO PENNE C/OVOS 500 G - PCT', 'MUFFATO', 2.00, 2.00, 0.00, 0.00, 'aprovado', 300, NULL, NULL, 0.00, 0.00, NULL),
(123, 95, 3107, 'AGUA SANITARIA 1LT - UND', 'MUFFATO', 1.79, 1.79, 0.00, 0.00, 'aprovado', 600, NULL, NULL, 0.00, 0.00, NULL),
(124, 95, 3113, 'MACARRAO PARAFUSO C/OVOS 500 G - PCT', 'MUFFATO', 2.00, 2.00, 0.00, 0.00, 'aprovado', 2200, NULL, NULL, 0.00, 0.00, NULL),
(125, 95, 3122, 'MILHO CANJICA 500G - PCT', 'TAF', 2.12, 2.12, 0.00, 0.00, 'aprovado', 600, NULL, NULL, 0.00, 0.00, NULL),
(126, 95, 3136, 'SAL REFINADO 1 KG - PCT', 'TAF', 1.39, 1.39, 0.00, 0.00, 'aprovado', 900, NULL, NULL, 0.00, 0.00, NULL),
(127, 95, 3141, 'MILHO CANJICA 500G - PCT', 'TAF', 2.12, 2.12, 0.00, 0.00, 'aprovado', 1000, NULL, NULL, 0.00, 0.00, NULL),
(128, 95, 3188, 'FARINHA DE MANDIOCA 1 KG - PCT', 'BAIA NORTE', 3.39, 3.39, 0.00, 0.00, 'aprovado', 500, NULL, NULL, 0.00, 0.00, NULL),
(129, 96, 4133, 'CANTONEIRA 1.1/4x1/8', 'DOBRAPERFIL', 105.00, 100.00, 5.00, 4.76, 'aprovado', 1, NULL, NULL, 0.00, 0.00, NULL),
(130, 96, 4134, 'PERFIL DE CHAPA 0,80 GALV', 'DOBRAPERFIL', 45.00, 44.00, 6.00, 2.22, 'aprovado', 6, NULL, NULL, 0.00, 0.00, NULL),
(131, 96, 4135, 'PERFIL DE CHAPA 1.50', 'DOBRAPERFIL', 15.00, 14.00, 21.00, 6.67, 'aprovado', 21, NULL, NULL, 0.00, 0.00, NULL),
(132, 96, 4136, 'PERFIL DE CHAPA INOX 304', 'DOBRAPERFIL', 80.00, 78.00, 12.00, 2.50, 'aprovado', 6, NULL, NULL, 0.00, 0.00, NULL),
(133, 97, 3999, 'ABRACADEIRA 14 X 22 MM', 'ALPHA', 1.95, 1.81, 7.00, 7.18, 'aprovado', 50, NULL, NULL, 0.00, 0.00, NULL),
(134, 97, 4001, 'BORRACHA PANELA PRESSAO VED ROCHEDO 11,4 L / 20,8L', 'ALPHA', 27.90, 25.95, 39.00, 6.99, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(135, 97, 4002, 'BORRACHA SELO REPETITIVO GRANDE', 'ALPHA', 0.81, 0.75, 1.20, 7.41, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(136, 97, 4003, 'BORRACHA SELO REPETITIVO PEQUENO', 'ALPHA', 0.65, 0.60, 1.00, 7.69, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(137, 97, 4004, 'BORRACHA VED FULGOR 12/15/20L SILICONE', 'ALPHA', 27.90, 25.95, 29.25, 6.99, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(138, 97, 4006, 'CABO FULGOR CORPO', 'ALPHA', 5.25, 4.88, 3.70, 7.05, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(139, 97, 4007, 'CABO P/ PANELA PRESSAO TEXTURIZADO', 'ALPHA', 4.00, 3.72, 2.80, 7.00, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(140, 97, 4009, 'COTOVELO LATAO 1/8NPT EXT X 1/8NPT INT', 'ALPHA', 10.25, 9.53, 21.60, 7.02, 'aprovado', 30, NULL, NULL, 0.00, 0.00, NULL),
(141, 97, 4014, 'MANGUEIRA PIG TAIL - P45 1MT LIQUIGAS', 'ALPHA', 27.20, 25.30, 19.00, 6.99, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(142, 97, 4016, 'NIPLE 1/2 X 1/2 COBRE', 'ALPHA', 9.30, 8.65, 19.50, 6.99, 'aprovado', 30, NULL, NULL, 0.00, 0.00, NULL),
(143, 97, 4018, 'PESO CAPA PRETA CLOCK', 'ALPHA', 3.50, 3.26, 7.20, 6.86, 'aprovado', 30, NULL, NULL, 0.00, 0.00, NULL),
(144, 97, 4020, 'PINO CLOCK', 'ALPHA', 1.65, 1.54, 2.20, 6.67, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(145, 97, 4021, 'PINO GLOBO', 'ALPHA', 1.65, 1.54, 3.30, 6.67, 'aprovado', 30, NULL, NULL, 0.00, 0.00, NULL),
(146, 97, 4022, 'PINO MINI', 'ALPHA', 1.50, 1.40, 2.00, 6.67, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(147, 97, 4029, 'REGULADOR DE GAS 2KG VERMELHO', 'ALPHA', 50.30, 46.80, 70.00, 6.96, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(148, 97, 4033, 'SUPORTE DE FERRO PANEDO 316 X 78', 'ALPHA', 1.80, 1.67, 1.30, 7.22, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(149, 97, 4034, 'TEE 1/2 NTP COBRE', 'ALPHA', 19.75, 18.37, 27.60, 6.99, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(150, 97, 4035, 'TEE P/ MANOMETRO LATAO 1/8 NPT FxFxM', 'ALPHA', 10.50, 9.76, 14.80, 7.05, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(151, 97, 4042, 'TUBO DE COBRE 1/2', 'ALPHA', 255.00, 242.00, 13.00, 5.10, 'aprovado', 1, NULL, NULL, 0.00, 0.00, NULL),
(152, 97, 4043, 'VALVULA BLOQUEIO 1/2 NPT X 1/2 NPT', 'ALPHA', 50.00, 46.50, 35.00, 7.00, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(153, 97, 4044, 'VALVULA BLOQUEIO 1/2 NPT X 3/8 TM', 'ALPHA', 60.00, 55.80, 84.00, 7.00, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(154, 97, 4045, 'VALVULA BORBOLETA P13', 'ALPHA', 3.50, 3.26, 3.60, 6.86, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(155, 97, 4046, 'VALVULA DE SEGURANCA P/ PANELA PRESSAO', 'ALPHA', 1.50, 1.40, 6.00, 6.67, 'aprovado', 60, NULL, NULL, 0.00, 0.00, NULL),
(156, 97, 4047, 'VALVULA ESFERICA TRIPARTIDA ACO 1/2', 'ALPHA', 210.00, 195.30, 29.40, 7.00, 'aprovado', 2, NULL, NULL, 0.00, 0.00, NULL),
(157, 97, 4059, 'DOBRADICA PINO SOLTO ALUMINIO 64X40', 'MEPAR', 3.47, 3.07, 24.00, 11.53, 'aprovado', 60, NULL, NULL, 0.00, 0.00, NULL),
(158, 97, 4060, 'FECHO MAGNETICO C/ BATENTE 2 FUROS BRANCO', 'MEPAR', 1.95, 1.60, 10.50, 17.95, 'aprovado', 30, NULL, NULL, 0.00, 0.00, NULL),
(159, 97, 4064, 'MANIPULO C/ PARAFUSO 3/8X40 PRETO', 'MEPAR', 3.45, 2.94, 7.65, 14.78, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(160, 97, 4075, 'PORCA SEXTAVADA UNC 3/8 CHV 9/16', 'MEPAR', 0.60, 0.60, 0.00, 0.00, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(161, 97, 4076, 'PORCA SEXTAVADA UNC 3/8 CHV 9/8', 'MEPAR', 0.26, 0.26, 0.00, 0.00, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(162, 97, 4077, 'PUXADOR U - NORMAL ZINCADO', 'MEPAR', 8.23, 7.28, 38.00, 11.54, 'aprovado', 40, NULL, NULL, 0.00, 0.00, NULL),
(163, 97, 4098, 'CHAVE PHILIPS 1/4 X 5', 'MEPAR', 12.56, 12.56, 0.00, 0.00, 'aprovado', 5, NULL, NULL, 0.00, 0.00, NULL),
(164, 97, 4103, 'ESCOVA DE ACO MANUAL PEQUENA', 'MEPAR', 20.92, 19.24, 8.40, 8.03, 'aprovado', 5, NULL, NULL, 0.00, 0.00, NULL),
(165, 97, 4104, 'ALICATE UNIVERSAL', 'DEBASTIANI', 22.25, 21.14, 1.11, 5.00, 'aprovado', 1, NULL, NULL, 0.00, 0.00, NULL),
(166, 97, 4109, 'SIFAO SANFONADO UNIVERSAL DUPLO PVC 72CM', 'DEBASTIANI', 9.00, 8.55, 6.75, 5.00, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(167, 97, 4110, 'SIFAO SANFONADO UNIVERSAL PVC 72CM', 'DEBASTIANI', 4.05, 3.85, 4.05, 5.00, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(168, 97, 4113, 'TORNEIRA COZINHA BALCAO 1/2-3/4 BRANCA', 'DEBASTIANI', 22.95, 21.80, 9.18, 5.00, 'aprovado', 8, NULL, NULL, 0.00, 0.00, NULL),
(169, 97, 4114, 'TORNEIRA COZINHA PAREDE 1/2-3/4 BRANCA', 'DEBASTIANI', 21.95, 20.85, 10.98, 5.00, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(170, 97, 4115, 'TRENA 5MT', 'DEBASTIANI', 10.15, 9.64, 1.02, 5.00, 'aprovado', 2, NULL, NULL, 0.00, 0.00, NULL),
(171, 97, 4117, 'CABO FLEXIVEL PP 2 X 2,5MM PRETO', 'REZZADORI', 7.82, 7.82, 0.00, 0.00, 'aprovado', 100, NULL, NULL, 0.00, 0.00, NULL),
(172, 97, 4118, 'LAMPADA LED BULBO 30W', 'REZZADORI', 10.18, 10.18, 0.00, 0.00, 'aprovado', 40, NULL, NULL, 0.00, 0.00, NULL),
(173, 97, 4119, 'PERFIL PARA VEDA????O DE PORTA 1MT', 'REZZADORI', 8.31, 8.31, 0.00, 0.00, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(174, 97, 4120, 'PINCEL 302 GRIS 1.1/2', 'REZZADORI', 3.27, 3.27, 0.00, 0.00, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(175, 97, 4121, 'PLAFON TETO FIXO SOQUETE PORCELANA', 'REZZADORI', 2.37, 2.37, 0.00, 0.00, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(176, 97, 4122, 'ROLO DE ESPUMA 406/10 - 50X41', 'REZZADORI', 3.87, 3.87, 0.00, 0.00, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(177, 97, 4123, 'THINNER SINTETICO 5L', 'REZZADORI', 58.29, 58.29, 0.00, 0.00, 'aprovado', 3, NULL, NULL, 0.00, 0.00, NULL),
(178, 97, 4124, 'TINTA SPRAY ALTA TEMP PRETO FOSCO 400ML/240G', 'REZZADORI', 15.18, 15.18, 0.00, 0.00, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(179, 97, 4125, 'TINTA SPRAY CINZA CLARO 400ML', 'REZZADORI', 19.81, 19.81, 0.00, 0.00, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(180, 97, 4126, 'VEDAROSCA 18MM X 50MT', 'REZZADORI', 4.46, 4.46, 0.00, 0.00, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(181, 97, 4128, 'PLUGUE MACHO 2P+T 10A', 'ELETRICA ROCHA', 10.00, 10.00, 0.00, 0.00, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(182, 97, 4129, 'PLUGUE MACHO 2P+T 20A', 'ELETRICA ROCHA', 10.25, 10.25, 0.00, 0.00, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(183, 97, 4130, 'CONEXAO BICO 1/8 NPT X 3/8 BM', 'ALPHA', 2.50, 2.33, 3.40, 6.80, 'aprovado', 20, NULL, NULL, 0.00, 0.00, NULL),
(184, 97, 4131, 'REGULADOR DE GAS 12KG AMARELO', 'ALPHA', 105.75, 98.35, 111.00, 7.00, 'aprovado', 15, NULL, NULL, 0.00, 0.00, NULL),
(185, 97, 4132, 'ALCA CORPO CANNER', 'ALPHA', 8.50, 7.90, 6.00, 7.06, 'aprovado', 10, NULL, NULL, 0.00, 0.00, NULL),
(186, 98, 4137, 'RODIZIO GIRATORIO 4X1.1/2 SEM FREIO', 'MEPAR', 102.61, 102.61, 0.00, 0.00, 'aprovado', 2, NULL, NULL, 0.00, 0.00, NULL),
(187, 98, 4138, 'TUBO DE COBRE 1/2', 'REZZADORI', 183.06, 183.06, 0.00, 0.00, 'aprovado', 2, NULL, NULL, 0.00, 0.00, NULL),
(188, 99, 4140, 'FARINHA DE ARROZ SEM GLUTEN 1KG - PCT', 'ALBERTI', 6.98, 6.90, 0.64, 1.15, 'aprovado', 8, '23/07/2025', '23/07/2025', 0.00, 0.00, '28/35'),
(189, 99, 4142, 'LEITE ZERO LACTOSE UHT INTEGRAL 1 LT - LT', 'ALBERTI', 5.45, 5.40, 6.80, 0.92, 'aprovado', 136, '23/07/2025', '23/07/2025', 0.00, 0.00, '28/35'),
(190, 99, 4143, 'MACARRAO INTEGRAL ESPAGUETE 500 G - PCT', 'ALBERTI', 5.45, 5.40, 0.75, 0.92, 'aprovado', 15, '23/07/2025', '23/07/2025', 0.00, 0.00, '28/35'),
(191, 99, 4147, 'IOGURTE ZERO LACTOSE/ACUCAR /GORDURA  100G - PT', 'HAVITA', 2.99, 2.99, 0.00, 0.00, 'aprovado', 32, '23/07/2025', '23/07/2025', 0.00, 0.00, '10'),
(192, 99, 4158, 'MANTEIGA ZERO LACTOSE 200G - PT', 'ULTRA CHEESE', 9.82, 9.82, 0.00, 0.00, 'aprovado', 37, '23/07/2025', '23/07/2025', 0.00, 0.00, '28/35'),
(193, 99, 4159, 'QUEIJO MUSSARELA ZERO LACTOSE 150 G - PCT', 'ULTRA CHEESE', 8.20, 8.20, 0.00, 0.00, 'aprovado', 77, '23/07/2025', '23/07/2025', 0.00, 0.00, '28/35');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('administrador','gestor','supervisor','comprador') DEFAULT 'comprador',
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Administrador', 'luiz.nicolao@terceirizemais.com.br', '$2y$10$MJ2Fa2btWKyZlOFvjHb64.vPJkZmzD1HHP6YG7K.EbIUt5WP4X6ii', 'administrador', 'ativo', '2025-03-14 07:40:09', '2025-07-20 15:34:55'),
(3, 'Marcos Vinicius', 'marcos.vinicius@tercerizemais.com.br', '$2y$10$.ZOYWqLHiK7ruPhAaGjYqe4ZPZUz2fTyY8Cp/MNyjCeqwbLJET6Qa', 'comprador', 'ativo', '2025-03-17 10:52:13', '2025-03-17 10:52:13'),
(4, 'Fernando Gomes', 'fernando.gomes@terceirizemais.com.br', '$2y$10$WBw.70DEIqxufIKt7ZacuOxD0cVEN61CCbD/CT/el4kF9.0RHFzcq', 'gestor', 'ativo', '2025-03-19 09:01:28', '2025-03-19 09:01:28'),
(5, 'Eliane Kuosinski', 'eliane.kuosinski@terceirizemais.com.br', '$2y$10$QA40C//kNQEoVseDpwt3HOPD/OAm/yZo0vGpVbRmWh6GcfqG5utZG', 'comprador', 'ativo', '2025-04-28 07:30:44', '2025-04-28 07:30:44'),
(6, 'Danielle Ferreira', 'danielle.ferreira@terceirizemais.com.br', '$2y$10$7T68A.8JywFV8tGBwyHAhen/zknmjeCODM75/Y9sXUDuWX4ePJDg6', 'comprador', 'ativo', '2025-04-28 07:37:25', '2025-04-28 07:37:25'),
(7, 'Eliane Sup', 'eliane.surpevisora@tercerizemais.com.br', '$2y$10$m3hdY8GGq1nCdZtV5PcYAOkmAFgi90iWNxaF3OLLmc.i0CIaHI.46', 'supervisor', 'ativo', '2025-05-05 11:16:33', '2025-05-05 11:16:33');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `screen` varchar(50) NOT NULL,
  `can_view` tinyint(1) DEFAULT '0',
  `can_create` tinyint(1) DEFAULT '0',
  `can_edit` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `user_permissions`
--

INSERT INTO `user_permissions` (`id`, `user_id`, `screen`, `can_view`, `can_create`, `can_edit`, `can_delete`, `created_at`, `updated_at`) VALUES
(246, 5, 'dashboard', 1, 1, 1, 1, '2025-07-20 15:03:13', '2025-07-20 15:03:13'),
(247, 6, 'dashboard', 1, 1, 1, 1, '2025-07-20 15:03:13', '2025-07-20 15:03:13'),
(248, 7, 'dashboard', 1, 1, 1, 1, '2025-07-20 15:03:13', '2025-07-20 15:03:13'),
(249, 5, 'cotacoes', 1, 1, 1, 1, '2025-07-20 15:03:13', '2025-07-20 15:03:13'),
(250, 6, 'cotacoes', 1, 1, 1, 1, '2025-07-20 15:03:13', '2025-07-20 15:03:13'),
(251, 7, 'cotacoes', 1, 1, 1, 1, '2025-07-20 15:03:13', '2025-07-20 15:03:13'),
(252, 7, 'saving', 1, 1, 1, 1, '2025-07-20 15:03:13', '2025-07-20 15:03:13'),
(253, 4, 'dashboard', 1, 1, 1, 1, '2025-07-20 15:34:15', '2025-07-20 15:34:15'),
(255, 3, 'dashboard', 1, 1, 1, 1, '2025-07-20 15:34:15', '2025-07-20 15:34:15'),
(256, 4, 'cotacoes', 1, 1, 1, 1, '2025-07-20 15:34:15', '2025-07-20 15:34:15'),
(258, 3, 'cotacoes', 1, 1, 1, 1, '2025-07-20 15:34:15', '2025-07-20 15:34:15'),
(259, 4, 'saving', 1, 1, 1, 1, '2025-07-20 15:34:15', '2025-07-20 15:34:15'),
(261, 3, 'saving', 1, 1, 1, 1, '2025-07-20 15:34:15', '2025-07-20 15:34:15'),
(262, 4, 'usuarios', 1, 1, 1, 1, '2025-07-20 15:34:15', '2025-07-20 15:34:15'),
(264, 3, 'usuarios', 1, 1, 1, 1, '2025-07-20 15:34:15', '2025-07-20 15:34:15'),
(265, 2, 'cotacoes', 1, 1, 1, 1, '2025-07-20 15:34:55', '2025-07-20 15:34:55'),
(266, 2, 'dashboard', 1, 1, 1, 1, '2025-07-20 15:34:55', '2025-07-20 15:34:55'),
(267, 2, 'saving', 1, 1, 1, 1, '2025-07-20 15:34:55', '2025-07-20 15:34:55'),
(268, 2, 'usuarios', 1, 1, 1, 1, '2025-07-20 15:34:55', '2025-07-20 15:34:55'),
(269, 2, 'supervisor', 1, 1, 1, 1, '2025-07-20 15:34:55', '2025-07-20 15:34:55'),
(270, 2, 'aprovacoes', 1, 1, 1, 1, '2025-07-20 15:34:55', '2025-07-20 15:34:55'),
(271, 2, 'aprovacoes_supervisor', 1, 1, 1, 1, '2025-07-20 15:34:55', '2025-07-20 15:34:55'),
(272, 2, 'nova-cotacao', 1, 1, 1, 1, '2025-07-20 15:34:55', '2025-07-20 15:34:55'),
(273, 2, 'editar-cotacao', 1, 1, 1, 1, '2025-07-20 15:34:55', '2025-07-20 15:34:55'),
(274, 2, 'visualizar-cotacao', 1, 1, 1, 1, '2025-07-20 15:34:55', '2025-07-20 15:34:55');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(34, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJsdWl6Lm5pY29sYW9AdGVyY2Vpcml6ZW1haXMuY29tLmJyIiwicm9sZSI6ImFkbWluaXN0cmFkb3IiLCJpYXQiOjE3NTMwMjU4MzUsImV4cCI6MTc1MzExMjIzNX0.HlZbDurOxkYEm2KH3068pkN6Vk2XTd-fOEjanKDCmeE', '2025-07-21 15:34:30', '2025-07-20 15:34:30');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `cotacoes`
--
ALTER TABLE `cotacoes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cotacao_id` (`cotacao_id`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cotacao_id` (`cotacao_id`);

--
-- Índices de tabela `produtos_fornecedores`
--
ALTER TABLE `produtos_fornecedores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fornecedor_id` (`fornecedor_id`);

--
-- Índices de tabela `produtos_renegociacao`
--
ALTER TABLE `produtos_renegociacao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_produtos_renegociacao_cotacao_id` (`cotacao_id`),
  ADD KEY `idx_produtos_renegociacao_produto_id` (`produto_id`);

--
-- Índices de tabela `saving`
--
ALTER TABLE `saving`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cotacao_id` (`cotacao_id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_data_registro` (`data_registro`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tipo` (`tipo`);

--
-- Índices de tabela `saving_itens`
--
ALTER TABLE `saving_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_saving_id` (`saving_id`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_status` (`status`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`);

--
-- Índices de tabela `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_screen` (`user_id`,`screen`);

--
-- Índices de tabela `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sessions_token` (`token`),
  ADD KEY `idx_sessions_user_id` (`user_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `cotacoes`
--
ALTER TABLE `cotacoes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=177;

--
-- AUTO_INCREMENT de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=474;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1898;

--
-- AUTO_INCREMENT de tabela `produtos_fornecedores`
--
ALTER TABLE `produtos_fornecedores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1387;

--
-- AUTO_INCREMENT de tabela `produtos_renegociacao`
--
ALTER TABLE `produtos_renegociacao`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `saving`
--
ALTER TABLE `saving`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de tabela `saving_itens`
--
ALTER TABLE `saving_itens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=194;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `user_permissions`
--
ALTER TABLE `user_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=275;

--
-- AUTO_INCREMENT de tabela `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `fornecedores`
--
ALTER TABLE `fornecedores`
  ADD CONSTRAINT `fornecedores_ibfk_1` FOREIGN KEY (`cotacao_id`) REFERENCES `cotacoes` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `produtos_ibfk_1` FOREIGN KEY (`cotacao_id`) REFERENCES `cotacoes` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `produtos_fornecedores`
--
ALTER TABLE `produtos_fornecedores`
  ADD CONSTRAINT `produtos_fornecedores_ibfk_1` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `produtos_renegociacao`
--
ALTER TABLE `produtos_renegociacao`
  ADD CONSTRAINT `produtos_renegociacao_ibfk_1` FOREIGN KEY (`cotacao_id`) REFERENCES `cotacoes` (`id`) ON DELETE CASCADE;

--
-- Estrutura da tabela `anexos_cotacao`
--

CREATE TABLE `anexos_cotacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cotacao_id` int NOT NULL,
  `fornecedor_id` int NOT NULL,
  `nome_arquivo` varchar(255) NOT NULL,
  `caminho_arquivo` varchar(500) NOT NULL,
  `tipo_arquivo` varchar(50) NOT NULL,
  `tamanho_arquivo` int NOT NULL,
  `data_upload` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_upload` varchar(100) NOT NULL,
  `observacoes` text,
  PRIMARY KEY (`id`),
  KEY `idx_cotacao_fornecedor` (`cotacao_id`,`fornecedor_id`),
  CONSTRAINT `anexos_cotacao_ibfk_1` FOREIGN KEY (`cotacao_id`) REFERENCES `cotacoes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `anexos_cotacao_ibfk_2` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Estrutura da tabela `validacao_anexos`
--

CREATE TABLE `validacao_anexos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cotacao_id` int NOT NULL,
  `fornecedor_id` int NOT NULL,
  `produto_id` int NOT NULL,
  `valor_anterior` decimal(10,2) NOT NULL,
  `valor_novo` decimal(10,2) NOT NULL,
  `anexo_obrigatorio` tinyint(1) DEFAULT '1',
  `anexo_enviado` tinyint(1) DEFAULT '0',
  `data_alteracao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_validacao` (`cotacao_id`,`fornecedor_id`,`produto_id`),
  CONSTRAINT `validacao_anexos_ibfk_1` FOREIGN KEY (`cotacao_id`) REFERENCES `cotacoes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `validacao_anexos_ibfk_2` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `validacao_anexos_ibfk_3` FOREIGN KEY (`produto_id`) REFERENCES `produtos_fornecedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
