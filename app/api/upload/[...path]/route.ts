import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET (
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> } // ← UBAH JADI PROMISE
) {
  try {
    // Await params
    const { path: filePath } = await params // ← AWAIT INI

    const fullPath = path.join(process.cwd(), 'public', filePath.join('/'))

    console.log('📂 Serving file:', fullPath)

    // Security check
    const publicDir = path.join(process.cwd(), 'public')
    if (!fullPath.startsWith(publicDir)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if file exists
    try {
      await fs.access(fullPath)
    } catch {
      console.error('❌ File not found:', fullPath)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const file = await fs.readFile(fullPath)
    const ext = fullPath.split('.').pop()?.toLowerCase()

    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp'
    }

    return new NextResponse(file, {
      headers: {
        'Content-Type': mimeTypes[ext || 'jpg'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('❌ Error serving file:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
