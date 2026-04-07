# Getting Started Guide - Interactive Wall Calendar

Welcome to the Interactive Wall Calendar! This guide will help you get up and running quickly.

## 🚀 Quick Start

### 1. Installation
```bash
# Navigate to project directory
cd striver

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

### 2. Open in Browser
```
http://localhost:3000
```

You should see the interactive calendar loaded with the current month!

## 📅 Using the Calendar

### Selecting Dates

#### Basic Selection
1. **Click on any date** to select it as the start date
   - The date will turn blue
   - An "S" badge indicates the start date
2. **Click another date** to set the end date
   - Dates between start and end highlight in light blue
   - An "E" badge shows the end date
3. **Click a third date** to start a new selection

#### Smart Date Order
- If you click a date before your start date, it automatically becomes the new start
- The system handles date swapping intelligently

#### Clearing Selection
- Click the "Clear Selection" button to reset
- Or click a third date to start fresh

### Taking Notes

#### General Notes
1. Click the **"General Notes"** tab
2. Type your monthly notes, reminders, or thoughts
3. Notes auto-save automatically
4. They'll never disappear! (stored in browser)

#### Date-Specific Notes
1. Select a date range first (see "Selecting Dates")
2. Click the **"Date Notes"** tab
3. Add notes for that specific date
4. Each date can have its own notes

#### Note Taking Tips
- Notes are saved to your browser automatically
- Different months have separate note spaces
- Clear your browser data to clear notes
- You can edit notes anytime

### Navigation

#### Moving Between Months
- **← Prev**: Go to previous month
- **Next →**: Go to next month
- **Today**: Jump back to current month

#### Rotating Hero Images
1. Hover over the image at the top
2. Click the rotate button (↻)
3. See the next month's wallpaper

#### Statistics
At the top, you'll see:
- **Date Range**: Your selected start and end dates
- **Days Selected**: Total days in your range
- **Duration**: "Single day" or "X day period"

### Customization

#### Dark Mode
1. Click the 🌙 **Dark Mode** button (top right)
2. Your preference is saved automatically
3. Click again to return to light mode

#### Theme
- The theme affects the entire calendar interface
- All your notes and selections remain the same
- Your preference is remembered across sessions

## 🎨 Visual Guide

### Color Meanings
- **🔵 Blue**: Your selected dates
- **🔵 Light Blue**: Dates in your range
- **🔴 Red Border**: Today's date
- **⚪ White/Gray**: Unselected dates

### Text Indicators
- **S**: Start of your date range
- **E**: End of your date range

## 💡 Tips & Tricks

### Pro Tips
1. **Keyboard Navigation**: Use Tab key to navigate buttons
2. **Multi-Selection**: You can select date ranges across weeks
3. **Persistent Storage**: All data stored safely in your browser
4. **No Internet Needed**: Works completely offline
5. **Fast Loading**: Optimized for quick performance

### Common Questions

**Q: Will my notes disappear?**
A: No! Notes are saved to your browser and persist until you manually clear browser data.

**Q: Can I export my calendar?**
A: Currently, notes are stored locally. You can copy-paste them elsewhere.

**Q: Does this sync across devices?**
A: No, data is stored locally. Each device/browser has its own data.

**Q: Can I access past months?**
A: Yes! Use the navigation buttons to go to any month and see your notes.

**Q: What if I accidentally clear my browser data?**
A: You'll need to re-enter your notes. Be careful with browser data clearing!

## 🎯 Feature Checklist

- [x] Date range selection
- [x] General monthly notes
- [x] Date-specific notes
- [x] Month navigation
- [x] Today quick jump
- [x] Dark/Light theme
- [x] Auto-save to browser
- [x] Responsive design
- [x] Hero images
- [x] Statistics display

## 📱 Responsive Behavior

### On Desktop
- Calendar on the left
- Notes panel on the right (sticky)
- Large hero image
- Full statistics dashboard

### On Tablet
- Single column layout
- Notes below calendar
- Optimized spacing
- Touch-friendly buttons

### On Mobile
- Stacked layout
- Large touch targets
- Full-width calendar
- Easy-to-read notes

## 🔧 Browser Compatibility

✅ **Supported**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

❌ **Not Supported**
- Internet Explorer (ancient!)

## 🚀 Troubleshooting

### Calendar not loading?
1. Refresh the page
2. Clear browser cache
3. Check browser console for errors

### Notes not saving?
1. Check if localStorage is enabled
2. Ensure you're not in private mode
3. Clear browser cache and try again

### Date selection not working?
1. Try clicking different dates
2. The first click sets start, second sets end
3. Refresh if stuck

### Theme not saving?
1. Check if localStorage is enabled
2. Theme should save automatically
3. Works across sessions

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console (F12)
2. Look for error messages
3. Try clearing browser cache
4. Refresh the page and try again

## 🎉 You're Ready!

Now you have everything you need to use the Interactive Wall Calendar. Enjoy planning your month! 🗓️✨

### Next Steps
- Select your first date range
- Add some notes
- Share with friends
- Come back daily to track your schedule

Happy planning! 📅
