import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateProfile, getCurrentUser } from '../../store/slices/authSlice';
import axios from '../../utils/axios';
import styles from '../../styles/Profile.module.scss';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setNameError('');

    if (!user) return;

    try {
      const response = await axios.patch('/users/update-name', { name });
      await dispatch(getCurrentUser());
      setSuccessMessage('Имя успешно обновлено');
    } catch (error: any) {
      setNameError(error.response?.data?.message || 'Ошибка при обновлении имени');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Пароль должен быть не менее 6 символов');
      return;
    }

    try {
      await axios.patch('/users/change-password', {
        currentPassword,
        newPassword
      });
      
      setSuccessMessage('Пароль успешно обновлен');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Ошибка при обновлении пароля');
    }
  };

  if (!user) {
    return <div className={styles.profileContainer}>Пожалуйста, войдите в аккаунт</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.profileTitle}>Личный кабинет</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Изменить имя</h2>
        <form onSubmit={handleNameChange}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Имя</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>
          {nameError && <div className={styles.error}>{nameError}</div>}
          <button type="submit" className={styles.saveBtn}>Сохранить имя</button>
        </form>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Сменить пароль</h2>
        <form onSubmit={handlePasswordChange}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword" className={styles.label}>Текущий пароль</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newPassword" className={styles.label}>Новый пароль</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Подтвердите новый пароль</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
            />
          </div>
          {passwordError && <div className={styles.error}>{passwordError}</div>}
          <button type="submit" className={styles.saveBtn}>Сменить пароль</button>
        </form>
      </div>

      {successMessage && <div className={styles.success}>{successMessage}</div>}
    </div>
  );
};

export default Profile; 