/**
 * El Americano - Premium Cart System
 * Pre-order to WhatsApp automation
 * Version: 3.0.0 (Doctoral State-of-the-Art)
 * 
 * Features:
 * - Reactive UI with smooth animations
 * - Glassmorphism modal design
 * - Advanced form validation
 * - WhatsApp deep linking
 * - Cart persistence (sessionStorage)
 */

// ===========================================
// CONFIGURATION
// ===========================================
const CONFIG = {
    WHATSAPP_PHONE: '56971864463',
    CURRENCY: 'CLP',
    LOCALE: 'es-CL',
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 2500
};

// ===========================================
// STATE MANAGEMENT
// ===========================================
const state = {
    cart: [],
    isModalOpen: false,
    isProcessing: false
};

// Try to restore cart from session
try {
    const savedCart = sessionStorage.getItem('elamericano_cart');
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
    }
} catch (e) {
    console.warn('Could not restore cart:', e);
}

// ===========================================
// DOM ELEMENTS (cached on load)
// ===========================================
const elements = {};

// ===========================================
// INITIALIZATION
// ===========================================
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Cache DOM elements
    elements.fab = document.getElementById('fab-cart');
    elements.fabCount = document.getElementById('cart-count');
    elements.navCartCount = document.getElementById('nav-cart-count-desktop');
    elements.fabTotal = document.getElementById('cart-total');
    elements.modal = document.getElementById('cart-modal');
    elements.modalClose = document.getElementById('close-modal');
    elements.cartItems = document.getElementById('cart-items');
    elements.cartTotalSection = document.getElementById('cart-total-section');
    elements.finalTotal = document.getElementById('final-total');
    elements.checkoutForm = document.getElementById('checkout-form');
    elements.checkoutBtn = document.querySelector('.btn-checkout');

    // Validate critical elements
    if (!elements.fab || !elements.modal) {
        console.error('Critical elements not found');
        return;
    }

    // Bind events
    bindEvents();

    // Initial UI update (for restored cart)
    updateUI();
}

function bindEvents() {
    // Add to cart buttons
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });

    // FAB click
    elements.fab.addEventListener('click', openModal);

    // Modal close button
    elements.modalClose?.addEventListener('click', closeModal);

    // Backdrop click
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.isModalOpen) closeModal();
    });

    // Checkout form
    elements.checkoutForm?.addEventListener('submit', handleCheckout);
}

// ===========================================
// CART OPERATIONS
// ===========================================
function handleAddToCart(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price, 10);

    if (!name || isNaN(price)) return;

    // Add to cart
    const existing = state.cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        state.cart.push({ name, price, qty: 1 });
    }

    // Persist cart
    saveCart();

    // Update UI
    updateUI();

    // Button feedback
    animateButton(btn);

    // Toast
    showToast(`${name} agregado`);
}

function changeQty(index, delta) {
    if (state.cart[index].qty + delta <= 0) {
        // Remove animation
        const items = elements.cartItems.querySelectorAll('.cart-item');
        if (items[index]) {
            items[index].style.transform = 'translateX(-100%)';
            items[index].style.opacity = '0';
            setTimeout(() => {
                state.cart.splice(index, 1);
                saveCart();
                updateUI();
                renderCart();
            }, CONFIG.ANIMATION_DURATION);
            return;
        }
        state.cart.splice(index, 1);
    } else {
        state.cart[index].qty += delta;
    }

    saveCart();
    updateUI();
    renderCart();
}

// Make globally accessible
window.changeQty = changeQty;

function clearCart() {
    state.cart = [];
    saveCart();
    updateUI();
}

function saveCart() {
    try {
        sessionStorage.setItem('elamericano_cart', JSON.stringify(state.cart));
    } catch (e) {
        console.warn('Could not save cart:', e);
    }
}

// ===========================================
// UI UPDATES
// ===========================================
function updateUI() {
    const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Update FAB
    if (elements.fabCount) {
        elements.fabCount.textContent = totalQty;
    }

    // Update Desktop Nav Cart
    if (elements.navCartCount) {
        elements.navCartCount.textContent = totalQty;
        // Animation for desktop badge
        if (totalQty > 0) {
            elements.navCartCount.parentElement.classList.add('bounce');
            setTimeout(() => elements.navCartCount.parentElement.classList.remove('bounce'), 400);
        }
    }

    if (elements.fabTotal) {
        elements.fabTotal.textContent = formatCurrency(totalPrice);
    }

    // Show/hide FAB
    if (elements.fab) {
        if (totalQty > 0) {
            elements.fab.style.display = 'flex';
            elements.fab.classList.add('bounce');
            setTimeout(() => elements.fab.classList.remove('bounce'), 400);
        } else {
            elements.fab.style.display = 'none';
        }
    }
}

function renderCart() {
    if (!elements.cartItems) return;

    const isEmpty = state.cart.length === 0;

    // Toggle sections
    if (elements.checkoutForm) {
        elements.checkoutForm.style.display = isEmpty ? 'none' : 'block';
    }
    if (elements.cartTotalSection) {
        elements.cartTotalSection.style.display = isEmpty ? 'none' : 'flex';
    }

    if (isEmpty) {
        elements.cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Tu carrito está vacío</p>
                <button type="button" class="btn btn-primary" onclick="closeModal()" style="margin-top: 16px;">
                    Ver menú
                </button>
            </div>
        `;
        return;
    }

    let html = '';
    let total = 0;

    state.cart.forEach((item, index) => {
        const subtotal = item.price * item.qty;
        total += subtotal;

        html += `
            <div class="cart-item" style="transition: all ${CONFIG.ANIMATION_DURATION}ms ease;">
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-price">${formatCurrency(item.price)} c/u</div>
                </div>
                <div class="cart-item-controls">
                    <button type="button" class="qty-btn" onclick="changeQty(${index}, -1)" aria-label="Reducir">−</button>
                    <span class="qty-value">${item.qty}</span>
                    <button type="button" class="qty-btn" onclick="changeQty(${index}, 1)" aria-label="Aumentar">+</button>
                </div>
                <div class="cart-item-subtotal">${formatCurrency(subtotal)}</div>
            </div>
        `;
    });

    elements.cartItems.innerHTML = html;

    if (elements.finalTotal) {
        elements.finalTotal.textContent = formatCurrency(total);
    }

    // Update subtotal display (premium modal)
    const subtotalDisplay = document.getElementById('subtotal-display');
    if (subtotalDisplay) {
        subtotalDisplay.textContent = formatCurrency(total);
    }
}

function animateButton(btn) {
    const originalText = btn.textContent;
    btn.classList.add('added');
    btn.innerHTML = '<span class="btn-text">✓ Agregado</span>';

    setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = `<span class="btn-text">${originalText}</span>`;
    }, 1200);
}

// ===========================================
// MODAL
// ===========================================
function openModal() {
    renderCart();
    elements.modal.style.display = 'flex';

    // Trigger animation
    requestAnimationFrame(() => {
        elements.modal.classList.add('show');
    });

    state.isModalOpen = true;
    document.body.style.overflow = 'hidden';

    // Reset checkout steps to step 1
    updateCheckoutSteps(1);

    // Add focus listeners for step progression
    setupStepProgression();
}

// Checkout Step Indicator
function updateCheckoutSteps(currentStep) {
    const steps = document.querySelectorAll('.checkout-steps .step');
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNum < currentStep) {
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
        }
    });
}

// Setup form field focus to advance steps
function setupStepProgression() {
    const formInputs = document.querySelectorAll('#checkout-form input, #checkout-form select, #checkout-form textarea');

    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            updateCheckoutSteps(2);
        }, { once: true });
    });
}

function closeModal() {
    elements.modal.classList.remove('show');

    setTimeout(() => {
        elements.modal.style.display = 'none';
    }, CONFIG.ANIMATION_DURATION);

    state.isModalOpen = false;
    document.body.style.overflow = '';
}

// Global
window.closeModal = closeModal;

// ===========================================
// CHECKOUT
// ===========================================
// ===========================================
// CHECKOUT
// ===========================================
let lastCheckoutTime = 0;

function handleCheckout(e) {
    e.preventDefault();

    if (state.cart.length === 0 || state.isProcessing) return;

    // Rate limiting (prevent spamming)
    const now = Date.now();
    if (now - lastCheckoutTime < 3000) {
        showToast('Por favor, espera unos segundos...');
        return;
    }
    lastCheckoutTime = now;

    // Get form data
    const form = e.target;
    const name = form.querySelector('#customer-name')?.value.trim() || '';
    const phone = form.querySelector('#customer-phone')?.value.trim() || '';
    const address = form.querySelector('#customer-address')?.value.trim() || '';
    const payment = form.querySelector('#payment-method')?.value || 'Efectivo';
    const notes = form.querySelector('#customer-notes')?.value.trim() || '';

    // Validate inputs
    const validation = validateInputs(name, phone, address);
    if (!validation.valid) {
        showToast(validation.message);

        if (validation.message.includes('nombre')) {
            form.querySelector('#customer-name')?.focus();
        } else if (validation.message.includes('Celular')) {
            form.querySelector('#customer-phone')?.focus();
        } else if (validation.message.includes('dirección')) {
            form.querySelector('#customer-address')?.focus();
        }
        return;
    }

    // Show loading - Step 3: Confirm
    state.isProcessing = true;
    updateCheckoutSteps(3);

    if (elements.checkoutBtn) {
        elements.checkoutBtn.disabled = true;
        elements.checkoutBtn.innerHTML = '<span class="spinner"></span> Procesando...';
    }

    // Build message
    const message = buildMessage({ name, phone, address, payment, notes });
    const url = `https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(url, '_blank');

    // Reset after delay
    setTimeout(() => {
        clearCart();
        closeModal();
        form.reset();

        state.isProcessing = false;
        if (elements.checkoutBtn) {
            elements.checkoutBtn.disabled = false;
            elements.checkoutBtn.innerHTML = '<span class="btn-text">Enviar pedido a WhatsApp</span>';
        }

        showToast('¡Pedido enviado!');
    }, 800);
}

function validateInputs(name, phone, address) {
    // Regex: Letters, spaces, dots, hyphens, accents. No numbers or special symbols.
    // Allows: "Juan Pérez", "María T. O'Connor"
    // Block: "Juan123", "@Joker"
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.'-]+$/;

    if (!name) {
        return { valid: false, message: 'Ingresa tu nombre' };
    }

    if (!nameRegex.test(name)) {
        return { valid: false, message: 'El nombre solo puede contener letras' };
    }

    if (name.length < 2) {
        return { valid: false, message: 'El nombre es muy corto' };
    }

    // Regex: Optional +56 followed by 9 and 8 digits.
    if (phone) {
        // Strip spaces for check
        const cleanPhone = phone.replace(/\s+/g, '');
        const phoneRegex = /^(\+?56)?9\d{8}$/;
        if (!phoneRegex.test(cleanPhone)) {
            return { valid: false, message: 'Celular inválido (Ej: 9 1234 5678)' };
        }
    }

    if (!address || address.length < 5) {
        return { valid: false, message: 'Ingresa una dirección válida' };
    }

    return { valid: true };
}

function buildMessage({ name, phone, address, payment, notes }) {
    let msg = `*Hola! Quiero realizar un pedido.*\n\n`;
    msg += `*--- PEDIDO ---*\n`;

    let total = 0;
    state.cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        msg += `• ${item.qty}x ${item.name} (${formatCurrency(subtotal)})\n`;
    });

    msg += `\n*TOTAL: ${formatCurrency(total)}*\n\n`;
    msg += `*--- ENTREGA ---*\n`;
    msg += `Nombre: ${name}\n`;
    if (phone) msg += `Tel: ${phone}\n`;
    msg += `Direccion: ${address}\n`;
    msg += `Pago: ${payment}\n`;
    if (notes) msg += `Notas: ${notes}\n`;

    return msg;
}

// ===========================================
// UTILITIES
// ===========================================
function formatCurrency(amount) {
    return new Intl.NumberFormat(CONFIG.LOCALE, {
        style: 'currency',
        currency: CONFIG.CURRENCY,
        minimumFractionDigits: 0
    }).format(amount);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message) {
    // Remove existing
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), CONFIG.ANIMATION_DURATION);
    }, CONFIG.TOAST_DURATION);
}
