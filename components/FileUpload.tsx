'use client'

import { useState, useRef } from 'react'

interface Props {
  folder: string
  accept?: string
  onUpload: (url: string) => void
  currentUrl?: string | null
  label?: string
}

export default function FileUpload({ folder, accept = 'image/*,.pdf', onUpload, currentUrl, label = 'Anexar arquivo' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()

    if (json.url) {
      setPreview(json.url)
      onUpload(json.url)
    }
    setUploading(false)
  }

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url)

  return (
    <div className="space-y-2">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      >
        {uploading ? (
          <p className="text-sm text-blue-500">Enviando...</p>
        ) : preview ? (
          <div className="space-y-2">
            {isImage(preview) ? (
              <img src={preview} alt="preview" className="max-h-32 mx-auto rounded object-contain" />
            ) : (
              <p className="text-sm text-blue-600">📎 Arquivo anexado</p>
            )}
            <p className="text-xs text-gray-400">Clique para trocar</p>
          </div>
        ) : (
          <div>
            <p className="text-2xl mb-1">📎</p>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xs text-gray-400 mt-1">Arraste ou clique • máx 10MB</p>
          </div>
        )}
      </div>
      {preview && (
        <a href={preview} target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline block text-center">
          Ver arquivo →
        </a>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}
