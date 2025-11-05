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
    
    // Processar loops de itens ({{#itens}}...{{/itens}} ou {{{{#itens}}}}...{{{{/itens}}}})
    // Aceita tanto 2 quanto 4 chaves (devido ao escape do CKEditor)
    // Primeiro tenta com 4 chaves, depois com 2
    // Regex melhorado para aceitar espaços/whitespace entre as tags
    // IMPORTANTE: Usar regex não-guloso para capturar conteúdo vazio ou mínimo
    let itemLoopRegex = /\{\{\{\{#itens\}\}\}\}\s*([\s\S]*?)\s*\{\{\{\{\/itens\}\}\}\}/g;
    let match = itemLoopRegex.exec(html);
    
    if (!match) {
      // Se não encontrou com 4 chaves, tenta com 2
      // Usar regex não-guloso com ? para capturar conteúdo mínimo (incluindo vazio)
      itemLoopRegex = /\{\{#itens\}\}\s*([\s\S]*?)\s*\{\{\/itens\}\}/g;
      match = itemLoopRegex.exec(html);
    }
    
    while (match) {
      let loopContent = match[1] ? match[1].trim() : ''; // Remover espaços em branco do início/fim
      const itens = dados.itens || [];
      const fullMatch = match[0];
      
      // Se o conteúdo do loop estiver vazio ou for apenas espaços, procurar pela tabela logo após
      let tableToReplace = null;
      if (!loopContent || loopContent.trim().length === 0) {
        // Tentar encontrar a tabela HTML logo após o loop
        const loopIndex = html.indexOf(fullMatch);
        const afterLoop = html.substring(loopIndex + fullMatch.length);
        
        // Procurar por <table...> até </table> completo
        // Usar regex não-guloso para capturar a primeira tabela completa
        const tableMatch = afterLoop.match(/(<table[^>]*>[\s\S]*?<\/table>)/i);
        if (tableMatch) {
          tableToReplace = tableMatch[0];
          
          // Encontrar o <tbody> e o <tr> dentro para usar como template
          const tbodyMatch = tableMatch[0].match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
          if (tbodyMatch) {
            const trMatch = tbodyMatch[1].match(/(<tr[^>]*>[\s\S]*?<\/tr>)/i);
            if (trMatch) {
              loopContent = trMatch[1]; // Usar o <tr> completo como conteúdo do loop
            }
          }
        }
      }
      
      let itemsHtml = '';
      itens.forEach((item) => {
        let itemHtml = loopContent;
        
        // Substituir variáveis do item - processar TODAS as variáveis encontradas
        // Primeiro tenta com 4 chaves ({{{{var}}}}), depois com 2 ({{var}})
        // Regex melhorado para pegar variáveis mesmo com caracteres especiais
        const itemVars4 = itemHtml.match(/\{\{\{\{([^}]+)\}\}\}\}/g) || [];
        itemVars4.forEach(variavel => {
          const nomeVariavel = variavel.replace(/[{}]/g, '');
          // Converter array para string se necessário
          let valor = item[nomeVariavel];
          if (valor === undefined || valor === null) {
            valor = '';
          } else if (Array.isArray(valor)) {
            valor = valor.join(', ');
          } else {
            valor = String(valor);
          }
          // Escapar caracteres especiais para regex
          const nomeEscapado = nomeVariavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          itemHtml = itemHtml.replace(new RegExp(`\\{\\{\\{\\{${nomeEscapado}\\}\\}\\}\\}`, 'g'), valor);
        });
        
        // Depois processa variáveis com 2 chaves
        const itemVars2 = itemHtml.match(/\{\{([^}]+)\}\}/g) || [];
        itemVars2.forEach(variavel => {
          const nomeVariavel = variavel.replace(/[{}]/g, '');
          // Ignorar se já foi processado com 4 chaves ou se for #itens
          if (nomeVariavel === '#itens' || nomeVariavel === '/itens' || nomeVariavel.startsWith('#') || nomeVariavel.startsWith('/')) {
            return;
          }
          // Converter array para string se necessário
          let valor = item[nomeVariavel];
          if (valor === undefined || valor === null) {
            valor = '';
          } else if (Array.isArray(valor)) {
            valor = valor.join(', ');
          } else {
            valor = String(valor);
          }
          // Escapar caracteres especiais para regex
          const nomeEscapado = nomeVariavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          itemHtml = itemHtml.replace(new RegExp(`\\{\\{${nomeEscapado}\\}\\}`, 'g'), valor);
        });
        
        itemsHtml += itemHtml;
      });
      
      // Se encontrou tabela para substituir (loop vazio), substituir a tabela inteira
      if (tableToReplace) {
        // Encontrar a estrutura da tabela (table, thead, tbody)
        const tableMatch = tableToReplace.match(/(<table[^>]*>)([\s\S]*?)(<\/table>)/i);
        if (tableMatch) {
          const tableStart = tableMatch[1];
          const tableEnd = tableMatch[3];
          const tableContent = tableMatch[2];
          
          // Extrair thead se existir
          const theadMatch = tableContent.match(/(<thead[^>]*>[\s\S]*?<\/thead>)/i);
          const thead = theadMatch ? theadMatch[1] : '';
          
          // Gerar tbody com múltiplas linhas
          const tbodyMatch = tableContent.match(/<tbody[^>]*>/i);
          const tbodyStart = tbodyMatch ? tbodyMatch[0] : '<tbody>';
          const tbodyEnd = '</tbody>';
          
          // Montar nova tabela com thead + tbody com múltiplas linhas
          const newTable = tableStart + thead + tbodyStart + itemsHtml + tbodyEnd + tableEnd;
          
          // Substituir loop + tabela pelo conteúdo renderizado
          const toReplace = fullMatch + tableToReplace;
          const loopIndex = html.indexOf(fullMatch);
          if (loopIndex !== -1) {
            // Verificar se a tabela está logo após o loop (considerar espaços em branco)
            const afterLoop = html.substring(loopIndex + fullMatch.length);
            // Normalizar espaços em branco para comparação
            const afterLoopTrimmed = afterLoop.trim();
            const tableTrimmed = tableToReplace.trim();
            
            // Verificar se a tabela começa logo após (pode ter espaços/quebras de linha)
            if (afterLoopTrimmed.startsWith(tableTrimmed.substring(0, 30)) || afterLoop.includes('<table')) {
              // Calcular tamanho exato do que será substituído
              const beforeReplace = html.substring(0, loopIndex);
              const afterReplace = html.substring(loopIndex + toReplace.length);
              html = beforeReplace + newTable + afterReplace;
            } else {
              html = html.replace(fullMatch, itemsHtml);
            }
          } else {
            html = html.replace(fullMatch, itemsHtml);
          }
        } else {
          // Fallback: apenas substituir o loop
          html = html.replace(fullMatch, itemsHtml);
        }
      } else {
        // Substituir o loop completo pelo conteúdo renderizado
        html = html.replace(fullMatch, itemsHtml);
      }
      
      // Continuar procurando por mais loops
      // Resetar regex e buscar novamente no HTML atualizado
      itemLoopRegex.lastIndex = 0;
      
      // Tentar primeiro com 4 chaves
      itemLoopRegex = /\{\{\{\{#itens\}\}\}\}\s*([\s\S]*?)\s*\{\{\{\{\/itens\}\}\}\}/g;
      match = itemLoopRegex.exec(html);
      
      // Se não encontrou, tentar com 2 chaves
      if (!match) {
        itemLoopRegex = /\{\{#itens\}\}\s*([\s\S]*?)\s*\{\{\/itens\}\}/g;
        match = itemLoopRegex.exec(html);
      }
    }
    
    // Substituir variáveis simples do formato {{variavel}} ou {{{{variavel}}}}
    // Primeiro tenta com 4 chaves, depois com 2
    const variaveis4 = html.match(/\{\{\{\{([^}]+)\}\}\}\}/g) || [];
    variaveis4.forEach(variavel => {
      const nomeVariavel = variavel.replace(/[{}]/g, '');
      if (nomeVariavel === '#itens' || nomeVariavel === '/itens' || nomeVariavel.startsWith('#') || nomeVariavel.startsWith('/')) {
        return;
      }
      // Converter array para string se necessário
      let valor = dados[nomeVariavel];
      if (valor === undefined || valor === null) {
        valor = '';
      } else if (Array.isArray(valor)) {
        valor = valor.join(', ');
      } else {
        valor = String(valor);
      }
      const nomeEscapado = nomeVariavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`\\{\\{\\{\\{${nomeEscapado}\\}\\}\\}\\}`, 'g'), valor);
    });
    
    const variaveis2 = html.match(/\{\{([^}]+)\}\}/g) || [];
    variaveis2.forEach(variavel => {
      const nomeVariavel = variavel.replace(/[{}]/g, '');
      // Ignorar se for um loop ou variável já processada
      if (nomeVariavel === 'itens' || nomeVariavel === '#itens' || nomeVariavel === '/itens' || nomeVariavel.startsWith('#') || nomeVariavel.startsWith('/')) {
        return;
      }
      
      // Variáveis que só existem nos itens - não devem ser procuradas nos dados principais
      // Se aparecerem aqui, significa que não foram substituídas no loop (erro no template)
      const variaveisApenasItens = [
        'saldo_disponivel', 'quantidade_utilizada', 'quantidade_formatada', 
        'produto_codigo', 'produto_nome', 'codigo_produto', 'nome_produto',
        'unidade_simbolo', 'unidade_nome', 'observacao', 'pedidos_vinculados',
        'item_criado_em', 'solicitacao_id', 'produto_id', 'unidade_medida_id'
      ];
      
      if (variaveisApenasItens.includes(nomeVariavel)) {
        // Variável de item encontrada fora do loop - substituir por string vazia silenciosamente
        // (não gerar warning, pois é esperado que apareça no HTML após o loop)
        const nomeEscapado = nomeVariavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        html = html.replace(new RegExp(`\\{\\{${nomeEscapado}\\}\\}`, 'g'), '');
        return;
      }
      
      // Converter array para string se necessário
      let valor = dados[nomeVariavel];
      if (valor === undefined || valor === null) {
        valor = '';
      } else if (Array.isArray(valor)) {
        valor = valor.join(', ');
      } else {
        valor = String(valor);
      }
      const nomeEscapado = nomeVariavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`\\{\\{${nomeEscapado}\\}\\}`, 'g'), valor);
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
   * Preparar dados para template (método genérico que chama o preparador específico da tela)
   * @param {string} tela - Nome da tela (ex: 'solicitacoes-compras', 'pedidos-compras', 'relatorio-inspecao')
   * @param {Object} dadosPrincipais - Dados principais da entidade
   * @param {Array} itens - Array de itens
   * @param {Array|Object} dadosAdicionais - Dados adicionais (varia por tela)
   * @returns {Object} - Dados preparados para o template
   */
  static prepararDados(tela, dadosPrincipais, itens, dadosAdicionais = []) {
    const { obterPreparador, existePreparador } = require('./preparadoresDados');
    
    if (!existePreparador(tela)) {
      console.error(`[ERROR] Preparador de dados não encontrado para a tela: ${tela}`);
      throw new Error(`Preparador de dados não encontrado para a tela: ${tela}`);
    }
    
    const preparador = obterPreparador(tela);
    
    // Chamar método preparar do preparador específico
    // Todos os preparadores seguem a mesma assinatura: preparar(dadosPrincipais, itens, dadosAdicionais)
    return preparador.preparar(dadosPrincipais, itens, dadosAdicionais);
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

