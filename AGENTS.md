# Interactive Wall Calendar - Project Documentation

## Project Overview

This is an interactive wall calendar component built with React and Next.js. It combines the elegant aesthetic of physical wall calendars with modern web functionality, featuring date range selection, integrated notes, and a fully responsive design.

## 🎯 Core Features

### 1. Wall Calendar Aesthetic
- Hero image section with month-specific wallpapers
- Clean, organized date grid layout
- Visual hierarchy and professional design
- Inspired by physical calendar aesthetics

### 2. Date Range Selection
- Click to select start date (highlighted in blue)
- Click to select end date
- Auto-handling of date order (swaps if needed)
- Visual indicators for start, end, and range
- "S" and "E" badges for clarity

### 3. Integrated Notes Section
- **General Notes**: Month-wide notes and reminders
- **Date-Specific Notes**: Notes for selected date ranges
- Tab-based interface for easy switching
- Auto-save with browser storage

### 4. Responsive Design
- **Desktop**: Side-by-side layout with sticky notes panel
- **Tablet**: Stacked layout with smooth transitions
- **Mobile**: Single column with optimized touch targets

### 5. Creative Enhancements
- Dark/Light theme toggle with persistence
- Month-specific hero images with rotation
- Today's date highlighting
- Smooth animations and transitions
- Interactive date grid with hover states

## 📁 Project Structure

```
app/
├── components/
│   ├── Calendar.tsx              # Main calendar container (state management)
│   ├── CalendarHeader.tsx        # Month navigation and statistics
│   ├── DateGrid.tsx              # 7x6 calendar grid
│   ├── HeroImage.tsx             # Monthly hero image display
│   └── NotesSection.tsx          # Dual-mode notes editor
├── hooks/
│   └── useCalendarState.ts       # Custom hooks for state management
├── utils/
│   └── dateUtils.ts              # Date calculations and utilities
├── layout.tsx                    # Root layout with metadata
├── page.tsx                      # Entry point
└── globals.css                   # Tailwind styles
```

## 🛠 Key Technologies

- **React 18**: Component framework with hooks
- **Next.js 15**: Framework and routing
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **localStorage**: Client-side persistence

## 🎨 Component Architecture

### Calendar.tsx
- **Purpose**: Main orchestrator component
- **Responsibilities**:
  - Manage current date state
  - Handle date range selection
  - Manage theme preference
  - Sync with localStorage
  - Coordinate child components

### CalendarHeader.tsx
- **Purpose**: Display month/year navigation and statistics
- **Features**:
  - Month navigation buttons
  - Today button
  - Selected date range summary
  - Day count calculation
  - Visual styling with gradient background

### DateGrid.tsx
- **Purpose**: Render the 7x6 date grid
- **Features**:
  - Weekday headers
  - Date cell rendering
  - Visual indicators (today, selected, range)
  - Click handling for date selection
  - Full Tailwind styling
  - Legend with visual keys

### HeroImage.tsx
- **Purpose**: Display and manage hero images
- **Features**:
  - Month-specific images from Unsplash
  - Image rotation button
  - Hover animations
  - Image counter
  - Fallback image handling

### NotesSection.tsx
- **Purpose**: Dual-mode note taking interface
- **Features**:
  - General notes tab
  - Date-specific notes tab
  - Auto-save with status indicator
  - Tab switching logic
  - Disabled state for empty selections

## 💾 State Management

### Date Range State
```typescript
interface DateRange {
  start: Date | null;
  end: Date | null;
}
```

### Monthly Notes State
```typescript
interface MonthlyNotes {
  generalNotes: string;
  dateNotes: Record<string, string>;
}
```

### Theme State
```typescript
type Theme = 'light' | 'dark';
```

## 🚀 Build Commands

```bash
# Development
npm run dev

# Build production
npm run build

# Start production
npm start

# Linting
npm run lint
```

---

**Built with ❤️ using React, Next.js, and Tailwind CSS**
