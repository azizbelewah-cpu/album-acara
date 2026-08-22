'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage.from('foto-acara').list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) throw error;

      if (data) {
        const urls = data.map((file) => {
          return supabase.storage.from('foto-acara').getPublicUrl(file.name).data.publicUrl;
        });
        setPhotos(urls);
      }
    } catch (err) {
      console.error('Gagal mengambil foto:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold">🖼️ Galeri Foto Acara</h1>
        <a href="/" className="text-xs bg-slate-800 px-3 py-2 rounded-lg text-slate-300">
          ← Kembali ke Kamera
        </a>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 my-10">Memuat semua foto...</p>
      ) : photos.length === 0 ? (
        <p className="text-center text-slate-400 my-10">Belum ada foto yang diunggah.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((url, idx) => (
            <div key={idx} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-40 object-cover" />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}