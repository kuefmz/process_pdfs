# Development Guide (Frontend Only)

## Project Overview

This is a React + Vite application for client-side PDF processing. All features work in the browser—no backend or Docker required.

## Directory Structure
```
process_pdfs/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

## State Management
- Uses React hooks for local state
- No global state manager (Redux, Zustand, etc.)

## PDF Libraries Used
- **pdf-lib**: Client-side PDF manipulation
- **pdfjs-dist**: PDF viewing/preview

## Styling
- CSS modules in `src/pages/Pages.css`
- Responsive grid layouts
- Mobile-first design
- Flexbox for layouts

## Adding New Features
- Add a new page/component in `src/pages/`
- Use `pdf-lib` for PDF manipulation
- Update navigation/UI as needed

## Development Workflow

1. **Clone project**
   ```bash
   git clone https://github.com/kuefmz/process_pdfs.git
   cd process_pdfs
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run locally**
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```
4. **Build for production**
   ```bash
   npm run build
   # Output in dist/
   ```

---

## (Optional) Backend
The backend (Python/Flask) is included for future/advanced use, but is not required for normal usage or deployment.
