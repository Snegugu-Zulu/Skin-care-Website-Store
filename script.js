// ===== SHOPPING CART FUNCTIONALITY =====
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('glowlab-cart')) || [];
        this.updateCartCount();
        this.renderCart();
        this.setupEventListeners();
    }
    
    // Add item to cart - FIXED: Now properly adds all items
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
    
    // Format price
    formatPrice(amount) {
        if (amount >= 1000) {
            return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        return amount.toFixed(2);
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
    
    // Render cart items - FIXED: Now shows all items
    renderCart() {
        const cartItems = document.querySelector('.cart-items');
        const emptyCart = cartItems.querySelector('.empty-cart');
        const totalAmount = document.querySelector('.total-amount');
        
        if (this.items.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            totalAmount.textContent = this.formatPrice(0);
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
                        <p>${item.price.toFixed(2)} × ${item.quantity}</p>
                        <p class="item-subtotal">Subtotal: ${subtotal.toFixed(2)}</p>
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
        
        // Checkout button - UPDATED: Shows payment modal instead of alert
        document.querySelector('.checkout-btn').addEventListener('click', () => {
            if (this.items.length === 0) {
                alert('Your cart is empty! Add some products first.');
                return;
            }
            
            // Show payment modal instead of immediate checkout
            this.showPaymentModal();
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
    
    // Show payment modal
    showPaymentModal() {
        // Create payment modal if it doesn't exist
        if (!document.querySelector('.payment-modal')) {
            const paymentModalHTML = `
                <div class="payment-modal">
                    <div class="payment-content">
                        <div class="payment-header">
                            <h3><i class="fas fa-credit-card"></i> Complete Payment</h3>
                            <button class="close-payment">&times;</button>
                        </div>
                        
                        <div class="payment-details">
                            <p><strong>Order Summary:</strong></p>
                            ${this.items.map(item => `
                                <p>${item.name} × ${item.quantity}: R${(item.price * item.quantity).toFixed(2)}</p>
                            `).join('')}
                            <p><strong>Total: R${this.formatPrice(this.getTotal())}</strong></p>
                        </div>
                        
                        <div class="payment-options">
                            <div class="payment-option" data-method="card">
                                <i class="fas fa-credit-card"></i>
                                <span>Credit/Debit Card</span>
                            </div>
                            <div class="payment-option" data-method="paypal">
                                <i class="fab fa-paypal"></i>
                                <span>PayPal</span>
                            </div>
                            <div class="payment-option" data-method="eft">
                                <i class="fas fa-university"></i>
                                <span>Bank Transfer (EFT)</span>
                            </div>
                            <div class="payment-option" data-method="cash">
                                <i class="fas fa-money-bill-wave"></i>
                                <span>Cash on Delivery</span>
                            </div>
                        </div>
                        
                        <button class="pay-btn" disabled>Select a payment method first</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', paymentModalHTML);
            
            // Add payment modal event listeners
            this.setupPaymentModalListeners();
        }
        
        // Show the modal
        document.querySelector('.payment-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Setup payment modal event listeners
    setupPaymentModalListeners() {
        const paymentModal = document.querySelector('.payment-modal');
        const closePayment = document.querySelector('.close-payment');
        const paymentOptions = document.querySelectorAll('.payment-option');
        const payBtn = document.querySelector('.pay-btn');
        
        // Close modal
        closePayment.addEventListener('click', () => {
            paymentModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close modal when clicking outside
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                paymentModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && paymentModal.classList.contains('active')) {
                paymentModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Payment method selection
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                paymentOptions.forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                option.classList.add('selected');
                // Enable pay button
                payBtn.disabled = false;
                payBtn.textContent = `Pay R${this.formatPrice(this.getTotal())} with ${option.querySelector('span').textContent}`;
            });
        });
        
        // Pay button
        payBtn.addEventListener('click', () => {
            const selectedMethod = document.querySelector('.payment-option.selected');
            if (!selectedMethod) return;
            
            const method = selectedMethod.dataset.method;
            const total = this.getTotal();
            
            // Disable button during processing
            payBtn.disabled = true;
            payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Simulate payment processing
            setTimeout(() => {
                // Success!
                this.showNotification(`Payment successful! Thank you for your order of R${this.formatPrice(total)}`);
                
                // Clear cart
                this.clearCart();
                
                // Close modals
                paymentModal.classList.remove('active');
                document.querySelector('.cart-sidebar').classList.remove('active');
                document.body.style.overflow = '';
                
                // Show order confirmation
                alert(`🎉 Order Confirmed!\n\nThank you for shopping with GlowLab!\n\n📦 Order Total: R${this.formatPrice(total)}\n💳 Payment Method: ${selectedMethod.querySelector('span').textContent}\n📧 Order confirmation sent to email\n🚚 Delivery: 3-5 business days\n\nWe'll send tracking information soon!`);
                
                // Remove payment modal
                paymentModal.remove();
            }, 2000);
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

// South African VAT calculator (15% VAT)
function calculateVAT(amount) {
    const vatRate = 0.15;
    const vatAmount = amount * vatRate;
    const totalWithVAT = amount + vatAmount;
    
    return {
        vatAmount: vatAmount.toFixed(2),
        totalWithVAT: totalWithVAT.toFixed(2)
    };
}