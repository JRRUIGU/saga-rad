// lib/db.ts
import mysql from 'mysql2/promise'

// Simple direct connection (no pool for simplicity)
export async function getConnection() {
  return mysql.createConnection({
    host: 'localhost',
    user: 'sagarad_user',
    password: '110000',
    database: 'sagarad_db'
  })
}