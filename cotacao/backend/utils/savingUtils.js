const { executeQuery } = require('../config/database');

/**
 * Calcular resumo dos registros de saving
 */
async function calcularResumo(whereConditions, params) {
    try {
        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
        
        // Query para calcular totais
        const resumoQuery = `
            SELECT 
                COUNT(*) as total_registros,
                SUM(CASE WHEN s.status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
                SUM(CASE WHEN s.status = 'concluido' THEN 1 ELSE 0 END) as aprovados,
                SUM(CASE WHEN s.status = 'em_andamento' THEN 1 ELSE 0 END) as em_andamento,
                SUM(CASE WHEN s.tipo = 'programada' THEN 1 ELSE 0 END) as tipo_programada,
                SUM(CASE WHEN s.tipo = 'emergencial' THEN 1 ELSE 0 END) as tipo_emergencial,
                SUM(s.economia) as economia_total,
                AVG(s.economia_percentual) as economia_media_percentual,
                SUM(s.valor_total_inicial) as total_negociado,
                SUM(s.valor_total_final) as total_aprovado,
                SUM(s.rodadas) as total_rodadas
            FROM saving s
            LEFT JOIN users u ON s.usuario_id = u.id
            ${whereClause}
        `;
        
        const resumoResult = await executeQuery(resumoQuery, params);
        const resumo = resumoResult[0];
        
        return {
            total_registros: parseInt(resumo.total_registros) || 0,
            pendentes: parseInt(resumo.pendentes) || 0,
            aprovados: parseInt(resumo.aprovados) || 0,
            em_andamento: parseInt(resumo.em_andamento) || 0,
            tipo_programada: parseInt(resumo.tipo_programada) || 0,
            tipo_emergencial: parseInt(resumo.tipo_emergencial) || 0,

            economia_total: parseFloat(resumo.economia_total) || 0,
            economia_media_percentual: parseFloat(resumo.economia_media_percentual) || 0,
            total_negociado: parseFloat(resumo.total_negociado) || 0,
            total_aprovado: parseFloat(resumo.total_aprovado) || 0,
            total_rodadas: parseInt(resumo.total_rodadas) || 0
        };
        
    } catch (error) {
        console.error('Erro ao calcular resumo:', error);
        return {
            total_registros: 0,
            pendentes: 0,
            aprovados: 0,
            em_andamento: 0,
            tipo_programada: 0,
            tipo_emergencial: 0,

            economia_total: 0,
            economia_media_percentual: 0,
            total_negociado: 0,
            total_aprovado: 0,
            total_rodadas: 0
        };
    }
}

/**
 * Formatar valor monetário
 */
function formatarValor(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) {
        return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

/**
 * Formatar percentual
 */
function formatarPercentual(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) {
        return '0,00%';
    }
    
    return `${parseFloat(valor).toFixed(2)}%`;
}

/**
 * Formatar data
 */
function formatarData(data) {
    if (!data) return 'N/A';
    
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR') + ' ' + dataObj.toLocaleTimeString('pt-BR');
}

/**
 * Validar se o usuário tem permissão para acessar o saving
 */
async function validarPermissaoSaving(savingId, usuarioId) {
    try {
        const query = 'SELECT usuario_id FROM saving WHERE id = ?';
        const result = await executeQuery(query, [savingId]);
        
        if (result.length === 0) {
            return { temPermissao: false, mensagem: 'Saving não encontrado' };
        }
        
        const saving = result[0];
        
        // Verificar se o usuário é o dono do saving ou tem permissão de admin
        if (saving.usuario_id !== usuarioId) {
            // Aqui você pode adicionar lógica para verificar se o usuário é admin
            // Por enquanto, apenas o dono pode acessar
            return { temPermissao: false, mensagem: 'Sem permissão para acessar este saving' };
        }
        
        return { temPermissao: true };
        
    } catch (error) {
        console.error('Erro ao validar permissão:', error);
        return { temPermissao: false, mensagem: 'Erro ao validar permissão' };
    }
}

/**
 * Gerar relatório de saving
 */
async function gerarRelatorioSaving(filtros) {
    try {
        const {
            data_inicio,
            data_fim,
            status,
            tipo,
            comprador
        } = filtros;
        
        let whereConditions = [];
        let params = [];
        
        if (data_inicio) {
            whereConditions.push('DATE(s.data_registro) >= ?');
            params.push(data_inicio);
        }
        
        if (data_fim) {
            whereConditions.push('DATE(s.data_registro) <= ?');
            params.push(data_fim);
        }
        
        if (status) {
            whereConditions.push('s.status = ?');
            params.push(status);
        }
        
        if (tipo) {
            whereConditions.push('s.tipo = ?');
            params.push(tipo);
        }
        
        if (comprador) {
            whereConditions.push('s.usuario_id = ?');
            params.push(comprador);
        }
        
        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
        
        const query = `
            SELECT 
                s.*,
                u.name as comprador_nome,
                p.nome as produto_nome,
                f.nome as fornecedor_nome,
                (s.valor_anterior - s.valor_atual) * s.quantidade as economia_total,
                ((s.valor_anterior - s.valor_atual) / s.valor_anterior * 100) as economia_percentual
            FROM saving s
            LEFT JOIN users u ON s.usuario_id = u.id
            LEFT JOIN produtos p ON s.produto_id = p.id
            LEFT JOIN fornecedores f ON s.fornecedor_id = f.id
            ${whereClause}
            ORDER BY s.data_registro DESC
        `;
        
        const registros = await executeQuery(query, params);
        
        return registros;
        
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        throw error;
    }
}

module.exports = {
    calcularResumo,
    formatarValor,
    formatarPercentual,
    formatarData,
    validarPermissaoSaving,
    gerarRelatorioSaving
};
