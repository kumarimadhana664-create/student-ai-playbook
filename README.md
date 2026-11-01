# 📚 Automated eBook Sales Platform

A modern, high-converting eBook landing page with automated payment verification, instant digital delivery, and a built-in daily marketing engine.

---

## ⚡ Quick Start (Run Locally)

1. Open your terminal in this directory:
   ```bash
   cd C:\Users\mohan\.gemini\antigravity\scratch\ebook-store
   ```
2. Start the automated server:
   ```bash
   node server.js
   ```
3. Open your browser at:
   ```
   http://localhost:3000
   ```

---

## 🚀 Features & Automation

### 1. 24/7 Automated Checkout & Instant Delivery
* **Zero Manual Work:** When a customer completes checkout, payment is validated and a secure download link is immediately generated.
* **Instant Download Page:** Customer is shown an instant download button to get the eBook immediately.
* **Automated Order Logging:** All orders are permanently recorded to `data/orders.json`.

### 2. Built-in "Owner Tools" & Daily Marketing Engine
* Click **"Owner Tools"** in the top navigation bar to open the dashboard.
* **Daily Social Media Posts:** Get ready-to-copy promo posts for Twitter/X threads, LinkedIn authority posts, and Instagram Reel/TikTok scripts to post every single day and drive traffic.
* **Live Sales & Revenue Tracking:** See total orders and revenue updated in real time.
* **Store Settings:** Change your book title, author, price, currency ($ or ₹), and payment keys directly from the browser.

---

## 📁 File Structure

* `server.js` - Zero-dependency Node.js HTTP server handling payments, secure downloads, and analytics.
* `public/index.html` - The high-converting sales page (Tailwind CSS, 3D Book Mockup, FAQ, Reviews).
* `public/style.css` - 3D CSS book cover styling and animations.
* `public/app.js` - Frontend logic, checkout modal, and daily post copy tools.
* `public/downloads/ebook.pdf` - **Your eBook file**. Replace this with your actual PDF!
* `data/orders.json` - Automatically saved sales and customer records.
* `data/config.json` - Store title, price, and payment configuration.

---

## 💳 Connecting Real Payment Gateways

The store comes with a **Instant Demo Mode** enabled by default so you can test orders without real money.

To accept real money:
1. **For Stripe (Global / Cards / Apple Pay):**
   * Put your Stripe Publishable Key (`pk_live_...`) into Owner Tools > Store Settings.
2. **For Razorpay (India / UPI / Cards):**
   * Put your Razorpay Key ID (`rzp_live_...`) into Owner Tools > Store Settings.

---

## 🌐 Deploying to the Internet (Free)

You can deploy this site online in 3 minutes for free:
* **Render.com / Railway.app:** Connect your GitHub repo, select Node.js, and command `node server.js`.
* **Vercel / Netlify:** Works right out of the box with static files + serverless functions.
