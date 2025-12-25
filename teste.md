erver {

    listen 80;

    server_name foods.terceirizemais.com.br;



    return 301 https://$host$request_uri;

}



# Bloco HTTPS para o domínio foods.terceirizemais.com.br

server {

    listen 443 ssl;

    server_name foods.terceirizemais.com.br;



    # Certificados SSL (Certbot)

    ssl_certificate /etc/letsencrypt/live/foods.terceirizemais.com.br/fullchain.pem;

    ssl_certificate_key /etc/letsencrypt/live/foods.terceirizemais.com.br/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;

    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;



    # ===== SISTEMA FOODS =====

    location /foods {

        proxy_pass http://127.0.0.1:3080/foods;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /foods;

    }



    location /foods/api/ {

        client_max_body_size 50M;

        proxy_pass http://127.0.0.1:3001/foods/api/;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /foods;

    }



    # ===== SISTEMA COTAÇÃO =====

    location /cotacao {

        proxy_pass http://127.0.0.1:3081;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /cotacao;

        

        # Timeout para SPAs

        proxy_read_timeout 300s;

        proxy_send_timeout 300s;

    }



    location /cotacao/api/ {

        proxy_pass http://127.0.0.1:3002/cotacao/api/;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /cotacao;

    }



    # ===== SISTEMA COZINHA INDUSTRIAL =====

    location /cozinha_industrial {

        proxy_pass http://127.0.0.1:3084/cozinha_industrial;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /cozinha_industrial;

    }



    location /cozinha_industrial/api/ {

        proxy_pass http://127.0.0.1:3006/cozinha_industrial/api/;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /cozinha_industrial;

    }



    # ===== SISTEMA IMPLANTAÇÃO =====

    location /implantacao {

        proxy_pass http://127.0.0.1:3083/implantacao;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /implantacao;

        

        # Timeout para SPAs

        proxy_read_timeout 300s;

        proxy_send_timeout 300s;

    }



    location /implantacao/api/ {

        proxy_pass http://127.0.0.1:3005/implantacao/api/;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /implantacao;

    }



    # ===== N8N =====

    # Canonicaliza /n8n -> /n8n/

    location = /n8n {

        return 301 https://$host/n8n/;

    }



    # Assets estáticos do n8n - CORRIGIDO

    location ~ ^/n8n/(assets|static|rest|favicon) {

        proxy_pass http://127.0.0.1:5678;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        

        # Cache para assets estáticos

        expires 1y;

        add_header Cache-Control "public, immutable";

    }



    # Interface principal do n8n

    location /n8n/ {

        proxy_pass http://127.0.0.1:5678/;

        proxy_http_version 1.1;



        # WebSocket / SSE

        proxy_set_header Upgrade $http_upgrade;

        proxy_set_header Connection "upgrade";



        # Forwarded headers

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;



        # Timeouts e buffers

        proxy_read_timeout 600s;

        proxy_send_timeout 600s;

        client_max_body_size 50m;

    }



    # ===== SISTEMA CHAMADOS =====

    location /chamados {

        proxy_pass http://127.0.0.1:3084/chamados;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /chamados;

        

        # Timeout para SPAs

        proxy_read_timeout 300s;

        proxy_send_timeout 300s;

    }



    location /chamados/api/ {

        client_max_body_size 50M;

        proxy_pass http://127.0.0.1:3007/chamados/api/;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /chamados;

    }



    # ===== SISTEMA MYSQL BACKUP WEB =====

    location /mysql-backup-web {

        proxy_pass http://127.0.0.1:8086/mysql-backup-web;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /mysql-backup-web;

        

        # Timeout para SPAs

        proxy_read_timeout 300s;

        proxy_send_timeout 300s;

    }



    location /mysql-backup-web/api/ {

        proxy_pass http://127.0.0.1:3000/api/;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header X-Forwarded-Host $host;

        proxy_set_header X-Forwarded-Prefix /mysql-backup-web;

    }

}

