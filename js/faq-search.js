/*
 * 805 LifeGuard - FAQ Search & Filter System
 * Version: 2.0 - Dedicated, Robust, and Conflict-Free
 * Handles real-time search, category filtering, and accordion functionality
 */

(function() {
    'use strict';
    
    console.log('805 LifeGuard: Loading dedicated FAQ search system...');
    
    // Configuration
    const FAQ_CONFIG = {
        SEARCH_DEBOUNCE_DELAY: 200,
        ANIMATION_DURATION: 300,
        SCROLL_OFFSET: 132,
        MOBILE_SCROLL_OFFSET: 88
    };
    
    // State management
    const FAQState = {
        currentCategory: 'all',
        currentSearchTerm: '',
        isInitialized: false,
        elements: {}
    };
    
    // Initialize FAQ Search System
    function initializeFAQSystem() {
        console.log('805 LifeGuard: Initializing FAQ search system...');
        
        try {
            // Cache DOM elements
            cacheDOMElements();
            
            // Verify required elements exist
            if (!verifyRequiredElements()) {
                console.warn('805 LifeGuard: Required FAQ elements not found, skipping initialization');
                return false;
            }
            
            // Initialize components
            setupSearchInput();
            setupCategoryFilters();
            setupAccordionSystem();
            setupSmoothScrolling();
            setupAccessibility();
            
            // Show all items initially
            showAllFAQItems();
            
            FAQState.isInitialized = true;
            console.log('805 LifeGuard: FAQ search system initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('805 LifeGuard: Error initializing FAQ system:', error);
            return false;
        }
    }
    
    // Cache all DOM elements for better performance
    function cacheDOMElements() {
        FAQState.elements = {
            searchInput: document.getElementById('faqSearch'),
            searchIcon: document.getElementById('searchIcon'),
            clearBtn: document.getElementById('searchClearBtn'),
            searchResults: document.getElementById('searchResults'),
            noResults: document.getElementById('noResults'),
            categoryButtons: document.querySelectorAll('.category-filter-btn'),
            faqItems: document.querySelectorAll('.faq-item'),
            accordions: document.querySelectorAll('.faq-accordion'),
            smoothScrollLinks: document.querySelectorAll('a[href^="#"]')
        };
        
        console.log('805 LifeGuard: Cached', Object.keys(FAQState.elements).length, 'DOM element groups');
    }
    
    // Verify that required elements exist
    function verifyRequiredElements() {
        const required = ['searchInput', 'faqItems'];
        const missing = [];
        
        required.forEach(function(key) {
            if (!FAQState.elements[key] || 
                (FAQState.elements[key].length !== undefined && FAQState.elements[key].length === 0)) {
                missing.push(key);
            }
        });
        
        if (missing.length > 0) {
            console.warn('805 LifeGuard: Missing required FAQ elements:', missing);
            return false;
        }
        
        console.log('805 LifeGuard: All required FAQ elements found');
        return true;
    }
    
    // Setup search input functionality
    function setupSearchInput() {
        const { searchInput, searchIcon, clearBtn } = FAQState.elements;
        
        if (!searchInput) return;
        
        let searchTimeout;
        
        // Real-time search with debouncing
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            FAQState.currentSearchTerm = searchTerm;
            
            // Update search UI
            updateSearchUI(searchTerm);
            
            // Debounced search execution
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                executeSearch(searchTerm, FAQState.currentCategory);
            }, FAQ_CONFIG.SEARCH_DEBOUNCE_DELAY);
        });
        
        // Clear button functionality
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                searchInput.value = '';
                FAQState.currentSearchTerm = '';
                updateSearchUI('');
                executeSearch('', FAQState.currentCategory);
                searchInput.focus();
            });
        }
        
        // Focus/blur effects
        searchInput.addEventListener('focus', function() {
            this.style.borderColor = 'var(--color-secondary)';
            this.style.boxShadow = '0 0 0 4px rgba(184, 160, 130, 0.15)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.style.borderColor = 'var(--color-border-primary)';
            this.style.boxShadow = 'none';
        });
        
        console.log('805 LifeGuard: Search input functionality initialized');
    }
    
    // Setup category filter buttons
    function setupCategoryFilters() {
        const { categoryButtons } = FAQState.elements;
        
        if (!categoryButtons || categoryButtons.length === 0) return;
        
        categoryButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const category = this.dataset.category || 'all';
                FAQState.currentCategory = category;
                
                // Update active button appearance
                updateActiveCategoryButton(this);
                
                // Execute search with current search term
                executeSearch(FAQState.currentSearchTerm, category);
            });
        });
        
        console.log('805 LifeGuard: Category filters initialized for', categoryButtons.length, 'buttons');
    }
    
    // Setup accordion expand/collapse functionality
    function setupAccordionSystem() {
        const { accordions } = FAQState.elements;
        
        if (!accordions || accordions.length === 0) return;
        
        accordions.forEach(function(accordion) {
            accordion.addEventListener('click', function(e) {
                e.preventDefault();
                toggleAccordion(this);
            });
        });
        
        console.log('805 LifeGuard: Accordion system initialized for', accordions.length, 'items');
    }
    
    // Setup smooth scrolling for anchor links
    function setupSmoothScrolling() {
        const { smoothScrollLinks } = FAQState.elements;
        
        if (!smoothScrollLinks || smoothScrollLinks.length === 0) return;
        
        smoothScrollLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (!targetId || targetId === '#' || targetId === '') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    smoothScrollToTarget(target);
                }
            });
        });
        
        console.log('805 LifeGuard: Smooth scrolling initialized for', smoothScrollLinks.length, 'links');
    }
    
    // Setup accessibility features
    function setupAccessibility() {
        const { accordions } = FAQState.elements;
        
        if (!accordions) return;
        
        accordions.forEach(function(accordion) {
            accordion.setAttribute('role', 'button');
            accordion.setAttribute('aria-expanded', 'false');
            
            if (!accordion.getAttribute('tabindex')) {
                accordion.setAttribute('tabindex', '0');
            }
            
            // Keyboard support
            accordion.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAccordion(this);
                }
            });
        });
        
        console.log('805 LifeGuard: Accessibility features initialized');
    }
    
    // Update search UI elements
    function updateSearchUI(searchTerm) {
        const { searchIcon, clearBtn } = FAQState.elements;
        
        if (searchIcon && clearBtn) {
            if (searchTerm) {
                clearBtn.style.opacity = '1';
                searchIcon.style.color = 'var(--color-secondary)';
            } else {
                clearBtn.style.opacity = '0';
                searchIcon.style.color = 'var(--color-text-tertiary)';
            }
        }
    }
    
    // Update active category button appearance
    function updateActiveCategoryButton(activeButton) {
        const { categoryButtons } = FAQState.elements;
        
        if (!categoryButtons) return;
        
        // Reset all buttons
        categoryButtons.forEach(function(btn) {
            btn.style.background = 'var(--color-white)';
            btn.style.color = 'var(--color-text-primary)';
            btn.style.borderColor = 'var(--color-border-primary)';
            btn.classList.remove('active');
        });
        
        // Activate selected button
        if (activeButton) {
            activeButton.style.background = 'var(--color-secondary)';
            activeButton.style.color = 'var(--color-text-inverse)';
            activeButton.style.borderColor = 'var(--color-secondary)';
            activeButton.classList.add('active');
        }
    }
    
    // Execute search and filtering
    function executeSearch(searchTerm, category) {
        const { faqItems } = FAQState.elements;
        
        if (!faqItems || faqItems.length === 0) return;
        
        let visibleCount = 0;
        const searchWords = searchTerm ? searchTerm.split(' ').filter(word => word.length > 0) : [];
        
        faqItems.forEach(function(item, index) {
            const shouldShow = shouldShowFAQItem(item, searchWords, category);
            
            if (shouldShow) {
                showFAQItem(item, index);
                visibleCount++;
            } else {
                hideFAQItem(item);
            }
        });
        
        // Update search results display
        updateSearchResultsDisplay(visibleCount, searchTerm);
        
        // Show/hide no results message
        updateNoResultsDisplay(visibleCount, searchTerm, category);
        
        console.log('805 LifeGuard: Search executed -', visibleCount, 'items visible');
    }
    
    // Determine if FAQ item should be shown based on search and category
    function shouldShowFAQItem(item, searchWords, category) {
        // Check category filter
        const itemCategories = item.dataset.category ? item.dataset.category.split(' ') : ['all'];
        const categoryMatch = category === 'all' || itemCategories.includes(category);
        
        if (!categoryMatch) return false;
        
        // If no search terms, show all items in category
        if (searchWords.length === 0) return true;
        
        // Check search terms
        const itemText = item.textContent.toLowerCase();
        return searchWords.every(word => itemText.includes(word));
    }
    
    // Show FAQ item with animation
    function showFAQItem(item, index) {
        item.style.display = 'block';
        item.classList.remove('hidden');
        
        // Staggered animation
        setTimeout(function() {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, Math.min(index * 50, 300));
    }
    
    // Hide FAQ item with animation
    function hideFAQItem(item) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.classList.add('hidden');
        
        setTimeout(function() {
            if (item.classList.contains('hidden')) {
                item.style.display = 'none';
            }
        }, FAQ_CONFIG.ANIMATION_DURATION);
    }
    
    // Show all FAQ items (initial state)
    function showAllFAQItems() {
        const { faqItems } = FAQState.elements;
        
        if (!faqItems) return;
        
        faqItems.forEach(function(item, index) {
            showFAQItem(item, index);
        });
    }
    
    // Update search results counter
    function updateSearchResultsDisplay(count, searchTerm) {
        const { searchResults } = FAQState.elements;
        
        if (!searchResults) return;
        
        if (searchTerm) {
            searchResults.textContent = count + ' result' + (count !== 1 ? 's' : '') + ' found';
            searchResults.style.opacity = '1';
            searchResults.classList.add('show');
        } else {
            searchResults.style.opacity = '0';
            searchResults.classList.remove('show');
        }
    }
    
    // Update no results message
    function updateNoResultsDisplay(count, searchTerm, category) {
        const { noResults } = FAQState.elements;
        
        if (!noResults) return;
        
        if (count === 0 && (searchTerm || category !== 'all')) {
            noResults.classList.add('show');
        } else {
            noResults.classList.remove('show');
        }
    }
    
    // Toggle accordion open/close
    function toggleAccordion(accordion) {
        const parentCard = accordion.closest('.faq-item') || accordion.parentElement;
        const answer = parentCard.querySelector('.faq-answer');
        const chevron = accordion.querySelector('.fa-chevron-down, .fas.fa-chevron-down');
        
        if (!answer) return;
        
        const isExpanded = answer.classList.contains('expanded');
        
        // Close all other accordions first
        closeAllAccordions(accordion);
        
        // Toggle current accordion
        if (isExpanded) {
            closeAccordion(accordion, answer, chevron);
        } else {
            openAccordion(accordion, answer, chevron);
        }
    }
    
    // Close all accordions except the specified one
    function closeAllAccordions(exceptAccordion) {
        const { accordions } = FAQState.elements;
        
        if (!accordions) return;
        
        accordions.forEach(function(otherAccordion) {
            if (otherAccordion !== exceptAccordion) {
                const parentCard = otherAccordion.closest('.faq-item') || otherAccordion.parentElement;
                const otherAnswer = parentCard.querySelector('.faq-answer');
                const otherChevron = otherAccordion.querySelector('.fa-chevron-down, .fas.fa-chevron-down');
                
                if (otherAnswer && otherAnswer.classList.contains('expanded')) {
                    closeAccordion(otherAccordion, otherAnswer, otherChevron);
                }
            }
        });
    }
    
    // Open specific accordion
    function openAccordion(accordion, answer, chevron) {
        answer.classList.add('expanded');
        accordion.setAttribute('aria-expanded', 'true');
        
        if (chevron) {
            chevron.style.transform = 'rotate(180deg)';
        }
        
        // Smooth scroll to accordion after opening
        setTimeout(function() {
            smoothScrollToTarget(accordion);
        }, FAQ_CONFIG.ANIMATION_DURATION);
    }
    
    // Close specific accordion
    function closeAccordion(accordion, answer, chevron) {
        answer.classList.remove('expanded');
        accordion.setAttribute('aria-expanded', 'false');
        
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
    }
    
    // Smooth scroll to target element
    function smoothScrollToTarget(target) {
        if (!target) return;
        
        const isMobile = window.innerWidth <= 768;
        const offset = isMobile ? FAQ_CONFIG.MOBILE_SCROLL_OFFSET : FAQ_CONFIG.SCROLL_OFFSET;
        const targetPosition = target.offsetTop - offset;
        
        window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
        });
    }
    
    // Public API for external access
    window.FAQSearchSystem = {
        isInitialized: function() {
            return FAQState.isInitialized;
        },
        
        search: function(term) {
            if (!FAQState.isInitialized) return false;
            FAQState.currentSearchTerm = term.toLowerCase().trim();
            if (FAQState.elements.searchInput) {
                FAQState.elements.searchInput.value = term;
            }
            executeSearch(FAQState.currentSearchTerm, FAQState.currentCategory);
            return true;
        },
        
        setCategory: function(category) {
            if (!FAQState.isInitialized) return false;
            FAQState.currentCategory = category;
            
            // Update button if exists
            const targetButton = Array.from(FAQState.elements.categoryButtons || [])
                .find(btn => btn.dataset.category === category);
            if (targetButton) {
                updateActiveCategoryButton(targetButton);
            }
            
            executeSearch(FAQState.currentSearchTerm, category);
            return true;
        },
        
        reset: function() {
            if (!FAQState.isInitialized) return false;
            FAQState.currentSearchTerm = '';
            FAQState.currentCategory = 'all';
            
            if (FAQState.elements.searchInput) {
                FAQState.elements.searchInput.value = '';
            }
            
            updateSearchUI('');
            showAllFAQItems();
            updateSearchResultsDisplay(FAQState.elements.faqItems.length, '');
            updateNoResultsDisplay(FAQState.elements.faqItems.length, '', 'all');
            
            return true;
        },
        
        getState: function() {
            return {
                isInitialized: FAQState.isInitialized,
                currentCategory: FAQState.currentCategory,
                currentSearchTerm: FAQState.currentSearchTerm,
                totalItems: FAQState.elements.faqItems ? FAQState.elements.faqItems.length : 0
            };
        }
    };
    
    // Initialize when DOM is ready
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initializeFAQSystem, 100); // Small delay to ensure all elements are ready
            });
        } else {
            setTimeout(initializeFAQSystem, 100);
        }
    }
    
    // Auto-initialize
    initialize();
    
    // Development/debug logging
    if (window.location.hostname === 'localhost' || 
        window.location.search.includes('debug=true')) {
        
        window.FAQDebug = {
            state: FAQState,
            config: FAQ_CONFIG,
            search: window.FAQSearchSystem
        };
        
        console.log('805 LifeGuard: FAQ debug mode active');
        console.log('Access FAQ system via window.FAQSearchSystem');
        console.log('Access debug info via window.FAQDebug');
    }
    
})();