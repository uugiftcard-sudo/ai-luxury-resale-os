import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
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
import { CartProvider } from './hooks/useCart';
import { ToastProvider } from './hooks/useToast';
import { MarketProvider } from './hooks/useMarket';
import { SupportProvider } from './contexts/SupportContext';
import { InventoryProvider } from './contexts/InventoryContext';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <MarketProvider>
            <SupportProvider>
              <InventoryProvider>
                <Header />
                <main>
                  <Routes>
                    {/* ── UK market (default /) ─────────────────────────── */}
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

                    {/* ── HK market (/hk) ───────────────────────────────── */}
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

                    {/* ── CN market (/cn) ────────────────────────────────── */}
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
                  </Routes>
                </main>
                <Footer />
              </InventoryProvider>
            </SupportProvider>
          </MarketProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
