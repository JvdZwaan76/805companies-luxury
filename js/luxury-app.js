/**
 * 805 LifeGuard - Luxury Country Club JavaScript
 * Version: 5.2 - Enhanced with FAQ Functionality Integration
 * Robust functionality with elegant interactions and comprehensive FAQ system
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
        WEBP_SUPPORT: null // Will be detected on load
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
            // Remove event listeners would go here
            console.log('🎠 Carousel destroyed');
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
            
            this.init();
        }
        
        init() {
            console.log('📱 Initializing Navigation Controller...');
            this.setupEventListeners();
            this.setupScrollEffects();
            this.updateActiveLinks();
            this.updatePortalLinks();
            console.log('✅ Navigation Controller initialized');
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
            } else {
                console.warn('⚠️ Mobile toggle not found');
            }
            
            // Mobile nav close button
            if (this.mobileNavClose) {
                this.mobileNavClose.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📱 Mobile close clicked');
                    this.closeMobileNav();
                });
            } else {
                console.warn('⚠️ Mobile nav close button not found');
            }
            
            // Mobile nav link clicks
            if (this.mobileNav) {
                const mobileLinks = this.mobileNav.querySelectorAll('.mobile-nav-link');
                console.log(`📱 Found ${mobileLinks.length} mobile nav links`);
                mobileLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        console.log('📱 Mobile nav link clicked');
                        setTimeout(() => {
                            this.closeMobileNav();
                        }, 100);
                    });
                });
            } else {
                console.warn('⚠️ Mobile nav not found');
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
            
            console.log('📱 Opening mobile nav...');
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
            
            // Focus first link
            setTimeout(() => {
                const firstLink = this.mobileNav.querySelector('.mobile-nav-link');
                if (firstLink) {
                    firstLink.focus();
                }
            }, 300);
            
            console.log('✅ Mobile nav opened');
        }
        
        closeMobileNav() {
            if (!this.mobileToggle || !this.mobileNav) {
                console.error('❌ Cannot close mobile nav - elements not found');
                return;
            }
            
            console.log('📱 Closing mobile nav...');
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
            
            console.log('✅ Mobile nav closed');
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
    }
    
    // === FAQ CONTROLLER ===
    class FAQController {
        constructor() {
            this.faqQuestions = document.querySelectorAll('.faq-question');
            this.categoryBtns = document.querySelectorAll('.category-btn');
            this.categoryLinks = document.querySelectorAll('.category-link');
            this.faqSections = document.querySelectorAll('.faq-section');
            this.searchInput = document.getElementById('faqSearch');
            this.faqItems = document.querySelectorAll('.faq-item');
            this.activeCategory = 'all';
            
            this.init();
        }
        
        init() {
            console.log('🔍 Initializing FAQ Controller...');
            this.setupAccordion();
            this.setupCategoryFiltering();
            this.setupSearch();
            this.setupKeyboardNavigation();
            this.setupURLHash();
            console.log('✅ FAQ Controller initialized');
        }
        
        setupAccordion() {
            this.faqQuestions.forEach((question, index) => {
                question.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleFAQ(question);
                });
                
                // Keyboard support
                question.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleFAQ(question);
                    }
                    
                    // Arrow key navigation
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        this.focusNextFAQ(index);
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        this.focusPrevFAQ(index);
                    }
                });
            });
        }
        
        toggleFAQ(questionElement) {
            const faqItem = questionElement.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = questionElement.classList.contains('active');
            
            // Close all other open FAQs
            this.faqQuestions.forEach(q => {
                if (q !== questionElement) {
                    this.closeFAQ(q);
                }
            });
            
            // Toggle current FAQ
            if (!isActive) {
                this.openFAQ(questionElement, answer);
            } else {
                this.closeFAQ(questionElement);
            }
        }
        
        openFAQ(questionElement, answer) {
            questionElement.classList.add('active');
            questionElement.setAttribute('aria-expanded', 'true');
            answer.classList.add('active');
            answer.setAttribute('aria-hidden', 'false');
            
            // Smooth scroll to question if needed
            setTimeout(() => {
                this.scrollToQuestion(questionElement);
            }, 100);
        }
        
        closeFAQ(questionElement) {
            const answer = questionElement.parentElement.querySelector('.faq-answer');
            questionElement.classList.remove('active');
            questionElement.setAttribute('aria-expanded', 'false');
            answer.classList.remove('active');
            answer.setAttribute('aria-hidden', 'true');
        }
        
        scrollToQuestion(questionElement) {
            const headerHeight = document.getElementById('header')?.offsetHeight || 120;
            const questionTop = questionElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: questionTop,
                behavior: 'smooth'
            });
        }
        
        focusNextFAQ(currentIndex) {
            const visibleQuestions = Array.from(this.faqQuestions).filter(q => 
                q.closest('.faq-item').style.display !== 'none' &&
                !q.closest('.faq-section').classList.contains('hidden')
            );
            
            const nextIndex = (currentIndex + 1) % visibleQuestions.length;
            if (visibleQuestions[nextIndex]) {
                visibleQuestions[nextIndex].focus();
            }
        }
        
        focusPrevFAQ(currentIndex) {
            const visibleQuestions = Array.from(this.faqQuestions).filter(q => 
                q.closest('.faq-item').style.display !== 'none' &&
                !q.closest('.faq-section').classList.contains('hidden')
            );
            
            const prevIndex = currentIndex === 0 ? visibleQuestions.length - 1 : currentIndex - 1;
            if (visibleQuestions[prevIndex]) {
                visibleQuestions[prevIndex].focus();
            }
        }
        
        setupCategoryFiltering() {
            // Category button clicks
            this.categoryBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.filterFAQs(btn.dataset.category);
                });
            });
            
            // Sidebar category link clicks
            this.categoryLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.filterFAQs(link.dataset.category);
                    
                    // Smooth scroll to content on mobile
                    if (window.innerWidth <= 768) {
                        document.querySelector('.faq-main').scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }
        
        filterFAQs(category) {
            this.activeCategory = category;
            
            // Filter sections
            this.faqSections.forEach(section => {
                if (category === 'all' || section.dataset.category === category) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
            
            // Update active states
            this.updateActiveStates(category);
            
            // Update URL hash
            if (category !== 'all') {
                window.history.replaceState(null, null, `#${category}`);
            } else {
                window.history.replaceState(null, null, window.location.pathname);
            }
            
            // Close all open FAQs when filtering
            this.closeAllFAQs();
        }
        
        updateActiveStates(category) {
            // Update category buttons
            this.categoryBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === category);
            });
            
            // Update sidebar links
            this.categoryLinks.forEach(link => {
                link.classList.toggle('active', 
                    link.dataset.category === category || 
                    (category === 'all' && link.dataset.category === 'services')
                );
            });
        }
        
        closeAllFAQs() {
            this.faqQuestions.forEach(question => {
                this.closeFAQ(question);
            });
        }
        
        setupSearch() {
            if (!this.searchInput) return;
            
            let searchTimeout;
            
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300); // Debounce search
            });
            
            // Clear search on escape
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });
        }
        
        performSearch(searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            
            if (!term) {
                this.clearSearch();
                return;
            }
            
            let hasResults = false;
            
            // Search through FAQ items
            this.faqItems.forEach(item => {
                const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                
                if (question.includes(term) || answer.includes(term)) {
                    item.style.display = 'block';
                    hasResults = true;
                    
                    // Show parent section
                    const section = item.closest('.faq-section');
                    if (section) {
                        section.classList.remove('hidden');
                    }
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show/hide sections based on results
            if (term) {
                this.faqSections.forEach(section => {
                    const visibleItems = section.querySelectorAll('.faq-item[style*="block"], .faq-item:not([style*="none"])');
                    if (visibleItems.length === 0) {
                        section.classList.add('hidden');
                    } else {
                        section.classList.remove('hidden');
                    }
                });
            }
            
            // Show no results message if needed
            this.showNoResultsMessage(!hasResults && term);
        }
        
        clearSearch() {
            if (this.searchInput) {
                this.searchInput.value = '';
            }
            
            // Reset all FAQ items
            this.faqItems.forEach(item => {
                item.style.display = 'block';
            });
            
            // Reset to current category filter
            this.filterFAQs(this.activeCategory);
            
            // Hide no results message
            this.showNoResultsMessage(false);
        }
        
        showNoResultsMessage(show) {
            let noResultsElement = document.querySelector('.no-results-message');
            
            if (show && !noResultsElement) {
                noResultsElement = document.createElement('div');
                noResultsElement.className = 'no-results-message';
                noResultsElement.innerHTML = `
                    <div style="text-align: center; padding: var(--space-12); color: var(--gray-medium);">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: var(--space-4); opacity: 0.5;"></i>
                        <h3 style="margin-bottom: var(--space-2);">No results found</h3>
                        <p>Try adjusting your search terms or browse by category.</p>
                    </div>
                `;
                document.querySelector('.faq-main').appendChild(noResultsElement);
            } else if (!show && noResultsElement) {
                noResultsElement.remove();
            }
        }
        
        setupKeyboardNavigation() {
            // Global keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Focus search with Ctrl/Cmd + F
                if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                    e.preventDefault();
                    if (this.searchInput) {
                        this.searchInput.focus();
                    }
                }
                
                // Close all FAQs with Escape
                if (e.key === 'Escape') {
                    this.closeAllFAQs();
                }
            });
        }
        
        setupURLHash() {
            // Handle initial hash
            if (window.location.hash) {
                const category = window.location.hash.substring(1);
                if (this.isValidCategory(category)) {
                    setTimeout(() => {
                        this.filterFAQs(category);
                    }, 100);
                }
            }
            
            // Handle hash changes
            window.addEventListener('hashchange', () => {
                const category = window.location.hash.substring(1);
                if (this.isValidCategory(category)) {
                    this.filterFAQs(category);
                }
            });
        }
        
        isValidCategory(category) {
            const validCategories = Array.from(this.categoryBtns).map(btn => btn.dataset.category);
            return validCategories.includes(category);
        }
        
        // Public methods for external use
        openFAQByIndex(index) {
            if (this.faqQuestions[index]) {
                this.toggleFAQ(this.faqQuestions[index]);
            }
        }
        
        searchFor(term) {
            if (this.searchInput) {
                this.searchInput.value = term;
                this.performSearch(term);
            }
        }
        
        goToCategory(category) {
            this.filterFAQs(category);
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
            alert(message); // Simple fallback - can be enhanced later
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
    class LuxuryApp {
        constructor() {
            this.navigation = null;
            this.carousel = null;
            this.animations = null;
            this.forms = null;
            this.smoothScroll = null;
            this.contactUpdater = null;
            this.faqController = null;
            
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
                console.log('🏊‍♂️ Initializing 805 LifeGuard Luxury App...');
                
                // First detect WebP support
                await utils.detectWebPSupport();
                console.log(`🖼️ WebP Support: ${CONFIG.WEBP_SUPPORT ? 'Enabled' : 'Disabled'}`);
                
                // Apply WebP classes to background elements
                utils.setupWebPBackgrounds();
                
                // Initialize core components
                this.navigation = new NavigationController();
                this.forms = new FormHandler();
                this.smoothScroll = new SmoothScroll();
                this.contactUpdater = new ContactUpdater();
                
                // Initialize carousel if hero carousel exists
                const heroCarousel = document.getElementById('heroCarousel');
                if (heroCarousel) {
                    this.carousel = new ElegantCarousel(heroCarousel);
                }
                
                // Initialize FAQ controller if on FAQ page
                if (document.querySelector('.faq-content')) {
                    this.faqController = new FAQController();
                    console.log('✅ FAQ functionality initialized');
                }
                
                // Initialize animations (after carousel to prevent conflicts)
                setTimeout(() => {
                    this.animations = new AnimationController();
                }, 100);
                
                console.log('✅ 805 LifeGuard Luxury App initialized successfully');
                
                // Dispatch ready event
                window.dispatchEvent(new CustomEvent('luxuryAppReady', {
                    detail: { 
                        app: this,
                        hasCarousel: !!this.carousel,
                        hasFAQ: !!this.faqController,
                        webpSupport: CONFIG.WEBP_SUPPORT,
                        version: '5.2'
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
            } else {
                console.error('❌ Mobile navigation elements not found');
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
            
            // Basic FAQ fallback
            if (document.querySelector('.faq-content')) {
                const faqQuestions = document.querySelectorAll('.faq-question');
                faqQuestions.forEach(question => {
                    question.addEventListener('click', function() {
                        const answer = this.parentElement.querySelector('.faq-answer');
                        const isActive = this.classList.contains('active');
                        
                        // Close all other FAQs
                        faqQuestions.forEach(q => {
                            q.classList.remove('active');
                            q.parentElement.querySelector('.faq-answer').classList.remove('active');
                        });
                        
                        // Toggle current FAQ
                        if (!isActive) {
                            this.classList.add('active');
                            answer.classList.add('active');
                        }
                    });
                });
                console.log('✅ Fallback FAQ functionality initialized');
            }
        }
        
        // Public methods
        getVersion() {
            return '5.2';
        }
        
        closeMobileNav() {
            if (this.navigation) {
                this.navigation.closeMobileNav();
            }
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
        
        getFAQController() {
            return this.faqController;
        }
        
        searchFAQ(term) {
            if (this.faqController) {
                this.faqController.searchFor(term);
            }
        }
        
        goToFAQCategory(category) {
            if (this.faqController) {
                this.faqController.goToCategory(category);
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
        console.log('🎠 Carousel available as window.app.getCarousel()');
        console.log('🔍 FAQ Controller available as window.app.getFAQController()');
    }
    
    // === ERROR HANDLING ===
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });
    
})();
