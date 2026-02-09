class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('glowlab-cart')) || [];
        this.updateCartCount();
        this.renderCart();
        this.setupEventListeners();
    }
    
    addItem(id, name, price, quantity = 1) {
        const itemId = id.toString();
        const existingItem = this.items.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ 
                id: itemId, 
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
    
    removeItem(id) {
        const itemId = id.toString();
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.showNotification('Item removed from cart');
    }
    
    updateQuantity(id, quantity) {
        const itemId = id.toString();
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(itemId);
            } else {
                this.saveCart();
                this.renderCart();
            }
        }
    }
    
    clearCart() {
        if (this.items.length === 0) return;
        
        this.items = [];
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.showNotification('Cart cleared!');
    }
    
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    formatPrice(amount) {
        if (amount >= 1000) {
            return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        return amount.toFixed(2);
    }

    saveCart() {
        localStorage.setItem('glowlab-cart', JSON.stringify(this.items));
    }
    
    updateCartCount() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }
    
    renderCart() {
        const cartItems = document.querySelector('.cart-items');
        const emptyCart = cartItems ? cartItems.querySelector('.empty-cart') : null;
        const totalAmount = document.querySelector('.total-amount');
        
        if (!cartItems || !totalAmount) return;
        
        if (this.items.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            totalAmount.textContent = this.formatPrice(0);
            return;
        }
        
        if (emptyCart) emptyCart.style.display = 'none';
        
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
        
        this.setupCartItemListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const button = e.target.closest('.add-to-cart');
                const id = button.dataset.id;
                const name = button.dataset.name;
                const price = button.dataset.price;
                
                this.addItem(id, name, price);
                
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Added!';
                button.style.background = '#27ae60';
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.style.background = '';
                }, 1500);
            }
        });
        
        const cartBtn = document.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('.cart-sidebar').classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        const closeCart = document.querySelector('.close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', () => {
                document.querySelector('.cart-sidebar').classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        const clearCartBtn = document.querySelector('.clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (this.items.length > 0 && confirm('Are you sure you want to clear your entire cart?')) {
                    this.clearCart();
                }
            });
        }
        
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) {
                    alert('Your cart is empty! Add some products first.');
                    return;
                }
                
                this.showPaymentModal();
            });
        }
        
        document.addEventListener('click', (e) => {
            const cart = document.querySelector('.cart-sidebar');
            const cartBtn = document.querySelector('.cart-btn');
            
            if (cart && cart.classList.contains('active') && 
                !cart.contains(e.target) && 
                !cartBtn.contains(e.target)) {
                cart.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const cart = document.querySelector('.cart-sidebar');
                if (cart && cart.classList.contains('active')) {
                    cart.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }
    
    setupCartItemListeners() {
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.quantity-btn').dataset.id;
                const item = this.items.find(item => item.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.quantity-btn').dataset.id;
                const item = this.items.find(item => item.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity + 1);
                }
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.remove-item').dataset.id;
                if (confirm('Remove this item from cart?')) {
                    this.removeItem(id);
                }
            });
        });
    }
    
    showPaymentModal() {
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
            
            this.setupPaymentModalListeners();
        }
        
        document.querySelector('.payment-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    setupPaymentModalListeners() {
        const paymentModal = document.querySelector('.payment-modal');
        const closePayment = document.querySelector('.close-payment');
        const paymentOptions = document.querySelectorAll('.payment-option');
        const payBtn = document.querySelector('.pay-btn');
        
        if (!paymentModal || !closePayment || !payBtn) return;
        
        closePayment.addEventListener('click', () => {
            paymentModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                paymentModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && paymentModal.classList.contains('active')) {
                paymentModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                paymentOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                payBtn.disabled = false;
                const methodName = option.querySelector('span').textContent;
                payBtn.textContent = `Pay R${this.formatPrice(this.getTotal())} with ${methodName}`;
            });
        });
        
        payBtn.addEventListener('click', () => {
            const selectedMethod = document.querySelector('.payment-option.selected');
            if (!selectedMethod) return;
            
            const total = this.getTotal();
      
            payBtn.disabled = true;
            payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            setTimeout(() => {
                this.showNotification(`Payment successful! Thank you for your order of R${this.formatPrice(total)}`);
    
                this.clearCart();

                paymentModal.classList.remove('active');
                const cart = document.querySelector('.cart-sidebar');
                if (cart) cart.classList.remove('active');
                document.body.style.overflow = '';
                
                alert(`🎉 Order Confirmed!\n\nThank you for shopping with GlowLab!\n\n📦 Order Total: R${this.formatPrice(total)}\n💳 Payment Method: ${selectedMethod.querySelector('span').textContent}\n📧 Order confirmation sent to email\n🚚 Delivery: 3-5 business days\n\nWe'll send tracking information soon!`);
                
                paymentModal.remove();
            }, 2000);
        });
    }
    
    showNotification(message) {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
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

class ArticleSystem {
    constructor() {
        this.articles = {
            1: {
                title: "The Morning Routine That Changed My Skin",
                author: "Dr. Sarah Chen",
                readTime: "5 min read",
                content: `
                    <h2>The 3-Step Morning Routine for Glowing Skin</h2>
                    <p>After years of struggling with dull, tired-looking skin, I discovered a simple morning routine that transformed my complexion. Here are the three essential steps:</p>
                    
                    <h3>Step 1: Gentle Cleansing</h3>
                    <p>Start your day with a gentle, pH-balanced cleanser. Avoid harsh formulas that strip your skin's natural oils. Look for ingredients like:</p>
                    <ul>
                        <li><strong>Glycerin:</strong> Hydrates without clogging pores</li>
                        <li><strong>Ceramides:</strong> Strengthen skin barrier</li>
                        <li><strong>Green tea extract:</strong> Antioxidant protection</li>
                    </ul>
                    
                    <div class="article-tip">
                        <strong>Pro Tip:</strong> Use lukewarm water, not hot water, to prevent dryness.
                    </div>
                    
                    <h3>Step 2: Antioxidant Protection</h3>
                    <p>Vitamin C serum is the star of any morning routine. It provides:</p>
                    <ul>
                        <li>Protection against environmental damage</li>
                        <li>Brightening and evening of skin tone</li>
                        <li>Boosts collagen production</li>
                    </ul>
                    <p>Apply 2-3 drops of Vitamin C serum after cleansing and before moisturizing.</p>
                    
                    <h3>Step 3: Moisturize & Protect</h3>
                    <p>Never skip sunscreen! Even on cloudy days. Your morning moisturizer should contain:</p>
                    <ul>
                        <li><strong>SPF 30+:</strong> Minimum protection</li>
                        <li><strong>Hyaluronic acid:</strong> Hydration boost</li>
                        <li><strong>Niacinamide:</strong> Reduces redness and pores</li>
                    </ul>
                    
                    <p>This simple routine takes less than 5 minutes but makes a world of difference. Consistency is key - stick with it for at least 4 weeks to see visible results.</p>
                `
            },
            2: {
                title: "Retinol: Beginner's Guide",
                author: "The GlowLab Team",
                readTime: "7 min read",
                content: `
                    <h2>How to Start Using Retinol Safely</h2>
                    <p>Retinol is one of the most effective anti-aging ingredients, but it can be intimidating for beginners. Here's your complete guide:</p>
                    
                    <h3>What is Retinol?</h3>
                    <p>Retinol is a form of Vitamin A that speeds up cell turnover, increases collagen production, and helps with:</p>
                    <ul>
                        <li>Fine lines and wrinkles</li>
                        <li>Acne and breakouts</li>
                        <li>Uneven skin tone and texture</li>
                        <li>Hyperpigmentation</li>
                    </ul>
                    
                    <h3>The Golden Rule: Start Low, Go Slow</h3>
                    <p>Begin with a low concentration (0.25% or 0.3%) and use it only 1-2 times per week. Gradually increase frequency as your skin adjusts.</p>
                    
                    <div class="article-tip">
                        <strong>Warning:</strong> Never start retinol during summer or before sun exposure. Always use sunscreen!
                    </div>
                    
                    <h3>Application Technique</h3>
                    <p>1. Cleanse and tone your skin<br>
                    2. Wait 10-15 minutes for skin to dry completely<br>
                    3. Apply a pea-sized amount to entire face<br>
                    4. Avoid eye area and corners of mouth<br>
                    5. Follow with moisturizer</p>
                    
                    <h3>Common Side Effects (The "Retinol Uglies")</h3>
                    <p>Initial reactions may include:</p>
                    <ul>
                        <li>Dryness and flaking</li>
                        <li>Redness and irritation</li>
                        <li>Increased sensitivity</li>
                        <li>Purge breakouts (temporary)</li>
                    </ul>
                    <p>These usually subside within 2-6 weeks as your skin adjusts.</p>
                    
                    <h3>What to Avoid</h3>
                    <p>Don't mix retinol with:</p>
                    <ul>
                        <li>Vitamin C (use in morning instead)</li>
                        <li>Benzoyl peroxide (cancels each other out)</li>
                        <li>Other strong actives (AHA/BHA)</li>
                    </ul>
                    
                    <p>Be patient! It takes 3-6 months to see significant results with retinol.</p>
                `
            },
            3: {
                title: "Ingredients to Avoid on Sensitive Skin",
                author: "Snegugu Zulu of GlowLab Team",
                readTime: "5 min read",
                content: `
                    <h2>Sensitive Skin Survival Guide</h2>
                    <p>If you have sensitive skin, choosing the right products is crucial. Here are ingredients to avoid and what to use instead:</p>
                    
                    <h3>Top 5 Ingredients to Avoid</h3>
                    <p><strong>1. Fragrance (Parfum):</strong> The #1 irritant for sensitive skin. Both synthetic and natural fragrances can cause reactions.</p>
                    <p><strong>2. Alcohol (Denatured/Ethanol):</strong> Dries out skin and damages the moisture barrier. Look for fatty alcohols instead (cetyl, stearyl).</p>
                    <p><strong>3. Essential Oils:</strong> While natural, they're highly concentrated and can cause irritation, especially citrus oils.</p>
                    <p><strong>4. Sulfates (SLS/SLES):</strong> Harsh cleansers that strip natural oils, leading to dryness and irritation.</p>
                    <p><strong>5. Physical Scrubs:</strong> Avoid walnut shells, apricot pits, or large beads that can cause micro-tears.</p>
                    
                    <div class="article-tip">
                        <strong>Remember:</strong> "Natural" doesn't always mean better for sensitive skin. Poison ivy is natural too!
                    </div>
                    
                    <h3>Safer Alternatives</h3>
                    <p>Instead of harsh ingredients, look for these gentle alternatives:</p>
                    
                    <h4>For Cleansing:</h4>
                    <ul>
                        <li><strong>Cream or milk cleansers</strong> instead of foaming cleansers</li>
                        <li><strong>Micellar water</strong> for gentle makeup removal</li>
                        <li><strong>Oil cleansers</strong> that dissolve impurities without stripping</li>
                    </ul>
                    
                    <h4>For Exfoliation:</h4>
                    <ul>
                        <li><strong>PHA (Polyhydroxy Acids):</strong> Gentler than AHA/BHA</li>
                        <li><strong>Enzyme exfoliants:</strong> Papain or bromelain</li>
                        <li><strong>Low percentage mandelic acid:</strong> Larger molecules don't penetrate as deeply</li>
                    </ul>
                    
                    <h3>Patch Testing 101</h3>
                    <p>Always patch test new products:</p>
                    <ol>
                        <li>Apply a small amount behind ear or inner arm</li>
                        <li>Wait 24-48 hours</li>
                        <li>Check for redness, itching, or swelling</li>
                        <li>If no reaction, test on jawline before full face</li>
                    </ol>
                    
                    <h3>Building a Sensitive Skin Routine</h3>
                    <p>Keep it simple: Cleanse → Treat → Moisturize → Protect<br>
                    Introduce new products one at a time, with 2 weeks between each new addition.</p>
                    
                    <p>Remember, sensitive skin needs extra love and patience. When in doubt, less is more!</p>
                `
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupArticleListeners();
    }
    
    setupArticleListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.read-more')) {
                e.preventDefault();
                const link = e.target.closest('.read-more');
                const articleId = link.dataset.article;
                this.showArticle(articleId);
            }
        });
        
        const closeArticleBtn = document.querySelector('.close-article');
        const articleModal = document.getElementById('articleModal');
        
        if (closeArticleBtn && articleModal) {
            closeArticleBtn.addEventListener('click', () => {
                this.hideArticle();
            });
   
            articleModal.addEventListener('click', (e) => {
                if (e.target === articleModal) {
                    this.hideArticle();
                }
            });
       
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (articleModal.classList.contains('active')) {
                        this.hideArticle();
                    }
                }
            });
        } else {
            console.error('Article modal or close button not found in HTML!');
        }
    }
    
    showArticle(articleId) {
        const article = this.articles[articleId];
        if (!article) return;
        
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-body').innerHTML = `
            <p class="blog-meta">By ${article.author} • ${article.readTime}</p>
            ${article.content}
        `;
 
        const articleModal = document.getElementById('articleModal');
        if (articleModal) {
            articleModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideArticle() {
        const articleModal = document.getElementById('articleModal');
        if (articleModal) {
            articleModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

class WebsiteFeatures {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupSmoothScrolling();
        this.updateCopyrightYear();
        this.setupProductInteractions();
    }
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#cart' || href === '#' || href.includes('article')) return;
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
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const button = card.querySelector('.add-to-cart');
                if (button) button.style.transform = 'scale(1.05)';
                card.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                const button = card.querySelector('.add-to-cart');
                if (button) button.style.transform = 'scale(1)';
                card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cart = new ShoppingCart();
    
    const articles = new ArticleSystem();
    
    const features = new WebsiteFeatures();
    
    console.log('✨ GlowLab Skincare Website Loaded!');
    console.log('🎨 Green & Purple Theme Applied');
    console.log('📚 Article System Ready');
    console.log('🛒 Cart items:', cart.items.length);
    
    if (cart.items.length > 0) {
        console.log(`🔄 Cart restored from previous session: ${cart.items.length} items`);
    }
});

function calculateVAT(amount) {
    const vatRate = 0.15;
    const vatAmount = amount * vatRate;
    const totalWithVAT = amount + vatAmount;
    
    return {
        vatAmount: vatAmount.toFixed(2),
        totalWithVAT: totalWithVAT.toFixed(2)
    };
}