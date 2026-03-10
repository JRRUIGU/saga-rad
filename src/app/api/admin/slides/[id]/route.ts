import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { deleteFromCloudinary } from '@/services/cloudinaryService';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { is_active } = await request.json();
    
    await query(
      'UPDATE homepage_slides SET is_active = ? WHERE id = ?',
      [is_active, params.id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Slide updated'
    });
    
  } catch (error: any) {
    console.error('Error updating slide:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get cloudinary ID first
    const slides = await query(
      'SELECT cloudinary_public_id FROM homepage_slides WHERE id = ?',
      [params.id]
    );
    
    // Delete from Cloudinary if exists
    if (slides && slides[0]?.cloudinary_public_id) {
      await deleteFromCloudinary(slides[0].cloudinary_public_id);
    }
    
    // Delete from database
    await query('DELETE FROM homepage_slides WHERE id = ?', [params.id]);
    
    return NextResponse.json({
      success: true,
      message: 'Slide deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting slide:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}