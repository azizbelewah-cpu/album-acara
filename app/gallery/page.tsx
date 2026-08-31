'use client';

import { useState, useEffect } from 'react';

export default function PublicGalleryPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Fungsi untuk mengambil daftar foto dari Cloudinary
  const fetchGalleryPhotos = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      if (response.ok && data.photos) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error('Gagal memuat galeri:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryPhotos();

    // 1. AUTO-REFRESH: Ambil foto baru otomatis setiap 10 detik
    const interval = setInterval(() => {
      fetchGalleryPhotos();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white flex justify-center">
      <main className="w-full max-w-2xl min-h-screen p-5 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex flex-col items-center pt-6 mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80 font-semibold mb-1">
            Album Foto Bersama
          </p>
          <h1 className="font-wedding text-5xl text-amber-300 py-1 drop-shadow-md">
            Budi & Ani
          </h1>
          <p className="font-serif-custom italic text-xs text-slate-400 mt-1">
            Kumpulan momen manis dari seluruh tamu undangan
          </p>

          <a 
            href="/"
            className="mt-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            📸 Ambil Foto Kamu
          </a>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="my-12 text-center text-slate-400 text-xs animate-pulse">
            Memuat album foto...
          </div>
        ) : photos.length === 0 ? (
          <div className="my-12 text-center text-slate-400 text-xs">
            Belum ada foto yang diunggah. Jadilah yang pertama!
          </div>
        ) : (
          /* Grid Galeri Polaroid */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-8">
            {photos.map((url, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedPhoto(url)}
                className="bg-stone-50 p-2 pb-3 rounded shadow-xl cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <div className="overflow-hidden border border-stone-200 aspect-square rounded-sm">
                  <img 
                    src={url} 
                    alt={`Foto Acara ${index + 1}`} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. LIGHTBOX / ZOOM VIEW POPUP */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-lg w-full bg-stone-50 p-3 rounded-lg shadow-2xl flex flex-col items-center">
              {/* Tombol Tutup */}
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-3 -right-3 bg-slate-900 text-amber-300 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg border border-amber-400/30"
              >
                ✕
              </button>

              <img 
                src={selectedPhoto} 
                alt="Foto Zoom" 
                className="w-full max-h-[75vh] object-contain rounded border border-stone-200"
              />

              <div className="mt-3 flex gap-3 w-full">
                <a
                  href={selectedPhoto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-medium text-xs py-2 rounded text-center transition-colors shadow"
                  onClick={(e) => e.stopPropagation()}
                >
                  ⬇️ Download Ukuran Asli
                </a>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}