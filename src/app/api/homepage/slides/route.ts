import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const slides = await query(`
      SELECT hs.*, cw.title as work_title, cw.slug as work_slug, cw.type as work_type
      FROM homepage_slides hs
      LEFT JOIN creator_works cw ON hs.work_id = cw.id
      WHERE hs.is_active = 1
      ORDER BY hs.display_order ASC
    `);
    
    return NextResponse.json(slides || []);
    
  } catch (error: any) {
    console.error('Error fetching homepage slides:', error);
    return NextResponse.json([], { status: 500 });
  }
}