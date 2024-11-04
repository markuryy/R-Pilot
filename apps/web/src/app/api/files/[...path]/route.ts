import { NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const rootDir = path.join(process.cwd(), '..', '..');
    const filePath = path.join(rootDir, 'workspace', ...params.path);

    if (!existsSync(filePath)) {
      return new Response('File not found', { status: 404 });
    }

    const file = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    const contentType = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.csv': 'text/csv',
      '.r': 'text/plain',
    }[ext];

    if (!contentType) {
      return new Response('Unsupported file type', { status: 400 });
    }

    return new Response(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': file.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new Response('Error serving file', { status: 500 });
  }
}
