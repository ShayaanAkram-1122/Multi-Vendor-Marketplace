const productQueries = require('../db/queries/products')
const { notifyMarketingSubscribers } = require('../services/newsletterNotify')

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

async function create(req, res, next) {
  try {
    const name = String(req.body.name || '').trim()
    const sellerId = Number(req.body.sellerId)
    const sellerName = String(req.body.sellerName || req.body.seller || '').trim()
    const price = Number(req.body.price)
    const category = String(req.body.category || '').trim()

    if (!name || !sellerId || !sellerName || !Number.isFinite(price) || !category) {
      return res.status(400).json({
        message: 'name, sellerId, sellerName, price, and category are required',
      })
    }

    const product = await productQueries.createProduct({
      name,
      sellerId,
      sellerName,
      price,
      rating: req.body.rating,
      category,
      aiPick: req.body.aiPick,
      tilt: req.body.tilt,
      description: req.body.description,
      stock: req.body.stock,
      image: req.body.image,
      discountPercent: req.body.discountPercent || 0,
    })

    notifyMarketingSubscribers({ type: 'new_product', product }).catch((err) => {
      console.error('[mail] new product notify failed:', err.message)
    })

    return res.status(201).json({ product })
  } catch (err) {
    return next(err)
  }
}

async function setDiscount(req, res, next) {
  try {
    const productId = Number(req.params.id)
    const discountPercent = Number(req.body.discountPercent)

    if (!Number.isFinite(productId)) {
      return res.status(400).json({ message: 'Valid product id is required' })
    }
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return res.status(400).json({ message: 'discountPercent must be between 0 and 100' })
    }

    const product = await productQueries.updateProductDiscount(productId, discountPercent)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (discountPercent > 0) {
      notifyMarketingSubscribers({ type: 'discount', product }).catch((err) => {
        console.error('[mail] discount notify failed:', err.message)
      })
    }

    return res.json({ product })
  } catch (err) {
    return next(err)
  }
}

module.exports = { list, aiPicks, create, setDiscount }
