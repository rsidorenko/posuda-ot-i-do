import React from 'react';

interface GoogleLoginButtonProps {
  onClick: () => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: '#fff',
        color: '#444',
        border: '1.5px solid #ccc',
        borderRadius: 6,
        padding: '10px 16px',
        width: '100%',
        marginTop: 16,
        cursor: 'pointer',
        fontSize: 16,
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(60,64,67,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        transition: 'box-shadow 0.18s, border 0.18s',
      }}
      onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(60,64,67,0.16)')}
      onMouseOut={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(60,64,67,0.08)')}
    >
      <span style={{display:'flex',alignItems:'center'}}>
        <svg width="22" height="22" viewBox="0 0 48 48" style={{marginRight:8}}>
          <g>
            <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.98 2.09 30.34 0 24 0 14.82 0 6.73 5.13 2.69 12.56l7.98 6.2C13.13 13.13 18.17 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.66 7.03l7.2 5.6C43.98 37.09 46.1 31.36 46.1 24.55z"/>
            <path fill="#FBBC05" d="M9.69 28.76c-1.13-3.36-1.13-6.99 0-10.35l-7.98-6.2C.98 16.09 0 19.91 0 24c0 4.09.98 7.91 2.71 11.79l7.98-6.2z"/>
            <path fill="#EA4335" d="M24 48c6.34 0 11.98-2.09 16.04-5.7l-7.2-5.6c-2.01 1.35-4.59 2.15-8.84 2.15-5.83 0-10.87-3.63-13.33-8.86l-7.98 6.2C6.73 42.87 14.82 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </g>
        </svg>
      </span>
      <span style={{fontWeight:600, fontSize:16, letterSpacing:0.1}}>Войти через Google</span>
    </button>
  );
}; 