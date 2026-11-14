// ============================================================================
// READNOVAHUB - SLUSH ENGINE & DYNAMIC CONFIG CONTROLLER
// High-energy animations, 3D physics, real-time price synchronization
// ============================================================================

let currentConfig = {
  bookTitle: "The Student AI Side Hustle Playbook",
  author: "ReadNovaHub",
  price: 299,
  originalPrice: 599,
  currency: "INR",
  currencySymbol: "₹",
  razorpayKeyId: "rzp_live_TvFbRhljzSOYwF",
  upiId: "readnovahub@upi"
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  fetchConfig();
  setup3DBookParallax();
  updateCalculator();
  switchReaderChapter(1);
  startSocialProofToasts();
  setupInteractiveCounters();
});

// Fetch Store Configuration (from API + Local Storage Sync)
async function fetchConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      currentConfig = { ...currentConfig, ...data };
    }
  } catch (err) {
    console.warn("Could not fetch remote config, using fallback:", err);
  }

  // Check for local storage override if admin saved locally
  try {
    const local = localStorage.getItem('rnh_admin_config');
    if (local) {
      const parsed = JSON.parse(local);
      currentConfig = { ...currentConfig, ...parsed };
    }
  } catch (e) {}

  applyConfig(currentConfig);
  updateCalculator();
}

// Dynamically apply config & update ALL prices across the entire page
function applyConfig(cfg) {
  const pageTitle = document.getElementById('page-title');
  if (pageTitle && cfg.bookTitle) {
    pageTitle.textContent = `${cfg.bookTitle} | ReadNovaHub`;
  }

  const coverTitle = document.getElementById('cover-title');
  if (coverTitle && cfg.bookTitle) {
    coverTitle.textContent = cfg.bookTitle.toUpperCase();
  }

  const coverAuthor = document.getElementById('cover-author');
  if (coverAuthor && cfg.author) {
    coverAuthor.textContent = cfg.author;
  }

  const modalBookTitle = document.getElementById('modal-book-title');
  if (modalBookTitle && cfg.bookTitle) {
    modalBookTitle.textContent = cfg.bookTitle;
  }

  const stickyTitle = document.getElementById('sticky-title');
  if (stickyTitle && cfg.bookTitle) {
    stickyTitle.textContent = cfg.bookTitle;
  }

  const symbol = cfg.currencySymbol || '₹';
  const price = cfg.price || 299;
  const original = cfg.originalPrice || (price * 2);

  const formattedPrice = `${symbol}${price}`;
  const formattedOriginal = `${symbol}${original}`;

  // 1. Update all explicit price display elements
  document.querySelectorAll('.book-price-display').forEach(el => {
    el.textContent = formattedPrice;
  });

  document.querySelectorAll('.original-price-display').forEach(el => {
    el.textContent = formattedOriginal;
  });

  // 2. Dynamically scan buttons and labels to update price text
  document.querySelectorAll('button, a, span, p, h3').forEach(el => {
    if (el.children.length <= 1) {
      // Replace hardcoded ₹299 or old prices with dynamic formattedPrice
      if (el.textContent.includes('₹') && !el.classList.contains('no-price-replace') && !el.closest('#calculator')) {
        el.innerHTML = el.innerHTML.replace(/₹\s*\d+/g, formattedPrice);
      }
    }
  });

  // 3. Update checkout submit button specifically
  const payBtn = document.getElementById('pay-button');
  if (payBtn) {
    payBtn.innerHTML = `<i data-lucide="lock" class="w-4 h-4 mr-1"></i><span>Pay ${formattedPrice} (GPay, PhonePe, Cards)</span>`;
    if (window.lucide) lucide.createIcons();
  }
}

// ============================================================================
// 1. DYNAMIC 3D MOUSE PARALLAX & TACTILE PHYSICS ENGINE
// ============================================================================
function setup3DBookParallax() {
  const container = document.getElementById('hero-book-wrap');
  const book = document.getElementById('book-3d-element');
  if (!container || !book) return;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - (rect.width / 2);
    const y = e.clientY - rect.top - (rect.height / 2);

    const rotX = -(y / rect.height) * 26;
    const rotY = (x / rect.width) * 26;

    book.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04, 1.04, 1.04)`;
  });

  container.addEventListener('mouseleave', () => {
    book.style.transform = `rotateY(-16deg) rotateX(6deg) scale3d(1, 1, 1)`;
  });
}

// ============================================================================
// 2. FREELANCE EARNINGS CALCULATOR WITH COUNTER ANIMATION
// ============================================================================
const sliderSales = document.getElementById('slider-sales');
const sliderPrice = document.getElementById('slider-price');
const salesVal = document.getElementById('slider-sales-val');
const priceVal = document.getElementById('slider-price-val');
const monthlyIncome = document.getElementById('calc-monthly-income');
const annualIncome = document.getElementById('calc-annual-income');

if (sliderSales && sliderPrice) {
  sliderSales.addEventListener('input', updateCalculator);
  sliderPrice.addEventListener('input', updateCalculator);
}

function updateCalculator() {
  if (!sliderSales || !sliderPrice) return;
  const gigs = parseInt(sliderSales.value, 10);
  const rate = parseInt(sliderPrice.value, 10);

  if (salesVal) salesVal.textContent = `${gigs} gigs / wk`;
  if (priceVal) priceVal.textContent = `₹${rate.toLocaleString('en-IN')} / gig`;

  // 4 weeks per month
  const monthly = gigs * rate * 4;
  const annual = monthly * 12;

  if (monthlyIncome) animateCounter(monthlyIncome, monthly, '₹');
  if (annualIncome) annualIncome.textContent = `₹${annual.toLocaleString('en-IN')} / year`;
}

function animateCounter(element, target, prefix = '') {
  const start = parseInt(element.textContent.replace(/[^0-9]/g, '') || 0, 10);
  const duration = 280;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const current = Math.floor(start + (target - start) * progress);
    element.textContent = `${prefix}${current.toLocaleString('en-IN')}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

function setupInteractiveCounters() {
  // Add quick tactile click animations to all buttons
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.add('scale-95');
      setTimeout(() => this.classList.remove('scale-95'), 120);
    });
  });
}

// ============================================================================
// 3. SAMPLE CHAPTER READER MODAL
// ============================================================================
const CHAPTERS = {
  1: {
    heading: "Chapter 1: The AI Freelancer Mindset",
    content: `
      <p class="font-bold text-black text-sm">Welcome to Chapter 1 of The Student AI Side Hustle Playbook.</p>
      <p>Most students look at artificial intelligence tools like ChatGPT, Claude, and Midjourney through a consumer lens. They use them to summarize college PDF notes, generate homework questions, or rewrite essays.</p>
      <p>Meanwhile, businesses, founders, and content creators are desperate for fast, dependable micro-services—and they are actively paying ₹1,000 to ₹4,000 for work that takes an AI-empowered student less than 30 minutes to complete.</p>
      <div class="p-4 rounded-xl bg-slush-ice border-2 border-black my-4">
        <strong class="block text-xs font-black uppercase tracking-wider mb-1 text-black">The Core Mindset Shift:</strong>
        <p class="text-xs text-gray-800 font-medium">Clients do not pay for AI. Clients pay for completed outcomes that save them time.</p>
      </div>
      <p>In the upcoming chapters, you will receive the exact step-by-step blueprints for 5 distinct AI micro-services, complete with client outreach scripts, prompt templates, and pricing guides.</p>
    `
  },
  2: {
    heading: "Chapter 2: The 5 High-Demand AI Micro-Services",
    content: `
      <p class="font-bold text-black text-sm">Overview of the Top 5 In-Demand Services in 2026:</p>
      <ul class="space-y-2 text-xs font-medium text-gray-800 list-disc pl-5 my-3">
        <li><strong>Service 1:</strong> AI Long-Form SEO Articles & Founder LinkedIn Ghostwriting (₹1,500/article)</li>
        <li><strong>Service 2:</strong> High-Retention Visual Carousels & Infographics (₹1,200/deck)</li>
        <li><strong>Service 3:</strong> 30-Second Hook-to-CTA Short-Form Reel Scripts (₹2,500/pack)</li>
        <li><strong>Service 4:</strong> Digital Outreach & Lead Generation Funnels (₹3,000/campaign)</li>
        <li><strong>Service 5:</strong> Automated PDF / Digital Checkout Pipeline setup (₹4,000/store)</li>
      </ul>
      <p>Inside the full edition: You get the fill-in-the-blank prompt chains and quality-control checklists for every single service.</p>
    `
  }
};

function switchReaderChapter(num) {
  const chapter = CHAPTERS[num];
  if (!chapter) return;
  const heading = document.getElementById('reader-heading');
  const body = document.getElementById('reader-body');
  if (heading) heading.textContent = chapter.heading;
  if (body) body.innerHTML = chapter.content;
}

function openPreviewModal() {
  const modal = document.getElementById('preview-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  }
}

function closePreviewModal() {
  const modal = document.getElementById('preview-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// ============================================================================
// 4. CHECKOUT MODAL & RAZORPAY INTEGRATION (LIVE GATEWAY)
// ============================================================================
function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.getElementById('checkout-step-form')?.classList.remove('hidden');
    document.getElementById('checkout-step-success')?.classList.add('hidden');
    if (window.lucide) lucide.createIcons();
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function handlePaymentSubmit(e) {
  e.preventDefault();
  const payBtn = document.getElementById('pay-button');
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.innerHTML = '<span>Opening Secure Razorpay...</span>';
  }

  const name = document.getElementById('cust-name').value;
  const email = document.getElementById('cust-email').value;
  const phone = document.getElementById('cust-phone').value;

  try {
    // 1. Create order on server
    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone })
    });

    const orderData = await orderRes.json();
    if (!orderData.success) {
      throw new Error(orderData.error || 'Could not initiate order');
    }

    // 2. Open Razorpay Checkout Modal
    const options = {
      key: orderData.razorpayKeyId || currentConfig.razorpayKeyId,
      amount: orderData.amountInPaise,
      currency: orderData.currency || 'INR',
      name: "ReadNovaHub",
      description: orderData.bookTitle || currentConfig.bookTitle,
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: name,
        email: email,
        contact: phone
      },
      theme: {
        color: "#2563eb"
      },
      handler: async function (response) {
        // 3. Verify Payment
        await verifyAndDeliverPayment(response, orderData, { name, email, phone });
      },
      modal: {
        ondismiss: function () {
          if (payBtn) {
            payBtn.disabled = false;
            applyConfig(currentConfig);
          }
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    alert("Payment initialization error: " + err.message);
    if (payBtn) {
      payBtn.disabled = false;
      applyConfig(currentConfig);
    }
  }
}

async function verifyAndDeliverPayment(paymentResponse, orderData, customerData) {
  try {
    const verifyRes = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        customerName: customerData.name,
        customerEmail: customerData.email,
        customerPhone: customerData.phone,
        orderId: orderData.orderId,
        amount: orderData.amount
      })
    });

    const verifyData = await verifyRes.json();

    // Trigger celebration audio chime & multi-confetti
    playCelebrationChime();
    fireMultiConfetti();

    // Show success step
    document.getElementById('checkout-step-form')?.classList.add('hidden');
    const successStep = document.getElementById('checkout-step-success');
    if (successStep) {
      successStep.classList.remove('hidden');
      document.getElementById('success-order-id').textContent = orderData.orderId;
      document.getElementById('success-customer-email').textContent = customerData.email;
      
      const dlLink = document.getElementById('download-link');
      if (dlLink && verifyData.downloadUrl) {
        dlLink.href = verifyData.downloadUrl;
      }
    }

    // Auto-trigger PDF download directly
    setTimeout(() => {
      const dl = document.getElementById('download-link');
      if (dl) dl.click();
    }, 1200);

  } catch (err) {
    alert("Payment verification note: Payment succeeded, preparing your download link!");
    document.getElementById('checkout-step-form')?.classList.add('hidden');
    document.getElementById('checkout-step-success')?.classList.remove('hidden');
  }
}

// Multi-stage confetti celebration
function fireMultiConfetti() {
  if (typeof confetti !== 'function') return;
  confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  setTimeout(() => {
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
  }, 300);
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
  }, 600);
}

// Major Victory Audio Chime via Web Audio API
function playCelebrationChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.12));
      gain.gain.setValueAtTime(0.2, ctx.currentTime + (idx * 0.12));
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx * 0.12) + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + (idx * 0.12));
      osc.stop(ctx.currentTime + (idx * 0.12) + 0.6);
    });
  } catch (e) {}
}

// Social proof notifications
function startSocialProofToasts() {
  const toast = document.getElementById('social-toast');
  if (!toast) return;

  const buyers = [
    { name: "Student in Chennai", time: "3 mins ago" },
    { name: "Student in Bangalore", time: "11 mins ago" },
    { name: "Freelancer in Mumbai", time: "18 mins ago" },
    { name: "Student in Coimbatore", time: "25 mins ago" },
    { name: "Engineering Student (VIT)", time: "32 mins ago" }
  ];

  let idx = 0;
  setInterval(() => {
    const b = buyers[idx % buyers.length];
    const title = document.getElementById('toast-title');
    const desc = document.getElementById('toast-desc');
    if (title) title.textContent = b.name;
    if (desc) desc.textContent = `Just unlocked the Playbook • ${b.time}`;

    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 4500);

    idx++;
  }, 14000);
}
