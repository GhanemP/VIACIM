# VIA - Customer Intelligence Management

A sophisticated Customer Intelligence Dashboard built with React, TypeScript, and Tailwind CSS for real-time customer health monitoring and engagement analysis.

## 🎯 Features

### Progressive Disclosure UX Pattern
- **Layer 1: Hero Card** - Massive health score (text-8xl) with risk state and engagement gap reason
- **Layer 2: Interactive Timeline** - Mouse wheel zoom (50%-500%) and click & drag panning
- **Layer 3: Hover Tooltips** - Quick interaction previews without commitment
- **Layer 4: Side Panel** - Deep dive into full interaction details

### Direct Manipulation
- **Zoom**: Scroll mouse wheel (anchored to pointer position)
- **Pan**: Click and drag with cursor feedback (grab → grabbing)
- **Filter**: Custom toggle switches for interaction types and sentiment
- **Immediate Feedback**: All interactions respond instantly

### Intelligence Features
- Multi-factor health scoring algorithm (0-100)
- Automatic engagement gap detection with severity assessment
- Churn probability calculation
- Risk level categorization (Low, Medium, High, Critical)
- AI-driven insights and recommended actions
- Timeline visualization with milestone highlighting

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Production Build
```bash
npm run build
npm run preview  # Preview production build
```

### Linting
```bash
npm run lint
```

## 📊 Tech Stack

- **React 19.1.1** - Latest React with modern hooks
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.1.7** - Lightning-fast build tool with HMR
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Inter Font** - Clean, professional typography
- **ESLint** - Code quality and consistency

## 🎨 Design System

### Color Scheme (Functional)
- **Red** (`#DC2626`) - Critical risk, gaps, warnings
- **Green** (`#10B981`) - Positive sentiment, opportunities, healthy
- **Yellow** (`#F59E0B`) - Medium risk, caution
- **Gray** (`#6B7280`) - Neutral, inactive states
- **Blue** (`#2563EB`) - Interactive elements, links, toggles

### Typography
- **Font Family**: Inter (300-900 weights)
- **Hierarchy**: Established through font weight and size, not mixed fonts
- **Scale**: text-xs (10px) → text-8xl (96px) for health score

### Spacing
- **Generous Whitespace**: p-8, p-12, mb-6, mb-8
- **Breathing Room**: Reduces cognitive load
- **Consistent Margins**: 6-8 spacing units between sections

## 📁 Project Structure

```
/
├── src/
│   ├── CustomerIntelligenceDashboard.tsx  # Main dashboard component (1,420 lines)
│   ├── types.ts                           # TypeScript type definitions
│   ├── utils.ts                           # Health scoring & utility functions
│   ├── demoDataEnhanced.ts                # Rich demo data (12 customer journeys)
│   ├── App.tsx                            # Application wrapper
│   ├── main.tsx                           # React entry point
│   └── index.css                          # Global styles & Inter font import
├── vite.config.ts                         # Optimized build configuration
├── tailwind.config.js                     # Tailwind with Inter font
├── tsconfig.json                          # TypeScript configuration
└── package.json                           # Dependencies & scripts
```

## 🔧 Performance Optimizations

### Bundle Size
- **CSS**: 26.49 kB (5.17 kB gzipped) - 34% reduction from original
- **JS**: 253.26 kB main + 11.69 kB React vendor (74.67 kB + 4.17 kB gzipped)
- **Code Splitting**: Separate React vendor chunk for better caching
- **Dead Code Removal**: Removed 624 lines (30.5%) of unused components

### Build Configuration
- **Minification**: esbuild for fast, efficient minification
- **Code Splitting**: Manual chunks for React to leverage browser caching
- **Source Maps**: Disabled in production for smaller bundles
- **No Console Logs**: Clean production build

### Source Code
- **Lines of Code**: 1,420 (down from 2,044)
- **Components**: Only actively used components included
- **Tree Shaking**: Removed unused imports and functions

## 📚 Demo Data

The dashboard includes 12 realistic customer journeys showcasing:
- Critical risk scenarios (payment issues, long gaps)
- Healthy customers with upsell opportunities
- Onboarding and adoption phases
- Champion identification
- Churn analysis and prevention
- Enterprise complex journeys

Each customer has:
- Detailed interaction history with timestamps
- Sentiment analysis on each touchpoint
- AI-generated insights
- Recommended actions
- Engagement gap detection

## 🎓 Learning Resources

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a customer intelligence dashboard project. For questions or contributions, please contact the development team.

---

**Built with ❤️ using modern web technologies and UX best practices.**
