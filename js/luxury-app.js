/**
 * Enhanced FAQ Page JavaScript Functionality
 * Integrates with luxury-app.js for seamless FAQ experience
 */

class FAQController {
    constructor() {
        this.faqQuestions = document.querySelectorAll('.faq-question');
        this.categoryBtns = document.querySelectorAll('.category-btn');
        this.categoryLinks = document.querySelectorAll('.category-link');
        this.faqSections = document.querySelectorAll('.faq-section');
        this.searchInput = document.getElementById('faqSearch');
        this.faqItems = document.querySelectorAll('.faq-item');
        this.activeCategory = 'all';
        
        this.init();
    }
    
    init() {
        console.log('🔍 Initializing FAQ Controller...');
        this.setupAccordion();
        this.setupCategoryFiltering();
        this.setupSearch();
        this.setupKeyboardNavigation();
        this.setupURLHash();
        console.log('✅ FAQ Controller initialized');
    }
    
    setupAccordion() {
        this.faqQuestions.forEach((question, index) => {
            question.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFAQ(question);
            });
            
            // Keyboard support
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleFAQ(question);
                }
                
                // Arrow key navigation
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.focusNextFAQ(index);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.focusPrevFAQ(index);
                }
            });
        });
    }
    
    toggleFAQ(questionElement) {
        const faqItem = questionElement.parentElement;
        const answer = faqItem.querySelector('.faq-answer');
        const isActive = questionElement.classList.contains('active');
        
        // Close all other open FAQs
        this.faqQuestions.forEach(q => {
            if (q !== questionElement) {
                this.closeFAQ(q);
            }
        });
        
        // Toggle current FAQ
        if (!isActive) {
            this.openFAQ(questionElement, answer);
        } else {
            this.closeFAQ(questionElement);
        }
    }
    
    openFAQ(questionElement, answer) {
        questionElement.classList.add('active');
        questionElement.setAttribute('aria-expanded', 'true');
        answer.classList.add('active');
        answer.setAttribute('aria-hidden', 'false');
        
        // Smooth scroll to question if needed
        setTimeout(() => {
            this.scrollToQuestion(questionElement);
        }, 100);
    }
    
    closeFAQ(questionElement) {
        const answer = questionElement.parentElement.querySelector('.faq-answer');
        questionElement.classList.remove('active');
        questionElement.setAttribute('aria-expanded', 'false');
        answer.classList.remove('active');
        answer.setAttribute('aria-hidden', 'true');
    }
    
    scrollToQuestion(questionElement) {
        const headerHeight = document.getElementById('header')?.offsetHeight || 120;
        const questionTop = questionElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: questionTop,
            behavior: 'smooth'
        });
    }
    
    focusNextFAQ(currentIndex) {
        const visibleQuestions = Array.from(this.faqQuestions).filter(q => 
            q.closest('.faq-item').style.display !== 'none' &&
            !q.closest('.faq-section').classList.contains('hidden')
        );
        
        const nextIndex = (currentIndex + 1) % visibleQuestions.length;
        if (visibleQuestions[nextIndex]) {
            visibleQuestions[nextIndex].focus();
        }
    }
    
    focusPrevFAQ(currentIndex) {
        const visibleQuestions = Array.from(this.faqQuestions).filter(q => 
            q.closest('.faq-item').style.display !== 'none' &&
            !q.closest('.faq-section').classList.contains('hidden')
        );
        
        const prevIndex = currentIndex === 0 ? visibleQuestions.length - 1 : currentIndex - 1;
        if (visibleQuestions[prevIndex]) {
            visibleQuestions[prevIndex].focus();
        }
    }
    
    setupCategoryFiltering() {
        // Category button clicks
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterFAQs(btn.dataset.category);
            });
        });
        
        // Sidebar category link clicks
        this.categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterFAQs(link.dataset.category);
                
                // Smooth scroll to content on mobile
                if (window.innerWidth <= 768) {
                    document.querySelector('.faq-main').scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    filterFAQs(category) {
        this.activeCategory = category;
        
        // Filter sections
        this.faqSections.forEach(section => {
            if (category === 'all' || section.dataset.category === category) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        
        // Update active states
        this.updateActiveStates(category);
        
        // Update URL hash
        if (category !== 'all') {
            window.history.replaceState(null, null, `#${category}`);
        } else {
            window.history.replaceState(null, null, window.location.pathname);
        }
        
        // Close all open FAQs when filtering
        this.closeAllFAQs();
    }
    
    updateActiveStates(category) {
        // Update category buttons
        this.categoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        // Update sidebar links
        this.categoryLinks.forEach(link => {
            link.classList.toggle('active', 
                link.dataset.category === category || 
                (category === 'all' && link.dataset.category === 'services')
            );
        });
    }
    
    closeAllFAQs() {
        this.faqQuestions.forEach(question => {
            this.closeFAQ(question);
        });
    }
    
    setupSearch() {
        if (!this.searchInput) return;
        
        let searchTimeout;
        
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300); // Debounce search
        });
        
        // Clear search on escape
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
    }
    
    performSearch(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.clearSearch();
            return;
        }
        
        let hasResults = false;
        
        // Search through FAQ items
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(term) || answer.includes(term)) {
                item.style.display = 'block';
                hasResults = true;
                
                // Show parent section
                const section = item.closest('.faq-section');
                if (section) {
                    section.classList.remove('hidden');
                }
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show/hide sections based on results
        if (term) {
            this.faqSections.forEach(section => {
                const visibleItems = section.querySelectorAll('.faq-item[style*="block"], .faq-item:not([style*="none"])');
                if (visibleItems.length === 0) {
                    section.classList.add('hidden');
                } else {
                    section.classList.remove('hidden');
                }
            });
        }
        
        // Show no results message if needed
        this.showNoResultsMessage(!hasResults && term);
    }
    
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        // Reset all FAQ items
        this.faqItems.forEach(item => {
            item.style.display = 'block';
        });
        
        // Reset to current category filter
        this.filterFAQs(this.activeCategory);
        
        // Hide no results message
        this.showNoResultsMessage(false);
    }
    
    showNoResultsMessage(show) {
        let noResultsElement = document.querySelector('.no-results-message');
        
        if (show && !noResultsElement) {
            noResultsElement = document.createElement('div');
            noResultsElement.className = 'no-results-message';
            noResultsElement.innerHTML = `
                <div style="text-align: center; padding: var(--space-12); color: var(--gray-medium);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: var(--space-4); opacity: 0.5;"></i>
                    <h3 style="margin-bottom: var(--space-2);">No results found</h3>
                    <p>Try adjusting your search terms or browse by category.</p>
                </div>
            `;
            document.querySelector('.faq-main').appendChild(noResultsElement);
        } else if (!show && noResultsElement) {
            noResultsElement.remove();
        }
    }
    
    setupKeyboardNavigation() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Focus search with Ctrl/Cmd + F
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                if (this.searchInput) {
                    this.searchInput.focus();
                }
            }
            
            // Close all FAQs with Escape
            if (e.key === 'Escape') {
                this.closeAllFAQs();
            }
        });
    }
    
    setupURLHash() {
        // Handle initial hash
        if (window.location.hash) {
            const category = window.location.hash.substring(1);
            if (this.isValidCategory(category)) {
                setTimeout(() => {
                    this.filterFAQs(category);
                }, 100);
            }
        }
        
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const category = window.location.hash.substring(1);
            if (this.isValidCategory(category)) {
                this.filterFAQs(category);
            }
        });
    }
    
    isValidCategory(category) {
        const validCategories = Array.from(this.categoryBtns).map(btn => btn.dataset.category);
        return validCategories.includes(category);
    }
    
    // Public methods for external use
    openFAQByIndex(index) {
        if (this.faqQuestions[index]) {
            this.toggleFAQ(this.faqQuestions[index]);
        }
    }
    
    searchFor(term) {
        if (this.searchInput) {
            this.searchInput.value = term;
            this.performSearch(term);
        }
    }
    
    goToCategory(category) {
        this.filterFAQs(category);
    }
}

// Enhanced FAQ initialization
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the FAQ page
    if (document.querySelector('.faq-content')) {
        window.faqController = new FAQController();
        
        // Add to global app if available
        if (window.app) {
            window.app.faqController = window.faqController;
        }
        
        console.log('✅ FAQ page functionality loaded');
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FAQController;
}
