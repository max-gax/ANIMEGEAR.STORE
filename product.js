// AnimeGear — Product Detail Page JS (server-free, uses localStorage via db.js)

const oversizedSizes = ['مقاس 1', 'مقاس 2', 'مقاس 3', 'مقاس 4'];
const basicSizes = ['ميديام (M)', 'لارج (L)', 'XL', '2XL'];

let product = null;
let selectedSize = null;
let selectedFit = null;
let selectedType = null;
let quantity = 1;

// Determine product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

function init() {
  if (!productId) { window.location = 'index.html'; return; }
  try {
    product = DB.getProduct(productId);
    if (!product) throw new Error('Not found');
    renderPage();
  } catch (e) {
    document.getElementById('product-detail').innerHTML = `
      <a href="index.html" class="back-btn">← العودة</a>
      <div class="empty-state"><p>المنتج غير موجود.</p></div>`;
  }
}

function renderPage() {
  document.title = `${product.name} — AnimeGear`;
  const sizes = (product.category === 'Oversized') ? oversizedSizes : basicSizes;

  const detail = document.getElementById('product-detail');
  detail.innerHTML = `
    <a href="index.html" class="back-btn">← العودة للمتجر</a>
    <div class="detail-grid">
      <!-- Gallery -->
      <div class="gallery">
        <div class="gallery-main">
          <img id="main-img" src="${product.images[0] || 'images/placeholder.png'}" alt="${product.name}" onerror="this.src='images/placeholder.png'" />
        </div>
        <div class="gallery-thumbs" id="thumbs">
          ${product.images.map((img, i) => `
            <img src="${img}" class="${i === 0 ? 'active' : ''}" data-idx="${i}"
              onerror="this.style.display='none'" alt="View ${i + 1}" />
          `).join('')}
        </div>
      </div>

      <!-- Info -->
      <div class="product-info-detail">
        <div class="product-cat-badge">${product.category}</div>
        <h1>${product.name}</h1>
        <div class="product-price-big"><span>ج.م </span>${product.price.toLocaleString()}</div>

        <div class="size-section">
          <h3>اختر المقاس</h3>
          <div class="size-pills" id="size-pills">
            ${sizes.map(s => `<button class="size-pill" data-size="${s}">${s}</button>`).join('')}
          </div>
        </div>

        <div class="options-section">
          <div class="option-group">
            <h3>المقاس (إجباري)</h3>
            <div class="option-pills" id="fit-pills">
              <button class="option-pill" data-val="Oversize">أوفرسايز (Oversize)</button>
              <button class="option-pill" data-val="Basic">عادي (Basic)</button>
            </div>
          </div>
          
          <div class="option-group" style="margin-top: 1rem;">
            <h3>النوع (إجباري)</h3>
            <div class="option-pills" id="type-pills">
              <button class="option-pill" data-val="Hoodie">هودي (Hoodie)</button>
              <button class="option-pill" data-val="Sweatshirt">سويت شيرت (Sweatshirt)</button>
            </div>
          </div>
        </div>

        <div class="qty-section">
          <h3>الكمية</h3>
          <div class="qty-controls">
            <button class="qty-btn" id="qty-minus">−</button>
            <div id="qty-display">1</div>
            <button class="qty-btn" id="qty-plus">+</button>
          </div>
        </div>

        <button class="buy-btn" id="buy-btn">⚡ اطلب الآن</button>
      </div>
    </div>

    <!-- Size Charts -->
    <div class="size-charts" dir="rtl">
      <h2>📏 جداول المقاسات</h2>
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-title">نوع أ — هوديز وسويت شيرتات أوفرسايز (Oversized)</div>
          <table>
            <thead><tr><th>المقاس</th><th>العرض</th><th>الطول</th></tr></thead>
            <tbody>
              <tr><td>مقاس 1</td><td>60 سم</td><td>72 سم</td></tr>
              <tr><td>مقاس 2</td><td>62 سم</td><td>74 سم</td></tr>
              <tr><td>مقاس 3</td><td>64 سم</td><td>76 سم</td></tr>
              <tr><td>مقاس 4</td><td>66 سم</td><td>77 سم</td></tr>
            </tbody>
          </table>
        </div>
        <div class="chart-card">
          <div class="chart-title">نوع ب — هوديز وسويت شيرتات عادية (Basic)</div>
          <table>
            <thead><tr><th>المقاس</th><th>العرض</th><th>الطول</th></tr></thead>
            <tbody>
              <tr><td>ميديام (M)</td><td>54 سم</td><td>71 سم</td></tr>
              <tr><td>لارج (L)</td><td>56 سم</td><td>73 سم</td></tr>
              <tr><td>XL</td><td>58 سم</td><td>75 سم</td></tr>
              <tr><td>2XL</td><td>60 سم</td><td>77 سم</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="measure-guide">
        <h3>📐 كيف تختار مقاسك المثالي؟</h3>
        <ul class="measure-steps">
          <li><span class="step-num">1</span>ضع الهودي المفضل لديك على سطح مستوٍ.</li>
          <li><span class="step-num">2</span>قس <strong>الطول</strong> من الكتف (بجانب الرقبة) إلى الحافة السفلية.</li>
          <li><span class="step-num">3</span>قس <strong>العرض</strong> من اليمين إلى اليسار عند مستوى السرة.</li>
          <li><span class="step-num">4</span>قارن قياساتك بالجداول أعلاه واقترب من المقاس الأنسب.</li>
        </ul>
        <div class="measure-disclaimer">
          ⚠️ يرجى التأكد جيداً من المقاس. بما أن كل قطعة تُطبع خصيصاً لك، لا نستطيع توفير استبدال أو استرجاع لاختيار مقاس خاطئ. المسؤولية تقع على العميل.
        </div>
      </div>
    </div>
  `;

  attachEvents();
}

function attachEvents() {
  // Gallery thumbnails
  document.getElementById('thumbs')?.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (!img) return;
    document.getElementById('main-img').src = product.images[img.dataset.idx];
    document.querySelectorAll('#thumbs img').forEach(t => t.classList.remove('active'));
    img.classList.add('active');
  });

  // Size selection
  document.getElementById('size-pills')?.addEventListener('click', e => {
    const pill = e.target.closest('.size-pill');
    if (!pill) return;
    document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('selected'));
    pill.classList.add('selected');
    selectedSize = pill.dataset.size;
  });

  // Fit selection
  document.getElementById('fit-pills')?.addEventListener('click', e => {
    const pill = e.target.closest('.option-pill');
    if (!pill) return;
    document.querySelectorAll('#fit-pills .option-pill').forEach(p => p.classList.remove('selected'));
    pill.classList.add('selected');
    selectedFit = pill.dataset.val;
  });

  // Type selection
  document.getElementById('type-pills')?.addEventListener('click', e => {
    const pill = e.target.closest('.option-pill');
    if (!pill) return;
    document.querySelectorAll('#type-pills .option-pill').forEach(p => p.classList.remove('selected'));
    pill.classList.add('selected');
    selectedType = pill.dataset.val;
  });

  // Quantity
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    if (quantity > 1) { quantity--; document.getElementById('qty-display').textContent = quantity; }
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    quantity++;
    document.getElementById('qty-display').textContent = quantity;
  });

  // Buy now
  document.getElementById('buy-btn')?.addEventListener('click', () => {
    if (!selectedSize) { showToast('يرجى اختيار المقاس أولاً!', 'error'); return; }
    if (!selectedFit) { showToast('يرجى اختيار الاستايل (أوفرسايز أو عادي)!', 'error'); return; }
    if (!selectedType) { showToast('يرجى اختيار النوع (هودي أو سويت شيرت)!', 'error'); return; }
    openCheckout();
  });
}

function openCheckout() {
  const img = product.images[0] || 'images/placeholder.png';
  document.getElementById('order-img').src = img;
  document.getElementById('order-pname').textContent = product.name;
  document.getElementById('order-pdetails').textContent = `المقاس: ${selectedSize} · الاستايل: ${selectedFit} · النوع: ${selectedType} · الكمية: ${quantity} · الإجمالي: ${(product.price * quantity).toLocaleString()} ج.م`;
  document.getElementById('checkout-overlay').classList.add('open');
  document.getElementById('checkout-form').style.display = '';
  document.getElementById('order-success').classList.remove('show');
}

document.getElementById('modal-close-btn')?.addEventListener('click', () => {
  document.getElementById('checkout-overlay').classList.remove('open');
});
document.getElementById('checkout-overlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('checkout-overlay')) {
    document.getElementById('checkout-overlay').classList.remove('open');
  }
});

// Checkout submission
document.getElementById('checkout-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('cf-name').value.trim();
  const whatsapp = document.getElementById('cf-whatsapp').value.trim();
  const address = document.getElementById('cf-address').value.trim();
  if (!name || !whatsapp || !address) { showToast('يرجى ملء جميع البيانات', 'error'); return; }

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'جاري إرسال الطلب...'; btn.disabled = true;

  try {
    DB.saveOrder({
      product_id: product.id,
      customer_name: name,
      whatsapp,
      address,
      size: selectedSize,
      fit: selectedFit,
      type: selectedType,
      quantity
    });
    // Show success
    document.getElementById('checkout-form').style.display = 'none';
    document.getElementById('order-success').classList.add('show');
  } catch (err) {
    showToast('حدث خطأ ما، يرجى المحاولة مرة أخرى.', 'error');
    btn.textContent = '✅ تأكيد الطلب'; btn.disabled = false;
  }
});

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

init();
