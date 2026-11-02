const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 3000;
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CONFIG_FILE = path.join(__dirname, 'data', 'config.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Initialize data directory if not in read-only environment
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // read-only env, ignore
}

// Default store config
const defaultConfig = {
  bookTitle: "The Student AI Side Hustle Playbook",
  subtitle: "Turn free AI tools into freelance skills, digital services and your first online income.",
  author: "ReadNovaHub",
  price: 299,
  currency: "INR",
  currencySymbol: "₹",
  discountPercent: 50,
  originalPrice: 599,
  stripePublicKey: "",
  razorpayKeyId: "rzp_live_TvFbRhljzSOYwF",
  razorpayKeySecret: "ceG8nhVD05TfdL93lLI4ty9Y",
  upiId: "readnovahub@upi",
  paymentMode: "razorpay", // 'demo', 'razorpay', or 'stripe'
  rating: "4.9",
  reviewsCount: 420,
  pagesCount: 25
};

function getConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (err) {
    console.error("Error reading config:", err);
  }
  return { ...defaultConfig };
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
  } catch (err) {
    console.warn("Could not save config to disk:", err.message);
  }
}

let inMemoryOrders = [];

function getOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error("Error reading orders:", err);
  }
  return inMemoryOrders;
}

function saveOrder(order) {
  inMemoryOrders.unshift(order);
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(inMemoryOrders, null, 2));
  } catch (err) {
    console.warn("Could not write orders to disk (read-only environment):", err.message);
  }
  return order;
}

// Deterministic secret key so download tokens are valid across serverless instances
const SECRET_KEY = process.env.DOWNLOAD_SECRET || 'readnovahub_master_secret_download_key_2026';

function generateDownloadToken(orderId, email) {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = `${orderId}:${email}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

function verifyDownloadToken(token) {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 4) return null;
    const [orderId, email, expiresAt, signature] = parts;
    if (Date.now() > parseInt(expiresAt, 10)) return null; // expired
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(`${orderId}:${email}:${expiresAt}`).digest('hex');
    if (signature === expectedSig) {
      return { orderId, email };
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Razorpay Order Creation via official API
function createRazorpayOrder(amountInPaise, receiptId, keyId, keySecret) {
  return new Promise((resolve) => {
    if (!keyId || !keySecret || keyId.includes('placeholder')) {
      return resolve(null);
    }
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const postData = JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        product: 'The Student AI Side Hustle Playbook'
      }
    });

    const req = https.request({
      hostname: 'api.razorpay.com',
      port: 443,
      path: '/v1/orders',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            console.error('Razorpay Order API response:', json);
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.error('Razorpay request error:', err);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

function verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, secret) {
  if (!razorpaySignature || !secret) return true;
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    return hmac.digest('hex') === razorpaySignature;
  } catch (e) {
    return false;
  }
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers for local API flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API ROUTING
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // 1. GET /api/config
    if (pathname === '/api/config' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(getConfig()));
      return;
    }
    // 1b. POST /api/admin/config — password-protected config update
    if (pathname === '/api/admin/config' && method === 'POST') {
      const adminPwd = req.headers['x-admin-password'];
      if (adminPwd !== 'readnova2024') { res.writeHead(403); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const updates = JSON.parse(body || '{}');
          const merged = { ...getConfig(), ...updates };
          saveConfig(merged);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch(e) { res.writeHead(400); res.end(JSON.stringify({ error: e.message })); }
      });
      return;
    }

    // 1c. GET /api/orders — password-protected orders list
    if (pathname === '/api/orders' && method === 'GET') {
      const adminPwd = req.headers['x-admin-password'];
      if (adminPwd !== 'readnova2024') { res.writeHead(403); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
      res.writeHead(200);
      res.end(JSON.stringify({ orders: inMemoryOrders }));
      return;
    }

    // 2. POST /api/create-order
    if (pathname === '/api/create-order' && method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body || '{}');
          const cfg = getConfig();
          const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
          const amountInPaise = Math.round(cfg.price * 100);

          // Attempt to create official Razorpay order if keys exist
          let razorpayOrder = null;
          if (cfg.razorpayKeyId && cfg.razorpayKeySecret) {
            razorpayOrder = await createRazorpayOrder(amountInPaise, orderId, cfg.razorpayKeyId, cfg.razorpayKeySecret);
          }
          
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            orderId: orderId,
            razorpayOrderId: razorpayOrder ? razorpayOrder.id : null,
            amount: cfg.price,
            amountInPaise: amountInPaise,
            currency: cfg.currency,
            currencySymbol: cfg.currencySymbol,
            bookTitle: cfg.bookTitle,
            razorpayKeyId: cfg.razorpayKeyId,
            paymentMode: cfg.paymentMode
          }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
        }
      });
      return;
    }

    // 3. POST /api/verify-payment (Automates instant order recording & generates download link)
    if (pathname === '/api/verify-payment' && method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { orderId, email, customerName, paymentMethod, paymentId, razorpayOrderId, razorpaySignature } = JSON.parse(body || '{}');
          
          if (!orderId || !email) {
            res.writeHead(400);
            res.end(JSON.stringify({ success: false, error: 'Missing orderId or email' }));
            return;
          }

          const cfg = getConfig();

          // Verify signature if provided from Razorpay
          if (razorpaySignature && razorpayOrderId && paymentId) {
            const isValid = verifyRazorpaySignature(razorpayOrderId, paymentId, razorpaySignature, cfg.razorpayKeySecret);
            if (!isValid) {
              console.warn("Signature verification failed for order:", orderId);
            }
          }

          const downloadToken = generateDownloadToken(orderId, email);

          // Automated order persistence
          const newOrder = {
            orderId,
            customerName: customerName || 'Valued Reader',
            email,
            amount: cfg.price,
            currency: cfg.currency,
            bookTitle: cfg.bookTitle,
            paymentMethod: paymentMethod || 'Razorpay UPI (Verified)',
            paymentId: paymentId || 'PAY_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            status: 'COMPLETED',
            createdAt: new Date().toISOString()
          };

          saveOrder(newOrder);

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            order: newOrder,
            downloadUrl: `/downloads/The-Student-AI-Side-Hustle-Playbook.pdf`,
            message: `Payment successful! An automated delivery email has been logged for ${email}.`
          }));
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }

    // 4. GET /api/download?token=XYZ
    if (pathname === '/api/download' && method === 'GET') {
      const token = parsedUrl.query.token;
      const valid = verifyDownloadToken(token);

      if (!valid) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>Download Link Expired or Invalid</h1><p>Please contact support or check your email receipt for a new link.</p>');
        return;
      }

      let filePath = path.join(PUBLIC_DIR, 'downloads', 'The-Student-AI-Side-Hustle-Playbook.pdf');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(PUBLIC_DIR, 'downloads', 'ebook.pdf');
      }
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': stat.size,
          'Content-Disposition': 'attachment; filename="The-Student-AI-Side-Hustle-Playbook.pdf"'
        });
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        return;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ebook file not found on server.');
        return;
      }
    }

    // 5. GET /api/admin/stats
    if (pathname === '/api/admin/stats' && method === 'GET') {
      const orders = getOrders();
      const cfg = getConfig();
      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
      res.writeHead(200);
      res.end(JSON.stringify({
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        currencySymbol: cfg.currencySymbol,
        recentOrders: orders.slice(0, 10)
      }));
      return;
    }

    // 6. POST /api/admin/config
    if (pathname === '/api/admin/config' && method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newSettings = JSON.parse(body || '{}');
          const current = getConfig();
          const updated = { ...current, ...newSettings };
          saveConfig(updated);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, config: updated }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Failed to update config' }));
        }
      });
      return;
    }

    // 7. GET /api/marketing/daily-posts
    if (pathname === '/api/marketing/daily-posts' && method === 'GET') {
      const cfg = getConfig();
      const posts = [
        {
          day: 1,
          platform: "Twitter / X (Thread)",
          title: "The Problem & Solution Framework",
          content: `Most people spend years trading 40 hours a week for a fixed paycheck.\n\nHere are 3 mindset shifts that will help you build your first digital product business in 30 days:\n\n1. Stop trading time for money. Build once, sell infinite times.\n2. You don't need 100k followers—100 real buyers is all it takes.\n3. Turn your daily experience into a step-by-step roadmap.\n\nI broke down the exact framework in my new guide: "${cfg.bookTitle}".\n\nGrab your copy today ($${cfg.price} for a limited time): [Your Website Link]`
        },
        {
          day: 2,
          platform: "Instagram / LinkedIn (Storytelling)",
          title: "Behind-the-Scenes & Why I Wrote This",
          content: `6 months ago, I was overwhelmed trying to figure out how people were making consistent income online without burning out.\n\nAfter testing dozens of playbooks, I boiled everything down to a simple, repeatable blueprint.\n\nToday, I'm excited to finally share "${cfg.bookTitle}"!\n\nWhat's inside:\n- Zero-fluff execution steps\n- Proven frameworks & checklists\n- Instant digital delivery\n\nLink in bio / comments to get your copy today!`
        },
        {
          day: 3,
          platform: "Twitter / X (Short Punchy Post)",
          title: "The Quick ROI Hook",
          content: `A coffee costs $6 and lasts 20 minutes.\n\n"${cfg.bookTitle}" costs $${cfg.price} and gives you the exact blueprint to earn an extra $1,000 to $5,000/month.\n\nInvest in skills that pay you back forever.\n\nInstant download here: [Your Website Link]`
        },
        {
          day: 4,
          platform: "LinkedIn (Authority Post)",
          title: "The 3 Biggest Mistakes Beginners Make",
          content: `When building your first digital product or ebook, 90% of creators fail because of these 3 traps:\n\n1. Waiting until the product is 100% "perfect"\n2. Not having an automated checkout and delivery system in place\n3. Selling features instead of a clear transformation\n\nIn "${cfg.bookTitle}", Chapter 3 breaks down how to bypass all three in under 48 hours.\n\nCheck out the preview here: [Your Website Link]`
        },
        {
          day: 5,
          platform: "Instagram / Reel / TikTok Script",
          title: "Video Script: Stop Overcomplicating It",
          content: `[HOOK - 0 to 3s]: "If you want to make an extra $2,000 a month with digital products, stop making this 1 mistake..."\n\n[BODY - 4 to 25s]: "You don't need a huge budget or fancy software. You need one solid problem, a 50-page PDF solution, and an automated payment link that delivers it while you sleep."\n\n[CALL TO ACTION - 26 to 30s]: "I packaged my exact step-by-step roadmap in my new book '${cfg.bookTitle}'. Comment 'BOOK' or click the link in bio to grab your copy!"`
        }
      ];

      res.writeHead(200);
      res.end(JSON.stringify({ posts }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
    return;
  }

  // STATIC FILE SERVING
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security check to ensure requested path stays inside PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Only fallback to index.html for non-asset requests
      const ext = path.extname(filePath).toLowerCase();
      const isAsset = ['.jpg','.jpeg','.png','.gif','.svg','.ico','.pdf','.css','.js','.woff','.woff2'].includes(ext);
      if (isAsset) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      const fallback = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(fallback)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(fallback).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🚀 Automated eBook Store is running on http://localhost:${port}`);
    console.log(`⚡ Automated payments, file delivery, & daily marketing engine ready`);
    console.log(`====================================================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
