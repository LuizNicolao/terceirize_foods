import React, { useRef } from 'react';
import { FaUpload, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const FornecedorImportExport = ({ fornecedor, onDataUpdate }) => {
  const fileInputRef = useRef(null);

  const exportarDadosFornecedor = () => {
    try {
      // Criar dados para exportação
      const dadosFornecedor = {
        nome: fornecedor.nome,
        prazoPagamento: fornecedor.prazoPagamento || '',
        valorFrete: fornecedor.valorFrete || 0,
        tipoFrete: fornecedor.tipoFrete || '',
        produtos: fornecedor.produtos.map(produto => ({
          nome: produto.nome,
          quantidade: produto.qtde,
          unidade: produto.un,
          prazoEntrega: produto.prazoEntrega || '',
          valorUnitario: produto.valorUnitario || 0,
          dataEntregaFn: produto.dataEntregaFn || '',
          difal: produto.difal || 0,
          ipi: produto.ipi || 0,
          total: produto.total || 0
        }))
      };

      // Criar workbook do Excel
      const wb = XLSX.utils.book_new();
      
              // Criar worksheet com os dados do fornecedor
        const wsData = [
          ['Dados do Fornecedor'],
          ['Nome do Fornecedor', dadosFornecedor.nome],
          ['Prazo de Pagamento', dadosFornecedor.prazoPagamento],
          ['Tipo de Frete', dadosFornecedor.tipoFrete],
          ['Valor do Frete', dadosFornecedor.valorFrete],
          [], // Linha em branco
          ['Produtos'],
          ['Produto', 'Quantidade', 'UN', 'Prazo Entrega', 'Valor Unit.', 'Primeiro Valor', 'Valor Anterior', 'Data Entrega Fn', 'Difal', 'IPI', 'Total']
        ];

              // Adicionar dados dos produtos
        dadosFornecedor.produtos.forEach(produto => {
          wsData.push([
            produto.nome,
            produto.quantidade,
            produto.unidade,
            produto.prazoEntrega,
            produto.valorUnitario,
            produto.primeiroValor || produto.valorUnitario,
            produto.valorAnterior || 0,
            produto.dataEntregaFn,
            produto.difal,
            produto.ipi,
            produto.total
          ]);
        });

      const ws = XLSX.utils.aoa_to_sheet(wsData);

              // Estilizar o worksheet
        ws['!cols'] = [
          { wch: 40 }, // Produto
          { wch: 12 }, // Quantidade
          { wch: 8 },  // UN
          { wch: 15 }, // Prazo Entrega
          { wch: 12 }, // Valor Unit.
          { wch: 12 }, // Primeiro Valor
          { wch: 12 }, // Valor Anterior
          { wch: 15 }, // Data Entrega Fn
          { wch: 10 }, // Difal
          { wch: 10 }, // IPI
          { wch: 12 }  // Total
        ];

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Dados Fornecedor');

      // Gerar nome do arquivo
      const fileName = `Cotacao_${dadosFornecedor.nome}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Salvar arquivo
      XLSX.writeFile(wb, fileName);
      
      toast.success('Dados do fornecedor exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados do fornecedor');
    }
  };

  const importarDadosFornecedor = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Converter a planilha para JSON
        const dados = XLSX.utils.sheet_to_json(firstSheet, {
          header: 1,
          raw: false,
          dateNF: 'dd/mm/yyyy'
        });
        
        // Encontrar os índices das colunas importantes
        const headerRow = dados[6]; // Linha do cabeçalho dos produtos
        const colIndices = {
          produto: headerRow.indexOf('Produto'),
          valorUnitario: headerRow.indexOf('Valor Unit.'),
          primeiroValor: headerRow.indexOf('Primeiro Valor'),
          valorAnterior: headerRow.indexOf('Valor Anterior'),
          dataEntregaFn: headerRow.indexOf('Data Entrega Fn'),
          difal: headerRow.indexOf('Difal'),
          ipi: headerRow.indexOf('IPI')
        };
        
        // Preencher dados do fornecedor
        const prazoPagamento = dados[2][1]; // Linha 3, coluna 2
        const tipoFrete = dados[3][1]; // Linha 4, coluna 2
        const valorFrete = dados[4][1]; // Linha 5, coluna 2
        
        const dadosAtualizados = {
          ...fornecedor,
          prazoPagamento: prazoPagamento || fornecedor.prazoPagamento,
          tipoFrete: tipoFrete || fornecedor.tipoFrete,
          valorFrete: parseFloat(valorFrete) || fornecedor.valorFrete,
          produtos: fornecedor.produtos.map(produto => {
            // Encontrar o produto correspondente na planilha
            const produtoDados = dados.slice(7).find(row => 
              row[colIndices.produto] === produto.nome
            );
            
            if (produtoDados) {
              const novoValorUnitario = parseFloat(produtoDados[colIndices.valorUnitario]) || 0;
              const primeiroValorImportado = parseFloat(produtoDados[colIndices.primeiroValor]) || 0;
              const valorAnteriorImportado = parseFloat(produtoDados[colIndices.valorAnterior]) || 0;
              const dataEntregaFn = produtoDados[colIndices.dataEntregaFn] || produto.dataEntregaFn;
              const difal = parseFloat(produtoDados[colIndices.difal]) || produto.difal;
              const ipi = parseFloat(produtoDados[colIndices.ipi]) || produto.ipi;
              
              // Lógica para gerenciar valores unitários
              let valorUnitario = produto.valorUnitario;
              let valorAnterior = produto.valorAnterior;
              let primeiroValor = produto.primeiroValor;
              
              if (novoValorUnitario > 0) {
                // Se já existe um valor unitário atual
                if (produto.valorUnitario > 0) {
                  // Mover valor atual para valor_anterior
                  valorAnterior = produto.valorUnitario;
                  // Colocar novo valor em valor_unitario
                  valorUnitario = novoValorUnitario;
                } else {
                  // Se não tem valor atual, definir como primeiro valor
                  valorUnitario = novoValorUnitario;
                  if (!primeiroValor || primeiroValor === 0) {
                    primeiroValor = novoValorUnitario;
                  }
                }
              }
              
              // Se o arquivo tem valores específicos para primeiro_valor e valor_anterior, usar eles
              if (primeiroValorImportado > 0) {
                primeiroValor = primeiroValorImportado;
              }
              if (valorAnteriorImportado > 0) {
                valorAnterior = valorAnteriorImportado;
              }
              
              return {
                ...produto,
                valorUnitario,
                valorAnterior,
                primeiroValor,
                dataEntregaFn,
                difal,
                ipi,
                total: (parseFloat(produto.qtde) || 0) * valorUnitario
              };
            }
            
            return produto;
          })
        };
        
        onDataUpdate(dadosAtualizados);
        toast.success('Dados do fornecedor importados com sucesso!');
      } catch (error) {
        console.error('Erro ao importar arquivo:', error);
        toast.error('Erro ao importar dados. Verifique se o formato está correto.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      importarDadosFornecedor(file);
      // Limpar input
      event.target.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={exportarDadosFornecedor}
        className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        title="Exportar dados do fornecedor"
      >
        <FaDownload size={12} /> Exportar
      </button>
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
        title="Importar dados do fornecedor"
      >
        <FaUpload size={12} /> Importar
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FornecedorImportExport;
