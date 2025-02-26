import React, { useState } from 'react';
import styles from '../../styles/Contact.module.scss';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
  };

  return (
    <div className={styles.contactWrapper}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Связаться с нами</h1>
        <p className={styles.heroText}>
          Остались вопросы? Мы всегда готовы помочь! Напишите нам — и мы ответим в ближайшее время.
        </p>
      </div>

      <div className={styles.contactGrid}>
        {/* Contact Information */}
        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>Контакты</h2>
          <div className={styles.infoList}>
            <div>
              <h3 className={styles.infoLabel}>Email</h3>
              <p className={styles.infoValue}>posudaotido@gmail.com</p>
            </div>
            <div>
              <h3 className={styles.infoLabel}>Телефон</h3>
              <p className={styles.infoValue}>+7 (909) 313-32-51</p>
            </div>
            <div>
              <h3 className={styles.infoLabel}>Адрес</h3>
              <p className={styles.infoValue}>
                станица Голубицкая, ул. Красная, дом 15
              </p>
            </div>
            <div>
              <h3 className={styles.infoLabel}>Время работы</h3>
              <p className={styles.infoValue}>
                Пн-Пт: 9:00 - 18:00<br />Сб: 10:00 - 16:00<br />Вс: выходной
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Написать сообщение</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label htmlFor="name" className={styles.label}>
                Имя
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="subject" className={styles.label}>
                Тема
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className={styles.input}
              >
                <option value="">Выберите тему</option>
                <option value="general">Общий вопрос</option>
                <option value="support">Техническая поддержка</option>
                <option value="billing">Вопрос по оплате</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className={styles.label}>
                Сообщение
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className={styles.input}
              ></textarea>
            </div>
            <button
              type="submit"
              className={styles.submitBtn}
            >
              Отправить сообщение
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact; 