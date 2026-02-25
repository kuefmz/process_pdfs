import React, { useState, useRef } from 'react'
import axios from 'axios'
import PagePreview from '../components/PagePreview'
import './Pages.css'

function SignPDF() {
  const [file, setFile] = useState(null)
  const [arrayBuffer, setArrayBuffer] = useState(null)
  const [selectedPages, setSelectedPages] = useState([])
  const [signature, setSignature] = useState(null)
  const [signatureMode, setSignatureMode] = useState('draw')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }

    setError('')
    setFile(selectedFile)
    ;(async () => {
      try {
        const buf = await selectedFile.arrayBuffer()
        setArrayBuffer(buf)
        setSelectedPages([])
      } catch (err) {
        console.error(err)
      }
    })()
  }

  const handleSignatureUpload = (e) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) return

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please select a PNG or JPG image for signature')
      return
    }

    setError('')
    const reader = new FileReader()
    reader.onload = (event) => {
      setSignature({
        file: selectedFile,
        preview: event.target.result
      })
    }
    reader.readAsDataURL(selectedFile)
  }

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000'
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setSignature({
      file: null,
      preview: canvas.toDataURL('image/png')
    })
  }

  const handleTypeSignature = (e) => {
    const text = e.target.value
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '36px Cursive'
    ctx.fillStyle = '#000'
    ctx.fillText(text, 20, 50)
  }

  const signPDF = async () => {
    if (!file || !signature) {
      setError('Please upload PDF and create/select signature')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('pdf', file)
      if (selectedPages && selectedPages.length > 0) {
        formData.append('pages', JSON.stringify(selectedPages))
      }
      
      // If signature is from file upload, use the file; otherwise convert from canvas
      if (signature.file) {
        formData.append('signature', signature.file)
      } else {
        // Convert data URL to blob
        const response = await fetch(signature.preview)
        const blob = await response.blob()
        formData.append('signature', blob, 'signature.png')
      }

      const response = await axios.post('/api/sign', formData, {
        responseType: 'blob'
      })

      const blob = response.data
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'signed.pdf'
      link.click()
      
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Error signing PDF: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <h1>Sign PDF</h1>
      <p>Add your signature to a PDF document</p>

      {error && <div className="error-message">{error}</div>}

      <div style={{ marginBottom: '2rem' }}>
        <h3>Step 1: Upload PDF</h3>
        <div className="upload-area">
          <div className="upload-icon">✍️</div>
          <div className="upload-text">Select a PDF file to sign</div>
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
        {file && (
          <div className="file-item" style={{ marginTop: '1rem' }}>
            <span className="file-name">{file.name}</span>
          </div>
        )}
        {arrayBuffer && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Preview & Select Pages to Sign</strong>
            <p style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>Click thumbnails to toggle pages to sign.</p>
            <PdfPreview
              arrayBuffer={arrayBuffer}
              selectedPages={selectedPages}
              onTogglePage={(idx) => setSelectedPages(prev => prev.includes(idx) ? prev.filter(i=>i!==idx) : [...prev, idx].sort((a,b)=>a-b))}
            />
            <div style={{ marginTop: '0.5rem' }}>
              <small>Selected pages: {selectedPages.length > 0 ? selectedPages.map(p => p+1).join(', ') : 'none (will sign all)'}</small>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3>Step 2: Create or Upload Signature</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input
              type="radio"
              value="draw"
              checked={signatureMode === 'draw'}
              onChange={(e) => {
                setSignatureMode(e.target.value)
                clearCanvas()
                setSignature(null)
              }}
            />
            Draw Signature
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input
              type="radio"
              value="type"
              checked={signatureMode === 'type'}
              onChange={(e) => {
                setSignatureMode(e.target.value)
                clearCanvas()
                setSignature(null)
              }}
            />
            Type Signature
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input
              type="radio"
              value="upload"
              checked={signatureMode === 'upload'}
              onChange={(e) => {
                setSignatureMode(e.target.value)
                setSignature(null)
              }}
            />
            Upload PNG/JPG
          </label>
        </div>

        {signatureMode === 'draw' ? (
          <>
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{
                border: '2px solid #ccc',
                borderRadius: '4px',
                cursor: 'crosshair',
                display: 'block',
                marginBottom: '1rem',
                backgroundColor: '#fff'
              }}
            />
            <button
              className="btn btn-secondary"
              onClick={clearCanvas}
              style={{ marginRight: '0.5rem' }}
            >
              Clear
            </button>
            <button
              className="btn btn-primary"
              onClick={saveSignature}
            >
              Save Signature
            </button>
          </>
        ) : signatureMode === 'type' ? (
          <>
            <input
              type="text"
              placeholder="Type your signature"
              onChange={handleTypeSignature}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                border: '2px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              style={{
                border: '2px solid #ccc',
                borderRadius: '4px',
                display: 'block',
                marginBottom: '1rem',
                backgroundColor: '#fff'
              }}
            />
            <button
              className="btn btn-primary"
              onClick={saveSignature}
            >
              Save Signature
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="signatureImage">Select PNG or JPG image: </label>
            </div>
            <div className="upload-area">
              <div className="upload-icon">🖼️</div>
              <div className="upload-text">Select a signature image</div>
              <input
                type="file"
                id="signatureImage"
                accept=".png,.jpg,.jpeg"
                onChange={handleSignatureUpload}
              />
              <button
                className="btn btn-secondary"
                onClick={() => document.getElementById('signatureImage').click()}
              >
                Choose Image
              </button>
            </div>
            {signature && signature.preview && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <img
                  src={signature.preview}
                  alt="Signature preview"
                  style={{
                    maxWidth: '400px',
                    maxHeight: '150px',
                    border: '2px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {file && signature && (
        <div className="btn-group" style={{ marginTop: '2rem' }}>
          <button
            className="btn btn-primary"
            onClick={signPDF}
            disabled={loading}
          >
            {loading ? 'Signing...' : 'Sign PDF'}
          </button>
        </div>
      )}
    </div>
  )
}

export default SignPDF
