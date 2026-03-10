import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = parseInt(params.id);
    
    const chapter = await queryOne(
      `SELECT c.*, w.title as work_title 
       FROM creator_chapters c
       JOIN creator_works w ON c.work_id = w.id
       WHERE c.id = ? AND w.user_id = ?`,
      [chapterId, 1]
    ) as any;
    
    if (!chapter) {
      return NextResponse.json({
        success: false,
        error: 'Chapter not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      chapter
    });
    
  } catch (error: any) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = parseInt(params.id);
    const { is_published } = await request.json();
    
    await query(
      'UPDATE creator_chapters SET is_published = ? WHERE id = ?',
      [is_published, chapterId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Chapter updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating chapter:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = parseInt(params.id);
    
    await query('DELETE FROM creator_chapters WHERE id = ?', [chapterId]);
    
    return NextResponse.json({
      success: true,
      message: 'Chapter deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}