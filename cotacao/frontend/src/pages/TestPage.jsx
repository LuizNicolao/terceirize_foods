import React, { useEffect, useState } from 'react';

const TestPage = () => {
  const [urlParams, setUrlParams] = useState({});
  const [localStorageData, setLocalStorageData] = useState({});

  useEffect(() => {
    // Capturar parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const paramsObj = {};
    for (const [key, value] of params) {
      paramsObj[key] = value;
    }
    setUrlParams(paramsObj);

    // Capturar dados do localStorage
    const localStorageObj = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageObj[key] = localStorage.getItem(key);
      }
    }
    setLocalStorageData(localStorageObj);

    console.log('🔍 TestPage - URL Params:', paramsObj);
    console.log('🔍 TestPage - LocalStorage:', localStorageObj);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 Página de Teste - Sistema de Cotação</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>URL Atual:</h2>
        <p>{window.location.href}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Parâmetros da URL:</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(urlParams, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Dados do LocalStorage:</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Teste de API:</h2>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/cotacao/api/health');
              const data = await response.json();
              alert('API funcionando: ' + JSON.stringify(data));
            } catch (error) {
              alert('Erro na API: ' + error.message);
            }
          }}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          Testar API Health
        </button>
        
        <button 
          onClick={async () => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch(`/cotacao/api/sso/test?sso_token=${token || 'teste'}`);
              const data = await response.json();
              alert('SSO funcionando: ' + JSON.stringify(data));
            } catch (error) {
              alert('Erro no SSO: ' + error.message);
            }
          }}
          style={{ padding: '10px 20px' }}
        >
          Testar SSO
        </button>
      </div>

      <div>
        <h2>Links de Teste:</h2>
        <a 
          href="/cotacao/dashboard" 
          style={{ display: 'block', marginBottom: '10px', color: 'blue' }}
        >
          Ir para Dashboard
        </a>
        <a 
          href="https://foods.terceirizemais.com.br/foods" 
          style={{ display: 'block', marginBottom: '10px', color: 'blue' }}
        >
          Voltar para Foods
        </a>
      </div>
    </div>
  );
};

export default TestPage;
