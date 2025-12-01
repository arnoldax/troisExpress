// ===== NAVIGATION =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu with 3D effect
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Add 3D rotation effect
        if (navMenu.classList.contains('active')) {
            navMenu.style.transform = 'rotateX(0deg)';
        } else {
            navMenu.style.transform = 'rotateX(-90deg)';
        }
    });
}

// Close mobile menu when clicking on a link
navLinks.forEach((link, index) => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        navMenu.style.transform = 'rotateX(-90deg)';
    });
    
    // Add 3D hover effect for desktop
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) translateZ(20px)';
    });
    
    link.addEventListener('mouseleave', function() {
        if (!this.classList.contains('active')) {
            this.style.transform = 'translateY(0) translateZ(0)';
        }
    });
});

// Navbar scroll effect with 3D
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
        navbar.style.transform = 'translateY(0) scale(1)';
    } else {
        navbar.classList.remove('scrolled');
        navbar.style.transform = 'translateY(0) scale(1)';
    }
});

// Add 3D effect on logo hover
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('mousemove', (e) => {
        const rect = logo.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        logo.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    
    logo.addEventListener('mouseleave', () => {
        logo.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
}

// ===== STATS COUNTER ANIMATION =====
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
};

const observeStats = () => {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                entry.target.classList.add('counted');
                animateCounter(entry.target, target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
};

// ===== SCROLL ANIMATIONS =====
const observeElements = () => {
    // Feature cards - fade in from bottom
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.classList.add('scroll-fade-in');
        card.classList.add(`scroll-delay-${(index % 4) + 1}`);
    });

    // Steps - slide from left and right alternately
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index % 2 === 0) {
            step.classList.add('scroll-slide-left');
        } else {
            step.classList.add('scroll-slide-right');
        }
        step.classList.add(`scroll-delay-${(index % 3) + 1}`);
    });

    // Service cards - scale animation
    const serviceCards = document.querySelectorAll('.service-card-large');
    serviceCards.forEach((card, index) => {
        card.classList.add('scroll-scale');
        card.classList.add(`scroll-delay-${(index % 4) + 1}`);
    });

    // Info cards - fade in
    const infoCards = document.querySelectorAll('.info-card, .value-card, .guarantee-card');
    infoCards.forEach((card, index) => {
        card.classList.add('scroll-fade-in');
        card.classList.add(`scroll-delay-${(index % 4) + 1}`);
    });

    // FAQ items - slide from right
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
        item.classList.add('scroll-slide-right');
        item.classList.add(`scroll-delay-${(index % 3) + 1}`);
    });

    // Contact items - slide from left
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
        item.classList.add('scroll-slide-left');
        item.classList.add(`scroll-delay-${(index % 3) + 1}`);
    });

    // Section titles - fade in
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.classList.add('scroll-fade-in');
    });

    // About content - slide from left
    const aboutText = document.querySelectorAll('.about-text');
    aboutText.forEach(text => {
        text.classList.add('scroll-slide-left');
    });

    const aboutImage = document.querySelectorAll('.about-image');
    aboutImage.forEach(img => {
        img.classList.add('scroll-slide-right');
    });

    // Team text - fade in
    const teamText = document.querySelectorAll('.team-text');
    teamText.forEach(text => {
        text.classList.add('scroll-fade-in');
    });

    // Create observer for all animated elements
    const animatedElements = document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale, .scroll-rotate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
};

// ===== FORM HANDLING =====
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        formMessage.textContent = 'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.';
        formMessage.className = 'form-message success';
        
        // Reset form
        contactForm.reset();
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.className = 'form-message';
            formMessage.textContent = '';
        }, 5000);
        
        // In a real application, you would send the data to a server here
        console.log('Form data:', data);
    });
}

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== SMOOTH SCROLL EFFECTS =====
// Additional scroll effects can be added here if needed

// ===== CURSOR EFFECT (Optional enhancement) =====
const createCursorEffect = () => {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
};

// ===== INITIALIZE ON LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    observeStats();
    observeElements();
    
    // Add active class to current page nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

// ===== BUTTON RIPPLE EFFECT =====
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// ===== LAZY LOADING IMAGES (if you add images later) =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== PERFORMANCE: Debounce scroll events =====
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Apply debounce to scroll events
const handleScroll = debounce(() => {
    // Scroll-based animations here
}, 10);

window.addEventListener('scroll', handleScroll);

