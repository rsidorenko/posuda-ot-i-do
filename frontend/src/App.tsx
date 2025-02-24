import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser, checkAuth, loginSuccess, logout } from './store/slices/authSlice';
import { fetchOrders } from './store/slices/orderSlice';
import Layout from './components/layout/Layout';
import Home from './components/home/Home';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import OrderSuccess from './components/checkout/OrderSuccess';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Orders from './components/orders/Orders';
import Profile from './components/profile/Profile';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import Privacy from './components/legal/Privacy';
import Terms from './components/legal/Terms';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Catalog from './components/catalog/Catalog';
import ProductDetail from './components/products/ProductDetail';
import AdminPanel from './components/admin/AdminPanel';
import { GoogleAuthSuccess } from './components/auth/GoogleAuthSuccess';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import api from './store/api';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(getCurrentUser());
    // Silent refresh при загрузке приложения
    api.post('/auth/refresh', {}, { withCredentials: true })
      .then(res => {
        if (res.data && res.data.user && res.data.token) {
          dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
        }
      })
      .catch(() => {
        dispatch(logout());
      });
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cart" element={<Cart />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="catalog" element={<Catalog />} />
        <Route path="catalog/:id" element={<ProductDetail />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/google-success" element={<GoogleAuthSuccess />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
      </Route>
    </Routes>
  );
};

export default App;
