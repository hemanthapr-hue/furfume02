// state Management
let cart = [];
let selectedEngravingBottle = {
  id: 'spiced-oud',
  name: 'No. 1 Spiced Oud',
  price: 145,
  img: 'assets/perfume_no1.png'
};

// DOM Elements cache
const header = document.getElementById('header');
const cartTriggerBtn = document.getElementById('cart-trigger-btn');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCountElement = document.getElementById('cart-count');
const cartTotalValElement = document.getElementById('cart-total-val');
const checkoutBtn = document.getElementById('cart-checkout-btn');

// Engraver elements
const engravingTextInput = document.getElementById('engraving-text-input');
const engravingRenderText = document.getElementById('engraving-render-text');
const engraverCharCount = document.getElementById('engraver-char-count');
const engraverBottlePreview = document.getElementById('engraver-bottle-preview');
const engraverSubmitBtn = document.getElementById('engraver-submit-btn');
const bottleSelectors = document.querySelectorAll('.engraver-bottle-select');

// Page Initializations
document.addEventListener('DOMContentLoaded', () => {
  // Load existing shopping collection
  loadCart();
  
  // Set up fragrance notes tabs
  initProductTabs();
  
  // Set up custom engraving interactions
  initEngravingWidget();
  
  // Set up scroll animations via intersection observers
  initScrollAnimations();

  // Scroll header shrink handler
  window.addEventListener('scroll', handleHeaderScroll);
  
  // Cart drawer triggers
  cartTriggerBtn.addEventListener('click', toggleCartDrawer);
  cartCloseBtn.addEventListener('click', toggleCartDrawer);
  cartOverlay.addEventListener('click', toggleCartDrawer);
  
  // Standard product card action listeners
  const productActionBtns = document.querySelectorAll('.product-action-btn');
  productActionBtns.forEach(btn => {
    btn.addEventListener('click', handleProductAddClick);
  });

  // Cart checkout button listener
  checkoutBtn.addEventListener('click', handleCheckout);
});

/* ==========================================================================
   Header Scroll Shrink
   ========================================================================== */
function handleHeaderScroll() {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

/* ==========================================================================
   Shopping Cart Drawer & State Operations
   ========================================================================== */
function toggleCartDrawer() {
  cartDrawer.classList.toggle('active');
  cartOverlay.classList.toggle('active');
}

function openCartDrawer() {
  cartDrawer.classList.add('active');
  cartOverlay.classList.add('active');
}

function saveCart() {
  localStorage.setItem('cinomon_cart', JSON.stringify(cart));
}

function loadCart() {
  const localData = localStorage.getItem('cinomon_cart');
  if (localData) {
    try {
      cart = JSON.parse(localData);
    } catch (e) {
      cart = [];
    }
  }
  renderCart();
}

function renderCart() {
  cartItemsContainer.innerHTML = '';
  let totalCount = 0;
  let totalPrice = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <svg class="cart-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
        <p style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--text-primary);">Your collection is empty</p>
        <p style="font-size: 0.85rem;">Discover our signature blends to begin your olfactory journey.</p>
      </div>
    `;
    checkoutBtn.style.display = 'none';
  } else {
    checkoutBtn.style.display = 'block';
    
    cart.forEach((item, index) => {
      totalCount += item.quantity;
      const itemSubtotal = item.price * item.quantity;
      totalPrice += itemSubtotal;

      const itemCard = document.createElement('div');
      itemCard.classList.add('cart-item');
      
      const engravingLabelHTML = item.engraving 
        ? `<span class="cart-item-engraving">Engraved: "${item.engraving}"</span>` 
        : '';

      itemCard.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.img}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <span class="cart-item-title">${item.name}</span>
          ${engravingLabelHTML}
          <span class="cart-item-price">$${item.price}</span>
          
          <div class="cart-item-qty-selector">
            <button class="qty-btn minus" data-index="${index}">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn plus" data-index="${index}">+</button>
          </div>
        </div>
        <button class="cart-item-remove-btn" data-index="${index}" aria-label="Remove item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;
      
      cartItemsContainer.appendChild(itemCard);
    });
  }

  // Update totals
  cartCountElement.textContent = totalCount;
  cartTotalValElement.textContent = `$${totalPrice.toFixed(2)}`;

  // Bind cart quantity listeners
  const plusBtns = cartItemsContainer.querySelectorAll('.qty-btn.plus');
  const minusBtns = cartItemsContainer.querySelectorAll('.qty-btn.minus');
  const removeBtns = cartItemsContainer.querySelectorAll('.cart-item-remove-btn');

  plusBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      cart[idx].quantity += 1;
      saveCart();
      renderCart();
    });
  });

  minusBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      if (cart[idx].quantity > 1) {
        cart[idx].quantity -= 1;
      } else {
        cart.splice(idx, 1);
      }
      saveCart();
      renderCart();
    });
  });

  removeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      cart.splice(idx, 1);
      saveCart();
      renderCart();
    });
  });
}

function addToCart(id, name, price, img, engraving = '') {
  // Find match with exact same ID and engraving details
  const existingItemIndex = cart.findIndex(item => item.id === id && item.engraving === engraving);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id,
      name,
      price: parseFloat(price),
      img,
      quantity: 1,
      engraving
    });
  }

  saveCart();
  renderCart();
  openCartDrawer();
}

function handleProductAddClick(e) {
  const btn = e.currentTarget;
  const id = btn.getAttribute('data-product-id');
  const name = btn.getAttribute('data-product-name');
  const price = btn.getAttribute('data-product-price');
  const img = btn.getAttribute('data-product-img');

  addToCart(id, name, price, img);
}

function handleCheckout() {
  if (cart.length === 0) return;
  
  // Premium custom confirmation
  const nameInput = cart.find(i => i.engraving)?.engraving || 'Valued Collector';
  
  // Show luxurious finalization state
  cartItemsContainer.innerHTML = `
    <div class="cart-empty-message" style="animation: fadeInEffect 0.6s ease; padding: 2rem 0;">
      <svg style="color: var(--gold-glow);" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <p style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--gold-metallic); margin-top: 1rem;">Order Distilled</p>
      <p style="font-size: 0.9rem; max-width: 280px; margin: 0 auto; line-height: 1.6;">
        Thank you, ${nameInput}. Your artisanal cinnamon blends are being prepared for small-batch formulation.
      </p>
      <p style="font-size: 0.75rem; color: var(--text-dark); margin-top: 2rem;">A confirmation was dispatched to your olfactory records.</p>
    </div>
  `;

  // Reset local storage cart state
  cart = [];
  saveCart();
  
  // Reset badges
  cartCountElement.textContent = '0';
  cartTotalValElement.textContent = '$0.00';
  checkoutBtn.style.display = 'none';
}

/* ==========================================================================
   Product Fragrance notes Tab panels
   ========================================================================== */
function initProductTabs() {
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const tabBtns = card.querySelectorAll('.tab-btn');
    const tabPanes = card.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTabId = e.currentTarget.getAttribute('data-tab');
        
        // Remove active class from buttons & panes in this card only
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        // Activate target
        e.currentTarget.classList.add('active');
        card.querySelector(`#${targetTabId}`).classList.add('active');
      });
    });
  });
}

/* ==========================================================================
   Scent Finder Quiz System
   ========================================================================== */
let currentQuizStep = 1;

function updateQuizProgress() {
  const progressLine = document.getElementById('quiz-progress');
  const totalSteps = 4;
  const percentage = ((currentQuizStep - 1) / (totalSteps)) * 100;
  progressLine.style.width = `${percentage}%`;
}

function nextQuizStep() {
  const currentStepElement = document.querySelector(`.quiz-step[data-step="${currentQuizStep}"]`);
  currentStepElement.classList.remove('active');
  
  currentQuizStep += 1;
  
  const nextStepElement = document.querySelector(`.quiz-step[data-step="${currentQuizStep}"]`);
  nextStepElement.classList.add('active');
  
  updateQuizProgress();
}

function prevQuizStep() {
  const currentStepElement = document.querySelector(`.quiz-step[data-step="${currentQuizStep}"]`);
  currentStepElement.classList.remove('active');
  
  currentQuizStep -= 1;
  
  const prevStepElement = document.querySelector(`.quiz-step[data-step="${currentQuizStep}"]`);
  prevStepElement.classList.add('active');
  
  updateQuizProgress();
}

function calculateQuizResult() {
  // Collect choice answers
  const q1 = document.querySelector('input[name="quiz-q1"]:checked')?.value;
  const q2 = document.querySelector('input[name="quiz-q2"]:checked')?.value;
  const q3 = document.querySelector('input[name="quiz-q3"]:checked')?.value;
  const q4 = document.querySelector('input[name="quiz-q4"]:checked')?.value;
  
  const choices = [q1, q2, q3, q4];
  
  // Dynamic calculation scoring: count frequencies
  const freq = {};
  let recommendedProduct = 'spiced-oud'; // fallback
  let maxCount = 0;
  
  choices.forEach(val => {
    if (val) {
      freq[val] = (freq[val] || 0) + 1;
      if (freq[val] > maxCount) {
        maxCount = freq[val];
        recommendedProduct = val;
      }
    }
  });

  // Scent details matching specifications
  const productsDatabase = {
    'spiced-oud': {
      name: 'No. 1 Spiced Oud',
      tagline: 'Woody & Warm Spice',
      desc: 'An enigmatic, deep blend of rare organic oud wood and warm Ceylon cinnamon bark. Perfectly matches your desire for a commanding, bold presence.',
      price: 145,
      img: 'assets/perfume_no1.png',
      matchPct: 95
    },
    'vanilla-bark': {
      name: 'Blanc Vanilla Bark',
      tagline: 'Sweet Cream & Soft Wood',
      desc: 'A sophisticated, creamy indulgence merging bourbon vanilla pods and sweet cinnamon. Custom-fit for your warm, cozy, and comforting scent preferences.',
      price: 135,
      img: 'assets/perfume_blanc.png',
      matchPct: 98
    },
    'crimson-bark': {
      name: 'Rose Crimson Bark',
      tagline: 'Spicy Floral & Romantic',
      desc: 'A passionate, velvety signature highlighting Turkish Damascus rose petals paired with bold red cinnamon. Matches your romantic and highly elegant preferences.',
      price: 150,
      img: 'assets/perfume_rose.png',
      matchPct: 92
    },
    'smoked-amber': {
      name: 'Noir Smoked Amber',
      tagline: 'Smoky Wood & Deep Resin',
      desc: 'An intense, mysterious nocturnal extract of dark smoldering honey amber, toasted cinnamon, and smoked cedar. Perfect for your mysterious, eternal desires.',
      price: 160,
      img: 'assets/perfume_noir.png',
      matchPct: 96
    }
  };

  const matchedProduct = productsDatabase[recommendedProduct];

  // Renders target information in results container
  document.getElementById('result-title').textContent = matchedProduct.name;
  document.getElementById('result-tagline').textContent = matchedProduct.tagline;
  document.getElementById('result-desc').textContent = matchedProduct.desc;
  document.getElementById('result-match-pct').innerHTML = `${matchedProduct.matchPct}<span>%</span>`;

  // Swap to result slide step layout
  const currentStepElement = document.querySelector(`.quiz-step[data-step="${currentQuizStep}"]`);
  currentStepElement.classList.remove('active');
  
  currentQuizStep = 5; // Result state
  const resultStepElement = document.getElementById('quiz-result-step');
  resultStepElement.classList.add('active');
  updateQuizProgress();
  
  // Animate Circular Match Ring
  const progressRing = document.getElementById('result-progress-ring');
  const circumference = 2 * Math.PI * 70; // 439.8
  const offset = circumference - (matchedProduct.matchPct / 100) * circumference;
  
  setTimeout(() => {
    progressRing.style.strokeDashoffset = offset;
  }, 150);

  // Set up add to collection listener on result button
  const resultAddBtn = document.getElementById('quiz-result-add-btn');
  resultAddBtn.onclick = () => {
    addToCart(recommendedProduct, matchedProduct.name, matchedProduct.price, matchedProduct.img);
  };
}

function restartQuiz() {
  document.getElementById('quiz-result-step').classList.remove('active');
  currentQuizStep = 1;
  const firstStepElement = document.querySelector(`.quiz-step[data-step="1"]`);
  firstStepElement.classList.add('active');
  updateQuizProgress();
  
  // Reset dashoffset
  document.getElementById('result-progress-ring').style.strokeDashoffset = 440;
}

/* ==========================================================================
   Virtual Engraving Live Widget
   ========================================================================== */
function initEngravingWidget() {
  // Real-time typography mirroring
  engravingTextInput.addEventListener('input', (e) => {
    let text = e.target.value.toUpperCase();
    e.target.value = text; // Keep input uppercase
    
    // Character length count indicator
    engroverCharCount.textContent = text.length;
    
    if (text.trim() === '') {
      engravingRenderText.textContent = 'YOUR NAME';
    } else {
      engravingRenderText.textContent = text;
    }

    // Dynamic Font Sizing for glass bottle fitting
    if (text.length > 11) {
      engravingRenderText.className = 'engraving-text-render xsmall-size';
    } else if (text.length > 7) {
      engravingRenderText.className = 'engraving-text-render small-size';
    } else {
      engravingRenderText.className = 'engraving-text-render';
    }
  });

  // Bottle selector selection cards
  bottleSelectors.forEach(selectCard => {
    selectCard.addEventListener('click', (e) => {
      // Remove active states from other select cards
      bottleSelectors.forEach(c => c.classList.remove('active'));
      
      // Activate clicked
      const card = e.currentTarget;
      card.classList.add('active');
      
      // Update selected state data
      selectedEngravingBottle = {
        id: card.getAttribute('data-bottle-id'),
        name: card.getAttribute('data-bottle-name'),
        price: parseFloat(card.getAttribute('data-bottle-id') === 'spiced-oud' ? 145 
                        : card.getAttribute('data-bottle-id') === 'vanilla-bark' ? 135 
                        : card.getAttribute('data-bottle-id') === 'crimson-bark' ? 150 : 160),
        img: card.getAttribute('data-bottle-img')
      };

      // Fade out and swap bottle mockup visual
      engraverBottlePreview.style.opacity = 0;
      setTimeout(() => {
        engraverBottlePreview.src = selectedEngravingBottle.img;
        engraverBottlePreview.style.opacity = 1;
      }, 200);
    });
  });

  // Submit Engraving selection
  engraverSubmitBtn.addEventListener('click', () => {
    const customText = engravingTextInput.value.trim().toUpperCase();
    if (customText === '') {
      // Prompt user elegantly
      engravingTextInput.focus();
      engravingTextInput.style.borderColor = 'hsl(0, 70%, 50%)';
      setTimeout(() => {
        engravingTextInput.style.borderColor = 'var(--border-gold)';
      }, 1000);
      return;
    }

    const engravedName = `Engraved ${selectedEngravingBottle.name}`;
    const totalSurchargePrice = selectedEngravingBottle.price + 15; // $15 customization fee
    
    // Add bespoke bottle to cart
    addToCart(
      `${selectedEngravingBottle.id}-engraved`,
      engravedName,
      totalSurchargePrice,
      selectedEngravingBottle.img,
      customText
    );

    // Clear engraver inputs
    engravingTextInput.value = '';
    engravingRenderText.textContent = 'YOUR NAME';
    engravingRenderText.className = 'engraving-text-render';
    engroverCharCount.textContent = '0';
  });
}

/* ==========================================================================
   Newsletter Subscription
   ========================================================================== */
function submitNewsletter() {
  const emailInput = document.getElementById('newsletter-email');
  const feedback = document.getElementById('newsletter-feedback');
  
  if (emailInput.value.trim() !== '') {
    emailInput.value = '';
    feedback.textContent = 'Welcome to the inner circle. Olfactory updates registered.';
    feedback.style.opacity = 1;
    
    setTimeout(() => {
      feedback.style.opacity = 0;
    }, 4000);
  }
}

/* ==========================================================================
   Scroll Entrance Animations (Intersection Observer)
   ========================================================================== */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once triggered to lock layout state
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Target components
  const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
  animatedElements.forEach(el => observer.observe(el));
}
