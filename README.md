# Read While Listen

A modern, responsive web application that allows users to browse and select books, then read text while listening to synchronized audio narration. Perfect for language learning, accessibility, and enhanced reading experiences.

![Read While Listen App](https://github.com/khaaali/readWhileListen/raw/main/app-screenshot.png)

## Features

### 📚 Book Selection
- Home page with a grid view of available books
- Visual book cards with title and description
- Intuitive navigation from book selection to reading view

### 📱 Responsive Design
- Optimized for both desktop and mobile devices
- Adaptive layout that changes based on screen size
- Mobile-first approach for better user experience on smartphones and tablets

### 🎧 Audio Playback
- Synchronized audio narration with text display
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
- JSON-based book and chapter mapping

### File Organization
- `/Books` - Contains subdirectories for each book
  - `/{BookName}/Audios` - Contains MP3 audio files for each chapter
  - `/{BookName}/Chapters` - Contains SSML text files for each chapter
  - `/{BookName}/{BookName}.json` - Maps chapters to their respective audio and text files
- `/images` - Contains images and icons used in the application
- `index.html` - Home page with book selection
- `reader.html` - Reader view for chapters with audio playback
- `styles.css` - Core styling and responsive design rules
- `books-styles.css` - Styling specific to the book selection view
- `script.js` - JavaScript functionality for the reader view
- `books.js` - JavaScript functionality for book selection
- `books.json` - Contains metadata about available books

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

5. Browse available books on the home page and select one to start reading

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## License

MIT License - See LICENSE file for details

## Adding New Books

To add a new book to the application:

1. Create a new directory under `/Books` with the name of your book
2. Create `Audios` and `Chapters` subdirectories
3. Add your audio files to the `Audios` directory
4. Add your SSML text files to the `Chapters` directory
5. Create a JSON file named after your book (e.g., `YourBookName.json`) with the chapter mapping
6. Add your book's metadata to `books.json`

## Acknowledgments

- Developed by Ram Vankamamidi
- Special thanks to Windsurf engineering team for guidance and support
