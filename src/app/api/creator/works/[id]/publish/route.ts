// app/api/creator/works/[id]/publish/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workId = parseInt(params.id);
    const { publish } = await request.json();
    const userId = 1; // Demo user ID
    
    // Check if work belongs to user
    const work = await query(
      'SELECT id FROM creator_works WHERE id = ? AND user_id = ?',
      [workId, userId]
    ) as any[];
    
    if (work.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Work not found or unauthorized'
      }, { status: 404 });
    }
    
    // Update publish status
    await query(
      'UPDATE creator_works SET is_published = ?, updated_at = NOW() WHERE id = ?',
      [publish, workId]
    );
    
    return NextResponse.json({
      success: true,
      message: publish ? 'Work published successfully' : 'Work unpublished successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating publish status:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}