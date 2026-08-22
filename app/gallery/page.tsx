'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Sesuaikan path supabase client kamu

export default function CameraPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const MAX_PHOTOS = 5;

  // 1. Ambil riwayat foto tamu dari browser saat pertama kali dibuka
  useEffect(() => {
    const savedPhotos = localStorage.getItem('my_guest_photos');
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }
  }, []);

  // 2. Fungsi Unggah Foto ke Supabase
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      if (photos.length >= MAX_PHOTOS) {
        alert('Kamu sudah mencapai batas maksimal 5 foto!');
        return;
      }

      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Unggah ke bucket Supabase
      const { error: uploadError } = await supabase.storage
        .from('foto-acara')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ambil URL Publik Foto
      const { data } = supabase.storage.from('foto-acara').getPublicUrl(filePath);
      const photoUrl = data.publicUrl;

      // Update daftar foto tamu & simpan di localStorage HP
      const updatedPhotos = [...photos, photoUrl];
      setPhotos(updatedPhotos);
      localStorage.setItem('my_guest_photos', JSON.stringify(updatedPhotos));

    } catch (error) {
      alert('Gagal mengunggah foto. Silakan coba lagi!');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 max-w-md mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold mt-4 mb-2">📸 Disposable Cam</h1>

      {/* Indikator Kuota Foto */}
      <div className="bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-slate-700">
        Sisa Kuota: <span className="text-orange-400 font-bold">{MAX_PHOTOS - photos.length}</span> / {MAX_PHOTOS}
      </div>

      {/* JIKA KUOTA MASIH ADA: TAMPILKAN TOMBOL KAMERA */}
      {photos.length < MAX_PHOTOS ? (
        <div className="flex flex-col items-center my-8 w-full">
          <label className="cursor-pointer bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-full shadow-lg text-lg flex items-center justify-center gap-2 w-3/4 text-center transition-all">
            {uploading ? 'Mengunggah...' : '📷 Jepret Foto'}
            <input
              type="file"
              accept="image/*"
              capture="environment" // Otomatis membuka kamera belakang HP
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Ambil momen acaramu! Foto langsung tersimpan.
          </p>
        </div>
      ) : (
        /* JIKA KUOTA HABIS (SUDAH 5 FOTO): TAMPILKAN PESAN SELESAI */
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 p-6 rounded-2xl text-center my-4 w-full shadow-xl">
          <span className="text-4xl">🎉</span>
          <h2 className="text-xl font-bold text-amber-400 mt-2">Kuota Foto Habis!</h2>
          <p className="text-sm text-slate-300 mt-1">
            Kamu sudah mengambil 5 foto terbaikmu. Hasil foto bisa kamu lihat dan unduh di bawah ini.
          </p>
        </div>
      )}

      {/* GALERI HASIL FOTO TAMU (Hanya menampilkan foto milik tamu ini) */}
      {photos.length > 0 && (
        <section className="w-full mt-6">
          <h2 className="text-lg font-bold mb-4 border-b border-slate-800 pb-2">
            🖼️ Hasil Foto Kamu ({photos.length}/{MAX_PHOTOS})
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {photos.map((url, index) => (
              <div key={index} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 p-2 flex flex-col justify-between">
                <img 
                  src={url} 
                  alt={`Foto ${index + 1}`} 
                  className="w-full h-36 object-cover rounded-lg mb-2"
                />
                <a
                  href={url}
                  download={`foto-acara-${index + 1}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-700 hover:bg-slate-600 text-xs font-medium text-center py-2 px-1 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  ⬇️ Simpan Foto
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Link Ke Galeri Bersama (Opsional) */}
      <div className="mt-auto pt-8 pb-4">
        <a 
          href="/gallery" 
          className="text-xs text-slate-400 underline hover:text-slate-200"
        >
          Lihat Galeri Bersama Seluruh Acara →
        </a>
      </div>
    </main>
  );
}