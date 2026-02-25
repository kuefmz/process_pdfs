# Development Guide

## Project Overview

This is a monorepo with two separate applications:
- **Frontend**: React + Vite (Client-side PDF processing)
- **Backend**: Node.js + Express (Server-side PDF operations)

## Frontend Architecture

### Directory Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx      # Main navigation bar
│   │   └── Navigation.css
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── MergePDF.jsx        # Merge multiple PDFs
│   │   ├── SplitPDF.jsx        # Extract pages
│   │   ├── RotatePDF.jsx       # Rotate pages
│   │   ├── SignPDF.jsx         # Add signature
│   │   └── Pages.css           # Shared styles
│   ├── App.jsx                 # Main app component
│   ├── App.css
│   ├── index.css               # Global styles
│   └── main.jsx                # Entry point
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

### State Management

Currently using React hooks for local state:
- Each page component manages its own state
- No global state manager (Redux, Zustand, etc.)
- Could be added later if needed

### PDF Libraries Used

1. **pdf-lib**: Client-side PDF manipulation
   - Used for: Merge, Split, Rotate
   - Pros: Pure JavaScript, works in browser
   - Cons: Limited advanced features

2. **pdfjs-dist**: PDF viewing (future)
   - For preview functionality
   - Currently imported but not fully used

### Styling Approach

- CSS modules in `Pages.css`
- Responsive grid layouts
- Mobile-first design
- Flexbox for layouts

### Adding New Features

To add a new PDF feature:

1. **Create page component**
   ```
   frontend/src/pages/MyFeature.jsx
   ```

2. **Add routing**
   ```javascript
   // App.jsx
   import MyFeature from './pages/MyFeature'
   
   <Route path="/my-feature" element={<MyFeature />} />
   ```

3. **Add navigation link**
   ```javascript
   // Navigation.jsx
   <Link to="/my-feature">My Feature</Link>
   ```

4. **Use pdf-lib or make API call**
   ```javascript
   import { PDFDocument } from 'pdf-lib'
   
   // Or for backend processing
   axios.post('/api/my-feature', formData)
   ```

## Backend Architecture

### Directory Structure
```
backend/
├── app.py                  # Main Flask application
├── config.py               # Configuration settings
├── utils.py                # Utility functions
├── requirements.txt        # Python dependencies
├── .env.example            # Environment template
├── .gitignore
```

### Technology Stack
- **Flask**: Lightweight web framework
- **Flask-CORS**: Cross-origin request handling
- **PyPDF2**: PDF manipulation
- **Pillow**: Image processing
- **python-dotenv**: Environment variable management

### Request Flow

```
HTTP Request
    ↓
Flask Route Handler
    ↓
CORS Middleware
    ↓
Request Handler (validate files)
    ↓
PDF Processing (utils)
    ↓
Response (JSON or file)
```

### Adding New API Endpoints

1. **Create utility function**
   ```python
   # backend/utils.py
   def process_something(file_bytes):
       # Logic here
       return result
   ```

2. **Add route**
   ```python
   # backend/app.py
   @app.route('/api/my-endpoint', methods=['POST'])
   def my_endpoint():
       try:
           file = request.files['file']
           result = process_something(file.read())
           return jsonify({'success': True, 'data': result})
       except Exception as e:
           return jsonify({'error': str(e)}), 500
   ```

3. **Call from frontend**
   ```javascript
   const response = await axios.post('/api/my-endpoint', formData)
   ```

### Error Handling

Flask uses try-except blocks:
```python
try:
    # Process
    return jsonify({'success': True})
except Exception as e:
    logger.error(f'Error: {str(e)}')
    return jsonify({'error': str(e)}), 500
```

Frontend shows error messages:
```javascript
const [error, setError] = useState('')
// Display in UI: {error && <div className="error-message">{error}</div>}
```

## Development Workflow

### First Time Setup
```bash
# Clone project
git clone https://github.com/kuefmz/process_pdfs.git
cd process_pdfs

# Install dependencies
cd frontend && npm install
cd ../backend && npm install
```

tail -f backend.log
### Running Locally
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend (using Poetry)
cd backend
# Install Poetry if you don't have it:
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies and create venv managed by Poetry
poetry install

# Run inside poetry-managed venv
poetry run python app.py

# Terminal 3 - (Optional) Watch logs
tail -f backend.log
```

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make changes**
   - Edit files in frontend or backend
   - Vite hot-reloads frontend automatically
   - Nodemon restarts backend on changes

3. **Test thoroughly**
   - Test all features affected
   - Check error cases
   - Test on mobile if UI changes

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feat/my-feature
   ```

5. **Create Pull Request**
   - Describe changes
   - List testing done
   - Link related issues

## Testing

### Manual Testing Checklist
- [ ] Feature works in Chrome
- [ ] Feature works in Firefox
- [ ] Feature works on mobile
- [ ] Error messages display correctly
- [ ] No console errors
- [ ] Files are not stored
- [ ] Downloads work correctly

### Automated Testing (Future)
```bash
# Frontend tests
npm test -- frontend

# Backend tests
npm test -- backend
```

Setup using Jest, Vitest, or similar.

## Debugging

### Frontend
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Use React DevTools extension

### Backend
1. Check terminal logs
2. Add `console.log()` statements
3. Check request/response in Postman
4. Enable verbose logging with `DEBUG=*`

## Performance Tips

### Frontend
- Lazy load routes (future)
- Optimize bundle size with vite-plugin-compression
- Use React.memo for expensive components
- Monitor with Lighthouse

### Backend
- Add request caching headers
- Optimize file processing
- Add rate limiting
- Monitor memory usage

## Security Considerations

- Never store files permanently ✓
- Validate file types ✓
- Limit file sizes ✓
- Use HTTPS in production ✓
- Add CSRF protection (if adding forms)
- Sanitize user input (if adding user data)

## Common Issues

### "pdf-lib is not defined"
Make sure to import:
```javascript
import { PDFDocument } from 'pdf-lib'
```

### CORS errors
Check backend environment variable `FRONTEND_URL`

### File upload fails
Check Multer configuration and file size limits

### Slow performance with large PDFs
Use pagination or web workers for processing

## Dependencies

### Why these libraries?

- **React**: Popular, good ecosystem
- **Vite**: Fast build tool, great DX
- **pdf-lib**: Good for client-side PDF
- **Express**: Simple, widely used backend
- **Multer**: Standard file upload handling

## Future Improvements

1. **Add testing** (Jest, Vitest, Cypress)
2. **Add authentication** (if needed)
3. **Add database** (for history/features)
4. **Improve PDF handling** (pdf-lib -> pdfkit)
5. **Add monitoring** (Sentry, DataDog)
6. **CI/CD improvements** (auto test, lint)
7. **Performance** (caching, compression)
8. **Accessibility** (WCAG 2.1)

## Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [pdf-lib Docs](https://pdf-lib.js.org)
- [Express Docs](https://expressjs.com)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Getting Help

1. Check existing issues
2. Create detailed issue report
3. Join discussions
4. Read documentation
5. Search Stack Overflow

---

**Happy coding! Feel free to contribute and improve the project!**
