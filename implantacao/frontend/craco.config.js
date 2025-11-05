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

      // Adicionar alias para foods-frontend
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }
      if (!webpackConfig.resolve.alias) {
        webpackConfig.resolve.alias = {};
      }
      webpackConfig.resolve.alias['foods-frontend'] = path.resolve(__dirname, '../../foods/frontend');

      // Permitir importações fora de src/ para o diretório foods
      if (!webpackConfig.resolve.fallback) {
        webpackConfig.resolve.fallback = {};
      }

      // Adicionar symlink resolver para permitir importações de fora de src/
      const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
      const originalResolve = webpackConfig.resolve;
      webpackConfig.resolve = {
        ...originalResolve,
        plugins: originalResolve.plugins?.filter(
          plugin => !(plugin instanceof ModuleScopePlugin)
        ) || []
      };

      return webpackConfig;
    }
  }
};
