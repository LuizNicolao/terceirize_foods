# Servidor OSRM Local

Este diretório contém a configuração para rodar um servidor OSRM (Open Source Routing Machine) localmente, permitindo calcular rotas que seguem as ruas do Brasil sem depender de APIs externas ou enfrentar limites de taxa.

## ✅ Status Atual

O servidor OSRM está **configurado e funcionando**! 🎉

- **URL do servidor**: `http://localhost:5000`
- **Status**: Ativo e respondendo requisições
- **Dados**: Mapa completo do Brasil processado (~12GB de dados)

## 🚀 Como Usar

### Uso Diário

Para iniciar o servidor (após a configuração inicial):

```bash
cd /home/luiznicolao/terceirize_foods/osrm
docker compose up -d
```

Para parar o servidor:

```bash
docker compose down
```

Para ver os logs:

```bash
docker compose logs -f osrm
```

### Verificar se está funcionando

```bash
curl 'http://localhost:5000/route/v1/driving/-51.055,-26.3559;-49.5953,-27.0659?overview=full&geometries=geojson'
```

Se retornar um JSON com `"code":"Ok"`, está funcionando! ✅

## 📋 Configuração Inicial

### No Servidor de Desenvolvimento (Já Concluída)

A configuração inicial já foi realizada. Os arquivos de dados foram processados e estão prontos para uso.

### No Servidor de Produção

**⚠️ IMPORTANTE**: Os dados processados (18GB) **NÃO** são commitados no Git. Eles precisam ser processados no servidor de produção também.

**Passos para configurar no servidor de produção:**

1. **Fazer pull do código** (após o commit):
   ```bash
   cd /caminho/do/projeto
   git pull
   ```

2. **Executar o setup no servidor**:
   ```bash
   cd osrm
   chmod +x setup.sh
   ./setup.sh
   ```
   
   Isso vai:
   - Baixar o mapa do Brasil (~1.5GB)
   - Processar os dados (40-60 minutos)
   - Iniciar o servidor automaticamente

3. **Verificar se está funcionando**:
   ```bash
   curl 'http://localhost:5000/route/v1/driving/-51.055,-26.3559;-49.5953,-27.0659'
   ```

**Nota**: O processo de processamento pode demorar 40-60 minutos dependendo do hardware do servidor. É recomendado executar em uma sessão `screen` ou `tmux` para não perder o progresso.

### Refazer Configuração (se necessário)

Se precisar refazer a configuração do zero, execute:

```bash
./setup.sh
```

## 🔄 Atualizar Dados do Mapa

Para atualizar o mapa do Brasil (recomendado mensalmente):

1. **Baixar novo mapa**:
   ```bash
   cd data
   wget https://download.geofabrik.de/south-america/brazil-latest.osm.pbf
   cd ..
   ```

2. **Reprocessar dados**:
   ```bash
   ./fix-extraction.sh
   ```

   Isso vai:
   - Limpar arquivos antigos
   - Extrair novos dados (10-30 min)
   - Particionar (5-10 min)
   - Customizar (5-10 min)
   - Reiniciar o servidor

## 🛠️ Scripts Disponíveis

- **`setup.sh`**: Configuração inicial completa (download + processamento)
- **`fix-extraction.sh`**: Refaz a extração e processamento dos dados
- **`continue-setup.sh`**: Continua o setup de onde parou
- **`check-ebg.sh`**: Verifica se a extração foi concluída
- **`monitor-extraction.sh`**: Monitora o progresso da extração

## 🌐 Integração com Frontend

O frontend já está configurado para usar o servidor local automaticamente.

**Arquivo**: `foods/frontend/src/components/unidades-escolares/mapa/RoutePolyline.jsx`

A configuração atual:
- **Prioridade 1**: Servidor local (`http://localhost:5000`)
- **Prioridade 2**: Servidor público OSRM (fallback)
- **Prioridade 3**: Linha reta (se ambos falharem)

### Configuração via Variável de Ambiente (Opcional)

Se quiser usar uma URL diferente, configure no `.env` do frontend:

```env
REACT_APP_OSRM_URL=http://localhost:5000
```

**No servidor de produção**, se o OSRM estiver em outro host/porta, configure:

```env
REACT_APP_OSRM_URL=http://osrm:5000
# ou
REACT_APP_OSRM_URL=http://seu-servidor-osrm:5000
```

## 📊 Recursos do Servidor

- **Porta**: 5000
- **Algoritmo**: MLD (Multi-Level Dijkstra) - mais rápido para rotas longas
- **Cobertura**: Todo o território brasileiro
- **Rede Docker**: `terceirize_network` (compartilhada com outros serviços)

## ⚠️ Troubleshooting

### Servidor não inicia

```bash
# Verificar logs
docker compose logs osrm

# Verificar se os arquivos existem
ls -lh data/*.osrm*

# Reiniciar
docker compose restart osrm
```

### Erro "Input file not found"

Execute `./fix-extraction.sh` para reprocessar os dados.

### Servidor lento

O servidor pode demorar alguns segundos para responder na primeira requisição após iniciar. Isso é normal.

## 📝 Notas Técnicas

- **Tamanho total dos dados**: ~12GB
- **Tempo de processamento inicial**: ~40-60 minutos
- **Memória recomendada**: 8GB+ RAM
- **Espaço em disco**: 15GB+ livres

## 🔗 Links Úteis

- [OSRM Documentation](http://project-osrm.org/)
- [Geofabrik Downloads](https://download.geofabrik.de/)
- [Docker Hub - osrm/osrm-backend](https://hub.docker.com/r/osrm/osrm-backend/)
