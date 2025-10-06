#!/bin/bash

# Script para testar a integração entre os sistemas

echo "🧪 Testando integração entre sistemas Terceirize..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "🔍 Testando $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --connect-timeout 10)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK (Status: $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU (Status: $response, Esperado: $expected_status)${NC}"
        return 1
    fi
}

# Função para testar endpoint com autenticação
test_endpoint_auth() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "🔐 Testando $name (com auth)... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --connect-timeout 10)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK (Status: $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU (Status: $response, Esperado: $expected_status)${NC}"
        return 1
    fi
}

echo -e "${BLUE}📊 Verificando containers ativos...${NC}"
echo ""

# Verificar se containers estão rodando
containers=("foods_backend" "foods_frontend" "cotacao_backend" "cotacao_frontend")

for container in "${containers[@]}"; do
    if docker ps --format "table {{.Names}}" | grep -q "$container"; then
        echo -e "✅ $container: ${GREEN}ATIVO${NC}"
    else
        echo -e "❌ $container: ${RED}INATIVO${NC}"
    fi
done

echo ""
echo -e "${BLUE}🌐 Testando conectividade dos sistemas...${NC}"
echo ""

# Testar endpoints dos sistemas
test_endpoint "Foods Backend Health" "http://localhost:3001/api/health" "200"
test_endpoint "Cotação Backend Health" "http://localhost:3002/api/health" "200"
test_endpoint "Foods Frontend" "http://localhost:3080" "200"
test_endpoint "Cotação Frontend" "http://localhost:3081" "200"

echo ""
echo -e "${BLUE}🔒 Testando endpoints públicos seguros...${NC}"
echo ""

# Testar endpoints públicos (deve retornar 403 se não for IP interno)
test_endpoint "Foods Public API" "http://localhost:3001/api/public/health" "200"
test_endpoint "Cotação Public API" "http://localhost:3002/api/public/health" "200"

echo ""
echo -e "${BLUE}🔐 Testando autenticação...${NC}"
echo ""

# Testar endpoints protegidos (deve retornar 401/403)
test_endpoint_auth "Foods Dashboard" "http://localhost:3001/api/dashboard" "401"
test_endpoint_auth "Cotação Dashboard" "http://localhost:3002/api/dashboard" "401"

echo ""
echo -e "${BLUE}📡 Testando rede interna...${NC}"
echo ""

# Verificar se containers estão na mesma rede
if docker network ls | grep -q "terceirize_network"; then
    echo -e "✅ Rede terceirize_network: ${GREEN}ATIVA${NC}"
    
    echo ""
    echo "🔍 Containers na rede:"
    docker network inspect terceirize_network --format '{{range .Containers}}{{.Name}} ({{.IPv4Address}}){{"\n"}}{{end}}'
else
    echo -e "❌ Rede terceirize_network: ${RED}INATIVA${NC}"
fi

echo ""
echo -e "${BLUE}📊 Resumo dos testes:${NC}"
echo ""

# Contar testes bem-sucedidos
total_tests=8
successful_tests=0

# Executar testes e contar sucessos
for test in "foods_backend" "cotacao_backend" "foods_frontend" "cotacao_frontend" "foods_public" "cotacao_public" "foods_auth" "cotacao_auth"; do
    case $test in
        "foods_backend")
            if test_endpoint "Foods Backend" "http://localhost:3001/api/health" "200" >/dev/null 2>&1; then
                ((successful_tests++))
            fi
            ;;
        "cotacao_backend")
            if test_endpoint "Cotação Backend" "http://localhost:3002/api/health" "200" >/dev/null 2>&1; then
                ((successful_tests++))
            fi
            ;;
        "foods_frontend")
            if test_endpoint "Foods Frontend" "http://localhost:3080" "200" >/dev/null 2>&1; then
                ((successful_tests++))
            fi
            ;;
        "cotacao_frontend")
            if test_endpoint "Cotação Frontend" "http://localhost:3081" "200" >/dev/null 2>&1; then
                ((successful_tests++))
            fi
            ;;
        "foods_public")
            if test_endpoint "Foods Public" "http://localhost:3001/api/public/health" "200" >/dev/null 2>&1; then
                ((successful_tests++))
            fi
            ;;
        "cotacao_public")
            if test_endpoint "Cotação Public" "http://localhost:3002/api/public/health" "200" >/dev/null 2>&1; then
                ((successful_tests++))
            fi
            ;;
        "foods_auth")
            if test_endpoint_auth "Foods Auth" "http://localhost:3001/api/dashboard" "401" >/dev/null 2>&1; then
                ((successful_tests++))
            fi
            ;;
        "cotacao_auth")
            if test_endpoint_auth "Cotação Auth" "http://localhost:3002/api/dashboard" "401" >/dev/null 2>&1; then
                ((successful_tests++))
            fi
            ;;
    esac
done

echo -e "📈 Testes executados: $total_tests"
echo -e "✅ Testes bem-sucedidos: ${GREEN}$successful_tests${NC}"
echo -e "❌ Testes falharam: ${RED}$((total_tests - successful_tests))${NC}"

if [ $successful_tests -eq $total_tests ]; then
    echo ""
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM! Integração funcionando corretamente.${NC}"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  ALGUNS TESTES FALHARAM. Verifique os logs dos containers.${NC}"
    echo ""
    echo "🔧 Para debugar:"
    echo "   docker logs foods_backend"
    echo "   docker logs cotacao_backend"
    exit 1
fi
