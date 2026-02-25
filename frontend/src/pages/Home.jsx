import React, { useState, useRef, useEffect } from 'react'
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import './Pages.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'

const CANVAS_MAX_W = 1600
const CANVAS_MAX_H = 2000

let _ovId = 0
const newId = () => `ov-${Date.now()}-${++_ovId}`

function Home() {
  const [files, setFiles] = useState([])
  const [pages, setPages] = useState([]) // { id, fileId, pageIndex, rotate }
  const [signature, setSignature] = useState({ file: null, preview: null })
  const [error, setError] = useState('')
  const [draggedPageId, setDraggedPageId] = useState(null)
  const [hoveredPageIdx, setHoveredPageIdx] = useState(null)
  const [tool, setTool] = useState(null) // null | 'signature' | 'text'
  const [overlays, setOverlays] = useState({}) // { pageId: [{id, type, x, y, text?, fontSize?, sigScale?}] }
  const [textSize] = useState(14)
  const [sigScale] = useState(0.18) // fraction of page width — initial size for new overlays
  const [outputFilename, setOutputFilename] = useState('output')

  const canvasRefs = useRef({})
  const wrapperRefs = useRef({})
  const viewportsRef = useRef({}) // { pageId: pdfjsViewport }
  const fileInputRef = useRef(null)
  const sigInputRef = useRef(null)
  const pdfDocCacheRef = useRef({})
  const renderKeyRef = useRef({}) // { pageId: 'fileId-pageIndex-rotate' }

  // ── File upload ─────────────────────────────────────────────────────────────
  const handleFiles = async (ev) => {
    const arr = Array.from(ev.target.files || [])
    for (const f of arr) {
      try {
        const buffer = await f.arrayBuffer()
        const pdf = await PDFDocument.load(buffer)
        const pageCount = pdf.getPageCount()
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        setFiles(prev => [...prev, { id, file: f, previewBuffer: buffer, pageCount }])
        setPages(prev => [
          ...prev,
          ...Array.from({ length: pageCount }, (_, i) => ({
            id: `${id}-${i}`,
            fileId: id,
            pageIndex: i,
            rotate: 0,
          })),
        ])
      } catch (err) {
        setError(`Error loading ${f.name}: ${err.message}`)
      }
    }
    ev.target.value = ''
  }

  // ── Signature upload ────────────────────────────────────────────────────────
  const handleSignatureUpload = (ev) => {
    const f = ev.target?.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (e) => setSignature({ file: f, preview: e.target.result })
    reader.readAsDataURL(f)
    ev.target.value = ''
  }

  // ── PDF rendering ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    const renderPage = async (pageObj) => {
      const { id: pageId, fileId, pageIndex, rotate } = pageObj
      const key = `${fileId}-${pageIndex}-${rotate}`
      if (renderKeyRef.current[pageId] === key) return

      const canvas = canvasRefs.current[pageId]
      if (!canvas) return

      const fileObj = files.find(f => f.id === fileId)
      if (!fileObj) return

      try {
        let pdfDoc = pdfDocCacheRef.current[fileId]
        if (!pdfDoc) {
          const data = new Uint8Array(fileObj.previewBuffer)
          pdfDoc = await pdfjsLib.getDocument({ data }).promise
          if (cancelled) return
          pdfDocCacheRef.current[fileId] = pdfDoc
        }

        const page = await pdfDoc.getPage(pageIndex + 1)
        if (cancelled) return

        // Total rotation: intrinsic + user rotation
        const intrinsic = page.rotate || 0
        const totalRot = (intrinsic + rotate + 360) % 360

        // Scale to fit the page-card's inner width. Read from the card (wrapper's
        // parent) rather than the wrapper itself — the wrapper has an inline style
        // set after every render which would cause the measured width to shrink on
        // each subsequent rotation.
        const vp0 = page.getViewport({ scale: 1, rotation: totalRot })
        const wrapperEl = wrapperRefs.current[pageId]
        const cardEl = wrapperEl?.parentElement
        const availCssW = cardEl ? Math.max(100, cardEl.clientWidth - 22) : CANVAS_MAX_W
        let scale = Math.min(availCssW, CANVAS_MAX_W) / vp0.width
        // clamp height so very tall pages don't overflow the viewport
        if (vp0.height * scale > CANVAS_MAX_H) {
          scale = CANVAS_MAX_H / vp0.height
        }
        const viewport = page.getViewport({ scale, rotation: totalRot })

        const dpr = window.devicePixelRatio || 1
        // canvas.width/height are device pixels; style width/height are CSS pixels (viewport.width)
        canvas.width = Math.round(viewport.width * dpr)
        canvas.height = Math.round(viewport.height * dpr)
        canvas.style.width = `${Math.round(viewport.width)}px`
        canvas.style.height = `${Math.round(viewport.height)}px`
        const wrapper = wrapperRefs.current[pageId]
        if (wrapper) {
          // set wrapper CSS size to viewport CSS pixels (not DPR-scaled)
          wrapper.style.width = `${Math.round(viewport.width)}px`
          wrapper.style.height = `${Math.round(viewport.height)}px`
        }

        const ctx = canvas.getContext('2d')
        // scale drawing so PDF renders crisply on high-DPR displays
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, viewport.width, viewport.height)

        await page.render({ canvasContext: ctx, viewport }).promise

        if (!cancelled) {
          viewportsRef.current[pageId] = viewport
          renderKeyRef.current[pageId] = key
        }
      } catch (err) {
        console.error('Render error:', err)
      }
    }

    const renderAll = async () => {
      for (const p of pages) {
        if (cancelled) break
        const key = `${p.fileId}-${p.pageIndex}-${p.rotate}`
        if (renderKeyRef.current[p.id] !== key) {
          await renderPage(p)
          if (!cancelled) await new Promise(r => setTimeout(r, 20))
        }
      }
    }

    renderAll()
    return () => { cancelled = true }
  }, [files, pages])

  // ── Page operations ─────────────────────────────────────────────────────────
  const rotatePage = (pageId, delta) => {
    // Transform overlay positions so they stay on the same spot after rotation.
    // Read current canvas CSS dimensions (pre-rotation) to compute the transform.
    const canvas = canvasRefs.current[pageId]
    const W = canvas ? canvas.clientWidth : 0
    const H = canvas ? canvas.clientHeight : 0
    if (W > 0 && H > 0) {
      setOverlays(prev => {
        const pageOvs = prev[pageId]
        if (!pageOvs || pageOvs.length === 0) return prev
        const transformed = pageOvs.map(ov => {
          // Work in normalised [0,1] space so the transform is independent of
          // the canvas scale.  After a ±90° rotation the canvas keeps the same
          // CSS width (W) but its height changes to W²/H because the page
          // aspect ratio flips and the renderer re-scales to fill the width.
          //
          // Normalised transforms (y=0 at top):
          //   CW  (+90°): (xn, yn) → (1−yn, xn)
          //   CCW (−90°): (xn, yn) → (yn,   1−xn)
          //   180°:       (xn, yn) → (1−xn, 1−yn)  (canvas dims unchanged)
          const xn = ov.x / W
          const yn = ov.y / H
          let nx, ny
          if (delta === 90 || delta === -270) {
            // CW — new canvas: W × (W²/H)
            nx = (1 - yn) * W
            ny = xn * (W * W / H)
          } else if (delta === -90 || delta === 270) {
            // CCW — new canvas: W × (W²/H)
            nx = yn * W
            ny = (1 - xn) * (W * W / H)
          } else {
            // 180° — canvas stays W × H
            nx = (1 - xn) * W
            ny = (1 - yn) * H
          }
          const newRotate = ((ov.rotate || 0) + delta + 360) % 360
          return { ...ov, x: nx, y: ny, rotate: newRotate }
        })
        return { ...prev, [pageId]: transformed }
      })
    }
    setPages(prev => prev.map(p =>
      p.id === pageId ? { ...p, rotate: ((p.rotate + delta) % 360 + 360) % 360 } : p
    ))
  }

  const deletePage = (pageId) => {
    setPages(prev => prev.filter(p => p.id !== pageId))
    setOverlays(prev => { const n = { ...prev }; delete n[pageId]; return n })
  }

  const movePage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= pages.length) return
    setPages(prev => {
      const arr = [...prev]
      const [item] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, item)
      return arr
    })
  }

  // ── Drag & drop pages ───────────────────────────────────────────────────────
  const onDragStart = (e, pageId) => {
    setDraggedPageId(pageId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setHoveredPageIdx(idx)
  }

  const onDrop = (e, toIdx) => {
    e.preventDefault()
    if (!draggedPageId) return
    const fromIdx = pages.findIndex(p => p.id === draggedPageId)
    if (fromIdx !== -1) movePage(fromIdx, toIdx)
    setDraggedPageId(null)
    setHoveredPageIdx(null)
  }

  // ── Overlay CRUD ────────────────────────────────────────────────────────────
  const addOverlay = (pageId, x, y, type) => {
    const id = newId()
    const canvas = canvasRefs.current[pageId]
    const cw = canvas ? (canvas.clientWidth || canvas.width) : 200
    const w = type === 'signature' ? Math.round(cw * sigScale) : 140
    const base = type === 'signature' ? { sigScale, w } : { fontSize: textSize, w }
    setOverlays(prev => ({
      ...prev,
      [pageId]: [...(prev[pageId] || []), { id, type, x, y, text: '', ...base }],
    }))
    return id
  }

  const removeOverlay = (pageId, overlayId) => {
    setOverlays(prev => ({
      ...prev,
      [pageId]: (prev[pageId] || []).filter(o => o.id !== overlayId),
    }))
  }

  const updateOverlay = (pageId, overlayId, updates) => {
    setOverlays(prev => ({
      ...prev,
      [pageId]: (prev[pageId] || []).map(o =>
        o.id === overlayId ? { ...o, ...updates } : o
      ),
    }))
  }

  // ── Overlay resize ───────────────────────────────────────────────────────────
  const startResizeDrag = (e, pageId, overlayId, corner) => {
    e.stopPropagation()
    e.preventDefault()
    const startMX = e.clientX
    const ov = (overlays[pageId] || []).find(o => o.id === overlayId)
    if (!ov) return
    const canvas = canvasRefs.current[pageId]
    const cw = canvas ? (canvas.clientWidth || canvas.width) : 200
    const startW = ov.w || (ov.type === 'signature' ? Math.round(cw * (ov.sigScale || sigScale)) : 140)
    const startFontSize = ov.fontSize || textSize
    // dragging left (nw/sw) should increase size
    const signX = (corner === 'nw' || corner === 'sw') ? -1 : 1

    const onMove = (me) => {
      const newW = Math.max(20, startW + (me.clientX - startMX) * signX)
      const updates = { w: newW }
      if (ov.type === 'signature') {
        updates.sigScale = newW / cw
      } else {
        updates.fontSize = Math.max(6, Math.round(startFontSize * (newW / startW)))
      }
      updateOverlay(pageId, overlayId, updates)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Overlay drag ─────────────────────────────────────────────────────────────
  const startOverlayDrag = (e, pageId, overlayId) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.classList.contains('resize-handle')) return
    e.stopPropagation()
    e.preventDefault()

    const startMX = e.clientX
    const startMY = e.clientY
    const ov = (overlays[pageId] || []).find(o => o.id === overlayId)
    if (!ov) return
    const startX = ov.x
    const startY = ov.y

    const onMove = (me) => {
      const canvas = canvasRefs.current[pageId]
      const w = canvas ? canvas.clientWidth : CANVAS_MAX_W
      const h = canvas ? canvas.clientHeight : CANVAS_MAX_H
      updateOverlay(pageId, overlayId, {
        x: Math.max(0, Math.min(w, startX + (me.clientX - startMX))),
        y: Math.max(0, Math.min(h, startY + (me.clientY - startMY))),
      })
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Canvas wrapper click → add overlay ──────────────────────────────────────
  const onWrapperClick = (e, pageId) => {
    if (!tool) return
    if (e.target.closest('.overlay-item')) return
    const wrapper = wrapperRefs.current[pageId]
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (tool === 'signature') {
      if (!signature.preview) return
      addOverlay(pageId, x, y, 'signature')
    } else if (tool === 'text') {
      addOverlay(pageId, x, y, 'text')
    }
  }

  // ── Export ───────────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    if (pages.length === 0) { setError('No pages to export'); return }
    setError('')
    try {
      const newPdf = await PDFDocument.create()
      const font = await newPdf.embedFont(StandardFonts.Helvetica)

      // Embed signature once
      let embeddedSig = null
      const needsSig = Object.values(overlays).some(ovs => ovs.some(o => o.type === 'signature'))
      if (needsSig && signature.preview) {
        const res = await fetch(signature.preview)
        const rawBytes = await res.arrayBuffer()
        // Pre-copy the buffer before any embed attempt: pdf-lib may detach the
        // ArrayBuffer internally when parsing fails, making reuse impossible.
        const bytesForPng = rawBytes.slice(0)
        const bytesForJpg = rawBytes.slice(0)
        try { embeddedSig = await newPdf.embedPng(bytesForPng) }
        catch { try { embeddedSig = await newPdf.embedJpg(bytesForJpg) } catch {} }
      }

      for (const p of pages) {
        const fileObj = files.find(f => f.id === p.fileId)
        if (!fileObj) continue

        // load a fresh ArrayBuffer from the original File to avoid detached buffers
        const srcBuffer = await fileObj.file.arrayBuffer()
        const srcPdf = await PDFDocument.load(srcBuffer)
        const [copied] = await newPdf.copyPages(srcPdf, [p.pageIndex])
        newPdf.addPage(copied)
        const pdfPage = newPdf.getPages()[newPdf.getPageCount() - 1]

        if (p.rotate) {
          const existing = pdfPage.getRotation().angle
          pdfPage.setRotation(degrees((existing + p.rotate) % 360))
        }

        const pageOvs = overlays[p.id] || []
        if (pageOvs.length === 0) continue

        const viewport = viewportsRef.current[p.id]
        const pageW = pdfPage.getWidth()
        const pageH = pdfPage.getHeight()
        const canvasEl = canvasRefs.current[p.id]

        for (const ov of pageOvs) {
          let pdfX, pdfY
          if (viewport && typeof viewport.convertToPdfPoint === 'function') {
            ;[pdfX, pdfY] = viewport.convertToPdfPoint(ov.x, ov.y)
          } else if (canvasEl) {
            // map from displayed CSS pixels to PDF points using clientWidth/Height
            const cw = canvasEl.clientWidth || canvasEl.width
            const ch = canvasEl.clientHeight || canvasEl.height
            pdfX = (ov.x / cw) * pageW
            pdfY = pageH - (ov.y / ch) * pageH
          } else {
            pdfX = 50; pdfY = 50
          }

          if (ov.type === 'signature' && embeddedSig) {
            const scale = typeof ov.sigScale === 'number' ? ov.sigScale : sigScale
            const sigW = pageW * scale
            const sigH = sigW * (embeddedSig.height / embeddedSig.width)
            pdfPage.drawImage(embeddedSig, {
              x: pdfX - sigW / 2,
              y: pdfY - sigH / 2,
              width: sigW,
              height: sigH,
              opacity: 0.9,
            })
          } else if (ov.type === 'text' && ov.text) {
            const fontSize = ov.fontSize || 12
            pdfPage.drawText(ov.text, {
              x: pdfX,
              y: pdfY,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            })
          }
        }
      }

      const bytes = await newPdf.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fname = outputFilename.trim() || 'output'
      a.download = fname.endsWith('.pdf') ? fname : `${fname}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError(`Export error: ${err.message}`)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="workspace-container">
      {/* Header */}
      <div className="header-bar">
        {error && <div className="error-message" style={{ flex: 1 }}>{error}</div>}
        <button className="btn btn-primary" onClick={exportPDF}>⬇ Export PDF</button>
      </div>

      <div className="main-content">
        {/* Left sidebar */}
        <div className="sidebar-left">
          <div className="sidebar-section">
            <div className="sidebar-label">Actions</div>
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
              📄 Upload PDF(s)
            </button>
            <input ref={fileInputRef} type="file" multiple accept=".pdf" onChange={handleFiles} style={{ display: 'none' }} />

            <button className="btn btn-secondary" onClick={() => sigInputRef.current?.click()}>
              🖊 Upload signature PNG
            </button>
            <input ref={sigInputRef} type="file" accept=".png,.jpg,.jpeg" onChange={handleSignatureUpload} style={{ display: 'none' }} />
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Tools</div>
            {signature.preview && (
              <button
                className={`tool-btn${tool === 'signature' ? ' active' : ''}`}
                onClick={() => setTool(t => t === 'signature' ? null : 'signature')}
              >
                ✍ Add Signature
              </button>
            )}
            <button
              className={`tool-btn${tool === 'text' ? ' active' : ''}`}
              onClick={() => setTool(t => t === 'text' ? null : 'text')}
            >
              Add Text
            </button>
            {tool && (
              <div className="tool-hint">
                Click on a page to place {tool === 'signature' ? 'signature' : 'text'}
              </div>
            )}
          </div>

          {signature.preview && (
            <div className="signature-panel">
              <div className="sidebar-label">Signature</div>
              <div className="signature-preview">
                <img src={signature.preview} alt="signature" />
              </div>
            </div>
          )}
        </div>

        {/* Center area */}
        <div className="center-area">
          <h2 style={{ marginTop: 0, marginBottom: 12 }}>Pages</h2>
          <div className="pages-grid">
            {pages.map((p, idx) => {
              const fileObj = files.find(f => f.id === p.fileId)
              const isDragOver = hoveredPageIdx === idx
              const pageOvs = overlays[p.id] || []
              return (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, p.id)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragLeave={() => setHoveredPageIdx(null)}
                  onDrop={(e) => onDrop(e, idx)}
                  className={`page-card${draggedPageId === p.id ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}`}
                >
                  <div className="page-header">
                    {fileObj?.file.name} • Page {p.pageIndex + 1}
                  </div>

                  {/* Canvas + overlays */}
                  <div
                    ref={el => wrapperRefs.current[p.id] = el}
                    className={`page-canvas-wrapper${tool ? ' tool-active' : ''}`}
                    onClick={(e) => onWrapperClick(e, p.id)}
                  >
                    <canvas
                      ref={el => canvasRefs.current[p.id] = el}
                      className="page-canvas"
                    />
                    {pageOvs.map(ov => {
                      const canvas = canvasRefs.current[p.id]
                      const cw = canvas ? (canvas.clientWidth || canvas.width) : 200
                      const overlayW = ov.w || (ov.type === 'signature'
                        ? Math.round(cw * (ov.sigScale || sigScale))
                        : 140)
                      return (
                        <div
                          key={ov.id}
                          className={`overlay-item ${ov.type === 'signature' ? 'sig-overlay' : 'text-overlay'}`}
                          style={{
                            left: ov.x,
                            top: ov.y,
                            transform: ov.type === 'signature' ? 'translate(-50%, -50%)' : 'translate(0, -50%)',
                          }}
                          onMouseDown={(e) => startOverlayDrag(e, p.id, ov.id)}
                        >
                          <div className="overlay-content" style={{ width: overlayW, transform: ov.rotate ? `rotate(${ov.rotate}deg)` : undefined }}>
                            {ov.type === 'signature' ? (
                              <img
                                src={signature.preview}
                                alt="sig"
                                draggable={false}
                              />
                            ) : (
                              <input
                                className="text-overlay-input"
                                value={ov.text}
                                autoFocus={ov.text === ''}
                                placeholder="Type text…"
                                onChange={(e) => updateOverlay(p.id, ov.id, { text: e.target.value })}
                                onMouseDown={(e) => e.stopPropagation()}
                                style={{ fontSize: (ov.fontSize || textSize) }}
                              />
                            )}
                            {['nw', 'ne', 'sw', 'se'].map(corner => (
                              <div
                                key={corner}
                                className={`resize-handle ${corner}`}
                                onMouseDown={(e) => { e.stopPropagation(); startResizeDrag(e, p.id, ov.id, corner) }}
                              />
                            ))}
                          </div>
                          <button
                            className="overlay-delete"
                            onClick={(e) => { e.stopPropagation(); removeOverlay(p.id, ov.id) }}
                            title="Remove"
                          >×</button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Controls */}
                  <div className="page-controls">
                    <button onClick={() => rotatePage(p.id, -90)}>↶ Rotate</button>
                    <button onClick={() => rotatePage(p.id, 90)}>↷ Rotate</button>
                  </div>
                  <div className="page-controls">
                    <button onClick={() => movePage(idx, idx - 1)} disabled={idx === 0}>
                      Move ← Prev
                    </button>
                    <button onClick={() => movePage(idx, idx + 1)} disabled={idx >= pages.length - 1}>
                      Move Next →
                    </button>
                  </div>
                  <div className="page-controls">
                    <button className="delete-btn" onClick={() => deletePage(p.id)}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="sidebar-right">
          <div className="sidebar-section" style={{ marginBottom: 16 }}>
            <div className="sidebar-label">Output filename</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                placeholder="output"
                style={{ flex: 1, padding: '5px 7px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4, minWidth: 0 }}
              />
              <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>.pdf</span>
            </div>
          </div>
          <div className="sidebar-label">Uploaded Files</div>
          <div className="files-list">
            {files.map(f => (
              <div key={f.id} className="file-item">
                <div className="file-name">{f.file.name}</div>
                <div className="file-pages">{f.pageCount} pages</div>
              </div>
            ))}
            {files.length === 0 && (
              <div style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '20px 0' }}>
                No files uploaded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
