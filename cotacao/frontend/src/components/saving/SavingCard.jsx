import React from 'react';
import { FaDollarSign, FaTruck, FaCreditCard, FaCalendar, FaUser, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const SavingCard = ({ saving, onView, onEdit, onDelete, onApprove, onReject }) => {
    const formatarValor = (valor) => {
        if (valor === null || valor === undefined || isNaN(valor)) {
            return 'R$ 0,00';
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const formatarData = (data) => {
        if (!data) return 'N/A';
        const dataObj = new Date(data);
        return dataObj.toLocaleDateString('pt-BR');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendente':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'aprovado':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejeitado':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'preco':
                return <FaDollarSign className="text-green-500" />;
            case 'prazo_entrega':
                return <FaTruck className="text-blue-500" />;
            case 'prazo_pagamento':
                return <FaCreditCard className="text-purple-500" />;
            default:
                return <FaDollarSign className="text-gray-500" />;
        }
    };

    const getTipoLabel = (tipo) => {
        switch (tipo) {
            case 'preco':
                return 'Preço';
            case 'prazo_entrega':
                return 'Prazo Entrega';
            case 'prazo_pagamento':
                return 'Prazo Pagamento';
            default:
                return tipo;
        }
    };

    const economia = saving.valor_anterior - saving.valor_atual;
    const economiaPercentual = ((economia / saving.valor_anterior) * 100).toFixed(2);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        {getTipoIcon(saving.tipo)}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                                {saving.produto_nome || 'Produto'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {saving.fornecedor_nome || 'Fornecedor'}
                            </p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(saving.status)}`}>
                        {saving.status?.toUpperCase() || 'PENDENTE'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Informações principais */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <FaDollarSign className="text-green-500 text-sm" />
                            <span className="text-xs text-gray-600 font-medium">Valor Anterior</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                            {formatarValor(saving.valor_anterior)}
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <FaDollarSign className="text-blue-500 text-sm" />
                            <span className="text-xs text-gray-600 font-medium">Valor Atual</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                            {formatarValor(saving.valor_atual)}
                        </p>
                    </div>
                </div>

                {/* Economia */}
                <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Economia Total</p>
                            <p className="text-2xl font-bold text-green-800">
                                {formatarValor(economia)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-green-700 font-medium">Percentual</p>
                            <p className="text-xl font-bold text-green-800">
                                {economiaPercentual}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Informações adicionais */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                            <FaUser className="text-gray-400" />
                            Comprador:
                        </span>
                        <span className="font-medium text-gray-900">
                            {saving.comprador_nome || 'N/A'}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                            <FaCalendar className="text-gray-400" />
                            Data:
                        </span>
                        <span className="font-medium text-gray-900">
                            {formatarData(saving.data_registro)}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Quantidade:</span>
                        <span className="font-medium text-gray-900">
                            {saving.quantidade || 0}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium text-gray-900 flex items-center gap-1">
                            {getTipoIcon(saving.tipo)}
                            {getTipoLabel(saving.tipo)}
                        </span>
                    </div>
                </div>

                {/* Observações */}
                {saving.observacoes && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <span className="font-medium">Observações:</span> {saving.observacoes}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onView(saving)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Visualizar"
                        >
                            <FaEye size={16} />
                        </button>
                        
                        {saving.status === 'pendente' && (
                            <>
                                <button
                                    onClick={() => onEdit(saving)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                    title="Editar"
                                >
                                    <FaEdit size={16} />
                                </button>
                                
                                <button
                                    onClick={() => onDelete(saving)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                    title="Excluir"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Botões de aprovação/rejeição */}
                    {saving.status === 'pendente' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onApprove(saving)}
                                className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                                Aprovar
                            </button>
                            
                            <button
                                onClick={() => onReject(saving)}
                                className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                                Rejeitar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavingCard;
