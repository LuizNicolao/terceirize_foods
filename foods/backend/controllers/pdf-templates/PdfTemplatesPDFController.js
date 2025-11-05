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
    
    // Debug: log inicial detalhado
    console.log('[DEBUG Template] ========================================');
    console.log('[DEBUG Template] Iniciando renderização do template');
    console.log('[DEBUG Template] Tamanho do HTML:', html.length);
    console.log('[DEBUG Template] Número de itens nos dados:', dados.itens?.length || 0);
    console.log('[DEBUG Template] Dados principais disponíveis:', {
      numero_solicitacao: dados.numero_solicitacao,
      total_itens: dados.total_itens,
      valor_total: dados.valor_total,
      pedidos_vinculados: dados.pedidos_vinculados,
      solicitante: dados.solicitante,
      filial_nome: dados.filial_nome,
      data_documento: dados.data_documento
    });
    console.log('[DEBUG Template] Todas as chaves disponíveis nos dados:', Object.keys(dados).slice(0, 30));
    if (dados.itens && dados.itens.length > 0) {
      console.log('[DEBUG Template] Chaves do primeiro item:', Object.keys(dados.itens[0]));
      console.log('[DEBUG Template] Primeiro item (amostra):', {
        id: dados.itens[0].id,
        produto_nome: dados.itens[0].produto_nome,
        quantidade: dados.itens[0].quantidade,
        quantidade_formatada: dados.itens[0].quantidade_formatada,
        pedidos_vinculados: dados.itens[0].pedidos_vinculados
      });
    }
    console.log('[DEBUG Template] ========================================');
    
    // Processar loops de itens ({{#itens}}...{{/itens}} ou {{{{#itens}}}}...{{{{/itens}}}})
    // Aceita tanto 2 quanto 4 chaves (devido ao escape do CKEditor)
    // Primeiro tenta com 4 chaves, depois com 2
    // Regex melhorado para aceitar espaços/whitespace entre as tags
    let itemLoopRegex = /\{\{\{\{#itens\}\}\}\}\s*([\s\S]*?)\s*\{\{\{\{\/itens\}\}\}\}/g;
    let match = itemLoopRegex.exec(html);
    
    if (!match) {
      // Se não encontrou com 4 chaves, tenta com 2
      itemLoopRegex = /\{\{#itens\}\}\s*([\s\S]*?)\s*\{\{\/itens\}\}/g;
      match = itemLoopRegex.exec(html);
    }
    
    while (match) {
      let loopContent = match[1].trim(); // Remover espaços em branco do início/fim
      const itens = dados.itens || [];
      
      console.log('[DEBUG Template] Loop encontrado:', {
        matchLength: match[0].length,
        contentLength: loopContent.length,
        contentPreview: loopContent.substring(0, 100),
        itensCount: itens.length
      });
      
      // Se o conteúdo do loop estiver vazio ou for apenas espaços, procurar pela tabela logo após
      let tableToReplace = null;
      if (!loopContent || loopContent.trim().length === 0) {
        // Tentar encontrar a tabela HTML logo após o loop
        const loopIndex = html.indexOf(match[0]);
        const afterLoop = html.substring(loopIndex + match[0].length);
        
        // Procurar por <table...> até </table> completo
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
      itens.forEach((item, index) => {
        let itemHtml = loopContent;
        
        // Debug: log primeiro item
        if (index === 0) {
          console.log('[DEBUG Template] Processando primeiro item:', {
            id: item.id,
            produto_codigo: item.produto_codigo,
            produto_nome: item.produto_nome,
            quantidade: item.quantidade,
            quantidade_formatada: item.quantidade_formatada,
            quantidade_utilizada: item.quantidade_utilizada,
            quantidade_utilizada_formatada: item.quantidade_utilizada_formatada,
            saldo_disponivel: item.saldo_disponivel,
            saldo_disponivel_formatado: item.saldo_disponivel_formatado,
            pedidos_vinculados: item.pedidos_vinculados,
            pedidos_vinculados_lista: item.pedidos_vinculados_lista,
            unidade: item.unidade,
            unidade_simbolo: item.unidade_simbolo,
            observacao: item.observacao
          });
          console.log('[DEBUG Template] Todas as chaves do primeiro item:', Object.keys(item));
        }
        
        // Substituir variáveis do item - processar TODAS as variáveis encontradas
        // Primeiro tenta com 4 chaves ({{{{var}}}}), depois com 2 ({{var}})
        // Regex melhorado para pegar variáveis mesmo com caracteres especiais
        const itemVars4 = itemHtml.match(/\{\{\{\{([^}]+)\}\}\}\}/g) || [];
        if (index === 0 && itemVars4.length > 0) {
          console.log('[DEBUG Template] Variáveis com 4 chaves encontradas no item:', itemVars4.slice(0, 10));
        }
        itemVars4.forEach(variavel => {
          const nomeVariavel = variavel.replace(/[{}]/g, '');
          // Converter array para string se necessário
          let valor = item[nomeVariavel];
          if (valor === undefined || valor === null) {
            if (index === 0) {
              console.warn(`[DEBUG Template] ⚠️ Item[${nomeVariavel}] não encontrado. Chaves disponíveis:`, Object.keys(item).slice(0, 20));
            }
            valor = '';
          } else if (Array.isArray(valor)) {
            valor = valor.join(', ');
          } else {
            valor = String(valor);
          }
          if (index === 0) {
            console.log(`[DEBUG Template] Item[${nomeVariavel}]:`, valor, `(tipo original: ${typeof item[nomeVariavel]})`);
          }
          // Escapar caracteres especiais para regex
          const nomeEscapado = nomeVariavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          itemHtml = itemHtml.replace(new RegExp(`\\{\\{\\{\\{${nomeEscapado}\\}\\}\\}\\}`, 'g'), valor);
        });
        
        // Depois processa variáveis com 2 chaves
        const itemVars2 = itemHtml.match(/\{\{([^}]+)\}\}/g) || [];
        if (index === 0 && itemVars2.length > 0) {
          console.log('[DEBUG Template] Variáveis com 2 chaves encontradas no item:', itemVars2.slice(0, 10));
        }
        itemVars2.forEach(variavel => {
          const nomeVariavel = variavel.replace(/[{}]/g, '');
          // Ignorar se já foi processado com 4 chaves ou se for #itens
          if (nomeVariavel === '#itens' || nomeVariavel === '/itens' || nomeVariavel.startsWith('#') || nomeVariavel.startsWith('/')) {
            return;
          }
          // Converter array para string se necessário
          let valor = item[nomeVariavel];
          if (valor === undefined || valor === null) {
            if (index === 0) {
              console.warn(`[DEBUG Template] ⚠️ Item[${nomeVariavel}] não encontrado. Chaves disponíveis:`, Object.keys(item).slice(0, 20));
            }
            valor = '';
          } else if (Array.isArray(valor)) {
            valor = valor.join(', ');
          } else {
            valor = String(valor);
          }
          if (index === 0) {
            console.log(`[DEBUG Template] Item[${nomeVariavel}]:`, valor, `(tipo original: ${typeof item[nomeVariavel]})`);
          }
          // Escapar caracteres especiais para regex
          const nomeEscapado = nomeVariavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          itemHtml = itemHtml.replace(new RegExp(`\\{\\{${nomeEscapado}\\}\\}`, 'g'), valor);
        });
        
        itemsHtml += itemHtml;
      });
      
      console.log('[DEBUG Template] HTML gerado para itens:', {
        itemsCount: itens.length,
        htmlLength: itemsHtml.length,
        htmlPreview: itemsHtml.substring(0, 200)
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
          
          console.log('[DEBUG Template] Substituindo tabela:', {
            oldLength: (match[0] + tableToReplace).length,
            newLength: newTable.length,
            itemsInTable: itemsHtml.split('</tr>').length - 1
          });
          
          // Substituir loop + tabela pelo conteúdo renderizado
          html = html.replace(match[0] + tableToReplace, newTable);
        } else {
          // Fallback: apenas substituir o loop
          html = html.replace(match[0], itemsHtml);
        }
      } else {
        // Substituir o loop completo pelo conteúdo renderizado
        html = html.replace(match[0], itemsHtml);
      }
      
      // Continuar procurando por mais loops
      match = itemLoopRegex.exec(html);
    }
    
    // Substituir variáveis simples do formato {{variavel}} ou {{{{variavel}}}}
    // Primeiro tenta com 4 chaves, depois com 2
    const variaveis4 = html.match(/\{\{\{\{([^}]+)\}\}\}\}/g) || [];
    console.log('[DEBUG Template] Variáveis com 4 chaves encontradas:', variaveis4.length);
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
    console.log('[DEBUG Template] Variáveis com 2 chaves encontradas:', variaveis2.length);
    const variaveisUnicas = [...new Set(variaveis2.map(v => v.replace(/[{}]/g, '')))];
    console.log('[DEBUG Template] Variáveis únicas encontradas (primeiras 20):', variaveisUnicas.slice(0, 20));
    
    variaveis2.forEach(variavel => {
      const nomeVariavel = variavel.replace(/[{}]/g, '');
      // Ignorar se for um loop ou variável já processada
      if (nomeVariavel === 'itens' || nomeVariavel === '#itens' || nomeVariavel === '/itens' || nomeVariavel.startsWith('#') || nomeVariavel.startsWith('/')) {
        return;
      }
      // Converter array para string se necessário
      let valor = dados[nomeVariavel];
      if (valor === undefined || valor === null) {
        console.warn(`[DEBUG Template] ⚠️ Variável '${nomeVariavel}' não encontrada nos dados principais. Chaves disponíveis:`, Object.keys(dados).slice(0, 30));
        valor = '';
      } else if (Array.isArray(valor)) {
        valor = valor.join(', ');
      } else {
        valor = String(valor);
      }
      console.log(`[DEBUG Template] Dados[${nomeVariavel}]:`, valor, `(tipo original: ${typeof dados[nomeVariavel]})`);
      const nomeEscapado = nomeVariavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`\\{\\{${nomeEscapado}\\}\\}`, 'g'), valor);
    });
    
    // Debug: verificar se ainda há variáveis não substituídas
    const variaveisRestantes = html.match(/\{\{([^}]+)\}\}/g) || [];
    if (variaveisRestantes.length > 0) {
      const variaveisUnicasRestantes = [...new Set(variaveisRestantes.map(v => v.replace(/[{}]/g, '')))];
      console.warn('[DEBUG Template] ⚠️ Variáveis não substituídas após processamento:', variaveisUnicasRestantes.slice(0, 30));
      console.warn('[DEBUG Template] ⚠️ Isso pode indicar que a variável não existe nos dados ou foi escrita incorretamente');
    } else {
      console.log('[DEBUG Template] ✅ Todas as variáveis foram substituídas com sucesso');
    }
    
    console.log('[DEBUG Template] Renderização concluída. Tamanho final do HTML:', html.length);
    console.log('[DEBUG Template] ========================================');
    
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
    console.log('[DEBUG prepararDados] ========================================');
    console.log('[DEBUG prepararDados] Preparando dados para template');
    console.log('[DEBUG prepararDados] Solicitacao recebida:', {
      id: solicitacao?.id,
      numero_solicitacao: solicitacao?.numero_solicitacao,
      justificativa: solicitacao?.justificativa?.substring(0, 50),
      usuario_nome: solicitacao?.usuario_nome,
      filial_nome: solicitacao?.filial_nome
    });
    console.log('[DEBUG prepararDados] Número de itens recebidos:', itens?.length || 0);
    console.log('[DEBUG prepararDados] Pedidos vinculados:', pedidosVinculados?.map(p => p.numero_pedido) || []);
    return {
      // Campos principais da solicitação
      id: solicitacao.id || '',
      numero_solicitacao: solicitacao.numero_solicitacao || '',
      descricao: solicitacao.descricao || solicitacao.justificativa || '',
      motivo: solicitacao.motivo || solicitacao.justificativa || '',
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
      
      // Filial
      filial_id: solicitacao.filial_id || '',
      filial_nome: solicitacao.filial_nome || solicitacao.unidade || '',
      filial_codigo: solicitacao.filial_codigo || '',
      unidade: solicitacao.unidade || '',
      
      // Usuário/Solicitante
      usuario_id: solicitacao.usuario_id || solicitacao.criado_por || '',
      criado_por: solicitacao.criado_por ? String(solicitacao.criado_por) : '',
      criado_por_nome: solicitacao.usuario_nome_from_user || solicitacao.usuario_nome || '',
      solicitante_nome: solicitacao.usuario_nome_from_user || solicitacao.usuario_nome || solicitacao.solicitante || '',
      solicitante: solicitacao.solicitante || solicitacao.usuario_nome_from_user || solicitacao.usuario_nome || '',
      usuario_email: solicitacao.usuario_email || '',
      
      // Pedidos vinculados
      pedidos_vinculados: pedidosVinculados.map(p => p.numero_pedido).join(', '),
      pedidos_vinculados_lista: pedidosVinculados.map(p => p.numero_pedido),
      
      // Dados para itens (pode ser usado em loops no template)
      itens: itens.map((item, index) => {
        const quantidade = parseFloat(item.quantidade || 0);
        const quantidadeUtilizada = parseFloat(item.quantidade_utilizada || 0);
        const saldoDisponivel = parseFloat(item.saldo_disponivel || 0);
        const pedidosVinculadosItem = item.pedidos_vinculados || [];
        
        // Extrair números dos pedidos vinculados
        let pedidosNumeros = '';
        if (Array.isArray(pedidosVinculadosItem) && pedidosVinculadosItem.length > 0) {
          // Se for array de objetos com propriedade 'numero'
          const numeros = pedidosVinculadosItem
            .map(p => {
              if (typeof p === 'object' && p !== null) {
                return p.numero || p.numero_pedido || '';
              }
              return String(p || '');
            })
            .filter(p => p && p.trim() !== '');
          pedidosNumeros = numeros.join(', ');
        } else if (typeof pedidosVinculadosItem === 'string') {
          pedidosNumeros = pedidosVinculadosItem;
        }
        
        return {
          id: item.id || '',
          solicitacao_id: item.solicitacao_id || '',
          produto_id: item.produto_id || '',
          produto_codigo: item.produto_codigo || item.codigo_produto || '',
          produto_nome: item.produto_nome || item.nome_produto || '',
          codigo_produto: item.produto_codigo || item.codigo_produto || '',
          nome_produto: item.produto_nome || item.nome_produto || '',
          quantidade: quantidade,
          quantidade_formatada: quantidade.toFixed(3).replace('.', ','),
          // Para compatibilidade: quantidade_utilizada também formatada por padrão
          quantidade_utilizada: quantidadeUtilizada.toFixed(3).replace('.', ','),
          quantidade_utilizada_formatada: quantidadeUtilizada.toFixed(3).replace('.', ','),
          // Para compatibilidade: saldo_disponivel também formatado por padrão
          saldo_disponivel: saldoDisponivel.toFixed(3).replace('.', ','),
          saldo_disponivel_formatado: saldoDisponivel.toFixed(3).replace('.', ','),
          status: item.status_item || item.status || 'ABERTO',
          unidade_medida_id: item.unidade_medida_id || '',
          unidade: item.unidade_simbolo || item.unidade_medida || item.unidade_nome || '',
          unidade_simbolo: item.unidade_simbolo || item.unidade_medida || '',
          unidade_nome: item.unidade_nome || '',
          observacao: item.observacao || item.observacao_item || '',
          pedidos_vinculados: pedidosNumeros,
          // pedidos_vinculados_lista como string separada por vírgula (mesmo valor de pedidos_vinculados)
          pedidos_vinculados_lista: pedidosNumeros,
          item_criado_em: item.item_criado_em ? new Date(item.item_criado_em).toLocaleDateString('pt-BR') : ''
        };
      }),
      
      // Estatísticas dos itens
      total_itens: itens.length,
      total_quantidade: itens.reduce((sum, item) => sum + parseFloat(item.quantidade || 0), 0).toFixed(3).replace('.', ','),
      valor_total: '0,00' // Campo não existe na tabela solicitacoes_compras, mas mantido para compatibilidade
    };
    
    console.log('[DEBUG prepararDados] Dados preparados. Chaves principais:', Object.keys(retorno).slice(0, 30));
    console.log('[DEBUG prepararDados] Valores principais:', {
      numero_solicitacao: retorno.numero_solicitacao,
      solicitante: retorno.solicitante,
      pedidos_vinculados: retorno.pedidos_vinculados,
      total_itens: retorno.total_itens,
      valor_total: retorno.valor_total
    });
    console.log('[DEBUG prepararDados] Número de itens preparados:', retorno.itens?.length || 0);
    if (retorno.itens && retorno.itens.length > 0) {
      console.log('[DEBUG prepararDados] Primeiro item preparado:', {
        produto_nome: retorno.itens[0].produto_nome,
        quantidade_formatada: retorno.itens[0].quantidade_formatada,
        pedidos_vinculados: retorno.itens[0].pedidos_vinculados
      });
      console.log('[DEBUG prepararDados] Todas as chaves do primeiro item:', Object.keys(retorno.itens[0]));
    }
    console.log('[DEBUG prepararDados] ========================================');
    
    return retorno;
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

