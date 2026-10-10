/**
 * FreshSense AI - Frontend Application Controller
 * Handles navigation, role switching, POS terminal logic, and inventory synchronization.
 */

let currentRole = 'Manager';
let currentStore = 'store_mumbai';
let currentPaymentMethod = 'UPI';

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

    if (viewId === 'pos') {
        renderPosProductGrid();
    }
}

function quickRoleLogin(role) {
    currentRole = role;
    document.getElementById('userRoleBadge').innerText = role === 'Admin' ? 'Store Admin' : role === 'Manager' ? 'Inventory Manager' : role === 'Cashier' ? 'POS Checkout Operator' : 'Floor Staff';
    document.getElementById('userName').innerText = role === 'Cashier' ? 'Suresh Kumar' : 'Anvit Jain';
    document.getElementById('userAvatar').innerText = role === 'Cashier' ? 'SK' : 'AJ';

    if (role === 'Cashier') {
        switchView('pos');
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
}

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