-- Migração: Adicionar colunas status e observacoes na tabela necessidades
-- Data: 2024-12-19
-- Descrição: Adiciona colunas status e observacoes para controlar o fluxo de aprovação das necessidades

USE implantacao_db;

-- Adicionar coluna status na tabela necessidades
ALTER TABLE necessidades 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'NEC NUTRI' 
COMMENT 'Status da necessidade: NEC NUTRI (criada pela nutricionista), APROVADA (aprovada pela coordenação), etc.';

-- Adicionar coluna observacoes na tabela necessidades
ALTER TABLE necessidades 
ADD COLUMN observacoes TEXT 
COMMENT 'Observações sobre a análise e aprovação da necessidade';

-- Criar índice para melhorar performance das consultas por status
CREATE INDEX idx_necessidades_status ON necessidades(status);

-- Atualizar registros existentes para ter o status padrão
UPDATE necessidades 
SET status = 'NEC NUTRI' 
WHERE status IS NULL OR status = '';
