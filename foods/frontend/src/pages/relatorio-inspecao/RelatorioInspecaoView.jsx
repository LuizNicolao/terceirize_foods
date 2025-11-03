import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaPrint } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRelatorioInspecao } from '../../hooks/useRelatorioInspecao';
import { Button, LoadingSpinner } from '../../components/ui';

const RelatorioInspecaoView = ({ rirId }) => {
  const navigate = useNavigate();
  const { canEdit } = usePermissions();
  
  const {
    rir,
    loading,
    buscarRIRPorId
  } = useRelatorioInspecao();

  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    if (rirId) {
      buscarRIRPorId(rirId);
    }
  }, [rirId, buscarRIRPorId]);

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const handleEdit = () => {
    navigate(`/foods/relatorio-inspecao/${rirId}/editar`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('pt-BR');
    return timeString ? `${formattedDate} ${timeString}` : formattedDate;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'APROVADO': { label: 'Aprovado', className: 'bg-green-100 text-green-800' },
      'REPROVADO': { label: 'Reprovado', className: 'bg-red-100 text-red-800' },
      'PARCIAL': { label: 'Parcial', className: 'bg-yellow-100 text-yellow-800' }
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getConformidadeColor = (status) => {
    if (status === 'Conforme') return 'bg-green-50 text-green-700';
    if (status === 'Não Conforme') return 'bg-red-50 text-red-700';
    return 'bg-gray-50 text-gray-700';
  };

  const getResultadoColor = (resultado) => {
    return resultado === 'Aprovado' 
      ? 'bg-green-100 text-green-800 font-semibold' 
      : 'bg-red-100 text-red-800 font-semibold';
  };

  const getValidadeColor = (percentual) => {
    if (percentual === null || percentual === undefined) return '';
    return percentual > 30 ? 'bg-red-50 text-red-700 font-semibold' : 'bg-green-50 text-green-700';
  };

  if (loading || !rir) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const checklist = Array.isArray(rir.checklist_json) ? rir.checklist_json : [];
  const produtos = Array.isArray(rir.produtos_json) ? rir.produtos_json : [];

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content,
            .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
            .print-content {
              font-size: 9px;
            }
            .print-content table {
              font-size: 8px;
            }
          }
        `
      }} />

      <div className="p-6">
        <div className={`print-content ${printMode ? '' : 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'}`}>
          {/* Header com Status */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Relatório de Inspeção de Recebimento #{rir.id.toString().padStart(4, '0')}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Data: {formatDateTime(rir.data_inspecao, rir.hora_inspecao)}
                </p>
              </div>
              <div>
                {getStatusBadge(rir.status_geral)}
              </div>
            </div>
          </div>

          {/* Cards de Informação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Dados do Relatório</h3>
              <div className="space-y-1 text-sm text-gray-900">
                <p><span className="font-semibold">Nº NF:</span> {rir.numero_nota_fiscal || '-'}</p>
                <p><span className="font-semibold">Nº AF:</span> {rir.numero_af || '-'}</p>
                <p><span className="font-semibold">Nº Pedido:</span> {rir.numero_pedido || '-'}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Fornecedor</h3>
              <div className="space-y-1 text-sm text-gray-900">
                <p className="font-semibold">{rir.fornecedor || '-'}</p>
                <p>CNPJ: {rir.cnpj_fornecedor || '-'}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Responsáveis</h3>
              <div className="space-y-1 text-sm text-gray-900">
                <p><span className="font-semibold">Recebedor:</span> {rir.recebedor || '-'}</p>
                <p><span className="font-semibold">Visto:</span> {rir.visto_responsavel || '-'}</p>
                <p><span className="font-semibold">Cadastrado por:</span> {rir.usuario_nome || '-'}</p>
              </div>
            </div>
          </div>

          {/* Check List Higiênico-Sanitário */}
          {checklist.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Check List de Avaliação Higiênico-Sanitária</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Transporte</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Produto</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Isento Material Estranho</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condições Caminhão</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acondicionamento</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condições Embalagem</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {checklist.map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-xs text-gray-700">{item.tipo_transporte || '-'}</td>
                        <td className="px-3 py-2 text-xs text-gray-700">{item.tipo_produto || '-'}</td>
                        <td className={`px-3 py-2 text-xs ${getConformidadeColor(item.isento_material)}`}>
                          {item.isento_material || '-'}
                        </td>
                        <td className={`px-3 py-2 text-xs ${getConformidadeColor(item.condicoes_caminhao)}`}>
                          {item.condicoes_caminhao || '-'}
                        </td>
                        <td className={`px-3 py-2 text-xs ${getConformidadeColor(item.acondicionamento)}`}>
                          {item.acondicionamento || '-'}
                        </td>
                        <td className={`px-3 py-2 text-xs ${getConformidadeColor(item.condicoes_embalagem)}`}>
                          {item.condicoes_embalagem || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Produtos Avaliados */}
          {produtos.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Produtos Avaliados</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtd.</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fabricação</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lote</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Validade</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ctrl. Val.</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temp. (°C)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aval. Sensorial</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">NQA</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amostras</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aprov.</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reprov.</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {produtos.map((produto, index) => {
                      const controleValidade = produto.controle_validade || null;
                      return (
                        <tr key={index}>
                          <td className="px-3 py-2 text-xs text-gray-700">{produto.codigo || produto.codigo_produto || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{produto.descricao || produto.nome_produto || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{produto.und || produto.unidade_medida || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{produto.qtde || produto.quantidade_pedido || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">
                            {produto.fabricacao ? formatDate(produto.fabricacao) : (produto.fabricacaoBR || '-')}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700">{produto.lote || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">
                            {produto.validade ? formatDate(produto.validade) : (produto.validadeBR || '-')}
                          </td>
                          <td className={`px-3 py-2 text-xs text-center ${getValidadeColor(controleValidade)}`}>
                            {controleValidade !== null && controleValidade !== undefined ? `${controleValidade}%` : '-'}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700">{produto.temperatura || '-'}</td>
                          <td className={`px-3 py-2 text-xs ${getConformidadeColor(produto.aval_sensorial)}`}>
                            {produto.aval_sensorial || '-'}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700">{produto.nqa_codigo || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{produto.num_amostras_avaliadas || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{produto.num_amostras_aprovadas || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{produto.num_amostras_reprovadas || '-'}</td>
                          <td className={`px-3 py-2 text-xs text-center ${getResultadoColor(produto.resultado_final)}`}>
                            {produto.resultado_final || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ocorrências */}
          {rir.ocorrencias && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ocorrências e Observações</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-line">{rir.ocorrencias}</p>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação (não impressos) */}
        <div className="mt-6 flex justify-end gap-4 no-print">
          <Button
            onClick={() => navigate('/foods/relatorio-inspecao')}
            variant="outline"
          >
            <FaArrowLeft className="mr-2" />
            Voltar para Lista
          </Button>
          {canEdit('relatorio_inspecao') && (
            <Button
              onClick={handleEdit}
            >
              <FaEdit className="mr-2" />
              Editar Relatório
            </Button>
          )}
          <Button
            onClick={handlePrint}
            variant="info"
          >
            <FaPrint className="mr-2" />
            Gerar PDF
          </Button>
        </div>
      </div>
    </>
  );
};

export default RelatorioInspecaoView;

