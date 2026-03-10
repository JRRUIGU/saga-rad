import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = parseInt(params.id);
    
    const pages = await query(
      'SELECT id, chapter_id, page_number, image_url, pdf_url, file_type, storage_path, file_size FROM creator_pages WHERE chapter_id = ? ORDER BY page_number ASC',
      [chapterId]
    ) as any[];
    
    return NextResponse.json({
      success: true,
      pages,
      count: pages.length
    });
    
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}