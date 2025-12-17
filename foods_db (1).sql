-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Tempo de geração: 12/12/2025 às 19:06
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
-- Estrutura para tabela `agrupamentos_escolas`
--

CREATE TABLE `agrupamentos_escolas` (
  `id` int NOT NULL,
  `agrupamento_id` int NOT NULL COMMENT 'ID do agrupamento',
  `unidade_escolar_id` int NOT NULL COMMENT 'ID da unidade escolar',
  `ativo` tinyint(1) DEFAULT '1' COMMENT 'Se a vinculaÃ§Ã£o estÃ¡ ativa',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='VinculaÃ§Ã£o entre agrupamentos e unidades escolares';

-- --------------------------------------------------------

--
-- Estrutura para tabela `agrupamentos_periodicidade`
--

CREATE TABLE `agrupamentos_periodicidade` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do agrupamento',
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'DescriÃ§Ã£o do agrupamento',
  `tipo_id` int NOT NULL COMMENT 'ID do tipo de periodicidade',
  `regras_calendario` json DEFAULT NULL COMMENT 'Regras do calendÃ¡rio (dias da semana, quinzenal, etc.)',
  `ativo` tinyint(1) DEFAULT '1' COMMENT 'Se o agrupamento estÃ¡ ativo',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Agrupamentos de periodicidade com regras de calendÃ¡rio';

-- --------------------------------------------------------

--
-- Estrutura para tabela `agrupamentos_produtos`
--

CREATE TABLE `agrupamentos_produtos` (
  `id` int NOT NULL,
  `agrupamento_id` int NOT NULL COMMENT 'ID do agrupamento',
  `produto_id` int NOT NULL COMMENT 'ID do produto',
  `quantidade` decimal(10,2) NOT NULL COMMENT 'Quantidade do produto',
  `unidade_medida` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unidade de medida (kg, L, un, etc.)',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'ObservaÃ§Ãµes sobre o produto no agrupamento',
  `ativo` tinyint(1) DEFAULT '1' COMMENT 'Se a vinculaÃ§Ã£o estÃ¡ ativa',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='VinculaÃ§Ã£o entre agrupamentos e produtos com quantidades';

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
-- Estrutura para tabela `almoxarifado`
--

CREATE TABLE `almoxarifado` (
  `id` int NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `filial_id` int NOT NULL,
  `tipo_vinculo` enum('filial','unidade_escolar') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'filial',
  `unidade_escolar_id` int DEFAULT NULL,
  `centro_custo_id` int NOT NULL,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) DEFAULT '1' COMMENT '1 = Ativo, 0 = Inativo',
  `usuario_cadastro_id` int DEFAULT NULL,
  `usuario_atualizacao_id` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de Almoxarifados vinculados às Filiais e Centros de Custo';

-- --------------------------------------------------------

--
-- Estrutura para tabela `almoxarifado_estoque`
--

CREATE TABLE `almoxarifado_estoque` (
  `id` int NOT NULL,
  `almoxarifado_id` int NOT NULL,
  `produto_generico_id` int NOT NULL,
  `grupo_id` int DEFAULT NULL,
  `grupo_nome` varchar(100) DEFAULT NULL,
  `quantidade_atual` decimal(15,3) DEFAULT '0.000',
  `quantidade_reservada` decimal(15,3) DEFAULT '0.000',
  `quantidade_disponivel` decimal(15,3) GENERATED ALWAYS AS ((`quantidade_atual` - `quantidade_reservada`)) STORED,
  `valor_unitario_medio` decimal(15,2) DEFAULT '0.00',
  `valor_total` decimal(15,2) GENERATED ALWAYS AS ((`quantidade_atual` * `valor_unitario_medio`)) STORED,
  `estoque_minimo` decimal(15,3) DEFAULT '0.000',
  `estoque_maximo` decimal(15,3) DEFAULT NULL,
  `ponto_reposicao` decimal(15,3) DEFAULT NULL,
  `localizacao` varchar(100) DEFAULT NULL,
  `lote` varchar(50) DEFAULT NULL,
  `data_validade` date DEFAULT NULL,
  `status` enum('ATIVO','BLOQUEADO','INATIVO') DEFAULT 'ATIVO',
  `observacoes` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_cadastro_id` int DEFAULT NULL,
  `usuario_atualizacao_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

-- --------------------------------------------------------

--
-- Estrutura para tabela `calendario`
--

CREATE TABLE `calendario` (
  `id` int NOT NULL,
  `data` date NOT NULL,
  `dia_semana` tinyint(1) DEFAULT NULL COMMENT 'Dia da semana (1=Segunda, 2=Terça, ..., 7=Domingo)',
  `ano` int NOT NULL,
  `mes` int NOT NULL,
  `dia` int NOT NULL,
  `dia_semana_numero` int NOT NULL COMMENT '1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado, 7=Domingo',
  `dia_semana_nome` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo',
  `semana` int DEFAULT NULL COMMENT 'Número da semana do ano',
  `semana_numero` int NOT NULL COMMENT 'Número da semana no ano',
  `semana_ano` int NOT NULL COMMENT 'Ano da semana',
  `semana_inicio` date NOT NULL COMMENT 'Data de início da semana (segunda-feira)',
  `semana_fim` date NOT NULL COMMENT 'Data de fim da semana (domingo)',
  `semana_abastecimento` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'Semana de abastecimento (segunda a sexta)',
  `semana_abastecimento_inicio` date DEFAULT NULL COMMENT 'Início da semana de abastecimento (segunda)',
  `semana_abastecimento_fim` date DEFAULT NULL COMMENT 'Fim da semana de abastecimento (sexta)',
  `data_entrega_cd` date DEFAULT NULL COMMENT 'Data de entrega no CD (quarta-feira da semana anterior à semana de abastecimento)',
  `semana_consumo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Semana de consumo (segunda a domingo)',
  `semana_consumo_inicio` date DEFAULT NULL COMMENT 'Início da semana de consumo (segunda)',
  `semana_consumo_fim` date DEFAULT NULL COMMENT 'Fim da semana de consumo (domingo)',
  `mes_referencia` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mês de referência baseado na segunda-feira da semana',
  `mes_referencia_ano` int NOT NULL COMMENT 'Ano do mês de referência',
  `mes_referencia_numero` int NOT NULL COMMENT 'Número do mês de referência',
  `feriado` tinyint(1) DEFAULT '0' COMMENT '0=Não, 1=Sim',
  `nome_feriado` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_util` tinyint(1) DEFAULT '1' COMMENT '0=Não, 1=Sim (segunda a sexta)',
  `dia_abastecimento` tinyint(1) DEFAULT '1' COMMENT '0=Não, 1=Sim (segunda a sexta)',
  `dia_consumo` tinyint(1) DEFAULT '1' COMMENT '0=Não, 1=Sim (segunda a domingo)',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `calendario_dias_nao_uteis`
--

CREATE TABLE `calendario_dias_nao_uteis` (
  `id` int NOT NULL,
  `data` date NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  `tipo_destino` enum('global','filial','unidade') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'global',
  `filial_id` int DEFAULT NULL,
  `unidade_escolar_id` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `centro_custo`
--

CREATE TABLE `centro_custo` (
  `id` int NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `filial_id` int NOT NULL,
  `status` tinyint(1) DEFAULT '1' COMMENT '1 = Ativo, 0 = Inativo',
  `usuario_cadastro_id` int DEFAULT NULL,
  `usuario_atualizacao_id` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de Centros de Custo vinculados às Filiais';

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
  `tipo_efetivo` enum('PADRAO','NAE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PADRAO',
  `quantidade` int NOT NULL DEFAULT '0',
  `intolerancia_id` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `periodo_refeicao_id` int DEFAULT NULL COMMENT 'PerÃ­odo de refeiÃ§Ã£o ao qual o efetivo estÃ¡ vinculado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `entregas_agendadas`
--

CREATE TABLE `entregas_agendadas` (
  `id` int NOT NULL,
  `agrupamento_id` int NOT NULL,
  `data_entrega` date NOT NULL,
  `tipo_entrega` varchar(50) DEFAULT 'manual',
  `status` varchar(20) DEFAULT 'agendada',
  `observacoes` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `failed_login_attempts`
--

CREATE TABLE `failed_login_attempts` (
  `id` int NOT NULL,
  `email_hash` varchar(64) NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `lockout_until` datetime DEFAULT NULL,
  `last_attempt_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `faturamento`
--

CREATE TABLE `faturamento` (
  `id` int NOT NULL,
  `unidade_escolar_id` int NOT NULL,
  `mes` tinyint NOT NULL COMMENT 'Mês do faturamento (1-12)',
  `ano` int NOT NULL COMMENT 'Ano do faturamento',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `criado_por` int NOT NULL COMMENT 'ID do usuário que criou o faturamento',
  `atualizado_por` int DEFAULT NULL COMMENT 'ID do usuário que atualizou o faturamento',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela principal de faturamento de refeições';

-- --------------------------------------------------------

--
-- Estrutura para tabela `faturamento_detalhes`
--

CREATE TABLE `faturamento_detalhes` (
  `id` int NOT NULL,
  `faturamento_id` int NOT NULL,
  `dia` tinyint NOT NULL COMMENT 'Dia do mês (1-31)',
  `desjejum` int DEFAULT '0' COMMENT 'Quantidade de refeições servidas no desjejum',
  `lanche_matutino` int DEFAULT '0' COMMENT 'Quantidade de refeições servidas no lanche matutino',
  `almoco` int DEFAULT '0' COMMENT 'Quantidade de refeições servidas no almoço',
  `lanche_vespertino` int DEFAULT '0' COMMENT 'Quantidade de refeições servidas no lanche vespertino',
  `noturno` int DEFAULT '0' COMMENT 'Quantidade de refeições servidas no período noturno',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Detalhes diários do faturamento de refeições';

-- --------------------------------------------------------

--
-- Estrutura para tabela `ficha_homologacao`
--

CREATE TABLE `ficha_homologacao` (
  `id` int NOT NULL,
  `produto_generico_id` int DEFAULT NULL,
  `tipo` enum('NOVO_PRODUTO','REAVALIACAO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_analise` date NOT NULL,
  `marca` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nome da marca (texto livre)',
  `fabricante` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fornecedor_id` int DEFAULT NULL,
  `composicao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `fabricacao` date DEFAULT NULL,
  `lote` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `validade` date DEFAULT NULL,
  `unidade_medida_id` int DEFAULT NULL,
  `peso` enum('BOM','REGULAR','RUIM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `peso_valor` decimal(10,3) DEFAULT NULL COMMENT 'Peso líquido em kg (preenchido automaticamente do produto genérico)',
  `peso_cru` enum('BOM','REGULAR','RUIM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `peso_cru_valor` decimal(10,3) DEFAULT NULL COMMENT 'Peso cru em kg (valor numérico)',
  `peso_cozido` enum('BOM','REGULAR','RUIM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `peso_cozido_valor` decimal(10,3) DEFAULT NULL COMMENT 'Peso cozido em kg (valor numérico)',
  `fator_coccao` enum('BOM','REGULAR','RUIM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fator_coccao_valor` decimal(10,3) DEFAULT NULL COMMENT 'Fator de cocção (valor numérico)',
  `cor` enum('BOM','REGULAR','RUIM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cor_observacao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Observação breve sobre a cor',
  `odor` enum('BOM','REGULAR','RUIM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `odor_observacao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Observação breve sobre o odor',
  `sabor` enum('BOM','REGULAR','RUIM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sabor_observacao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Observação breve sobre o sabor',
  `aparencia` enum('BOM','REGULAR','RUIM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aparencia_observacao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Observação breve sobre a aparência',
  `conclusao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `resultado_final` enum('APROVADO','APROVADO_COM_RESSALVAS','REPROVADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Resultado final da avaliação',
  `avaliador_id` int DEFAULT NULL,
  `aprovador_id` int DEFAULT NULL,
  `foto_embalagem` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_produto_cru` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Foto do produto cru',
  `foto_produto_cozido` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Foto do produto cozido',
  `pdf_avaliacao_antiga` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Caminho/URL do PDF da avaliação antiga (obrigatório para reavaliações)',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela para armazenar fichas de homologação de produtos do módulo de Suprimentos';

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
  `almoxarifados_ids` varchar(500) DEFAULT NULL COMMENT 'Lista de IDs de almoxarifados vinculados, separados por vírgula',
  `status` tinyint(1) DEFAULT '1',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `formas_pagamento`
--

CREATE TABLE `formas_pagamento` (
  `id` int NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `prazo_padrao` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Prazo padrão (ex: 30 dias, À vista)',
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupos`
--

CREATE TABLE `grupos` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do grupo (ex: Eletrônicos, Roupas, Alimentos)',
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código do grupo (ex: ELET, ROUP, ALIM)',
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descrição detalhada do grupo',
  `tipo` enum('compra','venda') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'compra' COMMENT 'Tipo do grupo: compra ou venda',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status do grupo',
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  `data_atualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela para armazenar grupos de produtos';

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupos_nqa`
--

CREATE TABLE `grupos_nqa` (
  `id` int NOT NULL,
  `grupo_id` int NOT NULL,
  `nqa_id` int NOT NULL,
  `observacoes` text,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `usuario_cadastro_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `historico_periodicidade`
--

CREATE TABLE `historico_periodicidade` (
  `id` int NOT NULL,
  `agrupamento_id` int NOT NULL COMMENT 'ID do agrupamento',
  `unidade_escolar_id` int NOT NULL COMMENT 'ID da unidade escolar',
  `data_aplicacao` date NOT NULL COMMENT 'Data da aplicaÃ§Ã£o',
  `produtos_aplicados` json DEFAULT NULL COMMENT 'Produtos que foram aplicados',
  `status` enum('aplicado','erro','pendente') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pendente' COMMENT 'Status da aplicaÃ§Ã£o',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'ObservaÃ§Ãµes sobre a aplicaÃ§Ã£o',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='HistÃ³rico de aplicaÃ§Ã£o dos agrupamentos nas escolas';

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

-- --------------------------------------------------------

--
-- Estrutura para tabela `necessidades_cardapio`
--

CREATE TABLE `necessidades_cardapio` (
  `id` int NOT NULL,
  `codigo_interno` varchar(100) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `unidade_escolar_id` int DEFAULT NULL,
  `filial_id` int DEFAULT NULL,
  `cardapio_id` int DEFAULT NULL,
  `receita_id` int DEFAULT NULL,
  `data` date DEFAULT NULL,
  `produto_id` int DEFAULT NULL,
  `quantidade_padrao` decimal(10,3) DEFAULT '0.000',
  `quantidade_nae` decimal(10,3) DEFAULT '0.000',
  `quantidade_total` decimal(10,3) DEFAULT '0.000',
  `unidade` varchar(20) DEFAULT 'un',
  `status` enum('rascunho','pendente','aprovada','rejeitada','cancelada') DEFAULT 'rascunho',
  `data_inicio` date DEFAULT NULL,
  `data_fim` date DEFAULT NULL,
  `total_efetivos` int DEFAULT '0',
  `total_nae` int DEFAULT '0',
  `observacoes` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabela para armazenar necessidades de cardápio da merenda escolar';

-- --------------------------------------------------------

--
-- Estrutura para tabela `notas_fiscais`
--

CREATE TABLE `notas_fiscais` (
  `id` int NOT NULL,
  `tipo_nota` enum('ENTRADA','SAIDA') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'ENTRADA',
  `numero_nota` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `serie` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `chave_acesso` varchar(44) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fornecedor_id` int NOT NULL,
  `filial_id` int NOT NULL,
  `data_emissao` date NOT NULL,
  `data_saida` date NOT NULL,
  `valor_produtos` decimal(15,2) NOT NULL DEFAULT '0.00',
  `valor_frete` decimal(15,2) DEFAULT '0.00',
  `valor_seguro` decimal(15,2) DEFAULT '0.00',
  `valor_desconto` decimal(15,2) DEFAULT '0.00',
  `valor_outras_despesas` decimal(15,2) DEFAULT '0.00',
  `valor_ipi` decimal(15,2) DEFAULT '0.00',
  `valor_icms` decimal(15,2) DEFAULT '0.00',
  `valor_icms_st` decimal(15,2) DEFAULT '0.00',
  `valor_pis` decimal(15,2) DEFAULT '0.00',
  `valor_cofins` decimal(15,2) DEFAULT '0.00',
  `valor_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `natureza_operacao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cfop` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo_frete` enum('0-EMITENTE','1-DESTINATARIO','2-TERCEIROS','9-SEM_FRETE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '9-SEM_FRETE',
  `transportadora_nome` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `transportadora_cnpj` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `transportadora_placa` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `transportadora_uf` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `volumes_quantidade` int DEFAULT '0',
  `volumes_especie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `volumes_marca` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `volumes_peso_bruto` decimal(10,3) DEFAULT '0.000',
  `volumes_peso_liquido` decimal(10,3) DEFAULT '0.000',
  `informacoes_complementares` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `xml_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('LANCADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'LANCADA',
  `usuario_cadastro_id` int DEFAULT NULL,
  `usuario_lancamento_id` int DEFAULT NULL,
  `data_lancamento` timestamp NULL DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pedido_compra_id` int DEFAULT NULL,
  `rir_id` int DEFAULT NULL,
  `almoxarifado_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `notas_fiscais_itens`
--

CREATE TABLE `notas_fiscais_itens` (
  `id` int NOT NULL,
  `nota_fiscal_id` int NOT NULL,
  `produto_generico_id` int DEFAULT NULL,
  `produto_origem_id` int DEFAULT NULL,
  `grupo_id` int DEFAULT NULL,
  `grupo_nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `numero_item` int NOT NULL,
  `produto_generico_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ncm` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cfop` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `unidade_medida` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quantidade` decimal(15,4) NOT NULL,
  `valor_unitario` decimal(15,4) NOT NULL,
  `valor_total` decimal(15,2) NOT NULL,
  `valor_desconto` decimal(15,2) DEFAULT '0.00',
  `valor_frete` decimal(15,2) DEFAULT '0.00',
  `valor_seguro` decimal(15,2) DEFAULT '0.00',
  `valor_outras_despesas` decimal(15,2) DEFAULT '0.00',
  `valor_ipi` decimal(15,2) DEFAULT '0.00',
  `aliquota_ipi` decimal(5,2) DEFAULT '0.00',
  `valor_icms` decimal(15,2) DEFAULT '0.00',
  `aliquota_icms` decimal(5,2) DEFAULT '0.00',
  `valor_icms_st` decimal(15,2) DEFAULT '0.00',
  `aliquota_icms_st` decimal(5,2) DEFAULT '0.00',
  `valor_pis` decimal(15,2) DEFAULT '0.00',
  `aliquota_pis` decimal(5,2) DEFAULT '0.00',
  `valor_cofins` decimal(15,2) DEFAULT '0.00',
  `aliquota_cofins` decimal(5,2) DEFAULT '0.00',
  `informacoes_adicionais` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `nqa`
--

CREATE TABLE `nqa` (
  `id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `codigo` varchar(20) DEFAULT NULL,
  `descricao` text,
  `nivel_inspecao` enum('I','II','III') DEFAULT 'II',
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `usuario_cadastro_id` int DEFAULT NULL,
  `usuario_atualizacao_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
-- Estrutura para tabela `pdf_receitas`
--

CREATE TABLE `pdf_receitas` (
  `id` bigint NOT NULL,
  `upload_id` bigint NOT NULL,
  `data_iso` date NOT NULL,
  `turno` varchar(100) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `descricao` text NOT NULL,
  `incompleto` tinyint(1) NOT NULL DEFAULT '0',
  `is_feriado` tinyint(1) NOT NULL DEFAULT '0',
  `source_page` int DEFAULT NULL,
  `source_table_idx` int DEFAULT NULL,
  `entry_hash` varchar(128) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pdf_templates`
--

CREATE TABLE `pdf_templates` (
  `id` int NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do template',
  `descricao` text COLLATE utf8mb4_unicode_ci COMMENT 'Descrição do template',
  `tela_vinculada` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tela onde o template será usado (ex: solicitacoes-compras, pedidos-compras)',
  `html_template` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'HTML do template com variáveis {{variavel}}',
  `css_styles` text COLLATE utf8mb4_unicode_ci COMMENT 'CSS adicional para o template',
  `ativo` tinyint(1) DEFAULT '1' COMMENT 'Se o template está ativo',
  `padrao` tinyint(1) DEFAULT '0' COMMENT 'Se é o template padrão para a tela',
  `variaveis_disponiveis` json DEFAULT NULL COMMENT 'Lista de variáveis disponíveis para o template',
  `criado_por` int DEFAULT NULL COMMENT 'ID do usuário que criou',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_por` int DEFAULT NULL COMMENT 'ID do usuário que atualizou',
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Templates de PDF configuráveis';

-- --------------------------------------------------------

--
-- Estrutura para tabela `pdf_uploads`
--

CREATE TABLE `pdf_uploads` (
  `id` bigint NOT NULL,
  `original_name` text NOT NULL,
  `file_hash` varchar(128) NOT NULL,
  `normalized_hash` varchar(128) NOT NULL,
  `period_label` varchar(255) DEFAULT NULL,
  `pages` int DEFAULT NULL,
  `status` enum('staged','committed','discarded','duplicate') NOT NULL DEFAULT 'committed',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedidos_compras`
--

CREATE TABLE `pedidos_compras` (
  `id` int NOT NULL,
  `numero_pedido` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Número sequencial do pedido (PC000001)',
  `solicitacao_compras_id` int NOT NULL COMMENT 'ID da solicitação de compras vinculada',
  `fornecedor_id` int DEFAULT NULL COMMENT 'ID do fornecedor',
  `fornecedor_nome` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nome do fornecedor',
  `fornecedor_cnpj` varchar(18) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CNPJ do fornecedor',
  `filial_id` int DEFAULT NULL COMMENT 'ID da filial',
  `filial_nome` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nome da filial',
  `data_entrega_cd` date DEFAULT NULL COMMENT 'Data de entrega no CD',
  `semana_abastecimento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Semana de abastecimento',
  `valor_total` decimal(15,2) DEFAULT '0.00' COMMENT 'Valor total do pedido',
  `status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'em_digitacao',
  `observacoes` text COLLATE utf8mb4_unicode_ci COMMENT 'Observações gerais do pedido',
  `criado_por` int DEFAULT NULL COMMENT 'ID do usuário que criou',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `forma_pagamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prazo_pagamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `filial_entrega_id` int DEFAULT NULL,
  `filial_faturamento_id` int DEFAULT NULL,
  `endereco_entrega` text COLLATE utf8mb4_unicode_ci,
  `endereco_faturamento` text COLLATE utf8mb4_unicode_ci,
  `justificativa` text COLLATE utf8mb4_unicode_ci,
  `numero_solicitacao` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `filial_cobranca_id` int DEFAULT NULL,
  `endereco_cobranca` text COLLATE utf8mb4_unicode_ci,
  `cnpj_faturamento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cnpj_cobranca` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cnpj_entrega` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de pedidos de compras';

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedido_compras_itens`
--

CREATE TABLE `pedido_compras_itens` (
  `id` int NOT NULL,
  `pedido_id` int NOT NULL COMMENT 'ID do pedido de compras',
  `solicitacao_item_id` int DEFAULT NULL COMMENT 'ID do item da solicitação (referência)',
  `produto_generico_id` int DEFAULT NULL COMMENT 'ID do produto genérico',
  `codigo_produto` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código do produto',
  `nome_produto` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nome do produto',
  `unidade_medida_id` int DEFAULT NULL COMMENT 'ID da unidade de medida',
  `unidade_medida` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Símbolo da unidade de medida',
  `quantidade_solicitada` decimal(10,3) NOT NULL DEFAULT '0.000' COMMENT 'Quantidade da solicitação original',
  `quantidade_pedido` decimal(10,3) NOT NULL DEFAULT '0.000' COMMENT 'Quantidade no pedido (pode ser diferente)',
  `valor_unitario` decimal(10,2) DEFAULT '0.00' COMMENT 'Valor unitário do produto',
  `valor_total` decimal(15,2) DEFAULT '0.00' COMMENT 'Valor total do item (quantidade * valor_unitario)',
  `observacao` text COLLATE utf8mb4_unicode_ci COMMENT 'Observação específica do item',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `quantidade_atendida` decimal(10,2) DEFAULT '0.00',
  `quantidade_saldo` decimal(10,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Itens dos pedidos de compras';

--
-- Acionadores `pedido_compras_itens`
--
DELIMITER $$
CREATE TRIGGER `calcular_valor_total_item_pedido` BEFORE INSERT ON `pedido_compras_itens` FOR EACH ROW BEGIN
    SET NEW.valor_total = NEW.quantidade_pedido * NEW.valor_unitario;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `calcular_valor_total_item_pedido_update` BEFORE UPDATE ON `pedido_compras_itens` FOR EACH ROW BEGIN
    SET NEW.valor_total = NEW.quantidade_pedido * NEW.valor_unitario;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `periodos_refeicao`
--

CREATE TABLE `periodos_refeicao` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do período de refeição (ex: Matutino, Almoço, Vespertino)',
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código do período (ex: MAT, ALM, VES)',
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descrição detalhada do período de refeição',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Observações adicionais sobre o período',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status do período de refeição',
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  `data_atualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela para armazenar períodos de refeição';

-- --------------------------------------------------------

--
-- Estrutura para tabela `periodos_refeicao_filiais`
--

CREATE TABLE `periodos_refeicao_filiais` (
  `id` int NOT NULL,
  `periodo_refeicao_id` int NOT NULL COMMENT 'ID do período de refeição',
  `filial_id` int NOT NULL COMMENT 'ID da filial',
  `data_vinculacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data da vinculação',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status da vinculação'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de relacionamento entre períodos de refeição e filiais';

-- --------------------------------------------------------

--
-- Estrutura para tabela `prazos_pagamento`
--

CREATE TABLE `prazos_pagamento` (
  `id` int NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dias` int DEFAULT NULL COMMENT 'Número de dias (0 para à vista)',
  `parcelas` int DEFAULT '1' COMMENT 'Número de parcelas (1 = pagamento único)',
  `intervalo_dias` int DEFAULT NULL COMMENT 'Intervalo entre parcelas (ex: 30 para mensal)',
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Estrutura para tabela `produto_comercial`
--

CREATE TABLE `produto_comercial` (
  `id` int NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_comercial` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidade_medida_id` int NOT NULL,
  `grupo_id` int DEFAULT NULL,
  `subgrupo_id` int DEFAULT NULL,
  `classe_id` int DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `usuario_criador_id` int DEFAULT NULL,
  `usuario_atualizador_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Estrutura para tabela `receitas_processadas`
--

CREATE TABLE `receitas_processadas` (
  `id` int NOT NULL,
  `codigo_interno` varchar(100) NOT NULL,
  `codigo_referencia` varchar(100) DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `texto_extraido` longtext,
  `ingredientes` json DEFAULT NULL,
  `origem` enum('manual','pdf','importacao') DEFAULT 'manual',
  `tipo` enum('receita','cardapio','ingrediente') DEFAULT 'receita',
  `status` enum('rascunho','pendente','aprovada','rejeitada','cancelada') DEFAULT 'rascunho',
  `observacoes` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  `atualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabela para armazenar receitas processadas do sistema';

-- --------------------------------------------------------

--
-- Estrutura para tabela `relatorio_inspecao`
--

CREATE TABLE `relatorio_inspecao` (
  `id` int NOT NULL,
  `data_inspecao` date NOT NULL,
  `hora_inspecao` time NOT NULL,
  `numero_nota_fiscal` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fornecedor` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_pedido` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cnpj_fornecedor` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nota_fiscal_id` int DEFAULT NULL,
  `ocorrencias` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `recebedor` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visto_responsavel` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resultado_geral` enum('APROVADO','REPROVADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DISPONIVEL','FINALIZADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DISPONIVEL',
  `tipo_transporte` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipo de transporte: Baú, Baú Isotérmico, Baú Refrigerado, Sider, Grade Baixa, Graneleiro',
  `isento_material` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Isento de Material Estranho: Conforme, Não Conforme, N/A',
  `condicoes_caminhao` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Condições do Caminhão: Conforme, Não Conforme, N/A',
  `acondicionamento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Acondicionamento: Conforme, Não Conforme, N/A',
  `condicoes_embalagem` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Condições da Embalagem: Conforme, Não Conforme, N/A',
  `usuario_cadastro_id` int NOT NULL,
  `usuario_atualizacao_id` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de Relatórios de Inspeção de Recebimento (RIR)';

-- --------------------------------------------------------

--
-- Estrutura para tabela `relatorio_inspecao_produtos`
--

CREATE TABLE `relatorio_inspecao_produtos` (
  `id` int NOT NULL,
  `relatorio_inspecao_id` int NOT NULL,
  `pedido_item_id` int DEFAULT NULL COMMENT 'FK para pedido_compras_itens.id',
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descricao` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unidade_medida` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantidade_pedido` decimal(10,3) DEFAULT NULL,
  `grupo_id` int DEFAULT NULL COMMENT 'FK para grupos.id',
  `grupo_nome` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nqa_id` int DEFAULT NULL COMMENT 'FK para nqa.id',
  `nqa_codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fabricacao` date DEFAULT NULL,
  `lote` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `validade` date DEFAULT NULL,
  `temperatura` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aval_sensorial` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tam_lote` decimal(10,3) DEFAULT NULL,
  `num_amostras_avaliadas` int DEFAULT NULL,
  `num_amostras_aprovadas` decimal(10,3) DEFAULT NULL,
  `num_amostras_reprovadas` int DEFAULT NULL,
  `ac` int DEFAULT NULL,
  `re` int DEFAULT NULL,
  `controle_validade` decimal(5,2) DEFAULT NULL,
  `resultado_final` enum('Aprovado','Reprovado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observacao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Produtos avaliados no Relatório de Inspeção';

-- --------------------------------------------------------

--
-- Estrutura para tabela `rotas`
--

CREATE TABLE `rotas` (
  `id` int NOT NULL,
  `filial_id` int NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo',
  `frequencia_entrega` enum('semanal','quinzenal','mensal','transferencia','diaria') COLLATE utf8mb4_unicode_ci DEFAULT 'semanal',
  `tipo_rota_id` int DEFAULT NULL COMMENT 'ID do tipo de rota',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Estrutura para tabela `rotas_nutricionistas_escolas`
--

CREATE TABLE `rotas_nutricionistas_escolas` (
  `id` int NOT NULL,
  `rota_nutricionista_id` int NOT NULL,
  `unidade_escolar_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `solicitacao_compras_itens`
--

CREATE TABLE `solicitacao_compras_itens` (
  `id` int NOT NULL,
  `solicitacao_id` int NOT NULL,
  `produto_id` int DEFAULT NULL,
  `codigo_produto` varchar(10) DEFAULT NULL,
  `nome_produto` varchar(200) DEFAULT NULL,
  `unidade_medida_id` int DEFAULT NULL,
  `unidade_medida` varchar(50) DEFAULT NULL,
  `quantidade` decimal(10,3) NOT NULL DEFAULT '1.000',
  `observacao` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `solicitacoes_compras`
--

CREATE TABLE `solicitacoes_compras` (
  `id` int NOT NULL,
  `numero_solicitacao` varchar(20) NOT NULL,
  `unidade` varchar(100) DEFAULT NULL,
  `data_necessidade` date DEFAULT NULL,
  `observacoes` text,
  `status` enum('aberto','parcial','finalizado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'aberto',
  `criado_por` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `usuario_nome` varchar(100) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `data_documento` date NOT NULL,
  `justificativa` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `filial_id` int DEFAULT NULL,
  `data_entrega_cd` date DEFAULT NULL,
  `semana_abastecimento` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
-- Estrutura para tabela `tabela_amostragem`
--

CREATE TABLE `tabela_amostragem` (
  `id` int NOT NULL,
  `nqa_id` int DEFAULT NULL,
  `faixa_inicial` int NOT NULL,
  `faixa_final` int NOT NULL,
  `tamanho_amostra` int NOT NULL,
  `ac` int NOT NULL,
  `re` int NOT NULL,
  `observacoes` text,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `usuario_cadastro_id` int DEFAULT NULL,
  `usuario_atualizacao_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tipos_cardapio`
--

CREATE TABLE `tipos_cardapio` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do tipo de cardÃ¡pio',
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CÃ³digo Ãºnico do tipo de cardÃ¡pio',
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'DescriÃ§Ã£o detalhada do tipo de cardÃ¡pio',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status do tipo de cardÃ¡pio',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'ObservaÃ§Ãµes adicionais',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criaÃ§Ã£o',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da Ãºltima atualizaÃ§Ã£o'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela para gerenciar tipos de cardÃ¡pio';

-- --------------------------------------------------------

--
-- Estrutura para tabela `tipos_cardapio_filiais`
--

CREATE TABLE `tipos_cardapio_filiais` (
  `id` int NOT NULL,
  `tipo_cardapio_id` int NOT NULL,
  `filial_id` int NOT NULL,
  `data_vinculo` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data do vÃ­nculo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relacionamento entre tipos de cardÃ¡pio e filiais';

-- --------------------------------------------------------

--
-- Estrutura para tabela `tipos_periodicidade`
--

CREATE TABLE `tipos_periodicidade` (
  `id` int NOT NULL,
  `nome` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do tipo (semanal, quinzenal, mensal)',
  `descricao` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'DescriÃ§Ã£o do tipo',
  `ativo` tinyint(1) DEFAULT '1' COMMENT 'Se o tipo estÃ¡ ativo',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tipos de periodicidade (semanal, quinzenal, mensal)';

-- --------------------------------------------------------

--
-- Estrutura para tabela `tipo_rota`
--

CREATE TABLE `tipo_rota` (
  `id` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome da rota',
  `filial_id` int NOT NULL COMMENT 'ID da filial',
  `grupo_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'IDs dos grupos separados por vírgula (ex: "15,7")',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status do tipo de rota',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela para armazenar tipos de rota vinculados a grupos';

-- --------------------------------------------------------

--
-- Estrutura para tabela `unidades_escolares`
--

CREATE TABLE `unidades_escolares` (
  `id` int NOT NULL,
  `codigo_teknisa` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código teknisa da unidade',
  `nome_escola` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome da escola/unidade',
  `cidade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Cidade da unidade',
  `estado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Estado da unidade',
  `pais` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Brasil' COMMENT 'País da unidade',
  `endereco` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Endereço completo',
  `numero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Número do endereço',
  `bairro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Bairro da unidade',
  `cep` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CEP da unidade',
  `centro_distribuicao` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Centro de distribuição responsável',
  `rota_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Rotas que atendem esta unidade (IDs separados por vírgula)',
  `tipo_rota_id` int DEFAULT NULL COMMENT 'ID do tipo de rota vinculado a esta unidade escolar',
  `regional` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Regional da unidade',
  `centro_custo_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `almoxarifado_id` int DEFAULT NULL,
  `cc_senior` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'C.C. Senior',
  `codigo_senior` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Código Senior',
  `abastecimento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipo de abastecimento',
  `ordem_entrega` int DEFAULT '0' COMMENT 'Ordem de entrega na rota',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status da unidade',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Observações adicionais',
  `filial_id` int DEFAULT NULL COMMENT 'ID da filial relacionada',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  `atendimento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `horario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supervisao` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Supervisão da unidade escolar',
  `coordenacao` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Coordenação da unidade escolar',
  `lat` decimal(10,8) DEFAULT NULL COMMENT 'Latitude da unidade escolar',
  `long` decimal(11,8) DEFAULT NULL COMMENT 'Longitude da unidade escolar',
  `rota_nutricionista_id` int DEFAULT NULL COMMENT 'Rota nutricionista responsável por esta unidade escolar'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `unidades_escolares_periodos_refeicao`
--

CREATE TABLE `unidades_escolares_periodos_refeicao` (
  `id` int NOT NULL,
  `unidade_escolar_id` int NOT NULL COMMENT 'ID da unidade escolar',
  `periodo_refeicao_id` int NOT NULL COMMENT 'ID do período de refeição',
  `data_vinculacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data da vinculação',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status da vinculação',
  `quantidade_efetivos_padrao` int DEFAULT '0' COMMENT 'Quantidade de efetivos padrÃ£o para este perÃ­odo',
  `quantidade_efetivos_nae` int DEFAULT '0' COMMENT 'Quantidade de efetivos NAE para este perÃ­odo',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de relacionamento entre unidades escolares e períodos de refeição';

-- --------------------------------------------------------

--
-- Estrutura para tabela `unidades_escolares_rotas`
--

CREATE TABLE `unidades_escolares_rotas` (
  `id` int NOT NULL,
  `unidade_escolar_id` int NOT NULL,
  `rota_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `unidades_escolares_tipos_cardapio`
--

CREATE TABLE `unidades_escolares_tipos_cardapio` (
  `id` int NOT NULL,
  `unidade_escolar_id` int NOT NULL,
  `tipo_cardapio_id` int NOT NULL,
  `data_vinculo` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data do vÃ­nculo',
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ativo' COMMENT 'Status do vÃ­nculo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relacionamento entre unidades escolares e tipos de cardÃ¡pio';

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
-- Estrutura para tabela `usuarios_filiais`
--

CREATE TABLE `usuarios_filiais` (
  `usuario_id` int NOT NULL,
  `filial_id` int NOT NULL,
  `data_vinculo` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Índices de tabela `agrupamentos_escolas`
--
ALTER TABLE `agrupamentos_escolas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_agrupamento_escola` (`agrupamento_id`,`unidade_escolar_id`),
  ADD KEY `idx_agrupamento` (`agrupamento_id`),
  ADD KEY `idx_escola` (`unidade_escolar_id`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_agrupamentos_escolas_ativo` (`agrupamento_id`,`ativo`);

--
-- Índices de tabela `agrupamentos_periodicidade`
--
ALTER TABLE `agrupamentos_periodicidade`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_nome` (`nome`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_tipo` (`tipo_id`),
  ADD KEY `idx_criado_em` (`criado_em`);

--
-- Índices de tabela `agrupamentos_produtos`
--
ALTER TABLE `agrupamentos_produtos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_agrupamento_produto` (`agrupamento_id`,`produto_id`),
  ADD KEY `idx_agrupamento` (`agrupamento_id`),
  ADD KEY `idx_produto` (`produto_id`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_agrupamentos_produtos_ativo` (`agrupamento_id`,`ativo`);

--
-- Índices de tabela `ajudantes`
--
ALTER TABLE `ajudantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpf` (`cpf`),
  ADD KEY `idx_ajudantes_nome` (`nome`),
  ADD KEY `idx_ajudantes_filial` (`filial_id`);

--
-- Índices de tabela `almoxarifado`
--
ALTER TABLE `almoxarifado`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_filial_id` (`filial_id`),
  ADD KEY `idx_centro_custo_id` (`centro_custo_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_unidade_escolar_id` (`unidade_escolar_id`);

--
-- Índices de tabela `almoxarifado_estoque`
--
ALTER TABLE `almoxarifado_estoque`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_almoxarifado_produto` (`almoxarifado_id`,`produto_generico_id`,`lote`,`data_validade`),
  ADD KEY `idx_produto` (`produto_generico_id`),
  ADD KEY `idx_almoxarifado` (`almoxarifado_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_grupo_id` (`grupo_id`);

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
-- Índices de tabela `calendario`
--
ALTER TABLE `calendario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_data` (`data`),
  ADD KEY `idx_ano_mes` (`ano`,`mes`),
  ADD KEY `idx_semana_ano` (`semana_ano`,`semana_numero`),
  ADD KEY `idx_dia_semana` (`dia_semana_numero`),
  ADD KEY `idx_mes_referencia` (`mes_referencia_ano`,`mes_referencia_numero`);

--
-- Índices de tabela `calendario_dias_nao_uteis`
--
ALTER TABLE `calendario_dias_nao_uteis`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_calendario_dia_destino` (`data`,`tipo_destino`,`filial_id`,`unidade_escolar_id`);

--
-- Índices de tabela `centro_custo`
--
ALTER TABLE `centro_custo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_filial_id` (`filial_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_codigo` (`codigo`);

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
  ADD KEY `idx_intolerancia` (`intolerancia_id`),
  ADD KEY `idx_efetivos_periodo` (`periodo_refeicao_id`);

--
-- Índices de tabela `entregas_agendadas`
--
ALTER TABLE `entregas_agendadas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_agrupamento_data` (`agrupamento_id`,`data_entrega`),
  ADD KEY `idx_data` (`data_entrega`),
  ADD KEY `idx_status` (`status`);

--
-- Índices de tabela `failed_login_attempts`
--
ALTER TABLE `failed_login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_hash` (`email_hash`);

--
-- Índices de tabela `faturamento`
--
ALTER TABLE `faturamento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_faturamento_periodo` (`unidade_escolar_id`,`mes`,`ano`),
  ADD KEY `idx_faturamento_unidade` (`unidade_escolar_id`),
  ADD KEY `idx_faturamento_periodo` (`mes`,`ano`),
  ADD KEY `idx_faturamento_criado_por` (`criado_por`),
  ADD KEY `idx_faturamento_atualizado_por` (`atualizado_por`);

--
-- Índices de tabela `faturamento_detalhes`
--
ALTER TABLE `faturamento_detalhes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_faturamento_dia` (`faturamento_id`,`dia`),
  ADD KEY `idx_faturamento_detalhes_faturamento` (`faturamento_id`),
  ADD KEY `idx_faturamento_detalhes_dia` (`dia`);

--
-- Índices de tabela `ficha_homologacao`
--
ALTER TABLE `ficha_homologacao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fornecedor_id` (`fornecedor_id`),
  ADD KEY `unidade_medida_id` (`unidade_medida_id`),
  ADD KEY `idx_data_analise` (`data_analise`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_avaliador_id` (`avaliador_id`),
  ADD KEY `idx_nome_generico_id` (`produto_generico_id`);

--
-- Índices de tabela `filiais`
--
ALTER TABLE `filiais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_filiais_codigo` (`codigo_filial`);

--
-- Índices de tabela `formas_pagamento`
--
ALTER TABLE `formas_pagamento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_criado_por` (`criado_por`);

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
-- Índices de tabela `grupos_nqa`
--
ALTER TABLE `grupos_nqa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `grupo_id` (`grupo_id`,`nqa_id`),
  ADD KEY `nqa_id` (`nqa_id`);

--
-- Índices de tabela `historico_periodicidade`
--
ALTER TABLE `historico_periodicidade`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_agrupamento` (`agrupamento_id`),
  ADD KEY `idx_escola` (`unidade_escolar_id`),
  ADD KEY `idx_data_aplicacao` (`data_aplicacao`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_historico_agrupamento_data` (`agrupamento_id`,`data_aplicacao`);

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
  ADD KEY `idx_motoristas_cnh_validade` (`cnh_validade`);

--
-- Índices de tabela `necessidades_cardapio`
--
ALTER TABLE `necessidades_cardapio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_interno` (`codigo_interno`),
  ADD KEY `idx_unidade_escolar` (`unidade_escolar_id`),
  ADD KEY `idx_filial` (`filial_id`),
  ADD KEY `idx_cardapio` (`cardapio_id`),
  ADD KEY `idx_receita` (`receita_id`),
  ADD KEY `idx_produto` (`produto_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_data` (`data`),
  ADD KEY `idx_criado_em` (`criado_em`);

--
-- Índices de tabela `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_chave_acesso` (`chave_acesso`),
  ADD KEY `idx_numero_nota` (`numero_nota`),
  ADD KEY `idx_fornecedor` (`fornecedor_id`),
  ADD KEY `idx_filial` (`filial_id`),
  ADD KEY `idx_data_emissao` (`data_emissao`),
  ADD KEY `idx_data_entrada` (`data_saida`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `fk_notas_fiscais_usuario_cadastro` (`usuario_cadastro_id`),
  ADD KEY `fk_notas_fiscais_usuario_lancamento` (`usuario_lancamento_id`),
  ADD KEY `idx_pedido_compra_id` (`pedido_compra_id`),
  ADD KEY `idx_rir_id` (`rir_id`),
  ADD KEY `idx_almoxarifado_id` (`almoxarifado_id`);

--
-- Índices de tabela `notas_fiscais_itens`
--
ALTER TABLE `notas_fiscais_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nota_fiscal` (`nota_fiscal_id`),
  ADD KEY `idx_produto` (`produto_generico_id`),
  ADD KEY `idx_numero_item` (`nota_fiscal_id`,`numero_item`),
  ADD KEY `idx_grupo_id` (`grupo_id`);

--
-- Índices de tabela `nqa`
--
ALTER TABLE `nqa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Índices de tabela `patrimonios`
--
ALTER TABLE `patrimonios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_patrimonio` (`numero_patrimonio`),
  ADD KEY `produto_id` (`produto_id`),
  ADD KEY `patrimonios_ibfk_2` (`local_origem_id`),
  ADD KEY `patrimonios_ibfk_3` (`local_atual_id`);

--
-- Índices de tabela `patrimonios_movimentacoes`
--
ALTER TABLE `patrimonios_movimentacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patrimonio_id` (`patrimonio_id`),
  ADD KEY `escola_origem_id` (`local_origem_id`),
  ADD KEY `escola_destino_id` (`local_destino_id`),
  ADD KEY `responsavel_id` (`responsavel_id`);

--
-- Índices de tabela `pdf_receitas`
--
ALTER TABLE `pdf_receitas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_pdf_receitas_hash` (`entry_hash`),
  ADD KEY `idx_pdf_receitas_upload` (`upload_id`);

--
-- Índices de tabela `pdf_templates`
--
ALTER TABLE `pdf_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tela_vinculada` (`tela_vinculada`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_padrao` (`padrao`),
  ADD KEY `criado_por` (`criado_por`),
  ADD KEY `atualizado_por` (`atualizado_por`);

--
-- Índices de tabela `pdf_uploads`
--
ALTER TABLE `pdf_uploads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_pdf_uploads_file_hash` (`file_hash`),
  ADD UNIQUE KEY `uniq_pdf_uploads_normalized_hash` (`normalized_hash`);

--
-- Índices de tabela `pedidos_compras`
--
ALTER TABLE `pedidos_compras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_pedido` (`numero_pedido`),
  ADD KEY `idx_numero_pedido` (`numero_pedido`),
  ADD KEY `idx_solicitacao_compras_id` (`solicitacao_compras_id`),
  ADD KEY `idx_fornecedor_id` (`fornecedor_id`),
  ADD KEY `idx_filial_id` (`filial_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_data_entrega_cd` (`data_entrega_cd`),
  ADD KEY `idx_criado_em` (`criado_em`),
  ADD KEY `criado_por` (`criado_por`),
  ADD KEY `idx_filial_entrega` (`filial_entrega_id`),
  ADD KEY `idx_filial_faturamento` (`filial_faturamento_id`),
  ADD KEY `idx_filial_cobranca` (`filial_cobranca_id`);

--
-- Índices de tabela `pedido_compras_itens`
--
ALTER TABLE `pedido_compras_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pedido_id` (`pedido_id`),
  ADD KEY `idx_produto_generico_id` (`produto_generico_id`),
  ADD KEY `idx_codigo_produto` (`codigo_produto`),
  ADD KEY `idx_solicitacao_item_id` (`solicitacao_item_id`),
  ADD KEY `unidade_medida_id` (`unidade_medida_id`);

--
-- Índices de tabela `periodos_refeicao`
--
ALTER TABLE `periodos_refeicao`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_nome` (`nome`),
  ADD KEY `idx_status` (`status`);

--
-- Índices de tabela `periodos_refeicao_filiais`
--
ALTER TABLE `periodos_refeicao_filiais`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_periodo_filial` (`periodo_refeicao_id`,`filial_id`),
  ADD KEY `idx_periodo_refeicao` (`periodo_refeicao_id`),
  ADD KEY `idx_filial` (`filial_id`);

--
-- Índices de tabela `prazos_pagamento`
--
ALTER TABLE `prazos_pagamento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_criado_por` (`criado_por`),
  ADD KEY `idx_parcelas` (`parcelas`);

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
-- Índices de tabela `produto_comercial`
--
ALTER TABLE `produto_comercial`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `unidade_medida_id` (`unidade_medida_id`),
  ADD KEY `usuario_criador_id` (`usuario_criador_id`),
  ADD KEY `usuario_atualizador_id` (`usuario_atualizador_id`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_nome_comercial` (`nome_comercial`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_grupo_id` (`grupo_id`),
  ADD KEY `idx_subgrupo_id` (`subgrupo_id`),
  ADD KEY `idx_classe_id` (`classe_id`);

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
-- Índices de tabela `receitas_processadas`
--
ALTER TABLE `receitas_processadas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_interno` (`codigo_interno`),
  ADD KEY `idx_codigo_interno` (`codigo_interno`),
  ADD KEY `idx_codigo_referencia` (`codigo_referencia`),
  ADD KEY `idx_nome` (`nome`),
  ADD KEY `idx_origem` (`origem`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_criado_em` (`criado_em`),
  ADD KEY `idx_criado_por` (`criado_por`);

--
-- Índices de tabela `relatorio_inspecao`
--
ALTER TABLE `relatorio_inspecao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_data` (`data_inspecao`),
  ADD KEY `idx_nf` (`numero_nota_fiscal`),
  ADD KEY `idx_fornecedor` (`fornecedor`),
  ADD KEY `idx_status` (`resultado_geral`),
  ADD KEY `idx_usuario_cadastro` (`usuario_cadastro_id`);

--
-- Índices de tabela `relatorio_inspecao_produtos`
--
ALTER TABLE `relatorio_inspecao_produtos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_relatorio_inspecao_id` (`relatorio_inspecao_id`),
  ADD KEY `idx_pedido_item_id` (`pedido_item_id`),
  ADD KEY `idx_grupo_id` (`grupo_id`),
  ADD KEY `idx_nqa_id` (`nqa_id`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_resultado_final` (`resultado_final`);

--
-- Índices de tabela `rotas`
--
ALTER TABLE `rotas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_filial_id` (`filial_id`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tipo_rota` (`frequencia_entrega`),
  ADD KEY `idx_tipo_rota_id` (`tipo_rota_id`);

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
-- Índices de tabela `rotas_nutricionistas_escolas`
--
ALTER TABLE `rotas_nutricionistas_escolas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rota_escola` (`rota_nutricionista_id`,`unidade_escolar_id`),
  ADD KEY `idx_rota_nutricionista_id` (`rota_nutricionista_id`),
  ADD KEY `idx_unidade_escolar_id` (`unidade_escolar_id`);

--
-- Índices de tabela `solicitacao_compras_itens`
--
ALTER TABLE `solicitacao_compras_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_solicitacao_id` (`solicitacao_id`),
  ADD KEY `idx_produto_id` (`produto_id`),
  ADD KEY `unidade_medida_id` (`unidade_medida_id`);

--
-- Índices de tabela `solicitacoes_compras`
--
ALTER TABLE `solicitacoes_compras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_solicitacao` (`numero_solicitacao`),
  ADD KEY `idx_numero_solicitacao` (`numero_solicitacao`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_filial_id` (`filial_id`),
  ADD KEY `criado_por` (`criado_por`),
  ADD KEY `idx_usuario_id` (`usuario_id`);

--
-- Índices de tabela `subgrupos`
--
ALTER TABLE `subgrupos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_nome` (`nome`),
  ADD UNIQUE KEY `uk_codigo` (`codigo`),
  ADD KEY `fk_subgrupos_grupo` (`grupo_id`);

--
-- Índices de tabela `tabela_amostragem`
--
ALTER TABLE `tabela_amostragem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nqa_id` (`nqa_id`);

--
-- Índices de tabela `tipos_cardapio`
--
ALTER TABLE `tipos_cardapio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_nome` (`nome`),
  ADD KEY `idx_status` (`status`);

--
-- Índices de tabela `tipos_cardapio_filiais`
--
ALTER TABLE `tipos_cardapio_filiais`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tipo_filial` (`tipo_cardapio_id`,`filial_id`),
  ADD KEY `idx_tipo_cardapio` (`tipo_cardapio_id`),
  ADD KEY `idx_filial` (`filial_id`);

--
-- Índices de tabela `tipos_periodicidade`
--
ALTER TABLE `tipos_periodicidade`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_nome` (`nome`),
  ADD KEY `idx_ativo` (`ativo`);

--
-- Índices de tabela `tipo_rota`
--
ALTER TABLE `tipo_rota`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_filial_id` (`filial_id`),
  ADD KEY `idx_grupo_id` (`grupo_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tipo_rota_filial_grupo` (`filial_id`,`grupo_id`),
  ADD KEY `idx_tipo_rota_status_filial` (`status`,`filial_id`);

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
  ADD KEY `idx_rota_nutricionista_id` (`rota_nutricionista_id`),
  ADD KEY `idx_tipo_rota_id` (`tipo_rota_id`),
  ADD KEY `idx_almoxarifado_id` (`almoxarifado_id`);

--
-- Índices de tabela `unidades_escolares_periodos_refeicao`
--
ALTER TABLE `unidades_escolares_periodos_refeicao`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_unidade_periodo` (`unidade_escolar_id`,`periodo_refeicao_id`),
  ADD KEY `idx_unidade_escolar` (`unidade_escolar_id`),
  ADD KEY `idx_periodo_refeicao` (`periodo_refeicao_id`),
  ADD KEY `idx_unidade_periodo_quantidades` (`unidade_escolar_id`,`periodo_refeicao_id`,`quantidade_efetivos_padrao`,`quantidade_efetivos_nae`);

--
-- Índices de tabela `unidades_escolares_rotas`
--
ALTER TABLE `unidades_escolares_rotas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ue_rota` (`unidade_escolar_id`,`rota_id`),
  ADD KEY `idx_rota_id` (`rota_id`),
  ADD KEY `idx_unidade_escolar_id` (`unidade_escolar_id`);

--
-- Índices de tabela `unidades_escolares_tipos_cardapio`
--
ALTER TABLE `unidades_escolares_tipos_cardapio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_unidade_tipo` (`unidade_escolar_id`,`tipo_cardapio_id`),
  ADD KEY `idx_unidade_escolar` (`unidade_escolar_id`),
  ADD KEY `idx_tipo_cardapio` (`tipo_cardapio_id`),
  ADD KEY `idx_status` (`status`);

--
-- Índices de tabela `unidades_medida`
--
ALTER TABLE `unidades_medida`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT de tabela `agrupamentos_escolas`
--
ALTER TABLE `agrupamentos_escolas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `agrupamentos_periodicidade`
--
ALTER TABLE `agrupamentos_periodicidade`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `agrupamentos_produtos`
--
ALTER TABLE `agrupamentos_produtos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `ajudantes`
--
ALTER TABLE `ajudantes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `almoxarifado`
--
ALTER TABLE `almoxarifado`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `almoxarifado_estoque`
--
ALTER TABLE `almoxarifado_estoque`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `auditoria_acoes`
--
ALTER TABLE `auditoria_acoes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `calendario`
--
ALTER TABLE `calendario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `calendario_dias_nao_uteis`
--
ALTER TABLE `calendario_dias_nao_uteis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `centro_custo`
--
ALTER TABLE `centro_custo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `efetivos`
--
ALTER TABLE `efetivos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `entregas_agendadas`
--
ALTER TABLE `entregas_agendadas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `failed_login_attempts`
--
ALTER TABLE `failed_login_attempts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `faturamento`
--
ALTER TABLE `faturamento`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `faturamento_detalhes`
--
ALTER TABLE `faturamento_detalhes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `ficha_homologacao`
--
ALTER TABLE `ficha_homologacao`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `filiais`
--
ALTER TABLE `filiais`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `formas_pagamento`
--
ALTER TABLE `formas_pagamento`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `grupos_nqa`
--
ALTER TABLE `grupos_nqa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `historico_periodicidade`
--
ALTER TABLE `historico_periodicidade`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `intolerancias`
--
ALTER TABLE `intolerancias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `marcas`
--
ALTER TABLE `marcas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `necessidades_cardapio`
--
ALTER TABLE `necessidades_cardapio`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `notas_fiscais_itens`
--
ALTER TABLE `notas_fiscais_itens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `nqa`
--
ALTER TABLE `nqa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT de tabela `pdf_receitas`
--
ALTER TABLE `pdf_receitas`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pdf_templates`
--
ALTER TABLE `pdf_templates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pdf_uploads`
--
ALTER TABLE `pdf_uploads`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pedidos_compras`
--
ALTER TABLE `pedidos_compras`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pedido_compras_itens`
--
ALTER TABLE `pedido_compras_itens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `periodos_refeicao`
--
ALTER TABLE `periodos_refeicao`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `periodos_refeicao_filiais`
--
ALTER TABLE `periodos_refeicao_filiais`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `prazos_pagamento`
--
ALTER TABLE `prazos_pagamento`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produto_comercial`
--
ALTER TABLE `produto_comercial`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produto_generico`
--
ALTER TABLE `produto_generico`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produto_origem`
--
ALTER TABLE `produto_origem`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `receitas_processadas`
--
ALTER TABLE `receitas_processadas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `relatorio_inspecao`
--
ALTER TABLE `relatorio_inspecao`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `relatorio_inspecao_produtos`
--
ALTER TABLE `relatorio_inspecao_produtos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `rotas`
--
ALTER TABLE `rotas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `rotas_nutricionistas`
--
ALTER TABLE `rotas_nutricionistas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `rotas_nutricionistas_escolas`
--
ALTER TABLE `rotas_nutricionistas_escolas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `solicitacao_compras_itens`
--
ALTER TABLE `solicitacao_compras_itens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `solicitacoes_compras`
--
ALTER TABLE `solicitacoes_compras`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `subgrupos`
--
ALTER TABLE `subgrupos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tabela_amostragem`
--
ALTER TABLE `tabela_amostragem`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tipos_cardapio`
--
ALTER TABLE `tipos_cardapio`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tipos_cardapio_filiais`
--
ALTER TABLE `tipos_cardapio_filiais`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tipos_periodicidade`
--
ALTER TABLE `tipos_periodicidade`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tipo_rota`
--
ALTER TABLE `tipo_rota`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `unidades_escolares`
--
ALTER TABLE `unidades_escolares`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `unidades_escolares_periodos_refeicao`
--
ALTER TABLE `unidades_escolares_periodos_refeicao`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `unidades_escolares_rotas`
--
ALTER TABLE `unidades_escolares_rotas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `unidades_escolares_tipos_cardapio`
--
ALTER TABLE `unidades_escolares_tipos_cardapio`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `unidades_medida`
--
ALTER TABLE `unidades_medida`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agrupamentos_escolas`
--
ALTER TABLE `agrupamentos_escolas`
  ADD CONSTRAINT `fk_agrupamentos_escolas_agrupamento` FOREIGN KEY (`agrupamento_id`) REFERENCES `agrupamentos_periodicidade` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_agrupamentos_escolas_escola` FOREIGN KEY (`unidade_escolar_id`) REFERENCES `unidades_escolares` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `agrupamentos_periodicidade`
--
ALTER TABLE `agrupamentos_periodicidade`
  ADD CONSTRAINT `fk_agrupamentos_tipo` FOREIGN KEY (`tipo_id`) REFERENCES `tipos_periodicidade` (`id`) ON DELETE RESTRICT;

--
-- Restrições para tabelas `agrupamentos_produtos`
--
ALTER TABLE `agrupamentos_produtos`
  ADD CONSTRAINT `fk_agrupamentos_produtos_agrupamento` FOREIGN KEY (`agrupamento_id`) REFERENCES `agrupamentos_periodicidade` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_agrupamentos_produtos_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `almoxarifado`
--
ALTER TABLE `almoxarifado`
  ADD CONSTRAINT `fk_almoxarifado_centro_custo` FOREIGN KEY (`centro_custo_id`) REFERENCES `centro_custo` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_almoxarifado_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `almoxarifado_estoque`
--
ALTER TABLE `almoxarifado_estoque`
  ADD CONSTRAINT `almoxarifado_estoque_ibfk_1` FOREIGN KEY (`almoxarifado_id`) REFERENCES `almoxarifado` (`id`),
  ADD CONSTRAINT `almoxarifado_estoque_ibfk_2` FOREIGN KEY (`produto_generico_id`) REFERENCES `produto_generico` (`id`);

--
-- Restrições para tabelas `auditoria_acoes`
--
ALTER TABLE `auditoria_acoes`
  ADD CONSTRAINT `auditoria_acoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `centro_custo`
--
ALTER TABLE `centro_custo`
  ADD CONSTRAINT `fk_centro_custo_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `efetivos`
--
ALTER TABLE `efetivos`
  ADD CONSTRAINT `efetivos_ibfk_1` FOREIGN KEY (`unidade_escolar_id`) REFERENCES `unidades_escolares` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `efetivos_ibfk_2` FOREIGN KEY (`intolerancia_id`) REFERENCES `intolerancias` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_efetivos_periodo` FOREIGN KEY (`periodo_refeicao_id`) REFERENCES `periodos_refeicao` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `entregas_agendadas`
--
ALTER TABLE `entregas_agendadas`
  ADD CONSTRAINT `entregas_agendadas_ibfk_1` FOREIGN KEY (`agrupamento_id`) REFERENCES `agrupamentos_periodicidade` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `faturamento`
--
ALTER TABLE `faturamento`
  ADD CONSTRAINT `fk_faturamento_atualizado_por` FOREIGN KEY (`atualizado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_faturamento_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_faturamento_unidade_escolar` FOREIGN KEY (`unidade_escolar_id`) REFERENCES `unidades_escolares` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `faturamento_detalhes`
--
ALTER TABLE `faturamento_detalhes`
  ADD CONSTRAINT `fk_faturamento_detalhes_faturamento` FOREIGN KEY (`faturamento_id`) REFERENCES `faturamento` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `grupos_nqa`
--
ALTER TABLE `grupos_nqa`
  ADD CONSTRAINT `grupos_nqa_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grupos_nqa_ibfk_2` FOREIGN KEY (`nqa_id`) REFERENCES `nqa` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `historico_periodicidade`
--
ALTER TABLE `historico_periodicidade`
  ADD CONSTRAINT `fk_historico_agrupamento` FOREIGN KEY (`agrupamento_id`) REFERENCES `agrupamentos_periodicidade` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_historico_escola` FOREIGN KEY (`unidade_escolar_id`) REFERENCES `unidades_escolares` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  ADD CONSTRAINT `fk_notas_fiscais_almoxarifado` FOREIGN KEY (`almoxarifado_id`) REFERENCES `almoxarifado` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Restrições para tabelas `pdf_receitas`
--
ALTER TABLE `pdf_receitas`
  ADD CONSTRAINT `pdf_receitas_ibfk_1` FOREIGN KEY (`upload_id`) REFERENCES `pdf_uploads` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `pdf_templates`
--
ALTER TABLE `pdf_templates`
  ADD CONSTRAINT `pdf_templates_ibfk_1` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pdf_templates_ibfk_2` FOREIGN KEY (`atualizado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `periodos_refeicao_filiais`
--
ALTER TABLE `periodos_refeicao_filiais`
  ADD CONSTRAINT `fk_periodos_refeicao_filiais_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_periodos_refeicao_filiais_periodo` FOREIGN KEY (`periodo_refeicao_id`) REFERENCES `periodos_refeicao` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `fk_produtos_origem` FOREIGN KEY (`produto_origem_id`) REFERENCES `produto_origem` (`id`),
  ADD CONSTRAINT `fk_produtos_unid_sec` FOREIGN KEY (`embalagem_secundaria_id`) REFERENCES `unidades_medida` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `produto_comercial`
--
ALTER TABLE `produto_comercial`
  ADD CONSTRAINT `produto_comercial_ibfk_1` FOREIGN KEY (`unidade_medida_id`) REFERENCES `unidades_medida` (`id`),
  ADD CONSTRAINT `produto_comercial_ibfk_2` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`),
  ADD CONSTRAINT `produto_comercial_ibfk_3` FOREIGN KEY (`subgrupo_id`) REFERENCES `subgrupos` (`id`),
  ADD CONSTRAINT `produto_comercial_ibfk_4` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`),
  ADD CONSTRAINT `produto_comercial_ibfk_5` FOREIGN KEY (`usuario_criador_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `produto_comercial_ibfk_6` FOREIGN KEY (`usuario_atualizador_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `rotas`
--
ALTER TABLE `rotas`
  ADD CONSTRAINT `fk_rotas_tipo_rota` FOREIGN KEY (`tipo_rota_id`) REFERENCES `tipo_rota` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `rotas_nutricionistas`
--
ALTER TABLE `rotas_nutricionistas`
  ADD CONSTRAINT `fk_rotas_nutricionistas_coordenador` FOREIGN KEY (`coordenador_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rotas_nutricionistas_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rotas_nutricionistas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `rotas_nutricionistas_escolas`
--
ALTER TABLE `rotas_nutricionistas_escolas`
  ADD CONSTRAINT `rotas_nutricionistas_escolas_ibfk_1` FOREIGN KEY (`rota_nutricionista_id`) REFERENCES `rotas_nutricionistas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rotas_nutricionistas_escolas_ibfk_2` FOREIGN KEY (`unidade_escolar_id`) REFERENCES `unidades_escolares` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `solicitacao_compras_itens`
--
ALTER TABLE `solicitacao_compras_itens`
  ADD CONSTRAINT `solicitacao_compras_itens_ibfk_1` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacoes_compras` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `solicitacao_compras_itens_ibfk_2` FOREIGN KEY (`unidade_medida_id`) REFERENCES `unidades_medida` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `solicitacoes_compras`
--
ALTER TABLE `solicitacoes_compras`
  ADD CONSTRAINT `solicitacoes_compras_ibfk_1` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `solicitacoes_compras_ibfk_2` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `subgrupos`
--
ALTER TABLE `subgrupos`
  ADD CONSTRAINT `fk_subgrupos_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `tabela_amostragem`
--
ALTER TABLE `tabela_amostragem`
  ADD CONSTRAINT `tabela_amostragem_ibfk_1` FOREIGN KEY (`nqa_id`) REFERENCES `nqa` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `tipos_cardapio_filiais`
--
ALTER TABLE `tipos_cardapio_filiais`
  ADD CONSTRAINT `fk_tipos_cardapio_filiais_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tipos_cardapio_filiais_tipo` FOREIGN KEY (`tipo_cardapio_id`) REFERENCES `tipos_cardapio` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `tipo_rota`
--
ALTER TABLE `tipo_rota`
  ADD CONSTRAINT `fk_tipo_rota_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `unidades_escolares`
--
ALTER TABLE `unidades_escolares`
  ADD CONSTRAINT `fk_unidade_escolar_almoxarifado` FOREIGN KEY (`almoxarifado_id`) REFERENCES `almoxarifado` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_unidades_escolares_rota_nutricionista` FOREIGN KEY (`rota_nutricionista_id`) REFERENCES `rotas_nutricionistas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_unidades_escolares_tipo_rota` FOREIGN KEY (`tipo_rota_id`) REFERENCES `tipo_rota` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `unidades_escolares_periodos_refeicao`
--
ALTER TABLE `unidades_escolares_periodos_refeicao`
  ADD CONSTRAINT `fk_unidades_escolares_periodos_refeicao_periodo` FOREIGN KEY (`periodo_refeicao_id`) REFERENCES `periodos_refeicao` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_unidades_escolares_periodos_refeicao_unidade` FOREIGN KEY (`unidade_escolar_id`) REFERENCES `unidades_escolares` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `unidades_escolares_rotas`
--
ALTER TABLE `unidades_escolares_rotas`
  ADD CONSTRAINT `unidades_escolares_rotas_ibfk_1` FOREIGN KEY (`unidade_escolar_id`) REFERENCES `unidades_escolares` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `unidades_escolares_rotas_ibfk_2` FOREIGN KEY (`rota_id`) REFERENCES `rotas` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `unidades_escolares_tipos_cardapio`
--
ALTER TABLE `unidades_escolares_tipos_cardapio`
  ADD CONSTRAINT `fk_unidades_tipos_cardapio_tipo` FOREIGN KEY (`tipo_cardapio_id`) REFERENCES `tipos_cardapio` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_unidades_tipos_cardapio_unidade` FOREIGN KEY (`unidade_escolar_id`) REFERENCES `unidades_escolares` (`id`) ON DELETE CASCADE;

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
