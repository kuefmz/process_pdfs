# PDF Processor

A simple, privacy-focused PDF processing web application with no file storage. Similar to SmallPDF but with core features for personal use.

## Features

- **Merge PDFs**: Combine multiple PDF files into one
- **Split PDFs**: Extract specific pages from a PDF
- **Rotate Pages**: Rotate PDF pages (90°, 180°, 270°)
- **Add Signature**: Sign your PDF documents (draw, type, or upload PNG/JPG)

## Privacy

Your PDF files are processed entirely on your device or in-memory on the backend. We never store or upload your files to persistent storage.

## Project Structure

```
process_pdfs/
├── frontend/          # React + Vite application
├── backend/           # Flask API (Poetry-managed)
└── docs and configs
```

## Backend Notes

- Uses **Flask** and **Poetry** for dependency & virtualenv management.
- Uses **pypdf** for PDF reading/writing (replaces PyPDF2).
- Use `poetry install` in `backend/` to create the venv and install dependencies.

## Getting Started

See [SETUP.md](./SETUP.md) and [DEVELOPMENT.md](./DEVELOPMENT.md) for full setup and run instructions.
