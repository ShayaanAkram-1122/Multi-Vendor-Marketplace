const { Pool } = require('pg')

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      database: process.env.DB_NAME || 'vendora',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    })

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err)
})

async function query(text, params) {
  return pool.query(text, params)
}

module.exports = { pool, query }
