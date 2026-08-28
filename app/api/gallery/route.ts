import { NextResponse } from 'next/server';

export async function GET() {
  const CLOUD_NAME = "tc4vv1dd";
  
  // Masukkan API Key dan API Secret dari Dashboard Cloudinary kamu
  // Bisa ditemukan di halaman utama/Settings Cloudinary
  const API_KEY = "731377338411544"; 
  const API_SECRET = "6_pM11zpTlgKS_5clYwM_2BrYV4"; 

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?max_results=100`,
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