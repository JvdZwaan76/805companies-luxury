/**
 * 805 LifeGuard Enhanced Testimonials System v15.0
 * Advanced Reviews Integration & Submission System
 * Production-Ready with Safety Checks
 */

(function() {
    'use strict';
    
    // Safety checks and initialization guards
    const SafetyChecks = {
        check: function() {
            const checks = {
                isTestimonialsPage: document.querySelector('.testimonials-section') !== null,
                luxuryAppExists: typeof window.LuxuryApp !== 'undefined',
                domReady: document.readyState !== 'loading',
                hasRequiredElements: document.getElementById('google-reviews-container') !== null,
                noConflicts: typeof window.EnhancedTestimonials === 'undefined'
            };
            
            console.log('🔒 805 LifeGuard: Enhanced Testimonials Safety Checks:', checks);
            
            const allPassed = Object.values(checks).every(check => check === true);
            
            if (allPassed) {
                console.log('✅ Enhanced Testimonials: All safety checks passed, proceeding...');
                return true;
            } else {
                console.warn('⚠️ Enhanced Testimonials: Safety checks failed, aborting initialization');
                return false;
            }
        }
    };
    
    // Production API configuration
    const REVIEWS_CONFIG = {
        // Google Places API Configuration - LIVE DATA
        google: {
            placeId: 'ChIJF_n_aeIx6IARDaz-6Q4-Hec',
            proxyEndpoint: 'https://805-lifeguard-reviews-api.jaspervdz.workers.dev/api/google-reviews',
            maxReviews: 8,
            minRating: 4,
            fields: 'reviews,rating,user_ratings_total,name'
        },
        
        // Manual Yelp Reviews (cost-effective approach)
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
        
        // Production configuration
        fallback: {
            useRealGoogleData: true,
            useManualYelp: true,
            showLoadingStates: true,
            simulateDelay: false
        }
    };
    
    // Enhanced cache management with in-memory fallback
    const ReviewsCache = {
        memoryCache: new Map(),
        
        isLocalStorageSupported: function() {
            try {
                const test = 'test';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        set: function(key, data) {
            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                version: '4.0'
            };
            
            // Always use memory cache
            this.memoryCache.set(key, cacheItem);
            
            // Try localStorage if available
            if (this.isLocalStorageSupported() && REVIEWS_CONFIG.cache.enableCache) {
                try {
                    localStorage.setItem(REVIEWS_CONFIG.cache.keyPrefix + key, JSON.stringify(cacheItem));
                } catch (e) {
                    console.warn('Reviews cache storage failed:', e.message);
                }
            }
            
            return true;
        },
        
        get: function(key) {
            // Check memory cache first
            const memoryItem = this.memoryCache.get(key);
            if (memoryItem && Date.now() - memoryItem.timestamp < REVIEWS_CONFIG.cache.duration) {
                return memoryItem.data;
            }
            
            // Try localStorage
            if (this.isLocalStorageSupported() && REVIEWS_CONFIG.cache.enableCache) {
                try {
                    const cached = localStorage.getItem(REVIEWS_CONFIG.cache.keyPrefix + key);
                    if (cached) {
                        const cacheItem = JSON.parse(cached);
                        
                        if (cacheItem.version === '4.0' && 
                            Date.now() - cacheItem.timestamp < REVIEWS_CONFIG.cache.duration) {
                            // Update memory cache
                            this.memoryCache.set(key, cacheItem);
                            return cacheItem.data;
                        }
                    }
                } catch (e) {
                    console.warn('Reviews cache retrieval failed:', e.message);
                }
            }
            
            return null;
        },
        
        remove: function(key) {
            this.memoryCache.delete(key);
            if (this.isLocalStorageSupported()) {
                try {
                    localStorage.removeItem(REVIEWS_CONFIG.cache.keyPrefix + key);
                } catch (e) {
                    console.warn('Reviews cache removal failed:', e.message);
                }
            }
        },
        
        clear: function() {
            this.memoryCache.clear();
            if (this.isLocalStorageSupported()) {
                try {
                    const keys = Object.keys(localStorage);
                    keys.forEach(key => {
                        if (key.startsWith(REVIEWS_CONFIG.cache.keyPrefix)) {
                            localStorage.removeItem(key);
                        }
                    });
                } catch (e) {
                    console.warn('Reviews cache clear failed:', e.message);
                }
            }
        }
    };
    
    // Production-ready API integration
    const ReviewsAPI = {
        fetchGoogleReviews: async function() {
            const cacheKey = 'google_v4';
            const cached = ReviewsCache.get(cacheKey);
            
            if (cached) {
                console.log('805 LifeGuard: Using cached Google reviews');
                return cached;
            }
            
            try {
                if (REVIEWS_CONFIG.fallback.useRealGoogleData && REVIEWS_CONFIG.google.proxyEndpoint) {
                    console.log('805 LifeGuard: Fetching live Google reviews...');
                    const response = await this.callCloudflareWorker();
                    ReviewsCache.set(cacheKey, response);
                    return response;
                } else {
                    console.log('805 LifeGuard: Using fallback Google reviews');
                    return [];
                }
                
            } catch (error) {
                console.error('805 LifeGuard: Google reviews API error:', error);
                return [];
            }
        },
        
        fetchYelpReviews: async function() {
            console.log('805 LifeGuard: Using manual Yelp reviews (cost-effective approach)');
            
            if (REVIEWS_CONFIG.fallback.simulateDelay) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            return REVIEWS_CONFIG.yelp.manualReviews;
        },
        
        callCloudflareWorker: async function() {
            const url = REVIEWS_CONFIG.google.proxyEndpoint;
            console.log('805 LifeGuard: Calling Cloudflare Worker:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`Worker request failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                console.warn('805 LifeGuard: Worker returned error:', data.error);
                if (data.fallback) {
                    return data.reviews || [];
                }
                throw new Error(data.error || 'Worker API error');
            }
            
            console.log('805 LifeGuard: Successfully loaded', data.reviews?.length || 0, 'live Google reviews');
            return data.reviews || [];
        },
        
        calculateAverageRating: function(reviews) {
            if (!reviews || reviews.length === 0) return '5.0';
            const sum = reviews.reduce((acc, review) => acc + (review.rating || 5), 0);
            return (sum / reviews.length).toFixed(1);
        },
        
        calculateTotalReviews: function(reviews) {
            return reviews ? reviews.length : 0;
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
    
    // UI rendering system
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
        
        timeAgo: function(dateString) {
            try {
                const date = new Date(dateString);
                const now = new Date();
                const diffTime = Math.abs(now - date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) return '1 day ago';
                if (diffDays < 7) return `${diffDays} days ago`;
                if (diffDays < 14) return '1 week ago';
                if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
                return `${Math.floor(diffDays / 30)} months ago`;
            } catch (e) {
                return 'recently';
            }
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
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                    <p><small>${subMessage}</small></p>
                </div>
            `;
        }
    };
    
    // Statistics updater
    const StatsUpdater = {
        update: function(googleReviews, yelpReviews) {
            const googleRating = ReviewsAPI.calculateAverageRating(googleReviews);
            const yelpRating = ReviewsAPI.calculateAverageRating(yelpReviews);
            const googleCount = ReviewsAPI.calculateTotalReviews(googleReviews);
            const yelpCount = ReviewsAPI.calculateTotalReviews(yelpReviews);
            
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
    
    // Platform interaction handlers
    const PlatformHandlers = {
        setupPlatformNavigation: function() {
            const googlePreview = document.getElementById('google-reviews-preview');
            const yelpPreview = document.getElementById('yelp-reviews-preview');
            
            if (googlePreview) {
                googlePreview.addEventListener('click', () => {
                    this.scrollToSection('#google-reviews-section');
                });
                
                googlePreview.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.scrollToSection('#google-reviews-section');
                    }
                });
            }
            
            if (yelpPreview) {
                yelpPreview.addEventListener('click', () => {
                    this.scrollToSection('#yelp-reviews-section');
                });
                
                yelpPreview.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.scrollToSection('#yelp-reviews-section');
                    }
                });
            }
        },
        
        scrollToSection: function(targetId) {
            const target = document.querySelector(targetId);
            if (!target) return;
            
            const isMobile = window.innerWidth <= 768;
            const offset = isMobile ? 88 : 132;
            const targetPosition = target.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Review Submission System
    const ReviewSubmissionSystem = {
        isOpen: false,
        currentRating: 0,
        formData: {},
        
        init: function() {
            this.setupEventListeners();
            this.setupFormValidation();
            this.setupFloatingButton();
            console.log('805 LifeGuard: Review submission system initialized');
        },
        
        setupFloatingButton: function() {
            const trigger = document.getElementById('reviewSubmissionTrigger');
            if (!trigger) return;
            
            // Show floating button after user scrolls past hero
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
            
            // Open modal
            if (openBtn) {
                openBtn.addEventListener('click', () => this.openModal());
            }
            
            // Close modal
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.closeModal());
            }
            
            // Close on overlay click
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.closeModal();
                    }
                });
            }
            
            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeModal();
                }
            });
            
            // Form submission
            if (form) {
                form.addEventListener('submit', (e) => this.handleSubmit(e));
            }
            
            // Star rating interaction
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
                5: 'excellent',
                4: 'good', 
                3: 'average',
                2: 'poor',
                1: 'poor'
            };
            
            starInputs.forEach(input => {
                input.addEventListener('change', () => {
                    const rating = parseInt(input.value);
                    this.currentRating = rating;
                    
                    if (ratingFeedback) {
                        // Remove all rating classes
                        Object.values(ratingClasses).forEach(cls => {
                            ratingFeedback.classList.remove(cls);
                        });
                        
                        // Add current rating class and update text
                        ratingFeedback.classList.add(ratingClasses[rating] || 'good');
                        ratingFeedback.textContent = ratingMessages[rating] || '';
                    }
                    
                    console.log('805 LifeGuard: Rating selected:', rating);
                });
                
                // Keyboard support
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        input.checked = true;
                        input.dispatchEvent(new Event('change'));
                    }
                });
            });
        },
        
        setupFormValidation: function() {
            const form = document.getElementById('reviewSubmissionForm');
            if (!form) return;
            
            // Real-time validation
            const inputs = form.querySelectorAll('.form-input, .form-textarea, .form-select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
            
            // Character counter for review text
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
            
            // Required field validation
            if (isRequired && !value) {
                isValid = false;
                errorMessage = 'This field is required.';
            }
            
            // Specific field validations
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
            
            if (value && fieldName === 'clientName') {
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Please enter your full name.';
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
            
            // Focus management
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
            
            // Reset form
            this.resetForm();
            
            console.log('805 LifeGuard: Review modal closed');
        },
        
        resetForm: function() {
            const form = document.getElementById('reviewSubmissionForm');
            if (!form) return;
            
            form.reset();
            this.currentRating = 0;
            
            // Clear validation states
            const fields = form.querySelectorAll('.form-input, .form-textarea, .form-select');
            fields.forEach(field => {
                field.classList.remove('valid', 'invalid');
                this.clearFieldError(field);
            });
            
            // Reset rating feedback
            const ratingFeedback = document.getElementById('rating-feedback');
            if (ratingFeedback) {
                ratingFeedback.textContent = '';
                ratingFeedback.className = 'rating-feedback';
            }
            
            // Reset character counter
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
            
            // Validate rating
            const ratingInputs = form.querySelectorAll('input[name="rating"]:checked');
            if (ratingInputs.length === 0) {
                this.showToast('error', 'Rating Required', 'Please select a star rating for your experience.');
                isValid = false;
            }
            
            // Validate required fields
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
            
            // Replace modal content with success state
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
                    <button type="button" class="btn btn-primary" onclick="ReviewSubmissionSystem.closeModal()">
                        <i class="fas fa-check"></i>
                        Close
                    </button>
                </div>
            `;
            
            this.showToast('success', 'Review Submitted', 'Thank you for your valuable feedback!');
            
            // Auto-close after a delay
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
            
            // Show toast
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);
            
            // Close button functionality
            const closeBtn = toast.querySelector('.toast-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.removeToast(toastId);
                });
            }
            
            // Auto-remove after duration
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
    
    // Main Reviews Controller
    const ReviewsController = {
        googleReviews: [],
        yelpReviews: [],
        isLoading: false,
        
        init: async function() {
            console.log('🚀 Enhanced Testimonials: Starting main system initialization...');
            
            try {
                this.isLoading = true;
                this.showInitialLoadingStates();
                
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
                
                // Setup platform navigation
                PlatformHandlers.setupPlatformNavigation();
                
                // Initialize review submission system
                ReviewSubmissionSystem.init();
                
                this.isLoading = false;
                
                console.log('✅ Enhanced Testimonials App v15.0 initialized successfully');
                
            } catch (error) {
                console.error('805 LifeGuard: Failed to initialize reviews system:', error);
                this.handleInitializationError();
            }
        },
        
        showInitialLoadingStates: function() {
            // Show loading in quick reviews
            const quickReviews = document.getElementById('quickReviews');
            if (quickReviews) {
                quickReviews.innerHTML = ReviewsUI.renderLoadingState('Loading latest reviews...');
            }
            
            // Show loading in Google reviews section
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
            
            // Add Google reviews
            const recentGoogle = ReviewsAPI.getMostRecent(this.googleReviews, 2);
            recentGoogle.forEach(review => {
                allReviews.push({ review, platform: 'google' });
            });
            
            // Add Yelp reviews
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
            
            // Shuffle and limit to 4
            const shuffled = allReviews.sort(() => Math.random() - 0.5).slice(0, 4);
            const quickReviewsHTML = shuffled
                .map(item => ReviewsUI.renderQuickReview(item.review, item.platform))
                .join('');
            
            container.innerHTML = quickReviewsHTML;
        },
        
        animateReviewsEntrance: function() {
            // Animate review platforms
            const platforms = document.querySelectorAll('.review-platform');
            platforms.forEach((platform, index) => {
                setTimeout(() => {
                    platform.classList.add('loaded');
                    if (index === 0) platform.classList.add('delay-1');
                    if (index === 1) platform.classList.add('delay-2');
                }, 100 * index);
            });
            
            // Animate live reviews widget
            const widget = document.getElementById('liveReviewsWidget');
            if (widget) {
                setTimeout(() => {
                    widget.classList.add('loaded');
                }, 300);
            }
            
            // Animate quick reviews
            const quickReviews = document.querySelectorAll('.quick-review');
            quickReviews.forEach((review, index) => {
                setTimeout(() => {
                    review.classList.add('loaded');
                    review.classList.add(`delay-${(index % 4) + 1}`);
                }, 500 + (index * 100));
            });
            
            // Animate testimonial cards
            const testimonialCards = document.querySelectorAll('.testimonial-card[data-platform]');
            testimonialCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('loaded');
                    card.classList.add(`stagger-${(index % 8) + 1}`);
                }, 800 + (index * 100));
            });
        },
        
        handleInitializationError: function() {
            console.error('805 LifeGuard: Reviews system initialization failed');
            
            // Show error states
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
            
            // Still initialize review submission system
            try {
                ReviewSubmissionSystem.init();
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
                total: this.googleReviews.length + this.yelpReviews.length
            };
        }
    };
    
    // Enhanced Error Handling
    window.addEventListener('error', function(e) {
        console.error('805 LifeGuard: JavaScript error in enhanced testimonials:', e.error);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('805 LifeGuard: Promise rejection in enhanced testimonials:', e.reason);
    });
    
    // Main initialization function
    function initializeEnhancedTestimonials() {
        if (!SafetyChecks.check()) {
            return;
        }
        
        // Export for global access
        window.EnhancedTestimonials = {
            ReviewsController: ReviewsController,
            ReviewSubmissionSystem: ReviewSubmissionSystem,
            ReviewsAPI: ReviewsAPI,
            version: '15.0'
        };
        
        // Initialize the system
        ReviewsController.init();
    }
    
    // Initialize when DOM is ready or immediately if already ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEnhancedTestimonials);
    } else {
        initializeEnhancedTestimonials();
    }
    
})();
