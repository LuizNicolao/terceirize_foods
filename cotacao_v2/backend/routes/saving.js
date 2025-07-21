const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(auth);

/**
 * Listar registros de Saving com filtros e paginação
 */
router.get('/', async (req, res) => {
    try {
        const {
            pagina = 1,
            limite = 10,
            comprador,
            status,
            tipo,
            data_inicio,
            data_fim
        } = req.query;

        const offset = (pagina - 1) * limite;
        
        // Construir query base
        let whereConditions = [];
        let params = [];
        
        if (comprador) {
            whereConditions.push('s.usuario_id = ?');
            params.push(comprador);
        }
        
        if (status) {
            whereConditions.push('s.status = ?');
            params.push(status);
        }
        
        if (tipo) {
            whereConditions.push('s.tipo = ?');
            params.push(tipo);
        }
        
        if (data_inicio) {
            whereConditions.push('DATE(s.data_registro) >= ?');
            params.push(data_inicio);
        }
        
        if (data_fim) {
            whereConditions.push('DATE(s.data_registro) <= ?');
            params.push(data_fim);
        }
        
        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
        
        // Query para contar total
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM saving s 
            LEFT JOIN users u ON s.usuario_id = u.id 
            ${whereClause}
        `;
        
        const [countResult] = await db.execute(countQuery, params);
        const total = countResult[0].total;
        
        // Query principal
        const query = `
            SELECT s.*, u.name as comprador_nome
            FROM saving s
            LEFT JOIN users u ON s.usuario_id = u.id
            ${whereClause}
            ORDER BY s.data_registro DESC
            LIMIT ${parseInt(limite)} OFFSET ${offset}
        `;
        console.log('Query:', query);
        console.log('Query Params:', params);
        const [registros] = await db.execute(query, params);
        
        // Calcular resumo
        const resumo = await calcularResumo(whereConditions, params);
        
        res.json({
            registros,
            total,
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            total_paginas: Math.ceil(total / limite),
            resumo
        });
        
    } catch (error) {
        console.error('Erro ao listar registros de saving:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * Obter detalhes de um registro de Saving
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar dados básicos
        const [saving] = await db.execute(`
            SELECT s.*, u.name as comprador_nome
            FROM saving s
            LEFT JOIN users u ON s.usuario_id = u.id
            WHERE s.id = ?
        `, [id]);
        
        if (saving.length === 0) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }
        
        // Buscar itens do saving (produtos)
        const [itens] = await db.execute(`
            SELECT 
                id,
                saving_id,
                item_id,
                descricao,
                fornecedor,
                valor_unitario_inicial,
                valor_unitario_final,
                economia,
                economia_percentual,
                status,
                quantidade,
                prazo_entrega,
                data_entrega_fn,
                frete,
                difal,
                prazo_pagamento
            FROM saving_itens
            WHERE saving_id = ?
            ORDER BY id
        `, [id]);

        // Garantir que sempre retorna um array
        const produtos = Array.isArray(itens) ? itens : [];

        const resultado = {
            ...saving[0],
            produtos
        };
        
        res.json(resultado);
        
    } catch (error) {
        console.error('Erro ao obter detalhes do saving:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * Listar compradores para filtros
 */
router.get('/compradores/listar', async (req, res) => {
    try {
        const [compradores] = await db.execute(`
            SELECT DISTINCT u.id, u.name
            FROM saving s
            JOIN users u ON s.usuario_id = u.id
            ORDER BY u.name
        `);
        
        res.json({ success: true, compradores });
        
    } catch (error) {
        console.error('Erro ao listar compradores:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * Buscar último saving aprovado para comparação
 */
router.get('/comparacao/:savingId', async (req, res) => {
    try {
        const { savingId } = req.params;
        const { data_registro } = req.query;
        
        // Buscar dados do saving atual
        const [savingAtual] = await db.execute(`
            SELECT s.*, u.name as comprador_nome
            FROM saving s
            LEFT JOIN users u ON s.usuario_id = u.id
            WHERE s.id = ?
        `, [savingId]);
        
        if (savingAtual.length === 0) {
            return res.status(404).json({ error: 'Saving não encontrado' });
        }
        
        // Buscar itens do saving atual
        const [itensAtuais] = await db.execute(`
            SELECT *
            FROM saving_itens
            WHERE saving_id = ?
        `, [savingId]);
        
        // Buscar savings anteriores aprovados com produtos similares
        const [savingsAnteriores] = await db.execute(`
            SELECT DISTINCT s.id, s.data_registro, s.comprador_nome
            FROM saving s
            LEFT JOIN users u ON s.usuario_id = u.id
            WHERE s.status = 'concluido'
            AND s.data_registro < ?
            ORDER BY s.data_registro DESC
            LIMIT 5
        `, [data_registro]);
        
        const comparacoes = [];
        
        for (const savingAnterior of savingsAnteriores) {
            const [itensAnteriores] = await db.execute(`
                SELECT *
                FROM saving_itens
                WHERE saving_id = ?
            `, [savingAnterior.id]);
            
            // Encontrar produtos similares
            const produtosSimilares = [];
            
            for (const itemAtual of itensAtuais) {
                const itemSimilar = itensAnteriores.find(item => 
                    item.descricao.toLowerCase().includes(itemAtual.descricao.toLowerCase()) ||
                    itemAtual.descricao.toLowerCase().includes(item.descricao.toLowerCase())
                );
                
                if (itemSimilar) {
                    produtosSimilares.push({
                        produto_atual: itemAtual,
                        produto_anterior: itemSimilar
                    });
                }
            }
            
            if (produtosSimilares.length > 0) {
                comparacoes.push({
                    saving_anterior: savingAnterior,
                    produtos_similares: produtosSimilares
                });
            }
        }
        
        res.json({
            saving_atual: savingAtual[0],
            produtos_atuais: itensAtuais,
            comparacoes
        });
        
    } catch (error) {
        console.error('Erro ao buscar comparação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * Exportar dados de Saving individual
 */
router.get('/:id/exportar', async (req, res) => {
    try {
        const { id } = req.params;
        const { formato = 'excel' } = req.query;
        
        // Buscar dados do saving
        const [saving] = await db.execute(`
            SELECT s.*, u.name as comprador_nome
            FROM saving s
            LEFT JOIN users u ON s.usuario_id = u.id
            WHERE s.id = ?
        `, [id]);
        
        if (saving.length === 0) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }
        
        // Buscar itens do saving
        const [itens] = await db.execute(`
            SELECT *
            FROM saving_itens
            WHERE saving_id = ?
            ORDER BY id
        `, [id]);
        
        const dados = {
            ...saving[0],
            produtos: itens
        };
        
        // Configurar headers para download
        const filename = `saving_${id}_${new Date().toISOString().split('T')[0]}.${formato === 'csv' ? 'csv' : 'xlsx'}`;
        
        res.setHeader('Content-Type', formato === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        if (formato === 'csv') {
            // Gerar CSV
            const csvHeader = 'ID,Cotação,Comprador,Data Registro,Valor Inicial,Valor Final,Economia,Economia %,Rodadas,Status,Tipo,Centro Distribuição,Data Aprovação,Observações\n';
            const csvData = `${dados.id},${dados.cotacao_id},"${dados.comprador_nome}",${dados.data_registro},${dados.valor_total_inicial},${dados.valor_total_final},${dados.economia},${dados.economia_percentual},${dados.rodadas},${dados.status},${dados.tipo},${dados.centro_distribuicao},${dados.data_aprovacao || ''},"${dados.observacoes || ''}"`;
            
            res.send(csvHeader + csvData);
        } else {
            // Para Excel, retornamos JSON por enquanto
            res.json(dados);
        }
        
    } catch (error) {
        console.error('Erro ao exportar dados individuais:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * Exportar dados de Saving
 */
router.get('/exportar/excel', async (req, res) => {
    try {
        const {
            comprador,
            status,
            tipo,
            data_inicio,
            data_fim,
            formato = 'excel'
        } = req.query;
        
        // Construir query com filtros
        let whereConditions = [];
        let params = [];
        
        if (comprador) {
            whereConditions.push('s.usuario_id = ?');
            params.push(comprador);
        }
        
        if (status) {
            whereConditions.push('s.status = ?');
            params.push(status);
        }
        
        if (tipo) {
            whereConditions.push('s.tipo = ?');
            params.push(tipo);
        }
        
        if (data_inicio) {
            whereConditions.push('DATE(s.data_registro) >= ?');
            params.push(data_inicio);
        }
        
        if (data_fim) {
            whereConditions.push('DATE(s.data_registro) <= ?');
            params.push(data_fim);
        }
        
        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
        
        const query = `
            SELECT 
                s.id,
                s.cotacao_id,
                u.name as comprador,
                s.data_registro,
                s.valor_total_inicial,
                s.valor_total_final,
                s.economia,
                s.economia_percentual,
                s.rodadas,
                s.status,
                s.tipo,
                s.centro_distribuicao,
                s.data_aprovacao,
                s.observacoes
            FROM saving s
            LEFT JOIN users u ON s.usuario_id = u.id
            ${whereClause}
            ORDER BY s.data_registro DESC
        `;
        
        const [dados] = await db.execute(query, params);
        
        // Configurar headers para download
        const filename = `saving_export_${new Date().toISOString().split('T')[0]}.${formato === 'csv' ? 'csv' : 'xlsx'}`;
        
        res.setHeader('Content-Type', formato === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        if (formato === 'csv') {
            // Gerar CSV
            const csvHeader = 'ID,Cotação,Comprador,Data Registro,Valor Inicial,Valor Final,Economia,Economia %,Rodadas,Status,Tipo,Centro Distribuição,Data Aprovação,Observações\n';
            const csvData = dados.map(row => 
                `${row.id},${row.cotacao_id},"${row.comprador}",${row.data_registro},${row.valor_total_inicial},${row.valor_total_final},${row.economia},${row.economia_percentual},${row.rodadas},${row.status},${row.tipo},${row.centro_distribuicao},${row.data_aprovacao || ''},"${row.observacoes || ''}"`
            ).join('\n');
            
            res.send(csvHeader + csvData);
        } else {
            // Para Excel, você pode usar uma biblioteca como xlsx
            // Por enquanto, retornamos JSON
            res.json(dados);
        }
        
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

/**
 * Função auxiliar para calcular resumo
 */
async function calcularResumo(whereConditions, params) {
    try {
        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
        
        // Resumo geral
        const [resumoGeral] = await db.execute(`
            SELECT 
                COALESCE(SUM(economia), 0) as economia_total,
                COALESCE(SUM(valor_total_inicial), 0) as valor_inicial_total,
                COALESCE(SUM(valor_total_final), 0) as valor_final_total,
                COUNT(*) as total_registros,
                COALESCE(SUM(rodadas), 0) as total_rodadas
            FROM saving s
            ${whereClause}
        `, params);
        
        // Métricas por comprador
        const [compradores] = await db.execute(`
            SELECT 
                u.name as comprador_nome,
                COUNT(*) as total_registros,
                COALESCE(SUM(s.economia), 0) as economia_total,
                COALESCE(SUM(s.valor_total_inicial), 0) as valor_inicial_total,
                COALESCE(SUM(s.valor_total_final), 0) as valor_final_total,
                COALESCE(SUM(s.rodadas), 0) as total_rodadas
            FROM saving s
            LEFT JOIN users u ON s.usuario_id = u.id
            ${whereClause}
            GROUP BY s.usuario_id, u.name
            ORDER BY economia_total DESC
        `, params);
        
        const dados = resumoGeral[0];
        const economiaPercentual = dados.valor_inicial_total > 0 ? 
            (dados.economia_total / dados.valor_inicial_total * 100) : 0;
        
        return {
            economia_total: parseFloat(dados.economia_total),
            economia_percentual: parseFloat(economiaPercentual),
            total_negociado: parseFloat(dados.valor_inicial_total),
            total_aprovado: parseFloat(dados.valor_final_total),
            total_rodadas: parseInt(dados.total_rodadas),
            compradores
        };
        
    } catch (error) {
        console.error('Erro ao calcular resumo:', error);
        return {
            economia_total: 0,
            economia_percentual: 0,
            total_negociado: 0,
            total_aprovado: 0,
            total_rodadas: 0,
            compradores: []
        };
    }
}

module.exports = router; 