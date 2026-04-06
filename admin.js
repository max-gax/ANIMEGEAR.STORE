// AnimeGear — Admin Dashboard JS (server-free, uses localStorage via db.js)

// ── AUTH ──
let CURRENT_PASSWORD = '';

document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const pass = document.getElementById('login-pass').value;
    // Local password check — no server needed
    if (pass === DB.ADMIN_PASSWORD) {
        CURRENT_PASSWORD = pass;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-app').style.display = 'flex';
        loadAnalytics();
        loadProducts();
        loadOrders();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
});

// ── TABS ──
document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// ── TOAST ──
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg; t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3500);
}

// ── ANALYTICS ──
function loadAnalytics() {
    try {
        const data = DB.getAnalytics();
        document.getElementById('stat-orders').textContent = data.totalOrders;
        document.getElementById('stat-units').textContent = data.totalUnits;
        document.getElementById('stat-revenue').textContent = `EGP ${data.revenue.toLocaleString()}`;
        document.getElementById('stat-profit').textContent = `EGP ${data.netProfit.toLocaleString()}`;
    } catch (e) {
        showToast('Failed to load analytics', 'error');
    }
}

// ── PRODUCTS ──
let editingProductId = null;
let existingImagesForEdit = [];

function loadProducts() {
    try {
        const products = DB.getProducts();
        renderProductsTable(products);
    } catch (e) { showToast('Failed to load products', 'error'); }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('products-tbody');
    if (!products.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:2rem;">No products yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = products.map(p => {
        const img = p.images && p.images.length ? p.images[0] : '../images/placeholder.png';
        const availLabel = p.available ? 'Available' : 'Hidden';
        const availClass = p.available ? 'act-btn-toggle' : 'act-btn-toggle unavail';
        return `
    <tr>
      <td><img class="prod-thumb" src="${img}" onerror="this.src='../images/placeholder.png'" alt="${p.name}" /></td>
      <td style="font-weight:600;">${p.name}</td>
      <td><span class="badge badge-contacted">${p.category}</span></td>
      <td>EGP ${p.price.toLocaleString()}</td>
      <td>EGP ${p.cost.toLocaleString()}</td>
      <td><span class="badge ${p.available ? 'badge-completed' : 'badge-pending'}">${availLabel}</span></td>
      <td style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;">
        <button class="act-btn act-btn-edit" onclick="editProduct(${p.id})">✏ Edit</button>
        <button class="act-btn ${availClass}" onclick="toggleAvail(${p.id})">${p.available ? 'Hide' : 'Show'}</button>
        <button class="act-btn act-btn-del" onclick="deleteProduct(${p.id})">🗑 Delete</button>
      </td>
    </tr>`;
    }).join('');
}

// Add / Edit form toggle
document.getElementById('toggle-add-form').addEventListener('click', () => {
    if (editingProductId) resetProductForm();
    else {
        const wrap = document.getElementById('add-form-wrap');
        wrap.classList.toggle('open');
    }
});

window.resetProductForm = function () {
    editingProductId = null;
    existingImagesForEdit = [];
    document.getElementById('product-form').reset();
    document.getElementById('edit-product-id').value = '';
    document.getElementById('form-title').textContent = 'Add New Product';
    document.getElementById('pf-submit').textContent = 'Save Product';
    document.getElementById('existing-imgs-preview').innerHTML = '';
    document.getElementById('add-form-wrap').classList.remove('open');
    document.getElementById('toggle-add-form').textContent = '+ Add Product';
};

window.editProduct = function (id) {
    try {
        const p = DB.getProduct(id);
        if (!p) throw new Error('Not found');
        editingProductId = id;
        existingImagesForEdit = p.images || [];
        document.getElementById('edit-product-id').value = id;
        document.getElementById('pf-name').value = p.name;
        document.getElementById('pf-category').value = p.category;
        document.getElementById('pf-price').value = p.price;
        document.getElementById('pf-cost').value = p.cost;
        document.getElementById('form-title').textContent = 'Edit Product';
        document.getElementById('pf-submit').textContent = 'Update Product';
        document.getElementById('toggle-add-form').textContent = '✕ Close';
        // Show existing images
        const preview = document.getElementById('existing-imgs-preview');
        preview.innerHTML = existingImagesForEdit.map((img, i) =>
            `<div style="position:relative;display:inline-block;">
        <img src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;border:1px solid var(--border);" onerror="this.src='../images/placeholder.png'" />
        <button onclick="removeExistingImg(${i})" style="position:absolute;top:-6px;right:-6px;background:var(--pink);border:none;color:#fff;border-radius:50%;width:18px;height:18px;font-size:0.65rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
      </div>`
        ).join('');
        document.getElementById('add-form-wrap').classList.add('open');
    } catch (e) { showToast('Failed to load product', 'error'); }
};

window.removeExistingImg = function (idx) {
    existingImagesForEdit.splice(idx, 1);
    // Rebuild only the image preview strip — avoids re-rendering the entire form (which causes flicker)
    const preview = document.getElementById('existing-imgs-preview');
    preview.innerHTML = existingImagesForEdit.map((img, i) =>
        `<div style="position:relative;display:inline-block;">
      <img src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;border:1px solid var(--border);" onerror="this.src='../images/placeholder.png'" />
      <button onclick="removeExistingImg(${i})" style="position:absolute;top:-6px;right:-6px;background:var(--pink);border:none;color:#fff;border-radius:50%;width:18px;height:18px;font-size:0.65rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
    </div>`
    ).join('');
};

document.getElementById('product-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('pf-submit');
    btn.textContent = 'Saving...'; btn.disabled = true;

    try {
        const imageFiles = Array.from(document.getElementById('pf-images').files);
        await DB.saveProduct({
            id: editingProductId,
            name: document.getElementById('pf-name').value,
            category: document.getElementById('pf-category').value,
            price: document.getElementById('pf-price').value,
            cost: document.getElementById('pf-cost').value || '0',
            imageFiles,
            existingImages: editingProductId ? existingImagesForEdit : []
        });
        showToast(editingProductId ? '✅ Product updated' : '✅ Product added');
        resetProductForm();
        loadProducts();
        loadAnalytics();
    } catch (err) {
        showToast('Failed to save product', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = editingProductId ? 'Update Product' : 'Save Product';
    }
});

window.toggleAvail = function (id) {
    try {
        const result = DB.toggleAvailability(id);
        showToast('Availability updated');
        // Update in-place — no full re-render needed
        const avail = result.available;
        const rows = document.querySelectorAll('#products-tbody tr');
        rows.forEach(row => {
            const editBtn = row.querySelector(`.act-btn-edit[onclick="editProduct(${id})"]`);
            if (!editBtn) return;
            const statusBadge = row.querySelector('td:nth-child(6) .badge');
            const toggleBtn = row.querySelector(`.act-btn-toggle`);
            if (statusBadge) {
                statusBadge.className = `badge ${avail ? 'badge-completed' : 'badge-pending'}`;
                statusBadge.textContent = avail ? 'Available' : 'Hidden';
            }
            if (toggleBtn) {
                toggleBtn.className = `act-btn act-btn-toggle${avail ? '' : ' unavail'}`;
                toggleBtn.textContent = avail ? 'Hide' : 'Show';
            }
        });
    } catch (e) { showToast('Failed to update', 'error'); }
};

window.deleteProduct = function (id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
        DB.deleteProduct(id);
        showToast('Product deleted');
        loadProducts();
        loadAnalytics();
    } catch (e) { showToast('Failed to delete', 'error'); }
};

// ── ORDERS ──
function loadOrders() {
    try {
        const orders = DB.getOrders();
        renderOrders(orders);
    } catch (e) { showToast('Failed to load orders', 'error'); }
}

function renderOrders(orders) {
    const list = document.getElementById('orders-list');
    if (!orders.length) {
        list.innerHTML = `<div style="text-align:center;color:var(--muted);padding:3rem;">No orders yet.</div>`;
        return;
    }
    list.innerHTML = orders.map(o => {
        const snap = o.product_snapshot;
        const img = snap.images && snap.images.length ? snap.images[0] : '../images/placeholder.png';
        const date = new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const badgeClass = {
            pending: 'badge-pending', contacted: 'badge-contacted',
            shipped: 'badge-shipped', completed: 'badge-completed'
        }[o.status] || 'badge-pending';
        return `
    <div class="order-card" id="order-${o.id}">
      <img class="order-prod-img" src="${img}" onerror="this.src='../images/placeholder.png'" alt="${snap.name}" />
      <div class="order-info">
        <h4>${snap.name}</h4>
        <div class="meta">
          <strong>${o.customer_name}</strong> ·
          <a href="https://wa.me/${o.whatsapp.replace(/\D/g, '')}" target="_blank" style="color:var(--cyan);text-decoration:none;">📱 ${o.whatsapp}</a>
          <br/>📍 ${o.address}
          <br/>Fit: <strong>${o.fit || '—'}</strong> · Type: <strong>${o.type || '—'}</strong> · Size: <strong>${o.size}</strong> · Qty: <strong>${o.quantity}</strong>
          <br/>Total: <strong style="color:var(--cyan);">EGP ${(snap.price * o.quantity).toLocaleString()}</strong>
          <br/>📅 ${date}
        </div>
      </div>
      <div class="order-actions">
        <span class="badge ${badgeClass}" style="margin-bottom:0.4rem;">${o.status.toUpperCase()}</span>
        <select class="status-select" onchange="updateStatus(${o.id}, this.value)">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="contacted" ${o.status === 'contacted' ? 'selected' : ''}>Contacted</option>
          <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
        </select>
        <button class="act-btn act-btn-del" onclick="deleteOrder(${o.id})">🗑 Delete</button>
      </div>
    </div>`;
    }).join('');
}

window.updateStatus = function (id, status) {
    try {
        DB.updateOrderStatus(id, status);
        showToast(`Status → ${status}`);
        // Update the badge in-place — avoids full re-render flicker
        const card = document.getElementById(`order-${id}`);
        if (card) {
            const badgeClass = {
                pending: 'badge-pending', contacted: 'badge-contacted',
                shipped: 'badge-shipped', completed: 'badge-completed'
            }[status] || 'badge-pending';
            const badge = card.querySelector('.badge');
            if (badge) {
                badge.className = `badge ${badgeClass}`;
                badge.textContent = status.toUpperCase();
            }
        }
    } catch (e) { showToast('Failed to update status', 'error'); }
};

window.deleteOrder = function (id) {
    if (!confirm('Delete this order?')) return;
    try {
        DB.deleteOrder(id);
        document.getElementById(`order-${id}`)?.remove();
        showToast('Order deleted');
        loadAnalytics();
    } catch (e) { showToast('Failed to delete order', 'error'); }
};
