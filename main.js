// AnimeGear — Main Storefront JS (server-free, uses localStorage via db.js)

const grid = document.getElementById('products-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
let currentCat = 'All';

function loadProducts(category = 'All') {
    grid.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>`;
    try {
        const products = DB.getProducts(category);
        renderProducts(products);
    } catch (e) {
        grid.innerHTML = `<div class="empty-state"><p>⚠️ Could not load products.</p></div>`;
    }
}

function renderProducts(products) {
    const available = products.filter(p => p.available);
    if (!available.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><p style="color:var(--muted)">No products in this category yet.</p></div>`;
        return;
    }
    grid.innerHTML = available.map(p => {
        const img = p.images && p.images.length ? p.images[0] : 'images/placeholder.png';
        return `
    <a href="product.html?id=${p.id}" class="product-card">
      <img src="${img}" alt="${p.name}" loading="lazy" onerror="this.src='images/placeholder.png'" />
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-footer">
          <div class="product-price"><span class="product-price-currency">EGP </span>${p.price.toLocaleString()}</div>
          <div class="view-btn">View →</div>
        </div>
      </div>
    </a>`;
    }).join('');
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCat = btn.dataset.cat;
        loadProducts(currentCat);
    });
});

// Toast
window.showToast = function (msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3500);
};

loadProducts();
