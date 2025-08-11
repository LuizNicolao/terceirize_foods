const paginateResults = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  req.pagination = {
    page,
    limit,
    offset
  };
  
  next();
};

const applyPagination = (query, req) => {
  const { limit, offset } = req.pagination;
  return `${query} LIMIT ${limit} OFFSET ${offset}`;
};

const getPaginationMeta = (total, req) => {
  const { page, limit } = req.pagination;
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

module.exports = {
  paginateResults,
  applyPagination,
  getPaginationMeta
};
