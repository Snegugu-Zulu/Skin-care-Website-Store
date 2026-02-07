// ===== SHOPPING CART FUNCTIONALITY =====
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('glowlab-cart')) || [];
        this.updateCartCount();
        this.renderCart();
        this.setupEventListeners();
        this.setupCartItemListeners();
    }
    
    // Add item to cart
    addItem(id, name, price, quantity = 1) {
        const existingItem = this.items.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ 
                id, 
                name, 
                price: parseFloat(price), 
                quantity 
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.showNotification(`${name} added to cart!`);
    }
    
    // Remove item from cart
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.showNotification('Item removed from cart');
    }
    
    // Update item quantity
    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.saveCart();
                this.updateCartCount();
                this.renderCart();
            }
        }
    }
    
    // Clear entire cart
    clearCart() {
        if (this.items.length === 0) return;
        
        this.items = [];
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.showNotification('Cart cleared!');
    }
    
    // Calculate cart total
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    // Format price with South African Rands
    formatPrice(amount) {
        // South African Rand format: R 1,234.56
        if (amount >= 1000) {
            return 'R' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        return 'R' + amount.toFixed(2);
    }
    
    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('glowlab-cart', JSON.stringify(this.items));
    }
    
    // Update cart count in header
    updateCartCount() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = totalItems;
    }
    
    // Render cart items
    renderCart() {
        const cartItems = document.querySelector('.cart-items');
        const emptyCart = cartItems.querySelector('.empty-cart');
        const totalAmount = document.querySelector('.total-amount');
        
        if (this.items.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            totalAmount.textContent = 'R0.00';
            return;
        }
        
        emptyCart.style.display = 'none';
        
        let cartHTML = '';
        this.items.forEach(item => {
            const subtotal = item.price * item.quantity;
            cartHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>R${item.price.toFixed(2)} × ${item.quantity}</p>
                        <p class="item-subtotal">Subtotal: R${subtotal.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.id}" title="Remove item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        cartItems.innerHTML = cartHTML;
        totalAmount.textContent = this.formatPrice(this.getTotal());
        
        // Re-attach event listeners to new buttons
        this.setupCartItemListeners();
    }
    
    // Setup main event listeners
    setupEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const button = e.target.closest('.add-to-cart');
                const id = button.dataset.id;
                const name = button.dataset.name;
                const price = button.dataset.price;
                
                this.addItem(id, name, price);
                
                // Add button animation
                button.innerHTML = '<i class="fas fa-check"></i> Added!';
                button.style.background = '#27ae60';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                    button.style.background = '';
                }, 1500);
            }
        });
        
        // Cart toggle button
        document.querySelector('.cart-btn').addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.cart-sidebar').classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        // Close cart button
        document.querySelector('.close-cart').addEventListener('click', () => {
            document.querySelector('.cart-sidebar').classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Clear cart button
        document.querySelector('.clear-cart').addEventListener('click', () => {
            if (this.items.length > 0 && confirm('Are you sure you want to clear your entire cart?')) {
                this.clearCart();
            }
        });
        
        // Checkout button (simulation)
        document.querySelector('.checkout-btn').addEventListener('click', () => {
            if (this.items.length === 0) {
                alert('Your cart is empty! Add some products first.');
                return;
            }
            
            const total = this.getTotal();
            const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
            
            // South African checkout message
            alert(`✅ Checkout Successful!\n\n🎉 Thank you for shopping with GlowLab!\n\n📦 Items: ${itemCount}\n💰 Total: R${total.toFixed(2)}\n\n📍 Shipping to South Africa\n📧 Order confirmation will be emailed\n🚚 Delivery: 3-5 business days`);
            
            // Clear cart after checkout
            this.clearCart();
            document.querySelector('.cart-sidebar').classList.remove('active');
        });
        
        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cart = document.querySelector('.cart-sidebar');
            const cartBtn = document.querySelector('.cart-btn');
            
            if (cart.classList.contains('active') && 
                !cart.contains(e.target) && 
                !cartBtn.contains(e.target)) {
                cart.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close cart with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelector('.cart-sidebar').classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Setup cart item event listeners
    setupCartItemListeners() {
        // Quantity minus buttons
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.quantity-btn').dataset.id;
                const item = this.items.find(item => item.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity - 1);
                }
            });
        });
        
        // Quantity plus buttons
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.quantity-btn').dataset.id;
                const item = this.items.find(item => item.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity + 1);
                }
            });
        });
        
        // Remove item buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.remove-item').dataset.id;
                if (confirm('Remove this item from cart?')) {
                    this.removeItem(id);
                }
            });
        });
    }
    
    // Show notification
    showNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// ===== ADDITIONAL WEBSITE FUNCTIONALITY =====
class WebsiteFeatures {
    constructor() {
        this.init();
    }
    
    init() {
        // Smooth scrolling for anchor links
        this.setupSmoothScrolling();
        
        // Update copyright year
        this.updateCopyrightYear();
        
        // Add CSS for notifications
        this.addNotificationStyles();
        
        // Add CSS for cart items
        this.addCartItemStyles();
        
        // Initialize product interactions
        this.setupProductInteractions();
    }
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip cart and empty links
                if (href === '#cart' || href === '#') return;
                
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    updateCopyrightYear() {
        const yearElements = document.querySelectorAll('.footer-bottom p');
        const currentYear = new Date().getFullYear();
        yearElements.forEach(element => {
            element.textContent = element.textContent.replace('2026', currentYear);
        });
    }
    
    setupProductInteractions() {
        // Add hover effect to product cards
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const button = card.querySelector('.add-to-cart');
                if (button) {
                    button.style.transform = 'scale(1.05)';
                }
                card.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                const button = card.querySelector('.add-to-cart');
                if (button) {
                    button.style.transform = 'scale(1)';
                }
                card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            });
        });
    }
    
    addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #00b894;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 5px 20px rgba(0, 184, 148, 0.3);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 350px;
            }
            
            .notification i {
                font-size: 1.2rem;
            }
            
            .fade-out {
                animation: slideOut 0.3s ease forwards;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    addCartItemStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .cart-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                margin-bottom: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #00b894;
            }
            
            .cart-item-info h4 {
                margin-bottom: 5px;
                color: #2d3436;
                font-size: 1rem;
            }
            
            .cart-item-info p {
                color: #636e72;
                font-size: 0.9rem;
                margin-bottom: 3px;
            }
            
            .item-subtotal {
                font-weight: bold;
                color: #00b894 !important;
            }
            
            .cart-item-controls {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            
            .quantity-controls {
                display: flex;
                align-items: center;
                gap: 10px;
                background: white;
                padding: 5px;
                border-radius: 5px;
            }
            
            .quantity-btn {
                width: 30px;
                height: 30px;
                border: none;
                background: #00b894;
                color: white;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .quantity-btn:hover {
                background: #00a085;
            }
            
            .quantity-display {
                min-width: 30px;
                text-align: center;
                font-weight: bold;
            }
            
            .remove-item {
                background: #e17055;
                color: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .remove-item:hover {
                background: #d65b40;
            }
            
            /* South African price styling */
            .product-price {
                font-family: 'SF Pro Text', -apple-system, sans-serif;
                font-weight: 700;
                color: #2d3436;
            }
            
            .product-price::before {
                content: 'R';
                font-size: 0.9em;
                margin-right: 2px;
                color: #00b894;
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== INITIALIZE EVERYTHING WHEN PAGE LOADS =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize shopping cart
    const cart = new ShoppingCart();
    
    // Initialize website features
    const features = new WebsiteFeatures();
    
    // Welcome message
    console.log('✨ GlowLab Skincare Website Loaded!');
    console.log('🇿🇦 South African Rands (ZAR) currency enabled');
    console.log('🛒 Cart items:', cart.items.length);
    
    // Add cart persistence message
    if (cart.items.length > 0) {
        console.log(`🔄 Cart restored from previous session: ${cart.items.length} items`);
    }
});

// ===== ADDITIONAL SA-SPECIFIC FEATURES =====
// South African shipping calculator
function calculateShipping(province) {
    const shippingRates = {
        'gauteng': 50,
        'western-cape': 80,
        'kwazulu-natal': 90,
        'eastern-cape': 95,
        'free-state': 85,
        'limpopo': 100,
        'mpumalanga': 95,
        'north-west': 90,
        'northern-cape': 110
    };
    
    return shippingRates[province] || 100; // Default R100
}

// VAT calculator (15% VAT in South Africa)
function calculateVAT(amount) {
    const vatRate = 0.15; // 15% VAT
    const vatAmount = amount * vatRate;
    const totalWithVAT = amount + vatAmount;
    
    return {
        vatAmount: vatAmount.toFixed(2),
        totalWithVAT: totalWithVAT.toFixed(2)
    };
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShoppingCart, WebsiteFeatures, calculateShipping, calculateVAT };
}