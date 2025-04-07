import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/OrderSuccess.module.scss';

const OrderSuccess: React.FC = () => {
  return (
    <div className={styles.successWrapper}>
      <div className={styles.successContent}>
        <div className={styles.successIconBg}>
          <svg
            className={styles.successIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className={styles.successTitle}>
          Заказ успешно оформлен!
        </h1>
        <p className={styles.successText}>
          Спасибо за покупку! Мы отправим вам письмо с деталями заказа и информацией для отслеживания.
        </p>
      </div>

      <div className={styles.successActions}>
        <Link
          to="/orders"
          className={styles.statusBtn}
        >
          Статус заказа
        </Link>
        <Link
          to="/catalog"
          className={styles.shopBtn}
        >
          Продолжить покупки
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess; 