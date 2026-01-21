# 🚀 Deployment Guide

This guide covers deploying the Game Book Client to various platforms.

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests pass
- [ ] No console errors in production build
- [ ] Environment variables are configured
- [ ] API endpoints are correct
- [ ] Build succeeds locally (`npm run build`)
- [ ] Production build tested (`npm run preview`)
- [ ] Assets are optimized
- [ ] No sensitive data in code

## 🌐 Deployment Platforms

### Vercel (Recommended)

**Already configured!** The project includes `vercel.json`.

#### Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Production deployment**
   ```bash
   vercel --prod
   ```

#### Deploy via GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables in Vercel dashboard
6. Deploy!

**Environment Variables in Vercel:**
- Go to Project Settings → Environment Variables
- Add `VITE_API_BASE_URL`
- Set for Production, Preview, and Development

---

### Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

**netlify.toml Configuration:**

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/game-book-client"
   }
   ```

3. **Update vite.config.js**
   ```js
   export default defineConfig({
     base: '/game-book-client/',
     // ... other config
   })
   ```

4. **Build and deploy**
   ```bash
   npm run build
   npm run deploy
   ```

---

### Docker

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Build and run:**

```bash
# Build image
docker build -t game-book-client .

# Run container
docker run -p 8080:80 game-book-client
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

---

### AWS S3 + CloudFront

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create S3 bucket**
   - Enable static website hosting
   - Set index.html as index document

3. **Upload files**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Configure CloudFront**
   - Create distribution
   - Set S3 bucket as origin
   - Set default root object to `index.html`

5. **Custom error pages**
   - Error Code: 403 & 404
   - Response Page Path: `/index.html`
   - Response Code: 200

---

## 🔐 Environment Variables

### Production Environment Variables

Always set these in your deployment platform:

```env
VITE_API_BASE_URL=https://api.production.com/api
```

### Where to Set Environment Variables:

| Platform | Location |
|----------|----------|
| Vercel | Project Settings → Environment Variables |
| Netlify | Site Settings → Environment Variables |
| Docker | docker-compose.yml or .env file |
| AWS | Systems Manager Parameter Store |

**Important:** Never commit real environment variables to Git!

---

## 🔍 Post-Deployment Verification

After deployment, check:

1. **Functionality**
   - [ ] Homepage loads correctly
   - [ ] Login works
   - [ ] Receipt creation works
   - [ ] WhatsApp sharing works
   - [ ] Images load properly

2. **Performance**
   - [ ] Page load time < 3 seconds
   - [ ] Images are compressed
   - [ ] No console errors

3. **Browser Compatibility**
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge
   - [ ] Mobile browsers

4. **API Connection**
   - [ ] API calls succeed
   - [ ] Correct API endpoint
   - [ ] CORS configured

5. **Responsive Design**
   - [ ] Mobile view
   - [ ] Tablet view
   - [ ] Desktop view

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working

- Ensure variables start with `VITE_`
- Rebuild after changing variables
- Check platform-specific variable syntax

### 404 Errors on Refresh

Configure redirects for SPA:

**Vercel:** Already configured in `vercel.json`

**Netlify:** Add to `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Nginx:** Use `try_files $uri $uri/ /index.html;`

### CORS Errors

Configure your API backend to allow requests from your domain:
```js
Access-Control-Allow-Origin: https://yourdomain.com
```

---

## 📊 Performance Optimization

### Build Optimizations

1. **Code Splitting**
   - Already handled by Vite
   - Lazy load routes

2. **Image Optimization**
   - Compress images before deployment
   - Use WebP format when possible

3. **Bundle Analysis**
   ```bash
   npm run build -- --mode analyze
   ```

### CDN Configuration

Use CDN for:
- Static assets
- Images
- Fonts

### Caching Strategy

Set cache headers:
```nginx
# Cache static assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Already Set Up!)

The project includes automatic version bumping on push to main.

### Additional CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📈 Monitoring

### Set Up Monitoring

1. **Error Tracking**
   - Sentry
   - LogRocket
   - Rollbar

2. **Analytics**
   - Google Analytics
   - Mixpanel
   - Plausible

3. **Performance**
   - Lighthouse CI
   - Web Vitals
   - New Relic

---

## 🎯 Best Practices

1. **Always test builds locally** before deploying
2. **Use environment-specific configs**
3. **Enable HTTPS** (free with Vercel/Netlify)
4. **Set up custom domain**
5. **Configure CDN** for better performance
6. **Monitor error logs** after deployment
7. **Keep dependencies updated**
8. **Regular security audits** (`npm audit`)

---

## 📞 Support

Having deployment issues?
- Check platform-specific documentation
- Review build logs
- Open an issue on GitHub

---

**Happy Deploying! 🚀**
