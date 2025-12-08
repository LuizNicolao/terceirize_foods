import React, { useEffect, useState } from 'react';
import FoodsCentroCustoModal from 'foods-frontend/src/components/centro-custo/CentroCustoModal';
import FoodsApiService from '../../services/FoodsApiService';

/**
 * Adapter para CentroCustoModal do Foods
 * Carrega dados do centro de custo antes de exibir
 */
const CentroCustoModal = ({ isOpen, onClose, centroCusto, isViewMode }) => {
  const [centroCustoData, setCentroCustoData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarCentroCusto = async () => {
      if (isOpen && centroCusto) {
        setLoading(true);
        try {
          // Se centroCusto já é um objeto completo, usar diretamente
          if (centroCusto.id && centroCusto.nome) {
            setCentroCustoData(centroCusto);
          } else {
            // Se for apenas um ID, buscar do backend
            const result = await FoodsApiService.getCentroCustoById(centroCusto.id || centroCusto);
            if (result.success) {
              setCentroCustoData(result.data);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar centro de custo:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    carregarCentroCusto();
  }, [isOpen, centroCusto]);

  if (!isOpen) return null;

  return (
    <FoodsCentroCustoModal
      isOpen={isOpen}
      onClose={onClose}
      centroCusto={centroCustoData}
      isViewMode={isViewMode}
    />
  );
};

export default CentroCustoModal;

