import React, { useEffect, useRef, useState } from 'react';

// Fila global de inicialização para garantir que apenas uma instância seja criada por vez
if (!window.CKEDITOR_INIT_QUEUE) {
  window.CKEDITOR_INIT_QUEUE = {
    isInitializing: false,
    queue: [],
    processQueue: async () => {
      if (window.CKEDITOR_INIT_QUEUE.isInitializing || window.CKEDITOR_INIT_QUEUE.queue.length === 0) {
        return;
      }
      
      window.CKEDITOR_INIT_QUEUE.isInitializing = true;
      
      // Aguardar que todas as instâncias existentes estejam prontas
      if (window.CKEDITOR && window.CKEDITOR.instances) {
        const allInstances = Object.values(window.CKEDITOR.instances);
        const unloadedInstances = allInstances.filter(inst => inst && inst.status === 'unloaded');
        
        if (unloadedInstances.length > 0) {
          // Aguardar até que todas estejam carregadas
          let waitCount = 0;
          const maxWait = 100; // 10 segundos
          while (unloadedInstances.some(inst => inst && inst.status === 'unloaded') && waitCount < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
          }
          
          // Aguardar mais um pouco para garantir que está completamente pronto
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Processar próximo item da fila
      const nextInit = window.CKEDITOR_INIT_QUEUE.queue.shift();
      if (nextInit) {
        try {
          await nextInit();
        } catch (e) {
          console.error('[DEBUG CKEditor] Erro na fila de inicialização:', e);
        }
      }
      
      window.CKEDITOR_INIT_QUEUE.isInitializing = false;
      
      // Processar próximo item se houver
      if (window.CKEDITOR_INIT_QUEUE.queue.length > 0) {
        setTimeout(() => window.CKEDITOR_INIT_QUEUE.processQueue(), 100);
      }
    }
  };
}

/**
 * Componente wrapper para CKEditor 4
 * 
 * @param {Object} props
 * @param {string} props.value - Valor inicial do editor
 * @param {Function} props.onChange - Callback quando o conteúdo muda
 * @param {string} props.name - Nome do campo (para formulários)
 * @param {boolean} props.disabled - Desabilita o editor
 * @param {string} props.className - Classes CSS adicionais
 * @param {number} props.height - Altura do editor em pixels
 * @param {Object} props.config - Configurações adicionais do CKEditor
 */
const CKEditor = ({ 
  value = '', 
  onChange, 
  name,
  disabled = false,
  className = '',
  height = 400,
  config = {}
}) => {
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const containerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Carregar script do CKEditor dinamicamente
  useEffect(() => {
    // Se já está carregado, marcar como carregado
    if (typeof window.CKEDITOR !== 'undefined') {
      setScriptLoaded(true);
      return;
    }

    // Verificar se o script já está sendo carregado
    const existingScript = document.querySelector('script[src*="ckeditor.js"]');
    if (existingScript) {
      existingScript.onload = () => setScriptLoaded(true);
      existingScript.onerror = () => console.error('Erro ao carregar CKEditor');
      return;
    }

    // Função para verificar se um arquivo existe via fetch
    const checkFileExists = async (url) => {
      try {
        // Tentar HEAD primeiro
        const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          // Aceitar javascript ou text/javascript ou application/javascript
          return contentType?.includes('javascript') || contentType?.includes('text/plain');
        }
        // Se HEAD falhar, tentar GET (alguns servidores não suportam HEAD)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const getResponse = await fetch(url, { method: 'GET', cache: 'no-cache', signal: controller.signal });
        clearTimeout(timeout);
        if (getResponse.ok) {
          const contentType = getResponse.headers.get('content-type');
          // Verificar se é JavaScript (mesmo que venha como text/plain)
          const text = await getResponse.text();
          // Verificar se começa com código JavaScript válido (não HTML)
          return !text.trim().startsWith('<') && (contentType?.includes('javascript') || text.includes('CKEDITOR') || text.includes('function'));
        }
        return false;
      } catch (error) {
        // Se falhar, assumir que não existe (mas não é crítico)
        console.warn(`Verificação de ${url} falhou:`, error.message);
        return false;
      }
    };
    
    // Função para carregar o script quando encontrar o caminho correto
    const loadCKEditorScript = async (basePath) => {
      // Baseado no padrão usado no sistema (logo usa /foods/logo-small.png)
      const possiblePaths = [
        `${basePath}/ckeditor/ckeditor.js`,  // /foods/ckeditor/ckeditor.js
        `/foods/ckeditor/ckeditor.js`,      // Forçar /foods mesmo se basePath estiver vazio
        `/ckeditor/ckeditor.js`,            // Raiz
        `${window.location.origin}${basePath}/ckeditor/ckeditor.js`,
        `${window.location.origin}/foods/ckeditor/ckeditor.js`,
        `${window.location.origin}/ckeditor/ckeditor.js`
      ];
      
      // Verificar cada caminho até encontrar um válido
      for (let i = 0; i < possiblePaths.length; i++) {
        const path = possiblePaths[i];
        console.log(`🔍 Verificando: ${path}`);
        
        const exists = await checkFileExists(path);
        if (exists) {
          console.log(`✅ Arquivo encontrado em: ${path}`);
          
          // Definir CKEDITOR_BASEPATH antes de carregar
          const detectedBasePath = path.includes('/foods') ? '/foods' : '';
          window.CKEDITOR_BASEPATH = `${detectedBasePath}/ckeditor/`;
          
          // Carregar o script
          const script = document.createElement('script');
          script.src = path;
          script.async = true;
          
          script.onload = () => {
            setTimeout(() => {
              if (typeof window.CKEDITOR !== 'undefined') {
                window.CKEDITOR.basePath = window.CKEDITOR_BASEPATH;
                const configScript = document.createElement('script');
                configScript.src = `${detectedBasePath}/ckeditor/config.js`;
                configScript.onerror = () => {
                  console.warn('config.js não encontrado, usando padrão');
                };
                document.head.appendChild(configScript);
                setScriptLoaded(true);
              } else {
                console.error('CKEditor não inicializado após carregar');
              }
            }, 100);
          };
          
          script.onerror = () => {
            console.error(`❌ Erro ao executar script de: ${path}`);
            if (i < possiblePaths.length - 1) {
              loadCKEditorScript(basePath); // Tentar próximo
            }
          };
          
          document.head.appendChild(script);
          return; // Sair quando encontrar
        }
      }
      
      // Se nenhum caminho funcionou, tentar carregar mesmo assim (pode ser problema de CORS na verificação)
      console.warn('⚠️ Verificação falhou, tentando carregar mesmo assim...');
      const fallbackPath = `/foods/ckeditor/ckeditor.js`;
      console.log(`🔄 Tentando carregar direto de: ${fallbackPath}`);
      
      window.CKEDITOR_BASEPATH = `/foods/ckeditor/`;
      const script = document.createElement('script');
      script.src = fallbackPath;
      script.async = true;
      
      script.onload = () => {
        setTimeout(() => {
          if (typeof window.CKEDITOR !== 'undefined') {
            window.CKEDITOR.basePath = window.CKEDITOR_BASEPATH;
            const configScript = document.createElement('script');
            configScript.src = `/foods/ckeditor/config.js`;
            configScript.onerror = () => {
              console.warn('config.js não encontrado, usando padrão');
            };
            document.head.appendChild(configScript);
            setScriptLoaded(true);
            console.log('✅ CKEditor carregado com sucesso!');
          } else {
            console.error('❌ CKEditor não encontrado em nenhum dos caminhos:', possiblePaths);
            console.error('💡 SOLUÇÃO: Faça rebuild do frontend no servidor:');
            console.error('   1. cd foods/frontend');
            console.error('   2. npm run build');
            console.error('   3. Reinicie o container/servidor');
          }
        }, 100);
      };
      
      script.onerror = () => {
        console.error('❌ CKEditor não encontrado em nenhum dos caminhos:', possiblePaths);
        console.error('💡 SOLUÇÃO: Os arquivos do CKEditor precisam estar no build.');
        console.error('   Execute no servidor:');
        console.error('   1. cd ~/terceirize_foods/foods/frontend');
        console.error('   2. git pull origin main');
        console.error('   3. npm run build');
        console.error('   4. Reinicie o container Docker (ou servidor)');
      };
      
      document.head.appendChild(script);
    };
    
    // Detectar caminho base
    const getBasePath = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/foods')) {
        return '/foods';
      }
      return '';
    };
    
    const basePath = getBasePath();
    loadCKEditorScript(basePath);
  }, []);

  useEffect(() => {
    // Aguardar o script carregar
    if (!scriptLoaded || typeof window.CKEDITOR === 'undefined') {
      return;
    }

    // Se o editor já existe, não recriar
    if (editorInstanceRef.current) {
      return;
    }

    // Usar requestAnimationFrame para garantir que o DOM está pronto
    const initEditor = () => {
      // Aguardar um frame adicional para garantir que o container está pronto
      requestAnimationFrame(() => {
        // Criar elemento textarea para o editor
        if (!editorRef.current && containerRef.current) {
          // Verificar se o container está realmente no DOM
          if (!document.contains(containerRef.current)) {
            return;
          }

          const textarea = document.createElement('textarea');
          textarea.name = name || 'ckeditor';
          textarea.id = `ckeditor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Adicionar atributos necessários para o CKEditor
          textarea.setAttribute('data-ckeditor', 'true');
          
          // Adicionar ao DOM
          containerRef.current.appendChild(textarea);
          editorRef.current = textarea;
          
          // Aguardar um frame adicional após adicionar ao DOM
          requestAnimationFrame(() => {
            continueInit();
          });
        } else {
          continueInit();
        }
      });
    };

    const continueInit = () => {

      if (!editorRef.current || !containerRef.current || !editorRef.current.parentNode) {
        return;
      }

      // Verificar se o elemento está realmente no DOM
      if (!document.contains(editorRef.current)) {
        return;
      }

      // Verificar se já existe uma instância do CKEditor para este elemento
      if (editorRef.current && window.CKEDITOR && window.CKEDITOR.instances) {
        const existingInstance = window.CKEDITOR.instances[editorRef.current.id || editorRef.current.name];
        if (existingInstance) {
          try {
            existingInstance.destroy();
          } catch (e) {
            console.warn('Erro ao destruir instância existente:', e);
          }
        }
      }

      // Aguardar um pouco mais para garantir que o elemento está completamente no DOM
      setTimeout(async () => {
        if (!editorRef.current || !containerRef.current || !document.contains(editorRef.current)) {
          return;
        }

        // Verificações adicionais para garantir que o elemento está pronto
        if (!editorRef.current.parentNode || !editorRef.current.ownerDocument) {
          return;
        }

        // Verificar se o CKEditor está completamente carregado
        if (!window.CKEDITOR || typeof window.CKEDITOR.replace !== 'function') {
          console.warn('CKEditor não está completamente carregado');
          return;
        }

        // Aguardar mais um frame para garantir que o DOM está completamente renderizado
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Aguardar um pouco mais para garantir que o elemento está completamente pronto
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verificações finais antes de inicializar
        const element = editorRef.current;
        if (!element || !element.parentNode || !document.contains(element)) {
          return;
        }

        // Verificar se o elemento ainda está no DOM após os delays
        if (!document.body.contains(element)) {
          console.warn('Elemento não está mais no body do documento');
          return;
        }

        // Inicializar CKEditor
        const editorConfig = {
          language: 'pt-br',
          height,
          ...config
        };

        try {

          // Garantir que o elemento tem um ID válido
          if (!element.id) {
            element.id = `ckeditor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }

          // Usar fila de inicialização para garantir que apenas uma instância seja criada por vez
          const initPromise = new Promise((resolve, reject) => {
            const initFunction = async () => {
              try {
                // Verificar e destruir TODAS as instâncias antigas que possam estar órfãs
                if (window.CKEDITOR && window.CKEDITOR.instances) {
                  // Limpar instâncias órfãs que apontam para elementos que não existem mais
                  Object.keys(window.CKEDITOR.instances).forEach(instanceId => {
                    try {
                      const instance = window.CKEDITOR.instances[instanceId];
                      if (instance && instance.element) {
                        // Verificar se o elemento da instância ainda está no DOM
                        try {
                          if (!document.contains(instance.element.$ || instance.element)) {
                            try {
                              if (instance.status !== 'destroyed') {
                                instance.destroy();
                              }
                            } catch (e) {
                              // Se falhar, remover do registro
                              delete window.CKEDITOR.instances[instanceId];
                            }
                          }
                        } catch (e) {
                          // Se não conseguir verificar, tentar remover do registro
                          try {
                            delete window.CKEDITOR.instances[instanceId];
                          } catch (e2) {
                            // Ignorar
                          }
                        }
                      }
                    } catch (e) {
                      // Se houver erro ao verificar, tentar remover do registro
                      try {
                        delete window.CKEDITOR.instances[instanceId];
                      } catch (e2) {
                        // Ignorar se já foi removido
                      }
                    }
                  });
                }
            
                // Destruir instância com o mesmo ID se existir (com force: true para limpeza completa)
                if (element.id && window.CKEDITOR.instances[element.id]) {
                  try {
                    const oldInstance = window.CKEDITOR.instances[element.id];
                    // Verificar se a instância ainda está válida antes de destruir
                    if (oldInstance && oldInstance.status !== 'destroyed') {
                      // Usar destroy(true) para forçar limpeza completa
                      oldInstance.destroy(true);
                      await new Promise(resolve => setTimeout(resolve, 300));
                      // Forçar remoção do registro também
                      delete window.CKEDITOR.instances[element.id];
                    }
                  } catch (e) {
                    console.warn('[DEBUG CKEditor] Erro ao destruir instância existente:', e);
                    // Forçar remoção da instância do registro se destruir falhou
                    try {
                      delete window.CKEDITOR.instances[element.id];
                    } catch (e2) {
                      console.warn('[DEBUG CKEditor] Erro ao remover instância do registro:', e2);
                    }
                  }
                }
                
                // Verificar se há outras instâncias que apontam para este elemento (por comparação de elemento)
                if (window.CKEDITOR && window.CKEDITOR.instances) {
                  Object.keys(window.CKEDITOR.instances).forEach(instanceId => {
                    try {
                      const inst = window.CKEDITOR.instances[instanceId];
                      if (inst && inst.element) {
                        // Verificar se o elemento da instância é o mesmo que estamos tentando usar
                        const instElement = inst.element.$ || inst.element;
                        if (instElement === element || instElement === element.$) {
                          console.warn('[DEBUG CKEditor] Encontrada instância que aponta para este elemento, destruindo...');
                          try {
                            if (inst.status !== 'destroyed') {
                              inst.destroy(true);
                            }
                            delete window.CKEDITOR.instances[instanceId];
                          } catch (e) {
                            console.warn('[DEBUG CKEditor] Erro ao destruir instância conflitante:', e);
                            delete window.CKEDITOR.instances[instanceId];
                          }
                        }
                      }
                    } catch (e) {
                      // Ignorar erros ao verificar
                    }
                  });
                  // Aguardar um pouco após limpeza
                  await new Promise(resolve => setTimeout(resolve, 200));
                }
          
                // Limpar qualquer dado do CKEditor associado ao elemento antes de criar nova instância
                // NÃO usar CKEDITOR.dom.element aqui pois pode causar o erro 'equals'
                try {
                  // Remover atributos de dados do CKEditor
                  if (element.getAttribute) {
                    element.removeAttribute('data-cke-instance');
                    element.removeAttribute('data-cke');
                  }
                  // Limpar propriedades customizadas que o CKEditor possa ter adicionado
                  if (element.$) {
                    try {
                      delete element.$;
                    } catch (e) {
                      // Ignorar se não puder deletar
                    }
                  }
                  // Limpar propriedades que o CKEditor pode ter adicionado diretamente
                  const propsToRemove = ['$', 'getEditor', 'ckeditorInstance'];
                  propsToRemove.forEach(prop => {
                    try {
                      if (element[prop] !== undefined) {
                        delete element[prop];
                      }
                    } catch (e) {
                      // Ignorar
                    }
                  });
                } catch (e) {
                  console.warn('[DEBUG CKEditor] Erro ao limpar dados do CKEditor do elemento:', e);
                }

                // Verificações finais antes de inicializar
                // Verificar se o elemento ainda está no DOM e se tem todos os métodos necessários
                if (!element || !element.parentNode || !document.contains(element)) {
                  throw new Error('Elemento não está mais no DOM antes de inicializar');
                }

                // Verificar se o elemento tem ownerDocument
                if (!element.ownerDocument || !element.ownerDocument.defaultView) {
                  throw new Error('Elemento não tem ownerDocument válido');
                }

                // Garantir que o elemento está realmente visível/atachado ao DOM
                try {
                  // Tentar acessar offsetParent para garantir que está no layout
                  const test = element.offsetParent;
                } catch (e) {
                  throw new Error('Elemento não está pronto para inicialização');
                }

                // Verificar uma última vez que o elemento ainda está no DOM e válido
                if (!element || !document.contains(element)) {
                  throw new Error('Elemento não está mais no DOM antes de replace');
                }
                
                // Verificar que o elemento não está sendo usado por outra instância
                if (window.CKEDITOR && window.CKEDITOR.dom) {
                  try {
                    // Tentar obter editor do elemento (sem criar novo CKEDITOR.dom.element que causa erro)
                    // Verificar diretamente nas instâncias
                    const conflictingInstance = Object.values(window.CKEDITOR.instances || {}).find(inst => {
                      if (!inst || !inst.element) return false;
                      try {
                        const instElement = inst.element.$ || inst.element;
                        return instElement === element && inst.status !== 'destroyed';
                      } catch (e) {
                        return false;
                      }
                    });
                    
                    if (conflictingInstance) {
                      console.warn('[DEBUG CKEditor] Conflito detectado, destruindo instância conflitante...');
                      try {
                        conflictingInstance.destroy(true);
                        delete window.CKEDITOR.instances[conflictingInstance.id];
                        await new Promise(resolve => setTimeout(resolve, 200));
                      } catch (e) {
                        console.warn('[DEBUG CKEditor] Erro ao destruir instância conflitante:', e);
                        if (conflictingInstance.id) {
                          delete window.CKEDITOR.instances[conflictingInstance.id];
                        }
                      }
                    }
                  } catch (e) {
                    // Ignorar - pode ser que o elemento não tenha editor ainda
                  }
                }
                
                // Verificar novamente que o elemento ainda está no DOM
                if (!element || !document.contains(element)) {
                  throw new Error('Elemento foi removido do DOM durante limpeza');
                }
                
                // Tentar criar diretamente
                editorInstanceRef.current = window.CKEDITOR.replace(element, editorConfig);
                console.log('[DEBUG CKEditor] CKEditor inicializado com sucesso:', {
                  instanceId: editorInstanceRef.current?.id,
                  instanceName: editorInstanceRef.current?.name,
                  status: editorInstanceRef.current?.status
                });
                
                // Verificar se a instância foi criada corretamente
                if (!editorInstanceRef.current) {
                  throw new Error('Falha ao criar instância do CKEditor');
                }
                
                resolve();
              } catch (error) {
                console.error('[DEBUG CKEditor] Erro na inicialização:', error);
                reject(error);
              }
            };
            
            // Adicionar à fila
            window.CKEDITOR_INIT_QUEUE.queue.push(initFunction);
            window.CKEDITOR_INIT_QUEUE.processQueue();
          });
          
          // Aguardar conclusão
          try {
            await initPromise;
          } catch (error) {
            console.error('[DEBUG CKEditor] Erro ao inicializar CKEditor:', error);
            console.error('[DEBUG CKEditor] Stack trace:', error.stack);
            console.error('[DEBUG CKEditor] Estado do elemento no erro:', {
              element: !!element,
              elementId: element?.id,
              inDocument: element ? document.contains(element) : false,
              ckeditorInstances: window.CKEDITOR?.instances ? Object.keys(window.CKEDITOR.instances) : []
            });
            // Limpar referência se houver erro
            editorInstanceRef.current = null;
            // Tentar novamente após um pequeno delay apenas se o elemento ainda estiver válido
            setTimeout(() => {
              if (element && document.contains(element) && !editorInstanceRef.current) {
                try {
                  // Verificar novamente se não há instância antes de tentar
                  if (!element.id || !window.CKEDITOR.instances[element.id]) {
                    console.log('[DEBUG CKEditor] Tentando reinicializar após erro...');
                    editorInstanceRef.current = window.CKEDITOR.replace(element, editorConfig);
                    console.log('[DEBUG CKEditor] Reinicialização bem-sucedida');
                  } else {
                    console.warn('[DEBUG CKEditor] Não reinicializou: já existe instância para', element.id);
                  }
                } catch (retryError) {
                  console.error('[DEBUG CKEditor] Erro ao tentar novamente inicializar CKEditor:', retryError);
                  console.error('[DEBUG CKEditor] Stack trace (retry):', retryError.stack);
                  editorInstanceRef.current = null;
                }
              } else {
                console.warn('[DEBUG CKEditor] Não reinicializou: elemento inválido ou instância já existe');
              }
            }, 200);
            return;
          }

            // Configurar evento de mudança
            if (onChange && editorInstanceRef.current) {
              editorInstanceRef.current.on('change', () => {
                if (editorInstanceRef.current) {
                  const data = editorInstanceRef.current.getData();
                  onChange({
                    target: {
                      name: name || 'ckeditor',
                      value: data
                    }
                  });
                }
              });

              editorInstanceRef.current.on('instanceReady', () => {
                // Aguardar um pouco para garantir que o editor está completamente pronto
                setTimeout(() => {
                  if (editorInstanceRef.current && editorInstanceRef.current.status !== 'destroyed') {
                    try {
                      // Definir valor inicial (sempre, mesmo se vazio, para garantir sincronização)
                      const valueToSet = value || '';
                      const currentData = editorInstanceRef.current.getData() || '';
                      
                      // Só atualizar se o valor for diferente
                      if (valueToSet !== currentData) {
                        editorInstanceRef.current.setData(valueToSet);
                      }
                      
                      // Expor instância globalmente para acesso externo usando o name como identificador
                      if (name && editorInstanceRef.current) {
                        editorInstanceRef.current.name = name;
                      }
                    } catch (e) {
                      console.warn('Erro ao definir valor inicial no editor:', e);
                    }
                  }
                }, 100);
              });
            }
        } catch (error) {
          console.error('Erro ao inicializar CKEditor:', error);
        }
      }, 200); // Delay maior para garantir que o DOM está completamente pronto
    }; // Fim de continueInit

    // Usar requestAnimationFrame para garantir que o DOM está atualizado
    const rafId = requestAnimationFrame(() => {
      setTimeout(initEditor, 50);
    });

    // Limpar ao desmontar
    return () => {
      cancelAnimationFrame(rafId);
      
      // Destruir instância do editor
      if (editorInstanceRef.current) {
        try {
          // Verificar se a instância ainda está válida
          if (editorInstanceRef.current.status !== 'destroyed') {
            editorInstanceRef.current.destroy();
          }
        } catch (e) {
          console.warn('Erro ao destruir editor:', e);
        }
        editorInstanceRef.current = null;
      }
      
      // Também destruir por ID se existir
      if (editorRef.current && editorRef.current.id && window.CKEDITOR && window.CKEDITOR.instances) {
        const instanceId = editorRef.current.id;
        if (window.CKEDITOR.instances[instanceId]) {
          try {
            const instance = window.CKEDITOR.instances[instanceId];
            if (instance && instance.status !== 'destroyed') {
              instance.destroy();
            }
          } catch (e) {
            // Se falhar, remover do registro
            try {
              delete window.CKEDITOR.instances[instanceId];
            } catch (e2) {
              // Ignorar
            }
          }
        }
      }
      
      // Remover textarea se existir
      if (editorRef.current && editorRef.current.parentNode) {
        try {
          editorRef.current.parentNode.removeChild(editorRef.current);
        } catch (e) {
          console.warn('Erro ao remover textarea:', e);
        }
        editorRef.current = null;
      }
    };
  }, [scriptLoaded]); // Recriar quando o script carregar

  // Atualizar valor quando prop value mudar
  useEffect(() => {
    if (editorInstanceRef.current && editorInstanceRef.current.status !== 'destroyed') {
      try {
        const currentData = editorInstanceRef.current.getData();
        if (value !== currentData) {
          editorInstanceRef.current.setData(value || '');
        }
      } catch (e) {
        console.warn('Erro ao atualizar valor do editor:', e);
      }
    }
  }, [value]);

  // Atualizar estado disabled
  useEffect(() => {
    if (editorInstanceRef.current) {
      if (disabled) {
        editorInstanceRef.current.setReadOnly(true);
      } else {
        editorInstanceRef.current.setReadOnly(false);
      }
    }
  }, [disabled]);

  if (!scriptLoaded) {
    return (
      <div 
        ref={containerRef} 
        className={`ckeditor-wrapper ${className} flex items-center justify-center bg-gray-50 border border-gray-200 rounded`}
        style={{ minHeight: `${height}px` }}
      >
        <div className="text-gray-500 text-sm">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`ckeditor-wrapper ${className}`}
      style={{ minHeight: `${height}px` }}
    />
  );
};

export default CKEditor;

