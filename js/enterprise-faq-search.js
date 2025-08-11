/*
 * 805 LifeGuard - Enterprise FAQ Search & Filter System
 * Version: 3.0 - Advanced Search with Fuzzy Matching, Relevance Scoring & Real-time Suggestions
 * Robust enterprise-level search functionality maintaining Caruso aesthetic
 */

(function() {
    'use strict';
    
    console.log('805 LifeGuard: Loading Enterprise FAQ Search System v3.0...');
    
    // === ENTERPRISE CONFIGURATION ===
    const ENTERPRISE_CONFIG = {
        SEARCH: {
            DEBOUNCE_DELAY: 150,
            MIN_SEARCH_LENGTH: 2,
            MAX_SUGGESTIONS: 5,
            FUZZY_THRESHOLD: 0.6,
            HIGHLIGHT_CLASS: 'search-highlight',
            MAX_EXCERPT_LENGTH: 150
        },
        
        ANIMATIONS: {
            FAST: 200,
            NORMAL: 300,
            SLOW: 500,
            ENTRANCE_STAGGER: 50
        },
        
        PERFORMANCE: {
            VIRTUAL_SCROLL_THRESHOLD: 50,
            CACHE_SIZE: 100,
            PRELOAD_SUGGESTIONS: true
        },
        
        ACCESSIBILITY: {
            LIVE_REGION_DELAY: 500,
            FOCUS_TIMEOUT: 100
        }
    };
    
    // === ADVANCED SEARCH ENGINE ===
    class AdvancedSearchEngine {
        constructor() {
            this.searchIndex = new Map();
            this.suggestionCache = new Map();
            this.searchHistory = [];
            this.stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
        }
        
        // Build comprehensive search index
        buildIndex(faqItems) {
            console.log('Building enterprise search index...');
            
            faqItems.forEach((item, index) => {
                const content = this.extractSearchableContent(item);
                const tokens = this.tokenize(content);
                const categories = this.extractCategories(item);
                
                this.searchIndex.set(index, {
                    element: item,
                    content: content,
                    tokens: tokens,
                    categories: categories,
                    searchableText: content.toLowerCase(),
                    title: this.extractTitle(item),
                    answer: this.extractAnswer(item)
                });
            });
            
            console.log(`Search index built with ${this.searchIndex.size} items`);
        }
        
        // Extract all searchable content from FAQ item
        extractSearchableContent(item) {
            const textContent = item.textContent || '';
            // Remove extra whitespace and normalize
            return textContent.replace(/\s+/g, ' ').trim();
        }
        
        // Extract title from FAQ item
        extractTitle(item) {
            const titleElement = item.querySelector('.service-title, h3, .faq-question, .faq-accordion h3, button h3');
            return titleElement ? titleElement.textContent.trim() : '';
        }
        
        // Extract answer from FAQ item
        extractAnswer(item) {
            const answerElement = item.querySelector('.faq-answer, .service-description, .member-description');
            return answerElement ? answerElement.textContent.trim() : '';
        }
        
        // Extract categories
        extractCategories(item) {
            const categories = item.dataset.category || 'all';
            return categories.split(' ').filter(cat => cat.trim());
        }
        
        // Advanced tokenization
        tokenize(text) {
            return text
                .toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(token => token.length > 1 && !this.stopWords.has(token));
        }
        
        // Fuzzy search with Levenshtein distance
        calculateLevenshteinDistance(str1, str2) {
            const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
            
            for (let i = 0; i <= str1.length; i++) {
                matrix[0][i] = i;
            }
            
            for (let j = 0; j <= str2.length; j++) {
                matrix[j][0] = j;
            }
            
            for (let j = 1; j <= str2.length; j++) {
                for (let i = 1; i <= str1.length; i++) {
                    const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                    matrix[j][i] = Math.min(
                        matrix[j][i - 1] + 1,
                        matrix[j - 1][i] + 1,
                        matrix[j - 1][i - 1] + indicator
                    );
                }
            }
            
            return matrix[str2.length][str1.length];
        }
        
        // Calculate fuzzy match score
        calculateFuzzyScore(searchTerm, text) {
            if (!searchTerm || !text) return 0;
            
            const distance = this.calculateLevenshteinDistance(searchTerm.toLowerCase(), text.toLowerCase());
            const maxLength = Math.max(searchTerm.length, text.length);
            
            return maxLength === 0 ? 1 : 1 - (distance / maxLength);
        }
        
        // Advanced search with relevance scoring
        search(query, categoryFilter = 'all') {
            if (!query || query.length < ENTERPRISE_CONFIG.SEARCH.MIN_SEARCH_LENGTH) {
                return this.getAllResults(categoryFilter);
            }
            
            const searchTerms = this.tokenize(query);
            const results = [];
            
            this.searchIndex.forEach((item, index) => {
                // Category filter
                if (categoryFilter !== 'all' && !item.categories.includes(categoryFilter)) {
                    return;
                }
                
                const score = this.calculateRelevanceScore(searchTerms, query, item);
                
                if (score > 0) {
                    results.push({
                        index,
                        element: item.element,
                        score,
                        title: item.title,
                        excerpt: this.generateExcerpt(query, item.content),
                        matchedTerms: this.getMatchedTerms(searchTerms, item.tokens),
                        categories: item.categories
                    });
                }
            });
            
            // Sort by relevance score (descending)
            results.sort((a, b) => b.score - a.score);
            
            // Add to search history
            this.addToSearchHistory(query);
            
            return results;
        }
        
        // Calculate comprehensive relevance score
        calculateRelevanceScore(searchTerms, originalQuery, item) {
            let score = 0;
            const title = item.title.toLowerCase();
            const content = item.searchableText;
            
            // Exact phrase match in title (highest priority)
            if (title.includes(originalQuery.toLowerCase())) {
                score += 100;
            }
            
            // Exact phrase match in content
            if (content.includes(originalQuery.toLowerCase())) {
                score += 50;
            }
            
            // Individual term matches
            searchTerms.forEach(term => {
                // Title matches (high priority)
                if (title.includes(term)) {
                    score += 20;
                }
                
                // Content matches
                const termCount = (content.match(new RegExp(term, 'gi')) || []).length;
                score += termCount * 5;
                
                // Fuzzy matches
                item.tokens.forEach(token => {
                    const fuzzyScore = this.calculateFuzzyScore(term, token);
                    if (fuzzyScore >= ENTERPRISE_CONFIG.SEARCH.FUZZY_THRESHOLD) {
                        score += fuzzyScore * 3;
                    }
                });
            });
            
            // Boost score for shorter content (more relevant)
            const lengthBoost = Math.max(0, 10 - (content.length / 100));
            score += lengthBoost;
            
            return score;
        }
        
        // Generate contextual excerpt
        generateExcerpt(query, content) {
            const maxLength = ENTERPRISE_CONFIG.SEARCH.MAX_EXCERPT_LENGTH;
            const queryLower = query.toLowerCase();
            const contentLower = content.toLowerCase();
            
            let startIndex = contentLower.indexOf(queryLower);
            
            if (startIndex === -1) {
                // If exact query not found, find first search term
                const terms = this.tokenize(query);
                for (const term of terms) {
                    startIndex = contentLower.indexOf(term);
                    if (startIndex !== -1) break;
                }
            }
            
            if (startIndex === -1) {
                return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
            }
            
            // Calculate excerpt boundaries
            const buffer = Math.floor((maxLength - query.length) / 2);
            const actualStart = Math.max(0, startIndex - buffer);
            const actualEnd = Math.min(content.length, actualStart + maxLength);
            
            let excerpt = content.substring(actualStart, actualEnd);
            
            if (actualStart > 0) excerpt = '...' + excerpt;
            if (actualEnd < content.length) excerpt = excerpt + '...';
            
            return excerpt;
        }
        
        // Get matched search terms
        getMatchedTerms(searchTerms, itemTokens) {
            const matched = [];
            
            searchTerms.forEach(term => {
                itemTokens.forEach(token => {
                    if (token.includes(term) || this.calculateFuzzyScore(term, token) >= ENTERPRISE_CONFIG.SEARCH.FUZZY_THRESHOLD) {
                        if (!matched.includes(token)) {
                            matched.push(token);
                        }
                    }
                });
            });
            
            return matched;
        }
        
        // Get all results for category filter
        getAllResults(categoryFilter = 'all') {
            const results = [];
            
            this.searchIndex.forEach((item, index) => {
                if (categoryFilter === 'all' || item.categories.includes(categoryFilter)) {
                    results.push({
                        index,
                        element: item.element,
                        score: 1,
                        title: item.title,
                        excerpt: item.content.substring(0, ENTERPRISE_CONFIG.SEARCH.MAX_EXCERPT_LENGTH),
                        matchedTerms: [],
                        categories: item.categories
                    });
                }
            });
            
            return results;
        }
        
        // Generate search suggestions
        generateSuggestions(partialQuery) {
            if (!partialQuery || partialQuery.length < 2) return [];
            
            const cacheKey = partialQuery.toLowerCase();
            if (this.suggestionCache.has(cacheKey)) {
                return this.suggestionCache.get(cacheKey);
            }
            
            const suggestions = new Set();
            const queryLower = partialQuery.toLowerCase();
            
            // Add suggestions from search history
            this.searchHistory.forEach(historyItem => {
                if (historyItem.toLowerCase().includes(queryLower)) {
                    suggestions.add(historyItem);
                }
            });
            
            // Add suggestions from FAQ content
            this.searchIndex.forEach(item => {
                const words = item.tokens;
                words.forEach(word => {
                    if (word.length > 3 && word.startsWith(queryLower)) {
                        suggestions.add(word);
                    }
                });
                
                // Add title-based suggestions
                if (item.title.toLowerCase().includes(queryLower)) {
                    suggestions.add(item.title);
                }
            });
            
            const result = Array.from(suggestions)
                .slice(0, ENTERPRISE_CONFIG.SEARCH.MAX_SUGGESTIONS)
                .sort((a, b) => a.length - b.length);
            
            this.suggestionCache.set(cacheKey, result);
            return result;
        }
        
        // Add to search history
        addToSearchHistory(query) {
            if (!query.trim()) return;
            
            // Remove if already exists
            const index = this.searchHistory.indexOf(query);
            if (index > -1) {
                this.searchHistory.splice(index, 1);
            }
            
            // Add to beginning
            this.searchHistory.unshift(query);
            
            // Limit history size
            if (this.searchHistory.length > 20) {
                this.searchHistory = this.searchHistory.slice(0, 20);
            }
        }
        
        // Clear caches
        clearCache() {
            this.suggestionCache.clear();
            console.log('Search cache cleared');
        }
    }
    
    // === ENTERPRISE FAQ CONTROLLER ===
    class EnterpriseFAQController {
        constructor() {
            this.searchEngine = new AdvancedSearchEngine();
            this.currentResults = [];
            this.currentQuery = '';
            this.currentCategory = 'all';
            this.isInitialized = false;
            this.elements = {};
            this.cleanupFunctions = [];
            this.searchTimeout = null;
            this.suggestionTimeout = null;
            
            this.init();
        }
        
        async init() {
            console.log('Initializing Enterprise FAQ Controller...');
            
            try {
                await this.cacheDOMElements();
                
                if (!this.verifyRequiredElements()) {
                    console.warn('Required FAQ elements not found');
                    return false;
                }
                
                await this.initializeComponents();
                this.isInitialized = true;
                
                console.log('Enterprise FAQ Controller initialized successfully');
                return true;
                
            } catch (error) {
                console.error('Error initializing Enterprise FAQ Controller:', error);
                return false;
            }
        }
        
        // Cache DOM elements
        async cacheDOMElements() {
            this.elements = {
                searchInput: document.getElementById('faqSearch'),
                searchIcon: document.getElementById('searchIcon'),
                clearBtn: document.getElementById('searchClearBtn'),
                searchResults: document.getElementById('searchResults'),
                noResults: document.getElementById('noResults'),
                categoryButtons: document.querySelectorAll('.category-filter-btn'),
                faqItems: document.querySelectorAll('.faq-item'),
                accordions: document.querySelectorAll('.faq-accordion'),
                container: document.querySelector('.faq-search-container'),
                searchContainer: document.querySelector('.about-section'),
                resultsContainer: null // Will be created
            };
            
            // Create additional elements
            await this.createEnhancedElements();
            
            console.log('DOM elements cached and enhanced');
        }
        
        // Create enhanced search elements
        async createEnhancedElements() {
            if (!this.elements.container) return;
            
            // Create suggestions dropdown
            this.elements.suggestionsDropdown = this.createSuggestionsDropdown();
            this.elements.container.appendChild(this.elements.suggestionsDropdown);
            
            // Create results container
            this.elements.resultsContainer = this.createResultsContainer();
            if (this.elements.searchContainer) {
                this.elements.searchContainer.appendChild(this.elements.resultsContainer);
            }
            
            // Create live region for accessibility
            this.elements.liveRegion = this.createLiveRegion();
            document.body.appendChild(this.elements.liveRegion);
            
            // Create loading indicator
            this.elements.loadingIndicator = this.createLoadingIndicator();
            this.elements.container.appendChild(this.elements.loadingIndicator);
        }
        
        // Create suggestions dropdown
        createSuggestionsDropdown() {
            const dropdown = document.createElement('div');
            dropdown.className = 'search-suggestions-dropdown';
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--color-white);
                border: 1px solid var(--color-border-primary);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-lg);
                max-height: 300px;
                overflow-y: auto;
                z-index: 1000;
                opacity: 0;
                transform: translateY(-10px);
                transition: all ${ENTERPRISE_CONFIG.ANIMATIONS.FAST}ms ease;
                pointer-events: none;
                margin-top: 4px;
            `;
            dropdown.setAttribute('role', 'listbox');
            dropdown.setAttribute('aria-label', 'Search suggestions');
            
            return dropdown;
        }
        
        // Create results container
        createResultsContainer() {
            const container = document.createElement('div');
            container.className = 'search-results-container';
            container.style.cssText = `
                background: var(--color-bg-primary);
                border-radius: var(--radius-2xl);
                padding: var(--spacing-6);
                margin: var(--spacing-8) 0;
                border: 1px solid var(--color-border-primary);
                opacity: 0;
                transform: translateY(20px);
                transition: all ${ENTERPRISE_CONFIG.ANIMATIONS.NORMAL}ms ease;
                pointer-events: none;
            `;
            
            container.innerHTML = `
                <div class="results-header">
                    <h3 style="margin: 0 0 var(--spacing-4) 0; font-family: var(--font-family-serif); color: var(--color-text-primary);">Search Results</h3>
                    <div class="results-meta" style="color: var(--color-text-secondary); font-size: var(--font-size-sm);"></div>
                </div>
                <div class="results-list"></div>
            `;
            
            return container;
        }
        
        // Create live region for accessibility
        createLiveRegion() {
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            `;
            return liveRegion;
        }
        
        // Create loading indicator
        createLoadingIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'search-loading-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: 50%;
                right: var(--spacing-12);
                transform: translateY(-50%);
                opacity: 0;
                transition: opacity ${ENTERPRISE_CONFIG.ANIMATIONS.FAST}ms ease;
                pointer-events: none;
            `;
            
            indicator.innerHTML = `
                <div style="width: 16px; height: 16px; border: 2px solid var(--color-border-primary); border-top: 2px solid var(--color-secondary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            `;
            
            return indicator;
        }
        
        // Verify required elements
        verifyRequiredElements() {
            const required = ['searchInput', 'faqItems'];
            return required.every(key => {
                const element = this.elements[key];
                return element && (element.length === undefined || element.length > 0);
            });
        }
        
        // Initialize all components
        async initializeComponents() {
            // Build search index
            const faqArray = Array.from(this.elements.faqItems);
            this.searchEngine.buildIndex(faqArray);
            
            // Setup event listeners
            this.setupAdvancedSearch();
            this.setupCategoryFilters();
            this.setupAccordionSystem();
            this.setupKeyboardNavigation();
            this.setupAccessibility();
            
            // Show all items initially
            this.displayResults(this.searchEngine.getAllResults(), '', 'all');
        }
        
        // Setup advanced search functionality
        setupAdvancedSearch() {
            if (!this.elements.searchInput) return;
            
            const input = this.elements.searchInput;
            
            // Enhanced input handler with debouncing
            const inputHandler = (e) => {
                const query = e.target.value.trim();
                this.currentQuery = query;
                
                clearTimeout(this.searchTimeout);
                clearTimeout(this.suggestionTimeout);
                
                // Update UI immediately
                this.updateSearchUI(query);
                
                // Show loading
                if (query.length >= ENTERPRISE_CONFIG.SEARCH.MIN_SEARCH_LENGTH) {
                    this.showLoading(true);
                }
                
                // Debounced search
                this.searchTimeout = setTimeout(() => {
                    this.executeAdvancedSearch(query, this.currentCategory);
                }, ENTERPRISE_CONFIG.SEARCH.DEBOUNCE_DELAY);
                
                // Debounced suggestions
                if (query.length >= 2) {
                    this.suggestionTimeout = setTimeout(() => {
                        this.showSuggestions(query);
                    }, ENTERPRISE_CONFIG.SEARCH.DEBOUNCE_DELAY / 2);
                }
            };
            
            this.addEventListenerWithCleanup(input, 'input', inputHandler);
            
            // Focus/blur handlers
            this.addEventListenerWithCleanup(input, 'focus', () => {
                if (this.currentQuery.length >= 2) {
                    this.showSuggestions(this.currentQuery);
                }
            });
            
            this.addEventListenerWithCleanup(input, 'blur', () => {
                setTimeout(() => this.hideSuggestions(), 150);
            });
            
            // Clear button
            if (this.elements.clearBtn) {
                this.addEventListenerWithCleanup(this.elements.clearBtn, 'click', () => {
                    this.clearSearch();
                });
            }
        }
        
        // Execute advanced search
        async executeAdvancedSearch(query, category) {
            try {
                this.showLoading(true);
                
                // Small delay to show loading state
                await new Promise(resolve => setTimeout(resolve, 50));
                
                const results = this.searchEngine.search(query, category);
                this.currentResults = results;
                
                this.displayResults(results, query, category);
                this.updateLiveRegion(results, query);
                
                this.showLoading(false);
                
            } catch (error) {
                console.error('Search error:', error);
                this.showError('Search encountered an error. Please try again.');
                this.showLoading(false);
            }
        }
        
        // Display search results
        displayResults(results, query, category) {
            const hasQuery = query && query.length >= ENTERPRISE_CONFIG.SEARCH.MIN_SEARCH_LENGTH;
            
            if (hasQuery || category !== 'all') {
                this.showSearchResults(results, query);
                this.hideOriginalFAQs();
            } else {
                this.hideSearchResults();
                this.showOriginalFAQs();
            }
            
            this.updateSearchMetrics(results, query, category);
        }
        
        // Show search results
        showSearchResults(results, query) {
            const container = this.elements.resultsContainer;
            if (!container) return;
            
            const resultsList = container.querySelector('.results-list');
            
            // Clear previous results
            resultsList.innerHTML = '';
            
            if (results.length === 0) {
                this.showNoResults(query);
                return;
            }
            
            // Create result items
            results.forEach((result, index) => {
                const resultElement = this.createResultElement(result, query, index);
                resultsList.appendChild(resultElement);
            });
            
            // Show container with animation
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
            container.style.pointerEvents = 'auto';
            
            // Hide no results
            if (this.elements.noResults) {
                this.elements.noResults.classList.remove('show');
            }
        }
        
        // Create individual result element
        createResultElement(result, query, index) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'search-result-item';
            resultDiv.style.cssText = `
                background: var(--color-bg-secondary);
                border-radius: var(--radius-xl);
                padding: var(--spacing-6);
                margin-bottom: var(--spacing-4);
                border: 1px solid var(--color-border-primary);
                cursor: pointer;
                transition: all ${ENTERPRISE_CONFIG.ANIMATIONS.FAST}ms ease;
                opacity: 0;
                transform: translateY(20px);
                animation: fadeInUp ${ENTERPRISE_CONFIG.ANIMATIONS.NORMAL}ms ease forwards;
                animation-delay: ${index * ENTERPRISE_CONFIG.ANIMATIONS.ENTRANCE_STAGGER}ms;
            `;
            
            // Add hover effects
            resultDiv.addEventListener('mouseenter', () => {
                resultDiv.style.transform = 'translateY(-2px)';
                resultDiv.style.boxShadow = 'var(--shadow-md)';
                resultDiv.style.borderColor = 'var(--color-secondary)';
            });
            
            resultDiv.addEventListener('mouseleave', () => {
                resultDiv.style.transform = 'translateY(0)';
                resultDiv.style.boxShadow = 'none';
                resultDiv.style.borderColor = 'var(--color-border-primary)';
            });
            
            // Click handler
            resultDiv.addEventListener('click', () => {
                this.scrollToOriginalItem(result.element);
                this.highlightOriginalItem(result.element);
            });
            
            const highlightedTitle = this.highlightSearchTerms(result.title, query);
            const highlightedExcerpt = this.highlightSearchTerms(result.excerpt, query);
            
            resultDiv.innerHTML = `
                <div class="result-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-3);">
                    <h4 style="margin: 0; font-family: var(--font-family-serif); font-size: var(--font-size-xl); color: var(--color-text-primary); line-height: 1.3;">${highlightedTitle}</h4>
                    <div class="result-score" style="background: var(--color-secondary); color: var(--color-white); padding: var(--spacing-1) var(--spacing-2); border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium);">
                        ${Math.round(result.score)}% match
                    </div>
                </div>
                <p class="result-excerpt" style="color: var(--color-text-secondary); line-height: var(--line-height-relaxed); margin: 0 0 var(--spacing-3) 0;">${highlightedExcerpt}</p>
                <div class="result-meta" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="result-categories">
                        ${result.categories.map(cat => `<span style="background: rgba(184, 160, 130, 0.1); color: var(--color-secondary-dark); padding: var(--spacing-1) var(--spacing-2); border-radius: var(--radius-base); font-size: var(--font-size-xs); margin-right: var(--spacing-1);">${cat}</span>`).join('')}
                    </div>
                    <div class="result-action" style="color: var(--color-secondary); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">
                        Click to view → 
                    </div>
                </div>
            `;
            
            return resultDiv;
        }
        
        // Highlight search terms in text
        highlightSearchTerms(text, query) {
            if (!query || !text) return text;
            
            const terms = this.searchEngine.tokenize(query);
            let highlightedText = text;
            
            terms.forEach(term => {
                const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
                highlightedText = highlightedText.replace(regex, `<mark class="${ENTERPRISE_CONFIG.SEARCH.HIGHLIGHT_CLASS}">$1</mark>`);
            });
            
            return highlightedText;
        }
        
        // Escape special regex characters
        escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        // Hide search results
        hideSearchResults() {
            if (this.elements.resultsContainer) {
                this.elements.resultsContainer.style.opacity = '0';
                this.elements.resultsContainer.style.transform = 'translateY(20px)';
                this.elements.resultsContainer.style.pointerEvents = 'none';
            }
        }
        
        // Show original FAQ items
        showOriginalFAQs() {
            this.elements.faqItems.forEach((item, index) => {
                item.style.display = 'block';
                item.classList.remove('hidden');
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            });
        }
        
        // Hide original FAQ items
        hideOriginalFAQs() {
            this.elements.faqItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.classList.add('hidden');
                setTimeout(() => {
                    if (item.classList.contains('hidden')) {
                        item.style.display = 'none';
                    }
                }, ENTERPRISE_CONFIG.ANIMATIONS.NORMAL);
            });
        }
        
        // Show suggestions dropdown
        showSuggestions(query) {
            const suggestions = this.searchEngine.generateSuggestions(query);
            const dropdown = this.elements.suggestionsDropdown;
            
            if (suggestions.length === 0) {
                this.hideSuggestions();
                return;
            }
            
            dropdown.innerHTML = '';
            
            suggestions.forEach((suggestion, index) => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.style.cssText = `
                    padding: var(--spacing-3) var(--spacing-4);
                    cursor: pointer;
                    transition: background ${ENTERPRISE_CONFIG.ANIMATIONS.FAST}ms ease;
                    border-bottom: 1px solid var(--color-border-secondary);
                `;
                
                if (index === suggestions.length - 1) {
                    item.style.borderBottom = 'none';
                }
                
                item.addEventListener('mouseenter', () => {
                    item.style.background = 'var(--color-bg-secondary)';
                });
                
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'transparent';
                });
                
                item.addEventListener('click', () => {
                    this.selectSuggestion(suggestion);
                });
                
                const highlightedSuggestion = this.highlightSearchTerms(suggestion, query);
                item.innerHTML = `<span style="color: var(--color-text-primary);">${highlightedSuggestion}</span>`;
                
                dropdown.appendChild(item);
            });
            
            dropdown.style.opacity = '1';
            dropdown.style.transform = 'translateY(0)';
            dropdown.style.pointerEvents = 'auto';
        }
        
        // Hide suggestions dropdown
        hideSuggestions() {
            const dropdown = this.elements.suggestionsDropdown;
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'translateY(-10px)';
            dropdown.style.pointerEvents = 'none';
        }
        
        // Select suggestion
        selectSuggestion(suggestion) {
            this.elements.searchInput.value = suggestion;
            this.currentQuery = suggestion;
            this.hideSuggestions();
            this.executeAdvancedSearch(suggestion, this.currentCategory);
        }
        
        // Setup category filters
        setupCategoryFilters() {
            if (!this.elements.categoryButtons) return;
            
            this.elements.categoryButtons.forEach(button => {
                this.addEventListenerWithCleanup(button, 'click', () => {
                    const category = button.dataset.category || 'all';
                    this.currentCategory = category;
                    
                    this.updateActiveCategoryButton(button);
                    this.executeAdvancedSearch(this.currentQuery, category);
                });
            });
        }
        
        // Update active category button
        updateActiveCategoryButton(activeButton) {
            this.elements.categoryButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = 'var(--color-white)';
                btn.style.color = 'var(--color-text-primary)';
                btn.style.borderColor = 'var(--color-border-primary)';
            });
            
            activeButton.classList.add('active');
            activeButton.style.background = 'var(--color-secondary)';
            activeButton.style.color = 'var(--color-text-inverse)';
            activeButton.style.borderColor = 'var(--color-secondary)';
        }
        
        // Setup accordion system
        setupAccordionSystem() {
            this.elements.accordions.forEach(accordion => {
                this.addEventListenerWithCleanup(accordion, 'click', (e) => {
                    e.preventDefault();
                    this.toggleAccordion(accordion);
                });
            });
        }
        
        // Toggle accordion
        toggleAccordion(accordion) {
            const parentCard = accordion.closest('.faq-item') || accordion.parentElement;
            const answer = parentCard.querySelector('.faq-answer');
            const chevron = accordion.querySelector('.fa-chevron-down');
            
            if (!answer) return;
            
            const isExpanded = answer.classList.contains('expanded');
            
            // Close all other accordions
            this.closeAllAccordions(accordion);
            
            if (isExpanded) {
                this.closeAccordion(accordion, answer, chevron);
            } else {
                this.openAccordion(accordion, answer, chevron);
            }
        }
        
        // Close all accordions except specified
        closeAllAccordions(exceptAccordion) {
            this.elements.accordions.forEach(otherAccordion => {
                if (otherAccordion !== exceptAccordion) {
                    const parentCard = otherAccordion.closest('.faq-item') || otherAccordion.parentElement;
                    const answer = parentCard.querySelector('.faq-answer');
                    const chevron = otherAccordion.querySelector('.fa-chevron-down');
                    
                    if (answer && answer.classList.contains('expanded')) {
                        this.closeAccordion(otherAccordion, answer, chevron);
                    }
                }
            });
        }
        
        // Open accordion
        openAccordion(accordion, answer, chevron) {
            answer.classList.add('expanded');
            accordion.setAttribute('aria-expanded', 'true');
            
            if (chevron) {
                chevron.style.transform = 'rotate(180deg)';
            }
        }
        
        // Close accordion
        closeAccordion(accordion, answer, chevron) {
            answer.classList.remove('expanded');
            accordion.setAttribute('aria-expanded', 'false');
            
            if (chevron) {
                chevron.style.transform = 'rotate(0deg)';
            }
        }
        
        // Scroll to original FAQ item
        scrollToOriginalItem(element) {
            // First show the original FAQs
            this.hideSearchResults();
            this.showOriginalFAQs();
            
            setTimeout(() => {
                const headerHeight = window.innerWidth <= 768 ? 88 : 132;
                const targetPosition = element.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Open the accordion if it's not already open
                const accordion = element.querySelector('.faq-accordion');
                if (accordion) {
                    const answer = element.querySelector('.faq-answer');
                    if (answer && !answer.classList.contains('expanded')) {
                        this.toggleAccordion(accordion);
                    }
                }
            }, 100);
        }
        
        // Highlight original FAQ item
        highlightOriginalItem(element) {
            // Remove previous highlights
            document.querySelectorAll('.faq-item.highlighted').forEach(item => {
                item.classList.remove('highlighted');
            });
            
            // Add highlight to target element
            element.classList.add('highlighted');
            
            // Add temporary highlight styles
            const originalBorder = element.style.border;
            const originalBackground = element.style.background;
            
            element.style.border = '2px solid var(--color-secondary)';
            element.style.background = 'rgba(184, 160, 130, 0.05)';
            
            // Remove highlight after delay
            setTimeout(() => {
                element.style.border = originalBorder;
                element.style.background = originalBackground;
                element.classList.remove('highlighted');
            }, 3000);
        }
        
        // Update search UI
        updateSearchUI(query) {
            const { searchIcon, clearBtn } = this.elements;
            
            if (searchIcon && clearBtn) {
                if (query) {
                    clearBtn.style.opacity = '1';
                    searchIcon.style.color = 'var(--color-secondary)';
                } else {
                    clearBtn.style.opacity = '0';
                    searchIcon.style.color = 'var(--color-text-tertiary)';
                }
            }
        }
        
        // Show/hide loading indicator
        showLoading(show) {
            if (this.elements.loadingIndicator) {
                this.elements.loadingIndicator.style.opacity = show ? '1' : '0';
            }
        }
        
        // Update search metrics
        updateSearchMetrics(results, query, category) {
            if (!this.elements.searchResults) return;
            
            const hasActiveFilter = query || category !== 'all';
            
            if (hasActiveFilter) {
                const filterText = category !== 'all' ? ` in "${category}"` : '';
                const queryText = query ? ` for "${query}"` : '';
                this.elements.searchResults.textContent = 
                    `${results.length} result${results.length !== 1 ? 's' : ''} found${queryText}${filterText}`;
                this.elements.searchResults.classList.add('show');
            } else {
                this.elements.searchResults.classList.remove('show');
            }
        }
        
        // Update live region for screen readers
        updateLiveRegion(results, query) {
            if (!this.elements.liveRegion) return;
            
            setTimeout(() => {
                const message = query ? 
                    `Search completed. ${results.length} results found for "${query}".` :
                    `Showing all FAQ items.`;
                this.elements.liveRegion.textContent = message;
            }, ENTERPRISE_CONFIG.ACCESSIBILITY.LIVE_REGION_DELAY);
        }
        
        // Show no results state
        showNoResults(query) {
            if (this.elements.noResults) {
                this.elements.noResults.classList.add('show');
                
                const message = this.elements.noResults.querySelector('p');
                if (message && query) {
                    message.textContent = `No results found for "${query}". Try different keywords or browse all FAQs.`;
                }
            }
        }
        
        // Show error message
        showError(message) {
            console.error('FAQ Search Error:', message);
            // Could implement toast notification here
        }
        
        // Clear search
        clearSearch() {
            this.elements.searchInput.value = '';
            this.currentQuery = '';
            this.currentCategory = 'all';
            
            // Reset category buttons
            const allButton = Array.from(this.elements.categoryButtons)
                .find(btn => btn.dataset.category === 'all');
            if (allButton) {
                this.updateActiveCategoryButton(allButton);
            }
            
            this.updateSearchUI('');
            this.hideSuggestions();
            this.hideSearchResults();
            this.showOriginalFAQs();
            this.updateSearchMetrics([], '', 'all');
            
            this.elements.searchInput.focus();
        }
        
        // Setup keyboard navigation
        setupKeyboardNavigation() {
            // Arrow key navigation for suggestions
            this.addEventListenerWithCleanup(this.elements.searchInput, 'keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideSuggestions();
                    this.elements.searchInput.blur();
                }
                
                if (e.key === 'Enter') {
                    this.hideSuggestions();
                }
            });
        }
        
        // Setup accessibility features
        setupAccessibility() {
            // ARIA attributes for search input
            this.elements.searchInput.setAttribute('aria-describedby', 'search-instructions');
            this.elements.searchInput.setAttribute('autocomplete', 'off');
            this.elements.searchInput.setAttribute('aria-expanded', 'false');
            
            // Add search instructions
            if (!document.getElementById('search-instructions')) {
                const instructions = document.createElement('div');
                instructions.id = 'search-instructions';
                instructions.className = 'sr-only';
                instructions.textContent = 'Type to search FAQ items. Use arrow keys to navigate suggestions.';
                this.elements.searchInput.parentNode.appendChild(instructions);
            }
        }
        
        // Add event listener with cleanup tracking
        addEventListenerWithCleanup(element, event, handler, options = {}) {
            element.addEventListener(event, handler, options);
            this.cleanupFunctions.push(() => {
                element.removeEventListener(event, handler, options);
            });
        }
        
        // Public API methods
        search(query) {
            this.elements.searchInput.value = query;
            this.currentQuery = query;
            this.executeAdvancedSearch(query, this.currentCategory);
        }
        
        setCategory(category) {
            this.currentCategory = category;
            const targetButton = Array.from(this.elements.categoryButtons)
                .find(btn => btn.dataset.category === category);
            if (targetButton) {
                this.updateActiveCategoryButton(targetButton);
            }
            this.executeAdvancedSearch(this.currentQuery, category);
        }
        
        reset() {
            this.clearSearch();
        }
        
        getState() {
            return {
                isInitialized: this.isInitialized,
                currentQuery: this.currentQuery,
                currentCategory: this.currentCategory,
                resultCount: this.currentResults.length,
                totalItems: this.elements.faqItems.length
            };
        }
        
        // Cleanup
        destroy() {
            this.cleanupFunctions.forEach(cleanup => cleanup());
            this.cleanupFunctions = [];
            this.searchEngine.clearCache();
        }
    }
    
    // === INITIALIZE ENTERPRISE FAQ SYSTEM ===
    let enterpriseController = null;
    
    function initializeEnterpriseFAQ() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    enterpriseController = new EnterpriseFAQController();
                }, 100);
            });
        } else {
            setTimeout(() => {
                enterpriseController = new EnterpriseFAQController();
            }, 100);
        }
    }
    
    // === PUBLIC API ===
    window.EnterpriseFAQSearch = {
        search: (query) => enterpriseController?.search(query),
        setCategory: (category) => enterpriseController?.setCategory(category),
        reset: () => enterpriseController?.reset(),
        getState: () => enterpriseController?.getState(),
        isInitialized: () => enterpriseController?.isInitialized || false,
        clearCache: () => enterpriseController?.searchEngine.clearCache()
    };
    
    // Auto-initialize
    initializeEnterpriseFAQ();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .search-highlight {
            background: rgba(184, 160, 130, 0.4);
            padding: 0.1rem 0.3rem;
            border-radius: var(--radius-sm);
            font-weight: var(--font-weight-semibold);
            color: var(--color-text-primary);
        }
        
        .search-suggestions-dropdown::-webkit-scrollbar {
            width: 6px;
        }
        
        .search-suggestions-dropdown::-webkit-scrollbar-track {
            background: var(--color-bg-secondary);
        }
        
        .search-suggestions-dropdown::-webkit-scrollbar-thumb {
            background: var(--color-border-primary);
            border-radius: 3px;
        }
        
        .search-suggestions-dropdown::-webkit-scrollbar-thumb:hover {
            background: var(--color-secondary);
        }
    `;
    document.head.appendChild(style);
    
    console.log('Enterprise FAQ Search System v3.0 loaded successfully');
    
})();