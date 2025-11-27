import React, { useEffect, useState } from 'react';
import { FaTruck } from 'react-icons/fa';
import { SearchableSelect } from '../../ui';
import FormSection from './FormSection';
import almoxarifadoService from '../../../services/almoxarifadoService';

const DadosParaEntrega = ({ 
  formData, 
  onChange, 
  isViewMode = false,
  filialId = null 
}) => {
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [carregandoAlmoxarifados, setCarregandoAlmoxarifados] = useState(false);

  // Carregar almoxarifados quando filial for selecionada
  useEffect(() => {
    const carregarAlmoxarifados = async () => {
      // Usar filial_id do formData ou filialId passado como prop
      const filialParaBuscar = filialId || formData.filial_id;
      
      if (!filialParaBuscar) {
        setAlmoxarifados([]);
        return;
      }

      setCarregandoAlmoxarifados(true);
      try {
        // Buscar apenas almoxarifados do tipo "filial" vinculados à filial
        const response = await almoxarifadoService.listar({ 
          filial_id: filialParaBuscar, 
          status: 1 
        });
        
        if (response.success) {
          const dados = response.data?.data || response.data || [];
          // Filtrar apenas os do tipo "filial"
          let almoxarifadosFiliais = dados.filter(
            almox => almox.tipo_vinculo === 'filial' || (!almox.tipo_vinculo && !almox.unidade_escolar_id)
          );
          
          // Se houver um almoxarifado_id selecionado mas ele não estiver na lista, buscar separadamente
          if (formData.almoxarifado_id && !almoxarifadosFiliais.find(a => String(a.id) === String(formData.almoxarifado_id))) {
            try {
              const almoxarifadoResponse = await almoxarifadoService.buscarPorId(formData.almoxarifado_id);
              if (almoxarifadoResponse.success && almoxarifadoResponse.data) {
                // Adicionar o almoxarifado selecionado no início da lista
                almoxarifadosFiliais = [almoxarifadoResponse.data, ...almoxarifadosFiliais];
              }
            } catch (error) {
              console.error('Erro ao buscar almoxarifado selecionado:', error);
            }
          }
          
          setAlmoxarifados(almoxarifadosFiliais);
        } else {
          setAlmoxarifados([]);
        }
      } catch (error) {
        console.error('Erro ao carregar almoxarifados:', error);
        setAlmoxarifados([]);
      } finally {
        setCarregandoAlmoxarifados(false);
      }
    };

    carregarAlmoxarifados();
  }, [filialId, formData.filial_id, formData.almoxarifado_id, isViewMode]);

  // Se não houver filial selecionada, não mostrar a seção
  if (!formData.filial_id && !filialId) {
    return null;
  }

  return (
    <FormSection
      icon={FaTruck}
      title="Dados para Entrega"
      description="Selecione o almoxarifado vinculado à filial para entrega dos produtos da nota fiscal."
    >
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <SearchableSelect
          label="Almoxarifado"
          value={formData.almoxarifado_id || ''}
          onChange={(value) => onChange('almoxarifado_id', value)}
          options={almoxarifados.map(almox => ({
            value: String(almox.id),
            label: `${almox.codigo || ''} - ${almox.nome || ''}`,
            description: almox.centro_custo_nome ? `Centro de Custo: ${almox.centro_custo_nome}` : ''
          }))}
          placeholder={carregandoAlmoxarifados ? 'Carregando almoxarifados...' : 'Selecione o almoxarifado...'}
          disabled={isViewMode || carregandoAlmoxarifados}
          loading={carregandoAlmoxarifados}
          required
        />
        {almoxarifados.length === 0 && !carregandoAlmoxarifados && (formData.filial_id || filialId) && (
          <p className="text-xs text-gray-500 mt-1">
            Nenhum almoxarifado do tipo "filial" encontrado para esta filial
          </p>
        )}
      </div>
    </FormSection>
  );
};

export default DadosParaEntrega;

