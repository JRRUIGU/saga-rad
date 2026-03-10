import { NextRequest, NextResponse } from 'next/server';
import { getAllGenres } from '@/lib/database';

export async function GET() {
  try {
    const genres = await getAllGenres();
    
    return NextResponse.json({
      success: true,
      genres
    });
    
  } catch (error: any) {
    console.error('Get genres error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}