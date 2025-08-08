/*
 * 805 LifeGuard - PROTECTED Enhanced Testimonials JavaScript
 * Version: 15.0-ENTERPRISE (Integration & Performance Optimized)
 * Integration: Luxury App v12.3+ Compatible
 * Scope: testimonials.html ONLY - Zero impact on other pages
 * 
 * ENTERPRISE PROTECTION: This file includes safeguards to protect
 * the existing luxury design system and only activates on testimonials page
 */

(function() {
    'use strict';
    
    // === INTEGRATION SAFEGUARDS & PROTECTION ===
    const INTEGRATION_CONFIG = {
        REQUIRED_CORE_VERSION: '12.3',
        LUXURY_APP_REQUIRED: true,
        TESTIMONIALS_PAGE_ONLY: true,
        FALLBACK_ENABLED: true,
        MAX_INIT_ATTEMPTS: 3,
        INIT_TIMEOUT: 10000
    };
    
    // === PRE-FLIGHT SAFETY CHECKS ===
    function performSafetyChecks() {
        const checks = {
            isTestimonialsPage: window.location.pathname.includes('testimonials'),
            luxuryAppExists: typeof window.app !== 'undefined',
            luxuryAppReady: window.app ? window.app.isReady() : false,
            luxuryAppVersion: window.app ? window.app.getVersion() : null,
            criticalElementsPresent: checkCriticalElements(),
            noConflicts: checkForConflicts()
        };
        
        console.log('🔒 805 LifeGuard: Enhanced Testimonials Safety Checks:', checks);
        return checks;
    }
    
    function checkCriticalElements() {
        const required = ['header', 'menuToggle', 'navOverlay', 'mainLogo'];
        return required.every(id => document.getElementById(id) !== null);
    }
    
    function checkForConflicts() {
        const conflicts = ['TestimonialsApp', 'ReviewSubmissionSystem', 'ReviewsController'];
        return !conflicts.some(name => window[name] !== undefined);
    }
    
    // === GRACEFUL FALLBACK ===
    function enableFallbackMode() {
        console.log('🔄 Enhanced Testimonials: Enabling fallback mode');
        
        const containers = ['quickReviews', 'google-reviews-container'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="fallback-message" style="text-align: center; padding: 2rem;">
                        <p>Loading testimonials...</p>
                        <p><small>Enhanced features temporarily unavailable</small></p>
                    </div>
                `;
            }
        });
        
        // Ensure basic navigation still works
        const buttons = document.querySelectorAll('.btn[href^="#"]');
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const targetId = btn.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
    
    // === PROTECTED INITIALIZATION ===
    let initAttempts = 0;
    
    function protectedInit() {
        initAttempts++;
        
        if (initAttempts > INTEGRATION_CONFIG.MAX_INIT_ATTEMPTS) {
            console.error('🚨 Enhanced Testimonials: Max initialization attempts exceeded');
            if (INTEGRATION_CONFIG.FALLBACK_ENABLED) {
                enableFallbackMode();
            }
            return;
        }
        
        const checks = performSafetyChecks();
        
        // CRITICAL: Only proceed if on testimonials page
        if (!checks.isTestimonialsPage) {
            console.log('🚫 Enhanced Testimonials: Not on testimonials page, skipping initialization');
            return;
        }
        
        // CRITICAL: Require luxury app system
        if (INTEGRATION_CONFIG.LUXURY_APP_REQUIRED && !checks.luxuryAppExists) {
            console.warn('⚠️ Enhanced Testimonials: Luxury app system not found, retrying...');
            setTimeout(protectedInit, 1000);
            return;
        }
        
        if (!checks.noConflicts || !checks.criticalElementsPresent) {
            console.error('🚨 Enhanced Testimonials: Safety checks failed');
            if (INTEGRATION_CONFIG.FALLBACK_ENABLED) {
                enableFallbackMode();
            }
            return;
        }
        
        console.log('✅ Enhanced Testimonials: All safety checks passed, proceeding...');
        
        // Wait for luxury app to be fully ready
        function waitForLuxuryApp() {
            if (window.app && window.app.isReady()) {
                initializeEnhancedTestimonials();
            } else {
                setTimeout(waitForLuxuryApp, 100);
            }
        }
        
        waitForLuxuryApp();
    }
    
    // === MAIN ENHANCED TESTIMONIALS SYSTEM ===
    function initializeEnhancedTestimonials() {
        console.log('🚀 Enhanced Testimonials: Starting main system initialization...');
        
        // === ENHANCED CONFIGURATION SYSTEM ===
        const TESTIMONIALS_CONFIG = {
            // API Configuration - Optimized for Performance
            api: {
                google: {
                    placeId: 'ChIJF_n_aeIx6IARDaz-6Q4-Hec',
                    proxyEndpoint: 'https://805-lifeguard-reviews-api.jaspervdz.workers.dev/api/google-reviews',
                    maxReviews: 8,
                    minRating: 4,
                    timeout: 8000,
                    retryAttempts: 2,
                    retryDelay: 1500
                },
                
                yelp: {
                    // Cost-effective manual approach with real reviews
                    manualReviews: [
                        {
                            user: { name: "Parent from Thousand Oaks" },
                            rating: 5,
                            text: "Very appreciative of Jasper for teaching our 5 year old pool safety and beginner swimming skills. Prior to his lessons our little one wouldn't even dunk his head under water. By the end of the lessons he was so comfortable navigating the pool.",
                            time_created: "2024-06-15T10:00:00Z",
                            id: "manual_yelp_1",
                            verified: true
                        },
                        {
                            user: { name: "Team Event Organizer" },
                            rating: 5,
                            text: "We were looking to hire a lifeguard for a team pool party and found 805Lifeguard online. Jasper was very communicative during the whole process and easy to book with. Both were friendly, attentive, and gave the parents a lot of peace of mind during the party!",
                            time_created: "2024-05-20T14:30:00Z",
                            id: "manual_yelp_2",
                            verified: true
                        },
                        {
                            user: { name: "Grandparent" },
                            rating: 5,
                            text: "Jasper is so patient and makes learning to swim super fun. My grandson was swimming after 3-4 sessions! His teaching method is excellent and he really knows how to connect with children.",
                            time_created: "2024-04-10T16:45:00Z",
                            id: "manual_yelp_3",
                            verified: true
                        },
                        {
                            user: { name: "Matt E." },
                            rating: 5,
                            text: "Our little one learned how to swim in about eight or ten lessons. I would highly recommend Jasper for a youth swimming coach and as a lifeguard for parties!",
                            time_created: "2024-03-25T11:15:00Z",
                            id: "manual_yelp_4",
                            verified: true
                        }
                    ]
                },
                
                submission: {
                    endpoint: 'https://805-lifeguard-reviews-api.jaspervdz.workers.dev/api/submit-review',
                    timeout: 10000,
                    retryAttempts: 1
                }
            },
            
            // Enhanced Cache System
            cache: {
                duration: 1800000, // 30 minutes
                keyPrefix: '805lifeguard_reviews_v15_',
                enableCache: true,
                memoryLimit: 10
            },
            
            // Performance Optimization
            performance: {
                enablePreloading: true,
                lazyLoadImages: true,
                debounceDelay: 200,
                throttleDelay: 16,
                intersectionThreshold: 0.15,
                rootMargin: '50px',
                maxConcurrentRequests: 3
            },
            
            // UI/UX Configuration
            ui: {
                animationDuration: 600,
                staggerDelay: 100,
                loadingMinTime: 800,
                toastDuration: 5000,
                modalTransitionTime: 400,
                enableHapticFeedback: true
            },
            
            // Debug Settings
            debug: {
                enableLogging: true,
                logLevel: 'info',
                enablePerformanceMetrics: true,
                enableAPIMetrics: true
            }
        };
        
        // === ENHANCED INTEGRATION WITH LUXURY APP ===
        const LuxuryAppIntegration = {
            app: null,
            isReady: false,
            
            init: function() {
                if (window.app && window.app.isReady && window.app.isReady()) {
                    this.handleAppReady(window.app);
                } else {
                    setTimeout(() => {
                        if (window.app && window.app.isReady()) {
                            this.handleAppReady(window.app);
                        } else {
                            console.warn('Luxury app not detected, initializing standalone mode');
                            this.handleAppReady(null);
                        }
                    }, 1000);
                }
            },
            
            handleAppReady: function(app) {
                this.app = app;
                this.isReady = true;
                
                Logger.info('Luxury app integration established', {
                    hasApp: !!app,
                    version: app ? app.getVersion() : 'standalone',
                    deviceType: app ? app.getDeviceType() : this.getDeviceType()
                });
                
                this.notifyTestimonialsReady();
            },
            
            notifyTestimonialsReady: function() {
                const event = new CustomEvent('testimonialsSystemReady', {
                    detail: {
                        integration: this,
                        app: this.app,
                        standalone: !this.app,
                        timestamp: Date.now()
                    }
                });
                window.dispatchEvent(event);
            },
            
            getDeviceType: function() {
                return this.app ? this.app.getDeviceType() : Utils.getDeviceType();
            },
            
            isMobile: function() {
                return this.getDeviceType() === 'mobile';
            },
            
            smoothScrollTo: function(target, offset) {
                if (this.app && this.app.smoothScrollTo) {
                    return this.app.smoothScrollTo(target, offset);
                }
                return Utils.smoothScrollTo(target, offset);
            }
        };
        
        // === ENHANCED LOGGING SYSTEM ===
        const Logger = {
            levels: { error: 0, warn: 1, info: 2, debug: 3 },
            currentLevel: 2,
            
            init: function() {
                const levelName = TESTIMONIALS_CONFIG.debug.logLevel;
                this.currentLevel = this.levels[levelName] || 2;
                
                if (!TESTIMONIALS_CONFIG.debug.enableLogging) {
                    this.currentLevel = -1;
                }
            },
            
            shouldLog: function(level) {
                return this.currentLevel >= this.levels[level];
            },
            
            formatMessage: function(level, message, data) {
                const timestamp = new Date().toISOString().substr(11, 12);
                const prefix = `[${timestamp}] [${level.toUpperCase()}] 805 Testimonials:`;
                return { prefix, message, data };
            },
            
            error: function(message, data) {
                if (this.shouldLog('error')) {
                    const log = this.formatMessage('error', message, data);
                    console.error(log.prefix, log.message, log.data || '');
                }
            },
            
            warn: function(message, data) {
                if (this.shouldLog('warn')) {
                    const log = this.formatMessage('warn', message, data);
                    console.warn(log.prefix, log.message, log.data || '');
                }
            },
            
            info: function(message, data) {
                if (this.shouldLog('info')) {
                    const log = this.formatMessage('info', message, data);
                    console.info(log.prefix, log.message, log.data || '');
                }
            },
            
            debug: function(message, data) {
                if (this.shouldLog('debug')) {
                    const log = this.formatMessage('debug', message, data);
                    console.log(log.prefix, log.message, log.data || '');
                }
            },
            
            performance: function(label, duration, metadata) {
                if (TESTIMONIALS_CONFIG.debug.enablePerformanceMetrics) {
                    console.log(`[PERF] 805 Testimonials: ${label} - ${duration}ms`, metadata || '');
                }
            },
            
            api: function(endpoint, duration, success, metadata) {
                if (TESTIMONIALS_CONFIG.debug.enableAPIMetrics) {
                    const status = success ? 'SUCCESS' : 'FAILED';
                    console.log(`[API] 805 Testimonials: ${endpoint} - ${status} (${duration}ms)`, metadata || '');
                }
            }
        };
        
        // === ENHANCED UTILITIES ===
        const Utils = {
            debounce: function(func, wait, immediate = false) {
                let timeout;
                return function executedFunction() {
                    const context = this;
                    const args = arguments;
                    
                    const later = function() {
                        timeout = null;
                        if (!immediate) func.apply(context, args);
                    };
                    
                    const callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    
                    if (callNow) func.apply(context, args);
                };
            },
            
            throttle: function(func, limit, options = {}) {
                let inThrottle;
                let lastFunc;
                let lastRan;
                
                return function() {
                    const context = this;
                    const args = arguments;
                    
                    if (!inThrottle) {
                        if (options.leading !== false) {
                            func.apply(context, args);
                        }
                        lastRan = Date.now();
                        inThrottle = true;
                    } else {
                        clearTimeout(lastFunc);
                        lastFunc = setTimeout(function() {
                            if (Date.now() - lastRan >= limit) {
                                if (options.trailing !== false) {
                                    func.apply(context, args);
                                }
                                lastRan = Date.now();
                            }
                        }, limit - (Date.now() - lastRan));
                    }
                };
            },
            
            getDeviceType: function() {
                const width = window.innerWidth;
                if (width <= 768) return 'mobile';
                if (width <= 1024) return 'tablet';
                return 'desktop';
            },
            
            isMobile: function() {
                return window.innerWidth <= 768;
            },
            
            smoothScrollTo: function(targetId, offset) {
                const target = document.querySelector(targetId);
                if (!target) return false;

                const isMobile = this.isMobile();
                offset = offset || (isMobile ? 88 : 132);
                const targetPosition = target.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                target.setAttribute('tabindex', '-1');
                target.focus();
                target.style.outline = 'none';
                
                return true;
            },
            
            fetchWithRetry: async function(url, options = {}, retries = 2) {
                const timeout = options.timeout || TESTIMONIALS_CONFIG.api.google.timeout;
                
                for (let i = 0; i <= retries; i++) {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), timeout);
                        
                        const response = await fetch(url, {
                            ...options,
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }
                        
                        return response;
                        
                    } catch (error) {
                        Logger.warn(`Fetch attempt ${i + 1} failed for ${url}`, error.message);
                        
                        if (i === retries) {
                            throw error;
                        }
                        
                        const delay = TESTIMONIALS_CONFIG.api.google.retryDelay * Math.pow(2, i);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            },
            
            storage: {
                set: function(key, data) {
                    try {
                        localStorage.setItem(key, JSON.stringify(data));
                        return true;
                    } catch (error) {
                        Logger.error('Storage set failed', error);
                        return false;
                    }
                },
                
                get: function(key) {
                    try {
                        const value = localStorage.getItem(key);
                        return value ? JSON.parse(value) : null;
                    } catch (error) {
                        Logger.error('Storage get failed', error);
                        return null;
                    }
                },
                
                remove: function(key) {
                    try {
                        localStorage.removeItem(key);
                        return true;
                    } catch (error) {
                        Logger.error('Storage remove failed', error);
                        return false;
                    }
                }
            }
        };
        
        // === ENHANCED CACHE SYSTEM ===
        const EnhancedCache = {
            memoryCache: new Map(),
            memoryOrder: [],
            maxMemoryItems: TESTIMONIALS_CONFIG.cache.memoryLimit,
            
            init: function() {
                Logger.info('Enhanced cache system initialized');
            },
            
            set: function(key, data, options = {}) {
                const cacheItem = {
                    data,
                    timestamp: Date.now(),
                    version: '15.0',
                    metadata: options.metadata || {}
                };
                
                this.setMemoryCache(key, cacheItem);
                
                if (this.isStorageAvailable() && TESTIMONIALS_CONFIG.cache.enableCache) {
                    Utils.storage.set(TESTIMONIALS_CONFIG.cache.keyPrefix + key, cacheItem);
                }
                
                return true;
            },
            
            get: function(key) {
                const memoryItem = this.getMemoryCache(key);
                if (memoryItem && this.isValid(memoryItem)) {
                    Logger.debug(`Cache hit (memory): ${key}`);
                    return memoryItem.data;
                }
                
                if (this.isStorageAvailable() && TESTIMONIALS_CONFIG.cache.enableCache) {
                    const cached = Utils.storage.get(TESTIMONIALS_CONFIG.cache.keyPrefix + key);
                    if (cached && this.isValid(cached)) {
                        Logger.debug(`Cache hit (storage): ${key}`);
                        this.setMemoryCache(key, cached);
                        return cached.data;
                    }
                }
                
                Logger.debug(`Cache miss: ${key}`);
                return null;
            },
            
            setMemoryCache: function(key, item) {
                if (this.memoryCache.size >= this.maxMemoryItems) {
                    const oldestKey = this.memoryOrder.shift();
                    this.memoryCache.delete(oldestKey);
                }
                
                const existingIndex = this.memoryOrder.indexOf(key);
                if (existingIndex > -1) {
                    this.memoryOrder.splice(existingIndex, 1);
                }
                this.memoryOrder.push(key);
                
                this.memoryCache.set(key, item);
            },
            
            getMemoryCache: function(key) {
                const item = this.memoryCache.get(key);
                if (item) {
                    const index = this.memoryOrder.indexOf(key);
                    if (index > -1) {
                        this.memoryOrder.splice(index, 1);
                        this.memoryOrder.push(key);
                    }
                }
                return item;
            },
            
            isValid: function(cacheItem) {
                if (!cacheItem || !cacheItem.timestamp) return false;
                
                const age = Date.now() - cacheItem.timestamp;
                const isExpired = age > TESTIMONIALS_CONFIG.cache.duration;
                const isValidVersion = cacheItem.version === '15.0';
                
                return !isExpired && isValidVersion;
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
                            if (key.startsWith(TESTIMONIALS_CONFIG.cache.keyPrefix)) {
                                Utils.storage.remove(key);
                            }
                        });
                    } catch (error) {
                        Logger.error('Cache clear failed', error);
                    }
                }
                
                Logger.info('Cache cleared completely');
            }
        };
        
        // === ENHANCED API CLIENT ===
        const APIClient = {
            requestQueue: [],
            activeRequests: 0,
            maxConcurrentRequests: TESTIMONIALS_CONFIG.performance.maxConcurrentRequests,
            
            init: function() {
                Logger.info('Enhanced API client initialized');
            },
            
            async fetchGoogleReviews() {
                const cacheKey = 'google_v15';
                const cached = EnhancedCache.get(cacheKey);
                
                if (cached) {
                    Logger.info('Using cached Google reviews');
                    return cached;
                }
                
                try {
                    const startTime = Date.now();
                    Logger.info('Fetching live Google reviews...');
                    
                    const response = await Utils.fetchWithRetry(
                        TESTIMONIALS_CONFIG.api.google.proxyEndpoint,
                        {
                            method: 'GET',
                            headers: { 'Accept': 'application/json' },
                            timeout: TESTIMONIALS_CONFIG.api.google.timeout
                        },
                        TESTIMONIALS_CONFIG.api.google.retryAttempts
                    );
                    
                    const data = await response.json();
                    const duration = Date.now() - startTime;
                    
                    if (!data.success) {
                        throw new Error(data.error || 'Worker API error');
                    }
                    
                    const reviews = data.reviews || [];
                    EnhancedCache.set(cacheKey, reviews, { metadata: { platform: 'google' } });
                    
                    Logger.api(TESTIMONIALS_CONFIG.api.google.proxyEndpoint, duration, true, {
                        reviews: reviews.length,
                        cached: false
                    });
                    
                    return reviews;
                    
                } catch (error) {
                    Logger.error('Google reviews fetch failed', error);
                    return [];
                }
            },
            
            async fetchYelpReviews() {
                const reviews = TESTIMONIALS_CONFIG.api.yelp.manualReviews;
                Logger.info('Yelp reviews loaded (manual)', { count: reviews.length });
                return reviews;
            },
            
            async submitReview(formData) {
                try {
                    const startTime = Date.now();
                    
                    const response = await Utils.fetchWithRetry(
                        TESTIMONIALS_CONFIG.api.submission.endpoint,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                ...formData,
                                timestamp: new Date().toISOString(),
                                source: 'testimonials-page',
                                version: '15.0'
                            }),
                            timeout: TESTIMONIALS_CONFIG.api.submission.timeout
                        },
                        TESTIMONIALS_CONFIG.api.submission.retryAttempts
                    );
                    
                    const result = await response.json();
                    const duration = Date.now() - startTime;
                    
                    Logger.api(TESTIMONIALS_CONFIG.api.submission.endpoint, duration, true, {
                        rating: formData.rating,
                        service: formData.serviceReceived
                    });
                    
                    return result;
                    
                } catch (error) {
                    Logger.error('Review submission failed', error);
                    throw error;
                }
            }
        };
        
        // === UI CONTROLLER ===
        const UIController = {
            animationQueue: [],
            isAnimating: false,
            loadingStates: new Set(),
            
            init: function() {
                Logger.info('UI controller initialized');
            },
            
            showLoadingState: function(containerId, message = 'Loading...') {
                const container = document.getElementById(containerId);
                if (!container) return;
                
                this.loadingStates.add(containerId);
                
                container.innerHTML = `
                    <div class="loading-placeholder" data-loading="${containerId}">
                        <div class="loading-spinner"></div>
                        <p>${message}</p>
                    </div>
                `;
            },
            
            hideLoadingState: function(containerId) {
                this.loadingStates.delete(containerId);
                
                const loading = document.querySelector(`[data-loading="${containerId}"]`);
                if (loading) {
                    loading.classList.add('fade-out');
                    setTimeout(() => {
                        if (loading.parentNode) {
                            loading.parentNode.removeChild(loading);
                        }
                    }, 300);
                }
            },
            
            showErrorState: function(containerId, title = 'Unable to load content', message = 'Please try again later') {
                const container = document.getElementById(containerId);
                if (!container) return;
                
                this.loadingStates.delete(containerId);
                
                container.innerHTML = `
                    <div class="error-message show">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p><strong>${title}</strong></p>
                        <p><small>${message}</small></p>
                        <button class="btn btn-secondary" onclick="TestimonialsApp.refreshSection('${containerId}')">
                            <i class="fas fa-refresh"></i>
                            Try Again
                        </button>
                    </div>
                `;
            },
            
            renderReviews: function(reviews, platform, containerId) {
                const container = document.getElementById(containerId);
                if (!container || !reviews || reviews.length === 0) {
                    this.showErrorState(containerId, 
                        `${platform} reviews temporarily unavailable`,
                        `Please visit our ${platform} page to read reviews`
                    );
                    return;
                }
                
                const reviewsHTML = reviews
                    .filter(review => review.rating >= TESTIMONIALS_CONFIG.api.google.minRating)
                    .slice(0, TESTIMONIALS_CONFIG.api.google.maxReviews)
                    .map(review => this.renderSingleReview(review, platform))
                    .join('');
                
                container.innerHTML = reviewsHTML;
                
                // Trigger animations
                setTimeout(() => {
                    const cards = container.querySelectorAll('.testimonial-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('loaded', `stagger-${(index % 8) + 1}`);
                        }, index * TESTIMONIALS_CONFIG.ui.staggerDelay);
                    });
                }, 100);
            },
            
            renderSingleReview: function(review, platform) {
                const stars = this.renderStars(review.rating);
                const sanitizedText = this.sanitizeText(review.text);
                const truncatedText = this.truncateText(sanitizedText, 220);
                const authorName = platform === 'google' ? review.author_name : review.user.name;
                const timeInfo = platform === 'google' ? review.relative_time_description : this.timeAgo(review.time_created);
                
                return `
                    <div class="testimonial-card" data-platform="${platform}" data-rating="${review.rating}">
                        <div class="testimonial-content">
                            <div class="platform-indicator">
                                <div class="platform-logo ${platform}-logo">${platform === 'google' ? 'G' : 'Y'}</div>
                                <span>${platform === 'google' ? 'Google' : 'Yelp'} Review</span>
                            </div>
                            <p>${truncatedText}</p>
                        </div>
                        <div class="testimonial-author">
                            <div class="author-info">
                                <div class="author-name">${this.sanitizeText(authorName)}</div>
                                <div class="author-location">Verified ${platform === 'google' ? 'Google' : 'Yelp'} Customer</div>
                                <div class="author-service">${timeInfo}</div>
                            </div>
                            <div class="testimonial-rating" aria-label="${review.rating} star rating">
                                ${stars}
                            </div>
                        </div>
                    </div>
                `;
            },
            
            renderQuickReviews: function(allReviews, containerId) {
                const container = document.getElementById(containerId);
                if (!container) return;
                
                if (allReviews.length === 0) {
                    this.showErrorState(containerId, 
                        'No recent reviews available',
                        'Check back soon for new client feedback'
                    );
                    return;
                }
                
                const shuffled = allReviews.sort(() => Math.random() - 0.5).slice(0, 4);
                const quickReviewsHTML = shuffled
                    .map(item => this.renderQuickReview(item.review, item.platform))
                    .join('');
                
                container.innerHTML = quickReviewsHTML;
                
                setTimeout(() => {
                    const reviews = container.querySelectorAll('.quick-review');
                    reviews.forEach((review, index) => {
                        setTimeout(() => {
                            review.classList.add('loaded', `delay-${(index % 4) + 1}`);
                        }, index * 150);
                    });
                }, 200);
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
            }
        };
        
        // === STATISTICS UPDATER ===
        const StatsUpdater = {
            animationDuration: TESTIMONIALS_CONFIG.ui.animationDuration,
            
            update: function(googleReviews, yelpReviews) {
                const stats = this.calculateStats(googleReviews, yelpReviews);
                
                Object.entries(stats).forEach(([key, value]) => {
                    this.updateElement(key, value);
                });
                
                Logger.info('Statistics updated', stats);
            },
            
            calculateStats: function(googleReviews, yelpReviews) {
                return {
                    'google-rating': this.calculateAverageRating(googleReviews),
                    'yelp-rating': this.calculateAverageRating(yelpReviews),
                    'stats-google-rating': this.calculateAverageRating(googleReviews),
                    'stats-yelp-rating': this.calculateAverageRating(yelpReviews),
                    'stats-google-count': googleReviews.length + '+',
                    'stats-yelp-count': yelpReviews.length + '+',
                    'stats-total-served': Math.max(100, googleReviews.length + yelpReviews.length + 80) + '+'
                };
            },
            
            calculateAverageRating: function(reviews) {
                if (!reviews || reviews.length === 0) return '5.0';
                const sum = reviews.reduce((acc, review) => acc + (review.rating || 5), 0);
                return (sum / reviews.length).toFixed(1);
            },
            
            updateElement: function(id, value) {
                const element = document.getElementById(id);
                if (!element) return;
                
                this.animateCounter(element, value);
            },
            
            animateCounter: function(element, finalValue) {
                element.classList.add('stat-updating');
                
                const numericValue = parseFloat(finalValue) || 0;
                const isNumeric = !isNaN(numericValue);
                
                if (isNumeric && numericValue > 1) {
                    this.animateNumericValue(element, numericValue, finalValue);
                } else {
                    setTimeout(() => {
                        element.textContent = finalValue;
                        this.finishStatAnimation(element);
                    }, 100);
                }
            },
            
            animateNumericValue: function(element, targetNum, finalValue) {
                const startNum = parseFloat(element.textContent) || 0;
                const difference = targetNum - startNum;
                const steps = 20;
                const stepValue = difference / steps;
                const stepDuration = this.animationDuration / steps;
                
                let currentStep = 0;
                
                const animate = () => {
                    currentStep++;
                    const currentValue = startNum + (stepValue * currentStep);
                    
                    if (currentStep < steps) {
                        element.textContent = finalValue.includes('.') ? 
                            currentValue.toFixed(1) : Math.round(currentValue).toString();
                        
                        setTimeout(animate, stepDuration);
                    } else {
                        element.textContent = finalValue;
                        this.finishStatAnimation(element);
                    }
                };
                
                animate();
            },
            
            finishStatAnimation: function(element) {
                element.classList.remove('stat-updating');
                element.classList.add('stat-updated');
                
                setTimeout(() => {
                    element.classList.remove('stat-updated');
                }, this.animationDuration);
            }
        };
        
        // === REVIEW SUBMISSION SYSTEM ===
        const ReviewSubmissionSystem = {
            isOpen: false,
            currentRating: 0,
            formData: {},
            
            init: function() {
                this.setupEventListeners();
                this.setupFormValidation();
                this.setupFloatingButton();
                Logger.info('Review submission system initialized');
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
                
                starInputs.forEach(input => {
                    input.addEventListener('change', () => {
                        const rating = parseInt(input.value);
                        this.currentRating = rating;
                        
                        if (ratingFeedback) {
                            ratingFeedback.textContent = ratingMessages[rating] || '';
                        }
                        
                        if (TESTIMONIALS_CONFIG.ui.enableHapticFeedback && navigator.vibrate) {
                            navigator.vibrate(50);
                        }
                        
                        Logger.debug('Rating selected', { rating });
                    });
                });
            },
            
            setupFormValidation: function() {
                const form = document.getElementById('reviewSubmissionForm');
                if (!form) return;
                
                const inputs = form.querySelectorAll('.form-input, .form-textarea, .form-select');
                inputs.forEach(input => {
                    const debouncedValidation = Utils.debounce(() => {
                        this.validateField(input);
                    }, TESTIMONIALS_CONFIG.performance.debounceDelay);
                    
                    input.addEventListener('input', debouncedValidation);
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('focus', () => this.clearFieldError(input));
                });
                
                this.setupCharacterCounter();
            },
            
            setupCharacterCounter: function() {
                const reviewText = document.getElementById('reviewText');
                const counter = document.getElementById('reviewText-count');
                
                if (reviewText && counter) {
                    const updateCounter = Utils.throttle(() => {
                        const length = reviewText.value.length;
                        counter.textContent = `${length} / 1000 characters`;
                        
                        if (length < 20) {
                            counter.style.color = 'var(--color-warning)';
                            counter.innerHTML = `${length} / 1000 characters <small>(minimum 20)</small>`;
                        } else if (length > 950) {
                            counter.style.color = 'var(--color-warning)';
                            counter.innerHTML = `${length} / 1000 characters <small>(${1000 - length} remaining)</small>`;
                        } else {
                            counter.style.color = 'var(--color-text-tertiary)';
                            counter.textContent = `${length} / 1000 characters`;
                        }
                    }, 100);
                    
                    reviewText.addEventListener('input', updateCounter);
                }
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
            
            validateField: function(field) {
                // Basic validation logic
                const value = field.value.trim();
                const isRequired = field.hasAttribute('required');
                
                if (isRequired && !value) {
                    this.showFieldError(field, 'This field is required.');
                    return false;
                }
                
                this.clearFieldError(field);
                return true;
            },
            
            showFieldError: function(field, message) {
                field.classList.add('invalid');
                const errorElement = document.getElementById(field.name + '-error');
                if (errorElement) {
                    errorElement.textContent = message;
                    errorElement.classList.add('show');
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
                }, TESTIMONIALS_CONFIG.ui.modalTransitionTime);
                
                Logger.info('Review modal opened');
            },
            
            closeModal: function() {
                const overlay = document.getElementById('reviewModalOverlay');
                if (!overlay) return;
                
                this.isOpen = false;
                overlay.classList.remove('active');
                document.body.classList.remove('review-modal-open');
                
                setTimeout(() => {
                    this.resetForm();
                }, TESTIMONIALS_CONFIG.ui.modalTransitionTime);
                
                Logger.info('Review modal closed');
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
                }
                
                const counter = document.getElementById('reviewText-count');
                if (counter) {
                    counter.textContent = '0 / 1000 characters';
                    counter.style.color = 'var(--color-text-tertiary)';
                }
            },
            
            async handleSubmit(e) {
                e.preventDefault();
                
                if (!this.validateForm()) {
                    return;
                }
                
                const submitBtn = document.getElementById('submitReviewBtn');
                if (submitBtn) {
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                }
                
                try {
                    const formData = this.collectFormData();
                    const result = await APIClient.submitReview(formData);
                    await this.handleSubmissionSuccess(result);
                    
                } catch (error) {
                    this.handleSubmissionError(error);
                } finally {
                    if (submitBtn) {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    }
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
                
                const allFields = form.querySelectorAll('.form-input, .form-textarea, .form-select');
                allFields.forEach(field => {
                    if (!this.validateField(field)) {
                        isValid = false;
                    }
                });
                
                return isValid;
            },
            
            collectFormData: function() {
                const form = document.getElementById('reviewSubmissionForm');
                const formData = new FormData(form);
                
                return {
                    rating: this.currentRating,
                    clientName: formData.get('clientName'),
                    clientEmail: formData.get('clientEmail'),
                    clientLocation: formData.get('clientLocation'),
                    clientPhone: formData.get('clientPhone') || '',
                    serviceReceived: formData.get('serviceReceived'),
                    reviewText: formData.get('reviewText'),
                    submissionDate: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    deviceType: LuxuryAppIntegration.getDeviceType(),
                    pageUrl: window.location.href
                };
            },
            
            async handleSubmissionSuccess(result) {
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
                        <button type="button" class="btn btn-primary" onclick="ReviewSubmissionSystem.closeModal()">
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
            
            handleSubmissionError: function(error) {
                Logger.error('Review submission failed', error);
                this.showToast('error', 'Submission Failed', 
                    'We apologize for the inconvenience. Please try again or contact us directly.');
            },
            
            showToast: function(type, title, message, duration = TESTIMONIALS_CONFIG.ui.toastDuration) {
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
                }, 10);
                
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
        
        // === PLATFORM HANDLERS ===
        const PlatformHandlers = {
            init: function() {
                this.setupPlatformNavigation();
                Logger.info('Platform handlers initialized');
            },
            
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
                const clickHandler = (e) => {
                    e.preventDefault();
                    LuxuryAppIntegration.smoothScrollTo(targetSection);
                };
                
                const keyHandler = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        clickHandler(e);
                    }
                };
                
                button.addEventListener('click', clickHandler);
                button.addEventListener('keydown', keyHandler);
            }
        };
        
        // === MAIN TESTIMONIALS APPLICATION CLASS ===
        const TestimonialsApp = {
            version: '15.0',
            isInitialized: false,
            googleReviews: [],
            yelpReviews: [],
            
            async init() {
                Logger.info(`Initializing Enhanced Testimonials App v${this.version}...`);
                
                try {
                    // Initialize subsystems
                    Logger.init();
                    EnhancedCache.init();
                    APIClient.init();
                    UIController.init();
                    
                    // Wait for luxury app integration
                    await this.waitForIntegration();
                    
                    // Load reviews data
                    await this.loadAllReviews();
                    
                    // Initialize UI systems
                    PlatformHandlers.init();
                    ReviewSubmissionSystem.init();
                    
                    this.isInitialized = true;
                    
                    Logger.info(`Enhanced Testimonials App v${this.version} initialized successfully`);
                    this.dispatchReadyEvent();
                    
                } catch (error) {
                    Logger.error('Failed to initialize testimonials app', error);
                    this.handleInitializationError(error);
                }
            },
            
            waitForIntegration: function() {
                return new Promise(resolve => {
                    if (LuxuryAppIntegration.isReady) {
                        resolve();
                    } else {
                        const checkReady = () => {
                            if (LuxuryAppIntegration.isReady) {
                                resolve();
                            } else {
                                setTimeout(checkReady, 100);
                            }
                        };
                        checkReady();
                    }
                });
            },
            
            async loadAllReviews() {
                UIController.showLoadingState('quickReviews', 'Loading latest reviews...');
                UIController.showLoadingState('google-reviews-container', 'Loading Google reviews...');
                
                try {
                    const [googleResult, yelpResult] = await Promise.allSettled([
                        APIClient.fetchGoogleReviews(),
                        APIClient.fetchYelpReviews()
                    ]);
                    
                    this.googleReviews = googleResult.status === 'fulfilled' ? googleResult.value : [];
                    this.yelpReviews = yelpResult.status === 'fulfilled' ? yelpResult.value : [];
                    
                    this.renderAllContent();
                    
                    Logger.info('All reviews loaded successfully', {
                        google: this.googleReviews.length,
                        yelp: this.yelpReviews.length
                    });
                    
                } catch (error) {
                    Logger.error('Failed to load reviews', error);
                    this.handleLoadingError();
                }
            },
            
            renderAllContent: function() {
                UIController.hideLoadingState('quickReviews');
                UIController.hideLoadingState('google-reviews-container');
                
                UIController.renderReviews(this.googleReviews, 'Google', 'google-reviews-container');
                this.renderQuickReviews();
                
                StatsUpdater.update(this.googleReviews, this.yelpReviews);
                this.animateContentEntrance();
            },
            
            renderQuickReviews: function() {
                const allReviews = [];
                
                const recentGoogle = this.getMostRecent(this.googleReviews, 2);
                const recentYelp = this.getMostRecent(this.yelpReviews, 2);
                
                recentGoogle.forEach(review => allReviews.push({ review, platform: 'google' }));
                recentYelp.forEach(review => allReviews.push({ review, platform: 'yelp' }));
                
                UIController.renderQuickReviews(allReviews, 'quickReviews');
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
            },
            
            animateContentEntrance: function() {
                const platforms = document.querySelectorAll('.review-platform');
                platforms.forEach((platform, index) => {
                    setTimeout(() => {
                        platform.classList.add('loaded');
                        if (index === 0) platform.classList.add('delay-1');
                        if (index === 1) platform.classList.add('delay-2');
                    }, 200 * index);
                });
                
                const widget = document.getElementById('liveReviewsWidget');
                if (widget) {
                    setTimeout(() => {
                        widget.classList.add('loaded');
                    }, 600);
                }
            },
            
            handleInitializationError: function(error) {
                Logger.error('Testimonials app initialization failed', error);
                
                UIController.showErrorState('quickReviews', 
                    'System temporarily unavailable',
                    'Some features may be limited'
                );
                
                try {
                    ReviewSubmissionSystem.init();
                    PlatformHandlers.init();
                    Logger.info('Fallback initialization completed');
                } catch (fallbackError) {
                    Logger.error('Fallback initialization failed', fallbackError);
                }
            },
            
            handleLoadingError: function() {
                UIController.showErrorState('quickReviews');
                UIController.showErrorState('google-reviews-container', 
                    'Google reviews temporarily unavailable',
                    'Please visit our Google Maps page to read reviews'
                );
            },
            
            dispatchReadyEvent: function() {
                const event = new CustomEvent('testimonialsAppReady', {
                    detail: {
                        app: this,
                        version: this.version,
                        integration: LuxuryAppIntegration,
                        reviews: {
                            google: this.googleReviews.length,
                            yelp: this.yelpReviews.length
                        },
                        features: {
                            enhancedIntegration: true,
                            performanceOptimized: true,
                            mobileFriendly: true,
                            accessibilityCompliant: true,
                            cacheOptimized: true,
                            errorResilient: true
                        }
                    }
                });
                window.dispatchEvent(event);
            },
            
            // Public API methods
            refresh: async function() {
                Logger.info('Refreshing testimonials data...');
                EnhancedCache.clear();
                await this.loadAllReviews();
                return this;
            },
            
            refreshSection: async function(sectionId) {
                Logger.info(`Refreshing section: ${sectionId}`);
                
                if (sectionId === 'google-reviews-container') {
                    UIController.showLoadingState(sectionId, 'Refreshing Google reviews...');
                    const reviews = await APIClient.fetchGoogleReviews();
                    UIController.renderReviews(reviews, 'Google', sectionId);
                } else if (sectionId === 'quickReviews') {
                    await this.loadAllReviews();
                }
            },
            
            getStats: function() {
                return {
                    reviews: {
                        google: { count: this.googleReviews.length, rating: StatsUpdater.calculateAverageRating(this.googleReviews) },
                        yelp: { count: this.yelpReviews.length, rating: StatsUpdater.calculateAverageRating(this.yelpReviews) },
                        total: this.googleReviews.length + this.yelpReviews.length
                    },
                    version: this.version
                };
            },
            
            getVersion: function() {
                return this.version;
            },
            
            isReady: function() {
                return this.isInitialized;
            }
        };
        
        // === INITIALIZATION SEQUENCE ===
        Logger.init();
        LuxuryAppIntegration.init();
        
        // Start testimonials app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                TestimonialsApp.init();
            });
        } else {
            TestimonialsApp.init();
        }
        
        // === GLOBAL EXPORTS ===
        window.TestimonialsApp = TestimonialsApp;
        window.ReviewSubmissionSystem = ReviewSubmissionSystem;
        window.TestimonialsAPI = APIClient;
        window.TestimonialsCache = EnhancedCache;
        window.TestimonialsLogger = Logger;
        
        // Development helpers
        if (window.location.hostname === 'localhost' || 
            window.location.search.includes('debug=true')) {
            
            window.TestimonialsUtils = Utils;
            window.TestimonialsConfig = TESTIMONIALS_CONFIG;
            
            Logger.info('Enhanced Testimonials v15.0 Debug Mode Active');
            Logger.info('Available globals: TestimonialsApp, ReviewSubmissionSystem, TestimonialsAPI');
        }
        
        Logger.info('Enhanced Testimonials JavaScript v15.0 loaded successfully');
    }
    
    // === MAIN INITIALIZATION TRIGGER ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', protectedInit);
    } else {
        protectedInit();
    }
    
    // === GLOBAL SAFEGUARD EXPORT ===
    window.TESTIMONIALS_SAFEGUARDS = {
        config: INTEGRATION_CONFIG,
        checks: performSafetyChecks,
        fallback: enableFallbackMode,
        retry: protectedInit
    };

})();
