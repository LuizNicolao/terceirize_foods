/**
 * Página Principal de Cotações
 * Implementa listagem, busca e ações principais
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal } from '../../components/ui';
import CotacoesService from '../../services/cotacoes';
import './CotacoesPage.css';

const CotacoesPage = () => {
  const navigate = useNavigate();
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [paginacao, setPaginacao] = useState({
    page: 1,
    total: 0,
    totalPages: 0
  });
  const [modalExcluir, setModalExcluir] = useState({
    isOpen: false,
    cotacaoId: null,
    cotacaoNome: ''
  });

  // Carregar cotações
  const carregarCotacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CotacoesService.listarCotacoes(filtros);
      
      if (response.success) {
        setCotacoes(response.data);
        if (response.meta?.pagination) {
          setPaginacao(response.meta.pagination);
        }
      } else {
        setError(response.message || 'Erro ao carregar cotações');
      }
    } catch (error) {
      setError(error.message || 'Erro ao carregar cotações');
    } finally {
      setLoading(false);
    }
  };

  // Carregar cotações na montagem e quando filtros mudarem
  useEffect(() => {
    carregarCotacoes();
  }, [filtros]);

  // Atualizar filtros
  const atualizarFiltros = (novosFiltros) => {
    setFiltros(prev => ({
      ...prev,
      ...novosFiltros,
      page: 1 // Reset para primeira página
    }));
  };

  // Mudar página
  const mudarPagina = (novaPagina) => {
    setFiltros(prev => ({
      ...prev,
      page: novaPagina
    }));
  };

  // Excluir cotação
  const excluirCotacao = async () => {
    try {
      const response = await CotacoesService.excluirCotacao(modalExcluir.cotacaoId);
      
      if (response.success) {
        setModalExcluir({ isOpen: false, cotacaoId: null, cotacaoNome: '' });
        carregarCotacoes(); // Recarregar lista
      } else {
        setError(response.message || 'Erro ao excluir cotação');
      }
    } catch (error) {
      setError(error.message || 'Erro ao excluir cotação');
    }
  };

  // Abrir modal de exclusão
  const abrirModalExcluir = (cotacao) => {
    setModalExcluir({
      isOpen: true,
      cotacaoId: cotacao.id,
      cotacaoNome: cotacao.local_entrega
    });
  };

  // Formatar status
  const formatarStatus = (status) => {
    const statusMap = {
      'pendente': { label: 'Pendente', className: 'status-pendente' },
      'em_analise': { label: 'Em Análise', className: 'status-analise' },
      'aprovada': { label: 'Aprovada', className: 'status-aprovada' },
      'rejeitada': { label: 'Rejeitada', className: 'status-rejeitada' },
      'cancelada': { label: 'Cancelada', className: 'status-cancelada' }
    };
    
    return statusMap[status] || { label: status, className: 'status-default' };
  };

  // Formatar data
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="cotacoes-page">
      {/* Header */}
      <div className="cotacoes-page__header">
        <div className="cotacoes-page__title">
          <h1>Cotações</h1>
          <p>Gerencie suas cotações de compra</p>
        </div>
        <div className="cotacoes-page__actions">
          <Button
            variant="primary"
            onClick={() => navigate('/cotacoes/nova')}
          >
            Nova Cotação
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="cotacoes-page__filtros">
        <div className="filtros-grid">
          <div className="filtro-item">
            <label htmlFor="search">Buscar</label>
            <input
              id="search"
              type="text"
              placeholder="Local de entrega, justificativa..."
              value={filtros.search}
              onChange={(e) => atualizarFiltros({ search: e.target.value })}
            />
          </div>
          
          <div className="filtro-item">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={filtros.status}
              onChange={(e) => atualizarFiltros({ status: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="em_analise">Em Análise</option>
              <option value="aprovada">Aprovada</option>
              <option value="rejeitada">Rejeitada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          
          <div className="filtro-item">
            <label htmlFor="limit">Itens por página</label>
            <select
              id="limit"
              value={filtros.limit}
              onChange={(e) => atualizarFiltros({ limit: parseInt(e.target.value) })}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Cotações */}
      <div className="cotacoes-page__content">
        {loading ? (
          <Card className="cotacoes-page__loading">
            <div className="loading-spinner">Carregando...</div>
          </Card>
        ) : error ? (
          <Card className="cotacoes-page__error">
            <div className="error-message">
              <p>{error}</p>
              <Button variant="outline" onClick={carregarCotacoes}>
                Tentar Novamente
              </Button>
            </div>
          </Card>
        ) : cotacoes.length === 0 ? (
          <Card className="cotacoes-page__empty">
            <div className="empty-state">
              <p>Nenhuma cotação encontrada</p>
              <Button variant="primary" onClick={() => navigate('/cotacoes/nova')}>
                Criar Primeira Cotação
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Grid de Cotações */}
            <div className="cotacoes-grid">
              {cotacoes.map((cotacao) => (
                <Card
                  key={cotacao.id}
                  className="cotacao-card"
                  hover
                  onClick={() => navigate(`/cotacoes/${cotacao.id}`)}
                >
                  <Card.Header>
                    <Card.Title>Cotacao #{cotacao.id}</Card.Title>
                    <span className={`status-badge ${formatarStatus(cotacao.status).className}`}>
                      {formatarStatus(cotacao.status).label}
                    </span>
                  </Card.Header>
                  
                  <Card.Body>
                    <div className="cotacao-info">
                      <div className="info-item">
                        <strong>Local:</strong> {cotacao.local_entrega}
                      </div>
                      <div className="info-item">
                        <strong>Comprador:</strong> {cotacao.comprador_nome}
                      </div>
                      <div className="info-item">
                        <strong>Tipo:</strong> {cotacao.tipo_compra}
                      </div>
                      <div className="info-item">
                        <strong>Produtos:</strong> {cotacao.total_produtos || 0}
                      </div>
                      <div className="info-item">
                        <strong>Criada em:</strong> {formatarData(cotacao.data_criacao)}
                      </div>
                    </div>
                  </Card.Body>
                  
                  <Card.Footer>
                    <div className="cotacao-actions">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/cotacoes/${cotacao.id}/editar`);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/cotacoes/${cotacao.id}`);
                        }}
                      >
                        Visualizar
                      </Button>
                      {cotacao.status === 'pendente' && (
                        <Button
                          variant="danger"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirModalExcluir(cotacao);
                          }}
                        >
                          Excluir
                        </Button>
                      )}
                    </div>
                  </Card.Footer>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            {paginacao.totalPages > 1 && (
              <div className="cotacoes-page__paginacao">
                <Button
                  variant="outline"
                  disabled={paginacao.page === 1}
                  onClick={() => mudarPagina(paginacao.page - 1)}
                >
                  Anterior
                </Button>
                
                <span className="paginacao-info">
                  Página {paginacao.page} de {paginacao.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  disabled={paginacao.page === paginacao.totalPages}
                  onClick={() => mudarPagina(paginacao.page + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={modalExcluir.isOpen}
        onClose={() => setModalExcluir({ isOpen: false, cotacaoId: null, cotacaoNome: '' })}
        title="Confirmar Exclusão"
        size="small"
      >
        <Modal.Body>
          <p>
            Tem certeza que deseja excluir a cotação <strong>{modalExcluir.cotacaoNome}</strong>?
          </p>
          <p>Esta ação não pode ser desfeita.</p>
        </Modal.Body>
        
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setModalExcluir({ isOpen: false, cotacaoId: null, cotacaoNome: '' })}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={excluirCotacao}
          >
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CotacoesPage;
