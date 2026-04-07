# Interactive Wall Calendar Component

A polished, responsive React/Next.js calendar component inspired by physical wall calendars. Built with TypeScript, Tailwind CSS, and featuring advanced interactive features for date selection, note-taking, and more.

## 📋 Features

### Core Requirements ✅
- **Wall Calendar Aesthetic**: Beautiful design inspired by physical wall calendars with a hero image section, clean layout, and strong visual hierarchy
- **Day Range Selector**: Intuitive date range selection with visual feedback for start dates, end dates, and the range between
- **Integrated Notes Section**: Dual-mode notes area supporting both general monthly notes and specific date-based notes
- **Fully Responsive Design**: Seamlessly adapts from desktop to mobile with optimized layouts
- **Client-Side Persistence**: All data saved to localStorage (no backend required)

### Creative Features ✨
- **Dark/Light Theme Toggle**: Switch between light and dark modes with persistent preference
- **Dynamic Hero Images**: Beautiful month-specific images from Unsplash that can be rotated
- **Month Navigation**: Easy navigation between months with "Today" button
- **Interactive Date Grid**: Visual indicators for:
  - Today's date (highlighted in red)
  - Selected date range (blue highlighting)
  - Range start/end dates (marked with "S" and "E" badges)
- **Statistics Dashboard**: Real-time display of selected dates and duration
- **Smooth Animations**: Hover effects and transitions for polished UX
- **Mobile-Optimized Touch Interactions**: Works perfectly on tablets and smartphones

## 🏗️ Project Structure

```
striver/
├── app/
│   ├── components/
│   │   ├── Calendar.tsx              # Main calendar component (state management)
│   │   ├── CalendarHeader.tsx        # Header with month navigation
│   │   ├── DateGrid.tsx              # Calendar date grid
│   │   ├── HeroImage.tsx             # Hero image section
│   │   └── NotesSection.tsx          # Notes area component
│   ├── utils/
│   │   └── dateUtils.ts              # Date manipulation utilities
│   ├── layout.tsx                    # Root layout with metadata
│   ├── page.tsx                      # Main page
│   └── globals.css                   # Global styles
├── public/                           # Static assets
├── package.json                      # Dependencies
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── next.config.ts                    # Next.js configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd striver
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 🎯 Usage Guide

### Selecting Dates
1. **Click a date** to set it as the start date (displays in blue)
2. **Click another date** to set it as the end date
3. Dates between the start and end will be highlighted in light blue
4. The range summary shows in the header with day count

### Adding Notes
- **General Notes Tab**: Add notes that apply to the entire month
- **Date Notes Tab**: Add specific notes for a selected date range
- Notes are automatically saved to your browser

### Navigation
- Use the **Prev/Next buttons** to navigate months
- Click **Today** to jump to the current month
- **Clear Selection** resets your date range

### Customization
- Toggle **Dark Mode** for a comfortable experience in low-light environments
- Click the **rotate button** on the hero image to see other month-related wallpapers
- All preferences are saved automatically

## 🎨 Responsive Design

### Desktop (1024px+)
- Side-by-side layout with calendar on left, notes panel on right
- Large hero image with smooth animations
- Full-width statistics dashboard

### Tablet (768px - 1023px)
- Stacked layout with adjusted spacing
- Responsive calendar grid
- Sticky notes panel for easy reference while scrolling

### Mobile (<768px)
- Single column layout
- Optimized touch targets for easy date selection
- Collapsible sections for better space usage
- Full-width calendar and notes

## 💾 Data Persistence

All data is stored locally in your browser using `localStorage`:
- **selectedDateRange**: Start and end dates of your selection
- **notes_{monthYear}**: Monthly notes in format: `{ generalNotes, dateNotes }`
- **calendarTheme**: Current theme preference (light/dark)

## 📦 Technologies Used

- **React 18**: UI components and hooks
- **Next.js 15**: Framework and routing
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling and responsiveness
- **Unsplash API**: Dynamic hero images
- **localStorage**: Client-side data persistence

## 🎓 Key Components

### Calendar.tsx
Main container component managing:
- Current month/year state
- Date range selection state
- Theme state
- localStorage synchronization

### DateGrid.tsx
Renders the calendar grid with:
- 7-column weekday layout
- Date selection logic
- Visual indicators for selections and today's date
- Responsive grid spacing

### NotesSection.tsx
Provides:
- Dual-mode note editing (general + specific dates)
- Tab-based interface
- Real-time persistence
- Automatic saving indicators

### DateUtils.ts
Utility functions for:
- Month/year calculations
- Date range validation
- Calendar grid generation
- Date formatting and parsing

## 🌈 Color Scheme

- **Primary**: Blue (#0066FF)
- **Secondary**: Light Blue (#E3F2FD)
- **Accent**: Red (#FF4444) for today indicator
- **Background**: Light (#F8FAFC) / Dark (#1F2937)
- **Text**: Dark Gray (#374151) / Light Gray (#F3F4F6)

## 🚀 Performance

- Zero external API calls (images use public Unsplash URLs)
- Optimized re-renders with React hooks
- Minimal bundle size with tree-shaking
- Smooth animations using CSS transitions

## 🔒 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Notes

- All date operations are timezone-aware
- Range selection automatically handles date order (swaps if needed)
- Images load with fallback for accessibility
- Fully accessible with keyboard navigation

## 🎉 Built With Love

This calendar component demonstrates:
- Clean, maintainable code architecture
- Responsive design best practices
- State management with React hooks
- Utility-first CSS styling
- TypeScript for type safety
- UX/UI attention to detail

Enjoy your new calendar! 🗓️✨
