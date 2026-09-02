import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Disable default body parser to handle form data
export async function POST(request) {
  try {
    // RBAC Check
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded.' },
        { status: 400 }
      );
    }

    // Read file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // Set up path
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique name
      const cleanFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const filePath = path.join(uploadDir, cleanFilename);

      // Write file
      await fs.promises.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${cleanFilename}`,
        message: 'File uploaded successfully.'
      });
    } catch (fsErr) {
      // Fallback for Read-Only serverless environment (e.g. Vercel)
      console.warn('Local filesystem write failed. Returning base64 Data URL fallback:', fsErr.message);
      const mimeType = file.type || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      
      return NextResponse.json({
        success: true,
        url: dataUrl,
        message: 'File uploaded successfully (Data URL).'
      });
    }
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file.' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
