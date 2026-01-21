# 🎮 Game Book Client

A modern, bilingual (Marathi & English) receipt management system for gaming businesses. Built with React, Vite, and Tailwind CSS.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building](#building)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [Documentation](#documentation)

## ✨ Features

- 📝 **Receipt Management** - Create, edit, and manage gaming receipts
- 👥 **Customer Management** - Track customers and their transactions
- 📊 **Dashboard & Reports** - Visual analytics and reporting
- 🌐 **Bilingual Support** - Full Marathi and English language support
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔄 **WhatsApp Sharing** - Share receipts directly via WhatsApp with images
- 🖨️ **Print & Export** - Print receipts or export to various formats
- 🔐 **Authentication** - Secure login system with protected routes
- 📈 **Analytics** - Track business performance with charts and statistics

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **Charts**: Recharts
- **Date Management**: Day.js
- **HTTP Client**: Axios
- **Icons**: React Icons, Lucide React
- **Notifications**: React Toastify
- **Image Generation**: html-to-image
- **PDF Generation**: jsPDF

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn** >= 1.22.x
- **Git**

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd game-book-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your configuration:
   ```env
   VITE_API_BASE_URL=your_api_base_url_here
   ```

## 💻 Development

Start the development server:

```bash
npm run dev
```

The application will be available at:
- Local: `http://localhost:5173`
- Network: `http://0.0.0.0:5173`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🏗️ Building

Create a production build:

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

Preview the production build:

```bash
npm run preview
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://your-api-url.com/api
```

**Note**: All environment variables must be prefixed with `VITE_` to be accessible in the application.

## 📁 Project Structure

```
game-book-client/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # React components
│   │   ├── AdminDashboard/
│   │   ├── VendorDashboard/
│   │   │   ├── components/
│   │   │   └── utils/
│   │   ├── LanguageToggle.jsx
│   │   ├── Login.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/       # React contexts (LanguageContext)
│   ├── locales/        # i18n translations (en.json, mr.json)
│   ├── App.jsx         # Main app component
│   ├── App.css         # App styles
│   ├── index.css       # Global styles
│   └── main.jsx        # Application entry point
├── .env                # Environment variables (not committed)
├── .gitignore         # Git ignore rules
├── eslint.config.js   # ESLint configuration
├── index.html         # HTML entry point
├── package.json       # Dependencies and scripts
├── vite.config.js     # Vite configuration
└── vercel.json        # Vercel deployment config

```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint rules
- Use meaningful variable and function names
- Write clean, self-documenting code
- Add comments for complex logic
- Keep components small and focused
- Use functional components with hooks

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed version history.

## 📚 Documentation

Comprehensive documentation is available:

- **[SETUP.md](./SETUP.md)** - Quick setup guide for new developers
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines and workflow
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide for various platforms
- **[DOCS.md](./DOCS.md)** - Complete documentation overview
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Community guidelines

## 🤖 Automation

### Automatic Version Bumping

This project uses GitHub Actions to automatically:
- ✅ Increment version on every push to `main` branch
- ✅ Update CHANGELOG.md with commit messages
- ✅ Create git tags for releases
- ✅ Commit changes back to repository

**No manual version management needed!** Just write good commit messages.

**Commit Message Format:**
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit message guidelines.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with ❤️ for gaming businesses
- Supports Marathi and English languages for better accessibility

---

**Version**: 1.0.0  
**Last Updated**: January 2026
