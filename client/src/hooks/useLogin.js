import { useState } from 'react';
import { message } from 'antd';
import { useAuth } from '../contexts/AuthContext.jsx';

const useLogin = () => {
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const loginUser = async (values) => {
    try {
      setError(null);
      setLoading(true);

      console.log('Intentando login con:', {
        email: values.email,
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:9000'
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      console.log('Respuesta del servidor:', {
        status: res.status,
        statusText: res.statusText
      });

      const data = await res.json();
      console.log('Datos de respuesta:', data);

      if (res.status === 200) {
        message.success(data.message || 'Inicio de sesión exitoso');
        login(data.token, data.user);
        return;
      } else {
        const errMsg = data.message || 'El inicio de sesión falló';
        setError(errMsg);
        message.error(errMsg);
        throw new Error(errMsg);
      }
    } catch (error) {
      console.error('Error en login:', error);
      const errMsg = error.message || 'Error inesperado de conexión';
      setError(errMsg);
      message.error(errMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, loginUser };
};

export default useLogin;