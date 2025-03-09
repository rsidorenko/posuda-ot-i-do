import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/TermsOfService.module.scss';

const Terms: React.FC = () => {
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
      }}>Пользовательское соглашение</h1>
      <p><b>1. Общие положения</b><br />
      Настоящее Пользовательское соглашение регулирует отношения между интернет-магазином «Посуда от и до» и пользователем сайта.
      </p>
      <p><b>2. Оформление заказа</b><br />
      Пользователь может оформить заказ на сайте, указав свои контактные данные. Пользователь может отслеживать статус своего заказа в разделе 'Заказы'.
      </p>
      <p><b>3. Оплата</b><br />
      Оплата товаров осуществляется только при получении заказа. Онлайн-оплата и доставка не предоставляются.
      </p>
      <p><b>4. Передача товара</b><br />
      Передача товара осуществляется по согласованию с сотрудником магазина в пункте самовывоза или иным удобным способом, согласованным с покупателем.
      </p>
      <p><b>5. Возврат и обмен</b><br />
      Возврат и обмен товаров осуществляется в соответствии с законодательством РФ. Для возврата или обмена обратитесь к нам по контактам:<br />
      <span style={{color:'#2222ff'}}>Email: posudaotido@gmail.com</span><br />
      <span style={{color:'#2222ff'}}>Телефон: +7 (909) 313-32-51</span>
      </p>
      <p><b>6. Ответственность</b><br />
      Магазин не несёт ответственности за некорректно указанные пользователем данные, а также за действия третьих лиц.
      </p>
      <p><b>7. Изменения в соглашении</b><br />
      Магазин оставляет за собой право изменять настоящее соглашение без предварительного уведомления. Актуальная версия всегда доступна на сайте.
      </p>
    </div>
  );
};

export default Terms; 