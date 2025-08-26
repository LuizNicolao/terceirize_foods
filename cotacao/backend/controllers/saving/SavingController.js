const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse, asyncHandler } = require('../../middleware/responseHandler');
const { calcularResumo } = require('../../utils/savingUtils');

class SavingController {
    /**
     * Listar registros de Saving com filtros e paginação
     */
    static listarSaving = asyncHandler(async (req, res) => {
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
            
            const countResult = await executeQuery(countQuery, params);
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
            
            const registros = await executeQuery(query, params);
            
            // Calcular resumo
            const resumo = await calcularResumo(whereConditions, params);
            
            // Formatar resposta com HATEOAS
            const links = {
                self: `/api/saving?pagina=${pagina}&limite=${limite}`,
                first: `/api/saving?pagina=1&limite=${limite}`,
                last: `/api/saving?pagina=${Math.ceil(total / limite)}&limite=${limite}`,
                next: pagina < Math.ceil(total / limite) ? `/api/saving?pagina=${parseInt(pagina) + 1}&limite=${limite}` : null,
                prev: pagina > 1 ? `/api/saving?pagina=${parseInt(pagina) - 1}&limite=${limite}` : null
            };

            // Adicionar links HATEOAS para cada registro
            const registrosComLinks = registros.map(registro => ({
                ...registro,
                _links: {
                    self: `/api/saving/${registro.id}`,
                    resumo: `/api/saving/${registro.id}/resumo`,
                    aprovar: `/api/saving/${registro.id}/aprovar`,
                    rejeitar: `/api/saving/${registro.id}/rejeitar`
                }
            }));
            
            const responseData = {
                registros: registrosComLinks,
                total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total_paginas: Math.ceil(total / limite),
                resumo,
                _links: links
            };

            return successResponse(res, responseData, 'Registros de saving carregados com sucesso');
            
        } catch (error) {
            console.error('Erro ao listar registros de saving:', error);
            return errorResponse(res, 'Erro interno do servidor', 500);
        }
    });

    /**
     * Obter detalhes de um registro de Saving
     */
    static obterSaving = asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT s.*, u.name as comprador_nome
                FROM saving s
                LEFT JOIN users u ON s.usuario_id = u.id
                WHERE s.id = ?
            `;
            
            const result = await executeQuery(query, [id]);
            
            if (result.length === 0) {
                return errorResponse(res, 'Registro de saving não encontrado', 404);
            }
            
            const saving = result[0];
            
            // Adicionar links HATEOAS
            const responseData = {
                ...saving,
                _links: {
                    self: `/api/saving/${saving.id}`,
                    resumo: `/api/saving/${saving.id}/resumo`,
                    aprovar: `/api/saving/${saving.id}/aprovar`,
                    rejeitar: `/api/saving/${saving.id}/rejeitar`
                }
            };
            
            const responseWithLinks = res.addHateoasLinks(responseData);
            
            return successResponse(res, responseWithLinks, 'Registro de saving carregado com sucesso');
            
        } catch (error) {
            console.error('Erro ao obter saving:', error);
            return errorResponse(res, 'Erro interno do servidor', 500);
        }
    });

    /**
     * Criar novo registro de Saving
     */
    static criarSaving = asyncHandler(async (req, res) => {
        try {
            const {
                produto_id,
                fornecedor_id,
                valor_anterior,
                valor_atual,
                quantidade,
                tipo,
                observacoes,
                cotacao_id
            } = req.body;

            const usuario_id = req.user.id;
            
            const query = `
                INSERT INTO saving (
                    produto_id, fornecedor_id, valor_anterior, valor_atual, 
                    quantidade, tipo, observacoes, cotacao_id, usuario_id, 
                    data_registro, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pendente')
            `;
            
            const params = [
                produto_id, fornecedor_id, valor_anterior, valor_atual,
                quantidade, tipo, observacoes, cotacao_id, usuario_id
            ];
            
            const result = await executeQuery(query, params);
            
            const novoSaving = {
                id: result.insertId,
                produto_id,
                fornecedor_id,
                valor_anterior,
                valor_atual,
                quantidade,
                tipo,
                observacoes,
                cotacao_id,
                usuario_id,
                status: 'pendente',
                _links: {
                    self: `/api/saving/${result.insertId}`,
                    resumo: `/api/saving/${result.insertId}/resumo`,
                    aprovar: `/api/saving/${result.insertId}/aprovar`,
                    rejeitar: `/api/saving/${result.insertId}/rejeitar`
                }
            };
            
            const responseWithLinks = res.addHateoasLinks(novoSaving);
            
            return successResponse(res, responseWithLinks, 'Saving criado com sucesso', 201);
            
        } catch (error) {
            console.error('Erro ao criar saving:', error);
            return errorResponse(res, 'Erro interno do servidor', 500);
        }
    });

    /**
     * Atualizar registro de Saving
     */
    static atualizarSaving = asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const {
                produto_id,
                fornecedor_id,
                valor_anterior,
                valor_atual,
                quantidade,
                tipo,
                observacoes,
                cotacao_id
            } = req.body;
            
            // Verificar se o registro existe
            const checkQuery = 'SELECT id, status FROM saving WHERE id = ?';
            const checkResult = await executeQuery(checkQuery, [id]);
            
            if (checkResult.length === 0) {
                return errorResponse(res, 'Registro de saving não encontrado', 404);
            }
            
            if (checkResult[0].status !== 'pendente') {
                return errorResponse(res, 'Apenas registros pendentes podem ser editados', 400);
            }
            
            const updateQuery = `
                UPDATE saving 
                SET produto_id = ?, fornecedor_id = ?, valor_anterior = ?, 
                    valor_atual = ?, quantidade = ?, tipo = ?, observacoes = ?, 
                    cotacao_id = ?, data_atualizacao = NOW()
                WHERE id = ?
            `;
            
            const params = [
                produto_id, fornecedor_id, valor_anterior, valor_atual,
                quantidade, tipo, observacoes, cotacao_id, id
            ];
            
            await executeQuery(updateQuery, params);
            
            const responseData = {
                message: 'Saving atualizado com sucesso',
                _links: {
                    self: `/api/saving/${id}`,
                    resumo: `/api/saving/${id}/resumo`
                }
            };
            
            const responseWithLinks = res.addHateoasLinks(responseData);
            
            return successResponse(res, responseWithLinks, 'Saving atualizado com sucesso');
            
        } catch (error) {
            console.error('Erro ao atualizar saving:', error);
            return errorResponse(res, 'Erro interno do servidor', 500);
        }
    });

    /**
     * Excluir registro de Saving
     */
    static excluirSaving = asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar se o registro existe
            const checkQuery = 'SELECT id, status FROM saving WHERE id = ?';
            const checkResult = await executeQuery(checkQuery, [id]);
            
            if (checkResult.length === 0) {
                return errorResponse(res, 'Registro de saving não encontrado', 404);
            }
            
            if (checkResult[0].status !== 'pendente') {
                return errorResponse(res, 'Apenas registros pendentes podem ser excluídos', 400);
            }
            
            const deleteQuery = 'DELETE FROM saving WHERE id = ?';
            await executeQuery(deleteQuery, [id]);
            
            return successResponse(res, null, 'Saving excluído com sucesso');
            
        } catch (error) {
            console.error('Erro ao excluir saving:', error);
            return errorResponse(res, 'Erro interno do servidor', 500);
        }
    });

    /**
     * Obter resumo de um registro de Saving
     */
    static obterResumoSaving = asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT 
                    s.*,
                    u.name as comprador_nome,
                    COUNT(si.id) as total_itens,
                    SUM(si.economia) as economia_total_itens
                FROM saving s
                LEFT JOIN users u ON s.usuario_id = u.id
                LEFT JOIN saving_itens si ON s.id = si.saving_id
                WHERE s.id = ?
                GROUP BY s.id
            `;
            
            const result = await executeQuery(query, [id]);
            
            if (result.length === 0) {
                return errorResponse(res, 'Registro de saving não encontrado', 404);
            }
            
            const resumo = result[0];
            
            const responseData = {
                ...resumo,
                _links: {
                    self: `/api/saving/${id}/resumo`,
                    saving: `/api/saving/${id}`,
                    itens: `/api/saving/${id}/itens`
                }
            };
            
            const responseWithLinks = res.addHateoasLinks(responseData);
            
            return successResponse(res, responseWithLinks, 'Resumo do saving carregado com sucesso');
            
        } catch (error) {
            console.error('Erro ao obter resumo do saving:', error);
            return errorResponse(res, 'Erro interno do servidor', 500);
        }
    });

    /**
     * Aprovar registro de Saving
     */
    static aprovarSaving = asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const { motivo, observacoes } = req.body;
            
            // Verificar se o registro existe
            const checkQuery = 'SELECT id, status FROM saving WHERE id = ?';
            const checkResult = await executeQuery(checkQuery, [id]);
            
            if (checkResult.length === 0) {
                return errorResponse(res, 'Registro de saving não encontrado', 404);
            }
            
            if (checkResult[0].status !== 'pendente') {
                return errorResponse(res, 'Apenas registros pendentes podem ser aprovados', 400);
            }
            
            const updateQuery = `
                UPDATE saving 
                SET status = 'aprovado', motivo_aprovacao = ?, 
                    observacoes_aprovacao = ?, data_aprovacao = NOW()
                WHERE id = ?
            `;
            
            await executeQuery(updateQuery, [motivo, observacoes, id]);
            
            const responseData = {
                message: 'Saving aprovado com sucesso',
                _links: {
                    self: `/api/saving/${id}`,
                    resumo: `/api/saving/${id}/resumo`
                }
            };
            
            const responseWithLinks = res.addHateoasLinks(responseData);
            
            return successResponse(res, responseWithLinks, 'Saving aprovado com sucesso');
            
        } catch (error) {
            console.error('Erro ao aprovar saving:', error);
            return errorResponse(res, 'Erro interno do servidor', 500);
        }
    });

    /**
     * Rejeitar registro de Saving
     */
    static rejeitarSaving = asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const { motivo, observacoes } = req.body;
            
            // Verificar se o registro existe
            const checkQuery = 'SELECT id, status FROM saving WHERE id = ?';
            const checkResult = await executeQuery(checkQuery, [id]);
            
            if (checkResult.length === 0) {
                return errorResponse(res, 'Registro de saving não encontrado', 404);
            }
            
            if (checkResult[0].status !== 'pendente') {
                return errorResponse(res, 'Apenas registros pendentes podem ser rejeitados', 400);
            }
            
            const updateQuery = `
                UPDATE saving 
                SET status = 'rejeitado', motivo_rejeicao = ?, 
                    observacoes_rejeicao = ?, data_rejeicao = NOW()
                WHERE id = ?
            `;
            
            await executeQuery(updateQuery, [motivo, observacoes, id]);
            
            const responseData = {
                message: 'Saving rejeitado com sucesso',
                _links: {
                    self: `/api/saving/${id}`,
                    resumo: `/api/saving/${id}/resumo`
                }
            };
            
            const responseWithLinks = res.addHateoasLinks(responseData);
            
            return successResponse(res, responseWithLinks, 'Saving rejeitado com sucesso');
            
        } catch (error) {
            console.error('Erro ao rejeitar saving:', error);
            return errorResponse(res, 'Erro interno do servidor', 500);
        }
    });

    /**
     * Obter estatísticas de saving
     */
    static obterEstatisticas = asyncHandler(async (req, res) => {
        try {
            console.log('📊 Obtendo estatísticas de saving...');
            
            const { comprador, status, tipo, data_inicio, data_fim } = req.query;
            
            // Construir condições WHERE
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
            
            // Query para estatísticas gerais
            const statsQuery = `
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
            
            const statsResult = await executeQuery(statsQuery, params);
            const stats = statsResult[0];
            
            // Query para métricas por comprador
            const compradoresQuery = `
                SELECT 
                    u.id,
                    u.name as nome,
                    COUNT(s.id) as total_cotacoes,
                    SUM(s.economia) as economia_total,
                    AVG(s.economia_percentual) as economia_percentual,
                    SUM(s.rodadas) as total_rodadas
                FROM saving s
                LEFT JOIN users u ON s.usuario_id = u.id
                ${whereClause}
                GROUP BY u.id, u.name
                ORDER BY SUM(s.economia) DESC
                LIMIT 10
            `;
            
            const compradoresResult = await executeQuery(compradoresQuery, params);
            
            // Identificar melhor e pior comprador
            const compradores = compradoresResult.map((comprador, index) => ({
                ...comprador,
                melhor_comprador: index === 0,
                pior_comprador: index === compradoresResult.length - 1
            }));
            
            const estatisticas = {
                geral: {
                    total_registros: parseInt(stats.total_registros) || 0,
                    pendentes: parseInt(stats.pendentes) || 0,
                    aprovados: parseInt(stats.aprovados) || 0,
                    em_andamento: parseInt(stats.em_andamento) || 0,
                    tipo_programada: parseInt(stats.tipo_programada) || 0,
                    tipo_emergencial: parseInt(stats.tipo_emergencial) || 0,
                    economia_total: parseFloat(stats.economia_total) || 0,
                    economia_media_percentual: parseFloat(stats.economia_media_percentual) || 0,
                    total_negociado: parseFloat(stats.total_negociado) || 0,
                    total_aprovado: parseFloat(stats.total_aprovado) || 0,
                    total_rodadas: parseInt(stats.total_rodadas) || 0
                },
                compradores
            };
            
            console.log('📊 Estatísticas calculadas:', estatisticas);
            
            return successResponse(res, estatisticas, 'Estatísticas carregadas com sucesso');
            
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return errorResponse(res, 'Erro interno do servidor', 500);
        }
    });

    /**
     * Obter itens de um registro de Saving
     */
    static obterSavingItens = asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT 
                    si.*
                FROM saving_itens si
                WHERE si.saving_id = ?
                ORDER BY si.id
            `;
            
            const result = await executeQuery(query, [id]);
            
            // Formatar resposta com HATEOAS
            const responseData = {
                itens: result.map(item => ({
                    ...item,
                    _links: {
                        self: `/api/saving/${id}/itens/${item.id}`,
                        produto: `/api/produtos/${item.produto_id}`,
                        fornecedor: `/api/fornecedores/${item.fornecedor_id}`
                    }
                })),
                _links: {
                    self: `/api/saving/${id}/itens`,
                    saving: `/api/saving/${id}`
                }
            };

            return successResponse(res, responseData, 'Itens do saving carregados com sucesso');
            
        } catch (error) {
            console.error('Erro ao obter itens do saving:', error);
            return errorResponse(res, 'Erro interno do servidor', 500);
        }
    });
}

module.exports = SavingController;
