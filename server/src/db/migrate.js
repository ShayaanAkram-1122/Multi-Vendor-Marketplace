require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') })

const fs = require('fs')
const path = require('path')
const { pool } = require('../config/db')

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf8')

  const client = await pool.connect()
  try {
    await client.query(sql)
    console.log('Database schema applied successfully.')
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message || err)
  if (err.code === 'ECONNREFUSED') {
    console.error('Could not connect to PostgreSQL. Check DATABASE_URL / DB_* in .env and that Postgres is running.')
  }
  process.exit(1)
})
