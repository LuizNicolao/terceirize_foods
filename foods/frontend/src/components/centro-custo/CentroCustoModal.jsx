import React, { useEffect, useState } from 'react';
import { Modal, Input, Button } from '../ui';
import centroCustoService from '../../services/centroCusto';
import FiliaisService from '../../services/filiais';

const CentroCustoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  centroCusto, 
  isViewMode 
}) => {
  const [codigoGerado, setCodigoGerado] = useState('');
  const [carregandoCodigo, setCarregandoCodigo] = useState(false);
  const [filiais, setFiliais] = useState([]);
  const [carregandoFiliais, setCarregandoFiliais] = useState(false);
  const [filialId, setFilialId] = useState('');

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

  // Carregar próximo código e atualizar filial
  useEffect(() => {
    const carregarProximoCodigo = async () => {
      if (!centroCusto && isOpen) {
        setCarregandoCodigo(true);
        try {
          const response = await centroCustoService.obterProximoCodigo();
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
        // Limpar filial quando criar novo
        setFilialId('');
      } else if (centroCusto) {
        setCodigoGerado(centroCusto.codigo || '');
        // Atualizar filial_id quando centroCusto for carregado
        setFilialId(centroCusto.filial_id ? String(centroCusto.filial_id) : '');
      }
    };

    carregarProximoCodigo();
  }, [centroCusto, isOpen]);

  // Limpar estado quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setFilialId('');
      setCodigoGerado('');
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Centro de Custo' : centroCusto ? 'Editar Centro de Custo' : 'Adicionar Centro de Custo'}
      size="lg"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          nome: formData.get('nome'),
          codigo: codigoGerado || formData.get('codigo'), // Usar o código do state, pois campos disabled não são enviados
          descricao: formData.get('descricao'),
          filial_id: formData.get('filial_id'),
          status: formData.get('status')
        };
        onSubmit(data);
      }} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Nome do Centro de Custo *"
            name="nome"
            defaultValue={centroCusto?.nome}
            disabled={isViewMode}
            required
          />
          <Input
            label="Código *"
            name="codigo"
            value={codigoGerado}
            disabled={true}
            required
            placeholder={carregandoCodigo ? "Carregando..." : "Código gerado automaticamente"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Filial *"
            name="filial_id"
            type="select"
            value={filialId}
            onChange={(e) => setFilialId(e.target.value)}
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
            label="Status"
            name="status"
            type="select"
            defaultValue={centroCusto ? (centroCusto.status === 1 ? '1' : '0') : '1'}
            disabled={isViewMode}
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </Input>
        </div>

        <Input
          label="Descrição"
          name="descricao"
          type="textarea"
          defaultValue={centroCusto?.descricao}
          disabled={isViewMode}
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {!isViewMode && (
            <Button type="submit" variant="primary" size="lg">
              {centroCusto ? 'Atualizar Centro de Custo' : 'Cadastrar Centro de Custo'}
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

export default CentroCustoModal;

