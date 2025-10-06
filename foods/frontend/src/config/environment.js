/**
 * Configurações de ambiente para desenvolvimento e produção
 */

const config = {
  development: {
    foodsUrl: 'http://localhost:3000/foods',
    cotacaoUrl: 'http://localhost:3002/cotacao',
    cozinhaUrl: 'http://localhost:3003/cozinha_industrial',
    implantacaoUrl: 'http://localhost:3004/implantacao',
    apiUrl: 'http://localhost:3001/api',
    baseUrl: 'http://localhost:3000'
  },
  production: {
    foodsUrl: 'https://foods.terceirizemais.com.br/foods',
    cotacaoUrl: 'https://foods.terceirizemais.com.br/cotacao',
    cozinhaUrl: 'https://foods.terceirizemais.com.br/cozinha_industrial',
    implantacaoUrl: 'https://foods.terceirizemais.com.br/implantacao',
    apiUrl: 'https://foods.terceirizemais.com.br/foods/api',
    baseUrl: 'https://foods.terceirizemais.com.br'
  }
};

// Determinar ambiente baseado na URL atual
const getEnvironment = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  return 'production';
};

const environment = getEnvironment();
const currentConfig = config[environment];

export default currentConfig;
