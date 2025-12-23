const cron = require('node-cron');
const { executeQuery } = require('./database');
const { createBackup } = require('./backup');
const { cleanupOldBackups } = require('./cleanup');

let scheduledTasks = new Map();
let cleanupTask = null;

// Carregar e iniciar agendamentos
async function loadSchedules() {
  try {
    const schedules = await executeQuery(
      'SELECT * FROM schedules WHERE enabled = TRUE'
    );
    
    // Parar tarefas antigas
    scheduledTasks.forEach(task => task.stop());
    scheduledTasks.clear();
    
    // Criar novas tarefas
    schedules.forEach(schedule => {
      try {
        if (cron.validate(schedule.cron_expression)) {
          const task = cron.schedule(schedule.cron_expression, async () => {
            try {
              // Parse selected_tables se existir
              let selectedTables = null;
              if (schedule.selected_tables) {
                try {
                  selectedTables = JSON.parse(schedule.selected_tables);
                  if (!Array.isArray(selectedTables) || selectedTables.length === 0) {
                    selectedTables = null;
                  }
                } catch (e) {
                  selectedTables = null;
                }
              }
              
              await createBackup(schedule.database_name, schedule.schedule_type, selectedTables);
            } catch (error) {
            }
          });
          
          scheduledTasks.set(schedule.id, task);
        } else {
        }
      } catch (error) {
        console.error(`Erro ao criar tarefa agendada:`, error);
      }
    });
    
  } catch (error) {
  }
}

// Inicializar agendamentos
async function initScheduler() {
  await loadSchedules();
  
  // Recarregar agendamentos a cada 5 minutos (caso sejam alterados)
  setInterval(loadSchedules, 5 * 60 * 1000);
  
  // Agendar limpeza de backups antigos (diariamente às 3h da manhã)
  if (cleanupTask) {
    cleanupTask.stop();
  }
  
  cleanupTask = cron.schedule('0 3 * * *', async () => {
    try {
      console.log('Iniciando limpeza de backups antigos...');
      await cleanupOldBackups();
    } catch (error) {
      console.error('Erro na limpeza automática de backups:', error);
    }
  });
  
  console.log('Agendamento de limpeza de backups configurado (diariamente às 3h)');
}

// Executar um agendamento manualmente (sem esperar pelo cron)
async function executeSchedule(scheduleId) {
  try {
    const schedules = await executeQuery(
      'SELECT * FROM schedules WHERE id = ?',
      [scheduleId]
    );
    
    if (schedules.length === 0) {
      throw new Error('Agendamento não encontrado');
    }
    
    const schedule = schedules[0];
    
    // Parse selected_tables se existir
    let selectedTables = null;
    if (schedule.selected_tables) {
      try {
        selectedTables = JSON.parse(schedule.selected_tables);
        if (!Array.isArray(selectedTables) || selectedTables.length === 0) {
          selectedTables = null;
        }
      } catch (e) {
        selectedTables = null;
      }
    }
    
    // Executar o backup
    await createBackup(schedule.database_name, schedule.schedule_type, selectedTables);
    
    return {
      success: true,
      message: 'Backup iniciado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao executar agendamento:', error);
    throw error;
  }
}

module.exports = {
  initScheduler,
  loadSchedules,
  executeSchedule
};

