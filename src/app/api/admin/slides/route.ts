import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { uploadHomepageSlide } from '@/services/cloudinaryService';

export async function GET() {
  try {
    const slides = await query(`
      SELECT hs.*, cw.title as work_title, cw.slug as work_slug, cw.type as work_type
      FROM homepage_slides hs
      LEFT JOIN creator_works cw ON hs.work_id = cw.id
      ORDER BY hs.display_order ASC, hs.created_at DESC
    `);
    
    return NextResponse.json(slides || []);
    
  } catch (error: any) {
    console.error('Error fetching slides:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const work_id = formData.get('work_id') as string;
    const button_text = formData.get('button_text') as string || 'Read Now';
    const image = formData.get('image') as File;
    
    // Validate required fields
    if (!image || !title || !description) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }
    
    // Validate image type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'File must be an image'
      }, { status: 400 });
    }
    
    // Validate file size (5MB max)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'Image must be less than 5MB'
      }, { status: 400 });
    }
    
    // Convert File to Buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate unique filename
    const fileName = `slide_${Date.now()}_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    
    // Upload to Cloudinary with forced landscape format
    const uploadResult = await uploadHomepageSlide(buffer, fileName);
    
    // Get next display order
    const orderResult = await query('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM homepage_slides');
    const nextOrder = orderResult[0]?.next_order || 1;
    
    // Insert into database
    await query(
      `INSERT INTO homepage_slides 
       (title, description, image_url, cloudinary_public_id, work_id, button_text, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        uploadResult.url,
        uploadResult.public_id,
        work_id || null,
        button_text,
        nextOrder
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Slide uploaded successfully'
    });
    
  } catch (error: any) {
    console.error('Error uploading slide:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Upload failed'
    }, { status: 500 });
  }
}