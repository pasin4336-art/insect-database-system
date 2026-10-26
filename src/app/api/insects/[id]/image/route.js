import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const insectId = parseInt(id);
    if (isNaN(insectId)) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT image_url FROM insects WHERE id = ? LIMIT 1',
      [insectId]
    );

    if (!rows || rows.length === 0 || !rows[0].image_url) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const imageUrl = rows[0].image_url;

    // Handle Base64 Data URL: data:image/jpeg;base64,/9j/4AAQ...
    if (imageUrl.startsWith('data:')) {
      const commaIndex = imageUrl.indexOf(',');
      if (commaIndex === -1) {
        return new NextResponse('Invalid Data URL', { status: 400 });
      }
      const header = imageUrl.slice(5, commaIndex); // e.g. "image/jpeg;base64"
      const mimeType = header.split(';')[0] || 'image/jpeg';
      const base64Data = imageUrl.slice(commaIndex + 1);
      const buffer = Buffer.from(base64Data, 'base64');

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      });
    }

    // If it's a normal URL or path, redirect to it
    return NextResponse.redirect(new URL(imageUrl, request.url));
  } catch (error) {
    console.error('Image serve error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
