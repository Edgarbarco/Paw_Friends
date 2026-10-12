import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Card,
  Statistic,
  Row,
  Col,
  Tag,
  Popconfirm,
  message,
  Typography,
  Divider,
  Tabs,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import BusinessNotificationCreator from '../components/BusinessNotificationCreator';
import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Función para obtener el color según el tipo de notificación
const getNotificationTypeColor = (type) => {
  const colors = {
    low_stock: 'red',
    new_product: 'blue',
    product_updated: 'orange',
    product_deleted: 'red',
    medical_reminder: 'green',
    appointment_reminder: 'green',
    system_alert: 'red',
    custom: 'purple',
  };
  return colors[type] || 'default';
};

// Función para obtener el ícono según el tipo de notificación
const getNotificationIcon = (type) => {
  const icons = {
    low_stock: <ExclamationCircleOutlined />,
    new_product: <InfoCircleOutlined />,
    product_updated: <EditOutlined />,
    product_deleted: <DeleteOutlined />,
    medical_reminder: <BellOutlined />,
    appointment_reminder: <CheckCircleOutlined />,
    system_alert: <WarningOutlined />,
    custom: <BellOutlined />,
  };
  return icons[type] || <BellOutlined />;
};

// Función para obtener el color según la prioridad
const getPriorityColor = (priority) => {
  const colors = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
  };
  return colors[priority] || 'blue';
};

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const { token, userData } = useAuth();

  // Verificar que el usuario sea administrador
  useEffect(() => {
    if (userData && userData.role !== 'admin') {
      message.error('No tienes permisos para acceder a esta página');
      return;
    }
    fetchNotifications();
    fetchStats();
  }, [userData]);

  const fetchNotifications = async (filters = {}) => {
    if (!token) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        limit: 50,
      }).toString();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        message.error('Error al obtener notificaciones');
      }
    } catch (error) {
      message.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }
  };

  const handleCreateNotification = () => {
    setEditingNotification(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditNotification = (record) => {
    setEditingNotification(record);
    form.setFieldsValue({
      ...record,
      expiresAt: record.expiresAt ? moment(record.expiresAt) : null,
    });
    setIsModalVisible(true);
  };

  const handleDeleteNotification = async (id) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        message.success('Notificación eliminada exitosamente');
        fetchNotifications();
        fetchStats();
      } else {
        message.error('Error al eliminar notificación');
      }
    } catch (error) {
      message.error('Error de conexión');
    }
  };

  const handleSubmit = async (values) => {
    if (!token) return;

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/notifications/custom`;
      const method = 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
        }),
      });

      if (response.ok) {
        message.success(
          editingNotification
            ? 'Notificación actualizada exitosamente'
            : 'Notificación creada exitosamente'
        );
        setIsModalVisible(false);
        form.resetFields();
        fetchNotifications();
        fetchStats();
      } else {
        message.error('Error al guardar notificación');
      }
    } catch (error) {
      message.error('Error de conexión');
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    const filters = {};
    switch (key) {
      case 'unread':
        filters.isRead = 'false';
        break;
      case 'read':
        filters.isRead = 'true';
        break;
      case 'urgent':
        filters.priority = 'urgent';
        break;
      default:
        break;
    }
    fetchNotifications(filters);
  };

  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={getNotificationTypeColor(type)} icon={getNotificationIcon(type)}>
          {type.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Mensaje',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Destinatario',
      dataIndex: ['recipient', 'name'],
      key: 'recipient',
      width: 150,
      render: (name, record) => name || record.recipient?.email || 'Usuario',
    },
    {
      title: 'Prioridad',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 100,
      render: (isRead) => (
        <Tag color={isRead ? 'green' : 'orange'}>
          {isRead ? 'Leída' : 'No leída'}
        </Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Estás seguro de eliminar esta notificación?"
              onConfirm={() => handleDeleteNotification(record._id)}
              okText="Sí"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (userData?.role !== 'admin') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Title level={4}>Acceso denegado</Title>
        <p>No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Gestión de Notificaciones</Title>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNotification}
          >
            Crear Notificación Personalizada
          </Button>
        </Space>
      </div>

      {/* Creador de Notificaciones de Negocio */}
      <BusinessNotificationCreator />

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Notificaciones"
              value={stats.total || 0}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="No Leídas"
              value={stats.unread || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Por Tipo"
              value={stats.byType?.length || 0}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Por Prioridad"
              value={stats.byPriority?.length || 0}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla de notificaciones */}
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Todas" key="all" />
          <TabPane
            tab={
              <Badge count={stats.unread || 0} size="small">
                No Leídas
              </Badge>
            }
            key="unread"
          />
          <TabPane tab="Leídas" key="read" />
          <TabPane tab="Urgentes" key="urgent" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={notifications}
          loading={loading}
          rowKey="_id"
          pagination={{
            total: notifications.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} notificaciones`,
          }}
        />
      </Card>

      {/* Modal para crear/editar notificaciones */}
      <Modal
        title={editingNotification ? 'Editar Notificación' : 'Crear Nueva Notificación'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: 'Por favor ingresa el título' }]}
          >
            <Input placeholder="Título de la notificación" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Mensaje"
            rules={[{ required: true, message: 'Por favor ingresa el mensaje' }]}
          >
            <TextArea
              rows={4}
              placeholder="Mensaje de la notificación"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Tipo"
            rules={[{ required: true, message: 'Por favor selecciona el tipo' }]}
          >
            <Select placeholder="Seleccionar tipo">
              <Option value="low_stock">Stock Bajo</Option>
              <Option value="new_product">Nuevo Producto</Option>
              <Option value="product_updated">Producto Actualizado</Option>
              <Option value="product_deleted">Producto Eliminado</Option>
              <Option value="medical_reminder">Recordatorio Médico</Option>
              <Option value="appointment_reminder">Recordatorio de Cita</Option>
              <Option value="system_alert">Alerta del Sistema</Option>
              <Option value="custom">Personalizada</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Prioridad"
            rules={[{ required: true, message: 'Por favor selecciona la prioridad' }]}
          >
            <Select placeholder="Seleccionar prioridad">
              <Option value="low">Baja</Option>
              <Option value="medium">Media</Option>
              <Option value="high">Alta</Option>
              <Option value="urgent">Urgente</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label="Fecha de Expiración (opcional)"
          >
            <DatePicker
              showTime
              placeholder="Seleccionar fecha de expiración"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingNotification ? 'Actualizar' : 'Crear'} Notificación
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationManagement;