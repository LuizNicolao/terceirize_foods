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

      return webpackConfig;
    }
  }
};
