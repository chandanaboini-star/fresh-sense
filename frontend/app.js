/**
 * FreshSense AI - Frontend Application Controller
 * Handles navigation, role switching, POS terminal logic, inventory synchronization,
 * Chart.js rendering, and dynamic view loading.
 */

let currentRole = 'Manager';
let currentStore = 'store_mumbai';
let currentPaymentMethod = 'UPI';

let revenueChartInstance = null;
let categoryChartInstance = null;

let inventoryData = [
    { id: 1, name: "Amul Taaza Milk (500ml)", category: "Dairy & Eggs", stock: 120, price: 32, expiry: "1 Days", status: "Critical", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=200" },
    { id: 2, name: "Farm Fresh Desi Tomatoes (1kg)", category: "Vegetables", stock: 85, price: 40, expiry: "2 Days", status: "Warning", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=200" },
    { id: 3, name: "Fresh Malai Paneer (200g)", category: "Dairy & Eggs", stock: 45, price: 110, expiry: "3 Days", status: "Warning", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=200" },
    { id: 4, name: "Ratnagiri Alphonso Mangoes (1kg)", category: "Fruits", stock: 60, price: 450, expiry: "4 Days", status: "Good", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=200" },
    { id: 5, name: "Aashirvaad Shudh Atta (5kg)", category: "Atta & Grains", stock: 200, price: 340, expiry: "180 Days", status: "Good", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200" },
    { id: 6, name: "Fresh Coriander & Mint Bunch", category: "Vegetables", stock: 30, price: 20, expiry: "1 Days", status: "Critical", image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=200" }
];

let posCart = [];

document.addEventListener('DOMContentLoaded', () => {
    switchView('landing');
    renderPosProductGrid();
    updateCartUI();
});

function switchView(viewId) {
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.add('hidden');
    });

    const targetPanel = document.getElementById(`view-${viewId}`);
    if (targetPanel) {
        targetPanel.classList.remove('hidden');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-emerald-900/40', 'text-emerald-300', 'border', 'border-emerald-800/50');
    });
    const activeNav = document.getElementById(`nav-${viewId}`);
    if (activeNav) {
        activeNav.classList.add('bg-emerald-900/40', 'text-emerald-300', 'border', 'border-emerald-800/50');
    }

    // Trigger view-specific renders
    if (viewId === 'dashboard') {
        initDashboardCharts();
    } else if (viewId === 'inventory') {
        renderInventoryTable();
    } else if (viewId === 'pos') {
        renderPosProductGrid();
    } else if (viewId === 'alerts') {
        renderAlertsList();
    } else if (viewId === 'recommendations') {
        renderMarkdownCards();
    }

    // Close mobile sidebar on navigation if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.classList.contains('-translate-x-full') && window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
    }
}

function quickRoleLogin(role) {
    currentRole = role;
    const badge = document.getElementById('userRoleBadge');
    const name = document.getElementById('userName');
    const avatar = document.getElementById('userAvatar');

    if (badge) badge.innerText = role === 'Admin' ? 'Store Admin' : role === 'Manager' ? 'Inventory Manager' : role === 'Cashier' ? 'POS Checkout Operator' : 'Floor Staff';
    if (name) name.innerText = role === 'Cashier' ? 'Suresh Kumar' : 'Anvit Jain';
    if (avatar) avatar.innerText = role === 'Cashier' ? 'SK' : 'AJ';

    // Direct user to appropriate view based on persona
    if (role === 'Admin') {
        switchView('dashboard');
    } else if (role === 'Manager') {
        switchView('inventory');
    } else if (role === 'Cashier') {
        switchView('pos');
    } else if (role === 'Staff') {
        switchView('alerts');
    } else {
        switchView('landing');
    }
}

function handleLoginSubmit(event) {
    event.preventDefault();
    quickRoleLogin('Manager');
}

function toggleAuth() {
    switchView('landing');
}

function changeStoreLocation(storeVal) {
    currentStore = storeVal;
    if (document.getElementById('view-dashboard') && !document.getElementById('view-dashboard').classList.contains('hidden')) {
        initDashboardCharts();
    }
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('-translate-x-full');
    }
}

function handleGlobalSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    if (!query) return;

    if (event.key === 'Enter') {
        switchView('inventory');
        const searchInput = document.getElementById('inventorySearch');
        if (searchInput) {
            searchInput.value = query;
            renderInventoryTable();
        }
    }
}

/* ==========================================================================
   EXECUTIVE DASHBOARD CHARTS
   ========================================================================== */
function initDashboardCharts() {
    const ctxRevenue = document.getElementById('chartRevenueTrend')?.getContext('2d');
    const ctxCategory = document.getElementById('chartCategoryShare')?.getContext('2d');

    if (ctxRevenue) {
        if (revenueChartInstance) revenueChartInstance.destroy();
        revenueChartInstance = new Chart(ctxRevenue, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Sales Revenue (₹)',
                        data: [120000, 135000, 128000, 142000, 155000, 178000, 148250],
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Wastage Loss (₹)',
                        data: [18000, 14000, 11000, 9500, 8000, 7200, 5400],
                        borderColor: '#e11d48',
                        backgroundColor: 'rgba(225, 29, 72, 0.05)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });
    }

    if (ctxCategory) {
        if (categoryChartInstance) categoryChartInstance.destroy();
        categoryChartInstance = new Chart(ctxCategory, {
            type: 'doughnut',
            data: {
                labels: ['Dairy & Paneer', 'Vegetables', 'Fruits', 'Atta & Grains'],
                datasets: [{
                    data: [35, 30, 20, 15],
                    backgroundColor: ['#16a34a', '#eab308', '#f97316', '#64748b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

/* ==========================================================================
   FRESH INVENTORY TABLE LOGIC
   ========================================================================== */
function renderInventoryTable() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    const searchQuery = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const selectedCat = document.getElementById('inventoryCategoryFilter')?.value || 'all';

    const filtered = inventoryData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery);
        const matchesCat = selectedCat === 'all' || item.category === selectedCat;
        return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-400 italic">No inventory items matched your criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(item => `
        <tr class="hover:bg-slate-50 transition">
            <td class="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                <img src="${item.image}" class="w-8 h-8 rounded-lg object-cover" />
                <span>${item.name}</span>
            </td>
            <td class="p-3.5">${item.category}</td>
            <td class="p-3.5 font-bold text-slate-900">₹${item.price}</td>
            <td class="p-3.5">
                <span class="font-bold">${item.stock}</span> units
            </td>
            <td class="p-3.5 text-slate-500">${item.expiry}</td>
            <td class="p-3.5">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    item.status === 'Critical' ? 'bg-rose-100 text-rose-700' :
                    item.status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }">${item.status}</span>
            </td>
            <td class="p-3.5 text-right space-x-1">
                <button onclick="adjustStock(${item.id}, 10)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold">+10 Stock</button>
                <button onclick="adjustStock(${item.id}, -10)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold">-10 Stock</button>
            </td>
        </tr>
    `).join('');
}

function adjustStock(productId, amount) {
    const item = inventoryData.find(i => i.id === productId);
    if (item) {
        item.stock = Math.max(0, item.stock + amount);
        renderInventoryTable();
        renderPosProductGrid();
    }
}

function promptAddNewItem() {
    const name = prompt("Enter product name:", "Fresh Paneer (500g)");
    if (!name) return;
    const category = prompt("Enter category (Dairy & Eggs / Vegetables / Fruits / Atta & Grains):", "Dairy & Eggs");
    const price = parseInt(prompt("Enter price in ₹:", "180")) || 100;
    const stock = parseInt(prompt("Enter initial stock count:", "50")) || 50;

    const newItem = {
        id: inventoryData.length + 1,
        name,
        category,
        stock,
        price,
        expiry: "5 Days",
        status: "Good",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=200"
    };

    inventoryData.push(newItem);
    renderInventoryTable();
    renderPosProductGrid();
    alert(`Successfully added ${name} to store inventory!`);
}

/* ==========================================================================
   ALERTS & RISKS
   ========================================================================== */
function renderAlertsList() {
    const container = document.getElementById('alertsListContainer');
    if (!container) return;

    const criticalItems = inventoryData.filter(i => i.status === 'Critical' || i.status === 'Warning');

    container.innerHTML = criticalItems.map(item => `
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="p-3 ${item.status === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'} rounded-xl text-lg font-bold">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                    <div class="font-bold text-slate-900 text-sm">${item.name}</div>
                    <div class="text-xs text-slate-500">Expiry: <span class="font-bold text-rose-600">${item.expiry} remaining</span> • Stock: ${item.stock} units</div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="applySingleMarkdown(${item.id}, 20)" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm">
                    Apply 20% Markdown
                </button>
                <button onclick="markSpoiled(${item.id})" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
                    Mark Spoiled
                </button>
            </div>
        </div>
    `).join('');
}

function applySingleMarkdown(id, percent) {
    const item = inventoryData.find(i => i.id === id);
    if (item) {
        item.price = Math.round(item.price * (1 - percent / 100));
        alert(`Applied ${percent}% discount to ${item.name}! New price: ₹${item.price}`);
        renderAlertsList();
        renderInventoryTable();
        renderPosProductGrid();
    }
}

function markSpoiled(id) {
    const item = inventoryData.find(i => i.id === id);
    if (item) {
        item.stock = 0;
        alert(`${item.name} marked as spoiled/damaged and removed from active stock.`);
        renderAlertsList();
        renderInventoryTable();
        renderPosProductGrid();
    }
}

function triggerAutoMarkdowns() {
    inventoryData.forEach(item => {
        if (item.status === 'Critical') {
            item.price = Math.round(item.price * 0.75); // 25% discount
        }
    });
    alert("AI Auto-Markdown applied 25% discount to all critical near-expiry items!");
    renderAlertsList();
    renderInventoryTable();
    renderPosProductGrid();
}

/* ==========================================================================
   AI MARKDOWNS
   ========================================================================== */
function renderMarkdownCards() {
    const container = document.getElementById('markdownCardsContainer');
    if (!container) return;

    const criticalItems = inventoryData.filter(i => i.status === 'Critical' || i.status === 'Warning');

    container.innerHTML = criticalItems.map(item => `
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">AI Recommendation</span>
                <h4 class="font-bold text-slate-900 text-sm mt-2">${item.name}</h4>
                <p class="text-xs text-slate-500 mt-1">Expiry in <strong>${item.expiry}</strong>. Recommend 20% markdown to sell ${item.stock} remaining units.</p>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                    <span class="line-through text-xs text-slate-400">₹${item.price}</span>
                    <span class="text-sm font-extrabold text-brand-700 ml-1">₹${Math.round(item.price * 0.8)}</span>
                </div>
                <button onclick="applySingleMarkdown(${item.id}, 20)" class="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm">
                    Accept & Apply
                </button>
            </div>
        </div>
    `).join('');
}

/* ==========================================================================
   REPORTS & AUDIT EXPORT
   ========================================================================== */
function downloadReport() {
    const csvContent = "data:text/csv;charset=utf-8,Item Name,Category,Price (INR),Stock,Status\n" +
        inventoryData.map(e => `"${e.name}","${e.category}",${e.price},${e.stock},"${e.status}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FreshSense_Inventory_Audit_${currentStore}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/* ==========================================================================
   POS TERMINAL FUNCTIONS
   ========================================================================== */
function renderPosProductGrid() {
    const grid = document.getElementById('posProductGrid');
    if (!grid) return;
    const searchQuery = document.getElementById('posSearch')?.value.toLowerCase() || '';
    const selectedCategory = document.getElementById('posCategory')?.value || 'all';

    const filtered = inventoryData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery);
        const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-8 text-center text-slate-400 text-xs italic">No grocery items found matching your filter.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(item => `
        <div onclick="addTocart(${item.id})" class="bg-white p-3 rounded-2xl border border-slate-200 hover:border-brand-600 hover:shadow-md cursor-pointer transition flex flex-col justify-between group">
            <div>
                <img src="${item.image}" class="w-full h-24 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform" />
                <h4 class="font-bold text-slate-800 text-xs leading-tight">${item.name}</h4>
                <p class="text-[10px] text-slate-400 mt-0.5">${item.category}</p>
            </div>
            <div class="mt-3 flex items-center justify-between">
                <span class="font-extrabold text-brand-700 text-sm">₹${item.price}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${item.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">${item.stock} left</span>
            </div>
        </div>
    `).join('');
}

function addTocart(productId) {
    const product = inventoryData.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        alert("Item is out of stock!");
        return;
    }

    const existing = posCart.find(c => c.id === productId);
    if (existing) {
        if (existing.quantity < product.stock) {
            existing.quantity += 1;
        } else {
            alert("Cannot add more than available stock!");
        }
    } else {
        posCart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('posCartList');
    const itemCountSpan = document.getElementById('cartItemCount');
    if (!cartList) return;
    
    itemCountSpan.innerText = `${posCart.reduce((acc, curr) => acc + curr.quantity, 0)} items`;

    if (posCart.length === 0) {
        cartList.innerHTML = `<div class="py-8 text-center text-slate-400 text-xs italic">No items added. Click grocery cards on the left or scan barcode.</div>`;
        document.getElementById('posSubtotal').innerText = '₹0.00';
        document.getElementById('posDiscount').innerText = '-₹0.00';
        document.getElementById('posTax').innerText = '₹0.00';
        document.getElementById('posGrandTotal').innerText = '₹0.00';
        return;
    }

    cartList.innerHTML = posCart.map(item => `
        <div class="py-2 flex items-center justify-between text-xs">
            <div>
                <div class="font-bold text-slate-800">${item.name}</div>
                <div class="text-[10px] text-slate-500">₹${item.price} × ${item.quantity}</div>
            </div>
            <div class="flex items-center gap-3">
                <span class="font-extrabold text-slate-900">₹${item.price * item.quantity}</span>
                <button onclick="removeFromCart(${item.id})" class="text-slate-400 hover:text-red-500"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
    `).join('');

    const subtotal = posCart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const discount = posCart.some(i => i.status === 'Critical') ? Math.round(subtotal * 0.1) : 0;
    const tax = Math.round((subtotal - discount) * 0.05);
    const grandTotal = subtotal - discount + tax;

    document.getElementById('posSubtotal').innerText = `₹${subtotal}`;
    document.getElementById('posDiscount').innerText = `-₹${discount}`;
    document.getElementById('posTax').innerText = `₹${tax}`;
    document.getElementById('posGrandTotal').innerText = `₹${grandTotal}`;
}

function removeFromCart(productId) {
    posCart = posCart.filter(item => item.id !== productId);
    updateCartUI();
}

function clearPosCart() {
    posCart = [];
    updateCartUI();
}

function setPaymentMethod(method) {
    currentPaymentMethod = method;
    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.classList.remove('border-brand-600', 'bg-emerald-50', 'text-brand-800');
        btn.classList.add('border-slate-200', 'text-slate-600');
    });
    const selectedBtn = document.getElementById(`pay-${method}`);
    if (selectedBtn) {
        selectedBtn.classList.remove('border-slate-200', 'text-slate-600');
        selectedBtn.classList.add('border-brand-600', 'bg-emerald-50', 'text-brand-800');
    }
}

function completeCheckoutTransaction() {
    if (posCart.length === 0) {
        alert("Billing cart is empty! Please add items before completing checkout.");
        return;
    }

    posCart.forEach(cartItem => {
        const prod = inventoryData.find(p => p.id === cartItem.id);
        if (prod) {
            prod.stock = Math.max(0, prod.stock - cartItem.quantity);
        }
    });

    alert(`Successfully completed billing via ${currentPaymentMethod}! Inventory stock synchronized instantly in real-time.`);
    posCart = [];
    updateCartUI();
    renderPosProductGrid();
}
