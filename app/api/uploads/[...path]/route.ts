import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET (
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params
    const fullPath = path.join(process.cwd(), 'public', filePath.join('/'))

    const file = await fs.readFile(fullPath)
    const ext = fullPath.split('.').pop()?.toLowerCase()

    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp'
    }

    return new NextResponse(file, {
      headers: {
        'Content-Type': mimeTypes[ext || 'jpg'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
