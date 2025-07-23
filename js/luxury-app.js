/**
 * 805 LifeGuard - Complete Luxury Frontend JavaScript
 * Handles all interactions, API calls, and luxury UX across all pages
 * Updated with comprehensive functionality and D1 database integration
 */

// Configuration
const CONFIG = {
    API_BASE: 'https://805companies-luxury-api.jaspervdz.workers.dev',
    ENDPOINTS: {
        consultation: '/api/luxury/consultation',
        health: '/api/luxury/health',
        status: '/api/luxury/consultation/status'
    }
};

/**
 * Enhanced Mobile Navigation Handler
 */
class MobileNavigation {
    constructor() {
        this.toggle = document.getElementById('mobileMenuToggle');
        this.navLinks = document.getElementById('navLinks');
        this.header = document.querySelector('.header');
        this.init();
    }
    
    init() {
        if (this.toggle && this.navLinks) {
            this.toggle.addEventListener('click', () => this.toggleMenu());
            
            this.navLinks.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
            
            document.addEventListener('click', (e) => {
                if (!this.toggle.contains(e.target) && 
                    !this.navLinks.contains(e.target) && 
                    this.navLinks.classList.contains('active')) {
                    this.closeMenu();
                }
            });
            
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.closeMenu();
                }
            });
            
            // Handle escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.navLinks.classList.contains('active')) {
                    this.closeMenu();
                    this.toggle.focus();
                }
            });
        }
    }
    
    toggleMenu() {
        const isActive = this.navLinks.classList.contains('active');
        if (isActive) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.toggle.classList.add('active');
        this.navLinks.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const firstLink = this.navLinks.querySelector('.nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
        
        // ARIA updates
        this.toggle.setAttribute('aria-expanded', 'true');
        this.navLinks.setAttribute('aria-hidden', 'false');
    }
    
    closeMenu() {
        this.toggle.classList.remove('active');
        this.navLinks.classList.remove('active');
        document.body.style.overflow = '';
        
        // ARIA updates
        this.toggle.setAttribute('aria-expanded', 'false');
        this.navLinks.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Enhanced Header Scroll Effects
 */
class HeaderScrollEffects {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        this.init();
    }
    
    init() {
        if (!this.header) return;
        
        window.addEventListener('scroll', () => this.requestTick(), { passive: true });
        this.handleScroll(); // Initial call
    }
    
    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.handleScroll());
            this.ticking = true;
        }
    }
    
    handleScroll() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            this.header.style.background = 'rgba(248, 246, 240, 0.98)';
            this.header.style.boxShadow = '0 4px 20px rgba(10, 22, 40, 0.1)';
        } else {
            this.header.style.background = 'rgba(248, 246, 240, 0.95)';
            this.header.style.boxShadow = 'none';
        }
        
        this.lastScrollY = currentScrollY;
        this.ticking = false;
    }
}

/**
 * Enhanced Luxury Consultation Form Handler
 */
class LuxuryConsultationForm {
    constructor() {
        this.form = document.getElementById('consultationForm');
        this.messageAlert = document.getElementById('message-alert');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.submitBtn = document.getElementById('submitBtn');
        this.successModal = document.getElementById('successModal');
        
        this.isSubmitting = false;
        this.formData = {};
        this.validationRules = {};
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupFormEnhancements();
        this.setupFormValidation();
        this.setupAutoSave();
        this.preloadServiceSelection();
        this.setupAccessibility();
        console.log('🎯 Luxury Consultation Form initialized');
    }
    
    /**
     * Handle form submission with luxury UX
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const formData = new FormData(this.form);
        const data = this.serializeFormData(formData);
        
        // Validate form data
        const validation = this.validateFormData(data);
        if (!validation.isValid) {
            this.showError(validation.message);
            this.focusFirstError(validation.field);
            return;
        }
        
        try {
            this.startSubmission();
            
            const response = await this.submitToAPI(data);
            
            if (response.success) {
                this.handleSuccessfulSubmission(response);
            } else {
                throw new Error(response.error || 'Submission failed');
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            this.handleSubmissionError(error);
        } finally {
            this.endSubmission();
        }
    }
    
    /**
     * Submit to API with retry logic
     */
    async submitToAPI(data, retryCount = 0) {
        const maxRetries = 3;
        
        try {
            // Generate consultation ID
            const consultationId = this.generateConsultationId();
            data.consultation_id = consultationId;
            
            // Enhance data for luxury service
            const enhancedData = this.enhanceSubmissionData(data);
            
            console.log('🚀 Submitting consultation request:', { id: consultationId, services: data.services });
            
            const response = await fetch(`${CONFIG.API_BASE}${CONFIG.ENDPOINTS.consultation}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(enhancedData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            if (retryCount < maxRetries && (error.name === 'TypeError' || error.message.includes('fetch'))) {
                // Network error, retry after delay
                console.log(`🔄 Retrying submission (${retryCount + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return this.submitToAPI(data, retryCount + 1);
            }
            throw error;
        }
    }
    
    /**
     * Generate unique consultation ID
     */
    generateConsultationId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `LUXURY-${timestamp}-${random}`;
    }
    
    /**
     * Enhance submission data for luxury service
     */
    enhanceSubmissionData(data) {
        // Determine client tier based on location and services
        const clientTier = this.determineClientTier(data);
        const priority = this.determinePriority(data);
        const estimatedValue = this.estimateServiceValue(data);
        
        return {
            ...data,
            client_tier: clientTier,
            priority_level: priority,
            estimated_value: estimatedValue,
            submission_source: 'luxury-website',
            user_agent: navigator.userAgent,
            referrer: document.referrer || 'direct',
            timestamp: new Date().toISOString(),
            services: JSON.stringify(data.services || [])
        };
    }
    
    /**
     * Determine client tier based on property location and services
     */
    determineClientTier(data) {
        const luxuryLocations = [
            'beverly-hills', 'manhattan-beach', 'newport-beach', 
            'palos-verdes', 'laguna-beach', 'malibu', 'hidden-hills'
        ];
        
        const premiumServices = ['corporate-events', 'special-needs'];
        const hasLuxuryLocation = luxuryLocations.includes(data.estateLocation);
        const hasPremiumServices = data.services?.some(service => premiumServices.includes(service));
        
        if (hasLuxuryLocation || hasPremiumServices) {
            return 'platinum';
        } else if (data.services?.length >= 3) {
            return 'gold';
        } else {
            return 'standard';
        }
    }
    
    /**
     * Determine priority level
     */
    determinePriority(data) {
        const urgentTimeframes = ['immediate', '1-2-weeks'];
        const highValueBudgets = ['5000-plus', 'monthly-retainer', 'custom-proposal'];
        
        if (urgentTimeframes.includes(data.timeframe) || highValueBudgets.includes(data.budget)) {
            return 'high';
        } else if (data.services?.length >= 2) {
            return 'medium';
        } else {
            return 'normal';
        }
    }
    
    /**
     * Estimate service value
     */
    estimateServiceValue(data) {
        const baseValues = {
            'private-lifeguarding': 1500,
            'swim-instruction': 800,
            'event-management': 2500,
            'water-safety': 500,
            'special-needs': 1200,
            'corporate-events': 3500
        };
        
        const locationMultipliers = {
            'beverly-hills': 2.0,
            'malibu': 1.8,
            'manhattan-beach': 1.6,
            'newport-beach': 1.6,
            'hidden-hills': 1.5,
            'calabasas': 1.3,
            'westlake-village': 1.2
        };
        
        let totalValue = 0;
        if (data.services) {
            data.services.forEach(service => {
                totalValue += baseValues[service] || 500;
            });
        }
        
        const multiplier = locationMultipliers[data.estateLocation] || 1.0;
        return Math.round(totalValue * multiplier);
    }
    
    /**
     * Serialize form data with special handling for checkboxes
     */
    serializeFormData(formData) {
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (key === 'services[]') {
                if (!data.services) data.services = [];
                data.services.push(value);
            } else {
                data[key] = value.trim();
            }
        }
        
        return data;
    }
    
    /**
     * Comprehensive form validation
     */
    validateFormData(data) {
        // Required field validation
        const required = ['firstName', 'lastName', 'email', 'phone', 'estateLocation'];
        for (const field of required) {
            if (!data[field] || data[field] === '') {
                return {
                    isValid: false,
                    message: `Please provide your ${this.formatFieldName(field)}.`,
                    field
                };
            }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return {
                isValid: false,
                message: 'Please provide a valid email address.',
                field: 'email'
            };
        }
        
        // Phone validation
        const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,}$/;
        const cleanPhone = data.phone.replace(/[\s\-\(\)]/g, '');
        if (cleanPhone.length < 10 || !phoneRegex.test(data.phone)) {
            return {
                isValid: false,
                message: 'Please provide a valid phone number.',
                field: 'phone'
            };
        }
        
        // Name validation
        const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
        if (!nameRegex.test(data.firstName) || !nameRegex.test(data.lastName)) {
            return {
                isValid: false,
                message: 'Please provide valid names using only letters, spaces, hyphens, and apostrophes.',
                field: !nameRegex.test(data.firstName) ? 'firstName' : 'lastName'
            };
        }
        
        return { isValid: true };
    }
    
    /**
     * Format field names for user-friendly display
     */
    formatFieldName(field) {
        const fieldNames = {
            firstName: 'first name',
            lastName: 'last name',
            email: 'email address',
            phone: 'phone number',
            estateLocation: 'estate location'
        };
        return fieldNames[field] || field.replace(/([A-Z])/g, ' $1').toLowerCase();
    }
    
    /**
     * Focus first error field for accessibility
     */
    focusFirstError(fieldName) {
        if (fieldName) {
            const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.focus();
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    /**
     * Handle successful form submission
     */
    handleSuccessfulSubmission(result) {
        const consultationId = result.consultationId || result.consultation_id || this.formData.consultation_id;
        
        const message = `
            <strong>Consultation Request Received</strong><br>
            ${result.message || 'Thank you for your consultation request. Our concierge team will contact you within 4 business hours.'}<br>
            <small>Consultation ID: ${consultationId}</small>
        `;
        
        this.showSuccess(message);
        this.form.reset();
        this.resetServiceOptions();
        this.clearFormData();
        
        // Store consultation ID
        if (consultationId) {
            localStorage.setItem('lastConsultationId', consultationId);
            localStorage.setItem('consultationTimestamp', new Date().toISOString());
        }
        
        // Show success modal if available
        if (this.successModal) {
            this.showSuccessModal(result);
        }
        
        // Enhanced analytics tracking
        this.trackConsultationSubmission(result);
        
        // Auto-hide success message after 10 seconds
        setTimeout(() => {
            this.hideMessage();
        }, 10000);
        
        console.log('✅ Consultation submitted successfully:', consultationId);
    }
    
    /**
     * Show success modal
     */
    showSuccessModal(result) {
        const modal = this.successModal;
        const messageEl = document.getElementById('successMessage');
        const idEl = document.getElementById('consultationIdDisplay');
        
        if (messageEl) {
            messageEl.textContent = result.message || 'Thank you for your consultation request. Our concierge team will contact you within 4 business hours.';
        }
        
        if (idEl) {
            idEl.textContent = result.consultationId || result.consultation_id || 'LUXURY-' + Date.now();
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const continueBtn = modal.querySelector('.btn-primary');
        if (continueBtn) {
            setTimeout(() => continueBtn.focus(), 100);
        }
    }
    
    /**
     * Handle submission errors gracefully
     */
    handleSubmissionError(error) {
        let message = 'We apologize for the inconvenience. Please contact our concierge team directly at <strong>(805) 805-1234</strong> for immediate assistance.';
        
        if (error.message.includes('fetch') || error.message.includes('network')) {
            message = 'Connection issue detected. Please check your internet connection and try again, or call <strong>(805) 805-1234</strong>.';
        } else if (error.message.includes('400')) {
            message = 'Please check your information and try again. If the problem persists, call <strong>(805) 805-1234</strong>.';
        } else if (error.message.includes('500')) {
            message = 'Our system is temporarily unavailable. Please call <strong>(805) 805-1234</strong> for immediate assistance.';
        }
        
        this.showError(message);
        
        // Log error for debugging
        console.error('❌ Form submission error:', {
            error: error.message,
            timestamp: new Date().toISOString(),
            formData: this.formData
        });
    }
    
    /**
     * Start submission state management
     */
    startSubmission() {
        this.isSubmitting = true;
        this.showLoading();
        
        if (this.submitBtn) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Request...';
            this.submitBtn.setAttribute('aria-label', 'Processing your consultation request');
        }
    }
    
    /**
     * End submission state management
     */
    endSubmission() {
        this.isSubmitting = false;
        this.hideLoading();
        
        if (this.submitBtn) {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Consultation Request';
            this.submitBtn.setAttribute('aria-label', 'Submit consultation request');
        }
    }
    
    /**
     * Enhanced form interactions and UX
     */
    setupFormEnhancements() {
        // Service option interactions
        const serviceOptions = document.querySelectorAll('.service-option');
        serviceOptions.forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            const label = option.querySelector('label');
            
            // Click handling
            option.addEventListener('click', (e) => {
                if (e.target !== checkbox && e.target !== label) {
                    checkbox.checked = !checkbox.checked;
                    this.updateServiceOptionDisplay(option, checkbox.checked);
                    this.saveFormData();
                }
            });
            
            // Checkbox change handling
            checkbox.addEventListener('change', (e) => {
                this.updateServiceOptionDisplay(option, e.target.checked);
                this.saveFormData();
            });
            
            // Keyboard navigation
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    this.updateServiceOptionDisplay(option, checkbox.checked);
                    this.saveFormData();
                }
            });
        });
        
        // Enhanced input animations
        this.setupInputAnimations();
        
        // Phone number formatting
        this.setupPhoneFormatting();
        
        // Character counters
        this.setupCharacterCounters();
    }
    
    /**
     * Update service option visual state
     */
    updateServiceOptionDisplay(option, isChecked) {
        if (isChecked) {
            option.style.borderColor = 'var(--luxury-gold)';
            option.style.background = 'rgba(212, 175, 55, 0.1)';
            option.setAttribute('aria-checked', 'true');
        } else {
            option.style.borderColor = '#E5E7EB';
            option.style.background = 'white';
            option.setAttribute('aria-checked', 'false');
        }
    }
    
    /**
     * Enhanced input animations and interactions
     */
    setupInputAnimations() {
        const inputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.transition = 'all 0.3s ease';
                e.target.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', (e) => {
                e.target.style.transform = 'scale(1)';
                e.target.parentElement.classList.remove('focused');
                this.saveFormData();
            });
            
            input.addEventListener('input', () => {
                this.saveFormData();
                this.clearFieldError(input);
            });
        });
    }
    
    /**
     * Phone number formatting
     */
    setupPhoneFormatting() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 10) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})/, '($1) $2-');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})/, '($1) ');
            }
            
            e.target.value = value;
        });
    }
    
    /**
     * Character counters for textarea
     */
    setupCharacterCounters() {
        const textareas = document.querySelectorAll('.form-textarea[maxlength]');
        
        textareas.forEach(textarea => {
            const maxLength = textarea.getAttribute('maxlength');
            const counter = document.createElement('div');
            counter.className = 'character-counter';
            counter.textContent = `0 / ${maxLength}`;
            
            textarea.parentElement.appendChild(counter);
            
            textarea.addEventListener('input', () => {
                const current = textarea.value.length;
                counter.textContent = `${current} / ${maxLength}`;
                
                if (current > maxLength * 0.9) {
                    counter.style.color = 'var(--coral-accent)';
                } else {
                    counter.style.color = 'var(--warm-gray)';
                }
            });
        });
    }
    
    /**
     * Real-time form validation
     */
    setupFormValidation() {
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const nameInputs = document.querySelectorAll('#firstName, #lastName');
        
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmailField(emailInput));
        }
        
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => this.validatePhoneField(phoneInput));
        }
        
        nameInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateNameField(input));
        });
    }
    
    /**
     * Email field validation with visual feedback
     */
    validateEmailField(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = input.value === '' || emailRegex.test(input.value);
        
        this.setFieldValidation(input, isValid, 'Please enter a valid email address');
    }
    
    /**
     * Phone field validation
     */
    validatePhoneField(input) {
        const cleanPhone = input.value.replace(/\D/g, '');
        const isValid = input.value === '' || cleanPhone.length >= 10;
        
        this.setFieldValidation(input, isValid, 'Please enter a valid phone number');
    }
    
    /**
     * Name field validation
     */
    validateNameField(input) {
        const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
        const isValid = input.value === '' || nameRegex.test(input.value);
        
        this.setFieldValidation(input, isValid, 'Please use only letters, spaces, hyphens, and apostrophes');
    }
    
    /**
     * Set field validation state
     */
    setFieldValidation(input, isValid, errorMessage) {
        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            input.setAttribute('aria-invalid', 'false');
            this.clearFieldError(input);
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            input.setAttribute('aria-invalid', 'true');
            this.showFieldError(input, errorMessage);
        }
    }
    
    /**
     * Show field error
     */
    showFieldError(input, message) {
        this.clearFieldError(input);
        
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        error.setAttribute('role', 'alert');
        
        input.parentElement.appendChild(error);
    }
    
    /**
     * Clear field error
     */
    clearFieldError(input) {
        const existingError = input.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        input.classList.remove('is-invalid', 'is-valid');
    }
    
    /**
     * Auto-save form data
     */
    setupAutoSave() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('change', () => this.saveFormData());
            input.addEventListener('input', this.debounce(() => this.saveFormData(), 1000));
        });
        
        // Load saved data on page load
        this.loadFormData();
    }
    
    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Save form data to localStorage
     */
    saveFormData() {
        const formData = new FormData(this.form);
        const data = this.serializeFormData(formData);
        this.formData = data;
        
        // Don't save sensitive data
        const saveData = { ...data };
        delete saveData.email;
        delete saveData.phone;
        
        localStorage.setItem('luxuryFormData', JSON.stringify(saveData));
        localStorage.setItem('formSaveTimestamp', new Date().toISOString());
    }
    
    /**
     * Load saved form data
     */
    loadFormData() {
        const savedData = localStorage.getItem('luxuryFormData');
        const saveTimestamp = localStorage.getItem('formSaveTimestamp');
        
        if (savedData && saveTimestamp) {
            const saveDate = new Date(saveTimestamp);
            const daysSinceSave = (new Date() - saveDate) / (1000 * 60 * 60 * 24);
            
            // Only load data if it's less than 7 days old
            if (daysSinceSave < 7) {
                try {
                    const data = JSON.parse(savedData);
                    this.populateForm(data);
                } catch (e) {
                    console.warn('Could not load saved form data:', e);
                }
            } else {
                this.clearFormData();
            }
        }
    }
    
    /**
     * Populate form with saved data
     */
    populateForm(data) {
        Object.keys(data).forEach(key => {
            if (key === 'services' && Array.isArray(data[key])) {
                data[key].forEach(value => {
                    const checkbox = this.form.querySelector(`[name="services[]"][value="${value}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        const option = checkbox.closest('.service-option');
                        if (option) {
                            this.updateServiceOptionDisplay(option, true);
                        }
                    }
                });
            } else {
                const element = this.form.querySelector(`[name="${key}"]`);
                if (element && data[key]) {
                    element.value = data[key];
                }
            }
        });
    }
    
    /**
     * Clear saved form data
     */
    clearFormData() {
        localStorage.removeItem('luxuryFormData');
        localStorage.removeItem('formSaveTimestamp');
        this.formData = {};
    }
    
    /**
     * Pre-load service selection based on URL params
     */
    preloadServiceSelection() {
        const urlParams = new URLSearchParams(window.location.search);
        const service = urlParams.get('service');
        
        if (service) {
            const serviceMap = {
                'lifeguarding': 'private-lifeguarding',
                'instruction': 'swim-instruction',
                'events': 'event-management',
                'safety': 'water-safety'
            };
            
            const mappedService = serviceMap[service];
            if (mappedService) {
                const checkbox = document.querySelector(`input[value="${mappedService}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    const option = checkbox.closest('.service-option');
                    if (option) {
                        this.updateServiceOptionDisplay(option, true);
                    }
                }
            }
        }
    }
    
    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA labels
        const form = this.form;
        if (form) {
            form.setAttribute('aria-label', 'Luxury consultation request form');
            form.setAttribute('novalidate', 'true');
        }
        
        // Service options accessibility
        const serviceOptions = document.querySelectorAll('.service-option');
        serviceOptions.forEach((option, index) => {
            option.setAttribute('role', 'checkbox');
            option.setAttribute('tabindex', '0');
            option.setAttribute('aria-checked', 'false');
            const label = option.querySelector('label');
            if (label) {
                option.setAttribute('aria-label', label.textContent);
            }
        });
        
        // Form sections
        const formSections = document.querySelectorAll('.form-group');
        formSections.forEach(section => {
            const label = section.querySelector('.form-label');
            const input = section.querySelector('input, select, textarea');
            
            if (label && input) {
                const labelId = 'label-' + Math.random().toString(36).substr(2, 9);
                label.id = labelId;
                input.setAttribute('aria-labelledby', labelId);
            }
        });
    }
    
    /**
     * Reset service options visual state
     */
    resetServiceOptions() {
        const serviceOptions = document.querySelectorAll('.service-option');
        serviceOptions.forEach(option => {
            option.style.borderColor = '#E5E7EB';
            option.style.background = 'white';
            option.setAttribute('aria-checked', 'false');
        });
    }
    
    /**
     * Track consultation submission for analytics
     */
    trackConsultationSubmission(result) {
        // Enhanced analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'luxury_consultation_submitted', {
                consultation_id: result.consultationId || result.consultation_id,
                client_tier: result.clientTier || 'standard',
                priority: result.priority || 'normal',
                services_selected: this.formData.services?.length || 0
            });
        }
        
        // Custom analytics
        if (window.luxuryAnalytics) {
            window.luxuryAnalytics.track('consultation_submitted', {
                consultationId: result.consultationId || result.consultation_id,
                timestamp: new Date().toISOString(),
                formData: this.formData
            });
        }
    }
    
    /**
     * Loading state management
     */
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }
    
    /**
     * Message display methods
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    showMessage(message, type) {
        if (!this.messageAlert) return;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
        
        this.messageAlert.innerHTML = `<i class="${icon}"></i> <div>${message}</div>`;
        this.messageAlert.className = `message-alert ${type} show`;
        
        // Smooth scroll to message
        this.messageAlert.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
        
        // Accessibility announcement
        this.messageAlert.setAttribute('role', 'alert');
        this.messageAlert.setAttribute('aria-live', 'assertive');
    }
    
    hideMessage() {
        if (this.messageAlert) {
            this.messageAlert.classList.remove('show');
        }
    }
}

/**
 * Portfolio Filter Handler
 */
class PortfolioFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.portfolioItems = document.querySelectorAll('.portfolio-item');
        this.init();
    }
    
    init() {
        if (this.filterBtns.length === 0) return;
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filterItems(btn));
        });
        
        // Keyboard navigation
        this.filterBtns.forEach((btn, index) => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' && index > 0) {
                    this.filterBtns[index - 1].focus();
                } else if (e.key === 'ArrowRight' && index < this.filterBtns.length - 1) {
                    this.filterBtns[index + 1].focus();
                }
            });
        });
        
        console.log('🎨 Portfolio Filter initialized');
    }
    
    filterItems(activeBtn) {
        // Update active button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
        
        const category = activeBtn.dataset.category;
        let visibleCount = 0;
        
        this.portfolioItems.forEach((item, index) => {
            const shouldShow = category === 'all' || item.dataset.category === category;
            
            if (shouldShow) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, index * 50); // Staggered animation
                visibleCount++;
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
        
        // Announce filter results for accessibility
        this.announceFilterResults(category, visibleCount);
    }
    
    announceFilterResults(category, count) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Showing ${count} ${category === 'all' ? 'portfolio items' : category + ' items'}`;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

/**
 * Statistics Counter Animation
 */
class StatsCounter {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number[data-target]');
        this.init();
    }
    
    init() {
        if (this.counters.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    this.animateCounter(entry.target);
                    entry.target.classList.add('counted');
                }
            });
        }, { threshold: 0.5 });
        
        this.counters.forEach(counter => {
            observer.observe(counter);
        });
        
        console.log('📊 Stats Counter initialized');
    }
    
    animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }
}

/**
 * FAQ Functionality Handler
 */
class FAQHandler {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.searchInput = document.getElementById('faqSearch');
        this.categoryBtns = document.querySelectorAll('.category-btn');
        this.sidebarLinks = document.querySelectorAll('.category-link');
        this.init();
    }
    
    init() {
        if (this.faqItems.length === 0) return;
        
        // FAQ accordion functionality
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => this.toggleFAQ(item));
            
            // Keyboard navigation
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleFAQ(item);
                }
            });
        });
        
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.searchFAQs(e.target.value);
            }, 300));
        }
        
        // Category filtering
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filterByCategory(btn));
        });
        
        this.sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByCategory(link);
                this.scrollToSection(link.dataset.category);
            });
        });
        
        console.log('❓ FAQ Handler initialized');
    }
    
    toggleFAQ(item) {
        const isOpen = item.classList.contains('open');
        const answer = item.querySelector('.faq-answer');
        const question = item.querySelector('.faq-question');
        
        // Close all other FAQs
        this.faqItems.forEach(faq => {
            if (faq !== item) {
                faq.classList.remove('open');
                const otherQuestion = faq.querySelector('.faq-question');
                const otherAnswer = faq.querySelector('.faq-answer');
                otherQuestion.setAttribute('aria-expanded', 'false');
                otherAnswer.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Toggle current FAQ
        item.classList.toggle('open', !isOpen);
        
        // Accessibility
        question.setAttribute('aria-expanded', !isOpen);
        answer.setAttribute('aria-hidden', isOpen);
    }
    
    searchFAQs(searchTerm) {
        const term = searchTerm.toLowerCase();
        let visibleCount = 0;
        
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            const matches = question.includes(term) || answer.includes(term);
            
            if (matches || term === '') {
                item.style.display = 'block';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show/hide sections based on visible items
        document.querySelectorAll('.faq-section').forEach(section => {
            const visibleItems = section.querySelectorAll('.faq-item:not([style*="display: none"])');
            section.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
        
        // Announce search results
        this.announceSearchResults(term, visibleCount);
    }
    
    announceSearchResults(term, count) {
        if (!term) return;
        
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Found ${count} FAQ${count !== 1 ? 's' : ''} matching "${term}"`;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    filterByCategory(activeBtn) {
        const category = activeBtn.dataset.category;
        
        // Update active states
        this.categoryBtns.forEach(btn => btn.classList.remove('active'));
        this.sidebarLinks.forEach(link => link.classList.remove('active'));
        activeBtn.classList.add('active');
        
        // Show/hide sections
        document.querySelectorAll('.faq-section').forEach(section => {
            if (category === 'all' || section.dataset.category === category) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
        
        // Clear search when filtering
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        // Reset FAQ items display
        this.faqItems.forEach(item => {
            item.style.display = 'block';
        });
    }
    
    scrollToSection(category) {
        const section = document.getElementById(category);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

/**
 * Page Navigation Handler (for Terms, Privacy, etc.)
 */
class PageNavigation {
    constructor() {
        this.navItems = document.querySelectorAll('.policy-nav .nav-item, .terms-nav .nav-item');
        this.sections = document.querySelectorAll('.policy-section, .terms-section');
        this.init();
    }
    
    init() {
        if (this.navItems.length === 0) return;
        
        // Handle navigation clicks
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                this.updateActiveNav(item);
            });
        });
        
        // Handle scroll spy
        if (this.sections.length > 0) {
            window.addEventListener('scroll', this.debounce(() => {
                this.updateActiveOnScroll();
            }, 100), { passive: true });
        }
        
        console.log('📄 Page Navigation initialized');
    }
    
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = 120;
            const elementPosition = section.offsetTop - headerHeight;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }
    
    updateActiveNav(activeItem) {
        this.navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }
    
    updateActiveOnScroll() {
        const scrollPosition = window.scrollY + 150;
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navItems.forEach(item => item.classList.remove('active'));
                const activeNavItem = document.querySelector(`.policy-nav .nav-item[href="#${sectionId}"], .terms-nav .nav-item[href="#${sectionId}"]`);
                if (activeNavItem) {
                    activeNavItem.classList.add('active');
                }
            }
        });
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

/**
 * Smooth Scroll Handler
 */
class SmoothScrollHandler {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = 120;
                    const elementPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        console.log('🔗 Smooth Scroll initialized');
    }
}

/**
 * Intersection Observer for Animations
 */
class AnimationObserver {
    constructor() {
        this.init();
    }
    
    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll(`
            .service-card, .section-header, .value-item, .recognition-item, 
            .pillar, .portfolio-item, .testimonial-card, .feature-item,
            .about-features .feature-item, .coverage-item, .team-member
        `);
        
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
        
        console.log('🎬 Animation Observer initialized');
    }
}

/**
 * API Health Monitor
 */
class APIHealthMonitor {
    constructor() {
        this.checkAPIHealth();
    }
    
    async checkAPIHealth() {
        try {
            const response = await fetch(`${CONFIG.API_BASE}${CONFIG.ENDPOINTS.health}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.status === 'healthy') {
                    console.log('✅ Luxury API is healthy:', result);
                } else {
                    console.warn('⚠️ API health check returned unexpected status:', result);
                }
            } else {
                console.warn('⚠️ API health check failed:', response.status);
            }
        } catch (error) {
            console.error('❌ API health check failed:', error);
        }
    }
}

/**
 * Video Modal Handler
 */
class VideoModalHandler {
    constructor() {
        this.modal = document.getElementById('videoModal');
        this.video = document.getElementById('modalVideo');
        this.closeBtn = document.querySelector('.video-close');
        this.init();
    }
    
    init() {
        if (!this.modal) return;
        
        // Close button
        if (this.closeBtn) {
            this.closeBtn.onclick = () => this.closeModal();
        }
        
        // Click outside to close
        this.modal.onclick = (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        };
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
        
        // Global function for opening video
        window.playServiceVideo = (serviceType) => {
            this.openVideo(serviceType);
        };
        
        console.log('🎥 Video Modal initialized');
    }
    
    openVideo(serviceType) {
        const videos = {
            'lifeguarding': 'https://805companies.com/videos/lifeguard-demo.mp4',
            'instruction': 'https://805companies.com/videos/swim-lessons.mp4',
            'events': 'https://805companies.com/videos/testimonials.mp4'
        };
        
        const fallbackVideos = {
            'lifeguarding': 'https://805companies.com/videos/hero-video.mp4',
            'instruction': 'https://805companies.com/videos/pool-overview.mp4',
            'events': 'https://805companies.com/videos/hero-video.mp4'
        };
        
        if (this.video) {
            const source = this.video.querySelector('source');
            source.src = videos[serviceType] || fallbackVideos[serviceType];
            this.video.load();
            
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            this.video.play().catch(() => {
                // If primary video fails, try fallback
                source.src = fallbackVideos[serviceType];
                this.video.load();
                this.video.play();
            });
            
            // Focus management
            this.closeBtn.focus();
        }
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        if (this.video) {
            this.video.pause();
        }
    }
}

/**
 * Success Modal Handler
 */
class SuccessModalHandler {
    constructor() {
        this.modal = document.getElementById('successModal');
        this.init();
    }
    
    init() {
        if (!this.modal) return;
        
        // Global function for closing modal
        window.closeSuccessModal = () => {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        };
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                window.closeSuccessModal();
            }
        });
        
        console.log('🎉 Success Modal initialized');
    }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
    constructor() {
        this.init();
    }
    
    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('🚀 Page Performance:', {
                    loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                    domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
                    firstPaint: this.getFirstPaint()
                });
            }
        });
        
        // Monitor form performance
        this.monitorFormPerformance();
    }
    
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? Math.round(firstPaint.startTime) : null;
    }
    
    monitorFormPerformance() {
        const form = document.getElementById('consultationForm');
        if (form) {
            const startTime = performance.now();
            
            form.addEventListener('submit', () => {
                const fillTime = performance.now() - startTime;
                console.log('📝 Form Performance:', {
                    fillTime: Math.round(fillTime),
                    timestamp: new Date().toISOString()
                });
            });
        }
    }
}

/**
 * Error Handler
 */
class ErrorHandler {
    constructor() {
        this.init();
    }
    
    init() {
        // Global error handling
        window.addEventListener('error', (event) => {
            console.error('JavaScript Error:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: new Date().toISOString()
            });
        });
        
        // Promise rejection handling
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled Promise Rejection:', {
                reason: event.reason,
                timestamp: new Date().toISOString()
            });
        });
        
        console.log('🛡️ Error Handler initialized');
    }
}

/**
 * Initialize all luxury functionality when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Core functionality
        new MobileNavigation();
        new HeaderScrollEffects();
        new LuxuryConsultationForm();
        new PortfolioFilter();
        new StatsCounter();
        new FAQHandler();
        new PageNavigation();
        new SmoothScrollHandler();
        new AnimationObserver();
        new VideoModalHandler();
        new SuccessModalHandler();
        
        // Monitoring and health
        new APIHealthMonitor();
        new PerformanceMonitor();
        new ErrorHandler();
        
        console.log('🏊‍♂️ 805 LifeGuard Luxury Experience Initialized Successfully');
        
    } catch (error) {
        console.error('❌ Initialization Error:', error);
    }
});

// Service Worker Registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('📱 Service Worker registered:', registration);
            })
            .catch(registrationError => {
                console.log('📱 Service Worker registration failed:', registrationError);
            });
    });
}
