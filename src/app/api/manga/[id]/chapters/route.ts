import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mangaId = parseInt(params.id);
    
    const chapters = await query(
      `SELECT c.* 
       FROM creator_chapters c
       JOIN creator_works w ON c.work_id = w.id
       WHERE w.id = ? AND c.is_published = 1 AND w.is_published = 1
       ORDER BY c.chapter_number ASC`,
      [mangaId]
    );
    
    return NextResponse.json({
      success: true,
      chapters: chapters || [],
      count: chapters?.length || 0
    });
    
  } catch (error: any) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      chapters: [],
      count: 0
    }, { status: 500 });
  }
}