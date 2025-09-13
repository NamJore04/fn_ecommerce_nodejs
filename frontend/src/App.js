import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { OrderProvider } from './contexts/OrderContext';
import { SocketProvider } from './contexts/SocketContext';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Page Components
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MultiStepCheckout from './pages/MultiStepCheckout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SocialCallback from './pages/SocialCallback';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import VNPayReturn from './pages/VNPayReturn';
import VNPaySimulator from './pages/VNPaySimulator';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ProductProvider>
            <CartProvider>
              <OrderProvider>
                <div className="App d-flex flex-column min-vh-100">
                  <Header />
                  
                  <main className="flex-grow-1">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                      <Route path="/auth/callback" element={<SocialCallback />} />
                      
                      {/* Protected Routes */}
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/multi-step-checkout" element={<MultiStepCheckout />} />
                      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                      <Route path="/payment/vnpay-return" element={<VNPayReturn />} />
                      <Route path="/payment/vnpay-simulator" element={<VNPaySimulator />} />
                      <Route path="/payment/error" element={<VNPayReturn />} />
                      <Route path="/orders" element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      } />
                      <Route path="/orders/:id" element={
                        <ProtectedRoute>
                          <OrderDetail />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      
                      {/* Admin Routes */}
                      <Route path="/admin" element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } />
                      <Route path="/admin/*" element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } />
                      
                      {/* 404 Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  
                  <Footer />
                </div>
              </OrderProvider>
            </CartProvider>
          </ProductProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
