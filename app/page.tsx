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

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      setDownloadingIndex(index);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `wedding-photo-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Gagal mengunduh foto:', error);
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
    <main className="min-h-screen bg-slate-950 text-white p-4 max-w-md mx-auto flex flex-col items-center">
      {/* Header Elegan Pernikahan */}
      <div className="text-center mt-6 mb-4">
        <p className="text-xs uppercase tracking-widest text-amber-200/70 font-semibold mb-1">
          Wedding Gallery
        </p>
        {/* Ubah Nama Pengantin Di Sini */}
        <h1 className="font-wedding text-5xl text-amber-300 py-1 drop-shadow">
          nama & nama
        </h1>
        <p className="font-serif-custom italic text-xs text-slate-400 mt-1">
          "Abadikan momen manis bersama kami hari ini"
        </p>
      </div>

      {/* Indikator Kuota */}
      <div className="bg-slate-900/80 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-amber-500/20 text-slate-300 shadow-inner">
        Sisa Kuota Foto: <span className="text-amber-400 font-bold">{MAX_PHOTOS - photos.length}</span> / {MAX_PHOTOS}
      </div>

      {/* Tombol Kamera */}
      {photos.length < MAX_PHOTOS ? (
        <div className="flex flex-col items-center my-4 w-full">
          <label className="cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 px-8 rounded-full shadow-lg text-base flex items-center justify-center gap-2 w-3/4 text-center transition-all active:scale-95">
            {uploading ? 'Mengunggah...' : '📸 Ambil Foto'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        /* Ucapan Terima Kasih Elegan */
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-6 rounded-2xl text-center my-4 w-full shadow-2xl">
          <span className="text-3xl">💍</span>
          <h2 className="font-wedding text-4xl text-amber-300 mt-1">Terima Kasih</h2>
          <p className="font-serif-custom text-xs text-slate-300 mt-2 leading-relaxed">
            Kehadiran dan senyumanmu membuat hari bahagia kami semakin sempurna. Foto-fotomu sudah tersimpan aman di album kami!
          </p>
        </div>
      )}

      {/* Galeri Polaroid */}
      {photos.length > 0 && (
        <section className="w-full mt-6">
          <h2 className="font-serif-custom text-sm font-semibold mb-4 border-b border-slate-800 pb-2 text-amber-200/80 tracking-wide">
            Hasil Foto Kamu ({photos.length}/{MAX_PHOTOS})
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {photos.map((url, index) => (
              <div 
                key={index} 
                className="bg-stone-50 p-2.5 pb-3 rounded shadow-xl transition-transform hover:scale-105"
              >
                <div className="overflow-hidden border border-stone-200 aspect-square">
                  <img 
                    src={url} 
                    alt={`Foto ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <button
                  onClick={() => handleDownload(url, index)}
                  disabled={downloadingIndex === index}
                  className="mt-2.5 w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-medium text-xs py-1.5 px-1 rounded text-center block transition-colors shadow"
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
          className="font-serif-custom text-xs text-amber-200/60 underline hover:text-amber-200"
        >
          Lihat Album Foto Bersama →
        </a>
      </div>
    </main>
  );
}