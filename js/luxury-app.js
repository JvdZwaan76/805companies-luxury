/*
 * 805 LifeGuard - Enhanced Luxury App JS (Enterprise JavaScript Application)
 * Version: 9.0 - Elegant Logo Entrance Animation & Clean Caruso Aesthetic
 * Sophisticated brand-focused entrance with no logo borders
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
        
        // Enhanced Carousel Settings (Clean Caruso Aesthetic)
        CAROUSEL: {
            AUTO_PLAY_INTERVAL: 8000,        // Slower for relaxed Caruso feel
            TRANSITION_DURATION: 2000,       // Smoother, longer transitions
            PAUSE_ON_HOVER: true,
            PAUSE_ON_FOCUS: true,
            HIDE_INDICATORS: true,            // No indicators for clean look
            HIDE_CONTROLS: true,              // Controls hidden for Caruso aesthetic
            CLEAN_MODE: true                  // Pure clean mode
        },
        
        // Elegant Logo Entrance Animation
        LOGO: {
            ENTRANCE_DELAY: 400,             // Delay before starting entrance
            ENTRANCE_DURATION: 1200,         // Duration of entrance animation
            ENTRANCE_TRANSITION: 'cubic-bezier(0.23, 1, 0.32, 1)', // Elegant easing
            
            INITIAL_SCALE: 1.5,              // Starting scale for dramatic entrance
            ENTERING_SCALE: 1.3,             // Mid-entrance scale
            LARGE_SCALE: 1.15,               // Final large scale
            NORMAL_SCALE: 1.0,               // Normal scrolled scale
            
            SCALE_THRESHOLD: 100,            // Scroll threshold for scaling
            SCROLL_TRANSITION: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Scroll easing
            SCROLL_DURATION: 800,            // Scroll transition duration
            
            HOVER_SCALE_BONUS: 0.05,         // Additional scale on hover
            HOVER_DURATION: 350              // Hover transition duration
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
        /*
         * Debounce function execution
         */
        debounce: function(func, wait) {
            wait = wait || CONFIG.PERFORMANCE.DEBOUNCE_DELAY;
            let timeout;
            return function executedFunction() {
                const args = arguments;
                const context = this;
                const later = function() {
                    clearTimeout(timeout);
                    func.apply(context, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /*
         * Throttle function execution
         */
        throttle: function(func, limit) {
            limit = limit || CONFIG.PERFORMANCE.THROTTLE_DELAY;
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(function() { inThrottle = false; }, limit);
                }
            };
        },

        /*
         * Check if device is mobile
         */
        isMobile: function() {
            return window.innerWidth < CONFIG.BREAKPOINTS.MD;
        },

        /*
         * Check if device is tablet
         */
        isTablet: function() {
            return window.innerWidth >= CONFIG.BREAKPOINTS.MD && window.innerWidth < CONFIG.BREAKPOINTS.LG;
        },

        /*
         * Check if device is desktop
         */
        isDesktop: function() {
            return window.innerWidth >= CONFIG.BREAKPOINTS.LG;
        },

        /*
         * Get current device type for responsive images
         */
        getDeviceType: function() {
            const width = window.innerWidth;
            if (width < CONFIG.BREAKPOINTS.MD) return 'mobile';
            if (width < CONFIG.BREAKPOINTS.LG) return 'tablet';
            return 'desktop';
        },

        /*
         * Get current breakpoint
         */
        getCurrentBreakpoint: function() {
            const width = window.innerWidth;
            if (width < CONFIG.BREAKPOINTS.SM) return 'xs';
            if (width < CONFIG.BREAKPOINTS.MD) return 'sm';
            if (width < CONFIG.BREAKPOINTS.LG) return 'md';
            if (width < CONFIG.BREAKPOINTS.XL) return 'lg';
            if (width < CONFIG.BREAKPOINTS.XXL) return 'xl';
            return 'xxl';
        },

        /*
         * Preload image with enhanced error handling
         */
        preloadImage: function(src) {
            return new Promise(function(resolve, reject) {
                if (!src) {
                    reject(new Error('No image source provided'));
                    return;
                }
                
                const img = new Image();
                img.onload = function() { resolve(img); };
                img.onerror = function() { reject(new Error('Failed to load image: ' + src)); };
                img.src = src;
            });
        },

        /*
         * Check if element is in viewport
         */
        isInViewport: function(element, threshold) {
            threshold = threshold || 0.1;
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
            const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);
            
            return vertInView && horInView;
        },

        /*
         * Smooth scroll to element
         */
        scrollToElement: function(element, offset) {
            offset = offset || 0;
            const headerHeight = document.getElementById('header') ? document.getElementById('header').offsetHeight : 120;
            const targetPosition = element.offsetTop - headerHeight - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        },

        /*
         * Add event listener with cleanup tracking
         */
        addEventListenerWithCleanup: function(element, event, handler, options) {
            options = options || {};
            element.addEventListener(event, handler, options);
            return function() {
                element.removeEventListener(event, handler, options);
            };
        },

        /*
         * Enhanced logging with context
         */
        log: function(level, message, data) {
            if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') return;
            
            const timestamp = new Date().toISOString();
            const logMessage = '[' + timestamp + '] [' + level.toUpperCase() + '] 805 LifeGuard Enhanced: ' + message;
            
            switch (level) {
                case 'error':
                    console.error(logMessage, data || '');
                    break;
                case 'warn':
                    console.warn(logMessage, data || '');
                    break;
                case 'info':
                    console.info(logMessage, data || '');
                    break;
                default:
                    console.log(logMessage, data || '');
            }
        }
    };

    // === WEBP DETECTION SERVICE ===
    function WebPDetectionService() {
        this.isSupported = null;
        this.detectionPromise = null;
    }

    WebPDetectionService.prototype.detect = function() {
        if (this.detectionPromise) {
            return this.detectionPromise;
        }

        const self = this;
        this.detectionPromise = new Promise(function(resolve) {
            const webP = new Image();
            webP.onload = webP.onerror = function() {
                self.isSupported = webP.height === 2;
                self.updateDocumentClasses();
                Utils.log('info', 'WebP Support: ' + (self.isSupported ? 'Enabled' : 'Disabled'));
                resolve(self.isSupported);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });

        return this.detectionPromise;
    };

    WebPDetectionService.prototype.updateDocumentClasses = function() {
        const documentElement = document.documentElement;
        if (this.isSupported) {
            documentElement.classList.add('webp');
            documentElement.classList.remove('no-webp');
        } else {
            documentElement.classList.add('no-webp');
            documentElement.classList.remove('webp');
        }
    };

    WebPDetectionService.prototype.getOptimizedImagePath = function(imagePath) {
        if (this.isSupported && imagePath && /\.(jpg|jpeg|png)$/i.test(imagePath)) {
            return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        return imagePath;
    };

    // === ENHANCED CAROUSEL CONTROLLER (Clean Caruso Mode) ===
    function CarouselController(container) {
        this.container = container;
        this.slides = container.querySelectorAll('.carousel-slide');
        
        // Remove all indicators and controls for clean Caruso aesthetic
        this.indicators = [];
        this.prevBtn = null;
        this.nextBtn = null;
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayTimer = null;
        this.isPlaying = true;
        this.isPaused = false;
        this.isTransitioning = false;
        this.cleanupFunctions = [];
        this.currentDeviceType = Utils.getDeviceType();
        
        this.init();
    }

    CarouselController.prototype.init = function() {
        if (this.totalSlides === 0) {
            Utils.log('warn', 'No carousel slides found');
            return;
        }

        Utils.log('info', 'Initializing Clean Caruso Carousel Controller...');

        try {
            this.removeAllNavigationElements();
            this.preloadImages();
            this.setupResponsiveBackgrounds();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.startAutoPlay();
            this.handleResize();
            
            Utils.log('info', 'Clean Caruso Carousel Controller initialized successfully');
        } catch (error) {
            Utils.log('error', 'Failed to initialize carousel', error);
        }
    };

    CarouselController.prototype.removeAllNavigationElements = function() {
        // Remove all navigation elements for ultra-clean Caruso aesthetic
        const elementsToRemove = [
            '.carousel-indicators',
            '.carousel-controls', 
            '.carousel-prev', 
            '.carousel-next',
            '.indicator'
        ];
        
        elementsToRemove.forEach(function(selector) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(function(element) {
                element.style.display = 'none';
                element.remove();
            });
        });
        
        Utils.log('info', 'All carousel navigation elements removed for clean Caruso aesthetic');
    };

    CarouselController.prototype.preloadImages = function() {
        const imagePromises = [];
        const self = this;
        
        this.slides.forEach(function(slide) {
            const desktopSrc = slide.dataset.bgDesktop;
            const tabletSrc = slide.dataset.bgTablet;
            const mobileSrc = slide.dataset.bgMobile;
            
            if (desktopSrc) {
                imagePromises.push(Utils.preloadImage(desktopSrc));
            }
            if (tabletSrc && tabletSrc !== desktopSrc) {
                imagePromises.push(Utils.preloadImage(tabletSrc));
            }
            if (mobileSrc && mobileSrc !== desktopSrc && mobileSrc !== tabletSrc) {
                imagePromises.push(Utils.preloadImage(mobileSrc));
            }
        });

        if (imagePromises.length > 0) {
            Promise.allSettled(imagePromises).then(function(results) {
                const successCount = results.filter(r => r.status === 'fulfilled').length;
                Utils.log('info', 'Clean carousel images preloaded: ' + successCount + '/' + imagePromises.length);
            }).catch(function(error) {
                Utils.log('warn', 'Some carousel images failed to preload', error);
            });
        }
    };

    CarouselController.prototype.setupResponsiveBackgrounds = function() {
        const self = this;
        this.slides.forEach(function(slide) {
            self.updateSlideBackground(slide);
        });
    };

    CarouselController.prototype.updateSlideBackground = function(slide) {
        const deviceType = Utils.getDeviceType();
        const desktopSrc = slide.dataset.bgDesktop;
        const tabletSrc = slide.dataset.bgTablet;
        const mobileSrc = slide.dataset.bgMobile;
        
        let selectedSrc;
        
        // Select appropriate image based on device type
        switch (deviceType) {
            case 'mobile':
                selectedSrc = mobileSrc || tabletSrc || desktopSrc;
                break;
            case 'tablet':
                selectedSrc = tabletSrc || desktopSrc || mobileSrc;
                break;
            case 'desktop':
            default:
                selectedSrc = desktopSrc || tabletSrc || mobileSrc;
                break;
        }

        if (selectedSrc) {
            // Check if we need to update the background (device type changed)
            const currentBg = slide.style.backgroundImage;
            const newBg = 'url(' + selectedSrc + ')';
            
            if (currentBg !== newBg) {
                slide.style.backgroundImage = newBg;
                Utils.log('info', 'Updated slide background for ' + deviceType + ': ' + selectedSrc);
            }
        }
    };

    CarouselController.prototype.setupEventListeners = function() {
        const self = this;
        
        // Pause on hover and focus (minimal interaction for clean aesthetic)
        if (CONFIG.CAROUSEL.PAUSE_ON_HOVER) {
            const enterCleanup = Utils.addEventListenerWithCleanup(
                this.container, 'mouseenter', function() { self.pauseAutoPlay(); }
            );
            const leaveCleanup = Utils.addEventListenerWithCleanup(
                this.container, 'mouseleave', function() { self.resumeAutoPlay(); }
            );
            this.cleanupFunctions.push(enterCleanup, leaveCleanup);
        }

        if (CONFIG.CAROUSEL.PAUSE_ON_FOCUS) {
            const focusCleanup = Utils.addEventListenerWithCleanup(
                this.container, 'focusin', function() { self.pauseAutoPlay(); }
            );
            const blurCleanup = Utils.addEventListenerWithCleanup(
                this.container, 'focusout', function() { self.resumeAutoPlay(); }
            );
            this.cleanupFunctions.push(focusCleanup, blurCleanup);
        }

        // Minimal keyboard navigation (optional)
        const keyboardCleanup = Utils.addEventListenerWithCleanup(
            document, 'keydown', function(e) {
                if (!Utils.isInViewport(self.container)) return;

                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        self.prevSlide();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        self.nextSlide();
                        break;
                }
            }
        );
        this.cleanupFunctions.push(keyboardCleanup);

        // Enhanced Touch/swipe support
        this.setupTouchEvents();

        // Enhanced window resize with device type detection
        const resizeCleanup = Utils.addEventListenerWithCleanup(
            window, 'resize', Utils.debounce(function() { self.handleResize(); })
        );
        this.cleanupFunctions.push(resizeCleanup);

        // Enhanced visibility change
        const visibilityCleanup = Utils.addEventListenerWithCleanup(
            document, 'visibilitychange', function() {
                if (document.hidden) {
                    self.pauseAutoPlay();
                } else {
                    self.resumeAutoPlay();
                }
            }
        );
        this.cleanupFunctions.push(visibilityCleanup);
    };

    CarouselController.prototype.setupTouchEvents = function() {
        const self = this;
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        let startTime = 0;

        const touchStartCleanup = Utils.addEventListenerWithCleanup(
            this.container, 'touchstart', function(e) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTime = Date.now();
                isDragging = true;
                self.pauseAutoPlay();
            }, { passive: true }
        );

        const touchMoveCleanup = Utils.addEventListenerWithCleanup(
            this.container, 'touchmove', function(e) {
                if (!isDragging) return;

                const deltaX = Math.abs(e.touches[0].clientX - startX);
                const deltaY = Math.abs(e.touches[0].clientY - startY);

                // If horizontal swipe is detected, prevent vertical scrolling
                if (deltaX > deltaY) {
                    e.preventDefault();
                }
            }, { passive: false }
        );

        const touchEndCleanup = Utils.addEventListenerWithCleanup(
            this.container, 'touchend', function(e) {
                if (!isDragging) return;

                const endX = e.changedTouches[0].clientX;
                const deltaX = startX - endX;
                const deltaTime = Date.now() - startTime;
                const threshold = 50;
                const maxTime = 300;

                if (Math.abs(deltaX) > threshold && deltaTime < maxTime) {
                    if (deltaX > 0) {
                        self.nextSlide();
                    } else {
                        self.prevSlide();
                    }
                }

                isDragging = false;
                self.resumeAutoPlay();
            }, { passive: true }
        );

        this.cleanupFunctions.push(touchStartCleanup, touchMoveCleanup, touchEndCleanup);
    };

    CarouselController.prototype.setupIntersectionObserver = function() {
        const self = this;
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    self.resumeAutoPlay();
                } else {
                    self.pauseAutoPlay();
                }
            });
        }, {
            threshold: CONFIG.PERFORMANCE.INTERSECTION_THRESHOLD
        });

        observer.observe(this.container);
    };

    CarouselController.prototype.handleResize = function() {
        const newDeviceType = Utils.getDeviceType();
        
        // Only update backgrounds if device type changed
        if (newDeviceType !== this.currentDeviceType) {
            Utils.log('info', 'Device type changed from ' + this.currentDeviceType + ' to ' + newDeviceType);
            this.currentDeviceType = newDeviceType;
            this.setupResponsiveBackgrounds();
        }
    };

    CarouselController.prototype.goToSlide = function(index, direction) {
        direction = direction || 'auto';
        if (this.isTransitioning || index === this.currentSlide || index < 0 || index >= this.totalSlides) return;

        const previousSlide = this.currentSlide;
        this.currentSlide = index;
        this.isTransitioning = true;

        // Update slides with enhanced transition
        const self = this;
        this.slides.forEach(function(slide, i) {
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Update ARIA labels
        this.updateAriaLabels();

        // Reset transition flag
        setTimeout(function() {
            self.isTransitioning = false;
        }, CONFIG.CAROUSEL.TRANSITION_DURATION);

        // Dispatch custom event with enhanced data
        const event = new CustomEvent('carouselSlideChange', {
            detail: {
                currentSlide: this.currentSlide,
                previousSlide: previousSlide,
                direction: direction,
                totalSlides: this.totalSlides,
                deviceType: this.currentDeviceType,
                cleanMode: CONFIG.CAROUSEL.CLEAN_MODE,
                timestamp: Date.now()
            }
        });
        this.container.dispatchEvent(event);
    };

    CarouselController.prototype.nextSlide = function() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex, 'next');
    };

    CarouselController.prototype.prevSlide = function() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex, 'prev');
    };

    CarouselController.prototype.startAutoPlay = function() {
        if (!this.isPlaying || this.totalSlides <= 1) return;

        const self = this;
        this.autoPlayTimer = setInterval(function() {
            if (!self.isPaused && !self.isTransitioning) {
                self.nextSlide();
            }
        }, CONFIG.CAROUSEL.AUTO_PLAY_INTERVAL);
        
        Utils.log('info', 'Clean carousel autoplay started with ' + CONFIG.CAROUSEL.AUTO_PLAY_INTERVAL + 'ms interval');
    };

    CarouselController.prototype.stopAutoPlay = function() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
            Utils.log('info', 'Clean carousel autoplay stopped');
        }
    };

    CarouselController.prototype.pauseAutoPlay = function() {
        this.isPaused = true;
    };

    CarouselController.prototype.resumeAutoPlay = function() {
        if (Utils.isInViewport(this.container) && !document.hidden) {
            this.isPaused = false;
        }
    };

    CarouselController.prototype.toggleAutoPlay = function() {
        if (this.isPlaying) {
            this.stopAutoPlay();
            this.isPlaying = false;
        } else {
            this.startAutoPlay();
            this.isPlaying = true;
        }
    };

    CarouselController.prototype.updateAriaLabels = function() {
        const self = this;
        this.slides.forEach(function(slide, i) {
            slide.setAttribute('aria-hidden', i !== self.currentSlide ? 'true' : 'false');
        });
    };

    CarouselController.prototype.destroy = function() {
        this.stopAutoPlay();
        this.cleanupFunctions.forEach(function(cleanup) { cleanup(); });
        this.cleanupFunctions = [];
        Utils.log('info', 'Clean Carousel destroyed');
    };

    // === ENHANCED NAVIGATION CONTROLLER (Elegant Logo Entrance) ===
    function NavigationController() {
        this.header = document.getElementById('header');
        this.mobileToggle = document.getElementById('menuToggle');
        this.mobileNav = document.getElementById('navOverlay');
        this.logo = document.getElementById('mainLogo');
        this.body = document.body;
        this.isOpen = false;
        this.scrollPosition = 0;
        this.cleanupFunctions = [];
        this.isLogoLarge = true; // Start with large logo
        this.logoEntranceComplete = false;
        this.logoEntranceTimer = null;

        this.init();
    }

    NavigationController.prototype.init = function() {
        Utils.log('info', 'Initializing Enhanced Navigation Controller with Elegant Logo Entrance...');

        try {
            this.setupEventListeners();
            this.setupScrollEffects();
            this.initializeElegantLogoEntrance();
            this.updateActiveLinks();
            this.updatePortalLinks();
            this.enhanceAccessibility();
            
            Utils.log('info', 'Enhanced Navigation Controller initialized successfully');
        } catch (error) {
            Utils.log('error', 'Failed to initialize navigation', error);
        }
    };

    NavigationController.prototype.setupEventListeners = function() {
        if (!this.mobileToggle || !this.mobileNav) {
            Utils.log('warn', 'Mobile navigation elements not found');
            return;
        }

        const self = this;

        // Enhanced mobile toggle with perfect hamburger animation
        const toggleCleanup = Utils.addEventListenerWithCleanup(
            this.mobileToggle, 'click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.toggleMobileNav();
            }
        );
        this.cleanupFunctions.push(toggleCleanup);

        // Enhanced mobile nav links
        const mobileLinks = this.mobileNav.querySelectorAll('.overlay-nav-link');
        mobileLinks.forEach(function(link) {
            const linkCleanup = Utils.addEventListenerWithCleanup(
                link, 'click', function() {
                    setTimeout(function() { self.closeMobileNav(); }, 150);
                }
            );
            self.cleanupFunctions.push(linkCleanup);
        });

        // Enhanced backdrop click (clicking outside the sidebar)
        const outsideClickCleanup = Utils.addEventListenerWithCleanup(
            this.mobileNav, 'click', function(e) {
                if (e.target === self.mobileNav && self.isOpen) {
                    self.closeMobileNav();
                }
            }
        );
        this.cleanupFunctions.push(outsideClickCleanup);

        // Enhanced close button
        const closeButton = this.mobileNav.querySelector('#navOverlayClose, .nav-overlay-close');
        if (closeButton) {
            const closeCleanup = Utils.addEventListenerWithCleanup(
                closeButton, 'click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.closeMobileNav();
                }
            );
            self.cleanupFunctions.push(closeCleanup);
        }

        // Enhanced escape key handling
        const escapeCleanup = Utils.addEventListenerWithCleanup(
            document, 'keydown', function(e) {
                if (e.key === 'Escape' && self.isOpen) {
                    self.closeMobileNav();
                }
            }
        );
        this.cleanupFunctions.push(escapeCleanup);

        // Enhanced resize handling
        const resizeCleanup = Utils.addEventListenerWithCleanup(
            window, 'resize', Utils.debounce(function() {
                if (window.innerWidth > CONFIG.BREAKPOINTS.MD && self.isOpen) {
                    self.closeMobileNav();
                }
            })
        );
        this.cleanupFunctions.push(resizeCleanup);
    };

    NavigationController.prototype.toggleMobileNav = function() {
        if (this.isOpen) {
            this.closeMobileNav();
        } else {
            this.openMobileNav();
        }
    };

    NavigationController.prototype.openMobileNav = function() {
        Utils.log('info', 'Opening enhanced Caruso-style sidebar navigation');
        
        this.isOpen = true;
        this.scrollPosition = window.pageYOffset;

        // Enhanced classes and attributes
        this.mobileToggle.classList.add('active');
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        this.mobileNav.classList.add('active');
        this.mobileNav.setAttribute('aria-hidden', 'false');
        this.body.classList.add('nav-open');

        // Enhanced body scroll lock
        this.body.style.position = 'fixed';
        this.body.style.top = '-' + this.scrollPosition + 'px';
        this.body.style.width = '100%';
        this.body.style.overflow = 'hidden';

        // Enhanced focus management for sidebar
        const self = this;
        setTimeout(function() {
            const firstFocusable = self.mobileNav.querySelector('.overlay-nav-link, .overlay-portal-btn, .overlay-consultation-btn');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 450); // Wait for transition to complete
    };

    NavigationController.prototype.closeMobileNav = function() {
        Utils.log('info', 'Closing enhanced Caruso-style sidebar navigation');
        
        this.isOpen = false;

        // Enhanced focus management
        const focusedElement = this.mobileNav.querySelector(':focus');
        if (focusedElement) {
            focusedElement.blur();
        }

        // Enhanced classes and attributes
        this.mobileToggle.classList.remove('active');
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        this.mobileNav.classList.remove('active');
        this.mobileNav.setAttribute('aria-hidden', 'true');
        this.body.classList.remove('nav-open');

        // Enhanced body scroll restoration
        this.body.style.position = '';
        this.body.style.top = '';
        this.body.style.width = '';
        this.body.style.overflow = '';

        // Enhanced scroll position restoration
        window.scrollTo(0, this.scrollPosition);
        
        // Enhanced focus return
        setTimeout(() => {
            this.mobileToggle.focus();
        }, 100);
    };

    NavigationController.prototype.setupScrollEffects = function() {
        if (!this.header) return;

        const self = this;
        const handleScroll = Utils.throttle(function() {
            const scrollY = window.pageYOffset;
            
            if (scrollY > 50) {
                self.header.classList.add('scrolled');
            } else {
                self.header.classList.remove('scrolled');
            }

            // Handle dynamic logo scaling after entrance is complete
            if (self.logoEntranceComplete) {
                self.handleLogoScaling(scrollY);
            }
        });

        const scrollCleanup = Utils.addEventListenerWithCleanup(
            window, 'scroll', handleScroll, { passive: true }
        );
        this.cleanupFunctions.push(scrollCleanup);
    };

    // === ELEGANT LOGO ENTRANCE ANIMATION SYSTEM ===
    NavigationController.prototype.initializeElegantLogoEntrance = function() {
        if (!this.logo) {
            Utils.log('warn', 'Logo element not found for entrance animation');
            return;
        }

        Utils.log('info', 'Initializing elegant logo entrance animation...');

        const self = this;

        // Start with hidden state
        this.logo.classList.add('loading');
        this.logo.style.opacity = '0';
        this.logo.style.transform = 'scale(' + CONFIG.LOGO.INITIAL_SCALE + ') translateY(-10px)';
        this.logo.style.filter = 'blur(1px)';

        // Begin the elegant entrance sequence after a brief delay
        this.logoEntranceTimer = setTimeout(function() {
            self.executeElegantEntrance();
        }, CONFIG.LOGO.ENTRANCE_DELAY);

        Utils.log('info', 'Logo entrance animation scheduled');
    };

    NavigationController.prototype.executeElegantEntrance = function() {
        if (!this.logo) return;

        const self = this;

        Utils.log('info', 'Executing elegant logo entrance animation');

        // Stage 1: Begin entrance
        this.logo.classList.remove('loading');
        this.logo.classList.add('entering');

        // Smooth transition to entering state
        this.logo.style.transition = 'all ' + CONFIG.LOGO.ENTRANCE_DURATION + 'ms ' + CONFIG.LOGO.ENTRANCE_TRANSITION;
        this.logo.style.opacity = '1';
        this.logo.style.transform = 'scale(' + CONFIG.LOGO.ENTERING_SCALE + ') translateY(-5px)';
        this.logo.style.filter = 'blur(0px)';

        // Stage 2: Complete entrance to large state
        setTimeout(function() {
            self.logo.classList.remove('entering');
            self.logo.classList.add('loaded', 'logo-large');
            
            self.logo.style.transform = 'scale(' + CONFIG.LOGO.LARGE_SCALE + ') translateY(0)';
            self.isLogoLarge = true;
            self.logoEntranceComplete = true;
            
            Utils.log('info', 'Logo entrance animation completed - Brand focus achieved');
            
            // Setup hover effects after entrance is complete
            self.setupLogoHoverEffects();
            
            // Dispatch entrance complete event
            self.dispatchLogoEntranceEvent();
            
        }, CONFIG.LOGO.ENTRANCE_DURATION);
    };

    NavigationController.prototype.setupLogoHoverEffects = function() {
        if (!this.logo || !this.logoEntranceComplete) return;

        const self = this;

        const hoverInCleanup = Utils.addEventListenerWithCleanup(
            this.logo, 'mouseenter', function() {
                if (self.isLogoLarge) {
                    self.logo.style.transform = 'scale(' + (CONFIG.LOGO.LARGE_SCALE + CONFIG.LOGO.HOVER_SCALE_BONUS) + ') translateY(-2px)';
                } else {
                    self.logo.style.transform = 'scale(' + (CONFIG.LOGO.NORMAL_SCALE + CONFIG.LOGO.HOVER_SCALE_BONUS) + ') translateY(-2px)';
                }
                self.logo.style.transition = 'all ' + CONFIG.LOGO.HOVER_DURATION + 'ms ease-out';
                self.logo.style.filter = 'brightness(1.05)';
            }
        );

        const hoverOutCleanup = Utils.addEventListenerWithCleanup(
            this.logo, 'mouseleave', function() {
                if (self.isLogoLarge) {
                    self.logo.style.transform = 'scale(' + CONFIG.LOGO.LARGE_SCALE + ') translateY(0)';
                } else {
                    self.logo.style.transform = 'scale(' + CONFIG.LOGO.NORMAL_SCALE + ') translateY(0)';
                }
                self.logo.style.transition = 'all ' + CONFIG.LOGO.HOVER_DURATION + 'ms ease-out';
                self.logo.style.filter = 'brightness(1)';
            }
        );

        this.cleanupFunctions.push(hoverInCleanup, hoverOutCleanup);
        Utils.log('info', 'Logo hover effects initialized');
    };

    NavigationController.prototype.handleLogoScaling = function(scrollY) {
        if (!this.logo || !this.logoEntranceComplete) return;

        if (scrollY > CONFIG.LOGO.SCALE_THRESHOLD && this.isLogoLarge) {
            this.setLogoSmall();
        } else if (scrollY <= CONFIG.LOGO.SCALE_THRESHOLD && !this.isLogoLarge) {
            this.setLogoLarge();
        }
    };

    NavigationController.prototype.setLogoLarge = function() {
        if (!this.logo || !this.logoEntranceComplete || this.isLogoLarge === true) return;
        
        this.logo.classList.remove('logo-small', 'scrolled');
        this.logo.classList.add('logo-large');
        
        this.logo.style.transition = 'all ' + CONFIG.LOGO.SCROLL_DURATION + 'ms ' + CONFIG.LOGO.SCROLL_TRANSITION;
        this.logo.style.transform = 'scale(' + CONFIG.LOGO.LARGE_SCALE + ') translateY(0)';
        
        this.isLogoLarge = true;
        Utils.log('info', 'Logo scaled to large size');
    };

    NavigationController.prototype.setLogoSmall = function() {
        if (!this.logo || !this.logoEntranceComplete || this.isLogoLarge === false) return;
        
        this.logo.classList.remove('logo-large');
        this.logo.classList.add('logo-small', 'scrolled');
        
        this.logo.style.transition = 'all ' + CONFIG.LOGO.SCROLL_DURATION + 'ms ' + CONFIG.LOGO.SCROLL_TRANSITION;
        this.logo.style.transform = 'scale(' + CONFIG.LOGO.NORMAL_SCALE + ') translateY(0)';
        
        this.isLogoLarge = false;
        Utils.log('info', 'Logo scaled to normal size');
    };

    NavigationController.prototype.dispatchLogoEntranceEvent = function() {
        const event = new CustomEvent('logoEntranceComplete', {
            detail: {
                logo: this.logo,
                entranceDuration: CONFIG.LOGO.ENTRANCE_DURATION,
                currentScale: CONFIG.LOGO.LARGE_SCALE,
                timestamp: Date.now(),
                brandFocused: true
            }
        });
        window.dispatchEvent(event);
        Utils.log('info', 'Logo entrance complete event dispatched');
    };

    NavigationController.prototype.updateActiveLinks = function() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';

        const allLinks = [];
        const desktopLinks = document.querySelectorAll('.nav-link');
        const mobileLinks = document.querySelectorAll('.overlay-nav-link');
        
        for (let i = 0; i < desktopLinks.length; i++) {
            allLinks.push(desktopLinks[i]);
        }
        for (let i = 0; i < mobileLinks.length; i++) {
            allLinks.push(mobileLinks[i]);
        }

        allLinks.forEach(function(link) {
            const href = link.getAttribute('href');
            if (href) {
                const isActive = (href === '/' && (currentPage === '' || currentPage === 'index.html')) ||
                               (href !== '/' && href.indexOf(currentPage.replace('.html', '')) !== -1);
                
                if (isActive) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            }
        });
    };

    NavigationController.prototype.updatePortalLinks = function() {
        const portalLinks = document.querySelectorAll(
            '.portal-btn, .overlay-portal-btn, .footer-portal-btn, [href*="portal"]'
        );

        portalLinks.forEach(function(link) {
            const text = link.textContent.toLowerCase();

            if (text.indexOf('client') !== -1) {
                link.href = CONFIG.PORTAL_DOMAINS.CLIENT;
            } else if (text.indexOf('admin') !== -1) {
                link.href = CONFIG.PORTAL_DOMAINS.ADMIN;
            } else if (text.indexOf('staff') !== -1) {
                link.href = CONFIG.PORTAL_DOMAINS.STAFF;
            }

            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    };

    NavigationController.prototype.enhanceAccessibility = function() {
        // Enhanced ARIA labels and roles
        if (this.mobileToggle) {
            this.mobileToggle.setAttribute('role', 'button');
            this.mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
        }

        if (this.mobileNav) {
            this.mobileNav.setAttribute('role', 'dialog');
            this.mobileNav.setAttribute('aria-label', 'Navigation menu');
        }

        // Enhanced keyboard navigation
        const focusableElements = this.mobileNav ? this.mobileNav.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        ) : [];

        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            // Enhanced focus trap
            const self = this;
            const trapFocus = function(e) {
                if (!self.isOpen) return;

                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            };

            const trapCleanup = Utils.addEventListenerWithCleanup(
                document, 'keydown', trapFocus
            );
            this.cleanupFunctions.push(trapCleanup);
        }
    };

    NavigationController.prototype.destroy = function() {
        if (this.logoEntranceTimer) {
            clearTimeout(this.logoEntranceTimer);
        }
        this.cleanupFunctions.forEach(function(cleanup) { cleanup(); });
        this.cleanupFunctions = [];
        Utils.log('info', 'Enhanced Navigation with Logo Entrance destroyed');
    };

    // === ENHANCED ANIMATION CONTROLLER ===
    function AnimationController() {
        this.observers = [];
        this.init();
    }

    AnimationController.prototype.init = function() {
        Utils.log('info', 'Initializing Enhanced Animation Controller...');

        try {
            this.setupScrollAnimations();
            this.setupHoverEffects();
            this.setupHeroAnimations();
            this.setupPerformanceOptimizations();
            
            Utils.log('info', 'Enhanced Animation Controller initialized successfully');
        } catch (error) {
            Utils.log('error', 'Failed to initialize animations', error);
        }
    };

    AnimationController.prototype.setupScrollAnimations = function() {
        const self = this;
        const observerOptions = {
            threshold: CONFIG.PERFORMANCE.INTERSECTION_THRESHOLD,
            rootMargin: CONFIG.PERFORMANCE.INTERSECTION_ROOT_MARGIN
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Enhanced element selection
        const elements = document.querySelectorAll(
            '.service-card, .testimonial-card, .team-member, .coverage-card, .feature-item, .about-img'
        );

        elements.forEach(function(el) { observer.observe(el); });
        this.observers.push(observer);
    };

    AnimationController.prototype.setupHoverEffects = function() {
        // Enhanced service cards
        this.setupCardHoverEffects('.service-card', -8);
        
        // Enhanced team members
        this.setupCardHoverEffects('.team-member', -8);
        
        // Enhanced buttons
        this.setupButtonHoverEffects();
        
        // Enhanced navigation effects
        this.setupNavigationHoverEffects();
    };

    AnimationController.prototype.setupCardHoverEffects = function(selector, translateY) {
        const cards = document.querySelectorAll(selector);
        cards.forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(' + translateY + 'px)';
                this.style.willChange = 'transform';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.willChange = 'auto';
            });
        });
    };

    AnimationController.prototype.setupButtonHoverEffects = function() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(function(button) {
            button.addEventListener('mouseenter', function() {
                if (!this.classList.contains('btn-secondary')) {
                    this.style.transform = 'translateY(-2px)';
                    this.style.willChange = 'transform';
                }
            });

            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.willChange = 'auto';
            });
        });
    };

    AnimationController.prototype.setupNavigationHoverEffects = function() {
        // Enhanced overlay navigation links
        const overlayLinks = document.querySelectorAll('.overlay-nav-link');
        overlayLinks.forEach(function(link) {
            link.addEventListener('mouseenter', function() {
                this.style.paddingLeft = 'calc(var(--spacing-6) + 8px)';
            });

            link.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.style.paddingLeft = '';
                }
            });
        });
    };

    AnimationController.prototype.setupHeroAnimations = function() {
        const heroElements = document.querySelectorAll(
            '.hero-title, .hero-subtitle, .hero-buttons, .hero-notice'
        );

        heroElements.forEach(function(element, index) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';

            setTimeout(function() {
                element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 800 + (index * 150)); // Delayed to allow logo entrance to complete first
        });
    };

    AnimationController.prototype.setupPerformanceOptimizations = function() {
        // Enhanced performance for animated elements
        const animatedElements = document.querySelectorAll(
            '.service-card, .team-member, .btn, .overlay-nav-link, .logo'
        );

        animatedElements.forEach(function(element) {
            element.style.backfaceVisibility = 'hidden';
            element.style.transform = 'translateZ(0)';
        });
    };

    AnimationController.prototype.destroy = function() {
        this.observers.forEach(function(observer) { observer.disconnect(); });
        this.observers = [];
        Utils.log('info', 'Enhanced Animation Controller destroyed');
    };

    // === ENHANCED FORM HANDLER ===
    function FormHandler() {
        this.cleanupFunctions = [];
        this.init();
    }

    FormHandler.prototype.init = function() {
        Utils.log('info', 'Initializing Enhanced Form Handler...');

        try {
            this.setupFormValidation();
            this.setupPhoneFormatting();
            this.handleURLParameters();
            this.setupEnhancedInteractions();
            
            Utils.log('info', 'Enhanced Form Handler initialized successfully');
        } catch (error) {
            Utils.log('error', 'Failed to initialize form handler', error);
        }
    };

    FormHandler.prototype.setupFormValidation = function() {
        const forms = document.querySelectorAll('form');
        const self = this;

        forms.forEach(function(form) {
            const submitCleanup = Utils.addEventListenerWithCleanup(
                form, 'submit', function(e) {
                    if (!self.validateForm(form)) {
                        e.preventDefault();
                        self.showFormError('Please fill in all required fields correctly.');
                    }
                }
            );
            self.cleanupFunctions.push(submitCleanup);
        });
    };

    FormHandler.prototype.validateForm = function(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(function(field) {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'var(--color-danger)';
                field.setAttribute('aria-invalid', 'true');
                field.classList.add('invalid');
            } else {
                field.style.borderColor = '';
                field.setAttribute('aria-invalid', 'false');
                field.classList.remove('invalid');
            }
        });

        return isValid;
    };

    FormHandler.prototype.setupPhoneFormatting = function() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        const self = this;

        phoneInputs.forEach(function(input) {
            const inputCleanup = Utils.addEventListenerWithCleanup(
                input, 'input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');

                    if (value.length >= 6) {
                        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                    } else if (value.length >= 3) {
                        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
                    }

                    e.target.value = value;
                }
            );
            self.cleanupFunctions.push(inputCleanup);
        });
    };

    FormHandler.prototype.handleURLParameters = function() {
        const urlParams = new URLSearchParams(window.location.search);
        const service = urlParams.get('service');

        if (service) {
            const serviceCheckbox = document.querySelector('input[value*="' + service + '"]');
            if (serviceCheckbox) {
                serviceCheckbox.checked = true;
                const serviceOption = serviceCheckbox.closest('.service-option');
                if (serviceOption) {
                    serviceOption.classList.add('selected');
                }
            }
        }
    };

    FormHandler.prototype.setupEnhancedInteractions = function() {
        // Enhanced form field interactions
        const formFields = document.querySelectorAll('.form-input, .form-textarea, .form-select');
        
        formFields.forEach(function(field) {
            field.addEventListener('focus', function() {
                this.style.transform = 'scale(1.02)';
                this.style.transition = 'transform 0.2s ease';
            });

            field.addEventListener('blur', function() {
                this.style.transform = 'scale(1)';
            });
        });
    };

    FormHandler.prototype.showFormError = function(message) {
        // Enhanced error display
        const existingError = document.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-danger);
            color: white;
            padding: 1rem 2rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        setTimeout(function() {
            if (errorDiv && errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    };

    FormHandler.prototype.destroy = function() {
        this.cleanupFunctions.forEach(function(cleanup) { cleanup(); });
        this.cleanupFunctions = [];
        Utils.log('info', 'Enhanced Form Handler destroyed');
    };

    // === ENHANCED SMOOTH SCROLL CONTROLLER ===
    function SmoothScrollController() {
        this.cleanupFunctions = [];
        this.init();
    }

    SmoothScrollController.prototype.init = function() {
        Utils.log('info', 'Initializing Enhanced Smooth Scroll Controller...');

        try {
            this.setupSmoothScrolling();
            Utils.log('info', 'Enhanced Smooth Scroll Controller initialized successfully');
        } catch (error) {
            Utils.log('error', 'Failed to initialize smooth scroll', error);
        }
    };

    SmoothScrollController.prototype.setupSmoothScrolling = function() {
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        const self = this;

        scrollLinks.forEach(function(link) {
            const clickCleanup = Utils.addEventListenerWithCleanup(
                link, 'click', function(e) {
                    const targetId = link.getAttribute('href');
                    const target = document.querySelector(targetId);

                    if (target) {
                        e.preventDefault();
                        Utils.scrollToElement(target);
                        
                        // Enhanced focus management
                        target.setAttribute('tabindex', '-1');
                        target.focus();
                        target.style.outline = 'none';
                    }
                }
            );
            self.cleanupFunctions.push(clickCleanup);
        });
    };

    SmoothScrollController.prototype.destroy = function() {
        this.cleanupFunctions.forEach(function(cleanup) { cleanup(); });
        this.cleanupFunctions = [];
        Utils.log('info', 'Enhanced Smooth Scroll Controller destroyed');
    };

    // === ENHANCED CONTACT UPDATER ===
    function ContactUpdater() {
        this.init();
    }

    ContactUpdater.prototype.init = function() {
        Utils.log('info', 'Initializing Enhanced Contact Updater...');

        try {
            this.updateAllContacts();
            Utils.log('info', 'Enhanced Contact Updater initialized successfully');
        } catch (error) {
            Utils.log('error', 'Failed to initialize contact updater', error);
        }
    };

    ContactUpdater.prototype.updateAllContacts = function() {
        this.updatePhoneNumbers();
        this.updateEmailAddresses();
        this.updatePortalLinks();
    };

    ContactUpdater.prototype.updatePhoneNumbers = function() {
        const phoneElements = document.querySelectorAll(
            'a[href*="tel:"], .phone-number, [data-phone]'
        );

        phoneElements.forEach(function(element) {
            if (element.tagName === 'A') {
                element.href = 'tel:+18053676432';
            }
            if (element.textContent.indexOf('(') !== -1 || element.textContent.indexOf('-') !== -1) {
                element.textContent = CONFIG.PHONE_NUMBER;
            }
        });
    };

    ContactUpdater.prototype.updateEmailAddresses = function() {
        const emailElements = document.querySelectorAll(
            'a[href*="mailto:"], .email-address, [data-email]'
        );

        emailElements.forEach(function(element) {
            if (element.tagName === 'A') {
                element.href = 'mailto:' + CONFIG.EMAIL;
            }
            if (element.textContent.indexOf('@') !== -1) {
                element.textContent = CONFIG.EMAIL;
            }
        });
    };

    ContactUpdater.prototype.updatePortalLinks = function() {
        const portalLinks = document.querySelectorAll(
            '.portal-btn, .overlay-portal-btn, .footer-portal-btn'
        );

        portalLinks.forEach(function(link) {
            const text = link.textContent.toLowerCase();

            if (text.indexOf('client') !== -1) {
                link.href = CONFIG.PORTAL_DOMAINS.CLIENT;
            } else if (text.indexOf('admin') !== -1) {
                link.href = CONFIG.PORTAL_DOMAINS.ADMIN;
            } else if (text.indexOf('staff') !== -1) {
                link.href = CONFIG.PORTAL_DOMAINS.STAFF;
            }

            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    };

    // === MAIN APPLICATION CLASS ===
    function LuxuryApp() {
        this.webpService = new WebPDetectionService();
        this.navigation = null;
        this.carousel = null;
        this.animations = null;
        this.forms = null;
        this.smoothScroll = null;
        this.contactUpdater = null;
        this.isInitialized = false;
        this.version = '9.0';

        this.init();
    }

    LuxuryApp.prototype.init = function() {
        const self = this;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() { self.initializeApp(); });
        } else {
            this.initializeApp();
        }
    };

    LuxuryApp.prototype.initializeApp = function() {
        const self = this;
        try {
            Utils.log('info', 'Initializing 805 LifeGuard Enhanced Luxury Application v' + this.version + ' with Elegant Logo Entrance...');

            // Detect WebP support first
            this.webpService.detect().then(function() {
                // Initialize core components
                self.navigation = new NavigationController();
                self.forms = new FormHandler();
                self.smoothScroll = new SmoothScrollController();
                self.contactUpdater = new ContactUpdater();

                // Initialize carousel if hero carousel exists
                const heroCarousel = document.getElementById('heroCarousel');
                if (heroCarousel) {
                    self.carousel = new CarouselController(heroCarousel);
                }

                // Initialize animations after logo entrance begins
                setTimeout(function() {
                    self.animations = new AnimationController();
                }, 200);

                self.isInitialized = true;

                Utils.log('info', '805 LifeGuard Enhanced Luxury Application v' + self.version + ' initialized successfully with elegant brand focus');

                // Dispatch ready event
                self.dispatchReadyEvent();
            });

        } catch (error) {
            Utils.log('error', 'Failed to initialize application', error);
            this.initializeFallback();
        }
    };

    LuxuryApp.prototype.dispatchReadyEvent = function() {
        const event = new CustomEvent('luxuryAppReady', {
            detail: {
                app: this,
                hasCarousel: !!this.carousel,
                webpSupport: this.webpService.isSupported,
                version: this.version,
                timestamp: new Date().toISOString(),
                deviceType: Utils.getDeviceType(),
                features: {
                    elegantLogoEntrance: true,
                    brandFocusedDesign: true,
                    cleanCarouselMode: CONFIG.CAROUSEL.CLEAN_MODE,
                    noCarouselIndicators: CONFIG.CAROUSEL.HIDE_INDICATORS,
                    enhancedMobileSpacing: true,
                    carusoAesthetic: true,
                    noBorders: true
                }
            }
        });
        window.dispatchEvent(event);
    };

    LuxuryApp.prototype.initializeFallback = function() {
        Utils.log('info', 'Initializing enhanced fallback functionality...');

        // Enhanced mobile navigation fallback
        const mobileToggle = document.getElementById('menuToggle');
        const mobileNav = document.getElementById('navOverlay');

        if (mobileToggle && mobileNav) {
            mobileToggle.addEventListener('click', function(e) {
                e.preventDefault();
                
                const isOpen = mobileNav.classList.contains('active');
                
                if (isOpen) {
                    // Close navigation
                    mobileToggle.classList.remove('active');
                    mobileNav.classList.remove('active');
                    document.body.classList.remove('nav-open');
                } else {
                    // Open navigation
                    mobileToggle.classList.add('active');
                    mobileNav.classList.add('active');
                    document.body.classList.add('nav-open');
                }
            });

            // Close button fallback
            const closeButton = mobileNav.querySelector('#navOverlayClose, .nav-overlay-close');
            if (closeButton) {
                closeButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    mobileToggle.classList.remove('active');
                    mobileNav.classList.remove('active');
                    document.body.classList.remove('nav-open');
                });
            }

            Utils.log('info', 'Enhanced fallback mobile navigation initialized');
        }

        // Logo fallback entrance
        const logo = document.getElementById('mainLogo');
        if (logo) {
            setTimeout(function() {
                logo.style.opacity = '1';
                logo.style.transform = 'scale(1.15)';
                logo.style.transition = 'all 800ms ease-out';
            }, 400);
        }

        // Enhanced smooth scroll fallback
        const smoothLinks = document.querySelectorAll('a[href^="#"]');
        smoothLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Enhanced carousel fallback (Clean mode)
        const heroCarousel = document.getElementById('heroCarousel');
        if (heroCarousel) {
            const slides = heroCarousel.querySelectorAll('.carousel-slide');
            if (slides.length > 0) {
                slides[0].classList.add('active');
                
                // Remove all navigation elements in fallback mode too
                const navElements = document.querySelectorAll('.carousel-indicators, .carousel-controls, .carousel-prev, .carousel-next, .indicator');
                navElements.forEach(function(element) {
                    element.style.display = 'none';
                    element.remove();
                });
            }
        }

        Utils.log('info', 'Enhanced fallback functionality initialized');
    };

    // === PUBLIC API METHODS ===

    LuxuryApp.prototype.getVersion = function() {
        return this.version;
    };

    LuxuryApp.prototype.isReady = function() {
        return this.isInitialized;
    };

    LuxuryApp.prototype.getCarousel = function() {
        return this.carousel;
    };

    LuxuryApp.prototype.getNavigation = function() {
        return this.navigation;
    };

    LuxuryApp.prototype.closeMobileNav = function() {
        if (this.navigation) {
            this.navigation.closeMobileNav();
        }
    };

    LuxuryApp.prototype.pauseCarousel = function() {
        if (this.carousel) {
            this.carousel.pauseAutoPlay();
        }
    };

    LuxuryApp.prototype.resumeCarousel = function() {
        if (this.carousel) {
            this.carousel.resumeAutoPlay();
        }
    };

    LuxuryApp.prototype.setLogoLarge = function() {
        if (this.navigation) {
            this.navigation.setLogoLarge();
        }
    };

    LuxuryApp.prototype.setLogoSmall = function() {
        if (this.navigation) {
            this.navigation.setLogoSmall();
        }
    };

    LuxuryApp.prototype.getWebPSupport = function() {
        return this.webpService.isSupported;
    };

    LuxuryApp.prototype.getCurrentBreakpoint = function() {
        return Utils.getCurrentBreakpoint();
    };

    LuxuryApp.prototype.getDeviceType = function() {
        return Utils.getDeviceType();
    };

    LuxuryApp.prototype.getFeatures = function() {
        return {
            elegantLogoEntrance: true,
            brandFocusedDesign: true,
            cleanCarouselMode: CONFIG.CAROUSEL.CLEAN_MODE,
            noCarouselIndicators: CONFIG.CAROUSEL.HIDE_INDICATORS,
            enhancedMobileSpacing: true,
            carusoAesthetic: true,
            noBorders: true,
            version: this.version
        };
    };

    LuxuryApp.prototype.destroy = function() {
        Utils.log('info', 'Destroying Enhanced Luxury Application...');

        if (this.carousel) this.carousel.destroy();
        if (this.navigation) this.navigation.destroy();
        if (this.animations) this.animations.destroy();
        if (this.forms) this.forms.destroy();
        if (this.smoothScroll) this.smoothScroll.destroy();

        this.isInitialized = false;

        Utils.log('info', 'Enhanced Luxury Application destroyed');
    };

    // === ERROR HANDLING ===
    window.addEventListener('error', function(e) {
        Utils.log('error', 'Global JavaScript error', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error
        });
    });

    window.addEventListener('unhandledrejection', function(e) {
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
    window.CarouselController = CarouselController;

    // Enhanced development/debug mode
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.indexOf('805lifeguard.com') !== -1 ||
        window.location.search.indexOf('debug=true') !== -1) {
        
        window.Utils = Utils;
        window.CONFIG = CONFIG;
        Utils.log('info', 'Enhanced debug mode active - Elegant logo entrance enabled');
        Utils.log('info', 'Access app instance via window.app');
        Utils.log('info', 'Access utilities via window.Utils');
        Utils.log('info', 'Access config via window.CONFIG');
        Utils.log('info', 'Current device type: ' + Utils.getDeviceType());
        Utils.log('info', 'Features: Elegant logo entrance, brand-focused design, clean carousel mode, no borders');
    }

})();
