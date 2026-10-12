import React from 'react';
import { Card, Typography, Row, Col, Statistic, Space, Divider } from 'antd';
import { 
  AppstoreOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  MedicineBoxOutlined 
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '10px' }}>
      <Title level={2} style={{ color: '#2c3e50', marginBottom: '8px' }}>
        👋 ¡Hola, {userData?.name?.split(' ')[0] || 'Veterinario'}!
      </Title>
      <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '30px' }}>
        Bienvenido al panel principal de PawFriends. Aquí tienes un resumen de la clínica.
      </Text>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/dashboard/agenda')}
            style={{ borderRadius: 12, borderLeft: '6px solid #1890ff', cursor: 'pointer' }}
          >
            <Statistic 
              title="Citas de Hoy" 
              value={4} 
              prefix={<CalendarOutlined style={{ color: '#1890ff', marginRight: '10px' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/dashboard/inventory')}
            style={{ borderRadius: 12, borderLeft: '6px solid #52c41a', cursor: 'pointer' }}
          >
            <Statistic 
              title="Productos en Stock" 
              value={142} 
              prefix={<AppstoreOutlined style={{ color: '#52c41a', marginRight: '10px' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            style={{ borderRadius: 12, borderLeft: '6px solid #faad14', cursor: 'pointer' }}
          >
            <Statistic 
              title="Mascotas Atendidas" 
              value={32} 
              prefix={<MedicineBoxOutlined style={{ color: '#faad14', marginRight: '10px' }} />} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/dashboard/users')}
            style={{ borderRadius: 12, borderLeft: '6px solid #722ed1', cursor: 'pointer' }}
          >
            <Statistic 
              title="Usuarios Activos" 
              value={12} 
              prefix={<UserOutlined style={{ color: '#722ed1', marginRight: '10px' }} />} 
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card style={{ borderRadius: 16, marginTop: '20px', backgroundColor: '#f9f9f9', border: 'none' }}>
        <Space align="center" size="large">
          <div style={{ fontSize: '50px' }}>🐕</div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Acceso Rápido</Title>
            <Text type="secondary">Selecciona cualquier opción en el menú lateral para gestionar la veterinaria.</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default DashboardPage;