#!/bin/bash

echo "🛑 Parando ambiente de desenvolvimento Foods..."

# Parar containers
docker-compose -f docker-compose.dev.yml down

echo "✅ Ambiente de desenvolvimento parado!"
echo ""
echo "💡 Para remover volumes do banco: docker-compose -f docker-compose.dev.yml down -v"
