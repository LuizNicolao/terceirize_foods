-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Tempo de geração: 05/11/2025 às 12:23
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

--
-- Despejando dados para a tabela `solicitacoes_compras`
--

INSERT INTO `solicitacoes_compras` (`id`, `numero_solicitacao`, `unidade`, `data_necessidade`, `observacoes`, `status`, `criado_por`, `usuario_id`, `usuario_nome`, `criado_em`, `atualizado_em`, `data_documento`, `justificativa`, `filial_id`, `data_entrega_cd`, `semana_abastecimento`) VALUES
(8, 'SC000001', 'CD VILA VELHA', '2025-11-04', NULL, 'aberto', 4, 4, 'Luiz Nicolao', '2025-11-04 22:44:19', '2025-11-04 22:44:19', '2025-11-04', 'Compra Programada', 10, '2025-11-04', '(10/11 a 14/11/25)'),
(9, 'SC000002', 'CD VILA VELHA', '2025-11-05', 'emergencial nutri', 'finalizado', 5, 5, 'Arlindo Borges', '2025-11-04 22:45:55', '2025-11-05 11:52:16', '2025-11-04', 'Compra Emergencial', 10, '2025-11-05', '(10/11 a 14/11/25)');

--
-- Índices para tabelas despejadas
--

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
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `solicitacoes_compras`
--
ALTER TABLE `solicitacoes_compras`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `solicitacoes_compras`
--
ALTER TABLE `solicitacoes_compras`
  ADD CONSTRAINT `solicitacoes_compras_ibfk_1` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `solicitacoes_compras_ibfk_2` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;




-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Tempo de geração: 05/11/2025 às 12:23
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

--
-- Despejando dados para a tabela `solicitacao_compras_itens`
--

INSERT INTO `solicitacao_compras_itens` (`id`, `solicitacao_id`, `produto_id`, `codigo_produto`, `nome_produto`, `unidade_medida_id`, `unidade_medida`, `quantidade`, `observacao`, `criado_em`) VALUES
(5, 8, 1, 'GEN-0001', 'AIPIM CONGELADO 1 KG', 25, 'PC', 12.000, NULL, '2025-11-04 22:44:19'),
(6, 8, 5, 'GEN-0005', 'BACON FATIADO 1 KG', 25, 'PC', 23.000, NULL, '2025-11-04 22:44:19'),
(8, 9, 6, 'GEN-0006', 'BIFE DE HAMBURGUER BOVINO 2 KG', 41, 'CX', 300.000, NULL, '2025-11-04 23:02:41'),
(9, 9, 1, 'GEN-0001', 'AIPIM CONGELADO 1 KG', 25, 'PC', 2.000, NULL, '2025-11-04 23:02:41');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `solicitacao_compras_itens`
--
ALTER TABLE `solicitacao_compras_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_solicitacao_id` (`solicitacao_id`),
  ADD KEY `idx_produto_id` (`produto_id`),
  ADD KEY `unidade_medida_id` (`unidade_medida_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `solicitacao_compras_itens`
--
ALTER TABLE `solicitacao_compras_itens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `solicitacao_compras_itens`
--
ALTER TABLE `solicitacao_compras_itens`
  ADD CONSTRAINT `solicitacao_compras_itens_ibfk_1` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacoes_compras` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `solicitacao_compras_itens_ibfk_2` FOREIGN KEY (`unidade_medida_id`) REFERENCES `unidades_medida` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;





<!-- Layout expandido (sem margens laterais) -->
<table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; font-family:Arial,Helvetica,sans-serif; font-size:13px; margin:0; width:100%">
	<tbody>
		<tr>
			<td style="text-align:center"><!-- Tabela Principal ocupando quase toda a largura -->
			<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin:10px auto; text-align:left; width:98%">
				<tbody><!-- Cabeçalho -->
					<tr>
						<td colspan="8" style="background-color:#f5f5f5; text-align:center">Visualizar Solicita&ccedil;&atilde;o de Compra</td>
					</tr>
					<!-- Linha 1: Número / Status / Entrega CD -->
					<tr>
						<td style="width:10%"><strong>N&uacute;mero:</strong></td>
						<td style="width:15%">{{numero_solicitacao}}</td>
						<td style="width:10%"><strong>Status:</strong></td>
						<td style="width:15%">{{status}}</td>
						<td style="width:10%"><strong>Entrega CD:</strong></td>
						<td style="width:15%">{{data_entrega_cd}}</td>
						<td style="width:10%"><strong>Cria&ccedil;&atilde;o:</strong></td>
						<td style="width:15%">{{data_criacao_completa}}</td>
					</tr>
					<!-- Linha 2: Totais -->
					<tr>
						<td><strong>Total Itens:</strong></td>
						<td>{{total_itens}}</td>
						<td><strong>Total Qtde:</strong></td>
						<td>{{total_quantidade}}</td>
						<td><strong>Valor Total:</strong></td>
						<td>{{valor_total}}</td>
						<td><strong>Semana Abast.:</strong></td>
						<td>{{semana_abastecimento}}</td>
					</tr>
					<!-- Linha 3: Filial -->
					<tr>
						<td colspan="8" style="background-color:#f5f5f5">Filial</td>
					</tr>
					<tr>
						<td><strong>Nome:</strong></td>
						<td>{{filial_nome}}</td>
						<td><strong>C&oacute;digo:</strong></td>
						<td>{{filial_codigo}}</td>
						<td><strong>Unidade:</strong></td>
						<td colspan="3">{{unidade}}</td>
					</tr>
					<!-- Linha 4: Justificativa -->
					<tr>
						<td colspan="8" style="background-color:#f5f5f5">Justificativa</td>
					</tr>
					<tr>
						<td colspan="8">{{justificativa}}</td>
					</tr>
					<!-- Linha 5: Produtos -->
					<tr>
						<td colspan="8" style="background-color:#f5f5f5">Produtos Solicitados ({{total_itens}})</td>
					</tr>
					<tr>
						<td colspan="8">{{#itens}} {{/itens}}
						<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; font-size:11px; text-align:center; width:100%">
							<thead>
								<tr>
									<td style="width:40px"><strong>#</strong></td>
									<td style="width:100px"><strong>C&Oacute;DIGO</strong></td>
									<td><strong>PRODUTO</strong></td>
									<td style="width:80px"><strong>UNIDADE</strong></td>
									<td style="width:110px"><strong>QTD. SOLICITADA</strong></td>
									<td style="width:110px"><strong>QTD. UTILIZADA</strong></td>
									<td style="width:110px"><strong>SALDO DISPON&Iacute;VEL</strong></td>
									<td style="width:90px"><strong>STATUS</strong></td>
									<td style="width:180px"><strong>PEDIDOS VINCULADOS</strong></td>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>{{id}}</td>
									<td>{{produto_codigo}}</td>
									<td style="text-align:left">{{produto_nome}}</td>
									<td>{{unidade}}</td>
									<td>{{quantidade_formatada}}</td>
									<td>{{quantidade_utilizada}}</td>
									<td>{{saldo_disponivel}}</td>
									<td>{{status}}</td>
									<td>{{pedidos_vinculados_lista}}</td>
								</tr>
							</tbody>
						</table>
						</td>
					</tr>
					<!-- Linha 6: Assinaturas -->
					<tr>
						<td colspan="4" style="text-align:center">
						<div>____________________________________</div>

						<div>{{usuario_nome}}</div>
						</td>
						<td colspan="4" style="text-align:center">
						<div>____________________________________</div>

						<div><strong>Assinatura / Aprova&ccedil;&atilde;o</strong></div>
						</td>
					</tr>
				</tbody>
			</table>
			</td>
		</tr>
	</tbody>
</table>
