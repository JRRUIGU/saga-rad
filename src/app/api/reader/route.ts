import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mangaId = searchParams.get('mangaId');
  const chapter = searchParams.get('chapter');

  const [pages]: any = await db.query(
    `SELECT image_url FROM pages p
     JOIN chapters c ON p.chapter_id=c.id
     WHERE c.manga_id=? AND c.chapter_number=?
     ORDER BY p.page_number`,
    [mangaId, chapter]
  );

  return NextResponse.json(pages);
}
