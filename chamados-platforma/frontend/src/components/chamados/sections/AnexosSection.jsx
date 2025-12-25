import React, { useState, useRef, useCallback } from 'react';
import { FaPaperclip, FaTrash, FaDownload, FaImage, FaTimes } from 'react-icons/fa';
import ChamadosService from '../../../services/chamados';
import toast from 'react-hot-toast';

// Helper para obter URL base da API
const getApiBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://foods.terceirizemais.com.br/chamados/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3007/chamados/api';
};

const AnexosSection = ({ chamado, isViewMode, onAnexosChange, tipoAnexo = 'problema' }) => {
  const [arquivosSelecionados, setArquivosSelecionados] = useState([]);
  const [anexosExistentes, setAnexosExistentes] = useState([]);
  const [loadingAnexos, setLoadingAnexos] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrls, setImageUrls] = useState({}); // Cache de URLs de imagens
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  React.useEffect(() => {
    if (chamado?.id) {
      loadAnexos();
    } else {
      setArquivosSelecionados([]);
      setAnexosExistentes([]);
    }
  }, [chamado?.id]);

  // Limpar cache de imagens quando desmontar ou mudar de chamado
  React.useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [chamado?.id]);

  const loadAnexos = async () => {
    if (!chamado?.id) return;
    
    setLoadingAnexos(true);
    try {
      const result = await ChamadosService.listarAnexos(chamado.id);
      if (result.success) {
        let anexos = result.data || [];
        // Filtrar anexos por tipo se tipoAnexo for especificado
        if (tipoAnexo) {
          anexos = anexos.filter(anexo => {
            // Se tipo_anexo existe, filtrar por ele, senão considerar 'problema' como padrão
            const anexoTipo = anexo.tipo_anexo || 'problema';
            return anexoTipo === tipoAnexo;
          });
        }
        setAnexosExistentes(anexos);
        
        // Carregar URLs de imagens com autenticação
        const imageUrlsMap = {};
        for (const anexo of anexos) {
          if (isImageFile(anexo.nome_arquivo)) {
            try {
              const downloadResult = await ChamadosService.downloadAnexo(chamado.id, anexo.id);
              if (downloadResult.success && downloadResult.data) {
                const blob = downloadResult.data;
                imageUrlsMap[anexo.id] = URL.createObjectURL(blob);
              }
            } catch (error) {
              console.error(`Erro ao carregar imagem ${anexo.id}:`, error);
            }
          }
        }
        setImageUrls(imageUrlsMap);
      }
    } catch (error) {
      console.error('Erro ao carregar anexos:', error);
    } finally {
      setLoadingAnexos(false);
    }
  };

  const handleFileSelect = useCallback((files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} excede o limite de 10MB`);
        return false;
      }
      return true;
    });
    
    setArquivosSelecionados(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleRemoveFile = (index) => {
    setArquivosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownloadAnexo = async (anexo) => {
    try {
      const result = await ChamadosService.downloadAnexo(chamado.id, anexo.id);
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', anexo.nome_arquivo);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        toast.error(result.error || 'Erro ao baixar arquivo');
      }
    } catch (error) {
      toast.error('Erro ao baixar arquivo');
      console.error(error);
    }
  };

  const handleDeleteAnexo = async (anexoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este anexo?')) {
      return;
    }

    try {
      const result = await ChamadosService.excluirAnexo(chamado.id, anexoId);
      if (result.success) {
        toast.success(result.message || 'Anexo excluído com sucesso!');
        loadAnexos();
        if (onAnexosChange) onAnexosChange();
      } else {
        toast.error(result.error || 'Erro ao excluir anexo');
      }
    } catch (error) {
      toast.error('Erro ao excluir anexo');
      console.error(error);
    }
  };

  const handleUploadExisting = async (files) => {
    for (const file of files) {
      try {
        const result = await ChamadosService.uploadAnexo(chamado.id, file, tipoAnexo || 'problema');
        if (result.success) {
          toast.success(`Arquivo ${file.name} enviado com sucesso!`);
          loadAnexos();
          if (onAnexosChange) onAnexosChange();
        } else {
          toast.error(`Erro ao enviar ${file.name}: ${result.message}`);
        }
      } catch (error) {
        toast.error(`Erro ao enviar ${file.name}`);
        console.error(error);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and Drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isViewMode) {
      setIsDragging(true);
    }
  }, [isViewMode]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isViewMode) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (chamado?.id) {
        handleUploadExisting(files);
      } else {
        handleFileSelect(files);
      }
    }
  }, [isViewMode, chamado?.id, handleFileSelect, handleUploadExisting]);

  const isImageFile = (fileName) => {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
    return imageExtensions.test(fileName);
  };

  const getImagePreview = (file) => {
    if (file instanceof File && isImageFile(file.name)) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Expor arquivos selecionados para o componente pai
  React.useEffect(() => {
    if (onAnexosChange) {
      onAnexosChange(arquivosSelecionados);
    }
  }, [arquivosSelecionados, onAnexosChange]);

  return (
    <div>
      
      {!isViewMode && (
        <>
          {/* Upload para novo chamado */}
          {!chamado && (
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isDragging 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FaPaperclip className="text-3xl text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500">
                  Máximo 10MB por arquivo. Formatos: Imagens, PDF, Word, Excel, TXT, ZIP, RAR
                </p>
              </label>
            </div>
          )}

          {/* Upload para chamado existente */}
          {chamado?.id && (
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-4 text-center transition-colors mb-3
                ${isDragging 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleUploadExisting(e.target.files)}
                className="hidden"
                id="file-upload-existing"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
              />
              <label
                htmlFor="file-upload-existing"
                className="cursor-pointer flex flex-col items-center"
              >
                <FaPaperclip className="text-2xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-700">
                  Arraste arquivos aqui ou clique para adicionar
                </p>
              </label>
            </div>
          )}

          {/* Lista de arquivos selecionados com preview */}
          {arquivosSelecionados.length > 0 && (
            <div className="space-y-2 mb-3">
              <p className="text-sm font-medium text-gray-700">Arquivos selecionados:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {arquivosSelecionados.map((file, index) => {
                  const imagePreview = getImagePreview(file);
                  return (
                    <div key={index} className="relative bg-white p-2 rounded border border-gray-200 group">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt={file.name}
                            className="w-full h-24 object-cover rounded"
                            onLoad={() => {
                              // Cleanup object URL when component unmounts
                              return () => URL.revokeObjectURL(imagePreview);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage(imagePreview);
                            }}
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center"
                          >
                            <FaImage className="text-white opacity-0 group-hover:opacity-100" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                          <FaPaperclip className="text-2xl text-gray-400" />
                        </div>
                      )}
                      <div className="mt-2">
                        <p className="text-xs text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Lista de anexos existentes com preview */}
      {chamado?.id && (
        <div className="space-y-2">
          {loadingAnexos ? (
            <p className="text-sm text-gray-500 text-center py-2">Carregando anexos...</p>
          ) : anexosExistentes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              {isViewMode ? 'Nenhum anexo' : 'Nenhum anexo ainda'}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {anexosExistentes.map((anexo) => {
                const isImage = isImageFile(anexo.nome_arquivo);
                return (
                  <div key={anexo.id} className="relative bg-white p-2 rounded border border-gray-200 group">
                    {isImage ? (
                      <div className="relative">
                        {imageUrls[anexo.id] ? (
                        <img
                            src={imageUrls[anexo.id]}
                          alt={anexo.nome_arquivo}
                          className="w-full h-24 object-cover rounded cursor-pointer"
                            onClick={() => setPreviewImage(imageUrls[anexo.id])}
                          onError={(e) => {
                              console.error('Erro ao carregar imagem:', e);
                              if (e.target.nextSibling) {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                              }
                          }}
                        />
                        ) : (
                          <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                            <FaImage className="text-2xl text-gray-400" />
                          </div>
                        )}
                        <div className="hidden w-full h-24 bg-gray-100 rounded items-center justify-center">
                          <FaImage className="text-2xl text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-full h-24 bg-gray-100 rounded flex items-center justify-center cursor-pointer"
                        onClick={() => handleDownloadAnexo(anexo)}
                      >
                        <FaPaperclip className="text-2xl text-gray-400" />
                      </div>
                    )}
                    <div className="mt-2">
                      <p className="text-xs text-gray-900 truncate" title={anexo.nome_arquivo}>
                        {anexo.nome_arquivo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(anexo.tamanho)} • {formatDate(anexo.data_upload)}
                      </p>
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleDownloadAnexo(anexo)}
                        className="bg-blue-500 text-white rounded-full p-1"
                        title="Baixar arquivo"
                      >
                        <FaDownload className="w-3 h-3" />
                      </button>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAnexo(anexo.id)}
                          className="bg-red-500 text-white rounded-full p-1"
                          title="Excluir arquivo"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Preview de Imagem */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-100"
            >
              <FaTimes />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnexosSection;
