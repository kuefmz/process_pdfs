# Roadmap & Limitations

## Current Version (v0.1.0)

### ✅ Implemented Features
- [x] Merge multiple PDFs
- [x] Split PDFs (extract pages)
- [x] Rotate PDF pages (90°, 180°, 270°)
- [x] Add signature (draw or type)
- [x] Responsive UI
- [x] Client-side processing (privacy)
- [x] Download results
- [x] Basic error handling

### ⚠️ Current Limitations

#### PDF Library Limitations
- No built-in digital signature support (image only)
- Limited metadata manipulation
- No font/text extraction
- No form filling
- No annotations editing
- No optical character recognition (OCR)

#### Performance
- Large files (>50MB) may slow down browser
- No async/worker thread processing
- Client-side memory constraints
- No chunked file uploads

#### Features
- No user accounts
- No file history
- No batch processing UI
- No drag-and-drop reordering (for merge)
- No page preview (split/rotate)

#### Deployment
- No backend database
- Signatures sent to backend but not embedded in PDF
- Limited scaling options
- No caching layer

---

## Planned Features (v0.2.0)

### High Priority
- [ ] PDF compression
- [ ] Watermark PDFs
- [ ] Convert images to PDF
- [ ] Extract PDF pages as images
- [ ] Page preview before download
- [ ] Drag-to-reorder pages for merge
- [ ] Better signature embedding

### Medium Priority
- [ ] PDF watermark text/image
- [ ] Crop pages
- [ ] Remove PDF password
- [ ] Reverse page order
- [ ] PDF metadata editor
- [ ] Extract text from PDF (basic)

### Low Priority
- [ ] OCR functionality
- [ ] Form filling
- [ ] Annotation tools
- [ ] PDF comparison
- [ ] Batch processing UI
- [ ] History/undo functionality

---

## Long-term Vision (v1.0.0+)

### Backend Improvements
- [ ] Proper PDF signature embedding (using signed certificates)
- [ ] Database for advanced features
- [ ] Job queue for large files
- [ ] File streaming (no memory limit)
- [ ] Image processing pipeline

### Frontend Improvements (Root-Level)
- [ ] Real-time PDF preview
- [ ] Page thumbnail gallery
- [ ] Advanced editing tools
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Multiple language support

### Infrastructure
- [ ] User authentication (optional)
- [ ] File sharing/collaboration
- [ ] API for developers
- [ ] Mobile apps (React Native)
- [ ] Desktop app (Electron)
- [ ] Automated testing suite
- [ ] Performance monitoring

### Monetization Options (Future)
- Cloud storage for logged-in users
- Premium features
- API access
- Enterprise support

---

## Known Issues

### 1. Signature Embedding
**Issue**: Signatures are drawn but not actually embedded in PDFs
**Status**: In progress
**Solution**: Need to use pdf-lib's annotation features or pdfkit

### 2. Large File Performance
**Issue**: Files >50MB cause browser lag
**Status**: Known limitation
**Solution**: Implement Web Workers or Wasm

### 3. Backend Stateless
**Issue**: Signature feature doesn't actually persist
**Status**: By design (privacy)
**Solution**: Add PDF manipulation library to backend

### 4. Mobile UI
**Issue**: Some features cramped on mobile
**Status**: Partially addressed
**Solution**: Improve responsive design

---

## Dependency Updates

Currently using:
- React 18.2.0
- Vite 5.0.0
- pdf-lib 1.17.1
- Express 4.18.2
- Node 18+

### Why These?
- **React 18**: Latest stable, hooks support
- **Vite**: Fast, modern build tool
- **pdf-lib**: Good browser PDF support
- **Express**: Simple, widely known

### Alternatives Considered
- **Next.js** instead of Vite (more overhead initially)
- **Nest.js** instead of Express (overkill for this)
- **pdfkit** (Node-only, for backend)
- **PyPDF2** (Python backend option)

---

## Contributing to Roadmap

Want to implement a feature? 
1. Check this roadmap
2. Check existing issues
3. Implement and test thoroughly
4. Submit PR with clear description
5. Maintainers will review and merge

---

## Getting Help

- 📖 Read [DEVELOPMENT.md](./DEVELOPMENT.md) for setup
- 🐛 Report bugs in Issues
- 💡 Suggest features in Discussions
- 📝 See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Version History

### v0.1.0 (Current)
- Initial release
- Core 4 features
- Basic backend API
- GitHub Pages deployment

### v0.0.1 (Prototype)
- Concept testing
- Basic React setup
- pdf-lib exploration

---

## Success Metrics

Current goals:
- [ ] 100+ GitHub stars
- [ ] First community contribution
- [ ] 10k+ monthly visits
- [ ] Deployed to production
- [ ] Stable API
- [ ] Comprehensive docs

---

## Questions or Ideas?

Open an issue with `[ROADMAP]` tag or start a discussion!
