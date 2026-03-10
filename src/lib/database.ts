import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '110000',
  database: 'saga_creator_db'
};

// MAXIMUM CONNECTIONS - Absolute limit
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 1000, // MAXIMUM - Most MySQL servers can handle 1000-2000
  queueLimit: 5000,      // Queue up to 5000 waiting requests
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  maxIdle: 100,          // Keep up to 100 idle connections
  idleTimeout: 60000,    // 60 seconds idle timeout
});

export async function query(sql: string, params: any[] = []): Promise<any> {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
}

export async function queryOne(sql: string, params: any[] = []): Promise<any> {
  const results = await query(sql, params);
  return (results as any[])[0] || null;
}

export async function getAllGenres() {
  try {
    const sql = 'SELECT * FROM genres ORDER BY name ASC';
    const genres = await query(sql);
    return genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
}

export async function getWorkBySlug(slug: string) {
  try {
    const sql = 'SELECT * FROM creator_works WHERE slug = ? LIMIT 1';
    return await queryOne(sql, [slug]);
  } catch (error) {
    console.error('Error fetching work by slug:', error);
    throw error;
  }
}

export async function getChaptersByWorkId(workId: number) {
  try {
    const sql = 'SELECT * FROM creator_chapters WHERE work_id = ? ORDER BY chapter_number ASC';
    return await query(sql, [workId]);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    throw error;
  }
}

// Function to check connection pool status
export async function getPoolStatus() {
  return {
    totalConnections: pool.pool ? (pool.pool as any).totalConnections : 'N/A',
    activeConnections: pool.pool ? (pool.pool as any).activeConnections : 'N/A',
    idleConnections: pool.pool ? (pool.pool as any).idleConnections : 'N/A',
    waitingQueueLength: pool.pool ? (pool.pool as any).queue.length : 'N/A',
  };
}