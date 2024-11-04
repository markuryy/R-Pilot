import { NextRequest } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return new Response('No file uploaded', { status: 400 });
    }

    // Go up to root directory and use workspace folder
    const rootDir = path.join(process.cwd(), '..', '..');
    const workspacePath = path.join(rootDir, 'workspace');

    // Ensure workspace directory exists
    await mkdir(workspacePath, { recursive: true });

    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = path.join(workspacePath, safeFilename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    return new Response(JSON.stringify({
      success: true,
      path: `/workspace/${file.name}`
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return new Response('Error uploading file', { status: 500 });
  }
}
