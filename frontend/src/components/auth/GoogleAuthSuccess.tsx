import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import axios from 'axios';

export const GoogleAuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      navigate('/login?error=auth_failed');
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      navigate('/login?error=auth_failed');
      return;
    }

    axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/google/exchange`,
      { code },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    )
      .then(res => {
        const { user, token } = res.data;
        dispatch(loginSuccess({ user, token }));
        navigate('/');
      })
      .catch(error => {
        console.error('Google auth error:', error);
        navigate('/login?error=auth_failed');
      });
  }, [searchParams, navigate, dispatch]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h2>Выполняется вход...</h2>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}; 