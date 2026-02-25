# Setup Guide (Frontend Only)

This project is now frontend-only by default. All PDF processing is done in the browser—no backend or Docker required.

## To run locally:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run in development mode:**
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```

3. **Build for production:**
   ```bash
   npm run build
   # Output in dist/
   ```

4. **Deploy to GitHub Pages:**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## (Optional) Backend
The backend (Python/Flask) is included for future/advanced use, but is not required for normal usage or deployment.
