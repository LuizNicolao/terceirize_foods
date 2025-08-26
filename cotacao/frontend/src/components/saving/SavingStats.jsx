import React from 'react';
import { FaDollarSign, FaCheckCircle, FaClock, FaTimesCircle, FaChartLine, FaShoppingCart, FaFileInvoice } from 'react-icons/fa';

const SavingStats = ({ stats }) => {
    const formatarValor = (valor) => {
        if (valor === null || valor === undefined || isNaN(valor)) {
            return 'R$ 0,00';
        }
        // Converter para número se for string
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
        // Converter para número se for string
        const numero = parseFloat(valor);
        if (isNaN(numero)) {
            return '0,00%';
        }
        return `${numero.toFixed(2)}%`;
    };

    const statCards = [
        {
            title: 'Economia Total',
            value: formatarValor(stats.economia_total),
            icon: FaDollarSign,
            iconColor: 'text-green-600'
        },
        {
            title: 'Economia Total (%)',
            value: formatarPercentual(stats.economia_media_percentual),
            icon: FaChartLine,
            iconColor: 'text-blue-600'
        },
        {
            title: 'Total de Rodadas',
            value: stats.total_rodadas || 0,
            icon: FaClock,
            iconColor: 'text-purple-600'
        },
        {
            title: 'Total Negociado',
            value: formatarValor(stats.total_negociado || 0),
            icon: FaShoppingCart,
            iconColor: 'text-orange-600'
        },
        {
            title: 'Total Aprovado',
            value: formatarValor(stats.total_aprovado || 0),
            icon: FaCheckCircle,
            iconColor: 'text-green-600'
        },
        {
            title: 'Cotações Programadas',
            value: stats.tipo_programada || 0,
            icon: FaFileInvoice,
            iconColor: 'text-indigo-600'
        },
        {
            title: 'Cotações Emergenciais',
            value: stats.tipo_emergencial || 0,
            icon: FaTimesCircle,
            iconColor: 'text-red-600'
        }
    ];

    return (
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo Geral</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stat.value}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50">
                                <stat.icon className={`${stat.iconColor} text-xl`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Estatísticas por tipo */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-800">Por Tipo</h3>
                        <FaDollarSign className="text-blue-600" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Programadas:</span>
                            <span className="font-medium text-gray-900">{stats.tipo_programada || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Emergenciais:</span>
                            <span className="font-medium text-gray-900">{stats.tipo_emergencial || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-medium text-gray-900">{(stats.tipo_programada || 0) + (stats.tipo_emergencial || 0)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-800">Economia</h3>
                        <FaDollarSign className="text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-medium text-gray-900">
                                {formatarValor(stats.economia_total)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Média:</span>
                            <span className="font-medium text-gray-900">
                                {formatarPercentual(stats.economia_media_percentual)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-800">Status</h3>
                        <FaChartLine className="text-purple-600" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Pendentes:</span>
                            <span className="font-medium text-gray-900">{stats.pendentes || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Aprovados:</span>
                            <span className="font-medium text-gray-900">{stats.aprovados || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Em Andamento:</span>
                            <span className="font-medium text-gray-900">{stats.em_andamento || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavingStats;
