-- Script para dar permissões ao usuário foods_user no banco mysql_backup_web
-- Execute este script como root no MySQL

-- Dar todas as permissões no banco mysql_backup_web
GRANT ALL PRIVILEGES ON mysql_backup_web.* TO 'foods_user'@'%';

-- Aplicar as mudanças
FLUSH PRIVILEGES;

-- Verificar permissões (opcional)
SHOW GRANTS FOR 'foods_user'@'%';

