# Deployment Guide (Frontend Only)

## Overview
This project is a static, frontend-only React app. You can deploy it to any static hosting service (GitHub Pages, Netlify, Vercel, etc.). No backend or Docker is required.

## Build the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build for production:
   ```bash
   npm run build
   # Output will be in the dist/ folder
   ```

## Deploy to GitHub Pages
1. Ensure your repository is on GitHub.
2. The GitHub Actions workflow `.github/workflows/deploy-frontend.yml` is preconfigured for static deployment.
3. On push to `main`, the workflow will build and deploy the app to GitHub Pages automatically.
4. The site will be available at `https://<your-username>.github.io/<repo-name>/`.

## Deploy to Other Static Hosts
- Upload the contents of the `dist/` folder to your static host (Netlify, Vercel, Firebase Hosting, etc.).
- Configure your host to serve `index.html` for all routes (SPA fallback).

## Notes
- All frontend code is in the project root (not in a frontend/ subfolder).
- No backend or Docker is required for deployment.
- For advanced/optional backend usage, see the backend/ folder (not required for static deployment).
