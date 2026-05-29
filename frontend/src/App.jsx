import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";   // new
import ProtectedRoute from "./Components/ProtectedRoute";
import AppNavbar from "./Components/Navbar";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import VerifyEmail from "./Pages/VerifyEmail";
import Dashboard from "./Pages/Dashboard";
import Products from "./Pages/Products";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import OrderSuccess from "./Pages/OrderSuccess";
import Footer from "./Pages/Footer"

// Pages added in Phase 2 & 4
import ProductDetail from "./Pages/ProductDetail";
import CategoryProducts from "./Pages/CategoryProduct";
import Profile from "./Pages/Profile";
import AddressBook from "./Pages/AddressBook";
import OrderHistory from "./Pages/OrderHistory";
import OrderDetail from "./Pages/OrderDetail";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import WishlistPage from "./Pages/WishlistPage";       // new
import CouponManagement from "./Pages/CouponManagement"; // admin only, route inside dashboard

function App() {
  return (
    <AuthProvider>
      <Router>
        <CartProvider>
          <WishlistProvider>   {/* Wrap with WishlistProvider */}
            <AppNavbar />
            <ToastContainer position="top-right" autoClose={3000} />
            <div style={{ paddingTop: "80px" }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/category/:category" element={<CategoryProducts />} />

                {/* Protected user routes */}
                <Route path="/cart" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/order-success" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <OrderSuccess />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/addresses" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <AddressBook />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <OrderHistory />
                  </ProtectedRoute>
                } />
                <Route path="/order/:orderId" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <OrderDetail />
                  </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <WishlistPage />
                  </ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                {/* Coupon management is inside Dashboard tabs, but you could also add a standalone route */}
              </Routes>
            </div>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;