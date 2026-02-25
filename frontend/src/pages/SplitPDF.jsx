import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import PagePreview from '../components/PagePreview'
import './Pages.css'

function SplitPDF() {
  const [file, setFile] = useState(null)
  const [startPage, setStartPage] = useState(1)
  const [endPage, setEndPage] = useState(1)
  const [arrayBuffer, setArrayBuffer] = useState(null)
  const [selectedPages, setSelectedPages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalPages, setTotalPages] = useState(0)

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }

    setError('')
    setFile(selectedFile)

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pages = pdf.getPageCount()
      setTotalPages(pages)
      setEndPage(pages)
      setArrayBuffer(arrayBuffer)
      setSelectedPages([])
    } catch (err) {
      setError('Error reading PDF: ' + err.message)
      setFile(null)
    }
  }

  const splitPDF = async () => {
    if (!file) {
      setError('Please select a PDF file')
      return
    }

    if (startPage < 1 || endPage > totalPages || startPage > endPage) {
      setError(`Please enter valid page numbers between 1 and ${totalPages}`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      const newPdf = await PDFDocument.create()

      let indices = []
      if (selectedPages && selectedPages.length > 0) {
        // use selected page indices (already zero-based)
        indices = selectedPages.slice()
      } else {
        const total = pdf.getPageCount()
        const startIdx = Math.max(0, Number(startPage) - 1)
        const endIdx = Math.min(total, Number(endPage))
        for (let i = startIdx; i < endIdx; i++) indices.push(i)
      }

      if (indices.length === 0) {
        setError('No pages selected to split')
        setLoading(false)
        return
      }

      const copiedPages = await newPdf.copyPages(pdf, indices)
      for (const copiedPage of copiedPages) {
        newPdf.addPage(copiedPage)
      }

      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `split_${startPage}_${endPage}.pdf`
      link.click()
      
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Error splitting PDF: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <h1>Split PDF</h1>
      <p>Extract specific pages from a PDF document</p>

      {error && <div className="error-message">{error}</div>}

      <div className="upload-area">
        <div className="upload-icon">✂️</div>
        <div className="upload-text">Select a PDF file to split</div>
        <input
          type="file"
          id="fileInput"
          accept=".pdf"
          onChange={handleFileSelect}
        />
        <button
          className="btn btn-secondary"
          onClick={() => document.getElementById('fileInput').click()}
        >
          Choose File
        </button>
      </div>

      {file && totalPages > 0 && (
        <>
          <div className="file-item" style={{ marginTop: '2rem' }}>
            <div>
              <span className="file-name">{file.name}</span>
              <span className="file-size">({totalPages} pages)</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <strong>Preview & Select Pages</strong>
            <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>Click thumbnails to toggle selection — selected pages will be included in the output. If none selected, Start/End range will be used.</p>
            <PdfPreview
              arrayBuffer={arrayBuffer}
              selectedPages={selectedPages}
              onTogglePage={(idx) => {
                setSelectedPages(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx].sort((a,b)=>a-b))
              }}
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="startPage">
              Start Page: 
            </label>
            <input
              type="number"
              id="startPage"
              min="1"
              max={totalPages}
              value={startPage}
              onChange={(e) => setStartPage(Number(e.target.value) || 1)}
              style={{ marginLeft: '0.5rem', padding: '0.5rem', width: '100px' }}
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="endPage">
              End Page:
            </label>
            <input
              type="number"
              id="endPage"
              min="1"
              max={totalPages}
              value={endPage}
              onChange={(e) => setEndPage(Number(e.target.value) || totalPages)}
              style={{ marginLeft: '0.5rem', padding: '0.5rem', width: '100px' }}
            />
          </div>

          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={splitPDF}
              disabled={loading}
            >
              {loading ? 'Splitting...' : 'Split PDF'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFile(null)
                setTotalPages(0)
              }}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default SplitPDF
