/**
 * Controller de Importação de Produto Origem
 * Responsável por importar produtos via planilha Excel
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { gerarCodigoProdutoOrigem } = require('../../utils/codigoGenerator');
const XLSX = require('xlsx');

class ProdutoOrigemImportController {
  
  /**
   * Importar produtos origem via Excel
   */
  static importarExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
      return errorResponse(res, 'Arquivo não enviado', STATUS_CODES.BAD_REQUEST);
    }

    try {
      // Ler arquivo Excel
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return errorResponse(res, 'Planilha vazia ou sem dados válidos', STATUS_CODES.BAD_REQUEST);
      }

      const resultados = {
        sucesso: [],
        erros: [],
        total: data.length
      };

      // Buscar dados de referência (para validação e conversão)
      const [unidadesMedida, grupos, subgrupos, classes] = await Promise.all([
        executeQuery('SELECT id, nome, sigla FROM unidades_medida WHERE status = 1'),
        executeQuery('SELECT id, nome FROM grupos WHERE status = 1'),
        executeQuery('SELECT id, nome FROM subgrupos WHERE status = 1'),
        executeQuery('SELECT id, nome FROM classes WHERE status = 1')
      ]);

      // Criar maps para busca rápida
      const unidadeMap = new Map();
      unidadesMedida.forEach(u => {
        unidadeMap.set(u.nome.toLowerCase(), u.id);
        unidadeMap.set(u.sigla.toLowerCase(), u.id);
      });

      const grupoMap = new Map(grupos.map(g => [g.nome.toLowerCase(), g.id]));
      const subgrupoMap = new Map(subgrupos.map(s => [s.nome.toLowerCase(), s.id]));
      const classeMap = new Map(classes.map(c => [c.nome.toLowerCase(), c.id]));

      // Processar cada linha
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const linha = i + 2; // +2 porque Excel começa em 1 e temos header

        try {
          // Validações básicas
          if (!row.nome || row.nome.toString().trim() === '') {
            resultados.erros.push({
              linha,
              erro: 'Nome é obrigatório',
              dados: row
            });
            continue;
          }

          if (!row.unidade_medida || row.unidade_medida.toString().trim() === '') {
            resultados.erros.push({
              linha,
              erro: 'Unidade de medida é obrigatória',
              dados: row
            });
            continue;
          }

          // Buscar unidade de medida
          const unidadeMedidaId = unidadeMap.get(row.unidade_medida.toString().toLowerCase().trim());
          if (!unidadeMedidaId) {
            resultados.erros.push({
              linha,
              erro: `Unidade de medida "${row.unidade_medida}" não encontrada`,
              dados: row
            });
            continue;
          }

          // Buscar grupo (opcional)
          let grupoId = null;
          if (row.grupo && row.grupo.toString().trim() !== '') {
            grupoId = grupoMap.get(row.grupo.toString().toLowerCase().trim());
            if (!grupoId) {
              resultados.erros.push({
                linha,
                erro: `Grupo "${row.grupo}" não encontrado`,
                dados: row
              });
              continue;
            }
          }

          // Buscar subgrupo (opcional)
          let subgrupoId = null;
          if (row.subgrupo && row.subgrupo.toString().trim() !== '') {
            subgrupoId = subgrupoMap.get(row.subgrupo.toString().toLowerCase().trim());
            if (!subgrupoId) {
              resultados.erros.push({
                linha,
                erro: `Subgrupo "${row.subgrupo}" não encontrado`,
                dados: row
              });
              continue;
            }
          }

          // Buscar classe (opcional)
          let classeId = null;
          if (row.classe && row.classe.toString().trim() !== '') {
            classeId = classeMap.get(row.classe.toString().toLowerCase().trim());
            if (!classeId) {
              resultados.erros.push({
                linha,
                erro: `Classe "${row.classe}" não encontrada`,
                dados: row
              });
              continue;
            }
          }

          // Verificar se produto já existe (por nome)
          const produtoExistente = await executeQuery(
            'SELECT id FROM produto_origem WHERE LOWER(nome) = LOWER(?)',
            [row.nome.toString().trim()]
          );

          if (produtoExistente.length > 0) {
            resultados.erros.push({
              linha,
              erro: `Produto "${row.nome}" já existe no sistema`,
              dados: row
            });
            continue;
          }

          // Preparar dados do produto
          const nome = row.nome.toString().trim();
          const fatorConversao = row.fator_conversao ? parseFloat(row.fator_conversao) : 1.000;
          const pesoLiquido = row.peso_liquido ? parseFloat(row.peso_liquido) : null;
          const referenciaMercado = row.referencia_mercado ? row.referencia_mercado.toString().trim() : null;
          const status = row.status && row.status.toString().toLowerCase() === 'inativo' ? 0 : 1;

          // Gerar código temporário
          const codigoTemporario = `TEMP-${Date.now()}-${i}`;

          // Inserir produto
          const result = await executeQuery(
            `INSERT INTO produto_origem (
              codigo, nome, unidade_medida_id, fator_conversao, grupo_id, subgrupo_id, 
              classe_id, peso_liquido, referencia_mercado, status, usuario_criador_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              codigoTemporario, 
              nome, 
              unidadeMedidaId, 
              fatorConversao, 
              grupoId, 
              subgrupoId,
              classeId, 
              pesoLiquido, 
              referenciaMercado,
              status, 
              req.user.id
            ]
          );

          // Gerar código definitivo baseado no ID
          const codigoDefinitivo = gerarCodigoProdutoOrigem(result.insertId);

          // Atualizar com código definitivo
          await executeQuery(
            'UPDATE produto_origem SET codigo = ? WHERE id = ?',
            [codigoDefinitivo, result.insertId]
          );

          resultados.sucesso.push({
            linha,
            id: result.insertId,
            codigo: codigoDefinitivo,
            nome: nome
          });

        } catch (error) {
          resultados.erros.push({
            linha,
            erro: error.message || 'Erro ao processar linha',
            dados: row
          });
        }
      }

      // Retornar resultados
      const mensagem = `Importação concluída: ${resultados.sucesso.length} produtos importados, ${resultados.erros.length} erros`;

      return successResponse(
        res,
        resultados,
        mensagem,
        STATUS_CODES.SUCCESS
      );

    } catch (error) {
      console.error('Erro ao importar Excel:', error);
      return errorResponse(
        res, 
        'Erro ao processar planilha: ' + error.message, 
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });

  /**
   * Baixar modelo de planilha Excel
   */
  static baixarModelo = asyncHandler(async (req, res) => {
    // Criar planilha modelo
    const modelo = [
      {
        nome: 'EXEMPLO PRODUTO 1',
        unidade_medida: 'KG',
        fator_conversao: 1.000,
        peso_liquido: 1.000,
        grupo: 'FRIOS',
        subgrupo: 'CONGELADO',
        classe: 'VEGETAL',
        referencia_mercado: 'REF-001',
        status: 'Ativo'
      },
      {
        nome: 'EXEMPLO PRODUTO 2',
        unidade_medida: 'UN',
        fator_conversao: 1.000,
        peso_liquido: 0.500,
        grupo: '',
        subgrupo: '',
        classe: '',
        referencia_mercado: '',
        status: 'Ativo'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(modelo);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Origem');

    // Gerar buffer do Excel
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers para download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=modelo_produtos_origem.xlsx');
    
    return res.send(buffer);
  });
}

module.exports = ProdutoOrigemImportController;

