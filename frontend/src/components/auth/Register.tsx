import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import styles from '../../styles/Auth.module.scss';
import { GoogleLoginButton } from './GoogleLoginButton';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!termsAccepted) {
      setError('Пожалуйста, примите пользовательское соглашение');
      return;
    }

    try {
      await dispatch(register({ name, email, password })).unwrap();
      navigate('/');
    } catch (err) {
      setError('Ошибка при регистрации');
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Регистрация</h1>
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="name">Имя</label>
          <input
            id="name"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите ваше имя"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Введите ваш email"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="confirmPassword">Подтверждение пароля</label>
          <input
            id="confirmPassword"
            type="password"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Подтвердите пароль"
            required
          />
        </div>

        <div className={styles.termsGroup}>
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <label htmlFor="terms" className={styles.label}>
            Я принимаю <Link to="/terms" target="_blank" rel="noopener noreferrer">пользовательское соглашение</Link>
          </label>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.submitButton}>
          Зарегистрироваться
        </button>

        <div className={styles.switchForm}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>

        <div className={styles.socialLogin}>
          <div className={styles.divider}>
            <span>или зарегистрироваться через</span>
          </div>
          <GoogleLoginButton onClick={() => {
            window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/google`;
          }} />
        </div>
      </form>
    </div>
  );
};

export default Register; 