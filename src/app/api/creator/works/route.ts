// app/api/creator/works/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const userId = 1; // Demo user
    
    // Get works with chapter counts - MAKE SURE is_published IS SELECTED
    const works = await query(`
      SELECT w.*, 
             COUNT(DISTINCT c.id) as chapter_count
      FROM creator_works w
      LEFT JOIN creator_chapters c ON w.id = c.work_id
      WHERE w.user_id = ?
      GROUP BY w.id
      ORDER BY w.updated_at DESC
    `, [userId]) as any[];
    
    // Get total chapters count
    const totalChapters = await query(`
      SELECT COUNT(*) as count 
      FROM creator_chapters c
      JOIN creator_works w ON c.work_id = w.id
      WHERE w.user_id = ?
    `, [userId]) as any[];
    
    return NextResponse.json({
      success: true,
      works,
      totalChapters: totalChapters[0]?.count || 0
    });
    
  } catch (error: any) {
    console.error('Error fetching works:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}