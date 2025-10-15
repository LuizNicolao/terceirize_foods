-- ==============================================
-- ADICIONAR PERMISSÕES PARA REGISTROS DIÁRIOS
-- ==============================================

-- Adicionar permissões para usuário ID 4 (Admin)
INSERT INTO `permissoes_usuario` (`usuario_id`, `tela`, `pode_visualizar`, `pode_criar`, `pode_editar`, `pode_excluir`, `pode_movimentar`) 
VALUES (4, 'registros_diarios', 1, 1, 1, 1, 0);

-- Se houver outros usuários que precisam de permissões, adicione aqui:
-- INSERT INTO `permissoes_usuario` (`usuario_id`, `tela`, `pode_visualizar`, `pode_criar`, `pode_editar`, `pode_excluir`, `pode_movimentar`) 
-- VALUES (ID_DO_USUARIO, 'registros_diarios', 1, 1, 1, 1, 0);

-- ==============================================
-- VERIFICAR PERMISSÕES CRIADAS
-- ==============================================

SELECT 
  pu.id,
  pu.usuario_id,
  u.nome as usuario_nome,
  pu.tela,
  pu.pode_visualizar,
  pu.pode_criar,
  pu.pode_editar,
  pu.pode_excluir
FROM permissoes_usuario pu
INNER JOIN usuarios u ON pu.usuario_id = u.id
WHERE pu.tela = 'registros_diarios'
ORDER BY pu.usuario_id;

