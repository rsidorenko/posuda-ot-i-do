import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchOrders, cancelOrder } from '../../store/slices/orderSlice';
import type { Order, OrderItem } from '../../store/slices/orderSlice';
import styles from '../../styles/Orders.module.scss';
import { useNavigate } from 'react-router-dom';

const statusClass = (status: string) => {
  switch (status) {
    case 'pending': return styles.status + ' ' + styles.pending;
    case 'processing': return styles.status + ' ' + styles.assembling;
    case 'completed': return styles.status + ' ' + styles.assembled;
    case 'cancelled': return styles.status + ' ' + styles.cancelled;
    default: return styles.status;
  }
};

const Orders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.order);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchOrders());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className={styles.ordersContainer}>
        <h2 className={styles.ordersTitle}>У вас пока нет заказов</h2>
      </div>
    );
  }

  return (
    <div className={styles.ordersContainer}>
      <h1 className={styles.ordersTitle}>Мои заказы</h1>
      {orders.map((order: Order) => (
        <div key={order._id} className={styles.orderCard}>
          <div className={styles.orderHeader}>
            <div>
              <div className={styles.orderNumber}>
                Заказ №{order._id.slice(0, -4)}
                <span style={{ color: '#e53935' }}>{order._id.slice(-4)}</span>
              </div>
              <div className={styles.orderDate}>от {new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            <span className={statusClass(order.status)}>
              {order.status === 'unconfirmed' && 'Не подтвержден'}
              {order.status === 'assembling' && 'Сборка'}
              {order.status === 'ready' && 'Готов к выдаче'}
              {order.status === 'issued' && 'Выдан'}
              {order.status === 'cancelled' && 'Отменен'}
            </span>
          </div>
          <div className={styles.orderItems}>
            {order.items.map((item: OrderItem, idx) => (
              <div key={item._id || idx} className={styles.orderItem + ((item.product === null || !item.image || item.image === '/no-image.webp') ? ' ' + styles.hasOutOfStock : '')}>
                {(item.product === null || !item.image || item.image === '/no-image.webp') ? (
                  <div className={styles.outOfStockItemMobile}>
                    <div className={styles.outOfStockDetailsTop + ' ' + styles.desktopOutOfStockRow}>
                      <span className={styles.notAvailableMobile}>Товар отсутствует в продаже</span>
                      <span className={styles.desktopOutOfStockName}>{item.name || 'Без названия'}</span>
                    </div>
                    <div className={styles.outOfStockDetailsBottom}>
                      <div className={styles.itemQuantityGroupMobile}>
                        <span className={styles.itemQuantityLabel}>Кол-во:</span>
                        <span className={styles.itemQty}>{item.quantity || 1}</span>
                      </div>
                      <div className={styles.itemTotalMobile}><span className={styles.desktopOnly}>Сумма: </span>{((item.price || 0) * (item.quantity || 1)).toFixed(2)} ₽</div>
                    </div>
                  </div>
                ) :
                (!item.image || item.image === '/no-image.webp' ? (
                  <div className={styles.outOfStockItemMobile}>
                    <div className={styles.outOfStockDetailsTop}>
                      <span className={styles.notAvailableMobile}>Товар отсутствует в продаже</span>
                    </div>
                    <div className={styles.desktopOutOfStockName}>{item.name || 'Без названия'}</div>
                    <div className={styles.outOfStockDetailsBottom}>
                      <div className={styles.itemQuantityGroupMobile}>
                        <span className={styles.itemQuantityLabel}>Кол-во:</span>
                        <span className={styles.itemQty}>{item.quantity || 1}</span>
                      </div>
                      <div className={styles.itemTotalMobile}><span className={styles.desktopOnly}>Сумма: </span>{((item.price || 0) * (item.quantity || 1)).toFixed(2)} ₽</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={item.image}
                      alt={item.name || 'Товар'}
                      className={styles.itemImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className={styles.itemDetailsMobile}>
                      <div className={styles.itemName} title={item.name || 'Товар'}>
                        {item.name || 'Товар'}
                      </div>
                      <div className={styles.itemQuantityAndPriceMobile}>
                        <div className={styles.itemQuantityGroup}>
                          <span className={styles.desktopOnly}>Кол-во: {item.quantity || 1}</span>
                          <span className={styles.mobileOnly}>
                            <span className={styles.itemQuantityLabel}>Кол-во:</span>
                            <span className={styles.itemQty}>{item.quantity || 1}</span>
                          </span>
                        </div>
                        <div className={styles.itemTotalMobile}><span className={styles.desktopOnly}>Сумма: </span>{((item.price || 0) * (item.quantity || 1)).toFixed(2)} ₽</div>
                      </div>
                    </div>
                  </>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.orderFooter}>
            <div className={styles.orderSum}>Сумма: {(order.totalAmount || 0).toFixed(2)} ₽</div>
            {(order.status !== 'issued' && order.status !== 'cancelled') && (
              <button className={styles.cancelButton} onClick={async () => {
                await dispatch(cancelOrder(order._id));
                dispatch(fetchOrders());
              }}>
                Отменить
              </button>
            )}
          </div>
          <div className={styles.orderFooterMobile}>
            <div className={styles.orderSum}><span className={styles.desktopOnly}>Итог:</span>{!(window.innerWidth > 700) && 'Сумма:'} {(order.totalAmount || 0).toFixed(2)} ₽</div>
            {(order.status !== 'issued' && order.status !== 'cancelled') && (
              <button className={styles.cancelButton} onClick={async () => {
                await dispatch(cancelOrder(order._id));
                dispatch(fetchOrders());
              }}>
                Отменить
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders; 