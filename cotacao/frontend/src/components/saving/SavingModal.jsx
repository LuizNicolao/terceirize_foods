import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaCheck, FaTimes as FaReject, FaSpinner, FaChartPie, FaDollarSign, FaTruck, FaCreditCard, FaChartLine, FaList, FaChartBar, FaTag, FaCalendar, FaUser, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SavingService from '../../services/saving';

const SavingModal = ({ saving, type, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        produto_id: '',
        fornecedor_id: '',
        valor_anterior: '',
        valor_atual: '',
        quantidade: '',
        tipo: 'preco',
        observacoes: '',
        cotacao_id: ''
    });
    const [motivo, setMotivo] = useState('');
    const [loading, setLoading] = useState(false);
    const [savingItens, setSavingItens] = useState([]);
    const [comparacaoItens, setComparacaoItens] = useState([]);

    useEffect(() => {
        if (saving && type !== 'create') {
            setFormData({
                produto_id: saving.produto_id || '',
                fornecedor_id: saving.fornecedor_id || '',
                valor_anterior: saving.valor_anterior || '',
                valor_atual: saving.valor_atual || '',
                quantidade: saving.quantidade || '',
                tipo: saving.tipo || 'preco',
                observacoes: saving.observacoes || '',
                cotacao_id: saving.cotacao_id || ''
            });

            // Carregar itens do saving se for visualização
            if (type === 'view' && saving.id) {
                carregarSavingItens(saving.id);
                carregarComparacaoItens(saving.id);
            }
        }
    }, [saving, type]);

    const carregarSavingItens = async (savingId) => {
        try {
            const response = await SavingService.obterSavingItens(savingId);
            const data = response.data || response;
            
            if (data.itens && data.itens.length > 0) {
                // Processar itens para converter strings em números
                const itensProcessados = data.itens.map(item => ({
                    ...item,
                    valor_unitario_inicial: parseFloat(item.valor_unitario_inicial) || 0,
                    valor_unitario_final: parseFloat(item.valor_unitario_final) || 0,
                    economia: parseFloat(item.economia) || 0,
                    economia_percentual: parseFloat(item.economia_percentual) || 0,
                    quantidade: parseFloat(item.quantidade) || 0
                }));
                setSavingItens(itensProcessados);
            } else {
                setSavingItens([]);
            }
        } catch (error) {
            console.error('Erro ao carregar itens do saving:', error);
            setSavingItens([]);
        }
    };

    const carregarComparacaoItens = async (savingId) => {
        try {
            // Aqui você pode implementar a lógica para carregar dados de comparação
            // Por enquanto, vamos usar os mesmos dados dos itens
            const response = await SavingService.obterSavingItens(savingId);
            const data = response.data || response;
            
            if (data.itens && data.itens.length > 0) {
                const itensProcessados = data.itens.map(item => ({
                    ...item,
                    valor_unitario_inicial: parseFloat(item.valor_unitario_inicial) || 0,
                    valor_unitario_final: parseFloat(item.valor_unitario_final) || 0,
                    economia: parseFloat(item.economia) || 0,
                    economia_percentual: parseFloat(item.economia_percentual) || 0,
                    quantidade: parseFloat(item.quantidade) || 0,
                    // Dados simulados para comparação
                    ultimo_valor_aprovado: parseFloat(item.valor_unitario_inicial) * 1.1, // 10% a mais
                    ultimo_fornecedor_aprovado: item.fornecedor,
                    variacao_valor: -10.0, // -10% de variação
                    variacao_fornecedor: item.fornecedor // Usar o nome do fornecedor atual
                }));
                setComparacaoItens(itensProcessados);
            } else {
                setComparacaoItens([]);
            }
        } catch (error) {
            console.error('Erro ao carregar dados de comparação:', error);
            setComparacaoItens([]);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            switch (type) {
                case 'create':
                    await SavingService.criarSaving(formData);
                    break;
                case 'edit':
                    await SavingService.atualizarSaving(saving.id, formData);
                    break;
                case 'approve':
                    await SavingService.aprovarSaving(saving.id, { motivo, observacoes: formData.observacoes });
                    break;
                case 'reject':
                    await SavingService.rejeitarSaving(saving.id, { motivo, observacoes: formData.observacoes });
                    break;
                default:
                    break;
            }
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar saving:', error);
            toast.error('Erro ao salvar saving');
        } finally {
            setLoading(false);
        }
    };

    const getModalTitle = () => {
        switch (type) {
            case 'create':
                return 'Novo Saving';
            case 'edit':
                return 'Editar Saving';
            case 'view':
                return 'Visualizar Saving';
            case 'approve':
                return 'Aprovar Saving';
            case 'reject':
                return 'Rejeitar Saving';
            default:
                return 'Saving';
        }
    };

    const getModalIcon = () => {
        switch (type) {
            case 'create':
                return '➕';
            case 'edit':
                return '✏️';
            case 'view':
                return '👁️';
            case 'approve':
                return '✅';
            case 'reject':
                return '❌';
            default:
                return '📋';
        }
    };

    const isReadOnly = type === 'view';
    const isAction = type === 'approve' || type === 'reject';

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

    const formatarData = (data) => {
        if (!data) return 'N/A';
        const dataObj = new Date(data);
        return dataObj.toLocaleDateString('pt-BR');
    };

    const formatarDataHora = (data) => {
        if (!data) return 'N/A';
        const dataObj = new Date(data);
        return dataObj.toLocaleString('pt-BR');
    };

    if (type === 'view') {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-7xl max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{getModalIcon()}</span>
                            <h2 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                        {/* Resumo com cards */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaChartPie className="text-blue-600" />
                                Resumo do Saving
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {formatarValor(saving?.valor_total_inicial)}
                                    </div>
                                    <div className="text-sm text-blue-700">Valor Inicial</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatarValor(saving?.valor_total_final)}
                                    </div>
                                    <div className="text-sm text-green-700">Valor Final</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {formatarValor(saving?.economia)}
                                    </div>
                                    <div className="text-sm text-orange-700">Economia</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {formatarPercentual(saving?.economia_percentual)}
                                    </div>
                                    <div className="text-sm text-purple-700">Economia (%)</div>
                                </div>
                            </div>
                        </div>

                        {/* Informações detalhadas */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaInfoCircle className="text-blue-600" />
                                Informações Detalhadas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaTag className="text-gray-500" />
                                        <span className="text-sm text-gray-600">ID</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{saving?.id}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCalendar className="text-gray-500" />
                                        <span className="text-sm text-gray-600">Data de Criação</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{formatarDataHora(saving?.data_registro)}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCalendar className="text-gray-500" />
                                        <span className="text-sm text-gray-600">Data de Aprovação</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{formatarDataHora(saving?.data_aprovacao)}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaChartLine className="text-gray-500" />
                                        <span className="text-sm text-gray-600">Rodadas</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{saving?.rodadas || 0}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCheck className="text-gray-500" />
                                        <span className="text-sm text-gray-600">Status</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{saving?.status}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaTag className="text-gray-500" />
                                        <span className="text-sm text-gray-600">Tipo de Compra</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{saving?.tipo}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaMapMarkerAlt className="text-gray-500" />
                                        <span className="text-sm text-gray-600">Local de Entrega</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{saving?.centro_distribuicao}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaUser className="text-gray-500" />
                                        <span className="text-sm text-gray-600">Comprador</span>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{saving?.comprador_nome}</div>
                                </div>
                            </div>
                        </div>

                        {/* Justificativa Emergencial */}
                        {saving?.motivo_emergencial && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Justificativa da Compra Emergencial</h3>
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <p className="text-yellow-800">{saving.motivo_emergencial}</p>
                                </div>
                            </div>
                        )}

                        {/* Observações */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-800">{saving?.observacoes || 'Nenhuma observação registrada'}</p>
                            </div>
                        </div>

                        {/* Produtos Negociados */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaList className="text-blue-600" />
                                Produtos Negociados
                            </h3>
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Produto
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Fornecedor
                                                        </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Qtd
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Valor Inicial
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Valor Final
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Economia
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            %
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                            {savingItens.length > 0 ? (
                                                savingItens.map((item) => (
                                                        <tr key={item.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {item.descricao}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {item.fornecedor}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {item.quantidade}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatarValor(item.valor_unitario_inicial)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatarValor(item.valor_unitario_final)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                                                {formatarValor(item.economia)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                                                {formatarPercentual(item.economia_percentual)}
                                                            </td>
                                                        </tr>
                                                ))
                                            ) : (
                                                        <tr>
                                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                                Nenhum item encontrado para este saving
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                        {/* Comparação com Último Aprovado */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaChartBar className="text-blue-600" />
                                Comparação com Último Aprovado
                            </h3>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Produto
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Último Valor Aprovado
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Valor Atual
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Variação Valor
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Último Fornecedor
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Fornecedor Atual
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Variação Fornecedor
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {comparacaoItens.length > 0 ? (
                                                comparacaoItens.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {item.descricao}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatarValor(item.ultimo_valor_aprovado)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatarValor(item.valor_unitario_final)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                                            {formatarPercentual(item.variacao_valor)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {item.ultimo_fornecedor_aprovado}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {item.fornecedor}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                                                            {item.variacao_fornecedor}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        Nenhum dado de comparação disponível
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Modal para outras ações (create, edit, approve, reject)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{getModalIcon()}</span>
                        <h2 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Campos do formulário aqui */}
                    <div className="space-y-4">
                        {/* Implementar campos conforme necessário */}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SavingModal;
