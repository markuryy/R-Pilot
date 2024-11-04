import { NextRequest } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure workspace directory exists
    const workspacePath = path.join(process.cwd(), 'public', 'workspace');
    
    // Use original filename, replacing invalid characters
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = path.join(workspacePath, safeFilename);

    // Write the file
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      filename: safeFilename,
      message: 'File uploaded successfully' 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
