const newsletterQueries = require('../db/queries/newsletter')
const {
  sendSubscriptionSuccessEmail,
  sendMarketingPreferenceConfirmedEmail,
} = require('../utils/mail')

async function subscribe(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'A valid email is required' })
    }

    const subscriber = await newsletterQueries.upsertSubscriber(email)

    sendSubscriptionSuccessEmail(subscriber).catch((err) => {
      console.error('[mail] subscription email failed:', err.message)
    })

    return res.status(201).json({
      message: 'Subscribed successfully. Check your email to choose regular updates.',
      email: subscriber.email,
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'This email is already subscribed' })
    }
    return next(err)
  }
}

async function setPreference(req, res, next) {
  try {
    const token = String(req.query.token || req.body.token || '').trim()
    const choice = String(req.query.choice || req.body.choice || '').trim().toLowerCase()

    if (!token) {
      return res.status(400).json({ message: 'Preference token is required' })
    }

    if (choice !== 'yes' && choice !== 'no') {
      return res.status(400).json({ message: 'Choice must be yes or no' })
    }

    const optIn = choice === 'yes'
    const subscriber = await newsletterQueries.setMarketingOptIn(token, optIn)
    if (!subscriber) {
      return res.status(404).json({ message: 'Invalid or expired preference link' })
    }

    sendMarketingPreferenceConfirmedEmail(subscriber, optIn).catch((err) => {
      console.error('[mail] preference confirmation email failed:', err.message)
    })

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
    const wantsRedirect = String(req.query.redirect || '1') !== '0'

    if (wantsRedirect && req.method === 'GET') {
      const email = encodeURIComponent(subscriber.email)
      return res.redirect(`${clientUrl}/newsletter/confirmed?choice=${choice}&email=${email}`)
    }

    return res.json({
      message: optIn
        ? 'You will receive regular product and discount updates.'
        : 'You will not receive regular product and discount updates.',
      email: subscriber.email,
      marketingOptIn: optIn,
    })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  subscribe,
  setPreference,
}
