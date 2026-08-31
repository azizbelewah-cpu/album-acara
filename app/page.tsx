'use client';

import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

export default function CameraPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  // Penampung sementara file foto sebelum diunggah
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  
  const [uploading, setUploading] = useState(false);
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

  // 1. Ambil foto dengan cepat & simpan di antrean sementara
  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    if (photos.length + pendingFiles.length >= MAX_PHOTOS) {
      alert(`Kamu sudah mencapai batas maksimal ${MAX_PHOTOS} foto!`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingFiles((prev) => [...prev, file]);
    setPendingPreviews((prev) => [...prev, previewUrl]);

    // Reset nilai input file agar tamu bisa ambil foto dengan nama/file yang sama jika mau
    event.target.value = '';
  };

  // 2. Unggah seluruh foto yang ada di antrean
  const handleUploadAll = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of pendingFiles) {
        // Kompresi foto sebelum upload
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
            '/upload/f_auto,q_auto/'
          );
          uploadedUrls.push(optimizedUrl);
        } else {
          throw new Error(data.error?.message || 'Gagal unggah foto');
        }
      }

      const updatedPhotos = [...photos, ...uploadedUrls];
      setPhotos(updatedPhotos);
      localStorage.setItem('my_guest_photos', JSON.stringify(updatedPhotos));

      // Bersihkan antrean preview sementara
      setPendingFiles([]);
      setPendingPreviews([]);
    } catch (error: any) {
      alert(`Gagal unggah beberapa foto: ${error.message || 'Silakan coba lagi!'}`);
    } finally {
      setUploading(false);
    }
  };

  // 3. Unduh foto dari galeri lokal
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

  // Reset local storage jika ingin tes ulang
  const handleResetLocalStorage = () => {
    if (confirm('Hapus daftar foto tes dari perangkat ini?')) {
      localStorage.removeItem('my_guest_photos');
      setPhotos([]);
      setPendingFiles([]);
      setPendingPreviews([]);
    }
  };

  const totalPhotosCount = photos.length + pendingFiles.length;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 max-w-md mx-auto flex flex-col items-center">
      {/* Header Elegan Pernikahan */}
      <div className="text-center mt-6 mb-4">
        <p className="text-xs uppercase tracking-widest text-amber-200/70 font-semibold mb-1">
          Wedding Gallery
        </p>
        <h1 className="font-wedding text-5xl text-amber-300 py-1 drop-shadow">
          Budi & Ani
        </h1>
        <p className="font-serif-custom italic text-xs text-slate-400 mt-1">
          "Abadikan momen manis bersama kami hari ini"
        </p>
      </div>

      {/* Indikator Sisa Kuota */}
      <div className="bg-slate-900/80 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-amber-500/20 text-slate-300 shadow-inner">
        Foto Tersisa: <span className="text-amber-400 font-bold">{MAX_PHOTOS - totalPhotosCount}</span> / {MAX_PHOTOS}
      </div>

      {/* Tombol Ambil Foto Cepat */}
      {totalPhotosCount < MAX_PHOTOS && (
        <div className="flex flex-col items-center my-2 w-full">
          <label className="cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 px-8 rounded-full shadow-lg text-base flex items-center justify-center gap-2 w-3/4 text-center transition-all active:scale-95">
            📸 Ambil Foto {pendingFiles.length > 0 ? `(${pendingFiles.length})` : ''}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Preview Antrean Foto Sementara */}
      {pendingPreviews.length > 0 && (
        <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 my-4 flex flex-col items-center shadow-xl">
          <p className="text-xs font-semibold text-amber-300 mb-3 tracking-wide">
            Foto Siap Diunggah ({pendingPreviews.length}):
          </p>
          
          <div className="flex gap-2 overflow-x-auto w-full pb-2 justify-center">
            {pendingPreviews.map((src, idx) => (
              <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 border-amber-400 shadow">
                <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <button
            onClick={handleUploadAll}
            disabled={uploading}
            className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-full text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            {uploading ? '⏳ Mengunggah Semua Foto...' : `🚀 Simpan ${pendingFiles.length} Foto ke Galeri`}
          </button>
        </div>
      )}

      {/* Ucapan Terima Kasih Jika Sudah 5 Foto */}
      {totalPhotosCount >= MAX_PHOTOS && pendingFiles.length === 0 && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-6 rounded-2xl text-center my-4 w-full shadow-2xl">
          <span className="text-3xl">💍</span>
          <h2 className="font-wedding text-4xl text-amber-300 mt-1">Terima Kasih</h2>
          <p className="font-serif-custom text-xs text-slate-300 mt-2 leading-relaxed">
            Kehadiran dan senyumanmu membuat hari bahagia kami semakin sempurna. Foto-fotomu sudah tersimpan aman di album kami!
          </p>
        </div>
      )}

      {/* Galeri Polaroid Hasil Foto yang Sudah Terunggah */}
      {photos.length > 0 && (
        <section className="w-full mt-6">
          <h2 className="font-serif-custom text-sm font-semibold mb-4 border-b border-slate-800 pb-2 text-amber-200/80 tracking-wide">
            Hasil Foto Terunggah ({photos.length}/{MAX_PHOTOS})
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

      {/* Footer Navigasi */}
      <div className="mt-auto pt-8 pb-4 flex flex-col items-center gap-2">
        <a 
          href="/gallery" 
          className="font-serif-custom text-xs text-amber-200/60 underline hover:text-amber-200"
        >
          Lihat Album Foto Bersama →
        </a>

        {photos.length > 0 && (
          <button
            onClick={handleResetLocalStorage}
            className="text-[10px] text-red-400/60 underline hover:text-red-300 mt-2"
          >
            Reset Foto Saya
          </button>
        )}
      </div>
    </main>
  );
}