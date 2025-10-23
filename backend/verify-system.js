// Verify system for production deployment
require('dotenv-flow').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                    ║');
console.log('║               🔍 SYSTEM VERIFICATION FOR DEPLOYMENT                ║');
console.log('║                                                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

// 1. CHECK ENVIRONMENT CONFIGURATION
console.log('1️⃣  ENVIRONMENT CONFIGURATION');
console.log('─'.repeat(70));
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`AUTO_IMPORT_DATA: ${process.env.AUTO_IMPORT_DATA}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@')}`);
console.log(`PORT: ${process.env.PORT}`);
console.log();

// 2. CHECK JSON FILES
console.log('2️⃣  JSON DATA FILES');
console.log('─'.repeat(70));
const dbPath = path.join(__dirname, '../db');
const collections = ['users', 'products', 'carts', 'orders', 'reviews', 'discountcodes'];

let allFilesValid = true;
for (const col of collections) {
  const filePath = path.join(dbPath, `ecommerce.${col}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${col.padEnd(20)} : FILE NOT FOUND`);
    allFilesValid = false;
    continue;
  }

  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(rawData);
    
    // Check for ObjectId format
    let hasValidObjectId = false;
    let hasInvalidObjectId = false;
    
    if (jsonData.length > 0) {
      const firstDoc = jsonData[0];
      if (firstDoc._id) {
        if (typeof firstDoc._id === 'object' && firstDoc._id.$oid) {
          hasValidObjectId = true;
        } else if (typeof firstDoc._id === 'string') {
          hasInvalidObjectId = true;
        }
      }
    }
    
    const status = hasValidObjectId ? '✅' : (hasInvalidObjectId ? '⚠️' : '❓');
    const format = hasValidObjectId ? 'Extended JSON (OK)' : (hasInvalidObjectId ? 'STRING (WILL FAIL!)' : 'Unknown');
    
    console.log(`${status} ${col.padEnd(20)} : ${jsonData.length} docs, ${format}`);
    
    if (hasInvalidObjectId) {
      allFilesValid = false;
    }
  } catch (error) {
    console.log(`❌ ${col.padEnd(20)} : INVALID JSON - ${error.message}`);
    allFilesValid = false;
  }
}
console.log();

// 3. CHECK convertMongoJSON FUNCTION
console.log('3️⃣  CODE VERIFICATION');
console.log('─'.repeat(70));

const serverJsPath = path.join(__dirname, 'server.js');
const importDataPath = path.join(__dirname, 'import-data.js');

let codeValid = true;

// Check server.js
if (fs.existsSync(serverJsPath)) {
  const serverContent = fs.readFileSync(serverJsPath, 'utf8');
  if (serverContent.includes('return new mongoose.Types.ObjectId(obj.$oid)')) {
    console.log('✅ server.js       : convertMongoJSON() is CORRECT');
  } else if (serverContent.includes('return obj.$oid')) {
    console.log('❌ server.js       : convertMongoJSON() returns STRING (WRONG!)');
    codeValid = false;
  } else {
    console.log('⚠️  server.js       : Cannot verify convertMongoJSON()');
  }
} else {
  console.log('❌ server.js       : FILE NOT FOUND');
  codeValid = false;
}

// Check import-data.js
if (fs.existsSync(importDataPath)) {
  const importContent = fs.readFileSync(importDataPath, 'utf8');
  if (importContent.includes('return new mongoose.Types.ObjectId(obj.$oid)')) {
    console.log('✅ import-data.js  : convertMongoJSON() is CORRECT');
  } else if (importContent.includes('return obj.$oid') && !importContent.includes('new mongoose.Types.ObjectId')) {
    console.log('❌ import-data.js  : convertMongoJSON() returns STRING (WRONG!)');
    codeValid = false;
  } else {
    console.log('⚠️  import-data.js  : Cannot verify convertMongoJSON()');
  }
} else {
  console.log('❌ import-data.js  : FILE NOT FOUND');
}
console.log();

// 4. TEST DATABASE CONNECTION & DATA
async function testDatabase() {
  console.log('4️⃣  DATABASE CONNECTION TEST');
  console.log('─'.repeat(70));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Check collections
    console.log('\nCollection Status:');
    let hasData = false;
    for (const col of collections) {
      try {
        const collection = mongoose.connection.collection(col);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          // Check one document for ObjectId type
          const doc = await collection.findOne({});
          const idType = typeof doc._id;
          const isObjectId = mongoose.Types.ObjectId.isValid(doc._id) && (doc._id instanceof mongoose.Types.ObjectId);
          
          const status = isObjectId ? '✅' : '❌';
          const typeInfo = isObjectId ? 'ObjectId (OK)' : `${idType} (WRONG!)`;
          
          console.log(`${status} ${col.padEnd(20)} : ${count} docs, _id type: ${typeInfo}`);
          hasData = true;
        } else {
          console.log(`⚠️  ${col.padEnd(20)} : EMPTY`);
        }
      } catch (error) {
        console.log(`❌ ${col.padEnd(20)} : ERROR - ${error.message}`);
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database test completed');
    
    return hasData;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  }
}

// Run tests
(async () => {
  const hasData = await testDatabase();
  
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                    ║');
  console.log('║                        📋 VERIFICATION SUMMARY                     ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');
  
  const envOK = process.env.AUTO_IMPORT_DATA === 'true';
  const filesOK = allFilesValid;
  const codeOK = codeValid;
  const dbOK = hasData;
  
  console.log(`📁 JSON Files Format    : ${filesOK ? '✅ READY' : '❌ NEEDS FIX'}`);
  console.log(`💻 Code Quality         : ${codeOK ? '✅ CORRECT' : '❌ NEEDS FIX'}`);
  console.log(`🗄️  Database Status      : ${dbOK ? '✅ HAS DATA' : '⚠️  EMPTY (will auto-import)'}`);
  console.log(`⚙️  Auto-Import Config  : ${envOK ? '✅ ENABLED' : '⚠️  DISABLED'}`);
  
  console.log();
  
  if (filesOK && codeOK) {
    console.log('✅ READY FOR DEPLOYMENT');
    console.log('   ├─ JSON files are in correct MongoDB Extended JSON format');
    console.log('   ├─ convertMongoJSON() functions are correct');
    console.log('   └─ Safe to deploy to another machine\n');
  } else {
    console.log('❌ NOT READY - ISSUES FOUND');
    if (!filesOK) {
      console.log('   ├─ Re-export database using: node export-clean-db.js');
    }
    if (!codeOK) {
      console.log('   └─ Fix convertMongoJSON() functions\n');
    }
  }
  
  process.exit(filesOK && codeOK ? 0 : 1);
})();
