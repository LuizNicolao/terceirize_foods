const crypto = require('crypto');
const { executeQuery } = require('../config/database');

const LOCKOUT_SCHEDULE = [
  { attempts: 6, minutes: 5 },
  { attempts: 7, minutes: 15 },
  { attempts: 8, minutes: 30 },
  { attempts: 9, minutes: 60 },
  { attempts: 10, minutes: 24 * 60 }
];

let tableEnsured = false;

const ensureTable = async () => {
  if (tableEnsured) {
    return;
  }

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS failed_login_attempts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email_hash VARCHAR(64) NOT NULL UNIQUE,
      attempts INT NOT NULL DEFAULT 0,
      lockout_until DATETIME NULL,
      last_attempt_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  tableEnsured = true;
};

const toDateTimeString = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const getEmailHash = (email) => {
  return crypto.createHash('sha256').update((email || '').trim().toLowerCase()).digest('hex');
};

const findSchedule = (attempts) => {
  const schedule = LOCKOUT_SCHEDULE.find((item) => attempts === item.attempts);
  if (schedule) {
    return schedule.minutes * 60 * 1000;
  }
  if (attempts > LOCKOUT_SCHEDULE[LOCKOUT_SCHEDULE.length - 1].attempts) {
    return LOCKOUT_SCHEDULE[LOCKOUT_SCHEDULE.length - 1].minutes * 60 * 1000;
  }
  return null;
};

const getFailedAttempt = async (email) => {
  await ensureTable();
  const emailHash = getEmailHash(email);
  const rows = await executeQuery(
    'SELECT email_hash, attempts, lockout_until, last_attempt_at FROM failed_login_attempts WHERE email_hash = ?',
    [emailHash]
  );

  if (!rows.length) {
    return null;
  }

  return rows[0];
};

const incrementFailedAttempt = async (email) => {
  await ensureTable();
  const emailHash = getEmailHash(email);
  const existing = await getFailedAttempt(email);

  if (!existing) {
    await executeQuery(
      'INSERT INTO failed_login_attempts (email_hash, attempts, last_attempt_at) VALUES (?, ?, NOW())',
      [emailHash, 1]
    );
    return {
      attempts: 1,
      lockoutUntil: null
    };
  }

  const attempts = Number(existing.attempts || 0) + 1;
  const lockoutDuration = findSchedule(attempts);
  let lockoutUntil = null;

  if (lockoutDuration) {
    lockoutUntil = new Date(Date.now() + lockoutDuration);
  }

  await executeQuery(
    'UPDATE failed_login_attempts SET attempts = ?, lockout_until = ?, last_attempt_at = NOW() WHERE email_hash = ?',
    [
      attempts,
      lockoutUntil ? toDateTimeString(lockoutUntil) : null,
      emailHash
    ]
  );

  return {
    attempts,
    lockoutUntil
  };
};

const resetFailedAttempts = async (email) => {
  await ensureTable();
  const emailHash = getEmailHash(email);
  await executeQuery(
    'DELETE FROM failed_login_attempts WHERE email_hash = ?',
    [emailHash]
  );
};

module.exports = {
  getFailedAttempt,
  incrementFailedAttempt,
  resetFailedAttempts
};

