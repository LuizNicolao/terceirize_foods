const crypto = require('crypto');
const { executeQuery, executeTransaction } = require('../config/database');

const normalizeText = (value) => {
  if (!value) {
    return '';
  }
  return value.toString().trim().replace(/\s+/g, ' ');
};

const toIsoDate = (dateStr) => {
  if (!dateStr) {
    return null;
  }
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) {
    return null;
  }
  const [_, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const buildEntryHash = ({ dataIso, turno, codigo, descricao }) => {
  const hash = crypto.createHash('sha256');
  hash.update(`${dataIso || ''}|${turno.toLowerCase()}|${(codigo || '').toLowerCase()}|${normalizeText(descricao).toLowerCase()}`);
  return hash.digest('hex');
};

const computeNormalizedHash = (obj) => {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
};

const computeFileHash = (buffer) => {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
};

const findDuplicateUpload = async ({ fileHash, normalizedHash }) => {
  const query = `
    SELECT id, status
    FROM pdf_uploads
    WHERE file_hash = ? OR normalized_hash = ?
    LIMIT 1
  `;
  const result = await executeQuery(query, [fileHash, normalizedHash]);
  return result[0] || null;
};

const insertUploadWithRecipes = async ({
  originalName,
  fileHash,
  normalizedHash,
  periodLabel,
  pages,
  normalizedCardapio,
  receitas,
  status = 'committed'
}) => {
  const uploadResult = await executeQuery(
    `
      INSERT INTO pdf_uploads (
        original_name,
        file_hash,
        normalized_hash,
        period_label,
        pages,
        status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      originalName,
      fileHash,
      normalizedHash,
      periodLabel || null,
      pages || null,
      status
    ]
  );

  const uploadId = uploadResult.insertId;

  for (const receita of receitas) {
    const dataIso = toIsoDate(receita.data);
    if (!dataIso) {
      continue;
    }
    const turno = normalizeText(receita.turno || 'Não identificado') || 'Não identificado';
    const codigo = receita.codigo ? normalizeText(receita.codigo) : null;
    const descricao = normalizeText(receita.descricao || receita.texto_original || '');
    const isFeriado = /feriado/i.test(descricao);
    const incompleto = !codigo;
    const entryHash = buildEntryHash({ dataIso, turno, codigo: codigo || '', descricao });

    await executeQuery(
      `
        INSERT INTO pdf_receitas (
          upload_id,
          data_iso,
          turno,
          codigo,
          descricao,
          incompleto,
          is_feriado,
          source_page,
          source_table_idx,
          entry_hash
        ) VALUES (? , ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        uploadId,
        dataIso,
        turno,
        codigo,
        descricao,
        incompleto ? 1 : 0,
        isFeriado ? 1 : 0,
        receita.page || null,
        receita.tableIndex || null,
        entryHash
      ]
    );
  }

  return {
    uploadId,
    totalReceitas: receitas.length
  };
};

module.exports = {
  computeFileHash,
  computeNormalizedHash,
  findDuplicateUpload,
  insertUploadWithRecipes
};

