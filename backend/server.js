require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const signPDFController = require('./controllers/signPDF')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Multer configuration for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'image/png') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF and PNG files are allowed'), false)
    }
  }
})

// Routes
app.post('/api/sign', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), signPDFController.signPDF)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: err.message || 'Internal server error'
  })
})

app.listen(PORT, () => {
  console.log(`PDF Processor Backend running on http://localhost:${PORT}`)
})
