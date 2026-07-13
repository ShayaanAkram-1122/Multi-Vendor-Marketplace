const newsletterQueries = require('../db/queries/newsletter')
const { sendCatalogUpdateEmail } = require('../utils/mail')

/**
 * Email everyone who opted into regular updates (Yes).
 * type: 'new_product' | 'discount'
 */
async function notifyMarketingSubscribers({ type, product }) {
  const subscribers = await newsletterQueries.listMarketingOptedIn()
  if (!subscribers.length) {
    return { sent: 0, skipped: 0 }
  }

  let sent = 0
  let skipped = 0

  await Promise.all(
    subscribers.map(async (subscriber) => {
      try {
        await sendCatalogUpdateEmail(subscriber, { type, product })
        sent += 1
      } catch (err) {
        skipped += 1
        console.error('[mail] catalog update failed for', subscriber.email, err.message)
      }
    }),
  )

  return { sent, skipped }
}

module.exports = {
  notifyMarketingSubscribers,
}
