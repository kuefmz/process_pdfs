# PDF Processor

A simple, privacy-focused PDF processing web application. All PDF processing is done client-side in your browser—no files are uploaded or stored.

## Features

- **Merge PDFs**: Combine multiple PDF files into one
- **Split PDFs**: Extract specific pages from a PDF
- **Rotate Pages**: Rotate PDF pages (90°, 180°, 270°)
- **Add Signature**: Sign your PDF documents (draw, type, or upload PNG/JPG)

## Privacy

Your PDF files are processed entirely in your browser. No files are uploaded or stored on any server.

## Project Structure

```
process_pdfs/
├── src/                # React app source code
├── public/             # Static assets
├── index.html          # App entry point
├── package.json        # Project config
├── vite.config.js      # Vite config
├── ...                # Other config/docs
```

## Deployment

- The default deployment is static (frontend-only) and works on GitHub Pages or any static host.
- The backend (Flask) is included for future/advanced use, but is not required or used for the default deployment.

## Getting Started

See [SETUP.md](./SETUP.md) and [DEVELOPMENT.md](./DEVELOPMENT.md) for setup and run instructions.
