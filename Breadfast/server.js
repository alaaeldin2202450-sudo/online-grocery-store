const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'grocery_db';

let productsCollection;

// Simple HTML response
app.get('/', async (req, res) => {
    try {
        const products = await productsCollection.find({}).limit(20).toArray();
        
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Grocery Products</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                .product { border: 1px solid #ccc; margin: 10px; padding: 10px; border-radius: 5px; }
                .price { color: green; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>🛒 Grocery Products (${products.length} items)</h1>
            <div id="products"></div>
            <script>
                const products = ${JSON.stringify(products.map(p => ({
                    name: p.title || 'No name',
                    price: p.pricing?.price || 'N/A'
                })))};
                const container = document.getElementById('products');
                products.forEach(p => {
                    container.innerHTML += \`
                        <div class="product">
                            <strong>\${p.name}</strong><br>
                            <span class="price">$\${p.price}</span>
                        </div>
                    \`;
                });
            </script>
        </body>
        </html>
        `;
        
        res.send(html);
    } catch (error) {
        res.send('<h1>Error: ' + error.message + '</h1>');
    }
});

// API endpoint
app.get('/api/products', async (req, res) => {
    try {
        const products = await productsCollection.find({}).limit(50).toArray();
        res.json(products.map(p => ({
            name: p.title,
            price: p.pricing?.price,
            category: p.category
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function startServer() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        productsCollection = db.collection('products');
        const count = await productsCollection.countDocuments();
        console.log(`✅ Connected! ${count} products found`);
        
        app.listen(3000, () => {
            console.log('🚀 Server: http://localhost:3000');
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

startServer();