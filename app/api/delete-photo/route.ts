import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const CLOUD_NAME = "tc4vv1dd";
  const API_KEY = "731377338411544"; 
  const API_SECRET = "6_pM11zpTlgKS_5clYwM_2BrYV4"; // Ganti dengan API Secret kamu

  try {
    const { photoUrl } = await request.json();

    if (!photoUrl) {
      return NextResponse.json({ error: 'URL foto tidak valid' }, { status: 400 });
    }

    // Ekstrak public_id dari URL Cloudinary
    // Contoh URL: .../upload/v1234567/sample.jpg -> public_id: sample
    const urlParts = photoUrl.split('/');
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileNameWithExtension.split('.')[0];

    const timestamp = Math.floor(Date.now() / 1000);
    
    // Generasi Signature SHA-1 untuk otentikasi hapus Cloudinary
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (data.result === 'ok') {
      return NextResponse.json({ success: true, message: 'Foto berhasil dihapus dari Cloudinary' });
    } else {
      return NextResponse.json({ error: data.result || 'Gagal menghapus foto' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}