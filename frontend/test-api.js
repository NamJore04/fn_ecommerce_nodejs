// Test script để kiểm tra API integration
// Chạy script này trong browser console

console.log('Testing API integration...');

// Test 1: Kiểm tra environment variables
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Test 2: Test fetch products
fetch('http://localhost:3001/api/products')
  .then(response => response.json())
  .then(data => {
    console.log('Products API Response:', data);
    if (data.success && data.data) {
      console.log('✅ Products API working!');
      console.log('Total products:', data.data.length);
    } else {
      console.log('❌ Products API failed');
    }
  })
  .catch(error => {
    console.error('❌ Network error:', error);
  });

// Test 3: Test fetch categories
fetch('http://localhost:3001/api/categories')
  .then(response => response.json())
  .then(data => {
    console.log('Categories API Response:', data);
    if (data.success && data.data) {
      console.log('✅ Categories API working!');
      console.log('Total categories:', data.data.length);
    } else {
      console.log('❌ Categories API failed');
    }
  })
  .catch(error => {
    console.error('❌ Network error:', error);
  });

// Test 4: Test featured products
fetch('http://localhost:3001/api/products?featured=true')
  .then(response => response.json())
  .then(data => {
    console.log('Featured Products API Response:', data);
    if (data.success && data.data) {
      console.log('✅ Featured Products API working!');
      console.log('Total featured products:', data.data.length);
    } else {
      console.log('❌ Featured Products API failed');
    }
  })
  .catch(error => {
    console.error('❌ Network error:', error);
  });
