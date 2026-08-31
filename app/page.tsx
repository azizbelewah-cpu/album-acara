'use client';

import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

export default function CameraPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  const MAX_PHOTOS = 5;
  const CLOUD_NAME = "tc4vv1dd";
  const UPLOAD_PRESET = "wedding_preset";

  useEffect(() => {
    const savedPhotos = localStorage.getItem('my_guest_photos');
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }
  }, []);

  const processUploadInBackground = async (file: File) => {
    setUploadingCount((prev) => prev + 1);

    try {
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };
      const compressedBlob = await imageCompression(file, compressionOptions);

      const formData = new FormData();
      formData.append('file', compressedBlob);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('tags', 'wedding_event');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        const optimizedUrl = data.secure_url.replace(
          '/upload/',
          '/upload/f_auto,q_auto,e_improve,e_auto_color,e_sharpen:50/'
        );

        setPhotos((prevPhotos) => {
          const updated = [...prevPhotos, optimizedUrl];
          localStorage.setItem('my_guest_photos', JSON.stringify(updated));
          return updated;
        });
      } else {
        alert(`Gagal mengunggah foto: ${data.error?.message || 'Error'}`);
      }
    } catch (error: any) {
      console.error('Background upload error:', error);
      alert('Gagal mengunggah foto. Periksa koneksi internetmu!');
    } finally {
      setUploadingCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    if (photos.length + uploadingCount >= MAX_PHOTOS) {
      alert(`Kamu sudah mencapai batas maksimal ${MAX_PHOTOS} foto!`);
      return;
    }

    processUploadInBackground(file);
    event.target.value = '';
  };

 const handleDeletePhoto = async (indexToDelete: number) => {
    const photoUrlToDelete = photos[indexToDelete];

    if (!confirm('Yakin ingin menghapus foto ini? Foto akan dihapus permanen dari album bersama.')) {
      return;
    }

    try {
      const response = await fetch('/api/delete-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: photoUrlToDelete }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedPhotos = photos.filter((_, index) => index !== indexToDelete);
        setPhotos(updatedPhotos);
        localStorage.setItem('my_guest_photos', JSON.stringify(updatedPhotos));
      } else {
        alert('Gagal menghapus dari server Cloudinary');
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan');
    }
  };

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

  const handleResetLocalStorage = () => {
    if (confirm('Hapus semua daftar foto tes dari perangkat ini?')) {
      localStorage.removeItem('my_guest_photos');
      setPhotos([]);
    }
  };

  const totalCount = photos.length + uploadingCount;

  return (
    // Background dibuat full screen di seluruh layar (w-full min-h-screen)
    <div className="w-full min-h-screen bg-slate-950 text-white flex justify-center">
      <main className="w-full max-w-md min-h-screen p-5 flex flex-col items-center justify-between">
        
        {/* Header Section */}
        <div className="w-full flex flex-col items-center pt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80 font-semibold mb-1">
            Wedding Photo Booth
          </p>
          <h1 className="font-wedding text-5xl text-amber-300 py-1 drop-shadow-md text-center">
            Budi & Ani
          </h1>
          <p className="font-serif-custom italic text-xs text-slate-400 mt-1 text-center">
            "Abadikan momen manis bersama kami hari ini"
          </p>

          <div className="mt-4 bg-slate-900/90 px-4 py-1.5 rounded-full text-xs font-medium border border-amber-500/20 text-slate-300 shadow-inner">
            Sisa Kuota Foto: <span className="text-amber-400 font-bold">{MAX_PHOTOS - totalCount}</span> / {MAX_PHOTOS}
          </div>

          {uploadingCount > 0 && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-medium animate-pulse flex items-center gap-1.5">
              <span>⏳</span> Mengunggah {uploadingCount} foto di latar belakang...
            </div>
          )}
        </div>

        {/* Action Button Section */}
        <div className="w-full flex flex-col items-center my-6">
          {totalCount < MAX_PHOTOS ? (
            <label className="cursor-pointer bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-bold py-4 px-8 rounded-full shadow-lg text-base flex items-center justify-center gap-2 w-full text-center transition-all active:scale-95 border border-amber-300/30">
              📸 Ambil Foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                className="hidden"
              />
            </label>
          ) : (
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-6 rounded-2xl text-center w-full shadow-2xl">
              <span className="text-3xl">💍</span>
              <h2 className="font-wedding text-4xl text-amber-300 mt-1">Terima Kasih</h2>
              <p className="font-serif-custom text-xs text-slate-300 mt-2 leading-relaxed">
                Kehadiran dan senyumanmu membuat hari bahagia kami semakin sempurna. Foto-fotomu sudah tersimpan aman di album kami!
              </p>
            </div>
          )}
        </div>

        {/* Gallery Section */}
        {photos.length > 0 && (
          <section className="w-full mb-6">
            <h2 className="font-serif-custom text-xs font-semibold mb-3 border-b border-slate-800 pb-2 text-amber-200/80 tracking-wide uppercase">
              Hasil Foto Kamu ({photos.length}/{MAX_PHOTOS})
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {photos.map((url, index) => (
                <div 
                  key={index} 
                  className="bg-stone-50 p-2 pb-2.5 rounded shadow-xl relative"
                >
                  <button
                    onClick={() => handleDeletePhoto(index)}
                    title="Hapus foto ini"
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md z-10"
                  >
                    ✕
                  </button>

                  <div className="overflow-hidden border border-stone-200 aspect-square rounded-sm">
                    <img 
                      src={url} 
                      alt={`Foto ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleDownload(url, index)}
                    disabled={downloadingIndex === index}
                    className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-medium text-[11px] py-1.5 px-1 rounded text-center block transition-colors"
                  >
                    {downloadingIndex === index ? '⏳ Mengunduh...' : '⬇️ Simpan'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Navigation */}
        <div className="w-full pb-4 pt-2 flex flex-col items-center gap-2 border-t border-slate-900">
          <a 
            href="/gallery" 
            className="font-serif-custom text-xs text-amber-200/70 underline hover:text-amber-200"
          >
            Lihat Album Foto Bersama →
          </a>

          {photos.length > 0 && (
            <button
              onClick={handleResetLocalStorage}
              className="text-[10px] text-red-400/60 underline hover:text-red-300 mt-1"
            >
              Reset Semua Foto Saya
            </button>
          )}
        </div>

      </main>
    </div>
  );
}