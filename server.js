const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve the Fresh Sense frontend
app.use(express.static(path.join(__dirname, 'frontend')));

let inventoryDatabase = [
    { id: 1, name: "Amul Taaza Milk", stock: 120, price: 32, expiry: "1 Days" },
    { id: 2, name: "Farm Fresh Desi Tomatoes", stock: 85, price: 40, expiry: "2 Days" }
];

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Inventory API
app.get('/api/inventory', (req, res) => {
    res.json({ success: true, data: inventoryDatabase });
});

// Checkout API
app.post('/api/checkout', (req, res) => {
    const { items } = req.body || {};

    if (!Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            message: "Items must be provided as an array."
        });
    }

    for (const cartItem of items) {
        const prod = inventoryDatabase.find(p => p.id === cartItem.id);

        if (prod && Number.isFinite(cartItem.quantity) && cartItem.quantity > 0) {
            prod.stock = Math.max(0, prod.stock - cartItem.quantity);
        }
    }

    res.json({
        success: true,
        message: "Inventory synchronized successfully.",
        data: inventoryDatabase
    });
});

app.listen(PORT, () => {
    console.log(`Fresh Sense server running on port ${PORT}`);
});
