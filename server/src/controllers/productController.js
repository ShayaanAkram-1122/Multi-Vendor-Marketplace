const productQueries = require('../db/queries/products')

async function list(req, res, next) {
  try {
    const category = req.query.category || null
    const search = req.query.search || req.query.q || null
    const limit = Math.min(Number(req.query.limit) || 100, 300)

    const [products, total] = await Promise.all([
      productQueries.listProducts({ category, search, limit }),
      productQueries.countProducts({ category, search }),
    ])

    return res.json({ products, total })
  } catch (err) {
    return next(err)
  }
}

async function aiPicks(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 8, 50)
    const products = await productQueries.listAiPicks(limit)
    return res.json({ products })
  } catch (err) {
    return next(err)
  }
}

module.exports = { list, aiPicks }
