/**
 * 805 LifeGuard - Luxury Country Club JavaScript
 * Version: 6.0 - Production Ready Clean Architecture
 * Enterprise-level functionality with unified mobile navigation and robust Font Awesome handling
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
            AUTO_PLAY_INTERVAL: 6000,
            TRANSITION_DURATION: 1500,
            PAUSE_ON_HOVER: true,
            PAUSE_ON_FOCUS: true
        },
        FONT_AWESOME: {
            CHECK_TIMEOUT: 3000,
            CHECK_INTERVAL: 100,
            FALLBACK_CLASS: 'no-fa'
        }
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

        preloadImage: function(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        }
    };
    
    // === FONT AWESOME MANAGER ===
    class FontAwesomeManager {
        constructor() {
            this.isLoaded = false;
            this.isChecking = false;
            this.checkAttempts = 0;
            this.maxAttempts = CONFIG.FONT_AWESOME.CHECK_TIMEOUT / CONFIG.FONT_AWESOME.CHECK_INTERVAL;
        }
        
        init() {
            console.log('🔤 Initializing Font Awesome Manager...');
            this.detectFontAwesome();
        }
        
        detectFontAwesome() {
            if (this.isChecking) return;
            this.isChecking = true;
            
            const checkFontAwesome = () => {
                this.checkAttempts++;
                
                // Method 1: Check if Font Awesome CSS is loaded
                const faLoaded = this.isFontAwesomeStylesLoaded();
                
                // Method 2: Check if Font Awesome icons render properly
                const faRendered = this.isFontAwesomeRendered();
                
                if (faLoaded && faRendered) {
                    this.onFontAwesomeLoaded();
                    return;
                }
                
                if (this.checkAttempts >= this.maxAttempts) {
                    this.onFontAwesomeFailed();
                    return;
                }
                
                setTimeout(checkFontAwesome, CONFIG.FONT_AWESOME.CHECK_INTERVAL);
            };
            
            // Start checking immediately and continue until loaded or timeout
            checkFontAwesome();
        }
        
        isFontAwesomeStylesLoaded() {
            // Check if Font Awesome stylesheets are loaded
            const stylesheets = Array.from(document.styleSheets);
            return stylesheets.some(sheet => {
                try {
                    const href = sheet.href;
                    return href && (
                        href.includes('font-awesome') || 
                        href.includes('fontawesome') ||
                        href.includes('fa-')
                    );
                } catch (e) {
                    return false;
                }
            });
        }
        
        isFontAwesomeRendered() {
            // Create a temporary element to test icon rendering
            const testElement = document.createElement('div');
            testElement.innerHTML = '<i class="fas fa-shield-alt" style="position: absolute; visibility: hidden;"></i>';
            document.body.appendChild(testElement);
            
            const icon = testElement.querySelector('i');
            const computed = window.getComputedStyle(icon, '::before');
            
            // Check if the icon has Font Awesome properties
            const hasFA = computed.fontFamily && (
                computed.fontFamily.includes('Font Awesome') ||
                computed.fontFamily.includes('FontAwesome') ||
                computed.content !== 'none'
            );
            
            document.body.removeChild(testElement);
            return hasFA;
        }
        
        onFontAwesomeLoaded() {
            console.log('✅ Font Awesome loaded successfully');
            this.isLoaded = true;
            this.isChecking = false;
            
            // Remove fallback class if present
            document.documentElement.classList.remove(CONFIG.FONT_AWESOME.FALLBACK_CLASS);
            
            // Add loaded class for styling
            document.documentElement.classList.add('fa-loaded');
            
            // Mark all icons as loaded
            const icons = document.querySelectorAll('i[class*="fa-"]');
            icons.forEach(icon => {
                icon.classList.remove('fa-loading');
                icon.classList.add('fa-loaded');
            });
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('fontAwesomeLoaded'));
        }
        
        onFontAwesomeFailed() {
            console.warn('⚠️ Font Awesome failed to load, using fallbacks');
            this.isLoaded = false;
            this.isChecking = false;
            
            // Add fallback class to enable emoji fallbacks
            document.documentElement.classList.add(CONFIG.FONT_AWESOME.FALLBACK_CLASS);
            
            // Mark all icons as failed (they'll show fallbacks via CSS)
            const icons = document.querySelectorAll('i[class*="fa-"]');
            icons.forEach(icon => {
                icon.classList.remove('fa-loading');
                icon.classList.add('fa-fallback');
            });
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('fontAwesomeFailed'));
        }
        
        // Public methods
        isReady() {
            return this.isLoaded;
        }
        
        refresh() {
            this.checkAttempts = 0;
            this.isChecking = false;
            this.detectFontAwesome();
        }
    }
    
    // === ENTERPRISE MOBILE NAVIGATION ===
    class EnterpriseNavigation {
        constructor() {
            this.header = document.getElementById('header');
            this.mobileToggle = document.getElementById('mobileToggle');
            this.mobileNav = document.getElementById('mobileNav');
            this.mobileNavClose = document.getElementById('mobileNavClose');
            this.mobileLogoLink = null; // Will be set dynamically
            this.body = document.body;
            this.isOpen = false;
            this.scrollPosition = 0;
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.isInitialized = false;
        }
        
        init() {
            console.log('📱 Initializing Enterprise Navigation...');
            
            if (!this.validateElements()) {
                console.error('❌ Navigation elements not found, using fallback');
                this.initializeFallback();
                return;
            }
            
            this.setupMobileLogo();
            this.setupEventListeners();
            this.setupScrollEffects();
            this.updateActiveLinks();
            this.updatePortalLinks();
            this.setupTouchGestures();
            this.setupKeyboardNavigation();
            this.setupAccessibility();
            
            this.isInitialized = true;
            console.log('✅ Enterprise Navigation initialized successfully');
        }
        
        validateElements() {
            const required = [this.mobileToggle, this.mobileNav];
            return required.every(element => element !== null);
        }
        
        setupMobileLogo() {
            // Make mobile logo clickable
            const mobileLogos = this.mobileNav.querySelectorAll('.mobile-logo');
            mobileLogos.forEach(logo => {
                if (!logo.getAttribute('href')) {
                    logo.style.cursor = 'pointer';
                    logo.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.closeMobileNav();
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 100);
                    });
                }
            });
        }
        
        setupEventListeners() {
            // Mobile toggle click
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileNav();
            });
            
            // Mobile nav close button
            if (this.mobileNavClose) {
                this.mobileNavClose.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeMobileNav();
                });
            }
            
            // Mobile nav link clicks
            const mobileLinks = this.mobileNav.querySelectorAll('.mobile-nav-link, .mobile-consultation-btn, .mobile-contact-btn');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    setTimeout(() => this.closeMobileNav(), 100);
                });
            });
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (this.isOpen && 
                    !this.mobileNav.contains(e.target) && 
                    !this.mobileToggle.contains(e.target)) {
                    this.closeMobileNav();
                }
            });
            
            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeMobileNav();
                }
            });
            
            // Handle resize
            window.addEventListener('resize', utils.debounce(() => {
                if (window.innerWidth > 768 && this.isOpen) {
                    this.closeMobileNav();
                }
            }, 250));
            
            // Handle orientation change
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    if (this.isOpen) {
                        this.adjustMobileNavHeight();
                    }
                }, 100);
            });
            
            // Handle visibility change (tab switching)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && this.isOpen) {
                    this.closeMobileNav();
                }
            });
        }
        
        setupTouchGestures() {
            if (!this.mobileNav) return;
            
            this.mobileNav.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            }, { passive: true });
            
            this.mobileNav.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const deltaX = this.touchStartX - touchEndX;
                const deltaY = Math.abs(this.touchStartY - touchEndY);
                
                // Detect horizontal swipe left (close navigation)
                if (deltaX > 50 && deltaY < 100) {
                    this.closeMobileNav();
                }
            }, { passive: true });
        }
        
        setupKeyboardNavigation() {
            // Tab trapping within mobile nav
            if (!this.mobileNav) return;
            
            const focusableElements = this.mobileNav.querySelectorAll(
                'a, button, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) return;
            
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            this.mobileNav.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;
                
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            e.preventDefault();
                            lastFocusable.focus();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            e.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                }
            });
        }
        
        setupAccessibility() {
            // Set initial ARIA attributes
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            this.mobileToggle.setAttribute('aria-controls', 'mobileNav');
            this.mobileNav.setAttribute('aria-hidden', 'true');
            this.mobileNav.setAttribute('role', 'dialog');
            this.mobileNav.setAttribute('aria-label', 'Mobile navigation menu');
        }
        
        toggleMobileNav() {
            if (this.isOpen) {
                this.closeMobileNav();
            } else {
                this.openMobileNav();
            }
        }
        
        openMobileNav() {
            console.log('📱 Opening mobile navigation...');
            this.isOpen = true;
            this.scrollPosition = window.pageYOffset;
            
            // Update classes and attributes
            this.mobileToggle.classList.add('active');
            this.mobileToggle.setAttribute('aria-expanded', 'true');
            this.mobileNav.classList.add('active');
            this.mobileNav.setAttribute('aria-hidden', 'false');
            this.body.classList.add('nav-open');
            
            // Lock body scroll
            this.lockBodyScroll();
            
            // Adjust height for mobile browsers
            this.adjustMobileNavHeight();
            
            // Focus management
            setTimeout(() => {
                const firstLink = this.mobileNav.querySelector('.mobile-nav-link, .mobile-logo');
                if (firstLink) {
                    firstLink.focus();
                }
            }, 100);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('mobileNavOpened'));
        }
        
        closeMobileNav() {
            console.log('📱 Closing mobile navigation...');
            this.isOpen = false;
            
            // Update classes and attributes
            this.mobileToggle.classList.remove('active');
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            this.mobileNav.classList.remove('active');
            this.mobileNav.setAttribute('aria-hidden', 'true');
            this.body.classList.remove('nav-open');
            
            // Restore body scroll
            this.unlockBodyScroll();
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('mobileNavClosed'));
        }
        
        lockBodyScroll() {
            this.body.style.position = 'fixed';
            this.body.style.top = `-${this.scrollPosition}px`;
            this.body.style.width = '100%';
            this.body.style.overflow = 'hidden';
        }
        
        unlockBodyScroll() {
            this.body.style.position = '';
            this.body.style.top = '';
            this.body.style.width = '';
            this.body.style.overflow = '';
            
            // Restore scroll position
            window.scrollTo(0, this.scrollPosition);
        }
        
        adjustMobileNavHeight() {
            if (!this.mobileNav) return;
            
            // Handle different viewport height units for mobile browsers
            const vh = window.innerHeight * 0.01;
            this.mobileNav.style.setProperty('--vh', `${vh}px`);
            
            // Force height recalculation
            this.mobileNav.style.height = `${window.innerHeight}px`;
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
            
            // Desktop and mobile nav links
            const allLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
            
            allLinks.forEach(link => {
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
        
        initializeFallback() {
            console.log('🔄 Initializing fallback navigation...');
            
            // Basic mobile toggle functionality
            if (this.mobileToggle && this.mobileNav) {
                this.mobileToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.mobileToggle.classList.toggle('active');
                    this.mobileNav.classList.toggle('active');
                    this.body.classList.toggle('nav-open');
                });
            }
            
            // Basic scroll effect
            if (this.header) {
                window.addEventListener('scroll', () => {
                    if (window.pageYOffset > 50) {
                        this.header.classList.add('scrolled');
                    } else {
                        this.header.classList.remove('scrolled');
                    }
                }, { passive: true });
            }
            
            console.log('✅ Fallback navigation initialized');
        }
        
        // Public API
        open() {
            this.openMobileNav();
        }
        
        close() {
            this.closeMobileNav();
        }
        
        toggle() {
            this.toggleMobileNav();
        }
        
        isNavOpen() {
            return this.isOpen;
        }
        
        destroy() {
            this.closeMobileNav();
            // Remove event listeners would go here
            console.log('📱 Navigation destroyed');
        }
    }
    
    // === ELEGANT CAROUSEL ===
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
            
            await this.preloadImages();
            this.setupResponsiveBackgrounds();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.startAutoPlay();
            this.handleResize();
            
            console.log('✅ Elegant Carousel initialized');
        }
        
        async preloadImages() {
            const imagePromises = [];
            
            this.slides.forEach(slide => {
                const desktopSrc = slide.dataset.bgDesktop;
                const mobileSrc = slide.dataset.bgMobile;
                
                if (desktopSrc) imagePromises.push(utils.preloadImage(desktopSrc));
                if (mobileSrc) imagePromises.push(utils.preloadImage(mobileSrc));
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
            
            const selectedSrc = (utils.isMobile() && mobileSrc) ? mobileSrc : desktopSrc;
            
            if (selectedSrc) {
                slide.style.backgroundImage = `url(${selectedSrc})`;
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
                
                indicator.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.goToSlide(index);
                    }
                });
            });
            
            // Pause on hover/focus
            if (CONFIG.CAROUSEL.PAUSE_ON_HOVER) {
                this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
                this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
            }
            
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
            
            // Touch support
            this.setupTouchEvents();
            
            // Window resize
            window.addEventListener('resize', utils.debounce(() => {
                this.handleResize();
            }, 250));
            
            // Visibility change
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
            }, { threshold: 0.5 });
            
            observer.observe(this.container);
        }
        
        handleResize() {
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
            
            // Dispatch event
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
                const serviceCheckbox = document.querySelector(`input[value*="${service}"]`);
                if (serviceCheckbox) {
                    serviceCheckbox.checked = true;
                    serviceCheckbox.closest('.service-option')?.classList.add('selected');
                }
            }
        }
        
        showFormError(message) {
            // Create or update error message
            let errorDiv = document.querySelector('.form-error-message');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'form-error-message';
                errorDiv.style.cssText = `
                    background: #FEE2E2;
                    color: #DC2626;
                    padding: var(--space-3);
                    border-radius: var(--border-radius);
                    margin: var(--space-4) 0;
                    border: 1px solid #FECACA;
                `;
                
                const form = document.querySelector('form');
                if (form) {
                    form.insertBefore(errorDiv, form.firstChild);
                }
            }
            
            errorDiv.textContent = message;
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
            
            const elements = document.querySelectorAll(
                '.service-card, .testimonial-card, .team-member, .coverage-card, .feature-item'
            );
            
            elements.forEach(el => observer.observe(el));
        }
        
        setupHoverEffects() {
            // Enhanced hover effects are now handled via CSS
            console.log('✨ Animation effects initialized');
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
                }, 500 + (index * 150));
            });
        }
    }
    
    // === MAIN APPLICATION CLASS ===
    class LuxuryApp {
        constructor() {
            this.fontAwesome = null;
            this.navigation = null;
            this.carousel = null;
            this.animations = null;
            this.forms = null;
            this.smoothScroll = null;
            this.contactUpdater = null;
            this.isInitialized = false;
            
            this.init();
        }
        
        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        }
        
        async initializeApp() {
            try {
                console.log('🏊‍♂️ Initializing 805 LifeGuard Luxury App v6.0...');
                
                // Initialize Font Awesome manager first
                this.fontAwesome = new FontAwesomeManager();
                this.fontAwesome.init();
                
                // Initialize core components
                this.navigation = new EnterpriseNavigation();
                this.navigation.init();
                
                this.forms = new FormHandler();
                this.smoothScroll = new SmoothScroll();
                this.contactUpdater = new ContactUpdater();
                
                // Initialize carousel if present
                const heroCarousel = document.getElementById('heroCarousel');
                if (heroCarousel) {
                    this.carousel = new ElegantCarousel(heroCarousel);
                }
                
                // Initialize animations after a brief delay
                setTimeout(() => {
                    this.animations = new AnimationController();
                }, 100);
                
                this.isInitialized = true;
                console.log('✅ 805 LifeGuard Luxury App initialized successfully');
                
                // Dispatch ready event
                window.dispatchEvent(new CustomEvent('luxuryAppReady', {
                    detail: { 
                        app: this,
                        hasCarousel: !!this.carousel,
                        fontAwesome: this.fontAwesome.isReady(),
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
            
            console.log('✅ Fallback functionality initialized');
        }
        
        // Public API
        getVersion() {
            return '6.0';
        }
        
        isReady() {
            return this.isInitialized;
        }
        
        getNavigation() {
            return this.navigation;
        }
        
        getCarousel() {
            return this.carousel;
        }
        
        getFontAwesome() {
            return this.fontAwesome;
        }
        
        closeMobileNav() {
            if (this.navigation) {
                this.navigation.close();
            }
        }
        
        openMobileNav() {
            if (this.navigation) {
                this.navigation.open();
            }
        }
        
        refreshFontAwesome() {
            if (this.fontAwesome) {
                this.fontAwesome.refresh();
            }
        }
    }
    
    // === INITIALIZE APP ===
    window.LuxuryApp = LuxuryApp;
    const app = new LuxuryApp();
    
    // Export for debugging
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('luxury.805companies.com') ||
        window.location.search.includes('debug=true')) {
        window.app = app;
        console.log('🔧 Debug mode active - app available as window.app');
    }
    
    // === ERROR HANDLING ===
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });
    
})();
