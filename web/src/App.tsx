import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatButton from './components/ChatButton';
import ChatWindow from './components/ChatWindow';
import Home from './pages/Home';
import UKHome from './pages/UKHome';
import HKHome from './pages/HKHome';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Support from './pages/Support';
import Inventory from './pages/Inventory';
import AdminWarehouse from './pages/AdminWarehouse';
import Finance from './pages/Finance';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import { CartProvider } from './hooks/useCart';
import { ToastProvider } from './hooks/useToast';
import { MarketProvider } from './hooks/useMarket';
import { SupportProvider } from './contexts/SupportContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <MarketProvider>
            <SupportProvider>
              <InventoryProvider>
                <AuthProvider>
                  <ChatProvider>
                    <Header />
                    <main>
                      <Routes>
                        {/* UK market (default /) */}
                        <Route path="/" element={<UKHome />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/admin/warehouse" element={<AdminWarehouse />} />
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* HK market (/hk) */}
                        <Route path="/hk" element={<HKHome />} />
                        <Route path="/hk/products" element={<ProductList />} />
                        <Route path="/hk/products/:id" element={<ProductDetail />} />
                        <Route path="/hk/cart" element={<Cart />} />
                        <Route path="/hk/orders" element={<Orders />} />
                        <Route path="/hk/admin" element={<Admin />} />
                        <Route path="/hk/support" element={<Support />} />
                        <Route path="/hk/inventory" element={<Inventory />} />
                        <Route path="/hk/admin/warehouse" element={<AdminWarehouse />} />
                        <Route path="/hk/finance" element={<Finance />} />
                        <Route path="/hk/wishlist" element={<Wishlist />} />
                        <Route path="/hk/login" element={<Login />} />
                        <Route path="/hk/register" element={<Register />} />

                        {/* CN market (/cn) */}
                        <Route path="/cn" element={<Home />} />
                        <Route path="/cn/products" element={<ProductList />} />
                        <Route path="/cn/products/:id" element={<ProductDetail />} />
                        <Route path="/cn/cart" element={<Cart />} />
                        <Route path="/cn/orders" element={<Orders />} />
                        <Route path="/cn/admin" element={<Admin />} />
                        <Route path="/cn/support" element={<Support />} />
                        <Route path="/cn/inventory" element={<Inventory />} />
                        <Route path="/cn/admin/warehouse" element={<AdminWarehouse />} />
                        <Route path="/cn/finance" element={<Finance />} />
                        <Route path="/cn/wishlist" element={<Wishlist />} />
                        <Route path="/cn/login" element={<Login />} />
                        <Route path="/cn/register" element={<Register />} />
                      </Routes>
                    </main>
                    <Footer />
                    <ChatButton onClick={() => setChatOpen(open => !open)} />
                    {chatOpen && <ChatWindow onClose={() => setChatOpen(false)} />}
                  </ChatProvider>
                </AuthProvider>
              </InventoryProvider>
            </SupportProvider>
          </MarketProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
