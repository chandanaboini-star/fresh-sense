const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let inventoryDatabase = [
    { id: 1, name: "Amul Taaza Milk", stock: 120, price: 32, expiry: "1 Days" },
    { id: 2, name: "Farm Fresh Desi Tomatoes", stock: 85, price: 40, expiry: "2 Days" }
];

app.get('/api/inventory', (req, res) => {
    res.json({ success: true, data: inventoryDatabase });
});

app.post('/api/checkout', (req, res) => {
    const { items } = req.body;
    items.forEach(cartItem => {
        const prod = inventoryDatabase.find(p => p.id === cartItem.id);
        if (prod) prod.stock = Math.max(0, prod.stock - cartItem.quantity);
    });
    res.json({ success: true, message: "Inventory synchronized successfully." });
});

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));