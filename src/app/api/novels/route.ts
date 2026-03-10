import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
  
    const works = await query(`
      SELECT w.*, 
             COUNT(DISTINCT c.id) as chapter_count,
             MAX(c.created_at) as latest_chapter_date
      FROM creator_works w
      LEFT JOIN creator_chapters c ON w.id = c.work_id
      WHERE w.is_published = 1 AND w.type = 'novel'
      GROUP BY w.id
      ORDER BY latest_chapter_date DESC, w.updated_at DESC
    `);
    
    return NextResponse.json({
      success: true,
      works: works || []
    });
    
  } catch (error: any) {
    console.error('Error fetching novels:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      works: []
    }, { status: 500 });
  }
}