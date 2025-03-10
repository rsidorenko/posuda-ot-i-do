import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login, forgotPasswordThunk, verifyResetCodeThunk } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import styles from '../../styles/Auth.module.scss';
import { GoogleLoginButton } from './GoogleLoginButton';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from || '/';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Неверный email или пароль');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const handleForgotPasswordSubmit = async () => {
    setResetMessage('');
    setResetError('');
    if (!resetEmail) {
      setResetError('Пожалуйста, введите email.');
      return;
    }
    try {
      const resultAction = await dispatch(forgotPasswordThunk({ email: resetEmail }));
      if (forgotPasswordThunk.fulfilled.match(resultAction)) {
        setResetMessage(resultAction.payload);
        setShowVerificationCode(true);
      } else if (forgotPasswordThunk.rejected.match(resultAction)) {
        setResetError(resultAction.payload as string);
      }
    } catch (err: any) {
      setResetError('Произошла ошибка при отправке запроса.');
    }
  };

  const handleVerificationCodeSubmit = async () => {
    setVerificationError('');
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError('Пожалуйста, введите 6-значный код.');
      return;
    }
    try {
      const resultAction = await dispatch(verifyResetCodeThunk({ 
        email: resetEmail, 
        code: verificationCode 
      }));
      if (verifyResetCodeThunk.fulfilled.match(resultAction)) {
        setShowVerificationCode(false);
        setShowForgotPassword(false);
        const resetToken = resultAction.payload.resetToken;
        navigate(`/reset-password?token=${resetToken}`);
      } else if (verifyResetCodeThunk.rejected.match(resultAction)) {
        setVerificationError(resultAction.payload as string);
      }
    } catch (err: any) {
      setVerificationError('Произошла ошибка при проверке кода.');
    }
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Вход</h1>
        
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
            placeholder="Введите ваш пароль"
            required
          />
        </div>

        {/* Forgot Password Button */}
        <div className={styles.forgotPassword}>
          <button 
            type="button" 
            className={styles.forgotPasswordButton} 
            onClick={() => setShowForgotPassword(true)}
          >
            Забыли пароль?
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          Войти
        </button>

        <div className={styles.switchForm}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>

        <div className={styles.socialLogin}>
          <div className={styles.divider}>
            <span>или войти через</span>
          </div>
          <GoogleLoginButton onClick={handleGoogleLogin} />
        </div>
      </form>

      {/* Forgot Password Form */}
      {showForgotPassword && !showVerificationCode && (
        <div className={styles.forgotPasswordFormOverlay}>
          <div className={styles.forgotPasswordForm}>
            <h3 className={styles.formTitle}>Восстановление пароля</h3>
            <p>Введите ваш email, на который мы отправим код для сброса пароля.</p>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                className={styles.input}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Введите ваш email"
                required
              />
            </div>
            {resetMessage && <div className={styles.message}>{resetMessage}</div>}
            {resetError && <div className={styles.error}>{resetError}</div>}
            <button type="button" className={styles.submitButton} onClick={handleForgotPasswordSubmit}>
              Отправить код
            </button>
            <button type="button" className={styles.cancelButton} onClick={() => setShowForgotPassword(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Verification Code Form */}
      {showVerificationCode && (
        <div className={styles.forgotPasswordFormOverlay}>
          <div className={styles.forgotPasswordForm}>
            <h3 className={styles.formTitle}>Подтверждение кода</h3>
            <p>Введите 6-значный код, отправленный на ваш email.</p>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="verification-code">Код подтверждения</label>
              <input
                id="verification-code"
                type="text"
                className={styles.input}
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                placeholder="Введите 6-значный код"
                maxLength={6}
                required
              />
            </div>
            {verificationError && <div className={styles.error}>{verificationError}</div>}
            <button type="button" className={styles.submitButton} onClick={handleVerificationCodeSubmit}>
              Подтвердить
            </button>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={() => {
                setShowVerificationCode(false);
                setVerificationCode('');
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 