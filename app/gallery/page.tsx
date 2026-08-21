'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Gallery() {
  const [photos, setPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = async () => {
    setLoading(true)
    // Mengambil daftar file dari bucket 'foto-acara'
    const { data, error } = await supabase.storage
      .from('foto-acara')
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

    if (error) {
      console.error('Error fetching photos:', error.message)
    } else if (data) {
      // Mendapatkan URL publik untuk setiap foto
      const urls = data.map((file) => {
        const { data: publicUrlData } = supabase.storage
          .from('foto-acara')
          .getPublicUrl(file.name)
        return publicUrlData.publicUrl
      })
      setPhotos(urls)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">🎉 Reveal Gallery</h1>
            <p className="text-slate-400 text-sm">Semua foto kenangan acara terkumpul di sini</p>
          </div>
          <a
            href="/"
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition"
          >
            📸 Ambil Foto Lagi
          </a>
        </header>

        {loading ? (
          <p className="text-center text-slate-400 py-12">Memuat foto rahasia...</p>
        ) : photos.length === 0 ? (
          <p className="text-center text-slate-500 py-12">Belum ada foto yang diunggah.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((url, index) => (
              <div key={index} className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700 aspect-square">
                <img
                  src={url}
                  alt={`Foto Acara ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}