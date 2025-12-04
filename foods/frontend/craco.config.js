const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Configurar resolve para ignorar exports restritivos do package.json
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }

      // Priorizar campos tradicionais antes de exports - ignora exports problemáticos
      // Isso resolve problemas com ckeditor5, react-query, react-dom e outros pacotes
      // Usa 'main' e 'module' primeiro, só depois tenta 'exports' se necessário
      // COMENTADO TEMPORARIAMENTE PARA TESTE
      // webpackConfig.resolve.exportsFields = ['main', 'module', 'browser'];

      // Configurar conditionNames para ser mais permissivo
      if (!webpackConfig.resolve.conditionNames) {
        webpackConfig.resolve.conditionNames = ['require', 'node', 'default'];
      }

      // Configurar extensions para incluir .js automaticamente
      // Isso resolve problemas com módulos ESM que precisam de extensões explícitas
      if (!webpackConfig.resolve.extensions) {
        webpackConfig.resolve.extensions = ['.js', '.jsx', '.json', '.ts', '.tsx'];
      } else {
        // Garantir que .js está presente
        if (!webpackConfig.resolve.extensions.includes('.js')) {
          webpackConfig.resolve.extensions.unshift('.js');
        }
      }

      // Configurar fullySpecified para false - permite resolução sem extensão
      // COMENTADO TEMPORARIAMENTE PARA TESTE
      // webpackConfig.resolve.fullySpecified = false;

      // Adicionar alias para ckeditor5 e react-dom/client
      if (!webpackConfig.resolve.alias) {
        webpackConfig.resolve.alias = {};
      }
      
      // Alias para react-dom/client apontando para o arquivo correto
      webpackConfig.resolve.alias['react-dom/client'] = path.resolve(__dirname, 'node_modules/react-dom/client.js');
      
      // Alias para react/jsx-runtime e react/jsx-dev-runtime
      webpackConfig.resolve.alias['react/jsx-runtime'] = path.resolve(__dirname, 'node_modules/react/jsx-runtime.js');
      webpackConfig.resolve.alias['react/jsx-dev-runtime'] = path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js');
      
      // COMENTADO TEMPORARIAMENTE - relacionado ao CKEditor que está desabilitado
      // // Alias para es-toolkit/compat para resolver problemas com CKEditor 5 emoji
      // webpackConfig.resolve.alias['es-toolkit/compat'] = path.resolve(__dirname, 'node_modules/es-toolkit/compat.js');
      
      // // Alias para vanilla-colorful/lib/entrypoints/hex para resolver problemas com CKEditor 5 UI
      // webpackConfig.resolve.alias['vanilla-colorful/lib/entrypoints/hex'] = path.resolve(__dirname, 'node_modules/vanilla-colorful/lib/entrypoints/hex.js');

      // Remover ModuleScopePlugin para permitir importações de node_modules
      // Isso é necessário para os aliases funcionarem corretamente
      const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
      const plugins = webpackConfig.resolve.plugins || [];
      webpackConfig.resolve.plugins = plugins.filter(
        plugin => !(plugin instanceof ModuleScopePlugin)
      );

      // Configurar fullySpecified nas regras do webpack para módulos ESM
      // Isso permite resolver imports sem extensões em módulos ESM
      // COMENTADO TEMPORARIAMENTE PARA TESTE
      // if (webpackConfig.module && webpackConfig.module.rules) {
      //   webpackConfig.module.rules.forEach(rule => {
      //     if (rule.oneOf) {
      //       rule.oneOf.forEach(oneOfRule => {
      //         if (oneOfRule.resolve) {
      //           oneOfRule.resolve.fullySpecified = false;
      //         } else if (oneOfRule.use) {
      //           oneOfRule.use.forEach(useItem => {
      //             if (useItem && useItem.options && useItem.options.resolve) {
      //               useItem.options.resolve.fullySpecified = false;
      //             }
      //           });
      //         }
      //       });
      //     } else if (rule.resolve) {
      //       rule.resolve.fullySpecified = false;
      //     }
      //   });
      // }

      return webpackConfig;
    }
  }
};

