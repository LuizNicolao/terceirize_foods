-- Adicionar campos de nome na tabela necessidades_padroes
-- Para melhorar performance e facilitar consultas

ALTER TABLE necessidades_padroes 
ADD COLUMN escola_nome VARCHAR(255) AFTER escola_id,
ADD COLUMN grupo_nome VARCHAR(255) AFTER grupo_id,
ADD COLUMN produto_nome VARCHAR(255) AFTER produto_id,
ADD COLUMN unidade_medida_sigla VARCHAR(10) AFTER produto_nome;

-- Adicionar índices para os novos campos
CREATE INDEX idx_escola_nome ON necessidades_padroes(escola_nome);
CREATE INDEX idx_grupo_nome ON necessidades_padroes(grupo_nome);
CREATE INDEX idx_produto_nome ON necessidades_padroes(produto_nome);

-- Atualizar registros existentes com os nomes
UPDATE necessidades_padroes np
LEFT JOIN foods_db.unidades_escolares e ON np.escola_id = e.id
LEFT JOIN foods_db.grupos g ON np.grupo_id = g.id
LEFT JOIN foods_db.produto_origem po ON np.produto_id = po.id
LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id
SET 
  np.escola_nome = e.nome_escola,
  np.grupo_nome = g.nome,
  np.produto_nome = po.nome,
  np.unidade_medida_sigla = um.sigla;
