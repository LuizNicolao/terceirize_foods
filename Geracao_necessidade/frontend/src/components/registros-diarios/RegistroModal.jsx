import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import RegistroDetails from './RegistroDetails';
import MediasCalculadas from './MediasCalculadas';
import RegistroEditForm from './RegistroEditForm';
import RegistroActions from './RegistroActions';
import RegistroHistorico from './RegistroHistorico';
import TabelaRegistrosSimples from './TabelaRegistrosSimples';
import { TabelaMedias } from '../medias-escolas';

const RegistroModal = ({ 
  isOpen, 
  onClose, 
  registro = null,
  onSave,
  escolas = [],
  loading = false,
  mediasCalculadas = null,
  isViewMode = false
}) => {
  const [activeTab, setActiveTab] = useState('registros'); // 'registros', 'medias' ou 'historico'
  const [selectedEscolaId, setSelectedEscolaId] = useState('');
  const [data, setData] = useState('');
  
  // Estados para o autocomplete de escolas
  const [buscaEscola, setBuscaEscola] = useState('');
  const [mostrarDropdownEscolas, setMostrarDropdownEscolas] = useState(false);
  const [escolasFiltradas, setEscolasFiltradas] = useState([]);
  const [indiceSelecionadoEscola, setIndiceSelecionadoEscola] = useState(-1);
  const dropdownEscolasRef = useRef(null);
  const [medias, setMedias] = useState({
    // Formato antigo (correto)
    lanche_manha: 0,
    almoco: 0,
    lanche_tarde: 0,
    parcial: 0,
    eja: 0
  });

  // Função para formatar data para YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Se já está no formato YYYY-MM-DD, retorna como está
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Se é uma data ISO, converte para YYYY-MM-DD
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (registro) {
      setSelectedEscolaId(registro.escola_id || '');
      // Para edição, usar data atual (dia de hoje) mas permitir edição
      // Para criação, usar data atual
      setData(new Date().toISOString().split('T')[0]);
      
      // Definir o nome da escola para exibição
      const escolaEncontrada = escolas.find(e => e.id === registro.escola_id);
      setBuscaEscola(escolaEncontrada ? `${escolaEncontrada.nome_escola} - ${escolaEncontrada.rota}` : '');
      
      
      // Se o registro tem medias, usar elas
      if (registro.medias) {
        // Criar objeto de médias com valores padrão no formato antigo
        const novasMedias = {
          lanche_manha: 0,
          almoco: 0,
          lanche_tarde: 0,
          parcial: 0,
          eja: 0
        };
        
        // Mapear os dados do registro para o formato antigo
        Object.keys(registro.medias).forEach(campo => {
          // Se já está no formato antigo, usar diretamente
          if (novasMedias.hasOwnProperty(campo)) {
            novasMedias[campo] = parseFloat(registro.medias[campo]) || 0;
          } else {
            // Mapear formato novo para antigo
            const mapeamentoNovo = {
              'lanche_parcial': 'lanche_manha',
              'almoco_almoco': 'almoco', 
              'lanche_lanche': 'lanche_tarde',
              'parcial_parcial': 'parcial',
              'eja_eja': 'eja'
            };
            
            if (mapeamentoNovo[campo]) {
              novasMedias[mapeamentoNovo[campo]] = parseFloat(registro.medias[campo]) || 0;
            }
          }
        });
        
        setMedias(novasMedias);
      } else {
        // Formato antigo (registro individual) - usar diretamente
        const tipoMedia = registro.tipo_media || 'parcial';
        const valor = registro.valor || 0;
        
        setMedias(prev => ({
          ...prev,
          [tipoMedia]: valor
        }));
      }
    } else {
      setSelectedEscolaId('');
      setData(new Date().toISOString().split('T')[0]); // Data atual
      setBuscaEscola('');
      setMedias({
        // Formato correto: media_tipo_periodo
        media_eja_parcial: 0,
        media_eja_almoco: 0,
        media_eja_lanche: 0,
        media_eja_eja: 0,
        media_almoco_parcial: 0,
        media_almoco_almoco: 0,
        media_almoco_lanche: 0,
        media_almoco_eja: 0,
        media_parcial_parcial: 0,
        media_parcial_almoco: 0,
        media_parcial_lanche: 0,
        media_parcial_eja: 0,
        media_lanche_parcial: 0,
        media_lanche_almoco: 0,
        media_lanche_lanche: 0,
        media_lanche_eja: 0
      });
    }
  }, [registro, isOpen, escolas]);

  // Filtrar escolas baseado na busca
  useEffect(() => {
    if (buscaEscola.trim()) {
      const filtradas = escolas.filter(escola =>
        escola.nome_escola.toLowerCase().includes(buscaEscola.toLowerCase()) ||
        escola.rota.toLowerCase().includes(buscaEscola.toLowerCase())
      );
      setEscolasFiltradas(filtradas);
      setMostrarDropdownEscolas(filtradas.length > 0);
    } else {
      setEscolasFiltradas(escolas);
      setMostrarDropdownEscolas(false);
    }
  }, [buscaEscola, escolas]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownEscolasRef.current && !dropdownEscolasRef.current.contains(event.target)) {
        setMostrarDropdownEscolas(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMediasChange = (tipoMedia, periodo, value) => {
    // Para formato antigo, usar apenas o tipoMedia
    setMedias(prev => ({
      ...prev,
      [tipoMedia]: value
    }));
  };

  const handleBuscaEscolaChange = (e) => {
    const valor = e.target.value;
    setBuscaEscola(valor);
    setIndiceSelecionadoEscola(-1); // Resetar índice ao digitar
    
    // Se o campo estiver vazio, limpar seleção
    if (!valor.trim()) {
      setSelectedEscolaId('');
      setMostrarDropdownEscolas(false);
    } else {
      setMostrarDropdownEscolas(true);
    }
  };

  const handleSelecionarEscola = (escola) => {
    setSelectedEscolaId(escola.id);
    setBuscaEscola(`${escola.nome_escola} - ${escola.rota}`);
    setMostrarDropdownEscolas(false);
  };

  const handleInputFocusEscola = () => {
    if (escolas.length > 0) {
      setMostrarDropdownEscolas(true);
    }
  };

  const handleKeyDownEscola = (e) => {
    if (!mostrarDropdownEscolas) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIndiceSelecionadoEscola(prev => 
          prev < escolasFiltradas.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIndiceSelecionadoEscola(prev => 
          prev > 0 ? prev - 1 : escolasFiltradas.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (indiceSelecionadoEscola >= 0 && escolasFiltradas[indiceSelecionadoEscola]) {
          handleSelecionarEscola(escolasFiltradas[indiceSelecionadoEscola]);
        }
        break;
      case 'Escape':
        setMostrarDropdownEscolas(false);
        setIndiceSelecionadoEscola(-1);
        break;
    }
  };

  const handleSave = async () => {
    // Validações básicas
    if (!selectedEscolaId || !data) {
      alert('Por favor, selecione uma escola e uma data');
      return;
    }

    // Validação de data
    const dataSelecionada = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataSelecionada > hoje) {
      alert('A data não pode ser futura');
      return;
    }
    
    const doisAnosAtras = new Date();
    doisAnosAtras.setFullYear(doisAnosAtras.getFullYear() - 2);
    
    if (dataSelecionada < doisAnosAtras) {
      alert('A data não pode ser anterior a 2 anos');
      return;
    }

    // Verificar se pelo menos uma média foi preenchida
    const temMedias = Object.values(medias).some(valor => valor > 0);
    if (!temMedias) {
      alert('Por favor, preencha pelo menos uma média');
      return;
    }

    // Validação de valores das médias
    const valoresInvalidos = Object.entries(medias).filter(([campo, valor]) => {
      if (valor > 0) {
        return valor < 0 || valor > 999999.99 || isNaN(valor);
      }
      return false;
    });

    if (valoresInvalidos.length > 0) {
      alert('Os valores das médias devem estar entre 0 e 999999.99');
      return;
    }

    // As médias já estão no formato antigo
    const mediasFormatadas = medias;

    // Verificar se é realmente uma edição (mesmo registro, mesma data)
    const dataOriginal = registro ? registro.data : null;
    const dataOriginalFormatada = dataOriginal ? new Date(dataOriginal).toISOString().split('T')[0] : null;
    const dataNovaFormatada = new Date(data).toISOString().split('T')[0];
    
    const isRealEdit = !!registro && dataOriginalFormatada === dataNovaFormatada;

    // Criar um único registro com todas as médias
    const dados = {
      escola_id: selectedEscolaId,
      data: data,
      medias: mediasFormatadas,
      isEdit: isRealEdit, // Só é edição se for o mesmo registro E mesma data
      dataOriginal: dataOriginal // Enviar data original para o backend
    };


    await onSave(dados);
  };

  const handleClear = () => {
    setMedias({
      // Formato antigo (correto)
      lanche_manha: 0,
      almoco: 0,
      lanche_tarde: 0,
      parcial: 0,
      eja: 0
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isViewMode 
          ? 'Visualizar Registro Diário' 
          : registro 
            ? 'Editar Registro Diário' 
            : 'Adicionar Registro Diário'
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Abas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('registros')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'registros'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Registros Diários
            </button>
            <button
              onClick={() => setActiveTab('medias')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'medias'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Médias Calculadas
            </button>
            {selectedEscolaId && data && (
              <button
                onClick={() => setActiveTab('historico')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'historico'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Histórico
              </button>
            )}
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'registros' ? (
          <>
            {/* Seleção de Escola e Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="relative" ref={dropdownEscolasRef}>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Escola *
                     </label>
                     <input
                       type="text"
                       value={buscaEscola}
                       onChange={handleBuscaEscolaChange}
                       onFocus={handleInputFocusEscola}
                       onKeyDown={handleKeyDownEscola}
                       className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                         isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                       }`}
                       disabled={isViewMode}
                       placeholder="Digite para buscar uma escola..."
                       required
                     />
                     
                     {/* Dropdown de escolas */}
                     {mostrarDropdownEscolas && !isViewMode && (
                       <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                         {escolasFiltradas.length > 0 ? (
                           escolasFiltradas.map((escola, index) => (
                             <div
                               key={escola.id}
                               onClick={() => handleSelecionarEscola(escola)}
                               className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                 index === indiceSelecionadoEscola 
                                   ? 'bg-green-100 text-green-900' 
                                   : 'hover:bg-gray-100'
                               }`}
                             >
                               <div className="text-sm font-medium">
                                 {escola.nome_escola}
                               </div>
                               <div className="text-xs text-gray-500">
                                 Rota: {escola.rota}
                               </div>
                             </div>
                           ))
                         ) : (
                           <div className="px-3 py-2 text-sm text-gray-500">
                             Nenhuma escola encontrada
                           </div>
                         )}
                       </div>
                     )}
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Data *
                     </label>
                     <input
                       type="date"
                       value={data}
                       onChange={(e) => setData(e.target.value)}
                       className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                         isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                       }`}
                       disabled={isViewMode}
                       required
                     />
                   </div>
            </div>

            {/* Registros Diários */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Registros Diários
              </h4>
              {isViewMode ? (
                // Modo visualização - mostrar registros individuais
                <RegistroDetails registro={registro} />
              ) : (
                // Modo edição - mostrar tabela simplificada com 4 colunas
                <TabelaRegistrosSimples
                  medias={medias}
                  onMediasChange={handleMediasChange}
                  readOnly={false}
                />
              )}
            </div>

            {/* Botões */}
            {!isViewMode ? (
              <RegistroActions
                onSave={handleSave}
                onClear={handleClear}
                saving={loading}
                canSave={true}
              />
            ) : (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                >
                  Fechar
                </Button>
              </div>
            )}
          </>
        ) : activeTab === 'historico' ? (
          /* Aba de Histórico */
          <div>
            <RegistroHistorico 
              escolaId={selectedEscolaId} 
              data={data} 
              isOpen={isOpen && activeTab === 'historico'} 
            />
            
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          /* Aba de Médias Calculadas */
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Médias Calculadas
            </h4>
            <MediasCalculadas mediasCalculadas={mediasCalculadas} />
            
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RegistroModal;
