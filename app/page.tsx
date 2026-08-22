'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CameraPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const MAX_PHOTOS = 5;

  useEffect(() => {
    const savedPhotos = localStorage.getItem('my_guest_photos');
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }
  }, []);

  // FUNGSI UTAMA: Langsung download foto tanpa buka tab baru
  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      setDownloadingIndex(index);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `foto-acara-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Gagal mengunduh foto:', error);
      // Fallback jika fetch diblokir
      window.open(imageUrl, '_blank');
    } finally {
      setDownloadingIndex(null);
    }
  };

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

      const { error: uploadError } = await supabase.storage
        .from('foto-acara')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('foto-acara').getPublicUrl(filePath);
      const photoUrl = data.publicUrl;

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
      <h1 className="text-2xl font-bold mt-4 mb-1">💍 Wedding of nama & nama</h1>
      <p className="text-xs text-amber-400 mb-2">0 Agustus 2026</p>

      <div className="bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-slate-700">
        Sisa Kuota: <span className="text-orange-400 font-bold">{MAX_PHOTOS - photos.length}</span> / {MAX_PHOTOS}
      </div>

      {photos.length < MAX_PHOTOS ? (
        <div className="flex flex-col items-center my-6 w-full">
          <label className="cursor-pointer bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-full shadow-lg text-lg flex items-center justify-center gap-2 w-3/4 text-center transition-all active:scale-95">
            {uploading ? 'Mengunggah...' : '📷 Jepret Foto'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
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
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 p-6 rounded-2xl text-center my-4 w-full shadow-xl">
          <span className="text-4xl">✨</span>
          <h2 className="text-xl font-bold text-amber-400 mt-2">Terima Kasih!</h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Kamu sudah melengkapi 5 foto acaramu. Terima kasih banyak sudah ikut mengabadikan momen berharga hari ini! ❤️
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <section className="w-full mt-6">
          <h2 className="text-lg font-bold mb-4 border-b border-slate-800 pb-2">
            🖼️ Hasil Foto Kamu ({photos.length}/{MAX_PHOTOS})
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {photos.map((url, index) => (
              <div 
                key={index} 
                className="bg-white p-2 pb-3 rounded-md shadow-2xl transition-transform hover:scale-105"
              >
                <div className="overflow-hidden rounded border border-gray-200">
                  <img 
                    src={url} 
                    alt={`Foto ${index + 1}`} 
                    className="w-full h-36 object-cover"
                  />
                </div>
                
                {/* Tombol Unduh Otomatis */}
                <button
                  onClick={() => handleDownload(url, index)}
                  disabled={downloadingIndex === index}
                  className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs py-2 px-1 rounded text-center block transition-colors shadow"
                >
                  {downloadingIndex === index ? '⏳ Mengunduh...' : '⬇️ Simpan Foto'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

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