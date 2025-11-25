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
  const [filialSelecionada, setFilialSelecionada] = useState('');
  const [centroCustoId, setCentroCustoId] = useState('');

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
            // Filtrar por filial selecionada (comparar como string para garantir compatibilidade)
            const filialIdNum = parseInt(filialSelecionada);
            const centrosFiltrados = (response.data || []).filter(
              cc => String(cc.filial_id) === String(filialSelecionada) || cc.filial_id === filialIdNum
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

  // Carregar próximo código e atualizar estados quando almoxarifado mudar
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
        // Limpar estados quando criar novo
        setFilialSelecionada('');
        setCentroCustoId('');
      } else if (almoxarifado) {
        setCodigoGerado(almoxarifado.codigo || '');
        // Atualizar filial e centro de custo quando almoxarifado for carregado
        const filialId = almoxarifado.filial_id ? String(almoxarifado.filial_id) : '';
        const centroCustoIdValue = almoxarifado.centro_custo_id ? String(almoxarifado.centro_custo_id) : '';
        setFilialSelecionada(filialId);
        setCentroCustoId(centroCustoIdValue);
      }
    };

    carregarProximoCodigo();
  }, [almoxarifado, isOpen]);

  // Limpar estados quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setFilialSelecionada('');
      setCentroCustoId('');
      setCentrosCusto([]);
    }
  }, [isOpen]);

  const handleFilialChange = (e) => {
    const novaFilial = e.target.value;
    setFilialSelecionada(novaFilial);
    // Limpar centro de custo selecionado quando mudar a filial
    setCentroCustoId('');
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
            value={filialSelecionada}
            onChange={handleFilialChange}
            disabled={isViewMode || carregandoFiliais}
            required
          >
            <option value="">{carregandoFiliais ? 'Carregando...' : 'Selecione uma filial'}</option>
            {filiais.map(filial => (
              <option key={filial.id} value={String(filial.id)}>
                {filial.codigo_filial} - {filial.filial}
              </option>
            ))}
          </Input>

          <Input
            label="Centro de Custo *"
            name="centro_custo_id"
            type="select"
            value={centroCustoId}
            onChange={(e) => setCentroCustoId(e.target.value)}
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
              <option key={centroCusto.id} value={String(centroCusto.id)}>
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

