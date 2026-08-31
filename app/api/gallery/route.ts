import { NextResponse } from 'next/server';

export async function GET() {
  const CLOUD_NAME = "tc4vv1dd";
  const UPLOAD_PRESET = "wedding_preset";

  try {
    // Mengambil foto langsung dari preset/list tanpa perlu API Key & Secret
    const response = await fetch(
      `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${UPLOAD_PRESET}.json`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json({ photos: [] });
    }

    const data = await response.json();
    
    // Format URL foto
    const imageUrls = data.resources.map((file: any) =>
      `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/v${file.version}/${file.public_id}.${file.format}`
    );

    return NextResponse.json({ photos: imageUrls });
  } catch (error: any) {
    return NextResponse.json({ photos: [] });
  }
}