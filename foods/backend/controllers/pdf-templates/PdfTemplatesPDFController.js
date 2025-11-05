/**
 * Controller para geração de PDF usando templates
 */

const { executeQuery } = require('../../config/database');
const puppeteer = require('puppeteer');

class PdfTemplatesPDFController {
  /**
   * Buscar templates ativos por tela (controller para rota)
   */
  static async buscarTemplatesPorTela(req, res) {
    try {
      const { tela } = req.params;
      const templates = await PdfTemplatesPDFController._buscarTemplatesPorTelaHelper(tela);
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Erro ao buscar templates por tela:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar templates ativos por tela (método helper)
   */
  static async _buscarTemplatesPorTelaHelper(telaVinculada) {
    try {
      const query = `
        SELECT 
          id, nome, descricao, tela_vinculada, html_template, css_styles,
          ativo, padrao, variaveis_disponiveis
        FROM pdf_templates
        WHERE tela_vinculada = ? AND ativo = 1
        ORDER BY padrao DESC, nome ASC
      `;
      
      const templates = await executeQuery(query, [telaVinculada]);
      
      // Processar variaveis_disponiveis
      return templates.map(template => ({
        ...template,
        variaveis_disponiveis: template.variaveis_disponiveis 
          ? (typeof template.variaveis_disponiveis === 'string' 
              ? JSON.parse(template.variaveis_disponiveis) 
              : template.variaveis_disponiveis)
          : []
      }));
    } catch (error) {
      console.error('Erro ao buscar templates por tela:', error);
      throw error;
    }
  }

  /**
   * Renderizar HTML do template substituindo variáveis
   */
  static renderizarTemplate(htmlTemplate, dados, variaveisDisponiveis = []) {
    let html = htmlTemplate;
    
    // Processar loops de itens ({{#itens}}...{{/itens}})
    const itemLoopRegex = /\{\{#itens\}\}([\s\S]*?)\{\{\/itens\}\}/g;
    let match;
    
    while ((match = itemLoopRegex.exec(html)) !== null) {
      const loopContent = match[1];
      const itens = dados.itens || [];
      
      let itemsHtml = '';
      itens.forEach(item => {
        let itemHtml = loopContent;
        
        // Substituir variáveis do item
        const itemVars = itemHtml.match(/\{\{(\w+)\}\}/g) || [];
        itemVars.forEach(variavel => {
          const nomeVariavel = variavel.replace(/[{}]/g, '');
          const valor = item[nomeVariavel] !== undefined ? item[nomeVariavel] : '';
          const regex = new RegExp(`\\{\\{${nomeVariavel}\\}\\}`, 'g');
          itemHtml = itemHtml.replace(regex, valor);
        });
        
        itemsHtml += itemHtml;
      });
      
      // Substituir o loop completo pelo conteúdo renderizado
      html = html.replace(match[0], itemsHtml);
    }
    
    // Substituir variáveis simples do formato {{variavel}}
    const variaveis = html.match(/\{\{(\w+)\}\}/g) || [];
    
    variaveis.forEach(variavel => {
      const nomeVariavel = variavel.replace(/[{}]/g, '');
      // Ignorar se for um loop ou variável já processada
      if (nomeVariavel === 'itens' || nomeVariavel.startsWith('#') || nomeVariavel.startsWith('/')) {
        return;
      }
      
      const valor = dados[nomeVariavel] !== undefined ? dados[nomeVariavel] : '';
      
      // Substituir todas as ocorrências
      const regex = new RegExp(`\\{\\{${nomeVariavel}\\}\\}`, 'g');
      html = html.replace(regex, valor);
    });
    
    return html;
  }

  /**
   * Gerar PDF a partir de HTML usando Puppeteer
   */
  static async gerarPDFDeHTML(html, options = {}) {
    let browser;
    try {
      // Configuração para Docker/Alpine
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
      
      browser = await puppeteer.launch({
        headless: 'new', // Usar novo modo headless
        executablePath: executablePath, // Usar Chrome instalado no sistema se disponível
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-software-rasterizer'
        ]
      });
      
      const page = await browser.newPage();
      
      // Configurar conteúdo HTML
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });
      
      // Gerar PDF
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: options.marginTop || '20mm',
          right: options.marginRight || '20mm',
          bottom: options.marginBottom || '20mm',
          left: options.marginLeft || '20mm'
        },
        printBackground: true
      });
      
      await browser.close();
      return pdf;
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      console.error('Erro ao gerar PDF de HTML:', error);
      throw error;
    }
  }

  /**
   * Preparar dados para template de solicitação de compras
   */
  static prepararDadosSolicitacao(solicitacao, itens, pedidosVinculados) {
    // Calcular valor total se não existir
    const valorTotal = solicitacao.valor_total || itens.reduce((sum, item) => sum + parseFloat(item.valor_total_item || 0), 0);
    
    return {
      // Campos principais da solicitação
      id: solicitacao.id || '',
      numero_solicitacao: solicitacao.numero_solicitacao || '',
      descricao: solicitacao.descricao || solicitacao.justificativa || '',
      motivo: solicitacao.motivo || '',
      justificativa: solicitacao.justificativa || '',
      observacoes: solicitacao.observacoes || '',
      status: solicitacao.status || '',
      
      // Datas
      data_criacao: solicitacao.criado_em ? new Date(solicitacao.criado_em).toLocaleDateString('pt-BR') : '',
      data_criacao_completa: solicitacao.criado_em ? new Date(solicitacao.criado_em).toLocaleString('pt-BR') : '',
      data_atualizacao: solicitacao.atualizado_em ? new Date(solicitacao.atualizado_em).toLocaleDateString('pt-BR') : '',
      data_atualizacao_completa: solicitacao.atualizado_em ? new Date(solicitacao.atualizado_em).toLocaleString('pt-BR') : '',
      data_documento: solicitacao.data_documento ? new Date(solicitacao.data_documento).toLocaleDateString('pt-BR') : '',
      data_entrega_cd: solicitacao.data_entrega_cd ? new Date(solicitacao.data_entrega_cd).toLocaleDateString('pt-BR') : '',
      data_necessidade: solicitacao.data_necessidade ? new Date(solicitacao.data_necessidade).toLocaleDateString('pt-BR') : '',
      semana_abastecimento: solicitacao.semana_abastecimento || '',
      
      // Valores
      valor_total: valorTotal.toFixed(2).replace('.', ','),
      valor_total_numerico: valorTotal,
      
      // Filial
      filial_id: solicitacao.filial_id || '',
      filial_nome: solicitacao.filial_nome || solicitacao.unidade || '',
      filial_codigo: solicitacao.filial_codigo || '',
      unidade: solicitacao.unidade || '',
      
      // Usuário/Solicitante
      usuario_id: solicitacao.usuario_id || solicitacao.criado_por || '',
      criado_por: solicitacao.criado_por || '',
      solicitante_nome: solicitacao.usuario_nome_from_user || solicitacao.usuario_nome || solicitacao.solicitante || '',
      solicitante: solicitacao.solicitante || solicitacao.usuario_nome_from_user || solicitacao.usuario_nome || '',
      usuario_email: solicitacao.usuario_email || '',
      
      // Pedidos vinculados
      pedidos_vinculados: pedidosVinculados.map(p => p.numero_pedido).join(', '),
      pedidos_vinculados_lista: pedidosVinculados.map(p => p.numero_pedido),
      
      // Dados para itens (pode ser usado em loops no template)
      itens: itens.map(item => ({
        id: item.id || '',
        solicitacao_id: item.solicitacao_id || '',
        produto_id: item.produto_id || '',
        produto_codigo: item.produto_codigo || item.codigo_produto || '',
        produto_nome: item.produto_nome || item.nome_produto || '',
        codigo_produto: item.produto_codigo || item.codigo_produto || '',
        nome_produto: item.produto_nome || item.nome_produto || '',
        quantidade: item.quantidade || 0,
        quantidade_formatada: (item.quantidade || 0).toFixed(3).replace('.', ','),
        unidade_medida_id: item.unidade_medida_id || '',
        unidade: item.unidade_simbolo || item.unidade_medida || item.unidade_nome || '',
        unidade_simbolo: item.unidade_simbolo || item.unidade_medida || '',
        unidade_nome: item.unidade_nome || '',
        observacao: item.observacao || item.observacao_item || '',
        valor_unitario: item.valor_unitario || 0,
        valor_unitario_formatado: (item.valor_unitario || 0).toFixed(2).replace('.', ','),
        valor_total: item.valor_total_item || (parseFloat(item.quantidade || 0) * parseFloat(item.valor_unitario || 0)),
        valor_total_formatado: (item.valor_total_item || (parseFloat(item.quantidade || 0) * parseFloat(item.valor_unitario || 0))).toFixed(2).replace('.', ','),
        item_criado_em: item.item_criado_em ? new Date(item.item_criado_em).toLocaleDateString('pt-BR') : ''
      })),
      
      // Estatísticas dos itens
      total_itens: itens.length,
      total_quantidade: itens.reduce((sum, item) => sum + parseFloat(item.quantidade || 0), 0).toFixed(3).replace('.', ',')
    };
  }

  /**
   * Gerar HTML completo com CSS inline
   */
  static gerarHTMLCompleto(htmlTemplate, cssStyles = null) {
    const css = cssStyles || '';
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template PDF</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    ${css}
  </style>
</head>
<body>
  ${htmlTemplate}
</body>
</html>
    `.trim();
  }
}

module.exports = PdfTemplatesPDFController;

