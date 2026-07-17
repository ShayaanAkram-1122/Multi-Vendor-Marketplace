const productQueries = require('../db/queries/products')
const newsletterQueries = require('../db/queries/newsletter')

async function listActiveSales(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 12
    const products = await productQueries.listOnSaleProducts(limit)
    return res.json({ data: products, products })
  } catch (err) {
    return next(err)
  }
}

/**
 * Logged-in buyers who are NOT marketing-opted-in get an in-app sale popup.
 * Subscribers who said Yes get email instead (handled when admin applies a sale).
 */
async function getSalePopup(req, res, next) {
  try {
    const email = req.user?.email
    if (!email) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (req.user.role === 'admin') {
      return res.json({ showPopup: false, reason: 'admin', products: [] })
    }

    const subscriber = await newsletterQueries.findByEmail(email)
    if (subscriber?.marketing_opt_in === true) {
      return res.json({
        showPopup: false,
        reason: 'subscribed',
        products: [],
        message: 'You receive sale alerts by email.',
      })
    }

    const products = await productQueries.listOnSaleProducts(8)
    if (!products.length) {
      return res.json({ showPopup: false, reason: 'no_sales', products: [] })
    }

    return res.json({
      showPopup: true,
      reason: 'in_app',
      products,
      subscribed: false,
      marketingOptIn: subscriber?.marketing_opt_in ?? null,
    })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  listActiveSales,
  getSalePopup,
}
