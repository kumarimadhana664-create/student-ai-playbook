// Store State
let currentConfig = {
  bookTitle: "The Student AI Side Hustle Playbook",
  subtitle: "Turn free AI tools into freelance skills, digital services and your first online income.",
  author: "ReadNovaHub",
  price: 9,
  currency: "USD",
  currencySymbol: "$",
  discountPercent: 50,
  originalPrice: 18
};

// Chapter content database for the interactive reader (From Official 2026 Edition)
const CHAPTER_SAMPLES = {
  1: {
    title: "Part I: Chapter 1 • The Student's Guide to AI-Powered Side Hustles",
    text: `
      <div class="bg-indigo-950/60 border border-indigo-500/30 p-4 rounded-2xl mb-4 text-center">
        <p class="font-display font-bold text-white text-base">"Clients don't pay for AI.<br><span class="text-indigo-300">They pay for useful, accurate work from someone they trust."</span></p>
        <span class="text-[11px] text-slate-400 font-mono mt-1 block">— ReadNovaHub</span>
      </div>

      <p class="font-semibold text-white">What an AI side hustle really is:</p>
      <p>An AI side hustle is a small service or product you offer <strong>using AI tools to speed up parts of the work</strong>, while you provide the judgment, quality control and client communication. Remove any ingredient and it falls apart.</p>
      
      <div class="grid grid-cols-4 gap-2 text-center text-xs my-4 bg-slate-950 p-3 rounded-xl border border-white/10">
        <div class="p-2 rounded bg-slate-900 border border-white/5"><span class="font-bold text-indigo-400 block">Your Skill</span>Writing, design</div>
        <div class="p-2 rounded bg-slate-900 border border-white/5"><span class="font-bold text-purple-400 block">+ AI Help</span>Speed & ideas</div>
        <div class="p-2 rounded bg-slate-900 border border-white/5"><span class="font-bold text-pink-400 block">+ Review</span>Accuracy & care</div>
        <div class="p-2 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"><span class="font-bold block">= Service</span>Trust & pay</div>
      </div>

      <div class="bg-amber-950/30 border-l-4 border-amber-500 p-3.5 rounded-r-xl my-4 text-slate-200">
        <h5 class="font-bold text-amber-300 text-xs uppercase tracking-wider mb-1">THE GOLDEN RULE:</h5>
        <p class="text-xs text-slate-300">AI can sound confident while being wrong. It can invent statistics, sources and quotes. <strong>Everything you deliver must be checked by you.</strong></p>
      </div>

      <p class="text-xs text-slate-400">Why students have an unfair edge: You learn new tools without fear, your operating costs are zero, your schedule is flexible, and local shops/creators desperately need help with content and documents.</p>
    `
  },
  2: {
    title: "Part II: Chapter 3 • AI-Assisted Content Writing Services",
    text: `
      <p class="font-semibold text-white text-base">"Turn rough notes into clear, high-converting copy for local businesses."</p>
      <p>Written content is one of the easiest services to start because every business needs words: websites, shops, newsletters, and social media pages. Owners are busy and want a reliable person who takes notes and turns them into ready-to-publish copy.</p>
      
      <div class="bg-slate-950 border border-white/10 p-4 rounded-xl my-4 space-y-2">
        <h5 class="font-bold text-indigo-300 text-xs uppercase tracking-wider">The 6-Step Delivery Workflow:</h5>
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1">
          <span class="bg-indigo-900/60 px-2 py-1 rounded">1. Client Brief</span> &rarr;
          <span class="bg-indigo-900/60 px-2 py-1 rounded">2. Outline</span> &rarr;
          <span class="bg-indigo-900/60 px-2 py-1 rounded">3. AI Draft</span> &rarr;
          <span class="bg-indigo-900/60 px-2 py-1 rounded">4. Rewrite</span> &rarr;
          <span class="bg-emerald-900/60 text-emerald-300 px-2 py-1 rounded">5. Deliver</span>
        </div>
      </div>

      <p>Inside the book: Chapter 3 gives you the exact prompts for cafe blogs, product descriptions, email newsletters, and the Quality-Control Checklist to ensure 100% factual accuracy.</p>
    `
  },
  3: {
    title: "Bonus Toolkit • 50 AI Prompts & 10 Outreach Templates",
    text: `
      <p class="font-semibold text-white text-base">"Never start from a blank screen again."</p>
      <p>The back of the playbook includes 50 battle-tested, fill-in-the-blank AI prompts covering Writing, Social Media & Canva Design, Resumes, Presentations, and Data Cleaning.</p>
      
      <div class="bg-slate-950 border border-white/10 p-3.5 rounded-xl my-4 text-xs font-mono text-slate-300 space-y-2">
        <span class="text-[10px] text-amber-400 uppercase tracking-widest font-bold block">Sample Outreach Template (DM):</span>
        <p class="italic text-slate-200">"Hi [Name], I like what you do at [business]. I'm building my portfolio in [service] and noticed [specific detail]. Would it be okay if I shared a short idea? No pressure at all."</p>
      </div>

      <p>Plus: The 30-Day Student Action Tracker, Client Project Brief worksheet, and the Freelance Glossary to make you sound like an experienced pro from day one.</p>
    `
  }
};

let currentReaderFontSize = 14;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  fetchConfig();
  startUrgencyTimer();
  setupScrollListener();
  setup3DBookParallax();
  setupScrollReveal();
  updateCalculator();
  switchReaderChapter(1);
  startSocialProofToasts();
});

// Fetch Store Configuration
async function fetchConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      currentConfig = await res.json();
      applyConfig(currentConfig);
      updateCalculator();
    }
  } catch (err) {
    console.error("Config fetch error:", err);
  }
}

// Apply Config to DOM
function applyConfig(cfg) {
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = `${cfg.bookTitle} | Turn Knowledge Into Revenue`;

  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    heroTitle.innerHTML = `The Blueprint to Turn What You Know Into a <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">${cfg.currencySymbol}5,000/Month</span> Digital Empire.`;
  }

  const coverTitle = document.getElementById('cover-title');
  if (coverTitle) coverTitle.textContent = cfg.bookTitle.toUpperCase();

  const coverAuthor = document.getElementById('cover-author');
  if (coverAuthor) coverAuthor.textContent = cfg.author;

  const modalBookTitle = document.getElementById('modal-book-title');
  if (modalBookTitle) modalBookTitle.textContent = cfg.bookTitle;

  const stickyTitle = document.getElementById('sticky-title');
  if (stickyTitle) stickyTitle.textContent = cfg.bookTitle;

  const formattedPrice = `${cfg.currencySymbol}${cfg.price}`;
  const formattedOriginal = `${cfg.currencySymbol}${cfg.originalPrice || (cfg.price * 2)}`;

  document.querySelectorAll('.book-price-display').forEach(el => {
    el.textContent = formattedPrice;
  });

  document.querySelectorAll('.original-price-display').forEach(el => {
    el.textContent = formattedOriginal;
  });

  // Settings form fields
  const titleField = document.getElementById('setting-title');
  if (titleField) titleField.value = cfg.bookTitle;

  const priceField = document.getElementById('setting-price');
  if (priceField) priceField.value = cfg.price;

  const currencyField = document.getElementById('setting-currency-symbol');
  if (currencyField) currencyField.value = cfg.currencySymbol;

  const authorField = document.getElementById('setting-author');
  if (authorField) authorField.value = cfg.author;
}

// ============================================================================
// 1. DYNAMIC 3D MOUSE PARALLAX ENGINE
// ============================================================================
function setup3DBookParallax() {
  const container = document.getElementById('hero-book-wrap');
  const book = document.getElementById('book-3d-element');
  const shadow = document.getElementById('book-shadow-element');
  if (!container || !book) return;

  container.addEventListener('mousemove', (e) => {
    container.classList.remove('resting');
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - (rect.width / 2);
    const y = e.clientY - rect.top - (rect.height / 2);

    // Calculate dynamic 3D tilt angles based on cursor offset
    const rotY = -24 + (x / rect.width) * 36;  // range approx -42deg to -6deg
    const rotX = 8 - (y / rect.height) * 28;   // range approx -6deg to +22deg
    const rotZ = (x / rect.width) * -6;

    book.style.setProperty('--book-ry', `${rotY}deg`);
    book.style.setProperty('--book-rx', `${rotX}deg`);
    book.style.setProperty('--book-rz', `${rotZ}deg`);

    // Dynamic light sheen angle
    const angle = Math.round(120 + (x / rect.width) * 50);
    book.style.setProperty('--sheen-angle', `${angle}deg`);

    // Dynamic shadow shift
    if (shadow) {
      const shadowShiftX = (x / rect.width) * 20;
      shadow.style.transform = `rotateX(80deg) translateZ(-10px) translateX(${shadowShiftX}px)`;
    }
  });

  container.addEventListener('mouseleave', () => {
    container.classList.add('resting');
    book.style.setProperty('--book-ry', '-24deg');
    book.style.setProperty('--book-rx', '8deg');
    book.style.setProperty('--book-rz', '-2deg');
    if (shadow) {
      shadow.style.transform = 'rotateX(80deg) translateZ(-10px) translateX(0px)';
    }
  });
}

// ============================================================================
// 2. INTERACTIVE REVENUE & ROI CALCULATOR
// ============================================================================
function updateCalculator() {
  const salesSlider = document.getElementById('slider-sales');
  const priceSlider = document.getElementById('slider-price');
  if (!salesSlider || !priceSlider) return;

  const weeklySales = parseInt(salesSlider.value, 10);
  const price = parseInt(priceSlider.value, 10);
  const symbol = currentConfig.currencySymbol || '$';

  document.getElementById('slider-sales-val').textContent = `${weeklySales} copies/wk`;
  document.getElementById('slider-price-val').textContent = `${symbol}${price}`;

  const monthlyIncome = Math.round(weeklySales * price * 4.33);
  const annualIncome = Math.round(weeklySales * price * 52);

  document.getElementById('calc-monthly-income').textContent = `${symbol}${monthlyIncome.toLocaleString()}`;
  document.getElementById('calc-annual-income').textContent = `${symbol}${annualIncome.toLocaleString()}`;
}

// ============================================================================
// 3. INTERACTIVE SAMPLE CHAPTER READER
// ============================================================================
function switchReaderChapter(chapterNum) {
  const sample = CHAPTER_SAMPLES[chapterNum];
  if (!sample) return;

  document.getElementById('reader-heading').textContent = sample.title;
  const readerBody = document.getElementById('reader-body');
  readerBody.innerHTML = sample.text;
  readerBody.scrollTop = 0;
  handleReaderScroll(readerBody);

  // Update tabs styling
  [1, 2, 3].forEach(n => {
    const btn = document.getElementById(`reader-tab-1`.replace('1', n));
    if (!btn) return;
    if (n === chapterNum) {
      btn.className = 'px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold transition';
    } else {
      btn.className = 'px-3 py-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white font-semibold border border-white/10 transition';
    }
  });
}

function handleReaderScroll(el) {
  const maxScroll = el.scrollHeight - el.clientHeight;
  const pct = maxScroll > 0 ? Math.min(100, Math.round((el.scrollTop / maxScroll) * 100)) : 100;
  const bar = document.getElementById('reader-progress');
  if (bar) bar.style.width = `${Math.max(15, pct)}%`;
}

function adjustReaderFont(delta) {
  currentReaderFontSize = Math.min(20, Math.max(12, currentReaderFontSize + delta));
  const readerBody = document.getElementById('reader-body');
  if (readerBody) readerBody.style.fontSize = `${currentReaderFontSize}px`;
}

// ============================================================================
// 4. SCROLL REVEAL OBSERVER
// ============================================================================
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================================================================
// 5. LIVE SOCIAL PROOF TOAST TICKER
// ============================================================================
const RECENT_SALES = [
  { name: "Marcus", city: "Berlin", time: "3m ago" },
  { name: "Priya", city: "Bengaluru", time: "7m ago" },
  { name: "Liam", city: "Toronto", time: "11m ago" },
  { name: "Sofia", city: "Madrid", time: "18m ago" },
  { name: "Daniel", city: "Austin, TX", time: "24m ago" },
  { name: "Kenji", city: "Tokyo", time: "31m ago" }
];
let toastIndex = 0;
let toastTimeout = null;

function startSocialProofToasts() {
  setTimeout(showNextToast, 4000);
}

function showNextToast() {
  const toast = document.getElementById('social-toast');
  if (!toast) return;

  const sale = RECENT_SALES[toastIndex % RECENT_SALES.length];
  toastIndex++;

  document.getElementById('toast-title').textContent = `${sale.name} from ${sale.city}`;
  document.getElementById('toast-desc').textContent = `Purchased eBook • ${sale.time}`;

  toast.classList.remove('hidden', 'toast-exit');
  toast.classList.add('flex', 'toast-enter');

  if (window.lucide) lucide.createIcons();

  // Hide after 6 seconds
  toastTimeout = setTimeout(() => {
    dismissToast();
    // Show next after 16 seconds
    setTimeout(showNextToast, 16000);
  }, 6000);
}

function dismissToast() {
  const toast = document.getElementById('social-toast');
  if (!toast) return;
  toast.classList.remove('toast-enter');
  toast.classList.add('toast-exit');
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }, 350);
}

// ============================================================================
// 6. COUNTDOWN & STICKY BAR
// ============================================================================
function startUrgencyTimer() {
  let seconds = 4 * 3600 + 47 * 60 + 19;
  const countdownEl = document.getElementById('countdown');
  setInterval(() => {
    if (seconds <= 0) seconds = 6 * 3600;
    seconds--;
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    if (countdownEl) countdownEl.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

function setupScrollListener() {
  const stickyBar = document.getElementById('sticky-bar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      stickyBar.classList.remove('translate-y-full');
    } else {
      stickyBar.classList.add('translate-y-full');
    }
  });
}

// ============================================================================
// 7. MODALS CONTROL
// ============================================================================
function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const stepForm = document.getElementById('checkout-step-form');
  const stepSuccess = document.getElementById('checkout-step-success');

  stepForm.classList.remove('hidden');
  stepSuccess.classList.add('hidden');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function openPreviewModal() {
  const modal = document.getElementById('preview-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closePreviewModal() {
  const modal = document.getElementById('preview-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  loadDailyPosts();
  loadAdminStats();
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function switchAdminTab(tabName) {
  const tabs = ['marketing', 'orders', 'settings'];
  tabs.forEach(tab => {
    const btn = document.getElementById(`tab-btn-${tab}`);
    const content = document.getElementById(`tab-content-${tab}`);
    if (tab === tabName) {
      btn.className = 'px-4 py-2 text-indigo-400 border-b-2 border-indigo-500 transition flex items-center gap-2';
      content.classList.remove('hidden');
    } else {
      btn.className = 'px-4 py-2 text-slate-400 hover:text-white transition flex items-center gap-2';
      content.classList.add('hidden');
    }
  });
}

// ============================================================================
// 8. AUTOMATED PAYMENT SUBMISSION & RAZORPAY UPI INTEGRATION
// ============================================================================
async function handlePaymentSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('cust-name').value;
  const email = document.getElementById('cust-email').value;
  const payBtn = document.getElementById('pay-button');
  const selectedMethod = document.querySelector('input[name="pay-method"]:checked')?.value || 'razorpay';

  payBtn.disabled = true;
  payBtn.innerHTML = `<span class="inline-block animate-spin mr-2">⚙️</span> Connecting to Payment Rails...`;

  try {
    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    const orderData = await orderRes.json();

    // Check if live Razorpay is configured
    if (selectedMethod === 'razorpay' && window.Razorpay && currentConfig.razorpayKeyId && !currentConfig.razorpayKeyId.includes('placeholder')) {
      const options = {
        key: currentConfig.razorpayKeyId,
        amount: currentConfig.price * 100, // Amount in paise
        currency: currentConfig.currency || "INR",
        name: "ReadNovaHub",
        description: currentConfig.bookTitle,
        image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        prefill: {
          name: name,
          email: email
        },
        theme: {
          color: "#4f46e5"
        },
        handler: async function (response) {
          await finalizeOrder(orderData.orderId, name, email, 'Razorpay UPI (' + response.razorpay_payment_id + ')', response.razorpay_payment_id);
        },
        modal: {
          ondismiss: function() {
            payBtn.disabled = false;
            payBtn.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4 mr-2"></i> Complete Order & Get eBook &rarr;`;
            if (window.lucide) lucide.createIcons();
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment failed: " + response.error.description);
        payBtn.disabled = false;
        payBtn.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4 mr-2"></i> Complete Order & Get eBook &rarr;`;
      });
      rzp.open();
      return;
    }

    // Instant / Demo Mode (or placeholder Razorpay mode)
    await new Promise(r => setTimeout(r, 800));
    const payMethodName = selectedMethod === 'razorpay' ? 'Razorpay UPI (Demo Verified)' : 'Instant 1-Click Verification';
    await finalizeOrder(orderData.orderId, name, email, payMethodName, 'RZP_' + Math.random().toString(36).substring(2, 9).toUpperCase());

  } catch (err) {
    console.error("Payment error:", err);
    alert("Could not process order. Please try again.");
    payBtn.disabled = false;
    payBtn.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4 mr-2"></i> Complete Order & Get eBook &rarr;`;
    if (window.lucide) lucide.createIcons();
  }
}

async function finalizeOrder(orderId, name, email, paymentMethod, paymentId) {
  const verifyRes = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderId,
      customerName: name,
      email: email,
      paymentMethod: paymentMethod,
      paymentId: paymentId
    })
  });

  const verifyData = await verifyRes.json();

  if (verifyData.success) {
    document.getElementById('checkout-step-form').classList.add('hidden');
    const stepSuccess = document.getElementById('checkout-step-success');
    stepSuccess.classList.remove('hidden');

    document.getElementById('success-order-id').textContent = verifyData.order.orderId;
    document.getElementById('success-customer-email').textContent = email;
    
    const downloadLink = document.getElementById('download-link');
    downloadLink.href = verifyData.downloadUrl;

    // Trigger Confetti Celebration!
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    if (window.lucide) lucide.createIcons();
  } else {
    alert("Payment verification issue: " + (verifyData.error || "Please try again."));
  }
}

// ============================================================================
// 9. DAILY MARKETING POST GENERATOR & ADMIN
// ============================================================================
async function loadDailyPosts() {
  const container = document.getElementById('posts-container');
  container.innerHTML = `<div class="text-xs text-slate-400 text-center py-4">Generating daily marketing posts...</div>`;

  try {
    const res = await fetch('/api/marketing/daily-posts');
    const data = await res.json();

    if (data.posts && data.posts.length > 0) {
      container.innerHTML = data.posts.map(p => `
        <div class="bg-slate-950 border border-white/10 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded">Day ${p.day} • ${p.platform}</span>
            <button onclick="copyPostText(this, \`${escapeJsString(p.content)}\`)" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition flex items-center gap-1">
              📋 Copy Post
            </button>
          </div>
          <div class="text-xs font-semibold text-white">${p.title}</div>
          <pre class="text-xs text-slate-300 font-sans whitespace-pre-wrap bg-slate-900/60 p-3 rounded-lg border border-white/[0.06]">${p.content}</pre>
        </div>
      `).join('');
    }
  } catch (e) {
    container.innerHTML = `<div class="text-xs text-rose-400 text-center py-4">Failed to load marketing posts.</div>`;
  }
}

function copyPostText(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.innerHTML;
    btn.innerHTML = `✅ Copied!`;
    btn.classList.add('bg-emerald-600', 'text-white');
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('bg-emerald-600', 'text-white');
    }, 2000);
  });
}

function escapeJsString(str) {
  return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

async function loadAdminStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();

    document.getElementById('admin-total-orders').textContent = data.totalOrders;
    document.getElementById('admin-total-revenue').textContent = `${data.currencySymbol}${data.totalRevenue}`;

    const listEl = document.getElementById('admin-orders-list');
    if (data.recentOrders && data.recentOrders.length > 0) {
      listEl.innerHTML = data.recentOrders.map(o => `
        <div class="p-2.5 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-200">${o.customerName} <span class="text-slate-400 font-normal">(${o.email})</span></div>
            <div class="text-[10px] text-slate-500">${new Date(o.createdAt).toLocaleString()} • ${o.paymentMethod}</div>
          </div>
          <div class="text-right">
            <span class="font-bold text-emerald-400">${data.currencySymbol}${o.amount}</span>
            <span class="block text-[10px] text-emerald-500 uppercase font-bold">PAID & SENT</span>
          </div>
        </div>
      `).join('');
    } else {
      listEl.innerHTML = `<p class="text-slate-500 py-3 text-center">No orders recorded yet. Complete a test purchase!</p>`;
    }
  } catch (err) {
    console.error("Stats load error:", err);
  }
}

async function handleSaveSettings(event) {
  event.preventDefault();

  const title = document.getElementById('setting-title').value;
  const price = Number(document.getElementById('setting-price').value);
  const currencySymbol = document.getElementById('setting-currency-symbol').value || '$';
  const author = document.getElementById('setting-author').value;
  const stripeKey = document.getElementById('setting-stripe-key').value;
  const razorpayKey = document.getElementById('setting-razorpay-key').value;

  try {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookTitle: title,
        price: price,
        currencySymbol: currencySymbol,
        author: author,
        stripePublicKey: stripeKey,
        razorpayKeyId: razorpayKey
      })
    });

    const data = await res.json();
    if (data.success) {
      applyConfig(data.config);
      alert("✅ Store settings updated successfully!");
      closeAdminModal();
    }
  } catch (e) {
    alert("Could not save settings.");
  }
}
