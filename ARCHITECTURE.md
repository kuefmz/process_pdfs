# PDF Processor Architecture

## Overview

This project is a static, frontend-only PDF processing application by default. All PDF processing happens in the browser for privacy and simplicity. An optional backend is included for advanced use, but is not required for normal operation or deployment.

## System Architecture (Default: Frontend Only)

```
┌─────────────────────┐
│   User Browser      │
└──────────┬──────────┘
           │ 
    ┌──────▼──────────┐
    │  React + Vite   │
    │   (Frontend)    │
    │                 │
    ├─────────────────┤
    │ • Merge         │
    │ • Split         │
    │ • Rotate        │
    │ • Draw Sign.    │
    └─────────────────┘
           │
           │ All processing happens in-memory
           │ No files stored permanently
           │
    ┌──────▼──────────────┐
    │ pdf-lib (client)    │
    │ pdfjs-dist (view)   │
    └─────────────────────┘
```

## Frontend (React + Vite)

### Technology Stack
- **React 18**: UI framework
- **Vite**: Build tool & dev server
- **pdf-lib**: Client-side PDF manipulation
- **pdfjs-dist**: PDF viewing
- **React Router**: Page navigation
- **Axios**: HTTP client

### Key Components

1. **Navigation.jsx** - Top navigation bar
2. **Home.jsx** - Landing page with feature cards
3. **MergePDF.jsx** - Merge multiple PDFs
4. **SplitPDF.jsx** - Extract pages from PDF
5. **RotatePDF.jsx** - Rotate PDF pages
6. **SignPDF.jsx** - Add signature to PDF

### Client-Side Processing

Most operations happen client-side for speed and privacy:
- Merging PDFs ✅
- Splitting PDFs ✅
- Rotating pages ✅
- Drawing signature ✅
- Typing signature ✅

### Current Limitations

- Large files (>50MB) may be slow to process
- Some advanced PDF features not available
- No digital certificates (only image signatures)

## Backend (Python + Flask)

### Technology Stack
- **Flask**: Lightweight web framework
- **Flask-CORS**: Cross-origin request handling
- **PyPDF2**: PDF manipulation
- **Pillow**: Image processing
- **Werkzeug**: WSGI utilities
- **python-dotenv**: Environment configuration

### API Endpoints

```
POST /api/sign
  - Purpose: Sign PDF with image signature
  - Payload: FormData { pdf, signature }
  - Response: PDF file (download)

GET /api/health
  - Purpose: Server health check
  - Response: { status: "OK" }
```

### File Processing Flow

```
User uploads PDF + Signature
    ↓
Werkzeug stores in memory
    ↓
Flask handler validates files
    ↓
Process PDF (PyPDF2)
    ↓
Send response as file download
    ↓
Request ends, memory freed
```

## Data Flow

### Merge PDFs (Client-Side)
```
User selects PDFs
    ↓
pdf-lib loads all PDFs into memory
    ↓
Iterates through pages and copies
    ↓
Generates new merged PDF
    ↓
Creates blob and triggers download
```

### Sign PDF (Mixed)
```
User uploads PDF and creates signature
    ↓
Frontend creates FormData
    ↓
POST to /api/sign
    ↓
Backend receives files in memory
    ↓
Processes and returns PDF
    ↓
Frontend triggers download
```

## Security Considerations

### Implemented
✅ No file persistence (in-memory only)
✅ File size limits (50MB)
✅ File type validation
✅ CORS protection (configurable)
✅ No user data collection

### Future Enhancements
- Rate limiting
- Request validation/sanitization
- File encryption during transit
- Digital signatures (not just image)
- Authentication (optional)

## Deployment Architectures

### Option 1: GitHub Pages + Vercel (Recommended)
```
GitHub Pages (Frontend) ──→ Vercel (Backend)
```

### Option 2: GitHub Pages + Railway
```
GitHub Pages (Frontend) ──→ Railway (Backend)
```

### Option 3: Self-Hosted
```
Your Server (Frontend) ──→ Your Server (Backend)
```

## Performance Considerations

### Frontend
- Vite provides fast HMR (Hot Module Replacement)
- pdf-lib is efficient for most operations
- Large files may cause UI lag (client-side processing)

### Backend
- Minimal processing keeps response time low
- In-memory file handling is fast but memory-intensive
- Currently stateless (no sessions/databases)

## Scalability

### Current Design
- Stateless backend (easy to scale horizontally)
- No database (fast, but no persistence)
- In-memory processing (memory constraints)

### If You Need to Scale
1. Add job queue (Bull, RabbitMQ)
2. Add file storage (S3, local disk)
3. Add database for history/analytics
4. Implement authentication
5. Add rate limiting
6. Use CDN for frontend

## Environment Configuration

### Frontend
```
// vite.config.js
base: '/process_pdfs/' // For GitHub Pages in subdirectory
```

### Backend
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Testing Strategy (Future)

```
Frontend Tests:
  - Unit tests (React components)
  - Integration tests (routing, API calls)
  - E2E tests (full workflows)

Backend Tests:
  - Unit tests (controllers)
  - Integration tests (API endpoints)
  - File handling tests
```

## Monitoring & Logging (Future)

- Winston/Morgan for logging
- Sentry for error tracking
- metrics for performance
- Uptime monitoring

## Version History

### v0.1.0 (Initial Release)
- Core features: Merge, Split, Rotate
- Basic signature support
- Frontend + Backend separation
