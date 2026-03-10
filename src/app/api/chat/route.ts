import { NextRequest, NextResponse } from 'next/server';
import { findBestMatch } from '@/lib/chatbot/matcher';
import { query, queryOne } from '@/lib/database';

// Simple text matching
function calculateMatchScore(input: string, text: string): number {
  const inputWords = input.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const textWords = text.toLowerCase().split(/\s+/);
  
  let matches = 0;
  inputWords.forEach(word => {
    if (textWords.includes(word)) matches += 2;
    textWords.forEach(tw => {
      if (tw.includes(word) || word.includes(tw)) matches += 0.5;
    });
  });
  
  return matches;
}

// Get route path based on content type
function getContentPath(type: string, id: number): string {
  const typeRoutes: { [key: string]: string } = {
    'manga': '/manga',
    'webtoon': '/webtoon',
    'comic': '/comic',
    'novel': '/novel'
  };
  
  const basePath = typeRoutes[type] || '/manga';
  return `${basePath}/${id}`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    const inputLower = message.toLowerCase().trim();

    // ==========================================
    // STEP 1: CHECK DATABASE FIRST FOR TITLES
    // ==========================================
    
    const allWorks: any = await query(
      'SELECT * FROM creator_works WHERE is_public = 1 AND is_published = 1'
    );

    let bestWorkMatch = null;
    let bestScore = 0;

    for (const work of allWorks) {
      const titleLower = work.title.toLowerCase();
      const inputClean = inputLower.replace(/[^\w\s]/g, '');
      
      if (titleLower === inputClean || titleLower === inputLower) {
        bestScore = 100;
        bestWorkMatch = work;
        break;
      }
      
      if (inputLower.includes(titleLower)) {
        const score = 50 + titleLower.length;
        if (score > bestScore) {
          bestScore = score;
          bestWorkMatch = work;
        }
      }
      
      const score = calculateMatchScore(inputLower, work.title);
      if (score > bestScore && score >= 1) {
        bestScore = score;
        bestWorkMatch = work;
      }
    }

    if (bestWorkMatch && bestScore >= 10) {
      let genreName = 'Not specified';
      if (bestWorkMatch.genre_id) {
        const genre: any = await queryOne(
          'SELECT name FROM creator_genres WHERE id = ?',
          [bestWorkMatch.genre_id]
        );
        if (genre) genreName = genre.name;
      }

      const contentPath = getContentPath(bestWorkMatch.type, bestWorkMatch.id);

      let response = `**${bestWorkMatch.title}** (${bestWorkMatch.type})\n\n`;
      response += `Genre: ${genreName}\n`;
      response += `Status: ${bestWorkMatch.status || 'Ongoing'}\n`;
      response += `Views: ${bestWorkMatch.views} | Likes: ${bestWorkMatch.likes}\n\n`;
      
      if (bestWorkMatch.description && bestWorkMatch.description !== '.' && bestWorkMatch.description.trim() !== '') {
        response += `**Summary:** ${bestWorkMatch.description}`;
      } else {
        response += `*No detailed description available yet.*`;
      }

      return NextResponse.json({
        response,
        attachments: [{
          type: bestWorkMatch.type,
          data: {
            id: bestWorkMatch.id,
            title: bestWorkMatch.title,
            cover_url: bestWorkMatch.cover_url,
            type: bestWorkMatch.type,
            status: bestWorkMatch.status,
            genre_name: genreName
          }
        }],
        action: 'navigate',
        data: { path: contentPath }
      });
    }

    // ==========================================
    // STEP 2: RECOMMENDATIONS
    // ==========================================
    
    const isRecommendationRequest = 
      inputLower.includes('recommend') || 
      inputLower.includes('suggest') ||
      inputLower.includes('what should i read') ||
      inputLower.includes('give me') ||
      inputLower.includes('show me') ||
      inputLower.includes('find me');

    if (isRecommendationRequest) {
      // Extract genre from input
      const allGenres: any = await query('SELECT * FROM creator_genres');
      const requestedGenre = allGenres.find((g: any) => 
        inputLower.includes(g.name.toLowerCase()) || 
        inputLower.includes(g.slug.toLowerCase())
      );
      
      const typeMatch = inputLower.match(/(manga|webtoon|comic|novel)/);
      const requestedType = typeMatch ? typeMatch[1] : null;

      // Build query dynamically
      let sql = `
        SELECT cw.*, cg.name as genre_name 
        FROM creator_works cw
        LEFT JOIN creator_genres cg ON cw.genre_id = cg.id
        WHERE cw.is_public = 1 AND cw.is_published = 1
      `;
      
      const params: any[] = [];
      
      if (requestedGenre) {
        sql += ` AND (cg.name = ? OR cw.description LIKE ?)`;
        params.push(requestedGenre.name, `%${requestedGenre.name}%`);
      }
      
      if (requestedType) {
        sql += ` AND cw.type = ?`;
        params.push(requestedType);
      }
      
      sql += ` ORDER BY cw.likes DESC, cw.views DESC LIMIT 5`;
      
      const recommendations: any = await query(sql, params);

      if (recommendations.length > 0) {
        let response = '';
        
        if (requestedGenre && requestedType) {
          response = `Here are ${requestedGenre.name} ${requestedType}s for you:\n\n`;
        } else if (requestedGenre) {
          response = `Here are ${requestedGenre.name} recommendations:\n\n`;
        } else if (requestedType) {
          response = `Here are some popular ${requestedType}s:\n\n`;
        } else {
          response = `Here are some popular titles you might enjoy:\n\n`;
        }

        // Group by type
        const byType = recommendations.reduce((acc: any, w: any) => {
          acc[w.type] = acc[w.type] || [];
          acc[w.type].push(w);
          return acc;
        }, {});

        Object.entries(byType).forEach(([type, works]: [string, any]) => {
          response += `**${type.toUpperCase()}:**\n`;
          works.forEach((w: any) => {
            response += `• ${w.title}`;
            if (w.genre_name) response += ` (${w.genre_name})`;
            response += '\n';
            if (w.description && w.description !== '.' && w.description.length > 10) {
              const shortDesc = w.description.substring(0, 60) + (w.description.length > 60 ? '...' : '');
              response += `  _${shortDesc}_\n`;
            }
          });
          response += '\n';
        });

        return NextResponse.json({
          response,
          attachments: recommendations.map((w: any) => ({
            type: w.type,
            data: {
              id: w.id,
              title: w.title,
              cover_url: w.cover_url,
              type: w.type,
              status: w.status,
              genre_name: w.genre_name
            }
          }))
        });
      } else {
        return NextResponse.json({
          response: requestedGenre 
            ? `I don't have any ${requestedGenre.name} titles yet. Try asking for something else!`
            : "I don't have recommendations yet. Try searching for a specific title!"
        });
      }
    }

    // ==========================================
    // STEP 3: CHECK KNOWLEDGE BASE
    // ==========================================
    const knowledgeMatch = findBestMatch(message);
    
    if (knowledgeMatch && knowledgeMatch.id !== 'fallback') {
      let response = knowledgeMatch.answer;
      let attachments: any[] = [];
      
      if (knowledgeMatch.action === 'navigate' && knowledgeMatch.data?.path) {
        const works: any = await query(
          `SELECT cw.*, cg.name as genre_name 
           FROM creator_works cw
           LEFT JOIN creator_genres cg ON cw.genre_id = cg.id
           WHERE cw.is_public = 1 
           LIMIT 3`
        );
        
        if (works.length > 0) {
          attachments = works.map((w: any) => ({
            type: w.type,
            data: {
              id: w.id,
              title: w.title,
              cover_url: w.cover_url,
              type: w.type,
              status: w.status,
              genre_name: w.genre_name
            }
          }));
        }
      }

      return NextResponse.json({
        response,
        attachments,
        action: knowledgeMatch.action || null,
        data: knowledgeMatch.data || null,
      });
    }

    // ==========================================
    // STEP 4: SEARCH BY GENRE ONLY
    // ==========================================
    const allGenres: any = await query('SELECT * FROM creator_genres');
    const requestedGenre = allGenres.find((g: any) => 
      inputLower.includes(g.name.toLowerCase()) || 
      inputLower.includes(g.slug.toLowerCase())
    );

    if (requestedGenre) {
      const worksInGenre: any = await query(
        `SELECT cw.*, cg.name as genre_name 
         FROM creator_works cw
         JOIN creator_genres cg ON cw.genre_id = cg.id
         WHERE cw.genre_id = ? AND cw.is_public = 1
         LIMIT 5`,
        [requestedGenre.id]
      );

      if (worksInGenre.length > 0) {
        let response = `Here are ${requestedGenre.name} titles:\n\n`;
        
        worksInGenre.forEach((w: any) => {
          response += `**${w.title}** (${w.type})\n`;
          if (w.description && w.description !== '.' && w.description.length > 5) {
            const shortDesc = w.description.substring(0, 80) + (w.description.length > 80 ? '...' : '');
            response += `${shortDesc}\n\n`;
          } else {
            response += '\n';
          }
        });

        return NextResponse.json({
          response,
          attachments: worksInGenre.map((w: any) => ({
            type: w.type,
            data: {
              id: w.id,
              title: w.title,
              cover_url: w.cover_url,
              type: w.type,
              status: w.status,
              genre_name: w.genre_name
            }
          }))
        });
      } else {
        return NextResponse.json({
          response: `I don't have any ${requestedGenre.name} titles yet. Check back soon!`
        });
      }
    }

    // ==========================================
    // STEP 5: LIST BY CONTENT TYPE
    // ==========================================
    const typeMatch = inputLower.match(/(manga|webtoon|comic|novel)/);
    if (typeMatch) {
      const type = typeMatch[1];
      const works: any = await query(
        `SELECT cw.*, cg.name as genre_name 
         FROM creator_works cw
         LEFT JOIN creator_genres cg ON cw.genre_id = cg.id
         WHERE cw.type = ? AND cw.is_public = 1 
         LIMIT 8`,
        [type]
      );

      if (works.length > 0) {
        let response = `Our ${type}s:\n\n`;
        
        works.forEach((w: any) => {
          response += `• **${w.title}**`;
          if (w.genre_name) response += ` (${w.genre_name})`;
          response += '\n';
          if (w.description && w.description !== '.' && w.description.length > 10) {
            const shortDesc = w.description.substring(0, 60) + '...';
            response += `  _${shortDesc}_\n`;
          }
        });

        return NextResponse.json({
          response,
          attachments: works.map((w: any) => ({
            type: w.type,
            data: {
              id: w.id,
              title: w.title,
              cover_url: w.cover_url,
              type: w.type,
              status: w.status,
              genre_name: w.genre_name
            }
          }))
        });
      }
    }

    // ==========================================
    // STEP 6: FALLBACK
    // ==========================================
    return NextResponse.json({
      response: "I'm not sure I understood. Try asking:\n• 'Recommend action manga' (get suggestions)\n• 'Is Boruto available?' (find specific title)\n• 'Show me fantasy novels' (browse by genre)",
      attachments: [],
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({
      response: "Sorry, I'm having trouble accessing the database right now.",
      attachments: [],
    });
  }
}