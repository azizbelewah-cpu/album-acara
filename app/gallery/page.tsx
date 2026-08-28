'use client';

import { useState, useEffect } from 'react';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.photos) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error('Gagal memuat galeri:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 max-w-md mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-center my-4 border-b border-slate-800 pb-3">
        <h1 className="font-wedding text-3xl text-amber-300">🖼️ Galeri Foto Acara</h1>
        <a 
          href="/" 
          className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-200 px-3 py-1.5 rounded-full transition-colors"
        >
          ← Kembali ke Kamera
        </a>
      </div>

      {loading ? (
        <p className="text-slate-400 text-xs my-10">Memuat foto dari Cloudinary...</p>
      ) : photos.length === 0 ? (
        <p className="text-slate-400 text-xs my-10">Belum ada foto yang diunggah.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 w-full my-4">
          {photos.map((url, index) => (
            <div key={index} className="bg-stone-50 p-2 rounded shadow-lg overflow-hidden border border-stone-200 aspect-square">
              <img 
                src={url} 
                alt={`Foto Acara ${index + 1}`} 
                className="w-full h-full object-cover rounded-sm"
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}