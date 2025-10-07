import React from 'react';
import { ConsultaActions } from '../../../components/shared';

const ProdutosPerCapitaActions = ({ onExportXLSX, onExportPDF, totalItems = 0, loading = false }) => {
  return (
    <ConsultaActions
      onExportXLSX={onExportXLSX}
      onExportPDF={onExportPDF}
      totalItems={totalItems}
      loading={loading}
    />
  );
};

export default ProdutosPerCapitaActions;
