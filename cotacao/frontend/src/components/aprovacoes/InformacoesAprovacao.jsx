import React from 'react';
import { FaUser, FaCalendar, FaFileAlt, FaTag, FaBuilding, FaDollarSign, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const InformacoesAprovacao = ({ cotacao }) => {
  if (!cotacao) return null;

  const formatarData = (data) => {
    if (!data) return 'Não informado';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor) => {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'em_analise': 'bg-blue-100 text-blue-800',
      'aprovada': 'bg-green-100 text-green-800',
      'reprovada': 'bg-red-100 text-red-800',
      'em_renegociacao': 'bg-orange-100 text-orange-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'pendente': 'Pendente',
      'em_analise': 'Em Análise',
      'aprovada': 'Aprovada',
      'reprovada': 'Reprovada',
      'em_renegociacao': 'Em Renegociação'
    };
    return statusTexts[status] || status;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FaFileAlt className="text-blue-600" />
        Informações da Cotação
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Informações Básicas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FaTag className="text-gray-500" />
            <span className="font-medium text-gray-700">Número:</span>
            <span className="text-gray-900">{cotacao.numero || 'N/A'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FaFileAlt className="text-gray-500" />
            <span className="font-medium text-gray-700">Título:</span>
            <span className="text-gray-900">{cotacao.titulo || 'N/A'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FaUser className="text-gray-500" />
            <span className="font-medium text-gray-700">Solicitante:</span>
            <span className="text-gray-900">{cotacao.solicitante_nome || 'N/A'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FaBuilding className="text-gray-500" />
            <span className="font-medium text-gray-700">Filiais:</span>
            <span className="text-gray-900">{cotacao.filiais?.length || 0} filial(is)</span>
          </div>
        </div>

        {/* Datas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FaCalendar className="text-gray-500" />
            <span className="font-medium text-gray-700">Data Criação:</span>
            <span className="text-gray-900">{formatarData(cotacao.data_criacao)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FaCalendar className="text-gray-500" />
            <span className="font-medium text-gray-700">Data Limite:</span>
            <span className="text-gray-900">{formatarData(cotacao.data_limite)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FaClock className="text-gray-500" />
            <span className="font-medium text-gray-700">Prazo Entrega:</span>
            <span className="text-gray-900">{cotacao.prazo_entrega || 'N/A'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FaDollarSign className="text-gray-500" />
            <span className="font-medium text-gray-700">Prazo Pagamento:</span>
            <span className="text-gray-900">{cotacao.prazo_pagamento || 'N/A'}</span>
          </div>
        </div>

        {/* Valores */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FaDollarSign className="text-gray-500" />
            <span className="font-medium text-gray-700">Valor Total:</span>
            <span className="text-gray-900 font-semibold">{formatarValor(cotacao.valor_total)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FaDollarSign className="text-gray-500" />
            <span className="font-medium text-gray-700">Valor Aprovado:</span>
            <span className="text-gray-900 font-semibold">{formatarValor(cotacao.valor_aprovado)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FaDollarSign className="text-gray-500" />
            <span className="font-medium text-gray-700">Economia:</span>
            <span className={`font-semibold ${cotacao.economia > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatarValor(cotacao.economia)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FaExclamationTriangle className="text-gray-500" />
            <span className="font-medium text-gray-700">Itens:</span>
            <span className="text-gray-900">{cotacao.itens?.length || 0} item(ns)</span>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cotacao.status)}`}>
              {getStatusText(cotacao.status)}
            </div>
          </div>
          
          {cotacao.observacoes && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Observações:</span>
              <p className="text-gray-900 mt-1">{cotacao.observacoes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InformacoesAprovacao;
