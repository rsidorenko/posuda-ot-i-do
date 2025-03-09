import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearCart } from '../../store/slices/cartSlice';
import styles from '../../styles/Checkout.module.scss';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state) => state.cart);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      dispatch(clearCart());
      navigate('/order-success');
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyWrapper}>
        <h2 className={styles.emptyTitle}>Ваша корзина пуста</h2>
        <button
          onClick={() => navigate('/catalog')}
          className={styles.backBtn}
        >
          Перейти в каталог
        </button>
      </div>
    );
  }

  return (
    <div className={styles.checkoutWrapper}>
      <h1 className={styles.checkoutTitle}>Оформление заказа</h1>
      <div className={styles.checkoutGrid}>
        {/* Checkout Form */}
        <div className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Shipping Information */}
            <div className={styles.formBlock}>
              <h2 className={styles.formBlockTitle}>Данные для доставки</h2>
              <div className={styles.formGrid}>
                <div>
                  <label htmlFor="firstName" className={styles.label}>Имя</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleShippingChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={styles.label}>Фамилия</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleShippingChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.gridFull}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.gridFull}>
                  <label htmlFor="address" className={styles.label}>Адрес</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div>
                  <label htmlFor="city" className={styles.label}>Город</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div>
                  <label htmlFor="state" className={styles.label}>Область</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className={styles.label}>Индекс</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleShippingChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div>
                  <label htmlFor="country" className={styles.label}>Страна</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingChange}
                    required
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
            {/* Payment Information */}
            <div className={styles.formBlock}>
              <h2 className={styles.formBlockTitle}>Оплата</h2>
              <div className={styles.formGrid}>
                <div className={styles.gridFull}>
                  <label htmlFor="cardNumber" className={styles.label}>Номер карты</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentInfo.cardNumber}
                    onChange={handlePaymentChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div>
                  <label htmlFor="cardName" className={styles.label}>Имя на карте</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={paymentInfo.cardName}
                    onChange={handlePaymentChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div>
                  <label htmlFor="expiryDate" className={styles.label}>Срок действия</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentInfo.expiryDate}
                    onChange={handlePaymentChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className={styles.label}>CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={paymentInfo.cvv}
                    onChange={handlePaymentChange}
                    required
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={isProcessing}>
              {isProcessing ? 'Обработка...' : 'Оформить заказ'}
            </button>
          </form>
        </div>
        {/* Order Summary */}
        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>Ваш заказ</h2>
          <div className={styles.summaryList}>
            {items.map((item) => (
              <div key={item._id} className={styles.summaryItem}>
                <span className={styles.summaryItemName}>{item.name} x {item.quantity}</span>
                <span className={styles.summaryItemPrice}>{(item.price * item.quantity).toFixed(2)} ₽</span>
              </div>
            ))}
            <div className={styles.summaryDivider}></div>
            <div className={styles.summaryRow}>
              <span>Итого</span>
              <span className={styles.summaryTotal}>{total.toFixed(2)} ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 