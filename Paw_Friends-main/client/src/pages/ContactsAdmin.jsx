import React, { useEffect, useState, useCallback, useRef } from "react";
import { 
  Table, 
  Button, 
  Popconfirm, 
  message, 
  Typography, 
  Card, 
  Input,
  notification,
  Space,
  Tag,
  Badge,
  Tooltip
} from "antd";
import { 
  MailOutlined, 
  SearchOutlined, 
  DeleteOutlined,
  PhoneOutlined,
  UserOutlined,
  CheckCircleOutlined,
  BellOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  WhatsAppOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ContactsAdmin = () => {
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [lastContactCount, setLastContactCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(new Date());
  const [nextCheckIn, setNextCheckIn] = useState(60);
  const [api, contextHolder] = notification.useNotification();
  
  const notifiedContactsRef = useRef(new Set());

  const showAutoNotification = useCallback((contact) => {
    if (notifiedContactsRef.current.has(contact._id)) {
      return;
    }
    notifiedContactsRef.current.add(contact._id);

    // NOTIFICACIÓN CON BARRA DE PROGRESO
    api.success({
      message: '🎉 Nuevo Contacto Registrado',
      description: (
        <div>
          <Text strong>{contact.nombre} {contact.apellido}</Text>
          <br />
          <Text type="secondary">{contact.correo}</Text>
          <br />
          <Text type="secondary">{contact.numero}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Registrado: {new Date(contact.createdAt).toLocaleString('es-GT')}
          </Text>
        </div>
      ),
      placement: 'topRight',
      duration: 8,
      showProgress: true,        // <- BARRA DE PROGRESO
      pauseOnHover: true,         // <- PAUSA AL PASAR MOUSE
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      btn: (
        <Button type="primary" size="small" onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          api.destroy();
        }}>
          Ver Detalles
        </Button>
      ),
    });

    // Sonido de notificación
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzo7KdUEwlFnN/yvmshBTKG0vLSgjMGHW/A7+OZRwwPV6rn66hVFQlEnN/zvmwhBTKF0/PSgjMGHm+/7+OZRw0PVqvo66hVFApFnN/yvmwhBTKF0vPSgjMGHW6/7+OZRw0PVqzn66hVFApEnODz');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio no disponible'));
    } catch (e) {
      console.log('Sonido no disponible');
    }

    console.log('🔔 Notificación mostrada para:', contact.nombre, contact.apellido);
  }, [api]);

  const fetchContacts = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contacto`);
      const data = await res.json();
      
      if (data.success) {
        const newContacts = data.contacts;
        
        // DETECTAR NUEVOS CONTACTOS Y MOSTRAR NOTIFICACIÓN
        if (lastContactCount > 0 && newContacts.length > lastContactCount) {
          const difference = newContacts.length - lastContactCount;
          console.log(`🔔 ${difference} nuevo(s) contacto(s) detectado(s)`);
          
          const newContactsAdded = newContacts.slice(0, difference);
          
          // AQUÍ SE DISPARA LA NOTIFICACIÓN AUTOMÁTICAMENTE
          newContactsAdded.forEach(contact => {
            showAutoNotification(contact);
          });
        }
        
        setContacts(newContacts);
        setFiltered(newContacts);
        setLastContactCount(newContacts.length);
        setLastCheckTime(new Date());
        
        console.log('✅ Contactos actualizados:', newContacts.length);
      } else {
        message.error("Error al obtener contactos");
      }
    } catch (err) {
      console.error('❌ Error al obtener contactos:', err);
      message.error("Error de conexión");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [lastContactCount, showAutoNotification]);

  // POLLING CADA 60 SEGUNDOS (1 MINUTO)
  useEffect(() => {
    console.log('🚀 Iniciando sistema de polling cada 1 minuto');
    fetchContacts(true);

    const countdownInterval = setInterval(() => {
      setNextCheckIn(prev => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);

    const pollingInterval = setInterval(() => {
      console.log('🔍 [POLLING] Verificando nuevos contactos...');
      fetchContacts(false);
      setNextCheckIn(60);
    }, 60000);

    return () => {
      clearInterval(pollingInterval);
      clearInterval(countdownInterval);
      console.log('🛑 Sistema de polling detenido');
    };
  }, [fetchContacts]);

  useEffect(() => {
    const term = search.toLowerCase();
    const filteredData = Array.isArray(contacts)
      ? contacts.filter(c =>
          c.nombre?.toLowerCase().includes(term) ||
          c.apellido?.toLowerCase().includes(term) ||
          c.correo?.toLowerCase().includes(term)
        )
      : [];
    setFiltered(filteredData);
  }, [search, contacts]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contacto/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        message.success("Contacto eliminado exitosamente");
        notifiedContactsRef.current.delete(id);
        fetchContacts(false);
      } else {
        message.error("No se pudo eliminar");
      }
    } catch (err) {
      message.error("Error de conexión");
    }
  };

  const handleToggleStatus = async (record) => {
    const nuevoEstado = (!record.estado || record.estado === 'Pendiente') ? 'Atendido' : 'Pendiente';
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contacto/${record._id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.success) {
        message.success(`Marcado como ${nuevoEstado}`);
        fetchContacts(false);
      } else {
        message.error("No se pudo actualizar");
      }
    } catch (err) {
      message.error("Error de conexión");
    }
  };

  const handleManualRefresh = () => {
    message.info('Actualizando contactos...');
    fetchContacts(true);
    setNextCheckIn(60);
  };

  const handleWhatsApp = (record) => {
    let cleanNumber = record.numero.replace(/\D/g, '');
    if (cleanNumber.length === 8) {
      cleanNumber = `502${cleanNumber}`;
    }
    const mensaje = `Hola ${record.nombre}, somos de Veterinaria Paw Friends. Recibimos tu mensaje: "${record.descripcion}". ¿Cómo podemos ayudarte hoy?`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const columns = [
    {
      title: "Nombre Completo",
      key: "nombreCompleto",
      render: (_, record) => (
        <Space style={{ whiteSpace: 'nowrap' }}>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text strong>{record.nombre} {record.apellido}</Text>
        </Space>
      ),
    },
    {
      title: "Correo",
      dataIndex: "correo",
      key: "correo",
      responsive: ['md'],
      render: (correo) => (
        <Space style={{ whiteSpace: 'nowrap' }}>
          <MailOutlined style={{ color: '#8c8c8c' }} />
          <Text copyable>{correo}</Text>
        </Space>
      ),
    },
    {
      title: "Teléfono",
      dataIndex: "numero",
      key: "numero",
      width: 140,
      render: (numero) => (
        <Space style={{ whiteSpace: 'nowrap' }}>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          <Text>{numero}</Text>
        </Space>
      ),
    },
    {
      title: "Motivo del Contacto",
      dataIndex: "descripcion",
      key: "descripcion",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      responsive: ['lg'],
      render: (date) => {
        const formattedDate = new Date(date).toLocaleString('es-GT', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>{formattedDate}</Text>;
      },
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    },
    {
      title: "Estado",
      key: "estado",
      render: (_, record) => (
        <Tag color={(!record.estado || record.estado === 'Pendiente') ? "orange" : "green"}>
          {(!record.estado || record.estado === 'Pendiente') ? "Pendiente" : "Atendido"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            style={{ backgroundColor: '#25D366', borderColor: '#25D366', fontWeight: 'bold' }}
            size="small"
            icon={<WhatsAppOutlined />}
            onClick={() => handleWhatsApp(record)}
          >
            Contactar
          </Button>
          <Tooltip title={(!record.estado || record.estado === 'Pendiente') ? "Marcar como Atendido" : "Marcar como Pendiente"}>
            <Button 
              type="default" 
              icon={<CheckCircleOutlined style={{ color: (!record.estado || record.estado === 'Pendiente') ? '#1890ff' : '#8c8c8c' }} />} 
              size="small"
              style={{ borderColor: (!record.estado || record.estado === 'Pendiente') ? '#1890ff' : '#d9d9d9' }}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar este mensaje?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const todayContacts = contacts.filter(c => {
    const today = new Date().toDateString();
    const contactDate = new Date(c.createdAt).toDateString();
    return today === contactDate;
  });

  return (
    <>
      {contextHolder}
      
      <div style={{ padding: '24px' }}>
        <Card
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16
          }}>
            <Title level={2} style={{ margin: 0 }}>
              Directorio de Clientes / Leads
            </Title>
            
            <Space>
              <Tooltip title="Última actualización">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Sincronizado: {lastCheckTime.toLocaleTimeString('es-GT')}
                </Text>
              </Tooltip>
            </Space>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24 
          }}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Text type="secondary">Total Contactos</Text>
              <Title level={3} style={{ margin: '8px 0' }}>{contacts.length}</Title>
            </Card>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Text type="secondary">Mensajes Pendientes</Text>
              <Title level={3} style={{ margin: '8px 0', color: '#faad14' }}>
                {contacts.filter(c => !c.estado || c.estado === 'Pendiente').length}
              </Title>
            </Card>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Text type="secondary">Nuevos Hoy</Text>
              <Title level={3} style={{ margin: '8px 0', color: '#52c41a' }}>
                {todayContacts.length}
              </Title>
            </Card>
          </div>

          <Input
            prefix={<SearchOutlined />}
            placeholder="Buscar por nombre, apellido o correo..."
            style={{ marginBottom: 24, maxWidth: 400 }}
            size="large"
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
          />

          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{ 
              pageSize: 6, 
              showSizeChanger: false
            }}
            bordered
            scroll={{ x: true }}
          />
        </Card>
      </div>


    </>
  );
};

export default ContactsAdmin;