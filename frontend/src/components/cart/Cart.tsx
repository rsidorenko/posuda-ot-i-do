import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import { RootState } from '../../store/types';
import { Product } from '../../store/slices/productSlice';
import styles from '../../styles/Cart.module.scss';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const removeTimers = useRef<{ [id: string]: NodeJS.Timeout }>({});
  const [pendingRemoveIds, setPendingRemoveIds] = useState<string[]>([]);
  const [removeCountdown, setRemoveCountdown] = useState<{ [id: string]: number }>({});
  const [orderError, setOrderError] = useState<string | null>(null);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const products = useAppSelector((state: RootState) => state.products.products);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    dispatch(updateQuantity({ id, quantity: newQuantity }));
    if (removeTimers.current[id]) {
      clearInterval(removeTimers.current[id]);
      delete removeTimers.current[id];
      setPendingRemoveIds((prev) => prev.filter(_id => _id !== id));
      setRemoveCountdown((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleCreateOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (items.length === 0) {
      setOrderError('Корзина пуста');
      return;
    }

    if (!lastName.trim() || !firstName.trim() || !middleName.trim()) {
      setOrderError('Пожалуйста, заполните ФИО получателя');
      return;
    }

    try {
      setOrderError(null);
      const orderItems = items
        .filter(item => item.quantity > 0)
        .map(item => ({
          product: item._id,
          quantity: item.quantity
        }));
      const orderData = { items: orderItems, recipient: { lastName, firstName, middleName } };
      const result = await dispatch(createOrder(orderData));
      if (createOrder.fulfilled.match(result)) {
        dispatch(clearCart());
        if (!user || user.role !== 'admin') {
          navigate('/orders');
        }
      } else if (result.payload && typeof result.payload === 'string') {
        setOrderError(result.payload);
      } else if ((result as any).error && (result as any).error.message) {
        setOrderError((result as any).error.message);
      } else {
        setOrderError('Ошибка оформления заказа');
      }
    } catch (error: any) {
      setOrderError(error?.response?.data?.message || 'Ошибка оформления заказа');
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.emptyCart}>
          <h2 className={styles.emptyCartTitle}>Ваша корзина пуста</h2>
          <p className={styles.emptyCartText}>Добавьте товары из каталога, чтобы оформить заказ</p>
          <button className={styles.checkoutBtn} onClick={() => navigate('/catalog')}>
            Перейти в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>Корзина</h1>
      <div className={styles.cartList}>
        {items.filter(item => item.quantity > 0).map((item) => {
          const product = products.find((p: Product) => p._id === item._id);
          const maxStock = product ? product.stock : item.stock;
          return (
            <div key={item._id} className={`${styles.cartItem} ${pendingRemoveIds.includes(item._id) ? styles.pendingRemove : ''}`}>
              <div className={styles.imageWrapper}>
                <img src={(product && product.images && product.images[0]) || item.image || '/no-image.png'} alt={item.name} className={styles.itemImage} />
                {pendingRemoveIds.includes(item._id) && removeCountdown[item._id] && (
                  <div className={styles.timerOverlay}>
                    <svg className={styles.timerSvg} width="36" height="36">
                      <circle
                        className={styles.timerCircleBg}
                        cx="18" cy="18" r="15" strokeWidth="5" fill="none"
                      />
                      <circle
                        className={styles.timerCircle}
                        cx="18" cy="18" r="15" strokeWidth="5" fill="none"
                        strokeDasharray={2 * Math.PI * 15}
                        strokeDashoffset={(2 * Math.PI * 15) * (1 - removeCountdown[item._id] / 5)}
                      />
                    </svg>
                    <span className={styles.timerText}>{removeCountdown[item._id]}</span>
                  </div>
                )}
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemName} title={item.name}>{item.name}</div>
                {/* Mobile layout details */}
                <div className={styles.mobileDetails}>
                  <div className={styles.counterRow}>
                    <div className={styles.counter}>
                      <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)} disabled={item.quantity === 0}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)} disabled={item.quantity >= maxStock}>+</button>
                    </div>
                    <div className={styles.itemTotal}>{(item.price * item.quantity).toFixed(2)} ₽</div>
                  </div>
                  <div className={styles.pricePerItem}>Цена за 1 шт: {item.price.toFixed(2)} ₽</div>
                  <div className={styles.stockInfo}>В наличии: {maxStock}</div>
                </div>
              </div>
              <button className={styles.removeBtn} onClick={() => handleRemoveItem(item._id)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="24px" height="24px">
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.12-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Всего товаров:</span>
          <span>{items.filter(item => item.quantity > 0).reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.total}`}>
          <span className={styles.summaryLabel}>Общая стоимость:</span>
          <span>{total.toFixed(2)} ₽</span>
        </div>
        {orderError && <div style={{color:'#c00',marginTop:12}}>{orderError}</div>}
        {isAuthenticated ? (
          <form onSubmit={(e) => { e.preventDefault(); handleCreateOrder(); }}>
            <h2 className={styles.recipientTitle}>Данные получателя</h2>
            <div className={styles.recipientFields}>
              <input
                type="text"
                id="lastName"
                className={styles.recipientInput}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Фамилия"
              />
              <input
                type="text"
                id="firstName"
                className={styles.recipientInput}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Имя"
              />
              <input
                type="text"
                id="middleName"
                className={styles.recipientInput}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                required
                placeholder="Отчество"
              />
            </div>
            <button type="submit" className={styles.checkoutBtn}>Оформить заказ</button>
          </form>
        ) : (
          <button className={styles.checkoutBtn} onClick={() => navigate('/login', { state: { from: '/cart' } })}>
            Войдите для оформления заказа
          </button>
        )}
      </div>
    </div>
  );
};

export default Cart; 