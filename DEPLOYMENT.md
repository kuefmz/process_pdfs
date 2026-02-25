# Deployment Guide

## Quick Start

### Local Development
```bash
# Terminal 1 - Frontend
cd frontend
npm install
npm run dev  # http://localhost:5173

# Terminal 2 - Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py  # http://localhost:5000
```

### Docker (Recommended)
```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## Frontend Deployment (GitHub Pages)

### Step 1: Update Configuration
Edit `frontend/vite.config.js`:
```javascript
export default defineConfig({
  base: '/process_pdfs/',  // Change if not in subdirectory
  // ... rest of config
})
```

### Step 2: Automatic Deployment (GitHub Actions)
The workflow at `.github/workflows/deploy-frontend.yml` automatically deploys on push to main.

### Step 3: Enable GitHub Pages
1. Go to GitHub repo Settings
2. Navigate to Pages
3. Set source to "GitHub Actions"
4. Deploy will start automatically

## Backend Deployment Options

### Option 1: Railway (Easiest)
1. **Connect repo** to Railway
2. **Add service** → Python
3. **Set environment variables:**
   - `FLASK_ENV=production`
   - `FRONTEND_URL=https://yourdomain.com`
4. **Deploy**

Railway will auto-detect `requirements.txt` and run the app.

### Option 2: Render
1. Create new **Web Service**
2. Connect GitHub repo
3. Set root directory: `backend`
4. Set start command: `python app.py`
5. Set environment variables
6. Deploy

### Option 3: Heroku
1. Connect GitHub repo
2. Set buildpack: `heroku/python`
3. Set environment variables
4. Deploy

### Option 4: Vercel (with custom handler)
Python Flask requires serverless wrapper. More complex setup.

### Option 5: Self-Hosted (VPS)
```bash
# On your server
git clone <repo>
cd process_pdfs/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run with Gunicorn (production WSGI server)
pip install gunicorn
gunicorn app:app
```

Use **Supervisor** to keep it running:
```bash
# Create supervisor config
sudo nano /etc/supervisor/conf.d/pdf-api.conf
```

```ini
[program:pdf-api]
directory=/home/user/process_pdfs/backend
command=/home/user/process_pdfs/backend/venv/bin/gunicorn app:app
autostart=true
autorestart=true
stderr_logfile=/var/log/pdf-api/err.log
stdout_logfile=/var/log/pdf-api/out.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start pdf-api
```

---

## Environment Variables

### Frontend
- `VITE_API_URL` - Backend API URL (if needed)

### Backend
```env
FLASK_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
```

---

## Connecting Frontend to Backend

### Production Setup
If frontend and backend are on different domains:

Update `frontend/src/pages/SignPDF.jsx`:
```javascript
const API_BASE = process.env.VITE_API_URL || '/api'

const response = await axios.post(`${API_BASE}/sign`, formData, {
  responseType: 'blob'
})
```

Update `frontend/vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://your-backend-url.com',
      changeOrigin: true
    }
  }
}
```

---

## Database (Optional Future)

If you want to add file history or user accounts:
- Use PostgreSQL or MongoDB
- Add authentication layer
- Store metadata (not files)

---

## Performance Tips

1. **Enable GZIP** on backend
2. **Use CDN** for frontend assets
3. **Set cache headers** for static files
4. **Monitor** with Sentry or DataDog

---

## Monitoring & Logging

### Backend Monitoring
- Add **Winston** for logging
- Add **Sentry** for error tracking
- Monitor uptime with **StatusPage.io** or **UptimeRobot**

### Frontend Analytics (Optional)
- **Google Analytics** (if you want usage stats)
- **Hotjar** (user behavior)

---

## CI/CD Pipeline

Current setup:
- GitHub Actions deploys frontend automatically
- Backend needs manual deployment (or add workflow)

To add backend deployment:
Create `.github/workflows/deploy-backend.yml` similarly.

---

## SSL/HTTPS

Essential for production!

### Option 1: GitHub Pages
Already has HTTPS included.

### Option 2: Cloudflare (Free)
1. Point domain to Cloudflare
2. Enable "Full" SSL mode
3. Configure origin certificate for backend

### Option 3: Let's Encrypt
For self-hosted servers:
```bash
sudo apt install certbot
certbot certonly --standalone -d yourdomain.com
```

---

## Zero-Downtime Deployments

### Frontend
GitHub Pages handles this automatically.

### Backend
For zero-downtime:
1. Use load balancer (Nginx, HAProxy)
2. Deploy to multiple instances
3. Update one at a time

---

## Rollback

If something breaks:

**Frontend:**
```bash
git revert <commit-hash>
git push  # Auto-deploys via Actions
```

**Backend:**
```bash
git revert <commit-hash>
git push
# Re-deploy from your hosting platform
```

---

## Troubleshooting

### CORS Errors
Check `FRONTEND_URL` in backend .env matches your frontend domain.

### Files Not Uploading
Check `multer` file size limit in `backend/server.js`.

### Slow Performance
- Check backend response times
- Enable caching
- Optimize PDF library usage

### Memory Issues
Reduce max file size in `.env` or add queue system.

---

## Cost Breakdown (Free/Cheap Options)

- **GitHub Pages**: FREE (frontend)
- **Railway**: $5/month (generous free tier)
- **Vercel**: FREE (backend)
- **Render**: FREE (with sleep, paid for always-on)
- **Cloudflare**: FREE (DNS + CDN)

**Total**: Minimal cost!

---

## Next Steps

1. Deploy frontend to GitHub Pages
2. Deploy backend to Railway/Vercel
3. Update `FRONTEND_URL` in backend
4. Test signing feature end-to-end
5. Monitor for issues
6. Add more features based on feedback
