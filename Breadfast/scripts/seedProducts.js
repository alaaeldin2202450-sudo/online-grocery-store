const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

const products = [
  // Beverages
  { title: 'Apple Juice',       storedCategory: 'Beverages',           pricing: { price: 20, displayPrice: 'EGP 20' }, description: 'Cold-pressed fresh apple juice, 1 liter.',          quantity: 60,  productImage: { largeUrl: '/img/upload/apple_juice.jpg' } },
  { title: 'Mango Juice',       storedCategory: 'Beverages',           pricing: { price: 22, displayPrice: 'EGP 22' }, description: 'Rich and tropical mango juice, 500ml.',             quantity: 55,  productImage: { largeUrl: '/img/upload/mango_juice.jpg' } },
  { title: 'Green Tea',         storedCategory: 'Beverages',           pricing: { price: 15, displayPrice: 'EGP 15' }, description: 'Premium Japanese green tea, pack of 20 bags.',     quantity: 80,  productImage: { largeUrl: '/img/upload/green_tea.jpg' } },
  { title: 'Iced Coffee',       storedCategory: 'Beverages',           pricing: { price: 28, displayPrice: 'EGP 28' }, description: 'Ready-to-drink cold brew iced coffee, 300ml.',     quantity: 45,  productImage: { largeUrl: '/img/upload/iced_coffee.jpg' } },
  { title: 'Lemonade',          storedCategory: 'Beverages',           pricing: { price: 18, displayPrice: 'EGP 18' }, description: 'Fresh squeezed lemonade with a hint of mint.',    quantity: 50,  productImage: { largeUrl: '/img/upload/lemonade.jpg' } },
  // Dairy
  { title: 'Butter',            storedCategory: 'Dairy',               pricing: { price: 25, displayPrice: 'EGP 25' }, description: 'Creamy unsalted butter block, 200g.',              quantity: 60,  productImage: { largeUrl: '/img/upload/butter.jpg' } },
  { title: 'Cream Cheese',      storedCategory: 'Dairy',               pricing: { price: 35, displayPrice: 'EGP 35' }, description: 'Smooth and spreadable cream cheese, 200g.',        quantity: 40,  productImage: { largeUrl: '/img/upload/cream_cheese.jpg' } },
  { title: 'Mozzarella',        storedCategory: 'Dairy',               pricing: { price: 50, displayPrice: 'EGP 50' }, description: 'Fresh buffalo mozzarella ball, 125g.',             quantity: 35,  productImage: { largeUrl: '/img/upload/mozzarella.jpg' } },
  { title: 'Sour Cream',        storedCategory: 'Dairy',               pricing: { price: 28, displayPrice: 'EGP 28' }, description: 'Thick and tangy sour cream, 200g.',                quantity: 45,  productImage: { largeUrl: '/img/upload/sour_cream.jpg' } },
  { title: 'Skimmed Milk',      storedCategory: 'Dairy',               pricing: { price: 15, displayPrice: 'EGP 15' }, description: 'Low-fat skimmed milk, 1 liter.',                   quantity: 90,  productImage: { largeUrl: '/img/upload/skimmed_milk.jpg' } },
  // Bakeries & Pastries
  { title: 'Chocolate Muffin',  storedCategory: 'Bakeries & Pastries', pricing: { price: 18, displayPrice: 'EGP 18' }, description: 'Moist double chocolate chip muffin.',              quantity: 40,  productImage: { largeUrl: '/img/upload/chocolate_muffin.jpg' } },
  { title: 'Cinnamon Roll',     storedCategory: 'Bakeries & Pastries', pricing: { price: 22, displayPrice: 'EGP 22' }, description: 'Soft cinnamon roll with cream cheese frosting.',   quantity: 30,  productImage: { largeUrl: '/img/upload/cinnamon_roll.jpg' } },
  { title: 'Baguette',          storedCategory: 'Bakeries & Pastries', pricing: { price: 20, displayPrice: 'EGP 20' }, description: 'Classic French baguette, freshly baked.',          quantity: 50,  productImage: { largeUrl: '/img/upload/baguette.jpg' } },
  { title: 'Blueberry Scone',   storedCategory: 'Bakeries & Pastries', pricing: { price: 25, displayPrice: 'EGP 25' }, description: 'Buttery scone loaded with fresh blueberries.',     quantity: 35,  productImage: { largeUrl: '/img/upload/blueberry_scone.jpg' } },
  { title: 'Banana Bread',      storedCategory: 'Bakeries & Pastries', pricing: { price: 30, displayPrice: 'EGP 30' }, description: 'Homestyle banana bread loaf, moist and sweet.',    quantity: 25,  productImage: { largeUrl: '/img/upload/banana_bread.jpg' } },
  // Fruits & Veggies
  { title: 'Red Apples',        storedCategory: 'Fruits & Veggies',    pricing: { price: 15, displayPrice: 'EGP 15' }, description: 'Crisp and sweet red apples, per kg.',              quantity: 100, productImage: { largeUrl: '/img/upload/red_apples.jpg' } },
  { title: 'Strawberries',      storedCategory: 'Fruits & Veggies',    pricing: { price: 35, displayPrice: 'EGP 35' }, description: 'Fresh ripe strawberries, 250g punnet.',             quantity: 50,  productImage: { largeUrl: '/img/upload/strawberries.jpg' } },
  { title: 'Spinach',           storedCategory: 'Fruits & Veggies',    pricing: { price: 12, displayPrice: 'EGP 12' }, description: 'Fresh baby spinach leaves, 200g bag.',             quantity: 70,  productImage: { largeUrl: '/img/upload/spinach.jpg' } },
  { title: 'Bell Peppers',      storedCategory: 'Fruits & Veggies',    pricing: { price: 18, displayPrice: 'EGP 18' }, description: 'Mixed colour bell peppers, 3 pack.',               quantity: 60,  productImage: { largeUrl: '/img/upload/bell_peppers.jpg' } },
  { title: 'Cucumbers',         storedCategory: 'Fruits & Veggies',    pricing: { price: 8,  displayPrice: 'EGP 8'  }, description: 'Fresh crunchy cucumbers, per kg.',                quantity: 90,  productImage: { largeUrl: '/img/upload/cucumbers.jpg' } },
  // Snacks
  { title: 'Dark Chocolate',    storedCategory: 'Snacks',              pricing: { price: 40, displayPrice: 'EGP 40' }, description: '70% dark chocolate bar, 100g.',                    quantity: 60,  productImage: { largeUrl: '/img/upload/dark_chocolate.jpg' } },
  { title: 'Mixed Nuts',        storedCategory: 'Snacks',              pricing: { price: 55, displayPrice: 'EGP 55' }, description: 'Premium roasted mixed nuts, 200g.',                quantity: 45,  productImage: { largeUrl: '/img/upload/mixed_nuts.jpg' } },
  { title: 'Popcorn',           storedCategory: 'Snacks',              pricing: { price: 15, displayPrice: 'EGP 15' }, description: 'Lightly salted microwave popcorn, 3 pack.',        quantity: 80,  productImage: { largeUrl: '/img/upload/popcorn.jpg' } },
  { title: 'Granola Bar',       storedCategory: 'Snacks',              pricing: { price: 18, displayPrice: 'EGP 18' }, description: 'Oats and honey granola bar, pack of 6.',           quantity: 70,  productImage: { largeUrl: '/img/upload/granola_bar.jpg' } },
  { title: 'Pretzels',          storedCategory: 'Snacks',              pricing: { price: 22, displayPrice: 'EGP 22' }, description: 'Crunchy salted pretzels, 150g.',                   quantity: 65,  productImage: { largeUrl: '/img/upload/pretzels.jpg' } },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Product.insertMany(products);
  const count = await Product.countDocuments();
  console.log('Done! Total products:', count);
  await mongoose.disconnect();
}
run().catch(console.error);
