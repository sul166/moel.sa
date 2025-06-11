// Main JavaScript file for Moel Legal Representation website

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize all website functionality
function initializeWebsite() {
    initNavbar();
    initScrollEffects();
    initFormValidation();
    initAccordion();
    initSmoothScrolling();
    initAnimations();
    initMobileMenu();
    initAdminFeatures();
}

// Navbar functionality
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', debounce(function() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }, 10));
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });

    // Highlight active page in navigation
    const currentPage = window.location.pathname;
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Scroll effects and animations
function initScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.service-card, .feature-card, .vmv-card, .team-card, .achievement-card, .contact-info-card'
    );
    animateElements.forEach(el => observer.observe(el));
}

// Enhanced form validation
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Prevent multiple submissions
        let isSubmitting = false;
        
        contactForm.addEventListener('submit', function(e) {
            if (isSubmitting) {
                e.preventDefault();
                return;
            }
            
            if (!validateContactForm()) {
                e.preventDefault();
                return;
            }
            
            // Set submitting state
            isSubmitting = true;
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جارٍ الإرسال...';
            submitBtn.disabled = true;
            
            // Re-enable after 5 seconds as fallback
            setTimeout(() => {
                if (isSubmitting) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    isSubmitting = false;
                }
            }, 5000);
        });
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });

        // Character counter for message field
        const messageField = contactForm.querySelector('#message');
        if (messageField) {
            addCharacterCounter(messageField, 1000);
        }
    }
}

// Comprehensive form validation
function validateContactForm() {
    let isValid = true;
    const form = document.getElementById('contactForm');
    const errors = [];
    
    // Required fields validation
    const requiredFields = [
        { name: 'name', label: 'الاسم' },
        { name: 'email', label: 'البريد الإلكتروني' },
        { name: 'message', label: 'الرسالة' }
    ];
    
    requiredFields.forEach(field => {
        const input = form.querySelector(`[name="${field.name}"]`);
        if (!input.value.trim()) {
            showFieldError(input, `${field.label} مطلوب`);
            errors.push(`${field.label} مطلوب`);
            isValid = false;
        }
    });
    
    // Email validation
    const emailField = form.querySelector('[name="email"]');
    if (emailField.value && !isValidEmail(emailField.value)) {
        showFieldError(emailField, 'يرجى إدخال بريد إلكتروني صحيح');
        errors.push('البريد الإلكتروني غير صحيح');
        isValid = false;
    }
    
    // Phone validation (if provided)
    const phoneField = form.querySelector('[name="phone"]');
    if (phoneField.value && !isValidPhone(phoneField.value)) {
        showFieldError(phoneField, 'يرجى إدخال رقم هاتف صحيح');
        errors.push('رقم الهاتف غير صحيح');
        isValid = false;
    }
    
    // Message length validation
    const messageField = form.querySelector('[name="message"]');
    if (messageField.value.length < 10) {
        showFieldError(messageField, 'الرسالة يجب أن تكون 10 أحرف على الأقل');
        errors.push('الرسالة قصيرة جداً');
        isValid = false;
    }
    
    // Privacy checkbox validation
    const privacyCheckbox = form.querySelector('#privacy');
    if (!privacyCheckbox.checked) {
        showError('يجب الموافقة على سياسة الخصوصية');
        errors.push('يجب الموافقة على سياسة الخصوصية');
        isValid = false;
    }
    
    // Show summary of errors if any
    if (!isValid) {
        showError(`يرجى تصحيح الأخطاء التالية: ${errors.join('، ')}`);
    }
    
    return isValid;
}

// Individual field validation
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    switch (fieldName) {
        case 'name':
            if (!value) {
                showFieldError(field, 'الاسم مطلوب');
                return false;
            } else if (value.length < 2) {
                showFieldError(field, 'الاسم يجب أن يكون حرفين على الأقل');
                return false;
            }
            break;
            
        case 'email':
            if (!value) {
                showFieldError(field, 'البريد الإلكتروني مطلوب');
                return false;
            } else if (!isValidEmail(value)) {
                showFieldError(field, 'يرجى إدخال بريد إلكتروني صحيح');
                return false;
            }
            break;
            
        case 'phone':
            if (value && !isValidPhone(value)) {
                showFieldError(field, 'يرجى إدخال رقم هاتف صحيح (مثال: +966501234567)');
                return false;
            }
            break;
            
        case 'message':
            if (!value) {
                showFieldError(field, 'الرسالة مطلوبة');
                return false;
            } else if (value.length < 10) {
                showFieldError(field, 'الرسالة يجب أن تكون 10 أحرف على الأقل');
                return false;
            } else if (value.length > 1000) {
                showFieldError(field, 'الرسالة يجب أن تكون أقل من 1000 حرف');
                return false;
            }
            break;
    }
    
    clearFieldError(field);
    return true;
}

// Show field-specific error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    
    // Add shake animation to field
    field.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        field.style.animation = '';
    }, 500);
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Show general error message
function showError(message) {
    showAlert(message, 'danger');
}

// Show success message
function showSuccess(message) {
    showAlert(message, 'success');
}

// Generic alert function
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the page
    const container = document.querySelector('main .container') || document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Scroll to alert
        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Auto dismiss after 7 seconds
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 7000);
}

// Enhanced email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

// Enhanced phone validation (Saudi Arabia and international formats)
function isValidPhone(phone) {
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Saudi Arabia formats
    const saudiRegex = /^(\+966|966|0)?[5-9][0-9]{8}$/;
    // International format (basic)
    const intlRegex = /^\+[1-9]\d{1,14}$/;
    
    return saudiRegex.test(cleanPhone) || intlRegex.test(cleanPhone);
}

// Add character counter to textarea
function addCharacterCounter(textarea, maxLength) {
    const counter = document.createElement('div');
    counter.className = 'character-counter text-muted mt-1';
    counter.style.fontSize = '0.875rem';
    textarea.parentNode.appendChild(counter);
    
    function updateCounter() {
        const currentLength = textarea.value.length;
        counter.textContent = `${currentLength}/${maxLength} حرف`;
        
        if (currentLength > maxLength * 0.9) {
            counter.style.color = '#dc3545';
        } else if (currentLength > maxLength * 0.8) {
            counter.style.color = '#fd7e14';
        } else {
            counter.style.color = '#6c757d';
        }
    }
    
    textarea.addEventListener('input', updateCounter);
    updateCounter(); // Initial call
}

// Initialize accordion functionality
function initAccordion() {
    const accordionButtons = document.querySelectorAll('.accordion-button');
    
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = document.querySelector(this.getAttribute('data-bs-target'));
            if (target) {
                target.style.transition = 'all 0.3s ease';
            }
        });
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const offsetTop = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize animations and counters
function initAnimations() {
    // Counter animation for achievement numbers
    const counters = document.querySelectorAll('.achievement-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
        const hasPlus = counter.textContent.includes('+');
        const hasPercent = counter.textContent.includes('%');
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(counter, target, hasPlus, hasPercent);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
    
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', debounce(function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            
            if (scrolled < heroSection.offsetHeight) {
                heroSection.style.transform = `translateY(${rate}px)`;
            }
        }, 10));
    }
}

// Animate counter numbers
function animateCounter(element, target, hasPlus, hasPercent) {
    let current = 0;
    const increment = target / 60; // 60 frames for 1 second animation
    const duration = 2000; // 2 seconds
    const stepTime = duration / 60;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        if (hasPlus) displayValue += '+';
        if (hasPercent) displayValue += '%';
        
        element.textContent = displayValue;
    }, stepTime);
}

// Mobile menu enhancements
function initMobileMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            const isClickInsideNav = navbarCollapse.contains(e.target) || navbarToggler.contains(e.target);
            
            if (!isClickInsideNav && navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
        
        // Prevent menu from closing when clicking inside
        navbarCollapse.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Admin features for message management
function initAdminFeatures() {
    // Filter functionality for admin messages
    initMessageFilters();
    
    // Confirmation dialogs for admin actions
    initAdminConfirmations();
    
    // Auto-refresh for new messages (every 30 seconds)
    if (window.location.pathname.includes('/admin/messages')) {
        setInterval(checkForNewMessages, 30000);
    }
}

// Message filtering in admin panel
function initMessageFilters() {
    const filterButtons = document.querySelectorAll('.btn-group .btn');
    const messageItems = document.querySelectorAll('.message-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter messages
            const filter = this.id.replace('filter', '').toLowerCase();
            filterMessages(filter, messageItems);
        });
    });
}

// Filter messages based on read status
function filterMessages(filter, messageItems) {
    messageItems.forEach(item => {
        switch(filter) {
            case 'all':
                item.style.display = 'block';
                break;
            case 'unread':
                item.style.display = item.classList.contains('unread') ? 'block' : 'none';
                break;
            case 'read':
                item.style.display = item.classList.contains('read') ? 'block' : 'none';
                break;
        }
    });
    
    // Show count of visible messages
    updateMessageCount(filter, messageItems);
}

// Update message count display
function updateMessageCount(filter, messageItems) {
    const visibleCount = Array.from(messageItems).filter(item => 
        item.style.display !== 'none'
    ).length;
    
    const countElement = document.querySelector('.message-count');
    if (countElement) {
        countElement.textContent = `عرض ${visibleCount} من ${messageItems.length} رسالة`;
    }
}

// Admin confirmation dialogs
function initAdminConfirmations() {
    // Mark as read confirmation
    document.querySelectorAll('a[href*="mark_message_read"]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!confirm('هل تريد وضع علامة مقروء على هذه الرسالة؟')) {
                e.preventDefault();
            }
        });
    });
}

// Check for new messages (admin panel)
function checkForNewMessages() {
    const currentUnreadCount = document.querySelectorAll('.message-item.unread').length;
    
    fetch(window.location.href, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        const newUnreadCount = newDoc.querySelectorAll('.message-item.unread').length;
        
        if (newUnreadCount > currentUnreadCount) {
            showSuccess(`لديك ${newUnreadCount - currentUnreadCount} رسالة جديدة`);
            // Optionally reload the page or update the content
            // window.location.reload();
        }
    })
    .catch(error => {
        console.log('خطأ في التحقق من الرسائل الجديدة:', error);
    });
}

// Utility functions
function debounce(func, wait, immediate) {
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
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccess('تم نسخ النص');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess('تم نسخ النص');
    }
}

// Format phone number for display
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 && cleaned.startsWith('5')) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (cleaned.length === 12 && cleaned.startsWith('966')) {
        return '+' + cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
    }
    return phone;
}

// Add shake animation for errors
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize tooltips if Bootstrap is available
if (typeof bootstrap !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    });
}

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData.loadEventEnd - perfData.loadEventStart > 3000) {
                console.warn('الصفحة تحتاج وقت طويل للتحميل');
            }
        }, 0);
    });
}

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // This would register a service worker if available
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Handle online/offline status
window.addEventListener('online', function() {
    showSuccess('تم استعادة الاتصال بالإنترنت');
});

window.addEventListener('offline', function() {
    showError('تم فقدان الاتصال بالإنترنت');
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('خطأ في الصفحة:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('خطأ في Promise:', e.reason);
    e.preventDefault();
});
