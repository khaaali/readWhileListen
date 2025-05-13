class ReadWhileListen {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentSpeed = 1.0;
        this.currentHighlightedWord = null;
        this.words = [];
        this.currentChapter = null;
        this.chapters = [];
    }

    initializeElements() {
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.rewindBtn = document.getElementById('rewindBtn');
        this.forwardBtn = document.getElementById('forwardBtn');
        this.progress = document.getElementById('progress');
        this.currentTime = document.getElementById('currentTime');
        this.duration = document.getElementById('duration');
        this.textContent = document.getElementById('textContent');
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
            const response = await fetch('chapter_mapping.json');
            const data = await response.json();
            this.chapters = data.chapters;
            
            if (this.chapters.length > 0) {
                await this.loadChapter(this.chapters[0]);
            }
        } catch (error) {
            console.error('Error loading chapter mapping:', error);
            this.textContent.innerHTML = '<p>Error loading chapters. Please check the console for details.</p>';
        }
    }

    async loadChapter(chapter) {
        try {
            const ssmlResponse = await fetch(chapter.ssml_file);
            const ssmlText = await ssmlResponse.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(ssmlText, 'text/xml');
            const textContent = doc.getElementsByTagName('speak')[0];
            const text = textContent ? textContent.textContent : ssmlText;
            
            // Format the text with paragraphs for better readability
            const formattedText = text
                .split('\n\n')
                .map(para => `<p>${para}</p>`)
                .join('');
                
            this.textContent.innerHTML = formattedText;
            this.currentChapter = chapter;
            this.audio.src = chapter.audio_file;
            this.audio.load();
            
            this.updateBreadcrumb(chapter.id, chapter.title);
            this.progress.value = 0;
            this.currentTime.textContent = '0:00';
            this.updateChapterNavigation();
        } catch (error) {
            console.error('Error loading chapter:', error);
            this.textContent.innerHTML = `<p>Error loading chapter ${chapter.id}. Please check the console for details.</p>`;
        }
    }

    updateBreadcrumb(chapterId, chapterTitle) {
        if (this.breadcrumb) {
            this.breadcrumb.textContent = `Chapter ${chapterId}: ${chapterTitle}`;
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
