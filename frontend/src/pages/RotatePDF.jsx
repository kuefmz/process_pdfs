import React, { useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import PagePreview from '../components/PagePreview'
import './Pages.css'

function RotatePDF() {
  const [file, setFile] = useState(null)
  const [rotation, setRotation] = useState(90)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [selectedPages, setSelectedPages] = useState([])
  const [arrayBuffer, setArrayBuffer] = useState(null)

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }

    setError('')
    setFile(selectedFile)
    setSelectedPages([])

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pageCount = pdf.getPageCount()
      setTotalPages(pageCount)
      setSelectedPages(Array.from({ length: pageCount }, (_, i) => i))
      setArrayBuffer(arrayBuffer)
    } catch (err) {
      setError('Error reading PDF: ' + err.message)
      setFile(null)
    }
  }

  const togglePage = (pageIndex) => {
    if (selectedPages.includes(pageIndex)) {
      setSelectedPages(selectedPages.filter(i => i !== pageIndex))
    } else {
      setSelectedPages([...selectedPages, pageIndex].sort((a, b) => a - b))
    }
  }

  const rotatePDF = async () => {
    if (!file || selectedPages.length === 0) {
      setError('Please select at least one page to rotate')
      return
    }

    setLoading(true)
    setError('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pages = pdf.getPages()

      selectedPages.forEach(pageIndex => {
        const page = pages[pageIndex]
        page.setRotation(degrees(page.getRotation().angle + rotation))
      })

      const pdfBytes = await pdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `rotated_${rotation}deg.pdf`
      link.click()
      
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Error rotating PDF: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <h1>Rotate PDF Pages</h1>
      <p>Rotate pages in your PDF document</p>

      {error && <div className="error-message">{error}</div>}

      <div className="upload-area">
        <div className="upload-icon">🔄</div>
        <div className="upload-text">Select a PDF file</div>
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
            <label htmlFor="rotation">Rotation Angle: </label>
            <select
              id="rotation"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
            >
              <option value={90}>90°</option>
              <option value={180}>180°</option>
              <option value={270}>270°</option>
            </select>

            <div style={{ marginTop: '1rem' }}>
              <strong>Preview & Select Pages</strong>
              <p style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>Click thumbnails to toggle which pages to rotate.</p>
              <PdfPreview
                arrayBuffer={arrayBuffer}
                selectedPages={selectedPages}
                onTogglePage={(idx) => {
                  setSelectedPages(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx].sort((a,b)=>a-b))
                }}
              />
            </div>
          </div>

          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={rotatePDF}
              disabled={loading}
            >
              {loading ? 'Rotating...' : 'Rotate Pages'}
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

export default RotatePDF
