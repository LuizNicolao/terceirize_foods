<?php
// filepath: c:\Xampp\htdocs\cotacao\includes\modal_aprovacoes.php
?>
<link rel="stylesheet" href="assets/css/modal_aprovacoes.css">
<div id="modalAnalise" class="modal">
    <div class="modal-content modal-analise">
        <span class="close">×</span>
        <div class="analise-header">
            <div class="analise-info">
                <h3>Análise Detalhada de Cotação</h3>
                <div id="info-cotacao" class="info-cotacao">
                    <!-- Informações básicas da cotação serão inseridas aqui -->
                </div>
            </div>
        </div>


        <!-- Novo cabeçalho de resumo -->
<div class="resumo-orcamento">
    <h4><i class="fas fa-chart-pie"></i> Resumo Orçamento Melhor Preço</h4>
    <div class="resumo-cards">
        <div class="resumo-card">
            <div class="resumo-valor" id="total-produtos">0</div>
            <div class="resumo-label">Produtos</div>
        </div>
        <div class="resumo-card">
            <div class="resumo-valor" id="total-fornecedores">0</div>
            <div class="resumo-label">Fornecedores</div>
        </div>
        <div class="resumo-card">
            <div class="resumo-valor" id="total-quantidade">0</div>
            <div class="resumo-label">Quantidade Total</div>
        </div>
        <div class="resumo-card">
            <div class="resumo-valor" id="total-valor">R$ 0,00</div>
            <div class="resumo-label">Valor Total</div>
        </div>
    </div>
</div>

<!-- Nova seção de comparação com última cotação -->
<div class="comparacao-cotacao">
    <div class="comparacao-header">
        <h4>Comparação com Última Cotação Aprovada</h4>
        <button class="btn-toggle-comparacao" onclick="toggleComparacao()">
            <i class="fas fa-chevron-down"></i>
        </button>
    </div>
    <div class="tabela-comparacao" style="display: none;">
        <table>
            <thead>
                <tr>
                    <th>Fornecedor</th>
                    <th>Valor Total Atual</th>
                    <th>Último Valor Total</th>
                    <th>Variação</th>
                </tr>
            </thead>
            <tbody id="comparacao-cotacao-body">
                <!-- Dados serão inseridos via JavaScript -->
            </tbody>
            <tfoot id="comparacao-cotacao-footer">
                <!-- Total geral será inserido via JavaScript -->
            </tfoot>
        </table>
    </div>
</div>

<!-- Nova seção de lista de produtos únicos -->
<div class="lista-produtos-unicos">
    <div class="lista-produtos-header">
        <h4>Lista de Produtos</h4>
        <button class="btn-toggle-lista" onclick="toggleListaProdutos()">
            <i class="fas fa-chevron-down"></i>
        </button>
    </div>
    <div class="tabela-produtos" style="display: none;">
        <table>
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody id="lista-produtos-body">
                <!-- Dados serão inseridos via JavaScript -->
            </tbody>
        </table>
    </div>
</div>

<!-- Botões de alternância -->
<div class="visualizacoes-toggle" style="display: flex; justify-content: center;">
<button id="btn-visualizacao-padrao" class="btn-view active" onclick="forcarVisualizacao('visualizacao-padrao')">
    <i class="fas fa-list"></i> Visualização Padrão
</button>
<button id="btn-visualizacao-resumo" class="btn-view" onclick="forcarVisualizacao('visualizacao-resumo')">
    <i class="fas fa-chart-bar"></i> Resumo Comparativo
</button>
<button id="btn-visualizacao-melhor-preco" class="btn-view" onclick="forcarVisualizacao('visualizacao-melhor-preco')">
    <i class="fas fa-tag"></i> Melhor Preço
</button>
<button id="btn-visualizacao-melhor-entrega" class="btn-view" onclick="forcarVisualizacao('visualizacao-melhor-entrega')">
    <i class="fas fa-truck"></i> Melhor Prazo de Entrega
</button>
<button id="btn-visualizacao-melhor-pagamento" class="btn-view" onclick="forcarVisualizacao('visualizacao-melhor-pagamento')">
    <i class="fas fa-credit-card"></i> Melhor Prazo de Pagamento
</button>
</div>


        
<div class="view-content">
    <!-- Visualização padrão (atual) -->
    <div id="visualizacao-padrao" class="visualizacao-container">
        
            <div class="versoes-list"></div>
        
        <div class="detalhes-cotacao">
            <div class="resumo-geral">
                <!-- Cards com totais e informações gerais -->
            </div>
            <div class="tabela-comparativa">
                <table>
                    <thead>
                    </thead>
                    <tbody>
                        <!-- Dados dinâmicos aqui -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <!-- Nova visualização: Resumo Comparativo -->
    <div id="visualizacao-resumo" class="visualizacao-container" style="display: none;">
        <div class="detalhes-cotacao">
            <h3>Resumo Comparativo</h3>
            
            <!-- Cards de comparativo -->
            <div class="resumo-economia">
                <div class="resumo-card valor-total">
                    <h4><i class="fas fa-dollar-sign"></i> Melhor Preço</h4>
                    <div class="resumo-valor" id="valor-total-resumo-preco">R$ 0,00</div>
                    <div class="resumo-porcentagem" id="quantidade-total-itens-resumo-preco">0 itens</div>
                </div>
                <div class="resumo-card economia-total">
                    <h4><i class="fas fa-truck"></i> Melhor Entrega</h4>
                    <div class="resumo-valor" id="valor-total-resumo-entrega">R$ 0,00</div>
                    <div class="resumo-porcentagem" id="quantidade-total-itens-resumo-entrega">0 itens</div>
                </div>
                <div class="resumo-card economia-ultimo-aprovado">
                    <h4><i class="fas fa-credit-card"></i> Melhor Pagamento</h4>
                    <div class="resumo-valor" id="valor-total-resumo-pagamento">R$ 0,00</div>
                    <div class="resumo-porcentagem" id="quantidade-total-itens-resumo-pagamento">0 itens</div>
                </div>
                <div class="resumo-card economia-media">
                    <h4><i class="fas fa-chart-line"></i> Economia vs Último Aprovado</h4>
                    <div class="resumo-item">
                        <div class="resumo-valor" id="economia-resumo-geral">R$ 0,00</div>
                        <div class="resumo-porcentagem" id="economia-resumo-porcentagem">0%</div>
                    </div>
                </div>
            </div>
            
            <div class="tabela-resumo">
                <table>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Critério</th>
                            <th>Fornecedor</th>
                            <th>Valor Unitário</th>
                            <th>Valor Total</th>
                            <th>Últ. Vlr. Aprovado</th>
                            <th>Economia vs Últ. Aprovado</th>
                            <th>Prazo Entrega</th>
                            <th>Prazo Pagamento</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-resumo-body">
                        <!-- Dados dinâmicos aqui -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Nova visualização: Melhor Preço -->
<div id="visualizacao-melhor-preco" class="visualizacao-container" style="display: none;">
    <div class="detalhes-cotacao">
        <div class="resumo-economia">
            <div class="resumo-card valor-total">
                <h4><i class="fas fa-dollar-sign"></i> Valor Total</h4>
                <div class="resumo-valor" id="valor-total-melhor-preco">R$ 0,00</div>
                <div class="resumo-porcentagem" id="quantidade-total-itens">0 itens</div>
            </div>
            <div class="resumo-card economia-total">
                <h4><i class="fas fa-chart-line"></i> Economia vs Média dos Preços</h4>
                <div class="resumo-valor" id="economia-total-valor">R$ 0,00</div>
                <div class="resumo-porcentagem" id="economia-total-porcentagem">0%</div>
            </div>
            <div class="resumo-card economia-ultimo-aprovado">
                <h4><i class="fas fa-history"></i> Economia vs Último Aprovado</h4>
                <div class="resumo-valor" id="economia-ultimo-valor">R$ 0,00</div>
                <div class="resumo-porcentagem" id="economia-ultimo-porcentagem">0%</div>
            </div>
            <div class="resumo-card economia-media">
                <h4><i class="fas fa-calculator"></i> Valor Sawing</h4>
                <div class="resumo-item">
                    <div class="resumo-valor" id="economia-media-valor">R$ 0,00</div>
                    <div class="resumo-porcentagem" id="economia-media-porcentagem">0%</div>
                </div>
            </div>
        </div>
        <h3>Itens com Melhor Preço</h3>
        <div class="tabela-melhor-preco">
            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Fornecedor</th>
                        <th>Qtd</th>
                        <th>Un</th>
                        <th>Valor Unitário</th>
                        <th>Valor Total</th>
                        <th>Últ. Vlr. Aprovado</th>
                        <th>Economia</th>
                        <th>Economia Total</th>
                        <th>Prazo Entrega</th>
                        <th>Prazo Pagamento</th>
                    </tr>
                </thead>
                <tbody id="tabela-melhor-preco-body">
                    <!-- Dados dinâmicos aqui -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Nova visualização: Melhor Prazo de Entrega -->
<div id="visualizacao-melhor-entrega" class="visualizacao-container" style="display: none;">
    <div class="detalhes-cotacao">
        <div class="resumo-economia">
            <div class="resumo-card valor-total">
                <h4><i class="fas fa-dollar-sign"></i> Valor Total</h4>
                <div class="resumo-valor" id="valor-total-melhor-entrega">R$ 0,00</div>
                <div class="resumo-porcentagem" id="quantidade-total-itens-entrega">0 itens</div>
            </div>
            <div class="resumo-card economia-total">
                <h4><i class="fas fa-chart-line"></i> Economia vs Média dos Preços</h4>
                <div class="resumo-valor" id="economia-total-valor-entrega">R$ 0,00</div>
                <div class="resumo-porcentagem" id="economia-total-porcentagem-entrega">0%</div>
            </div>
            <div class="resumo-card economia-ultimo-aprovado">
                <h4><i class="fas fa-history"></i> Economia vs Último Aprovado</h4>
                <div class="resumo-valor" id="economia-ultimo-valor-entrega">R$ 0,00</div>
                <div class="resumo-porcentagem" id="economia-ultimo-porcentagem-entrega">0%</div>
            </div>
            <div class="resumo-card economia-media">
                <h4><i class="fas fa-calculator"></i> Valor Sawing</h4>
                <div class="resumo-item">
                    <div class="resumo-valor" id="economia-media-valor-entrega">R$ 0,00</div>
                    <div class="resumo-porcentagem" id="economia-media-porcentagem-entrega">0%</div>
                </div>
            </div>
        </div>
        <h3>Itens com Melhor Prazo de Entrega</h3>
        <div class="tabela-melhor-entrega">
            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Fornecedor</th>
                        <th>Qtd</th>
                        <th>Un</th>
                        <th>Valor Unitário</th>
                        <th>Valor Total</th>
                        <th>Últ. Vlr. Aprovado</th>
                        <th>Economia</th>
                        <th>Economia Total</th>
                        <th>Prazo Entrega</th>
                        <th>Prazo Pagamento</th>
                    </tr>
                </thead>
                <tbody id="tabela-melhor-entrega-body">
                    <!-- Dados dinâmicos aqui -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Nova visualização: Melhor Prazo de Pagamento -->
<div id="visualizacao-melhor-pagamento" class="visualizacao-container" style="display: none;">
    <div class="detalhes-cotacao">
        <div class="resumo-economia">
            <div class="resumo-card valor-total">
                <h4><i class="fas fa-dollar-sign"></i> Valor Total</h4>
                <div class="resumo-valor" id="valor-total-melhor-pagamento">R$ 0,00</div>
                <div class="resumo-porcentagem" id="quantidade-total-itens-pagamento">0 itens</div>
            </div>
            <div class="resumo-card economia-total">
                <h4><i class="fas fa-chart-line"></i> Economia vs Média dos Preços</h4>
                <div class="resumo-valor" id="economia-total-valor-pagamento">R$ 0,00</div>
                <div class="resumo-porcentagem" id="economia-total-porcentagem-pagamento">0%</div>
            </div>
            <div class="resumo-card economia-ultimo-aprovado">
                <h4><i class="fas fa-history"></i> Economia vs Último Aprovado</h4>
                <div class="resumo-valor" id="economia-ultimo-valor-pagamento">R$ 0,00</div>
                <div class="resumo-porcentagem" id="economia-ultimo-porcentagem-pagamento">0%</div>
            </div>
            <div class="resumo-card economia-media">
                <h4><i class="fas fa-calculator"></i> Valor Sawing</h4>
                <div class="resumo-item">
                    <div class="resumo-valor" id="economia-media-valor-pagamento">R$ 0,00</div>
                    <div class="resumo-porcentagem" id="economia-media-porcentagem-pagamento">0%</div>
                </div>
            </div>
        </div>
        <h3>Itens com Melhor Prazo de Pagamento</h3>
        <div class="tabela-melhor-pagamento">
            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Fornecedor</th>
                        <th>Qtd</th>
                        <th>Un</th>
                        <th>Valor Unitário</th>
                        <th>Valor Total</th>
                        <th>Últ. Vlr. Aprovado</th>
                        <th>Economia</th>
                        <th>Economia Total</th>
                        <th>Prazo Entrega</th>
                        <th>Prazo Pagamento</th>
                    </tr>
                </thead>
                <tbody id="tabela-melhor-pagamento-body">
                    <!-- Dados dinâmicos aqui -->
                </tbody>
            </table>
        </div>
    </div>
</div>


</div>

        <!-- Movido os botões para fora do cabeçalho e para o final do modal -->
        <div id="analise-acoes" class="analise-acoes-footer">
            <!-- Botões de ação serão inseridos aqui -->
        </div>
        
        <div id="motivo-rejeicao" class="motivo-rejeicao" style="display: none;">
            <h4>Motivo da Rejeição</h4>
            <textarea id="texto-motivo-rejeicao" placeholder="Informe o motivo da rejeição..."></textarea>
            <button id="btn-confirmar-rejeicao" class="btn-grande btn-rejeitar-grande" onclick="confirmarRejeicao(currentCotacaoId, document.getElementById('texto-motivo-rejeicao').value)">
                <i class="fas fa-times"></i> Confirmar Rejeição
            </button>
        </div>

        <!-- Adicionar nova seção para renegociação -->
        <div id="motivo-renegociacao" class="motivo-rejeicao" style="display: none;">
            <h4>Motivo da Renegociação</h4>
            <textarea id="texto-motivo-renegociacao" placeholder="Informe o motivo da renegociação e as sugestões de ajustes..."></textarea>
            <button id="btn-confirmar-renegociacao" class="btn-grande btn-renegociar-grande" onclick="renegociarCotacao(currentCotacaoId, document.getElementById('texto-motivo-renegociacao').value)">
    <i class="fas fa-sync-alt"></i> Confirmar Renegociação
</button>


        </div>

        <div id="motivo-aprovacao" class="motivo-rejeicao" style="display: none;">
    <h4>Aprovação de Cotação</h4>
   
    <div class="opcoes-aprovacao" style="display: flex; flex-wrap: wrap; gap: 5px;">
        <label>
            <input type="radio" name="tipo-aprovacao" id="aprovacao-manual" value="manual" checked>
            Selecionar itens manualmente
        </label>
        <label>
            <input type="radio" name="tipo-aprovacao" id="aprovacao-melhor-preco" value="melhor-preco">
            Aprovar automaticamente itens com melhor preço
        </label>
        <label>
            <input type="radio" name="tipo-aprovacao" id="aprovacao-melhor-prazo-entrega" value="melhor-prazo-entrega">
            Aprovar automaticamente itens com melhor prazo de entrega
        </label>
        <label>
            <input type="radio" name="tipo-aprovacao" id="aprovacao-melhor-prazo-pagamento" value="melhor-prazo-pagamento">
            Aprovar automaticamente itens com melhor prazo de pagamento
        </label>
    </div>
   
    <div id="selecao-manual-container">
        <div id="lista-itens-aprovacao">
            <!-- Itens para seleção manual serão inseridos aqui -->
        </div>
    </div>
   
    <div id="resumo-melhor-preco" style="display: none;">
        <div id="lista-melhor-preco">
            <!-- Itens com melhor preço serão inseridos aqui -->
        </div>
    </div>

    <div id="resumo-melhor-prazo-entrega" style="display: none;">
        <div id="lista-melhor-prazo-entrega">
            <!-- Itens com melhor prazo de entrega serão inseridos aqui -->
        </div>
    </div>

    <div id="resumo-melhor-prazo-pagamento" style="display: none;">
        <div id="lista-melhor-prazo-pagamento">
            <!-- Itens com melhor prazo de pagamento serão inseridos aqui -->
        </div>
    </div>
   
    <textarea id="texto-motivo-aprovacao" placeholder="Informe o motivo da aprovação..."></textarea>
    <button id="btn-confirmar-aprovacao" class="btn-grande btn-aprovar-grande" onclick="confirmarAprovacao()">
        <i class="fas fa-check"></i> Confirmar Aprovação
    </button>
</div>




        <!-- Add inside modalAnalise -->
        <div id="historico-versoes" class="historico-versoes" style="display: none;">
            <h4>Histórico de Versões</h4>
            <div class="versoes-container"></div>
        </div>
    </div>
</div>


<script>
let currentCotacaoId = null;
let cotacaoData = null;
let itensMelhorPreco = [];
let itensSelecionadosManualmente = [];
let itensMelhorPrazoEntrega = []; // Nova variável
let itensMelhorPrazoPagamento = []; // Nova variável

// Função para calcular o número de rodadas com base nas versões
function calcularRodadas(versoes) {
    if (!versoes || versoes.length === 0) {
        return 1; // Se não houver versões, é a primeira rodada
    }
    
    // Filtrar apenas as versões que representam renegociações
    // Uma renegociação ocorre quando o status muda para 'renegociacao' e depois volta para 'aguardando_aprovacao'
    let rodadas = 1; // Começa com 1 (a rodada inicial)
    let ultimoStatus = null;
    
    // Ordenar versões por data (da mais antiga para a mais recente)
    const versoesOrdenadas = [...versoes].sort((a, b) => {
        return new Date(a.data_criacao) - new Date(b.data_criacao);
    });
    
    // Contar transições de status que indicam uma nova rodada
    versoesOrdenadas.forEach(versao => {
        // Se o status mudou de 'renegociacao' para 'aguardando_aprovacao', é uma nova rodada
        if (ultimoStatus === 'renegociacao' && versao.status === 'aguardando_aprovacao') {
            rodadas++;
        }
        ultimoStatus = versao.status;
    });
    
    return rodadas;
}



// Função para analisar uma cotação
function analisarCotacao(id) {
    console.log('Iniciando análise da cotação:', id);
    
    Promise.all([
        fetch(`api/cotacoes.php?id=${id}`),
        fetch(`api/cotacoes.php?acao=versoes&id=${id}`)
    ])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([data, versoesData]) => {
        console.log('Dados recebidos:', data);
        console.log('Versões recebidas:', versoesData);
        
        // Armazenar dados para uso posterior
        cotacaoData = data;
        currentCotacaoId = id;
        
        // Atualizar informações básicas
        document.getElementById('info-cotacao').innerHTML = `
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Comprador:</strong> ${data.usuario_nome}</p>
            <p><strong>Data Criação:</strong> ${formatarData(data.data_criacao)}</p>
            <p class="data-aprovacao"><strong>Data Aprovação/Rejeição:</strong> ${data.data_aprovacao ? formatarData(data.data_aprovacao) : 'Pendente'}</p>
            <p><strong>Status:</strong> <span class="status-badge ${data.status}">${traduzirStatus(data.status)}</span></p>
            <p><strong>Rodadas:</strong> <span class="rodadas-badge">${data.numero_rodadas || 1}</span></p>
            <p><strong>Tipo:</strong> ${data.tipo === 'emergencial' ? 
                `<span class="badge badge-warning"><i class="fas fa-exclamation-circle"></i> Emergencial</span>` : 
                `<span class="badge badge-info"><i class="fas fa-calendar"></i> Programada</span>`}</p>
            <p><strong>Local De entrega:</strong> ${data.centro_distribuicao || 'CD CHAPECO'}</p>
            ${data.tipo === 'emergencial' && data.motivo_emergencial ? 
                `<p><strong>Motivo Emergencial:</strong> ${data.motivo_emergencial}</p>` : ''}
        `;
        
        // Obter o número da versão atual (que representa o número de rodadas)
        let numeroRodadas = 1; // Valor padrão

        console.log('versoesData:', versoesData);
        console.log('versao_atual:', versoesData.versao_atual);
        console.log('versoes array:', versoesData.versoes);

        if (versoesData.versao_atual) {
    numeroRodadas = versoesData.versao_atual;
    console.log('Usando versao_atual:', numeroRodadas);
    } else if (versoesData.versoes && versoesData.versoes.length > 0) {
    // Verificar os valores de versão no array
    const versaoNumeros = versoesData.versoes.map(v => {
        const versaoNum = parseInt(v.versao) || 1;
        console.log(`Versão ${v.versao} convertida para ${versaoNum}`);
        return versaoNum;
    });
    
    console.log('Array de números de versão:', versaoNumeros);
    numeroRodadas = Math.max(...versaoNumeros);
    console.log('Maior número de versão encontrado:', numeroRodadas);
    }

    console.log('Número final de rodadas:', numeroRodadas);
        
        // Atualizar o resumo do orçamento
        atualizarResumoOrcamento(data);
        
        // Renderizar itens da cotação atual
        renderizarItensCotacaoParaRenegociacao(data);

        renderizarMelhorPreco();
        renderizarMelhorEntrega();
        renderizarMelhorPagamento();
        
        // Processar versões se existirem
        if (versoesData.versoes && versoesData.versoes.length > 0) {
            const versoes = versoesData.versoes;
            const versaoAtual = versoesData.versao_atual;
            
            renderizarHistoricoVersoes(versoes);
            
            // Comparar com versão anterior se houver mais de uma versão
            if (versoes.length > 1) {
                renderizarComparativo(versaoAtual, versoes[versoes.length - 2]);
            } else {
                console.log('Apenas uma versão disponível para comparação');
                document.getElementById('historico-versoes').innerHTML = '<p>Apenas uma versão disponível</p>';
            }
        } else {
            console.log('Nenhuma versão histórica disponível');
            document.getElementById('historico-versoes').innerHTML = '<p>Nenhuma versão histórica disponível</p>';
        }
        
        // Configurar botões de ação
        const acoesDiv = document.getElementById('analise-acoes');
        if (data.status === 'aguardando_aprovacao') {
            acoesDiv.innerHTML = `
                <button class="btn-grande btn-aprovar-grande" onclick="aprovarCotacao(${data.id})">
                    <i class="fas fa-check"></i> Aprovar Cotação
                </button>
                <button class="btn-grande btn-renegociar-grande" onclick="mostrarMotivoRenegociacao(${data.id})">
                    <i class="fas fa-sync-alt"></i> Renegociar Cotação
                </button>
                <button class="btn-grande btn-rejeitar-grande" onclick="mostrarMotivoRejeicao(${data.id})">
                    <i class="fas fa-times"></i> Rejeitar Cotação
                </button>
            `;
        } else {
            acoesDiv.innerHTML = '';
        }
        
        // Esconder o campo de motivo de rejeição
        document.getElementById('motivo-rejeicao').style.display = 'none';
        
        // Mostrar o modal
        document.getElementById('modalAnalise').style.display = 'block';

        // Adicionar a nova comparação de cotações
        atualizarComparacaoCotacao(data);
    })
    .catch(error => {
        console.error('Erro ao carregar detalhes da cotação:', error);
        alert('Erro ao carregar detalhes da cotação: ' + error.message);
    });
}

function renderizarItensCotacao(itens) {
    const tbody = document.querySelector('#itensCotacao tbody');
    tbody.innerHTML = '';

        itens.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.produto_nome}</td>
            <td>${item.qtd}</td>
            <td>${item.ultimo_valor_aprovado ? 'R$ ' + formatarNumero(item.ultimo_valor_aprovado) : '-'}</td>
            <td>${item.ultimo_valor ? 'R$ ' + formatarNumero(item.ultimo_valor) : '-'}</td>
            <td>${item.valor_unitario ? 'R$ ' + formatarNumero(item.valor_unitario) : '-'}</td>
            <td>${item.valor_unitario_difal_frete ? 'R$ ' + formatarNumero(item.valor_unitario_difal_frete) : '-'}</td>
            <td>${item.total ? 'R$ ' + formatarNumero(item.total) : '-'}</td>
            <td>${item.variacao_percentual ? formatarNumero(item.variacao_percentual) + '%' : '-'}</td>
            <td>${item.variacao_reais ? 'R$ ' + formatarNumero(item.variacao_reais) : '-'}</td>
            <td>
                <button class="btn-acao btn-visualizar" onclick="verDetalhesProduto('${item.produto_id}', '${item.fornecedor_nome}')" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


// Função para mostrar o campo de motivo de aprovação
function mostrarMotivoAprovacao(id) {
    // Esconder outros campos de motivo que possam estar visíveis
    document.getElementById('motivo-rejeicao').style.display = 'none';
    document.getElementById('motivo-renegociacao').style.display = 'none';

    // Limpar seleções anteriores
    itensSelecionadosManualmente = [];
    itensMelhorPreco = [];
    itensMelhorPrazoEntrega = [];
    itensMelhorPrazoPagamento = [];

    // Mostrar o campo de motivo de aprovação
    const motivoAprovacaoDiv = document.getElementById('motivo-aprovacao');
    if (!motivoAprovacaoDiv) {
        console.error('Modal de aprovação não encontrado');
        return;
    }

    // Verificar e criar containers necessários dinamicamente
    const textoMotivoInput = document.getElementById('texto-motivo-aprovacao');

    const containers = [
        { id: 'selecao-manual-container', inner: '<div id="lista-itens-aprovacao"></div>' },
        { id: 'resumo-melhor-preco', inner: '<div id="lista-melhor-preco"></div>' },
        { id: 'resumo-melhor-prazo-entrega', inner: '<div id="lista-melhor-prazo-entrega"></div>' },
        { id: 'resumo-melhor-prazo-pagamento', inner: '<div id="lista-melhor-prazo-pagamento"></div>' }
    ];

    containers.forEach(cfg => {
        if (!document.getElementById(cfg.id)) {
            const container = document.createElement('div');
            container.id = cfg.id;
            container.style.display = 'none';
            container.innerHTML = cfg.inner;
            motivoAprovacaoDiv.insertBefore(container, textoMotivoInput);
        }
    });

    motivoAprovacaoDiv.style.display = 'block';

    // Limpar o texto anterior, se houver
    textoMotivoInput.value = '';

    // Armazenar o ID da cotação para uso posterior
    currentCotacaoId = id;

    // Preparar os itens para seleção manual
    prepararItensParaAprovacao();

    // Configurar os radio buttons
    document.getElementById('aprovacao-manual').addEventListener('change', function () {
        document.getElementById('selecao-manual-container').style.display = 'block';
        document.getElementById('resumo-melhor-preco').style.display = 'none';
        document.getElementById('resumo-melhor-prazo-entrega').style.display = 'none';
        document.getElementById('resumo-melhor-prazo-pagamento').style.display = 'none';
    });

    document.getElementById('aprovacao-melhor-preco').addEventListener('change', function () {
        document.getElementById('selecao-manual-container').style.display = 'none';
        document.getElementById('resumo-melhor-preco').style.display = 'block';
        document.getElementById('resumo-melhor-prazo-entrega').style.display = 'none';
        document.getElementById('resumo-melhor-prazo-pagamento').style.display = 'none';
    });

    document.getElementById('aprovacao-melhor-prazo-entrega').addEventListener('change', function () {
        document.getElementById('selecao-manual-container').style.display = 'none';
        document.getElementById('resumo-melhor-preco').style.display = 'none';
        document.getElementById('resumo-melhor-prazo-entrega').style.display = 'block';
        document.getElementById('resumo-melhor-prazo-pagamento').style.display = 'none';
    });

    document.getElementById('aprovacao-melhor-prazo-pagamento').addEventListener('change', function () {
        document.getElementById('selecao-manual-container').style.display = 'none';
        document.getElementById('resumo-melhor-preco').style.display = 'none';
        document.getElementById('resumo-melhor-prazo-entrega').style.display = 'none';
        document.getElementById('resumo-melhor-prazo-pagamento').style.display = 'block';
    });

    // Calcular os itens com melhores critérios
    if (cotacaoData && cotacaoData.itens) {
        const produtosAgrupados = {};

        cotacaoData.itens.forEach(item => {
            const nomeProduto = item.produto_nome;
            if (!produtosAgrupados[nomeProduto]) {
                produtosAgrupados[nomeProduto] = [];
            }
            produtosAgrupados[nomeProduto].push(item);
        });

        Object.entries(produtosAgrupados).forEach(([nomeProduto, itens]) => {
            // Melhor preço
            const itensPorPreco = [...itens].sort((a, b) => parseFloat(a.valor_unitario) - parseFloat(b.valor_unitario));
            if (itensPorPreco.length > 0) {
                itensMelhorPreco.push({
                    produto_id: itensPorPreco[0].produto_id,
                    fornecedor_nome: itensPorPreco[0].fornecedor_nome
                });
            }

            // Melhor prazo de entrega
            const itensComPrazoEntrega = itens.filter(item => item.prazo_entrega && item.prazo_entrega.trim() !== '');
            if (itensComPrazoEntrega.length > 0) {
                const itensPorPrazoEntrega = [...itensComPrazoEntrega].sort((a, b) => {
                    const diasA = parseInt(a.prazo_entrega.match(/\d+/)[0] || 999);
                    const diasB = parseInt(b.prazo_entrega.match(/\d+/)[0] || 999);
                    return diasA - diasB;
                });

                itensMelhorPrazoEntrega.push({
                    produto_id: itensPorPrazoEntrega[0].produto_id,
                    fornecedor_nome: itensPorPrazoEntrega[0].fornecedor_nome
                });
            } else if (itens.length > 0) {
                itensMelhorPrazoEntrega.push({
                    produto_id: itens[0].produto_id,
                    fornecedor_nome: itens[0].fornecedor_nome
                });
            }

            // Melhor prazo de pagamento
            const itensComPrazoPagamento = itens.filter(item => item.prazo_pagamento && item.prazo_pagamento.trim() !== '');
            if (itensComPrazoPagamento.length > 0) {
                const itensPorPrazoPagamento = [...itensComPrazoPagamento].sort((a, b) => {
                    const diasA = parseInt(a.prazo_pagamento.match(/\d+/)[0] || 0);
                    const diasB = parseInt(b.prazo_pagamento.match(/\d+/)[0] || 0);
                    return diasB - diasA; // Ordem decrescente (maior prazo é melhor)
                });

                itensMelhorPrazoPagamento.push({
                    produto_id: itensPorPrazoPagamento[0].produto_id,
                    fornecedor_nome: itensPorPrazoPagamento[0].fornecedor_nome
                });
            } else if (itens.length > 0) {
                itensMelhorPrazoPagamento.push({
                    produto_id: itens[0].produto_id,
                    fornecedor_nome: itens[0].fornecedor_nome
                });
            }
        });

        console.log('Itens com melhor preço:', itensMelhorPreco);
        console.log('Itens com melhor prazo de entrega:', itensMelhorPrazoEntrega);
        console.log('Itens com melhor prazo de pagamento:', itensMelhorPrazoPagamento);
    }

    // Focar no campo de texto
    textoMotivoInput.focus();
}


function renderizarHistoricoVersoes(versoes) {
    const container = document.querySelector('.versoes-list');
    let html = '<div class="versoes-timeline">';
    
    // Show all versions in reverse order (newest first)
    versoes.reverse().forEach((versao, index) => {
        const isLatest = index === 0;
        const isOriginal = index === versoes.length - 1;
        
        html += `
            <div class="versao-item ${isLatest ? 'versao-atual' : ''} ${isOriginal ? 'versao-original' : ''}">
                <div class="versao-numero">
                    Versão ${versao.versao}
                    ${isLatest ? ' (Atual)' : ''}
                    ${isOriginal ? ' (Original)' : ''}
                </div>
                <div class="versao-data">${formatarData(versao.data_criacao)}</div>
                <div class="versao-usuario">por ${versao.usuario_nome}</div>
                <div class="versao-motivo">${versao.motivo_renegociacao || ''}</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderizarComparativo(versaoAtual, versaoAnterior) {
    const container = document.querySelector('.tabela-comparativa');
    let html = `
        <table class="table table-bordered table-hover">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Ult. Vlr. Aprovado</th>
                    <th>Valor Anterior</th>
                    <th>Valor Unit.</th>
                    <th>Valor Unit. + Difal/Frete</th>
                    <th>Total</th>
                    <th>Variação %</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Obter todos os produtos da versão atual
    const todosProdutos = versaoAtual.itens.map(i => i.produto_nome);
    const produtosUnicos = [...new Set(todosProdutos)];

    // Mapear menor preço por produto
    const menoresPrecos = {};
    produtosUnicos.forEach(nome => {
        const precos = versaoAtual.itens
            .filter(i => i.produto_nome === nome)
            .map(i => parseFloat(i.valor_unitario));
        menoresPrecos[nome] = Math.min(...precos);
    });

    // Agrupar por fornecedor
    const fornecedores = {};
    versaoAtual.itens.forEach(item => {
        if (!fornecedores[item.fornecedor_nome]) {
            fornecedores[item.fornecedor_nome] = {
                nome: item.fornecedor_nome,
                prazo_pagamento: item.prazo_pagamento,
                prazo_entrega: item.prazo_entrega,
                frete: item.frete,
                difal: item.difal,
                itens: []
            };
        }
        fornecedores[item.fornecedor_nome].itens.push(item);
    });

    // Renderizar comparativo por fornecedor
    Object.values(fornecedores).forEach(fornecedor => {
        html += `
            <div class="fornecedor-section">
                <div class="fornecedor-info">
                    <h4>${fornecedor.nome}</h4>
                    <div class="info-grid">
                        <div class="info-item"><strong>Pagamento:</strong> ${fornecedor.prazo_pagamento}</div>
                        <div class="info-item"><strong>Entrega:</strong> ${fornecedor.prazo_entrega}</div>
                        <div class="info-item"><strong>Frete:</strong> R$ ${formatarNumero(fornecedor.frete)}</div>
                        <div class="info-item"><strong>DIFAL:</strong> ${fornecedor.difal}%</div>
                        <div class="info-item"><strong>Valor Total:</strong> R$ ${formatarNumero(fornecedor.itens[0].valor_total || 0)}</div>
                    </div>
                </div>

                <table class="comparativo-table">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Qtd</th>
                            <th>Ult. Vlr. Aprovado</th>
                            <th>Valor Anterior</th>
                            <th>Valor Atual</th>
                            <th>Variação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fornecedor.itens.map(itemAtual => {
                            const nome = itemAtual.produto_nome;
                            const valorAtual = parseFloat(itemAtual.valor_unitario);
                            const ehMelhorPreco = valorAtual === menoresPrecos[nome];

                            // Determinar valor anterior
                            let valorAnterior = itemAtual.valor_anterior ? parseFloat(itemAtual.valor_anterior) : 0;
                            if (!valorAnterior && versaoAnterior) {
                                const itemAnterior = versaoAnterior.itens.find(i =>
                                    i.produto_nome === nome &&
                                    i.fornecedor_nome === itemAtual.fornecedor_nome
                                );
                                valorAnterior = itemAnterior ? parseFloat(itemAnterior.valor_unitario) : 0;
                            }

                            // Determinar variação com base no último valor aprovado
                            let variacao = 0;
                            let variacaoClass = 'variacao-neutra';
                            let variacaoTexto = '0%';
                            let variacaoReais = 'R$ 0,00';

                            if (itemAtual.ultimo_valor_aprovado && parseFloat(itemAtual.ultimo_valor_aprovado) > 0) {
                                const valorAtual = parseFloat(itemAtual.valor_unitario);
                                const ultimoValorAprovado = parseFloat(itemAtual.ultimo_valor_aprovado);
                                
                                // Calcular valores totais considerando a quantidade
                                const valorTotalAtual = valorAtual * quantidade;
                                const valorTotalUltimo = ultimoValorAprovado * quantidade;
                                
                                // Calcular variação percentual
                                variacao = ((valorTotalAtual - valorTotalUltimo) / valorTotalUltimo) * 100;
                                const variacaoValor = valorTotalAtual - valorTotalUltimo;

                                if (variacao > 0) {
                                    variacaoClass = 'variacao-positiva';
                                    variacaoTexto = `+${variacao.toFixed(2)}%`;
                                    variacaoReais = `+R$ ${formatarNumero(Math.abs(variacaoValor))}`;
                                } else if (variacao < 0) {
                                    variacaoClass = 'variacao-negativa';
                                    variacaoTexto = `${variacao.toFixed(2)}%`;
                                    variacaoReais = `-R$ ${formatarNumero(Math.abs(variacaoValor))}`;
                                } else {
                                    variacaoReais = 'R$ 0,00';
                                }
                            } else {
                                variacaoTexto = 'N/A';
                                variacaoReais = 'N/A';
                            }

                            const variacaoFormatada = `<span class="coluna-variacao ${variacaoClass}" title="Último valor aprovado: ${itemAtual.ultimo_valor_aprovado ? 'R$ ' + formatarNumero(itemAtual.ultimo_valor_aprovado) : 'N/A'}">${variacaoTexto}</span>`;
                            const variacaoReaisFormatada = `<span class="coluna-variacao ${variacaoClass}" title="Último valor aprovado: ${itemAtual.ultimo_valor_aprovado ? 'R$ ' + formatarNumero(itemAtual.ultimo_valor_aprovado) : 'N/A'}">${variacaoReais}</span>`;

                            return `
                                <tr>
                                    <td>${nome}</td>
                                    <td>${itemAtual.quantidade}</td>
                                    <td>${itemAtual.ultimo_valor_aprovado ? 'R$ ' + formatarNumero(itemAtual.ultimo_valor_aprovado) : '-'}</td>
                                    <td>R$ ${formatarNumero(valorAnterior)}</td>
                                    <td class="${ehMelhorPreco ? 'melhor-preco' : ''}">R$ ${formatarNumero(valorAtual)}</td>
                                    <td class="${variacaoClass}" title="Último valor aprovado: ${itemAtual.ultimo_valor_aprovado ? 'R$ ' + formatarNumero(itemAtual.ultimo_valor_aprovado) : 'N/A'}">${variacaoFormatada}</td>
                                    <td class="${variacaoClass}" title="Último valor aprovado: ${itemAtual.ultimo_valor_aprovado ? 'R$ ' + formatarNumero(itemAtual.ultimo_valor_aprovado) : 'N/A'}">${variacaoReaisFormatada}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });

    html += `
        </tbody>
    </table>
    `;

    container.innerHTML = html;
}


function renderizarItensCotacaoParaRenegociacao(data) {
    const container = document.querySelector('.tabela-comparativa tbody');
    let html = '';

    const cotacaoAprovada = data.status === 'aprovado';

    let itensParaExibir = data.itens;
    if (cotacaoAprovada) {
        itensParaExibir = data.itens.filter(item => item.aprovado === 1 || item.aprovado === '1' || item.aprovado === true);
        console.log('Exibindo apenas itens aprovados:', itensParaExibir.length, 'de', data.itens.length);
    }

    if (!itensParaExibir || itensParaExibir.length === 0) {
        container.innerHTML = '<tr><td colspan="10" class="text-center">Nenhum item aprovado para exibição</td></tr>';
        return;
    }

    const produtosRenegociar = {};
    console.log('Dados completos:', data);
    console.log('Produtos para renegociar:', data.produtos_renegociar);

    if (data.produtos_renegociar && Array.isArray(data.produtos_renegociar)) {
        data.produtos_renegociar.forEach(item => {
            const prodId = String(item.produto_id);
            const fornecedor = String(item.fornecedor_nome);
            produtosRenegociar[`${prodId}_${fornecedor}`] = true;
            produtosRenegociar[`${prodId}`] = true;
        });
    }

    const itensPorFornecedor = {};
    itensParaExibir.forEach(item => {
        if (!itensPorFornecedor[item.fornecedor_nome]) {
            itensPorFornecedor[item.fornecedor_nome] = [];
        }
        itensPorFornecedor[item.fornecedor_nome].push(item);
    });

    Object.entries(itensPorFornecedor).forEach(([fornecedorNome, itens]) => {
        const fornecedorObj = {
            nome: fornecedorNome,
            difal: parseFloat(itens[0].difal || 0),
            frete: parseFloat(itens[0].frete || 0),
            itens: itens
        };

        // Calcular valor total do fornecedor incluindo DIFAL e frete
        const valorTotal = itens.reduce((total, item) => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const valorUnitario = parseFloat(item.valor_unitario) || 0;
            const valorUnitarioComDifalEFrete = calcularValorUnitarioComDifalEFrete(item, fornecedorObj);
            return total + (quantidade * valorUnitarioComDifalEFrete);
        }, 0);

        html += `
            <tr class="fornecedor-header">
                <td colspan="11">
                    <h4>${fornecedorNome}</h4>
                    <div class="fornecedor-detalhes-linha">
                        <span><strong>Pagamento:</strong> ${itens[0].prazo_pagamento || 'N/A'}</span>
                        <span><strong>Frete:</strong> R$ ${formatarNumero(itens[0].frete || 0)}</span>
                        <span><strong>DIFAL:</strong> ${itens[0].difal || '0'}%</span>
                        <span><strong>Valor Total:</strong> R$ ${formatarNumero(valorTotal)}</span>
                    </div>
                </td>
            </tr>
            <tr class="tabela-header">
                <th>Produto</th>
                <th>Qtd</th>
                <th>UN</th>
                <th>Prazo Entrega</th>
                <th>Ult. Vlr. Aprovado</th>
                <th>Ult. Fn. Aprovado</th>
                <th>Valor Anterior</th>
                <th>Valor Unit.</th>
                <th>Valor Unit. + Difal/Frete</th>
                <th>Data Entrega Fn</th>
                <th>Total</th>
                <th>Vlr Total Ult Aprv</th>
                <th>Variação % Total</th>
                <th>Variação R$ Total</th>
            </tr>
        `;

        itens.forEach(item => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const valorUnitario = parseFloat(item.valor_unitario) || 0;
            const valorUnitarioComDifalEFrete = calcularValorUnitarioComDifalEFrete(item, fornecedorObj);
            const valorItemTotal = quantidade * valorUnitarioComDifalEFrete;

            const produtoId = String(item.produto_id || item.produto_codigo || '');
            const fornecedorNomeStr = String(item.fornecedor_nome);
            const key1 = `${produtoId}_${fornecedorNomeStr}`;
            const key2 = `${produtoId}`;
            const estaMarcado = produtosRenegociar[key1] || produtosRenegociar[key2] ? 'checked' : '';
            const classeAprovado = cotacaoAprovada ? 'item-aprovado' : '';

            const ultimoValor = item.ultimo_preco || item.valor_unitario;

            // Adicionar lógica de comparação de preços
            let classeVariacaoPreco = 'variacao-preco-neutra';
            if (item.ultimo_preco && parseFloat(item.ultimo_preco) > 0) {
                const valorAtual = parseFloat(item.valor_unitario);
                const valorAnterior = parseFloat(item.ultimo_preco);
                if (valorAtual < valorAnterior) {
                    classeVariacaoPreco = 'variacao-preco-positiva';
                } else if (valorAtual > valorAnterior) {
                    classeVariacaoPreco = 'variacao-preco-negativa';
                }
            }

            let variacao = 0;
            let variacaoClass = 'variacao-neutra';
            let variacaoTexto = '0%';
            let variacaoReais = 'R$ 0,00';

            if (item.ultimo_valor_aprovado && parseFloat(item.ultimo_valor_aprovado) > 0) {
                const valorAtual = parseFloat(item.valor_unitario);
                const ultimoValorAprovado = parseFloat(item.ultimo_valor_aprovado);
                
                // Calcular valores totais considerando a quantidade
                const valorTotalAtual = valorUnitarioComDifalEFrete * quantidade;
                const valorTotalUltimo = ultimoValorAprovado * quantidade;
                
                // Calcular variação percentual com mais precisão
                variacao = ((valorTotalAtual - valorTotalUltimo) / valorTotalUltimo) * 100;
                const variacaoValor = valorTotalAtual - valorTotalUltimo;

                if (variacao > 0) {
                    variacaoClass = 'variacao-positiva';
                    variacaoTexto = `+${variacao.toFixed(2)}%`;
                    variacaoReais = `+R$ ${formatarNumero(Math.abs(variacaoValor))}`;
                } else if (variacao < 0) {
                    variacaoClass = 'variacao-negativa';
                    variacaoTexto = `${variacao.toFixed(2)}%`;
                    variacaoReais = `-R$ ${formatarNumero(Math.abs(variacaoValor))}`;
                } else {
                    variacaoReais = 'R$ 0,00';
                }
            } else {
                variacaoTexto = 'N/A';
                variacaoReais = 'N/A';
            }

            const variacaoFormatada = `<span class="coluna-variacao ${variacaoClass}" title="Último valor aprovado: ${item.ultimo_valor_aprovado ? 'R$ ' + formatarNumero(item.ultimo_valor_aprovado) : 'N/A'}">${variacaoTexto}</span>`;
            const variacaoReaisFormatada = `<span class="coluna-variacao ${variacaoClass}" title="Último valor aprovado: ${item.ultimo_valor_aprovado ? 'R$ ' + formatarNumero(item.ultimo_valor_aprovado) : 'N/A'}">${variacaoReais}</span>`;

    const numRodadas = item.rodadas ? parseInt(item.rodadas) : 0;

    let rodadasClass = 'rodadas-badge';
    if (numRodadas >= 3) {
        rodadasClass += ' rodadas-alta';
    } else if (numRodadas >= 2) {
        rodadasClass += ' rodadas-media';
    } else {
        rodadasClass += ' rodadas-baixa';
    }

    let tooltipRodadas = '';
    if (numRodadas === 0) {
        tooltipRodadas = 'Primeira negociação';
    } else if (numRodadas === 1) {
        tooltipRodadas = '1 rodada de renegociação';
    } else {
        tooltipRodadas = `${numRodadas} rodadas de renegociação`;
    }

    const rodadasBadge = `<span class="${rodadasClass}" title="${tooltipRodadas}">${numRodadas}</span>`;

    html += `
        <tr class="${classeAprovado}">
            <td>
                ${!cotacaoAprovada ? `
                    <input
                        type="checkbox"
                        class="checkbox-renegociar"
                        data-produto-id="${produtoId}"
                        data-fornecedor="${fornecedorNomeStr}"
                        style="margin-right: 6px;"
                        ${estaMarcado}
                    >
                ` : ''}
                ${item.produto_nome} ${rodadasBadge}
            </td>
            <td>${item.quantidade}</td>
            <td>${item.produto_unidade || 'UN'}</td>
            <td>${item.prazo_entrega || 'Não informado'}</td>
            <td>${item.ultimo_valor_aprovado ? 'R$ ' + formatarNumero(item.ultimo_valor_aprovado) : '-'}</td>
                <td>${item.ultimo_fornecedor_aprovado || '-'}</td>
            <td>R$ ${formatarNumero(ultimoValor)}</td>
                <td class="${classeVariacaoPreco}">R$ ${formatarNumero(item.valor_unitario)}</td>
            <td>R$ ${formatarNumero(valorUnitarioComDifalEFrete)}</td>
            <td>${item.data_entrega_fn || '-'}</td>
            <td>R$ ${formatarNumero(valorItemTotal)}</td>
            <td>${item.ultimo_valor_aprovado ? 'R$ ' + formatarNumero(parseFloat(item.ultimo_valor_aprovado) * parseFloat(item.quantidade)) : '-'}</td>
            <td>${variacaoFormatada}</td>
            <td>${variacaoReaisFormatada}</td>
        </tr>
    `;
        });
    });

    container.innerHTML = html;
}

// Adicionar a função verDetalhesProduto
function verDetalhesProduto(produtoId, fornecedorNome) {
    // Encontrar o nome do produto na linha atual
    const row = event.target.closest('tr');
    const produtoNome = row.querySelector('td:first-child').textContent.trim();

    // Remover o número de rodadas e edições do nome do produto
    const nomeLimpo = produtoNome.replace(/\d+$/g, '').trim();

    // Garantir que temos um ID válido
    if (!produtoId || produtoId === 'null') {
        // Se não tiver ID, usar o nome do produto como identificador
        produtoId = nomeLimpo;
            }

    // Abrir o modal de histórico
    abrirModalHistorico(produtoId, nomeLimpo, fornecedorNome);
    }


function renegociarCotacao(id, motivoTexto) {
    let motivoRenegociacao = motivoTexto || document.getElementById('texto-motivo-renegociacao').value.trim();

    const produtosSelecionados = Array.from(document.querySelectorAll('.checkbox-renegociar:checked'))
        .map(cb => {
            const produtoId = parseInt(cb.dataset.produtoId);
            const fornecedorNome = cb.dataset.fornecedor?.trim();
            
            // Validação mais rigorosa dos dados
            if (isNaN(produtoId) || produtoId <= 0 || !fornecedorNome) {
                console.warn('Produto inválido ignorado:', { produtoId, fornecedorNome });
                return null;
            }
            
            return {
                produto_id: produtoId,
                fornecedor_nome: fornecedorNome
            };
        })
        .filter(p => p !== null);

    if (produtosSelecionados.length === 0) {
        alert('Selecione ao menos um produto válido para renegociar.');
        return;
    }

    if (!motivoRenegociacao) {
        alert('Por favor, informe o motivo da renegociação.');
        document.getElementById('texto-motivo-renegociacao').focus();
        return;
    }

    if (confirm('Tem certeza que deseja enviar esta cotação para renegociação?')) {
        // Buscar a cotação original para preservar os primeiros valores
        fetch(`api/cotacoes.php?id=${id}`)
            .then(response => response.json())
            .then(cotacaoOriginal => {
                const primeirosValores = {};
                cotacaoOriginal.itens.forEach(item => {
                    const chave = `${item.produto_id}_${item.fornecedor_nome}`;
                    primeirosValores[chave] = item.primeiro_valor || item.valor_unitario;
                });

                // Montar payload completo com os fornecedores e produtos
                const fornecedores = [];

                produtosSelecionados.forEach(p => {
                    let fornecedor = fornecedores.find(f => f.fornecedor_nome === p.fornecedor_nome);
                    if (!fornecedor) {
                        fornecedor = { fornecedor_nome: p.fornecedor_nome, produtos: [] };
                        fornecedores.push(fornecedor);
                    }

                    const chave = `${p.produto_id}_${p.fornecedor_nome}`;
                    fornecedor.produtos.push({
                        id: p.produto_id,
                        primeiro_valor: primeirosValores[chave] || null
                    });
                });

                const payload = {
                    id: id,
                    status: 'renegociacao',
                    motivo_renegociacao: motivoRenegociacao,
                    produtos_renegociar: produtosSelecionados,
                    fornecedores: fornecedores,
                    primeiros_valores: primeirosValores // Adicionando os primeiros valores ao payload
                };

                console.log('Enviando renegociação:', payload);

                fetch('api/cotacoes.php', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        alert('Cotação enviada para renegociação com sucesso!');
                        window.location.reload();
                    } else {
                        alert(data.message || 'Erro ao enviar cotação para renegociação');
                    }
                })
                .catch(error => {
                    console.error('Erro ao enviar renegociação:', error);
                    alert('Erro ao processar requisição');
                });
            })
            .catch(error => {
                console.error('Erro ao buscar cotação original:', error);
                alert('Erro ao buscar dados da cotação');
            });
    }
}



function aprovarCotacao(id) {
    mostrarMotivoAprovacao(id);
}

function mostrarMotivoRejeicao(id) {
    console.log('Mostrando campo de motivo de rejeição para cotação', id);
    currentCotacaoId = id;
    
    // Exibir o campo de motivo
    const motivoDiv = document.getElementById('motivo-rejeicao');
    motivoDiv.style.display = 'block';
    
    // Limpar qualquer texto anterior
    document.getElementById('texto-motivo-rejeicao').value = '';
    
    // Rolar para o campo de motivo
    motivoDiv.scrollIntoView({ behavior: 'smooth' });
}

function rejeitarCotacao(id) {
    // Esconder outros campos de motivo que possam estar visíveis
    document.getElementById('motivo-aprovacao').style.display = 'none';
    document.getElementById('motivo-renegociacao').style.display = 'none';
    
    // Mostrar o campo de motivo de rejeição
    const motivoRejeicaoDiv = document.getElementById('motivo-rejeicao');
    motivoRejeicaoDiv.style.display = 'block';
    
    // Limpar o texto anterior, se houver
    document.getElementById('texto-motivo-rejeicao').value = '';
    
    // Armazenar o ID da cotação para uso posterior
    currentCotacaoId = id;
    
    // Focar no campo de texto
    document.getElementById('texto-motivo-rejeicao').focus();
    
    // O botão de confirmar rejeição já deve estar configurado no HTML para chamar
    // a função confirmarRejeicao(currentCotacaoId, motivo)
}

// Função para confirmar a rejeição após o preenchimento do motivo
function confirmarRejeicao(id, motivo) {
    // Validar se o motivo foi preenchido
    if (!motivo.trim()) {
        alert('Por favor, informe o motivo da rejeição.');
        return;
    }
    
    // Confirmação final
    if (confirm('Tem certeza que deseja rejeitar esta cotação?')) {
        fetch('api/cotacoes.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                status: 'rejeitado',
                motivo_rejeicao: motivo
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Cotação rejeitada com sucesso!');
                window.location.reload();
            } else {
                alert(data.message || 'Erro ao rejeitar cotação');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao processar requisição');
        });
    }
}

let produtosSelecionadosParaRenegociacao = [];

function mostrarMotivoRenegociacao(id) {
    console.log('Mostrando campo de motivo de renegociação para cotação', id);
    
    // Esconder outros campos de motivo que possam estar visíveis
    document.getElementById('motivo-rejeicao').style.display = 'none';
    document.getElementById('motivo-aprovacao').style.display = 'none';
    
    // Mostrar o campo de motivo de renegociação
    const motivoDiv = document.getElementById('motivo-renegociacao');
    motivoDiv.style.display = 'block';
    
    // Limpar o texto anterior, se houver
    document.getElementById('texto-motivo-renegociacao').value = '';
    
    // Armazenar o ID da cotação para uso posterior
    currentCotacaoId = id;
    
    // Focar no campo de texto
    document.getElementById('texto-motivo-renegociacao').focus();
    
    // Verificar se os checkboxes já existem, se não, adicioná-los
    const linhasProdutos = document.querySelectorAll('.tabela-comparativa tbody tr:not(.fornecedor-header)');
    linhasProdutos.forEach(linha => {
        const primeiraCelula = linha.querySelector('td:first-child');
        if (primeiraCelula && !primeiraCelula.querySelector('.checkbox-renegociar')) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'checkbox-renegociar';
            checkbox.dataset.produtoId = linha.dataset.produtoId || '';
            checkbox.dataset.fornecedor = linha.dataset.fornecedor || '';
            checkbox.style.marginRight = '6px';
            primeiraCelula.insertBefore(checkbox, primeiraCelula.firstChild);
        }
    });
    
    // Rolar para o campo de motivo
    motivoDiv.scrollIntoView({ behavior: 'smooth' });
}

// Funções auxiliares
function formatarData(dataString) {
    if (!dataString) return 'N/A';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
}

function formatarNumero(valor) {
    if (valor === null || valor === undefined || isNaN(parseFloat(valor))) {
        return '0,000';
    }
    return parseFloat(valor).toFixed(4).replace('.', ',');
}

function traduzirStatus(status) {
    const traducoes = {
        'pendente': 'Pendente',
        'aguardando_aprovacao': 'Aguardando Aprovação',
        'aprovado': 'Aprovado',
        'rejeitado': 'Rejeitado',
        'renegociacao': 'Em Renegociação'
    };
    
    return traducoes[status] || status;
}

// Função para alternar entre as visualizações
function alternarVisualizacao(viewId) {
    console.log('Alternando para visualização:', viewId);
    
    // Esconder todas as visualizações definindo explicitamente o estilo inline
    document.querySelectorAll('.visualizacao-container').forEach(el => {
        el.style.display = 'none';
    });
    
    // Remover classe 'active' de todos os botões
    document.querySelectorAll('.btn-view').forEach(el => {
        el.classList.remove('active');
    });
    
    // Mostrar a visualização selecionada
    const viewElement = document.getElementById(viewId);
    if (viewElement) {
        viewElement.style.display = 'block';
        console.log('Exibindo elemento:', viewId);
        
        // Forçar a renderização dos dados na visualização selecionada
        if (viewId === 'visualizacao-melhor-preco') {
            console.log('Forçando renderização de melhor preço');
            renderizarMelhorPreco();
        } else if (viewId === 'visualizacao-melhor-entrega') {
            console.log('Forçando renderização de melhor entrega');
            renderizarMelhorEntrega();
        } else if (viewId === 'visualizacao-melhor-pagamento') {
            console.log('Forçando renderização de melhor pagamento');
            renderizarMelhorPagamento();
        }
    } else {
        console.error('Elemento não encontrado:', viewId);
    }
    
    // Adicionar classe 'active' ao botão correspondente
    const btnElement = document.getElementById('btn-' + viewId);
    if (btnElement) btnElement.classList.add('active');
    
    // Verificar se a alternância foi bem-sucedida
    setTimeout(() => {
        let visiveis = 0;
        document.querySelectorAll('.visualizacao-container').forEach(el => {
            if (el.style.display === 'block') visiveis++;
        });
        console.log(`Após alternância: ${visiveis} visualização(ões) visível(is)`);
    }, 100);
}

function renderizarMelhorPreco() {
    if (!cotacaoData || !cotacaoData.itens) return;
    
    const tbody = document.getElementById('tabela-melhor-preco-body');
    if (!tbody) return;
    
    // Agrupar itens por produto_nome para encontrar o melhor preço
    const itensPorProduto = {};
    let valorTotalMelhorPreco = 0;
    let valorTotalUltimoAprovado = 0;
    let valorTotalMedio = 0;
    let quantidadeTotalItens = 0;
    
    cotacaoData.itens.forEach(item => {
        const produtoNome = item.produto_nome;
        if (!itensPorProduto[produtoNome]) {
            itensPorProduto[produtoNome] = {
                melhorPreco: parseFloat(item.valor_unitario) || 0,
                ultimoAprovado: parseFloat(item.ultimo_valor_aprovado) || 0,
                itens: []
            };
        }
        const valorAtual = parseFloat(item.valor_unitario) || 0;
        if (valorAtual < itensPorProduto[produtoNome].melhorPreco) {
            itensPorProduto[produtoNome].melhorPreco = valorAtual;
        }
        itensPorProduto[produtoNome].itens.push(item);
    });
    
    let html = '';
    
    // Renderizar todos os produtos com melhor preço
    Object.entries(itensPorProduto).forEach(([produtoNome, dados]) => {
        // Filtrar apenas os itens com o melhor preço
        const itensMelhorPreco = dados.itens.filter(item => 
            Math.abs(parseFloat(item.valor_unitario) - dados.melhorPreco) < 0.0001
        );
        
        // Calcular valores totais
        itensMelhorPreco.forEach(item => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const valorUnitario = parseFloat(item.valor_unitario) || 0;
            const valorUltimoAprovado = parseFloat(item.ultimo_valor_aprovado) || 0;
            const valorTotal = quantidade * valorUnitario;
            
            valorTotalMelhorPreco += valorUnitario * quantidade;
            valorTotalUltimoAprovado += valorUltimoAprovado * quantidade;
            quantidadeTotalItens += quantidade;
            
            // Calcular média dos preços para este produto
            const mediaPrecos = dados.itens.reduce((sum, i) => sum + parseFloat(i.valor_unitario), 0) / dados.itens.length;
            valorTotalMedio += mediaPrecos * quantidade;
            
            // Calcular economia
            const economia = valorUltimoAprovado > 0 ? valorUltimoAprovado - valorUnitario : 0;
            const economiaPorcentagem = valorUltimoAprovado > 0 ? (economia / valorUltimoAprovado * 100) : 0;
            const economiaTotal = economia * quantidade;
            
            const economiaClass = valorUltimoAprovado > 0 ? 
                (economia > 0 ? 'economia-positiva' : 
                 economia < 0 ? 'economia-negativa' : 'economia-neutra') 
                : 'economia-neutra';
        
            html += `
                <tr class="indicador-preco">
                    <td>${item.produto_nome}</td>
                    <td>${item.fornecedor_nome}</td>
                    <td>${quantidade.toFixed(2)}</td>
                    <td>${item.produto_unidade || 'UN'}</td>
                    <td class="valor-unitario melhor-preco">R$ ${formatarNumero(valorUnitario)}</td>
                    <td class="valor-total">R$ ${formatarNumero(valorTotal)}</td>
                    <td>R$ ${formatarNumero(valorUltimoAprovado)}</td>
                    <td class="economia ${economiaClass}">
                        ${valorUltimoAprovado > 0 ? 
                            `R$ ${formatarNumero(economia)} (${economiaPorcentagem.toFixed(1)}%)` : 
                            'R$ 0,00 (0,0%)'}
                    </td>
                    <td class="economia ${economiaClass}">
                        ${valorUltimoAprovado > 0 ? 
                            `R$ ${formatarNumero(economiaTotal)} (${economiaPorcentagem.toFixed(1)}%)` : 
                            'R$ 0,00 (0,0%)'}
                    </td>
                    <td>${item.prazo_entrega || '-'}</td>
                    <td>${item.prazo_pagamento || '-'}</td>
                </tr>
            `;
        });
    });
    
    // Calcular totais e economias
    const economiaTotal = valorTotalMedio - valorTotalMelhorPreco;
    
    // Calcular economia apenas para produtos com último valor aprovado
    let valorTotalMelhorPrecoComAprovado = 0;
    let valorTotalUltimoAprovadoValido = 0;
    let valorTotalPrimeiroValor = 0;
    let valorTotalAtual = 0;
    
    Object.entries(itensPorProduto).forEach(([produtoNome, dados]) => {
        const itensMelhorPreco = dados.itens.filter(item => 
            Math.abs(parseFloat(item.valor_unitario) - dados.melhorPreco) < 0.0001
        );
        
        itensMelhorPreco.forEach(item => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const valorUnitario = parseFloat(item.valor_unitario) || 0;
            const valorUltimoAprovado = parseFloat(item.ultimo_valor_aprovado) || 0;
            const primeiroValor = parseFloat(item.primeiro_valor) || 0;
            
            // Só incluir no cálculo se tiver valor aprovado anterior
            if (valorUltimoAprovado > 0) {
                valorTotalMelhorPrecoComAprovado += valorUnitario * quantidade;
                valorTotalUltimoAprovadoValido += valorUltimoAprovado * quantidade;
            }
            
            valorTotalPrimeiroValor += primeiroValor * quantidade;
            valorTotalAtual += valorUnitario * quantidade;
        });
    });
    
    const economiaUltimoAprovado = valorTotalUltimoAprovadoValido - valorTotalMelhorPrecoComAprovado;
    const savingTotal = valorTotalPrimeiroValor - valorTotalAtual;
    
    const economiaTotalPorcentagem = valorTotalMedio > 0 ? (economiaTotal / valorTotalMedio * 100) : 0;
    const economiaUltimoPorcentagem = valorTotalUltimoAprovadoValido > 0 ? 
        (economiaUltimoAprovado / valorTotalUltimoAprovadoValido * 100) : 0;
    const savingPorcentagem = valorTotalPrimeiroValor > 0 ? 
        (savingTotal / valorTotalPrimeiroValor * 100) : 0;
    
    // Atualizar resumo
    document.getElementById('valor-total-melhor-preco').textContent = `R$ ${formatarNumero(valorTotalMelhorPreco)}`;
    document.getElementById('quantidade-total-itens').textContent = `${quantidadeTotalItens.toFixed(2)} itens`;
    
    document.getElementById('economia-total-valor').textContent = `R$ ${formatarNumero(economiaTotal)}`;
    document.getElementById('economia-total-porcentagem').textContent = `${economiaTotalPorcentagem.toFixed(1)}%`;
    
    document.getElementById('economia-ultimo-valor').textContent = `R$ ${formatarNumero(economiaUltimoAprovado)}`;
    document.getElementById('economia-ultimo-porcentagem').textContent = `${economiaUltimoPorcentagem.toFixed(1)}%`;
    
    document.getElementById('economia-media-valor').textContent = `R$ ${formatarNumero(savingTotal)}`;
    document.getElementById('economia-media-porcentagem').textContent = `${savingPorcentagem.toFixed(1)}%`;
    
    tbody.innerHTML = html;
}

// Função para renderizar a visualização de melhor prazo de entrega
function renderizarMelhorEntrega() {
    if (!cotacaoData || !cotacaoData.itens) return;
    
    const tbody = document.getElementById('tabela-melhor-entrega-body');
    if (!tbody) return;
    
    // Agrupar itens por produto_nome para encontrar o melhor prazo de entrega
    const itensPorProduto = {};
    let valorTotalMelhorEntrega = 0;
    let valorTotalUltimoAprovado = 0;
    let valorTotalMedio = 0;
    let quantidadeTotalItens = 0;
    
    cotacaoData.itens.forEach(item => {
        const produtoNome = item.produto_nome;
        if (!itensPorProduto[produtoNome]) {
            itensPorProduto[produtoNome] = {
                melhorPrazoEntrega: item.prazo_entrega || '999 dias',
                ultimoAprovado: parseFloat(item.ultimo_valor_aprovado) || 0,
                itens: []
            };
        }
        
        // Comparar prazos de entrega (menor número de dias é melhor)
        const prazoAtual = item.prazo_entrega || '999 dias';
        const diasAtual = parseInt(prazoAtual.match(/\d+/)?.[0] || 999);
        const diasMelhor = parseInt(itensPorProduto[produtoNome].melhorPrazoEntrega.match(/\d+/)?.[0] || 999);
        
        if (diasAtual < diasMelhor) {
            itensPorProduto[produtoNome].melhorPrazoEntrega = prazoAtual;
        }
        
        itensPorProduto[produtoNome].itens.push(item);
    });
    
    let html = '';
    
    // Renderizar todos os produtos com melhor prazo de entrega
    Object.entries(itensPorProduto).forEach(([produtoNome, dados]) => {
        // Filtrar apenas os itens com o melhor prazo de entrega
        const itensMelhorPrazoEntrega = dados.itens.filter(item => {
            const prazoItem = item.prazo_entrega || '999 dias';
            const diasItem = parseInt(prazoItem.match(/\d+/)?.[0] || 999);
            const diasMelhor = parseInt(dados.melhorPrazoEntrega.match(/\d+/)?.[0] || 999);
            return diasItem === diasMelhor;
        });
        
        // Calcular valores totais
        itensMelhorPrazoEntrega.forEach(item => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const valorUnitario = parseFloat(item.valor_unitario) || 0;
            const valorUltimoAprovado = parseFloat(item.ultimo_valor_aprovado) || 0;
            const valorTotal = quantidade * valorUnitario;
            
            valorTotalMelhorEntrega += valorUnitario * quantidade;
            valorTotalUltimoAprovado += valorUltimoAprovado * quantidade;
            quantidadeTotalItens += quantidade;
            
            // Calcular média dos preços para este produto
            const mediaPrecos = dados.itens.reduce((sum, i) => sum + parseFloat(i.valor_unitario), 0) / dados.itens.length;
            valorTotalMedio += mediaPrecos * quantidade;
            
            // Calcular economia
            const economia = valorUltimoAprovado > 0 ? valorUltimoAprovado - valorUnitario : 0;
            const economiaPorcentagem = valorUltimoAprovado > 0 ? (economia / valorUltimoAprovado * 100) : 0;
            const economiaTotal = economia * quantidade;
            
            const economiaClass = valorUltimoAprovado > 0 ? 
                (economia > 0 ? 'economia-positiva' : 
                 economia < 0 ? 'economia-negativa' : 'economia-neutra') 
                : 'economia-neutra';
            
            html += `
                <tr class="indicador-entrega">
                    <td>${item.produto_nome}</td>
                    <td>${item.fornecedor_nome}</td>
                    <td>${quantidade.toFixed(2)}</td>
                    <td>${item.produto_unidade || 'UN'}</td>
                    <td class="valor-unitario melhor-entrega">R$ ${formatarNumero(valorUnitario)}</td>
                    <td class="valor-total">R$ ${formatarNumero(valorTotal)}</td>
                    <td>R$ ${formatarNumero(valorUltimoAprovado)}</td>
                    <td class="economia ${economiaClass}">
                        ${valorUltimoAprovado > 0 ? 
                            `R$ ${formatarNumero(economia)} (${economiaPorcentagem.toFixed(1)}%)` : 
                            'R$ 0,00 (0,0%)'}
                    </td>
                    <td class="economia ${economiaClass}">
                        ${valorUltimoAprovado > 0 ? 
                            `R$ ${formatarNumero(economiaTotal)} (${economiaPorcentagem.toFixed(1)}%)` : 
                            'R$ 0,00 (0,0%)'}
                    </td>
                    <td>${item.prazo_entrega || '-'}</td>
                    <td>${item.prazo_pagamento || '-'}</td>
                </tr>
            `;
        });
    });
    
    // Calcular totais e economias
    const economiaTotal = valorTotalMedio - valorTotalMelhorEntrega;
    
    // Calcular economia apenas para produtos com último valor aprovado
    let valorTotalMelhorEntregaComAprovado = 0;
    let valorTotalUltimoAprovadoValido = 0;
    let valorTotalPrimeiroValor = 0;
    let valorTotalAtual = 0;
    
    Object.entries(itensPorProduto).forEach(([produtoNome, dados]) => {
        const itensMelhorPrazoEntrega = dados.itens.filter(item => {
            const prazoItem = item.prazo_entrega || '999 dias';
            const diasItem = parseInt(prazoItem.match(/\d+/)?.[0] || 999);
            const diasMelhor = parseInt(dados.melhorPrazoEntrega.match(/\d+/)?.[0] || 999);
            return diasItem === diasMelhor;
        });
        
        itensMelhorPrazoEntrega.forEach(item => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const valorUnitario = parseFloat(item.valor_unitario) || 0;
            const valorUltimoAprovado = parseFloat(item.ultimo_valor_aprovado) || 0;
            const primeiroValor = parseFloat(item.primeiro_valor) || 0;
            
            // Só incluir no cálculo se tiver valor aprovado anterior
            if (valorUltimoAprovado > 0) {
                valorTotalMelhorEntregaComAprovado += valorUnitario * quantidade;
                valorTotalUltimoAprovadoValido += valorUltimoAprovado * quantidade;
            }
            
            valorTotalPrimeiroValor += primeiroValor * quantidade;
            valorTotalAtual += valorUnitario * quantidade;
        });
    });
    
    const economiaUltimoAprovado = valorTotalUltimoAprovadoValido - valorTotalMelhorEntregaComAprovado;
    const savingTotal = valorTotalPrimeiroValor - valorTotalAtual;
    
    const economiaTotalPorcentagem = valorTotalMedio > 0 ? (economiaTotal / valorTotalMedio * 100) : 0;
    const economiaUltimoPorcentagem = valorTotalUltimoAprovadoValido > 0 ? 
        (economiaUltimoAprovado / valorTotalUltimoAprovadoValido * 100) : 0;
    const savingPorcentagem = valorTotalPrimeiroValor > 0 ? 
        (savingTotal / valorTotalPrimeiroValor * 100) : 0;
    
    // Atualizar resumo
    document.getElementById('valor-total-melhor-entrega').textContent = `R$ ${formatarNumero(valorTotalMelhorEntrega)}`;
    document.getElementById('quantidade-total-itens-entrega').textContent = `${quantidadeTotalItens.toFixed(2)} itens`;
    
    document.getElementById('economia-total-valor-entrega').textContent = `R$ ${formatarNumero(economiaTotal)}`;
    document.getElementById('economia-total-porcentagem-entrega').textContent = `${economiaTotalPorcentagem.toFixed(1)}%`;
    
    document.getElementById('economia-ultimo-valor-entrega').textContent = `R$ ${formatarNumero(economiaUltimoAprovado)}`;
    document.getElementById('economia-ultimo-porcentagem-entrega').textContent = `${economiaUltimoPorcentagem.toFixed(1)}%`;
    
    document.getElementById('economia-media-valor-entrega').textContent = `R$ ${formatarNumero(savingTotal)}`;
    document.getElementById('economia-media-porcentagem-entrega').textContent = `${savingPorcentagem.toFixed(1)}%`;
    
    tbody.innerHTML = html;
}

// Função para renderizar a visualização de melhor prazo de pagamento
function renderizarMelhorPagamento() {
    if (!cotacaoData || !cotacaoData.itens) return;
    
    const tbody = document.getElementById('tabela-melhor-pagamento-body');
    if (!tbody) return;
    
    // Agrupar itens por produto_nome para encontrar o melhor prazo de pagamento
    const itensPorProduto = {};
    let valorTotalMelhorPagamento = 0;
    let valorTotalUltimoAprovado = 0;
    let valorTotalMedio = 0;
    let quantidadeTotalItens = 0;
    
    cotacaoData.itens.forEach(item => {
        const produtoNome = item.produto_nome;
        if (!itensPorProduto[produtoNome]) {
            itensPorProduto[produtoNome] = {
                melhorPrazoPagamento: item.prazo_pagamento || '',
                ultimoAprovado: parseFloat(item.ultimo_valor_aprovado) || 0,
                itens: []
            };
        }
        
        // Comparar prazos de pagamento (maior número de dias é melhor)
        const prazoAtual = item.prazo_pagamento || '';
        const diasAtual = parseInt(prazoAtual.match(/\d+/)?.[0] || 0);
        const diasMelhor = parseInt(itensPorProduto[produtoNome].melhorPrazoPagamento.match(/\d+/)?.[0] || 0);
        
        if (diasAtual > diasMelhor) {
            itensPorProduto[produtoNome].melhorPrazoPagamento = prazoAtual;
        }
        
        itensPorProduto[produtoNome].itens.push(item);
    });
    
    let html = '';
    
    // Renderizar todos os produtos com melhor prazo de pagamento
    Object.entries(itensPorProduto).forEach(([produtoNome, dados]) => {
        // Filtrar apenas os itens com o melhor prazo de pagamento
        const itensMelhorPrazoPagamento = dados.itens.filter(item => {
            const prazoItem = item.prazo_pagamento || '';
            const diasItem = parseInt(prazoItem.match(/\d+/)?.[0] || 0);
            const diasMelhor = parseInt(dados.melhorPrazoPagamento.match(/\d+/)?.[0] || 0);
            return diasItem === diasMelhor;
        });
        
        // Calcular valores totais
        itensMelhorPrazoPagamento.forEach(item => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const valorUnitario = parseFloat(item.valor_unitario) || 0;
            const valorUltimoAprovado = parseFloat(item.ultimo_valor_aprovado) || 0;
            const valorTotal = quantidade * valorUnitario;
            
            valorTotalMelhorPagamento += valorUnitario * quantidade;
            valorTotalUltimoAprovado += valorUltimoAprovado * quantidade;
            quantidadeTotalItens += quantidade;
            
            // Calcular média dos preços para este produto
            const mediaPrecos = dados.itens.reduce((sum, i) => sum + parseFloat(i.valor_unitario), 0) / dados.itens.length;
            valorTotalMedio += mediaPrecos * quantidade;
            
            // Calcular economia
            const economia = valorUltimoAprovado > 0 ? valorUltimoAprovado - valorUnitario : 0;
            const economiaPorcentagem = valorUltimoAprovado > 0 ? (economia / valorUltimoAprovado * 100) : 0;
            const economiaTotal = economia * quantidade;
            
            const economiaClass = valorUltimoAprovado > 0 ? 
                (economia > 0 ? 'economia-positiva' : 
                 economia < 0 ? 'economia-negativa' : 'economia-neutra') 
                : 'economia-neutra';
            
            html += `
                <tr class="indicador-pagamento">
                    <td>${item.produto_nome}</td>
                    <td>${item.fornecedor_nome}</td>
                    <td>${quantidade.toFixed(2)}</td>
                    <td>${item.produto_unidade || 'UN'}</td>
                    <td class="valor-unitario melhor-pagamento">R$ ${formatarNumero(valorUnitario)}</td>
                    <td class="valor-total">R$ ${formatarNumero(valorTotal)}</td>
                    <td>R$ ${formatarNumero(valorUltimoAprovado)}</td>
                    <td class="economia ${economiaClass}">
                        ${valorUltimoAprovado > 0 ? 
                            `R$ ${formatarNumero(economia)} (${economiaPorcentagem.toFixed(1)}%)` : 
                            'R$ 0,00 (0,0%)'}
                    </td>
                    <td class="economia ${economiaClass}">
                        ${valorUltimoAprovado > 0 ? 
                            `R$ ${formatarNumero(economiaTotal)} (${economiaPorcentagem.toFixed(1)}%)` : 
                            'R$ 0,00 (0,0%)'}
                    </td>
                    <td>${item.prazo_entrega || '-'}</td>
                    <td>${item.prazo_pagamento || '-'}</td>
                </tr>
            `;
        });
    });
    
    // Calcular totais e economias
    const economiaTotal = valorTotalMedio - valorTotalMelhorPagamento;
    
    // Calcular economia apenas para produtos com último valor aprovado
    let valorTotalMelhorPagamentoComAprovado = 0;
    let valorTotalUltimoAprovadoValido = 0;
    let valorTotalPrimeiroValor = 0;
    let valorTotalAtual = 0;
    
    Object.entries(itensPorProduto).forEach(([produtoNome, dados]) => {
        const itensMelhorPrazoPagamento = dados.itens.filter(item => {
            const prazoItem = item.prazo_pagamento || '';
            const diasItem = parseInt(prazoItem.match(/\d+/)?.[0] || 0);
            const diasMelhor = parseInt(dados.melhorPrazoPagamento.match(/\d+/)?.[0] || 0);
            return diasItem === diasMelhor;
        });
        
        itensMelhorPrazoPagamento.forEach(item => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const valorUnitario = parseFloat(item.valor_unitario) || 0;
            const valorUltimoAprovado = parseFloat(item.ultimo_valor_aprovado) || 0;
            const primeiroValor = parseFloat(item.primeiro_valor) || 0;
            
            // Só incluir no cálculo se tiver valor aprovado anterior
            if (valorUltimoAprovado > 0) {
                valorTotalMelhorPagamentoComAprovado += valorUnitario * quantidade;
                valorTotalUltimoAprovadoValido += valorUltimoAprovado * quantidade;
            }
            
            valorTotalPrimeiroValor += primeiroValor * quantidade;
            valorTotalAtual += valorUnitario * quantidade;
        });
    });
    
    const economiaUltimoAprovado = valorTotalUltimoAprovadoValido - valorTotalMelhorPagamentoComAprovado;
    const savingTotal = valorTotalPrimeiroValor - valorTotalAtual;
    
    const economiaTotalPorcentagem = valorTotalMedio > 0 ? (economiaTotal / valorTotalMedio * 100) : 0;
    const economiaUltimoPorcentagem = valorTotalUltimoAprovadoValido > 0 ? 
        (economiaUltimoAprovado / valorTotalUltimoAprovadoValido * 100) : 0;
    const savingPorcentagem = valorTotalPrimeiroValor > 0 ? 
        (savingTotal / valorTotalPrimeiroValor * 100) : 0;
    
    // Atualizar resumo
    document.getElementById('valor-total-melhor-pagamento').textContent = `R$ ${formatarNumero(valorTotalMelhorPagamento)}`;
    document.getElementById('quantidade-total-itens-pagamento').textContent = `${quantidadeTotalItens.toFixed(2)} itens`;
    
    document.getElementById('economia-total-valor-pagamento').textContent = `R$ ${formatarNumero(economiaTotal)}`;
    document.getElementById('economia-total-porcentagem-pagamento').textContent = `${economiaTotalPorcentagem.toFixed(1)}%`;
    
    document.getElementById('economia-ultimo-valor-pagamento').textContent = `R$ ${formatarNumero(economiaUltimoAprovado)}`;
    document.getElementById('economia-ultimo-porcentagem-pagamento').textContent = `${economiaUltimoPorcentagem.toFixed(1)}%`;
    
    document.getElementById('economia-media-valor-pagamento').textContent = `R$ ${formatarNumero(savingTotal)}`;
    document.getElementById('economia-media-porcentagem-pagamento').textContent = `${savingPorcentagem.toFixed(1)}%`;
    
    tbody.innerHTML = html;
}

// Adicionar estilos CSS para a linha de total
const styleTotal = document.createElement('style');
styleTotal.textContent = `
    .total-row {
        background-color: #f8f9fa;
        font-weight: 600;
    }
    
    .total-row td {
        padding: 12px 15px;
        border-top: 2px solid #ddd;
    }
`;
document.head.appendChild(styleTotal);

// ... rest of existing code ...

// Make functions globally available
window.analisarCotacao = analisarCotacao;
window.aprovarCotacao = aprovarCotacao;
window.rejeitarCotacao = rejeitarCotacao;
window.renegociarCotacao = renegociarCotacao;
window.mostrarMotivoRejeicao = mostrarMotivoRejeicao;
window.mostrarMotivoRenegociacao = mostrarMotivoRenegociacao;
window.alternarVisualizacao = alternarVisualizacao;


// Configurar o botão de fechar o modal
document.querySelector('#modalAnalise .close').addEventListener('click', function() {
    document.getElementById('modalAnalise').style.display = 'none';
});

// Fechar o modal quando clicar fora dele
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modalAnalise');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Configurar os botões de alternância de visualização
// Make sure all functions and event listeners are properly closed
document.addEventListener('DOMContentLoaded', function() {
    const closeButton = document.querySelector('#modalAnalise .close');
    if(closeButton) {
        closeButton.addEventListener('click', function() {
            document.getElementById('modalAnalise').style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modalAnalise');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}); // Close DOMContentLoaded


function forcarVisualizacao(viewId) {
    console.log('Forçando visualização:', viewId);
   
    // Obter referências a todos os containers
    const padrao = document.getElementById('visualizacao-padrao');
    const resumo = document.getElementById('visualizacao-resumo');
    const melhorPreco = document.getElementById('visualizacao-melhor-preco');
    const melhorEntrega = document.getElementById('visualizacao-melhor-entrega');
    const melhorPagamento = document.getElementById('visualizacao-melhor-pagamento');
   
    // Esconder TODOS explicitamente
    if (padrao) padrao.style.display = 'none';
    if (resumo) resumo.style.display = 'none';
    if (melhorPreco) melhorPreco.style.display = 'none';
    if (melhorEntrega) melhorEntrega.style.display = 'none';
    if (melhorPagamento) melhorPagamento.style.display = 'none';
   
    // Mostrar APENAS o selecionado
    const selecionado = document.getElementById(viewId);
    if (selecionado) {
        selecionado.style.display = 'block';
        console.log(`Elemento ${viewId} agora está visível`);
    }
   
    // Atualizar classes dos botões
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.classList.remove('active');
    });
   
    const btnAtivo = document.getElementById('btn-' + viewId);
    if (btnAtivo) btnAtivo.classList.add('active');
   
    // Renderizar dados conforme necessário
    if (viewId === 'visualizacao-resumo') {
        renderizarResumoComparativo();
    } else if (viewId === 'visualizacao-melhor-preco') {
        renderizarMelhorPreco();
    } else if (viewId === 'visualizacao-melhor-entrega') {
        renderizarMelhorEntrega();
    } else if (viewId === 'visualizacao-melhor-pagamento') {
        renderizarMelhorPagamento();
    }
}

function adicionarResumoPreco() {
    if (!cotacaoData || !cotacaoData.itens) return;
    
    // Calcular economia total potencial
    let economiaTotal = 0;
    let valorTotalMelhorPreco = 0;
    let valorTotalMedio = 0;
    
    // Agrupar produtos por nome
    const produtosAgrupados = {};
    cotacaoData.itens.forEach(item => {
        const nomeProduto = item.produto_nome;
        if (!produtosAgrupados[nomeProduto]) {
            produtosAgrupados[nomeProduto] = [];
        }
        produtosAgrupados[nomeProduto].push(item);
    });
    
    // Calcular economia para cada produto
    Object.values(produtosAgrupados).forEach(itens => {
        // Ordenar por valor unitário (menor para maior)
        itens.sort((a, b) => parseFloat(a.valor_unitario) - parseFloat(b.valor_unitario));
        
        const melhorPreco = parseFloat(itens[0].valor_unitario);
        const precoMedio = itens.reduce((sum, item) => sum + parseFloat(item.valor_unitario), 0) / itens.length;
        const quantidade = parseInt(itens[0].quantidade) || 1;
        
        valorTotalMelhorPreco += melhorPreco * quantidade;
        valorTotalMedio += precoMedio * quantidade;
    });
    
    economiaTotal = valorTotalMedio - valorTotalMelhorPreco;
    const economiaPorcentagem = valorTotalMedio > 0 ? (economiaTotal / valorTotalMedio * 100) : 0;
    
    // Criar resumo
    const container = document.querySelector('#visualizacao-melhor-preco .detalhes-cotacao');
    if (!container) return;
    
    let resumo = container.querySelector('.resumo-geral');
    if (!resumo) {
        resumo = document.createElement('div');
        resumo.className = 'resumo-geral';
        container.insertBefore(resumo, container.firstChild);
    }
    
    resumo.innerHTML = `

    `;
}


function criarGraficoPreco() {
    if (!cotacaoData || !cotacaoData.itens) return;
    
    // Preparar dados para o gráfico
    const produtosUnicos = [...new Set(cotacaoData.itens.map(item => item.produto_nome))];
    const datasets = [];
    
    // Para cada produto, encontrar o melhor e o preço médio
    produtosUnicos.forEach(produto => {
        const itens = cotacaoData.itens.filter(item => item.produto_nome === produto);
        const precos = itens.map(item => parseFloat(item.valor_unitario));
        const melhorPreco = Math.min(...precos);
        const precoMedio = precos.reduce((a, b) => a + b, 0) / precos.length;
        
        datasets.push({
            produto: produto,
            melhorPreco: melhorPreco,
            precoMedio: precoMedio
        });
    });
    
    // Limitar a 5 produtos para não sobrecarregar o gráfico
    const dadosGrafico = datasets.slice(0, 5);
    
    // Criar o gráfico
    const ctx = document.getElementById('grafico-preco').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosGrafico.map(d => d.produto),
            datasets: [
                {
                    label: 'Melhor Preço',
                    data: dadosGrafico.map(d => d.melhorPreco),
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Preço Médio',
                    data: dadosGrafico.map(d => d.precoMedio),
                    backgroundColor: 'rgba(149, 165, 166, 0.7)',
                    borderColor: 'rgba(149, 165, 166, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Comparação de Preços'
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    }
                }
            }
        }
    });
}

// Função para preparar os itens para aprovação
function prepararItensParaAprovacao() {
    itensMelhorPreco = [];
    itensSelecionadosManualmente = [];
    itensMelhorPrazoEntrega = [];
    itensMelhorPrazoPagamento = [];
    if (!cotacaoData || !cotacaoData.itens) {
        console.error('Dados da cotação não disponíveis');
        return;
    }
    
    // Agrupar produtos por nome
    const produtosAgrupados = {};
    
    cotacaoData.itens.forEach(item => {
        const nomeProduto = item.produto_nome;
        if (!produtosAgrupados[nomeProduto]) {
            produtosAgrupados[nomeProduto] = [];
        }
        produtosAgrupados[nomeProduto].push(item);
    });
    
    // Limpar arrays
    itensMelhorPreco = [];
    itensSelecionadosManualmente = [];
    itensMelhorPrazoEntrega = [];
    itensMelhorPrazoPagamento = [];
    
    // Containers para os itens
    const listaItensAprovacao = document.getElementById('lista-itens-aprovacao');
    const listaMelhorPreco = document.getElementById('lista-melhor-preco');
    const listaMelhorPrazoEntrega = document.getElementById('lista-melhor-prazo-entrega');
    const listaMelhorPrazoPagamento = document.getElementById('lista-melhor-prazo-pagamento');
    
    // Verificar se os elementos existem
    if (!listaItensAprovacao || !listaMelhorPreco || !listaMelhorPrazoEntrega || !listaMelhorPrazoPagamento) {
        console.error('Alguns elementos de lista não foram encontrados no DOM:', {
            listaItensAprovacao: !!listaItensAprovacao,
            listaMelhorPreco: !!listaMelhorPreco,
            listaMelhorPrazoEntrega: !!listaMelhorPrazoEntrega,
            listaMelhorPrazoPagamento: !!listaMelhorPrazoPagamento
        });
        return;
    }
    
    // Limpar containers
    listaItensAprovacao.innerHTML = '';
    listaMelhorPreco.innerHTML = '';
    listaMelhorPrazoEntrega.innerHTML = '';
    listaMelhorPrazoPagamento.innerHTML = '';
    
    // Para cada produto, encontrar o item com melhor preço, prazo de entrega e prazo de pagamento
    Object.entries(produtosAgrupados).forEach(([nomeProduto, itens]) => {
        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            console.warn(`Nenhum item válido encontrado para o produto: ${nomeProduto}`);
            return;
        }
        
        try {
            // Ordenar por valor unitário (menor para maior)
            itens.sort((a, b) => {
                const valorA = parseFloat(a.valor_unitario) || 0;
                const valorB = parseFloat(b.valor_unitario) || 0;
                return valorA - valorB;
            });
            
            const melhorValor = parseFloat(itens[0].valor_unitario);
            
            // Filtrar todos os itens com o mesmo melhor valor
            const itensComMelhorPreco = itens.filter(item => 
                Math.abs(parseFloat(item.valor_unitario) - melhorValor) < 0.0001
            );
            
            // Adicionar todos os itens com o melhor preço à lista
            itensComMelhorPreco.forEach(melhorPrecoItem => {
            // Adicionar à lista de melhores preços
            itensMelhorPreco.push({
                    produto_id: melhorPrecoItem.produto_id,
                    fornecedor_nome: melhorPrecoItem.fornecedor_nome,
                    valor_unitario: melhorPrecoItem.valor_unitario,
                    produto_nome: melhorPrecoItem.produto_nome,
                    quantidade: melhorPrecoItem.quantidade,
                    prazo_entrega: melhorPrecoItem.prazo_entrega,
                    prazo_pagamento: melhorPrecoItem.prazo_pagamento,
                    primeiro_valor: melhorPrecoItem.primeiro_valor,
                    data_entrega_fn: melhorPrecoItem.data_entrega_fn
            });
            
            // Adicionar à lista de visualização de melhores preços
            const itemMelhorPrecoHTML = `
                <div class="item-selecao">
                    <span class="melhor-preco-badge">Melhor Preço</span>
                    <label>
                        ${melhorPrecoItem.produto_nome}
                        <div class="preco">R$ ${formatarNumero(melhorPrecoItem.valor_unitario)}</div>
                            <div class="prazo">Prazo Entrega: ${melhorPrecoItem.prazo_entrega || 'Não informado'}</div>
                            <div class="prazo">Prazo Pagamento: ${melhorPrecoItem.prazo_pagamento || 'Não informado'}</div>
                        <div class="fornecedor">Fornecedor: ${melhorPrecoItem.fornecedor_nome}</div>
                    </label>
                </div>
            `;
            listaMelhorPreco.innerHTML += itemMelhorPrecoHTML;
            });
            
            // Encontrar melhor prazo de entrega
            let melhorPrazoEntregaItem = null;
            const itensComPrazoEntrega = itens.filter(item => item.prazo_entrega && item.prazo_entrega.trim() !== '');
            if (itensComPrazoEntrega.length > 0) {
                itensComPrazoEntrega.sort((a, b) => {
                    const diasA = parseInt(a.prazo_entrega.match(/\d+/)?.[0] || 999);
                    const diasB = parseInt(b.prazo_entrega.match(/\d+/)?.[0] || 999);
                    return diasA - diasB;
                });
                
                const melhorPrazo = parseInt(itensComPrazoEntrega[0].prazo_entrega.match(/\d+/)?.[0] || 999);
                
                // Filtrar todos os itens com o mesmo melhor prazo
                const itensComMelhorPrazo = itensComPrazoEntrega.filter(item => {
                    const prazoItem = parseInt(item.prazo_entrega.match(/\d+/)?.[0] || 999);
                    return prazoItem === melhorPrazo;
                });
            
                // Adicionar todos os itens com o melhor prazo à lista
                itensComMelhorPrazo.forEach(item => {
            itensMelhorPrazoEntrega.push({
                        produto_id: item.produto_codigo,
                        fornecedor_nome: item.fornecedor_nome,
                        valor_unitario: item.valor_unitario,
                        produto_nome: item.produto_nome,
                        prazo_entrega: item.prazo_entrega
                    });
                    
            const itemMelhorPrazoEntregaHTML = `
                <div class="item-selecao">
                    <span class="melhor-prazo-badge">Melhor Prazo de Entrega</span>
                    <label>
                                ${item.produto_nome}
                                <div class="preco">R$ ${formatarNumero(item.valor_unitario)}</div>
                                <div class="prazo">Prazo Entrega: ${item.prazo_entrega || 'Não informado'}</div>
                                <div class="prazo">Prazo Pagamento: ${item.prazo_pagamento || 'Não informado'}</div>
                                <div class="fornecedor">Fornecedor: ${item.fornecedor_nome}</div>
                    </label>
                </div>
            `;
            listaMelhorPrazoEntrega.innerHTML += itemMelhorPrazoEntregaHTML;
                });
            }
            
            // Encontrar melhor prazo de pagamento
            let melhorPrazoPagamentoItem = null;
            const itensComPrazoPagamento = itens.filter(item => item.prazo_pagamento && item.prazo_pagamento.trim() !== '');
            if (itensComPrazoPagamento.length > 0) {
                itensComPrazoPagamento.sort((a, b) => {
                    const diasA = parseInt(a.prazo_pagamento.match(/\d+/)?.[0] || 0);
                    const diasB = parseInt(b.prazo_pagamento.match(/\d+/)?.[0] || 0);
                    return diasB - diasA; // Ordem decrescente (maior prazo é melhor)
                });
                
                const melhorPrazo = parseInt(itensComPrazoPagamento[0].prazo_pagamento.match(/\d+/)?.[0] || 0);
                
                // Filtrar todos os itens com o mesmo melhor prazo
                const itensComMelhorPrazo = itensComPrazoPagamento.filter(item => {
                    const prazoItem = parseInt(item.prazo_pagamento.match(/\d+/)?.[0] || 0);
                    return prazoItem === melhorPrazo;
                });
            
                // Adicionar todos os itens com o melhor prazo à lista
                itensComMelhorPrazo.forEach(item => {
            itensMelhorPrazoPagamento.push({
                        produto_id: item.produto_codigo,
                        fornecedor_nome: item.fornecedor_nome,
                        valor_unitario: item.valor_unitario,
                        produto_nome: item.produto_nome,
                        prazo_pagamento: item.prazo_pagamento,
                        quantidade: item.quantidade,
                        prazo_entrega: item.prazo_entrega,
                        primeiro_valor: item.primeiro_valor,
                        data_entrega_fn: item.data_entrega_fn
                    });
                    
            const itemMelhorPrazoPagamentoHTML = `
                <div class="item-selecao">
                    <span class="melhor-pagamento-badge">Melhor Prazo de Pagamento</span>
                    <label>
                                ${item.produto_nome}
                                <div class="preco">R$ ${formatarNumero(item.valor_unitario)}</div>
                                <div class="prazo">Prazo Entrega: ${item.prazo_entrega || 'Não informado'}</div>
                                <div class="prazo">Prazo Pagamento: ${item.prazo_pagamento || 'Não informado'}</div>
                                <div class="fornecedor">Fornecedor: ${item.fornecedor_nome}</div>
                    </label>
                </div>
            `;
            listaMelhorPrazoPagamento.innerHTML += itemMelhorPrazoPagamentoHTML;
                });
            } else if (itens.length > 0) {
                // Se não houver itens com prazo de pagamento, usar o item com melhor preço
                const item = itens[0];
                itensMelhorPrazoPagamento.push({
                    produto_id: item.produto_codigo,
                    fornecedor_nome: item.fornecedor_nome,
                    valor_unitario: item.valor_unitario,
                    produto_nome: item.produto_nome,
                    prazo_pagamento: item.prazo_pagamento,
                    quantidade: item.quantidade,
                    prazo_entrega: item.prazo_entrega,
                    primeiro_valor: item.primeiro_valor,
                    data_entrega_fn: item.data_entrega_fn
                });
                
                const itemHTML = `
                    <div class="item-selecao">
                        <span class="melhor-pagamento-badge">Melhor Prazo de Pagamento</span>
                        <label>
                            ${item.produto_nome}
                            <div class="preco">R$ ${formatarNumero(item.valor_unitario)}</div>
                            <div class="prazo">Prazo Entrega: ${item.prazo_entrega || 'Não informado'}</div>
                            <div class="prazo">Prazo Pagamento: ${item.prazo_pagamento || 'Não informado'}</div>
                            <div class="fornecedor">Fornecedor: ${item.fornecedor_nome}</div>
                        </label>
                    </div>
                `;
                listaMelhorPrazoPagamento.innerHTML += itemHTML;
            }
            
            // Adicionar todos os itens à lista de seleção manual
            itens.forEach((item, index) => {
                // Verificar se o item tem o mesmo melhor preço
                const ehMelhorPreco = Math.abs(parseFloat(item.valor_unitario) - melhorValor) < 0.0001;
                
                const itemHTML = `
                    <div class="item-selecao">
                        <input type="checkbox" id="item-${item.produto_codigo}-${item.fornecedor_nome.replace(/\s+/g, '-')}" 
                               data-produto-id="${item.produto_codigo}"
                               data-fornecedor="${item.fornecedor_nome}"
                               data-valor="${item.valor_unitario}"
                               data-produto-nome="${item.produto_nome}"
                               ${ehMelhorPreco ? 'checked' : ''}>
                        <label for="item-${item.produto_codigo}-${item.fornecedor_nome.replace(/\s+/g, '-')}">
                            ${item.produto_nome}
                            <div class="preco">R$ ${formatarNumero(item.valor_unitario)}</div>
                            <div class="prazo">Prazo Entrega: ${item.prazo_entrega || 'Não informado'}</div>
                            <div class="prazo">Prazo Pagamento: ${item.prazo_pagamento || 'Não informado'}</div>
                            <div class="fornecedor">Fornecedor: ${item.fornecedor_nome}</div>
                            ${ehMelhorPreco ? '<span class="melhor-preco-badge">Melhor Preço</span>' : ''}
                        </label>
                    </div>
                `;
                listaItensAprovacao.innerHTML += itemHTML;
                
                // Se for o melhor preço, adicionar à lista de selecionados por padrão
                if (ehMelhorPreco) {
                    itensSelecionadosManualmente.push({
                        produto_id: item.produto_codigo,
                        fornecedor_nome: item.fornecedor_nome,
                        valor_unitario: item.valor_unitario,
                        produto_nome: item.produto_nome
                    });
                }
            });
        } catch (error) {
            console.error(`Erro ao processar produto ${nomeProduto}:`, error);
        }
    });
    
    // Adicionar event listeners para os checkboxes
    document.querySelectorAll('#lista-itens-aprovacao input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            console.log('Checkbox alterado:', this.checked, this.dataset);
            atualizarItensSelecionadosManualmente();
        });
    });
}

// Função para atualizar a lista de itens selecionados manualmente

function atualizarItensSelecionadosManualmente() {
    itensSelecionadosManualmente = [];
    
    const checkboxes = document.querySelectorAll('#lista-itens-aprovacao input[type="checkbox"]:checked');
    console.log('Total de checkboxes selecionados:', checkboxes.length);
    
    checkboxes.forEach(checkbox => {
        const item = {
            produto_id: checkbox.dataset.produtoId,
            fornecedor_nome: checkbox.dataset.fornecedor,
            valor_unitario: checkbox.dataset.valor,
            produto_nome: checkbox.dataset.produtoNome
        };
        console.log('Adicionando item:', item);
        itensSelecionadosManualmente.push(item);
    });
    
    console.log('Total de itens selecionados manualmente:', itensSelecionadosManualmente.length);
    console.log('Itens selecionados manualmente:', itensSelecionadosManualmente);
}

// Função para confirmar a aprovação
// Função para confirmar a aprovação
function confirmarAprovacao() {
    const motivo = document.getElementById('texto-motivo-aprovacao').value.trim();
   
    // Validar se o motivo foi preenchido
    if (!motivo) {
        alert('Por favor, informe o motivo da aprovação.');
        return;
    }
   
    // Determinar o tipo de aprovação selecionado
    const tipoAprovacao = document.querySelector('input[name="tipo-aprovacao"]:checked').value;
   
    // Determinar quais itens serão aprovados
    let itensAprovados = [];
    
    switch (tipoAprovacao) {
        case 'manual':
            // Atualizar a lista de itens selecionados manualmente antes de usar
            atualizarItensSelecionadosManualmente();
            itensAprovados = [...itensSelecionadosManualmente];
            console.log('Itens a serem aprovados (manual):', itensAprovados);
            break;
        case 'melhor-preco':
            itensAprovados = [...itensMelhorPreco];
            break;
        case 'melhor-prazo-entrega':
            itensAprovados = [...itensMelhorPrazoEntrega];
            break;
        case 'melhor-prazo-pagamento':
            itensAprovados = [...itensMelhorPrazoPagamento];
            break;
    }
   
    // Remover duplicatas (se houver)
    const itensUnicos = [];
    const itemsMap = new Map();
    
    for (const item of itensAprovados) {
        // Criar uma chave única baseada no produto e fornecedor
        const key = `${item.produto_nome}_${item.fornecedor_nome}`;
        if (!itemsMap.has(key)) {
            itemsMap.set(key, true);
            itensUnicos.push(item);
        }
    }
    
    // Usar apenas itens únicos
    itensAprovados = itensUnicos;
    
    console.log('Total de itens a serem aprovados:', itensAprovados.length);
    console.log('Itens a serem aprovados:', itensAprovados);
    
    // Verificar se há itens selecionados
    if (itensAprovados.length === 0) {
        alert('Por favor, selecione pelo menos um item para aprovação.');
        return;
    }
   
    // Confirmar a aprovação
    if (confirm(`Tem certeza que deseja aprovar ${itensAprovados.length} item${itensAprovados.length > 1 ? 's' : ''}?`)) {
        const payload = {
            id: currentCotacaoId,
            status: 'aprovado',
            motivo_aprovacao: motivo,
            itens_aprovados: itensAprovados,
            tipo_aprovacao: tipoAprovacao
        };
       
        console.log('Enviando aprovação:', payload);
       
        fetch('api/cotacoes.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Cotação aprovada com sucesso!');
                window.location.reload();
            } else {
                alert(data.message || 'Erro ao aprovar cotação');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao processar requisição');
        });
    }
}




// Adicione esta função no bloco <script> do arquivo modal_aprovacoes.php
function calcularValorUnitarioComDifalEFrete(item, fornecedor) {
    // Obter valores básicos
    const valorUnitario = parseFloat(item.valor_unitario) || 0;
    const difalPercentual = parseFloat(fornecedor.difal || 0);
    const freteTotalFornecedor = parseFloat(fornecedor.frete || 0);
    
    // Calcular DIFAL por unidade
    const difalUnitario = (valorUnitario * difalPercentual) / 100;
    
    // Calcular valor total de produtos para determinar proporções
    let valorTotalProdutos = 0;
    fornecedor.itens.forEach(i => {
        const qtd = parseFloat(i.quantidade) || 0;
        const val = parseFloat(i.valor_unitario) || 0;
        valorTotalProdutos += qtd * val;
    });
    
    // Calcular a proporção deste item no total
    const quantidade = parseFloat(item.quantidade) || 0;
    const proporcaoItem = valorTotalProdutos > 0 ? 
        ((quantidade * valorUnitario) / valorTotalProdutos) : 0;
    
    // Calcular o frete proporcional para este item
    const freteProporcionalItem = freteTotalFornecedor * proporcaoItem;
    
    // Calcular o frete por unidade
    const fretePorUnidade = quantidade > 0 ? freteProporcionalItem / quantidade : 0;
    
    // Retornar o valor unitário com DIFAL e frete
    return valorUnitario + difalUnitario + fretePorUnidade;
}


// Função para calcular e exibir o resumo do orçamento
// Função para calcular e exibir o resumo do orçamento
function atualizarResumoOrcamento(data) {
    if (!data || !data.itens) {
        console.error('Dados inválidos para resumo do orçamento');
        return;
    }
    
    // Verificar se a cotação está aprovada
    const cotacaoAprovada = data.status === 'aprovado';
    
    // Se a cotação estiver aprovada, filtrar apenas os itens aprovados
    let itensParaCalculo = data.itens;
    if (cotacaoAprovada) {
        itensParaCalculo = data.itens.filter(item => item.aprovado === 1 || item.aprovado === '1' || item.aprovado === true);
        console.log('Calculando resumo apenas com itens aprovados:', itensParaCalculo.length, 'de', data.itens.length);
    }
    
    // Agrupar itens por fornecedor para calcular DIFAL e frete
    const itensPorFornecedor = {};
    itensParaCalculo.forEach(item => {
        const fornecedorNome = item.fornecedor_nome;
        if (!itensPorFornecedor[fornecedorNome]) {
            itensPorFornecedor[fornecedorNome] = {
                itens: [],
                difal: parseFloat(item.difal || 0),
                frete: parseFloat(item.frete || 0)
            };
        }
        itensPorFornecedor[fornecedorNome].itens.push(item);
    });
    
    // Agrupar itens por nome do produto para cálculos de melhor preço
    const itensPorProduto = {};
    itensParaCalculo.forEach(item => {
        const produtoNome = item.produto_nome;
        if (!itensPorProduto[produtoNome]) {
            itensPorProduto[produtoNome] = [];
        }
        itensPorProduto[produtoNome].push(item);
    });
    
    // Encontrar o melhor preço para cada produto e somar as quantidades
    const melhoresPrecos = {};
    Object.entries(itensPorProduto).forEach(([produtoNome, itens]) => {
        // Ordenar por valor unitário (menor para maior)
        itens.sort((a, b) => parseFloat(a.valor_unitario) - parseFloat(b.valor_unitario));
        
        const melhorValor = parseFloat(itens[0].valor_unitario);
        
        // Filtrar todos os itens com o mesmo melhor valor
        const itensMelhorPreco = itens.filter(item => 
            Math.abs(parseFloat(item.valor_unitario) - melhorValor) < 0.0001
        );
        
        // Somar as quantidades dos itens com o melhor preço
        const quantidadeTotal = itensMelhorPreco.reduce((total, item) => 
            total + (parseFloat(item.quantidade) || 0), 0
        );
        
        // Usar o primeiro fornecedor com o melhor preço como referência
        melhoresPrecos[produtoNome] = {
            valor: melhorValor,
            quantidade: quantidadeTotal,
            fornecedor: itensMelhorPreco[0].fornecedor_nome,
            itens: itensMelhorPreco // Armazenar os itens com melhor preço
        };
    });
    
    // Calcular produtos únicos usando produto_id e produto_nome
    const produtosUnicos = new Set();
    Object.values(melhoresPrecos).forEach(grupo => {
        grupo.itens.forEach(item => {
            produtosUnicos.add(`${item.produto_id}_${item.produto_nome}`);
        });
    });
    const totalProdutos = produtosUnicos.size;
    
    // Calcular fornecedores únicos dos melhores preços
    const fornecedoresUnicos = [...new Set(Object.values(melhoresPrecos).map(item => item.fornecedor))];
    const totalFornecedores = fornecedoresUnicos.length;
    
    // Calcular quantidade total dos melhores preços
    const quantidadeTotal = Object.values(melhoresPrecos).reduce((total, item) => {
        return total + item.quantidade;
    }, 0);
    
    // Calcular valor total dos melhores preços incluindo DIFAL e frete
    let valorTotal = 0;
    Object.values(melhoresPrecos).forEach(item => {
        const fornecedor = itensPorFornecedor[item.fornecedor];
        if (fornecedor) {
            // Calcular valor base do produto
            const valorBase = item.valor * item.quantidade;
            
            // Calcular DIFAL
            const difalValor = valorBase * (fornecedor.difal / 100);
            
            // Calcular proporção do frete para este item
            const totalFornecedor = fornecedor.itens.reduce((sum, i) => 
                sum + (parseFloat(i.valor_unitario) * parseFloat(i.quantidade)), 0);
            const proporcaoFrete = totalFornecedor > 0 ? valorBase / totalFornecedor : 0;
            const freteProporcional = fornecedor.frete * proporcaoFrete;
            
            // Adicionar ao valor total
            valorTotal += valorBase + difalValor + freteProporcional;
        }
    });
    
    // Atualizar os elementos HTML
    document.getElementById('total-produtos').textContent = totalProdutos.toLocaleString('pt-BR');
    document.getElementById('total-fornecedores').textContent = totalFornecedores.toLocaleString('pt-BR');
    document.getElementById('total-quantidade').textContent = quantidadeTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('total-valor').textContent = 'R$ ' + valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    console.log('Resumo do orçamento atualizado (melhores preços):', {
        status: data.status,
        aprovado: cotacaoAprovada,
        produtos: totalProdutos,
        fornecedores: totalFornecedores,
        quantidade: quantidadeTotal,
        valor: valorTotal
    });
}

// Adicionar esta função no arquivo modal_aprovacoes.php
function adicionarResumoRodadas(data) {
    if (!data || !data.itens || data.itens.length === 0) return;
    
    // Calcular estatísticas
    let totalRodadas = 0;
    let maxRodadas = 0;
    let produtosComRodadas = 0;
    let produtoMaisRodadas = '';
    
    data.itens.forEach(item => {
        const rodadas = parseInt(item.rodadas || 0);
        totalRodadas += rodadas;
        
        if (rodadas > 0) {
            produtosComRodadas++;
        }
        
        if (rodadas > maxRodadas) {
            maxRodadas = rodadas;
            produtoMaisRodadas = item.produto_nome;
        }
    });
    
    const mediaRodadas = produtosComRodadas > 0 ? (totalRodadas / produtosComRodadas).toFixed(1) : 0;
    const percentualRenegociados = ((produtosComRodadas / data.itens.length) * 100).toFixed(0);
    
    // Criar o HTML do resumo
    const resumoHTML = `
        <div class="resumo-rodadas">
            <h4>Resumo de Renegociações</h4>
            <div class="resumo-rodadas-cards">
                <div class="resumo-card">
                    <div class="resumo-valor">${produtosComRodadas}</div>
                    <div class="resumo-label">Produtos Renegociados</div>
                </div>
                <div class="resumo-card">
                    <div class="resumo-valor">${percentualRenegociados}%</div>
                    <div class="resumo-label">da Cotação</div>
                </div>
                <div class="resumo-card">
                    <div class="resumo-valor">${mediaRodadas}</div>
                    <div class="resumo-label">Média de Rodadas</div>
                </div>
                <div class="resumo-card">
                    <div class="resumo-valor">${maxRodadas}</div>
                    <div class="resumo-label">Máximo de Rodadas</div>
                </div>
            </div>
            ${maxRodadas > 0 ? `<div class="resumo-destaque">Produto mais renegociado: <strong>${produtoMaisRodadas}</strong> (${maxRodadas} rodadas)</div>` : ''}
        </div>
    `;
    
    // Inserir o resumo no topo do modal
    const container = document.querySelector('.analise-header');
    if (container) {
        // Verificar se o resumo já existe e removê-lo se necessário
        const resumoExistente = document.querySelector('.resumo-rodadas');
        if (resumoExistente) {
            resumoExistente.remove();
        }
        
        // Inserir o novo resumo
        container.insertAdjacentHTML('afterend', resumoHTML);
    }
}

function atualizarComparacaoCotacao(data) {
    if (!data || !data.itens) {
        console.error('Dados inválidos para comparação da cotação');
        return;
    }

    // Agrupar itens por fornecedor
    const itensPorFornecedor = {};
    data.itens.forEach(item => {
        if (!itensPorFornecedor[item.fornecedor_nome]) {
            itensPorFornecedor[item.fornecedor_nome] = {
                valorAtual: 0,
                valorUltimo: 0,
                difal: parseFloat(item.difal || 0),
                frete: parseFloat(item.frete || 0),
                itens: []
            };
        }
        itensPorFornecedor[item.fornecedor_nome].itens.push(item);
    });

    // Calcular totais por fornecedor
    Object.entries(itensPorFornecedor).forEach(([fornecedor, dados]) => {
        dados.itens.forEach(item => {
            const quantidade = parseFloat(item.quantidade || 0);
            const valorUnitarioAtual = parseFloat(item.valor_unitario || 0);
            const valorUnitarioUltimo = parseFloat(item.ultimo_valor_aprovado || 0);

            // Calcular valor atual com DIFAL e frete
            const valorUnitarioComDifalEFrete = calcularValorUnitarioComDifalEFrete(item, dados);
            const valorTotalAtual = quantidade * valorUnitarioComDifalEFrete;

            // Calcular valor último com DIFAL e frete (usando os mesmos percentuais)
            const valorBaseUltimo = quantidade * valorUnitarioUltimo;
            const difalUltimo = valorBaseUltimo * (dados.difal / 100);
            const freteProporcionalUltimo = dados.frete * (valorBaseUltimo / (valorBaseUltimo + difalUltimo));
            const valorTotalUltimo = valorBaseUltimo + difalUltimo + freteProporcionalUltimo;

            dados.valorAtual += valorTotalAtual;
            dados.valorUltimo += valorTotalUltimo;
        });
    });

    // Encontrar o fornecedor com menor valor total atual
    let melhorFornecedor = {
        nome: '',
        valorAtual: Infinity,
        valorUltimo: 0
    };

    Object.entries(itensPorFornecedor).forEach(([fornecedor, dados]) => {
        if (dados.valorAtual < melhorFornecedor.valorAtual) {
            melhorFornecedor = {
                nome: fornecedor,
                valorAtual: dados.valorAtual,
                valorUltimo: dados.valorUltimo
            };
        }
    });

    // Gerar HTML para a tabela
    let html = '';
    let totalAtual = 0;
    let totalUltimo = 0;

    Object.entries(itensPorFornecedor).forEach(([fornecedor, dados]) => {
        const variacao = dados.valorUltimo > 0 ? 
            ((dados.valorAtual - dados.valorUltimo) / dados.valorUltimo) * 100 : 0;
        const variacaoAbsoluta = dados.valorAtual - dados.valorUltimo;
        
        const variacaoClass = variacao > 0 ? 'variacao-positiva' : 
                            variacao < 0 ? 'variacao-negativa' : 'variacao-neutra';
        
        const variacaoSinal = variacao > 0 ? '+' : '';
        const variacaoAbsolutaSinal = variacaoAbsoluta > 0 ? '+' : '';

        totalAtual += dados.valorAtual;
        totalUltimo += dados.valorUltimo;

        html += `
            <tr>
                <td>${fornecedor}</td>
                <td>R$ ${formatarNumero(dados.valorAtual)}</td>
                <td>R$ ${formatarNumero(dados.valorUltimo)}</td>
                <td class="${variacaoClass}">
                    ${variacaoSinal}${formatarNumero(variacao)}% 
                    (${variacaoAbsolutaSinal}R$ ${formatarNumero(variacaoAbsoluta)})
                </td>
            </tr>
        `;
    });

    // Adicionar linha do melhor valor
    const variacaoMelhor = melhorFornecedor.valorUltimo > 0 ? 
        ((melhorFornecedor.valorAtual - melhorFornecedor.valorUltimo) / melhorFornecedor.valorUltimo) * 100 : 0;
    const variacaoAbsolutaMelhor = melhorFornecedor.valorAtual - melhorFornecedor.valorUltimo;
    
    const variacaoClassMelhor = variacaoMelhor > 0 ? 'variacao-positiva' : 
                               variacaoMelhor < 0 ? 'variacao-negativa' : 'variacao-neutra';
    
    const variacaoSinalMelhor = variacaoMelhor > 0 ? '+' : '';
    const variacaoAbsolutaSinalMelhor = variacaoAbsolutaMelhor > 0 ? '+' : '';

    html += `
        <tr class="melhor-valor-row">
            <td><strong>Melhor Valor</strong></td>
            <td>R$ ${formatarNumero(melhorFornecedor.valorAtual)}</td>
            <td>R$ ${formatarNumero(melhorFornecedor.valorUltimo)}</td>
            <td class="${variacaoClassMelhor}">
                ${variacaoSinalMelhor}${formatarNumero(variacaoMelhor)}% 
                (${variacaoAbsolutaSinalMelhor}R$ ${formatarNumero(variacaoAbsolutaMelhor)})
            </td>
        </tr>
    `;

    // Atualizar a tabela
    document.getElementById('comparacao-cotacao-body').innerHTML = html;

    // Atualizar a lista de produtos únicos
    atualizarListaProdutosUnicos(data);
}

// Adicionar estilos CSS para a nova seção
const style = document.createElement('style');
style.textContent = `
    .comparacao-cotacao {
        margin: 20px 0;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        padding: 15px;
    }

    .comparacao-cotacao h4 {
        color: #333;
        margin-bottom: 15px;
        font-size: 1.1em;
        font-weight: 600;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }

    .tabela-comparacao {
        overflow-x: auto;
    }

    .tabela-comparacao table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 0.9em;
    }

    .tabela-comparacao th,
    .tabela-comparacao td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    .tabela-comparacao th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #555;
    }

    .tabela-comparacao tr:hover {
        background-color: #f8f9fa;
    }

    .variacao-positiva {
        color: #dc3545;
        font-weight: 500;
    }

    .variacao-negativa {
        color: #28a745;
        font-weight: 500;
    }

    .variacao-neutra {
        color: #6c757d;
    }

    .melhor-valor-row {
        background-color: #f8fff8;
        font-weight: 500;
    }

    .melhor-valor-row td {
        border-top: 2px solid #ddd;
        padding: 12px 15px;
    }

    .melhor-valor-row td:first-child {
        color: #28a745;
    }

    /* Adicionar estilos para as visualizações */
    .indicador-preco {
        background-color: rgba(46, 204, 113, 0.1) !important;
    }

    .indicador-preco:hover {
        background-color: rgba(46, 204, 113, 0.2) !important;
    }

    .indicador-entrega {
        background-color: rgba(46, 204, 113, 0.1) !important;
    }

    .indicador-entrega:hover {
        background-color: rgba(46, 204, 113, 0.2) !important;
    }

    .indicador-pagamento {
        background-color: rgba(46, 204, 113, 0.1) !important;
    }

    .indicador-pagamento:hover {
        background-color: rgba(46, 204, 113, 0.2) !important;
    }

    @media (max-width: 768px) {
        .tabela-comparacao {
            font-size: 0.85em;
        }
        
        .tabela-comparacao th,
        .tabela-comparacao td {
            padding: 8px 10px;
        }
    }
`;
document.head.appendChild(style);

// Nova função para atualizar a lista de produtos únicos
function atualizarListaProdutosUnicos(data) {
    if (!data || !data.itens) {
        console.error('Dados inválidos para lista de produtos');
        return;
    }

    // Criar um Set para armazenar produtos únicos
    const produtosUnicos = new Set();
    
    // Adicionar produtos ao Set
    data.itens.forEach(item => {
        if (item.produto_nome) {
            produtosUnicos.add(item.produto_nome);
        }
    });

    // Converter Set para Array e ordenar alfabeticamente
    const produtosOrdenados = Array.from(produtosUnicos).sort();

    // Gerar HTML para a tabela
    let html = '';
    produtosOrdenados.forEach(produto => {
        // Encontrar o primeiro item com este nome de produto para obter o ID e fornecedor
        const itemProduto = data.itens.find(item => item.produto_nome === produto);
        
        html += `
            <tr>
                <td>${produto}</td>
                <td>
                    <button class="btn-acao btn-visualizar" onclick="verDetalhesProduto('${itemProduto.produto_id}', '${itemProduto.fornecedor_nome}')" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    // Atualizar a tabela
    document.getElementById('lista-produtos-body').innerHTML = html;
}

// Adicionar estilos CSS para a nova seção
const styleProdutos = document.createElement('style');
styleProdutos.textContent = `
    .lista-produtos-unicos {
        margin: 20px 0;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        padding: 15px;
    }

    .lista-produtos-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }

    .lista-produtos-header h4 {
        color: #333;
        margin: 0;
        font-size: 1.1em;
        font-weight: 600;
    }

    .btn-toggle-lista {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 5px;
        transition: transform 0.3s ease;
    }

    .btn-toggle-lista:hover {
        color: #333;
    }

    .btn-toggle-lista.rotated {
        transform: rotate(180deg);
    }

    .tabela-produtos {
        overflow-x: auto;
        transition: all 0.3s ease;
    }

    .tabela-produtos table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 0.9em;
    }

    .tabela-produtos th,
    .tabela-produtos td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    .tabela-produtos th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #555;
    }

    .tabela-produtos tr:hover {
        background-color: #f8f9fa;
    }

    .tabela-produtos .btn-acao {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 5px;
        transition: color 0.3s ease;
    }

    .tabela-produtos .btn-acao:hover {
        color: #333;
    }

    @media (max-width: 768px) {
        .tabela-produtos {
            font-size: 0.85em;
        }
        
        .tabela-produtos th,
        .tabela-produtos td {
            padding: 8px 10px;
        }
    }
`;
document.head.appendChild(styleProdutos);

// Adicionar função para alternar a visibilidade da lista
function toggleListaProdutos() {
    const tabela = document.querySelector('.tabela-produtos');
    const btn = document.querySelector('.btn-toggle-lista');
    
    if (tabela.style.display === 'none') {
        tabela.style.display = 'block';
        btn.classList.add('rotated');
    } else {
        tabela.style.display = 'none';
        btn.classList.remove('rotated');
    }
}

function renderizarResumoComparativo() {
    if (!cotacaoData || !cotacaoData.itens) return;
    
    const tbody = document.getElementById('tabela-resumo-body');
    if (!tbody) return;
    
    // Agrupar itens por produto_nome
    const itensPorProduto = {};
    cotacaoData.itens.forEach(item => {
        const key = item.produto_nome;
        if (!itensPorProduto[key]) {
            itensPorProduto[key] = {
                nome: item.produto_nome,
                unidade: item.produto_unidade || 'UN',
                quantidade: parseFloat(item.quantidade) || 0,
                itens: []
            };
        }
        itensPorProduto[key].itens.push(item);
    });
    
    let html = '';
    
    // Variáveis para calcular totais dos cards
    let totalValorMelhorPreco = 0;
    let totalValorMelhorEntrega = 0;
    let totalValorMelhorPagamento = 0;
    let totalEconomiaGeral = 0;
    let totalItensMelhorPreco = 0;
    let totalItensMelhorEntrega = 0;
    let totalItensMelhorPagamento = 0;
    let totalUltimoValorAprovado = 0;
    
    // Processar cada grupo de produtos
    Object.values(itensPorProduto).forEach(grupo => {
        const itens = grupo.itens;
        
        // Encontrar melhor preço
        const itensPorPreco = [...itens].sort((a, b) => {
            const valorA = parseFloat(a.valor_unitario) || 0;
            const valorB = parseFloat(b.valor_unitario) || 0;
            return valorA - valorB;
        });
        const melhorPreco = parseFloat(itensPorPreco[0].valor_unitario);
        const itemMelhorPreco = itensPorPreco[0];
        
        // Encontrar melhor prazo de entrega
        const itensComPrazoEntrega = itens.filter(item => item.prazo_entrega && item.prazo_entrega.trim() !== '');
        const itensPorPrazoEntrega = itensComPrazoEntrega.length > 0 ? 
            [...itensComPrazoEntrega].sort((a, b) => {
                const diasA = parseInt(a.prazo_entrega.match(/\d+/)?.[0] || 999);
                const diasB = parseInt(b.prazo_entrega.match(/\d+/)?.[0] || 999);
                return diasA - diasB;
            }) : [];
        const itemMelhorEntrega = itensPorPrazoEntrega.length > 0 ? itensPorPrazoEntrega[0] : null;
        
        // Encontrar melhor prazo de pagamento
        const itensComPrazoPagamento = itens.filter(item => item.prazo_pagamento && item.prazo_pagamento.trim() !== '');
        const itensPorPrazoPagamento = itensComPrazoPagamento.length > 0 ?
            [...itensComPrazoPagamento].sort((a, b) => {
                const diasA = parseInt(a.prazo_pagamento.match(/\d+/)?.[0] || 0);
                const diasB = parseInt(b.prazo_pagamento.match(/\d+/)?.[0] || 0);
                return diasB - diasA; // Ordem decrescente (maior prazo é melhor)
            }) : [];
        const itemMelhorPagamento = itensPorPrazoPagamento.length > 0 ? itensPorPrazoPagamento[0] : null;
        
        // Calcular valores totais para cada critério
        const valorTotalMelhorPreco = grupo.quantidade * melhorPreco;
        const valorTotalMelhorEntrega = itemMelhorEntrega ? grupo.quantidade * parseFloat(itemMelhorEntrega.valor_unitario) : 0;
        const valorTotalMelhorPagamento = itemMelhorPagamento ? grupo.quantidade * parseFloat(itemMelhorPagamento.valor_unitario) : 0;
        
        // Calcular economias vs último valor aprovado
        const ultimoValorAprovado = parseFloat(itemMelhorPreco.ultimo_valor_aprovado) || 0;
        const economiaMelhorPreco = ultimoValorAprovado > 0 ? (ultimoValorAprovado - melhorPreco) * grupo.quantidade : 0;
        const economiaMelhorEntrega = itemMelhorEntrega && ultimoValorAprovado > 0 ? 
            (ultimoValorAprovado - parseFloat(itemMelhorEntrega.valor_unitario)) * grupo.quantidade : 0;
        const economiaMelhorPagamento = itemMelhorPagamento && ultimoValorAprovado > 0 ? 
            (ultimoValorAprovado - parseFloat(itemMelhorPagamento.valor_unitario)) * grupo.quantidade : 0;
        
        // Acumular totais para os cards
        totalValorMelhorPreco += valorTotalMelhorPreco;
        totalValorMelhorEntrega += valorTotalMelhorEntrega;
        totalValorMelhorPagamento += valorTotalMelhorPagamento;
        totalUltimoValorAprovado += ultimoValorAprovado * grupo.quantidade;
        
        if (itemMelhorPreco) totalItensMelhorPreco++;
        if (itemMelhorEntrega) totalItensMelhorEntrega++;
        if (itemMelhorPagamento) totalItensMelhorPagamento++;
        
        // Renderizar bloco do produto
        html += `<tr class="resumo-produto-titulo"><td colspan="9"><strong>${grupo.nome}</strong> <span class="resumo-produto-qtd">Qtd: ${grupo.quantidade.toFixed(2)} ${grupo.unidade}</span></td></tr>`;
        
        // Renderizar as três opções (preço, entrega, pagamento)
        [
            { tipo: 'preco', label: 'Melhor Preço', icon: 'tag', item: itemMelhorPreco, valorTotal: valorTotalMelhorPreco, economia: economiaMelhorPreco },
            { tipo: 'entrega', label: 'Melhor Entrega', icon: 'truck', item: itemMelhorEntrega, valorTotal: valorTotalMelhorEntrega, economia: economiaMelhorEntrega },
            { tipo: 'pagamento', label: 'Melhor Pagamento', icon: 'credit-card', item: itemMelhorPagamento, valorTotal: valorTotalMelhorPagamento, economia: economiaMelhorPagamento }
        ].forEach(opcao => {
            if (!opcao.item) return;
            const economiaPercentual = ultimoValorAprovado > 0 ? (opcao.economia / (ultimoValorAprovado * grupo.quantidade)) * 100 : 0;
            const economiaClass = opcao.economia > 0 ? 'economia-positiva' : opcao.economia < 0 ? 'economia-negativa' : 'economia-neutra';
            const valorUltimoAprovado = opcao.item.ultimo_valor_aprovado ? parseFloat(opcao.item.ultimo_valor_aprovado) : 0;
                    html += `
                <tr class="resumo-produto-opcao">
                    <td></td>
                    <td><span class="badge badge-${opcao.tipo}"><i class="fas fa-${opcao.icon}"></i> ${opcao.label}</span></td>
                    <td>${opcao.item.fornecedor_nome}</td>
                    <td class="valor-unitario">R$ ${formatarNumero(opcao.item.valor_unitario)}</td>
                    <td class="valor-total">R$ ${formatarNumero(opcao.valorTotal)}</td>
                    <td>${valorUltimoAprovado > 0 ? `R$ ${formatarNumero(valorUltimoAprovado)}` : '-'}</td>
                    <td class="economia ${economiaClass}">
                        ${ultimoValorAprovado > 0 ? 
                            `R$ ${formatarNumero(opcao.economia)} (${economiaPercentual.toFixed(1)}%)` : 
                            'R$ 0,00 (0,0%)'}
                    </td>
                    <td>${opcao.item.prazo_entrega || '-'}</td>
                    <td>${opcao.item.prazo_pagamento || '-'}</td>
                        </tr>
                    `;
            });
        // Linha de separação visual
        html += `<tr class="resumo-produto-separador"><td colspan="9"></td></tr>`;
    });
    
    // Calcular economia geral (usando o menor valor entre as três opções)
    const valoresValidos = [totalValorMelhorPreco, totalValorMelhorEntrega, totalValorMelhorPagamento].filter(valor => valor > 0);
    const menorValor = valoresValidos.length > 0 ? Math.min(...valoresValidos) : 0;
    totalEconomiaGeral = totalUltimoValorAprovado > 0 ? totalUltimoValorAprovado - menorValor : 0;
    const economiaGeralPercentual = totalUltimoValorAprovado > 0 ? (totalEconomiaGeral / totalUltimoValorAprovado) * 100 : 0;
    
    // Popular os cards de comparativo
    document.getElementById('valor-total-resumo-preco').textContent = `R$ ${formatarNumero(totalValorMelhorPreco)}`;
    document.getElementById('quantidade-total-itens-resumo-preco').textContent = `${totalItensMelhorPreco} itens`;
    
    document.getElementById('valor-total-resumo-entrega').textContent = `R$ ${formatarNumero(totalValorMelhorEntrega)}`;
    document.getElementById('quantidade-total-itens-resumo-entrega').textContent = `${totalItensMelhorEntrega} itens`;
    
    document.getElementById('valor-total-resumo-pagamento').textContent = `R$ ${formatarNumero(totalValorMelhorPagamento)}`;
    document.getElementById('quantidade-total-itens-resumo-pagamento').textContent = `${totalItensMelhorPagamento} itens`;
    
    document.getElementById('economia-resumo-geral').textContent = `R$ ${formatarNumero(totalEconomiaGeral)}`;
    document.getElementById('economia-resumo-porcentagem').textContent = `${economiaGeralPercentual.toFixed(1)}%`;
    
    // Aplicar classe de cor no card de economia conforme o valor
    const cardEconomia = document.querySelector('#visualizacao-resumo .resumo-card:nth-child(4)');
    if (cardEconomia) {
        // Remover classes anteriores
        cardEconomia.classList.remove('economia-positiva', 'economia-negativa', 'economia-neutra');
        
        // Aplicar classe conforme o valor
        if (totalEconomiaGeral > 0) {
            cardEconomia.classList.add('economia-positiva');
        } else if (totalEconomiaGeral < 0) {
            cardEconomia.classList.add('economia-negativa');
        } else {
            cardEconomia.classList.add('economia-neutra');
        }
    }
    
    tbody.innerHTML = html;
}

// Atualizar a função forcarVisualizacao para incluir o novo caso
function forcarVisualizacao(viewId) {
    console.log('Forçando visualização:', viewId);
   
    // Obter referências a todos os containers
    const padrao = document.getElementById('visualizacao-padrao');
    const resumo = document.getElementById('visualizacao-resumo');
    const melhorPreco = document.getElementById('visualizacao-melhor-preco');
    const melhorEntrega = document.getElementById('visualizacao-melhor-entrega');
    const melhorPagamento = document.getElementById('visualizacao-melhor-pagamento');
   
    // Esconder TODOS explicitamente
    if (padrao) padrao.style.display = 'none';
    if (resumo) resumo.style.display = 'none';
    if (melhorPreco) melhorPreco.style.display = 'none';
    if (melhorEntrega) melhorEntrega.style.display = 'none';
    if (melhorPagamento) melhorPagamento.style.display = 'none';
   
    // Mostrar APENAS o selecionado
    const selecionado = document.getElementById(viewId);
    if (selecionado) {
        selecionado.style.display = 'block';
        console.log(`Elemento ${viewId} agora está visível`);
    }
   
    // Atualizar classes dos botões
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.classList.remove('active');
    });
   
    const btnAtivo = document.getElementById('btn-' + viewId);
    if (btnAtivo) btnAtivo.classList.add('active');
   
    // Renderizar dados conforme necessário
    if (viewId === 'visualizacao-resumo') {
        renderizarResumoComparativo();
    } else if (viewId === 'visualizacao-melhor-preco') {
        renderizarMelhorPreco();
    } else if (viewId === 'visualizacao-melhor-entrega') {
        renderizarMelhorEntrega();
    } else if (viewId === 'visualizacao-melhor-pagamento') {
        renderizarMelhorPagamento();
    }
}

// Adicionar estilos CSS para a nova visualização
const styleResumo = document.createElement('style');
styleResumo.textContent = `
    .tabela-resumo {
        overflow-x: auto;
        margin-top: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tabela-resumo table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9em;
        background: white;
    }

    .tabela-resumo th,
    .tabela-resumo td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    .tabela-resumo th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #555;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .tabela-resumo tr:hover {
        background-color: #f8f9fa;
        transition: background-color 0.2s ease;
    }

    .tabela-resumo .melhor-preco {
        color: #28a745;
        font-weight: 500;
        position: relative;
    }

    .tabela-resumo .melhor-preco::before {
        content: '↓';
        position: absolute;
        left: -15px;
        color: #28a745;
    }

    .tabela-resumo .melhor-entrega {
        color: #007bff;
        font-weight: 500;
        position: relative;
    }

    .tabela-resumo .melhor-entrega::before {
        content: '⚡';
        position: absolute;
        left: -15px;
        color: #007bff;
    }

    .tabela-resumo .melhor-pagamento {
        color: #6f42c1;
        font-weight: 500;
        position: relative;
    }

    .tabela-resumo .melhor-pagamento::before {
        content: '💳';
        position: absolute;
        left: -15px;
        color: #6f42c1;
    }

    /* Adicionar linhas alternadas para melhor legibilidade */
    .tabela-resumo tr:nth-child(even) {
        background-color: #fafafa;
    }

    /* Estilo para células vazias ou com valor '-' */
    .tabela-resumo td:empty,
    .tabela-resumo td:contains('-') {
        color: #999;
        font-style: italic;
    }

    /* Adicionar tooltip nos valores */
    .tabela-resumo td[title] {
        cursor: help;
        border-bottom: 1px dotted #ccc;
    }

    /* Estilo para destacar quando o mesmo fornecedor tem a melhor oferta em múltiplos critérios */
    .tabela-resumo tr.mesmo-fornecedor {
        background-color: #f0f7ff;
    }

    @media (max-width: 768px) {
        .tabela-resumo {
            font-size: 0.85em;
        }
        
        .tabela-resumo th,
        .tabela-resumo td {
            padding: 8px 10px;
        }
    }
`;
document.head.appendChild(styleResumo);

// Adicionar estilos CSS para a nova seção
const styleComparacao = document.createElement('style');
styleComparacao.textContent = `
    .comparacao-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }

    .comparacao-header h4 {
        color: #333;
        margin: 0;
        font-size: 1.1em;
        font-weight: 600;
    }

    .btn-toggle-comparacao {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 5px;
        transition: transform 0.3s ease;
    }

    .btn-toggle-comparacao:hover {
        color: #333;
    }

    .btn-toggle-comparacao.rotated {
        transform: rotate(180deg);
    }
`;
document.head.appendChild(styleComparacao);
// Adicionar função para alternar a visibilidade da comparação
function toggleComparacao() {
    const tabela = document.querySelector('.tabela-comparacao');
    const btn = document.querySelector('.btn-toggle-comparacao');
    
    if (tabela.style.display === 'none') {
        tabela.style.display = 'block';
        btn.classList.add('rotated');
    } else {
        tabela.style.display = 'none';
        btn.classList.remove('rotated');
    }
}
</script>

<style>
    .edicoes-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 0.8em;
        margin-left: 5px;
        background-color: #fd7e14; /* Cor laranja específica solicitada */
        color: white;
        font-weight: bold;
    }
    
    .rodadas-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 0.8em;
        margin-left: 5px;
        margin-right: 3px;
        background-color: #007bff;
        color: white;
        font-weight: bold;
    }
    
    /* Ajuste para que os badges fiquem lado a lado */
    .rodadas-badge, .edicoes-badge {
        display: inline-block;
        margin-right: 3px;
    }
</style>


<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<?php include 'includes/modal_historico.php'; ?>

<style>
    .modal-content.modal-analise {
        width: 95%;
        max-width: 1400px;
        max-height: 95vh;
        margin: 2.5vh auto;
        overflow-y: auto;
    }
</style>

<style>
.tabela-resumo .resumo-produto-titulo {
    background: #f4f8fb;
    border-top: 2px solid #d1e3f3;
    font-size: 1.08em;
}
.tabela-resumo .resumo-produto-qtd {
    color: #888;
    font-weight: normal;
    font-size: 0.95em;
    margin-left: 15px;
}
.tabela-resumo .resumo-produto-opcao {
    background: #fafdff;
}
.tabela-resumo .resumo-produto-separador td {
    height: 8px;
    background: transparent;
    border: none;
    padding: 0;
    }
</style>
