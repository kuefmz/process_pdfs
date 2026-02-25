import React, { useEffect, useState } from 'react'
import { PDFDocument } from 'pdf-lib'

// PagePreview: receives `buffer` (ArrayBuffer), `pageIndex` (zero-based)
// Renders a single-page PDF for preview inside an iframe using an object URL
function PagePreview({ buffer, pageIndex }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let mounted = true
    let objectUrl = null
    const makeSinglePage = async () => {
      if (!buffer || typeof pageIndex !== 'number') return
      try {
        const src = await PDFDocument.load(buffer)
        const out = await PDFDocument.create()
        const [copied] = await out.copyPages(src, [pageIndex])
        out.addPage(copied)
        const bytes = await out.save()
        const blob = new Blob([bytes], { type: 'application/pdf' })
        objectUrl = URL.createObjectURL(blob)
        if (mounted) setUrl(objectUrl)
      } catch (err) {
        console.error('preview error', err)
      }
    }
    makeSinglePage()
    return () => { mounted = false; if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null } }
  }, [buffer, pageIndex])

  if (!buffer || typeof pageIndex !== 'number') return null

  return (
    <div style={{ border: '1px solid #e6e6e6', padding: 8 }}>
      {url ? (
        <iframe title="page-preview" src={url} style={{ width: '100%', height: '700px', border: 0 }} />
      ) : (
        <div style={{ padding: 20 }}>Loading preview…</div>
      )}
    </div>
  )
}

export default PagePreview
