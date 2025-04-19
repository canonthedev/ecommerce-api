const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

const MONGO_URI = 'mongodb://localhost:27017/ecommerce';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB for migration');
  migrateData();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

async function migrateData() {
  try {
    await migrateProducts('data/products.csv');
    await migrateUsers('data/users.csv');
    await migrateOrders('data/orders.csv');
    console.log('Data migration completed');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

function migrateProducts(filePath) {
  return new Promise((resolve, reject) => {
    const products = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        products.push({
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          stock: parseInt(row.stock),
          category: row.category
        });
      })
      .on('end', async () => {
        try {
          await Product.insertMany(products);
          console.log('Products migrated');
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

function migrateUsers(filePath) {
  return new Promise((resolve, reject) => {
    const users = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        users.push({
          username: row.username,
          email: row.email,
          passwordHash: row.passwordHash, // Assuming password hashes are stored
          role: row.role || 'user'
        });
      })
      .on('end', async () => {
        try {
          await User.insertMany(users);
          console.log('Users migrated');
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

function migrateOrders(filePath) {
  return new Promise((resolve, reject) => {
    const orders = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Assuming products field is JSON stringified array of { product: productId, quantity: number }
        let products = [];
        try {
          products = JSON.parse(row.products);
        } catch (e) {
          console.error('Invalid products format in order:', row);
        }
        orders.push({
          user: row.userId,
          products,
          totalPrice: parseFloat(row.totalPrice),
          status: row.status || 'pending',
          createdAt: new Date(row.createdAt)
        });
      })
      .on('end', async () => {
        try {
          await Order.insertMany(orders);
          console.log('Orders migrated');
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}
