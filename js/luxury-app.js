/**
 * 805 LifeGuard - Enhanced Luxury Country Club Theme JavaScript
 * Version: 3.0
 * Comprehensive interactive functionality with perfect consistency
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
        ANIMATION_DURATION: 800,
        SCROLL_OFFSET: 100
    };
    
    // === UTILITIES ===
    const utils = {
        // Enhanced debounce function
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
        
        // Throttle function for performance
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
        
        // Enhanced smooth scroll
        scrollTo: function(element, offset = CONFIG.SCROLL_OFFSET) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            if (!element) return;
            
            const targetPosition = element.offsetTop - offset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = Math.min(Math.abs(distance) * 0.5, 1000);
            let start = null;
            
            function animation(currentTime) {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }
            
            function easeInOutQuad(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }
            
            requestAnimationFrame(animation);
        },
        
        // Enhanced viewport detection
        isInViewport: function(element, threshold = 0.1) {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
            const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);
            
            return vertInView && horInView;
        },
        
        // Generate unique consultation ID
        generateConsultationId: function() {
            const timestamp = Date.now().toString(36);
            const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
            return `LUXURY-${timestamp}-${randomStr}`;
        },
        
        // Format phone number
        formatPhone: function(phone) {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 10) {
                const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
                if (match) {
                    return `(${match[1]}) ${match[2]}-${match[3]}`;
                }
            }
            return phone;
        },
        
        // Validate email
        isValidEmail: function(email) {
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            return emailRegex.test(email);
        },
        
        // Get URL parameters
        getUrlParams: function() {
            return new URLSearchParams(window.location.search);
        },
        
        // Local storage with error handling
        storage: {
            set: function(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    console.warn('LocalStorage not available:', e);
                    return false;
                }
            },
            get: function(key) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch (e) {
                    console.warn('LocalStorage not available:', e);
                    return null;
                }
            },
            remove: function(key) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    console.warn('LocalStorage not available:', e);
                    return false;
                }
            }
        }
    };
    
    // === ENHANCED NAVIGATION ===
    class EnhancedNavigation {
        constructor() {
            this.header = document.getElementById('header');
            this.mobileToggle = document.getElementById('mobileMenuToggle');
            this.navLinks = document.getElementById('navLinks');
            this.lastScrollTop = 0;
            this.isScrolling = false;
            this.headerHeight = 0;
            
            this.init();
        }
        
        init() {
            this.setupHeader();
            this.setupScrollEffects();
            this.setupMobileMenu();
            this.setupActiveLinks();
            this.setupPortalLinks();
            this.setupKeyboardNavigation();
        }
        
        setupHeader() {
            if (!this.header) return;
            this.headerHeight = this.header.offsetHeight;
            
            // Add body padding to prevent content jumping
            document.body.style.paddingTop = this.headerHeight + 'px';
            
            // Update header height on resize
            window.addEventListener('resize', utils.debounce(() => {
                this.headerHeight = this.header.offsetHeight;
                document.body.style.paddingTop = this.headerHeight + 'px';
            }, 100));
        }
        
        setupScrollEffects() {
            if (!this.header) return;
            
            const handleScroll = utils.throttle(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Header background and shadow effects
                if (scrollTop > 50) {
                    this.header.style.background = 'rgba(254, 254, 254, 0.98)';
                    this.header.style.boxShadow = '0 4px 32px rgba(10, 22, 40, 0.12)';
                    this.header.style.backdropFilter = 'blur(20px)';
                } else {
                    this.header.style.background = 'rgba(254, 254, 254, 0.95)';
                    this.header.style.boxShadow = 'none';
                    this.header.style.backdropFilter = 'blur(10px)';
                }
                
                // Hide/show header on scroll (only on mobile)
                if (window.innerWidth <= 768) {
                    if (scrollTop > this.lastScrollTop && scrollTop > 200) {
                        this.header.style.transform = 'translateY(-100%)';
                    } else {
                        this.header.style.transform = 'translateY(0)';
                    }
                }
                
                this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            }, 10);
            
            window.addEventListener('scroll', handleScroll, { passive: true });
        }
        
        setupMobileMenu() {
            if (!this.mobileToggle || !this.navLinks) return;
            
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
            
            // Close mobile menu when clicking links
            const navLinkItems = this.navLinks.querySelectorAll('.nav-link');
            navLinkItems.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeMobileMenu();
                    }
                });
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.header.contains(e.target) && this.navLinks.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });
            
            // Close mobile menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.navLinks.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });
            
            // Close mobile menu on resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.closeMobileMenu();
                }
            });
        }
        
        toggleMobileMenu() {
            const isActive = this.navLinks.classList.contains('active');
            
            if (isActive) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
        
        openMobileMenu() {
            this.navLinks.classList.add('active');
            this.mobileToggle.classList.add('active');
            this.mobileToggle.setAttribute('aria-expanded', 'true');
            this.navLinks.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
        
        closeMobileMenu() {
            this.navLinks.classList.remove('active');
            this.mobileToggle.classList.remove('active');
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            this.navLinks.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
        
        setupActiveLinks() {
            const currentPath = window.location.pathname;
            const navLinks = document.querySelectorAll('.nav-link:not(.portal-link):not(.btn-consultation)');
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href) {
                    // Handle exact matches and home page
                    if ((href === '/' && (currentPath === '/' || currentPath === '/index.html')) ||
                        (href !== '/' && currentPath.includes(href.replace('.html', '')))) {
                        link.classList.add('active');
                    }
                }
            });
        }
        
        setupPortalLinks() {
            // Update portal links to use new domains
            const portalLinks = document.querySelectorAll('a[href*="client.805"], a[href*="admin.805"], a[href*="staff.805"]');
            
            portalLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href.includes('client.805')) {
                    link.setAttribute('href', CONFIG.PORTAL_DOMAINS.CLIENT);
                } else if (href.includes('admin.805')) {
                    link.setAttribute('href', CONFIG.PORTAL_DOMAINS.ADMIN);
                } else if (href.includes('staff.805')) {
                    link.setAttribute('href', CONFIG.PORTAL_DOMAINS.STAFF);
                }
                
                // Track portal clicks for analytics
                link.addEventListener('click', (e) => {
                    const portalName = link.textContent.trim();
                    console.log(`Portal accessed: ${portalName}`);
                    
                    // You can add analytics tracking here
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'portal_click', {
                            'portal_name': portalName,
                            'portal_url': link.href
                        });
                    }
                });
            });
        }
        
        setupKeyboardNavigation() {
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                link.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        link.click();
                    }
                });
            });
        }
    }
    
    // === ENHANCED ANIMATION CONTROLLER ===
    class EnhancedAnimationController {
        constructor() {
            this.observerOptions = {
                root: null,
                rootMargin: '0px 0px -100px 0px',
                threshold: [0, 0.1, 0.5, 1]
            };
            
            this.intersectionObserver = null;
            this.animatedElements = new Set();
            
            this.init();
        }
        
        init() {
            this.setupIntersectionObserver();
            this.setupScrollAnimations();
            this.setupCounterAnimations();
            this.setupParallaxEffect();
            this.setupHeroAnimations();
        }
        
        setupIntersectionObserver() {
            if ('IntersectionObserver' in window) {
                this.intersectionObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                            this.animateElement(entry.target);
                            this.animatedElements.add(entry.target);
                            this.intersectionObserver.unobserve(entry.target);
                        }
                    });
                }, this.observerOptions);
            }
        }
        
        setupScrollAnimations() {
            const animatedElements = document.querySelectorAll(
                '.service-card, .testimonial-card, .feature-item, .team-member, .about-content, .section-header'
            );
            
            if (this.intersectionObserver) {
                animatedElements.forEach((el, index) => {
                    // Add staggered delay
                    el.style.animationDelay = `${index * 0.1}s`;
                    this.intersectionObserver.observe(el);
                });
            }
        }
        
        animateElement(element) {
            element.classList.add('fade-in');
            
            // Add additional animations based on element type
            if (element.classList.contains('service-card')) {
                element.style.transform = 'translateY(0)';
                element.style.opacity = '1';
            }
        }
        
        setupCounterAnimations() {
            const counters = document.querySelectorAll('.stat-number[data-target], .counter[data-target]');
            
            if (this.intersectionObserver) {
                counters.forEach(counter => {
                    this.intersectionObserver.observe(counter);
                    counter.addEventListener('animationstart', () => {
                        this.animateCounter(counter);
                    });
                });
            }
        }
        
        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-target') || element.textContent);
            const duration = parseInt(element.getAttribute('data-duration')) || 2000;
            const startTime = performance.now();
            const startValue = 0;
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Enhanced easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.round(startValue + (target - startValue) * easeOutQuart);
                
                // Format number with commas
                element.textContent = currentValue.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target.toLocaleString();
                }
            };
            
            requestAnimationFrame(updateCounter);
        }
        
        setupParallaxEffect() {
            const parallaxElements = document.querySelectorAll('.hero, .parallax-bg');
            
            if (parallaxElements.length === 0 || window.innerWidth <= 768) return;
            
            const handleParallax = utils.throttle(() => {
                const scrolled = window.pageYOffset;
                
                parallaxElements.forEach(element => {
                    const speed = element.getAttribute('data-speed') || 0.5;
                    const yPos = -(scrolled * speed);
                    element.style.transform = `translate3d(0, ${yPos}px, 0)`;
                });
            }, 16);
            
            window.addEventListener('scroll', handleParallax, { passive: true });
        }
        
        setupHeroAnimations() {
            const heroElements = document.querySelectorAll('.hero-logo, .hero-content h1, .hero-subtitle, .hero-cta, .discretion-notice');
            
            heroElements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 300 + (index * 200));
            });
        }
    }
    
    // === ENHANCED FORM HANDLER ===
    class EnhancedFormHandler {
        constructor() {
            this.forms = document.querySelectorAll('form');
            this.validationRules = {
                email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                phone: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                name: /^[a-zA-Z\s'-]{2,50}$/
            };
            
            this.init();
        }
        
        init() {
            this.setupFormValidation();
            this.setupFormSubmission();
            this.setupServiceDependencies();
            this.setupPhoneFormatting();
            this.setupRealTimeValidation();
            this.handleURLParameters();
        }
        
        setupFormValidation() {
            this.forms.forEach(form => {
                const inputs = form.querySelectorAll('input, select, textarea');
                
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', utils.debounce(() => this.clearFieldError(input), 300));
                });
                
                form.addEventListener('submit', (e) => {
                    if (!this.validateForm(form)) {
                        e.preventDefault();
                        this.focusFirstErrorField(form);
                    }
                });
            });
        }
        
        validateField(field) {
            const value = field.value.trim();
            const fieldType = field.type;
            const fieldName = field.name;
            let isValid = true;
            let errorMessage = '';
            
            // Required field validation
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = `${this.getFieldLabel(field)} is required.`;
            }
            
            // Type-specific validation
            if (value && isValid) {
                switch (fieldType) {
                    case 'email':
                        if (!this.validationRules.email.test(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid email address.';
                        }
                        break;
                    case 'tel':
                        if (!this.validationRules.phone.test(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid phone number.';
                        }
                        break;
                    case 'text':
                        if (fieldName.includes('name') || fieldName.includes('Name')) {
                            if (!this.validationRules.name.test(value)) {
                                isValid = false;
                                errorMessage = 'Please enter a valid name (2-50 characters, letters only).';
                            }
                        }
                        break;
                }
            }
            
            // Custom validation rules
            if (field.hasAttribute('data-min-length')) {
                const minLength = parseInt(field.getAttribute('data-min-length'));
                if (value.length < minLength) {
                    isValid = false;
                    errorMessage = `Must be at least ${minLength} characters long.`;
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
            
            // Service-specific validation
            if (form.id === 'consultationForm') {
                if (!this.validateServiceSelection(form)) {
                    isFormValid = false;
                }
            }
            
            return isFormValid;
        }
        
        validateServiceSelection(form) {
            const serviceCheckboxes = form.querySelectorAll('input[name="services[]"]:checked');
            const poolCleaning = form.querySelector('input[value="pool-cleaning"]:checked');
            const primaryServices = form.querySelectorAll('input[name="services[]"]:checked:not([value="pool-cleaning"])');
            
            if (serviceCheckboxes.length === 0) {
                this.showFormError('Please select at least one service.');
                return false;
            }
            
            if (poolCleaning && primaryServices.length === 0) {
                this.showFormError('Pool cleaning services require a primary service (lifeguarding or instruction).');
                return false;
            }
            
            return true;
        }
        
        showFieldValidation(field, isValid, message) {
            const fieldContainer = field.closest('.form-group') || field.parentNode;
            let errorElement = fieldContainer.querySelector('.field-error');
            
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                fieldContainer.appendChild(errorElement);
            }
            
            field.classList.remove('error', 'valid');
            
            if (isValid) {
                field.classList.add('valid');
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            } else {
                field.classList.add('error');
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }
        
        clearFieldError(field) {
            field.classList.remove('error');
            const fieldContainer = field.closest('.form-group') || field.parentNode;
            const errorElement = fieldContainer.querySelector('.field-error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        }
        
        getFieldLabel(field) {
            const label = field.closest('.form-group')?.querySelector('label');
            return label ? label.textContent.replace('*', '').trim() : field.name;
        }
        
        focusFirstErrorField(form) {
            const firstErrorField = form.querySelector('.error');
            if (firstErrorField) {
                firstErrorField.focus();
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
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
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton?.textContent;
            
            // Show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            }
            
            try {
                // Prepare consultation data
                const consultationData = {
                    consultation_id: utils.generateConsultationId(),
                    timestamp: new Date().toISOString(),
                    client_info: {
                        first_name: formData.get('firstName'),
                        last_name: formData.get('lastName'),
                        email: formData.get('email'),
                        phone: utils.formatPhone(formData.get('phone')),
                        estate_location: formData.get('estateLocation'),
                        property_type: formData.get('propertyType') || 'private-residence'
                    },
                    service_details: {
                        services: formData.getAll('services[]'),
                        timeline: formData.get('timeline') || 'within-month',
                        urgency: formData.get('urgency') || 'standard',
                        requirements: formData.get('details') || '',
                        budget_range: formData.get('budgetRange') || 'not-specified'
                    },
                    metadata: {
                        client_tier: this.determineClientTier(formData.get('estateLocation'), formData.get('propertyType')),
                        estimated_value: this.estimateConsultationValue(formData.getAll('services[]'), formData.get('estateLocation')),
                        submission_source: 'website',
                        user_agent: navigator.userAgent,
                        referrer: document.referrer,
                        utm_parameters: this.extractUTMParameters()
                    }
                };
                
                // Submit to backend
                await this.submitConsultationData(consultationData);
                
                // Show success
                this.showSuccessModal(consultationData);
                
                // Reset form
                form.reset();
                this.clearAllFieldErrors(form);
                
                // Track conversion
                this.trackConsultationSubmission(consultationData);
                
            } catch (error) {
                console.error('Consultation submission error:', error);
                this.showFormError('Unable to submit your consultation request. Please try again or call us directly at ' + CONFIG.PHONE_NUMBER);
            } finally {
                // Restore button state
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            }
        }
        
        async submitConsultationData(data) {
            // This would integrate with your backend API
            const response = await fetch('/api/consultation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        }
        
        determineClientTier(location, propertyType) {
            const platinumLocations = ['beverly-hills', 'manhattan-beach', 'newport-beach', 'malibu', 'hidden-hills'];
            const goldLocations = ['westlake-village', 'calabasas', 'thousand-oaks'];
            const luxuryProperties = ['private-estate', 'luxury-residence', 'waterfront-property'];
            
            if (platinumLocations.includes(location) && luxuryProperties.includes(propertyType)) {
                return 'platinum';
            } else if (platinumLocations.includes(location) || goldLocations.includes(location)) {
                return 'gold';
            } else {
                return 'silver';
            }
        }
        
        estimateConsultationValue(services, location) {
            const serviceValues = {
                'private-lifeguarding': 800,
                'swim-instruction': 500,
                'event-management': 600,
                'pool-cleaning': 300,
                'water-safety': 250,
                'special-needs': 450,
                'ongoing-coverage': 1200
            };
            
            const locationMultipliers = {
                'beverly-hills': 2.2,
                'manhattan-beach': 2.0,
                'newport-beach': 1.9,
                'malibu': 2.1,
                'hidden-hills': 1.8,
                'calabasas': 1.6,
                'westlake-village': 1.4,
                'thousand-oaks': 1.2,
                'agoura-hills': 1.3
            };
            
            let totalValue = 0;
            services.forEach(service => {
                totalValue += serviceValues[service] || 200;
            });
            
            const multiplier = locationMultipliers[location] || 1.0;
            return Math.round(totalValue * multiplier);
        }
        
        extractUTMParameters() {
            const urlParams = utils.getUrlParams();
            return {
                utm_source: urlParams.get('utm_source'),
                utm_medium: urlParams.get('utm_medium'),
                utm_campaign: urlParams.get('utm_campaign'),
                utm_term: urlParams.get('utm_term'),
                utm_content: urlParams.get('utm_content')
            };
        }
        
        setupServiceDependencies() {
            const poolCleaningCheckbox = document.querySelector('input[value="pool-cleaning"]');
            if (!poolCleaningCheckbox) return;
            
            poolCleaningCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    const primaryServices = document.querySelectorAll('input[value="private-lifeguarding"], input[value="swim-instruction"]');
                    const hasPrimary = Array.from(primaryServices).some(service => service.checked);
                    
                    if (!hasRequired) {
                        alert('Pool cleaning services are exclusively available to clients who also utilize our lifeguarding or swimming instruction services. Please select one of these primary services as well.');
                        this.checked = false;
                        this.closest('.service-option')?.classList.remove('selected');
                    }
                }
            });
        }
        
        setupPhoneFormatting() {
            const phoneInputs = document.querySelectorAll('input[type="tel"]');
            
            phoneInputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                        e.target.value = utils.formatPhone(value);
                    } else {
                        e.target.value = utils.formatPhone(value.substr(0, 10));
                    }
                });
                
                input.addEventListener('keydown', (e) => {
                    // Allow: backspace, delete, tab, escape, enter
                    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                        (e.keyCode === 65 && e.ctrlKey === true) ||
                        (e.keyCode === 67 && e.ctrlKey === true) ||
                        (e.keyCode === 86 && e.ctrlKey === true) ||
                        (e.keyCode === 88 && e.ctrlKey === true) ||
                        // Allow: home, end, left, right
                        (e.keyCode >= 35 && e.keyCode <= 39)) {
                        return;
                    }
                    // Ensure that it is a number and stop the keypress
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                        e.preventDefault();
                    }
                });
            });
        }
        
        setupRealTimeValidation() {
            const emailInputs = document.querySelectorAll('input[type="email"]');
            
            emailInputs.forEach(input => {
                input.addEventListener('input', utils.debounce((e) => {
                    const value = e.target.value.trim();
                    if (value && !utils.isValidEmail(value)) {
                        this.showFieldValidation(input, false, 'Please enter a valid email address.');
                    } else if (value) {
                        this.showFieldValidation(input, true, '');
                    }
                }, 500));
            });
        }
        
        handleURLParameters() {
            const urlParams = utils.getUrlParams();
            const serviceParam = urlParams.get('service');
            
            if (serviceParam) {
                const serviceMapping = {
                    'lifeguarding': 'private-lifeguarding',
                    'instruction': 'swim-instruction',
                    'events': 'event-management',
                    'pool-cleaning': 'pool-cleaning',
                    'hoa': 'hoa-services'
                };
                
                const serviceValue = serviceMapping[serviceParam];
                if (serviceValue) {
                    const checkbox = document.querySelector(`input[value="${serviceValue}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        checkbox.dispatchEvent(new Event('change'));
                        
                        // Visual feedback
                        const serviceOption = checkbox.closest('.service-option');
                        if (serviceOption) {
                            serviceOption.classList.add('selected');
                            serviceOption.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }
                }
            }
        }
        
        showSuccessModal(data) {
            const modal = document.getElementById('successModal') || this.createSuccessModal();
            const consultationId = modal.querySelector('#consultationIdDisplay');
            
            if (consultationId) {
                consultationId.textContent = data.consultation_id;
            }
            
            modal.style.display = 'flex';
            
            // Auto-close after 10 seconds
            setTimeout(() => {
                modal.style.display = 'none';
            }, 10000);
        }
        
        createSuccessModal() {
            const modal = document.createElement('div');
            modal.id = 'successModal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-check-circle"></i> Consultation Request Submitted</h3>
                        <button onclick="this.closest('.modal-overlay').style.display='none'" class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Thank you for your interest in our premium aquatic services. Your consultation request has been successfully submitted.</p>
                        <p><strong>Consultation ID:</strong> <span id="consultationIdDisplay"></span></p>
                        <p>Our concierge team will contact you within 24 hours to schedule your private consultation.</p>
                    </div>
                    <div class="modal-footer">
                        <button onclick="this.closest('.modal-overlay').style.display='none'" class="btn-primary">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            return modal;
        }
        
        showFormError(message) {
            const errorContainer = document.getElementById('form-error') || this.createErrorContainer();
            errorContainer.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-triangle"></i> 
                    ${message}
                </div>
            `;
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        createErrorContainer() {
            const container = document.createElement('div');
            container.id = 'form-error';
            container.className = 'form-error-container';
            
            const form = document.getElementById('consultationForm');
            if (form) {
                form.parentNode.insertBefore(container, form);
            }
            
            return container;
        }
        
        clearAllFieldErrors(form) {
            const errorElements = form.querySelectorAll('.field-error');
            errorElements.forEach(error => {
                error.textContent = '';
                error.style.display = 'none';
            });
            
            const fields = form.querySelectorAll('.error, .valid');
            fields.forEach(field => {
                field.classList.remove('error', 'valid');
            });
        }
        
        trackConsultationSubmission(data) {
            // Google Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'consultation_submission', {
                    'consultation_id': data.consultation_id,
                    'services': data.service_details.services.join(','),
                    'client_tier': data.metadata.client_tier,
                    'estimated_value': data.metadata.estimated_value
                });
            }
            
            // Facebook Pixel tracking
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead', {
                    content_name: 'Consultation Request',
                    content_category: 'Luxury Aquatic Services',
                    value: data.metadata.estimated_value
                });
            }
        }
    }
    
    // === ENHANCED INTERACTIVE ELEMENTS ===
    class EnhancedInteractiveElements {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupServiceOptions();
            this.setupFAQAccordion();
            this.setupTestimonialSlider();
            this.setupSmoothScrolling();
            this.setupModalHandlers();
            this.setupImageLazyLoading();
            this.setupHoverEffects();
        }
        
        setupServiceOptions() {
            const serviceOptions = document.querySelectorAll('.service-option');
            
            serviceOptions.forEach(option => {
                const checkbox = option.querySelector('input[type="checkbox"]');
                
                option.addEventListener('click', function(e) {
                    if (e.target.type !== 'checkbox') {
                        if (checkbox) {
                            checkbox.checked = !checkbox.checked;
                            checkbox.dispatchEvent(new Event('change'));
                        }
                    }
                    
                    this.classList.toggle('selected', checkbox?.checked);
                    this.setAttribute('aria-checked', checkbox?.checked || false);
                });
                
                // Enhanced keyboard support
                option.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
                
                // Initial state
                if (checkbox?.checked) {
                    option.classList.add('selected');
                    option.setAttribute('aria-checked', 'true');
                }
            });
        }
        
        setupFAQAccordion() {
            const faqItems = document.querySelectorAll('.faq-item');
            
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                const icon = question?.querySelector('i');
                
                if (!question || !answer) return;
                
                question.addEventListener('click', function() {
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    
                    // Close all other items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherQuestion = otherItem.querySelector('.faq-question');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            const otherIcon = otherQuestion?.querySelector('i');
                            
                            otherQuestion.setAttribute('aria-expanded', 'false');
                            otherAnswer.style.maxHeight = '0';
                            otherAnswer.setAttribute('aria-hidden', 'true');
                            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Toggle current item
                    if (isExpanded) {
                        this.setAttribute('aria-expanded', 'false');
                        answer.style.maxHeight = '0';
                        answer.setAttribute('aria-hidden', 'true');
                        if (icon) icon.style.transform = 'rotate(0deg)';
                        item.classList.remove('active');
                    } else {
                        this.setAttribute('aria-expanded', 'true');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        answer.setAttribute('aria-hidden', 'false');
                        if (icon) icon.style.transform = 'rotate(180deg)';
                        item.classList.add('active');
                    }
                });
            });
        }
        
        setupTestimonialSlider() {
            const testimonialContainer = document.querySelector('.testimonials-grid');
            const testimonialCards = document.querySelectorAll('.testimonial-card');
            
            if (testimonialCards.length <= 3) return;
            
            let currentSlide = 0;
            const totalSlides = Math.ceil(testimonialCards.length / 3);
            
            // Create navigation
            const nav = document.createElement('div');
            nav.className = 'testimonial-nav';
            testimonialContainer.parentNode.appendChild(nav);
            
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = `nav-dot ${i === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i));
                nav.appendChild(dot);
            }
            
            function goToSlide(slideIndex) {
                currentSlide = slideIndex;
                const offset = slideIndex * -100;
                testimonialContainer.style.transform = `translateX(${offset}%)`;
                
                // Update navigation
                nav.querySelectorAll('.nav-dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === slideIndex);
                });
            }
            
            // Auto-advance slides
            setInterval(() => {
                currentSlide = (currentSlide + 1) % totalSlides;
                goToSlide(currentSlide);
            }, 6000);
        }
        
        setupSmoothScrolling() {
            const scrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
            
            scrollLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    const targetId = this.getAttribute('href');
                    const target = document.querySelector(targetId);
                    
                    if (target) {
                        e.preventDefault();
                        utils.scrollTo(target);
                        
                        // Update URL without triggering scroll
                        if (history.pushState) {
                            history.pushState(null, null, targetId);
                        }
                    }
                });
            });
        }
        
        setupModalHandlers() {
            // Generic modal handling
            const modals = document.querySelectorAll('.modal-overlay');
            
            modals.forEach(modal => {
                // Close on background click
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        this.style.display = 'none';
                    }
                });
                
                // Close on escape key
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && modal.style.display === 'flex') {
                        modal.style.display = 'none';
                    }
                });
                
                // Close button handling
                const closeButtons = modal.querySelectorAll('.modal-close, [data-modal-close]');
                closeButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                });
            });
        }
        
        setupImageLazyLoading() {
            const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                            }
                            
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    });
                }, {
                    rootMargin: '50px 0px'
                });
                
                images.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback for browsers without IntersectionObserver
                images.forEach(img => {
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                });
            }
        }
        
        setupHoverEffects() {
            // Enhanced service card hover effects
            const serviceCards = document.querySelectorAll('.service-card');
            
            serviceCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-12px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
            
            // Button hover effects
            const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
            
            buttons.forEach(button => {
                button.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                });
                
                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        }
    }
    
    // === PERFORMANCE OPTIMIZER ===
    class EnhancedPerformanceOptimizer {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupImageOptimization();
            this.setupVideoOptimization();
            this.setupFontOptimization();
            this.setupCriticalResourcePreloading();
            this.setupServiceWorker();
        }
        
        setupImageOptimization() {
            // WebP support detection and fallback
            const supportsWebP = this.checkWebPSupport();
            
            if (supportsWebP) {
                const images = document.querySelectorAll('img[data-webp]');
                images.forEach(img => {
                    img.src = img.dataset.webp;
                });
            }
            
            // Responsive image loading
            this.setupResponsiveImages();
        }
        
        checkWebPSupport() {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        
        setupResponsiveImages() {
            const images = document.querySelectorAll('img[data-sizes]');
            
            images.forEach(img => {
                const sizes = JSON.parse(img.dataset.sizes);
                const screenWidth = window.innerWidth;
                
                let selectedSize = sizes.default;
                for (const [breakpoint, src] of Object.entries(sizes)) {
                    if (breakpoint !== 'default' && screenWidth <= parseInt(breakpoint)) {
                        selectedSize = src;
                        break;
                    }
                }
                
                if (img.src !== selectedSize) {
                    img.src = selectedSize;
                }
            });
            
            // Update on resize
            window.addEventListener('resize', utils.debounce(() => {
                this.setupResponsiveImages();
            }, 250));
        }
        
        setupVideoOptimization() {
            const videos = document.querySelectorAll('video');
            
            videos.forEach(video => {
                // Intersection observer for video playback
                const videoObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            video.play().catch(() => {
                                // Autoplay blocked, add play button
                                this.addVideoPlayButton(video);
                            });
                        } else {
                            video.pause();
                        }
                    });
                }, { threshold: 0.5 });
                
                videoObserver.observe(video);
            });
        }
        
        addVideoPlayButton(video) {
            const playButton = document.createElement('button');
            playButton.className = 'video-play-button';
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            playButton.addEventListener('click', () => {
                video.play();
                playButton.style.display = 'none';
            });
            
            video.parentNode.style.position = 'relative';
            video.parentNode.appendChild(playButton);
        }
        
        setupFontOptimization() {
            // Font display swap for better performance
            const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
            fontLinks.forEach(link => {
                if (!link.href.includes('display=swap')) {
                    link.href += '&display=swap';
                }
            });
        }
        
        setupCriticalResourcePreloading() {
            const criticalResources = [
                { href: '/images/hero/hero-luxury-estate-1600x1200.jpg', as: 'image' },
                { href: '/images/805-lifeguard-logo.png', as: 'image' },
                { href: '/css/luxury-theme.css', as: 'style' }
            ];
            
            criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = resource.as;
                link.href = resource.href;
                document.head.appendChild(link);
            });
        }
        
        setupServiceWorker() {
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                        .then(registration => {
                            console.log('SW registered: ', registration);
                        })
                        .catch(registrationError => {
                            console.log('SW registration failed: ', registrationError);
                        });
                });
            }
        }
    }
    
    // === MAIN APPLICATION CLASS ===
    class EnhancedLuxuryApp {
        constructor() {
            this.navigation = null;
            this.animations = null;
            this.forms = null;
            this.interactive = null;
            this.performance = null;
            this.isInitialized = false;
            
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
                console.log('Initializing 805 LifeGuard Enhanced Luxury App...');
                
                // Initialize core components
                this.navigation = new EnhancedNavigation();
                this.animations = new EnhancedAnimationController();
                this.forms = new EnhancedFormHandler();
                this.interactive = new EnhancedInteractiveElements();
                this.performance = new EnhancedPerformanceOptimizer();
                
                // Page-specific initialization
                this.initializePageSpecific();
                
                // Update phone numbers and portal links
                this.updateContactInformation();
                
                // Handle URL parameters
                this.handleURLParameters();
                
                this.isInitialized = true;
                console.log('805 LifeGuard Enhanced Luxury App initialized successfully');
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('luxuryAppInitialized', {
                    detail: { app: this }
                }));
                
            } catch (error) {
                console.error('Error initializing Enhanced Luxury App:', error);
                this.handleInitializationError(error);
            }
        }
        
        initializePageSpecific() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            switch (currentPage) {
                case 'index.html':
                case '':
                    this.initializeHomePage();
                    break;
                case 'contact.html':
                    this.initializeContactPage();
                    break;
                case 'testimonials.html':
                    this.initializeTestimonialsPage();
                    break;
                case 'hoa.html':
                    this.initializeHOAPage();
                    break;
                default:
                    console.log(`Page-specific initialization not defined for: ${currentPage}`);
            }
        }
        
        initializeHomePage() {
            console.log('Homepage specific initialization');
            
            // Enhanced hero animations
            this.setupHeroAnimations();
            
            // Service card interactions
            this.setupServiceCardAnimations();
        }
        
        initializeContactPage() {
            console.log('Contact page specific initialization');
            
            // Focus management
            const firstInput = document.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 500);
            }
        }
        
        initializeTestimonialsPage() {
            console.log('Testimonials page specific initialization');
            
            // Dynamic testimonial loading
            this.loadDynamicTestimonials();
        }
        
        initializeHOAPage() {
            console.log('HOA page specific initialization');
            
            // HOA-specific animations and interactions
            this.setupHOAInteractions();
        }
        
        setupHeroAnimations() {
            const heroElements = document.querySelectorAll('.hero-logo, .hero-content h1, .hero-subtitle, .hero-cta, .discretion-notice');
            
            heroElements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    element.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 300 + (index * 150));
            });
        }
        
        setupServiceCardAnimations() {
            const serviceCards = document.querySelectorAll('.service-card');
            
            serviceCards.forEach((card, index) => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                entry.target.classList.add('animate-in');
                            }, index * 100);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
                
                observer.observe(card);
            });
        }
        
        loadDynamicTestimonials() {
            // This would integrate with your testimonial API
            console.log('Loading dynamic testimonials...');
        }
        
        setupHOAInteractions() {
            // HOA-specific functionality
            const packageCards = document.querySelectorAll('.package-card');
            
            packageCards.forEach(card => {
                card.addEventListener('click', function() {
                    // Handle package selection
                    packageCards.forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
        }
        
        updateContactInformation() {
            // Update all phone numbers
            const phoneElements = document.querySelectorAll('a[href^="tel:"], .phone-number, [data-phone]');
            phoneElements.forEach(element => {
                if (element.tagName === 'A') {
                    element.href = `tel:+1${CONFIG.PHONE_NUMBER.replace(/\D/g, '')}`;
                    element.textContent = CONFIG.PHONE_NUMBER;
                } else {
                    element.textContent = CONFIG.PHONE_NUMBER;
                }
            });
            
            // Update portal links
            const portalLinks = document.querySelectorAll('a[href*="805companies.com"], a[href*="805lifeguard.com/portal"]');
            portalLinks.forEach(link => {
                const href = link.href;
                if (href.includes('client')) {
                    link.href = CONFIG.PORTAL_DOMAINS.CLIENT;
                } else if (href.includes('admin')) {
                    link.href = CONFIG.PORTAL_DOMAINS.ADMIN;
                } else if (href.includes('staff')) {
                    link.href = CONFIG.PORTAL_DOMAINS.STAFF;
                }
            });
        }
        
        handleURLParameters() {
            const urlParams = utils.getUrlParams();
            
            // Handle scroll to section
            const scrollTo = urlParams.get('scrollTo');
            if (scrollTo) {
                setTimeout(() => {
                    const target = document.getElementById(scrollTo);
                    if (target) {
                        utils.scrollTo(target);
                    }
                }, 1000);
            }
            
            // Handle referrer tracking
            const referrer = urlParams.get('ref');
            if (referrer) {
                utils.storage.set('referrer', referrer);
            }
        }
        
        handleInitializationError(error) {
            // Graceful degradation
            console.warn('App initialization failed, enabling fallback functionality');
            
            // Basic fallback functionality
            this.setupBasicNavigation();
            this.setupBasicForms();
        }
        
        setupBasicNavigation() {
            const mobileToggle = document.getElementById('mobileMenuToggle');
            const navLinks = document.getElementById('navLinks');
            
            if (mobileToggle && navLinks) {
                mobileToggle.addEventListener('click', () => {
                    navLinks.classList.toggle('active');
                });
            }
        }
        
        setupBasicForms() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    const requiredFields = form.querySelectorAll('[required]');
                    let isValid = true;
                    
                    requiredFields.forEach(field => {
                        if (!field.value.trim()) {
                            isValid = false;
                            field.style.borderColor = 'red';
                        } else {
                            field.style.borderColor = '';
                        }
                    });
                    
                    if (!isValid) {
                        e.preventDefault();
                        alert('Please fill in all required fields.');
                    }
                });
            });
        }
        
        // Public API methods
        getVersion() {
            return '3.0';
        }
        
        isReady() {
            return this.isInitialized;
        }
        
        reinitialize() {
            if (this.isInitialized) {
                this.initializeComponents();
            }
        }
    }
    
    // === GLOBAL ERROR HANDLING ===
    window.addEventListener('error', function(e) {
        console.error('Global JavaScript error:', e.error);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                'description': e.error.toString(),
                'fatal': false
            });
        }
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                'description': e.reason.toString(),
                'fatal': false
            });
        }
    });
    
    // === GLOBAL EXPORTS ===
    window.LuxuryApp = EnhancedLuxuryApp;
    window.utils = utils;
    window.CONFIG = CONFIG;
    
    // Initialize the application
    const app = new EnhancedLuxuryApp();
    
    // Export to global scope for debugging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.app = app;
        console.log('Debug mode: App instance available as window.app');
    }
    
})();