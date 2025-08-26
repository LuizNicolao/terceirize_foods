import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaDownload, FaExclamationTriangle, FaCheckCircle, FaPaperclip } from 'react-icons/fa';
import { anexosService } from '../../services/anexos';
import { ConfirmModal } from '../ui';
import toast from 'react-hot-toast';

const AnexosManager = ({ cotacaoId, fornecedorId, fornecedorNome, onAnexoChange }) => {
  const [anexos, setAnexos] = useState([]);
  const [validacoes, setValidacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [anexoToDelete, setAnexoToDelete] = useState(null);

  useEffect(() => {
    if (cotacaoId) {
      fetchAnexos();
      fetchValidacoes();
    }
  }, [cotacaoId, fornecedorId]);

  const fetchAnexos = async () => {
    try {
      setLoading(true);
      const data = await anexosService.getAnexos(cotacaoId);
      // Filtrar anexos do fornecedor específico
      const anexosFornecedor = data.filter(anexo => anexo.fornecedor_id === fornecedorId);
      setAnexos(anexosFornecedor);
    } catch (error) {
      console.error('Erro ao buscar anexos:', error);
      toast.error('Erro ao carregar anexos');
    } finally {
      setLoading(false);
    }
  };

  const fetchValidacoes = async () => {
    try {
      const data = await anexosService.getValidacaoAnexos(cotacaoId);
      // Filtrar validações do fornecedor específico
      const validacoesFornecedor = data.filter(v => v.fornecedor_id === fornecedorId);
      setValidacoes(validacoesFornecedor);
    } catch (error) {
      console.error('Erro ao buscar validações:', error);
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validar tipos de arquivo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'];
    
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error(`Tipo de arquivo não permitido: ${invalidFiles.map(f => f.name).join(', ')}. Apenas PDF, DOC, XLS e imagens são aceitos.`);
      return;
    }

    // Validar tamanho (10MB por arquivo)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`Arquivos muito grandes: ${oversizedFiles.map(f => f.name).join(', ')}. Tamanho máximo: 10MB por arquivo.`);
      return;
    }

    // Upload de múltiplos arquivos
    try {
      setUploading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        try {
          await anexosService.uploadAnexo(cotacaoId, fornecedorId, file, '');
          successCount++;
        } catch (error) {
          console.error(`Erro ao fazer upload de ${file.name}:`, error);
          errorCount++;
        }
      }

      // Limpar input
      document.getElementById(`file-input-${fornecedorId}`).value = '';
      
      // Mostrar resultado
      if (successCount > 0) {
        if (errorCount > 0) {
          toast.success(`${successCount} arquivo(s) enviado(s) com sucesso. ${errorCount} arquivo(s) com erro.`);
        } else {
          toast.success(`${successCount} arquivo(s) enviado(s) com sucesso!`);
        }
      } else {
        toast.error('Nenhum arquivo foi enviado com sucesso.');
      }
      
      // Recarregar anexos
      await fetchAnexos();
      
      // Notificar componente pai
      if (onAnexoChange) {
        onAnexoChange();
      }
    } catch (error) {
      console.error('Erro geral ao fazer upload:', error);
      toast.error('Erro ao processar upload dos arquivos');
    } finally {
      setUploading(false);
    }
  };



  const handleDeleteClick = (anexo) => {
    setAnexoToDelete(anexo);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!anexoToDelete) return;

    try {
      await anexosService.deleteAnexo(cotacaoId, anexoToDelete.id);
      toast.success('Anexo excluído com sucesso!');
      await fetchAnexos();
      
      if (onAnexoChange) {
        onAnexoChange();
      }
    } catch (error) {
      console.error('Erro ao excluir anexo:', error);
      toast.error(error.message || 'Erro ao excluir anexo');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setAnexoToDelete(null);
  };

  const getValidacaoStatus = () => {
    const validacoesObrigatorias = validacoes.filter(v => v.anexo_obrigatorio);
    const anexosEnviados = validacoesObrigatorias.filter(v => v.anexo_enviado);
    
    if (validacoesObrigatorias.length === 0) {
      return { status: 'none', message: 'Anexo obrigatório para este fornecedor' };
    }
    
    if (anexosEnviados.length === validacoesObrigatorias.length) {
      return { status: 'complete', message: 'Anexo obrigatório enviado' };
    }
    
    return { 
      status: 'pending', 
      message: 'Anexo obrigatório pendente' 
    };
  };

  const validacaoStatus = getValidacaoStatus();

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaPaperclip className="text-purple-600" size={14} />
          <span className="text-sm font-medium text-gray-700">Anexos</span>
          
          {/* Status da validação */}
          {validacaoStatus.status === 'complete' && (
            <div className="flex items-center gap-1 text-green-600">
              <FaCheckCircle size={12} />
              <span className="text-xs">OK</span>
            </div>
          )}
          {(validacaoStatus.status === 'pending' || validacaoStatus.status === 'none') && (
            <div className="flex items-center gap-1 text-orange-600">
              <FaExclamationTriangle size={12} />
              <span className="text-xs">Obrigatório</span>
            </div>
          )}
        </div>
      </div>

      {/* Interface compacta de upload */}
      <div className="flex items-center gap-2 mb-2">
        <input
          id={`file-input-${fornecedorId}`}
          type="file"
          multiple
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => document.getElementById(`file-input-${fornecedorId}`).click()}
          disabled={uploading}
          className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:bg-gray-300 transition-colors"
        >
          <FaUpload size={10} />
          {uploading ? 'Enviando...' : 'Escolher Arquivos'}
        </button>
      </div>

      {/* Lista compacta de anexos */}
      {loading ? (
        <div className="text-xs text-gray-500">Carregando...</div>
      ) : anexos.length > 0 && (
        <div className="space-y-1">
          {anexos.map((anexo) => (
            <div key={anexo.id} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate" title={anexo.nome_arquivo}>
                  {anexo.nome_arquivo}
                </div>
                <div className="text-gray-500">
                  {new Date(anexo.data_upload).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => window.open(`/api/cotacoes/${cotacaoId}/anexos/${anexo.id}/download`, '_blank')}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Download"
                >
                  <FaDownload size={10} />
                </button>
                <button
                  onClick={() => handleDeleteClick(anexo)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Excluir"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Anexo"
        message={`Tem certeza que deseja excluir o anexo "${anexoToDelete?.nome_arquivo}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default AnexosManager;
