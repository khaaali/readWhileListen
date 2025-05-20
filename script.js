class ReadWhileListen {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentSpeed = 1.0;
        this.currentHighlightedWord = null;
        this.words = [];
        this.currentChapter = null;
        this.chapters = [];
        this.currentWordIndex = 0;
        this.ssmlText = '';
        this.ssmlWords = [];
        this.selectedBook = localStorage.getItem('selectedBook') || 'Dakshinamurthy';
    }

    initializeElements() {
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.rewindBtn = document.getElementById('rewindBtn');
        this.forwardBtn = document.getElementById('forwardBtn');
        this.progress = document.getElementById('progress');
        this.currentTime = document.getElementById('currentTime');
        this.duration = document.getElementById('duration');
        this.textContent = document.getElementById('textContent');
        this.ssmlContent = document.querySelector('.ssml-content');
        this.playbackSpeed = document.getElementById('playbackSpeed');
        this.chapterNav = document.getElementById('chapterNav');
        this.breadcrumb = document.getElementById('breadcrumb');
        this.toggleChaptersBtn = document.getElementById('toggleChapters');
        this.chapterSidebar = document.querySelector('.chapter-sidebar');
    }

    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.rewindBtn.addEventListener('click', () => this.rewind());
        this.forwardBtn.addEventListener('click', () => this.forward());
        this.progress.addEventListener('input', () => this.seek());
        this.playbackSpeed.addEventListener('change', (e) => this.setPlaybackSpeed(e.target.value));

        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.handleEnd());
        // Text highlighting disabled as requested
        // this.audio.addEventListener('timeupdate', () => this.highlightCurrentWord());
        
        // Toggle chapters sidebar on mobile
        console.log('Setting up toggle chapters button, element:', this.toggleChaptersBtn);
        if (this.toggleChaptersBtn) {
            console.log('Adding click listener to toggle chapters button');
            this.toggleChaptersBtn.addEventListener('click', (e) => {
                console.log('Toggle button class event triggered:', e);
                e.preventDefault();
                e.stopPropagation();
                this.toggleChaptersSidebar();
            });
            
            // Close chapters sidebar when clicking outside of it
            document.addEventListener('click', (e) => {
                console.log('Document click event target:', e.target);
                if (this.chapterSidebar && this.chapterSidebar.classList.contains('active')) {
                    console.log('Checking if should close sidebar');
                    console.log('Click target is toggle button?', e.target === this.toggleChaptersBtn);
                    console.log('Click target is in sidebar?', this.chapterSidebar.contains(e.target));
                    
                    if (!this.chapterSidebar.contains(e.target) && e.target !== this.toggleChaptersBtn) {
                        console.log('Closing sidebar on outside click');
                        this.chapterSidebar.classList.remove('active');
                    }
                }
            });
            
            // Close chapters sidebar when a chapter is selected on mobile
            if (window.innerWidth <= 768) {
                console.log('Setting up mobile chapter selection handler');
                this.chapterNav.addEventListener('click', (e) => {
                    console.log('Chapter selected on mobile, closing sidebar');
                    this.chapterSidebar.classList.remove('active');
                });
            }
        } else {
            console.error('Toggle chapters button not found during setup');
        }
    }

    async loadChapterMapping() {
        try {
            // Get the selected book from localStorage or use default
            const bookPath = `Books/${this.selectedBook}/${this.selectedBook}.json`;
            const response = await fetch(bookPath);
            
            if (!response.ok) {
                throw new Error(`Failed to load chapter mapping for book: ${this.selectedBook}`);
            }
            
            const data = await response.json();
            this.chapters = data.chapters;
            
            // Update book title in UI
            document.title = `${this.selectedBook} - Read While Listen`;
            
            // Update the chapter navigation
            this.updateChapterNavigation();
            
            if (this.chapters.length > 0) {
                await this.loadChapter(this.chapters[0]);
            }
        } catch (error) {
            console.error('Error loading chapter mapping:', error);
            this.textContent.innerHTML = `<p>Error loading chapters for book "${this.selectedBook}". Please check the console for details.</p>`;
        }
    }

    async loadChapter(chapter) {
        try {
            const chapterId = chapter.id;
            const bookPath = `Books/${this.selectedBook}`;
            const ssmlPath = `${bookPath}/${chapter.ssml_file}`;
            
            const response = await fetch(ssmlPath);
            if (!response.ok) {
                throw new Error(`Failed to load SSML file: ${ssmlPath}`);
            }
            
            const ssmlText = await response.text();
            
            // Parse SSML and extract text content
            const parser = new DOMParser();
            const doc = parser.parseFromString(ssmlText, 'text/xml');
            const speakElement = doc.querySelector('speak');
            
            if (!speakElement) {
                throw new Error('Invalid SSML format - no speak element found');
            }

            // Extract text content
            const textContent = this.extractTextFromSSML(speakElement);
            
            // Process words for highlighting
            this.processSSMLWords(speakElement);
            
            // Update UI
            this.ssmlContent.innerHTML = textContent;
            this.currentChapter = chapter;
            this.updateBreadcrumb(chapter.id, chapter.title);
            
            // Load corresponding audio
            const audioFile = `${bookPath}/${chapter.audio_file}`;
            console.log('Loading audio file:', audioFile);
            
            // Add error handling for audio loading
            this.audio.onerror = (e) => {
                console.error('Error loading audio file:', e);
                alert(`Failed to load audio file: ${audioFile}. Please check the console for details.`);
            };
            
            this.audio.oncanplaythrough = () => {
                console.log('Audio file loaded and can be played');
            };
            
            this.audio.src = audioFile;
            this.audio.load();
            
            // Reset current word index
            this.currentWordIndex = 0;
            
            // Clear any existing highlights
            const existingHighlights = this.ssmlContent.querySelectorAll('.highlight');
            existingHighlights.forEach(highlight => highlight.classList.remove('highlight'));
            
        } catch (error) {
            console.error('Error loading chapter:', error);
            alert('Error loading chapter: ' + error.message);
        }
    }

    extractTextFromSSML(element) {
        let text = '';
        
        // Process all child nodes
        element.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                // Handle SSML elements
                if (child.tagName === 'BREAK') {
                    // Add appropriate spacing for breaks
                    const strength = child.getAttribute('strength') || 'medium';
                    const time = child.getAttribute('time');
                    
                    if (time) {
                        // Add time-based break
                        text += `<span class="pause" data-time="${time}"></span>`;
                    } else {
                        // Add strength-based break
                        text += `<span class="pause" data-strength="${strength}"></span>`;
                    }
                } else {
                    // Recursively process other elements
                    text += this.extractTextFromSSML(child);
                }
            }
        });
        
        return text.trim();
    }

    processSSMLWords(element, startIndex = 0) {
        this.ssmlWords = [];
        this.parseSSMLElement(element, startIndex);
    }

    parseSSMLElement(element, startIndex = 0) {
        let currentText = '';
        let currentIndex = startIndex;

        element.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                const words = child.textContent.trim().split(/\s+/);
                words.forEach(word => {
                    if (word) {
                        this.ssmlWords.push({
                            word: word,
                            start: currentIndex,
                            end: currentIndex + word.length,
                            timestamp: null // Will be populated during playback
                        });
                        currentIndex += word.length + 1; // +1 for space
                    }
                });
                currentText += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const childText = this.parseSSMLElement(child, currentIndex);
                currentText += childText;
                currentIndex += childText.length;
            }
        });

        return currentText;
    }

    highlightCurrentWord() {
        if (!this.audio || !this.ssmlWords.length) return;

        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        
        // Find the word that should be highlighted
        const wordIndex = Math.floor((currentTime / duration) * this.ssmlWords.length);
        
        // Remove previous highlight
        const previousHighlight = this.ssmlContent.querySelector('.highlight');
        if (previousHighlight) {
            previousHighlight.classList.remove('highlight');
        }

        // Highlight the current word
        if (wordIndex >= 0 && wordIndex < this.ssmlWords.length) {
            const word = this.ssmlWords[wordIndex];
            const text = this.ssmlContent.textContent;
            const start = word.start;
            const end = word.end;
            
            // Create a span around the current word
            const highlightedText = text.slice(0, start) +
                '<span class="highlight">' + text.slice(start, end) + '</span>' +
                text.slice(end);
            
            this.ssmlContent.innerHTML = highlightedText;
        }
    }

    updateBreadcrumb(chapterId, chapterTitle) {
        if (this.breadcrumb) {
            this.breadcrumb.textContent = `${this.selectedBook} - Chapter ${chapterId}: ${chapterTitle}`;
        }
    }

    updateChapterNavigation() {
        if (!this.chapterNav) return;
        
        this.chapterNav.innerHTML = '';
        
        this.chapters.forEach((chapter) => {
            const li = document.createElement('li');
            li.className = 'chapter-item';
            if (this.currentChapter && chapter.id === this.currentChapter.id) {
                li.className += ' active';
            }
            li.textContent = `Chapter ${chapter.id}: ${chapter.title}`;
            li.addEventListener('click', () => this.loadChapter(chapter));
            this.chapterNav.appendChild(li);
        });
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    this.playPauseBtn.querySelector('.icon').textContent = '⏸️';
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                });
        } else {
            this.audio.pause();
            this.isPlaying = false;
            this.playPauseBtn.querySelector('.icon').textContent = '▶️';
        }
    }

    rewind() {
        this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
    }

    forward() {
        this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
    }

    seek() {
        const progress = this.progress.value;
        if (!isNaN(this.audio.duration)) {
            this.audio.currentTime = (this.audio.duration * progress) / 100;
        }
    }

    setPlaybackSpeed(speed) {
        this.currentSpeed = parseFloat(speed);
        this.audio.playbackRate = this.currentSpeed;
    }

    updateProgress() {
        if (!isNaN(this.audio.duration) && this.audio.duration > 0) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progress.value = progress;
            
            const minutes = Math.floor(this.audio.currentTime / 60);
            const seconds = Math.floor(this.audio.currentTime % 60);
            this.currentTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateDuration() {
        if (!isNaN(this.audio.duration)) {
            const minutes = Math.floor(this.audio.duration / 60);
            const seconds = Math.floor(this.audio.duration % 60);
            this.duration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    handleEnd() {
        const currentIndex = this.chapters.findIndex(ch => ch.id === this.currentChapter.id);
        if (currentIndex < this.chapters.length - 1) {
            this.loadChapter(this.chapters[currentIndex + 1]);
        }
    }
    
    changeBook(bookId) {
        this.selectedBook = bookId;
        localStorage.setItem('selectedBook', bookId);
        this.loadChapterMapping();
    }
    
    toggleChaptersSidebar() {
        console.log('Toggle chapters clicked');
        if (this.chapterSidebar) {
            // Get current state before toggle
            const isActive = this.chapterSidebar.classList.contains('active');
            
            // Toggle to opposite state
            if (isActive) {
                this.chapterSidebar.classList.remove('active');
                console.log('Chapter sidebar hidden');
            } else {
                this.chapterSidebar.classList.add('active');
                console.log('Chapter sidebar shown');
            }
        } else {
            console.error('Chapter sidebar element not found');
        }
    }
}

// Test function to diagnose toggle button issues
function testToggleButton() {
    console.log('=== TOGGLE BUTTON TEST ===');
    const toggleBtn = document.getElementById('toggleChapters');
    console.log('Toggle button by ID:', toggleBtn);
    
    const toggleBtns = document.querySelectorAll('.toggle-chapters-btn');
    console.log('Toggle buttons by class:', toggleBtns);
    
    const sidebar = document.querySelector('.chapter-sidebar');
    console.log('Sidebar element:', sidebar);
    
    if (toggleBtn) {
        console.log('Toggle button properties:');
        console.log('- offsetWidth:', toggleBtn.offsetWidth);
        console.log('- offsetHeight:', toggleBtn.offsetHeight);
        console.log('- display:', window.getComputedStyle(toggleBtn).display);
        console.log('- visibility:', window.getComputedStyle(toggleBtn).visibility);
        console.log('- position:', window.getComputedStyle(toggleBtn).position);
        console.log('- z-index:', window.getComputedStyle(toggleBtn).zIndex);
    }
    
    console.log('=== END TEST ===');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Run test after a short delay to ensure DOM is fully loaded
    setTimeout(testToggleButton, 500);
    const reader = new ReadWhileListen();
    reader.initializeElements();
    
    // Debug elements
    console.log('Toggle button found:', !!reader.toggleChaptersBtn);
    console.log('Chapter sidebar found:', !!reader.chapterSidebar);
    
    // IMPORTANT: We're removing the direct event binding and only using the class method
    // This prevents the conflicting event handlers
    
    reader.setupEventListeners();
    reader.loadChapterMapping();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const chapterSidebar = document.querySelector('.chapter-sidebar');
        if (window.innerWidth > 768 && chapterSidebar) {
            chapterSidebar.classList.remove('active');
        }
    });
});
