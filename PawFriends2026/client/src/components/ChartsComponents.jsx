import React from 'react';
import { Card, Progress, Row, Col, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Componente para mostrar métricas con indicadores visuales
export const MetricsCard = ({ title, value, previousValue, format = 'number', icon, color = '#1890ff' }) => {
  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-GT', {
          style: 'currency',
          currency: 'GTQ',
        }).format(val || 0);
      case 'percentage':
        return `${val || 0}%`;
      default:
        return new Intl.NumberFormat('es-GT').format(val || 0);
    }
  };

  const getTrend = () => {
    if (!previousValue || previousValue === 0) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
    };
  };

  const trend = getTrend();

  return (
    <Card style={{ textAlign: 'center' }}>
      <div style={{ color, fontSize: 24, marginBottom: 8 }}>
        {icon}
      </div>
      <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
        {formatValue(value)}
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {title}
      </Text>
      {trend && (
        <div style={{
          marginTop: 8,
          fontSize: 11,
          color: trend.isPositive ? '#52c41a' : '#ff4d4f'
        }}>
          {trend.isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {trend.value}% vs período anterior
        </div>
      )}
    </Card>
  );
};

// Componente para mostrar progreso circular
export const ProgressCircle = ({ title, value, max = 100, color = '#1890ff' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <Card style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Progress
          type="circle"
          percent={Math.min(percentage, 100)}
          strokeColor={color}
          size={80}
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>
            {value}
          </div>
          <div style={{ fontSize: 10, color: '#666' }}>
            de {max}
          </div>
        </div>
      </div>
      <Text style={{ fontSize: 12 }}>{title}</Text>
    </Card>
  );
};

// Componente para mostrar barras de progreso horizontales
export const ProgressBar = ({ title, value, max = 100, color = '#1890ff' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <Card size="small" style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 12 }}>{title}</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
          {value} / {max}
        </Text>
      </div>
      <Progress
        percent={Math.min(percentage, 100)}
        strokeColor={color}
        size="small"
        showInfo={false}
      />
    </Card>
  );
};

// Componente para mostrar estadísticas en grid
export const StatsGrid = ({ data, loading }) => {
  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[...Array(4)].map((_, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <Card loading style={{ height: 120 }} />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {data.map((stat, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card>
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={stat.icon}
              valueStyle={{ color: stat.color }}
              suffix={stat.suffix}
            />
            {stat.trend && (
              <Text
                style={{
                  fontSize: 12,
                  color: stat.trend > 0 ? '#52c41a' : '#ff4d4f'
                }}
              >
                {stat.trend > 0 ? '↗' : '↘'} {Math.abs(stat.trend)}% vs mes anterior
              </Text>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// Componente para mostrar alertas importantes
export const AlertsPanel = ({ alerts }) => {
  return (
    <Card title="Alertas Importantes" style={{ marginTop: 16 }}>
      {alerts.map((alert, index) => (
        <div
          key={index}
          style={{
            padding: '12px',
            marginBottom: '8px',
            borderLeft: `4px solid ${alert.color}`,
            backgroundColor: `${alert.color}10`,
            borderRadius: '4px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {alert.title}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {alert.description}
          </div>
        </div>
      ))}
    </Card>
  );
};

// Datos de ejemplo para demostración
export const sampleMetricsData = [
  {
    title: 'Citas del Día',
    value: 8,
    icon: '📅',
    color: '#1890ff',
    trend: 12.5,
  },
  {
    title: 'Ingresos del Mes',
    value: 2500,
    icon: '💰',
    color: '#52c41a',
    format: 'currency',
    trend: 8.3,
  },
  {
    title: 'Productos con Stock Bajo',
    value: 3,
    icon: '⚠️',
    color: '#faad14',
    trend: -15.2,
  },
  {
    title: 'Mascotas Atendidas',
    value: 24,
    icon: '🐾',
    color: '#722ed1',
    trend: 5.7,
  },
];

export const sampleAlertsData = [
  {
    title: '5 mascotas necesitan vacunación',
    description: 'Hay mascotas con vacunas próximas a vencer en los próximos 15 días',
    color: '#faad14',
  },
  {
    title: '3 productos con stock bajo',
    description: 'Algunos productos necesitan reabastecimiento urgente',
    color: '#ff4d4f',
  },
  {
    title: '2 citas para mañana',
    description: 'No olvides confirmar las citas programadas para mañana',
    color: '#1890ff',
  },
];