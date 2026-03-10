import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, paypal_email, mpesa_number, bank_account_name, bank_account_number, bank_name } = body;

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Check if user already has payment methods
    const existing = await queryOne(
      'SELECT id FROM creator_payment_methods WHERE user_id = ?',
      [user_id]
    );

    if (existing) {
      // Update existing
      await query(
        `UPDATE creator_payment_methods 
         SET paypal_email = ?, mpesa_number = ?, bank_account_name = ?, 
             bank_account_number = ?, bank_name = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [paypal_email || null, mpesa_number || null, bank_account_name || null, 
         bank_account_number || null, bank_name || null, user_id]
      );
    } else {
      // Insert new
      await query(
        `INSERT INTO creator_payment_methods 
         (user_id, paypal_email, mpesa_number, bank_account_name, bank_account_number, bank_name)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, paypal_email || null, mpesa_number || null, 
         bank_account_name || null, bank_account_number || null, bank_name || null]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment methods saved successfully'
    });

  } catch (error: any) {
    console.error('Error saving payment methods:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const paymentMethods = await queryOne(
      'SELECT * FROM creator_payment_methods WHERE user_id = ? AND is_active = 1',
      [parseInt(userId)]
    );

    return NextResponse.json({
      success: true,
      payment_methods: paymentMethods || null
    });

  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}