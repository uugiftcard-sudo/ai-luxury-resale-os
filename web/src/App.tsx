import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { CartProvider } from './hooks/useCart';
import { ToastProvider } from './hooks/useToast';
import { MarketProvider } from './hooks/useMarket';
import { SupportProvider } from './contexts/SupportContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { AuthProvider } from './contexts/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const UKHome = lazy(() => import('./pages/UKHome'));
const HKHome = lazy(() => import('./pages/HKHome'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Delivery = lazy(() => import('./pages/Delivery'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Authentication = lazy(() => import('./pages/Authentication'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const Admin = lazy(() => import('./pages/Admin'));
const Support = lazy(() => import('./pages/Support'));
const Inventory = lazy(() => import('./pages/Inventory'));
const AdminWarehouse = lazy(() => import('./pages/AdminWarehouse'));
const Finance = lazy(() => import('./pages/Finance'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#666',
    }}>
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <MarketProvider>
            <SupportProvider>
              <InventoryProvider>
                <AuthProvider>
                  <Header />
                  <main>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                      {/* ── UK market (default /) ─────────────────────────── */}
                      <Route path="/" element={<UKHome />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/delivery" element={<Delivery />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/authentication" element={<Authentication />} />
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

                      {/* ── HK market (/hk) ───────────────────────────────── */}
                      <Route path="/hk" element={<HKHome />} />
                      <Route path="/hk/about" element={<About />} />
                      <Route path="/hk/contact" element={<Contact />} />
                      <Route path="/hk/delivery" element={<Delivery />} />
                      <Route path="/hk/privacy" element={<Privacy />} />
                      <Route path="/hk/authentication" element={<Authentication />} />
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

                      {/* ── CN market (/cn) ────────────────────────────────── */}
                      <Route path="/cn" element={<Home />} />
                      <Route path="/cn/about" element={<About />} />
                      <Route path="/cn/contact" element={<Contact />} />
                      <Route path="/cn/delivery" element={<Delivery />} />
                      <Route path="/cn/privacy" element={<Privacy />} />
                      <Route path="/cn/authentication" element={<Authentication />} />
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
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                </AuthProvider>
              </InventoryProvider>
            </SupportProvider>
          </MarketProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
