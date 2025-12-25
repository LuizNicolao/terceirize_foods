import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaPaperPlane, FaAt, FaFileAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ChamadosService from '../../../services/chamados';
import UsuariosService from '../../../services/usuarios';
import TemplatesService from '../../../services/templates';
import { Button } from '../../ui';
import toast from 'react-hot-toast';

const ComentariosSection = ({ chamado, isViewMode }) => {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showMencionar, setShowMencionar] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [mencionarPosicao, setMencionarPosicao] = useState(0);
  const [expandedComentarios, setExpandedComentarios] = useState({}); // Estado para controlar expansão
  const textareaRef = useRef(null);

  useEffect(() => {
    if (chamado?.id) {
      loadComentarios();
      loadUsuarios();
    } else {
      setComentarios([]);
      setNovoComentario('');
    }
  }, [chamado?.id]);

  const loadComentarios = async () => {
    if (!chamado?.id) return;
    
    setLoadingComentarios(true);
    try {
      const result = await ChamadosService.listarComentarios(chamado.id);
      if (result.success) {
        setComentarios(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoadingComentarios(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const result = await UsuariosService.buscarAtivos();
      if (result.success) {
        setUsuarios(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const result = await TemplatesService.listar(chamado?.tipo || null);
      if (result.success) {
        setTemplates(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  useEffect(() => {
    if (chamado?.id && !isViewMode) {
      loadTemplates();
    }
  }, [chamado?.id, chamado?.tipo, isViewMode]);

  const handleComentarioChange = (e) => {
    const value = e.target.value;
    setNovoComentario(value);

    // Detectar @ para mencionar
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMencionarPosicao(lastAtIndex);
        setShowMencionar(true);
      } else {
        setShowMencionar(false);
      }
    } else {
      setShowMencionar(false);
    }
  };

  const handleMencionarUsuario = (usuario) => {
    const textBeforeAt = novoComentario.substring(0, mencionarPosicao);
    const textAfterAt = novoComentario.substring(mencionarPosicao);
    const textAfterAtSpace = textAfterAt.indexOf(' ') !== -1 ? textAfterAt.substring(textAfterAt.indexOf(' ')) : '';
    
    const novoTexto = `${textBeforeAt}@${usuario.nome}${textAfterAtSpace}`;
    setNovoComentario(novoTexto);
    setShowMencionar(false);

    // Focar no textarea novamente
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newPos = textBeforeAt.length + usuario.nome.length + 2; // +2 para @ e espaço
      textareaRef.current.setSelectionRange(newPos, newPos);
    }
  };

  const handleAddComentario = async () => {
    if (!novoComentario.trim() || !chamado?.id) return;

    try {
      const result = await ChamadosService.criarComentario(chamado.id, {
        comentario: novoComentario.trim(),
        tipo: 'comentario'
      });

      if (result.success) {
        toast.success(result.message || 'Comentário adicionado com sucesso!');
        setNovoComentario('');
        loadComentarios();
      } else {
        toast.error(result.message || 'Erro ao adicionar comentário');
      }
    } catch (error) {
      toast.error('Erro ao adicionar comentário');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const processarMencionar = (texto) => {
    // Processar menções no formato @nome
    const regex = /@(\w+)/g;
    return texto.split(regex).map((part, index) => {
      if (index % 2 === 1) {
        // É uma menção
        const usuario = usuarios.find(u => u.nome.toLowerCase() === part.toLowerCase());
        return (
          <span key={index} className="bg-blue-100 text-blue-800 px-1 rounded font-medium">
            @{usuario ? usuario.nome : part}
          </span>
        );
      }
      return part;
    });
  };

  const toggleComentario = (comentarioId) => {
    setExpandedComentarios(prev => ({
      ...prev,
      [comentarioId]: !prev[comentarioId]
    }));
  };

  const isComentarioExpanded = (comentarioId) => {
    return expandedComentarios[comentarioId] !== false; // Por padrão expandido
  };

  const usuariosFiltrados = showMencionar
    ? usuarios.filter(u => {
        const textoBusca = novoComentario.substring(mencionarPosicao + 1).toLowerCase();
        return u.nome.toLowerCase().includes(textoBusca) || 
               u.email.toLowerCase().includes(textoBusca);
      })
    : [];

  if (!chamado?.id) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500 flex items-center gap-2">
        <FaComments /> Comentários
      </h3>
      
      {/* Lista de comentários */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {loadingComentarios ? (
          <p className="text-sm text-gray-500 text-center py-4">Carregando comentários...</p>
        ) : comentarios.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Nenhum comentário ainda</p>
        ) : (
          comentarios.map((comentario) => {
            const isExpanded = isComentarioExpanded(comentario.id);
            const comentarioTexto = comentario.comentario || '';
            const isLongText = comentarioTexto.length > 200;
            const textoExibido = isExpanded || !isLongText 
              ? comentarioTexto 
              : comentarioTexto.substring(0, 200) + '...';
            
            return (
            <div key={comentario.id} className="bg-white p-3 rounded border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {comentario.usuario_nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(comentario.data_criacao)}
                  </p>
                </div>
                {comentario.tipo && comentario.tipo !== 'comentario' && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {comentario.tipo === 'resolucao' ? 'Resolução' : 'Atualização'}
                  </span>
                )}
              </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {processarMencionar(textoExibido)}
                </div>
                {isLongText && (
                  <button
                    onClick={() => toggleComentario(comentario.id)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        <FaChevronUp /> Retrair
                      </>
                    ) : (
                      <>
                        <FaChevronDown /> Ver mais
                      </>
                    )}
                  </button>
                )}
            </div>
            );
          })
        )}
      </div>

      {/* Formulário de novo comentário */}
      {!isViewMode && (
        <div className="relative">
          <div className="flex items-start gap-2">
            <div className="flex-1 relative">
              {/* Botão de Templates */}
              {templates.length > 0 && (
                <div className="relative mb-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <FaFileAlt /> Usar Template
                  </button>
                  {showTemplates && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setNovoComentario(template.conteudo);
                            setShowTemplates(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          <p className="font-medium text-gray-900">{template.nome}</p>
                          {template.categoria && (
                            <p className="text-xs text-gray-500">{template.categoria}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={novoComentario}
                onChange={handleComentarioChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleAddComentario();
                  }
                }}
                placeholder="Digite seu comentário... (Ctrl+Enter para enviar)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows="3"
              />
              {showMencionar && usuariosFiltrados.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {usuariosFiltrados.map((usuario) => (
                    <button
                      key={usuario.id}
                      onClick={() => handleMencionarUsuario(usuario)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaAt className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{usuario.nome}</p>
                        <p className="text-xs text-gray-500">{usuario.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleAddComentario}
              disabled={!novoComentario.trim()}
              size="sm"
              className="mt-auto"
            >
              <FaPaperPlane className="mr-2" />
              Enviar
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use @ para mencionar usuários
          </p>
        </div>
      )}
    </div>
  );
};

export default ComentariosSection;
