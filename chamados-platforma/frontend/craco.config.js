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
          babelLoader.include = [
            babelLoader.include,
          ];
        }
      }

      // Configurar resolve
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }

      const chamadosNodeModules = path.resolve(__dirname, 'node_modules');
      
      if (!webpackConfig.resolve.modules) {
        webpackConfig.resolve.modules = [
          'node_modules',
          chamadosNodeModules
        ];
      } else {
        if (!webpackConfig.resolve.modules.includes(chamadosNodeModules)) {
          webpackConfig.resolve.modules.unshift(chamadosNodeModules);
        }
      }

      // Garantir que React e React-DOM sejam singletons
      const reactPath = path.resolve(__dirname, 'node_modules/react');
      const reactDomPath = path.resolve(__dirname, 'node_modules/react-dom');
      webpackConfig.resolve.alias['react'] = reactPath;
      webpackConfig.resolve.alias['react-dom'] = reactDomPath;

      // Remover ModuleScopePlugin
      const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
      const plugins = webpackConfig.resolve.plugins || [];
      webpackConfig.resolve.plugins = plugins.filter(
        plugin => !(plugin instanceof ModuleScopePlugin)
      );

      return webpackConfig;
    }
  }
};

