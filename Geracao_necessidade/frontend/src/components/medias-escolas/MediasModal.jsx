import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import TabelaMedias from './TabelaMedias';

const MediasModal = ({ 
  isOpen, 
  onClose, 
  escola,
  mediasExistentes = null,
  onSave,
  escolas = [],
  viewMode = false
}) => {
  const [medias, setMedias] = useState({
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
  const [saving, setSaving] = useState(false);
  const [selectedEscolaId, setSelectedEscolaId] = useState('');

  useEffect(() => {
    if (mediasExistentes) {
      setMedias(mediasExistentes);
    } else {
      // Reset para valores padrão
      setMedias({
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
    
    // Reset seleção de escola
    if (escola) {
      setSelectedEscolaId(escola.id);
    } else {
      setSelectedEscolaId('');
    }
  }, [mediasExistentes, isOpen, escola]);

  const handleMediasChange = (tipoMedia, periodo, value) => {
    const fieldName = `${tipoMedia}_${periodo}`;
    setMedias(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      if (!selectedEscolaId) {
        alert('Por favor, selecione uma escola');
        setSaving(false);
        return;
      }

      const escolaSelecionada = escolas.find(e => e.id === parseInt(selectedEscolaId));
      const dados = {
        escola_id: selectedEscolaId,
        nome_escola: escolaSelecionada?.nome_escola,
        rota: escolaSelecionada?.rota,
        ...medias
      };

      await onSave(dados);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar médias:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setMedias({
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
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {mediasExistentes ? 'Editar Médias' : 'Cadastrar Médias'}
          </h3>
          {escola && (
            <p className="text-sm text-gray-600">
              {escola.nome_escola} - {escola.rota}
            </p>
          )}
        </div>
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Seleção de Escola */}
        {!escola && !viewMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Escola
            </label>
            <select
              value={selectedEscolaId}
              onChange={(e) => setSelectedEscolaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="">Selecione uma escola...</option>
              {escolas.map((escola) => (
                <option key={escola.id} value={escola.id}>
                  {escola.nome_escola} - {escola.rota}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabela de Médias */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Tabela de Médias
          </h4>
          <TabelaMedias
            medias={medias}
            onMediasChange={handleMediasChange}
            readOnly={viewMode}
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between">
          {!viewMode && (
            <Button
              onClick={handleClear}
              variant="secondary"
              size="sm"
            >
              Limpar
            </Button>
          )}
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              {viewMode ? 'Fechar' : 'Cancelar'}
            </Button>
            {!viewMode && (
              <Button
                onClick={handleSave}
                variant="primary"
                loading={saving}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Médias'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MediasModal;
