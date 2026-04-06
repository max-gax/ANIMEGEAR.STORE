// AnimeGear — Client-Side localStorage Database
// Replaces the Node.js/Express server backend entirely.
// All data is stored in the browser's localStorage.

(function () {
    const DB_KEY = 'animegear_db';
    const ADMIN_PASSWORD = 'admin123';

    // Seed data — imported from the original data.json
    const SEED = {
        products: [
            {
                id: 6,
                name: "fgdfg",
                category: "Anime",
                price: 999,
                cost: 0,
                images: ["images/1771673456182-208236124.png", "images/1771675098628-965411895.png", "images/1771675098645-883194986.png"],
                available: 1,
                created_at: "2026-02-21T11:30:56.198Z"
            },
            {
                id: 7,
                name: "gdfgdf",
                category: "Anime",
                price: 600,
                cost: 300,
                images: ["images/1771675185377-856245971.png", "images/1771675185387-242983464.png"],
                available: 1,
                created_at: "2026-02-21T11:59:45.402Z"
            }
        ],
        orders: [],
        _seq: { products: 7, orders: 8 }
    };

    function readDB() {
        try {
            const raw = localStorage.getItem(DB_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* corrupted, fall through */ }
        // First run — seed data
        writeDB(SEED);
        return JSON.parse(JSON.stringify(SEED));
    }

    function writeDB(db) {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    function nextId(db, collection) {
        db._seq[collection] = (db._seq[collection] || 0) + 1;
        return db._seq[collection];
    }

    // Convert File object to base64 data URL
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ── PUBLIC API ──────────────────────────────────────────────

    window.DB = {

        ADMIN_PASSWORD,

        // ── PRODUCTS ──

        getProducts(category) {
            const db = readDB();
            let products = [...db.products].reverse();
            if (category && category !== 'All') {
                products = products.filter(p => p.category === category);
            }
            return products;
        },

        getProduct(id) {
            const db = readDB();
            return db.products.find(p => p.id === parseInt(id)) || null;
        },

        async saveProduct({ id, name, category, price, cost, imageFiles, existingImages }) {
            const db = readDB();
            // Convert new image files to base64
            const newImages = [];
            for (const file of (imageFiles || [])) {
                newImages.push(await fileToBase64(file));
            }

            if (id) {
                // Edit existing
                const idx = db.products.findIndex(p => p.id === parseInt(id));
                if (idx === -1) throw new Error('Product not found');
                const images = [...(existingImages || []), ...newImages];
                db.products[idx] = {
                    ...db.products[idx],
                    name: name || db.products[idx].name,
                    category: category || db.products[idx].category,
                    price: parseFloat(price) || db.products[idx].price,
                    cost: parseFloat(cost) ?? db.products[idx].cost,
                    images
                };
                writeDB(db);
                return db.products[idx];
            } else {
                // Add new
                const product = {
                    id: nextId(db, 'products'),
                    name,
                    category: category || 'Gaming',
                    price: parseFloat(price),
                    cost: parseFloat(cost) || 0,
                    images: newImages,
                    available: 1,
                    created_at: new Date().toISOString()
                };
                db.products.push(product);
                writeDB(db);
                return product;
            }
        },

        deleteProduct(id) {
            const db = readDB();
            db.products = db.products.filter(p => p.id !== parseInt(id));
            writeDB(db);
        },

        toggleAvailability(id) {
            const db = readDB();
            const p = db.products.find(p => p.id === parseInt(id));
            if (!p) throw new Error('Product not found');
            p.available = p.available ? 0 : 1;
            writeDB(db);
            return { available: p.available };
        },

        // ── ORDERS ──

        getOrders() {
            const db = readDB();
            return [...db.orders].reverse();
        },

        saveOrder({ product_id, customer_name, whatsapp, address, size, fit, type, quantity }) {
            const db = readDB();
            const product = db.products.find(p => p.id === parseInt(product_id));
            if (!product) throw new Error('Product not found');

            const snapshot = {
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images,
                category: product.category
            };
            const order = {
                id: nextId(db, 'orders'),
                product_id: parseInt(product_id),
                product_snapshot: snapshot,
                customer_name,
                whatsapp,
                address,
                size,
                fit,
                type,
                quantity: parseInt(quantity) || 1,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            db.orders.push(order);
            writeDB(db);
            return order;
        },

        updateOrderStatus(id, status) {
            const valid = ['pending', 'contacted', 'shipped', 'completed'];
            if (!valid.includes(status)) throw new Error('Invalid status');
            const db = readDB();
            const order = db.orders.find(o => o.id === parseInt(id));
            if (!order) throw new Error('Order not found');
            order.status = status;
            writeDB(db);
            return { success: true, status };
        },

        deleteOrder(id) {
            const db = readDB();
            db.orders = db.orders.filter(o => o.id !== parseInt(id));
            writeDB(db);
        },

        // ── ANALYTICS ──

        getAnalytics() {
            const db = readDB();
            const orders = db.orders;
            const products = db.products;
            const totalOrders = orders.length;
            const totalUnits = orders.reduce((s, o) => s + (o.quantity || 1), 0);
            const revenue = orders.reduce((s, o) => {
                const price = o.product_snapshot ? o.product_snapshot.price : 0;
                return s + price * (o.quantity || 1);
            }, 0);
            const netProfit = orders.reduce((s, o) => {
                const snap = o.product_snapshot;
                if (!snap) return s;
                const prod = products.find(p => p.id === snap.id);
                const cost = prod ? prod.cost : 0;
                return s + (snap.price - cost) * (o.quantity || 1);
            }, 0);
            return { totalOrders, totalUnits, revenue, netProfit };
        }
    };

})();
