import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/PrivacyPolicy.module.scss';

const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: 800,
      margin: '32px auto',
      padding: '32px 20px',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 12px rgba(34,34,255,0.07)',
      fontFamily: 'Montserrat, Arial, sans-serif',
      color: '#222',
      lineHeight: 1.7
    }}>
      <button 
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 20,
          padding: '10px 20px',
          fontSize: '1rem',
          fontWeight: 600,
          color: '#fff',
          backgroundColor: '#2222ff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1a1aee')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2222ff')}
      >
        ← Назад
      </button>
      <h1 style={{
        color: '#2222ff',
        fontWeight: 700,
        fontSize: '2.1rem',
        marginBottom: 28,
        textAlign: 'center',
        letterSpacing: 0.2
      }}>Политика конфиденциальности</h1>
      <p><b>1. Общие положения</b><br />
      Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей интернет-магазина «Посуда от и до» (далее — Магазин), расположенного по адресу станица Голубицкая, ул. Красная, дом 15.
      </p>
      <p><b>2. Какие данные мы собираем</b><br />
      Мы собираем только те персональные данные, которые вы добровольно предоставляете при оформлении заказа или при регистрации на сайте:<br />
      — ФИО<br />
      — Контактный телефон<br />
      — Адрес электронной почты (при необходимости)<br />
      — Адрес для связи (если требуется для передачи заказа)
      </p>
      <p><b>3. Как используются ваши данные</b><br />
      Ваши данные используются исключительно для:<br />
      — Связи с вами по вопросам заказа<br />
      — Оформления и передачи заказа<br />
      — Обратной связи по качеству обслуживания
      </p>
      <p><b>4. Передача данных третьим лицам</b><br />
      Мы не передаём ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ.
      </p>
      <p><b>5. Безопасность данных</b><br />
      Мы принимаем все необходимые меры для защиты ваших персональных данных от несанкционированного доступа и разглашения.
      </p>
      <p><b>6. Хранение и удаление данных</b><br />
      Ваши данные хранятся только в течение времени, необходимого для выполнения заказа и обратной связи. По вашему запросу мы можем удалить ваши данные.
      </p>
      <p><b>7. Контакты</b><br />
      По вопросам, связанным с обработкой персональных данных, вы можете связаться с нами:<br />
      <span style={{color:'#2222ff'}}>Email: posudaotido@gmail.com</span><br />
      <span style={{color:'#2222ff'}}>Телефон: +7 (909) 313-32-51</span>
      </p>
    </div>
  );
};

export default Privacy; 