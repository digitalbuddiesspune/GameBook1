# 🚀 Quick Setup Guide

Get up and running with Game Book Client in just a few minutes!

## ⚡ Quick Start (TL;DR)

```bash
# Clone the repo
git clone <https://github.com/yuktiflow/game-book-client>
cd game-book-client

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API URL

# Start development
npm run dev
```

That's it! Visit http://localhost:5173

## 📋 Prerequisites Checklist

Make sure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm 9+ installed (`npm --version`)
- ✅ Git installed (`git --version`)

### Installing Prerequisites

**Node.js & npm:**
- Download from: https://nodejs.org/
- Or use nvm: `nvm install 18`

**Git:**
- Download from: https://git-scm.com/

## 🔧 Detailed Setup

### Step 1: Clone Repository

```bash
git clone <https://github.com/yuktiflow/game-book-client>
cd game-book-client
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 3: Environment Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your API URL:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Important:** 
- All Vite environment variables must start with `VITE_`
- Never commit `.env` to version control

### Step 4: Start Development Server

```bash
npm run dev
```

Your application will be available at:
- **Local:** http://localhost:5173
- **Network:** http://0.0.0.0:5173

## 🎨 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |

## 🧪 Testing Your Setup

1. **Open the app** at http://localhost:5173
2. **Test language toggle** - Switch between English and Marathi
3. **Try login** - Use your credentials
4. **Check console** - No errors should appear

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# Kill the process using the port (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Environment Variables Not Loading

- Make sure variable names start with `VITE_`
- Restart the dev server after changing `.env`
- Check for typos in variable names

## 📱 Mobile Development

To test on mobile devices:

1. Make sure your computer and phone are on the same network
2. Find your computer's IP address:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
3. Visit `http://<YOUR_IP>:5173` on your phone

## 🎯 Next Steps

1. Read the full [README.md](README.md)
2. Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
3. Review the [project structure](README.md#project-structure)
4. Explore the codebase starting with [src/App.jsx](src/App.jsx)

## 💡 Tips

- Use React DevTools browser extension for debugging
- Enable ESLint in your editor for real-time code quality checks
- Use the Prettier extension for automatic code formatting
- Check the browser console for helpful error messages

## 🆘 Need Help?

- Check existing [GitHub Issues](../../issues)
- Open a new issue if you're stuck
- Read the [FAQ](#faq) below

## ❓ FAQ

**Q: Do I need to install anything globally?**
A: No, all dependencies are installed locally in the project.

**Q: What Node.js version should I use?**
A: Node.js 18 or higher is recommended.

**Q: Can I use Yarn instead of npm?**
A: Yes, but stick to one package manager per project.

**Q: How do I update dependencies?**
A: Run `npm update` or `npm install <package>@latest`

**Q: The app is slow in development mode**
A: This is normal. Production build is much faster.

---

Happy coding! 🎉
