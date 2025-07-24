/**
 * 805 LifeGuard - Luxury Country Club Theme JavaScript
 * Version: 2.0
 * Comprehensive interactive functionality for all pages
 */

(function() {
    'use strict';
    
    // === UTILITIES ===
    const utils = {
        // Debounce function for performance
        debounce: function(func, wait, immediate) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },
        
        // Smooth scroll to element
        scrollTo: function(element, offset = 0) {
            const targetPosition = element.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        },
        
        // Check if element is in viewport
        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },
        
        // Generate unique ID
        generateId: function() {
            return 'LUXURY-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        },
        
        // Format phone number
        formatPhone: function(phone) {
            const cleaned = phone.replace(/\D/g, '');
            const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
            if (match) {
                return '(' + match[1] + ') ' + match[2] + '-' + match[3];
            }
            return phone;
        }
    };
    
    // === HEADER & NAVIGATION ===
    class Navigation {
        constructor() {
            this.header = document.getElementById('header');
            this.mobileToggle = document.getElementById('mobileMenuToggle');
            this.navLinks = document.getElementById('navLinks');
            this.lastScrollTop = 0;
            
            this.init();
        }
        
        init() {
            this.setupScrollEffect();
            this.setupMobileMenu();
            this.setupActiveLinks();
            this.setupPortalLinks();
        }
        
        setupScrollEffect() {
            const handleScroll = utils.debounce(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Header background opacity
                if (scrollTop > 100) {
                    this.header.style.background = 'rgba(254, 254, 254, 0.98)';
                    this.header.style.boxShadow = '0 2px 20px rgba(10, 22, 40, 0.1)';
                } else {
                    this.header.style.background = 'rgba(254, 254, 254, 0.95)';
                    this.header.style.boxShadow = 'none';
                }
                
                // Hide/show header on scroll
                if (scrollTop > this.lastScrollTop && scrollTop > 200) {
                    this.header.style.transform = 'translateY(-100%)';
                } else {
                    this.header.style.transform = 'translateY(0)';
                }
                
                this.lastScrollTop = scrollTop;
            }, 10);
            
            window.addEventListener('scroll', handleScroll);
        }
        
        setupMobileMenu() {
            if (!this.mobileToggle || !this.navLinks) return;
            
            this.mobileToggle.addEventListener('click', () => {
                const isActive = this.navLinks.classList.contains('active');
                
                if (isActive) {
                    this.navLinks.classList.remove('active');
                    this.mobileToggle.setAttribute('aria-expanded', 'false');
                    this.navLinks.setAttribute('aria-hidden', 'true');
                } else {
                    this.navLinks.classList.add('active');
                    this.mobileToggle.setAttribute('aria-expanded', 'true');
                    this.navLinks.setAttribute('aria-hidden', 'false');
                }
                
                // Animate hamburger
                this.mobileToggle.classList.toggle('active');
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.mobileToggle.contains(e.target) && !this.navLinks.contains(e.target)) {
                    this.navLinks.classList.remove('active');
                    this.mobileToggle.classList.remove('active');
                    this.mobileToggle.setAttribute('aria-expanded', 'false');
                    this.navLinks.setAttribute('aria-hidden', 'true');
                }
            });
            
            // Close mobile menu on resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.navLinks.classList.remove('active');
                    this.mobileToggle.classList.remove('active');
                    this.mobileToggle.setAttribute('aria-expanded', 'false');
                    this.navLinks.setAttribute('aria-hidden', 'true');
                }
            });
        }
        
        setupActiveLinks() {
            const currentPath = window.location.pathname;
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && (currentPath.includes(href) || (href === '/' && currentPath === '/'))) {
                    link.classList.add('active');
                }
            });
        }
        
        setupPortalLinks() {
            const portalLinks = document.querySelectorAll('.portal-link, .nav-link[target="_blank"]');
            
            portalLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Track portal clicks for analytics
                    const portalName = link.textContent.trim();
                    console.log(`Portal accessed: ${portalName}`);
                });
            });
        }
    }
    
    // === ANIMATIONS ===
    class AnimationController {
        constructor() {
            this.observerOptions = {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1
            };
            
            this.init();
        }
        
        init() {
            this.setupScrollAnimations();
            this.setupCounterAnimations();
            this.setupParallaxEffect();
        }
        
        setupScrollAnimations() {
            const animatedElements = document.querySelectorAll(
                '.service-card, .testimonial-card, .feature-item, .team-member'
            );
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);
            
            animatedElements.forEach(el => observer.observe(el));
        }
        
        setupCounterAnimations() {
            const counters = document.querySelectorAll('.stat-number[data-target]');
            
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);
            
            counters.forEach(counter => counterObserver.observe(counter));
        }
        
        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.round(target * easeOutQuart);
                
                element.textContent = currentValue.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };
            
            requestAnimationFrame(updateCounter);
        }
        
        setupParallaxEffect() {
            const parallaxElements = document.querySelectorAll('.hero');
            
            if (parallaxElements.length === 0) return;
            
            const handleParallax = utils.debounce(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                
                parallaxElements.forEach(element => {
                    element.style.transform = `translateY(${rate}px)`;
                });
            }, 10);
            
            window.addEventListener('scroll', handleParallax);
        }
    }
    
    // === FORM HANDLING ===
    class FormHandler {
        constructor() {
            this.forms = document.querySelectorAll('form');
            this.init();
        }
        
        init() {
            this.setupFormValidation();
            this.setupFormSubmission();
            this.setupServiceDependencies();
            this.setupPhoneFormatting();
        }
        
        setupFormValidation() {
            this.forms.forEach(form => {
                const inputs = form.querySelectorAll('input, select, textarea');
                
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', () => this.clearFieldError(input));
                });
                
                form.addEventListener('submit', (e) => {
                    if (!this.validateForm(form)) {
                        e.preventDefault();
                    }
                });
            });
        }
        
        validateField(field) {
            const value = field.value.trim();
            const fieldName = field.name;
            let isValid = true;
            let errorMessage = '';
            
            // Required field validation
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'This field is required.';
            }
            
            // Email validation
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
            }
            
            // Phone validation
            if (field.type === 'tel' && value) {
                const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number.';
                }
            }
            
            this.showFieldValidation(field, isValid, errorMessage);
            return isValid;
        }
        
        validateForm(form) {
            const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
            let isFormValid = true;
            
            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isFormValid = false;
                }
            });
            
            return isFormValid;
        }
        
        showFieldValidation(field, isValid, message) {
            const errorElement = document.getElementById(`${field.name}-error`);
            
            if (isValid) {
                field.classList.remove('error');
                field.classList.add('valid');
                if (errorElement) errorElement.textContent = '';
            } else {
                field.classList.remove('valid');
                field.classList.add('error');
                if (errorElement) errorElement.textContent = message;
            }
        }
        
        clearFieldError(field) {
            field.classList.remove('error');
            const errorElement = document.getElementById(`${field.name}-error`);
            if (errorElement) errorElement.textContent = '';
        }
        
        setupFormSubmission() {
            const consultationForm = document.getElementById('consultationForm');
            if (!consultationForm) return;
            
            consultationForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleConsultationSubmission(consultationForm);
            });
        }
        
        async handleConsultationSubmission(form) {
            const formData = new FormData(form);
            const loadingOverlay = document.getElementById('loadingOverlay');
            const successModal = document.getElementById('successModal');
            
            // Show loading
            if (loadingOverlay) loadingOverlay.style.display = 'flex';
            
            try {
                // Prepare data for submission
                const consultationData = {
                    first_name: formData.get('firstName'),
                    last_name: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    estate_location: formData.get('estateLocation'),
                    property_type: formData.get('propertyType') || '',
                    services: formData.getAll('services[]').join(', '),
                    timeframe: formData.get('timeline') || '',
                    requirements: formData.get('details') || '',
                    client_tier: this.determineClientTier(formData.get('estateLocation'), formData.get('propertyType')),
                    priority_level: formData.get('urgency') || 'standard',
                    estimated_value: this.estimateConsultationValue(formData.getAll('services[]'), formData.get('estateLocation')),
                    submission_source: 'website',
                    consultation_id: utils.generateId()
                };
                
                // Simulate API call (replace with actual endpoint)
                await this.submitToAPI(consultationData);
                
                // Hide loading
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                
                // Show success
                if (successModal) {
                    const consultationIdDisplay = document.getElementById('consultationIdDisplay');
                    if (consultationIdDisplay) {
                        consultationIdDisplay.textContent = consultationData.consultation_id;
                    }
                    successModal.style.display = 'flex';
                }
                
                // Reset form
                form.reset();
                
                // Send confirmation email (if implemented)
                this.sendConfirmationEmail(consultationData);
                
            } catch (error) {
                console.error('Submission error:', error);
                
                // Hide loading
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                
                // Show error message
                this.showErrorMessage('There was an error submitting your consultation request. Please try again or call (805) 367-6432 directly.');
            }
        }
        
        async submitToAPI(data) {
            // Replace this with your actual Cloudflare Worker endpoint
            const response = await fetch('/api/consultation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        }
        
        determineClientTier(location, propertyType) {
            const premiumLocations = ['beverly-hills', 'manhattan-beach', 'newport-beach', 'malibu', 'hidden-hills'];
            const ultraLuxuryTypes = ['private-estate', 'luxury-residence'];
            
            if (premiumLocations.includes(location) && ultraLuxuryTypes.includes(propertyType)) {
                return 'platinum';
            } else if (premiumLocations.includes(location) || ultraLuxuryTypes.includes(propertyType)) {
                return 'gold';
            } else {
                return 'silver';
            }
        }
        
        estimateConsultationValue(services, location) {
            const baseValues = {
                'private-lifeguarding': 500,
                'swim-instruction': 300,
                'event-management': 400,
                'pool-cleaning': 200,
                'water-safety': 150,
                'special-needs': 350,
                'ongoing-coverage': 800
            };
            
            const locationMultipliers = {
                'beverly-hills': 2.0,
                'manhattan-beach': 1.8,
                'newport-beach': 1.8,
                'malibu': 1.9,
                'hidden-hills': 1.7,
                'calabasas': 1.5,
                'westlake-village': 1.3,
                'thousand-oaks': 1.2
            };
            
            let totalValue = 0;
            services.forEach(service => {
                totalValue += baseValues[service] || 100;
            });
            
            const multiplier = locationMultipliers[location] || 1.0;
            return Math.round(totalValue * multiplier);
        }
        
        setupServiceDependencies() {
            const poolCleaningCheckbox = document.getElementById('service-cleaning');
            if (!poolCleaningCheckbox) return;
            
            poolCleaningCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    const lifeguarding = document.getElementById('service-lifeguarding');
                    const instruction = document.getElementById('service-instruction');
                    
                    if (!lifeguarding?.checked && !instruction?.checked) {
                        alert('Pool cleaning services are exclusively available to clients who also utilize our lifeguarding or swimming instruction services. Please select one of these primary services as well.');
                        this.checked = false;
                        this.closest('.service-option')?.classList.remove('selected');
                        this.closest('.service-option')?.setAttribute('aria-checked', 'false');
                    }
                }
            });
        }
        
        setupPhoneFormatting() {
            const phoneInputs = document.querySelectorAll('input[type="tel"]');
            
            phoneInputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                        e.target.value = utils.formatPhone(value);
                    }
                });
            });
        }
        
        showErrorMessage(message) {
            const alertDiv = document.getElementById('message-alert');
            if (alertDiv) {
                alertDiv.innerHTML = `
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-triangle"></i> 
                        ${message}
                    </div>
                `;
                alertDiv.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        sendConfirmationEmail(data) {
            // This would integrate with your email service
            console.log('Sending confirmation email to:', data.email);
        }
    }
    
    // === INTERACTIVE ELEMENTS ===
    class InteractiveElements {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupServiceOptions();
            this.setupFAQAccordion();
            this.setupPortfolioFilter();
            this.setupTestimonialSlider();
            this.setupSmoothScrolling();
            this.setupModalHandlers();
        }
        
        setupServiceOptions() {
            const serviceOptions = document.querySelectorAll('.service-option');
            
            serviceOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        this.setAttribute('aria-checked', checkbox.checked);
                        
                        if (checkbox.checked) {
                            this.classList.add('selected');
                        } else {
                            this.classList.remove('selected');
                        }
                        
                        // Trigger change event for dependency checking
                        checkbox.dispatchEvent(new Event('change'));
                    }
                });
                
                // Keyboard accessibility
                option.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });
        }
        
        setupFAQAccordion() {
            const faqQuestions = document.querySelectorAll('.faq-question');
            
            faqQuestions.forEach(question => {
                question.addEventListener('click', function() {
                    const faqItem = this.closest('.faq-item');
                    const answer = faqItem.querySelector('.faq-answer');
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    
                    // Close all other FAQ items
                    faqQuestions.forEach(otherQuestion => {
                        if (otherQuestion !== this) {
                            otherQuestion.setAttribute('aria-expanded', 'false');
                            otherQuestion.querySelector('i').style.transform = 'rotate(0deg)';
                            const otherAnswer = otherQuestion.closest('.faq-item').querySelector('.faq-answer');
                            otherAnswer.setAttribute('aria-hidden', 'true');
                            otherAnswer.style.maxHeight = '0';
                        }
                    });
                    
                    // Toggle current item
                    if (isExpanded) {
                        this.setAttribute('aria-expanded', 'false');
                        answer.setAttribute('aria-hidden', 'true');
                        answer.style.maxHeight = '0';
                        this.querySelector('i').style.transform = 'rotate(0deg)';
                    } else {
                        this.setAttribute('aria-expanded', 'true');
                        answer.setAttribute('aria-hidden', 'false');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        this.querySelector('i').style.transform = 'rotate(180deg)';
                    }
                });
                
                // Keyboard accessibility
                question.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });
        }
        
        setupPortfolioFilter() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            const portfolioItems = document.querySelectorAll('.portfolio-item');
            
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Filter items
                    portfolioItems.forEach(item => {
                        if (category === 'all' || item.getAttribute('data-category') === category) {
                            item.style.display = 'block';
                            item.classList.add('fade-in');
                        } else {
                            item.style.display = 'none';
                            item.classList.remove('fade-in');
                        }
                    });
                });
            });
        }
        
        setupTestimonialSlider() {
            const testimonialCards = document.querySelectorAll('.testimonial-card');
            if (testimonialCards.length <= 1) return;
            
            let currentTestimonial = 0;
            const totalTestimonials = testimonialCards.length;
            
            const showTestimonial = (index) => {
                testimonialCards.forEach((card, i) => {
                    if (i === index) {
                        card.style.display = 'block';
                        card.classList.add('fade-in');
                    } else {
                        card.style.display = 'none';
                        card.classList.remove('fade-in');
                    }
                });
            };
            
            // Auto-rotate testimonials
            setInterval(() => {
                currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
                showTestimonial(currentTestimonial);
            }, 5000);
        }
        
        setupSmoothScrolling() {
            const scrollLinks = document.querySelectorAll('a[href^="#"]');
            
            scrollLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === '#') return;
                    
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        utils.scrollTo(target, 100);
                    }
                });
            });
        }
        
        setupModalHandlers() {
            // Success modal close
            const successModal = document.getElementById('successModal');
            if (successModal) {
                window.closeSuccessModal = function() {
                    successModal.style.display = 'none';
                };
                
                // Close on background click
                successModal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        this.style.display = 'none';
                    }
                });
                
                // Close on escape key
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && successModal.style.display === 'flex') {
                        successModal.style.display = 'none';
                    }
                });
            }
        }
    }
    
    // === URL PARAMETER HANDLING ===
    class URLHandler {
        constructor() {
            this.init();
        }
        
        init() {
            this.handleServicePreselection();
            this.handleScrollToSection();
        }
        
        handleServicePreselection() {
            const urlParams = new URLSearchParams(window.location.search);
            const serviceParam = urlParams.get('service');
            
            if (serviceParam) {
                const serviceMapping = {
                    'lifeguarding': 'service-lifeguarding',
                    'instruction': 'service-instruction',
                    'events': 'service-events',
                    'pool-cleaning': 'service-cleaning'
                };
                
                const serviceId = serviceMapping[serviceParam];
                if (serviceId) {
                    const checkbox = document.getElementById(serviceId);
                    const option = checkbox?.closest('.service-option');
                    
                    if (checkbox && option) {
                        checkbox.checked = true;
                        option.classList.add('selected');
                        option.setAttribute('aria-checked', 'true');
                    }
                }
            }
        }
        
        handleScrollToSection() {
            const hash = window.location.hash;
            if (hash) {
                setTimeout(() => {
                    const target = document.querySelector(hash);
                    if (target) {
                        utils.scrollTo(target, 100);
                    }
                }, 500);
            }
        }
    }
    
    // === PERFORMANCE OPTIMIZATION ===
    class PerformanceOptimizer {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupImageLazyLoading();
            this.setupVideoOptimization();
            this.preloadCriticalImages();
        }
        
        setupImageLazyLoading() {
            const images = document.querySelectorAll('img[loading="lazy"]');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });
                
                images.forEach(img => imageObserver.observe(img));
            }
        }
        
        setupVideoOptimization() {
            const videos = document.querySelectorAll('video');
            
            videos.forEach(video => {
                // Pause videos when not in viewport
                const videoObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            video.play().catch(() => {
                                // Auto-play blocked, which is fine
                            });
                        } else {
                            video.pause();
                        }
                    });
                });
                
                videoObserver.observe(video);
            });
        }
        
        preloadCriticalImages() {
            const criticalImages = [
                '/images/hero/hero-luxury-estate-1600x1200.jpg',
                '/images/805-lifeguard-logo.png'
            ];
            
            criticalImages.forEach(src => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = src;
                document.head.appendChild(link);
            });
        }
    }
    
    // === INITIALIZE APPLICATION ===
    class LuxuryApp {
        constructor() {
            this.navigation = null;
            this.animations = null;
            this.forms = null;
            this.interactive = null;
            this.urlHandler = null;
            this.performance = null;
            
            this.init();
        }
        
        init() {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
            } else {
                this.initializeComponents();
            }
        }
        
        initializeComponents() {
            try {
                this.navigation = new Navigation();
                this.animations = new AnimationController();
                this.forms = new FormHandler();
                this.interactive = new InteractiveElements();
                this.urlHandler = new URLHandler();
                this.performance = new PerformanceOptimizer();
                
                // Custom page-specific initializations
                this.initializePageSpecific();
                
                console.log('805 LifeGuard Luxury App initialized successfully');
            } catch (error) {
                console.error('Error initializing Luxury App:', error);
            }
        }
        
        initializePageSpecific() {
            // Add any page-specific functionality here
            const currentPage = window.location.pathname;
            
            if (currentPage.includes('contact')) {
                this.initializeContactPage();
            } else if (currentPage.includes('testimonials')) {
                this.initializeTestimonialsPage();
            } else if (currentPage.includes('portfolio')) {
                this.initializePortfolioPage();
            }
        }
        
        initializeContactPage() {
            // Contact page specific functionality
            console.log('Contact page initialized');
        }
        
        initializeTestimonialsPage() {
            // Testimonials page specific functionality
            console.log('Testimonials page initialized');
        }
        
        initializePortfolioPage() {
            // Portfolio page specific functionality
            console.log('Portfolio page initialized');
        }
    }
    
    // === GLOBAL FUNCTIONS ===
    window.LuxuryApp = LuxuryApp;
    window.utils = utils;
    
    // Initialize the application
    new LuxuryApp();
    
    // === ERROR HANDLING ===
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        // Could send to analytics/monitoring service
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        // Could send to analytics/monitoring service
    });
    
})();