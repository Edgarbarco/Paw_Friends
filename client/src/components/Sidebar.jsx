import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Button, Divider, Badge } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  HistoryOutlined,
  CalendarOutlined,
  PhoneOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const SIDEBAR_WIDTH = 215;
const NAVBAR_HEIGHT = 64;

const Sidebar = () => {
  const { logout, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = React.useState(0);

  // Poll para obtener los mensajes pendientes de todos
  React.useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contacto`);
        const data = await res.json();
        if (data.success) {
          const pendientes = data.contacts.filter(c => !c.estado || c.estado === 'Pendiente').length;
          setPendingCount(pendientes);
        }
      } catch (err) {
        console.error("Error fetching pending contacts:", err);
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determinar qué item está seleccionado basado en la ruta actual
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/inventory')) return '2';
    if (path.includes('/users')) return '3';
    if (path.includes('/history')) return '4';
    if (path.includes('/agenda')) return '5';
    if (path.includes('/contacts')) return '6';
    return '1'; // Dashboard
  };

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: <Link to="/dashboard">Inicio</Link>,
    },
    {
      key: '2',
      icon: <AppstoreOutlined />,
      label: <Link to="/dashboard/inventory">Inventario</Link>,
    },
    // Solo mostrar "Administrar Usuarios" a los Administradores
    ...(userData?.role === 'admin' ? [{
      key: '3',
      icon: <UserOutlined />,
      label: <Link to="/dashboard/users">Administrar Personal</Link>,
    }] : []),
    {
      key: '4',
      icon: <HistoryOutlined />,
      label: <Link to="/dashboard/history">Historial de Citas</Link>,
    },
    {
      key: '5',
      icon: <CalendarOutlined />,
      label: <Link to="/dashboard/agenda">Agenda</Link>,
    },
    {
      key: '6',
      icon: <PhoneOutlined />,
      label: (
        <Link to="/dashboard/contacts">
          Mensajes <Badge count={pendingCount} size="small" offset={[10, 0]} />
        </Link>
      ),
    },
  ];

  return (
    <div style={{
      width: SIDEBAR_WIDTH,
      height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      background: '#ffffff',
      position: 'fixed',
      left: 0,
      top: NAVBAR_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRight: '1px solid #f0f0f0',
      overflowY: 'auto', // Permitir scroll si es necesario
      zIndex: 100
    }}>
      <div style={{ flex: 1 }}>
        <Menu
          mode="vertical"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ 
            height: '100%', 
            borderRight: 0,
            padding: '8px 0'
          }}
          // IMPORTANTE: Estos estilos aseguran que el texto no se corte
          itemStyle={{
            padding: '12px 16px',
            margin: '4px 8px',
            borderRadius: '8px',
            height: 'auto',
            lineHeight: '1.5',
            whiteSpace: 'normal', // Permitir que el texto haga wrap si es muy largo
            wordBreak: 'break-word'
          }}
        />
      </div>
      
    </div>
  );
};

export default Sidebar;