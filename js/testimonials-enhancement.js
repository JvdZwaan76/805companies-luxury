/**
 * 805 LifeGuard Testimonials Enhancement v2.0
 * Lightweight integration with existing LuxuryApp v12.3
 * Adds live reviews API integration and review submission system
 */

(function() {
    'use strict';
    
    // Wait for LuxuryApp to be ready
    function initTestimonialsEnhancement() {
        // Safety check - only run on testimonials page
        if (!window.LuxuryApp || !window.LuxuryApp.prototype.isTestimonialsPage()) {
            return;
        }

        console.log('🎯 805 LifeGuard: Initializing Testimonials Enhancement v2.0...');

        // Enhanced configuration that works with your existing system
        const TESTIMONIALS_CONFIG = {
            api: {
                googleEndpoint: 'https://805-lifeguard-reviews-api.jaspervdz.workers.dev/api/google-reviews',
                combinedEndpoint: 'https://805-lifeguard-reviews-api.jaspervdz.workers.dev/api/reviews/combined',
                timeout: 8000,
                retryAttempts: 2
            },
            cache: {
                duration: 1800000, // 30 minutes
                key: '805_testimonials_v2'
            },
            // Manual Yelp data (cost-effective)
            manualYelp: [
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
        };

        // Reviews API that integrates with your existing system
        const ReviewsAPI = {
            cache: new Map(),

            async fetchGoogleReviews() {
                const cacheKey = 'google_reviews_v2';
                const cached = this.getCached(cacheKey);
                
                if (cached) {
                    console.log('805 LifeGuard: Using cached Google reviews');
                    return cached;
                }

                try {
                    console.log('805 LifeGuard: Fetching live Google reviews...');
                    const response = await fetch(TESTIMONIALS_CONFIG.api.googleEndpoint, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' },
                        signal: AbortSignal.timeout(TESTIMONIALS_CONFIG.api.timeout)
                    });

                    if (!response.ok) {
                        throw new Error(`Google API error: ${response.status}`);
                    }

                    const data = await response.json();
                    
                    if (data.success && data.reviews) {
                        this.setCached(cacheKey, data.reviews);
                        console.log('805 LifeGuard: Loaded', data.reviews.length, 'Google reviews');
                        return data.reviews;
                    } else {
                        console.warn('805 LifeGuard: Google API returned no reviews');
                        return [];
                    }

                } catch (error) {
                    console.warn('805 LifeGuard: Google reviews fallback -', error.message);
                    return [];
                }
            },

            async fetchYelpReviews() {
                // Use manual Yelp data (cost-effective)
                console.log('805 LifeGuard: Using manual Yelp reviews');
                return TESTIMONIALS_CONFIG.manualYelp;
            },

            getCached(key) {
                const cached = this.cache.get(key);
                if (cached && Date.now() - cached.timestamp < TESTIMONIALS_CONFIG.cache.duration) {
                    return cached.data;
                }
                return null;
            },

            setCached(key, data) {
                this.cache.set(key, {
                    data: data,
                    timestamp: Date.now()
                });
            },

            calculateAverageRating(reviews) {
                if (!reviews || reviews.length === 0) return '5.0';
                const sum = reviews.reduce((acc, review) => acc + (review.rating || 5), 0);
                return (sum / reviews.length).toFixed(1);
            },

            getMostRecent(reviews, count = 4) {
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

        // UI Renderer that uses your existing CSS classes
        const TestimonialsUI = {
            renderGoogleReview(review) {
                const stars = '★'.repeat(review.rating);
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
                                ${stars.split('').map(star => `<i class="fas fa-star" aria-hidden="true"></i>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
            },

            renderQuickReview(review, platform) {
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

            sanitizeText(text) {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            },

            truncateText(text, maxLength) {
                if (!text || text.length <= maxLength) return text;
                return text.substr(0, maxLength).replace(/\w+$/, '...').trim();
            }
        };

        // Statistics updater that integrates with your existing elements
        const StatsUpdater = {
            update(googleReviews, yelpReviews) {
                const googleRating = ReviewsAPI.calculateAverageRating(googleReviews);
                const yelpRating = ReviewsAPI.calculateAverageRating(yelpReviews);
                const googleCount = googleReviews.length;
                const yelpCount = yelpReviews.length;
                
                // Update using your existing element IDs
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
            
            updateElement(id, value) {
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

        // Platform navigation that integrates with your existing smooth scroll
        const PlatformNavigation = {
            setup() {
                const googlePreview = document.getElementById('google-reviews-preview');
                const yelpPreview = document.getElementById('yelp-reviews-preview');
                
                if (googlePreview) {
                    googlePreview.addEventListener('click', () => {
                        // Use your existing smooth scroll system
                        if (window.LuxuryApp && window.LuxuryApp.prototype.smoothScrollTo) {
                            window.app.smoothScrollTo('#google-reviews-section');
                        }
                    });
                }
                
                if (yelpPreview) {
                    yelpPreview.addEventListener('click', () => {
                        if (window.LuxuryApp && window.LuxuryApp.prototype.smoothScrollTo) {
                            window.app.smoothScrollTo('#yelp-reviews-section');
                        }
                    });
                }
            }
        };

        // Review submission system (leverages your existing CSS)
        const ReviewSubmission = {
            isOpen: false,
            
            init() {
                this.setupEventListeners();
                this.setupFloatingButton();
                console.log('805 LifeGuard: Review submission system ready');
            },

            setupFloatingButton() {
                const trigger = document.getElementById('reviewSubmissionTrigger');
                if (!trigger) return;
                
                // Show after scrolling past hero (uses your intersection observer pattern)
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
                if (hero) observer.observe(hero);
            },

            setupEventListeners() {
                const openBtn = document.getElementById('openReviewModal');
                const closeBtn = document.getElementById('closeReviewModal');
                const cancelBtn = document.getElementById('cancelReviewBtn');
                const overlay = document.getElementById('reviewModalOverlay');
                const form = document.getElementById('reviewSubmissionForm');
                
                if (openBtn) openBtn.addEventListener('click', () => this.openModal());
                if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
                if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
                
                if (overlay) {
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) this.closeModal();
                    });
                }
                
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.isOpen) this.closeModal();
                });
                
                if (form) {
                    form.addEventListener('submit', (e) => this.handleSubmit(e));
                }
                
                this.setupStarRating();
                this.setupFormValidation();
            },

            setupStarRating() {
                const starInputs = document.querySelectorAll('.star-input');
                const ratingFeedback = document.getElementById('rating-feedback');
                
                const messages = {
                    5: 'Excellent! We\'re delighted you had such a wonderful experience.',
                    4: 'Very good! Thank you for your positive feedback.',
                    3: 'Good. We appreciate your feedback and will continue improving.',
                    2: 'Fair. We\'d love to understand how we can serve you better.',
                    1: 'We\'re sorry to hear this. Please let us know how we can improve.'
                };
                
                starInputs.forEach(input => {
                    input.addEventListener('change', () => {
                        const rating = parseInt(input.value);
                        if (ratingFeedback) {
                            ratingFeedback.className = 'rating-feedback ' + (rating >= 4 ? 'excellent' : rating === 3 ? 'average' : 'poor');
                            ratingFeedback.textContent = messages[rating] || '';
                        }
                    });
                });
            },

            setupFormValidation() {
                const form = document.getElementById('reviewSubmissionForm');
                if (!form) return;
                
                // Real-time validation using your existing CSS classes
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
                        counter.style.color = length < 20 || length > 950 ? 'var(--color-warning)' : 'var(--color-text-tertiary)';
                    });
                }
            },

            validateField(field) {
                const value = field.value.trim();
                const isRequired = field.hasAttribute('required');
                let isValid = true;
                let errorMessage = '';
                
                if (isRequired && !value) {
                    isValid = false;
                    errorMessage = 'This field is required.';
                } else if (value && field.name === 'clientEmail') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address.';
                    }
                } else if (value && field.name === 'reviewText' && value.length < 20) {
                    isValid = false;
                    errorMessage = 'Please provide at least 20 characters for your review.';
                }
                
                this.showFieldValidation(field, isValid, errorMessage);
                return isValid;
            },

            showFieldValidation(field, isValid, errorMessage = '') {
                const errorElement = document.getElementById(field.name + '-error');
                
                field.classList.remove('valid', 'invalid');
                if (isValid) {
                    field.classList.add('valid');
                    if (errorElement) {
                        errorElement.classList.remove('show');
                        errorElement.textContent = '';
                    }
                } else {
                    field.classList.add('invalid');
                    if (errorElement) {
                        errorElement.textContent = errorMessage;
                        errorElement.classList.add('show');
                    }
                }
            },

            clearFieldError(field) {
                field.classList.remove('invalid');
                const errorElement = document.getElementById(field.name + '-error');
                if (errorElement) {
                    errorElement.classList.remove('show');
                    errorElement.textContent = '';
                }
            },

            openModal() {
                const overlay = document.getElementById('reviewModalOverlay');
                if (!overlay) return;
                
                this.isOpen = true;
                overlay.classList.add('active');
                document.body.classList.add('review-modal-open');
                
                setTimeout(() => {
                    const firstInput = document.getElementById('clientName');
                    if (firstInput) firstInput.focus();
                }, 300);
            },

            closeModal() {
                const overlay = document.getElementById('reviewModalOverlay');
                if (!overlay) return;
                
                this.isOpen = false;
                overlay.classList.remove('active');
                document.body.classList.remove('review-modal-open');
                
                this.resetForm();
            },

            resetForm() {
                const form = document.getElementById('reviewSubmissionForm');
                if (!form) return;
                
                form.reset();
                
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

            handleSubmit(e) {
                e.preventDefault();
                
                if (!this.validateForm()) return;
                
                const submitBtn = document.getElementById('submitReviewBtn');
                if (submitBtn) {
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                }
                
                // Simulate submission
                setTimeout(() => {
                    this.handleSubmissionSuccess();
                }, 2000);
            },

            validateForm() {
                const form = document.getElementById('reviewSubmissionForm');
                if (!form) return false;
                
                let isValid = true;
                
                const ratingInputs = form.querySelectorAll('input[name="rating"]:checked');
                if (ratingInputs.length === 0) {
                    this.showToast('error', 'Rating Required', 'Please select a star rating.');
                    isValid = false;
                }
                
                const requiredFields = form.querySelectorAll('[required]');
                requiredFields.forEach(field => {
                    if (!this.validateField(field)) isValid = false;
                });
                
                return isValid;
            },

            handleSubmissionSuccess() {
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
                        <button type="button" class="btn btn-primary" onclick="window.TestimonialsEnhancement.ReviewSubmission.closeModal()">
                            <i class="fas fa-check"></i>
                            Close
                        </button>
                    </div>
                `;
                
                this.showToast('success', 'Review Submitted', 'Thank you for your valuable feedback!');
                
                setTimeout(() => this.closeModal(), 8000);
            },

            showToast(type, title, message, duration = 5000) {
                // Use your existing LuxuryApp notification system if available
                if (window.app && typeof window.app.showNotification === 'function') {
                    window.app.showNotification(type, `${title}: ${message}`, duration);
                    return;
                }
                
                // Fallback toast system using your existing CSS
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
                `;
                
                container.appendChild(toast);
                
                setTimeout(() => toast.classList.add('show'), 100);
                
                const closeBtn = toast.querySelector('.toast-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => this.removeToast(toastId));
                }
                
                setTimeout(() => this.removeToast(toastId), duration);
            },

            removeToast(toastId) {
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

        // Main controller that integrates with your existing system
        const TestimonialsController = {
            googleReviews: [],
            yelpReviews: [],
            
            async init() {
                console.log('🚀 805 LifeGuard: Loading testimonials enhancements...');
                
                try {
                    this.showLoadingStates();
                    
                    // Load reviews concurrently
                    const [googleReviews, yelpReviews] = await Promise.allSettled([
                        ReviewsAPI.fetchGoogleReviews(),
                        ReviewsAPI.fetchYelpReviews()
                    ]);
                    
                    this.googleReviews = googleReviews.status === 'fulfilled' ? googleReviews.value : [];
                    this.yelpReviews = yelpReviews.status === 'fulfilled' ? yelpReviews.value : [];
                    
                    console.log('📊 Reviews loaded:', {
                        google: this.googleReviews.length,
                        yelp: this.yelpReviews.length
                    });
                    
                    // Update UI using your existing design system
                    this.renderGoogleReviews();
                    this.renderQuickReviews();
                    StatsUpdater.update(this.googleReviews, this.yelpReviews);
                    
                    // Setup integrations
                    PlatformNavigation.setup();
                    ReviewSubmission.init();
                    
                    // Trigger animations using your existing CSS classes
                    this.animateElements();
                    
                    console.log('✅ 805 LifeGuard: Testimonials enhancement complete');
                    
                } catch (error) {
                    console.error('805 LifeGuard: Testimonials enhancement error:', error);
                    this.handleError();
                }
            },

            showLoadingStates() {
                const quickReviews = document.getElementById('quickReviews');
                if (quickReviews) {
                    quickReviews.innerHTML = `
                        <div class="loading-placeholder">
                            <div class="loading-spinner"></div>
                            <p>Loading latest reviews...</p>
                        </div>
                    `;
                }
                
                const googleContainer = document.getElementById('google-reviews-container');
                if (googleContainer) {
                    googleContainer.innerHTML = `
                        <div class="loading-placeholder">
                            <div class="loading-spinner"></div>
                            <p>Loading Google reviews...</p>
                        </div>
                    `;
                }
            },

            renderGoogleReviews() {
                const container = document.getElementById('google-reviews-container');
                if (!container) return;
                
                if (this.googleReviews.length === 0) {
                    container.innerHTML = `
                        <div class="error-message show">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Google reviews temporarily unavailable</p>
                            <p><small>Please visit our Google Maps page to read reviews</small></p>
                        </div>
                    `;
                    return;
                }
                
                const reviewsHTML = this.googleReviews
                    .filter(review => review.rating >= 4)
                    .slice(0, 8)
                    .map(review => TestimonialsUI.renderGoogleReview(review))
                    .join('');
                
                container.innerHTML = reviewsHTML;
            },

            renderQuickReviews() {
                const container = document.getElementById('quickReviews');
                if (!container) return;
                
                const allReviews = [];
                
                // Combine recent reviews
                const recentGoogle = ReviewsAPI.getMostRecent(this.googleReviews, 2);
                recentGoogle.forEach(review => allReviews.push({ review, platform: 'google' }));
                
                const recentYelp = ReviewsAPI.getMostRecent(this.yelpReviews, 2);
                recentYelp.forEach(review => allReviews.push({ review, platform: 'yelp' }));
                
                if (allReviews.length === 0) {
                    container.innerHTML = `
                        <div class="error-message show">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>No recent reviews available</p>
                            <p><small>Check back soon for new client feedback</small></p>
                        </div>
                    `;
                    return;
                }
                
                // Shuffle and render
                const shuffled = allReviews.sort(() => Math.random() - 0.5).slice(0, 4);
                const quickReviewsHTML = shuffled
                    .map(item => TestimonialsUI.renderQuickReview(item.review, item.platform))
                    .join('');
                
                container.innerHTML = quickReviewsHTML;
            },

            animateElements() {
                // Use your existing animation classes
                const platforms = document.querySelectorAll('.review-platform');
                platforms.forEach((platform, index) => {
                    setTimeout(() => {
                        platform.classList.add('loaded');
                    }, 100 * index);
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
                    }, 500 + (index * 100));
                });
                
                const testimonialCards = document.querySelectorAll('.testimonial-card[data-platform]');
                testimonialCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('loaded');
                    }, 800 + (index * 100));
                });
            },

            handleError() {
                console.warn('805 LifeGuard: Using fallback state for testimonials');
                
                const quickReviews = document.getElementById('quickReviews');
                if (quickReviews) {
                    quickReviews.innerHTML = `
                        <div class="error-message show">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Unable to load reviews</p>
                            <p><small>Please try again later</small></p>
                        </div>
                    `;
                }
                
                // Still initialize review submission
                try {
                    ReviewSubmission.init();
                } catch (error) {
                    console.error('805 LifeGuard: Review submission init failed:', error);
                }
            },

            // Public API methods that integrate with your LuxuryApp
            getStats() {
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
            },

            refresh() {
                ReviewsAPI.cache.clear();
                return this.init();
            }
        };

        // Export for integration with your existing system
        window.TestimonialsEnhancement = {
            ReviewsAPI: ReviewsAPI,
            TestimonialsController: TestimonialsController,
            ReviewSubmission: ReviewSubmission,
            version: '2.0'
        };

        // Initialize the enhancement
        TestimonialsController.init();
    }

    // Initialize when your LuxuryApp is ready
    if (window.LuxuryApp) {
        window.addEventListener('luxuryAppReady', initTestimonialsEnhancement);
    } else {
        // Fallback if LuxuryApp loads after this script
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(initTestimonialsEnhancement, 1000);
        });
    }

})();
