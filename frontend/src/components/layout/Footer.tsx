import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/Footer.module.scss';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.section}>
          <div className={styles.logo}><span className={styles.siteName}>Посуда от и до</span></div>
          <div>Ваш магазин современной посуды</div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Контакты</div>
          <div>Email: posudaotido@gmail.com</div>
          <div>Телефон: +7 (909) 313-32-51</div>
          <div>Адрес: станица Голубицкая, ул. Красная, дом 15</div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Информация</div>
          <Link to="/privacy" className={styles.link} onClick={() => window.scrollTo({top:0,behavior:'auto'})}>Политика конфиденциальности</Link>
          <Link to="/terms" className={styles.link} onClick={() => window.scrollTo({top:0,behavior:'auto'})}>Пользовательское соглашение</Link>
        </div>
      </div>
      <div className={styles.copyright}>
        &copy; {currentYear} <span className={styles.siteName}>Посуда от и до</span>. Все права защищены.
      </div>
    </footer>
  );
};

export default Footer; 