import React, { useState, useEffect, useRef } from 'react';
import { FaSave, FaArrowLeft, FaPrint } from 'react-icons/fa';
import { Modal, Button } from '../ui';
import PedidosComprasService from '../../services/pedidosComprasService';
import FornecedoresService from '../../services/fornecedores';
import FiliaisService from '../../services/filiais';
import RelatorioInspecaoService from '../../services/relatorioInspecao';
import {
  SelecaoPedidoCompra,
  IdentificacaoEmitente,
  DestinatarioRemetente,
  DadosNotaFiscal,
  CondicoesPagamento,
  CalculoImposto,
  InformacoesFiscais,
  TransportadorVolumes,
  ProdutosNotaFiscal,
  InformacoesAdicionais
} from './sections';

const NotaFiscalModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  notaFiscal,
  isViewMode,
  onPrint
}) => {

  // Proteção contra duplo submit
  const isSubmittingRef = useRef(false);
  const [saving, setSaving] = useState(false);

  // Estados para dados auxiliares
  const [pedidosDisponiveis, setPedidosDisponiveis] = useState([]);
  const [rirsDisponiveis, setRirsDisponiveis] = useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [fornecedor, setFornecedor] = useState(null);
  const [filial, setFilial] = useState(null);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    pedido_compra_id: '',
    rir_id: '',
    tipo_nota: 'ENTRADA',
    numero_nota: '',
    serie: '',
    chave_acesso: '',
    fornecedor_id: '',
    filial_id: '',
    data_emissao: '',
    data_entrada: '',
    valor_produtos: '0.00',
    valor_frete: '0.00',
    valor_seguro: '0.00',
    valor_desconto: '0.00',
    valor_outras_despesas: '0.00',
    valor_ipi: '0.00',
    valor_icms: '0.00',
    valor_icms_st: '0.00',
    base_calculo_icms: '',
    base_calculo_icms_st: '',
    valor_pis: '0.00',
    valor_cofins: '0.00',
    natureza_operacao: '',
    cfop: '',
    datas_vencimento: [],
    tipo_frete: '9-SEM_FRETE',
    transportadora_nome: '',
    transportadora_cnpj: '',
    transportadora_placa: '',
    transportadora_uf: '',
    transportadora_endereco: '',
    transportadora_bairro: '',
    transportadora_municipio: '',
    transportadora_inscricao_estadual: '',
    codigo_antt: '',
    volumes_quantidade: '0',
    volumes_especie: '',
    volumes_marca: '',
    volumes_peso_bruto: '0.000',
    volumes_peso_liquido: '0.000',
    informacoes_complementares: '',
    observacoes: ''
  });

  const [itens, setItens] = useState([]);

  // Carregar pedidos disponíveis
  useEffect(() => {
    const carregarPedidos = async () => {
      if (isOpen && !isViewMode) {
        setLoadingPedidos(true);
        try {
          // Carregar pedidos aprovados e parciais (para permitir finalizar lançamento)
          const [responseAprovados, responseParciais] = await Promise.all([
            PedidosComprasService.listar({ 
              status: 'aprovado',
              limit: 1000 
            }),
            PedidosComprasService.listar({ 
              status: 'parcial',
              limit: 1000 
            })
          ]);
          
          // Função auxiliar para extrair pedidos da resposta
          const extrairPedidos = (response) => {
            if (response.success) {
              if (response.data?.data?.items) {
                return response.data.data.items;
              } else if (response.data?.data && Array.isArray(response.data.data)) {
                return response.data.data;
              } else if (Array.isArray(response.data)) {
                return response.data;
              } else if (response.data?.items) {
                return response.data.items;
              }
            } else {
              // Tentar extrair mesmo sem success: true
              if (response.data?.data?.items) {
                return response.data.data.items;
              } else if (Array.isArray(response.data?.data)) {
                return response.data.data;
              } else if (Array.isArray(response.data)) {
                return response.data;
              }
            }
            return [];
          };

          const pedidosAprovados = extrairPedidos(responseAprovados);
          const pedidosParciais = extrairPedidos(responseParciais);
          
          // Combinar e remover duplicatas (caso algum pedido apareça em ambos)
          const todosPedidos = [...pedidosAprovados, ...pedidosParciais];
          const pedidosUnicos = todosPedidos.filter((pedido, index, self) =>
            index === self.findIndex(p => p.id === pedido.id)
          );
          
          setPedidosDisponiveis(pedidosUnicos);
        } catch (error) {
          console.error('Erro ao carregar pedidos:', error);
        } finally {
          setLoadingPedidos(false);
        }
      }
    };

    // Executar imediatamente se o modal estiver aberto
    if (isOpen) {
      carregarPedidos();
    }
  }, [isOpen, isViewMode]);

  // Preencher formulário quando nota fiscal for fornecida (edição/visualização)
  useEffect(() => {
    if (notaFiscal) {
      setFormData({
        pedido_compra_id: notaFiscal.pedido_compra_id ? String(notaFiscal.pedido_compra_id) : '',
        rir_id: notaFiscal.rir_id ? String(notaFiscal.rir_id) : '',
        tipo_nota: notaFiscal.tipo_nota || 'ENTRADA',
        numero_nota: notaFiscal.numero_nota || '',
        serie: notaFiscal.serie || '',
        chave_acesso: notaFiscal.chave_acesso || '',
        fornecedor_id: notaFiscal.fornecedor_id ? String(notaFiscal.fornecedor_id) : '',
        filial_id: notaFiscal.filial_id ? String(notaFiscal.filial_id) : '',
        data_emissao: notaFiscal.data_emissao || '',
        data_entrada: notaFiscal.data_entrada || '',
        valor_produtos: notaFiscal.valor_produtos || '0.00',
        valor_frete: notaFiscal.valor_frete || '0.00',
        valor_seguro: notaFiscal.valor_seguro || '0.00',
        valor_desconto: notaFiscal.valor_desconto || '0.00',
        valor_outras_despesas: notaFiscal.valor_outras_despesas || '0.00',
        valor_ipi: notaFiscal.valor_ipi || '0.00',
        valor_icms: notaFiscal.valor_icms || '0.00',
        valor_icms_st: notaFiscal.valor_icms_st || '0.00',
        base_calculo_icms: notaFiscal.base_calculo_icms || '',
        base_calculo_icms_st: notaFiscal.base_calculo_icms_st || '',
        valor_pis: notaFiscal.valor_pis || '0.00',
        valor_cofins: notaFiscal.valor_cofins || '0.00',
        natureza_operacao: notaFiscal.natureza_operacao || '',
        cfop: notaFiscal.cfop || '',
        tipo_frete: notaFiscal.tipo_frete || '9-SEM_FRETE',
        transportadora_nome: notaFiscal.transportadora_nome || '',
        transportadora_cnpj: notaFiscal.transportadora_cnpj || '',
        transportadora_placa: notaFiscal.transportadora_placa || '',
        transportadora_uf: notaFiscal.transportadora_uf || '',
        transportadora_endereco: notaFiscal.transportadora_endereco || '',
        transportadora_bairro: notaFiscal.transportadora_bairro || '',
        transportadora_municipio: notaFiscal.transportadora_municipio || '',
        transportadora_inscricao_estadual: notaFiscal.transportadora_inscricao_estadual || '',
        codigo_antt: notaFiscal.codigo_antt || '',
        volumes_quantidade: notaFiscal.volumes_quantidade || '0',
        volumes_especie: notaFiscal.volumes_especie || '',
        volumes_marca: notaFiscal.volumes_marca || '',
        volumes_peso_bruto: notaFiscal.volumes_peso_bruto || '0.000',
        volumes_peso_liquido: notaFiscal.volumes_peso_liquido || '0.000',
        informacoes_complementares: notaFiscal.informacoes_complementares || '',
        observacoes: notaFiscal.observacoes || ''
      });
      setItens(notaFiscal.itens || []);

      // Carregar pedido de compra e RIR se existirem
      if (notaFiscal.pedido_compra_id) {
        PedidosComprasService.buscarPorId(notaFiscal.pedido_compra_id)
          .then(async response => {
            // Tentar diferentes formatos de resposta
            let pedido = null;
            if (response.success && response.data) {
              pedido = response.data.data || response.data;
            } else if (response.data) {
              pedido = response.data.data || response.data;
            }

            if (pedido) {
              setPedidoSelecionado(pedido);

              // Adicionar o pedido à lista de pedidos disponíveis se não estiver lá
              setPedidosDisponiveis(prev => {
                const pedidoJaExiste = prev.some(p => p.id === pedido.id);
                if (!pedidoJaExiste) {
                  return [...prev, pedido];
                }
                return prev;
              });

              // Carregar RIRs disponíveis para este pedido (apenas não utilizadas)
              const pedidoId = pedido.id || notaFiscal.pedido_compra_id;
              
              if (pedidoId) {
                try {
                  const rirResponse = await RelatorioInspecaoService.listar({ 
                    pedido_compra_id: pedidoId,
                    apenas_disponiveis: true // Filtrar apenas RIRs não utilizadas
                  });

                  if (rirResponse.success && rirResponse.data) {
                    const rirs = Array.isArray(rirResponse.data) 
                      ? rirResponse.data 
                      : (rirResponse.data.items || rirResponse.data.data?.items || []);
                    
                    // Se estiver editando, incluir o RIR atual mesmo que já esteja utilizado
                    let rirsFinais = rirs;
                    if (notaFiscal.rir_id && !rirs.find(rir => rir.id === notaFiscal.rir_id || rir.id === parseInt(notaFiscal.rir_id))) {
                      // Buscar o RIR atual separadamente para incluí-lo na lista
                      try {
                        const rirAtualResponse = await RelatorioInspecaoService.buscarPorId(notaFiscal.rir_id);
                        if (rirAtualResponse.success && rirAtualResponse.data) {
                          rirsFinais = [rirAtualResponse.data, ...rirs];
                        }
                      } catch (error) {
                        console.error('Erro ao buscar RIR atual:', error);
                      }
                    }
                    
                    setRirsDisponiveis(rirsFinais);
                    
                    // Se já temos um rir_id na nota fiscal, verificar se está na lista
                    if (notaFiscal.rir_id) {
                      const rirEncontrado = rirsFinais.find(rir => rir.id === notaFiscal.rir_id || rir.id === parseInt(notaFiscal.rir_id));
                      
                      // Garantir que o rir_id está no formData
                      if (rirEncontrado) {
                        setFormData(prev => ({
                          ...prev,
                          rir_id: String(notaFiscal.rir_id)
                        }));
                      }
                    }
                  } else {
                    setRirsDisponiveis([]);
                  }
                } catch (error) {
                  console.error('Erro ao buscar RIRs do pedido:', error);
                  setRirsDisponiveis([]);
                }
              }
            }
          })
          .catch(error => {
            console.error('Erro ao carregar pedido de compra:', error);
          });
      }

      // Carregar fornecedor e filial se existirem
      if (notaFiscal.fornecedor_id) {
        // Se já temos dados do fornecedor na nota fiscal, usar diretamente
        if (notaFiscal.fornecedor_nome || notaFiscal.fornecedor_cnpj) {
          setFornecedor({
            razao_social: notaFiscal.fornecedor_nome,
            nome_fantasia: notaFiscal.fornecedor_fantasia,
            cnpj: notaFiscal.fornecedor_cnpj,
            email: notaFiscal.fornecedor_email,
            logradouro: notaFiscal.fornecedor_logradouro,
            numero: notaFiscal.fornecedor_numero,
            cep: notaFiscal.fornecedor_cep,
            bairro: notaFiscal.fornecedor_bairro,
            municipio: notaFiscal.fornecedor_municipio,
            uf: notaFiscal.fornecedor_uf
          });
        } else {
          // Se não temos dados, buscar do serviço
          FornecedoresService.buscarPorId(notaFiscal.fornecedor_id).then(res => {
            if (res.success) setFornecedor(res.data);
          });
        }
      }
      if (notaFiscal.filial_id) {
        // Se já temos dados da filial na nota fiscal, usar diretamente
        if (notaFiscal.filial_nome || notaFiscal.filial_cnpj) {
          setFilial({
            filial: notaFiscal.filial_nome,
            nome: notaFiscal.filial_nome,
            codigo_filial: notaFiscal.codigo_filial,
            cnpj: notaFiscal.filial_cnpj,
            razao_social: notaFiscal.filial_razao_social,
            logradouro: notaFiscal.filial_logradouro,
            endereco: notaFiscal.filial_logradouro,
            numero: notaFiscal.filial_numero,
            cep: notaFiscal.filial_cep,
            bairro: notaFiscal.filial_bairro,
            // A tabela filiais usa 'cidade' e 'estado', não 'municipio' e 'uf'
            municipio: notaFiscal.filial_cidade, // mapear cidade para municipio
            cidade: notaFiscal.filial_cidade,
            uf: notaFiscal.filial_estado, // mapear estado para uf
            estado: notaFiscal.filial_estado
          });
        } else {
          // Se não temos dados, buscar do serviço
          FiliaisService.buscarPorId(notaFiscal.filial_id).then(res => {
            if (res.success) {
              const filialData = res.data.data || res.data;
              // Mapear campos da filial (cidade -> municipio, estado -> uf)
              const filialMapeada = {
                ...filialData,
                municipio: filialData.cidade || filialData.municipio,
                uf: filialData.estado || filialData.uf
              };
              setFilial(filialMapeada);
            }
          });
        }
      }
    } else {
      // Limpar formulário para nova nota
      setFormData({
        pedido_compra_id: '',
        rir_id: '',
        tipo_nota: 'ENTRADA',
        numero_nota: '',
        serie: '',
        chave_acesso: '',
        fornecedor_id: '',
        filial_id: '',
        data_emissao: '',
        data_entrada: '',
        valor_produtos: '0.00',
        valor_frete: '0.00',
        valor_seguro: '0.00',
        valor_desconto: '0.00',
        valor_outras_despesas: '0.00',
        valor_ipi: '0.00',
        valor_icms: '0.00',
        valor_icms_st: '0.00',
        base_calculo_icms: '',
        base_calculo_icms_st: '',
        valor_pis: '0.00',
        valor_cofins: '0.00',
        natureza_operacao: '',
        cfop: '',
        tipo_frete: '9-SEM_FRETE',
        transportadora_nome: '',
        transportadora_cnpj: '',
        transportadora_placa: '',
        transportadora_uf: '',
        transportadora_endereco: '',
        transportadora_bairro: '',
        transportadora_municipio: '',
        transportadora_inscricao_estadual: '',
        codigo_antt: '',
        volumes_quantidade: '0',
        volumes_especie: '',
        volumes_marca: '',
        volumes_peso_bruto: '0.000',
        volumes_peso_liquido: '0.000',
        informacoes_complementares: '',
        observacoes: ''
      });
      setItens([]);
      setPedidoSelecionado(null);
      setFornecedor(null);
      setFilial(null);
    }
  }, [notaFiscal, isOpen]);

  // Calcular valor total dos produtos
  const calcularValorTotalProdutos = () => {
    return itens.reduce((sum, item) => {
      const quantidade = parseFloat(item.quantidade) || 0;
      const valorUnitario = parseFloat(item.valor_unitario) || 0;
      const desconto = parseFloat(item.valor_desconto) || 0;
      return sum + (quantidade * valorUnitario) - desconto;
    }, 0);
  };

  // Calcular valor total da nota
  const calcularValorTotalNota = () => {
    const valorProdutos = calcularValorTotalProdutos();
    const valorFrete = parseFloat(formData.valor_frete) || 0;
    const valorSeguro = parseFloat(formData.valor_seguro) || 0;
    const valorDesconto = parseFloat(formData.valor_desconto) || 0;
    const valorOutrasDespesas = parseFloat(formData.valor_outras_despesas) || 0;
    const valorIpi = parseFloat(formData.valor_ipi) || 0;
    const valorIcmsSt = parseFloat(formData.valor_icms_st) || 0;

    return valorProdutos + valorFrete + valorSeguro - valorDesconto + 
           valorOutrasDespesas + valorIpi + valorIcmsSt;
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePedidoChange = async (pedidoId) => {
    handleFieldChange('pedido_compra_id', pedidoId);
    
    if (pedidoId) {
      try {
        const response = await PedidosComprasService.buscarPorId(pedidoId);
        if (response.success && response.data) {
          const pedido = response.data;
          setPedidoSelecionado(pedido);
          
          // Carregar fornecedor
          if (pedido.fornecedor_id) {
            const fornecedorRes = await FornecedoresService.buscarPorId(pedido.fornecedor_id);
            if (fornecedorRes.success) {
              setFornecedor(fornecedorRes.data);
              handleFieldChange('fornecedor_id', String(pedido.fornecedor_id));
            }
          }

          // Carregar filial de faturamento (prioritária) ou filial padrão
          const filialIdParaCarregar = pedido.filial_faturamento_id || pedido.filial_id;
          let filialCarregada = false;
          
          if (filialIdParaCarregar) {
            const filialRes = await FiliaisService.buscarPorId(filialIdParaCarregar);
            if (filialRes.success && filialRes.data) {
              // Extrair dados da filial (pode estar em data.data ou data diretamente)
              const filialData = filialRes.data.data || filialRes.data;
              
              // Mapear campos da filial para o formato esperado pelo componente
              const filialMapeada = {
                ...filialData,
                uf: filialData.estado || filialData.uf,
                municipio: filialData.cidade || filialData.municipio
              };
              setFilial(filialMapeada);
              handleFieldChange('filial_id', String(filialIdParaCarregar));
              filialCarregada = true;
            }
          }
          
          // Se não conseguiu carregar a filial, usar dados de faturamento do pedido
          if (!filialCarregada && (pedido.endereco_faturamento || pedido.cnpj_faturamento)) {
            // Parse do endereço completo: "Rua Maranhão 575 - Praia da Costa - Vila Velha /ES - CEP: 29101-340"
            const parseEndereco = (enderecoCompleto) => {
              if (!enderecoCompleto) return {};
              
              const partes = enderecoCompleto.split(' - ');
              const logradouroCompleto = partes[0] || '';
              const bairro = partes[1] || '';
              const cidadeUf = partes[2] || '';
              const cepParte = partes[3] || '';
              
              // Extrair número do logradouro
              const numeroMatch = logradouroCompleto.match(/\s+(\d+)$/);
              const numero = numeroMatch ? numeroMatch[1] : '';
              const logradouro = logradouroCompleto.replace(/\s+\d+$/, '').trim();
              
              // Extrair cidade e UF
              const cidadeUfMatch = cidadeUf.match(/^(.+?)\s*\/\s*([A-Z]{2})/);
              const cidade = cidadeUfMatch ? cidadeUfMatch[1].trim() : cidadeUf.split('/')[0]?.trim() || '';
              const uf = cidadeUfMatch ? cidadeUfMatch[2] : cidadeUf.split('/')[1]?.trim() || '';
              
              // Extrair CEP
              const cepMatch = cepParte.match(/CEP:\s*([\d-]+)/);
              const cep = cepMatch ? cepMatch[1] : '';
              
              return { logradouro, numero, bairro, cidade, municipio: cidade, uf, cep };
            };
            
            const enderecoParsed = parseEndereco(pedido.endereco_faturamento);
            
            const filialFaturamento = {
              filial: pedido.filial_nome || '-',
              razao_social: pedido.filial_nome || '-',
              cnpj: pedido.cnpj_faturamento || pedido.cnpj_cobranca || '-',
              endereco: pedido.endereco_faturamento || pedido.endereco_cobranca || '-',
              ...enderecoParsed
            };
            
            setFilial(filialFaturamento);
            if (pedido.filial_id) {
              handleFieldChange('filial_id', String(pedido.filial_id));
            }
          }

          // Buscar RIRs disponíveis (não utilizadas) vinculadas ao pedido
          if (pedido.numero_pedido || pedido.id) {
            try {
              const rirResponse = await RelatorioInspecaoService.listar({ 
                pedido_compra_id: pedido.id,
                apenas_disponiveis: true, // Filtrar apenas RIRs não utilizadas
                limit: 100 
              });
              
              if (rirResponse.success && rirResponse.data) {
                const rirs = Array.isArray(rirResponse.data) 
                  ? rirResponse.data 
                  : (rirResponse.data.items || rirResponse.data.data?.items || []);
                
                if (rirs.length > 0) {
                  // Pegar o primeiro RIR disponível (ou o mais recente)
                  const rir = rirs[0];
                  handleFieldChange('rir_id', String(rir.id));
                  
                  // Atualizar lista de RIRs disponíveis
                  setRirsDisponiveis(rirs);
                } else {
                  // Se não encontrar RIR disponível, limpar o campo
                  handleFieldChange('rir_id', '');
                  setRirsDisponiveis([]);
                }
              } else {
                // Se não encontrar RIR, limpar o campo
                handleFieldChange('rir_id', '');
                setRirsDisponiveis([]);
              }
            } catch (error) {
              console.error('Erro ao buscar RIR vinculado ao pedido:', error);
              handleFieldChange('rir_id', '');
              setRirsDisponiveis([]);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do pedido:', error);
      }
    } else {
      setPedidoSelecionado(null);
      setFornecedor(null);
      setFilial(null);
      handleFieldChange('rir_id', '');
      setRirsDisponiveis([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Proteção contra duplo submit
    if (saving || isSubmittingRef.current) {
      return;
    }

    // Marcar como submetendo IMEDIATAMENTE
    isSubmittingRef.current = true;
    setSaving(true);

    // Validações
    if (!formData.tipo_nota) {
      isSubmittingRef.current = false;
      setSaving(false);
      alert('Tipo de nota é obrigatório');
      return;
    }

    if (!formData.serie || formData.serie.trim() === '') {
      isSubmittingRef.current = false;
      setSaving(false);
      alert('Série é obrigatória');
      return;
    }

    if (!formData.numero_nota) {
      isSubmittingRef.current = false;
      setSaving(false);
      alert('Número da nota é obrigatório');
      return;
    }

    if (!formData.data_emissao) {
      isSubmittingRef.current = false;
      setSaving(false);
      alert('Data de emissão é obrigatória');
      return;
    }

    if (!formData.data_entrada) {
      isSubmittingRef.current = false;
      setSaving(false);
      alert('Data de entrada é obrigatória');
      return;
    }

    // Validar datas de vencimento
    if (pedidoSelecionado && formData.datas_vencimento) {
      const datasVencimento = formData.datas_vencimento;
      if (!Array.isArray(datasVencimento) || datasVencimento.length === 0) {
        isSubmittingRef.current = false;
        setSaving(false);
        alert('É necessário preencher as datas de vencimento');
        return;
      }
      // Verificar se todas as datas estão preenchidas
      const datasVazias = datasVencimento.filter(data => !data || data.trim() === '');
      if (datasVazias.length > 0) {
        isSubmittingRef.current = false;
        setSaving(false);
        alert('Todas as datas de vencimento são obrigatórias');
        return;
      }
    }

    if (itens.length === 0) {
      isSubmittingRef.current = false;
      setSaving(false);
      alert('Adicione pelo menos um item à nota fiscal');
      return;
    }

    // Função auxiliar para converter string monetária para número
    const parseCurrencyToNumber = (value) => {
      if (!value || value === '') return 0;
      // Se já é número, retornar
      if (typeof value === 'number') return value;
      // Se é string, remover formatação e converter
      const cleaned = String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
      const numValue = parseFloat(cleaned);
      return isNaN(numValue) ? 0 : numValue;
    };

    // Função auxiliar para converter data YYYY-MM-DD para ISO 8601 (para validação)
    const formatDateToISO = (dateString) => {
      if (!dateString) return null;
      // Se já estiver no formato ISO 8601, retornar como está
      if (dateString.includes('T')) return dateString;
      // Converter YYYY-MM-DD para ISO 8601 (adicionar T00:00:00.000Z)
      return `${dateString}T00:00:00.000Z`;
    };

    // Validar IDs obrigatórios
    const fornecedorId = formData.fornecedor_id ? parseInt(formData.fornecedor_id) : null;
    const filialId = formData.filial_id ? parseInt(formData.filial_id) : null;
    
    if (!fornecedorId || fornecedorId <= 0) {
      isSubmittingRef.current = false;
      setSaving(false);
      alert('Fornecedor é obrigatório');
      return;
    }
    
    if (!filialId || filialId <= 0) {
      isSubmittingRef.current = false;
      setSaving(false);
      alert('Filial é obrigatória');
      return;
    }

    const notaFiscalData = {
      tipo_nota: formData.tipo_nota || 'ENTRADA',
      numero_nota: formData.numero_nota,
      serie: formData.serie || null,
      // Não incluir chave_acesso se estiver vazia (o validador valida mesmo null)
      ...(formData.chave_acesso && formData.chave_acesso.trim() !== '' && { chave_acesso: formData.chave_acesso }),
      fornecedor_id: fornecedorId,
      filial_id: filialId,
      pedido_compra_id: formData.pedido_compra_id ? parseInt(formData.pedido_compra_id) : null,
      rir_id: formData.rir_id ? parseInt(formData.rir_id) : null,
      data_emissao: formatDateToISO(formData.data_emissao),
      data_entrada: formatDateToISO(formData.data_entrada),
      valor_produtos: calcularValorTotalProdutos(),
      valor_frete: parseCurrencyToNumber(formData.valor_frete),
      valor_seguro: parseCurrencyToNumber(formData.valor_seguro),
      valor_desconto: parseCurrencyToNumber(formData.valor_desconto),
      valor_outras_despesas: parseCurrencyToNumber(formData.valor_outras_despesas),
      valor_ipi: parseCurrencyToNumber(formData.valor_ipi),
      valor_icms: parseCurrencyToNumber(formData.valor_icms),
      valor_icms_st: parseCurrencyToNumber(formData.valor_icms_st),
      base_calculo_icms: formData.base_calculo_icms ? parseCurrencyToNumber(formData.base_calculo_icms) : null,
      base_calculo_icms_st: formData.base_calculo_icms_st ? parseCurrencyToNumber(formData.base_calculo_icms_st) : null,
      valor_pis: parseCurrencyToNumber(formData.valor_pis),
      valor_cofins: parseCurrencyToNumber(formData.valor_cofins),
      valor_total: calcularValorTotalNota(),
      natureza_operacao: formData.natureza_operacao || null,
      cfop: formData.cfop || null,
      tipo_frete: formData.tipo_frete || '9-SEM_FRETE',
      transportadora_nome: formData.transportadora_nome || null,
      transportadora_cnpj: formData.transportadora_cnpj || null,
      transportadora_placa: formData.transportadora_placa || null,
      transportadora_uf: formData.transportadora_uf || null,
      transportadora_endereco: formData.transportadora_endereco || null,
      transportadora_bairro: formData.transportadora_bairro || null,
      transportadora_municipio: formData.transportadora_municipio || null,
      transportadora_inscricao_estadual: formData.transportadora_inscricao_estadual || null,
      codigo_antt: formData.codigo_antt || null,
      volumes_quantidade: parseInt(formData.volumes_quantidade) || 0,
      volumes_especie: formData.volumes_especie || null,
      volumes_marca: formData.volumes_marca || null,
      volumes_peso_bruto: parseFloat(formData.volumes_peso_bruto) || 0,
      volumes_peso_liquido: parseFloat(formData.volumes_peso_liquido) || 0,
      informacoes_complementares: formData.informacoes_complementares || null,
      observacoes: formData.observacoes || null,
      itens: itens.map((item, index) => {
        const quantidade = parseFloat(item.quantidade) || 0;
        const valorUnitario = parseFloat(item.valor_unitario) || 0;
        
        // Validar quantidade mínima
        if (quantidade <= 0) {
          throw new Error(`A quantidade do item ${index + 1} (${item.descricao}) deve ser maior que zero`);
        }
        
        // Validar valor unitário mínimo
        if (valorUnitario < 0) {
          throw new Error(`O valor unitário do item ${index + 1} (${item.descricao}) não pode ser negativo`);
        }
        
        return {
          produto_generico_id: item.produto_id || item.produto_generico_id || null,
          codigo_produto: item.codigo_produto,
          descricao: item.descricao,
          ncm: item.ncm || null,
          cfop: item.cfop || null,
          unidade_comercial: item.unidade_comercial || null,
          quantidade: quantidade,
          valor_unitario: valorUnitario,
        valor_desconto: parseFloat(item.valor_desconto) || 0,
        valor_frete: parseFloat(item.valor_frete) || 0,
        valor_seguro: parseFloat(item.valor_seguro) || 0,
        valor_outras_despesas: parseFloat(item.valor_outras_despesas) || 0,
        valor_ipi: parseFloat(item.valor_ipi) || 0,
        aliquota_ipi: parseFloat(item.aliquota_ipi) || 0,
        valor_icms: parseFloat(item.valor_icms) || 0,
        aliquota_icms: parseFloat(item.aliquota_icms) || 0,
        valor_icms_st: parseFloat(item.valor_icms_st) || 0,
        aliquota_icms_st: parseFloat(item.aliquota_icms_st) || 0,
        valor_pis: parseFloat(item.valor_pis) || 0,
        aliquota_pis: parseFloat(item.aliquota_pis) || 0,
        valor_cofins: parseFloat(item.valor_cofins) || 0,
        aliquota_cofins: parseFloat(item.aliquota_cofins) || 0,
        informacoes_adicionais: item.informacoes_adicionais || null,
        numero_item: index + 1,
        valor_total: quantidade * valorUnitario - (parseFloat(item.valor_desconto) || 0)
        };
      })
    };

    // Chamar onSubmit
    // Nota: onSubmit pode ser síncrono ou assíncrono
    const result = onSubmit(notaFiscalData);
    
    // Se for uma Promise, tratar erro
    if (result && typeof result.then === 'function') {
      result.catch((error) => {
        console.error('Erro ao salvar nota fiscal:', error);
        // Resetar flags em caso de erro
        isSubmittingRef.current = false;
        setSaving(false);
      });
    }
  };

  // Resetar flags quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      isSubmittingRef.current = false;
      setSaving(false);
    }
  }, [isOpen]);

  const valorTotalProdutos = calcularValorTotalProdutos();
  const valorTotalNota = calcularValorTotalNota();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Nota Fiscal' : notaFiscal ? 'Editar Nota Fiscal' : 'Cadastrar Nota Fiscal de Entrada'}
      size="full"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto">
        {/* SEÇÃO 1: Seleção de Pedido de Compra */}
        {!isViewMode && (
          <SelecaoPedidoCompra
            pedidoCompraId={formData.pedido_compra_id}
            onPedidoChange={handlePedidoChange}
            pedidosDisponiveis={pedidosDisponiveis}
            rirId={formData.rir_id}
            onRirChange={(value) => handleFieldChange('rir_id', value)}
            rirsDisponiveis={rirsDisponiveis}
            isViewMode={isViewMode}
            loading={loadingPedidos}
          />
        )}

        {/* SEÇÃO 2 e 3: Identificação do Emitente e Destinatário / Remetente lado a lado */}
        {((fornecedor || (notaFiscal && notaFiscal.fornecedor_nome)) || (filial || (notaFiscal && notaFiscal.filial_nome))) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SEÇÃO 2: Identificação do Emitente */}
            {(fornecedor || (notaFiscal && notaFiscal.fornecedor_nome)) && (
              <IdentificacaoEmitente
                fornecedor={fornecedor || {
                  razao_social: notaFiscal?.fornecedor_nome,
                  nome_fantasia: notaFiscal?.fornecedor_fantasia,
                  cnpj: notaFiscal?.fornecedor_cnpj,
                  email: notaFiscal?.fornecedor_email,
                  telefone: notaFiscal?.fornecedor_telefone,
                  logradouro: notaFiscal?.fornecedor_logradouro,
                  numero: notaFiscal?.fornecedor_numero,
                  bairro: notaFiscal?.fornecedor_bairro,
                  municipio: notaFiscal?.fornecedor_municipio,
                  uf: notaFiscal?.fornecedor_uf,
                  cep: notaFiscal?.fornecedor_cep
                }}
                isViewMode={isViewMode}
              />
            )}

            {/* SEÇÃO 3: Destinatário / Remetente */}
            {(filial || (notaFiscal && (notaFiscal.filial_nome || notaFiscal.filial_id))) && (
              <DestinatarioRemetente
                filial={filial || {
                  filial: notaFiscal?.filial_nome,
                  nome: notaFiscal?.filial_nome,
                  codigo_filial: notaFiscal?.codigo_filial,
                  razao_social: notaFiscal?.filial_razao_social,
                  cnpj: notaFiscal?.filial_cnpj,
                  logradouro: notaFiscal?.filial_logradouro,
                  endereco: notaFiscal?.filial_logradouro,
                  numero: notaFiscal?.filial_numero,
                  bairro: notaFiscal?.filial_bairro,
                  cidade: notaFiscal?.filial_cidade,
                  // A tabela filiais usa 'cidade' e 'estado', mapear para 'municipio' e 'uf'
                  municipio: notaFiscal?.filial_cidade,
                  uf: notaFiscal?.filial_estado,
                  estado: notaFiscal?.filial_estado,
                  cep: notaFiscal?.filial_cep
                }}
                isViewMode={isViewMode}
              />
            )}
          </div>
        )}

        {/* SEÇÃO 4: Dados da Nota Fiscal */}
        <DadosNotaFiscal
          formData={formData}
          onChange={handleFieldChange}
          isViewMode={isViewMode}
          rirSelecionado={rirsDisponiveis.find(rir => String(rir.id) === String(formData.rir_id)) || null}
        />

        {/* SEÇÃO 5: Condições de Pagamento */}
        {pedidoSelecionado && (
          <CondicoesPagamento
            pedido={pedidoSelecionado}
            dataEmissao={formData.data_emissao}
            isViewMode={isViewMode}
            formData={formData}
            onChange={handleFieldChange}
          />
        )}

        {/* SEÇÃO 6: Cálculo do Imposto */}
        <CalculoImposto
          formData={formData}
          onChange={handleFieldChange}
          valorTotalProdutos={valorTotalProdutos}
          valorTotalNota={valorTotalNota}
          isViewMode={isViewMode}
        />

        {/* SEÇÃO 7: Informações Fiscais (oculta por padrão) */}
        <InformacoesFiscais
          formData={formData}
          onChange={handleFieldChange}
          isViewMode={isViewMode}
          hidden={true}
        />

        {/* SEÇÃO 8: Transportador / Volumes Transportados */}
        <TransportadorVolumes
          formData={formData}
          onChange={handleFieldChange}
          isViewMode={isViewMode}
        />

        {/* SEÇÃO 9: Produtos da Nota Fiscal */}
        <ProdutosNotaFiscal
          itens={itens}
          onItensChange={setItens}
          pedidoId={formData.pedido_compra_id}
          descontoTotal={parseFloat(formData.valor_desconto) || 0}
          notaFiscalId={notaFiscal?.id || null}
          isViewMode={isViewMode}
        />

        {/* SEÇÃO 10: Informações Adicionais */}
        <InformacoesAdicionais
          formData={formData}
          onChange={handleFieldChange}
          isViewMode={isViewMode}
        />

        {/* SEÇÃO 11: Ações do Formulário */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="button"
              disabled={saving} 
              variant="outline" 
              size="lg" 
              onClick={onClose}
            >
              <FaArrowLeft className="mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              disabled={saving}
            >
              <FaSave className="mr-2" />
              {saving ? 'Salvando...' : (notaFiscal ? 'Atualizar Nota Fiscal' : 'Salvar Nota Fiscal')}
            </Button>
          </div>
        )}
        {isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {onPrint && notaFiscal && (
              <Button 
                type="button" 
                variant="outline" 
                size="lg" 
                onClick={() => onPrint(notaFiscal)}
                className="flex items-center gap-2"
              >
                <FaPrint className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default NotaFiscalModal;
