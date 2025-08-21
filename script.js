// Professional Reading Tracker - Enhanced JavaScript
let books = JSON.parse(localStorage.getItem('readStackBooks')) || [];
let currentFilter = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Form submission handler
document.getElementById('bookForm').addEventListener('submit', function(e) {
    e.preventDefault();
    addBook();
});

// Initialize the application
function initializeApp() {
    console.log('Initializing app with', books.length, 'books'); // Debug log
    updateStatistics();
    updateFilterCounts();
    displayBooks();
    
    // Add smooth scrolling and animations
    addScrollAnimations();
    
    // Show welcome message if first time user
    if (books.length === 0) {
        setTimeout(() => {
            showNotification('Welcome to Read Stack! Start building your digital library. 📚', 'info');
        }, 1000);
    }
}

// Add a new book with enhanced validation
function addBook() {
    const formData = getFormData();
    
    if (!validateFormData(formData)) {
        return;
    }

    const book = createBookObject(formData);
    
    books.push(book);
    saveBooks();
    updateStatistics();
    updateFilterCounts();
    displayBooks();
    
    // Reset form with animation
    resetFormWithAnimation();
    showNotification('Book added successfully! 📚', 'success');
    
    // Scroll to the new book
    setTimeout(() => {
        const newBookCard = document.querySelector('.book-card:last-child');
        if (newBookCard) {
            newBookCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 300);
}

// Get form data
function getFormData() {
    return {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        category: document.getElementById('category').value,
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value.trim()
    };
}

// Validate form data
function validateFormData(data) {
    if (!data.title || !data.author) {
        showNotification('Please fill in both title and author fields! ⚠️', 'error');
        return false;
    }
    
    if (data.title.length < 2 || data.author.length < 2) {
        showNotification('Title and author must be at least 2 characters long! ⚠️', 'error');
        return false;
    }
    
    // Check for duplicate books
    const isDuplicate = books.some(book => 
        book.title.toLowerCase() === data.title.toLowerCase() &&
        book.author.toLowerCase() === data.author.toLowerCase()
    );
    
    if (isDuplicate) {
        showNotification('This book already exists in your library! 📖', 'warning');
        return false;
    }
    
    return true;
}

// Create book object
function createBookObject(formData) {
    return {
        id: generateUniqueId(),
        title: formData.title,
        author: formData.author,
        category: formData.category,
        status: formData.status,
        notes: formData.notes,
        dateAdded: new Date().toISOString(),
        dateModified: new Date().toISOString()
    };
}

// Generate unique ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Save books to localStorage with error handling
function saveBooks() {
    try {
        localStorage.setItem('readStackBooks', JSON.stringify(books));
    } catch (error) {
        console.error('Error saving books:', error);
        showNotification('Error saving data! Please try again. ❌', 'error');
    }
}

// Filter books with smooth animation
function filterBooks(filter) {
    currentFilter = filter;
    
    // Update active button with animation
    updateActiveFilterButton();
    
    // Display filtered books with animation
    displayBooks();
    
    // Update URL without page refresh (for better UX)
    if (window.history && window.history.pushState) {
        const url = new URL(window.location);
        url.searchParams.set('filter', filter);
        window.history.pushState({filter}, '', url);
    }
}

// Update active filter button
function updateActiveFilterButton() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`[onclick="filterBooks('${currentFilter}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Display books with enhanced animations
function displayBooks() {
    const booksList = document.getElementById('booksList');
    let filteredBooks = getFilteredBooks();
    
    // Fade out current content
    booksList.style.opacity = '0';
    
    setTimeout(() => {
        if (filteredBooks.length === 0) {
            showEmptyState();
        } else {
            showBookCards(filteredBooks);
        }
        
        // Fade in new content
        booksList.style.opacity = '1';
    }, 150);
}

// Get filtered books
function getFilteredBooks() {
    if (currentFilter === 'all') {
        return books;
    }
    return books.filter(book => book.status === currentFilter);
}

// Show empty state
function showEmptyState() {
    const booksList = document.getElementById('booksList');
    const message = currentFilter === 'all' 
        ? {
            icon: 'fas fa-book-open',
            title: 'Welcome to Your Reading Journey',
            subtitle: 'Start building your digital library by adding your first book!'
        }
        : {
            icon: 'fas fa-search',
            title: 'No Books Found',
            subtitle: `No books match the current filter: ${getStatusDisplayName(currentFilter)}`
        };
    
    booksList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="${message.icon}"></i>
            </div>
            <h3>${message.title}</h3>
            <p>${message.subtitle}</p>
            ${currentFilter === 'all' ? `
                <div class="empty-features">
                    <div class="feature">
                        <i class="fas fa-chart-line"></i>
                        <span>Track Progress</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-sticky-note"></i>
                        <span>Add Notes</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-filter"></i>
                        <span>Organize Books</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Show book cards
function showBookCards(filteredBooks) {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = filteredBooks.map((book, index) => 
        createBookCardHTML(book, index)
    ).join('');
}

// Create book card HTML with enhanced design
function createBookCardHTML(book, index) {
    const statusClass = book.status.replace('-', '');
    const statusDisplay = getStatusDisplayName(book.status);
    const categoryEmoji = getCategoryEmoji(book.category);
    const notesHtml = book.notes ? `
        <div class="book-notes">
            <strong>Notes:</strong> ${escapeHtml(book.notes)}
        </div>
    ` : '';

    return `
        <div class="book-card ${statusClass}" style="animation-delay: ${index * 0.1}s">
            <div class="book-title">${escapeHtml(book.title)}</div>
            <div class="book-author">by ${escapeHtml(book.author)}</div>
            
            <div class="book-meta">
                <span class="book-category">
                    ${categoryEmoji} ${book.category}
                </span>
                <span class="book-status ${statusClass}">
                    ${getStatusIcon(book.status)} ${statusDisplay}
                </span>
            </div>
            
            ${notesHtml}
            
            <div class="book-actions">
                <button class="btn btn-edit" onclick="editBook('${book.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="deleteBook('${book.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Get category emoji
function getCategoryEmoji(category) {
    const emojiMap = {
        'Fiction': '📖',
        'Non-Fiction': '📚',
        'Science': '🔬',
        'Biography': '👤',
        'History': '🏛️',
        'Self-Help': '💡',
        'Business': '💼',
        'Technology': '💻',
        'Romance': '💝',
        'Mystery': '🔍',
        'Fantasy': '🧙‍♂️',
        'Educational': '🎓',
        'Other': '📋'
    };
    return emojiMap[category] || '📋';
}

// Get status icon
function getStatusIcon(status) {
    const iconMap = {
        'to-read': '📝',
        'reading': '📖',
        'finished': '✅'
    };
    return iconMap[status] || '📋';
}

// Get status display name
function getStatusDisplayName(status) {
    const statusMap = {
        'to-read': 'To Read',
        'reading': 'Currently Reading',
        'finished': 'Finished'
    };
    return statusMap[status] || status;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Enhanced edit book function
function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    // Create a more sophisticated edit interface
    const newTitle = prompt('Edit book title:', book.title);
    if (newTitle === null) return;
    
    const newAuthor = prompt('Edit author name:', book.author);
    if (newAuthor === null) return;
    
    const newNotes = prompt('Edit notes:', book.notes || '');
    if (newNotes === null) return;
    
    // Validate input
    if (!newTitle.trim() || !newAuthor.trim()) {
        showNotification('Title and author cannot be empty! ⚠️', 'error');
        return;
    }
    
    if (newTitle.trim().length < 2 || newAuthor.trim().length < 2) {
        showNotification('Title and author must be at least 2 characters long! ⚠️', 'error');
        return;
    }
    
    // Update book
    book.title = newTitle.trim();
    book.author = newAuthor.trim();
    book.notes = newNotes.trim();
    book.dateModified = new Date().toISOString();
    
    saveBooks();
    updateStatistics();
    updateFilterCounts();
    displayBooks();
    
    showNotification('Book updated successfully! ✏️', 'success');
}

// Enhanced delete book function
function deleteBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    if (confirm(`Are you sure you want to delete "${book.title}" by ${book.author}?\n\nThis action cannot be undone.`)) {
        books = books.filter(b => b.id !== id);
        saveBooks();
        updateStatistics();
        updateFilterCounts();
        displayBooks();
        
        showNotification('Book deleted successfully! 🗑️', 'success');
    }
}

// Update statistics in header
function updateStatistics() {
    const totalBooks = books.length;
    const finishedBooks = books.filter(book => book.status === 'finished').length;
    const readingProgress = totalBooks > 0 ? Math.round((finishedBooks / totalBooks) * 100) : 0;
    
    console.log('Updating statistics:', { totalBooks, finishedBooks, readingProgress }); // Debug log
    
    // Update with animation
    animateCounter('totalBooks', totalBooks);
    animateCounter('finishedBooks', finishedBooks);
    animateCounter('readingProgress', readingProgress, '%');
}

// Animate counter
function animateCounter(elementId, targetValue, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn('Element not found:', elementId); // Debug log
        return;
    }
    
    const currentText = element.textContent.replace(/[^\d]/g, '');
    const startValue = parseInt(currentText) || 0;
    
    if (startValue === targetValue) {
        element.textContent = targetValue + suffix;
        return;
    }
    
    const increment = targetValue > startValue ? 1 : -1;
    const steps = Math.abs(targetValue - startValue);
    const stepTime = Math.min(Math.max(Math.floor(800 / steps), 20), 100);
    
    let currentValue = startValue;
    const timer = setInterval(() => {
        currentValue += increment;
        element.textContent = currentValue + suffix;
        
        if (currentValue === targetValue) {
            clearInterval(timer);
        }
    }, stepTime);
}

// Update filter counts
function updateFilterCounts() {
    const counts = {
        all: books.length,
        'to-read': books.filter(book => book.status === 'to-read').length,
        reading: books.filter(book => book.status === 'reading').length,
        finished: books.filter(book => book.status === 'finished').length
    };
    
    console.log('Updating filter counts:', counts); // Debug log
    
    // Update count badges with fallback
    const updateCount = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn('Count element not found:', id);
        }
    };
    
    updateCount('allCount', counts.all);
    updateCount('toReadCount', counts['to-read']);
    updateCount('readingCount', counts.reading);
    updateCount('finishedCount', counts.finished);
}

// Reset form with animation
function resetFormWithAnimation() {
    const form = document.getElementById('bookForm');
    form.style.transform = 'scale(0.95)';
    form.style.opacity = '0.7';
    
    setTimeout(() => {
        form.reset();
        form.style.transform = 'scale(1)';
        form.style.opacity = '1';
    }, 150);
}

// Show notification system
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: '1000',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '300px',
        animation: 'slideInRight 0.3s ease-out',
        fontWeight: '500'
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Get notification icon
function getNotificationIcon(type) {
    const iconMap = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return iconMap[type] || 'info-circle';
}

// Get notification color
function getNotificationColor(type) {
    const colorMap = {
        success: '#059669',
        error: '#dc2626',
        warning: '#d97706',
        info: '#2563eb'
    };
    return colorMap[type] || '#2563eb';
}

// Add scroll animations
function addScrollAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 2px;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;
        }
        
        .notification-close:hover {
            background: rgba(255,255,255,0.2);
        }
    `;
    document.head.appendChild(style);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.filter) {
        filterBooks(event.state.filter);
    }
});

// Initialize filter from URL on page load
function initializeFilterFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam && ['all', 'to-read', 'reading', 'finished'].includes(filterParam)) {
        currentFilter = filterParam;
        updateActiveFilterButton();
    }
}

// Call initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeFilterFromURL();
    initializeApp();
});
