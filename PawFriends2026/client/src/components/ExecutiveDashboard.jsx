import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  DatePicker,
  Select,
  Space,
  Typography,
  Divider,
  List,
  Tag,
  Avatar,
  Tooltip,
  Alert,
} from 'antd';
import {
  CalendarOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  HeartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ExecutiveDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().startOf('month'), moment().endOf('month')]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { token } = useAuth();

  // Obtener métricas del dashboard
  const fetchMetrics = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/metrics/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(amount || 0);
  };

  // Función para formatear números
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-GT').format(num || 0);
  };

  // Columnas para la tabla de citas próximas
  const upcomingAppointmentsColumns = [
    {
      title: 'Fecha y Hora',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.appointmentDate) - moment(b.appointmentDate),
    },
    {
      title: 'Mascota',
      dataIndex: 'petName',
      key: 'petName',
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Dueño: {record.clientName}
          </Text>
        </div>
      ),
    },
    {
      title: 'Veterinario',
      dataIndex: 'veterinarian',
      key: 'veterinarian',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          scheduled: { color: 'blue', text: 'Programada' },
          confirmed: { color: 'green', text: 'Confirmada' },
          in_progress: { color: 'orange', text: 'En Progreso' },
          completed: { color: 'purple', text: 'Completada' },
          cancelled: { color: 'red', text: 'Cancelada' },
        };

        const config = statusConfig[status] || { color: 'default', text: status };

        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Card loading={loading} style={{ height: 400 }} />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="No se pudieron cargar las métricas" type="error" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Dashboard Ejecutivo</Title>
        <Space>
          <Select value={selectedPeriod} onChange={setSelectedPeriod} style={{ width: 120 }}>
            <Option value="week">Esta Semana</Option>
            <Option value="month">Este Mes</Option>
            <Option value="year">Este Año</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
          />
        </Space>
      </div>

      {/* Métricas principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Citas del Día"
              value={metrics.overview.todayAppointments}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ingresos del Mes"
              value={metrics.overview.monthlyRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Productos con Stock Bajo"
              value={metrics.overview.lowStockProducts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Notificaciones No Leídas"
              value={metrics.overview.unreadNotifications}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráficos de progreso */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Estado de las Citas">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Programadas</Text>
                <Text>{metrics.breakdowns.appointmentsByStatus.find(s => s._id === 'scheduled')?.count || 0}</Text>
              </div>
              <Progress
                percent={metrics.overview.totalAppointments > 0 ?
                  ((metrics.breakdowns.appointmentsByStatus.find(s => s._id === 'scheduled')?.count || 0) / metrics.overview.totalAppointments) * 100 : 0
                }
                strokeColor="#1890ff"
                size="small"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Completadas</Text>
                <Text>{metrics.breakdowns.appointmentsByStatus.find(s => s._id === 'completed')?.count || 0}</Text>
              </div>
              <Progress
                percent={metrics.overview.totalAppointments > 0 ?
                  ((metrics.breakdowns.appointmentsByStatus.find(s => s._id === 'completed')?.count || 0) / metrics.overview.totalAppointments) * 100 : 0
                }
                strokeColor="#52c41a"
                size="small"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Canceladas</Text>
                <Text>{metrics.breakdowns.appointmentsByStatus.find(s => s._id === 'cancelled')?.count || 0}</Text>
              </div>
              <Progress
                percent={metrics.overview.totalAppointments > 0 ?
                  ((metrics.breakdowns.appointmentsByStatus.find(s => s._id === 'cancelled')?.count || 0) / metrics.overview.totalAppointments) * 100 : 0
                }
                strokeColor="#ff4d4f"
                size="small"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Tipos de Mascotas">
            {metrics.breakdowns.petsByType.map((type, index) => (
              <div key={type._id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>{type._id.charAt(0).toUpperCase() + type._id.slice(1)}</Text>
                  <Text>{type.count}</Text>
                </div>
                <Progress
                  percent={metrics.overview.totalPets > 0 ? (type.count / metrics.overview.totalPets) * 100 : 0}
                  size="small"
                  showInfo={false}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Citas próximas */}
      <Card title="Citas Próximas" style={{ marginBottom: 16 }}>
        {metrics.upcoming.appointments.length > 0 ? (
          <Table
            dataSource={metrics.upcoming.appointments}
            columns={upcomingAppointmentsColumns}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        ) : (
          <Alert message="No hay citas próximas" type="info" />
        )}
      </Card>

      {/* Alertas importantes */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Alertas de Salud">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message={`${metrics.upcoming.vaccinations} mascotas necesitan vacunación`}
                description="Hay mascotas con vacunas próximas a vencer en los próximos 30 días"
                type="warning"
                showIcon
              />

              <Alert
                message={`${metrics.overview.lowStockProducts} productos con stock bajo`}
                description="Algunos productos necesitan reabastecimiento"
                type="warning"
                showIcon
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Resumen Financiero">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Citas del Mes</Text>
                <Text strong>{metrics.overview.monthlyAppointments}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Ingresos del Mes</Text>
                <Text strong style={{ color: '#52c41a' }}>
                  {formatCurrency(metrics.overview.monthlyRevenue)}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Promedio por Cita</Text>
                <Text strong style={{ color: '#1890ff' }}>
                  {formatCurrency(metrics.overview.monthlyAppointments > 0 ?
                    metrics.overview.monthlyRevenue / metrics.overview.monthlyAppointments : 0
                  )}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Lista de citas del día */}
      <Card title="Citas de Hoy" style={{ marginTop: 16 }}>
        {metrics.overview.todayAppointments > 0 ? (
          <List
            dataSource={[]} // Aquí irían las citas del día
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<CalendarOutlined />} />}
                  title={`Cita con ${item.petName}`}
                  description={`${item.clientName} - ${moment(item.appointmentDate).format('HH:mm')}`}
                />
                <Tag color={item.status === 'confirmed' ? 'green' : 'blue'}>
                  {item.status}
                </Tag>
              </List.Item>
            )}
          />
        ) : (
          <Alert message="No hay citas programadas para hoy" type="info" />
        )}
      </Card>
    </div>
  );
};

export default ExecutiveDashboard;