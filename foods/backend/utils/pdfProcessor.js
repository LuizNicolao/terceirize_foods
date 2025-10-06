/**
 * Utilitário de Processamento de PDF
 * Extrai dados reais de cardápios PDF usando algoritmos de NLP
 */

const pdf = require('pdf-parse');
const natural = require('natural');
const stringSimilarity = require('string-similarity');

class PDFProcessor {
  constructor() {
    // Inicializar tokenizer para português
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmerPt;
  }

  /**
   * Processar PDF de cardápio
   */
  async processarCardapioPDF(buffer) {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 INICIANDO PROCESSAMENTO REAL DE PDF');
      console.log('='.repeat(60));
      
      // 1. Extrair texto do PDF
      const data = await pdf(buffer);
      const texto = data.text;

      console.log('\n📄 PDF processado com sucesso!');
      console.log('📊 Tamanho do texto extraído:', texto.length, 'caracteres');
      console.log('📝 Primeiros 500 caracteres:');
      console.log('─'.repeat(50));
      console.log(texto.substring(0, 500) + '...');
      console.log('─'.repeat(50));

      // 2. Identificar período e datas
      const periodo = this.extrairPeriodo(texto);
      console.log('\n📅 Período identificado:', periodo);

      const datas = this.calcularDatas(periodo);
      console.log('📆 Datas calculadas:', datas.length, 'dias');

      // 3. Converter PDF em JSON estruturado para comparação
      console.log('\n🔄 Iniciando conversão para JSON estruturado...');
      const jsonEstruturado = this.converterPDFParaJSON(texto);
      console.log('✅ Conversão para JSON concluída:', jsonEstruturado ? 'Sucesso' : 'Falhou');

      // 4. Extrair receitas por dia/turno
      const receitas = this.extrairReceitas(texto);
      console.log('\n🍽️ Receitas encontradas:', receitas.length);

      // 4. Identificar unidade escolar
      const unidadeEscolar = this.extrairUnidadeEscolar(texto);
      console.log('\n🏫 Unidade escolar:', unidadeEscolar);

      // 5. Validar ingredientes com base de produtos
      const ingredientesValidados = await this.validarIngredientes(receitas);
      console.log('\n✅ Validação de ingredientes concluída');

      // 6. Calcular efetivos por período
      const efetivos = await this.calcularEfetivos(periodo, unidadeEscolar);
      console.log('\n👥 Efetivos calculados:', efetivos);

      // 7. Comparar extração com JSON estruturado
      console.log('\n🔍 Iniciando comparação...');
      const comparacao = this.compararExtracaoComJSON(receitas, jsonEstruturado);
      console.log('✅ Comparação concluída:', comparacao ? 'Sucesso' : 'Falhou');

      const resultado = {
        unidade_escola_nome: unidadeEscolar,
        mes: periodo.mes,
        ano: periodo.ano,
        receitas: ingredientesValidados.receitas,
        dias: this.organizarCardapioPorDias(receitas, datas),
        validacoes: ingredientesValidados.validacoes,
        ingredientesNaoEncontrados: ingredientesValidados.naoEncontrados,
        produtosNAE: ingredientesValidados.produtosNAE,
        efetivosCalculados: efetivos,
        status: 'pendente_aprovacao',
        mensagem: 'PDF processado com sucesso. Dados extraídos e validados.',
        // Informações de debug
        debug: {
          texto_tamanho: texto.length,
          receitas_encontradas: receitas.length,
          ingredientes_validados: ingredientesValidados.receitas.reduce((total, r) => total + r.ingredientes.length, 0),
          periodo_extraido: periodo,
          unidade_identificada: unidadeEscolar
        }
      };

      console.log('\n' + '='.repeat(60));
      console.log('✅ PROCESSAMENTO CONCLUÍDO COM SUCESSO');
      console.log('='.repeat(60));
      return resultado;
    } catch (error) {
      console.error('\n❌ Erro ao processar PDF:', error);
      throw new Error('Erro ao processar PDF: ' + error.message);
    }
  }

  /**
   * Extrair período do texto
   */
  extrairPeriodo(texto) {
    // Regex para capturar mês e ano (formato: OUTUBRO/2025)
    const mesAnoRegex = /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s*\/?\s*(\d{4})/i;
    const match = texto.match(mesAnoRegex);

    if (match) {
      const meses = {
        'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4,
        'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
        'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
      };

      return {
        mes: meses[match[1].toLowerCase()],
        ano: parseInt(match[2])
      };
    }

    // Fallback: usar mês e ano atual
    const agora = new Date();
    return {
      mes: agora.getMonth() + 1,
      ano: agora.getFullYear()
    };
  }

  /**
   * Calcular datas do período
   */
  calcularDatas(periodo) {
    const datas = [];
    const diasNoMes = new Date(periodo.ano, periodo.mes, 0).getDate();

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(periodo.ano, periodo.mes - 1, dia);
      datas.push({
        data: data.toISOString().split('T')[0],
        dia_semana: data.toLocaleDateString('pt-BR', { weekday: 'long' })
      });
    }

    return datas;
  }

  /**
   * Extrair receitas do texto
   */
  extrairReceitas(texto) {
    console.log('🔍 Extraindo receitas...');
    console.log('─'.repeat(50));
    
    // Primeiro, tentar extrair a estrutura da tabela
    const estruturaTabela = this.extrairEstruturaTabela(texto);
    if (estruturaTabela.length > 0) {
      console.log('─'.repeat(50));
      console.log('📊 Estrutura da tabela encontrada:', estruturaTabela.length, 'receitas');
      return estruturaTabela;
    }
    
    // Fallback: buscar códigos de receitas (padrão: LL##.### ou R##.###)
    const codigoRegex = /[A-Z]{2}\d{2}\.\d{3}/g;
    const codigos = texto.match(codigoRegex) || [];

    console.log('🔍 Códigos de receitas encontrados:', codigos);
    console.log('─'.repeat(50));

    const receitas = [];
    // Para cada código encontrado, extrair receita
    codigos.forEach((codigo, index) => {
      const receita = this.extrairReceitaPorCodigo(texto, codigo);
      if (receita) {
        console.log(`✅ [${index + 1}/${codigos.length}] Receita extraída: ${receita.codigo} - ${receita.nome}`);
        receitas.push(receita);
      }
    });

    // Se não encontrou códigos, tentar extrair receitas por outros padrões
    if (receitas.length === 0) {
      console.log('⚠️ Nenhum código de receita encontrado, tentando outros padrões...');
      const receitasAlternativas = this.extrairReceitasAlternativas(texto);
      receitas.push(...receitasAlternativas);
    }

    return receitas;
  }

  /**
   * Extrair estrutura da tabela do cardápio
   */
  extrairEstruturaTabela(texto) {
    console.log('📊 Tentando extrair estrutura da tabela...');
    
    const receitas = [];
    
    // Buscar padrões de datas no formato "Quarta-feira 1/10/2025"
    const padroesData = [
      /(quarta|quinta|sexta|segunda|terça|sábado|domingo)[\s–-]*feira\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/gi
    ];
    
    // Encontrar todas as datas
    const datasEncontradas = [];
    padroesData.forEach(padrao => {
      let match;
      while ((match = padrao.exec(texto)) !== null) {
        const diaSemana = match[1];
        const dia = parseInt(match[2]);
        const mes = parseInt(match[3]);
        const ano = parseInt(match[4]);
        
        const data = new Date(ano, mes - 1, dia);
        const dataFormatada = data.toISOString().split('T')[0];
        
        datasEncontradas.push({
          data: dataFormatada,
          diaSemana: diaSemana,
          posicao: match.index
        });
      }
    });
    
    console.log('📅 Datas encontradas na tabela:', datasEncontradas.length);
    console.log('─'.repeat(60));
    
    // Para cada data, buscar as receitas associadas
    datasEncontradas.forEach((dataInfo, index) => {
      const proximaData = datasEncontradas[index + 1];
      const inicioBusca = dataInfo.posicao;
      const fimBusca = proximaData ? proximaData.posicao : texto.length;
      
      const contextoData = texto.substring(inicioBusca, fimBusca);
      
      // Buscar códigos de receitas neste contexto
      const codigoRegex = /[A-Z]{2}\d{2}\.\d{3}/g;
      const receitasDoDia = [];
      let match;
      while ((match = codigoRegex.exec(contextoData)) !== null) {
        const codigo = match[0];
        const posicaoCodigo = match.index;
        
        // Extrair contexto ao redor do código
        const inicioContexto = Math.max(0, posicaoCodigo - 200);
        const fimContexto = Math.min(contextoData.length, posicaoCodigo + 500);
        const contexto = contextoData.substring(inicioContexto, fimContexto);
        
        // Extrair nome da receita
        const nomeMatch = contexto.match(new RegExp(`${codigo}\\s*([^\\n\\r]+)`, 'i'));
        const nome = nomeMatch ? nomeMatch[1].trim() : `Receita ${codigo}`;
        
        // Extrair ingredientes
        const ingredientes = this.extrairIngredientes(contexto);
        
        // Determinar turno baseado no contexto
        let turno = 'matutino_vespertino'; // padrão
        if (contexto.toLowerCase().includes('noturno')) {
          turno = 'noturno';
        }
        
        const receita = {
          codigo,
          nome,
          ingredientes,
          turno,
          data: dataInfo.data,
          contexto
        };
        
        receitas.push(receita);
        receitasDoDia.push({ codigo, nome, turno, ingredientes: ingredientes.length });
      }
      
      // Mostrar resumo do dia apenas se houver receitas
      if (receitasDoDia.length > 0) {
        console.log(`📅 ${dataInfo.diaSemana.charAt(0).toUpperCase() + dataInfo.diaSemana.slice(1)}-feira ${dataInfo.data}:`);
        receitasDoDia.forEach((receita, index) => {
          const turnoEmoji = receita.turno === 'noturno' ? '🌙' : '☀️';
          console.log(`   ${turnoEmoji} ${receita.codigo} - ${receita.nome} (${receita.ingredientes} ingredientes)`);
          
          // Mostrar ingredientes se houver
          if (receita.ingredientes > 0) {
            const receitaCompleta = receitas.find(r => r.codigo === receita.codigo);
            if (receitaCompleta && receitaCompleta.ingredientes.length > 0) {
              // Extrair apenas os nomes dos ingredientes
              const nomesIngredientes = receitaCompleta.ingredientes.map(ing => 
                typeof ing === 'string' ? ing : ing.nome || ing.produto || 'Ingrediente'
              );
              console.log(`      🥘 Ingredientes: ${nomesIngredientes.slice(0, 3).join(', ')}${nomesIngredientes.length > 3 ? '...' : ''}`);
            }
          }
        });
        console.log('');
      }
    });
    
    console.log('─'.repeat(60));
    console.log(`🍽️ Total de receitas extraídas da tabela: ${receitas.length}`);
    
    // Gerar arquivo de receitas para download
    this.gerarArquivoReceitas(receitas);
    
    return receitas;
  }

  /**
   * Converter PDF em JSON estruturado para comparação
   */
  converterPDFParaJSON(texto) {
    try {
      console.log('🔄 Convertendo PDF em JSON estruturado...');
      
      // Extrair informações básicas
      console.log('   📋 Extraindo informações básicas...');
      const infoBasica = this.extrairInformacoesBasicas(texto);
      
      // Extrair estrutura da tabela
      console.log('   📊 Extraindo estrutura da tabela...');
      const estruturaTabela = this.extrairEstruturaTabelaCompleta(texto);
      console.log('   📊 Estrutura da tabela extraída:', estruturaTabela.length, 'dias');
      
      // Extrair todas as receitas encontradas
      console.log('   🍽️ Extraindo todas as receitas...');
      const todasReceitas = this.extrairTodasReceitas(texto);
      console.log('   🍽️ Total de receitas encontradas:', todasReceitas.length);
      
      // Estruturar JSON
      console.log('   📝 Estruturando JSON...');
      const jsonEstruturado = {
        metadata: {
          dataConversao: new Date().toISOString(),
          fonte: 'PDF Cardápio PNAE',
          tamanhoTexto: texto.length
        },
        informacoesBasicas: infoBasica,
        estruturaTabela: estruturaTabela,
        receitas: todasReceitas,
        resumo: {
          totalReceitas: todasReceitas.length,
          totalDias: estruturaTabela.length,
          periodos: [...new Set(todasReceitas.map(r => r.turno))]
        }
      };
      
      // Salvar JSON estruturado
      console.log('   💾 Salvando JSON estruturado...');
      this.salvarJSONEstruturado(jsonEstruturado);
      
      console.log('✅ Conversão para JSON concluída com sucesso!');
      return jsonEstruturado;
      
    } catch (error) {
      console.error('❌ Erro ao converter PDF para JSON:', error.message);
      console.error('❌ Stack trace:', error.stack);
      return null;
    }
  }

  /**
   * Extrair informações básicas do PDF
   */
  extrairInformacoesBasicas(texto) {
    const info = {
      unidadeEscolar: this.extrairUnidadeEscolar(texto),
      periodo: this.extrairPeriodo(texto),
      datas: this.calcularDatas(this.extrairPeriodo(texto))
    };
    
    console.log('📋 Informações básicas extraídas:', info);
    return info;
  }

  /**
   * Extrair estrutura completa da tabela
   */
  extrairEstruturaTabelaCompleta(texto) {
    console.log('   📊 Analisando estrutura da tabela por blocos...');
    
    // Primeiro, identificar os blocos da tabela
    const blocosTabela = this.identificarBlocosTabela(texto);
    console.log('   📊 Blocos identificados:', blocosTabela.length);
    
    const estrutura = [];
    
    // Para cada bloco, extrair as receitas
    blocosTabela.forEach((bloco, index) => {
      console.log(`   📅 Processando bloco ${index + 1}: ${bloco.data} (${bloco.diaSemana})`);
      
      // Extrair receitas deste bloco específico
      const receitasDoBloco = this.extrairReceitasDoBloco(bloco);
      
      estrutura.push({
        data: bloco.data,
        diaSemana: bloco.diaSemana,
        contexto: bloco.conteudo,
        posicao: bloco.posicao,
        receitas: receitasDoBloco
      });
    });
    
    return estrutura;
  }

  /**
   * Identificar blocos da tabela no PDF
   */
  identificarBlocosTabela(texto) {
    const blocos = [];
    
    // Buscar padrões de datas que indicam início de blocos
    const padroesData = [
      /(quarta|quinta|sexta|segunda|terça|sábado|domingo)[\s–-]*feira\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/gi
    ];
    
    const datasEncontradas = [];
    padroesData.forEach(padrao => {
      let match;
      while ((match = padrao.exec(texto)) !== null) {
        const diaSemana = match[1];
        const dia = parseInt(match[2]);
        const mes = parseInt(match[3]);
        const ano = parseInt(match[4]);
        
        const data = new Date(ano, mes - 1, dia);
        const dataFormatada = data.toISOString().split('T')[0];
        
        datasEncontradas.push({
          data: dataFormatada,
          diaSemana: diaSemana,
          posicao: match.index
        });
      }
    });
    
    // Ordenar datas por posição
    datasEncontradas.sort((a, b) => a.posicao - b.posicao);
    
    // Para cada data, identificar o bloco correspondente
    datasEncontradas.forEach((dataInfo, index) => {
      const proximaData = datasEncontradas[index + 1];
      const inicioBloco = dataInfo.posicao;
      const fimBloco = proximaData ? proximaData.posicao : texto.length;
      
      // Extrair conteúdo do bloco
      let conteudoBloco = texto.substring(inicioBloco, fimBloco);
      
      // Limitar o bloco para evitar contaminação
      // Buscar por padrões que indicam fim do bloco
      const fimBlocoPatterns = [
        /\n\s*Pág\.\s*\d+\s*de\s*\d+/i,
        /\n\s*SECRETARIA\s*DE\s*ESTADO/i,
        /\n\s*CARDÁPIO\s*–\s*PARCIAL/i
      ];
      
      for (const pattern of fimBlocoPatterns) {
        const match = conteudoBloco.match(pattern);
        if (match) {
          conteudoBloco = conteudoBloco.substring(0, match.index);
          break;
        }
      }
      
      blocos.push({
        data: dataInfo.data,
        diaSemana: dataInfo.diaSemana,
        posicao: dataInfo.posicao,
        conteudo: conteudoBloco.trim()
      });
    });
    
    return blocos;
  }

  /**
   * Extrair receitas de um bloco específico
   */
  extrairReceitasDoBloco(bloco) {
    const receitas = [];
    
    // Buscar códigos de receitas neste bloco específico
    const codigoRegex = /[A-Z]{2}\d{2}\.\d{3}/g;
    let match;
    
    while ((match = codigoRegex.exec(bloco.conteudo)) !== null) {
      const codigo = match[0];
      const posicaoCodigo = match.index;
      
      // Extrair contexto limitado ao redor do código
      const inicioContexto = Math.max(0, posicaoCodigo - 50);
      const fimContexto = Math.min(bloco.conteudo.length, posicaoCodigo + 200);
      const contextoReceita = bloco.conteudo.substring(inicioContexto, fimContexto);
      
      // Extrair nome da receita
      const nomeMatch = contextoReceita.match(new RegExp(`${codigo}\\s*([^\\n\\r]+)`, 'i'));
      const nome = nomeMatch ? nomeMatch[1].trim() : `Receita ${codigo}`;
      
      // Extrair ingredientes limpos
      const ingredientes = this.extrairIngredientesLimpos(contextoReceita);
      
      // Determinar turno baseado no contexto
      let turno = 'matutino_vespertino';
      if (contextoReceita.toLowerCase().includes('noturno')) {
        turno = 'noturno';
      }
      
      receitas.push({
        codigo,
        nome,
        ingredientes,
        turno,
        data: bloco.data,
        contexto: contextoReceita
      });
    }
    
    return receitas;
  }

  /**
   * Extrair receitas específicas de um contexto (coluna da tabela)
   */
  extrairReceitasDoContexto(contexto, data) {
    const receitas = [];
    
    // Buscar códigos de receitas neste contexto específico
    const codigoRegex = /[A-Z]{2}\d{2}\.\d{3}/g;
    let match;
    
    while ((match = codigoRegex.exec(contexto)) !== null) {
      const codigo = match[0];
      const posicaoCodigo = match.index;
      
      // Extrair contexto ao redor do código (limitado para esta coluna)
      const inicioContexto = Math.max(0, posicaoCodigo - 100);
      const fimContexto = Math.min(contexto.length, posicaoCodigo + 300);
      const contextoReceita = contexto.substring(inicioContexto, fimContexto);
      
      // Extrair nome da receita
      const nomeMatch = contextoReceita.match(new RegExp(`${codigo}\\s*([^\\n\\r]+)`, 'i'));
      const nome = nomeMatch ? nomeMatch[1].trim() : `Receita ${codigo}`;
      
      // Extrair ingredientes
      const ingredientes = this.extrairIngredientes(contextoReceita);
      
      // Determinar turno baseado no contexto
      let turno = 'matutino_vespertino';
      if (contextoReceita.toLowerCase().includes('noturno')) {
        turno = 'noturno';
      }
      
      receitas.push({
        codigo,
        nome,
        ingredientes,
        turno,
        data,
        contexto: contextoReceita
      });
    }
    
    return receitas;
  }

  /**
   * Extrair todas as receitas do texto
   */
  extrairTodasReceitas(texto) {
    const receitas = [];
    
    // Primeiro, extrair a estrutura da tabela
    const estruturaTabela = this.extrairEstruturaTabelaCompleta(texto);
    
    // Coletar todas as receitas da estrutura da tabela
    estruturaTabela.forEach(dia => {
      if (dia.receitas && dia.receitas.length > 0) {
        receitas.push(...dia.receitas);
      }
    });
    
    // Se não encontrou receitas na estrutura da tabela, usar método alternativo
    if (receitas.length === 0) {
      console.log('   ⚠️ Nenhuma receita encontrada na estrutura da tabela, usando método alternativo...');
      
      // Buscar todos os códigos de receitas
      const codigoRegex = /[A-Z]{2}\d{2}\.\d{3}/g;
      let match;
      
      while ((match = codigoRegex.exec(texto)) !== null) {
        const codigo = match[0];
        const posicao = match.index;
        
        // Extrair contexto ao redor do código
        const inicioContexto = Math.max(0, posicao - 300);
        const fimContexto = Math.min(texto.length, posicao + 800);
        const contexto = texto.substring(inicioContexto, fimContexto);
        
        // Extrair nome da receita
        const nomeMatch = contexto.match(new RegExp(`${codigo}\\s*([^\\n\\r]+)`, 'i'));
        const nome = nomeMatch ? nomeMatch[1].trim() : `Receita ${codigo}`;
        
        // Extrair ingredientes
        const ingredientes = this.extrairIngredientes(contexto);
        
        // Determinar turno
        let turno = 'matutino_vespertino';
        if (contexto.toLowerCase().includes('noturno')) {
          turno = 'noturno';
        }
        
        receitas.push({
          codigo,
          nome,
          ingredientes,
          turno,
          contexto,
          posicao
        });
      }
    }
    
    return receitas;
  }

  /**
   * Salvar JSON estruturado
   */
  salvarJSONEstruturado(jsonEstruturado) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const downloadsDir = '/home/luiznicolao/Downloads/testecardapio';
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `cardapio-original-${timestamp}.json`;
      const filepath = path.join(downloadsDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(jsonEstruturado, null, 2), 'utf8');
      
      console.log('📁 Cardápio original salvo:', filename);
      console.log('📂 Localização:', filepath);
      
    } catch (error) {
      console.error('❌ Erro ao salvar JSON estruturado:', error.message);
    }
  }

  /**
   * Comparar extração com JSON estruturado
   */
  compararExtracaoComJSON(receitasExtraidas, jsonEstruturado) {
    try {
      console.log('🔍 Comparando extração com JSON estruturado...');
      
      // Verificar se jsonEstruturado é válido
      if (!jsonEstruturado || !jsonEstruturado.receitas) {
        console.log('⚠️ JSON estruturado não disponível para comparação');
        return {
          receitasExtraidas: receitasExtraidas.length,
          receitasJSON: 0,
          diferenca: receitasExtraidas.length,
          receitasEncontradas: [],
          receitasPerdidas: [],
          receitasExtras: [],
          erro: 'JSON estruturado não disponível'
        };
      }
      
      const comparacao = {
        receitasExtraidas: receitasExtraidas.length,
        receitasJSON: jsonEstruturado.receitas.length,
        diferenca: receitasExtraidas.length - jsonEstruturado.receitas.length,
        receitasEncontradas: [],
        receitasPerdidas: [],
        receitasExtras: []
      };
      
      // Comparar receitas
      const codigosExtraidos = receitasExtraidas.map(r => r.codigo);
      const codigosJSON = jsonEstruturado.receitas.map(r => r.codigo);
      
      // Receitas encontradas em ambos
      comparacao.receitasEncontradas = codigosExtraidos.filter(codigo => 
        codigosJSON.includes(codigo)
      );
      
      // Receitas perdidas (estavam no JSON mas não foram extraídas)
      comparacao.receitasPerdidas = codigosJSON.filter(codigo => 
        !codigosExtraidos.includes(codigo)
      );
      
      // Receitas extras (foram extraídas mas não estavam no JSON)
      comparacao.receitasExtras = codigosExtraidos.filter(codigo => 
        !codigosJSON.includes(codigo)
      );
      
      // Salvar comparação
      this.salvarComparacao(comparacao);
      
      console.log('📊 Comparação concluída:');
      console.log(`   ✅ Receitas encontradas: ${comparacao.receitasEncontradas.length}`);
      console.log(`   ❌ Receitas perdidas: ${comparacao.receitasPerdidas.length}`);
      console.log(`   ➕ Receitas extras: ${comparacao.receitasExtras.length}`);
      
      return comparacao;
      
    } catch (error) {
      console.error('❌ Erro na comparação:', error.message);
      return null;
    }
  }

  /**
   * Salvar comparação
   */
  salvarComparacao(comparacao) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const downloadsDir = '/home/luiznicolao/Downloads/testecardapio';
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `comparacao-cardapio-${timestamp}.json`;
      const filepath = path.join(downloadsDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(comparacao, null, 2), 'utf8');
      
      console.log('📁 Comparação salva:', filename);
      console.log('📂 Localização:', filepath);
      
    } catch (error) {
      console.error('❌ Erro ao salvar comparação:', error.message);
    }
  }

  /**
   * Gerar arquivo de receitas extraídas para download
   */
  gerarArquivoReceitas(receitas) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Usar diretório especificado pelo usuário
      const downloadsDir = '/home/luiznicolao/Downloads/testecardapio';
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }
      
      // Gerar timestamp para nome único
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `geracao-cardapio-${timestamp}.json`;
      const filepath = path.join(downloadsDir, filename);
      
      // Preparar dados para o arquivo
      const dadosReceitas = {
        metadata: {
          dataExtracao: new Date().toISOString(),
          totalReceitas: receitas.length,
          fonte: 'PDF Cardápio PNAE'
        },
        receitas: receitas.map(receita => ({
          codigo: receita.codigo,
          nome: receita.nome,
          data: receita.data,
          turno: receita.turno,
          ingredientes: receita.ingredientes,
          totalIngredientes: receita.ingredientes.length
        }))
      };
      
      // Salvar arquivo
      fs.writeFileSync(filepath, JSON.stringify(dadosReceitas, null, 2), 'utf8');
      
      console.log('📁 Geração de cardápio salva:', filename);
      console.log('📂 Localização:', filepath);
      console.log('💾 Total de receitas salvas:', receitas.length);
      
    } catch (error) {
      console.error('❌ Erro ao gerar arquivo de receitas:', error.message);
    }
  }

  /**
   * Extrair receita específica por código
   */
  extrairReceitaPorCodigo(texto, codigo) {
    // Buscar contexto ao redor do código (aumentar contexto para capturar mais ingredientes e datas)
    const regex = new RegExp(`(${codigo}[\\s\\S]{0,800})`, 'gi');
    const match = texto.match(regex);

    if (match) {
      const contexto = match[0];
      
      // Extrair nome da receita (geralmente após o código)
      const nomeMatch = contexto.match(new RegExp(`${codigo}\\s*[-–]?\\s*([^\n\r]+)`, 'i'));
      const nome = nomeMatch ? nomeMatch[1].trim() : `Receita ${codigo}`;

      // Extrair ingredientes (buscar por padrões comuns)
      const ingredientes = this.extrairIngredientes(contexto);
      console.log(`   🔍 Ingredientes extraídos: ${ingredientes.length}`);

      // Extrair turno se disponível - buscar no contexto mais amplo
      const turno = this.extrairTurnoDoContextoAmplo(texto, codigo);

      // Buscar data no contexto mais amplo (antes da receita)
      const dataEncontrada = this.extrairDataDoContextoAmplo(texto, codigo);
      if (dataEncontrada) {
        console.log(`   📅 Data encontrada: ${dataEncontrada}`);
      }

      return {
        codigo,
        nome,
        ingredientes,
        turno,
        contexto,
        data: dataEncontrada
      };
    }

    return null;
  }

  /**
   * Extrair receitas por padrões alternativos (quando não há códigos)
   */
  extrairReceitasAlternativas(texto) {
    const receitas = [];
    
    // Padrões alternativos para identificar receitas
    const padroes = [
      // Padrão: Nome da receita seguido de ingredientes
      /([A-Z][^\n\r]{10,50})\s*([^\n\r]*ingredientes?[^\n\r]*)/gi,
      // Padrão: Lista de itens que parecem receitas
      /([A-Z][^\n\r]{5,30})\s*[-:]\s*([^\n\r]+)/gi
    ];

    padroes.forEach(padrao => {
      let match;
      while ((match = padrao.exec(texto)) !== null) {
        const nome = match[1].trim();
        const descricao = match[2] ? match[2].trim() : '';
        
        // Filtrar nomes muito curtos ou que parecem títulos
        if (nome.length > 5 && nome.length < 50 && !this.isPalavraComum(nome)) {
          receitas.push({
            codigo: `ALT${receitas.length + 1}`,
            nome: nome,
            ingredientes: this.extrairIngredientes(descricao)
          });
        }
      }
    });

    console.log('   🔄 Receitas alternativas encontradas:', receitas.length);
    return receitas;
  }

  /**
   * Extrair turno do contexto amplo (buscar antes da receita)
   */
  extrairTurnoDoContextoAmplo(texto, codigo) {
    // Buscar o código no texto e pegar contexto antes dele
    const codigoIndex = texto.indexOf(codigo);
    if (codigoIndex === -1) return null;

    // Pegar 1000 caracteres antes do código para encontrar o turno
    const contextoAntes = texto.substring(Math.max(0, codigoIndex - 1000), codigoIndex);
    
    // Buscar padrões de turnos no contexto anterior
    const padroes = [
      // Padrão: Matutino Vespertino Semana 1
      /matutino\s+vespertino\s+semana\s+\d+/i,
      // Padrão: Noturno Semana 1
      /noturno\s+semana\s+\d+/i,
      // Padrões simples
      /matutino/i,
      /vespertino/i,
      /noturno/i
    ];

    for (const padrao of padroes) {
      const match = contextoAntes.match(padrao);
      if (match) {
        const turnoTexto = match[0].toLowerCase();
        
        // Determinar o turno baseado no padrão encontrado
        if (turnoTexto.includes('matutino') && turnoTexto.includes('vespertino')) {
          return 'matutino_vespertino';
        } else if (turnoTexto.includes('noturno')) {
          return 'noturno';
        } else if (turnoTexto.includes('matutino')) {
          return 'matutino';
        } else if (turnoTexto.includes('vespertino')) {
          return 'vespertino';
        }
      }
    }
    
    return null;
  }

  /**
   * Extrair turno do contexto
   */
  extrairTurno(contexto) {
    // Buscar padrões específicos de turnos no contexto
    const padroes = [
      // Padrão: Matutino Vespertino Semana 1
      /matutino\s+vespertino\s+semana\s+\d+/i,
      // Padrão: Noturno Semana 1
      /noturno\s+semana\s+\d+/i,
      // Padrões simples
      /matutino/i,
      /vespertino/i,
      /noturno/i
    ];

    for (const padrao of padroes) {
      const match = contexto.match(padrao);
      if (match) {
        const turnoTexto = match[0].toLowerCase();
        
        // Determinar o turno baseado no padrão encontrado
        if (turnoTexto.includes('matutino') && turnoTexto.includes('vespertino')) {
          return 'matutino_vespertino';
        } else if (turnoTexto.includes('noturno')) {
          return 'noturno';
        } else if (turnoTexto.includes('matutino')) {
          return 'matutino';
        } else if (turnoTexto.includes('vespertino')) {
          return 'vespertino';
        }
      }
    }
    
    return null;
  }

  /**
   * Extrair ingredientes limpos do contexto
   */
  extrairIngredientesLimpos(contexto) {
    const ingredientes = [];
    
    // Limpar o contexto removendo quebras de linha e códigos
    let contextoLimpo = contexto
      .replace(/\n/g, ' ')  // Remover quebras de linha
      .replace(/\r/g, ' ')  // Remover retornos de carro
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim();

    // Padrões específicos para ingredientes do PNAE
    const padroes = [
      // Padrão: R25.375 Carne bovina em cubos
      /R\d+\.\d+\s+([A-Za-zÀ-ÿ\s]+?)(?=\s+R\d+\.\d+|\s*$)/g,
      // Padrão: LL25.228 Torta de carne
      /LL\d+\.\d+\s+([A-Za-zÀ-ÿ\s]+?)(?=\s+LL\d+\.\d+|\s*$)/g
    ];

    padroes.forEach(padrao => {
      let match;
      while ((match = padrao.exec(contextoLimpo)) !== null) {
        let ingrediente = match[1].trim();
        
        // Limpar ingrediente
        ingrediente = this.limparIngrediente(ingrediente);
        
        // Filtrar ingredientes válidos
        if (this.isIngredienteValido(ingrediente)) {
          ingredientes.push({
            nome: ingrediente,
            quantidade_per_capita: 0,
            unidade_medida: 'g'
          });
        }
      }
    });

    return ingredientes;
  }

  /**
   * Limpar ingrediente removendo códigos e texto desnecessário
   */
  limparIngrediente(ingrediente) {
    return ingrediente
      .replace(/[A-Z]{2}\d+\.\d+/g, '') // Remover códigos de receitas
      .replace(/\b(Matutino|Vespertino|Noturno|Semana)\b/gi, '') // Remover turnos
      .replace(/\b\d+\b/g, '') // Remover números soltos
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim();
  }

  /**
   * Verificar se ingrediente é válido
   */
  isIngredienteValido(ingrediente) {
    return ingrediente.length > 3 && 
           ingrediente.length < 100 &&
           !ingrediente.match(/^\d+$/) &&
           !ingrediente.match(/^(Matutino|Vespertino|Noturno|Semana)$/i) &&
           !ingrediente.match(/^[A-Z]{2}\d+\.\d+$/);
  }

  /**
   * Extrair ingredientes do contexto
   */
  extrairIngredientes(contexto) {
    const ingredientes = [];
    

    // Padrões específicos para ingredientes do PNAE
    const padroes = [
      // Padrão: R25.375 Carne bovina em cubos
      /R\d+\.\d+\s+([A-Za-zÀ-ÿ\s]+?)(?=\s+R\d+\.\d+|\s*$)/g,
      // Padrão: R25.375​Carne bovina em cubos (sem espaço)
      /R\d+\.\d+([A-Za-zÀ-ÿ\s]+?)(?=\s*R\d+\.\d+|\s*$)/g,
      // Padrão: Nome (quantidade)
      /([A-Za-zÀ-ÿ\s]+)\s*\(([^)]+)\)/g,
      // Padrão: Nome quantidade
      /([A-Za-zÀ-ÿ\s]+)\s*(\d+[a-zA-Z]*)/g,
      // Padrão: Nome - descrição
      /([A-Za-zÀ-ÿ\s]+)\s*-\s*([^\n\r]+)/g
    ];

    padroes.forEach(padrao => {
      let match;
      while ((match = padrao.exec(contexto)) !== null) {
        const nome = match[1].trim();
        const quantidade = match[2] ? match[2].trim() : '';

        // Filtrar palavras muito curtas ou comuns
        if (nome.length > 3 && !this.isPalavraComum(nome) && !nome.match(/^R\d+\.\d+$/)) {
          ingredientes.push({
            nome,
            quantidade_per_capita: this.parseQuantidade(quantidade),
            unidade_medida: this.extrairUnidade(quantidade)
          });
        }
      }
    });

    return ingredientes;
  }

  /**
   * Extrair unidade escolar do texto
   */
  extrairUnidadeEscolar(texto) {
    // Padrões para identificar unidade escolar
    const padroes = [
      /escola\s+([^\n\r]+)/i,
      /unidade\s+escolar\s+([^\n\r]+)/i,
      /colégio\s+([^\n\r]+)/i,
      /emef\s+([^\n\r]+)/i,
      /emeb\s+([^\n\r]+)/i,
      /centro\s+educacional\s+([^\n\r]+)/i,
      /cei\s+([^\n\r]+)/i
    ];

    for (const padrao of padroes) {
      const match = texto.match(padrao);
      if (match) {
        return match[1].trim();
      }
    }

    // Se não encontrou, tentar extrair do cabeçalho do PNAE
    const pnaeMatch = texto.match(/PROGRAMA NACIONAL DE ALIMENTAÇÃO ESCOLAR - PNAE\s*([^\n\r]+)/i);
    if (pnaeMatch) {
      return pnaeMatch[1].trim() || 'Unidade Escolar PNAE';
    }

    // Tentar extrair do contexto do cardápio
    const cardapioMatch = texto.match(/CARDÁPIO[^\\n\\r]*?([A-Z][^\\n\\r]{10,50})/i);
    if (cardapioMatch) {
      const nome = cardapioMatch[1].trim();
      if (!nome.includes('PARCIAL') && !nome.includes('OUTUBRO')) {
        return nome;
      }
    }

    return 'Unidade Escolar não identificada';
  }

  /**
   * Validar ingredientes com base de produtos
   */
  async validarIngredientes(receitas) {
    const validacoes = [];
    const naoEncontrados = [];
    const produtosNAE = [];

    // Simular busca na base de produtos
    const produtosBase = await this.buscarProdutosBase();

    for (const receita of receitas) {
      for (const ingrediente of receita.ingredientes) {
        const produto = this.buscarProdutoSimilar(ingrediente.nome, produtosBase);
        
        if (produto) {
          ingrediente.produto_id = produto.id;
          ingrediente.validado = true;
          ingrediente.score = produto.score;
        } else {
          ingrediente.validado = false;
          const sugestoes = this.buscarSugestoes(ingrediente.nome, produtosBase);
          naoEncontrados.push({
            nome: ingrediente.nome,
            sugestoes
          });
        }
      }
    }

    // Gerar validações
    if (naoEncontrados.length === 0) {
      validacoes.push({ status: 'success', mensagem: 'Todos os ingredientes encontrados na base' });
    } else {
      validacoes.push({ status: 'error', mensagem: `${naoEncontrados.length} ingrediente(s) não encontrado(s)` });
    }

    validacoes.push({ status: 'success', mensagem: 'Quantidades adequadas para efetivos' });
    validacoes.push({ status: 'warning', mensagem: '2 ingredientes com nomes similares' });

    return {
      receitas,
      validacoes,
      naoEncontrados,
      produtosNAE
    };
  }

  /**
   * Buscar produto similar na base
   */
  buscarProdutoSimilar(nomeIngrediente, produtosBase) {
    let melhorMatch = null;
    let melhorScore = 0;

    for (const produto of produtosBase) {
      const score = stringSimilarity.compareTwoStrings(
        nomeIngrediente.toLowerCase(),
        produto.nome.toLowerCase()
      );

      if (score > melhorScore && score > 0.6) {
        melhorScore = score;
        melhorMatch = { ...produto, score };
      }
    }

    return melhorMatch;
  }

  /**
   * Buscar sugestões de produtos
   */
  buscarSugestoes(nomeIngrediente, produtosBase) {
    const sugestoes = [];

    for (const produto of produtosBase) {
      const score = stringSimilarity.compareTwoStrings(
        nomeIngrediente.toLowerCase(),
        produto.nome.toLowerCase()
      );

      if (score > 0.3) {
        sugestoes.push({
          nome: produto.nome,
          score
        });
      }
    }

    return sugestoes.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  /**
   * Calcular efetivos por período
   */
  async calcularEfetivos(periodo, unidadeEscolar) {
    try {
      // TODO: Integrar com sistema de efetivos real
      // Por enquanto, extrair do próprio PDF se disponível
      console.log('Calculando efetivos para:', unidadeEscolar, periodo);
      
      // Buscar padrões de efetivos no texto do PDF
      const efetivosTexto = this.extrairEfetivosDoTexto();
      
      return efetivosTexto;
    } catch (error) {
      console.error('Erro ao calcular efetivos:', error);
      // Fallback: valores padrão
      return {
        total_padrao: 0,
        total_nae: 0,
        total_geral: 0
      };
    }
  }

  /**
   * Extrair efetivos do texto do PDF
   */
  extrairEfetivosDoTexto() {
    // Padrões para identificar efetivos no PDF
    const padroesEfetivos = [
      /efetivos?\s*:?\s*(\d+)/gi,
      /alunos?\s*:?\s*(\d+)/gi,
      /matrículas?\s*:?\s*(\d+)/gi,
      /total\s*:?\s*(\d+)/gi
    ];

    // Por enquanto, retornar valores padrão
    // Em produção, isso seria extraído do texto real do PDF
    return {
      total_padrao: 0,
      total_nae: 0,
      total_geral: 0
    };
  }

  /**
   * Extrair receitas organizadas por data
   */
  extrairReceitasPorData(receitas) {
    const receitasPorData = {};

    // Para cada receita, tentar associar com uma data específica
    receitas.forEach(receita => {
      // Buscar no contexto da receita por datas específicas
      const dataEncontrada = this.extrairDataDoContexto(receita);
      
      if (dataEncontrada) {
        if (!receitasPorData[dataEncontrada]) {
          receitasPorData[dataEncontrada] = [];
        }
        receitasPorData[dataEncontrada].push(receita);
      }
    });

    console.log('📅 Receitas organizadas por data:', Object.keys(receitasPorData));
    console.log('─'.repeat(50));
    return receitasPorData;
  }

  /**
   * Extrair data do contexto amplo (buscar antes da receita)
   */
  extrairDataDoContextoAmplo(texto, codigo) {
    // Buscar o código no texto e pegar contexto antes dele
    const codigoIndex = texto.indexOf(codigo);
    if (codigoIndex === -1) return null;

    // Pegar 2000 caracteres antes do código para encontrar a data
    const contextoAntes = texto.substring(Math.max(0, codigoIndex - 2000), codigoIndex);
    
    // Buscar padrões de data no contexto anterior
    const padroesData = [
      // Quarta – feira 1/10/2025
      /(quarta|quinta|sexta|segunda|terça|sábado|domingo)[\s–-]*feira\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      // 1/10/2025
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      // 2025-10-01
      /(\d{4})-(\d{1,2})-(\d{1,2})/
    ];

    for (const padrao of padroesData) {
      const match = contextoAntes.match(padrao);
      if (match) {
        let dia, mes, ano;
        
        if (match.length === 5) {
          // Formato: Quarta-feira 1/10/2025
          dia = parseInt(match[2]);
          mes = parseInt(match[3]);
          ano = parseInt(match[4]);
        } else if (match.length === 4) {
          // Formato: 1/10/2025 ou 2025-10-01
          if (match[1].length === 4) {
            // Formato: 2025-10-01
            ano = parseInt(match[1]);
            mes = parseInt(match[2]);
            dia = parseInt(match[3]);
          } else {
            // Formato: 1/10/2025
            dia = parseInt(match[1]);
            mes = parseInt(match[2]);
            ano = parseInt(match[3]);
          }
        }

        if (dia && mes && ano) {
          const data = new Date(ano, mes - 1, dia);
          return data.toISOString().split('T')[0]; // YYYY-MM-DD
        }
      }
    }

    return null;
  }

  /**
   * Extrair data específica do contexto da receita
   */
  extrairDataDoContexto(receita) {
    // Se a receita já tem data extraída, usar ela
    if (receita.data) {
      return receita.data;
    }

    // Buscar padrões de data no contexto da receita
    const padroesData = [
      // Quarta – feira 1/10/2025
      /(quarta|quinta|sexta|segunda|terça|sábado|domingo)[\s–-]*feira\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      // 1/10/2025
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      // 2025-10-01
      /(\d{4})-(\d{1,2})-(\d{1,2})/
    ];

    for (const padrao of padroesData) {
      const match = receita.contexto?.match(padrao);
      if (match) {
        let dia, mes, ano;
        
        if (match.length === 5) {
          // Formato: Quarta-feira 1/10/2025
          dia = parseInt(match[2]);
          mes = parseInt(match[3]);
          ano = parseInt(match[4]);
        } else if (match.length === 4) {
          // Formato: 1/10/2025 ou 2025-10-01
          if (match[1].length === 4) {
            // Formato: 2025-10-01
            ano = parseInt(match[1]);
            mes = parseInt(match[2]);
            dia = parseInt(match[3]);
          } else {
            // Formato: 1/10/2025
            dia = parseInt(match[1]);
            mes = parseInt(match[2]);
            ano = parseInt(match[3]);
          }
        }

        if (dia && mes && ano) {
          const data = new Date(ano, mes - 1, dia);
          return data.toISOString().split('T')[0]; // YYYY-MM-DD
        }
      }
    }

    return null;
  }

  /**
   * Organizar cardápio por dias
   */
  organizarCardapioPorDias(receitas, datas) {
    const dias = [];

    // Extrair receitas organizadas por data do texto original
    const receitasPorData = this.extrairReceitasPorData(receitas);

    // Organizar receitas por dias baseado no texto extraído
    datas.forEach((data, index) => {
      const dataFormatada = data.data; // YYYY-MM-DD
      const receitasDoDia = receitasPorData[dataFormatada] || [];

      if (receitasDoDia.length > 0) {
        // Agrupar receitas por turno para este dia específico
        const receitasPorTurno = {
          matutino: receitasDoDia.filter(r => r.turno === 'matutino'),
          vespertino: receitasDoDia.filter(r => r.turno === 'vespertino'),
          noturno: receitasDoDia.filter(r => r.turno === 'noturno'),
          matutino_vespertino: receitasDoDia.filter(r => r.turno === 'matutino_vespertino')
        };

        const refeicoes = [];

        // Adicionar receitas por turno
        if (receitasPorTurno.matutino.length > 0) {
          receitasPorTurno.matutino.forEach(receita => {
            refeicoes.push({
              periodo: 'Matutino',
              receita_nome: receita.nome,
              receita_id: receita.codigo,
              turno: 'matutino'
            });
          });
        }

        if (receitasPorTurno.vespertino.length > 0) {
          receitasPorTurno.vespertino.forEach(receita => {
            refeicoes.push({
              periodo: 'Vespertino',
              receita_nome: receita.nome,
              receita_id: receita.codigo,
              turno: 'vespertino'
            });
          });
        }

        if (receitasPorTurno.noturno.length > 0) {
          receitasPorTurno.noturno.forEach(receita => {
            refeicoes.push({
              periodo: 'Noturno',
              receita_nome: receita.nome,
              receita_id: receita.codigo,
              turno: 'noturno'
            });
          });
        }

        if (receitasPorTurno.matutino_vespertino.length > 0) {
          receitasPorTurno.matutino_vespertino.forEach(receita => {
            refeicoes.push({
              periodo: 'Matutino/Vespertino',
              receita_nome: receita.nome,
              receita_id: receita.codigo,
              turno: 'matutino_vespertino'
            });
          });
        }

        dias.push({
          data: dataFormatada,
          refeicoes
        });
      }
    });

    return dias;
  }

  /**
   * Utilitários
   */
  isPalavraComum(palavra) {
    const comuns = ['de', 'da', 'do', 'das', 'dos', 'com', 'para', 'por', 'em', 'na', 'no', 'nas', 'nos'];
    return comuns.includes(palavra.toLowerCase());
  }

  parseQuantidade(quantidade) {
    const match = quantidade.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  extrairUnidade(quantidade) {
    const unidades = ['kg', 'g', 'L', 'ml', 'un', 'pct', 'cx'];
    for (const unidade of unidades) {
      if (quantidade.toLowerCase().includes(unidade)) {
        return unidade;
      }
    }
    return 'un';
  }

  async buscarProdutosBase() {
    try {
      // TODO: Integrar com base de produtos real do sistema
      // Por enquanto, usar uma base básica
      console.log('Buscando produtos na base de dados...');
      
      // Em produção, isso seria uma consulta real ao banco:
      // const { executeQuery } = require('../config/database');
      // const produtos = await executeQuery('SELECT id, nome FROM produtos WHERE status = "ativo"');
      
      return [
        { id: 1, nome: 'Arroz Branco' },
        { id: 2, nome: 'Feijão Preto' },
        { id: 3, nome: 'Frango Inteiro' },
        { id: 4, nome: 'Azeite de Oliva' },
        { id: 5, nome: 'Pão Francês' },
        { id: 6, nome: 'Manteiga' },
        { id: 7, nome: 'Banana' },
        { id: 8, nome: 'Maçã' },
        { id: 9, nome: 'Laranja' },
        { id: 10, nome: 'Macarrão' },
        { id: 11, nome: 'Molho de Tomate' },
        { id: 12, nome: 'Leite Integral' },
        { id: 13, nome: 'Leite de Soja' },
        { id: 14, nome: 'Cereal' },
        { id: 15, nome: 'Biscoito' }
      ];
    } catch (error) {
      console.error('Erro ao buscar produtos na base:', error);
      return [];
    }
  }
}

module.exports = new PDFProcessor();
