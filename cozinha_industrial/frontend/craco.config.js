const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Encontrar a regra do babel-loader
      const babelLoaderRule = webpackConfig.module.rules.find(
        (rule) => rule.oneOf
      );

      if (babelLoaderRule) {
        const babelLoader = babelLoaderRule.oneOf.find(
          (rule) => rule.loader && rule.loader.includes('babel-loader')
        );

        if (babelLoader) {
          // Adicionar o diretório do Foods para ser processado pelo babel
          babelLoader.include = [
            babelLoader.include,
            path.resolve(__dirname, '../../foods/frontend/src')
          ];
        }
      }

      // Configurar resolve
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }

      // Configurar modules para priorizar node_modules do cozinha_industrial
      if (!webpackConfig.resolve.modules) {
        webpackConfig.resolve.modules = ['node_modules', path.resolve(__dirname, 'node_modules')];
      } else {
        // Garantir que node_modules do cozinha_industrial seja o primeiro
        const cozinhaIndustrialNodeModules = path.resolve(__dirname, 'node_modules');
        if (!webpackConfig.resolve.modules.includes(cozinhaIndustrialNodeModules)) {
          webpackConfig.resolve.modules.unshift(cozinhaIndustrialNodeModules);
        }
      }

      // Adicionar alias para foods-frontend
      if (!webpackConfig.resolve.alias) {
        webpackConfig.resolve.alias = {};
      }
      webpackConfig.resolve.alias['foods-frontend'] = path.resolve(__dirname, '../../foods/frontend');

      // Garantir que React e React-DOM sejam singletons (resolvidos uma única vez)
      // Isso evita o erro "Cannot read properties of null (reading 'useState')"
      // FORÇAR que todos os imports de React venham do node_modules do cozinha_industrial
      const reactPath = path.resolve(__dirname, 'node_modules/react');
      const reactDomPath = path.resolve(__dirname, 'node_modules/react-dom');
      webpackConfig.resolve.alias['react'] = reactPath;
      webpackConfig.resolve.alias['react-dom'] = reactDomPath;

      // Remover ModuleScopePlugin para permitir importações de fora de src/
      const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
      const plugins = webpackConfig.resolve.plugins || [];
      webpackConfig.resolve.plugins = plugins.filter(
        plugin => !(plugin instanceof ModuleScopePlugin)
      );

      return webpackConfig;
    }
  }
};

