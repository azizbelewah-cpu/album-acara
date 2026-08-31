'use client';

import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

export default function CameraPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  // Menggunakan counter untuk melacak berapa banyak foto yang sedang diunggah di background
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

  // Fungsi untuk memproses upload 1 foto secara independen di background
  const processUploadInBackground = async (file: File) => {
    setUploadingCount((prev) => prev + 1);

    try {
      // 1. Kompresi foto
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };
      const compressedBlob = await imageCompression(file, compressionOptions);

      // 2. Siapkan FormData
      const formData = new FormData();
      formData.append('file', compressedBlob);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('tags', 'wedding_event');

      // 3. Kirim ke Cloudinary
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

        // Tambahkan URL baru ke state & LocalStorage secara aman
        setPhotos((prevPhotos) => {
          const updated = [...prevPhotos, optimizedUrl];
          localStorage.setItem('my_guest_photos', JSON.stringify(updated));
          return updated;
        });
      } else {
        alert(`Satu foto gagal terunggah: ${data.error?.message || 'Error'}`);
      }
    } catch (error: any) {
      console.error('Background upload error:', error);
      alert('Gagal mengunggah foto. Periksa koneksi internetmu!');
    } finally {
      setUploadingCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Handler saat tamu mengambil foto
  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    // Cek batas total (foto terunggah + foto yang sedang diproses di background)
    if (photos.length + uploadingCount >= MAX_PHOTOS) {
      alert(`Kamu sudah mencapai batas maksimal ${MAX_PHOTOS} foto!`);
      return;
    }

    // Jalankan upload langsung di background tanpa menahan tombol
    processUploadInBackground(file);

    // Reset input agar bisa langsung jepret lagi
    event.target.value = '';
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
    if (confirm('Hapus daftar foto tes dari perangkat ini?')) {
      localStorage.removeItem('my_guest_photos');
      setPhotos([]);
    }
  };

  // Total foto yang sudah dihitung (termasuk yang sedang terbang di background)
  const totalCount = photos.length + uploadingCount;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 max-w-md mx-auto flex flex-col items-center">
      {/* Header Elegan */}
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

      {/* Indikator Kuota */}
      <div className="bg-slate-900/80 px-4 py-1.5 rounded-full text-xs font-medium mb-4 border border-amber-500/20 text-slate-300 shadow-inner">
        Sisa Kuota Foto: <span className="text-amber-400 font-bold">{MAX_PHOTOS - totalCount}</span> / {MAX_PHOTOS}
      </div>

      {/* Indikator Status Background Upload */}
      {uploadingCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-medium mb-4 animate-pulse flex items-center gap-1.5">
          <span>⏳</span> Mengunggah {uploadingCount} foto di latar belakang...
        </div>
      )}

      {/* Tombol Ambil Foto (Selalu aktif sampai kuota habis) */}
      {totalCount < MAX_PHOTOS ? (
        <div className="flex flex-col items-center my-2 w-full">
          <label className="cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 px-8 rounded-full shadow-lg text-base flex items-center justify-center gap-2 w-3/4 text-center transition-all active:scale-95">
            📸 Ambil Foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        /* Ucapan Terima Kasih */
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-6 rounded-2xl text-center my-4 w-full shadow-2xl">
          <span className="text-3xl">💍</span>
          <h2 className="font-wedding text-4xl text-amber-300 mt-1">Terima Kasih</h2>
          <p className="font-serif-custom text-xs text-slate-300 mt-2 leading-relaxed">
            Kehadiran dan senyumanmu membuat hari bahagia kami semakin sempurna. Foto-fotomu sudah tersimpan aman di album kami!
          </p>
        </div>
      )}

      {/* Galeri Polaroid Hasil Foto Terunggah */}
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