/**
 * Module de Sécurité pour 3TroisExperts
 * Protection contre les attaques cybercriminelles
 */

// ===== PROTECTION XSS (Cross-Site Scripting) =====
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    
    // Créer un élément div temporaire pour échapper le HTML
    const div = document.createElement('div');
    div.textContent = input;
    
    // Remplacer les caractères dangereux
    return div.innerHTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// ===== VALIDATION DES ENTRÉES =====
const validators = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
    },
    
    phone: (phone) => {
        // Format international: +226 XX XX XX XX ou local
        const phoneRegex = /^(\+226|00226)?[0-9]{8,9}$/;
        return phoneRegex.test(phone.replace(/\s/g, '')) || phone === '';
    },
    
    name: (name) => {
        // Nom: lettres, espaces, tirets, apostrophes, 2-100 caractères
        const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,100}$/;
        return nameRegex.test(name.trim());
    },
    
    message: (message) => {
        // Message: 10-5000 caractères, pas de scripts
        const cleanMessage = message.trim();
        if (cleanMessage.length < 10 || cleanMessage.length > 5000) return false;
        
        // Détecter les tentatives d'injection
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /data:text\/html/i
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(cleanMessage));
    },
    
    subject: (subject) => {
        const allowedSubjects = ['devis', 'service', 'suivi', 'autre'];
        return allowedSubjects.includes(subject);
    }
};

// ===== PROTECTION CSRF (Cross-Site Request Forgery) =====
const generateCSRFToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const getOrCreateCSRFToken = () => {
    let token = sessionStorage.getItem('csrf_token');
    if (!token) {
        token = generateCSRFToken();
        sessionStorage.setItem('csrf_token', token);
    }
    return token;
};

// ===== RATE LIMITING (Limitation de requêtes) =====
const rateLimiter = {
    attempts: new Map(),
    
    checkLimit: (identifier, maxAttempts = 5, windowMs = 60000) => {
        const now = Date.now();
        const userAttempts = rateLimiter.attempts.get(identifier) || [];
        
        // Nettoyer les tentatives anciennes
        const recentAttempts = userAttempts.filter(time => now - time < windowMs);
        
        if (recentAttempts.length >= maxAttempts) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: recentAttempts[0] + windowMs
            };
        }
        
        // Ajouter la nouvelle tentative
        recentAttempts.push(now);
        rateLimiter.attempts.set(identifier, recentAttempts);
        
        return {
            allowed: true,
            remaining: maxAttempts - recentAttempts.length,
            resetTime: recentAttempts[0] + windowMs
        };
    },
    
    clear: (identifier) => {
        rateLimiter.attempts.delete(identifier);
    }
};

// ===== PROTECTION CONTRE LES CLICKJACKING =====
const preventClickjacking = () => {
    // Vérifier si le site est dans un iframe
    if (window.self !== window.top) {
        // Si oui, rediriger vers la page principale
        window.top.location = window.self.location;
    }
};

// ===== VALIDATION ET NETTOYAGE DU FORMULAIRE =====
const secureFormSubmission = (formElement) => {
    if (!formElement) return null;
    
    const formData = new FormData(formElement);
    const data = {};
    const errors = [];
    
    // Récupérer et valider chaque champ
    const name = formData.get('name')?.trim() || '';
    const email = formData.get('email')?.trim() || '';
    const phone = formData.get('phone')?.trim() || '';
    const subject = formData.get('subject')?.trim() || '';
    const message = formData.get('message')?.trim() || '';
    
    // Validation
    if (!validators.name(name)) {
        errors.push('Le nom doit contenir entre 2 et 100 caractères (lettres uniquement)');
    }
    
    if (!validators.email(email)) {
        errors.push('Email invalide');
    }
    
    if (phone && !validators.phone(phone)) {
        errors.push('Numéro de téléphone invalide');
    }
    
    if (!validators.subject(subject)) {
        errors.push('Sujet invalide');
    }
    
    if (!validators.message(message)) {
        errors.push('Le message doit contenir entre 10 et 5000 caractères et ne pas contenir de code malveillant');
    }
    
    if (errors.length > 0) {
        return { valid: false, errors };
    }
    
    // Nettoyer et échapper les données
    return {
        valid: true,
        data: {
            name: sanitizeInput(name),
            email: sanitizeInput(email),
            phone: sanitizeInput(phone),
            subject: sanitizeInput(subject),
            message: sanitizeInput(message),
            csrf_token: getOrCreateCSRFToken(),
            timestamp: Date.now()
        }
    };
};

// ===== PROTECTION CONTRE LES LIENS MALVEILLANTS =====
const secureExternalLinks = () => {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        // Ajouter rel="noopener noreferrer" pour sécurité
        if (!link.href.startsWith(window.location.origin)) {
            link.setAttribute('rel', 'noopener noreferrer');
            link.setAttribute('target', '_blank');
            
            // Avertir l'utilisateur avant d'ouvrir un lien externe
            link.addEventListener('click', (e) => {
                if (!confirm('Vous allez quitter notre site. Êtes-vous sûr de vouloir continuer ?')) {
                    e.preventDefault();
                }
            });
        }
    });
};

// ===== DÉTECTION D'ACTIVITÉ SUSPECTE =====
const detectSuspiciousActivity = () => {
    // Détecter les outils de développement ouverts (peut indiquer une inspection)
    const devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.warn('⚠️ Outils de développement détectés');
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    // Détecter les tentatives de modification du DOM suspectes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Vérifier les scripts injectés
                    if (node.tagName === 'SCRIPT' && !node.hasAttribute('data-secure')) {
                        console.warn('⚠️ Script suspect détecté');
                        node.remove();
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
};

// ===== PROTECTION CONTRE L'INJECTION SQL (côté client) =====
const sanitizeForSQL = (input) => {
    if (typeof input !== 'string') return '';
    
    // Échapper les caractères SQL dangereux
    return input
        .replace(/'/g, "''")
        .replace(/;/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
        .replace(/xp_/gi, '')
        .replace(/sp_/gi, '')
        .replace(/exec/gi, '')
        .replace(/execute/gi, '')
        .replace(/union/gi, '')
        .replace(/select/gi, '')
        .replace(/insert/gi, '')
        .replace(/update/gi, '')
        .replace(/delete/gi, '')
        .replace(/drop/gi, '');
};

// ===== LOGGING DES TENTATIVES D'ATTAQUE =====
const securityLogger = {
    log: (event, details) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer
        };
        
        // En production, envoyer ces logs à un serveur
        console.warn('🔒 Sécurité:', logEntry);
        
        // Stocker localement (limité)
        try {
            const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
            logs.push(logEntry);
            // Garder seulement les 50 derniers logs
            if (logs.length > 50) logs.shift();
            localStorage.setItem('security_logs', JSON.stringify(logs));
        } catch (e) {
            // Ignorer les erreurs de stockage
        }
    }
};

// ===== INITIALISATION DE LA SÉCURITÉ =====
const initSecurity = () => {
    // Protection contre le clickjacking
    preventClickjacking();
    
    // Sécuriser les liens externes
    secureExternalLinks();
    
    // Détecter l'activité suspecte
    detectSuspiciousActivity();
    
    // Ajouter le token CSRF aux formulaires
    document.querySelectorAll('form').forEach(form => {
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'csrf_token';
        tokenInput.value = getOrCreateCSRFToken();
        form.appendChild(tokenInput);
    });
    
    console.log('✅ Système de sécurité activé');
};

// Exporter les fonctions pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sanitizeInput,
        validators,
        secureFormSubmission,
        rateLimiter,
        securityLogger,
        initSecurity
    };
}

// Initialiser automatiquement si le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSecurity);
} else {
    initSecurity();
}

