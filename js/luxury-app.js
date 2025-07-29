/**
 * 805 LifeGuard - Luxury Country Club JavaScript
 * Version: 6.0 - Clean Production Architecture
 * Enterprise-level functionality with unified responsive behavior
 */

(function() {
    'use strict';
    
    // === CONFIGURATION ===
    const CONFIG = {
        PHONE_NUMBER: '(805) 367-6432',
        EMAIL: 'concierge@805lifeguard.com',
        PORTAL_DOMAINS: {
            CLIENT: 'https://client.805companies.com',
            ADMIN: 'https://admin.805companies.com',
            STAFF: 'https://staff.805companies.com'
        },
        CAROUSEL: {
            AUTO_PLAY_INTERVAL: 6000, // 6 seconds
            TRANSITION_DURATION: 1500, // 1.5 seconds
            PAUSE_ON_HOVER: true,
            PAUSE_ON_FOCUS: true
        },
        WEBP_SUPPORT: null, // Will be detected on load
        FONTAWESOME_LOADED: false // Will be detected on load
    };
    
    // === UTILITIES ===
    const utils = {
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        isMobile: function() {
            return window.innerWidth <= 768;
        },

        isTablet: function() {
            return window.innerWidth > 768 && window.innerWidth <= 1024;
        },

        preloadImage: function(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        },

        // Font Awesome Detection
        detectFontAwesome: function() {
            return new Promise((resolve) => {
                // Check if Font Awesome CSS is loaded
                const link = document.querySelector('link[href*="font-awesome"]');
                if (!link) {
                    CONFIG.FONTAWESOME_LOADED = false;
                    document.body.classList.add('no-fontawesome');
                    resolve(false);
                    return;
                }

                // Create a test element with Font Awesome icon
                const testElement = document.createElement('i');
                testElement.className = 'fas fa-home';
                testElement.style.position = 'absolute';
                testElement.style.left = '-9999px';
                testElement.style.fontSize = '16px';
                document.body.appendChild(testElement);

                // Check if the icon loaded properly
                setTimeout(() => {
                    const computedStyle = window.getComputedStyle(testElement, '::before');
                    const content = computedStyle.getPropertyValue('content');
                    
                    if (content && content !== 'none' && content !== '""') {
                        CONFIG.FONTAWESOME_LOADED = true;
                        document.body.classList.remove('no-fontawesome');
                        console.log('✅ Font Awesome loaded successfully');
                    } else {
                        CONFIG.FONTAWESOME_LOADED = false;
                        document.body.classList.add('no-fontawesome');
                        console.warn('⚠️ Font Awesome not loaded, using fallback icons');
                    }
                    
                    document.body.removeChild(testElement);
                    resolve(CONFIG.FONTAWESOME_LOADED);
                }, 100);
            });
        },

        // WebP Support Detection
        detectWebPSupport: function() {
            return new Promise((resolve) => {
                const webP = new Image();
                webP.onload = webP.onerror = function () {
                    const isSupported = webP.height === 2;
                    CONFIG.WEBP_SUPPORT = isSupported;
                    
                    // Add CSS class to document for WebP support
                    if (isSupported) {
                        document.documentElement.classList.add('webp');
                        document.documentElement.classList.remove('no-webp');
                    } else {
                        document.documentElement.classList.add('no-webp');
                        document.documentElement.classList.remove('webp');
                    }
                    
                    resolve(isSupported);
                };
                webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
            });
        },

        // Get optimized image path (WebP or fallback)
        getOptimizedImagePath: function(basePath) {
            if (CONFIG.WEBP_SUPPORT && basePath) {
                return basePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            }
            return basePath;
        },

        // Set background image with WebP support
        setBackgroundImage: function(element, imagePath) {
            if (!element || !imagePath) return;
            
            const optimizedPath = this.getOptimizedImagePath(imagePath);
            
            if (CONFIG.WEBP_SUPPORT && optimizedPath !== imagePath) {
                // Try WebP first
                const testImg = new Image();
                testImg.onload = () => {
                    element.style.backgroundImage = `url(${optimizedPath})`;
                };
                testImg.onerror = () => {
                    // Fallback to original format
                    element.style.backgroundImage = `url(${imagePath})`;
                };
                testImg.src = optimizedPath;
            } else {
                element.style.backgroundImage = `url(${imagePath})`;
            }
        },

        // Setup WebP backgrounds
        setupWebPBackgrounds: function() {
            // Add WebP classes to background elements if WebP is supported
            if (CONFIG.WEBP_SUPPORT) {
                const backgroundElements = [
                    '.about-hero-background',
                    '.services-hero-background', 
                    '.values-background',
                    '.mission-background',
                    '.credentials-background',
                    '.services-cta-background'
                ];
                
                backgroundElements.forEach(selector => {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.classList.add('webp-bg');
                    }
                });
            }
        }
    };
    
    // === ELEGANT CAROUSEL CONTROLLER ===
    class ElegantCarousel {
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
            
            this.init();
        }
        
        async init() {
            if (this.totalSlides === 0) return;
            
            console.log('🎠 Initializing Elegant Carousel...');
            
            // Preload images
            await this.preloadImages();
            
            // Set up responsive backgrounds
            this.setupResponsiveBackgrounds();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup intersection observer for auto-play
            this.setupIntersectionObserver();
            
            // Start auto-play
            this.startAutoPlay();
            
            // Handle window resize
            this.handleResize();
            
            console.log('✅ Elegant Carousel initialized successfully');
        }
        
        async preloadImages() {
            const imagePromises = [];
            
            this.slides.forEach(slide => {
                const desktopSrc = slide.dataset.bgDesktop;
                const mobileSrc = slide.dataset.bgMobile;
                
                if (desktopSrc) {
                    imagePromises.push(utils.preloadImage(desktopSrc));
                }
                if (mobileSrc) {
                    imagePromises.push(utils.preloadImage(mobileSrc));
                }
            });
            
            try {
                await Promise.allSettled(imagePromises);
                console.log('🖼️ Carousel images preloaded');
            } catch (error) {
                console.warn('⚠️ Some carousel images failed to preload:', error);
            }
        }
        
        setupResponsiveBackgrounds() {
            this.slides.forEach(slide => {
                this.updateSlideBackground(slide);
            });
        }
        
        updateSlideBackground(slide) {
            const desktopSrc = slide.dataset.bgDesktop;
            const mobileSrc = slide.dataset.bgMobile;
            
            let selectedSrc;
            if (utils.isMobile() && mobileSrc) {
                selectedSrc = mobileSrc;
            } else if (desktopSrc) {
                selectedSrc = desktopSrc;
            }
            
            if (selectedSrc) {
                utils.setBackgroundImage(slide, selectedSrc);
            }
        }
        
        setupEventListeners() {
            // Navigation buttons
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prevSlide());
            }
            
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.nextSlide());
            }
            
            // Indicators
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => this.goToSlide(index));
                
                // Keyboard navigation
                indicator.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.goToSlide(index);
                    }
                });
            });
            
            // Pause on hover
            if (CONFIG.CAROUSEL.PAUSE_ON_HOVER) {
                this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
                this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
            }
            
            // Pause on focus
            if (CONFIG.CAROUSEL.PAUSE_ON_FOCUS) {
                this.container.addEventListener('focusin', () => this.pauseAutoPlay());
                this.container.addEventListener('focusout', () => this.resumeAutoPlay());
            }
            
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (!this.isInViewport()) return;
                
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
            });
            
            // Touch/swipe support
            this.setupTouchEvents();
            
            // Window resize
            window.addEventListener('resize', utils.debounce(() => {
                this.handleResize();
            }, 250));
            
            // Visibility change (pause when tab not active)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseAutoPlay();
                } else {
                    this.resumeAutoPlay();
                }
            });
        }
        
        setupTouchEvents() {
            let startX = 0;
            let startY = 0;
            let isDragging = false;
            
            this.container.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isDragging = true;
                this.pauseAutoPlay();
            }, { passive: true });
            
            this.container.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                
                const deltaX = Math.abs(e.touches[0].clientX - startX);
                const deltaY = Math.abs(e.touches[0].clientY - startY);
                
                // Prevent vertical scroll when swiping horizontally
                if (deltaX > deltaY) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            this.container.addEventListener('touchend', (e) => {
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
            }, { passive: true });
        }
        
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
                threshold: 0.5
            });
            
            observer.observe(this.container);
        }
        
        handleResize() {
            // Update responsive backgrounds
            this.setupResponsiveBackgrounds();
        }
        
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
        
        nextSlide() {
            const nextIndex = (this.currentSlide + 1) % this.totalSlides;
            this.goToSlide(nextIndex, 'next');
        }
        
        prevSlide() {
            const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
            this.goToSlide(prevIndex, 'prev');
        }
        
        startAutoPlay() {
            if (!this.isPlaying || this.totalSlides <= 1) return;
            
            this.autoPlayTimer = setInterval(() => {
                if (!this.isPaused && !this.isTransitioning) {
                    this.nextSlide();
                }
            }, CONFIG.CAROUSEL.AUTO_PLAY_INTERVAL);
        }
        
        stopAutoPlay() {
            if (this.autoPlayTimer) {
                clearInterval(this.autoPlayTimer);
                this.autoPlayTimer = null;
            }
        }
        
        pauseAutoPlay() {
            this.isPaused = true;
        }
        
        resumeAutoPlay() {
            if (this.isInViewport() && !document.hidden) {
                this.isPaused = false;
            }
        }
        
        toggleAutoPlay() {
            if (this.isPlaying) {
                this.stopAutoPlay();
                this.isPlaying = false;
            } else {
                this.startAutoPlay();
                this.isPlaying = true;
            }
        }
        
        isInViewport() {
            const rect = this.container.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        }
        
        updateAriaLabels() {
            this.slides.forEach((slide, i) => {
                slide.setAttribute('aria-hidden', i !== this.currentSlide);
            });
        }
        
        destroy() {
            this.stopAutoPlay();
            console.log('🎠 Carousel destroyed');
        }
    }
    
    // === ENTERPRISE NAVIGATION CONTROLLER ===
    class EnterpriseNavigationController {
        constructor() {
            this.header = document.getElementById('header');
            this.mobileToggle = document.getElementById('mobileToggle');
            this.mobileNav = document.getElementById('mobileNav');
            this.mobileNavClose = document.getElementById('mobileNavClose');
            this.mobileLogo = document.querySelector('.mobile-logo');
            this.body = document.body;
            this.isOpen = false;
            this.scrollPosition = 0;
            this.touchStartY = 0;
            
            this.init();
        }
        
        init() {
            console.log('📱 Initializing Enterprise Navigation Controller...');
            this.setupEventListeners();
            this.setupScrollEffects();
            this.updateActiveLinks();
            this.updatePortalLinks();
            this.preventBodyScroll();
            console.log('✅ Enterprise Navigation Controller initialized');
        }
        
        setupEventListeners() {
            // Mobile toggle click
            if (this.mobileToggle) {
                this.mobileToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📱 Mobile toggle clicked');
                    this.toggleMobileNav();
                });
            }
            
            // Mobile nav close button
            if (this.mobileNavClose) {
                this.mobileNavClose.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📱 Mobile close clicked');
                    this.closeMobileNav();
                });
            }
            
            // Mobile logo click (navigate to homepage with elegant transition)
            if (this.mobileLogo) {
                this.mobileLogo.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('📱 Mobile logo clicked - navigating to homepage');
                    
                    // Add visual feedback
                    this.mobileLogo.style.transform = 'translateY(-4px) scale(0.98)';
                    
                    // Close mobile nav with elegant timing
                    setTimeout(() => {
                        this.closeMobileNav();
                    }, 150);
                    
                    // Navigate after animation completes
                    setTimeout(() => {
                        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                            window.location.href = '/';
                        }
                    }, 400);
                    
                    // Reset transform
                    setTimeout(() => {
                        this.mobileLogo.style.transform = '';
                    }, 300);
                });
            }
            
            // Mobile nav link clicks
            if (this.mobileNav) {
                const mobileLinks = this.mobileNav.querySelectorAll('.mobile-nav-link');
                console.log(`📱 Found ${mobileLinks.length} mobile nav links`);
                mobileLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        console.log('📱 Mobile nav link clicked');
                        // Allow navigation but close menu
                        setTimeout(() => {
                            this.closeMobileNav();
                        }, 100);
                    });
                });
            }
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (this.isOpen && 
                    this.mobileNav && 
                    this.mobileToggle &&
                    !this.mobileNav.contains(e.target) && 
                    !this.mobileToggle.contains(e.target)) {
                    console.log('📱 Outside click detected, closing mobile nav');
                    this.closeMobileNav();
                }
            });
            
            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    console.log('📱 Escape key pressed, closing mobile nav');
                    this.closeMobileNav();
                }
            });
            
            // Handle resize
            window.addEventListener('resize', utils.debounce(() => {
                if (window.innerWidth > 768 && this.isOpen) {
                    console.log('📱 Window resized to desktop, closing mobile nav');
                    this.closeMobileNav();
                }
            }, 250));

            // Touch events for better mobile handling
            this.setupMobileTouchEvents();
        }

        setupMobileTouchEvents() {
            if (!this.mobileNav) return;

            // Prevent background scroll when mobile nav is open
            this.mobileNav.addEventListener('touchstart', (e) => {
                this.touchStartY = e.touches[0].clientY;
            }, { passive: true });

            this.mobileNav.addEventListener('touchmove', (e) => {
                if (!this.isOpen) return;

                const touchY = e.touches[0].clientY;
                const touchDelta = this.touchStartY - touchY;
                
                // Check if we're at the top or bottom of the mobile nav content
                const navContent = this.mobileNav.querySelector('.mobile-nav-content');
                const isAtTop = navContent.scrollTop === 0;
                const isAtBottom = navContent.scrollTop + navContent.clientHeight >= navContent.scrollHeight;

                // Prevent overscroll
                if ((isAtTop && touchDelta < 0) || (isAtBottom && touchDelta > 0)) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        toggleMobileNav() {
            console.log(`📱 Toggling mobile nav, current state: ${this.isOpen ? 'open' : 'closed'}`);
            if (this.isOpen) {
                this.closeMobileNav();
            } else {
                this.openMobileNav();
            }
        }
        
        openMobileNav() {
            if (!this.mobileToggle || !this.mobileNav) {
                console.error('❌ Cannot open mobile nav - elements not found');
                return;
            }
            
            console.log('📱 Opening elegant mobile nav...');
            this.isOpen = true;
            this.scrollPosition = window.pageYOffset;
            
            // Add classes with timing for smooth animation
            this.mobileToggle.classList.add('active');
            this.mobileToggle.setAttribute('aria-expanded', 'true');
            this.body.classList.add('nav-open');
            
            // Enhanced body scroll lock
            this.body.style.position = 'fixed';
            this.body.style.top = `-${this.scrollPosition}px`;
            this.body.style.width = '100%';
            this.body.style.height = '100%';
            this.body.style.overflow = 'hidden';
            this.body.style.touchAction = 'none'; // Prevent iOS scroll bounce
            
            // Add mobile nav classes after a tiny delay for smoother transition
            requestAnimationFrame(() => {
                this.mobileNav.classList.add('active');
                this.mobileNav.setAttribute('aria-hidden', 'false');
            });
            
            // Enhanced focus management with proper timing
            setTimeout(() => {
                const mobileLogo = this.mobileNav.querySelector('.mobile-logo');
                if (mobileLogo) {
                    mobileLogo.focus();
                } else {
                    const firstLink = this.mobileNav.querySelector('.mobile-nav-link');
                    if (firstLink) {
                        firstLink.focus();
                    }
                }
            }, 500); // Wait for animation to complete
            
            console.log('✅ Elegant mobile nav opened');
        }
        
        closeMobileNav() {
            if (!this.mobileToggle || !this.mobileNav) {
                console.error('❌ Cannot close mobile nav - elements not found');
                return;
            }
            
            console.log('📱 Closing elegant mobile nav...');
            this.isOpen = false;
            
            // Remove mobile nav classes first for smooth transition
            this.mobileToggle.classList.remove('active');
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            this.mobileNav.classList.remove('active');
            this.mobileNav.setAttribute('aria-hidden', 'true');
            
            // Restore body scroll after animation completes
            setTimeout(() => {
                this.body.classList.remove('nav-open');
                this.body.style.position = '';
                this.body.style.top = '';
                this.body.style.width = '';
                this.body.style.height = '';
                this.body.style.overflow = '';
                this.body.style.touchAction = '';
                
                // Restore scroll position smoothly
                window.scrollTo({
                    top: this.scrollPosition,
                    behavior: 'instant'
                });
            }, 100); // Short delay for smooth transition
            
            console.log('✅ Elegant mobile nav closed');
        }

        preventBodyScroll() {
            // Prevent iOS bounce scroll when nav is open
            document.addEventListener('touchmove', (e) => {
                if (this.isOpen) {
                    // Allow scrolling within the mobile nav, prevent everywhere else
                    if (!this.mobileNav.contains(e.target)) {
                        e.preventDefault();
                    }
                }
            }, { passive: false });
        }
        
        setupScrollEffects() {
            if (!this.header) return;
            
            const handleScroll = utils.throttle(() => {
                const scrollY = window.pageYOffset;
                
                if (scrollY > 50) {
                    this.header.classList.add('scrolled');
                } else {
                    this.header.classList.remove('scrolled');
                }
            }, 10);
            
            window.addEventListener('scroll', handleScroll, { passive: true });
        }
        
        updateActiveLinks() {
            const currentPath = window.location.pathname;
            const currentPage = currentPath.split('/').pop() || 'index.html';
            
            // Desktop nav links
            const desktopLinks = document.querySelectorAll('.nav-link');
            // Mobile nav links
            const mobileLinks = document.querySelectorAll('.mobile-nav-link');
            
            [...desktopLinks, ...mobileLinks].forEach(link => {
                const href = link.getAttribute('href');
                if (href) {
                    if ((href === '/' && (currentPage === '' || currentPage === 'index.html')) ||
                        (href !== '/' && href.includes(currentPage.replace('.html', '')))) {
                        link.classList.add('active');
                    }
                }
            });
        }
        
        updatePortalLinks() {
            // Update all portal links
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
                
                // Ensure target="_blank" for portal links
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });
        }

        // Public API methods
        getMobileNavState() {
            return this.isOpen;
        }

        forceCloseMobileNav() {
            if (this.isOpen) {
                this.closeMobileNav();
            }
        }
    }
    
    // === ANIMATION CONTROLLER ===
    class AnimationController {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupScrollAnimations();
            this.setupHoverEffects();
            this.setupHeroAnimations();
        }
        
        setupScrollAnimations() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in-up');
                    }
                });
            }, observerOptions);
            
            // Observe elements
            const elements = document.querySelectorAll(
                '.service-card, .testimonial-card, .team-member, .coverage-card, .feature-item'
            );
            
            elements.forEach(el => observer.observe(el));
        }
        
        setupHoverEffects() {
            // Service cards
            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-8px)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
            
            // Buttons
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                });
                
                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        }
        
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
                }, 500 + (index * 150)); // Delay to allow carousel to load
            });
        }
    }
    
    // === FORM HANDLER ===
    class FormHandler {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupFormValidation();
            this.setupPhoneFormatting();
            this.handleURLParameters();
        }
        
        setupFormValidation() {
            const forms = document.querySelectorAll('form');
            
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    if (!this.validateForm(form)) {
                        e.preventDefault();
                        this.showFormError('Please fill in all required fields correctly.');
                    }
                });
            });
        }
        
        validateForm(form) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#DC2626';
                } else {
                    field.style.borderColor = '';
                }
            });
            
            return isValid;
        }
        
        setupPhoneFormatting() {
            const phoneInputs = document.querySelectorAll('input[type="tel"]');
            
            phoneInputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    
                    if (value.length >= 6) {
                        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                    } else if (value.length >= 3) {
                        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
                    }
                    
                    e.target.value = value;
                });
            });
        }
        
        handleURLParameters() {
            const urlParams = new URLSearchParams(window.location.search);
            const service = urlParams.get('service');
            
            if (service) {
                // Handle service selection if on contact page
                const serviceCheckbox = document.querySelector(`input[value*="${service}"]`);
                if (serviceCheckbox) {
                    serviceCheckbox.checked = true;
                    serviceCheckbox.closest('.service-option')?.classList.add('selected');
                }
            }
        }
        
        showFormError(message) {
            // Create and show a more elegant error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error-message';
            errorDiv.style.cssText = `
                position: fixed;
                top: 120px;
                right: 20px;
                background: #DC2626;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: var(--font-sans);
                font-size: 0.875rem;
                font-weight: 500;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            `;
            errorDiv.textContent = message;
            
            document.body.appendChild(errorDiv);
            
            // Animate in
            setTimeout(() => {
                errorDiv.style.opacity = '1';
                errorDiv.style.transform = 'translateX(0)';
            }, 100);
            
            // Remove after 5 seconds
            setTimeout(() => {
                errorDiv.style.opacity = '0';
                errorDiv.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    document.body.removeChild(errorDiv);
                }, 300);
            }, 5000);
        }
    }
    
    // === SMOOTH SCROLL ===
    class SmoothScroll {
        constructor() {
            this.init();
        }
        
        init() {
            const scrollLinks = document.querySelectorAll('a[href^="#"]');
            
            scrollLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const targetId = link.getAttribute('href');
                    const target = document.querySelector(targetId);
                    
                    if (target) {
                        e.preventDefault();
                        this.scrollTo(target);
                    }
                });
            });
        }
        
        scrollTo(element) {
            const headerHeight = document.getElementById('header')?.offsetHeight || 100;
            const targetPosition = element.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // === CONTACT UPDATER ===
    class ContactUpdater {
        constructor() {
            this.updateAllContacts();
        }
        
        updateAllContacts() {
            // Update phone numbers
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
            
            // Update email addresses
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
            
            // Update portal links
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
            });
        }
    }
    
    // === MAIN APP CLASS ===
    class LuxuryCountryClubApp {
        constructor() {
            this.navigation = null;
            this.carousel = null;
            this.animations = null;
            this.forms = null;
            this.smoothScroll = null;
            this.contactUpdater = null;
            
            this.init();
        }
        
        init() {
            // Wait for DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        }
        
        async initializeApp() {
            try {
                console.log('🏊‍♂️ Initializing 805 LifeGuard Luxury App v6.0...');
                
                // First detect Font Awesome and WebP support
                await Promise.all([
                    utils.detectFontAwesome(),
                    utils.detectWebPSupport()
                ]);
                
                console.log(`🖼️ WebP Support: ${CONFIG.WEBP_SUPPORT ? 'Enabled' : 'Disabled'}`);
                console.log(`🔤 Font Awesome: ${CONFIG.FONTAWESOME_LOADED ? 'Loaded' : 'Using Fallbacks'}`);
                
                // Apply WebP classes to background elements
                utils.setupWebPBackgrounds();
                
                // Initialize core components
                this.navigation = new EnterpriseNavigationController();
                this.forms = new FormHandler();
                this.smoothScroll = new SmoothScroll();
                this.contactUpdater = new ContactUpdater();
                
                // Initialize carousel if hero carousel exists
                const heroCarousel = document.getElementById('heroCarousel');
                if (heroCarousel) {
                    this.carousel = new ElegantCarousel(heroCarousel);
                }
                
                // Initialize animations (after carousel to prevent conflicts)
                setTimeout(() => {
                    this.animations = new AnimationController();
                }, 100);
                
                console.log('✅ 805 LifeGuard Luxury App v6.0 initialized successfully');
                
                // Dispatch ready event
                window.dispatchEvent(new CustomEvent('luxuryAppReady', {
                    detail: { 
                        app: this,
                        hasCarousel: !!this.carousel,
                        webpSupport: CONFIG.WEBP_SUPPORT,
                        fontAwesome: CONFIG.FONTAWESOME_LOADED,
                        version: '6.0'
                    }
                }));
                
            } catch (error) {
                console.error('❌ Error initializing app:', error);
                this.fallbackInit();
            }
        }
        
        fallbackInit() {
            console.log('🔄 Initializing fallback functionality...');
            
            // Basic mobile toggle
            const mobileToggle = document.getElementById('mobileToggle');
            const mobileNav = document.getElementById('mobileNav');
            
            if (mobileToggle && mobileNav) {
                mobileToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('📱 Fallback mobile toggle clicked');
                    mobileToggle.classList.toggle('active');
                    mobileNav.classList.toggle('active');
                    document.body.classList.toggle('nav-open');
                });
                
                // Close button
                const mobileClose = document.getElementById('mobileNavClose');
                if (mobileClose) {
                    mobileClose.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('📱 Fallback mobile close clicked');
                        mobileToggle.classList.remove('active');
                        mobileNav.classList.remove('active');
                        document.body.classList.remove('nav-open');
                    });
                }
                
                console.log('✅ Fallback mobile navigation initialized');
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
        }
        
        // Public API methods
        getVersion() {
            return '6.0';
        }
        
        closeMobileNav() {
            if (this.navigation) {
                this.navigation.forceCloseMobileNav();
            }
        }
        
        getMobileNavState() {
            return this.navigation ? this.navigation.getMobileNavState() : false;
        }
        
        getCarousel() {
            return this.carousel;
        }
        
        pauseCarousel() {
            if (this.carousel) {
                this.carousel.pauseAutoPlay();
            }
        }
        
        resumeCarousel() {
            if (this.carousel) {
                this.carousel.resumeAutoPlay();
            }
        }
        
        getConfig() {
            return { ...CONFIG };
        }
    }
    
    // === INITIALIZE APP ===
    window.LuxuryCountryClubApp = LuxuryCountryClubApp;
    const app = new LuxuryCountryClubApp();
    
    // Export for debugging
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('805lifeguard.com') ||
        window.location.search.includes('debug=true')) {
        window.app = app;
        console.log('🔧 Debug mode active - app available as window.app');
        console.log('🎠 Carousel available as window.app.getCarousel()');
        console.log('📱 Mobile Nav State: window.app.getMobileNavState()');
        console.log('🔧 Close Mobile Nav: window.app.closeMobileNav()');
    }
    
    // === ERROR HANDLING ===
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });
    
})();
