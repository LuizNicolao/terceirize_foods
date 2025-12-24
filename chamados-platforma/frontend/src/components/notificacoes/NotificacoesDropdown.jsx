import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaCheck, FaCheckDouble, FaTrash, FaTimes } from 'react-icons/fa';
import { useNotificacoes } from '../../hooks/useNotificacoes';
import { useNavigate } from 'react-router-dom';

const NotificacoesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { notificacoes, naoLidas, loading, marcarComoLida, marcarTodasComoLidas, excluir, carregarNotificacoes } = useNotificacoes(true, 30000);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      carregarNotificacoes();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, carregarNotificacoes]);

  const handleNotificationClick = async (notificacao) => {
    if (!notificacao.lida) {
      await marcarComoLida(notificacao.id);
    }
    
    if (notificacao.chamado_id) {
      navigate(`/chamados?view=${notificacao.chamado_id}`);
    }
    
    setIsOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg"
        aria-label="Notificações"
      >
        <FaBell className="w-5 h-5" />
        {naoLidas > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Notificações {naoLidas > 0 && `(${naoLidas})`}
            </h3>
            <div className="flex gap-2">
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasComoLidas}
                  className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
                  title="Marcar todas como lidas"
                >
                  <FaCheckDouble /> Todas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                Carregando...
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificacoes.map((notificacao) => (
                  <div
                    key={notificacao.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notificacao.lida ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notificacao)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notificacao.lida ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notificacao.titulo}
                          </p>
                          {!notificacao.lida && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notificacao.mensagem}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDate(notificacao.data_criacao)}
                          </span>
                          <div className="flex gap-1">
                            {!notificacao.lida && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  marcarComoLida(notificacao.id);
                                }}
                                className="text-xs text-green-600 hover:text-green-800 p-1"
                                title="Marcar como lida"
                              >
                                <FaCheck />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                excluir(notificacao.id);
                              }}
                              className="text-xs text-red-600 hover:text-red-800 p-1"
                              title="Excluir"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificacoes.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  navigate('/chamados');
                  setIsOpen(false);
                }}
                className="text-xs text-green-600 hover:text-green-800"
              >
                Ver todos os chamados
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificacoesDropdown;

