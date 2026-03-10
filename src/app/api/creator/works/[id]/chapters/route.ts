import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database'; // Make sure queryOne is imported!

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workId = parseInt(params.id);
    
    // Check if work exists and belongs to user
    const work = await queryOne(
      'SELECT id FROM creator_works WHERE id = ? AND user_id = ?',
      [workId, 1]
    ) as any;
    
    if (!work) {
      return NextResponse.json({
        success: false,
        error: 'Work not found'
      }, { status: 404 });
    }
    
    const chapters = await query(
      'SELECT * FROM creator_chapters WHERE work_id = ? ORDER BY chapter_number ASC',
      [workId]
    ) as any[];
    
    return NextResponse.json({
      success: true,
      chapters,
      count: chapters.length
    });
    
  } catch (error: any) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}