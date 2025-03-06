import React, { useState } from 'react';
import styles from '../../styles/Auth.module.scss';

const ResetPasswordForm: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setSuccess(''); // Clear previous success messages

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
        setError('Пароль должен быть не менее 6 символов');
        return;
    }

    // Здесь будет логика отправки нового пароля на бэкенд

    try {
        // Получаем токен сброса из параметров URL
        const urlParams = new URLSearchParams(window.location.search);
        const resetToken = urlParams.get('token');

        if (!resetToken) {
            setError('Токен сброса пароля отсутствует.');
            return;
        }

        // Отправляем запрос на бэкенд для сброса пароля
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: resetToken,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.message || 'Ошибка при сбросе пароля.');
            return;
        }

        setSuccess('Пароль успешно сброшен! Вы будете перенаправлены на страницу входа.');
        // Перенаправление на страницу входа после успешного сброса через 3 секунды
        setTimeout(() => {
          // TODO: Используйте useNavigate для перенаправления
          window.location.href = '/login'; 
        }, 3000);

    } catch (err) {
        console.error('Reset password API error:', err);
        setError('Ошибка при сбросе пароля. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Сброс пароля</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.label}>Новый пароль</label>
          <input
            type="password"
            id="newPassword"
            className={styles.input}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>Подтвердите пароль</label>
          <input
            type="password"
            id="confirmPassword"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <button type="submit" className={styles.submitButton}>
          Сбросить пароль
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm; 