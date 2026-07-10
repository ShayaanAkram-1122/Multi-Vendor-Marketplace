#!/usr/bin/env node
/**
 * Seeds sellers + products tables from catalog.js
 * Usage: npm run db:seed
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') })

const { pool } = require('../config/db')
const { PRODUCTS, SELLERS } = require('./seed/catalog')

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Ensure tables exist (idempotent with schema.sql)
    const fs = require('fs')
    const path = require('path')
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
    await client.query(schema)

    await client.query('DELETE FROM products')
    await client.query('DELETE FROM sellers')

    for (const s of SELLERS) {
      await client.query(
        `INSERT INTO sellers (id, name, category_focus, bio)
         VALUES ($1, $2, $3, $4)`,
        [s.id, s.name, s.categoryFocus, s.bio],
      )
    }

    const sellerIdByName = Object.fromEntries(SELLERS.map((s) => [s.name, s.id]))

    for (const p of PRODUCTS) {
      const sellerId = sellerIdByName[p.seller]
      if (!sellerId) {
        throw new Error(`Unknown seller "${p.seller}" for product ${p.id}`)
      }

      // Keep provided stock; if missing, assign a random 1–40
      const stock = Number.isInteger(p.stock) ? p.stock : Math.floor(Math.random() * 40) + 1

      await client.query(
        `INSERT INTO products
          (id, name, seller_id, seller_name, price, rating, category, ai_pick, tilt, description, stock, image)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          p.id,
          p.name,
          sellerId,
          p.seller,
          p.price,
          p.rating,
          p.category,
          Boolean(p.aiPick),
          p.tilt,
          p.description,
          stock,
          p.image,
        ],
      )
    }

    await client.query('COMMIT')

    const { rows: counts } = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM sellers) AS sellers,
        (SELECT COUNT(*)::int FROM products) AS products,
        (SELECT COUNT(*)::int FROM products WHERE stock > 0) AS in_stock
    `)

    console.log('Seed complete:')
    console.log(`  sellers:  ${counts[0].sellers}`)
    console.log(`  products: ${counts[0].products}`)
    console.log(`  in stock: ${counts[0].in_stock}`)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err.message || err)
  process.exit(1)
})
