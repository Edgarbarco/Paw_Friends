import React, { useState } from 'react';
import { Badge, Dropdown, List, Button, Typography, Empty, Spin, Divider, Tabs } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const { Text } = Typography;
const { TabPane } = Tabs;

// Función para obtener el ícono según el tipo de notificación
const getNotificationIcon = (type) => {
  const iconProps = { style: { fontSize: 16 } };

  switch (type) {
    case 'low_stock':
      return <ExclamationCircleOutlined style={{ ...iconProps.style, color: '#ff4d4f' }} />;
    case 'new_product':
      return <InfoCircleOutlined style={{ ...iconProps.style, color: '#1890ff' }} />;
    case 'product_updated':
      return <WarningOutlined style={{ ...iconProps.style, color: '#faad14' }} />;
    case 'product_deleted':
      return <DeleteOutlined style={{ ...iconProps.style, color: '#ff4d4f' }} />;
    case 'medical_reminder':
      return <ExclamationCircleOutlined style={{ ...iconProps.style, color: '#52c41a' }} />;
    case 'appointment_reminder':
      return <CheckCircleOutlined style={{ ...iconProps.style, color: '#52c41a' }} />;
    case 'system_alert':
      return <WarningOutlined style={{ ...iconProps.style, color: '#ff4d4f' }} />;
    default:
      return <BellOutlined style={{ ...iconProps.style, color: '#1890ff' }} />;
  }
};

// Función para obtener el color de prioridad
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent': return '#ff4d4f';
    case 'high': return '#faad14';
    case 'medium': return '#1890ff';
    case 'low': return '#52c41a';
    default: return '#1890ff';
  }
};

// Función para formatear fecha relativa
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Ahora mismo';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Hace ${diffInDays}d`;

  return date.toLocaleDateString();
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const { isAuthenticated } = useAuth();

  // Si el usuario no está autenticado, no mostrar nada
  if (!isAuthenticated) {
    return null;
  }

  // Separar notificaciones leídas y no leídas
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  const handleDeleteNotification = (notificationId, e) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const dropdownContent = (
    <div style={{ width: 400, maxHeight: 500 }}>
      <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Notificaciones</Text>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              onClick={markAllAsRead}
              icon={<CheckOutlined />}
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </div>

      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Spin size="small" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No tienes notificaciones"
            style={{ padding: 24 }}
          />
        ) : (
          <Tabs defaultActiveKey="unread" size="small">
            <TabPane
              tab={`No leídas ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
              key="unread"
            >
              {unreadNotifications.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No hay notificaciones no leídas"
                  style={{ padding: 16 }}
                />
              ) : (
                <List
                  dataSource={unreadNotifications}
                  renderItem={item => (
                    <NotificationItem
                      item={item}
                      onClick={() => handleNotificationClick(item)}
                      onDelete={(e) => handleDeleteNotification(item._id, e)}
                    />
                  )}
                  size="small"
                />
              )}
            </TabPane>

            {readNotifications.length > 0 && (
              <TabPane tab={`Leídas (${readNotifications.length})`} key="read">
                <List
                  dataSource={readNotifications.slice(0, 10)} // Limitar a 10 recientes
                  renderItem={item => (
                    <NotificationItem
                      item={item}
                      onClick={() => handleNotificationClick(item)}
                      onDelete={(e) => handleDeleteNotification(item._id, e)}
                    />
                  )}
                  size="small"
                />
              </TabPane>
            )}
          </Tabs>
        )}
      </div>

      {notifications.length > 0 && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ padding: '8px 16px', textAlign: 'center' }}>
            <Button type="link" size="small">
              Ver todas las notificaciones
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
    >
      <Badge count={unreadCount} overflowCount={99} size="small">
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{
            border: 'none',
            boxShadow: 'none',
            fontSize: 16,
            color: open ? '#1890ff' : undefined,
          }}
        />
      </Badge>
    </Dropdown>
  );
};

// Componente para renderizar cada item de notificación
const NotificationItem = ({ item, onClick, onDelete }) => {
  return (
    <List.Item
      style={{
        padding: '12px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: item.isRead ? '#fafafa' : '#fff',
        opacity: item.isRead ? 0.8 : 1,
      }}
      onClick={onClick}
      actions={[
        <Button
          key="delete"
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={onDelete}
        />
      ]}
    >
      <List.Item.Meta
        avatar={getNotificationIcon(item.type)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong ellipsis style={{ maxWidth: 200 }}>
              {item.title}
            </Text>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: getPriorityColor(item.priority),
                flexShrink: 0,
              }}
            />
          </div>
        }
        description={
          <div>
            <Text ellipsis={{ tooltip: item.message }} style={{ fontSize: 12 }}>
              {item.message}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {formatRelativeTime(item.createdAt)}
            </Text>
          </div>
        }
      />
    </List.Item>
  );
};

export default NotificationBell;