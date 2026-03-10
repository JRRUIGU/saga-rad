import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getConnection } from '@/lib/db'

export async function PUT(request: NextRequest) {
  let connection;
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { display_name, bio, profile_image, banner_image } = await request.json()

    connection = await getConnection()

    // Update user profile
    const [result] = await connection.execute(
      `UPDATE users 
       SET display_name = ?, bio = ?, profile_image = ?, banner_image = ?, updated_at = NOW()
       WHERE id = ?`,
      [display_name, bio, profile_image, banner_image, decoded.id]
    ) as any

    // Get updated user
    const [users] = await connection.execute(
      'SELECT id, username, email, role, display_name, bio, profile_image, banner_image, created_at FROM users WHERE id = ?',
      [decoded.id]
    ) as any[]

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: users[0]
    })

  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Profile update failed' },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}