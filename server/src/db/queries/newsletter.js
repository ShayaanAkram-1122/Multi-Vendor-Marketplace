const { query } = require('../../config/db')
const crypto = require('crypto')

function newPreferenceToken() {
  return crypto.randomBytes(24).toString('hex')
}

async function upsertSubscriber(email) {
  const normalized = String(email).trim().toLowerCase()
  const token = newPreferenceToken()

  const { rows } = await query(
    `
    INSERT INTO newsletter_subscribers (email, marketing_opt_in, preference_token)
    VALUES ($1, NULL, $2)
    ON CONFLICT (email) DO UPDATE
      SET preference_token = EXCLUDED.preference_token,
          updated_at = NOW()
          -- keep existing marketing_opt_in; they can answer again via new email links
    RETURNING id, email, marketing_opt_in, preference_token, subscribed_at, updated_at
    `,
    [normalized, token],
  )

  return rows[0]
}

async function findByToken(token) {
  const { rows } = await query(
    `
    SELECT id, email, marketing_opt_in, preference_token, subscribed_at, updated_at
    FROM newsletter_subscribers
    WHERE preference_token = $1
    LIMIT 1
    `,
    [token],
  )
  return rows[0] || null
}

async function setMarketingOptIn(token, optIn) {
  const { rows } = await query(
    `
    UPDATE newsletter_subscribers
    SET marketing_opt_in = $2,
        updated_at = NOW()
    WHERE preference_token = $1
    RETURNING id, email, marketing_opt_in, preference_token, subscribed_at, updated_at
    `,
    [token, optIn],
  )
  return rows[0] || null
}

async function listMarketingOptedIn() {
  const { rows } = await query(
    `
    SELECT id, email, marketing_opt_in
    FROM newsletter_subscribers
    WHERE marketing_opt_in = TRUE
    ORDER BY subscribed_at ASC
    `,
  )
  return rows
}

module.exports = {
  upsertSubscriber,
  findByToken,
  setMarketingOptIn,
  listMarketingOptedIn,
  newPreferenceToken,
}
