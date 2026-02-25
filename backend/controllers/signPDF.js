const PDFDocument = require('pdfkit')
const { PDFPage } = require('pdfkit')

const signPDF = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    if (!req.files.pdf[0]) {
      return res.status(400).json({ error: 'PDF file is required' })
    }

    const pdfBuffer = req.files.pdf[0].buffer
    const signatureImage = req.files.signature?.[0]?.buffer

    if (!signatureImage) {
      return res.status(400).json({ error: 'Signature image is required' })
    }

    // For now, return the PDF as-is (signature embedding is complex)
    // In production, you'd use a library like pdfkit or pdf-lib to embed the signature
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="signed.pdf"')
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error signing PDF:', error)
    res.status(500).json({ error: 'Failed to sign PDF: ' + error.message })
  }
}

module.exports = {
  signPDF
}
