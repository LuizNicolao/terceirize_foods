import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, SearchableSelect } from '../ui';
import { FaSave, FaTimes, FaCamera, FaCheckCircle, FaTimesCircle, FaTools } from 'react-icons/fa';
import { useSolicitacoesManutencao } from '../../hooks/useSolicitacoesManutencao';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Função para obter a data atual no formato YYYY-MM-DD
const obterDataAtual = () => {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const SolicitacaoModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  solicitacao = null, 
  escolas = [], 
  loading = false,
  viewMode = false,
  userType = null,
  // Props para gerenciamento
  showManagementActions = false,
  onAprovar = null,
  onReprovar = null,
  onConcluir = null,
  managementLoading = false
}) => {
  const { user } = useAuth();
  const { 
    criarSolicitacao, 
    atualizarSolicitacao, 
    uploadFoto,
    loading: solicitacoesLoading 
  } = useSolicitacoesManutencao();

  const [formData, setFormData] = useState({
    data_solicitacao: obterDataAtual(),
    escola_id: '',
    cidade: '',
    fornecedor: '',
    nutricionista_email: '',
    manutencao_descricao: '',
    foto_equipamento: '',
    valor: '',
    data_servico: '',
    numero_ordem_servico: '',
    status: 'Pendente',
    observacoes: ''
  });

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // Função para formatar data para input type="date"
  const formatarDataParaInput = (dateString) => {
    if (!dateString) return obterDataAtual();
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    return dateString;
  };

  // Carregar dados da solicitação quando modal é aberto para edição
  useEffect(() => {
    if (isOpen && solicitacao) {
      setFormData({
        data_solicitacao: formatarDataParaInput(solicitacao.data_solicitacao),
        escola_id: solicitacao.escola_id ? solicitacao.escola_id.toString() : '',
        cidade: solicitacao.cidade || '',
        fornecedor: solicitacao.fornecedor || '',
        nutricionista_email: solicitacao.nutricionista_email || '',
        manutencao_descricao: solicitacao.manutencao_descricao || '',
        foto_equipamento: solicitacao.foto_equipamento || '',
        valor: solicitacao.valor || '',
        data_servico: formatarDataParaInput(solicitacao.data_servico) || '',
        numero_ordem_servico: solicitacao.numero_ordem_servico || '',
        status: solicitacao.status || 'Pendente',
        observacoes: solicitacao.observacoes || ''
      });
      setFotoPreview(solicitacao.foto_equipamento || null);
    } else if (isOpen && !solicitacao) {
      // Limpar dados para nova solicitação
      setFormData({
        data_solicitacao: obterDataAtual(),
        escola_id: '',
        cidade: '',
        fornecedor: '',
        nutricionista_email: user?.email || '',
        manutencao_descricao: '',
        foto_equipamento: '',
        valor: '',
        data_servico: '',
        numero_ordem_servico: '',
        status: 'Pendente',
        observacoes: ''
      });
      setFotoPreview(null);
      setFotoFile(null);
    }
  }, [isOpen, solicitacao, user?.email, escolas]);

  // Auto-preencher cidade quando escola for selecionada
  useEffect(() => {
    if (formData.escola_id && escolas.length > 0) {
      const escolaSelecionada = escolas.find(escola => escola.id.toString() === formData.escola_id);
      if (escolaSelecionada) {
        setFormData(prev => ({
          ...prev,
          cidade: escolaSelecionada.cidade || ''
        }));
      }
    }
  }, [formData.escola_id, escolas]);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFotoFile(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setFotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFoto = async () => {
    if (!fotoFile) {
      toast.error('Selecione uma foto para enviar');
      return;
    }

    setUploadingFoto(true);
    try {
      const fotoUrl = await uploadFoto(fotoFile);
      setFormData(prev => ({
        ...prev,
        foto_equipamento: fotoUrl
      }));
      toast.success('Foto enviada com sucesso');
    } catch (error) {
      toast.error('Erro ao enviar foto');
      console.error('Erro no upload:', error);
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validações
      if (!formData.escola_id) {
        toast.error('Selecione uma escola');
        return;
      }
      if (!formData.manutencao_descricao.trim()) {
        toast.error('Descrição da manutenção é obrigatória');
        return;
      }
      if (formData.manutencao_descricao.length < 10) {
        toast.error('Descrição deve ter pelo menos 10 caracteres');
        return;
      }
      if (canEditSpecificFields && (!formData.fornecedor || !formData.valor || !formData.data_servico)) {
        toast.error('Fornecedor, valor e data do serviço são obrigatórios para conclusão');
        return;
      }

      const dadosSolicitacao = {
        ...formData,
        escola_id: parseInt(formData.escola_id),
        valor: formData.valor ? parseFloat(formData.valor) : null,
        nutricionista_email: user?.email, // Sempre usar o email do usuário logado
        // Se status for "Pendente manutencao" e todos os campos obrigatórios estiverem preenchidos, mudar para "Concluido"
        status: (canEditSpecificFields && formData.fornecedor && formData.valor && formData.data_servico) 
          ? 'Concluido' 
          : formData.status
      };

      // Passar dados para a página principal fazer a operação CRUD
      onSave(dadosSolicitacao);
    } catch (error) {
      console.error('Erro ao salvar solicitação:', error);
      toast.error('Erro interno do servidor');
    }
  };



  // Se status for "Aprovado", "Reprovado" ou "Concluido", forçar modo de visualização
  const isViewMode = viewMode || ['Aprovado', 'Reprovado', 'Concluido'].includes(formData.status);
  
  // Determinar se o usuário pode editar campos específicos (fornecedor, valor, data_servico)
  // Usar userType do parâmetro ou do contexto como fallback
  const currentUserType = userType || user?.tipo_usuario;
  const canEditSpecificFields = (currentUserType === 'Coordenacao' || currentUserType === 'Supervisao') && 
                                formData.status === 'Pendente manutencao';
  
  // Determinar se deve ocultar campos quando criado por nutricionista
  const isNutricionista = currentUserType === 'Nutricionista';
  const shouldHideFields = isNutricionista; // Ocultar sempre para nutricionistas (criação e visualização)


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isViewMode 
          ? 'Visualizar Solicitação de Manutenção'
          : solicitacao 
            ? 'Editar Solicitação de Manutenção' 
            : 'Nova Solicitação de Manutenção'
      }
      size="xl"
    >
      <div className="space-y-4">
        {/* Data da Solicitação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data da Solicitação *
          </label>
          <Input
            type="date"
            value={formData.data_solicitacao}
            onChange={(e) => handleInputChange('data_solicitacao', e.target.value)}
            disabled={loading || solicitacoesLoading || isViewMode || (formData.status === 'Pendente manutencao' && !canEditSpecificFields)}
            readOnly={formData.status === 'Pendente manutencao' || formData.status === 'Concluido'}
          />
        </div>

        {/* Escola */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Escola *
          </label>
          <SearchableSelect
            options={escolas.map(escola => ({
              value: escola.id.toString(),
              label: `${escola.nome_escola} - ${escola.rota}`
            }))}
            value={formData.escola_id}
            onChange={(value) => handleInputChange('escola_id', value)}
            placeholder="Selecione uma escola"
            disabled={loading || solicitacoesLoading || isViewMode || (formData.status === 'Pendente manutencao' && !canEditSpecificFields)}
            readOnly={formData.status === 'Pendente manutencao' || formData.status === 'Concluido'}
          />
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade *
          </label>
          <Input
            type="text"
            value={formData.cidade}
            placeholder="Cidade da escola"
            disabled={true}
            readOnly={true}
            className="bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Preenchido automaticamente ao selecionar a escola
          </p>
        </div>

        {/* Fornecedor */}
        {!shouldHideFields && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${canEditSpecificFields ? 'text-red-700' : 'text-gray-700'}`}>
              Fornecedor
              {canEditSpecificFields && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="text"
              value={formData.fornecedor}
              onChange={(e) => handleInputChange('fornecedor', e.target.value)}
              placeholder="Nome do fornecedor"
              disabled={loading || solicitacoesLoading || !canEditSpecificFields}
              className={canEditSpecificFields ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {formData.status === 'Pendente manutencao' && !canEditSpecificFields && (
              <p className="text-xs text-gray-500 mt-1">
                Disponível apenas para Coordenador/Supervisor quando status for "Pendente manutencao"
              </p>
            )}
            {formData.status === 'Pendente manutencao' && !formData.fornecedor && canEditSpecificFields && (
              <p className="text-xs text-red-500 mt-1">
                Campo obrigatório para conclusão
              </p>
            )}
          </div>
        )}

        {/* Solicitante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Solicitante *
          </label>
          <Input
            type="text"
            value={user?.nome || ''}
            placeholder="Nome do solicitante"
            disabled={true}
            readOnly={true}
            className="bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Preenchido automaticamente com seu nome
          </p>
        </div>

        {/* Descrição da Manutenção */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Manutenção a ser realizada *
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={formData.manutencao_descricao}
            onChange={(e) => handleInputChange('manutencao_descricao', e.target.value)}
            placeholder="Descreva detalhadamente a manutenção necessária"
            rows={4}
            disabled={loading || solicitacoesLoading || isViewMode || (formData.status === 'Pendente manutencao' && !canEditSpecificFields)}
            readOnly={formData.status === 'Pendente manutencao' || formData.status === 'Concluido'}
          />
        </div>

        {/* Upload de Foto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foto do Equipamento
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              disabled={loading || solicitacoesLoading || isViewMode || (formData.status === 'Pendente manutencao' && !canEditSpecificFields)}
            readOnly={formData.status === 'Pendente manutencao' || formData.status === 'Concluido'}
            />
            {fotoFile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUploadFoto}
                disabled={uploadingFoto || loading || solicitacoesLoading || isViewMode || (formData.status === 'Pendente manutencao' && !canEditSpecificFields)}
                className="flex items-center gap-2"
              >
                <FaCamera className="text-sm" />
                {uploadingFoto ? 'Enviando...' : 'Enviar Foto'}
              </Button>
            )}
            {fotoPreview && (
              <div className="mt-2">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Valor */}
        {!shouldHideFields && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${canEditSpecificFields ? 'text-red-700' : 'text-gray-700'}`}>
              Valor (R$)
              {canEditSpecificFields && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => handleInputChange('valor', e.target.value)}
              placeholder="0,00"
              disabled={loading || solicitacoesLoading || !canEditSpecificFields}
              className={canEditSpecificFields ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {formData.status === 'Pendente manutencao' && !canEditSpecificFields && (
              <p className="text-xs text-gray-500 mt-1">
                Disponível apenas para Coordenador/Supervisor quando status for "Pendente manutencao"
              </p>
            )}
            {formData.status === 'Pendente manutencao' && !formData.valor && canEditSpecificFields && (
              <p className="text-xs text-red-500 mt-1">
                Campo obrigatório para conclusão
              </p>
            )}
          </div>
        )}

        {/* Data do Serviço */}
        {!shouldHideFields && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${canEditSpecificFields ? 'text-red-700' : 'text-gray-700'}`}>
              Data do Serviço
              {canEditSpecificFields && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="date"
              value={formData.data_servico}
              onChange={(e) => handleInputChange('data_servico', e.target.value)}
              disabled={loading || solicitacoesLoading || !canEditSpecificFields}
              className={canEditSpecificFields ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {formData.status === 'Pendente manutencao' && !canEditSpecificFields && (
              <p className="text-xs text-gray-500 mt-1">
                Disponível apenas para Coordenador/Supervisor quando status for "Pendente manutencao"
              </p>
            )}
            {formData.status === 'Pendente manutencao' && !formData.data_servico && canEditSpecificFields && (
              <p className="text-xs text-red-500 mt-1">
                Campo obrigatório para conclusão
              </p>
            )}
          </div>
        )}

        {/* Número da Ordem de Serviço */}
        {!shouldHideFields && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${canEditSpecificFields ? 'text-red-700' : 'text-gray-700'}`}>
              Número da Ordem de Serviço
            </label>
            <Input
              type="text"
              value={formData.numero_ordem_servico}
              onChange={(e) => handleInputChange('numero_ordem_servico', e.target.value)}
              placeholder="Ex: OS-2025-001"
              disabled={loading || solicitacoesLoading || !canEditSpecificFields}
              className={canEditSpecificFields ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {formData.status === 'Pendente manutencao' && !canEditSpecificFields && (
              <p className="text-xs text-gray-500 mt-1">
                Disponível apenas para Coordenador/Supervisor quando status for "Pendente manutencao"
              </p>
            )}
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <Input
            type="text"
            value={formData.status}
            disabled={true}
            className="bg-gray-100"
          />
          {!solicitacao && (
            <p className="text-xs text-gray-500 mt-1">
              Status inicial sempre será "Pendente"
            </p>
          )}
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            placeholder="Observações adicionais"
            rows={3}
            disabled={loading || solicitacoesLoading || isViewMode || (formData.status === 'Pendente manutencao' && !canEditSpecificFields)}
            readOnly={formData.status === 'Pendente manutencao' || formData.status === 'Concluido'}
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-between gap-3 mt-6 pt-4 border-t">
        {/* Botões de gerenciamento (esquerda) */}
        {showManagementActions && isViewMode && (
          <div className="flex space-x-2">
            {solicitacao?.status === 'Pendente' && (
              <>
                <Button
                  variant="success"
                  onClick={onAprovar}
                  disabled={managementLoading}
                  size="sm"
                >
                  <FaCheckCircle className="mr-2" />
                  Aprovar
                </Button>
                <Button
                  variant="danger"
                  onClick={onReprovar}
                  disabled={managementLoading}
                  size="sm"
                >
                  <FaTimesCircle className="mr-2" />
                  Reprovar
                </Button>
              </>
            )}
            {solicitacao?.status === 'Pendente manutencao' && (
              <Button
                variant="primary"
                onClick={onConcluir}
                disabled={managementLoading}
                size="sm"
              >
                <FaTools className="mr-2" />
                Concluir
              </Button>
            )}
          </div>
        )}

        {/* Botões padrão (direita) */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading || solicitacoesLoading || managementLoading}
          >
            <FaTimes className="mr-2" />
            {isViewMode ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isViewMode && (
            <Button
              onClick={handleSave}
              disabled={loading || solicitacoesLoading}
            >
              <FaSave className="mr-2" />
              {solicitacao ? 'Atualizar' : 'Salvar'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SolicitacaoModal;
