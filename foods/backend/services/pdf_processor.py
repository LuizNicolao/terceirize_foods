#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serviço de Processamento de PDFs de Cardápio
Usa pdfplumber para extrair tabelas de forma estruturada
"""

import pdfplumber
import re
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

class PDFCardapioProcessor:
    """Processador de PDFs de cardápio usando pdfplumber"""
    
    def __init__(self):
        self.downloads_dir = "/home/luiznicolao/Downloads/testecardapio"
        self._ensure_downloads_dir()
    
    def _ensure_downloads_dir(self):
        """Garante que o diretório de downloads existe"""
        if not os.path.exists(self.downloads_dir):
            os.makedirs(self.downloads_dir)
    
    def extrair_tabela_do_pdf(self, caminho_do_arquivo_pdf: str) -> Optional[List[List[str]]]:
        """
        Extrai a tabela do PDF usando pdfplumber
        
        Args:
            caminho_do_arquivo_pdf: Caminho para o arquivo PDF
            
        Returns:
            Lista de listas representando a tabela extraída
        """
        try:
            with pdfplumber.open(caminho_do_arquivo_pdf) as pdf:
                # Processar todas as páginas
                todas_tabelas = []
                for i, page in enumerate(pdf.pages):
                    # Extrair tabelas da página
                    tabelas = page.extract_tables()
                    
                    if tabelas:
                        # Assumimos que o cardápio é a primeira tabela
                        tabela_principal = tabelas[0]
                        
                        # Limpar e normalizar a tabela
                        tabela_limpa = []
                        max_colunas = 0
                        
                        # Primeiro, encontrar o número máximo de colunas
                        for linha in tabela_principal:
                            if linha:
                                max_colunas = max(max_colunas, len(linha))
                        
                        
                        # Normalizar todas as linhas para ter o mesmo número de colunas
                        for linha in tabela_principal:
                            if linha:  # Verificar se a linha não está vazia
                                # Normalizar o número de colunas
                                linha_normalizada = [celula or "" for celula in linha]
                                
                                # Garantir que todas as linhas tenham o mesmo número de colunas
                                while len(linha_normalizada) < max_colunas:
                                    linha_normalizada.append("")
                                
                                # Truncar se tiver mais colunas que o máximo
                                if len(linha_normalizada) > max_colunas:
                                    linha_normalizada = linha_normalizada[:max_colunas]
                                
                                tabela_limpa.append(linha_normalizada)
                        
                        # Aplicar correção de alinhamento se necessário
                        tabela_limpa = self._corrigir_alinhamento_datas(tabela_limpa)
                        
                        # Adicionar marcador de página para identificar datas específicas
                        tabela_limpa.append([f"PAGE_MARKER_{i+1}"] + [""] * (max_colunas - 1))
                        
                        todas_tabelas.extend(tabela_limpa)
                
                return todas_tabelas
                
        except Exception as e:
            print(f"❌ Erro ao extrair tabela do PDF: {str(e)}")
            return None
    
    def _corrigir_alinhamento_datas(self, tabela: List[List[str]]) -> List[List[str]]:
        """
        Corrige o alinhamento das datas quando há deslocamento
        
        Args:
            tabela: Tabela normalizada
            
        Returns:
            Tabela com alinhamento corrigido
        """
        if not tabela or len(tabela) < 2:
            return tabela
        
        
        # Procurar por linha com datas
        linha_datas_idx = None
        for i, linha in enumerate(tabela[:3]):
            datas_encontradas = 0
            for celula in linha:
                if celula and re.search(r'\d{1,2}/\d{1,2}/\d{4}', celula):
                    datas_encontradas += 1
            
            if datas_encontradas >= 2:  # Pelo menos 2 datas na linha
                linha_datas_idx = i
                break
        
        if linha_datas_idx is None:
            return tabela
        
        linha_datas = tabela[linha_datas_idx]
        
        # Verificar se há desalinhamento (gap entre datas)
        posicoes_datas = []
        for i, celula in enumerate(linha_datas):
            if celula and re.search(r'\d{1,2}/\d{1,2}/\d{4}', celula):
                posicoes_datas.append(i)
        
        
        # Se há gap entre as posições das datas, corrigir
        if len(posicoes_datas) >= 2:
            gaps = []
            for i in range(1, len(posicoes_datas)):
                gap = posicoes_datas[i] - posicoes_datas[i-1]
                gaps.append(gap)
            
            
            # Se há um gap maior que 1, há desalinhamento
            if any(gap > 1 for gap in gaps):
                
                # Encontrar o padrão correto (posições consecutivas)
                primeira_data_pos = posicoes_datas[0]
                posicoes_corretas = [primeira_data_pos + i for i in range(len(posicoes_datas))]
                
                
                # Criar nova tabela com alinhamento corrigido
                tabela_corrigida = []
                for linha_idx, linha in enumerate(tabela):
                    if linha_idx == linha_datas_idx:
                        # Corrigir linha de datas
                        nova_linha = [""] * len(linha)
                        for i, pos_original in enumerate(posicoes_datas):
                            if i < len(posicoes_corretas):
                                nova_linha[posicoes_corretas[i]] = linha[pos_original]
                        tabela_corrigida.append(nova_linha)
                    else:
                        # Para outras linhas, mover conteúdo das colunas correspondentes
                        nova_linha = [""] * len(linha)
                        for i, pos_original in enumerate(posicoes_datas):
                            if i < len(posicoes_corretas) and pos_original < len(linha):
                                nova_linha[posicoes_corretas[i]] = linha[pos_original]
                        
                        # Manter conteúdo das outras colunas
                        for i, celula in enumerate(linha):
                            if i not in posicoes_datas:
                                nova_linha[i] = celula
                        
                        tabela_corrigida.append(nova_linha)
                
                return tabela_corrigida
        
        return tabela
    
    def processar_tabela_cardapio(self, tabela_extraida: List[List[str]]) -> List[Dict[str, Any]]:
        """
        Processa a tabela extraída e transforma em dados estruturados
        
        Args:
            tabela_extraida: Lista de listas da tabela extraída
            
        Returns:
            Lista de dicionários com as refeições processadas
        """
        if not tabela_extraida:
            return []
        
        
        refeicoes_processadas = []
        
        # Procurar por linha com datas (pode ser primeira ou segunda linha)
        mapa_datas = {}
        linha_datas = None
        
        for linha_idx, linha in enumerate(tabela_extraida[:3]):  # Verificar primeiras 3 linhas
            for col_idx, celula in enumerate(linha):
                if celula and re.search(r'\d{1,2}/\d{1,2}/\d{4}', celula):
                    # Extrair data da célula
                    match = re.search(r'(\d{1,2}/\d{1,2}/\d{4})', celula)
                    if match:
                        data = match.group(1)
                        mapa_datas[col_idx] = data
                        if linha_datas is None:
                            linha_datas = linha_idx
        
        
        # Se não encontrou datas, tentar extrair do texto das receitas
        if not mapa_datas:
            for linha_idx, linha in enumerate(tabela_extraida):
                for col_idx, celula in enumerate(linha):
                    if celula and re.search(r'\d{1,2}/\d{1,2}/\d{4}', celula):
                        match = re.search(r'(\d{1,2}/\d{1,2}/\d{4})', celula)
                        if match:
                            data = match.group(1)
                            if col_idx not in mapa_datas:
                                mapa_datas[col_idx] = data
        
        # Processar por blocos de páginas
        pagina_atual = 1
        mapa_datas_atual = {}
        inicio_linhas = 1
        if linha_datas is not None and linha_datas > 0:
            inicio_linhas = linha_datas + 1
        
        for linha_idx, linha in enumerate(tabela_extraida[inicio_linhas:], start=inicio_linhas):
            # Verificar se é um marcador de página
            if linha and linha[0] and linha[0].startswith("PAGE_MARKER_"):
                # Processar página anterior se houver dados
                if mapa_datas_atual:
                    # Usar o mapa de datas da página atual
                    mapa_datas = mapa_datas_atual
                
                # Resetar para nova página
                pagina_atual += 1
                mapa_datas_atual = {}
                continue
            
            # Procurar por linha com datas (primeiras 3 linhas de cada página)
            if linha_idx < 3 or not mapa_datas_atual:
                for col_idx, celula in enumerate(linha):
                    if celula and re.search(r'\d{1,2}/\d{1,2}/\d{4}', celula):
                        # Extrair data da célula
                        match = re.search(r'(\d{1,2}/\d{1,2}/\d{4})', celula)
                        if match:
                            data = match.group(1)
                            mapa_datas_atual[col_idx] = data
            
            
            if not linha or len(linha) < 2:
                continue
            
            # Extrair e limpar o turno
            turno_bruto = linha[0] if linha[0] else ""
            
            if not turno_bruto.strip():
                continue
            
            # Processar turnos (pode ter múltiplos turnos na mesma célula)
            turnos = self._extrair_turnos(turno_bruto)
            
            # Se não encontrou turnos válidos, usar turnos padrão
            if not turnos or turnos == ['Não identificado']:
                turnos = ['Matutino', 'Vespertino', 'Noturno']
            
            # Garantir que sempre temos os 3 turnos
            if len(turnos) < 3:
                turnos_completos = ['Matutino', 'Vespertino', 'Noturno']
                for turno in turnos_completos:
                    if turno not in turnos:
                        turnos.append(turno)
            
            # Iterar sobre as células da refeição na linha
            for i, texto_celula in enumerate(linha[1:], start=1):
                if i not in mapa_datas:
                    continue
                
                if not texto_celula or not texto_celula.strip():
                    continue
                
                # Associar dados
                data_atual = mapa_datas[i]
                texto_refeicao = texto_celula.replace('\n', ' ').strip()
                
                
                # Extrair código e descrição
                codigo, descricao = self._extrair_codigo_descricao(texto_refeicao)
                
                # Só adicionar se tiver código ou descrição válida
                if codigo or (descricao and descricao.strip() and not re.match(r'^[A-Za-z]+\s*[–-]\s*feira\s+\d{1,2}/\d{1,2}/\d{4}$', descricao.strip())):
                    # Se a data estiver vazia, tentar extrair do contexto da linha
                    if not data_atual:
                        # Procurar por datas no texto da receita
                        match_data = re.search(r'(\d{1,2}/\d{1,2}/\d{4})', texto_refeicao)
                        if match_data:
                            data_atual = match_data.group(1)
                        
                        # Se ainda não encontrou, tentar extrair do contexto da tabela
                        if not data_atual:
                            # Procurar em linhas próximas por datas
                            for offset in range(-2, 3):
                                linha_contexto_idx = linha_idx + offset
                                if 0 <= linha_contexto_idx < len(tabela_extraida):
                                    linha_contexto = tabela_extraida[linha_contexto_idx]
                                    for celula_contexto in linha_contexto:
                                        if celula_contexto and re.search(r'\d{1,2}/\d{1,2}/\d{4}', celula_contexto):
                                            match_contexto = re.search(r'(\d{1,2}/\d{1,2}/\d{4})', celula_contexto)
                                            if match_contexto:
                                                data_atual = match_contexto.group(1)
                                                break
                                    if data_atual:
                                        break
                    
                    # Verificar se já existe uma receita similar para evitar duplicatas
                    receita_existente = None
                    for ref_existente in refeicoes_processadas:
                        if (ref_existente['codigo'] == codigo and 
                            ref_existente['data'] == data_atual and 
                            ref_existente['descricao'] == descricao):
                            receita_existente = ref_existente
                            break
                    
                    if receita_existente:
                        # Adicionar turnos que ainda não existem
                        turnos_existentes = [ref['turno'] for ref in refeicoes_processadas 
                                           if ref['codigo'] == codigo and ref['data'] == data_atual]
                        
                        for turno in turnos:
                            if turno not in turnos_existentes:
                                refeicao = {
                                    'data': data_atual or 'Data não identificada',
                                    'turno': turno,
                                    'codigo': codigo,
                                    'descricao': descricao,
                                    'texto_original': texto_refeicao
                                }
                                refeicoes_processadas.append(refeicao)
                    else:
                        # Adicionar aos resultados para cada turno
                        for turno in turnos:
                            refeicao = {
                                'data': data_atual or 'Data não identificada',
                                'turno': turno,
                                'codigo': codigo,
                                'descricao': descricao,
                                'texto_original': texto_refeicao
                            }
                            refeicoes_processadas.append(refeicao)
                else:
                    pass  # Não há código ou descrição válida, pular
        
        return refeicoes_processadas
    
    def _extrair_turnos(self, turno_bruto: str) -> List[str]:
        """
        Extrai turnos de uma string que pode conter múltiplos turnos
        
        Args:
            turno_bruto: String com turnos (ex: "Matutino\nVespertino\nSemana 2")
            
        Returns:
            Lista de turnos limpos
        """
        if not turno_bruto:
            return []
        
        # Dividir por quebras de linha e limpar
        turnos_brutos = [t.strip() for t in turno_bruto.split('\n') if t.strip()]
        
        # Filtrar apenas turnos válidos
        turnos_validos = []
        for turno in turnos_brutos:
            # Ignorar cabeçalhos e strings inválidas
            if any(palavra in turno.lower() for palavra in [
                'semana', 'pág', 'documento', 'secretaria', 'turnos', 'cardápio', 'parcial'
            ]):
                continue
            
            # Ignorar strings muito curtas ou que parecem datas
            if len(turno) <= 2 or re.match(r'\d{1,2}/\d{1,2}/\d{4}', turno):
                continue
                
            # Verificar se é um turno válido
            if any(turno_valido in turno.lower() for turno_valido in [
                'matutino', 'vespertino', 'noturno', 'manhã', 'tarde', 'noite'
            ]):
                turnos_validos.append(turno)
        
        # Se não encontrou turnos válidos, tentar extrair do contexto
        if not turnos_validos:
            # Tentar extrair turnos do contexto da tabela
            turnos_validos = self._extrair_turnos_do_contexto()
        
        return turnos_validos if turnos_validos else ['Não identificado']
    
    def _extrair_turnos_do_contexto(self) -> List[str]:
        """
        Extrai turnos do contexto da tabela quando não são encontrados na célula específica
        
        Returns:
            Lista de turnos encontrados no contexto
        """
        # Turnos padrão que geralmente aparecem nos cardápios
        turnos_padrao = ['Matutino', 'Vespertino', 'Noturno']
        
        return turnos_padrao
    
    def _extrair_codigo_descricao(self, texto_refeicao: str) -> tuple:
        """
        Extrai código e descrição de uma string de refeição
        
        Args:
            texto_refeicao: Texto da refeição
            
        Returns:
            Tupla (codigo, descricao)
        """
        if not texto_refeicao or not texto_refeicao.strip():
            return None, ""
        
        # Limpar o texto
        texto_limpo = texto_refeicao.strip()
        
        # Regex para códigos de receita (ex: LL25.228, R25.375, LL24.22)
        pattern = r'([A-Z]{1,2}\d{2}\.\d{2,3})\s*(.*)'
        match = re.search(pattern, texto_limpo)
        
        if match:
            codigo = match.group(1)
            descricao = match.group(2).strip()
            
            # Limpar descrição de quebras de linha e espaços extras
            descricao = re.sub(r'\s+', ' ', descricao)
            
            return codigo, descricao
        else:
            # Se não encontrar código, verificar se é apenas uma data
            if re.match(r'^[A-Za-z]+\s*[–-]\s*feira\s+\d{1,2}/\d{1,2}/\d{4}$', texto_limpo):
                return None, ""
            
            # Se não encontrar código, usar o texto inteiro como descrição
            return None, texto_limpo
    
    def processar_pdf_completo(self, caminho_do_arquivo_pdf: str) -> Dict[str, Any]:
        """
        Processa um PDF completo e retorna dados estruturados
        
        Args:
            caminho_do_arquivo_pdf: Caminho para o arquivo PDF
            
        Returns:
            Dicionário com dados processados
        """
        print("=" * 60)
        
        # Extrair tabela
        tabela_extraida = self.extrair_tabela_do_pdf(caminho_do_arquivo_pdf)
        if not tabela_extraida:
            return {"erro": "Não foi possível extrair tabela do PDF"}
        
        # Processar tabela
        refeicoes_processadas = self.processar_tabela_cardapio(tabela_extraida)
        
        # Organizar por data
        cardapio_por_data = self._organizar_por_data(refeicoes_processadas)
        
        # Gerar resultado final
        resultado = {
            "sucesso": True,
            "total_refeicoes": len(refeicoes_processadas),
            "total_dias": len(cardapio_por_data),
            "refeicoes": refeicoes_processadas,
            "cardapio_por_data": cardapio_por_data,
            "tabela_bruta": tabela_extraida,  # Adicionar estrutura bruta da tabela
            "metadados": {
                "arquivo_original": os.path.basename(caminho_do_arquivo_pdf),
                "data_processamento": datetime.now().isoformat(),
                "metodo": "pdfplumber",
                "dimensoes_tabela": f"{len(tabela_extraida)} linhas x {len(tabela_extraida[0]) if tabela_extraida else 0} colunas"
            }
        }
        
        # Salvar arquivo JSON
        self._salvar_resultado_json(resultado)
        
        # Imprimir JSON de forma clara para o Node.js capturar
        print("JSON_RESULTADO_START")
        print(json.dumps(resultado, ensure_ascii=False, indent=2))
        print("JSON_RESULTADO_END")
        
        return resultado
    
    def _organizar_por_data(self, refeicoes: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Organiza refeições por data"""
        cardapio_por_data = {}
        
        for refeicao in refeicoes:
            data = refeicao.get('data', '')
            # Se a data estiver vazia, tentar extrair do texto original
            if not data and refeicao.get('texto_original'):
                match = re.search(r'(\d{1,2}/\d{1,2}/\d{4})', refeicao['texto_original'])
                if match:
                    data = match.group(1)
                    refeicao['data'] = data
            
            if data not in cardapio_por_data:
                cardapio_por_data[data] = []
            cardapio_por_data[data].append(refeicao)
        
        return cardapio_por_data
    
    def _salvar_resultado_json(self, resultado: Dict[str, Any]):
        """Salva o resultado em arquivo JSON"""
        timestamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
        filename = f"cardapio-pdfplumber-{timestamp}.json"
        filepath = os.path.join(self.downloads_dir, filename)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(resultado, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ Erro ao salvar resultado: {str(e)}")

# Função principal para uso externo
def processar_cardapio_pdf(caminho_do_arquivo_pdf: str) -> Dict[str, Any]:
    """
    Função principal para processar PDF de cardápio
    
    Args:
        caminho_do_arquivo_pdf: Caminho para o arquivo PDF
        
    Returns:
        Dicionário com dados processados
    """
    processor = PDFCardapioProcessor()
    return processor.processar_pdf_completo(caminho_do_arquivo_pdf)

if __name__ == "__main__":
    # Teste local
    import sys
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        resultado = processar_cardapio_pdf(pdf_path)
    else:
        print("Uso: python pdf_processor.py <caminho_do_pdf>")
