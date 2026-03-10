import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const works = await query(`
      SELECT w.*, 
             COUNT(DISTINCT c.id) as chapter_count,
             MAX(c.created_at) as latest_chapter_date,
             g.name as genre_name
      FROM creator_works w
      LEFT JOIN creator_chapters c ON w.id = c.work_id
      LEFT JOIN genres g ON w.genre_id = g.id
      WHERE w.is_published = 1 AND w.type = 'manga'
      GROUP BY w.id
      ORDER BY latest_chapter_date DESC, w.updated_at DESC
    `);
    
    // Format the data to include genres as array
    const worksWithGenres = (works || []).map((work: any) => ({
      ...work,
      genres: work.genre_name ? [work.genre_name] : []
    }));
    
    return NextResponse.json({
      success: true,
      works: worksWithGenres
    });
    
  } catch (error: any) {
    console.error('Error fetching manga:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      works: []
    }, { status: 500 });
  }
}