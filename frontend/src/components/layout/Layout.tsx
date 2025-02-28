import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from '../../styles/Layout.module.scss';
import classNames from 'classnames';

const Layout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isResetPasswordPage = location.pathname === '/reset-password';

  const mainClassNames = classNames(styles.main, {
    [styles.mainNarrow]: isResetPasswordPage
  });

  return (
    <div className={styles.layout}>
      <Header />
      <main className={mainClassNames}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 