import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);

    // Get author info and payment methods
    const author = await queryOne(
      `SELECT u.user_id, u.title as author_name, pm.*
       FROM creator_works u
       LEFT JOIN creator_payment_methods pm ON u.user_id = pm.user_id
       WHERE u.user_id = ?
       LIMIT 1`,
      [userId]
    );

    if (!author) {
      return NextResponse.json({
        success: false,
        error: 'Author not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      author: {
        user_id: author.user_id,
        name: author.author_name || 'Creator',
        paypal_email: author.paypal_email,
        mpesa_number: author.mpesa_number,
        bank_account_name: author.bank_account_name,
        bank_account_number: author.bank_account_number,
        bank_name: author.bank_name
      }
    });

  } catch (error: any) {
    console.error('Error fetching author info:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}