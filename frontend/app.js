/**
 * FreshSense AI - Frontend Application Controller
 * Handles navigation, role switching, POS terminal logic,
 * and inventory synchronization.
 */

let currentRole = 'Manager';
let currentStore = 'store_mumbai';
let currentPaymentMethod = 'UPI';

const API_BASE_URL = ''; // Same-origin API, e.g. /api/inventory

let inventoryData = [
    {
        id: 1,
        name: "Amul Taaza Milk (500ml)",
        category: "Dairy & Eggs",
        stock: 120,
        price: 32,
        expiry: "1 Days",
        status: "Critical",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 2,
        name: "Farm Fresh Desi Tomatoes (1kg)",
        category: "Vegetables",
        stock: 85,
        price: 40,
        expiry: "2 Days",
        status: "Warning",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 3,
        name: "Fresh Malai Paneer (200g)",
        category: "Dairy & Eggs",
        stock: 45,
        price: 110,
        expiry: "3 Days",
        status: "Warning",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 4,
        name: "Ratnagiri Alphonso Mangoes (1kg)",
        category: "Fruits",
        stock: 60,
        price: 450,
        expiry: "4 Days",
        status: "Good",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 5,
        name: "Aashirvaad Shudh Atta (5kg)",
        category: "Atta & Grains",
        stock: 200,
        price: 340,
        expiry: "180 Days",
        status: "Good",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: 6,
        name: "Fresh Coriander & Mint Bunch",
        category: "Vegetables",
        stock: 30,
        price: 20,
        expiry: "1 Days",
        status: "Critical",
        image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=200"
    }
];

let posCart = [];
let checkoutInProgress = false;


/* --------------------------------------------------
   INITIALIZATION
-------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    switchView('landing');
    renderPosProductGrid();
    updateCartUI();

    // Load server inventory when the backend endpoint is available.
    loadInventoryFromBackend();
});


/* --------------------------------------------------
   NAVIGATION
-------------------------------------------------- */

function switchView(viewId) {
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.add('hidden');
    });

    const targetPanel = document.getElementById(`view-${viewId}`);

    if (targetPanel) {
        targetPanel.classList.remove('hidden');
    } else {
        console.warn(
            `FreshSense: HTML panel "view-${viewId}" was not found.`
        );
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove(
            'bg-emerald-900/40',
            'text-emerald-300',
            'border',
            'border-emerald-800/50'
        );
    });

    const activeNav = document.getElementById(`nav-${viewId}`);

    if (activeNav) {
        activeNav.classList.add(
            'bg-emerald-900/40',
            'text-emerald-300',
            'border',
            'border-emerald-800/50'
        );
    }

    if (viewId === 'pos') {
        renderPosProductGrid();
        updateCartUI();
    }
}


/* --------------------------------------------------
   ROLE LOGIN
-------------------------------------------------- */

function quickRoleLogin(role) {
    currentRole = role;

    const roleBadge = document.getElementById('userRoleBadge');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    if (roleBadge) {
        roleBadge.innerText =
            role === 'Admin'
                ? 'Store Admin'
                : role === 'Manager'
                    ? 'Inventory Manager'
                    : role === 'Cashier'
                        ? 'POS Checkout Operator'
                        : 'Floor Staff';
    }

    if (userName) {
        userName.innerText =
            role === 'Cashier' ? 'Suresh Kumar' : 'Anvit Jain';
    }

    if (userAvatar) {
        userAvatar.innerText =
            role === 'Cashier' ? 'SK' : 'AJ';
    }

    // Preserve the original navigation behaviour.
    if (role === 'Cashier') {
        switchView('pos');
    } else {
        switchView('landing');
    }
}


function handleLoginSubmit(event) {
    if (event) {
        event.preventDefault();
    }

    quickRoleLogin('Manager');
}


function toggleAuth() {
    switchView('landing');
}


/* --------------------------------------------------
   STORE LOCATION
-------------------------------------------------- */

function changeStoreLocation(storeVal) {
    currentStore = storeVal;

    // The current backend does not provide separate store inventories.
    // Keep the selected store value without pretending its inventory changed.
    console.log('Selected store:', currentStore);
}


/* --------------------------------------------------
   INVENTORY API
-------------------------------------------------- */

async function loadInventoryFromBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/inventory`);

        if (!response.ok) {
            throw new Error(`Inventory API returned ${response.status}`);
        }

        const result = await response.json();

        const serverItems = Array.isArray(result)
            ? result
            : result.data;

        if (!Array.isArray(serverItems)) {
            throw new Error('Inventory API response has an unexpected format.');
        }

        // Keep the existing frontend product details and images.
        // Update stock and prices only for products returned by the backend.
        inventoryData = inventoryData.map(item => {
            const serverItem = serverItems.find(
                product => Number(product.id) === Number(item.id)
            );

            if (!serverItem) {
                return item;
            }

            return {
                ...item,
                stock: Number.isFinite(Number(serverItem.stock))
                    ? Number(serverItem.stock)
                    : item.stock,
                price: Number.isFinite(Number(serverItem.price))
                    ? Number(serverItem.price)
                    : item.price
            };
        });

        renderPosProductGrid();
        updateCartUI();

        console.log('FreshSense inventory loaded from backend.');
    } catch (error) {
        // Keep the original sample data so the frontend still works
        // when the backend is not available.
        console.warn(
            'Backend inventory could not be loaded. Using local sample data.',
            error.message
        );
    }
}


/* --------------------------------------------------
   POS PRODUCT GRID
-------------------------------------------------- */

function renderPosProductGrid() {
    const grid = document.getElementById('posProductGrid');

    if (!grid) {
        return;
    }

    const searchQuery =
        document.getElementById('posSearch')?.value.toLowerCase() || '';

    const selectedCategory =
        document.getElementById('posCategory')?.value || 'all';

    const filtered = inventoryData.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery);

        const matchesCat =
            selectedCategory === 'all' ||
            item.category === selectedCategory;

        return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-8 text-center text-slate-400 text-xs italic">
                No grocery items found matching your filter.
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(item => `
        <div
            onclick="addTocart(${item.id})"
            class="bg-white p-3 rounded-2xl border border-slate-200 hover:border-brand-600 hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
        >
            <div>
                <img
                    src="${item.image}"
                    alt="${item.name}"
                    class="w-full h-24 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                />

                <h4 class="font-bold text-slate-800 text-xs leading-tight">
                    ${item.name}
                </h4>

                <p class="text-[10px] text-slate-400 mt-0.5">
                    ${item.category}
                </p>
            </div>

            <div class="mt-3 flex items-center justify-between">
                <span class="font-extrabold text-brand-700 text-sm">
                    ₹${item.price}
                </span>

                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    item.status === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                }">
                    ${item.stock} left
                </span>
            </div>
        </div>
    `).join('');
}


/* --------------------------------------------------
   ADD TO CART
-------------------------------------------------- */

function addTocart(productId) {
    const product = inventoryData.find(
        item => Number(item.id) === Number(productId)
    );

    if (!product || product.stock <= 0) {
        alert('Item is out of stock!');
        return;
    }

    const existing = posCart.find(
        item => Number(item.id) === Number(productId)
    );

    if (existing) {
        if (existing.quantity < product.stock) {
            existing.quantity += 1;
        } else {
            alert('Cannot add more than available stock!');
        }
    } else {
        posCart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartUI();
}


/* --------------------------------------------------
   CART DISPLAY AND TOTALS
-------------------------------------------------- */

function updateCartUI() {
    const cartList = document.getElementById('posCartList');
    const itemCountSpan = document.getElementById('cartItemCount');

    if (!cartList) {
        return;
    }

    if (itemCountSpan) {
        itemCountSpan.innerText =
            `${posCart.reduce((total, item) => total + item.quantity, 0)} items`;
    }

    if (posCart.length === 0) {
        cartList.innerHTML = `
            <div class="py-8 text-center text-slate-400 text-xs italic">
                No items added. Click grocery cards on the left or scan barcode.
            </div>
        `;

        const subtotalElement = document.getElementById('posSubtotal');
        const discountElement = document.getElementById('posDiscount');
        const taxElement = document.getElementById('posTax');
        const totalElement = document.getElementById('posGrandTotal');

        if (subtotalElement) subtotalElement.innerText = '₹0.00';
        if (discountElement) discountElement.innerText = '-₹0.00';
        if (taxElement) taxElement.innerText = '₹0.00';
        if (totalElement) totalElement.innerText = '₹0.00';

        return;
    }

    cartList.innerHTML = posCart.map(item => `
        <div class="py-2 flex items-center justify-between text-xs">
            <div>
                <div class="font-bold text-slate-800">${item.name}</div>

                <div class="text-[10px] text-slate-500">
                    ₹${item.price} × ${item.quantity}
                </div>
            </div>

            <div class="flex items-center gap-3">
                <span class="font-extrabold text-slate-900">
                    ₹${item.price * item.quantity}
                </span>

                <button
                    onclick="removeFromCart(${item.id})"
                    class="text-slate-400 hover:text-red-500"
                    aria-label="Remove ${item.name} from cart"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    `).join('');

    const subtotal = posCart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const hasCriticalItems = posCart.some(
        item => item.status === 'Critical'
    );

    const discount = hasCriticalItems
        ? Math.round(subtotal * 0.1)
        : 0;

    const tax = Math.round((subtotal - discount) * 0.05);
    const grandTotal = subtotal - discount + tax;

    const subtotalElement = document.getElementById('posSubtotal');
    const discountElement = document.getElementById('posDiscount');
    const taxElement = document.getElementById('posTax');
    const totalElement = document.getElementById('posGrandTotal');

    if (subtotalElement) {
        subtotalElement.innerText = `₹${subtotal}`;
    }

    if (discountElement) {
        discountElement.innerText = `-₹${discount}`;
    }

    if (taxElement) {
        taxElement.innerText = `₹${tax}`;
    }

    if (totalElement) {
        totalElement.innerText = `₹${grandTotal}`;
    }
}


/* --------------------------------------------------
   REMOVE / CLEAR CART
-------------------------------------------------- */

function removeFromCart(productId) {
    posCart = posCart.filter(
        item => Number(item.id) !== Number(productId)
    );

    updateCartUI();
}


function clearPosCart() {
    posCart = [];
    updateCartUI();
}


/* --------------------------------------------------
   PAYMENT METHOD
-------------------------------------------------- */

function setPaymentMethod(method) {
    currentPaymentMethod = method;

    document.querySelectorAll('.pay-btn').forEach(button => {
        button.classList.remove(
            'border-brand-600',
            'bg-emerald-50',
            'text-brand-800'
        );

        button.classList.add(
            'border-slate-200',
            'text-slate-600'
        );
    });

    const selectedButton = document.getElementById(`pay-${method}`);

    if (selectedButton) {
        selectedButton.classList.remove(
            'border-slate-200',
            'text-slate-600'
        );

        selectedButton.classList.add(
            'border-brand-600',
            'bg-emerald-50',
            'text-brand-800'
        );
    }
}


/* --------------------------------------------------
   CHECKOUT
-------------------------------------------------- */

async function completeCheckoutTransaction() {
    if (checkoutInProgress) {
        return;
    }

    if (posCart.length === 0) {
        alert('Billing cart is empty! Please add items before completing checkout.');
        return;
    }

    // Snapshot the cart in case the UI changes while the request is running.
    const checkoutItems = posCart.map(item => ({
        id: item.id,
        quantity: item.quantity
    }));

    // Prevent checkout if stock has changed and the cart now exceeds it.
    for (const cartItem of checkoutItems) {
        const product = inventoryData.find(
            item => Number(item.id) === Number(cartItem.id)
        );

        if (
            !product ||
            cartItem.quantity <= 0 ||
            cartItem.quantity > product.stock
        ) {
            alert('Stock is insufficient for one or more cart items. Please review your cart.');
            return;
        }
    }

    checkoutInProgress = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: checkoutItems,
                paymentMethod: currentPaymentMethod,
                store: currentStore
            })
        });

        if (!response.ok) {
            throw new Error(`Checkout API returned ${response.status}`);
        }

        const result = await response.json();

        if (result.success === false) {
            throw new Error(result.message || 'Checkout was not successful.');
        }

        // Update local stock only after the backend accepts the checkout.
        checkoutItems.forEach(cartItem => {
            const product = inventoryData.find(
                item => Number(item.id) === Number(cartItem.id)
            );

            if (product) {
                product.stock = Math.max(
                    0,
                    product.stock - cartItem.quantity
                );
            }
        });

        posCart = [];
        updateCartUI();
        renderPosProductGrid();

        alert(
            `Successfully completed billing via ${currentPaymentMethod}!`
        );

    } catch (error) {
        console.error('Checkout failed:', error);

        alert(
            'Checkout could not be confirmed by the backend. ' +
            'Your cart has been kept. Please check the backend and try again.'
        );
    } finally {
        checkoutInProgress = false;
    }
}
