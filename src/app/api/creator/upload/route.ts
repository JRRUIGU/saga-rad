import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { uploadToB2 } from '@/services/b2Service';

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'saga_creator_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function POST(request: NextRequest) {
  console.log('📤 Upload API called');
  
  try {
    const formData = await request.formData();
    
    // Get form data
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const genreId = formData.get('genreId') as string; // From creator_genres table
    const chapterName = formData.get('chapterName') as string;
    const chapterNumber = formData.get('chapterNumber') as string;
    const isFirstChapter = formData.get('isFirstChapter') as string === 'true';
    
    console.log('📝 Data:', { type, title, genreId, chapterName, chapterNumber, isFirstChapter });
    
    // Validate
    if (!type || !title || !chapterName || !chapterNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }
    
    // Get files
    const coverFile = formData.get('cover') as File;
    const pageFiles = formData.getAll('pages') as File[];
    
    if (!coverFile || pageFiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cover and pages are required'
      }, { status: 400 });
    }
    
    console.log(`📁 Files: Cover=${coverFile.name}, Pages=${pageFiles.length}, Type=${type}`);
    
    const userId = 1;
    
    // Generate unique slug with timestamp
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const timestamp = Date.now().toString(36);
    const slug = `${baseSlug}-${timestamp}`;
    
    console.log('🔗 Generated unique slug:', slug);
    
    let workId: number;
    
    // CREATE OR GET WORK
    if (isFirstChapter) {
      console.log('🆕 Creating new work with genre_id:', genreId);
      
      try {
        const [workResult]: any = await pool.execute(
          'INSERT INTO creator_works (user_id, title, slug, description, type, genre_id, cover_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [userId, title, slug, description, type, genreId ? parseInt(genreId) : null, '/placeholder-cover.jpg', 'ongoing']
        );
        
        workId = workResult.insertId;
        console.log('✅ Work created, ID:', workId);
        
        // ALSO INSERT INTO creator_work_genres for many-to-many relationship (optional but recommended)
        if (genreId) {
          try {
            await pool.execute(
              'INSERT INTO creator_work_genres (work_id, genre_id) VALUES (?, ?)',
              [workId, parseInt(genreId)]
            );
            console.log('✅ Added to creator_work_genres junction table');
          } catch (e) {
            console.log('ℹ️ Could not add to creator_work_genres (might not exist or already added)');
          }
        }
        
      } catch (dbError: any) {
        if (dbError.code === 'ER_DUP_ENTRY') {
          console.log('⚠️ Duplicate slug, adding UUID...');
          const uniqueSlug = `${baseSlug}-${uuidv4().slice(0, 8)}`;
          
          const [workResult]: any = await pool.execute(
            'INSERT INTO creator_works (user_id, title, slug, description, type, genre_id, cover_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, title, uniqueSlug, description, type, genreId ? parseInt(genreId) : null, '/placeholder-cover.jpg', 'ongoing']
          );
          
          workId = workResult.insertId;
          console.log('✅ Work created with UUID slug, ID:', workId);
          
          // Add to junction table
          if (genreId) {
            try {
              await pool.execute(
                'INSERT INTO creator_work_genres (work_id, genre_id) VALUES (?, ?)',
                [workId, parseInt(genreId)]
              );
            } catch (e) {
              // Ignore
            }
          }
        } else {
          throw dbError;
        }
      }
    } else {
      console.log('🔍 Finding existing work...');
      
      const [workRows]: any = await pool.execute(
        'SELECT id FROM creator_works WHERE title = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
        [title, userId]
      );
      
      if (workRows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Work not found'
        }, { status: 404 });
      }
      
      workId = workRows[0].id;
      console.log('✅ Found work ID:', workId);
    }
    
    // CREATE CHAPTER
    console.log('📖 Creating chapter...');
    
    const [chapterResult]: any = await pool.execute(
      'INSERT INTO creator_chapters (work_id, title, chapter_number, page_count, is_published) VALUES (?, ?, ?, ?, ?)',
      [workId, chapterName, parseInt(chapterNumber), pageFiles.length, 1]
    );
    
    const chapterId = chapterResult.insertId;
    console.log('✅ Chapter created, ID:', chapterId);
    
    // UPLOAD COVER TO CLOUDINARY/B2
    console.log('☁️ Uploading cover...');
    let coverUrl = '/placeholder-cover.jpg';
    let coverStoragePath = '';
    
    try {
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      const coverFileName = `covers/${workId}/${uuidv4()}-${coverFile.name.replace(/\s+/g, '-')}`;
      coverStoragePath = coverFileName;
      
      const coverResult = await uploadToB2(coverBuffer, coverFileName, coverFile.type);
      
      coverUrl = coverResult.url;
      
      // Update work with cover URL
      await pool.execute(
        'UPDATE creator_works SET cover_url = ?, storage_path = ? WHERE id = ?',
        [coverUrl, coverFileName, workId]
      );
      console.log('✅ Cover uploaded:', coverUrl);
    } catch (b2Error: any) {
      console.error('⚠️ Cover upload failed:', b2Error.message);
    }
    
    // UPLOAD PAGES
    console.log('🎨 Uploading pages for', type);
    let uploadedCount = 0;
    
    for (let i = 0; i < pageFiles.length; i++) {
      const pageFile = pageFiles[i];
      console.log(`📸 Uploading page ${i + 1}/${pageFiles.length}: ${pageFile.name}`);
      
      try {
        const pageBuffer = Buffer.from(await pageFile.arrayBuffer());
        
        let pageFileName;
        if (type === 'novel') {
          pageFileName = `novels/${workId}/${chapterId}/${i + 1}-${uuidv4()}-${pageFile.name.replace(/\s+/g, '-')}`;
        } else {
          pageFileName = `works/${workId}/${chapterId}/${i + 1}-${uuidv4()}-${pageFile.name.replace(/\s+/g, '-')}`;
        }
        
        const pageResult = await uploadToB2(pageBuffer, pageFileName, pageFile.type);
        const pageUrl = pageResult.url;
        
        // Save to database
        await pool.execute(
          `INSERT INTO creator_pages (chapter_id, page_number, image_url, storage_path, file_size, file_type) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [chapterId, i + 1, pageUrl, pageFileName, pageFile.size, 'image']
        );
        
        uploadedCount++;
        console.log(`✅ Page ${i + 1} uploaded: ${pageUrl}`);
        
      } catch (b2Error: any) {
        console.error(`⚠️ Page ${i + 1} upload failed:`, b2Error.message);
        
        await pool.execute(
          `INSERT INTO creator_pages (chapter_id, page_number, image_url, storage_path, file_size, file_type) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [chapterId, i + 1, `/placeholder-page-${i + 1}.jpg`, `failed-upload-${i + 1}`, pageFile.size || 0, 'image']
        );
      }
    }
    
    // Update chapter page count
    await pool.execute(
      'UPDATE creator_chapters SET page_count = ? WHERE id = ?',
      [uploadedCount, chapterId]
    );
    
    console.log('🎉 Upload completed successfully!');
    
    return NextResponse.json({
      success: true,
      workId,
      chapterId,
      pages: uploadedCount,
      type: type,
      message: `${uploadedCount} pages uploaded successfully!`,
      slug: slug
    });
    
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}

// GET endpoint to fetch genres from creator_genres table
export async function GET() {
  try {
    const [genres]: any = await pool.execute(
      'SELECT id, name, slug FROM creator_genres ORDER BY name'
    );
    
    return NextResponse.json({
      success: true,
      genres
    });
  } catch (error: any) {
    console.error('❌ Error fetching genres:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}