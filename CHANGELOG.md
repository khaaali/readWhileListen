# Changelog

All notable changes to the Read While Listen project will be documented in this file.

## [1.0.0] - 2025-05-14

### Added
- Initial release of the Read While Listen application
- Chapter navigation sidebar with toggle functionality
- Audio playback controls with play/pause, skip, and speed options
- SSML text display synchronized with audio
- Responsive design for both desktop and mobile devices

### Improved
- **Mobile UI Enhancements**:
  - Fixed text content visibility issues at the bottom of the screen
  - Added proper padding to ensure all text is visible
  - Improved scrolling behavior with `-webkit-overflow-scrolling: touch`
  - Positioned "Read While Listen" title in center for mobile UI
  - Placed app title on far left for web/desktop UI
  - Removed "Chapter 1: Chapter 1" text from mobile header for cleaner look
  - Expanded chapter toggler view height by 30% (from 150px to 195px)
  - Improved chapter item styling with larger text and better spacing
  - Enhanced touch targets for better mobile interaction
  - Fixed positioning of audio controls with proper background and shadow
  - Ensured controls don't overlap with text content

- **Desktop UI Improvements**:
  - Optimized header layout with title on the far left
  - Improved text container width for better readability
  - Enhanced chapter navigation with better visual hierarchy
  - Added proper spacing and alignment throughout the interface

### Technical
- Implemented responsive CSS using media queries
- Added CSS variables for consistent theming
- Optimized JavaScript for better performance
- Improved error handling for audio and text loading
