import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    
    const works = await query(
      `SELECT id, title, slug, type 
       FROM creator_works 
       WHERE is_published = 1 
         AND is_public = 1
         AND title LIKE ?
       ORDER BY title ASC
       LIMIT 10`,
      [`%${q}%`]
    );
    
    return NextResponse.json({
      success: true,
      data: works || []
    });
    
  } catch (error: any) {
    console.error('Error searching works:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      data: []
    }, { status: 500 });
  }
}