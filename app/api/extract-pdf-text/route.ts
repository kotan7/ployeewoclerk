import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Configure runtime for Vercel
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "ファイルが提供されていません" }, { status: 400 });
    }

    // Check if the file is an image
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "画像ファイル（JPG、PNG、WEBP）のみサポートされています" 
      }, { status: 400 });
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "ファイルサイズは10MB未満である必要があります" 
      }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image with sharp for better OCR results
    const processedImageBuffer = await sharp(buffer)
      .grayscale() // Convert to grayscale
      .normalize() // Enhance contrast
      .png() // Convert to PNG for better OCR
      .toBuffer();

    // Convert to base64 for client-side processing
    const base64Image = `data:image/png;base64,${processedImageBuffer.toString('base64')}`;

    return NextResponse.json({ 
      processedImage: base64Image,
      fileName: file.name,
      fileSize: file.size
    });

  } catch (error) {
    console.error("Error in image processing route:", error);
    
    return NextResponse.json({ 
      error: "画像の処理に失敗しました" 
    }, { status: 500 });
  }
} 