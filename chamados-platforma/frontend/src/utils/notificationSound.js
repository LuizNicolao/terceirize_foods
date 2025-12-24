/**
 * Utilitário para reproduzir som de notificação
 */

/**
 * Gera e reproduz um som de notificação usando Web Audio API
 */
export const playNotificationSound = () => {
  try {
    // Verificar se o navegador suporta Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn('Navegador não suporta Web Audio API');
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Criar oscilador (gerador de onda)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Configurar o som (tom agradável)
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Frequência em Hz (um tom agradável, tipo "ding")
    oscillator.frequency.value = 800;
    oscillator.type = 'sine'; // Onda senoidal (som mais suave)

    // Configurar envelope (fade in/out para som mais agradável)
    const now = audioContext.currentTime;
    
    // Ganho inicial em 0
    gainNode.gain.setValueAtTime(0, now);
    
    // Aumentar rapidamente para volume máximo
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    
    // Manter volume por um breve momento
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
    
    // Diminuir suavemente
    gainNode.gain.linearRampToValueAtTime(0, now + 0.2);

    // Iniciar e parar o oscilador
    oscillator.start(now);
    oscillator.stop(now + 0.2);

    // Limpar contexto após tocar
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.warn('Erro ao reproduzir som de notificação:', error);
    // Não interromper o fluxo se o som falhar
  }
};

/**
 * Verifica se os sons de notificação estão habilitados (via localStorage)
 */
export const isNotificationSoundEnabled = () => {
  const setting = localStorage.getItem('notificationSoundEnabled');
  // Por padrão, os sons estão habilitados
  return setting === null || setting === 'true';
};

/**
 * Habilita ou desabilita os sons de notificação
 */
export const setNotificationSoundEnabled = (enabled) => {
  localStorage.setItem('notificationSoundEnabled', enabled.toString());
};

