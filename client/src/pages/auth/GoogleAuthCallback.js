import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');

      if (token) {
        await loginWithToken(token);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    };

    handleAuth();
  }, [location, navigate, loginWithToken]);

  return <div>Loading...</div>;
};

export default GoogleAuthCallback;