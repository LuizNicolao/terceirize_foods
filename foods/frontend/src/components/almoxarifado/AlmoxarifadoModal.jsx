import React, { useEffect, useState } from 'react';
import { Modal, Input, Button } from '../ui';
import almoxarifadoService from '../../services/almoxarifadoService';
import centroCustoService from '../../services/centroCusto';
import FiliaisService from '../../services/filiais';

const AlmoxarifadoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  almoxarifado, 
  isViewMode 
}) => {
  const [codigoGerado, setCodigoGerado] = useState('');
  const [carregandoCodigo, setCarregandoCodigo] = useState(false);
  const [filiais, setFiliais] = useState([]);
  const [carregandoFiliais, setCarregandoFiliais] = useState(false);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [carregandoCentrosCusto, setCarregandoCentrosCusto] = useState(false);
  const [filialSelecionada, setFilialSelecionada] = useState(almoxarifado?.filial_id || '');

  // Carregar filiais ativas
  useEffect(() => {
    const carregarFiliais = async () => {
      if (isOpen) {
        setCarregandoFiliais(true);
        try {
          const response = await FiliaisService.buscarAtivas();
          if (response.success) {
            setFiliais(response.data || []);
          }
        } catch (error) {
          console.error('Erro ao carregar filiais:', error);
        } finally {
          setCarregandoFiliais(false);
        }
      }
    };

    carregarFiliais();
  }, [isOpen]);

  // Carregar centros de custo quando filial for selecionada
  useEffect(() => {
    const carregarCentrosCusto = async () => {
      if (isOpen && filialSelecionada) {
        setCarregandoCentrosCusto(true);
        try {
          const response = await centroCustoService.buscarAtivos();
          if (response.success) {
            // Filtrar por filial selecionada
            const centrosFiltrados = (response.data || []).filter(
              cc => cc.filial_id === parseInt(filialSelecionada)
            );
            setCentrosCusto(centrosFiltrados);
          }
        } catch (error) {
          console.error('Erro ao carregar centros de custo:', error);
          setCentrosCusto([]);
        } finally {
          setCarregandoCentrosCusto(false);
        }
      } else if (!filialSelecionada) {
        setCentrosCusto([]);
      }
    };

    carregarCentrosCusto();
  }, [filialSelecionada, isOpen]);

  // Carregar próximo código
  useEffect(() => {
    const carregarProximoCodigo = async () => {
      if (!almoxarifado && isOpen) {
        setCarregandoCodigo(true);
        try {
          const response = await almoxarifadoService.obterProximoCodigo();
          if (response.success) {
            setCodigoGerado(response.data.proximoCodigo);
          } else {
            setCodigoGerado('Erro ao gerar código');
          }
        } catch (error) {
          console.error('Erro ao obter próximo código:', error);
          setCodigoGerado('Erro ao gerar código');
        } finally {
          setCarregandoCodigo(false);
        }
      } else if (almoxarifado) {
        setCodigoGerado(almoxarifado.codigo || '');
        setFilialSelecionada(almoxarifado.filial_id || '');
      }
    };

    carregarProximoCodigo();
  }, [almoxarifado, isOpen]);

  // Resetar filial selecionada quando modal fechar ou abrir para novo registro
  useEffect(() => {
    if (!isOpen) {
      setFilialSelecionada('');
      setCentrosCusto([]);
    } else if (almoxarifado) {
      setFilialSelecionada(almoxarifado.filial_id || '');
    } else {
      setFilialSelecionada('');
    }
  }, [isOpen, almoxarifado]);

  const handleFilialChange = (e) => {
    const novaFilial = e.target.value;
    setFilialSelecionada(novaFilial);
    // Limpar centro de custo selecionado quando mudar a filial
    if (e.target.form) {
      const centroCustoField = e.target.form.querySelector('[name="centro_custo_id"]');
      if (centroCustoField) {
        centroCustoField.value = '';
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Almoxarifado' : almoxarifado ? 'Editar Almoxarifado' : 'Adicionar Almoxarifado'}
      size="lg"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          nome: formData.get('nome'),
          codigo: codigoGerado || formData.get('codigo'), // Usar o código do state, pois campos disabled não são enviados
          filial_id: formData.get('filial_id'),
          centro_custo_id: formData.get('centro_custo_id'),
          observacoes: formData.get('observacoes'),
          status: formData.get('status')
        };
        onSubmit(data);
      }} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Filial *"
            name="filial_id"
            type="select"
            defaultValue={almoxarifado?.filial_id || ''}
            disabled={isViewMode || carregandoFiliais}
            required
            onChange={handleFilialChange}
          >
            <option value="">{carregandoFiliais ? 'Carregando...' : 'Selecione uma filial'}</option>
            {filiais.map(filial => (
              <option key={filial.id} value={filial.id}>
                {filial.codigo_filial} - {filial.filial}
              </option>
            ))}
          </Input>

          <Input
            label="Centro de Custo *"
            name="centro_custo_id"
            type="select"
            defaultValue={almoxarifado?.centro_custo_id || ''}
            disabled={isViewMode || !filialSelecionada || carregandoCentrosCusto}
            required
          >
            <option value="">
              {!filialSelecionada 
                ? 'Selecione primeiro uma filial' 
                : carregandoCentrosCusto 
                  ? 'Carregando...' 
                  : 'Selecione um centro de custo'}
            </option>
            {centrosCusto.map(centroCusto => (
              <option key={centroCusto.id} value={centroCusto.id}>
                {centroCusto.codigo} - {centroCusto.nome}
              </option>
            ))}
          </Input>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Código"
            name="codigo"
            value={codigoGerado}
            disabled={true}
            placeholder={carregandoCodigo ? "Carregando..." : "Código gerado automaticamente"}
          />
          <Input
            label="Nome *"
            name="nome"
            defaultValue={almoxarifado?.nome}
            disabled={isViewMode}
            required
            placeholder="Ex: Almox Geral Cozinha"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Status"
            name="status"
            type="select"
            defaultValue={almoxarifado ? (almoxarifado.status === 1 ? '1' : '0') : '1'}
            disabled={isViewMode}
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </Input>
        </div>

        <Input
          label="Observações"
          name="observacoes"
          type="textarea"
          defaultValue={almoxarifado?.observacoes}
          disabled={isViewMode}
          rows={3}
          placeholder="Regras de uso, localização física, etc..."
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {!isViewMode && (
            <Button type="submit" variant="primary" size="lg">
              {almoxarifado ? 'Atualizar Almoxarifado' : 'Salvar'}
            </Button>
          )}
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            {isViewMode ? 'Fechar' : 'Cancelar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AlmoxarifadoModal;

