// Export clean database to JSON files
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin';

async function exportData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.name);
    
    const collections = ['users', 'products', 'carts', 'orders', 'reviews', 'discountcodes'];
    const dbPath = path.join(__dirname, '..', 'db');
    
    console.log('\n📤 Exporting collections...');
    
    for (const col of collections) {
      const data = await mongoose.connection.collection(col).find({}).toArray();
      const filePath = path.join(dbPath, `ecommerce.${col}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ Exported ${data.length} documents from ${col} → ${path.basename(filePath)}`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Export completed successfully!');
    console.log('📁 Files saved to:', dbPath);
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

exportData();
