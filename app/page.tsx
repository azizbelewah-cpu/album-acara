'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage('Mengunggah foto rahasia...')

    // Membuat nama file unik berdasarkan waktu
    const fileName = `foto_${Date.now()}.jpg`

    // Unggah ke bucket 'foto-acara' di Supabase
    const { data, error } = await supabase.storage
      .from('foto-acara')
      .upload(fileName, file)

    if (error) {
      setMessage('Gagal mengunggah foto: ' + error.message)
    } else {
      setMessage('📸 Foto berhasil diambil & tersembunyi! Sampai jumpa saat reveal.')
    }
    setUploading(false)
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
        <h1 className="text-3xl font-bold mb-2">📷 Disposable Cam</h1>
        <p className="text-slate-400 mb-8 text-sm">
          Ambil foto acaramu! Foto akan tersimpan secara rahasia hingga waktu pembukaan.
        </p>

        <label className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-8 rounded-full cursor-pointer transition shadow-lg text-lg">
          {uploading ? 'Proses...' : 'Jepret Foto'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {message && (
          <p className="mt-6 text-sm font-medium text-amber-400 bg-slate-900/50 p-3 rounded-lg border border-amber-500/20">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}