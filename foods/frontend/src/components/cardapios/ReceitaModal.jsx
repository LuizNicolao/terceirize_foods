import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaCode, FaTag, FaFileAlt, FaInfo } from 'react-icons/fa';
import { Button, Input, Modal, SearchableSelect } from '../ui';
import ReceitasService from '../../services/receitas';
import toast from 'react-hot-toast';
import { agenteCorrecaoIngredientes } from '../../utils/agenteCorrecaoIngredientes';

const ReceitaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  receita,
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Função para extrair nome limpo da receita
  const extrairNomeLimpo = (nomeCompleto) => {
    if (!nomeCompleto) return '';
    
    // Remove parênteses e tudo dentro deles
    let nome = nomeCompleto.split('(')[0];
    
    // Remove vírgulas e tudo depois da primeira vírgula
    nome = nome.split(',')[0];
    
    // Remover porcentagens do nome (ex: "com 50% aveia" -> "com aveia")
    nome = nome.replace(/\d+%/g, '').trim();
    
    // Para o exemplo específico: "Filé de tilápia assado"
    // Vamos manter as primeiras 4 palavras que formam o nome principal
    let palavras = nome.trim().split(' ');
    
    // Se contém "assado", manter até "assado"
    if (palavras.includes('assado')) {
      const indexAssado = palavras.indexOf('assado');
      return palavras.slice(0, indexAssado + 1).join(' ');
    }
    
    // Se contém "refogado", manter até "refogado"
    if (palavras.includes('refogado')) {
      const indexRefogado = palavras.indexOf('refogado');
      return palavras.slice(0, indexRefogado + 1).join(' ');
    }
    
    // Se contém "com", manter até "com" + próxima palavra
    if (palavras.includes('com')) {
      const indexCom = palavras.indexOf('com');
      return palavras.slice(0, indexCom + 2).join(' ');
    }
    
    // Caso contrário, manter as primeiras 3-4 palavras
    return palavras.slice(0, 4).join(' ').trim();
  };


  // Função para extrair ingredientes limpos da descrição
  const extrairIngredientes = (descricao) => {
    if (!descricao) return '';
    
    // Se já tem ingredientes separados, usar eles
    if (receita?.ingredientes) return receita.ingredientes;
    
    const ingredientes = [];
    
    // Dividir por vírgulas e processar cada parte
    const partes = descricao.split(',').map(p => p.trim());
    
    partes.forEach(parte => {
      // Pular se for muito curto
      if (parte.length < 3) return;
      
      // Remover parênteses e conteúdo dentro, asteriscos e pontuação desnecessária
      let ingrediente = parte.replace(/\([^)]*\)/g, '').replace(/[()]/g, '').replace(/^\*+/, '').replace(/\.$/, '').trim();
      
      // Remover palavras de preparo e conectores
      const palavrasPreparo = ['temperado', 'temperada', 'refogado', 'refogada', 'assado', 'assada', 'cozido', 'cozida', 'frito', 'frita', 'grelhado', 'grelhada', 'salteado', 'salteada', 'preparado', 'preparada', 'com', 'e', 'de', 'da', 'do', 'em', 'para', 'uma', 'um', 'salada', 'filé', 'ensopado', 'molho', 'tomate', 'frutas', 'caseiro', 'sem', 'gordura', 'trans', 'servir', 'separadamente', 'cubos', 'fatias', 'ralada', 'picada', 'purê', 'farinha', 'farinha de', 'adição', 'açúcar'];
      
      let palavras = ingrediente.split(' ').filter(palavra => 
        palavra.length > 2 && !palavrasPreparo.includes(palavra.toLowerCase())
      );
      
      const ingredienteLimpo = palavras.join(' ').trim();
      
      if (ingredienteLimpo && ingredienteLimpo.length > 2) {
        // Se contém "tempero", manter junto
        if (ingredienteLimpo.includes('tempero')) {
          ingredientes.push(ingredienteLimpo);
        } else {
          // Separar palavras individuais
          palavras.forEach(palavra => {
            if (palavra.length > 2 && !palavrasPreparo.includes(palavra.toLowerCase())) {
              ingredientes.push(palavra);
            }
          });
        }
      }
    });
    
    // Remover duplicatas e limpar
    const ingredientesUnicos = [...new Set(ingredientes)];
    const ingredientesString = ingredientesUnicos.join(', ');
    
    // Aplicar agente inteligente de correção
    return agenteCorrecaoIngredientes(ingredientesString);
  };

  // Estado para ingredientes individuais
  const [ingredientesLista, setIngredientesLista] = useState([]);
  const [novoIngrediente, setNovoIngrediente] = useState('');

  // Função para converter string ou array de ingredientes em lista
  const converterParaLista = (ingredientes) => {
    if (!ingredientes) return [];
    
    // Se já é um array, retornar direto (pode ser array de objetos ou strings)
    if (Array.isArray(ingredientes)) {
      return ingredientes.map(item => {
        // Se é objeto, extrair nome
        if (typeof item === 'object' && item !== null) {
          return item.nome || item.ingrediente || String(item);
        }
        // Se é string, retornar direto
        return String(item);
      }).filter(i => i && i.length > 0);
    }
    
    // Se é string, fazer split por vírgula
    if (typeof ingredientes === 'string') {
      return ingredientes.split(',').map(i => i.trim()).filter(i => i.length > 0);
    }
    
    // Fallback: converter para string e tentar split
    return String(ingredientes).split(',').map(i => i.trim()).filter(i => i.length > 0);
  };

  // Função para converter lista em string
  const converterParaString = (lista) => {
    return lista.join(', ');
  };

  // Função para adicionar ingrediente
  const adicionarIngrediente = () => {
    if (novoIngrediente.trim()) {
      const novo = agenteCorrecaoIngredientes(novoIngrediente.trim());
      const novaLista = [...ingredientesLista, novo];
      setIngredientesLista(novaLista);
      setValue('ingredientes', converterParaString(novaLista));
      setNovoIngrediente('');
    }
  };

  // Função para remover ingrediente
  const removerIngrediente = (index) => {
    const novaLista = ingredientesLista.filter((_, i) => i !== index);
    setIngredientesLista(novaLista);
    setValue('ingredientes', converterParaString(novaLista));
  };

  // Função para analisar divergências

  // Carregar dados da receita para edição
  useEffect(() => {
    if (isOpen && receita) {
      const nomeLimpo = extrairNomeLimpo(receita.nome);
      
      // Tratar ingredientes - pode vir como array (do PDF) ou string (do banco)
      let ingredientesParaForm = '';
      let ingredientesParaLista = [];
      
      if (receita.ingredientes) {
        if (Array.isArray(receita.ingredientes)) {
          // Se é array (vindo do PDF processado), converter para lista de strings
          ingredientesParaLista = receita.ingredientes.map(item => {
            if (typeof item === 'object' && item !== null) {
              // Se é objeto com nome, quantidade, etc
              const nomeIng = item.nome || item.ingrediente || '';
              const quantidade = item.quantidade || item.quantidade_per_capita || '';
              const unidade = item.unidade || item.unidade_medida || '';
              
              if (nomeIng && quantidade) {
                return `${nomeIng} (${quantidade} ${unidade})`.trim();
              }
              return nomeIng;
            }
            return String(item);
          }).filter(i => i && i.length > 0);
          
          ingredientesParaForm = ingredientesParaLista.join(', ');
        } else if (typeof receita.ingredientes === 'string') {
          // Se é string JSON, tentar parsear
          try {
            const parsed = JSON.parse(receita.ingredientes);
            if (Array.isArray(parsed)) {
              ingredientesParaLista = converterParaLista(parsed);
              ingredientesParaForm = converterParaString(ingredientesParaLista);
            } else {
              ingredientesParaLista = converterParaLista(receita.ingredientes);
              ingredientesParaForm = receita.ingredientes;
            }
          } catch {
            // Se não é JSON válido, tratar como string comum
            ingredientesParaLista = converterParaLista(receita.ingredientes);
            ingredientesParaForm = receita.ingredientes;
          }
        } else {
          // Fallback
          ingredientesParaLista = converterParaLista(receita.ingredientes);
          ingredientesParaForm = String(receita.ingredientes);
        }
      } else {
        // Se não tem ingredientes na receita, tentar extrair da descrição
        const ingredientesExtraidos = extrairIngredientes(receita.descricao);
        ingredientesParaForm = ingredientesExtraidos;
        ingredientesParaLista = converterParaLista(ingredientesExtraidos);
      }
      
      reset({
        codigo_referencia: receita.codigo_referencia || '',
        codigo_interno: receita.codigo_interno || '',
        nome: nomeLimpo,
        ingredientes: ingredientesParaForm,
        descricao: receita.descricao || receita.texto_extraido || '', 
        texto_extraido: receita.texto_extraido || receita.texto_extraido_pdf || '',
        tipo: receita.tipo || 'receita',
        status: receita.status || 'rascunho'
      });
      
      // Inicializar lista de ingredientes
      setIngredientesLista(ingredientesParaLista);
    } else if (isOpen && !receita) {
      // Resetar formulário para nova receita
      reset({
        codigo_referencia: '',
        codigo_interno: '',
        nome: '',
        ingredientes: '',
        descricao: '',
        tipo: 'almoco',
        status: 'ativo'
      });
      
      // Limpar lista de ingredientes
      setIngredientesLista([]);
    }
  }, [isOpen, receita, reset]);

  const handleFormSubmit = async (data) => {
    setSaving(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    setFieldErrors({});
    onClose();
  };

  const tiposReceita = [
    { value: 'cafe_manha', label: 'Café da Manhã' },
    { value: 'lanche', label: 'Lanche' },
    { value: 'almoco', label: 'Almoço' },
    { value: 'jantar', label: 'Jantar' },
    { value: 'outro', label: 'Outro' }
  ];

  const statusReceita = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'pendente', label: 'Pendente' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isViewMode ? 'Visualizar Receita' : receita ? 'Editar Receita' : 'Nova Receita'}
      size="xl"
    >

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCode className="inline h-4 w-4 mr-2" />
                Código de Referência *
            </label>
              <Input
                {...register('codigo_referencia', { 
                  required: 'Código de referência é obrigatório',
                  maxLength: { value: 50, message: 'Código deve ter no máximo 50 caracteres' }
                })}
              disabled={isViewMode}
                className={errors.codigo_referencia ? 'border-red-300' : ''}
                placeholder="R25.375"
              />
              {errors.codigo_referencia && (
                <p className="mt-1 text-sm text-red-600">{errors.codigo_referencia.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCode className="inline h-4 w-4 mr-2" />
                Código Interno
              </label>
              <Input
                {...register('codigo_interno')}
                disabled={true}
                className="bg-gray-100"
                placeholder="Gerado automaticamente"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaTag className="inline h-4 w-4 mr-2" />
                Tipo *
              </label>
              <SearchableSelect
                value={watch('tipo') || ''}
                onChange={(value) => setValue('tipo', value)}
                options={tiposReceita}
                placeholder="Selecione o tipo"
                disabled={isViewMode}
                className={errors.tipo ? 'border-red-300' : ''}
              />
              {errors.tipo && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaTag className="inline h-4 w-4 mr-2" />
                Status
              </label>
              <SearchableSelect
                value={watch('status') || ''}
                onChange={(value) => setValue('status', value)}
                options={statusReceita}
                placeholder="Selecione o status"
                disabled={isViewMode}
                className={errors.status ? 'border-red-300' : ''}
              />
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFileAlt className="inline h-4 w-4 mr-2" />
              Nome da Receita *
            </label>
            <Input
              {...register('nome', { 
                required: 'Nome da receita é obrigatório',
                maxLength: { value: 255, message: 'Nome deve ter no máximo 255 caracteres' }
              })}
              disabled={isViewMode}
              className={errors.nome ? 'border-red-300' : ''}
              placeholder="Carne bovina em cubos refogada com tomate e cenoura"
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFileAlt className="inline h-4 w-4 mr-2" />
              Ingredientes
            </label>
            
            {/* Lista de ingredientes */}
            <div className="space-y-2 mb-3">
              {ingredientesLista.map((ingrediente, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-gray-700">{ingrediente}</span>
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() => removerIngrediente(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Adicionar novo ingrediente */}
            {!isViewMode && (
              <div className="flex gap-2">
                <Input
                  value={novoIngrediente}
                  onChange={(e) => setNovoIngrediente(e.target.value)}
                  placeholder="Digite um ingrediente..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      adicionarIngrediente();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={adicionarIngrediente}
                  disabled={!novoIngrediente.trim()}
                  className="px-4 py-2"
                >
                  Adicionar
                </Button>
              </div>
            )}
            
            {/* Campo oculto para o formulário */}
            <input type="hidden" {...register('ingredientes')} />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFileAlt className="inline h-4 w-4 mr-2" />
              Descrição
            </label>
            <Input
              {...register('descricao')}
              disabled={isViewMode}
              type="textarea"
              rows={3}
              placeholder="Descreva o preparo da receita..."
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFileAlt className="inline h-4 w-4 mr-2" />
              Texto Extraído do PDF
            </label>
            <Input
              {...register('texto_extraido')}
              disabled={true}
              type="textarea"
              rows={4}
              className="bg-gray-100"
              placeholder="Texto original extraído do PDF..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Este campo mostra o texto original extraído do PDF antes do processamento
            </p>
          </div>


          {receita && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Informações da Receita</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <span className="ml-2 font-medium">
                    {receita.tipo === 'almoco' ? 'Almoço' :
                     receita.tipo === 'cafe_manha' ? 'Café da Manhã' :
                     receita.tipo === 'lanche' ? 'Lanche' :
                     receita.tipo === 'jantar' ? 'Jantar' :
                     receita.tipo || 'Outro'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-medium">
                    {receita.status === 'ativo' ? 'Ativo' :
                     receita.status === 'inativo' ? 'Inativo' :
                     receita.status === 'pendente' ? 'Pendente' :
                     receita.status || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Criado em:</span>
                  <span className="ml-2 font-medium">
                    {receita.criado_em ? new Date(receita.criado_em).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
                  <div>
                  <span className="text-gray-500">Atualizado em:</span>
                  <span className="ml-2 font-medium">
                    {receita.atualizado_em ? new Date(receita.atualizado_em).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                  </div>
              </div>
            </div>
          )}

        {!isViewMode && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={saving}
            >
              <FaTimes className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              loading={saving}
            >
              <FaSave className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ReceitaModal;
