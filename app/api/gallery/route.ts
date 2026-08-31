import { NextResponse } from 'next/server';

export async function GET() {
  const CLOUD_NAME = "tc4vv1dd";
  const API_KEY = "731377338411544"; 
  const API_SECRET = "6_pM11zpTlgKS_5clYwM_2BrYV4"; 

  try {
    // Memanggil API khusus TAG agar HANYA foto 'wedding_event' yang diambil
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/tags/wedding_event?max_results=100`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`,
        },
        cache: 'no-store',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ photos: [] });
      }
      throw new Error(data.error?.message || 'Gagal mengambil foto');
    }

    const imageUrls = data.resources.map((file: any) => 
      file.secure_url.replace('/upload/', '/upload/f_auto,q_auto/')
    );

    return NextResponse.json({ photos: imageUrls });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ photos: [], error: error.message }, { status: 500 });
  }
}