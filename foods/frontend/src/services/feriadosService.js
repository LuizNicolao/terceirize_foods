/**
 * Serviço para gerenciar feriados nacionais brasileiros
 * Combina cache local com APIs externas para máxima precisão
 */

class FeriadosService {
  constructor() {
    this.cache = new Map();
    this.feriadosFixos = this.getFeriadosFixos();
  }

  /**
   * Feriados fixos do Brasil (não mudam de ano para ano)
   */
  getFeriadosFixos() {
    return [
      { month: 1, day: 1, name: 'Confraternização Universal', type: 'nacional' },
      { month: 4, day: 21, name: 'Tiradentes', type: 'nacional' },
      { month: 5, day: 1, name: 'Dia do Trabalhador', type: 'nacional' },
      { month: 9, day: 7, name: 'Independência do Brasil', type: 'nacional' },
      { month: 10, day: 12, name: 'Nossa Senhora Aparecida', type: 'nacional' },
      { month: 11, day: 2, name: 'Finados', type: 'nacional' },
      { month: 11, day: 15, name: 'Proclamação da República', type: 'nacional' },
      { month: 11, day: 20, name: 'Dia da Consciência Negra', type: 'nacional' },
      { month: 12, day: 25, name: 'Natal', type: 'nacional' }
    ];
  }

  /**
   * Buscar feriados para um ano específico
   */
  async getFeriadosAno(year) {
    const cacheKey = `feriados_${year}`;
    
    // Verificar cache primeiro
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Verificar se há alguma API configurada
    const hasApiKey = this.verificarApisConfiguradas();
    
    if (hasApiKey) {
      try {
        // Tentar buscar da API externa
        const feriadosAPI = await this.buscarFeriadosAPI(year);
        
        // Combinar com feriados fixos
        const feriadosCompletos = this.combinarFeriados(feriadosAPI, year);
        
        // Salvar no cache
        this.cache.set(cacheKey, feriadosCompletos);
        
        return feriadosCompletos;
      } catch (error) {
        console.warn('Erro ao buscar feriados da API, usando cache local:', error);
      }
    }
    
    // Fallback: usar apenas feriados fixos + móveis calculados
    const feriadosFallback = this.calcularFeriadosFallback(year);
    this.cache.set(cacheKey, feriadosFallback);
    
    return feriadosFallback;
  }

  /**
   * Verificar se alguma API está configurada
   */
  verificarApisConfiguradas() {
    return !!(
      process.env.REACT_APP_CALENDARIFIC_API_KEY ||
      process.env.REACT_APP_ABSTRACT_API_KEY ||
      process.env.REACT_APP_HOLIDAY_API_KEY
    );
  }

  /**
   * Buscar feriados de uma API externa
   */
  async buscarFeriadosAPI(year) {
    // Tentar múltiplas APIs em ordem de preferência
    const apis = [
      this.tentarCalendarificAPI(year),
      this.tentarAbstractAPI(year),
      this.tentarHolidayAPI(year)
    ];
    
    for (const apiCall of apis) {
      try {
        const result = await apiCall;
        if (result && result.length > 0) {
          return result;
        }
      } catch (error) {
        console.warn('API falhou, tentando próxima:', error.message);
        continue;
      }
    }
    
    throw new Error('Todas as APIs de feriados falharam');
  }

  /**
   * Tentar Calendarific API
   */
  async tentarCalendarificAPI(year) {
    const API_KEY = process.env.REACT_APP_CALENDARIFIC_API_KEY;
    if (!API_KEY || API_KEY === 'demo') {
      throw new Error('API Key não configurada');
    }
    
    const url = `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=BR&year=${year}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Calendarific API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.response && data.response.holidays) {
      return data.response.holidays.map(holiday => ({
        date: new Date(holiday.date.iso),
        name: holiday.name,
        type: holiday.type[0] || 'nacional',
        description: holiday.description || ''
      }));
    }
    
    throw new Error('Formato de resposta inválido');
  }

  /**
   * Tentar Abstract API
   */
  async tentarAbstractAPI(year) {
    const API_KEY = process.env.REACT_APP_ABSTRACT_API_KEY;
    if (!API_KEY) {
      throw new Error('API Key não configurada');
    }
    
    const url = `https://holidays.abstractapi.com/v1/?api_key=${API_KEY}&country=BR&year=${year}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Abstract API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map(holiday => ({
        date: new Date(holiday.date),
        name: holiday.name,
        type: holiday.type || 'nacional',
        description: holiday.description || ''
      }));
    }
    
    throw new Error('Formato de resposta inválido');
  }

  /**
   * Tentar Holiday API
   */
  async tentarHolidayAPI(year) {
    const API_KEY = process.env.REACT_APP_HOLIDAY_API_KEY;
    if (!API_KEY) {
      throw new Error('API Key não configurada');
    }
    
    const url = `https://holidayapi.com/v1/holidays?key=${API_KEY}&country=BR&year=${year}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Holiday API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.holidays) {
      return Object.values(data.holidays).flat().map(holiday => ({
        date: new Date(holiday.date),
        name: holiday.name,
        type: holiday.type || 'nacional',
        description: holiday.description || ''
      }));
    }
    
    throw new Error('Formato de resposta inválido');
  }

  /**
   * Combinar feriados da API com feriados fixos
   */
  combinarFeriados(feriadosAPI, year) {
    const feriadosCompletos = [...feriadosAPI];
    
    // Adicionar feriados fixos que não estão na API
    this.feriadosFixos.forEach(feriado => {
      const dataFeriado = new Date(year, feriado.month - 1, feriado.day);
      const jaExiste = feriadosAPI.some(f => 
        f.date.getMonth() === dataFeriado.getMonth() && 
        f.date.getDate() === dataFeriado.getDate()
      );
      
      if (!jaExiste) {
        feriadosCompletos.push({
          date: dataFeriado,
          name: feriado.name,
          type: feriado.type,
          description: ''
        });
      }
    });
    
    return feriadosCompletos.sort((a, b) => a.date - b.date);
  }

  /**
   * Fallback: calcular feriados móveis quando API não está disponível
   */
  calcularFeriadosFallback(year) {
    const feriados = [];
    
    // Adicionar feriados fixos
    this.feriadosFixos.forEach(feriado => {
      feriados.push({
        date: new Date(year, feriado.month - 1, feriado.day),
        name: feriado.name,
        type: feriado.type,
        description: ''
      });
    });
    
    // Calcular feriados móveis
    const pascoa = this.calcularPascoa(year);
    const feriadosMoveis = [
      { offset: -47, name: 'Carnaval', type: 'nacional' },
      { offset: -2, name: 'Sexta-feira Santa', type: 'nacional' },
      { offset: 60, name: 'Corpus Christi', type: 'nacional' }
    ];
    
    feriadosMoveis.forEach(feriado => {
      const dataFeriado = new Date(pascoa);
      dataFeriado.setDate(pascoa.getDate() + feriado.offset);
      
      feriados.push({
        date: dataFeriado,
        name: feriado.name,
        type: feriado.type,
        description: ''
      });
    });
    
    return feriados.sort((a, b) => a.date - b.date);
  }

  /**
   * Calcular data da Páscoa (algoritmo de Gauss)
   */
  calcularPascoa(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = Math.floor((h + l - 7 * m + 114) / 31);
    const p = (h + l - 7 * m + 114) % 31;
    
    return new Date(year, n - 1, p + 1);
  }

  /**
   * Verificar se uma data é feriado
   */
  async isFeriado(date) {
    const year = date.getFullYear();
    const feriados = await this.getFeriadosAno(year);
    
    return feriados.find(feriado => 
      feriado.date.getMonth() === date.getMonth() && 
      feriado.date.getDate() === date.getDate()
    ) || null;
  }

  /**
   * Obter feriados de um mês específico
   */
  async getFeriadosMes(month, year) {
    const feriados = await this.getFeriadosAno(year);
    
    return feriados.filter(feriado => 
      feriado.date.getMonth() === month
    );
  }

  /**
   * Obter próximos feriados a partir de uma data
   */
  async getProximosFeriados(date, limit = 5) {
    const year = date.getFullYear();
    const feriados = await this.getFeriadosAno(year);
    
    return feriados
      .filter(feriado => feriado.date >= date)
      .slice(0, limit);
  }

  /**
   * Limpar cache
   */
  limparCache() {
    this.cache.clear();
  }
}

export default new FeriadosService();
