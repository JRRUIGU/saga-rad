import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getConnection } from '@/lib/db'

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { username, password, role } = await request.json()
    
    console.log('Login attempt:', { username, role })

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password required' },
        { status: 400 }
      )
    }

    connection = await getConnection()

    // Find user
    const [users] = await connection.execute(
      `SELECT id, username, email, password_hash, role, display_name, created_at 
       FROM users 
       WHERE username = ? OR email = ? 
       LIMIT 1`,
      [username, username]
    ) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Check role if specified
    if (role && user.role !== role) {
      return NextResponse.json(
        { success: false, error: `This account is a ${user.role}, not ${role}` },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || 'dev-secret-123',
      { expiresIn: '7d' }
    )

    // Remove password from response
    const { password_hash, ...userData } = user

    return NextResponse.json({
      success: true,
      token,
      user: userData
    })

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}