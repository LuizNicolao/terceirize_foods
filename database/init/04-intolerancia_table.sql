-- Script para criar a tabela de intolerância
-- Adicionar ao final do arquivo 02-foods_db.sql ou executar separadamente
-- Data: 2025-01-27
-- Descrição: Criação da tabela intolerancias para o sistema foods

-- --------------------------------------------------------

--
-- Estrutura para tabela `intolerancias`
--

CREATE TABLE `intolerancias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('ativo','inativo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'ativo',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabela `intolerancias`
--

ALTER TABLE `intolerancias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`);

--
-- AUTO_INCREMENT para tabela `intolerancias`
--

ALTER TABLE `intolerancias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Inserir alguns dados de exemplo
--

INSERT INTO `intolerancias` (`nome`, `status`) VALUES
('Lactose', 'ativo'),
('Glúten', 'ativo'),
('Ovos', 'ativo'),
('Amendoim', 'ativo'),
('Soja', 'ativo'),
('Frutos do mar', 'ativo'),
('Peixe', 'ativo'),
('Nozes', 'ativo'),
('Castanhas', 'ativo'),
('Sulfitos', 'ativo');

-- --------------------------------------------------------
-- Fim do script de criação da tabela intolerancias
-- --------------------------------------------------------
