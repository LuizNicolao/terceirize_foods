-- Migration: Alterar campo solicitante para usuario_id e usuario_nome
-- Data: 2024

-- Adicionar novos campos
ALTER TABLE `solicitacoes_compras`
  ADD COLUMN `usuario_id` INT DEFAULT NULL AFTER `criado_por`,
  ADD COLUMN `usuario_nome` VARCHAR(100) DEFAULT NULL AFTER `usuario_id`;

-- Criar índice para usuario_id
ALTER TABLE `solicitacoes_compras`
  ADD KEY `idx_usuario_id` (`usuario_id`);

-- Migrar dados existentes: copiar dados de criado_por para usuario_id e buscar nome do usuário
UPDATE `solicitacoes_compras` sc
LEFT JOIN `usuarios` u ON sc.criado_por = u.id
SET 
  sc.usuario_id = sc.criado_por,
  sc.usuario_nome = COALESCE(u.nome, sc.solicitante, 'Usuário')
WHERE sc.usuario_id IS NULL;

-- Remover campo antigo solicitante
ALTER TABLE `solicitacoes_compras`
  DROP COLUMN `solicitante`;

-- Adicionar foreign key para usuario_id (opcional, pode manter apenas índice)
-- ALTER TABLE `solicitacoes_compras`
--   ADD CONSTRAINT `solicitacoes_compras_ibfk_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

