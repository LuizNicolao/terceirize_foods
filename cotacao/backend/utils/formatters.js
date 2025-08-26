// Formatação de tempo relativo
const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const timeDiff = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60));
  
  if (timeDiff < 1) {
    return 'Agora mesmo';
  } else if (timeDiff < 24) {
    return `${timeDiff} horas atrás`;
  } else {
    const days = Math.floor(timeDiff / 24);
    return `${days} dia${days > 1 ? 's' : ''} atrás`;
  }
};

module.exports = {
  formatRelativeTime
};
