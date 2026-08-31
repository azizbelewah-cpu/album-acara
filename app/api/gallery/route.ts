import { NextResponse } from 'next/server';

export async function GET() {
  const CLOUD_NAME = "tc4vv1dd";
  
  // Pastikan API_KEY dan API_SECRET sudah diisi dengan milikmu
  const API_KEY = "MASUKKAN_API_KEY_KAMU"; 
  const API_SECRET = "MASUKKAN_API_SECRET_KAMU"; 

  try {
    // Memfilter agar HANYA mengambil foto di folder foto-wedding
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?type=upload&prefix=foto-wedding/&max_results=100`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`,
        },
        cache: 'no-store',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gagal mengambil foto');
    }

    // Ambil URL foto dan tambahkan f_auto,q_auto
    const imageUrls = data.resources.map((file: any) => 
      file.secure_url.replace('/upload/', '/upload/f_auto,q_auto/')
    );

    return NextResponse.json({ photos: imageUrls });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}