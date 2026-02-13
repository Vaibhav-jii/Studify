# STUDIFY — Smart Study Workload Analyzer

A polished, responsive frontend for college students to analyze study materials and generate personalized timetables.

## 🎨 Design System

### Visual Theme
- **Soft pastel gradients** with airy spacing
- **Glassmorphism UI** with translucent cards, backdrop blur, and subtle shadows
- **Liquid glass buttons** with hover/focus/pressed states
- **Calm, premium, friendly aesthetic** with slightly futuristic feel

### Color Palette
- **Primary Gradient**: #9B7CFF (violet) → #FFABE1 (pink)
- **Accent Blue**: #5AC8FA
- **Soft Lavender**: #EBDFF8
- **Pastel Pink**: #FFD6EB
- **Success**: #33CC99
- **Warning**: #FFB86B
- **Error**: #FF6B6B

### Typography
- **Font**: Inter (clean, modern sans-serif)
- **Sizes**: H1 48px, H2 28px, H3 20px, Body 16px

### Glass Effects
- Background: `rgba(255,255,255,0.14)`
- Backdrop filter: `blur(12px) saturate(120%)`
- Border: `1px solid rgba(255,255,255,0.25)`
- Inner highlight: `inset 0 1.5px 0 rgba(255,255,255,0.18)`
- Drop shadow: `0 18px 30px rgba(88,76,120,0.12)`

## 🧩 Component Library

### Core Components
- **Button** - Primary, secondary, ghost, and icon variants with loading states
- **Input** - Text inputs with icons, labels, and error states
- **Card** - Default, compact, resource, and elevated variants
- **Badge** - Status indicators with multiple variants
- **Chip** - Filterable tags with selection states
- **Modal** - Accessible dialog with size variants
- **Toast** - Non-intrusive notifications
- **ProgressBar** - Linear and circular progress indicators

### Domain Components
- **ResourceCard** - Display study materials with metadata
- **StudySessionCard** - Show scheduled study sessions
- **AnalysisModal** - Animated material analysis workflow
- **UploadZone** - Drag & drop file upload
- **StatsCard** - Dashboard statistics with trends
- **WeeklyGrid** - Calendar-style timetable view
- **Sidebar** - Main navigation with active states
- **MobileNav** - Bottom navigation for mobile

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1440px (12-column grid, 24px gutters)
- **Tablet**: 1024px (8-column grid)
- **Mobile**: 375px (single column, 16px gutters)

### Layout
- Sidebar navigation on desktop
- Bottom tab bar on mobile
- Responsive grid layouts throughout
- Touch-friendly 44px minimum tap targets on mobile

## 🎯 Core Features

### 1. Landing Page
- Hero section with gradient branding
- Feature showcase cards
- Call-to-action button
- Animated decorative elements

### 2. Dashboard
- Study statistics and trends
- Today's scheduled sessions
- Recent material analyses
- Quick action shortcuts
- Notifications panel

### 3. Materials Library
- Search and filter functionality
- Grid/list view toggle
- Subject tags with filtering
- Resource cards with metadata
- Progress tracking
- Empty states

### 4. Upload & Analyze
- Drag & drop upload zone
- Multi-file support (PDF, PPT, Video)
- Animated analysis workflow
- Progress indicators
- Results display with:
  - Content density score
  - Estimated study time
  - Difficulty rating
  - Recommended session splits
  - Suggested topics

### 5. Study Planner
- Auto-generate study schedule
- Week/list view toggle
- Interactive session cards
- Drag & drop rescheduling
- Session editing modal
- Customizable preferences:
  - Hours per day
  - Preferred study blocks
  - Exam dates
  - Priority subjects

### 6. Calendar
- Month/week view
- Today's schedule
- Color-coded sessions
- Session type legend
- Export functionality

### 7. Settings
- Profile management
- Study style preferences (Pomodoro, long-block, flexible)
- Difficulty calibration
- Notification settings
- Theme toggle (default/high-contrast)
- Privacy controls

## ♿ Accessibility

### Standards
- WCAG 2.1 AA compliance target
- 4.5:1 text contrast ratios
- High-contrast mode available
- Keyboard navigation support
- ARIA labels and roles
- Focus visible states
- Screen reader friendly

### Features
- Semantic HTML structure
- Descriptive button labels
- Error messages for forms
- Status announcements
- Skip navigation links
- Reduced motion support

## 🎭 Microinteractions

### Button States
- **Hover**: Lift effect with glow shadow
- **Pressed**: Scale to 0.98
- **Focus**: 2px violet outline
- **Disabled**: 50% opacity, no transform

### Card Interactions
- Hover lift on interactive cards
- Smooth shadow transitions
- Click feedback with scale

### Animations
- Staggered fade-in on page load
- Smooth view transitions
- Loading spinners
- Progress bar animations
- Toast slide-in/out
- Modal fade + zoom

### Analysis Workflow
- Circular progress indicator
- Step-by-step status updates
- Incremental text changes
- Success state with checkmark

## 🚀 Getting Started

The app is built with:
- **React** for component architecture
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **TypeScript** for type safety

### Key Files
- `/App.tsx` - Main application component
- `/components/` - Reusable UI components
- `/styles/globals.css` - Design tokens and utilities

## 📊 Sample Data

The application includes mock data for demonstration:
- Study materials with different types, subjects, and difficulties
- Scheduled study sessions across multiple subjects
- Analytics and progress metrics
- Notifications and alerts

## 🎨 Design Tokens

All design values are stored as CSS custom properties in `/styles/globals.css`:
- Color palette variables
- Spacing scale (4, 8, 12, 16, 24, 32, 48, 64px)
- Border radius (10px, 16px, 24px)
- Glass effect values
- Typography scale

## 💡 Usage Tips

1. **Getting Started**: Click "Try it — Upload Materials" on the landing page
2. **Upload Materials**: Use the Analyze view to upload PDFs or PPTs
3. **View Analysis**: See estimated time, difficulty, and recommended sessions
4. **Generate Plan**: Use the Planner to create an auto-generated study schedule
5. **Customize**: Edit sessions, adjust preferences, and export to calendar

## 🎯 Future Enhancements

Potential additions (not implemented):
- Real file analysis with OCR/AI
- Integration with Google Calendar
- Flashcard generation
- Study buddy collaboration
- Progress analytics dashboard
- Mobile app version
- Dark mode variant
- Multi-language support
