#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import pdfplumber
import tempfile
from pathlib import Path
import re
import traceback
import datetime
from collections import defaultdict

app = Flask(__name__, template_folder="templates")
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # até 100 MB

# =====================================================
# 🧩 Funções auxiliares básicas
# =====================================================

def sanitize_text(x):
    if x is None:
        return ""
    return re.sub(r"\s+", " ", str(x)).strip()

def pick_headers(rows):
    """Detecta linha de cabeçalho automaticamente"""
    if not rows:
        return [], []
    best_i = 0
    best_ratio = sum(1 for c in rows[0] if c) / max(1, len(rows[0]))
    for i, r in enumerate(rows[:5]):
        ratio = sum(1 for c in r if c) / max(1, len(r))
        if ratio > best_ratio:
            best_i, best_ratio = i, ratio
    if best_ratio >= 0.5:
        headers = rows[best_i]
        data = rows[:best_i] + rows[best_i+1:]
    else:
        width = max(len(r) for r in rows)
        headers = [f"col_{i+1}" for i in range(width)]
        data = rows
    width = len(headers)
    fixed = []
    for r in data:
        if len(r) < width:
            r = r + [""] * (width - len(r))
        elif len(r) > width:
            r = r[:width]
        fixed.append(r)
    return headers, fixed


# =====================================================
# ⚙️ Regex e configurações globais
# =====================================================

DATE_RX = re.compile(r"(\d{1,2})/(\d{1,2})/(\d{4})")
CODE_STRICT_RX = re.compile(r"\b([A-Z]{1,2}\d{2}\.\d{3})\b")
CODE_PARTIAL_RX = re.compile(r"\b([A-Z]{1,2}\d{2}\.\d{2})\b")
TURNOS_KNOWN = [
    "Matutino", "Vespertino", "Noturno",
    "Lanche Manhã", "Almoço", "Lanche Tarde",
    "Parcial", "EJA"
]

# =====================================================
# 🔎 Normalização de cabeçalhos e estrutura
# =====================================================

def parse_date_any(s):
    if not s:
        return None
    m = DATE_RX.search(s)
    if not m:
        return None
    d, mo, y = map(int, m.groups())
    try:
        return datetime.date(y, mo, d).isoformat()
    except Exception:
        return None

def forward_fill(lst):
    last = ""
    out = []
    for x in lst:
        if x:
            last = x
            out.append(x)
        else:
            out.append(last)
    return out

def strip_title_rows(rows):
    """Remove linhas antes da que contém 'TURNOS'"""
    header_row_idx = None
    for i, r in enumerate(rows):
        if r and r[0] and "TURNOS" in r[0].upper():
            header_row_idx = i
            break
    if header_row_idx is None:
        return rows, 0
    return rows[header_row_idx:], header_row_idx

def drop_empty_columns(headers, body):
    keep_idx = []
    for j, h in enumerate(headers):
        if h:
            keep_idx.append(j)
            continue
        has_val = any((len(r) > j and (r[j] or "").strip()) for r in body)
        if has_val:
            keep_idx.append(j)
    def select(cols, idxs): return [cols[j] if j < len(cols) else "" for j in idxs]
    headers2 = select(headers, keep_idx)
    body2 = [select(r, keep_idx) for r in body]
    return headers2, body2


# =====================================================
# 🔧 Preenchimento e alinhamento de cabeçalhos
# =====================================================

def fill_empties_nearest(headers):
    """Preenche cabeçalhos vazios com o vizinho mais próximo (empate → direita)."""
    n = len(headers)
    filled = headers[:]
    non_empty_idx = [i for i, h in enumerate(headers) if h and str(h).strip()]
    if not non_empty_idx:
        return filled

    for i, h in enumerate(headers):
        if h and str(h).strip():
            continue
        left = right = None
        for j in range(i-1, -1, -1):
            if headers[j] and str(headers[j]).strip():
                left = j
                break
        for j in range(i+1, n):
            if headers[j] and str(headers[j]).strip():
                right = j
                break
        pick = None
        if left is None and right is None:
            pick = None
        elif left is None:
            pick = right
        elif right is None:
            pick = left
        else:
            dl = i - left
            dr = right - i
            pick = right if dr <= dl else left
        filled[i] = headers[pick] if pick is not None else headers[i]
    return filled


def col_nonempty_count(body, j, sample_rows=6):
    """Conta quantas células não-vazias existem na coluna j."""
    n = min(sample_rows, len(body))
    cnt = 0
    for i in range(n):
        if j < len(body[i]) and (body[i][j] or "").strip():
            cnt += 1
    return cnt


def align_headers_to_body(headers, body, max_passes=3):
    """
    Corrige casos em que um header de DATA está deslocado 1 coluna para a direita.
    Regra: se header[j] é data e a coluna j tem poucos valores, mas a coluna j-1
    tem mais valores e (header[j-1] está vazio ou não é data), então 'puxa' o header[j]
    para j-1 (swap).
    """
    hdr = headers[:]
    for _ in range(max_passes):
        changed = False
        for j in range(2, len(hdr)):  # começa em 2 (col_1=TURNOS)
            h = hdr[j]
            if not h or not parse_date_any(h):
                continue
            left_h = hdr[j-1] if j-1 >= 0 else ""
            left_is_date = bool(parse_date_any(left_h))
            this_cnt = col_nonempty_count(body, j, sample_rows=6)
            left_cnt = col_nonempty_count(body, j-1, sample_rows=6)
            if left_cnt > this_cnt and (not left_h or not left_is_date):
                hdr[j-1], hdr[j] = hdr[j], hdr[j-1]
                changed = True
        if not changed:
            break
    return hdr


def collapse_duplicate_headers(headers, body):
    idx_by_header = defaultdict(list)
    for j, h in enumerate(headers):
        idx_by_header[h].append(j)
    unique_headers = list(idx_by_header.keys())
    new_body = []
    for r in body:
        new_row = []
        for h in unique_headers:
            idxs = idx_by_header[h]
            parts = []
            for j in idxs:
                if j < len(r) and r[j]:
                    parts.append(r[j])
            new_row.append(" ".join(parts).strip())
        new_body.append(new_row)
    return unique_headers, new_body


def split_turnos(cell_text):
    if not cell_text:
        return [], ""
    found = [t for t in TURNOS_KNOWN if t in cell_text]
    semana = ""
    m = re.search(r"(Semana\s+\d+)", cell_text, flags=re.IGNORECASE)
    if m:
        semana = m.group(1)
    if found:
        return sorted(set(found)), semana
    return [cell_text.strip()], semana

# =====================================================
# 🍽️ Separação de receitas por célula
# =====================================================

def split_cell_into_items(cell_text):
    """Divide uma célula em itens {code, descricao, incompleto?}."""
    text = (cell_text or "").strip()
    if not text:
        return []
    matches = [(m.start(), m.end(), m.group(1), False) for m in CODE_STRICT_RX.finditer(text)]
    if not matches:
        matches = [(m.start(), m.end(), m.group(1), True) for m in CODE_PARTIAL_RX.finditer(text)]
    if not matches:
        return [{"code": None, "descricao": text}]
    matches.sort(key=lambda t: t[0])
    items = []
    for i, (s, e, code, is_partial) in enumerate(matches):
        next_start = matches[i+1][0] if i+1 < len(matches) else len(text)
        desc_span = text[e:next_start].strip(" ,;-–—")
        desc_full = f"{code} {desc_span}".strip() if desc_span else code
        item = {"code": code, "descricao": desc_full}
        if is_partial:
            item["incompleto"] = True
        items.append(item)
    return items

# =====================================================
# 🧠 Normalização principal
# =====================================================

def normalize_table(clean_rows):
    if not clean_rows:
        return {"headers_filled": [], "rows": [], "by_date": {}}

    rows2, _ = strip_title_rows(clean_rows)
    if not rows2:
        return {"headers_filled": [], "rows": [], "by_date": {}}

    headers_raw = rows2[0]
    body = rows2[1:]

    # 1) preenche vazios (empate -> direita)
    headers_ff = fill_empties_nearest(headers_raw)

    # 2) alinha cabeçalhos com corpo (corrige sexta deslocada)
    headers_ff = align_headers_to_body(headers_ff, body, max_passes=2)

    headers_ff, body = drop_empty_columns(headers_ff, body)
    headers_collapsed, body = collapse_duplicate_headers(headers_ff, body)

    header_dates = []
    for h in headers_collapsed:
        iso = parse_date_any(h)
        header_dates.append(iso or h)

    by_date = defaultdict(lambda: defaultdict(list))

    for row in body:
        if not row:
            continue
        turno_cell = row[0] if len(row) > 0 else ""
        turnos, _sem = split_turnos(turno_cell)
        if not turnos:
            turnos = [turno_cell]

        for j in range(1, len(header_dates)):
            date_key = header_dates[j]
            if not date_key or str(date_key).upper().startswith("TURNOS"):
                continue
            cell = row[j] if j < len(row) else ""
            if not cell:
                continue
            items = split_cell_into_items(cell)
            for t in turnos:
                day_key = date_key if re.match(r"\d{4}-\d{2}-\d{2}", str(date_key)) else date_key
                seen = set()
                for it in items:
                    key = (it.get("code"), it.get("descricao"))
                    if key in seen:
                        continue
                    seen.add(key)
                    by_date[day_key][t].append(it)

    return {"headers_filled": header_dates, "rows": body, "by_date": by_date}

# =====================================================
# 🚀 Rotas Flask
# =====================================================

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/api/parse", methods=["POST"])
def api_parse():
    try:
        if "file" not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado (campo 'file')"}), 400
        f = request.files["file"]
        if not f.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Envie um arquivo .pdf"}), 400
        filename = secure_filename(f.filename)
        with tempfile.TemporaryDirectory() as tmpdir:
            pdf_path = Path(tmpdir) / filename
            f.save(str(pdf_path))
            payload_tables = []
            with pdfplumber.open(pdf_path) as pdf:
                pages_count = len(pdf.pages)
                for page in pdf.pages:
                    tables = page.extract_tables() or []
                    for idx, table in enumerate(tables):
                        clean_rows = [[sanitize_text(c) for c in (row or [])] for row in table]
                        clean_rows = [r for r in clean_rows if any(c for c in r)]
                        headers, data_rows = pick_headers(clean_rows)
                        processed = [{headers[i]: r[i] for i in range(len(headers))} for r in data_rows]
                        normalized = normalize_table(clean_rows)
                        payload_tables.append({
                            "page": page.page_number,
                            "table_idx": idx,
                            "rows_raw": clean_rows,
                            "headers": headers,
                            "records": processed,
                            "normalized": normalized
                        })
            return jsonify({"pages": pages_count, "tables_found": len(payload_tables), "tables": payload_tables})
    except Exception as e:
        app.logger.exception("Falha no parse do PDF")
        tb = traceback.format_exc()
        return jsonify({"error": "Falha ao processar PDF", "exception": str(e), "traceback": tb.splitlines()[-15:]}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
