import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workId = parseInt(params.id);
    
    const work = await queryOne(
      'SELECT * FROM creator_works WHERE id = ? AND user_id = ?',
      [workId, 1] // Using user_id = 1 for demo
    ) as any;
    
    if (!work) {
      return NextResponse.json({
        success: false,
        error: 'Work not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      work
    });
    
  } catch (error: any) {
    console.error('Error fetching work:', error);
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
    
    // Delete work (cascade will delete chapters and pages)
    await query('DELETE FROM creator_works WHERE id = ?', [workId]);
    
    return NextResponse.json({
      success: true,
      message: 'Work deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting work:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}