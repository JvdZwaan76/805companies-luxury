/*
 * 805 LifeGuard - Luxury App JS (Enterprise JavaScript Application)
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
            return window.innerWidth <= CONFIG.BREAKPOINTS.MD;
        },

        /*
         * Check if device is tablet
         */
        isTablet: function() {
            return window.innerWidth > CONFIG.BREAKPOINTS.MD && window.innerWidth <= CONFIG.BREAKPOINTS.LG;
        },

        /*
         * Check if device is desktop
         */
        isDesktop: function() {
            return window.innerWidth > CONFIG.BREAKPOINTS.LG;
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
         * Preload image
         */
        preloadImage: function(src) {
            return new Promise(function(resolve, reject) {
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
         * Log with timestamp and context
         */
        log: function(level, message, data) {
            if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') return;
            
            const timestamp = new Date().toISOString();
            const logMessage = '[' + timestamp + '] [' + level.toUpperCase() + '] 805 LifeGuard: ' + message;
            
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

    // === CAROUSEL CONTROLLER ===
    function CarouselController(container) {
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

    CarouselController.prototype.init = function() {
        if (this.totalSlides === 0) {
            Utils.log('warn', 'No carousel slides found');
            return;
        }

        Utils.log('info', 'Initializing Carousel Controller...');

        try {
            this.preloadImages();
            this.setupResponsiveBackgrounds();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.startAutoPlay();
            this.handleResize();
            
            Utils.log('info', 'Carousel Controller initialized successfully');
        } catch (error) {
            Utils.log('error', 'Failed to initialize carousel', error);
        }
    };

    CarouselController.prototype.preloadImages = function() {
        const imagePromises = [];
        const self = this;
        
        this.slides.forEach(function(slide) {
            const desktopSrc = slide.dataset.bgDesktop;
            const mobileSrc = slide.dataset.bgMobile;
            
            if (desktopSrc) {
                imagePromises.push(Utils.preloadImage(desktopSrc));
            }
            if (mobileSrc && mobileSrc !== desktopSrc) {
                imagePromises.push(Utils.preloadImage(mobileSrc));
            }
        });

        if (imagePromises.length > 0) {
            Promise.allSettled(imagePromises).then(function() {
                Utils.log('info', 'Carousel images preloaded');
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
        const desktopSrc = slide.dataset.bgDesktop;
        const mobileSrc = slide.dataset.bgMobile;
        
        let selectedSrc;
        if (Utils.isMobile() && mobileSrc) {
            selectedSrc = mobileSrc;
        } else if (desktopSrc) {
            selectedSrc = desktopSrc;
        }

        if (selectedSrc && !slide.style.backgroundImage) {
            slide.style.backgroundImage = 'url(' + selectedSrc + ')';
        }
    };

    CarouselController.prototype.setupEventListeners = function() {
        const self = this;
        
        // Navigation buttons
        if (this.prevBtn) {
            const cleanup = Utils.addEventListenerWithCleanup(
                this.prevBtn, 'click', function() { self.prevSlide(); }
            );
            this.cleanupFunctions.push(cleanup);
        }

        if (this.nextBtn) {
            const cleanup = Utils.addEventListenerWithCleanup(
                this.nextBtn, 'click', function() { self.nextSlide(); }
            );
            this.cleanupFunctions.push(cleanup);
        }

        // Indicators
        this.indicators.forEach(function(indicator, index) {
            const clickCleanup = Utils.addEventListenerWithCleanup(
                indicator, 'click', function() { self.goToSlide(index); }
            );
            self.cleanupFunctions.push(clickCleanup);

            const keyCleanup = Utils.addEventListenerWithCleanup(
                indicator, 'keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        self.goToSlide(index);
                    }
                }
            );
            self.cleanupFunctions.push(keyCleanup);
        });

        // Pause on hover and focus
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

        // Keyboard navigation
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
                    case ' ':
                        e.preventDefault();
                        self.toggleAutoPlay();
                        break;
                }
            }
        );
        this.cleanupFunctions.push(keyboardCleanup);

        // Touch/swipe support
        this.setupTouchEvents();

        // Window resize
        const resizeCleanup = Utils.addEventListenerWithCleanup(
            window, 'resize', Utils.debounce(function() { self.handleResize(); })
        );
        this.cleanupFunctions.push(resizeCleanup);

        // Visibility change
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

        const touchStartCleanup = Utils.addEventListenerWithCleanup(
            this.container, 'touchstart', function(e) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isDragging = true;
                self.pauseAutoPlay();
            }, { passive: true }
        );

        const touchMoveCleanup = Utils.addEventListenerWithCleanup(
            this.container, 'touchmove', function(e) {
                if (!isDragging) return;

                const deltaX = Math.abs(e.touches[0].clientX - startX);
                const deltaY = Math.abs(e.touches[0].clientY - startY);

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
                const threshold = 50;

                if (Math.abs(deltaX) > threshold) {
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
        this.setupResponsiveBackgrounds();
    };

    CarouselController.prototype.goToSlide = function(index, direction) {
        direction = direction || 'auto';
        if (this.isTransitioning || index === this.currentSlide) return;

        const previousSlide = this.currentSlide;
        this.currentSlide = index;
        this.isTransitioning = true;

        // Update slides
        const self = this;
        this.slides.forEach(function(slide, i) {
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Update indicators
        this.indicators.forEach(function(indicator, i) {
            if (i === index) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-selected', 'true');
            } else {
                indicator.classList.remove('active');
                indicator.setAttribute('aria-selected', 'false');
            }
        });

        // Update ARIA labels
        this.updateAriaLabels();

        // Reset transition flag
        setTimeout(function() {
            self.isTransitioning = false;
        }, CONFIG.CAROUSEL.TRANSITION_DURATION);

        // Dispatch custom event
        const event = new CustomEvent('carouselSlideChange', {
            detail: {
                currentSlide: this.currentSlide,
                previousSlide: previousSlide,
                direction: direction,
                totalSlides: this.totalSlides
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
    };

    CarouselController.prototype.stopAutoPlay = function() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
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
        Utils.log('info', 'Carousel destroyed');
    };

    // === NAVIGATION CONTROLLER ===
    function NavigationController() {
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

    NavigationController.prototype.init = function() {
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
    };

    NavigationController.prototype.setupEventListeners = function() {
        if (!this.mobileToggle || !this.mobileNav) {
            Utils.log('warn', 'Mobile navigation elements not found');
            return;
        }

        const self = this;

        // Mobile toggle
        const toggleCleanup = Utils.addEventListenerWithCleanup(
            this.mobileToggle, 'click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.toggleMobileNav();
            }
        );
        this.cleanupFunctions.push(toggleCleanup);

        // Mobile nav close
        if (this.mobileNavClose) {
            const closeCleanup = Utils.addEventListenerWithCleanup(
                this.mobileNavClose, 'click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.closeMobileNav();
                }
            );
            this.cleanupFunctions.push(closeCleanup);
        }

        // Mobile nav links
        const mobileLinks = this.mobileNav.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(function(link) {
            const linkCleanup = Utils.addEventListenerWithCleanup(
                link, 'click', function() {
                    setTimeout(function() { self.closeMobileNav(); }, 100);
                }
            );
            self.cleanupFunctions.push(linkCleanup);
        });

        // Close on outside click
        const outsideClickCleanup = Utils.addEventListenerWithCleanup(
            document, 'click', function(e) {
                if (self.isOpen && 
                    !self.mobileNav.contains(e.target) && 
                    !self.mobileToggle.contains(e.target)) {
                    self.closeMobileNav();
                }
            }
        );
        this.cleanupFunctions.push(outsideClickCleanup);

        // Close on escape key
        const escapeCleanup = Utils.addEventListenerWithCleanup(
            document, 'keydown', function(e) {
                if (e.key === 'Escape' && self.isOpen) {
                    self.closeMobileNav();
                }
            }
        );
        this.cleanupFunctions.push(escapeCleanup);

        // Close on window resize
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
        this.body.style.top = '-' + this.scrollPosition + 'px';
        this.body.style.width = '100%';

        // Focus management
        const self = this;
        setTimeout(function() {
            const firstLink = self.mobileNav.querySelector('.mobile-nav-link');
            if (firstLink) {
                firstLink.focus();
            }
        }, 300);
    };

    NavigationController.prototype.closeMobileNav = function() {
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
        });

        const scrollCleanup = Utils.addEventListenerWithCleanup(
            window, 'scroll', handleScroll, { passive: true }
        );
        this.cleanupFunctions.push(scrollCleanup);
    };

    NavigationController.prototype.updateActiveLinks = function() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';

        const allLinks = [];
        const desktopLinks = document.querySelectorAll('.nav-link');
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        
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
                }
            }
        });
    };

    NavigationController.prototype.updatePortalLinks = function() {
        const portalLinks = document.querySelectorAll(
            '.portal-btn, .mobile-portal-btn, .footer-portal-btn, [href*="portal"]'
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

    NavigationController.prototype.destroy = function() {
        this.cleanupFunctions.forEach(function(cleanup) { cleanup(); });
        this.cleanupFunctions = [];
        Utils.log('info', 'Navigation destroyed');
    };

    // === ANIMATION CONTROLLER ===
    function AnimationController() {
        this.observers = [];
        this.init();
    }

    AnimationController.prototype.init = function() {
        Utils.log('info', 'Initializing Animation Controller...');

        try {
            this.setupScrollAnimations();
            this.setupHoverEffects();
            this.setupHeroAnimations();
            
            Utils.log('info', 'Animation Controller initialized successfully');
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

        // Observe elements
        const elements = document.querySelectorAll(
            '.service-card, .testimonial-card, .team-member, .coverage-card, .feature-item'
        );

        elements.forEach(function(el) { observer.observe(el); });
        this.observers.push(observer);
    };

    AnimationController.prototype.setupHoverEffects = function() {
        // Service cards
        this.setupCardHoverEffects('.service-card', -8);
        
        // Team members
        this.setupCardHoverEffects('.team-member', -8);
        
        // Buttons
        this.setupButtonHoverEffects();
    };

    AnimationController.prototype.setupCardHoverEffects = function(selector, translateY) {
        const cards = document.querySelectorAll(selector);
        cards.forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(' + translateY + 'px)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    };

    AnimationController.prototype.setupButtonHoverEffects = function() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(function(button) {
            button.addEventListener('mouseenter', function() {
                if (!this.classList.contains('btn-secondary')) {
                    this.style.transform = 'translateY(-2px)';
                }
            });

            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
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
            }, 500 + (index * 150));
        });
    };

    AnimationController.prototype.destroy = function() {
        this.observers.forEach(function(observer) { observer.disconnect(); });
        this.observers = [];
        Utils.log('info', 'Animation Controller destroyed');
    };

    // === FORM HANDLER ===
    function FormHandler() {
        this.cleanupFunctions = [];
        this.init();
    }

    FormHandler.prototype.init = function() {
        Utils.log('info', 'Initializing Form Handler...');

        try {
            this.setupFormValidation();
            this.setupPhoneFormatting();
            this.handleURLParameters();
            
            Utils.log('info', 'Form Handler initialized successfully');
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
            } else {
                field.style.borderColor = '';
                field.setAttribute('aria-invalid', 'false');
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

    FormHandler.prototype.showFormError = function(message) {
        alert(message);
    };

    FormHandler.prototype.destroy = function() {
        this.cleanupFunctions.forEach(function(cleanup) { cleanup(); });
        this.cleanupFunctions = [];
        Utils.log('info', 'Form Handler destroyed');
    };

    // === SMOOTH SCROLL CONTROLLER ===
    function SmoothScrollController() {
        this.cleanupFunctions = [];
        this.init();
    }

    SmoothScrollController.prototype.init = function() {
        Utils.log('info', 'Initializing Smooth Scroll Controller...');

        try {
            this.setupSmoothScrolling();
            Utils.log('info', 'Smooth Scroll Controller initialized successfully');
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
                    }
                }
            );
            self.cleanupFunctions.push(clickCleanup);
        });
    };

    SmoothScrollController.prototype.destroy = function() {
        this.cleanupFunctions.forEach(function(cleanup) { cleanup(); });
        this.cleanupFunctions = [];
        Utils.log('info', 'Smooth Scroll Controller destroyed');
    };

    // === CONTACT UPDATER ===
    function ContactUpdater() {
        this.init();
    }

    ContactUpdater.prototype.init = function() {
        Utils.log('info', 'Initializing Contact Updater...');

        try {
            this.updateAllContacts();
            Utils.log('info', 'Contact Updater initialized successfully');
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
            '.portal-btn, .mobile-portal-btn, .footer-portal-btn'
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
            Utils.log('info', 'Initializing 805 LifeGuard Luxury Application...');

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

                // Initialize animations after a short delay to prevent conflicts
                setTimeout(function() {
                    self.animations = new AnimationController();
                }, 100);

                self.isInitialized = true;

                Utils.log('info', '805 LifeGuard Luxury Application initialized successfully');

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
                version: '6.0',
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
    };

    LuxuryApp.prototype.initializeFallback = function() {
        Utils.log('info', 'Initializing fallback functionality...');

        // Basic mobile navigation
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileNav = document.getElementById('mobileNav');

        if (mobileToggle && mobileNav) {
            mobileToggle.addEventListener('click', function(e) {
                e.preventDefault();
                mobileToggle.classList.toggle('active');
                mobileNav.classList.toggle('active');
                document.body.classList.toggle('nav-open');
            });

            const mobileClose = document.getElementById('mobileNavClose');
            if (mobileClose) {
                mobileClose.addEventListener('click', function(e) {
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
        smoothLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
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
    };

    // === PUBLIC API METHODS ===

    LuxuryApp.prototype.getVersion = function() {
        return '6.0';
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

    LuxuryApp.prototype.getWebPSupport = function() {
        return this.webpService.isSupported;
    };

    LuxuryApp.prototype.getCurrentBreakpoint = function() {
        return Utils.getCurrentBreakpoint();
    };

    LuxuryApp.prototype.destroy = function() {
        Utils.log('info', 'Destroying Luxury Application...');

        if (this.carousel) this.carousel.destroy();
        if (this.navigation) this.navigation.destroy();
        if (this.animations) this.animations.destroy();
        if (this.forms) this.forms.destroy();
        if (this.smoothScroll) this.smoothScroll.destroy();

        this.isInitialized = false;

        Utils.log('info', 'Luxury Application destroyed');
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

    // Development/debug mode
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.indexOf('805lifeguard.com') !== -1 ||
        window.location.search.indexOf('debug=true') !== -1) {
        
        window.Utils = Utils;
        Utils.log('info', 'Debug mode active - Enhanced debugging available');
        Utils.log('info', 'Access app instance via window.app');
        Utils.log('info', 'Access utilities via window.Utils');
    }

})();
