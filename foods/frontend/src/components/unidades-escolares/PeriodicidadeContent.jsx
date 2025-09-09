import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import PeriodicidadeService from '../../services/periodicidade';

const PeriodicidadeContent = ({ unidadeEscolarId, viewMode = false }) => {
  const [agrupamentos, setAgrupamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (unidadeEscolarId) {
      carregarAgrupamentos();
    }
  }, [unidadeEscolarId]);

  const carregarAgrupamentos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar agrupamentos vinculados à unidade escolar
      const result = await PeriodicidadeService.buscarAgrupamentosPorUnidade(unidadeEscolarId);
      
      if (result.success) {
        setAgrupamentos(result.data || []);
      } else {
        setError(result.error || 'Erro ao carregar agrupamentos');
      }
    } catch (error) {
      console.error('Erro ao carregar agrupamentos:', error);
      setError('Erro interno ao carregar agrupamentos');
    } finally {
      setLoading(false);
    }
  };

  const formatarRegrasCalendario = (regras) => {
    if (!regras) return 'Não configurado';
    
    try {
      const regrasObj = typeof regras === 'string' ? JSON.parse(regras) : regras;
      
      if (regrasObj.dias_semana) {
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const dias = regrasObj.dias_semana.map(dia => diasSemana[dia - 1]).join(', ');
        
        if (regrasObj.quinzena) {
          const quinzenas = {
            'primeira_quinzena': '1ª quinzena',
            'segunda_quinzena': '2ª quinzena',
            'semanas_impares': 'semanas ímpares',
            'semanas_pares': 'semanas pares',
            'ultima_semana': 'última semana'
          };
          return `${dias} (${quinzenas[regrasObj.quinzena] || regrasObj.quinzena})`;
        }
        
        if (regrasObj.tipo_mensal) {
          const tiposMensal = {
            'primeira': 'primeira ocorrência',
            'ultima': 'última ocorrência',
            'primeira_ultima': 'primeira e última ocorrência'
          };
          return `${dias} (${tiposMensal[regrasObj.tipo_mensal] || regrasObj.tipo_mensal})`;
        }
        
        return dias;
      }
      
      return 'Configuração personalizada';
    } catch (error) {
      return 'Erro ao interpretar regras';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agrupamentos de periodicidade...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaInfoCircle className="text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
          <FaCalendarAlt className="inline mr-2" />
          Agrupamentos de Periodicidade Vinculados
        </h3>
        
        {agrupamentos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaCalendarAlt className="text-4xl mx-auto mb-4 text-gray-300" />
            <p>Esta unidade escolar não possui agrupamentos de periodicidade vinculados.</p>
            <p className="text-sm mt-2">
              Para vincular agrupamentos, acesse a tela de Periodicidade e edite os agrupamentos desejados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {agrupamentos.map((agrupamento) => (
              <div key={agrupamento.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {agrupamento.nome}
                    </h4>
                    
                    {agrupamento.descricao && (
                      <p className="text-sm text-gray-600 mb-2">
                        {agrupamento.descricao}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-1">Tipo:</span>
                        <span className="text-gray-600">{agrupamento.tipo_nome}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-1">Regras:</span>
                        <span className="text-gray-600">
                          {formatarRegrasCalendario(agrupamento.regras_calendario)}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          agrupamento.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {agrupamento.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodicidadeContent;
