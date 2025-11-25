import React from 'react';

/**
 * Componente para impressão do Relatório de Inspeção de Recebimento
 * Replica o layout do modal de visualização, formatado para impressão em A4
 */
const RelatorioInspecaoPrint = ({ rir }) => {
  if (!rir) return null;

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar hora
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // HH:MM
  };

  // Normalizar número (remover separadores de milhar)
  const normalizeNumber = (value) => {
    if (!value && value !== 0) return '-';
    if (typeof value === 'number') {
      return value % 1 === 0 ? value.toString() : value.toString().replace('.', ',');
    }
    const str = String(value).trim();
    if (!str || str === '-') return '-';
    if (str.includes(',')) {
      return str.replace(/\./g, '');
    }
    if (str.includes('.')) {
      const parts = str.split('.');
      if (parts.length > 2) {
        return parts.join('');
      }
      if (parts.length === 2) {
        if (parts[1].length === 3 && parts[1] === '000' && /^\d{1,3}$/.test(parts[0])) {
          return parts[0];
        }
        if (parts[1].length <= 2 && /^\d+$/.test(parts[1])) {
          return str.replace('.', ',');
        }
        return parts.join('');
      }
    }
    return str;
  };

  // Processar checklist (se existir)
  const checklist = rir.checklist || [];
  
  // Processar produtos
  const produtos = rir.produtos || [];

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm;
            height: 297mm;
            overflow: hidden;
          }
          body > *:not(#print-container-rir) {
            display: none !important;
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          .print-container-rir {
            width: 210mm !important;
            min-height: 297mm;
            padding: 15mm;
            margin: 0 !important;
            background: white;
            font-family: Arial, sans-serif;
            font-size: 8pt;
            line-height: 1.4;
            position: absolute;
            top: 0;
            left: 0;
          }
          .print-container-rir * {
            font-size: 8pt !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
        @media screen {
          .print-container-rir {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
            font-size: 8pt;
            line-height: 1.4;
          }
        }
        .print-container-rir .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #000;
        }
        .print-container-rir .header h1 {
          margin: 0;
          font-size: 8pt;
          font-weight: bold;
        }
        .print-container-rir .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .print-container-rir .section-title {
          background-color: #f0f0f0;
          padding: 8px 12px;
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 12px;
          border-left: 4px solid #16a34a;
        }
        .print-container-rir .section-content {
          padding: 0;
        }
        .print-container-rir table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 8pt;
        }
        .print-container-rir table th,
        .print-container-rir table td {
          border: 1px solid #ddd;
          padding: 6px 8px;
          text-align: left;
        }
        .print-container-rir table th {
          background-color: #f5f5f5;
          font-weight: bold;
          font-size: 8pt;
        }
        .print-container-rir .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }
        .print-container-rir .info-item {
          display: flex;
          flex-direction: column;
        }
        .print-container-rir .info-label {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 2px;
        }
        .print-container-rir .info-value {
          font-size: 8pt;
        }
        .print-container-rir .text-area {
          white-space: pre-wrap;
          padding: 8px;
          border: 1px solid #ddd;
          min-height: 60px;
          font-size: 8pt;
        }
      `}</style>
      <div className="print-container-rir">
        {/* Cabeçalho */}
        <div className="header">
          <h1>RELATÓRIO DE INSPEÇÃO DE RECEBIMENTO</h1>
        </div>

        {/* SEÇÃO A: Dados do Pedido */}
        <div className="section">
          <div className="section-title">A) Dados do Pedido</div>
          <div className="section-content">
            <table>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>Nº Nota Fiscal</th>
                  <td style={{ width: '25%' }}>{rir.numero_nota_fiscal || '-'}</td>
                  <th style={{ width: '25%' }}>Nº Pedido</th>
                  <td style={{ width: '25%' }}>{rir.numero_pedido || '-'}</td>
                </tr>
                <tr>
                  <th>Fornecedor</th>
                  <td colSpan="3">{rir.fornecedor || '-'}</td>
                </tr>
                <tr>
                  <th>CNPJ Fornecedor</th>
                  <td>{rir.cnpj_fornecedor || '-'}</td>
                  <th>Data/Hora Inspeção</th>
                  <td>{formatDate(rir.data_inspecao)} {formatTime(rir.hora_inspecao)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO B: Check List Higiênico-Sanitário */}
        {checklist && checklist.length > 0 && (
          <div className="section">
            <div className="section-title">B) Check List de Avaliação Higiênico-Sanitária</div>
            <div className="section-content">
              <table>
                <thead>
                  <tr>
                    <th>Tipo de Transporte</th>
                    <th>Tipo de Produto</th>
                    <th>Isento de Material Estranho</th>
                    <th>Condições do Caminhão</th>
                    <th>Acondicionamento</th>
                    <th>Condições da Embalagem</th>
                  </tr>
                </thead>
                <tbody>
                  {checklist.map((item, index) => (
                    <tr key={index}>
                      <td>{item.tipo_transporte || '-'}</td>
                      <td>{item.tipo_produto || '-'}</td>
                      <td>{item.isento_material || '-'}</td>
                      <td>{item.condicoes_caminhao || '-'}</td>
                      <td>{item.acondicionamento || '-'}</td>
                      <td>{item.condicoes_embalagem || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEÇÃO C: Avaliação dos Produtos */}
        {produtos && produtos.length > 0 && (
          <div className="section">
            <div className="section-title">C) Avaliação dos Produtos</div>
            <div className="section-content">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Produto</th>
                    <th>Und.</th>
                    <th>Qtd. Pedido</th>
                    <th>Fab.</th>
                    <th>Lote</th>
                    <th>Validade</th>
                    <th>Temp. (°C)</th>
                    <th>Aval. Sensorial</th>
                    <th>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto, index) => (
                    <tr key={index}>
                      <td>{produto.codigo || '-'}</td>
                      <td>{produto.descricao || '-'}</td>
                      <td>{produto.unidade_medida || produto.und || '-'}</td>
                      <td>{normalizeNumber(produto.quantidade_pedido || produto.qtde)}</td>
                      <td>{produto.fabricacao ? formatDate(produto.fabricacao) : '-'}</td>
                      <td>{produto.lote || '-'}</td>
                      <td>{produto.validade ? formatDate(produto.validade) : '-'}</td>
                      <td>{produto.temperatura || '-'}</td>
                      <td>{produto.aval_sensorial || '-'}</td>
                      <td>{produto.resultado_final || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEÇÃO D: Ocorrências e Responsáveis */}
        <div className="section">
          <div className="section-title">D) Ocorrências e Responsáveis</div>
          <div className="section-content">
            {rir.ocorrencias && (
              <div style={{ marginBottom: '15px' }}>
                <div className="info-label">Ocorrências e Observações Gerais:</div>
                <div className="text-area">{rir.ocorrencias}</div>
              </div>
            )}
            <table>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>Recebedor</th>
                  <td style={{ width: '25%' }}>{rir.recebedor || '-'}</td>
                  <th style={{ width: '25%' }}>Visto Responsável</th>
                  <td style={{ width: '25%' }}>{rir.visto_responsavel || '-'}</td>
                </tr>
                <tr>
                  <th>Status Geral</th>
                  <td colSpan="3">{rir.status_geral || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default RelatorioInspecaoPrint;

