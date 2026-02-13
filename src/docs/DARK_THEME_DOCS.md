# STUDIFY Dark Theme - Login & Home Page

A modern, premium dark-themed login experience with integrated Spline 3D animation for an AI-powered education platform.

## 🎨 Design Philosophy

**Mood**: Intelligent, futuristic, calm, and premium  
**Inspiration**: Modern AI products, high-end creative tech platforms  
**Focus**: Intelligence, growth, and deep focus

## 🎯 Visual System

### Color Palette

```css
/* Background Colors */
--color-bg-primary: #0B0F1A     /* Deep charcoal primary */
--color-bg-secondary: #0E1324   /* Secondary dark blue */
--color-bg-tertiary: #1A1F35    /* Elevated surfaces */

/* Accent Colors */
--color-accent-purple: #8B5CF6  /* Neon purple */
--color-accent-blue: #3B82F6    /* Electric blue */

/* Text Colors */
--color-text-primary: #E5E7EB   /* Soft white */
--color-text-secondary: #9CA3AF /* Medium gray */
--color-text-muted: #6B7280     /* Muted gray */
```

### Typography

**Font Stack**: Inter, Plus Jakarta Sans, SF Pro  
**Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

**Scale**:
- Headings: 48px, 28px, 20px
- Body: 16px
- Small: 14px, 12px

## 🧩 Components

### Login Page (`/components/LoginPage.tsx`)

**Layout**:
- **Left Section**: Glassmorphic login card with soft blur
- **Right Section**: Full-height Spline 3D animation
- **Background**: Deep gradient with noise texture and neural network particles

**Features**:
- Animated particles floating in background
- Email and password inputs with focus glow effects
- Password show/hide toggle
- Neon gradient button with shimmer hover effect
- Secondary links (Forgot password, Create account)
- Smooth fade + slide transition on login

**Glass Card Specs**:
```css
background: rgba(255, 255, 255, 0.05)
backdrop-filter: blur(20px) saturate(150%)
border: 1px solid rgba(255, 255, 255, 0.1)
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 20px 40px rgba(0, 0, 0, 0.3)
```

**Input Focus State**:
```css
border-color: #8B5CF6 (purple)
ring: 2px rgba(139, 92, 246, 0.2)
background: rgba(255, 255, 255, 0.1)
```

**Button Hover Effect**:
- Neon glow: Multi-layered purple + blue glow
- Scale: 1.02x
- Shimmer animation on hover
- Active press: 0.98x scale

### Home Page (`/components/HomePage.tsx`)

**Layout**:
- **Header**: Sticky glassmorphic navigation bar
- **Hero Section**: Large glassmorphic card with Spline animation background (30% opacity)
- **Stats Grid**: 4 cards showing study metrics
- **Main Content**: 3-column grid
  - Left (2 cols): Subject progress + Activity chart
  - Right (1 col): Today's sessions + AI insights

**Features**:
- Spline 3D animation as background accent (subtle, scaled up)
- Glassmorphic cards throughout
- Color-coded progress bars with glow effects
- Hover states with smooth transitions
- AI-powered insights card with gradient background

## 🎭 Microinteractions

### Input Fields
- **Focus**: Border glow (purple), background lift, ring effect
- **Typing**: Smooth color transitions

### Buttons
- **Hover**: Scale 1.02x, neon glow, shimmer overlay
- **Active**: Scale 0.98x
- **Loading**: Spinning border animation

### Cards
- **Hover**: Background lift (rgba(255,255,255,0.1)), scale on icons
- **Transition**: 300ms cubic-bezier easing

### Animated Particles
- Random positioning
- Float animation (8s loop)
- Staggered delays
- Vertical + horizontal drift

## 🌐 Spline 3D Integration

**Spline URL**: `https://my.spline.design/animatedlightdesktop-q3VkMLsfCZi7SQXbWNIgqvIe/`

### Login Page Implementation
```tsx
<iframe
  src="https://my.spline.design/animatedlightdesktop-q3VkMLsfCZi7SQXbWNIgqvIe/"
  className="w-full h-full border-0"
  title="STUDIFY 3D Animation"
/>
```
- Full height (600px) on desktop
- Hidden on mobile/tablet (< 1024px)
- Subtle gradient overlay for integration
- Rounded corners matching design system

### Home Page Implementation
```tsx
<div className="absolute inset-0 opacity-30">
  <iframe
    src="https://my.spline.design/animatedlightdesktop-q3VkMLsfCZi7SQXbWNIgqvIe/"
    className="w-full h-full border-0 scale-150"
  />
</div>
```
- Background layer (opacity 30%)
- Scaled up (150%) for better framing
- Behind hero content

## 🎨 Special Effects

### Noise Texture
```css
.bg-noise::before {
  background-image: url("data:image/svg+xml...");
  opacity: 0.03;
}
```

### Neural Network Pattern
```css
.neural-pattern {
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.1)...),
    radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.08)...);
}
```

### Glow Classes
- `.glow-purple`: Purple shadow glow
- `.glow-blue`: Blue shadow glow
- `.glow-neon`: Multi-layered purple + blue glow

### Gradient Classes
- `.gradient-neon`: Purple → Blue gradient
- `.gradient-neon-text`: Gradient text clip

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1024px+ (shows Spline animation)
- **Tablet**: 768px - 1023px (login card only)
- **Mobile**: < 768px (stacked layout)

### Mobile Optimizations
- Spline animation hidden on mobile
- Single column layout
- Touch-friendly 44px minimum targets
- Reduced padding and spacing

## ♿ Accessibility

### Standards
- WCAG 2.1 AA compliance
- 4.5:1 text contrast (soft white on dark backgrounds)
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus visible states with purple outline

### Features
- Semantic HTML
- Form labels properly associated
- Error states and messages
- Screen reader friendly
- Reduced motion support (respects prefers-reduced-motion)

## 🔄 Transitions

### Page Transitions
```tsx
<div className="transition-opacity duration-500">
  {!isLoggedIn ? <LoginPage /> : <HomePage />}
</div>
```
- 500ms fade transition
- Smooth state changes
- No jarring layout shifts

### Animations
- **fade-in**: 0 → 1 opacity
- **slide-in-from-left**: Slide + fade from left
- **slide-in-from-right**: Slide + fade from right
- **slide-in-from-bottom**: Slide + fade from bottom
- **zoom-in**: Scale 0.95 → 1 + fade

**Staggered Delays**: 100ms, 200ms, 300ms for sequential reveals

## 🚀 Technical Implementation

### State Management
```tsx
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [isTransitioning, setIsTransitioning] = useState(false);
```

### Login Flow
1. User clicks "Log In"
2. Button shows loading state (spinner)
3. 1.5s simulated delay
4. Fade transition starts
5. HomePage renders with fade-in

### Theme Switching
The app supports both dark (new) and light (legacy) themes:
```tsx
const [appMode, setAppMode] = useState<'dark' | 'light'>('dark');
```

## 📊 Sample Data

### Stats (Home Page)
- Study Time: 24.5h (+12%)
- Goals Hit: 8/10 (+2)
- Streak: 14 days (🔥)
- Level: Pro (New!)

### Subjects
- Data Structures: 75% (12 sessions)
- Algorithms: 60% (9 sessions)
- Database Systems: 85% (15 sessions)
- Computer Networks: 45% (7 sessions)

### Upcoming Sessions
- Binary Trees - 14:00 (90 min)
- Dynamic Programming - 16:30 (60 min)
- SQL Queries - 18:00 (45 min)

## 🎯 Future Enhancements

**Potential additions**:
- OAuth integration (Google, GitHub)
- 2FA with QR codes
- Password strength indicator
- Remember me functionality
- Email verification flow
- Onboarding tutorial
- Dark mode variants (darker, OLED)
- Customizable accent colors
- Animated scene transitions
- 3D avatar customization

## 💡 Usage

1. **Start the app**: Shows dark-themed login page
2. **Enter credentials**: Email + password (any values for demo)
3. **Click "Log In"**: Button animates, shows loading state
4. **Transition**: Smooth fade to home page
5. **Explore**: View stats, subjects, and upcoming sessions

## 🎨 Design Files

All design tokens are in `/styles/globals.css`:
- Color variables
- Glass effects
- Gradients
- Animations
- Utilities

Component styles are co-located with components for maintainability.

---

**Built with**: React, TypeScript, Tailwind CSS v4, Lucide Icons  
**3D Animation**: Spline Design  
**Theme**: Dark, premium, futuristic
