import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { Modal, Button, Input } from '../ui';
import toast from 'react-hot-toast';

// Funções utilitárias para manipulação de datas
const formatDateBR = (dateISO) => {
  if (!dateISO) return '';
  const date = new Date(dateISO);
  return date.toLocaleDateString('pt-BR');
};

const formatDateISO = (dateBR) => {
  if (!dateBR) return '';
  const parsed = dateBR.split('/');
  if (parsed.length !== 3) return '';
  const [dia, mes, ano] = parsed;
  if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return '';
  return `${ano}-${mes}-${dia}`;
};

const ProdutoDivisaoModal = ({ 
  isOpen, 
  onClose, 
  produto, 
  onConfirm 
}) => {
  const [entradas, setEntradas] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && produto) {
      // Inicializar com uma entrada vazia se o produto não tiver dados preenchidos
      // ou com os dados existentes se já tiver
      if (produto.fabricacao || produto.lote || produto.validade) {
        setEntradas([{
          quantidade: produto.qtde || produto.quantidade_pedido || '',
          fabricacao: produto.fabricacao || formatDateISO(produto.fabricacaoBR) || '',
          fabricacaoBR: produto.fabricacaoBR || formatDateBR(produto.fabricacao) || '',
          lote: produto.lote || '',
          validade: produto.validade || formatDateISO(produto.validadeBR) || '',
          validadeBR: produto.validadeBR || formatDateBR(produto.validade) || '',
        }]);
      } else {
        setEntradas([{
          quantidade: '',
          fabricacao: '',
          fabricacaoBR: '',
          lote: '',
          validade: '',
          validadeBR: '',
        }]);
      }
      setErrors({});
    }
  }, [isOpen, produto]);

  const quantidadePedida = parseFloat(produto?.qtde || produto?.quantidade_pedido || 0);

  const handleAddEntrada = () => {
    setEntradas([...entradas, {
      quantidade: '',
      fabricacao: '',
      fabricacaoBR: '',
      lote: '',
      validade: '',
      validadeBR: '',
    }]);
  };

  const handleRemoveEntrada = (index) => {
    if (entradas.length === 1) {
      toast.error('É necessário ter pelo menos uma entrada');
      return;
    }
    setEntradas(entradas.filter((_, i) => i !== index));
    // Remover erros relacionados
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`${index}-`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...entradas];
    const entrada = { ...updated[index] };

    if (field === 'fabricacao') {
      entrada.fabricacao = value;
      entrada.fabricacaoBR = formatDateBR(value);
    } else if (field === 'validade') {
      entrada.validade = value;
      entrada.validadeBR = formatDateBR(value);
    } else {
      entrada[field] = value;
    }

    updated[index] = entrada;
    setEntradas(updated);

    // Remover erro do campo quando preencher
    const errorKey = `${index}-${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const validateEntradas = () => {
    const newErrors = {};
    let hasErrors = false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let somaQuantidades = 0;

    entradas.forEach((entrada, index) => {
      // Validar quantidade
      const quantidade = parseFloat(entrada.quantidade || 0);
      if (!entrada.quantidade || quantidade <= 0) {
        newErrors[`${index}-quantidade`] = 'Quantidade é obrigatória e deve ser maior que zero';
        hasErrors = true;
      } else {
        somaQuantidades += quantidade;
      }

      // Validar fabricação
      if (!entrada.fabricacao && !entrada.fabricacaoBR) {
        newErrors[`${index}-fabricacao`] = 'Fabricação é obrigatória';
        hasErrors = true;
      } else {
        const fabricacao = entrada.fabricacao || formatDateISO(entrada.fabricacaoBR);
        if (fabricacao) {
          const fabricacaoDate = new Date(fabricacao);
          fabricacaoDate.setHours(0, 0, 0, 0);
          if (fabricacaoDate > hoje) {
            newErrors[`${index}-fabricacao`] = 'Data de fabricação não pode ser superior à data atual';
            hasErrors = true;
          }
        }
      }

      // Validar lote
      if (!entrada.lote || entrada.lote.trim() === '') {
        newErrors[`${index}-lote`] = 'Lote é obrigatório';
        hasErrors = true;
      }

      // Validar validade
      if (!entrada.validade && !entrada.validadeBR) {
        newErrors[`${index}-validade`] = 'Validade é obrigatória';
        hasErrors = true;
      } else {
        const validade = entrada.validade || formatDateISO(entrada.validadeBR);
        if (validade) {
          const validadeDate = new Date(validade);
          validadeDate.setHours(0, 0, 0, 0);
          if (validadeDate < hoje) {
            newErrors[`${index}-validade`] = 'Data de validade não pode ser anterior à data atual';
            hasErrors = true;
          }
        }
      }

      // Validar se validade é posterior à fabricação
      const fabricacao = entrada.fabricacao || formatDateISO(entrada.fabricacaoBR);
      const validade = entrada.validade || formatDateISO(entrada.validadeBR);
      if (fabricacao && validade) {
        const fabricacaoDate = new Date(fabricacao);
        const validadeDate = new Date(validade);
        fabricacaoDate.setHours(0, 0, 0, 0);
        validadeDate.setHours(0, 0, 0, 0);
        if (validadeDate < fabricacaoDate) {
          newErrors[`${index}-validade`] = 'Data de validade não pode ser anterior à data de fabricação';
          hasErrors = true;
        }
      }
    });

    // Validar soma das quantidades
    if (somaQuantidades > quantidadePedida) {
      newErrors['soma'] = `A soma das quantidades (${somaQuantidades}) não pode ultrapassar a quantidade pedida (${quantidadePedida})`;
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleConfirm = () => {
    if (!validateEntradas()) {
      toast.error('Por favor, corrija os erros antes de confirmar');
      return;
    }

    // Criar produtos divididos mantendo os dados originais do produto
    const produtosDivididos = entradas.map((entrada, index) => ({
      ...produto,
      index: produto.index ? `${produto.index}-${index}` : index,
      qtde: entrada.quantidade,
      quantidade_pedido: entrada.quantidade,
      fabricacao: entrada.fabricacao || formatDateISO(entrada.fabricacaoBR),
      fabricacaoBR: entrada.fabricacaoBR || formatDateBR(entrada.fabricacao),
      lote: entrada.lote,
      validade: entrada.validade || formatDateISO(entrada.validadeBR),
      validadeBR: entrada.validadeBR || formatDateBR(entrada.validade),
      // Limpar outros campos que devem ser preenchidos individualmente
      controle_validade: null,
      temperatura: '',
      aval_sensorial: '',
      tam_lote: '',
      num_amostras_avaliadas: null,
      num_amostras_aprovadas: '',
      num_amostras_reprovadas: '',
      resultado_final: '', // Vazio inicialmente - será calculado após preenchimento dos dados
      ac: null,
      re: null,
      // Marcar como dividido para não duplicar o produto original
      _dividido: true
    }));

    onConfirm(produtosDivididos);
    onClose();
  };

  if (!isOpen || !produto) return null;

  const quantidadeRestante = quantidadePedida - entradas.reduce((sum, e) => sum + parseFloat(e.quantidade || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Dividir Produto">
      <div className="space-y-4">
        {/* Informações do Produto */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">Produto</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Código:</span> {produto.codigo || produto.codigo_produto || '-'}
            </div>
            <div>
              <span className="text-gray-600">Descrição:</span> {produto.descricao || produto.nome_produto || '-'}
            </div>
            <div>
              <span className="text-gray-600">Unidade:</span> {produto.und || produto.unidade_medida || '-'}
            </div>
            <div>
              <span className="text-gray-600 font-semibold">Quantidade Pedida:</span> {quantidadePedida}
            </div>
          </div>
        </div>

        {/* Aviso de quantidade */}
        {entradas.some(e => e.quantidade) && (
          <div className={`p-3 rounded-lg ${quantidadeRestante < 0 ? 'bg-red-50 border border-red-200' : quantidadeRestante > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
            <p className={`text-sm font-medium ${quantidadeRestante < 0 ? 'text-red-700' : quantidadeRestante > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
              {quantidadeRestante < 0 
                ? `⚠️ A soma das quantidades ultrapassa a quantidade pedida em ${Math.abs(quantidadeRestante.toFixed(2))}`
                : quantidadeRestante > 0
                ? `ℹ️ Quantidade restante: ${quantidadeRestante.toFixed(2)}`
                : '✅ Quantidade total preenchida corretamente'
              }
            </p>
          </div>
        )}

        {/* Erro de soma */}
        {errors.soma && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{errors.soma}</p>
          </div>
        )}

        {/* Lista de Entradas */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Entradas do Produto</h3>
            <Button
              type="button"
              onClick={handleAddEntrada}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FaPlus className="w-3 h-3" />
              Adicionar Entrada
            </Button>
          </div>

          {entradas.map((entrada, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-700">Entrada {index + 1}</h4>
                {entradas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEntrada(index)}
                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                    title="Remover entrada"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quantidade */}
                <div>
                  <Input
                    label={<span>Quantidade <span className="text-red-500">*</span></span>}
                    type="number"
                    step="0.01"
                    min="0"
                    max={quantidadePedida}
                    value={entrada.quantidade}
                    onChange={(e) => handleFieldChange(index, 'quantidade', e.target.value)}
                    error={errors[`${index}-quantidade`]}
                    placeholder="Quantidade recebida"
                  />
                </div>

                {/* Lote */}
                <div>
                  <Input
                    label={<span>Lote <span className="text-red-500">*</span></span>}
                    type="text"
                    value={entrada.lote}
                    onChange={(e) => handleFieldChange(index, 'lote', e.target.value)}
                    error={errors[`${index}-lote`]}
                    placeholder="Número do lote"
                  />
                </div>

                {/* Fabricação */}
                <div>
                  <Input
                    label={<span>Fabricação <span className="text-red-500">*</span></span>}
                    type="date"
                    value={entrada.fabricacao}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const dataSelecionada = e.target.value;
                      const hoje = new Date();
                      hoje.setHours(0, 0, 0, 0);
                      const dataFabricacao = new Date(dataSelecionada);
                      
                      if (dataFabricacao > hoje) {
                        const newErrors = { ...errors };
                        newErrors[`${index}-fabricacao`] = 'Data de fabricação não pode ser superior à data atual';
                        setErrors(newErrors);
                        return;
                      }
                      
                      handleFieldChange(index, 'fabricacao', dataSelecionada);
                      if (errors[`${index}-fabricacao`]) {
                        const newErrors = { ...errors };
                        delete newErrors[`${index}-fabricacao`];
                        setErrors(newErrors);
                      }
                    }}
                    error={errors[`${index}-fabricacao`]}
                  />
                </div>

                {/* Validade */}
                <div>
                  <Input
                    label={<span>Validade <span className="text-red-500">*</span></span>}
                    type="date"
                    value={entrada.validade}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const dataSelecionada = e.target.value;
                      const hoje = new Date();
                      hoje.setHours(0, 0, 0, 0);
                      const dataValidade = new Date(dataSelecionada);
                      
                      if (dataValidade < hoje) {
                        const newErrors = { ...errors };
                        newErrors[`${index}-validade`] = 'Data de validade não pode ser anterior à data atual';
                        setErrors(newErrors);
                        return;
                      }
                      
                      handleFieldChange(index, 'validade', dataSelecionada);
                      if (errors[`${index}-validade`]) {
                        const newErrors = { ...errors };
                        delete newErrors[`${index}-validade`];
                        setErrors(newErrors);
                      }
                    }}
                    error={errors[`${index}-validade`]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="md"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            variant="primary"
            size="md"
          >
            Confirmar Divisão
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProdutoDivisaoModal;

