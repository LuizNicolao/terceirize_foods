-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: terceirize_mysql:3306
-- Tempo de geração: 09/12/2025 às 19:48
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
-- Estrutura para tabela `media_escolas`
--

CREATE TABLE `media_escolas` (
  `id` int NOT NULL,
  `escola_id` int NOT NULL COMMENT 'ID da escola (relaciona com unidades_escolares do Foods)',
  `escola_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nutricionista_id` int NOT NULL COMMENT 'ID da nutricionista responsável',
  `media_lanche_manha` int NOT NULL DEFAULT '0',
  `media_parcial_manha` int NOT NULL DEFAULT '0',
  `media_almoco` int NOT NULL DEFAULT '0',
  `media_lanche_tarde` int NOT NULL DEFAULT '0',
  `media_parcial_tarde` int NOT NULL DEFAULT '0',
  `media_eja` int NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `calculada_automaticamente` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Se foi calculada automaticamente',
  `quantidade_lancamentos` int NOT NULL DEFAULT '0' COMMENT 'Quantidade de lançamentos usados no cálculo',
  `data_calculo` timestamp NULL DEFAULT NULL COMMENT 'Data do último cálculo automático',
  `ultima_atualizacao_registros` timestamp NULL DEFAULT NULL COMMENT 'Data da última atualização dos registros'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Médias calculadas automaticamente baseadas nos registros diários';

-- --------------------------------------------------------

--
-- Estrutura para tabela `necessidades`
--

CREATE TABLE `necessidades` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `usuario_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `escola_id` int NOT NULL,
  `escola` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `escola_rota` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_teknisa` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `produto_id` int NOT NULL,
  `produto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `produto_unidade` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ajuste` decimal(10,3) NOT NULL DEFAULT '0.000',
  `semana_consumo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semana_abastecimento` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_preenchimento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEC' COMMENT 'Status da necessidade: NEC (criada pela nutricionista), APROVADA (aprovada pela coordenação), etc.',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Observações sobre a análise e aprovação da necessidade',
  `necessidade_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID único para agrupar produtos da mesma necessidade',
  `ajuste_nutricionista` decimal(10,3) DEFAULT NULL COMMENT 'Ajuste feito pela nutricionista para a quantidade do produto',
  `ajuste_coordenacao` decimal(10,3) DEFAULT NULL COMMENT 'Ajuste feito pela coordenação para a quantidade da necessidade',
  `ajuste_conf_nutri` decimal(10,3) DEFAULT NULL COMMENT 'Valor ajustado confirmado pela nutricionista',
  `ajuste_conf_coord` decimal(10,3) DEFAULT NULL COMMENT 'Valor ajustado confirmado pela coordenação',
  `ajuste_anterior` decimal(10,3) DEFAULT NULL COMMENT 'Valor anterior do ajuste antes da última atualização',
  `substituicao_processada` tinyint(1) DEFAULT '0' COMMENT 'Indica se a necessidade já foi processada para substituição (0=não, 1=sim)',
  `grupo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Grupo do produto',
  `grupo_id` int DEFAULT NULL COMMENT 'ID do grupo do produto',
  `ajuste_logistica` decimal(10,3) DEFAULT NULL COMMENT 'Ajuste feito pela logística para a quantidade da necessidade',
  `total` decimal(10,3) DEFAULT NULL COMMENT 'Total calculado automaticamente (soma de todas as quantidades por período)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de necessidades de produtos com ajustes da nutricionista';

-- --------------------------------------------------------

--
-- Estrutura para tabela `necessidades_padroes`
--

CREATE TABLE `necessidades_padroes` (
  `id` int NOT NULL,
  `escola_id` int NOT NULL,
  `escola_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grupo_id` int NOT NULL,
  `grupo_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `produto_id` int NOT NULL,
  `produto_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unidade_medida_sigla` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantidade` decimal(10,3) NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `necessidades_substituicoes`
--

CREATE TABLE `necessidades_substituicoes` (
  `id` int NOT NULL,
  `necessidade_id` int NOT NULL COMMENT 'ID da linha na tabela necessidades (PK da necessidade específica, não necessidade_id do agrupamento)',
  `necessidade_id_grupo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID de agrupamento das necessidades (mesmo id usado para agrupar por escola/período)',
  `produto_origem_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID/código do produto origem solicitado',
  `produto_origem_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do produto origem',
  `produto_origem_unidade` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unidade de medida do produto origem',
  `produto_generico_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID do produto genérico (do Foods)',
  `produto_generico_codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código do produto genérico',
  `produto_generico_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome do produto genérico',
  `produto_generico_unidade` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unidade de medida do produto genérico',
  `quantidade_origem` decimal(10,3) NOT NULL DEFAULT '0.000' COMMENT 'Quantidade do produto origem',
  `quantidade_generico` decimal(10,3) NOT NULL DEFAULT '0.000' COMMENT 'Quantidade do produto genérico (convertida se necessário)',
  `escola_id` int NOT NULL COMMENT 'ID da escola',
  `escola_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nome da escola',
  `semana_abastecimento` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Semana de abastecimento',
  `semana_consumo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Semana de consumo',
  `status` enum('impressao','conf','conf log','EXCLUÍDO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'conf',
  `numero_romaneio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_criador_id` int DEFAULT NULL COMMENT 'ID do usuário que criou a substituição',
  `usuario_aprovador_id` int DEFAULT NULL COMMENT 'ID do usuário que aprovou a substituição',
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  `data_aprovacao` datetime DEFAULT NULL COMMENT 'Data de aprovação',
  `data_atualizacao` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Observações sobre a substituição',
  `ativo` tinyint(1) DEFAULT '1' COMMENT 'Indica se o registro está ativo',
  `grupo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Grupo do produto origem',
  `grupo_id` int DEFAULT NULL COMMENT 'ID do grupo do produto origem',
  `produto_trocado_id` int DEFAULT NULL,
  `produto_trocado_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `produto_trocado_unidade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de substituições de produtos em necessidades por produtos genéricos';

-- --------------------------------------------------------

--
-- Estrutura para tabela `permissoes_usuario`
--

CREATE TABLE `permissoes_usuario` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `tela` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `pode_visualizar` tinyint(1) DEFAULT '0',
  `pode_criar` tinyint(1) DEFAULT '0',
  `pode_editar` tinyint(1) DEFAULT '0',
  `pode_excluir` tinyint(1) DEFAULT '0',
  `pode_movimentar` tinyint(1) DEFAULT '0',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos_per_capita`
--

CREATE TABLE `produtos_per_capita` (
  `id` int NOT NULL,
  `produto_id` int NOT NULL COMMENT 'Referência para a tabela produtos',
  `per_capita_parcial_manha` decimal(10,3) NOT NULL DEFAULT '0.000' COMMENT 'Per capita para parcial da manhã',
  `per_capita_parcial_tarde` decimal(10,3) NOT NULL DEFAULT '0.000' COMMENT 'Per capita para parcial da tarde',
  `per_capita_lanche_manha` decimal(10,3) DEFAULT '0.000',
  `per_capita_lanche_tarde` decimal(10,3) DEFAULT '0.000',
  `per_capita_almoco` decimal(10,3) DEFAULT '0.000',
  `per_capita_eja` decimal(10,3) DEFAULT '0.000',
  `descricao` text,
  `ativo` tinyint(1) DEFAULT '1',
  `data_cadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `produto_origem_id` int DEFAULT NULL,
  `produto_nome` varchar(255) DEFAULT NULL,
  `produto_codigo` varchar(50) DEFAULT NULL,
  `unidade_medida` varchar(100) DEFAULT NULL,
  `grupo` varchar(100) DEFAULT NULL,
  `subgrupo` varchar(100) DEFAULT NULL,
  `classe` varchar(100) DEFAULT NULL,
  `grupo_id` int DEFAULT NULL COMMENT 'ID do grupo do produto'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabela de per capita por produto e período';

-- --------------------------------------------------------

--
-- Estrutura para tabela `recebimentos_escolas`
--

CREATE TABLE `recebimentos_escolas` (
  `id` int NOT NULL,
  `escola_id` int NOT NULL,
  `escola_nome` varchar(255) DEFAULT NULL,
  `escola_rota` varchar(100) DEFAULT NULL,
  `escola_cidade` varchar(100) DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `data_recebimento` date NOT NULL,
  `tipo_recebimento` enum('Completo','Parcial') NOT NULL,
  `tipo_entrega` enum('HORTI','PAO','PERECIVEL','BASE SECA','LIMPEZA') NOT NULL,
  `status_entrega` enum('No Prazo','Atrasado','Antecipado') NOT NULL DEFAULT 'No Prazo' COMMENT 'Status baseado na data de recebimento vs data esperada para o tipo de entrega',
  `pendencia_anterior` enum('Sim','Não') NOT NULL,
  `precisa_reentrega` enum('Sim','Não') DEFAULT NULL,
  `observacoes` text,
  `ativo` tinyint(1) DEFAULT '1',
  `data_cadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `recebimentos_produtos`
--

CREATE TABLE `recebimentos_produtos` (
  `id` int NOT NULL,
  `recebimento_id` int NOT NULL,
  `produto_id` int NOT NULL,
  `produto_nome` varchar(255) DEFAULT NULL,
  `produto_unidade_medida` varchar(50) DEFAULT NULL,
  `produto_tipo` enum('Horti','Pao','Pereciveis','Base Seca','Limpeza') DEFAULT NULL,
  `quantidade` decimal(10,3) NOT NULL,
  `precisa_reentrega` enum('Sim','Não') DEFAULT 'Não',
  `data_cadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `registros_diarios`
--

CREATE TABLE `registros_diarios` (
  `id` int NOT NULL,
  `escola_id` int NOT NULL COMMENT 'ID da escola (relaciona com unidades_escolares do Foods)',
  `escola_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nutricionista_id` int NOT NULL COMMENT 'ID da nutricionista responsável',
  `data` date NOT NULL COMMENT 'Data do registro (dia específico)',
  `tipo_refeicao` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `valor` int NOT NULL DEFAULT '0' COMMENT 'Quantidade de refeições servidas',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Registros diários de quantidade de refeições servidas por escola';

--
-- Acionadores `registros_diarios`
--
DELIMITER $$
CREATE TRIGGER `after_registro_delete` AFTER DELETE ON `registros_diarios` FOR EACH ROW BEGIN
  CALL recalcular_media_escola(OLD.escola_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_registro_insert` AFTER INSERT ON `registros_diarios` FOR EACH ROW BEGIN
  CALL recalcular_media_escola(NEW.escola_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_registro_update` AFTER UPDATE ON `registros_diarios` FOR EACH ROW BEGIN
  CALL recalcular_media_escola(NEW.escola_id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tipos_atendimento_escola`
--

CREATE TABLE `tipos_atendimento_escola` (
  `id` int NOT NULL,
  `escola_id` int NOT NULL COMMENT 'ID da escola',
  `tipos_atendimento` json NOT NULL,
  `ativo` tinyint(1) DEFAULT '1' COMMENT 'Status: 1 = ativo, 0 = inativo',
  `criado_por` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_por` int DEFAULT NULL,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Índices de tabela `media_escolas`
--
ALTER TABLE `media_escolas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_escola` (`escola_id`),
  ADD KEY `idx_nutricionista` (`nutricionista_id`),
  ADD KEY `idx_escola` (`escola_id`),
  ADD KEY `idx_escola_nome` (`escola_nome`);

--
-- Índices de tabela `necessidades`
--
ALTER TABLE `necessidades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_necessidade_unica` (`usuario_id`,`escola_id`,`produto_id`,`semana_consumo`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_escola_id` (`escola_id`),
  ADD KEY `idx_produto_id` (`produto_id`),
  ADD KEY `idx_semana_consumo` (`semana_consumo`),
  ADD KEY `idx_semana_abastecimento` (`semana_abastecimento`),
  ADD KEY `idx_necessidades_status` (`status`),
  ADD KEY `idx_necessidades_necessidade_id` (`necessidade_id`),
  ADD KEY `idx_necessidades_ajuste_nutricionista` (`ajuste_nutricionista`),
  ADD KEY `idx_necessidades_substituicao_processada` (`substituicao_processada`),
  ADD KEY `idx_necessidades_grupo` (`grupo`),
  ADD KEY `idx_necessidades_grupo_id` (`grupo_id`),
  ADD KEY `idx_necessidades_total` (`total`);

--
-- Índices de tabela `necessidades_padroes`
--
ALTER TABLE `necessidades_padroes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_escola_grupo_produto` (`escola_id`,`grupo_id`,`produto_id`),
  ADD KEY `idx_escola_id` (`escola_id`),
  ADD KEY `idx_grupo_id` (`grupo_id`),
  ADD KEY `idx_produto_id` (`produto_id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_escola_nome` (`escola_nome`),
  ADD KEY `idx_grupo_nome` (`grupo_nome`),
  ADD KEY `idx_produto_nome` (`produto_nome`);

--
-- Índices de tabela `necessidades_substituicoes`
--
ALTER TABLE `necessidades_substituicoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_necessidade_id` (`necessidade_id`),
  ADD KEY `idx_necessidade_id_grupo` (`necessidade_id_grupo`),
  ADD KEY `idx_produto_origem_id` (`produto_origem_id`),
  ADD KEY `idx_produto_generico_id` (`produto_generico_id`),
  ADD KEY `idx_escola_id` (`escola_id`),
  ADD KEY `idx_semana_abastecimento` (`semana_abastecimento`),
  ADD KEY `idx_semana_consumo` (`semana_consumo`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_data_criacao` (`data_criacao`),
  ADD KEY `idx_busca_principal` (`escola_id`,`semana_abastecimento`,`status`,`ativo`),
  ADD KEY `idx_produto_generico_status` (`produto_generico_id`,`status`),
  ADD KEY `idx_periodo` (`semana_abastecimento`,`semana_consumo`,`status`),
  ADD KEY `idx_necessidades_substituicoes_grupo` (`grupo`),
  ADD KEY `idx_necessidades_substituicoes_grupo_id` (`grupo_id`);

--
-- Índices de tabela `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `tela` (`tela`);

--
-- Índices de tabela `produtos_per_capita`
--
ALTER TABLE `produtos_per_capita`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_produto_id` (`produto_id`),
  ADD KEY `idx_ativo` (`ativo`),
  ADD KEY `idx_produto_id` (`produto_id`),
  ADD KEY `idx_produtos_per_capita_grupo_id` (`grupo_id`);

--
-- Índices de tabela `recebimentos_escolas`
--
ALTER TABLE `recebimentos_escolas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_escola_data` (`escola_id`,`data_recebimento`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_tipo_entrega` (`tipo_entrega`),
  ADD KEY `idx_status_entrega` (`status_entrega`);

--
-- Índices de tabela `recebimentos_produtos`
--
ALTER TABLE `recebimentos_produtos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_recebimento_produto` (`recebimento_id`,`produto_id`),
  ADD KEY `idx_recebimento` (`recebimento_id`),
  ADD KEY `idx_produto` (`produto_id`);

--
-- Índices de tabela `registros_diarios`
--
ALTER TABLE `registros_diarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_registro` (`escola_id`,`data`,`tipo_refeicao`),
  ADD KEY `idx_escola_data` (`escola_id`,`data`),
  ADD KEY `idx_nutricionista` (`nutricionista_id`),
  ADD KEY `idx_data` (`data`),
  ADD KEY `idx_escola` (`escola_id`),
  ADD KEY `idx_escola_nome` (`escola_nome`);

--
-- Índices de tabela `tipos_atendimento_escola`
--
ALTER TABLE `tipos_atendimento_escola`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_escola` (`escola_id`),
  ADD KEY `idx_escola_id` (`escola_id`),
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
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `calendario`
--
ALTER TABLE `calendario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `media_escolas`
--
ALTER TABLE `media_escolas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `necessidades`
--
ALTER TABLE `necessidades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `necessidades_padroes`
--
ALTER TABLE `necessidades_padroes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `necessidades_substituicoes`
--
ALTER TABLE `necessidades_substituicoes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `permissoes_usuario`
--
ALTER TABLE `permissoes_usuario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produtos_per_capita`
--
ALTER TABLE `produtos_per_capita`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `recebimentos_escolas`
--
ALTER TABLE `recebimentos_escolas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `recebimentos_produtos`
--
ALTER TABLE `recebimentos_produtos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `registros_diarios`
--
ALTER TABLE `registros_diarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tipos_atendimento_escola`
--
ALTER TABLE `tipos_atendimento_escola`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
