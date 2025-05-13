# Read While Listen

A modern, responsive web application that allows users to read text while listening to synchronized audio narration. Perfect for language learning, accessibility, and enhanced reading experiences.

![Read While Listen App](https://github.com/khaaali/readWhileListen/raw/main/app-screenshot.png)

## Features

### 📱 Responsive Design
- Optimized for both desktop and mobile devices
- Adaptive layout that changes based on screen size
- Mobile-first approach for better user experience on smartphones and tablets

### 🎧 Audio Playback
- Synchronized audio narration with text highlighting
- Play/pause, skip forward/backward controls
- Adjustable playback speed (0.5x to 2x)
- Progress bar with time indicators

### 📖 Text Display
- Clean, readable text formatting
- Proper word wrapping and overflow handling
- Support for multiple languages and scripts
- Automatic scrolling to follow audio narration

### 📚 Chapter Navigation
- Easy-to-use chapter selection sidebar
- Toggle button to show/hide chapters on mobile
- Visual indicators for current chapter
- Smooth transitions between chapters

### 🎨 Modern UI
- Clean, intuitive interface with modern aesthetics
- Consistent color scheme and typography
- Proper spacing and alignment for visual comfort
- Accessible design elements

## Technical Details

### Structure
- Pure HTML, CSS, and JavaScript implementation
- No external frameworks or libraries required
- SSML (Speech Synthesis Markup Language) for text-audio synchronization
- JSON-based chapter mapping

### File Organization
- `/Audios` - Contains MP3 audio files for each chapter
- `/Chapters` - Contains SSML text files for each chapter
- `chapter_mapping.json` - Maps chapters to their respective audio and text files
- `index.html` - Main HTML structure
- `styles.css` - All styling and responsive design rules
- `script.js` - JavaScript functionality

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/khaaali/readWhileListen.git
   ```

2. Navigate to the project directory:
   ```
   cd readWhileListen
   ```

3. Open `index.html` in your web browser or serve it using a local server:
   ```
   python -m http.server
   ```

4. Access the application at `http://localhost:8000`

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Developed by Ram Vankamamidi
- Special thanks to Windsurf engineering team for guidance and support
