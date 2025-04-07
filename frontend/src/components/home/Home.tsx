import React from 'react';
import styles from '../../styles/Home.module.scss';
import { Link } from 'react-router-dom';

const steps = [
  { icon: '🛒', label: 'Выберите товары' },
  { icon: '📱', label: 'Оформите заказ' },
  { icon: '🏬', label: 'Заберите в магазине' },
  { icon: '💳', label: 'Оплатите при получении' },
];

const Home: React.FC = () => (
  <div className={styles.homeContainer}>
    <section className={styles.heroSection}>
      <h1 className={styles.title}>Добро пожаловать в магазин посуды!</h1>
      <p className={styles.subtitle}>
        У нас вы найдете современную и качественную посуду для вашей кухни.<br />
        <b>Оплата производится только при получении заказа в магазине.</b>
      </p>
      <Link to="/catalog" className={styles.heroBtn}>Перейти в каталог</Link>
    </section>

    <section className={styles.whyUsSection}>
      <h2 className={styles.sectionTitle}>Почему выбирают нас?</h2>
      <div className={styles.whyUsGrid}>
        <div className={styles.whyUsItem}><span>🌟</span>Проверенные бренды</div>
        <div className={styles.whyUsItem}><span>🛡️</span>Гарантия на продукцию</div>
        <div className={styles.whyUsItem}><span>🎁</span>Подарочные сертификаты</div>
      </div>
    </section>

    <section className={styles.stepsSection}>
      <h2 className={styles.sectionTitle}>Как сделать заказ?</h2>
      <div className={styles.stepsList}>
        {steps.map((step, idx) => (
          <div className={styles.stepItem} key={idx}>
            <div className={styles.stepContent}>
              <span className={styles.stepIcon}>{step.icon}</span>
              <div className={styles.stepLabel}>{step.label}</div>
            </div>
            {idx < steps.length - 1 && (
              <>
                <span className={styles.stepArrowDown}>↓</span>
                <span className={styles.stepArrowRight}>→</span>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Home; 