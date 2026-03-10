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

// Add this for compatibility with the API route
export const db = {
  // Add any database methods you need here
  query: async (sql: string, params?: any[]) => {
    const connection = await getConnection()
    try {
      const [results] = await connection.execute(sql, params)
      return results
    } finally {
      await connection.end()
    }
  }
}