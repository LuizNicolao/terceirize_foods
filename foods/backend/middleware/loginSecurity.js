const { redisClient, isRedisReady } = require('../config/redis');
const { getFailedAttempt } = require('../services/loginAttemptService');

const IP_LIMIT = 10;
const WINDOW_SECONDS = 60;
const BLOCK_SECONDS = 5 * 60;

const formatLockoutMessage = (seconds) => {
  if (seconds <= 60) {
    return 'Conta temporariamente bloqueada. Tente novamente em até 1 minuto.';
  }

  const minutes = Math.ceil(seconds / 60);
  return `Conta temporariamente bloqueada. Tente novamente em ${minutes} minutos.`;
};

const ipRateLimiter = async (req, res, next) => {
  try {
    if (!isRedisReady()) {
      return next();
    }

    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const blockKey = `login:block:${ip}`;
    const counterKey = `login:count:${ip}`;

    const blockTtl = await redisClient.ttl(blockKey);
    if (blockTtl > 0) {
      return res.status(429).json({
        error: 'Excesso de requisições. Tente novamente em 5 minutos.',
        retryAfter: blockTtl
      });
    }

    const count = await redisClient.incr(counterKey);
    if (count === 1) {
      await redisClient.expire(counterKey, WINDOW_SECONDS);
    }

    if (count > IP_LIMIT) {
      await redisClient.del(counterKey);
      await redisClient.set(blockKey, '1', { EX: BLOCK_SECONDS });
      return res.status(429).json({
        error: 'Excesso de requisições. Tente novamente em 5 minutos.',
        retryAfter: BLOCK_SECONDS
      });
    }

    return next();
  } catch (error) {
    console.error('Erro no rate limiter por IP:', error);
    return next();
  }
};

const checkEmailLockout = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next();
    }

    const attempt = await getFailedAttempt(email);
    if (!attempt || !attempt.lockout_until) {
      return next();
    }

    const lockoutUntil = new Date(attempt.lockout_until);
    const now = new Date();

    if (lockoutUntil > now) {
      const remainingSeconds = Math.ceil((lockoutUntil.getTime() - now.getTime()) / 1000);
      return res.status(401).json({
        error: formatLockoutMessage(remainingSeconds),
        lockout: true,
        retryAfter: remainingSeconds
      });
    }

    return next();
  } catch (error) {
    console.error('Erro ao verificar bloqueio por email:', error);
    return next();
  }
};

module.exports = {
  ipRateLimiter,
  checkEmailLockout
};

