const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido
 */
const auth = (req, res, next) => {
    try {
        // Obter token do header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Token de acesso não fornecido',
                message: 'É necessário fornecer um token de autenticação válido'
            });
        }

        // Extrair token (remover "Bearer " do início)
        const token = authHeader.substring(7);
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Token inválido',
                message: 'Token de autenticação não pode estar vazio'
            });
        }

        // Verificar e decodificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adicionar informações do usuário ao request
        req.user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
        };

        next();
        
    } catch (error) {
        console.error('Erro na autenticação:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expirado',
                message: 'Seu token de acesso expirou. Faça login novamente.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Token inválido',
                message: 'Token de autenticação inválido'
            });
        }
        
        return res.status(500).json({ 
            error: 'Erro interno de autenticação',
            message: 'Erro ao processar autenticação'
        });
    }
};

/**
 * Middleware para verificar permissões específicas
 * @param {string} screen - Tela que o usuário está tentando acessar
 * @param {string} action - Ação que o usuário está tentando realizar (view, create, edit, delete)
 */
const checkPermission = (screen, action = 'view') => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Buscar permissões do usuário
            const db = require('../config/database');
            const [permissions] = await db.execute(`
                SELECT can_view, can_create, can_edit, can_delete
                FROM user_permissions
                WHERE user_id = ? AND screen = ?
            `, [userId, screen]);
            
            if (permissions.length === 0) {
                return res.status(403).json({ 
                    error: 'Acesso negado',
                    message: 'Você não tem permissão para acessar esta funcionalidade'
                });
            }
            
            const permission = permissions[0];
            let hasPermission = false;
            
            switch (action) {
                case 'view':
                    hasPermission = permission.can_view === 1;
                    break;
                case 'create':
                    hasPermission = permission.can_create === 1;
                    break;
                case 'edit':
                    hasPermission = permission.can_edit === 1;
                    break;
                case 'delete':
                    hasPermission = permission.can_delete === 1;
                    break;
                default:
                    hasPermission = false;
            }
            
            if (!hasPermission) {
                return res.status(403).json({ 
                    error: 'Acesso negado',
                    message: `Você não tem permissão para ${action} nesta funcionalidade`
                });
            }
            
            next();
            
        } catch (error) {
            console.error('Erro ao verificar permissões:', error);
            return res.status(500).json({ 
                error: 'Erro interno',
                message: 'Erro ao verificar permissões'
            });
        }
    };
};

/**
 * Middleware para verificar se o usuário é administrador
 */
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'administrador') {
        return res.status(403).json({ 
            error: 'Acesso negado',
            message: 'Apenas administradores podem acessar esta funcionalidade'
        });
    }
    next();
};

/**
 * Middleware para verificar se o usuário é gestor ou administrador
 */
const requireGestor = (req, res, next) => {
    if (!['administrador', 'gestor'].includes(req.user.role)) {
        return res.status(403).json({ 
            error: 'Acesso negado',
            message: 'Apenas gestores e administradores podem acessar esta funcionalidade'
        });
    }
    next();
};

module.exports = {
    auth,
    checkPermission,
    requireAdmin,
    requireGestor
}; 