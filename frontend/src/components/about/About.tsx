import React from 'react';
import styles from '../../styles/About.module.scss';

const About: React.FC = () => {
  return (
    <div className={styles.aboutWrapper}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>О магазине Посуда от и до</h1>
        <p className={styles.heroText}>
          Ваш надежный партнер в мире современной посуды с 2010 года. Мы стремимся предложить вам только лучшую кухонную утварь и аксессуары.
        </p>
      </div>

      {/* Mission Section */}
      <div className={styles.missionSection}>
        <h2 className={styles.missionTitle}>Наша миссия</h2>
        <p className={styles.missionText}>
          В Посуда от и до мы верим, что готовка — это искусство, способ объединять людей и выражать себя. Наша миссия — предоставить домашним кулинарам и профессионалам лучшие инструменты для создания кулинарных шедевров.
        </p>
        <p className={styles.missionText}>
          Мы тщательно отбираем ассортимент, чтобы каждая позиция соответствовала нашим высоким стандартам качества, долговечности и удобства.
        </p>
      </div>

      {/* Values Section */}
      <div className={styles.valuesGrid}>
        <div className={styles.valueCard}>
          <h3 className={styles.valueTitle}>Качество</h3>
          <p className={styles.valueText}>
            Мы работаем только с проверенными производителями, чтобы ваша посуда служила долгие годы.
          </p>
        </div>
        <div className={styles.valueCard}>
          <h3 className={styles.valueTitle}>Инновации</h3>
          <p className={styles.valueText}>
            Следим за трендами и новинками, чтобы вы всегда были на шаг впереди в мире кухонных технологий.
          </p>
        </div>
        <div className={styles.valueCard}>
          <h3 className={styles.valueTitle}>Сервис</h3>
          <p className={styles.valueText}>
            Наша команда всегда готова помочь подобрать идеальный товар и ответить на любые вопросы.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className={styles.teamSection}>
        <h2 className={styles.teamTitle}>Наша команда</h2>
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <div className={styles.avatar}></div>
            <h3 className={styles.memberName}>Иван Иванов</h3>
            <p className={styles.memberRole}>Основатель и CEO</p>
          </div>
          <div className={styles.teamMember}>
            <div className={styles.avatar}></div>
            <h3 className={styles.memberName}>Светлана Петрова</h3>
            <p className={styles.memberRole}>Руководитель отдела ассортимента</p>
          </div>
          <div className={styles.teamMember}>
            <div className={styles.avatar}></div>
            <h3 className={styles.memberName}>Михаил Чен</h3>
            <p className={styles.memberRole}>Менеджер по работе с клиентами</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 