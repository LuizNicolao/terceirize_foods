/**
 * Sistema de Formatação Automática de Campos
 * 
 * Este sistema fornece formatação automática para campos comuns como:
 * - CEP: #####-###
 * - CPF: ###.###.###-##
 * - CNPJ: ##.###.###/####-##
 * - Telefone: ## ####-#### (fixo) ou ## #####-#### (celular)
 * 
 * COMO USAR:
 * 
 * 1. Importe o MaskedInput:
 *    import { MaskedInput } from '../ui';
 * 
 * 2. Use no seu formulário:
 *    <MaskedInput
 *      {...register('cpf')}
 *      maskType="cpf"
 *      label="CPF"
 *      disabled={isViewMode}
 *    />
 * 
 * TIPOS DE MÁSCARA DISPONÍVEIS:
 * 
 * - "cep": Formata CEP (00000-000)
 * - "cpf": Formata CPF (000.000.000-00)
 * - "cnpj": Formata CNPJ (00.000.000/0000-00)
 * - "telefone": Formata telefone automaticamente detectando se é fixo ou celular
 * 
 * CARACTERÍSTICAS:
 * 
 * ✅ Formatação automática enquanto digita
 * ✅ Aceita apenas números
 * ✅ Placeholder automático
 * ✅ Compatível com react-hook-form
 * ✅ Responsivo e acessível
 * ✅ Mantém o layout atual das páginas
 * 
 * EXEMPLOS DE USO:
 * 
 * // CPF
 * <MaskedInput
 *   {...register('cpf')}
 *   maskType="cpf"
 *   label="CPF"
 * />
 * 
 * // CNPJ
 * <MaskedInput
 *   {...register('cnpj')}
 *   maskType="cnpj"
 *   label="CNPJ"
 * />
 * 
 * // CEP
 * <MaskedInput
 *   {...register('cep')}
 *   maskType="cep"
 *   label="CEP"
 * />
 * 
 * // Telefone (detecta automaticamente se é fixo ou celular)
 * <MaskedInput
 *   {...register('telefone')}
 *   maskType="telefone"
 *   label="Telefone"
 * />
 */

// Exporta as configurações das máscaras para uso em outros lugares se necessário
export const MASK_CONFIGS = {
  cep: {
    pattern: '#####-###',
    maxLength: 9,
    placeholder: '00000-000'
  },
  cpf: {
    pattern: '###.###.###-##',
    maxLength: 14,
    placeholder: '000.000.000-00'
  },
  cnpj: {
    pattern: '##.###.###/####-##',
    maxLength: 18,
    placeholder: '00.000.000/0000-00'
  },
  telefone: {
    pattern: '## ####-####',
    maxLength: 14,
    placeholder: '00 0000-0000'
  },
  celular: {
    pattern: '## #####-####',
    maxLength: 15,
    placeholder: '00 00000-0000'
  }
};
