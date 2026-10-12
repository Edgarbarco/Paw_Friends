import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  // Función para obtener notificaciones
  const fetchNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams(params).toString();
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
        console.error('Error al obtener notificaciones:', response.statusText);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  // Función para obtener conteo de notificaciones no leídas
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/unread-count`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error al obtener conteo de notificaciones:', error);
    }
  }, [token, isAuthenticated]);

  // Función para marcar notificación como leída
  const markAsRead = async (notificationId) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        // Actualizar el estado local
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  // Función para marcar todas como leídas
  const markAllAsRead = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  };

  // Función para eliminar notificación
  const deleteNotification = async (notificationId) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const wasUnread = notifications.find(n => n._id === notificationId)?.isRead === false;
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  // Función para agregar nueva notificación (para notificaciones en tiempo real)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Función para conectar con Server-Sent Events
  const eventSourceRef = React.useRef(null);
  const [sseRetryCount, setSseRetryCount] = useState(0);
  const MAX_SSE_RETRIES = 5;

  const connectSSE = useCallback(() => {
    if (!isAuthenticated || !token || sseConnected) return;

    // Limitar intentos de reconexión
    if (sseRetryCount >= MAX_SSE_RETRIES) {
      console.error('SSE: Se alcanzó el número máximo de intentos de reconexión.');
      return;
    }

    // Cerrar instancia anterior si existe
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const es = new EventSource(
        `${import.meta.env.VITE_API_URL}/api/notifications/events?token=${token}`
      );

      es.onopen = () => {
        console.log('Conectado al servidor de notificaciones SSE');
        setSseConnected(true);
        setSseRetryCount(0);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'connection') {
            console.log('SSE:', data.message);
          } else if (data.type === 'new_notification' && data.notification) {
            // Solo agregar si la notificación es para el usuario actual
            if (data.notification.recipient === JSON.parse(localStorage.getItem('userData'))?.user?.id) {
              addNotification(data.notification);
            }
          }
        } catch (error) {
          console.error('Error procesando mensaje SSE:', error);
        }
      };

      es.onerror = (error) => {
        console.error('Error en conexión SSE:', error);
        setSseConnected(false);

        // Cerrar la conexión antes de reconectar
        es.close();
        eventSourceRef.current = null;

        // Si el error es 401, no reconectar
        if (error?.target?.readyState === EventSource.CLOSED) {
          // No reconectar si la conexión fue cerrada
          return;
        }

        // Intentar reconectar solo si no se alcanzó el máximo
        setSseRetryCount(prev => prev + 1);
        if (sseRetryCount + 1 < MAX_SSE_RETRIES) {
          setTimeout(() => {
            console.log('Intentando reconectar SSE...');
            connectSSE();
          }, 5000);
        } else {
          console.error('SSE: Reconexión detenida por demasiados errores.');
        }
      };

      eventSourceRef.current = es;
      return es;
    } catch (error) {
      console.error('Error estableciendo conexión SSE:', error);
    }
  }, [isAuthenticated, token, sseConnected, sseRetryCount]);
  // Conectar SSE cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && token) {
      connectSSE();
    }

    // Limpiar conexión cuando el componente se desmonte o el usuario se desconecte
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        setSseConnected(false);
        eventSourceRef.current = null;
      }
    };
  }, [isAuthenticated, token]);

  // Cargar datos iniciales cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotifications();
      fetchUnreadCount();

      // Configurar polling cada 30 segundos para nuevas notificaciones
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, token, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    sseConnected,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    connectSSE,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};