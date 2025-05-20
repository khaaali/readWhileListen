class BookManager {
    constructor() {
        this.books = [];
        this.booksGrid = document.getElementById('booksGrid');
    }

    async initialize() {
        await this.loadBooks();
        this.renderBooks();
    }

    async loadBooks() {
        try {
            // Get list of book folders
            const response = await fetch('books.json');
            if (!response.ok) {
                throw new Error('Failed to load books data');
            }
            const data = await response.json();
            this.books = data.books;
        } catch (error) {
            console.error('Error loading books:', error);
            // If books.json doesn't exist yet, we'll create a fallback with available books
            this.books = [
                {
                    id: 'Dakshinamurthy',
                    title: 'Dakshinamurthy',
                    description: 'A collection of chapters about Dakshinamurthy',
                    coverImage: 'placeholder.jpg'
                },
                {
                    id: 'On Hinduism',
                    title: 'On Hinduism',
                    description: 'A collection of chapters about Hinduism',
                    coverImage: 'placeholder.jpg'
                }
            ];
        }
    }

    renderBooks() {
        if (!this.booksGrid) {
            console.error('Books grid element not found');
            return;
        }

        this.booksGrid.innerHTML = '';

        this.books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            const coverImg = document.createElement('div');
            coverImg.className = 'book-cover';
            
            // Create and add fallback text (first letter of title)
            const fallbackText = document.createElement('span');
            fallbackText.className = 'cover-fallback-text';
            fallbackText.textContent = book.title.charAt(0);
            coverImg.appendChild(fallbackText);
            
            if (book.coverImage) {
                // Try to load the image
                const img = new Image();
                img.onload = function() {
                    // Image loaded successfully
                    coverImg.style.backgroundImage = `url(${book.coverImage})`;
                    fallbackText.style.opacity = '0'; // Hide the fallback text
                };
                img.onerror = function() {
                    // Image failed to load, use the fallback
                    coverImg.classList.add('placeholder-cover');
                    fallbackText.style.opacity = '1';
                    console.log(`Failed to load cover image for ${book.title}`);
                };
                img.src = book.coverImage;
            } else {
                // No image specified, use the fallback
                coverImg.classList.add('placeholder-cover');
            }
            
            const bookInfo = document.createElement('div');
            bookInfo.className = 'book-info';
            
            const title = document.createElement('h3');
            title.className = 'book-title';
            title.textContent = book.title;
            
            const description = document.createElement('p');
            description.className = 'book-description';
            description.textContent = book.description || 'No description available';
            
            bookInfo.appendChild(title);
            bookInfo.appendChild(description);
            
            bookCard.appendChild(coverImg);
            bookCard.appendChild(bookInfo);
            
            // Add click event to navigate to the book
            bookCard.addEventListener('click', () => {
                this.openBook(book.id);
            });
            
            this.booksGrid.appendChild(bookCard);
        });
    }

    openBook(bookId) {
        // Store the selected book in localStorage
        localStorage.setItem('selectedBook', bookId);
        // Navigate to the reader page
        window.location.href = 'reader.html';
    }
}

// Initialize the book manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const bookManager = new BookManager();
    bookManager.initialize();
});
