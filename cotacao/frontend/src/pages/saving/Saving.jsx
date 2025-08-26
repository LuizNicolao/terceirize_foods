import React, { useState, useEffect } from 'react';
import { FaPlus, FaDownload, FaChartBar, FaRefresh, FaSearch, FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaFilter, FaEraser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SavingService from '../../services/saving';
import SavingModal from '../../components/saving/SavingModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Saving = () => {
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({
        pagina: 1,
        limite: 10,
        total: 0,
        total_paginas: 0
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedSaving, setSelectedSaving] = useState(null);
    const [modalType, setModalType] = useState('view');
    const [compradores, setCompradores] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [compradoresList, setCompradoresList] = useState([]);

    // Carregar dados iniciais
    useEffect(() => {
        carregarSavings();
        carregarCompradores();
        carregarListaCompradores();
    }, [filters, pagination.pagina]);

    const carregarSavings = async () => {
        try {
            setLoading(true);
            
            const params = {
                ...filters,
                pagina: pagination.pagina,
                limite: pagination.limite
            };

            const response = await SavingService.listarSaving(params);
            const data = response.data || response;
            
            const registrosProcessados = (data.registros || []).map(registro => ({
                ...registro,
                valor_total_inicial: parseFloat(registro.valor_total_inicial) || 0,
                valor_total_final: parseFloat(registro.valor_total_final) || 0,
                economia: parseFloat(registro.economia) || 0,
                economia_percentual: parseFloat(registro.economia_percentual) || 0
            }));
            
            setSavings(registrosProcessados);
            setPagination({
                pagina: data.pagina || 1,
                limite: data.limite || 10,
                total: data.total || 0,
                total_paginas: data.total_paginas || 0
            });
            
            if (data.resumo) {
                // Converter valores string para número no resumo
                const resumoProcessado = {
                    ...data.resumo,
                    economia_total: parseFloat(data.resumo.economia_total) || 0,
                    economia_media_percentual: parseFloat(data.resumo.economia_media_percentual) || 0,
                    total_negociado: parseFloat(data.resumo.total_negociado) || 0,
                    total_aprovado: parseFloat(data.resumo.total_aprovado) || 0,
                    total_rodadas: parseInt(data.resumo.total_rodadas) || 0
                };
                setStats(resumoProcessado);
            }
            
        } catch (error) {
            console.error('Erro ao carregar savings:', error);
            toast.error('Erro ao carregar dados de saving');
        } finally {
            setLoading(false);
        }
    };

    const carregarCompradores = async () => {
        try {
            const response = await SavingService.obterEstatisticas(filters);
            const data = response.data || response;
            
            if (data && data.compradores) {
                const compradoresProcessados = data.compradores.map(comprador => ({
                    ...comprador,
                    economia_total: parseFloat(comprador.economia_total) || 0,
                    economia_percentual: parseFloat(comprador.economia_percentual) || 0,
                    total_rodadas: parseInt(comprador.total_rodadas) || 0,
                    total_cotacoes: parseInt(comprador.total_cotacoes) || 0
                }));
                setCompradores(compradoresProcessados);
            } else {
                setCompradores([]);
            }
            
        } catch (error) {
            console.error('Erro ao carregar compradores:', error);
            setCompradores([]);
        }
    };

    const carregarListaCompradores = async () => {
        try {
            const response = await SavingService.listarSaving({ limite: 1000 });
            const data = response.data || response;
            const compradoresUnicos = [...new Set(data.registros?.map(r => r.comprador_nome).filter(Boolean))];
            setCompradoresList(compradoresUnicos);
        } catch (error) {
            console.error('Erro ao carregar lista de compradores:', error);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, pagina: 1 }));
    };

    const handleClearFilters = () => {
        document.getElementById('filtro-comprador').value = '';
        document.getElementById('filtro-tipo').value = '';
        document.getElementById('data-inicio').value = '';
        document.getElementById('data-fim').value = '';
        handleFilterChange({}); // Clear all filters
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, pagina: newPage }));
    };

    const handleViewSaving = (saving) => {
        setSelectedSaving(saving);
        setModalType('view');
        setShowModal(true);
    };

    const handleExportSaving = async () => {
        try {
            const blob = await SavingService.exportarSaving(filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `saving-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Exportação realizada com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar saving:', error);
            toast.error('Erro ao exportar dados');
        }
    };

    const formatarValor = (valor) => {
        if (valor === null || valor === undefined || isNaN(valor)) {
            return 'R$ 0,00';
        }
        const numero = parseFloat(valor);
        if (isNaN(numero)) {
            return 'R$ 0,00';
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(numero);
    };

    const formatarData = (data) => {
        if (!data) return 'N/A';
        const dataObj = new Date(data);
        return dataObj.toLocaleDateString('pt-BR');
    };

    const formatarPercentual = (valor) => {
        if (valor === null || valor === undefined || isNaN(valor)) {
            return '0,00%';
        }
        const numero = parseFloat(valor);
        if (isNaN(numero)) {
            return '0,00%';
        }
        return `${numero.toFixed(2)}%`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendente':
                return 'text-yellow-600 bg-yellow-100';
            case 'concluido':
                return 'text-green-600 bg-green-100';
            case 'em_andamento':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getTipoLabel = (tipo) => {
        switch (tipo) {
            case 'programada':
                return 'Programada';
            case 'emergencial':
                return 'Emergencial';
            default:
                return tipo;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pendente':
                return 'PENDENTE';
            case 'concluido':
                return 'CONCLUIDO';
            case 'em_andamento':
                return 'EM ANDAMENTO';
            default:
                return status?.toUpperCase() || 'PENDENTE';
        }
    };

    const aplicarFiltros = () => {
        const comprador = document.getElementById('filtro-comprador')?.value;
        const tipo = document.getElementById('filtro-tipo')?.value;
        const dataInicio = document.getElementById('data-inicio')?.value;
        const dataFim = document.getElementById('data-fim')?.value;

        const novosFiltros = {};
        if (comprador) novosFiltros.comprador = comprador;
        if (tipo) novosFiltros.tipo = tipo;
        if (dataInicio) novosFiltros.data_inicio = dataInicio;
        if (dataFim) novosFiltros.data_fim = dataFim;

        handleFilterChange(novosFiltros);
    };

    const limparFiltros = () => {
        document.getElementById('filtro-comprador').value = '';
        document.getElementById('filtro-tipo').value = '';
        document.getElementById('data-inicio').value = '';
        document.getElementById('data-fim').value = '';
        handleClearFilters();
    };

    const toggleFiltros = () => {
        setShowFilters(!showFilters);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Saving - Análise de Economia</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Monitore o impacto financeiro das negociações e economias obtidas
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleExportSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                            >
                                <FaDownload size={14} />
                                Exportar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Filtros */}
                <div className="bg-white shadow-sm border-b border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex flex-col">
                            <label htmlFor="filtro-comprador" className="text-sm font-medium text-gray-700 mb-1">
                                Comprador:
                            </label>
                            <select 
                                id="filtro-comprador" 
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                {compradoresList.map(comprador => (
                                    <option key={comprador} value={comprador}>{comprador}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="filtro-tipo" className="text-sm font-medium text-gray-700 mb-1">
                                Tipo:
                            </label>
                            <select 
                                id="filtro-tipo" 
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                <option value="programada">Programada</option>
                                <option value="emergencial">Emergencial</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="data-inicio" className="text-sm font-medium text-gray-700 mb-1">
                                Data Início:
                            </label>
                            <input 
                                type="date" 
                                id="data-inicio" 
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="data-fim" className="text-sm font-medium text-gray-700 mb-1">
                                Data Fim:
                            </label>
                            <input 
                                type="date" 
                                id="data-fim" 
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            onClick={toggleFiltros}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
                        >
                            <FaFilter size={14} />
                            Filtros
                        </button>

                        <button
                            onClick={aplicarFiltros}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                        >
                            <FaCheck size={14} />
                            Aplicar
                        </button>

                        <button
                            onClick={limparFiltros}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                        >
                            <FaEraser size={14} />
                            Limpar
                        </button>
                    </div>
                </div>

                {/* Resumo do Orçamento */}
                <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{formatarValor(stats.economia_total)}</div>
                            <div className="text-sm text-gray-600">Economia Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{formatarPercentual(stats.economia_media_percentual)}</div>
                            <div className="text-sm text-gray-600">Economia Total (%)</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{stats.total_rodadas || 0}</div>
                            <div className="text-sm text-gray-600">Total de Rodadas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{formatarValor(stats.total_negociado)}</div>
                            <div className="text-sm text-gray-600">Total Negociado</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{formatarValor(stats.total_aprovado)}</div>
                            <div className="text-sm text-gray-600">Total Aprovado</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{stats.tipo_programada || 0}</div>
                            <div className="text-sm text-gray-600">Cotações Programadas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.tipo_emergencial || 0}</div>
                            <div className="text-sm text-gray-600">Cotações Emergenciais</div>
                        </div>
                    </div>
                </div>

                {/* Métricas por Comprador */}
                <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas por Comprador</h2>
                    
                    {/* Melhor e Pior Comprador */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {compradores.length > 0 && (
                            <>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-green-800 mb-2">Melhor Comprador</h3>
                                    <div className="text-lg font-bold text-green-900">{compradores[0]?.comprador_nome}</div>
                                    <div className="text-sm text-green-700">
                                        Economia: {formatarValor(compradores[0]?.economia_total)} ({formatarPercentual(compradores[0]?.economia_percentual)})
                                    </div>
                                </div>
                                
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-red-800 mb-2">Pior Comprador</h3>
                                    <div className="text-lg font-bold text-red-900">{compradores[compradores.length - 1]?.comprador_nome}</div>
                                    <div className="text-sm text-red-700">
                                        Economia: {formatarValor(compradores[compradores.length - 1]?.economia_total)} ({formatarPercentual(compradores[compradores.length - 1]?.economia_percentual)})
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Cards dos Compradores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {compradores.map((comprador, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="text-lg font-bold text-gray-900 mb-2">{comprador.comprador_nome}</div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Economia Total:</span>
                                        <span className="font-medium">{formatarValor(comprador.economia_total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Economia (%):</span>
                                        <span className="font-medium">{formatarPercentual(comprador.economia_percentual)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Rodadas:</span>
                                        <span className="font-medium">{comprador.total_rodadas}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cotações:</span>
                                        <span className="font-medium">{comprador.total_cotacoes}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabela de Registros */}
                <div className="bg-white shadow-sm p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '60px'}}>
                                        ID
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '80px'}}>
                                        Cotação
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '120px'}}>
                                        Comprador
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '90px'}}>
                                        Data
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '100px'}}>
                                        Valor Inicial
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '100px'}}>
                                        Valor Final
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '100px'}}>
                                        Economia
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '80px'}}>
                                        %
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '60px'}}>
                                        Rodadas
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '80px'}}>
                                        Tipo
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '100px'}}>
                                        Local
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '60px'}}>
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {savings.map((saving) => (
                                    <tr key={saving.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {saving.id}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {saving.cotacao_id}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {saving.comprador_nome || 'N/A'}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatarData(saving.data_registro)}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatarValor(saving.valor_total_inicial)}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatarValor(saving.valor_total_final)}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                            {formatarValor(saving.economia)}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                            {formatarPercentual(saving.economia_percentual)}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {saving.rodadas || 0}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getTipoLabel(saving.tipo)}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {saving.centro_distribuicao || 'N/A'}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleViewSaving(saving)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Visualizar"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Mostrando {((pagination.pagina - 1) * pagination.limite) + 1} a {Math.min(pagination.pagina * pagination.limite, pagination.total)} de {pagination.total} registros
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.pagina - 1)}
                                disabled={pagination.pagina <= 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Anterior
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700">
                                Página {pagination.pagina} de {pagination.total_paginas}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.pagina + 1)}
                                disabled={pagination.pagina >= pagination.total_paginas}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <SavingModal
                    saving={selectedSaving}
                    type={modalType}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        carregarSavings();
                        carregarCompradores();
                    }}
                />
            )}
        </div>
    );
};

export default Saving;
