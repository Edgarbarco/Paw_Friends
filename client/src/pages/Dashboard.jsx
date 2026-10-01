import React, { useEffect, useState } from 'react';
import { message, Avatar, Typography, Button, Space, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, CrownOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAVBAR_HEIGHT = 60;
const SIDEBAR_WIDTH = 215;

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const { userData: authUserData, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedData = JSON.parse(localStorage.getItem('userData'));
        const token = storedData?.userToken;
        const user = storedData?.user;
        
        if (!token) {
          throw new Error('No hay token');
        }

        if (user) {
          setUserData(user);
          return;
        }

        const config = { 
          headers: { Authorization: `Bearer ${token}` } 
        };
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/profile`, config);

        if (response.data) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        
        if (authUserData) {
          setUserData(authUserData);
        }
      }
    };

    fetchUserData();
  }, [authUserData]);

  const handleLogout = () => {
    logout();
    message.success('Sesión cerrada exitosamente');
    navigate('/login');
  };

  // Obtener el rol del usuario
  const userRole = userData?.role || 'user';
  const isAdmin = userRole === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navbar Full Width */}
      <div
        style={{
          height: NAVBAR_HEIGHT,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 10%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo y nombre de la app - IZQUIERDA */}
        <Space align="center" size="large">
          <img
            src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
            alt="PawFriends"
            style={{ 
              width: 45, 
              height: 45,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}
          />
          <Typography.Title 
            level={4} 
            style={{ 
              margin: 0, 
              color: '#fff', 
              fontWeight: 400,
              letterSpacing: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Paw Friends
          </Typography.Title>
        </Space>

        {/* Perfil y botón cerrar sesión - DERECHA */}
        <Space
          size="middle"
          style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '8px 25px',
            borderRadius: 30,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Avatar
            size={40}
            icon={<UserOutlined />}
            src={userData?.avatar}
            style={{ 
              backgroundColor: isAdmin ? '#faad14' : 'blue',
              border: '2px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography.Text 
              strong 
              style={{ 
                fontSize: 15,
                color: '#333',
                lineHeight: 1.0,
              }}
            >
              Hola, {userData?.name || 'Usuario'}
            </Typography.Text>
            
            <Tag 
              icon={isAdmin ? <CrownOutlined /> : <UserAddOutlined />}
              color={isAdmin ? 'gold' : 'blue'}
              style={{ 
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                width: 'fit-content',
              }}
            >
              {isAdmin ? 'ADMIN' : 'USER'}
            </Tag>
          </div>

          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              borderRadius: 50,
              fontWeight: 500,
            }}
          >
            Cerrar Sesión
          </Button>
        </Space>
      </div>

      {/* Contenedor inferior (Sidebar + Contenido) */}
      <div style={{ display: 'flex', flex: 1, marginTop: NAVBAR_HEIGHT }}>
        <Sidebar width={SIDEBAR_WIDTH} />
        <div 
          style={{ 
            marginLeft: SIDEBAR_WIDTH, 
            flex: 1, 
            padding: 40,  
            background: '#f0f2f5', 
            minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;