import React from 'react';

/**
 * Componente para impressão de Nota Fiscal
 * Replica o layout do modal de visualização, formatado para impressão em A4
 */
const NotaFiscalPrint = ({ notaFiscal }) => {
  if (!notaFiscal) return null;

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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

  // Formatar moeda
  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Processar itens
  const itens = notaFiscal.itens || [];

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
          body > *:not(#print-container-nota-fiscal) {
            display: none !important;
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          .print-container-nota-fiscal {
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
          .print-container-nota-fiscal * {
            font-size: 8pt !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
        @media screen {
          .print-container-nota-fiscal {
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
        .print-container-nota-fiscal .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #000;
        }
        .print-container-nota-fiscal .header h1 {
          margin: 0;
          font-size: 8pt;
          font-weight: bold;
        }
        .print-container-nota-fiscal .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .print-container-nota-fiscal .section-title {
          background-color: #f0f0f0;
          padding: 8px 12px;
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 12px;
          border-left: 4px solid #16a34a;
        }
        .print-container-nota-fiscal .section-content {
          padding: 0;
        }
        .print-container-nota-fiscal table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 8pt;
        }
        .print-container-nota-fiscal table th,
        .print-container-nota-fiscal table td {
          border: 1px solid #ddd;
          padding: 6px 8px;
          text-align: left;
        }
        .print-container-nota-fiscal table th {
          background-color: #f5f5f5;
          font-weight: bold;
          font-size: 8pt;
        }
        .print-container-nota-fiscal .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }
        .print-container-nota-fiscal .info-item {
          display: flex;
          flex-direction: column;
        }
        .print-container-nota-fiscal .info-label {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 2px;
        }
        .print-container-nota-fiscal .info-value {
          font-size: 8pt;
        }
        .print-container-nota-fiscal .text-area {
          white-space: pre-wrap;
          padding: 8px;
          border: 1px solid #ddd;
          min-height: 60px;
          font-size: 8pt;
        }
        .print-container-nota-fiscal .text-right {
          text-align: right;
        }
        .print-container-nota-fiscal .font-bold {
          font-weight: bold;
        }
        .print-container-nota-fiscal .cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 10px;
        }
        .print-container-nota-fiscal .card {
          border: 1px solid #ddd;
          padding: 8px;
          background-color: #f9f9f9;
        }
        .print-container-nota-fiscal .card-title {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid #ddd;
        }
        .print-container-nota-fiscal .card-content {
          font-size: 8pt;
        }
        .print-container-nota-fiscal .card-field {
          margin-bottom: 4px;
        }
        .print-container-nota-fiscal .card-field-label {
          font-weight: bold;
          font-size: 8pt;
          display: inline-block;
          min-width: 50px;
        }
        .print-container-nota-fiscal .card-field-value {
          font-size: 8pt;
        }
      `}</style>
      <div className="print-container-nota-fiscal" id="print-container-nota-fiscal">
        {/* Cabeçalho */}
        <div className="header">
          <h1>NOTA FISCAL</h1>
        </div>

        {/* SEÇÃO A: Identificação do Emitente */}
        <div className="section">
          <div className="section-title">A) Identificação do Emitente</div>
          <div className="section-content">
            <table>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>CNPJ</th>
                  <td style={{ width: '25%' }}>{notaFiscal.fornecedor_cnpj || '-'}</td>
                  <th style={{ width: '25%' }}>Razão Social</th>
                  <td style={{ width: '25%' }}>{notaFiscal.fornecedor_razao_social || notaFiscal.fornecedor_nome || '-'}</td>
                </tr>
                {notaFiscal.fornecedor_logradouro && (
                  <tr>
                    <th>Endereço</th>
                    <td colSpan="3">
                      {notaFiscal.fornecedor_logradouro || ''}
                      {notaFiscal.fornecedor_numero ? `, ${notaFiscal.fornecedor_numero}` : ''}
                      {notaFiscal.fornecedor_bairro ? ` - ${notaFiscal.fornecedor_bairro}` : ''}
                      {notaFiscal.fornecedor_cidade ? ` - ${notaFiscal.fornecedor_cidade}` : ''}
                      {notaFiscal.fornecedor_estado ? `/${notaFiscal.fornecedor_estado}` : ''}
                      {notaFiscal.fornecedor_cep ? ` - CEP: ${notaFiscal.fornecedor_cep}` : ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO B: Destinatário / Remetente */}
        <div className="section">
          <div className="section-title">B) Destinatário / Remetente</div>
          <div className="section-content">
            <table>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>CNPJ</th>
                  <td style={{ width: '25%' }}>{notaFiscal.filial_cnpj || '-'}</td>
                  <th style={{ width: '25%' }}>Razão Social</th>
                  <td style={{ width: '25%' }}>{notaFiscal.filial_razao_social || notaFiscal.filial_nome || '-'}</td>
                </tr>
                {notaFiscal.filial_logradouro && (
                  <tr>
                    <th>Endereço</th>
                    <td colSpan="3">
                      {notaFiscal.filial_logradouro || ''}
                      {notaFiscal.filial_numero ? `, ${notaFiscal.filial_numero}` : ''}
                      {notaFiscal.filial_bairro ? ` - ${notaFiscal.filial_bairro}` : ''}
                      {notaFiscal.filial_cidade ? ` - ${notaFiscal.filial_cidade}` : ''}
                      {notaFiscal.filial_estado ? `/${notaFiscal.filial_estado}` : ''}
                      {notaFiscal.filial_cep ? ` - CEP: ${notaFiscal.filial_cep}` : ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO C: Dados da Nota Fiscal */}
        <div className="section">
          <div className="section-title">C) Dados da Nota Fiscal</div>
          <div className="section-content">
            <table>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>Nº Nota Fiscal</th>
                  <td style={{ width: '25%' }}>{notaFiscal.numero_nota || '-'}</td>
                  <th style={{ width: '25%' }}>Série</th>
                  <td style={{ width: '25%' }}>{notaFiscal.serie || '-'}</td>
                </tr>
                <tr>
                  <th>Chave de Acesso</th>
                  <td colSpan="3">{notaFiscal.chave_acesso || '-'}</td>
                </tr>
                <tr>
                  <th>Data de Emissão</th>
                  <td>{formatDate(notaFiscal.data_emissao)}</td>
                  <th>Data de Entrada</th>
                  <td>{formatDate(notaFiscal.data_entrada)}</td>
                </tr>
                <tr>
                  <th>Tipo de Nota</th>
                  <td>{notaFiscal.tipo_nota === 'ENTRADA' ? 'Entrada' : 'Saída'}</td>
                  <th>Status</th>
                  <td>{notaFiscal.status || '-'}</td>
                </tr>
                {notaFiscal.numero_pedido && (
                  <tr>
                    <th>Nº Pedido de Compra</th>
                    <td>{notaFiscal.numero_pedido || '-'}</td>
                    <th>Nº RIR</th>
                    <td>{notaFiscal.numero_rir || '-'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO D: Condições de Pagamento */}
        {(notaFiscal.forma_pagamento || notaFiscal.prazo_pagamento) && (
          <div className="section">
            <div className="section-title">D) Condições de Pagamento</div>
            <div className="section-content">
              <table>
                <tbody>
                  <tr>
                    <th style={{ width: '25%' }}>Forma de Pagamento</th>
                    <td style={{ width: '25%' }}>{notaFiscal.forma_pagamento || '-'}</td>
                    <th style={{ width: '25%' }}>Prazo de Pagamento</th>
                    <td style={{ width: '25%' }}>{notaFiscal.prazo_pagamento || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEÇÃO E: Cálculo de Impostos */}
        {(notaFiscal.valor_ipi || notaFiscal.valor_icms || notaFiscal.valor_icms_st || notaFiscal.valor_pis || notaFiscal.valor_cofins) && (
          <div className="section">
            <div className="section-title">E) Cálculo de Impostos</div>
            <div className="section-content">
              <table>
                <tbody>
                  {notaFiscal.valor_ipi && (
                    <tr>
                      <th style={{ width: '25%' }}>Valor IPI</th>
                      <td style={{ width: '25%' }}>{formatCurrency(notaFiscal.valor_ipi)}</td>
                      <th style={{ width: '25%' }}>Valor ICMS</th>
                      <td style={{ width: '25%' }}>{formatCurrency(notaFiscal.valor_icms || 0)}</td>
                    </tr>
                  )}
                  {notaFiscal.valor_icms_st && (
                    <tr>
                      <th>Valor ICMS ST</th>
                      <td>{formatCurrency(notaFiscal.valor_icms_st)}</td>
                      <th>Base Cálculo ICMS</th>
                      <td>{formatCurrency(notaFiscal.base_calculo_icms || 0)}</td>
                    </tr>
                  )}
                  {notaFiscal.valor_pis && (
                    <tr>
                      <th>Valor PIS</th>
                      <td>{formatCurrency(notaFiscal.valor_pis)}</td>
                      <th>Valor COFINS</th>
                      <td>{formatCurrency(notaFiscal.valor_cofins || 0)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEÇÃO F: Informações Fiscais */}
        {(notaFiscal.natureza_operacao || notaFiscal.cfop) && (
          <div className="section">
            <div className="section-title">F) Informações Fiscais</div>
            <div className="section-content">
              <table>
                <tbody>
                  <tr>
                    <th style={{ width: '25%' }}>Natureza da Operação</th>
                    <td style={{ width: '25%' }}>{notaFiscal.natureza_operacao || '-'}</td>
                    <th style={{ width: '25%' }}>CFOP</th>
                    <td style={{ width: '25%' }}>{notaFiscal.cfop || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEÇÃO G: Transportador e Volumes */}
        {(notaFiscal.transportador_nome || notaFiscal.transportador_cnpj || notaFiscal.placa_veiculo || notaFiscal.uf_veiculo || notaFiscal.quantidade_volumes || notaFiscal.especie_volumes) && (
          <div className="section">
            <div className="section-title">G) Transportador e Volumes</div>
            <div className="section-content">
              <table>
                <tbody>
                  {notaFiscal.transportador_nome && (
                    <tr>
                      <th style={{ width: '25%' }}>Transportador</th>
                      <td colSpan="3">{notaFiscal.transportador_nome || '-'}</td>
                    </tr>
                  )}
                  {notaFiscal.transportador_cnpj && (
                    <tr>
                      <th>CNPJ Transportador</th>
                      <td>{notaFiscal.transportador_cnpj || '-'}</td>
                      <th>Placa do Veículo</th>
                      <td>{notaFiscal.placa_veiculo || '-'} {notaFiscal.uf_veiculo || ''}</td>
                    </tr>
                  )}
                  {(notaFiscal.quantidade_volumes || notaFiscal.especie_volumes) && (
                    <tr>
                      <th>Quantidade de Volumes</th>
                      <td>{normalizeNumber(notaFiscal.quantidade_volumes) || '-'}</td>
                      <th>Espécie</th>
                      <td>{notaFiscal.especie_volumes || '-'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEÇÃO H: Produtos da Nota Fiscal */}
        {itens && itens.length > 0 && (
          <div className="section">
            <div className="section-title">H) Produtos da Nota Fiscal</div>
            <div className="section-content">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Código</th>
                    <th>Produto</th>
                    <th>Unidade</th>
                    <th>Quantidade</th>
                    <th>Valor Unitário</th>
                    <th>Desconto</th>
                    <th>Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, index) => {
                    const qtd = parseFloat(item.quantidade || 0);
                    const valorUnit = parseFloat(item.valor_unitario || 0);
                    const desconto = parseFloat(item.desconto || 0);
                    const valorItemTotal = (qtd * valorUnit) - desconto;
                    
                    return (
                      <tr key={index}>
                        <td>{item.numero_item || index + 1}</td>
                        <td>{item.produto_codigo || item.codigo_produto || '-'}</td>
                        <td>{item.produto_nome || item.nome_produto || '-'}</td>
                        <td>{item.unidade || item.unidade_medida || '-'}</td>
                        <td>{normalizeNumber(qtd)}</td>
                        <td>{formatCurrency(valorUnit)}</td>
                        <td>{formatCurrency(desconto)}</td>
                        <td className="text-right font-bold">{formatCurrency(valorItemTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="text-right font-bold">Valor dos Produtos:</td>
                    <td colSpan="4" className="text-right font-bold">{formatCurrency(notaFiscal.valor_produtos || 0)}</td>
                  </tr>
                  {notaFiscal.valor_frete > 0 && (
                    <tr>
                      <td colSpan="4" className="text-right font-bold">Valor do Frete:</td>
                      <td colSpan="4" className="text-right font-bold">{formatCurrency(notaFiscal.valor_frete)}</td>
                    </tr>
                  )}
                  {notaFiscal.valor_seguro > 0 && (
                    <tr>
                      <td colSpan="4" className="text-right font-bold">Valor do Seguro:</td>
                      <td colSpan="4" className="text-right font-bold">{formatCurrency(notaFiscal.valor_seguro)}</td>
                    </tr>
                  )}
                  {notaFiscal.valor_desconto > 0 && (
                    <tr>
                      <td colSpan="4" className="text-right font-bold">Valor do Desconto:</td>
                      <td colSpan="4" className="text-right font-bold">{formatCurrency(notaFiscal.valor_desconto)}</td>
                    </tr>
                  )}
                  {notaFiscal.valor_outras_despesas > 0 && (
                    <tr>
                      <td colSpan="4" className="text-right font-bold">Outras Despesas:</td>
                      <td colSpan="4" className="text-right font-bold">{formatCurrency(notaFiscal.valor_outras_despesas)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="4" className="text-right font-bold">Valor Total da Nota Fiscal:</td>
                    <td colSpan="4" className="text-right font-bold">{formatCurrency(notaFiscal.valor_total || 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* SEÇÃO I: Informações Adicionais */}
        {notaFiscal.informacoes_adicionais && (
          <div className="section">
            <div className="section-title">I) Informações Adicionais</div>
            <div className="section-content">
              <div className="text-area">
                {notaFiscal.informacoes_adicionais}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotaFiscalPrint;

