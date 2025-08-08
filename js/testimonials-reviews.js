/**
 * 805 LifeGuard Testimonials & Reviews System - PRODUCTION OPTIMIZED
 * Version: 4.0-ENTERPRISE (Caruso Design System Compatible)
 * Integration: Luxury App v12.3+ Required
 * Scope: testimonials.html ONLY - Zero impact on other pages
 * 
 * ENTERPRISE PROTECTION: Safeguards protect existing design system
 */

(function() {
    'use strict';
    
    // === INTEGRATION SAFEGUARDS ===
    const SAFETY_CONFIG = {
        REQUIRED_LUXURY_APP_VERSION: '12.3',
        TESTIMONIALS_PAGE_ONLY: true,
        MAX_INIT_ATTEMPTS: 3,
        INIT_TIMEOUT: 10000,
        FALLBACK_ENABLED: true
    };
    
    // === PRE-FLIGHT SAFETY CHECKS ===
    function performSafetyChecks() {
        const isTestimonialsPage = window.location.pathname.includes('testimonials') || 
                                  document.querySelector('#main-content[aria-label*="testimonials" i]') ||
                                  document.querySelector('.testimonials-section, #google-reviews-container');
        
        const checks = {
            isTestimonialsPage,
            luxuryAppExists: typeof window.app !== 'undefined',
            luxuryAppReady: window.app ? window.app.isReady() : false,
            criticalElementsPresent: checkCriticalElements(),
            noConflicts: !window.TestimonialsReviews // Ensure no old version conflicts
        };
        
        console.log('🔒 805 LifeGuard: Safety checks:', checks);
        return checks;
    }
    
    function checkCriticalElements() {
        const required = ['header', 'menuToggle', 'navOverlay', 'mainLogo'];
        return required.every(id => document.getElementById(id) !== null);
    }
    
    // === PRODUCTION CONFIGURATION ===
    const REVIEWS_CONFIG = {
        // Google Places API Configuration
        google: {
            placeId: 'ChIJF_n_aeIx6IARDaz-6Q4-Hec',
            proxyEndpoint: 'https://805-lifeguard-reviews-api.jaspervdz.workers.dev/api/google-reviews',
            maxReviews: 8,
            minRating: 4,
            timeout: 8000,
            retryAttempts: 2,
            retryDelay: 1000
        },
        
        // Manual Yelp Reviews (cost-effective)
        yelp: {
            manualReviews: [
                {
                    user: { name: "Parent from Thousand Oaks" },
                    rating: 5,
                    text: "Very appreciative of Jasper for teaching our 5 year old pool safety and beginner swimming skills. Prior to his lessons our little one wouldn't even dunk his head under water. By the end of the lessons he was so comfortable navigating the pool.",
                    time_created: "2024-06-15T10:00:00Z",
                    id: "manual_yelp_1"
                },
                {
                    user: { name: "Team Event Organizer" },
                    rating: 5,
                    text: "We were looking to hire a lifeguard for a team pool party and found 805Lifeguard online. Jasper was very communicative during the whole process and easy to book with. Both were friendly, attentive, and gave the parents a lot of peace of mind during the party!",
                    time_created: "2024-05-20T14:30:00Z",
                    id: "manual_yelp_2"
                },
                {
                    user: { name: "Grandparent" },
                    rating: 5,
                    text: "Jasper is so patient and makes learning to swim super fun. My grandson was swimming after 3-4 sessions! His teaching method is excellent and he really knows how to connect with children.",
                    time_created: "2024-04-10T16:45:00Z",
                    id: "manual_yelp_3"
                },
                {
                    user: { name: "Matt E." },
                    rating: 5,
                    text: "Our little one learned how to swim in about eight or ten lessons. I would highly recommend Jasper for a youth swimming coach and as a lifeguard for parties!",
                    time_created: "2024-03-25T11:15:00Z",
                    id: "manual_yelp_4"
                }
            ]
        },
        
        // Cache configuration
        cache: {
            duration: 1800000, // 30 minutes
            keyPrefix: '805lifeguard_reviews_v4_',
            enableCache: true
        },
        
        // Performance settings
        performance: {
            debounceDelay: 200,
            throttleDelay: 16,
            animationDelay: 150,
            staggerDelay: 100
        }
    };
    
    // === INTELLIGENT CACHE SYSTEM (No localStorage dependency) ===
    const ReviewsCache = {
        memoryCache: new Map(),
        memoryOrder: [],
        maxItems: 10,
        
        set: function(key, data) {
            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                version: '4.0'
            };
            
            // Memory cache with LRU eviction
            if (this.memoryCache.size >= this.maxItems) {
                const oldestKey = this.memoryOrder.shift();
                this.memoryCache.delete(oldestKey);
            }
            
            this.memoryCache.set(key, cacheItem);
            this.memoryOrder.push(key);
            
            // Try localStorage only if available (graceful fallback)
            if (this.isStorageAvailable() && REVIEWS_CONFIG.cache.enableCache) {
                try {
                    localStorage.setItem(REVIEWS_CONFIG.cache.keyPrefix + key, JSON.stringify(cacheItem));
                } catch (e) {
                    console.warn('805 LifeGuard: Cache storage unavailable, using memory only');
                }
            }
            
            return true;
        },
        
        get: function(key) {
            // Check memory cache first
            const memoryItem = this.memoryCache.get(key);
            if (memoryItem && this.isValid(memoryItem)) {
                // Move to end (LRU)
                const index = this.memoryOrder.indexOf(key);
                if (index > -1) {
                    this.memoryOrder.splice(index, 1);
                    this.memoryOrder.push(key);
                }
                return memoryItem.data;
            }
            
            // Try localStorage fallback
            if (this.isStorageAvailable() && REVIEWS_CONFIG.cache.enableCache) {
                try {
                    const cached = localStorage.getItem(REVIEWS_CONFIG.cache.keyPrefix + key);
                    if (cached) {
                        const cacheItem = JSON.parse(cached);
                        if (this.isValid(cacheItem)) {
                            // Update memory cache
                            this.set(key, cacheItem.data);
                            return cacheItem.data;
                        }
                    }
                } catch (e) {
                    console.warn('805 LifeGuard: Cache retrieval failed, using fresh data');
                }
            }
            
            return null;
        },
        
        isValid: function(cacheItem) {
            if (!cacheItem || !cacheItem.timestamp) return false;
            const age = Date.now() - cacheItem.timestamp;
            return age < REVIEWS_CONFIG.cache.duration && cacheItem.version === '4.0';
        },
        
        isStorageAvailable: function() {
            try {
                const test = 'test';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        clear: function() {
            this.memoryCache.clear();
            this.memoryOrder = [];
            
            if (this.isStorageAvailable()) {
                try {
                    const keys = Object.keys(localStorage);
                    keys.forEach(key => {
                        if (key.startsWith(REVIEWS_CONFIG.cache.keyPrefix)) {
                            localStorage.removeItem(key);
                        }
                    });
                } catch (e) {
                    console.warn('805 LifeGuard: Cache clear failed');
                }
            }
        }
    };
    
    // === PRODUCTION API INTEGRATION ===
    const ReviewsAPI = {
        activeRequests: 0,
        maxConcurrentRequests: 3,
        
        async fetchGoogleReviews() {
            const cacheKey = 'google_v4';
            const cached = ReviewsCache.get(cacheKey);
            
            if (cached) {
                console.log('805 LifeGuard: Using cached Google reviews');
                return cached;
            }
            
            try {
                console.log('805 LifeGuard: Fetching live Google reviews...');
                const response = await this.callCloudflareWorker();
                
                if (response && response.length > 0) {
                    ReviewsCache.set(cacheKey, response);
                    console.log('805 LifeGuard: Google reviews fetched and cached');
                    return response;
                } else {
                    console.warn('805 LifeGuard: No Google reviews returned');
                    return [];
                }
                
            } catch (error) {
                console.error('805 LifeGuard: Google reviews API error:', error);
                return [];
            }
        },
        
        async fetchYelpReviews() {
            console.log('805 LifeGuard: Loading manual Yelp reviews');
            return REVIEWS_CONFIG.yelp.manualReviews;
        },
        
        async callCloudflareWorker() {
            const url = REVIEWS_CONFIG.google.proxyEndpoint;
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), REVIEWS_CONFIG.google.timeout);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`Worker request failed: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!data.success) {
                    console.warn('805 LifeGuard: Worker returned error:', data.error);
                    return data.reviews || [];
                }
                
                console.log('805 LifeGuard: Successfully loaded', data.reviews?.length || 0, 'Google reviews');
                return data.reviews || [];
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                throw error;
            }
        },
        
        calculateAverageRating: function(reviews) {
            if (!reviews || reviews.length === 0) return '5.0';
            const sum = reviews.reduce((acc, review) => acc + (review.rating || 5), 0);
            return (sum / reviews.length).toFixed(1);
        },
        
        getMostRecent: function(reviews, count = 4) {
            if (!reviews || reviews.length === 0) return [];
            
            return reviews
                .sort((a, b) => {
                    const timeA = a.time || new Date(a.time_created).getTime() || 0;
                    const timeB = b.time || new Date(b.time_created).getTime() || 0;
                    return timeB - timeA;
                })
                .slice(0, count);
        }
    };
    
    // === OPTIMIZED UI RENDERING ===
    const ReviewsUI = {
        renderGoogleReview: function(review) {
            const stars = this.renderStars(review.rating);
            const sanitizedText = this.sanitizeText(review.text);
            const truncatedText = this.truncateText(sanitizedText, 220);
            
            return `
                <div class="testimonial-card" data-platform="google" data-rating="${review.rating}">
                    <div class="testimonial-content">
                        <div class="platform-indicator">
                            <div class="platform-logo google-logo">G</div>
                            <span>Google Review</span>
                        </div>
                        <p>${truncatedText}</p>
                    </div>
                    <div class="testimonial-author">
                        <div class="author-info">
                            <div class="author-name">${this.sanitizeText(review.author_name)}</div>
                            <div class="author-location">Verified Google Customer</div>
                            <div class="author-service">${review.relative_time_description}</div>
                        </div>
                        <div class="testimonial-rating" aria-label="${review.rating} star rating">
                            ${stars}
                        </div>
                    </div>
                </div>
            `;
        },
        
        renderQuickReview: function(review, platform) {
            const name = platform === 'google' ? review.author_name : review.user.name;
            const sanitizedName = this.sanitizeText(name);
            const sanitizedText = this.sanitizeText(review.text);
            const initial = sanitizedName.charAt(0).toUpperCase();
            const rating = review.rating;
            const text = this.truncateText(sanitizedText, 140);
            
            return `
                <div class="quick-review" data-platform="${platform}">
                    <div class="reviewer-initial">${initial}</div>
                    <div class="quick-review-content">
                        <div class="quick-review-text">${text}</div>
                        <div class="quick-review-meta">
                            <div class="quick-review-rating">${'★'.repeat(rating)}</div>
                            <div class="quick-review-name">${sanitizedName}</div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        renderStars: function(rating) {
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += `<i class="fas fa-star${i <= rating ? '' : ' star-empty'}" aria-hidden="true"></i>`;
            }
            return stars;
        },
        
        sanitizeText: function(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        truncateText: function(text, maxLength) {
            if (!text || text.length <= maxLength) return text;
            return text.substr(0, maxLength).replace(/\w+$/, '...').trim();
        },
        
        renderLoadingState: function(message = 'Loading reviews...') {
            return `
                <div class="loading-placeholder">
                    <div class="loading-spinner"></div>
                    <p>${message}</p>
                </div>
            `;
        },
        
        renderErrorState: function(message = 'Unable to load reviews', subMessage = 'Please try again later') {
            return `
                <div class="error-message show">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p><strong>${message}</strong></p>
                    <p><small>${subMessage}</small></p>
                </div>
            `;
        }
    };
    
    // === STATISTICS UPDATER ===
    const StatsUpdater = {
        update: function(googleReviews, yelpReviews) {
            const googleRating = ReviewsAPI.calculateAverageRating(googleReviews);
            const yelpRating = ReviewsAPI.calculateAverageRating(yelpReviews);
            const googleCount = googleReviews ? googleReviews.length : 0;
            const yelpCount = yelpReviews ? yelpReviews.length : 0;
            
            this.updateElement('google-rating', googleRating);
            this.updateElement('yelp-rating', yelpRating);
            this.updateElement('stats-google-rating', googleRating);
            this.updateElement('stats-yelp-rating', yelpRating);
            this.updateElement('stats-google-count', googleCount + '+');
            this.updateElement('stats-yelp-count', yelpCount + '+');
            
            console.log('805 LifeGuard: Statistics updated', {
                google: { rating: googleRating, count: googleCount },
                yelp: { rating: yelpRating, count: yelpCount }
            });
        },
        
        updateElement: function(id, value) {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('stat-updating');
                setTimeout(() => {
                    element.textContent = value;
                    element.classList.remove('stat-updating');
                    element.classList.add('stat-updated');
                    setTimeout(() => {
                        element.classList.remove('stat-updated');
                    }, 600);
                }, 100);
            }
        }
    };
    
    // === PLATFORM NAVIGATION ===
    const PlatformHandlers = {
        setupPlatformNavigation: function() {
            const googlePreview = document.getElementById('google-reviews-preview');
            const yelpPreview = document.getElementById('yelp-reviews-preview');
            
            if (googlePreview) {
                this.setupPlatformButton(googlePreview, '#google-reviews-section');
            }
            
            if (yelpPreview) {
                this.setupPlatformButton(yelpPreview, '#yelp-reviews-section');
            }
        },
        
        setupPlatformButton: function(button, targetSection) {
            const scrollHandler = () => {
                this.scrollToSection(targetSection);
            };
            
            button.addEventListener('click', scrollHandler);
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollHandler();
                }
            });
        },
        
        scrollToSection: function(targetId) {
            const target = document.querySelector(targetId);
            if (!target) return;
            
            // Use luxury app smooth scroll if available
            if (window.app && window.app.smoothScrollTo) {
                window.app.smoothScrollTo(targetId);
            } else {
                // Fallback smooth scroll
                const isMobile = window.innerWidth <= 768;
                const offset = isMobile ? 88 : 132;
                const targetPosition = target.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    };
    
    // === REVIEW SUBMISSION SYSTEM ===
    const ReviewSubmissionSystem = {
        isOpen: false,
        currentRating: 0,
        
        init: function() {
            this.setupEventListeners();
            this.setupFormValidation();
            this.setupFloatingButton();
            console.log('805 LifeGuard: Review submission system initialized');
        },
        
        setupFloatingButton: function() {
            const trigger = document.getElementById('reviewSubmissionTrigger');
            if (!trigger) return;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        trigger.classList.add('visible');
                    } else {
                        trigger.classList.remove('visible');
                    }
                });
            }, { threshold: 0.1 });
            
            const hero = document.querySelector('.hero');
            if (hero) {
                observer.observe(hero);
            }
        },
        
        setupEventListeners: function() {
            const openBtn = document.getElementById('openReviewModal');
            const closeBtn = document.getElementById('closeReviewModal');
            const cancelBtn = document.getElementById('cancelReviewBtn');
            const overlay = document.getElementById('reviewModalOverlay');
            const form = document.getElementById('reviewSubmissionForm');
            
            if (openBtn) {
                openBtn.addEventListener('click', () => this.openModal());
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.closeModal());
            }
            
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.closeModal();
                    }
                });
            }
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeModal();
                }
            });
            
            if (form) {
                form.addEventListener('submit', (e) => this.handleSubmit(e));
            }
            
            this.setupStarRating();
        },
        
        setupStarRating: function() {
            const starInputs = document.querySelectorAll('.star-input');
            const ratingFeedback = document.getElementById('rating-feedback');
            
            const ratingMessages = {
                5: 'Excellent! We\'re delighted you had such a wonderful experience.',
                4: 'Very good! Thank you for your positive feedback.',
                3: 'Good. We appreciate your feedback and will continue improving.',
                2: 'Fair. We\'d love to understand how we can serve you better.',
                1: 'We\'re sorry to hear this. Please let us know how we can improve.'
            };
            
            const ratingClasses = {
                5: 'excellent', 4: 'good', 3: 'average', 2: 'poor', 1: 'poor'
            };
            
            starInputs.forEach(input => {
                input.addEventListener('change', () => {
                    const rating = parseInt(input.value);
                    this.currentRating = rating;
                    
                    if (ratingFeedback) {
                        Object.values(ratingClasses).forEach(cls => {
                            ratingFeedback.classList.remove(cls);
                        });
                        
                        ratingFeedback.classList.add(ratingClasses[rating] || 'good');
                        ratingFeedback.textContent = ratingMessages[rating] || '';
                    }
                    
                    console.log('805 LifeGuard: Rating selected:', rating);
                });
            });
        },
        
        setupFormValidation: function() {
            const form = document.getElementById('reviewSubmissionForm');
            if (!form) return;
            
            const inputs = form.querySelectorAll('.form-input, .form-textarea, .form-select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
            
            // Character counter
            const reviewText = document.getElementById('reviewText');
            const counter = document.getElementById('reviewText-count');
            
            if (reviewText && counter) {
                reviewText.addEventListener('input', () => {
                    const length = reviewText.value.length;
                    counter.textContent = `${length} / 1000 characters`;
                    
                    if (length < 20) {
                        counter.style.color = 'var(--color-warning)';
                    } else if (length > 950) {
                        counter.style.color = 'var(--color-warning)';
                    } else {
                        counter.style.color = 'var(--color-text-tertiary)';
                    }
                });
            }
            
            // Phone formatting
            const phoneInput = document.getElementById('clientPhone');
            if (phoneInput) {
                phoneInput.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    
                    if (value.length >= 6) {
                        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                    } else if (value.length >= 3) {
                        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
                    }
                    
                    e.target.value = value;
                });
            }
        },
        
        validateField: function(field) {
            const value = field.value.trim();
            const isRequired = field.hasAttribute('required');
            const fieldName = field.name;
            let isValid = true;
            let errorMessage = '';
            
            if (isRequired && !value) {
                isValid = false;
                errorMessage = 'This field is required.';
            }
            
            if (value && fieldName === 'clientEmail') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
            }
            
            if (value && fieldName === 'reviewText') {
                if (value.length < 20) {
                    isValid = false;
                    errorMessage = 'Please provide at least 20 characters for your review.';
                }
            }
            
            this.showFieldValidation(field, isValid, errorMessage);
            return isValid;
        },
        
        showFieldValidation: function(field, isValid, errorMessage = '') {
            const errorElement = document.getElementById(field.name + '-error');
            
            if (isValid) {
                field.classList.remove('invalid');
                field.classList.add('valid');
                if (errorElement) {
                    errorElement.classList.remove('show');
                    errorElement.textContent = '';
                }
            } else {
                field.classList.remove('valid');
                field.classList.add('invalid');
                if (errorElement) {
                    errorElement.textContent = errorMessage;
                    errorElement.classList.add('show');
                }
            }
        },
        
        clearFieldError: function(field) {
            field.classList.remove('invalid');
            const errorElement = document.getElementById(field.name + '-error');
            if (errorElement) {
                errorElement.classList.remove('show');
                errorElement.textContent = '';
            }
        },
        
        openModal: function() {
            const overlay = document.getElementById('reviewModalOverlay');
            if (!overlay) return;
            
            this.isOpen = true;
            overlay.classList.add('active');
            document.body.classList.add('review-modal-open');
            
            setTimeout(() => {
                const firstInput = document.getElementById('clientName');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
            
            console.log('805 LifeGuard: Review modal opened');
        },
        
        closeModal: function() {
            const overlay = document.getElementById('reviewModalOverlay');
            if (!overlay) return;
            
            this.isOpen = false;
            overlay.classList.remove('active');
            document.body.classList.remove('review-modal-open');
            
            this.resetForm();
            console.log('805 LifeGuard: Review modal closed');
        },
        
        resetForm: function() {
            const form = document.getElementById('reviewSubmissionForm');
            if (!form) return;
            
            form.reset();
            this.currentRating = 0;
            
            const fields = form.querySelectorAll('.form-input, .form-textarea, .form-select');
            fields.forEach(field => {
                field.classList.remove('valid', 'invalid');
                this.clearFieldError(field);
            });
            
            const ratingFeedback = document.getElementById('rating-feedback');
            if (ratingFeedback) {
                ratingFeedback.textContent = '';
                ratingFeedback.className = 'rating-feedback';
            }
            
            const counter = document.getElementById('reviewText-count');
            if (counter) {
                counter.textContent = '0 / 1000 characters';
                counter.style.color = 'var(--color-text-tertiary)';
            }
        },
        
        validateForm: function() {
            const form = document.getElementById('reviewSubmissionForm');
            if (!form) return false;
            
            let isValid = true;
            
            const ratingInputs = form.querySelectorAll('input[name="rating"]:checked');
            if (ratingInputs.length === 0) {
                this.showToast('error', 'Rating Required', 'Please select a star rating for your experience.');
                isValid = false;
            }
            
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });
            
            return isValid;
        },
        
        handleSubmit: function(e) {
            e.preventDefault();
            
            if (!this.validateForm()) {
                return;
            }
            
            const submitBtn = document.getElementById('submitReviewBtn');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }
            
            // Simulate submission (replace with actual API call)
            setTimeout(() => {
                this.handleSubmissionSuccess();
            }, 2000);
        },
        
        handleSubmissionSuccess: function() {
            const modal = document.querySelector('.review-modal');
            if (!modal) return;
            
            modal.innerHTML = `
                <div class="review-success-content">
                    <div class="success-icon">
                        <i class="fas fa-check"></i>
                    </div>
                    <h2 class="success-title">Thank You!</h2>
                    <p class="success-message">
                        Your review has been submitted successfully. We truly appreciate your feedback 
                        and are honored to have served your family.
                    </p>
                    <div class="platform-encouragement">
                        <h3 class="platform-encouragement-title">Help Other Families Find Us</h3>
                        <p class="platform-encouragement-text">
                            Consider sharing your experience on Google or Yelp to help other distinguished 
                            families discover our exceptional aquatic services.
                        </p>
                        <div class="platform-buttons">
                            <a href="https://search.google.com/local/writereview?placeid=ChIJF_n_aeIx6IARDaz-6Q4-Hec" target="_blank" rel="noopener noreferrer" class="platform-cta-btn google">
                                <i class="fab fa-google"></i>
                                Review on Google
                            </a>
                            <a href="https://www.yelp.com/writeareview/biz/805-lifeguard-thousand-oaks" target="_blank" rel="noopener noreferrer" class="platform-cta-btn yelp">
                                <i class="fab fa-yelp"></i>
                                Review on Yelp
                            </a>
                        </div>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="window.TestimonialsReviews.ReviewSubmissionSystem.closeModal()">
                        <i class="fas fa-check"></i>
                        Close
                    </button>
                </div>
            `;
            
            this.showToast('success', 'Review Submitted', 'Thank you for your valuable feedback!');
            
            setTimeout(() => {
                this.closeModal();
            }, 8000);
        },
        
        showToast: function(type, title, message, duration = 5000) {
            const container = document.getElementById('toastContainer');
            if (!container) return;
            
            const toastId = 'toast-' + Date.now();
            const iconMap = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.id = toastId;
            toast.innerHTML = `
                <div class="toast-icon">
                    <i class="fas ${iconMap[type] || 'fa-info-circle'}"></i>
                </div>
                <div class="toast-content">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
                <div class="toast-progress"></div>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);
            
            const closeBtn = toast.querySelector('.toast-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.removeToast(toastId);
                });
            }
            
            setTimeout(() => {
                this.removeToast(toastId);
            }, duration);
        },
        
        removeToast: function(toastId) {
            const toast = document.getElementById(toastId);
            if (!toast) return;
            
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    };
    
    // === MAIN REVIEWS CONTROLLER ===
    const ReviewsController = {
        googleReviews: [],
        yelpReviews: [],
        isLoading: false,
        isInitialized: false,
        
        async init() {
            console.log('805 LifeGuard: Initializing Reviews Controller v4.0...');
            
            try {
                this.isLoading = true;
                this.showInitialLoadingStates();
                
                // Wait for luxury app if available
                await this.waitForLuxuryApp();
                
                // Load reviews concurrently
                const [googleReviews, yelpReviews] = await Promise.allSettled([
                    ReviewsAPI.fetchGoogleReviews(),
                    ReviewsAPI.fetchYelpReviews()
                ]);
                
                this.googleReviews = googleReviews.status === 'fulfilled' ? googleReviews.value : [];
                this.yelpReviews = yelpReviews.status === 'fulfilled' ? yelpReviews.value : [];
                
                console.log('805 LifeGuard: Reviews loaded', {
                    google: this.googleReviews.length,
                    yelp: this.yelpReviews.length
                });
                
                // Update UI
                this.renderAllReviews();
                this.renderQuickReviews();
                StatsUpdater.update(this.googleReviews, this.yelpReviews);
                this.animateReviewsEntrance();
                
                // Setup systems
                PlatformHandlers.setupPlatformNavigation();
                ReviewSubmissionSystem.init();
                
                this.isLoading = false;
                this.isInitialized = true;
                
                console.log('805 LifeGuard: Reviews system fully initialized');
                
            } catch (error) {
                console.error('805 LifeGuard: Failed to initialize reviews system:', error);
                this.handleInitializationError();
            }
        },
        
        waitForLuxuryApp: function() {
            return new Promise(resolve => {
                if (window.app && window.app.isReady && window.app.isReady()) {
                    resolve();
                } else {
                    const checkApp = () => {
                        if (window.app && window.app.isReady && window.app.isReady()) {
                            resolve();
                        } else {
                            setTimeout(checkApp, 100);
                        }
                    };
                    setTimeout(checkApp, 500);
                }
            });
        },
        
        showInitialLoadingStates: function() {
            const quickReviews = document.getElementById('quickReviews');
            if (quickReviews) {
                quickReviews.innerHTML = ReviewsUI.renderLoadingState('Loading latest reviews...');
            }
            
            const googleContainer = document.getElementById('google-reviews-container');
            if (googleContainer) {
                googleContainer.innerHTML = ReviewsUI.renderLoadingState('Loading Google reviews...');
            }
        },
        
        renderAllReviews: function() {
            this.renderGoogleReviews();
            // Yelp reviews are already in HTML (manual integration)
        },
        
        renderGoogleReviews: function() {
            const container = document.getElementById('google-reviews-container');
            if (!container) return;
            
            if (this.googleReviews.length === 0) {
                container.innerHTML = ReviewsUI.renderErrorState(
                    'Google reviews temporarily unavailable',
                    'Please visit our Google Maps page to read reviews'
                );
                return;
            }
            
            const reviewsHTML = this.googleReviews
                .filter(review => review.rating >= 4)
                .slice(0, 8)
                .map(review => ReviewsUI.renderGoogleReview(review))
                .join('');
            
            container.innerHTML = reviewsHTML;
        },
        
        renderQuickReviews: function() {
            const container = document.getElementById('quickReviews');
            if (!container) return;
            
            const allReviews = [];
            
            const recentGoogle = ReviewsAPI.getMostRecent(this.googleReviews, 2);
            recentGoogle.forEach(review => {
                allReviews.push({ review, platform: 'google' });
            });
            
            const recentYelp = ReviewsAPI.getMostRecent(this.yelpReviews, 2);
            recentYelp.forEach(review => {
                allReviews.push({ review, platform: 'yelp' });
            });
            
            if (allReviews.length === 0) {
                container.innerHTML = ReviewsUI.renderErrorState(
                    'No recent reviews available',
                    'Check back soon for new client feedback'
                );
                return;
            }
            
            const shuffled = allReviews.sort(() => Math.random() - 0.5).slice(0, 4);
            const quickReviewsHTML = shuffled
                .map(item => ReviewsUI.renderQuickReview(item.review, item.platform))
                .join('');
            
            container.innerHTML = quickReviewsHTML;
        },
        
        animateReviewsEntrance: function() {
            setTimeout(() => {
                const platforms = document.querySelectorAll('.review-platform');
                platforms.forEach((platform, index) => {
                    setTimeout(() => {
                        platform.classList.add('loaded');
                        if (index === 0) platform.classList.add('delay-1');
                        if (index === 1) platform.classList.add('delay-2');
                    }, REVIEWS_CONFIG.performance.animationDelay * index);
                });
                
                const widget = document.getElementById('liveReviewsWidget');
                if (widget) {
                    setTimeout(() => {
                        widget.classList.add('loaded');
                    }, 300);
                }
                
                const quickReviews = document.querySelectorAll('.quick-review');
                quickReviews.forEach((review, index) => {
                    setTimeout(() => {
                        review.classList.add('loaded');
                        review.classList.add(`delay-${(index % 4) + 1}`);
                    }, 500 + (index * REVIEWS_CONFIG.performance.staggerDelay));
                });
                
                const testimonialCards = document.querySelectorAll('.testimonial-card[data-platform]');
                testimonialCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('loaded');
                        card.classList.add(`stagger-${(index % 8) + 1}`);
                    }, 800 + (index * REVIEWS_CONFIG.performance.staggerDelay));
                });
            }, 100);
        },
        
        handleInitializationError: function() {
            console.error('805 LifeGuard: Reviews system initialization failed');
            
            const quickReviews = document.getElementById('quickReviews');
            if (quickReviews) {
                quickReviews.innerHTML = ReviewsUI.renderErrorState();
            }
            
            const googleContainer = document.getElementById('google-reviews-container');
            if (googleContainer) {
                googleContainer.innerHTML = ReviewsUI.renderErrorState(
                    'Unable to load Google reviews',
                    'Visit our Google Maps page to read reviews'
                );
            }
            
            // Still try to initialize submission system
            try {
                ReviewSubmissionSystem.init();
                PlatformHandlers.setupPlatformNavigation();
            } catch (error) {
                console.error('805 LifeGuard: Failed to initialize review submission:', error);
            }
        },
        
        refresh: function() {
            console.log('805 LifeGuard: Refreshing reviews...');
            ReviewsCache.clear();
            return this.init();
        },
        
        getStats: function() {
            return {
                google: {
                    count: this.googleReviews.length,
                    rating: ReviewsAPI.calculateAverageRating(this.googleReviews)
                },
                yelp: {
                    count: this.yelpReviews.length,
                    rating: ReviewsAPI.calculateAverageRating(this.yelpReviews)
                },
                total: this.googleReviews.length + this.yelpReviews.length,
                version: '4.0'
            };
        }
    };
    
    // === PROTECTED INITIALIZATION ===
    let initAttempts = 0;
    
    function safeInitialize() {
        initAttempts++;
        
        if (initAttempts > SAFETY_CONFIG.MAX_INIT_ATTEMPTS) {
            console.error('805 LifeGuard: Max initialization attempts exceeded');
            return;
        }
        
        const checks = performSafetyChecks();
        
        // CRITICAL: Only proceed if on testimonials page
        if (!checks.isTestimonialsPage) {
            console.log('805 LifeGuard: Not on testimonials page, skipping reviews initialization');
            return;
        }
        
        if (!checks.criticalElementsPresent || !checks.noConflicts) {
            console.warn('805 LifeGuard: Safety checks failed, retrying...');
            setTimeout(safeInitialize, 1000);
            return;
        }
        
        console.log('805 LifeGuard: Safety checks passed, initializing...');
        
        // Initialize the system
        ReviewsController.init();
    }
    
    // === EXPORT FOR GLOBAL ACCESS ===
    window.TestimonialsReviews = {
        ReviewsAPI: ReviewsAPI,
        ReviewsController: ReviewsController,
        ReviewSubmissionSystem: ReviewSubmissionSystem,
        ReviewsCache: ReviewsCache,
        StatsUpdater: StatsUpdater,
        version: '4.0'
    };
    
    // === ERROR HANDLING ===
    window.addEventListener('error', function(e) {
        console.error('805 LifeGuard: JavaScript error in reviews system:', e.error);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('805 LifeGuard: Promise rejection in reviews system:', e.reason);
    });
    
    // === INITIALIZE WHEN READY ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInitialize);
    } else {
        safeInitialize();
    }
    
    console.log('805 LifeGuard: Testimonials reviews system v4.0 loaded successfully');
    
})();
