import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getConnection } from '@/lib/db'

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { username, email, password, role, display_name } = await request.json()
    
    console.log('Registration:', { username, email, role })

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    connection = await getConnection()

    // Check if user exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    ) as any[]

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Username or email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10)

    // Insert user
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash, role, display_name) VALUES (?, ?, ?, ?, ?)',
      [
        username,
        email,
        passwordHash,
        role || 'user',
        display_name || username
      ]
    ) as any

    // Get created user (without password)
    const [users] = await connection.execute(
      'SELECT id, username, email, role, display_name, created_at FROM users WHERE id = ?',
      [result.insertId]
    ) as any[]

    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      user: users[0]
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}