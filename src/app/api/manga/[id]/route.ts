import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mangaId = parseInt(params.id);
    
    const manga = await queryOne(
      `SELECT w.* 
       FROM creator_works w
       WHERE w.id = ? AND w.is_published = 1`,
      [mangaId]
    );
    
    if (!manga) {
      return NextResponse.json({
        success: false,
        error: 'Manga not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      manga
    });
    
  } catch (error: any) {
    console.error('Error fetching manga:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}