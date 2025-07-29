/**
 * 805 LifeGuard - 
 * Version: 6.0 - Complete Rewrite with Professional Architecture
 * Clean, lightweight, and enterprise-level functionality
 */

(function() {
    'use strict';
    
    // === ENTERPRISE CONFIGURATION ===
    const CONFIG = {
        // Contact Information
        PHONE_NUMBER: '(805) 367-6432',
        EMAIL: 'concierge@805lifeguard.com',
        
        // Portal URLs
        PORTAL_DOMAINS: {
            CLIENT: 'https://client.805companies.com',
            ADMIN: 'https://admin.805companies.com',
            STAFF: 'https://staff.805companies.com'
        },
        
        // Carousel Settings
        CAROUSEL: {
            AUTO_PLAY_INTERVAL: 6000,
            TRANSITION_DURATION: 1500,
            PAUSE_ON_HOVER: true,
            PAUSE_ON_FOCUS: true
        },
        
        // Performance Settings
        PERFORMANCE: {
            DEBOUNCE_DELAY: 250,
            THROTTLE_DELAY: 16,
            INTERSECTION_THRESHOLD: 0.1,
            INTERSECTION_ROOT_MARGIN: '0px 0px -50px 0px'
        },
        
        // Breakpoints (matches CSS)
        BREAKPOINTS: {
            SM: 640,
            MD: 768,
            LG: 1024,
            XL: 1280,
            XXL: 1536
        }
    };
    
    // === UTILITY FUNCTIONS ===
    const Utils = {
        /**
         * Debounce function execution
         * @param {Function} func - Function to debounce
         * @param {number} wait - Wait time in milliseconds
         * @returns {Function} Debounced function
         */
        debounce(func, wait = CONFIG.PERFORMANCE.DEBOUNCE_DELAY) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func.apply(this, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Throttle function execution
         * @param {Function} func - Function to throttle
         * @param {number} limit - Limit in milliseconds
         * @returns {Function} Throttled function
         */
        throttle(func, limit = CONFIG.PERFORMANCE.THROTTLE_DELAY) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        /**
         * Check if device is mobile
         * @returns {boolean} True if mobile
         */
        isMobile() {
            return window.innerWidth <= CONFIG.BREAKPOINTS.MD;
        },

        /**
         * Check if device is tablet
         * @returns {boolean} True if tablet
         */
        isTablet() {
            return window.innerWidth > CONFIG.BREAKPOINTS.MD && window.innerWidth <= CONFIG.BREAKPOINTS.LG;
        },

        /**
         * Check if device is desktop
         * @returns {boolean} True if desktop
         */
        isDesktop() {
            return window.innerWidth > CONFIG.BREAKPOINTS.LG;
        },

        /**
         * Get current breakpoint
         * @returns {string} Current breakpoint
         */
        getCurrentBreakpoint() {
            const width = window.innerWidth;
            if (width < CONFIG.BREAKPOINTS.SM) return 'xs';
            if (width < CONFIG.BREAKPOINTS.MD) return 'sm';
            if (width < CONFIG.BREAKPOINTS.LG) return 'md';
            if (width < CONFIG.BREAKPOINTS.XL) return 'lg';
            if (width < CONFIG.BREAKPOINTS.XXL) return 'xl';
            return 'xxl';
        },

        /**
         * Preload image
         * @param {string} src - Image source
         * @returns {Promise} Promise that resolves when image loads
         */
        preloadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                img.src = src;
            });
        },

        /**
         * Check if element is in viewport
         * @param {Element} element - Element to check
         * @param {number} threshold - Threshold percentage
         * @returns {boolean} True if in viewport
         */
        isInViewport(element, threshold = 0.1) {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
            const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);
            
            return vertInView && horInView;
        },

        /**
         * Smooth scroll to element
         * @param {Element} element - Target element
         * @param {number} offset - Offset from top
         */
        scrollToElement(element, offset = 0) {
            const headerHeight = document.getElementById('header')?.offsetHeight || 120;
            const targetPosition = element.offsetTop - headerHeight - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        },

        /**
         * Add event listener with cleanup tracking
         * @param {Element} element - Target element
         * @param {string} event - Event type
         * @param {Function} handler - Event handler
         * @param {Object} options - Event options
         * @returns {Function} Cleanup function
         */
        addEventListenerWithCleanup(element, event, handler, options = {}) {
            element.addEventListener(event, handler, options);
            return () => element.removeEventListener(event, handler, options);
        },

        /**
         * Log with timestamp and context
         * @param {string} level - Log level
         * @param {string} message - Log message
         * @param {*} data - Additional data
         */
        log(level, message, data = null) {
            if (process?.env?.NODE_ENV === 'production') return;
            
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] 805 LifeGuard: ${message}`;
            
            switch (level) {
                case 'error':
                    console.error(logMessage, data);
                    break;
                case 'warn':
                    console.warn(logMessage, data);
                    break;
                case 'info':
                    console.info(logMessage, data);
                    break;
                default:
                    console.log(logMessage, data);
            }
        }
    };

    // === WEBP DETECTION SERVICE ===
    class WebPDetectionService {
        constructor() {
            this.isSupported = null;
            this.detectionPromise = null;
        }

        /**
         * Detect WebP support
         * @returns {Promise<boolean>} WebP support status
         */
        async detect() {
            if (this.detectionPromise) {
                return this.detectionPromise;
            }

            this.detectionPromise = new Promise((resolve) => {
                const webP = new Image();
                webP.onload = webP.onerror = () => {
                    this.isSupported = webP.height === 2;
                    this.updateDocumentClasses();
                    Utils.log('info', `WebP Support: ${this.isSupported ? 'Enabled' : 'Disabled'}`);
                    resolve(this.isSupported);
                };
                webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
            });

            return this.detectionPromise;
        }

        /**
         * Update document classes based on WebP support
         */
        updateDocumentClasses() {
            const { documentElement } = document;
            if (this.isSupported) {
                documentElement.classList.add('webp');
                documentElement.classList.remove('no-webp');
            } else {
                documentElement.classList.add('no-webp');
                documentElement.classList.remove('webp');
            }
        }

        /**
         * Get optimized image path
         * @param {string} imagePath - Original image path
         * @returns {string} Optimized image path
         */
        getOptimizedImagePath(imagePath) {
            if (this.isSupported && imagePath && /\.(jpg|jpeg|png)$/i.test(imagePath)) {
                return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            }
            return imagePath;
        }
    }

    // === CAROUSEL CONTROLLER ===
    class CarouselController {
        constructor(container) {
            this.container = container;
            this.slides = container.querySelectorAll('.carousel-slide');
            this.indicators = container.querySelectorAll('.indicator');
            this.prevBtn = document.getElementById('carouselPrev');
            this.nextBtn = document.getElementById('carouselNext');
            
            this.currentSlide = 0;
            this.totalSlides = this.slides.length;
            this.autoPlayTimer = null;
            this.isPlaying = true;
            this.isPaused = false;
            this.isTransitioning = false;
            this.cleanupFunctions = [];
            
            this.init();
        }

        /**
         * Initialize carousel
         */
        async init() {
            if (this.totalSlides === 0) {
                Utils.log('warn', 'No carousel slides found');
                return;
            }

            Utils.log('info', 'Initializing Carousel Controller...');

            try {
                await this.preloadImages();
                this.setupResponsiveBackgrounds();
                this.setupEventListeners();
                this.setupIntersectionObserver();
                this.startAutoPlay();
                this.handleResize();
                
                Utils.log('info', 'Carousel Controller initialized successfully');
            } catch (error) {
                Utils.log('error', 'Failed to initialize carousel', error);
            }
        }

        /**
         * Preload carousel images
         */
        async preloadImages() {
            const imagePromises = [];
            
            this.slides.forEach(slide => {
                const desktopSrc = slide.dataset.bgDesktop;
                const mobileSrc = slide.dataset.bgMobile;
                
                if (desktopSrc) {
                    imagePromises.push(Utils.preloadImage(desktopSrc));
                }
                if (mobileSrc && mobileSrc !== desktopSrc) {
                    imagePromises.push(Utils.preloadImage(mobileSrc));
                }
            });

            try {
                await Promise.allSettled(imagePromises);
                Utils.log('info', 'Carousel images preloaded');
            } catch (error) {
                Utils.log('warn', 'Some carousel images failed to preload', error);
            }
        }

        /**
         * Setup responsive backgrounds
         */
        setupResponsiveBackgrounds() {
            this.slides.forEach(slide => {
                this.updateSlideBackground(slide);
            });
        }

        /**
         * Update individual slide background
         * @param {Element} slide - Slide element
         */
        updateSlideBackground(slide) {
            const desktopSrc = slide.dataset.bgDesktop;
            const mobileSrc = slide.dataset.bgMobile;
            
            let selectedSrc;
            if (Utils.isMobile() && mobileSrc) {
                selectedSrc = mobileSrc;
            } else if (desktopSrc) {
                selectedSrc = desktopSrc;
            }

            if (selectedSrc) {
                slide.style.backgroundImage = `url(${selectedSrc})`;
            }
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Navigation buttons
            if (this.prevBtn) {
                const cleanup = Utils.addEventListenerWithCleanup(
                    this.prevBtn, 'click', () => this.prevSlide()
                );
                this.cleanupFunctions.push(cleanup);
            }

            if (this.nextBtn) {
                const cleanup = Utils.addEventListenerWithCleanup(
                    this.nextBtn, 'click', () => this.nextSlide()
                );
                this.cleanupFunctions.push(cleanup);
            }

            // Indicators
            this.indicators.forEach((indicator, index) => {
                const clickCleanup = Utils.addEventListenerWithCleanup(
                    indicator, 'click', () => this.goToSlide(index)
                );
                this.cleanupFunctions.push(clickCleanup);

                const keyCleanup = Utils.addEventListenerWithCleanup(
                    indicator, 'keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.goToSlide(index);
                        }
                    }
                );
                this.cleanupFunctions.push(keyCleanup);
            });

            // Pause on hover and focus
            if (CONFIG.CAROUSEL.PAUSE_ON_HOVER) {
                const enterCleanup = Utils.addEventListenerWithCleanup(
                    this.container, 'mouseenter', () => this.pauseAutoPlay()
                );
                const leaveCleanup = Utils.addEventListenerWithCleanup(
                    this.container, 'mouseleave', () => this.resumeAutoPlay()
                );
                this.cleanupFunctions.push(enterCleanup, leaveCleanup);
            }

            if (CONFIG.CAROUSEL.PAUSE_ON_FOCUS) {
                const focusCleanup = Utils.addEventListenerWithCleanup(
                    this.container, 'focusin', () => this.pauseAutoPlay()
                );
                const blurCleanup = Utils.addEventListenerWithCleanup(
                    this.container, 'focusout', () => this.resumeAutoPlay()
                );
                this.cleanupFunctions.push(focusCleanup, blurCleanup);
            }

            // Keyboard navigation
            const keyboardCleanup = Utils.addEventListenerWithCleanup(
                document, 'keydown', (e) => {
                    if (!Utils.isInViewport(this.container)) return;

                    switch (e.key) {
                        case 'ArrowLeft':
                            e.preventDefault();
                            this.prevSlide();
                            break;
                        case 'ArrowRight':
                            e.preventDefault();
                            this.nextSlide();
                            break;
                        case ' ':
                            e.preventDefault();
                            this.toggleAutoPlay();
                            break;
                    }
                }
            );
            this.cleanupFunctions.push(keyboardCleanup);

            // Touch/swipe support
            this.setupTouchEvents();

            // Window resize
            const resizeCleanup = Utils.addEventListenerWithCleanup(
                window, 'resize', Utils.debounce(() => this.handleResize())
            );
            this.cleanupFunctions.push(resizeCleanup);

            // Visibility change
            const visibilityCleanup = Utils.addEventListenerWithCleanup(
                document, 'visibilitychange', () => {
                    if (document.hidden) {
                        this.pauseAutoPlay();
                    } else {
                        this.resumeAutoPlay();
                    }
                }
            );
            this.cleanupFunctions.push(visibilityCleanup);
        }

        /**
         * Setup touch events for swipe support
         */
        setupTouchEvents() {
            let startX = 0;
            let startY = 0;
            let isDragging = false;

            const touchStartCleanup = Utils.addEventListenerWithCleanup(
                this.container, 'touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                    isDragging = true;
                    this.pauseAutoPlay();
                }, { passive: true }
            );

            const touchMoveCleanup = Utils.addEventListenerWithCleanup(
                this.container, 'touchmove', (e) => {
                    if (!isDragging) return;

                    const deltaX = Math.abs(e.touches[0].clientX - startX);
                    const deltaY = Math.abs(e.touches[0].clientY - startY);

                    if (deltaX > deltaY) {
                        e.preventDefault();
                    }
                }, { passive: false }
            );

            const touchEndCleanup = Utils.addEventListenerWithCleanup(
                this.container, 'touchend', (e) => {
                    if (!isDragging) return;

                    const endX = e.changedTouches[0].clientX;
                    const deltaX = startX - endX;
                    const threshold = 50;

                    if (Math.abs(deltaX) > threshold) {
                        if (deltaX > 0) {
                            this.nextSlide();
                        } else {
                            this.prevSlide();
                        }
                    }

                    isDragging = false;
                    this.resumeAutoPlay();
                }, { passive: true }
            );

            this.cleanupFunctions.push(touchStartCleanup, touchMoveCleanup, touchEndCleanup);
        }

        /**
         * Setup intersection observer for auto-play
         */
        setupIntersectionObserver() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.resumeAutoPlay();
                    } else {
                        this.pauseAutoPlay();
                    }
                });
            }, {
                threshold: CONFIG.PERFORMANCE.INTERSECTION_THRESHOLD
            });

            observer.observe(this.container);
        }

        /**
         * Handle window resize
         */
        handleResize() {
            this.setupResponsiveBackgrounds();
        }

        /**
         * Go to specific slide
         * @param {number} index - Slide index
         * @param {string} direction - Direction of transition
         */
        goToSlide(index, direction = 'auto') {
            if (this.isTransitioning || index === this.currentSlide) return;

            const previousSlide = this.currentSlide;
            this.currentSlide = index;
            this.isTransitioning = true;

            // Update slides
            this.slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });

            // Update indicators
            this.indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
                indicator.setAttribute('aria-selected', i === index);
            });

            // Update ARIA labels
            this.updateAriaLabels();

            // Reset transition flag
            setTimeout(() => {
                this.isTransitioning = false;
            }, CONFIG.CAROUSEL.TRANSITION_DURATION);

            // Dispatch custom event
            this.container.dispatchEvent(new CustomEvent('carouselSlideChange', {
                detail: {
                    currentSlide: this.currentSlide,
                    previousSlide: previousSlide,
                    direction: direction,
                    totalSlides: this.totalSlides
                }
            }));
        }

        /**
         * Go to next slide
         */
        nextSlide() {
            const nextIndex = (this.currentSlide + 1) % this.totalSlides;
            this.goToSlide(nextIndex, 'next');
        }

        /**
         * Go to previous slide
         */
        prevSlide() {
            const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
            this.goToSlide(prevIndex, 'prev');
        }

        /**
         * Start auto-play
         */
        startAutoPlay() {
            if (!this.isPlaying || this.totalSlides <= 1) return;

            this.autoPlayTimer = setInterval(() => {
                if (!this.isPaused && !this.isTransitioning) {
                    this.nextSlide();
                }
            }, CONFIG.CAROUSEL.AUTO_PLAY_INTERVAL);
        }

        /**
         * Stop auto-play
         */
        stopAutoPlay() {
            if (this.autoPlayTimer) {
                clearInterval(this.autoPlayTimer);
                this.autoPlayTimer = null;
            }
        }

        /**
         * Pause auto-play
         */
        pauseAutoPlay() {
            this.isPaused = true;
        }

        /**
         * Resume auto-play
         */
        resumeAutoPlay() {
            if (Utils.isInViewport(this.container) && !document.hidden) {
                this.isPaused = false;
            }
        }

        /**
         * Toggle auto-play
         */
        toggleAutoPlay() {
            if (this.isPlaying) {
                this.stopAutoPlay();
                this.isPlaying = false;
            } else {
                this.startAutoPlay();
                this.isPlaying = true;
            }
        }

        /**
         * Update ARIA labels
         */
        updateAriaLabels() {
            this.slides.forEach((slide, i) => {
                slide.setAttribute('aria-hidden', i !== this.currentSlide);
            });
        }

        /**
         * Destroy carousel
         */
        destroy() {
            this.stopAutoPlay();
            this.cleanupFunctions.forEach(cleanup => cleanup());
            this.cleanupFunctions = [];
            Utils.log('info', 'Carousel destroyed');
        }
    }

    // === NAVIGATION CONTROLLER ===
    class NavigationController {
        constructor() {
            this.header = document.getElementById('header');
            this.mobileToggle = document.getElementById('mobileToggle');
            this.mobileNav = document.getElementById('mobileNav');
            this.mobileNavClose = document.getElementById('mobileNavClose');
            this.body = document.body;
            this.isOpen = false;
            this.scrollPosition = 0;
            this.cleanupFunctions = [];

            this.init();
        }

        /**
         * Initialize navigation
         */
        init() {
            Utils.log('info', 'Initializing Navigation Controller...');

            try {
                this.setupEventListeners();
                this.setupScrollEffects();
                this.updateActiveLinks();
                this.updatePortalLinks();
                
                Utils.log('info', 'Navigation Controller initialized successfully');
            } catch (error) {
                Utils.log('error', 'Failed to initialize navigation', error);
            }
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            if (!this.mobileToggle || !this.mobileNav) {
                Utils.log('warn', 'Mobile navigation elements not found');
                return;
            }

            // Mobile toggle
            const toggleCleanup = Utils.addEventListenerWithCleanup(
                this.mobileToggle, 'click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleMobileNav();
                }
            );
            this.cleanupFunctions.push(toggleCleanup);

            // Mobile nav close
            if (this.mobileNavClose) {
                const closeCleanup = Utils.addEventListenerWithCleanup(
                    this.mobileNavClose, 'click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.closeMobileNav();
                    }
                );
                this.cleanupFunctions.push(closeCleanup);
            }

            // Mobile nav links
            const mobileLinks = this.mobileNav.querySelectorAll('.mobile-nav-link');
            mobileLinks.forEach(link => {
                const linkCleanup = Utils.addEventListenerWithCleanup(
                    link, 'click', () => {
                        setTimeout(() => this.closeMobileNav(), 100);
                    }
                );
                this.cleanupFunctions.push(linkCleanup);
            });

            // Close on outside click
            const outsideClickCleanup = Utils.addEventListenerWithCleanup(
                document, 'click', (e) => {
                    if (this.isOpen && 
                        !this.mobileNav.contains(e.target) && 
                        !this.mobileToggle.contains(e.target)) {
                        this.closeMobileNav();
                    }
                }
            );
            this.cleanupFunctions.push(outsideClickCleanup);

            // Close on escape key
            const escapeCleanup = Utils.addEventListenerWithCleanup(
                document, 'keydown', (e) => {
                    if (e.key === 'Escape' && this.isOpen) {
                        this.closeMobileNav();
                    }
                }
            );
            this.cleanupFunctions.push(escapeCleanup);

            // Close on window resize
            const resizeCleanup = Utils.addEventListenerWithCleanup(
                window, 'resize', Utils.debounce(() => {
                    if (window.innerWidth > CONFIG.BREAKPOINTS.MD && this.isOpen) {
                        this.closeMobileNav();
                    }
                })
            );
            this.cleanupFunctions.push(resizeCleanup);
        }

        /**
         * Toggle mobile navigation
         */
        toggleMobileNav() {
            if (this.isOpen) {
                this.closeMobileNav();
            } else {
                this.openMobileNav();
            }
        }

        /**
         * Open mobile navigation
         */
        openMobileNav() {
            Utils.log('info', 'Opening mobile navigation');
            
            this.isOpen = true;
            this.scrollPosition = window.pageYOffset;

            // Add classes
            this.mobileToggle.classList.add('active');
            this.mobileToggle.setAttribute('aria-expanded', 'true');
            this.mobileNav.classList.add('active');
            this.mobileNav.setAttribute('aria-hidden', 'false');
            this.body.classList.add('nav-open');

            // Lock body scroll
            this.body.style.position = 'fixed';
            this.body.style.top = `-${this.scrollPosition}px`;
            this.body.style.width = '100%';

            // Focus management
            setTimeout(() => {
                const firstLink = this.mobileNav.querySelector('.mobile-nav-link');
                if (firstLink) {
                    firstLink.focus();
                }
            }, 300);
        }

        /**
         * Close mobile navigation
         */
        closeMobileNav() {
            Utils.log('info', 'Closing mobile navigation');
            
            this.isOpen = false;

            // Remove classes
            this.mobileToggle.classList.remove('active');
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            this.mobileNav.classList.remove('active');
            this.mobileNav.setAttribute('aria-hidden', 'true');
            this.body.classList.remove('nav-open');

            // Restore body scroll
            this.body.style.position = '';
            this.body.style.top = '';
            this.body.style.width = '';

            // Restore scroll position
            window.scrollTo(0, this.scrollPosition);
        }

        /**
         * Setup scroll effects
         */
        setupScrollEffects() {
            if (!this.header) return;

            const handleScroll = Utils.throttle(() => {
                const scrollY = window.pageYOffset;
                
                if (scrollY > 50) {
                    this.header.classList.add('scrolled');
                } else {
                    this.header.classList.remove('scrolled');
                }
            });

            const scrollCleanup = Utils.addEventListenerWithCleanup(
                window, 'scroll', handleScroll, { passive: true }
            );
            this.cleanupFunctions.push(scrollCleanup);
        }

        /**
         * Update active navigation links
         */
        updateActiveLinks() {
            const currentPath = window.location.pathname;
            const currentPage = currentPath.split('/').pop() || 'index.html';

            const allLinks = [
                ...document.querySelectorAll('.nav-link'),
                ...document.querySelectorAll('.mobile-nav-link')
            ];

            allLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href) {
                    const isActive = (href === '/' && (currentPage === '' || currentPage === 'index.html')) ||
                                   (href !== '/' && href.includes(currentPage.replace('.html', '')));
                    
                    if (isActive) {
                        link.classList.add('active');
                    }
                }
            });
        }

        /**
         * Update portal links
         */
        updatePortalLinks() {
            const portalLinks = document.querySelectorAll(
                '.portal-btn, .mobile-portal-btn, .footer-portal-btn, [href*="portal"]'
            );

            portalLinks.forEach(link => {
                const text = link.textContent.toLowerCase();

                if (text.includes('client')) {
                    link.href = CONFIG.PORTAL_DOMAINS.CLIENT;
                } else if (text.includes('admin')) {
                    link.href = CONFIG.PORTAL_DOMAINS.ADMIN;
                } else if (text.includes('staff')) {
                    link.href = CONFIG.PORTAL_DOMAINS.STAFF;
                }

                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });
        }

        /**
         * Destroy navigation
         */
        destroy() {
            this.cleanupFunctions.forEach(cleanup => cleanup());
            this.cleanupFunctions = [];
            Utils.log('info', 'Navigation destroyed');
        }
    }

    // === ANIMATION CONTROLLER ===
    class AnimationController {
        constructor() {
            this.observers = [];
            this.init();
        }

        /**
         * Initialize animations
         */
        init() {
            Utils.log('info', 'Initializing Animation Controller...');

            try {
                this.setupScrollAnimations();
                this.setupHoverEffects();
                this.setupHeroAnimations();
                
                Utils.log('info', 'Animation Controller initialized successfully');
            } catch (error) {
                Utils.log('error', 'Failed to initialize animations', error);
            }
        }

        /**
         * Setup scroll-triggered animations
         */
        setupScrollAnimations() {
            const observerOptions = {
                threshold: CONFIG.PERFORMANCE.INTERSECTION_THRESHOLD,
                rootMargin: CONFIG.PERFORMANCE.INTERSECTION_ROOT_MARGIN
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in-up');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe elements
            const elements = document.querySelectorAll(
                '.service-card, .testimonial-card, .team-member, .coverage-card, .feature-item'
            );

            elements.forEach(el => observer.observe(el));
            this.observers.push(observer);
        }

        /**
         * Setup hover effects
         */
        setupHoverEffects() {
            // Service cards
            this.setupCardHoverEffects('.service-card', -8);
            
            // Team members
            this.setupCardHoverEffects('.team-member', -8);
            
            // Buttons
            this.setupButtonHoverEffects();
        }

        /**
         * Setup card hover effects
         * @param {string} selector - Card selector
         * @param {number} translateY - Transform Y value
         */
        setupCardHoverEffects(selector, translateY) {
            const cards = document.querySelectorAll(selector);
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = `translateY(${translateY}px)`;
                });

                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        }

        /**
         * Setup button hover effects
         */
        setupButtonHoverEffects() {
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.addEventListener('mouseenter', function() {
                    if (!this.classList.contains('btn-secondary')) {
                        this.style.transform = 'translateY(-2px)';
                    }
                });

                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        }

        /**
         * Setup hero animations
         */
        setupHeroAnimations() {
            const heroElements = document.querySelectorAll(
                '.hero-title, .hero-subtitle, .hero-buttons, .hero-notice'
            );

            heroElements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';

                setTimeout(() => {
                    element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 500 + (index * 150));
            });
        }

        /**
         * Destroy animations
         */
        destroy() {
            this.observers.forEach(observer => observer.disconnect());
            this.observers = [];
            Utils.log('info', 'Animation Controller destroyed');
        }
    }

    // === FORM HANDLER ===
    class FormHandler {
        constructor() {
            this.cleanupFunctions = [];
            this.init();
        }

        /**
         * Initialize form handling
         */
        init() {
            Utils.log('info', 'Initializing Form Handler...');

            try {
                this.setupFormValidation();
                this.setupPhoneFormatting();
                this.handleURLParameters();
                
                Utils.log('info', 'Form Handler initialized successfully');
            } catch (error) {
                Utils.log('error', 'Failed to initialize form handler', error);
            }
        }

        /**
         * Setup form validation
         */
        setupFormValidation() {
            const forms = document.querySelectorAll('form');

            forms.forEach(form => {
                const submitCleanup = Utils.addEventListenerWithCleanup(
                    form, 'submit', (e) => {
                        if (!this.validateForm(form)) {
                            e.preventDefault();
                            this.showFormError('Please fill in all required fields correctly.');
                        }
                    }
                );
                this.cleanupFunctions.push(submitCleanup);
            });
        }

        /**
         * Validate form
         * @param {Element} form - Form element
         * @returns {boolean} Validation result
         */
        validateForm(form) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'var(--color-danger)';
                    field.setAttribute('aria-invalid', 'true');
                } else {
                    field.style.borderColor = '';
                    field.setAttribute('aria-invalid', 'false');
                }
            });

            return isValid;
        }

        /**
         * Setup phone number formatting
         */
        setupPhoneFormatting() {
            const phoneInputs = document.querySelectorAll('input[type="tel"]');

            phoneInputs.forEach(input => {
                const inputCleanup = Utils.addEventListenerWithCleanup(
                    input, 'input', (e) => {
                        let value = e.target.value.replace(/\D/g, '');

                        if (value.length >= 6) {
                            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                        } else if (value.length >= 3) {
                            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
                        }

                        e.target.value = value;
                    }
                );
                this.cleanupFunctions.push(inputCleanup);
            });
        }

        /**
         * Handle URL parameters
         */
        handleURLParameters() {
            const urlParams = new URLSearchParams(window.location.search);
            const service = urlParams.get('service');

            if (service) {
                const serviceCheckbox = document.querySelector(`input[value*="${service}"]`);
                if (serviceCheckbox) {
                    serviceCheckbox.checked = true;
                    serviceCheckbox.closest('.service-option')?.classList.add('selected');
                }
            }
        }

        /**
         * Show form error
         * @param {string} message - Error message
         */
        showFormError(message) {
            // Create a more sophisticated error display in the future
            alert(message);
        }

        /**
         * Destroy form handler
         */
        destroy() {
            this.cleanupFunctions.forEach(cleanup => cleanup());
            this.cleanupFunctions = [];
            Utils.log('info', 'Form Handler destroyed');
        }
    }

    // === SMOOTH SCROLL CONTROLLER ===
    class SmoothScrollController {
        constructor() {
            this.cleanupFunctions = [];
            this.init();
        }

        /**
         * Initialize smooth scroll
         */
        init() {
            Utils.log('info', 'Initializing Smooth Scroll Controller...');

            try {
                this.setupSmoothScrolling();
                Utils.log('info', 'Smooth Scroll Controller initialized successfully');
            } catch (error) {
                Utils.log('error', 'Failed to initialize smooth scroll', error);
            }
        }

        /**
         * Setup smooth scrolling for anchor links
         */
        setupSmoothScrolling() {
            const scrollLinks = document.querySelectorAll('a[href^="#"]');

            scrollLinks.forEach(link => {
                const clickCleanup = Utils.addEventListenerWithCleanup(
                    link, 'click', (e) => {
                        const targetId = link.getAttribute('href');
                        const target = document.querySelector(targetId);

                        if (target) {
                            e.preventDefault();
                            Utils.scrollToElement(target);
                        }
                    }
                );
                this.cleanupFunctions.push(clickCleanup);
            });
        }

        /**
         * Destroy smooth scroll controller
         */
        destroy() {
            this.cleanupFunctions.forEach(cleanup => cleanup());
            this.cleanupFunctions = [];
            Utils.log('info', 'Smooth Scroll Controller destroyed');
        }
    }

    // === CONTACT UPDATER ===
    class ContactUpdater {
        constructor() {
            this.init();
        }

        /**
         * Initialize contact updater
         */
        init() {
            Utils.log('info', 'Initializing Contact Updater...');

            try {
                this.updateAllContacts();
                Utils.log('info', 'Contact Updater initialized successfully');
            } catch (error) {
                Utils.log('error', 'Failed to initialize contact updater', error);
            }
        }

        /**
         * Update all contact information
         */
        updateAllContacts() {
            this.updatePhoneNumbers();
            this.updateEmailAddresses();
            this.updatePortalLinks();
        }

        /**
         * Update phone numbers
         */
        updatePhoneNumbers() {
            const phoneElements = document.querySelectorAll(
                'a[href*="tel:"], .phone-number, [data-phone]'
            );

            phoneElements.forEach(element => {
                if (element.tagName === 'A') {
                    element.href = 'tel:+18053676432';
                }
                if (element.textContent.includes('(') || element.textContent.includes('-')) {
                    element.textContent = CONFIG.PHONE_NUMBER;
                }
            });
        }

        /**
         * Update email addresses
         */
        updateEmailAddresses() {
            const emailElements = document.querySelectorAll(
                'a[href*="mailto:"], .email-address, [data-email]'
            );

            emailElements.forEach(element => {
                if (element.tagName === 'A') {
                    element.href = `mailto:${CONFIG.EMAIL}`;
                }
                if (element.textContent.includes('@')) {
                    element.textContent = CONFIG.EMAIL;
                }
            });
        }

        /**
         * Update portal links
         */
        updatePortalLinks() {
            const portalLinks = document.querySelectorAll(
                '.portal-btn, .mobile-portal-btn, .footer-portal-btn'
            );

            portalLinks.forEach(link => {
                const text = link.textContent.toLowerCase();

                if (text.includes('client')) {
                    link.href = CONFIG.PORTAL_DOMAINS.CLIENT;
                } else if (text.includes('admin')) {
                    link.href = CONFIG.PORTAL_DOMAINS.ADMIN;
                } else if (text.includes('staff')) {
                    link.href = CONFIG.PORTAL_DOMAINS.STAFF;
                }

                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });
        }
    }

    // === MAIN APPLICATION CLASS ===
    class LuxuryApp {
        constructor() {
            this.webpService = new WebPDetectionService();
            this.navigation = null;
            this.carousel = null;
            this.animations = null;
            this.forms = null;
            this.smoothScroll = null;
            this.contactUpdater = null;
            this.isInitialized = false;

            this.init();
        }

        /**
         * Initialize application
         */
        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        }

        /**
         * Initialize application components
         */
        async initializeApp() {
            try {
                Utils.log('info', 'Initializing 805 LifeGuard Luxury Application...');

                // Detect WebP support first
                await this.webpService.detect();

                // Initialize core components
                this.navigation = new NavigationController();
                this.forms = new FormHandler();
                this.smoothScroll = new SmoothScrollController();
                this.contactUpdater = new ContactUpdater();

                // Initialize carousel if hero carousel exists
                const heroCarousel = document.getElementById('heroCarousel');
                if (heroCarousel) {
                    this.carousel = new CarouselController(heroCarousel);
                }

                // Initialize animations after a short delay to prevent conflicts
                setTimeout(() => {
                    this.animations = new AnimationController();
                }, 100);

                this.isInitialized = true;

                Utils.log('info', '805 LifeGuard Luxury Application initialized successfully');

                // Dispatch ready event
                this.dispatchReadyEvent();

            } catch (error) {
                Utils.log('error', 'Failed to initialize application', error);
                this.initializeFallback();
            }
        }

        /**
         * Dispatch application ready event
         */
        dispatchReadyEvent() {
            window.dispatchEvent(new CustomEvent('luxuryAppReady', {
                detail: {
                    app: this,
                    hasCarousel: !!this.carousel,
                    webpSupport: this.webpService.isSupported,
                    version: '6.0',
                    timestamp: new Date().toISOString()
                }
            }));
        }

        /**
         * Initialize fallback functionality
         */
        initializeFallback() {
            Utils.log('info', 'Initializing fallback functionality...');

            // Basic mobile navigation
            const mobileToggle = document.getElementById('mobileToggle');
            const mobileNav = document.getElementById('mobileNav');

            if (mobileToggle && mobileNav) {
                mobileToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    mobileToggle.classList.toggle('active');
                    mobileNav.classList.toggle('active');
                    document.body.classList.toggle('nav-open');
                });

                const mobileClose = document.getElementById('mobileNavClose');
                if (mobileClose) {
                    mobileClose.addEventListener('click', (e) => {
                        e.preventDefault();
                        mobileToggle.classList.remove('active');
                        mobileNav.classList.remove('active');
                        document.body.classList.remove('nav-open');
                    });
                }

                Utils.log('info', 'Fallback mobile navigation initialized');
            }

            // Basic smooth scroll
            const smoothLinks = document.querySelectorAll('a[href^="#"]');
            smoothLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });

            // Basic carousel fallback
            const heroCarousel = document.getElementById('heroCarousel');
            if (heroCarousel) {
                const slides = heroCarousel.querySelectorAll('.carousel-slide');
                if (slides.length > 0) {
                    slides[0].classList.add('active');
                }
            }

            Utils.log('info', 'Fallback functionality initialized');
        }

        // === PUBLIC API METHODS ===

        /**
         * Get application version
         * @returns {string} Version number
         */
        getVersion() {
            return '6.0';
        }

        /**
         * Check if application is initialized
         * @returns {boolean} Initialization status
         */
        isReady() {
            return this.isInitialized;
        }

        /**
         * Get carousel instance
         * @returns {CarouselController|null} Carousel instance
         */
        getCarousel() {
            return this.carousel;
        }

        /**
         * Get navigation instance
         * @returns {NavigationController|null} Navigation instance
         */
        getNavigation() {
            return this.navigation;
        }

        /**
         * Close mobile navigation
         */
        closeMobileNav() {
            if (this.navigation) {
                this.navigation.closeMobileNav();
            }
        }

        /**
         * Pause carousel
         */
        pauseCarousel() {
            if (this.carousel) {
                this.carousel.pauseAutoPlay();
            }
        }

        /**
         * Resume carousel
         */
        resumeCarousel() {
            if (this.carousel) {
                this.carousel.resumeAutoPlay();
            }
        }

        /**
         * Get WebP support status
         * @returns {boolean|null} WebP support status
         */
        getWebPSupport() {
            return this.webpService.isSupported;
        }

        /**
         * Get current breakpoint
         * @returns {string} Current breakpoint
         */
        getCurrentBreakpoint() {
            return Utils.getCurrentBreakpoint();
        }

        /**
         * Destroy application
         */
        destroy() {
            Utils.log('info', 'Destroying Luxury Application...');

            if (this.carousel) this.carousel.destroy();
            if (this.navigation) this.navigation.destroy();
            if (this.animations) this.animations.destroy();
            if (this.forms) this.forms.destroy();
            if (this.smoothScroll) this.smoothScroll.destroy();

            this.isInitialized = false;

            Utils.log('info', 'Luxury Application destroyed');
        }
    }

    // === ERROR HANDLING ===
    window.addEventListener('error', (e) => {
        Utils.log('error', 'Global JavaScript error', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error
        });
    });

    window.addEventListener('unhandledrejection', (e) => {
        Utils.log('error', 'Unhandled promise rejection', {
            reason: e.reason,
            promise: e.promise
        });
    });

    // === INITIALIZE APPLICATION ===
    const app = new LuxuryApp();

    // Export for global access and debugging
    window.LuxuryApp = LuxuryApp;
    window.app = app;

    // Development/debug mode
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('805lifeguard.com') ||
        window.location.search.includes('debug=true')) {
        
        window.Utils = Utils;
        Utils.log('info', 'Debug mode active - Enhanced debugging available');
        Utils.log('info', 'Access app instance via window.app');
        Utils.log('info', 'Access utilities via window.Utils');
    }

})();
