import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import PagePreview from '../components/PagePreview'
import './Pages.css'

function MergePDF() {
  const [files, setFiles] = useState([]) // each item: { id, file, selectedPages: [], previewBuffer }
  const [activePreviewId, setActivePreviewId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(f => f.type === 'application/pdf')

    if (validFiles.length !== selectedFiles.length) {
      setError('Only PDF files are allowed')
    } else {
      setError('')
    }

    const wrapped = validFiles.map((f, i) => ({ id: `${Date.now()}-${i}-${f.name}`, file: f, selectedPages: [], previewBuffer: null }))
    setFiles(prev => [...prev, ...wrapped])
  }

  const previewFile = async (id) => {
    try {
      const item = files.find(f => f.id === id)
      if (!item) return
      if (item.previewBuffer) {
        setActivePreviewId(id)
        return
      }
      const buffer = await item.file.arrayBuffer()
      setFiles(prev => prev.map(f => f.id === id ? { ...f, previewBuffer: buffer } : f))
      setActivePreviewId(id)
    } catch (err) {
      setError('Unable to load preview: ' + err.message)
    }
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const togglePageForFile = (id, pageIdx) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== id) return f
      const exists = f.selectedPages.includes(pageIdx)
      return { ...f, selectedPages: exists ? f.selectedPages.filter(p => p !== pageIdx) : [...f.selectedPages, pageIdx].sort((a,b)=>a-b) }
    }))
  }

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files')
      return
    }

    setLoading(true)
    setError('')

    try {
      const mergedPdf = await PDFDocument.create()

      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const indices = (item.selectedPages && item.selectedPages.length > 0)
          ? item.selectedPages
          : pdf.getPageIndices()
        const copiedPages = await mergedPdf.copyPages(pdf, indices)
        copiedPages.forEach(page => mergedPdf.addPage(page))
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'merged.pdf'
      link.click()
      
      URL.revokeObjectURL(url)
      setFiles([])
    } catch (err) {
      setError('Error merging PDFs: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <h1>Merge PDFs</h1>
      <p>Combine multiple PDF files into one</p>

      {error && <div className="error-message">{error}</div>}

      <div className="upload-area">
        <div className="upload-icon">📎</div>
        <div className="upload-text">Select PDF files to merge</div>
        <div className="upload-subtext">or drag and drop them here</div>
        <input
          type="file"
          id="fileInput"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
        />
        <button
          className="btn btn-secondary"
          onClick={() => document.getElementById('fileInput').click()}
        >
          Choose Files
        </button>
      </div>

      {files.length > 0 && (
        <>
          <div className="file-list">
            <h3>Selected Files ({files.length})</h3>
            {files.map((item, index) => (
              <div key={item.id} className="file-item">
                <div>
                  <span className="file-name">{item.file.name}</span>
                  <span className="file-size">({(item.file.size / 1024).toFixed(2)} KB)</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-tertiary" onClick={() => previewFile(item.id)}>Preview</button>
                  <button
                    className="remove-btn"
                    onClick={() => removeFile(index)}
                  >
                    Remove
                  </button>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <small>Selected pages: {item.selectedPages.length > 0 ? item.selectedPages.map(p => p+1).join(', ') : 'all'}</small>
                </div>
              </div>
            ))}
          </div>
          {activePreviewId && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Preview</h4>
              <PdfPreview
                arrayBuffer={files.find(f => f.id === activePreviewId)?.previewBuffer}
                selectedPages={files.find(f => f.id === activePreviewId)?.selectedPages || []}
                onTogglePage={(idx) => togglePageForFile(activePreviewId, idx)}
              />
              <div style={{ marginTop: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setActivePreviewId(null)}>Close Preview</button>
              </div>
            </div>
          )}

          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={mergePDFs}
              disabled={loading}
            >
              {loading ? 'Merging...' : 'Merge PDFs'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setFiles([])}
              disabled={loading}
            >
              Clear All
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default MergePDF
