#!/bin/bash

echo "🗄️  Inicialização manual do banco de dados Cotacao..."

# Verificar se o container está rodando
if ! docker ps | grep -q cotacao_mysql_dev; then
    echo "❌ Container MySQL não está rodando. Execute primeiro: ./start-dev.sh"
    exit 1
fi

echo "📋 Copiando arquivo SQL para o container..."
docker cp "cotacao_db (1).sql" cotacao_mysql_dev:/tmp/cotacao_db.sql

echo "🔍 Verificando se o arquivo foi copiado..."
docker exec cotacao_mysql_dev ls -la /tmp/cotacao_db.sql

echo "📝 Executando script SQL..."
docker exec cotacao_mysql_dev mysql -u root -proot123456 cotacao_db -e "source /tmp/cotacao_db.sql;"

echo "🔍 Verificando se as tabelas foram criadas..."
docker exec cotacao_mysql_dev mysql -u foods_user -pfoods123456 cotacao_db -e "SHOW TABLES;"

echo "✅ Inicialização concluída!"
