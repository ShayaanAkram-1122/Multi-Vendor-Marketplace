const productQueries = require('../db/queries/products')

async function list(req, res, next) {
  try {
    const category = req.query.category || null
    const search = req.query.search || req.query.q || null
    const sort = req.query.sort || 'newest'
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 12

    const result = await productQueries.listProducts({
      category,
      search,
      sort,
      page,
      limit,
    })

    // Backward-compatible aliases for the marketing landing page
    return res.json({
      ...result,
      products: result.data,
      total: result.pagination.total,
    })
  } catch (err) {
    return next(err)
  }
}

async function aiPicks(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 8
    const products = await productQueries.listAiPicks(limit)
    return res.json({ products, data: products })
  } catch (err) {
    return next(err)
  }
}

module.exports = { list, aiPicks }
