const cron = require('node-cron');
const { executeQuery } = require('./database');
const { createBackup } = require('./backup');

let scheduledTasks = new Map();

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
}

module.exports = {
  initScheduler,
  loadSchedules
};

