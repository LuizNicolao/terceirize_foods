const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const PythonPDFService = require('./pythonPDFService');

const DEFAULT_DEBUG_DIR = path.join(__dirname, '..', 'storage', 'receitas_pdf');

const ensureDirectory = (dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (error) {
    console.error('[ReceitasPdfService] Erro ao garantir diretório:', error.message);
  }
};

const sanitizeFilename = (value) => {
  if (!value) {
    return 'arquivo';
  }

  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]/gi, '_')
    .toLowerCase();
};

const extrairNomeReceita = (descricao, textoOriginal) => {
  const base = textoOriginal || descricao || '';
  if (!base) {
    return '';
  }

  const partes = base.split(',');
  return partes[0]?.trim() || base.trim();
};

const extrairIngredientesReceita = (descricao, textoOriginal) => {
  const origem = textoOriginal || descricao || '';
  if (!origem) {
    return [];
  }

  const partes = origem
    .split(',')
    .map(parte => parte.trim())
    .filter(Boolean);

  if (partes.length <= 1) {
    return [];
  }

  const [, ...ingredientes] = partes;
  return ingredientes
    .map(item => item.replace(/\s+/g, ' ').replace(/\.$/, '').trim())
    .filter(Boolean);
};

const inferirCategoriaReceita = (codigo, turno) => {
  if (turno) {
    return turno.toLowerCase();
  }

  if (!codigo) {
    return 'desconhecido';
  }

  if (codigo.startsWith('LL')) {
    return 'lanche';
  }

  if (codigo.startsWith('R')) {
    return 'refeicao';
  }

  return 'desconhecido';
};

const mapearReceitasExtraidas = (resultado) => {
  const refeicoes = resultado?.refeicoes || [];
  const receitasMap = new Map();

  refeicoes.forEach(refeicao => {
    if (!refeicao) {
      return;
    }

    const chave = refeicao.codigo
      ? `${refeicao.codigo}-${refeicao.descricao}`
      : refeicao.descricao || `${Date.now()}-${Math.random()}`;

    if (!receitasMap.has(chave)) {
      const nomeReceita = extrairNomeReceita(refeicao.descricao, refeicao.texto_original);
      const categoriaInferida = inferirCategoriaReceita(refeicao.codigo, refeicao.turno);
      receitasMap.set(chave, {
        codigo_referencia: refeicao.codigo || null,
        nome: nomeReceita,
        descricao: refeicao.descricao || nomeReceita,
        categoria_inferida: categoriaInferida,
        tipo: categoriaInferida,
        ingredientes: extrairIngredientesReceita(refeicao.descricao, refeicao.texto_original),
        texto_original: refeicao.texto_original ? [refeicao.texto_original] : [refeicao.descricao || nomeReceita],
        datas: refeicao.data ? [refeicao.data] : [],
        turnos: refeicao.turno ? [refeicao.turno] : [],
      });
    } else {
      const receitaExistente = receitasMap.get(chave);
      if (refeicao.texto_original) {
        receitaExistente.texto_original.push(refeicao.texto_original);
      } else if (refeicao.descricao) {
        receitaExistente.texto_original.push(refeicao.descricao);
      }
      if (refeicao.data) {
        receitaExistente.datas.push(refeicao.data);
      }
      if (refeicao.turno) {
        receitaExistente.turnos.push(refeicao.turno);
      }
    }
  });

  return Array.from(receitasMap.values()).map(receita => ({
    ...receita,
    datas: [...new Set(receita.datas)],
    turnos: [...new Set(receita.turnos)],
  }));
};

class ReceitasPdfService {
  constructor(options = {}) {
    this.debugDir = options.debugDir || process.env.RECEITAS_PDF_DEBUG_DIR || DEFAULT_DEBUG_DIR;
    this.reportsDir = options.reportsDir || process.env.RECEITAS_PDF_REPORTS_DIR 
      || path.join(this.debugDir, 'processed');
    this.pythonService = new PythonPDFService();
    ensureDirectory(this.debugDir);
    ensureDirectory(this.reportsDir);
  }

  gerarNomesArquivos(filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = sanitizeFilename(`${timestamp}-${filename.replace(/\.pdf$/i, '')}`);

    return {
      json: path.join(this.debugDir, `${baseName}.json`),
      texto: path.join(this.debugDir, `${baseName}.txt`)
    };
  }

  salvarDebug(jsonData, textoExtraido, paths) {
    try {
      fs.writeFileSync(paths.json, JSON.stringify(jsonData, null, 2), 'utf-8');
      fs.writeFileSync(paths.texto, textoExtraido, 'utf-8');
    } catch (error) {
      console.error('[ReceitasPdfService] Erro ao salvar arquivos de debug:', error.message);
    }
  }

  async processar(buffer, filename) {
    const pdfData = await pdf(buffer);
    const textoExtraido = pdfData.text || '';

    const resultadoPython = await this.pythonService.processarPDF(buffer, filename);
    if (!resultadoPython.success || !resultadoPython.data) {
      const mensagem = resultadoPython.error || 'Falha ao processar PDF com serviço Python';
      const erro = new Error(mensagem);
      erro.status = 400;
      throw erro;
    }

    const receitasEstruturadas = mapearReceitasExtraidas(resultadoPython.data);
    const primeiraReceita = receitasEstruturadas[0] || null;

    const debugPaths = this.gerarNomesArquivos(filename);
    this.salvarDebug(resultadoPython.data, textoExtraido, debugPaths);

    const resumo = {
      total_refeicoes: resultadoPython.data?.total_refeicoes || (resultadoPython.data?.refeicoes?.length || 0),
      total_dias: resultadoPython.data?.total_dias || Object.keys(resultadoPython.data?.cardapio_por_data || {}).length,
      total_receitas_unicas: receitasEstruturadas.length
    };

    const categoriaInferida = primeiraReceita?.categoria_inferida || null;
    const tipoBanco = 'receita';

    const dadosExtraidos = {
      nome: primeiraReceita?.nome || null,
      codigo_referencia: primeiraReceita?.codigo_referencia || null,
      descricao: primeiraReceita?.descricao || '',
      texto_extraido_pdf: primeiraReceita?.texto_original?.join('\n') || textoExtraido || '',
      ingredientes: primeiraReceita?.ingredientes || [],
      tipo: tipoBanco,
      status: 'rascunho',
      origem: 'pdf',
      receitas: receitasEstruturadas,
      resumo,
      debug: {
        raw_text: textoExtraido,
        resultado_python: resultadoPython.data,
        arquivos: debugPaths
      },
      meta: {
        categoria_inferida: categoriaInferida,
        resumo,
        arquivos_debug: debugPaths
      }
    };

    return {
      dadosExtraidos,
      resumo,
      receitasEstruturadas,
      primeiraReceita,
      debugPaths,
      textoExtraido,
      resultadoPython: resultadoPython.data
    };
  }
}

module.exports = ReceitasPdfService;

