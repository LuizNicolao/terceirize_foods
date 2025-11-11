const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class PythonPDFService {
    constructor() {
        this.pythonScriptPath = path.join(__dirname, 'pdf_processor.py');
        this.requirementsPath = path.join(__dirname, '..', 'requirements.txt');
        this.venvDir = process.env.PYTHON_VENV_DIR || path.join(__dirname, '..', 'venv');
        this.pythonBinPath = process.env.PYTHON_BIN_PATH 
            || path.join(this.venvDir, 'bin', process.env.PYTHON_BIN_NAME || 'python');
        this.pipBinPath = process.env.PIP_BIN_PATH 
            || path.join(this.venvDir, 'bin', process.env.PIP_BIN_NAME || 'pip');
    }

    /**
     * Instala as dependências Python necessárias
     */
    async instalarDependencias() {
        return new Promise((resolve, reject) => {
            console.log('🔧 Instalando dependências Python no ambiente virtual...');
            
            const pip = spawn(this.pipBinPath, ['install', '-r', this.requirementsPath], {
                stdio: 'inherit'
            });

            pip.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Dependências Python instaladas com sucesso');
                    resolve();
                } else {
                    console.error('❌ Erro ao instalar dependências Python');
                    reject(new Error(`pip install falhou com código ${code}`));
                }
            });

            pip.on('error', (err) => {
                console.error('❌ Erro ao executar pip:', err);
                reject(err);
            });
        });
    }

    /**
     * Processa um PDF usando o serviço Python
     * @param {Buffer} pdfBuffer - Buffer do arquivo PDF
     * @param {string} filename - Nome do arquivo PDF
     * @returns {Promise<Object>} Resultado do processamento
     */
    async processarPDF(pdfBuffer, filename) {
        return new Promise(async (resolve, reject) => {
            try {
                // Criar arquivo temporário
                const tempDir = '/tmp';
                const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${filename}`);
                
                // Salvar buffer no arquivo temporário
                fs.writeFileSync(tempFilePath, pdfBuffer);
                console.log(`📁 Arquivo temporário criado: ${tempFilePath}`);

                // Executar script Python usando o ambiente virtual
                console.log('🐍 Executando processador Python...');
                const python = spawn(this.pythonBinPath, [this.pythonScriptPath, tempFilePath], {
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let stdout = '';
                let stderr = '';

                python.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                python.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                python.on('close', (code) => {
                    // Limpar arquivo temporário
                    try {
                        fs.unlinkSync(tempFilePath);
                    } catch (err) {
                        // Erro silencioso ao remover arquivo temporário
                    }

                    if (code === 0) {
                        try {
                            // Tentar extrair resultado JSON do stdout
                            let jsonResult = null;
                            
                            // Procurar por marcadores JSON_RESULTADO_START e JSON_RESULTADO_END
                            const startMarker = 'JSON_RESULTADO_START';
                            const endMarker = 'JSON_RESULTADO_END';
                            
                            const startIndex = stdout.indexOf(startMarker);
                            const endIndex = stdout.indexOf(endMarker);
                            
                            if (startIndex !== -1 && endIndex !== -1) {
                                const jsonString = stdout.substring(
                                    startIndex + startMarker.length,
                                    endIndex
                                ).trim();
                                
                                try {
                                    jsonResult = JSON.parse(jsonString);
                                } catch (e) {
                                    // Erro ao fazer parse do JSON
                                }
                            } else {
                                // Fallback: procurar por linha que contém JSON
                                const lines = stdout.split('\n');
                                for (const line of lines) {
                                    if (line.trim().startsWith('{') && line.includes('"sucesso"')) {
                                        try {
                                            jsonResult = JSON.parse(line.trim());
                                            break;
                                        } catch (e) {
                                            // Erro ao fazer parse da linha
                                        }
                                    }
                                }
                            }

                            if (jsonResult) {
                                resolve({
                                    success: true,
                                    data: jsonResult
                                });
                            } else {
                                // Se não encontrou JSON, criar resultado baseado no stdout
                                const resultado = {
                                    success: false,
                                    error: 'JSON não encontrado no stdout',
                                    log: stdout
                                };
                                resolve(resultado);
                            }
                        } catch (err) {
                            reject(err);
                        }
                    } else {
                        reject(new Error(`Processamento Python falhou: ${stderr}`));
                    }
                });

                python.on('error', (err) => {
                    reject(err);
                });

            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Verifica se Python e as dependências estão disponíveis
     */
    async verificarDependencias() {
        return new Promise((resolve, reject) => {
            console.log('🔍 Verificando dependências Python no ambiente virtual...');
            
            const python = spawn(this.pythonBinPath, ['-c', 'import pdfplumber; print("OK")'], {
                stdio: 'pipe'
            });

            let stdout = '';
            let stderr = '';

            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0 && stdout.includes('OK')) {
                    console.log('✅ Dependências Python OK');
                    resolve(true);
                } else {
                    console.log('⚠️ Dependências Python não encontradas');
                    resolve(false);
                }
            });

            python.on('error', (err) => {
                console.log('⚠️ Python não encontrado:', err.message);
                resolve(false);
            });
        });
    }
}

module.exports = PythonPDFService;
